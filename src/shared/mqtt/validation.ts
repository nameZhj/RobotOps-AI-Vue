import type { MqttConnectTicket } from './types'

export function validateTicket(ticket: MqttConnectTicket) {
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

export function isAuthenticationFailure(error: Error): boolean {
  return /not authorized|unauthori[sz]ed|bad user(name)? or password|bad credentials|access denied/i.test(error.message)
}

export function validateTopic(topic: string, allowWildcards: boolean) {
  if (!topic || topic.length > 512 || /[\u0000-\u0020]/.test(topic)) throw new Error('MQTT Topic 无效')
  if (!allowWildcards && /[+#]/.test(topic)) throw new Error('发布 Topic 不允许使用通配符')
  const parts = topic.split('/')
  if (allowWildcards && parts.some((part, index) =>
    (part.includes('#') && (part !== '#' || index !== parts.length - 1)) ||
    (part.includes('+') && part !== '+'))) throw new Error('MQTT Topic 通配符位置无效')
}

export function topicMatches(filter: string, topic: string): boolean {
  if (topic.startsWith('$') && (filter.startsWith('#') || filter.startsWith('+'))) return false
  const filters = filter.split('/')
  const levels = topic.split('/')
  for (let index = 0; index < filters.length; index++) {
    if (filters[index] === '#') return index === filters.length - 1
    if (index >= levels.length || (filters[index] !== '+' && filters[index] !== levels[index])) return false
  }
  return filters.length === levels.length
}
