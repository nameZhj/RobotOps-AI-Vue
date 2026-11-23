export type DeviceKind = 'agv' | 'quadruped' | 'humanoid' | 'mobile-manipulator' | 'other'
export type DeviceConnection = 'online' | 'offline' | 'degraded' | 'unknown'

export interface DeviceSummary {
  id: string
  name: string
  kind: DeviceKind
  model: string
  site: string
  connection: DeviceConnection
  batteryPercent: number | null
  lastSeenAt: string | null
  activeTaskId: string | null
}
