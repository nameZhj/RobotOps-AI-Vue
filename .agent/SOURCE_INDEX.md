# Generated Source Index

> Rebuild with npm run ai:index. Keep this as a compact symbol locator.

| Path | Exported symbols / responsibility |
|---|---|
| src/app/router/index.ts | router, top-level command-center route |
| src/modules/auth/api.ts | authApi |
| src/modules/auth/store.ts | useAuthStore |
| src/modules/auth/types.ts | AuthUser, LoginInput, LoginResult |
| src/modules/devices/api.ts | deviceApi |
| src/modules/devices/types.ts | DeviceKind, DeviceConnection, DeviceSummary |
| src/modules/maps/coordinates.ts | pixelToWorld, worldToPixel |
| src/modules/maps/pgm-parser.ts | parsePgm, createGrid |
| src/modules/maps/types.ts | MapOrigin, OccupancyGrid, RouteNode, RouteEdge, RouteGraph, MapRobotMarker, MapEventMarker, MapDocument |
| src/modules/maps/components/MapViewport.vue | Three.js PGM / PCD renderer, route graph, robot poses and event markers |
| src/modules/maps/yaml-metadata.ts | MapYamlMetadata, parseMapYaml |
| src/modules/tasks/api.ts | taskApi |
| src/modules/tasks/types.ts | TaskState, TaskSummary |
| src/modules/visualization/views/CommandCenterView.vue | fixed 16:9 canvas, uniform scale, device/task API integration and viewport listeners |
| src/modules/visualization/components/CommandCenterMap.vue | PGM/YAML/PCD import, demo map, robot / route / event overlays |
| src/modules/visualization/components/CommandCenterOperationsPanel.vue | device state, patrol statistics and inspection event list |
| src/modules/visualization/components/CommandCenterVideoPanel.vue | browser-compatible video playback entry |
| src/modules/visualization/components/CommandCenterTaskPanel.vue | active, queued, completed and failed task groups |
| src/modules/visualization/views/command-center.css | 1920×1080 canvas and graphite-mint base styles |
| src/modules/visualization/views/command-center-panels.css | device, patrol, event, video and task panel styles |
| src/modules/visualization/views/command-center-map.css | central map panel styles |
| src/platform/robot/mock-robot-adapter.ts | MockRobotAdapter |
| src/platform/robot/robot-adapter.ts | RobotTelemetry, RobotAdapter |
| src/shared/api/http.ts | request, http, ApiError and RequestOptions re-export |
| src/shared/api/http-core.ts | shared request, timeout, refresh and retry primitives |
| src/shared/api/http-files.ts | uploadFile, downloadFile |
| src/shared/auth/permission.ts | Permission, Role, permissionsForRole, can |
| src/shared/auth/token-store.ts | tokenStore |
| src/shared/layout/AppLayout.vue | standard application shell |
| src/shared/layout/app-layout.css | responsive application shell styles |
| src/shared/mqtt/client.ts | MqttGatewayClient |
| src/shared/mqtt/ticket-api.ts | requestMqttTicket |
| src/shared/mqtt/types.ts | MqttConnectionState, MqttConnectTicket, MqttIncomingMessage, MqttStateSnapshot |
| src/shared/mqtt/validation.ts | validateTicket, validateTopic, topicMatches |
