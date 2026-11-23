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

## 发布到 GitHub

本项目使用独立仓库 `nameZhj/RobotOps-AI-Vue`，不依赖或修改其他旧仓库。需要本机已安装 Git、GitHub CLI（`gh`）并完成 `gh auth login`。

```powershell
# Windows PowerShell
.\scripts\publish-to-github.ps1 -Visibility public
```

```bash
# macOS / Linux
bash scripts/publish-to-github.sh
```

如果仓库已经存在，脚本会设置 `origin` 并推送到 `main`；如果不存在，则先创建再推送。

## 常用命令

```bash
npm run dev          # 本地开发
npm run typecheck    # TypeScript 检查
npm run build        # 生产构建
npm run ai:index     # 重建 Agent 模块索引
npm test             # 单元测试
```

## 目录导航

| 路径 | 职责 |
|---|---|
| `src/modules/` | 业务垂直切片：auth、dashboard、devices、maps、tasks、visualization、logs |
| `src/shared/` | 无业务归属的基础能力：HTTP、权限、实时通道、通用 UI |
| `src/platform/` | 机器人协议、地图渲染、第三方 SDK 适配器 |
| `src/app/` | 应用组装：入口、路由、全局 Provider |
| `docs/contracts/` | 前后端共享 DTO、状态机和协议契约 |
| `.agent/` | Agent 索引、规则和任务工作流 |

## Agent 开发入口

**先读：** `AGENTS.md` → `.agent/INDEX.md` → 对应模块 `README.md` → 目标文件。

新增功能复制 `docs/templates/feature.template.md`，不要先扫描整个仓库。完成后运行 `npm run typecheck && npm run build`，并更新 `.agent/INDEX.md`。

## 功能范围与实现边界

- 登录与轻量 RBAC 权限控制（前端仅负责体验，后端必须再次鉴权）
- 设备管理：机器人、机械狗、AGV 统一设备模型
- 地图管理：配套 PGM + ROS YAML 元数据、PCD 点云基础预览、坐标转换、路网节点和边契约
- 任务管理：任务列表和状态查看；调度命令 API 待接入
- 可视化大屏：当前提供 UI 框架与演示数据，真实指标需接入聚合 API
- 日志管理：当前提供查询 UI 示例，后续接入分页 API 与导出

首版包含应用壳、认证与 RBAC、设备和任务列表、PGM P2/P5 解析、ROS YAML 子集解析、坐标转换、PCD 基础预览、Three.js 资源释放和 Agent 工程规范。PCD Worker/LOD、URDF 关节模型、地图路网交互编辑、真实 WebSocket 与后端 API 仍在路线图中。

## 重要安全说明

- `localStorage` / `sessionStorage` 不保存 access token、refresh token、SSH 密码、MQTT 密码或 License 私钥。
- access token 默认只放内存；refresh token 应由后端以 `HttpOnly; Secure; SameSite` Cookie 管理。
- 机器人 SSH 凭证必须由后端保管并加密，浏览器只提交到受保护的凭证登记接口，不可回显。
- MQTT 真实接入优先由后端网关转发；禁止在前端写入共享 Broker 用户名/密码。
- 前端路由权限不是安全边界，所有 API 都必须由服务端进行 RBAC / ABAC 校验。
- License 必须由后端做真实数字签名验签，不能只比较机器码。
- Mock 登录绝不能部署到生产环境。

## 仓库状态

当前为独立前端初始框架，不包含真实机器人后端或运动控制闭环。所有演示指标均不代表真实设备状态。后续实现顺序见 `docs/roadmap.md`。
