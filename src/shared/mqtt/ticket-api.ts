import { http } from '@/shared/api/http'
import type { MqttConnectTicket } from './types'

/** The backend validates the session and issues a short-lived, topic-scoped ticket. */
export function requestMqttTicket(): Promise<MqttConnectTicket> {
  const idempotencyKey = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `mqtt-ticket-${Date.now()}-${Math.random().toString(16).slice(2)}`
  return http.post<MqttConnectTicket>('/realtime/mqtt-ticket', {}, {
    headers: { 'Idempotency-Key': idempotencyKey },
  })
}
