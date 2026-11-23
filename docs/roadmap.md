# Roadmap

## P0 - Framework foundation

- [x] Vue 3 + TypeScript + Vite app shell
- [x] Route-level permission guard and in-memory token store
- [x] Mock auth, mock devices and tasks
- [x] Device, map, task, dashboard and log pages
- [x] PGM parser and basic Three.js map viewport
- [x] Agent contract and module index

## P1 - Real backend integration

- [ ] Agree login/refresh/logout and RBAC contracts with backend
- [ ] Device CRUD, credential vault references and audit endpoints
- [ ] Authenticated WS gateway with schema validation and reconnect policy
- [ ] Task lifecycle API with idempotency and audit
- [x] ROS map_server YAML subset parser (`resolution`, `origin`, `negate`, thresholds, frame id)
- [ ] Map package upload/download
- [ ] Map route graph CRUD, edit tools, undo/redo and validation

## P2 - Robotics visualization

- [x] PCDLoader parsing/rendering entry for `.pcd` (initial main-thread path, 128MB UI limit)
- [ ] Move PCD parsing to Worker: ASCII / binary / binary_compressed
- [ ] Point-cloud downsampling, spatial index and LOD
- [ ] GLB/glTF robot model loading and URDF joint visualization
- [ ] Pose interpolation and TF/frame transform service
- [ ] Multi-device overlays, trajectory, geofence and sensor layers

## P3 - Production operations

- [ ] User/role/permission administration UI
- [ ] Alert center, audit trail, log search and export
- [ ] Site/tenant isolation, feature capabilities and device groups
- [ ] E2E tests, accessibility, performance budgets and deployment hardening
