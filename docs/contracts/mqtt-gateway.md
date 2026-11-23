# MQTT Gateway Contract

## Topology

`Browser MQTT.js (WSS) -> MQTT Broker WebSocket endpoint -> scoped broker ACL -> Robot Gateway -> MQTT/ROS/vendor protocol`.

Preferred alternative for restricted deployments: broker remains private and backend fans out telemetry to an authenticated WebSocket/SSE gateway.

## Ticket API

`POST /api/realtime/mqtt-ticket` returns a short-lived ticket:

```json
{
  "url": "wss://mqtt-gateway.example.com/mqtt",
  "clientId": "web-user-42-session-...",
  "username": "ephemeral-user",
  "password": "ephemeral-secret",
  "expiresAt": "2026-11-23T10:05:00Z"
}
```

Contract rules:
- Backend authenticates the HttpOnly session / Bearer access token.
- Ticket lifetime should be short (recommended 1-5 minutes), revocable, session-scoped and limited to tenant/site/device/topic ACL.
- Ticket endpoint accepts `Idempotency-Key`; the same key returns the same ticket during the short deduplication window so the HTTP client can safely replay after session refresh.
- Broker must enforce topic ACL server-side; never trust the browser to constrain topics.
- WSS only. Do not embed credentials in URL query/path or frontend environment variables.
- Ticket credentials exist in memory only and are replaced on reconnect/renewal.
- Ticket endpoint must be rate-limited and audited.

## Browser client behavior

MQTT.js is configured with QoS 0/1, clean session, keepalive, bounded connect timeout, and manual exponential reconnect with jitter. The client re-fetches a ticket after disconnect and re-subscribes active subscriptions. No QoS 2 or retained control command is exposed by the base abstraction.

## Message contract

Feature modules receive `{ topic, payload: unknown, receivedAt, qos, retain }`. Validate every payload before use. Robot telemetry should additionally carry schemaVersion, deviceId, timestamp (UTC), sequence and frameId where pose is included. Detect stale, duplicate and out-of-order samples.

## Control safety

Do not use this generic MQTT client for unreviewed movement or emergency-stop commands. Control commands go through backend APIs with RBAC/ABAC, command idempotency, control-authority checks, safety interlocks and audit logs.
