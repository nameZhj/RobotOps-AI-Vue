# Robot platform adapters

本目录隔离机器人厂商协议和传输方式。业务模块只依赖 `RobotAdapter`，禁止在 Vue 页面直接操作 MQTT/ROS。

真实生产建议由后端统一接入 MQTT、ROS 2、厂商 HTTP 或 gRPC，再通过鉴权后的 WebSocket/SSE 向浏览器推送归一化事件。
