# RobotOps AI Vue

面向 AI Agent 的 Vue 3 机器人管理与数字孪生开发框架，适用于机器人、机械狗、AGV 等设备的管理、地图展示、任务管理和运行监控。

## 项目目标

- **便于 Agent 阅读和修改**：先看 AGENTS.md 与 .agent/INDEX.md，再按任务打开对应模块，不需要先扫描整个仓库。
- **文件职责明确**：页面、业务逻辑、网络通信和设备协议适配各自独立。单个源文件建议控制在 150 行左右，最多不超过 250 行。
- **接口和协议集中管理**：HTTP、MQTT、地图数据和设备状态使用明确的类型与接口约定。
- **凭证安全**：平台登录、机器人 SSH 凭证和设备 License 分开管理。浏览器不保存长期密钥。
- **先本地开发，再接入设备**：默认 Mock 数据只用于开发和界面演示，不代表真实设备状态。

## 技术栈

- Vue 3、TypeScript、Vite 8
- Vue Router、Pinia、Element Plus
- Three.js：地图、点云和 3D 模型展示
- MQTT.js：通过 WSS 连接 MQTT Gateway
- ECharts：统计图表和运行监控

## 快速开始

安装依赖，复制 .env.example 为 .env.local，然后运行 npm run dev。

默认 VITE_AUTH_MODE=mock，仅用于本地开发。生产环境必须使用 VITE_AUTH_MODE=api，并接入真实认证服务。

## 网络通信

### HTTP

统一入口：src/shared/api/http.ts。

支持默认 15 秒超时、AbortSignal 取消、统一 ApiError、204/205 空响应，以及并发 401 请求共用一次 Token refresh。GET、HEAD、OPTIONS 可在 refresh 后重试；写请求必须携带 Idempotency-Key 才允许自动重放。不会对任务创建或设备控制请求进行无条件重试。

文件上传和下载使用 src/shared/api/http-files.ts，同样经过统一认证、超时、错误处理和取消机制。

接口约定见 docs/contracts/http-client.md。

### MQTT

统一入口：src/shared/mqtt/client.ts。

浏览器只连接 MQTT over WSS。前端先通过当前登录态调用后端 POST /api/realtime/mqtt-ticket，获取短时、按用户和 Topic 授权的连接凭证。客户端负责连接状态、keepalive、断线重连、凭证续签、订阅恢复和取消订阅。

Broker 的 Topic ACL 必须由服务端执行。禁止把长期 Broker 用户名、密码或共享密钥写入前端环境变量。

接口约定见 docs/contracts/mqtt-gateway.md。

## 页面适配规则

普通业务页面与可视化大屏采用两套不同的布局策略，不得混用。

- **普通业务页面**：根据可用宽度调整 Grid/Flex 布局，允许表格、导航等局部区域滚动；文字应换行或省略，不得被挤压变形。
- **可视化大屏**：独立占用整个浏览器视口，使用固定的 1920×1080 设计画布，并按窗口宽高等比例缩放。画布始终居中，比例不一致时允许四周留白。页面和内部组件都禁止出现滚动条，也不能单独拉伸某个方向。

大屏实现与开发约束见 docs/visualization-display.md 和 AGENTS.md。

## 颜色与可读性

全局颜色集中在 src/styles/tokens.css。按钮、输入框、表格、选中状态和禁用状态由 src/styles/controls.css 统一管理。普通文字与背景以 WCAG 2.2 AA 的 4.5:1 对比度为目标；大字号至少 3:1。状态不能只靠颜色表达，还必须有文字或图标。

## 常用命令

- npm run dev：启动开发服务器
- npm run typecheck：TypeScript 检查
- npm run build：生产构建
- npm run ai:index：更新 Agent 源码索引

仓库不保留单元测试文件或测试运行器。代码修改使用 TypeScript 检查、生产构建和 docs/manual-smoke-check.md 中的人工检查清单验证。

## 目录导航

| 路径 | 内容 |
|---|---|
| src/modules/ | 登录、总览、设备、地图、任务、大屏和日志模块 |
| src/shared/api/ | HTTP 请求、认证刷新和文件传输 |
| src/shared/mqtt/ | MQTT ticket、WSS 客户端和 Topic 校验 |
| src/shared/auth/ | Token 存储和权限判断 |
| src/platform/ | 机器人协议适配器 |
| src/styles/ | 颜色、控件和普通页面的响应式样式 |
| docs/contracts/ | HTTP、MQTT、地图、遥测和任务接口约定 |
| .agent/ | Agent 文件索引 |

## Agent 开发入口

按以下顺序阅读：

AGENTS.md → .agent/INDEX.md → 对应模块 README → 目标源码文件。

新增或移动模块后，更新 .agent/INDEX.md 和 .agent/SOURCE_INDEX.md。不要复制整段说明到多个文档，详细规则只维护一份。

## 当前实现范围

当前已包含应用框架、登录和前端 RBAC、设备/任务/日志页面、PGM P2/P5 解析、ROS YAML 子集解析、地图坐标转换、PCD 基础预览、可视化大屏、HTTP 客户端和 MQTT WSS 客户端。

真实用户与设备 API、MQTT ticket 服务和 Broker ACL、遥测聚合服务、路网交互编辑、PCD Worker/LOD、URDF 关节模型仍需后端或后续开发配合。页面中的 Mock 数据不代表真实设备运行状态。

## 安全规则

- access token 只保存在内存中；refresh token 由后端使用 HttpOnly Cookie 管理。
- SSH 凭证由后端密钥库保管；MQTT 使用后端签发的短时凭证。
- 不得把密钥写入 localStorage、sessionStorage、URL、日志或前端环境变量。
- 前端权限只控制菜单和页面操作，后端必须独立执行 RBAC/ABAC。
- License 必须由后端执行数字签名验证，不能只比较机器码。

## GitHub

仓库地址：https://github.com/nameZhj/RobotOps-AI-Vue
