# Device Telemetry Contract

Normalized event shape:

```ts
interface TelemetryEnvelope<T> {
  schemaVersion: 1
  deviceId: string
  timestamp: string // ISO 8601 UTC
  sequence: number
  source: 'mqtt-gateway' | 'ros-gateway' | 'vendor-api' | 'simulator'
  payload: T
}
```

Pose must include `frameId`; coordinates are meters and yaw radians. Battery is 0..100 or null. UI should show stale state if timestamp exceeds server-defined freshness threshold. Do not merge different device IDs or frame IDs into one series without explicit transforms.
