# AI Index

> Start with AGENTS.md, then use .agent/INDEX.md to locate the relevant feature.

| Task | First read | Code entry |
|---|---|---|
| Auth / RBAC | docs/authentication.md | src/modules/auth/, src/shared/auth/ |
| Devices | src/modules/devices/README.md | src/modules/devices/ |
| Maps / routes / PCD | src/modules/maps/README.md | src/modules/maps/ |
| Tasks | docs/contracts/task-state.md | src/modules/tasks/ |
| HTTP | docs/contracts/http-client.md | src/shared/api/ |
| MQTT | docs/contracts/mqtt-gateway.md | src/shared/mqtt/ |
| Ordinary page layout | AGENTS.md section 3.1 | src/styles/, src/shared/layout/ |
| Visualization display | docs/visualization-display.md | src/modules/visualization/ |
| Logs | src/modules/logs/README.md | src/modules/logs/ |

## Core data flows

- HTTP: View -> module API -> shared HTTP -> backend BFF
- Auth: memory-only access token + HttpOnly refresh cookie + server-side RBAC
- MQTT: backend ticket -> WSS + Broker ACL -> validated feature messages
- Map: PGM + ROS YAML -> validated occupancy grid -> Three.js

Do not scan node_modules, generated bundles, binary maps, meshes or raw logs unless needed for the task.
