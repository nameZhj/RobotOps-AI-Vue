import type { RobotAdapter, RobotTelemetry } from './robot-adapter'

/** Deterministic local adapter for UI development; never represents real equipment. */
export class MockRobotAdapter implements RobotAdapter {
  private connected = false
  async connect() { this.connected = true }
  async disconnect() { this.connected = false }
  subscribeTelemetry(deviceIds: string[], onMessage: (event: RobotTelemetry) => void) {
    if (!this.connected) throw new Error('Mock adapter is not connected')
    let sequence = 0
    const timer = window.setInterval(() => {
      for (const deviceId of deviceIds) onMessage({
        deviceId, timestamp: new Date().toISOString(), sequence: ++sequence,
        pose: { x: (sequence % 100) / 10, y: 2, yaw: 0, frameId: 'map' },
        batteryPercent: 80 - (sequence % 20), linearSpeed: 0.25, angularSpeed: 0,
        connection: 'online',
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }
}
