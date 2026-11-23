# AI Index

> Compact Agent entry point. Detailed routing: `.agent/INDEX.md`. Export symbols: `.agent/SOURCE_INDEX.md`.

| Task | First read | Code entry |
|---|---|---|
| Auth / RBAC | `docs/authentication.md` | `src/modules/auth/`, `src/shared/auth/` |
| Devices | `src/modules/devices/README.md` | `src/modules/devices/` |
| Maps / routes / PCD | `src/modules/maps/README.md` | `src/modules/maps/` |
| Tasks | `docs/contracts/task-state.md` | `src/modules/tasks/` |
| HTTP | `docs/contracts/http-client.md` | `src/shared/api/http.ts` |
| MQTT | `docs/contracts/mqtt-gateway.md` | `src/shared/mqtt/client.ts`, `validation.ts` |
| Responsive UI | `AGENTS.md` section 3 | `src/styles/`, `src/shared/layout/` |
| Dashboard / logs | `.agent/INDEX.md` | `src/modules/visualization/`, `src/modules/logs/` |

## Data flows

- HTTP: `View -> module API -> shared HTTP -> backend BFF`
- Auth: memory-only access token + HttpOnly refresh cookie + server-side RBAC
- MQTT: backend ticket -> WSS + broker ACL -> validated feature messages
- Map: PGM + ROS YAML -> validated occupancy grid -> Three.js

Do not scan node_modules, generated bundles, binary maps, meshes or raw logs unless specifically required.
