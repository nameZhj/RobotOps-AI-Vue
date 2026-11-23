# Agent Workspace Index

> Read after root `AGENTS.md`; open only files relevant to the task.

## Architecture

- App: `src/main.ts`, `src/app/`
- Theme/layout: `src/styles/`, `src/shared/layout/app-layout.css`
- HTTP/auth: `src/shared/api/http.ts`, `src/shared/auth/`
- MQTT: `src/shared/mqtt/client.ts`, `ticket-api.ts`, `validation.ts`, `types.ts`
- Robot adapters: `src/platform/robot/`

## Feature modules

| Module | Purpose | Entry |
|---|---|---|
| auth | Session, login and UI RBAC | `src/modules/auth/store.ts`, `api.ts` |
| dashboard | Fleet summary | `src/modules/dashboard/views/DashboardView.vue` |
| devices | Robot/AGV inventory and state | `src/modules/devices/types.ts`, `api.ts` |
| maps | PGM/YAML, PCD, coordinate transform and route graph | `src/modules/maps/pgm-parser.ts`, `yaml-metadata.ts`, `coordinates.ts`, `components/MapViewport.vue` |
| tasks | Task queue and lifecycle | `src/modules/tasks/types.ts`, `api.ts` |
| visualization | Operations dashboard | `src/modules/visualization/views/CommandCenterView.vue`, `command-center.css` |
| logs | Structured event list | `src/modules/logs/views/LogListView.vue` |

## Network contracts

- HTTP: `docs/contracts/http-client.md`
- MQTT ticket, ACL, reconnect: `docs/contracts/mqtt-gateway.md`
- User/SSH/License boundary: `docs/authentication.md`

## Map and robot contracts

- Map assets/frames: `docs/maps-and-coordinate-frames.md`, `docs/contracts/map-package.md`
- Telemetry: `docs/contracts/device-telemetry.md`
- Tasks: `docs/contracts/task-state.md`
- Adapter: `docs/robot-adapter.md`

## Validation

- `docs/manual-smoke-check.md`
- `npm run typecheck` and `npm run build`

## Known limitations

- PGM requires paired ROS YAML; interactive route graph editor and persistence remain incomplete.
- PCD parsing is main-thread only; Worker/LOD not implemented.
- MQTT code is implemented, but backend ticket endpoint and broker ACL are deployment prerequisites.
- Real device APIs, telemetry aggregation and URDF joints are roadmap items.
- Mock data is not real robot state.
