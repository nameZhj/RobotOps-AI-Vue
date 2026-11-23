# Devices module

负责统一机器人 / 机械狗 / AGV 设备目录、元数据、在线状态与绑定关系。

- DTO 和状态类型：`types.ts`
- HTTP API：`api.ts`
- 当前列表页：`views/DeviceListView.vue`
- 接入真实设备事件时使用 `src/platform/robot/` 归一化事件。
- 不在浏览器储存 SSH 密码、MQTT 密钥；凭证登记必须走后端安全接口。
