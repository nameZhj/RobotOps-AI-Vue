# Robot Adapter Design

## Frontend interface

`RobotAdapter` exposes connection lifecycle and normalized telemetry only. Do not expose raw vendor protocol methods to feature components.

## Production topology

`Robot -> MQTT/ROS2/vendor protocol -> backend robot gateway -> authenticated WS/SSE -> browser adapter -> Pinia feature state`.

The browser must not receive shared MQTT credentials. For direct WSS connections where unavoidable, backend issues a short-lived, device-scoped, revocable ticket with strict topic ACL and short expiry.

## Device family capability model

Capability flags should come from backend registry, e.g. `telemetry.pose`, `telemetry.joints`, `navigation.goal`, `task.pause`, `map.upload`, `motion.manual`. UI renders only supported capabilities. A common device model does not imply every device supports every operation.
