import mqtt, { type MqttClient } from 'mqtt'
import { ApiError } from '@/shared/api/http'
import { requestMqttTicket } from './ticket-api'
import type {
  MqttConnectTicket, MqttConnectionState, MqttIncomingMessage,
  MqttMessageHandler, MqttQos, MqttStateHandler, MqttStateSnapshot,
} from './types'

type TicketProvider = () => Promise<MqttConnectTicket>
interface Subscription { qos: MqttQos; handlers: Set<MqttMessageHandler> }

export class MqttGatewayClient {
  private client: MqttClient | null = null
  private subscriptions = new Map<string, Subscription>()
  private stateHandlers = new Set<MqttStateHandler>()
  private state: MqttConnectionState = 'idle'
  private reconnectAttempt = 0
  private lastError: string | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private ticketTimer: ReturnType<typeof setTimeout> | null = null
  private connectTimer: ReturnType<typeof setTimeout> | null = null
  private connectPromise: Promise<void> | null = null
  private manuallyClosed = true

  constructor(private readonly ticketProvider: TicketProvider = requestMqttTicket) {}

  get snapshot(): MqttStateSnapshot {
    return { state: this.state, reconnectAttempt: this.reconnectAttempt, lastError: this.lastError }
  }

  onStateChange(handler: MqttStateHandler): () => void {
    this.stateHandlers.add(handler)
    handler(this.snapshot)
    return () => this.stateHandlers.delete(handler)
  }

  private setState(state: MqttConnectionState, error: string | null = null) {
    this.state = state
    this.lastError = error
    const snapshot = this.snapshot
    for (const handler of this.stateHandlers) {
      try { handler(snapshot) } catch { /* Observers must not break the transport. */ }
    }
  }

  async connect(): Promise<void> {
    this.manuallyClosed = false
    this.clearTimer('reconnect')
    if (this.client?.connected) return
    if (this.connectPromise) return this.connectPromise
    this.connectPromise = this.openConnection().finally(() => { this.connectPromise = null })
    return this.connectPromise
  }

  private async openConnection(): Promise<void> {
    this.setState('connecting')
    let ticket: MqttConnectTicket
    try {
      ticket = await this.ticketProvider()
      this.validateTicket(ticket)
    } catch (error) {
      const message = error instanceof Error ? error.message : '无法获取 MQTT 连接凭证'
      this.setState('error', message)
      if (!(error instanceof ApiError && [401, 403].includes(error.status))) this.scheduleReconnect()
      throw error
    }

    await new Promise<void>((resolve, reject) => {
      let settled = false
      const client = mqtt.connect(ticket.url, {
        clientId: ticket.clientId,
        username: ticket.username,
        password: ticket.password,
        clean: true,
        keepalive: 30,
        connectTimeout: 12_000,
        reconnectPeriod: 0,
        reconnectOnConnackError: false,
        resubscribe: false,
        protocolVersion: 5,
      })
      this.client = client

      const settle = (error?: Error) => {
        if (settled) return
        settled = true
        this.clearTimer('connect')
        if (error) reject(error)
        else resolve()
      }

      this.connectTimer = setTimeout(() => {
        client.end(true)
        settle(new Error('MQTT 连接超时'))
      }, 14_000)

      client.on('connect', () => {
        if (this.manuallyClosed) { client.end(true); settle(new Error('MQTT 连接已取消')); return }
        this.reconnectAttempt = 0
        this.setState('connected')
        this.subscribeAll(client)
        this.scheduleTicketRenewal(ticket.expiresAt, client)
        settle()
      })

      client.on('message', (topic, payload, packet) => {
        this.dispatchMessage(topic, payload, packet.qos as MqttQos, packet.retain)
      })

      client.on('error', error => {
        this.setState('error', 'MQTT 连接发生错误，请检查网关和凭证')
        settle(error)
      })

      client.on('close', () => {
        if (this.client === client) this.client = null
        this.clearTimer('ticket')
        if (!settled) settle(new Error('MQTT 连接在握手完成前关闭'))
        if (!this.manuallyClosed) {
          this.setState('reconnecting', 'MQTT 连接已断开')
          this.scheduleReconnect()
        } else {
          this.setState('disconnected')
        }
      })

      client.on('offline', () => {
        if (!this.manuallyClosed) this.setState('reconnecting', 'MQTT 网络暂时不可用')
      })
    })
  }

  private validateTicket(ticket: MqttConnectTicket) {
    if (!ticket || typeof ticket.url !== 'string') throw new Error('MQTT 凭证格式无效')
    const url = new URL(ticket.url)
    if (url.protocol !== 'wss:' || url.username || url.password || url.search || url.hash) {
      throw new Error('MQTT 网关必须使用不含 URL 凭证的安全 WSS 地址')
    }
    if (![ticket.clientId, ticket.username, ticket.password].every(value => typeof value === 'string' && value.length > 0)) {
      throw new Error('MQTT 短时凭证字段不完整')
    }
    const expiresAt = Date.parse(ticket.expiresAt)
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now() + 5_000) {
      throw new Error('MQTT 短时凭证已过期或即将过期')
    }
  }

  private dispatchMessage(topic: string, bytes: Uint8Array, qos: MqttQos, retain: boolean) {
    let payload: unknown
    const raw = new TextDecoder().decode(bytes)
    try { payload = JSON.parse(raw) as unknown } catch { payload = raw }
    const event: MqttIncomingMessage = { topic, payload, receivedAt: Date.now(), qos, retain }
    for (const [filter, subscription] of this.subscriptions) {
      if (!topicMatches(filter, topic)) continue
      for (const handler of subscription.handlers) {
        try { handler(event) } catch { /* A feature callback must not interrupt MQTT dispatch. */ }
      }
    }
  }

  subscribe(topic: string, handler: MqttMessageHandler, qos: MqttQos = 0): () => void {
    validateTopic(topic, true)
    let subscription = this.subscriptions.get(topic)
    if (!subscription) {
      subscription = { qos, handlers: new Set() }
      this.subscriptions.set(topic, subscription)
    } else if (qos > subscription.qos) {
      subscription.qos = qos
    }
    subscription.handlers.add(handler)
    if (this.client?.connected) this.subscribeTopic(this.client, topic, subscription.qos)

    let active = true
    return () => {
      if (!active) return
      active = false
      const current = this.subscriptions.get(topic)
      if (!current) return
      current.handlers.delete(handler)
      if (current.handlers.size > 0) return
      this.subscriptions.delete(topic)
      if (this.client?.connected) this.client.unsubscribe(topic)
    }
  }

  publish(topic: string, payload: unknown, qos: MqttQos = 0): Promise<void> {
    validateTopic(topic, false)
    if (!this.client?.connected || this.state !== 'connected') return Promise.reject(new Error('MQTT 尚未连接'))
    const encoded = typeof payload === 'string' ? payload : JSON.stringify(payload)
    if (encoded === undefined) return Promise.reject(new Error('MQTT payload 无法序列化'))
    return new Promise((resolve, reject) => {
      this.client?.publish(topic, encoded, { qos, retain: false }, error => error ? reject(error) : resolve())
    })
  }

  async disconnect(): Promise<void> {
    this.manuallyClosed = true
    this.clearTimer('reconnect')
    this.clearTimer('ticket')
    this.clearTimer('connect')
    const client = this.client
    this.client = null
    if (client) client.end(true)
    this.setState('disconnected')
  }

  private subscribeAll(client: MqttClient) {
    for (const [topic, subscription] of this.subscriptions) this.subscribeTopic(client, topic, subscription.qos)
  }

  private subscribeTopic(client: MqttClient, topic: string, qos: MqttQos) {
    client.subscribe(topic, { qos }, error => {
      if (error) this.setState('error', `订阅失败：${topic}`)
    })
  }

  private scheduleReconnect() {
    if (this.manuallyClosed || this.reconnectTimer) return
    const base = Math.min(30_000, 1_000 * (2 ** Math.min(this.reconnectAttempt, 5)))
    const delay = Math.round(base * (0.8 + Math.random() * 0.4))
    this.reconnectAttempt += 1
    this.setState('reconnecting')
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      void this.connect().catch(() => { /* openConnection owns retry policy */ })
    }, delay)
  }

  private scheduleTicketRenewal(expiresAt: string, client: MqttClient) {
    const remaining = Date.parse(expiresAt) - Date.now()
    const renewIn = Math.max(1_000, remaining - 15_000)
    this.ticketTimer = setTimeout(() => {
      if (this.client !== client || this.manuallyClosed) return
      client.end(true) // close event obtains a fresh, narrower ticket before reconnecting
    }, renewIn)
  }

  private clearTimer(which: 'reconnect' | 'ticket' | 'connect') {
    const timer = which === 'reconnect' ? this.reconnectTimer : which === 'ticket' ? this.ticketTimer : this.connectTimer
    if (timer) clearTimeout(timer)
    if (which === 'reconnect') this.reconnectTimer = null
    if (which === 'ticket') this.ticketTimer = null
    if (which === 'connect') this.connectTimer = null
  }
}

function validateTopic(topic: string, allowWildcards: boolean) {
  if (!topic || topic.length > 512 || /[\u0000-\u0020]/.test(topic)) throw new Error('MQTT Topic 无效')
  if (!allowWildcards && /[+#]/.test(topic)) throw new Error('发布 Topic 不允许使用通配符')
  if (allowWildcards && (topic.split('/').some((part, index, all) => part.includes('#') && (part !== '#' || index !== all.length - 1)) ||
      topic.split('/').some(part => part.includes('+') && part !== '+'))) throw new Error('MQTT Topic 通配符位置无效')
}

function topicMatches(filter: string, topic: string): boolean {
  if (topic.startsWith('$') && (filter.startsWith('#') || filter.startsWith('+'))) return false
  const f = filter.split('/')
  const t = topic.split('/')
  for (let i = 0; i < f.length; i++) {
    if (f[i] === '#') return i === f.length - 1
    if (i >= t.length || (f[i] !== '+' && f[i] !== t[i])) return false
  }
  return f.length === t.length
}
