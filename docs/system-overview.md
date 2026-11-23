# System Overview

## Runtime boundaries

- Browser: Vue UI, local input validation, short-lived access token in memory, Three.js rendering.
- Backend BFF/API: user authentication, authorization, device credential vault, task orchestration, audit, map metadata, telemetry fan-out.
- Robot gateway: MQTT / ROS 2 / vendor protocol translation, robot-side credentials and ACL.
- Robots: AGV, AMR, quadruped and humanoid hardware.

## Dependency direction

`app -> modules -> shared/platform -> browser/backend interfaces`

Business modules must not import from sibling module internals. Use stable DTOs and public service interfaces.

## Main modules

- `auth`: platform user session and UI permission gates
- `devices`: device registry and normalized connection state
- `maps`: PGM/YAML, PCD, map coordinate transforms and route graph
- `tasks`: task definitions and lifecycle
- `visualization`: command-center aggregation and charts
- `logs`: paginated, redacted structured events
