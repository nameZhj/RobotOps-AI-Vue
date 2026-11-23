# Realtime transport

MQTT over WSS is implemented in `src/shared/mqtt/`. This folder is reserved for authenticated WebSocket/SSE transport where the backend does not expose MQTT to browsers.

Both transports must normalize events, validate schemas, expose connection state, detect stale timestamps/sequence gaps, and return unsubscribe disposers. Never include Broker shared credentials in frontend configuration.
