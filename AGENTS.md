# Agent Engineering Contract

## 0. 起步路径

1. 读取本文件。
2. 读取 `.agent/INDEX.md`，按目标选择一个模块。
3. 读取目标模块 `README.md` 和相关 `docs/contracts/*`。
4. 只打开索引命中的文件；禁止无目的地扫描全仓库。

## 1. 目标与边界

- 本仓库是 Vue 3 机器人管理 Web 前端，不负责机器人实时控制闭环、安全急停或底盘运动学。
- UI 不直接访问 MQTT Broker、SSH、ROS 设备端口；必须经 `src/platform/` 适配器或后端网关。
- 不猜测设备协议。未知字段、Topic、坐标系和状态码先登记为待确认契约，不得编造。
- 不修改 `docs/contracts/` 的既有语义而不更新调用方和开发文档。

## 2. AI 低上下文代码约束

- TypeScript `strict`；禁止 `any`，外部未知数据先用 `unknown` 并验证。
- 一个文件一个职责；目标 150 行以内，硬上限 250 行；超出必须按职责拆分。
- Vue 页面只编排功能；展示放组件，业务规则放 `modules/<feature>/services/`，网络放共享基础设施。
- 禁止页面直接 `fetch`；HTTP 统一使用 `src/shared/api/http.ts`。
- MQTT 统一使用 `src/shared/mqtt/client.ts`；禁止业务模块直接 new MQTT.js 客户端。
- 模块之间只通过公开 DTO、service/API 契约调用，禁止跨模块深入 import 内部实现。
- 不新增没有真实用途的抽象、注册中心、事件总线或全局单例。
- 不把大型 PCD、日志全文或高频遥测常驻 Pinia；使用分页、分块、Worker 和时间窗。
- 本仓库不新增单元测试文件、fixture 或重复测试配置；用 typecheck/build 和短 smoke checklist 验证。

## 3. 响应式 UI 与可访问性

- 不得在 `html/body/#app` 设置大于 320px 的全局最小宽度；页面必须能在 320px 到超宽屏工作。
- 优先使用 `clamp()`、`minmax(0, 1fr)`、`min-width: 0`、`max-width: 100%` 和容器内滚动，禁止通过挤压文字来适配。
- Flex/Grid 子项显式设置 `min-width: 0`；长 ID/路径用省略号或可换行展示；代码、数值、时间戳使用局部横向滚动。
- 不用固定像素宽度/高度控制主要布局；固定值仅用于图标、按钮最小触控高度和已知画布边界。
- 全局颜色必须使用 `src/styles/tokens.css`；普通文字与背景目标对比度至少 4.5:1，大字号至少 3:1。状态不能只靠颜色区分，必须同时有文字/图标。
- 按钮统一使用 Element Plus 全局按钮样式：内容水平/垂直居中、稳定内边距、明确 hover/focus/active/disabled 状态；禁止压缩按钮或让文字贴边。
- 检查键盘焦点、200% 文字放大、窄屏横向溢出和 reduced-motion。依据 WCAG 2.2 AA。

## 4. 机器人安全规则

- 本前端不是安全控制器。任何运动指令都必须由后端进行权限、设备状态、控制权和安全条件校验。
- 高风险动作（运动、急停复位、任务强制终止、地图覆盖）必须二次确认并带审计理由。
- 设备失联、数据过期或控制权未知时，UI 必须显示不确定/失联，不得把旧状态伪装成在线。
- 实时消息必须包含 `deviceId`、`timestamp`、`sequence` 或等效字段；丢包/乱序需可识别。

## 5. 身份与凭证规则

- 用户身份使用平台 Auth API；设备 SSH 凭证与设备 License 不属于用户 Session。
- access token 只驻留内存；refresh token 由后端 HttpOnly Cookie 保存；不持久化任何长期凭证。
- 不打印 Authorization、Cookie、密码、SSH 私钥、MQTT 密钥或原始 License。
- MQTT 凭证必须由后端实时签发短时、设备/Topic 范围受限的 WSS ticket；浏览器不存储长期 Broker 密码。
- 前端权限判断只控制菜单和交互，服务端必须对每个 API 再次授权。
- Mock Auth 必须通过明确的 `VITE_AUTH_MODE=mock` 开启，生产环境拒绝 Mock 模式。

## 6. 网络工程规则

- HTTP：统一超时、取消、错误结构和 requestId；401 使用 single-flight refresh；只有 GET/HEAD/OPTIONS 或带 Idempotency-Key 的写请求才可自动重放。
- MQTT：统一 WSS、ticket、keepalive、QoS 0/1、指数退避+jitter、订阅恢复和 disposer；禁止默认无限缓存/保留危险指令。
- 不对任务创建、运动控制等非幂等动作做盲目重试；发送命令必须包含 commandId/idempotency key，并由后端执行安全校验。
- 所有连接、订阅、ResizeObserver、DOM listener 和 Three.js 资源必须有对应清理逻辑。

## 7. 完成定义

- 变更范围最小、命名与模块契约一致；同步更新 `.agent/INDEX.md` 和 `.agent/SOURCE_INDEX.md`。
- 更新对应模块 README 和 `docs/contracts/`，不要在多个文档复制同一长段实现细节。
- 运行 `npm run typecheck`、`npm run build`；无法运行时明确报告，不得宣称通过。
- 按 `docs/manual-smoke-check.md` 进行人工验证；不要新建测试目录或测试框架。
- 检查响应式边界、文字对比度、布局溢出、错误/loading/empty 状态及资源释放。

## 8. 禁止事项

- 禁止把所有业务塞进 `App.vue`、Pinia 巨型 Store 或一个 `utils.ts`。
- 禁止为了“通用”而创建过度抽象的 BaseManager / BaseService。
- 禁止将模拟设备、模拟运行状态当作真实设备数据。
- 禁止在前端存储或暴露机器人 SSH、MQTT、数据库、License 签名私钥。
- 禁止在生产环境启用 Mock 身份、非 TLS MQTT 或无 ACL 的公共 Topic。
