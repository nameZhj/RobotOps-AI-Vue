export interface RobotTelemetry {
  deviceId: string; timestamp: string; sequence: number
  pose: { x: number; y: number; yaw: number; frameId: string } | null
  batteryPercent: number | null; linearSpeed: number | null; angularSpeed: number | null
  connection: 'online' | 'offline' | 'degraded' | 'unknown'
}
export interface RobotAdapter {
  connect(): Promise<void>
  disconnect(): Promise<void>
  subscribeTelemetry(deviceIds: string[], onMessage: (event: RobotTelemetry) => void): () => void
}
