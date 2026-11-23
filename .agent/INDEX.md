# Agent Workspace Index

> Read after root `AGENTS.md`. Open only the module relevant to the task.

## Architecture

- App composition: `src/main.ts`, `src/app/`
- Responsive shell and visual tokens: `src/shared/layout/`, `src/styles/`
- HTTP/session: `src/shared/api/http.ts`, `src/shared/auth/`
- MQTT transport: `src/shared/mqtt/client.ts`, `ticket-api.ts`, `types.ts`
- Vendor robot adapters: `src/platform/robot/`

## Feature modules

| Module | Responsibility | Entry files |
|---|---|---|
| auth | User session, login, route permission | `src/modules/auth/store.ts`, `api.ts`, `views/LoginView.vue` |
| dashboard | Summary landing page | `src/modules/dashboard/views/DashboardView.vue` |
| devices | Device inventory and status | `src/modules/devices/types.ts`, `api.ts`, `views/DeviceListView.vue` |
| maps | PGM/YAML, PCD, coordinates, route graph and 3D viewport | `src/modules/maps/pgm-parser.ts`, `yaml-metadata.ts`, `coordinates.ts`, `components/MapViewport.vue` |
| tasks | Task list and lifecycle DTOs | `src/modules/tasks/types.ts`, `api.ts`, `views/TaskListView.vue` |
| visualization | Command center | `src/modules/visualization/views/CommandCenterView.vue` |
| logs | Structured events | `src/modules/logs/views/LogListView.vue` |

## Network contracts

- HTTP auth/refresh/errors/retry: `docs/contracts/http-client.md`
- MQTT ticket/ACL/reconnect/message: `docs/contracts/mqtt-gateway.md`
- User/SSH/License boundaries: `docs/authentication.md`

## Other contract docs

- Map & frames: `docs/maps-and-coordinate-frames.md`, `docs/contracts/map-package.md`
- Device telemetry: `docs/contracts/device-telemetry.md`
- Task lifecycle: `docs/contracts/task-state.md`
- Robot adapters: `docs/robot-adapter.md`

## Known limitations

- PGM requires its paired ROS YAML; route graph editing/persistence remains a scaffold.
- PCD parsing currently uses the main thread; Worker/LOD is not implemented.
- GLB preview and URDF joint animation are separate roadmap items.
- MQTT client is implemented, but a compatible authenticated backend ticket endpoint and broker ACL are required.
- Real backend APIs and telemetry aggregation are not yet connected; Mock data is not real fleet state.
