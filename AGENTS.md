# Agent Engineering Contract

## 0. 起步路径

1. 读取本文件。
2. 读取 `.agent/INDEX.md`，按目标选择一个模块。
3. 读取该模块 `README.md` 和相关 `docs/contracts/*`。
4. 只打开索引命中的文件；禁止无目的地扫描全仓库。

## 1. 目标与边界

- 本仓库是 Vue 3 机器人管理 Web 前端，不负责机器人实时控制闭环、安全急停或底盘运动学。
- UI 不直接访问 MQTT Broker、SSH、ROS 设备端口；必须经 `src/platform/` 适配器或后端网关。
- 不猜测设备协议。未知字段、Topic、坐标系和状态码先登记为待确认契约，不得编造。
- 不修改 `docs/contracts/` 的既有语义而不更新调用方和测试。

## 2. 代码约束

- TypeScript `strict`；禁止 `any`，外部未知数据先用 `unknown` 并校验。
- 一个文件一个职责；目标 150 行以内，超过 250 行必须拆分。
- 组件只处理展示和用户交互；业务规则放 `modules/<feature>/services/`；网络请求放 `api/`。
- 页面不要直接 `fetch`；统一走 `src/shared/api/http.ts`。
- 模块之间只通过公开的 `types.ts` / `index.ts` 契约调用，避免互相深入访问内部目录。
- 不新增没有真实用途的抽象、注册中心、事件总线或全局单例。
- 所有异步操作处理 loading / error / empty 状态；所有订阅必须在卸载时清理。
- 不把大型 PCD、日志全文或设备遥测常驻 Pinia；采用分页、分块和 Worker。

## 3. 机器人安全规则

- 本前端不是安全控制器。任何运动指令都必须由后端进行权限、设备状态、控制权和安全条件校验。
- 高风险动作（运动、急停复位、任务强制终止、地图覆盖）必须二次确认并带审计理由。
- 设备失联、数据过期或控制权未知时，UI 必须显示不确定/失联，不得把旧状态伪装成在线。
- 实时消息必须包含 `deviceId`、`timestamp`、`sequence` 或等效字段；丢包/乱序需可识别。

## 4. 身份与凭证规则

- 用户身份使用平台 Auth API；设备 SSH 凭证与设备 License 不属于用户 Session。
- access token 只驻留内存；refresh token 由后端 HttpOnly Cookie 保存；不持久化任何长期凭证。
- 不打印 Authorization、Cookie、密码、SSH 私钥、MQTT 密钥或原始 License。
- 前端权限判断只控制菜单和交互，服务端必须对每个 API 再次授权。
- Mock Auth 必须通过明确的 `VITE_AUTH_MODE=mock` 开启，生产环境拒绝 Mock 模式。

## 5. 完成定义

- 变更范围最小，命名与既有模块一致。
- 新增/修改导出符号后更新 `.agent/INDEX.md`。
- 更新或新增契约说明和测试。
- 运行 `npm run typecheck`、`npm run build`；环境不支持时明确报告，不得声称通过。
- 检查所有事件监听、WebSocket、Worker、Three.js geometry/material/renderer 是否正确释放。

## 6. 禁止事项

- 禁止把所有业务塞进 `App.vue`、Pinia 巨型 Store 或一个 `utils.ts`。
- 禁止为了“通用”而创建过度抽象的 BaseManager / BaseService。
- 禁止将模拟设备、模拟运行状态当作真实设备数据。
- 禁止在前端存储或暴露机器人 SSH、MQTT、数据库、License 签名私钥。
