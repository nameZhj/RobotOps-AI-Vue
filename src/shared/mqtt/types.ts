export type MqttConnectionState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error' | 'disconnected'
export type MqttQos = 0 | 1

/** Short-lived, topic-scoped WebSocket credentials issued by the backend. Never persist this object. */
export interface MqttConnectTicket {
  url: string
  clientId: string
  username: string
  password: string
  expiresAt: string
}

export interface MqttIncomingMessage {
  topic: string
  payload: unknown
  receivedAt: number
  qos: MqttQos
  retain: boolean
}

export interface MqttStateSnapshot {
  state: MqttConnectionState
  reconnectAttempt: number
  lastError: string | null
}

export type MqttMessageHandler = (message: MqttIncomingMessage) => void
export type MqttStateHandler = (snapshot: MqttStateSnapshot) => void
