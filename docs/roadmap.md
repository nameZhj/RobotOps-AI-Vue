# Roadmap

## P0 - Framework foundation

- [x] Vue 3 + TypeScript + Vite app shell
- [x] Route permission guard and in-memory access token
- [x] Mock auth, device and task UI
- [x] Device, map, task, dashboard and log pages
- [x] PGM P2/P5 parser, ROS YAML metadata parser and coordinate conversion
- [x] Three.js map and PCD preview entry point
- [x] Agent contract, source index and module routing
- [x] Responsive dark theme, text/button contrast and mobile navigation
- [x] Shared HTTP timeout/cancel/error/401 refresh foundation
- [x] MQTT.js WSS client, short-lived tickets, reconnect and subscription lifecycle

## P1 - Backend integration

- [ ] Align login/refresh/logout and RBAC contracts with backend
- [ ] Device CRUD, credential vault references and audit endpoints
- [ ] Deploy authenticated MQTT ticket endpoint and per-user/site/device broker ACL
- [ ] Add telemetry message validators, stale-sample policy and sequence-gap handling
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
- [ ] Visual regression/accessibility checks and deployment hardening
