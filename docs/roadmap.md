# Roadmap

## P0 - Framework foundation

- [x] Vue 3 + TypeScript + Vite application shell
- [x] Route permission guard and memory-only access token
- [x] Mock login, device and task pages
- [x] Device, map, task, dashboard and log UI
- [x] PGM P2/P5 parsing, ROS YAML subset and map coordinate transforms
- [x] Three.js map and PCD preview entry point
- [x] Agent instructions, task routing and symbol index
- [x] Responsive dark theme, focus/selected states and mobile navigation
- [x] Shared HTTP timeout, cancellation, error normalization and single-flight refresh
- [x] MQTT.js WSS client, ephemeral tickets, Topic validation, reconnect and subscription lifecycle
- [x] Removed test files and test runner dependencies per project convention

## P1 - Backend integration

- [ ] Align login/refresh/logout and RBAC contracts with backend
- [ ] Device CRUD, credential-vault references and audit endpoints
- [ ] Deploy authenticated MQTT ticket endpoint and per-user/site/device broker ACL
- [ ] Telemetry schema validation, stale-sample policy and sequence-gap handling
- [ ] Task lifecycle API with command idempotency and audit
- [ ] Map package upload/download
- [ ] Map route graph CRUD, edit tools, undo/redo and validation

## P2 - Robotics visualization

- [ ] Move PCD parsing to Worker: ASCII / binary / binary_compressed
- [ ] Point-cloud downsampling, spatial index and LOD
- [ ] GLB/glTF model viewer and URDF joint visualization
- [ ] Pose interpolation and TF/frame transform service
- [ ] Multi-device overlays, trajectory, geofence and sensor layers

## P3 - Production operations

- [ ] User/role/permission administration UI
- [ ] Alert center, audit trail, log search and export
- [ ] Site/tenant isolation, capability registry and device groups
- [ ] Accessibility and deployment hardening
