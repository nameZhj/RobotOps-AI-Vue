# AI Index

> 根目录轻量入口。详细索引位于 `.agent/INDEX.md`，源码符号表由 `npm run ai:index` 生成。

## 按任务定位

| 要做什么 | 从哪里开始 | 主要文件 |
|---|---|---|
| 登录 / 会话 / 权限 | `src/modules/auth/README.md` | `store.ts`, `api.ts`, `src/shared/auth/` |
| 设备增删改查 / 状态 | `src/modules/devices/README.md` | `types.ts`, `api.ts`, `views/DeviceListView.vue` |
| PGM / YAML / 坐标 / 点云 | `src/modules/maps/README.md` | `pgm-parser.ts`, `yaml-metadata.ts`, `coordinates.ts`, `MapViewport.vue` |
| 任务管理 | `src/modules/tasks/README.md` | `types.ts`, `api.ts`, `TaskListView.vue` |
| 可视化大屏 | `src/modules/visualization/README.md` | `CommandCenterView.vue` |
| 日志 | `src/modules/logs/README.md` | `LogListView.vue` |
| 机器人协议接入 | `src/platform/robot/README.md` | `robot-adapter.ts`, `mock-robot-adapter.ts` |
| HTTP / Token | `src/shared/api/README.md` | `http.ts`, `src/shared/auth/token-store.ts` |

## 核心数据流

`View -> module service/store -> module api -> shared http -> Backend BFF/API`

实时数据：`Backend WS Gateway -> platform realtime adapter -> normalized event -> feature store/view`

地图：`PGM + ROS YAML -> validated occupancy grid -> Three.js viewport layers`

## 不应打开的内容

除非任务明确涉及，不要读取 `node_modules/`、构建产物、二进制模型、完整日志或地图原始文件。
