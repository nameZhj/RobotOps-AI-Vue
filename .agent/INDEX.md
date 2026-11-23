# Agent Workspace Index

> Read this file after root `AGENTS.md`. Keep entries short and update whenever modules/files are added or renamed.

## Architecture

- App composition: `src/main.ts`, `src/app/`
- Shared UI/layout: `src/shared/layout/`
- Shared HTTP/token/RBAC: `src/shared/api/`, `src/shared/auth/`
- Robot adapters: `src/platform/robot/`

## Feature modules

| Module | Responsibility | Entry files |
|---|---|---|
| auth | User session, login, route permission | `src/modules/auth/store.ts`, `api.ts`, `views/LoginView.vue` |
| dashboard | Summary landing page | `src/modules/dashboard/views/DashboardView.vue` |
| devices | Cross-type device inventory and status | `src/modules/devices/types.ts`, `api.ts`, `views/DeviceListView.vue` |
| maps | PGM + ROS YAML metadata, map coordinates, route graph, 3D viewport | `src/modules/maps/pgm-parser.ts`, `yaml-metadata.ts`, `coordinates.ts`, `components/MapViewport.vue` |
| tasks | Task list and lifecycle DTOs | `src/modules/tasks/types.ts`, `api.ts`, `views/TaskListView.vue` |
| visualization | Command center UI | `src/modules/visualization/views/CommandCenterView.vue` |
| logs | Structured event list | `src/modules/logs/views/LogListView.vue` |

## Contract docs

- Auth: `docs/authentication.md`
- Map & frames: `docs/maps-and-coordinate-frames.md`, `docs/contracts/map-package.md`
- Device telemetry: `docs/contracts/device-telemetry.md`
- Task lifecycle: `docs/contracts/task-state.md`
- Robot adapters: `docs/robot-adapter.md`

## Known limitations

- PGM import requires paired ROS YAML metadata; route graph editing/persistence is still a scaffold.
- PCD Worker/LOD, URDF loader, real WS transport and backend APIs are roadmap items.
- Mock login/device/task data are not production identity or equipment state.
