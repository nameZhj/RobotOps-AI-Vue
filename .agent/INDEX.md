# Agent Workspace Index

> Read after root AGENTS.md. Open only files relevant to the task.

## Architecture

- App and routing: src/main.ts, src/app/
- Theme and ordinary layout: src/styles/, src/shared/layout/
- HTTP and auth: src/shared/api/, src/shared/auth/
- MQTT: src/shared/mqtt/client.ts, ticket-api.ts, validation.ts, types.ts
- Robot adapters: src/platform/robot/

## Feature modules

| Module | Purpose | Entry |
|---|---|---|
| auth | Session, login and UI RBAC | src/modules/auth/store.ts, api.ts |
| dashboard | Fleet summary page | src/modules/dashboard/views/DashboardView.vue |
| devices | Robot/AGV inventory and status | src/modules/devices/types.ts, api.ts |
| maps | PGM/YAML, PCD, coordinates and route graph | src/modules/maps/pgm-parser.ts, yaml-metadata.ts, coordinates.ts, components/MapViewport.vue |
| tasks | Task queue and lifecycle | src/modules/tasks/types.ts, api.ts |
| visualization | Fixed-canvas 16:9 display | src/modules/visualization/README.md, views/CommandCenterView.vue, views/command-center.css |
| logs | Structured event list | src/modules/logs/views/LogListView.vue |

## Display modes

- Ordinary pages: AGENTS.md section 3.1. Responsive reflow and local scrolling are allowed.
- Command center: AGENTS.md section 3.2 and docs/visualization-display.md. Independent route, fixed 1920×1080 canvas, uniform scale, centered, no scrollbars.

## Network contracts

- HTTP: docs/contracts/http-client.md
- MQTT ticket, ACL and reconnect: docs/contracts/mqtt-gateway.md
- User/SSH/License boundary: docs/authentication.md

## Map and robot contracts

- Map assets and frames: docs/maps-and-coordinate-frames.md, docs/contracts/map-package.md
- Telemetry: docs/contracts/device-telemetry.md
- Tasks: docs/contracts/task-state.md
- Adapter: docs/robot-adapter.md

## Validation

- docs/manual-smoke-check.md
- npm run typecheck
- npm run build

## Known limitations

- PGM requires paired ROS YAML; interactive route editing and persistence remain incomplete.
- PCD parsing is main-thread only; Worker/LOD is not implemented.
- MQTT code is implemented, but backend ticket endpoint and Broker ACL are deployment prerequisites.
- Real device APIs, telemetry aggregation and URDF joints remain roadmap items.
- Mock data is not real robot state.
