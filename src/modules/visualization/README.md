# 可视化大屏模块

可视化大屏是独立的显示模式，不属于普通后台页面布局。当前界面采用「石墨薄荷」主题，以地图为主视觉。

## 信息布局

- 左栏：设备状态、巡检统计和巡检事件。
- 中央：最大区域显示数字孪生地图，支持 PGM + YAML 和 PCD 文件导入，并叠加机器人位置、任务路线和事件点位。
- 右栏：现场视频播放入口、进行中任务、等待任务和已完成任务。
- 设计画布仍为 1920 × 1080，所有面板随画布统一等比例缩放，不进行断点重排。

## 文件入口

- 页面和缩放：`views/CommandCenterView.vue`
- 总体布局：`views/command-center.css`
- 左右侧面板：`views/command-center-panels.css`
- 地图区域：`views/command-center-map.css`
- 地图和文件导入：`components/CommandCenterMap.vue`
- 设备、巡检统计和事件：`components/CommandCenterOperationsPanel.vue`
- 视频播放：`components/CommandCenterVideoPanel.vue`
- 任务状态：`components/CommandCenterTaskPanel.vue`
- 地图渲染：`src/modules/maps/components/MapViewport.vue`

## 数据来源和接入边界

- 设备状态读取现有 `deviceApi.list()`，任务状态读取现有 `taskApi.list()`。Mock 模式会显示演示标记。
- 大屏默认地图、机器人位置、路线和事件点位均为演示数据。导入自定义 PGM/PCD 后，会清除演示定位和路线覆盖层，避免误把模拟坐标当作真实定位。
- PGM 必须配套导入 ROS YAML，地图分辨率和原点不得猜测。PCD 可独立显示，也可与已加载地图叠加，但两者必须使用一致坐标系。
- 当前仓库尚无机器人定位聚合、巡检统计、巡检事件和事件图片 API。对应区域保留清晰的演示标记，接入时必须使用服务端时间、点位坐标和媒体地址。
- 视频播放器读取可选环境变量 `VITE_COMMAND_CENTER_VIDEO_URL`。该地址必须是浏览器原生支持的媒体地址；RTSP 不能直接通过 HTML `video` 播放。生产环境应由后端视频网关提供浏览器兼容的播放地址。
- 任务摘要当前只提供整体状态和完成百分比。只有后端任务详情 API 返回步骤明细后，才能显示逐步骤完成情况。

## 显示规则

- 独立路由：`/command-center`，不使用 AppLayout。
- 设计画布：1920 × 1080，固定 16:9。
- 缩放：根据视口宽高取较小比例，对完整画布统一缩放并居中。
- html、body、#app、画布和内部组件全部禁止滚动条。
- 不同比例屏幕允许四周留白；不得拉伸画布或重排内部布局。
- 完整规则见 `docs/visualization-display.md`，人工检查见 `docs/manual-smoke-check.md`。
