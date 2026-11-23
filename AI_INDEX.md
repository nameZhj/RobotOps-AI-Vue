# AI Index

> Compact Agent entry point. Detailed navigation: `.agent/INDEX.md`. Symbol index: `.agent/SOURCE_INDEX.md`.

## Task routing

| Task | Read first | Implementation |
|---|---|---|
| Auth / RBAC | `docs/authentication.md` | `src/modules/auth/`, `src/shared/auth/` |
| Device inventory | `src/modules/devices/README.md` | `src/modules/devices/` |
| Map / route / cloud | `src/modules/maps/README.md` | `src/modules/maps/` |
| Task lifecycle | `docs/contracts/task-state.md` | `src/modules/tasks/` |
| HTTP client | `docs/contracts/http-client.md` | `src/shared/api/http.ts` |
| MQTT / realtime | `docs/contracts/mqtt-gateway.md` | `src/shared/mqtt/` |
| Responsive style | `AGENTS.md` section 3 | `src/styles/`, `src/shared/layout/` |
| Command center | `src/modules/visualization/README.md` | `src/modules/visualization/` |
| Logs | `src/modules/logs/README.md` | `src/modules/logs/` |

## Core flows

- HTTP: `View -> module API -> shared http -> Backend BFF`
- Auth: memory access token + HttpOnly refresh cookie + server-side RBAC
- MQTT: backend ticket API -> WSS broker + topic ACL -> normalized messages
- Map: PGM + ROS YAML -> validated occupancy grid -> Three.js

Do not scan node_modules, generated output, binary models, raw maps or full logs unless explicitly needed.
