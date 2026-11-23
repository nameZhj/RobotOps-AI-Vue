import { http } from '@/shared/api/http'
import type { MqttConnectTicket } from './types'

/** The backend validates the user session and issues credentials limited to allowed topics/devices. */
export function requestMqttTicket(): Promise<MqttConnectTicket> {
  return http.post<MqttConnectTicket>('/realtime/mqtt-ticket')
}
