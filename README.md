# RobotOps AI Vue

> 面向 AI Agent 的机器人 Web 管理与数字孪生快速开发框架。Vue 3 + TypeScript + Vite，覆盖机器人 / 机械狗 / AGV 的设备、地图、路网、任务、可视化大屏和日志管理。

## 设计目标

1. **Agent-first**：先读 `AGENTS.md` 和 `.agent/INDEX.md` 即可定位模块；按业务垂直切片组织，避免跨层猜测。
2. **低上下文成本**：单文件单职责；目标 150 行，硬上限 250 行；用稳定 DTO、短 README 和自动符号索引定位代码。
3. **协议与设备解耦**：页面不直接拼 MQTT Topic、ROS 消息或设备 HTTP 地址。
4. **安全边界清晰**：平台登录、机器人 SSH 凭证、设备 License 分离；浏览器不持久化长期密钥。
5. **先 Mock 后真机**：可离线演示，但所有模拟状态都明确标记。

## 技术栈

- Vue 3 + TypeScript + Vite 8
- Vue Router + Pinia + Element Plus
- Three.js：地图、点云和模型可视化
- MQTT.js：MQTT over WSS 浏览器通信
- ECharts：可视化大屏图表（后续数据接入）

## 快速开始

```bash
npm install
cp .env.example .env.local
npm run dev
```

默认 `VITE_AUTH_MODE=mock`，仅用于本地界面开发。生产环境使用 `VITE_AUTH_MODE=api` 并配置后端认证服务。

## 网络基础设施

### HTTP

统一入口：`src/shared/api/http.ts`。具备 15 秒默认超时、AbortSignal 取消、统一 ApiError、204/205 空响应、并发 401 single-flight refresh。GET/HEAD/OPTIONS 可在刷新后重试；写请求必须携带 `Idempotency-Key` 才会自动重放。不会盲目重试任务创建或控制命令。

详细契约：`docs/contracts/http-client.md`。

### MQTT

统一入口：`src/shared/mqtt/client.ts`。只使用 MQTT over WSS。前端先通过登录态调用后端 `POST /api/realtime/mqtt-ticket` 获取短时、受 Topic ACL 限制的凭证；客户端负责连接状态、keepalive、重连退避、凭证续签、订阅恢复和 disposer。禁止在前端写死 Broker 账号密码。

详细契约：`docs/contracts/mqtt-gateway.md`。

## 响应式与可访问性

支持 320px 起的窄屏、平板、桌面和超宽显示器。布局优先使用 `clamp()`、`minmax(0, 1fr)`、`min-width: 0` 和局部滚动，不通过挤压文字来适配。统一颜色 Token、按钮状态、焦点样式和文字对比度。

普通文字与背景以 WCAG 2.2 AA 4.5:1 为目标；状态不只靠颜色表达。规范见 `AGENTS.md` 第 3 节。

## 常用命令

```bash
npm run dev          # 本地开发
npm run typecheck    # TypeScript 检查
npm run build        # 生产构建
npm run ai:index     # 更新 Agent 符号索引
```

本仓库不保留单元测试文件或测试运行器；改动通过 typecheck、production build 和 `docs/manual-smoke-check.md` 验证。

## 目录导航

| 路径 | 职责 |
|---|---|
| `src/modules/` | auth、dashboard、devices、maps、tasks、visualization、logs |
| `src/shared/api/` | HTTP 请求、刷新、错误 |
| `src/shared/mqtt/` | MQTT ticket、WSS 客户端、Topic 校验和订阅 |
| `src/shared/auth/` | Token 与权限 |
| `src/platform/` | 机器人协议适配器 |
| `src/styles/` | 颜色、排版、响应式与 Element Plus 主题 |
| `docs/contracts/` | 前后端 HTTP、MQTT、地图、遥测和任务契约 |
| `.agent/` | Agent 索引 |

## Agent 开发入口

**先读：** `AGENTS.md` → `.agent/INDEX.md` → 模块 README → 目标文件。

新增模块必须更新 `.agent/INDEX.md` 和 `.agent/SOURCE_INDEX.md`。不要先扫描全仓库或输出重复的大段文档。

## 当前实现边界

当前已有应用壳、登录与 RBAC UI、设备/任务/日志页面、PGM P2/P5、ROS YAML 子集、地图坐标转换、PCD 预览、基础大屏、共享 HTTP 客户端和 MQTT WSS 客户端。

真实用户/设备 API、MQTT ticket 后端和 Broker ACL、WebSocket telemetry aggregation、地图路网编辑器、PCD Worker/LOD、URDF 关节模型仍需后端与后续模块配合。演示数据不代表真实设备状态。

## 安全规则

- access token 仅驻留内存；refresh token 由后端 HttpOnly Cookie 管理。
- SSH 凭证由后端密钥库保管；MQTT 使用后端签发的短时凭证。
- 禁止将密钥放入 localStorage、sessionStorage、URL、日志或前端环境变量。
- 前端权限只控制展示，后端必须独立执行 RBAC/ABAC。
- License 必须后端真实数字签名验签，不能只比较机器码。

## GitHub

独立仓库：<https://github.com/nameZhj/RobotOps-AI-Vue>
