# Visualization 模块

可视化大屏是一种独立的显示模式，不属于普通后台页面布局。

## 显示规则

- 独立路由：/command-center，不使用 AppLayout。
- 设计画布：1920 × 1080，固定 16:9。
- 缩放：根据视口宽高取较小比例，对完整画布统一缩放。
- 定位：画布始终在视口中心，宽高比不同时保留四周留白。
- 滚动：html、body、#app、画布和内部组件全部禁止滚动条。
- 响应：只调整最外层画布的 scale，不改变面板列数或局部尺寸比例。

## 文件入口

- 页面和 ResizeObserver：views/CommandCenterView.vue
- 固定画布样式：views/command-center.css
- 路由：src/app/router/index.ts
- 完整规则：docs/visualization-display.md
- 人工检查：docs/manual-smoke-check.md

## 数据边界

大屏只消费后端聚合后的指标和标准化事件，不在浏览器计算全局机群状态。正式接入后，应使用后端 dashboard summary 与时间序列 API。当前页面中的设备、任务和指标均为 Mock 数据，必须保持清晰标记。
