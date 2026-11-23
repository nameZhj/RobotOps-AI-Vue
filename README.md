# RobotOps AI Vue

> 面向 AI Agent 的机器人 Web 管理与数字孪生快速开发框架。Vue 3 + TypeScript + Vite，覆盖机器人 / 机械狗 / AGV 的设备、地图、路网、任务、可视化大屏和日志管理。

## 设计目标

1. **Agent-first**：先读 `AGENTS.md` 和 `.agent/INDEX.md` 即可定位模块；每个业务能力按垂直切片组织，避免跨层猜测。
2. **低上下文成本**：单文件单职责；代码文件建议 150 行以内、硬上限 250 行；公共契约集中维护；避免 barrel 文件和隐式魔法。
3. **协议与设备解耦**：页面只依赖应用服务和类型化适配器，不直接拼 MQTT Topic、ROS 消息或设备 HTTP 地址。
4. **安全边界清晰**：用户登录、机器人 SSH 凭证、设备 License 三套身份体系分离；浏览器不持久化长期密钥。
5. **先 Mock 后真机**：默认 Mock 适配器可离线启动；真实后端通过 API/WS 适配器接入。

## 技术栈

- Vue 3、TypeScript、Vite 8（需要 Node.js 20.19+ 或 22.12+）
- Vue Router、Pinia、Element Plus
- Three.js：3D 场景、点云和模型渲染
- ECharts：运营大屏和趋势图
- Vitest：单元测试

## 快速开始

```bash
npm install
cp .env.example .env.local
npm run dev
```

默认 `VITE_AUTH_MODE=mock`，只用于本地 UI 开发，不提供真实安全认证。生产环境必须使用 `VITE_AUTH_MODE=api`，并配置后端认证 API。

## Agent 开发入口

**先读：** `AGENTS.md` → `.agent/INDEX.md` → 对应模块 `README.md` → 目标文件。

新增功能复制 `docs/templates/feature.template.md`，不要先扫描整个仓库。完成后运行 `npm run typecheck && npm run build`，并更新 `.agent/INDEX.md`。

## 功能范围

- 登录与轻量 RBAC 权限控制（前端仅负责体验，后端必须再次鉴权）
- 设备管理：机器人、机械狗、AGV 统一设备模型
- 地图管理：配套 PGM + ROS YAML 元数据、PCD 点云基础预览、坐标转换、路网节点和边契约
- 任务管理：创建、下发、暂停、恢复、取消、状态追踪
- 可视化大屏：设备在线率、任务运行情况、告警和趋势
- 日志管理：结构化事件、设备日志、任务日志检索

## 安全规则

- access token 仅保存在内存；refresh token 由后端以 HttpOnly Cookie 管理。
- SSH 凭证必须由后端保管并加密，浏览器不可持久化或回显。
- MQTT 真实接入优先通过后端网关，禁止在前端写入共享 Broker 密码。
- 路由权限只是 UI 体验，后端必须对每个 API 独立鉴权。
- License 必须由后端使用固定公钥验签，不能只比较机器码。
- Mock 登录禁止进入生产构建。

## 当前实现边界

首版包含应用壳、认证与 RBAC、设备和任务列表、PGM P2/P5 解析、ROS YAML 子集解析、坐标转换、PCD 基础预览、Three.js 资源释放和 Agent 工程规范。PCD Worker/LOD、URDF 关节模型、地图路网交互编辑、真实 WebSocket 与后端 API 仍在路线图中。

## 许可证

尚未指定许可证。发布前请根据实际使用场景补充 LICENSE 文件。
