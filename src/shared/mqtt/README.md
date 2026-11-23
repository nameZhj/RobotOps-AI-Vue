# Shared MQTT Framework

All browser MQTT sessions use MQTT over secure WebSockets (WSS) and short-lived tickets issued by the backend. The frontend never embeds static broker username/password or stores tickets persistently.

## Minimal usage

```ts
import { MqttGatewayClient } from '@/shared/mqtt/client'

const mqtt = new MqttGatewayClient()
const stopState = mqtt.onStateChange(state => console.info(state.state))
const stopTelemetry = mqtt.subscribe('fleet/site-a/+/telemetry', message => {
  // Validate payload schema and device identity before updating feature state.
})
await mqtt.connect()

// component/service shutdown
stopTelemetry()
stopState()
await mqtt.disconnect()
```

Do not publish control commands directly from UI components. Route commands through an authorized backend task/control API; the server validates permission, device capability, control authority, idempotency and safety state.

## Lifecycle rules

- `connect()` is concurrency-safe and obtains a fresh backend ticket.
- Reconnect uses capped exponential backoff with jitter and obtains a fresh ticket each time.
- Ticket renewal happens before expiry; `disconnect()` disables automatic reconnect.
- Subscriptions survive reconnect and are removed when the returned disposer is called.
- Payload JSON is decoded to `unknown`; feature modules must validate its schema.
- Handler failures are isolated; never log raw payloads or credentials by default.
