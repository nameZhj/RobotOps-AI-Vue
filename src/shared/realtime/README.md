# Realtime transport

WebSocket/SSE connection lifecycle belongs here. Normalize server events before exposing them to modules. Include reconnect backoff, heartbeat timeout, message schema validation, sequence-gap detection and unsubscribe cleanup. Never include Broker shared credentials in frontend configuration.
