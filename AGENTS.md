# Agent Engineering Contract

## 0. 起步路径

1. 读取本文件。
2. 读取 .agent/INDEX.md，按任务找到对应模块。
3. 阅读目标模块 README 和相关 docs/contracts 文档。
4. 只打开索引指向的文件。不要无目的地扫描整个仓库、依赖目录或构建产物。

## 1. 项目边界

- 本项目是 Vue 3 机器人管理 Web 前端，不负责机器人实时控制闭环、安全急停或底盘运动学。
- 页面不得直接连接 SSH、ROS 设备端口或 MQTT Broker；设备协议通过 src/platform/ 和后端 Gateway 接入。
- 不猜测设备协议、Topic、坐标系、状态码或 API 字段。未知信息先登记为待确认契约。
- 修改接口契约时，必须同步更新调用方和对应文档。

## 2. Agent 友好的代码约束

- TypeScript strict；禁止 any。外部数据先按 unknown 接收，再做结构校验。
- 一个文件只承担一个主要职责。目标 150 行以内，硬上限 250 行；超过后按职责拆分。
- Vue 页面负责页面结构和交互；业务规则放在模块内部；网络请求放在共享网络层或模块 API。
- 页面禁止直接调用 fetch。HTTP 使用 src/shared/api/http.ts，文件传输使用 src/shared/api/http-files.ts。
- MQTT 使用 src/shared/mqtt/client.ts，不得在业务页面直接创建 MQTT.js 客户端。
- 模块之间通过公开的 DTO、API 或 service 契约协作，不得直接依赖其他模块的内部实现。
- 不创建没有实际用途的 BaseService、Manager、注册中心或事件总线。
- 大型 PCD、日志全文和高频遥测不得长期放在 Pinia 中；使用分页、分块、Worker 和时间窗口。
- 本仓库不新增单元测试文件、fixture 或测试框架。使用 typecheck、build 和简短的人工检查清单验证变更。

## 3. 页面布局规范

普通业务页面和可视化大屏是两种不同的显示模式。新增页面或修改布局前，必须先确认页面属于哪一种。

### 3.1 普通业务页面

适用于登录、设备、地图管理、任务、日志和普通运行总览等页面。

- 页面应适配 320px 至超宽桌面屏幕。不得给 html、body 或 #app 设置大于 320px 的全局最小宽度。
- 使用 clamp()、minmax(0, 1fr)、min-width: 0、max-width: 100% 和 Grid/Flex 断点调整布局。
- 允许表格、横向导航、代码或长数据区域在各自容器内滚动；禁止用整个页面的横向滚动来弥补布局问题。
- Flex/Grid 子项必须考虑 min-width: 0。长设备 ID、路径、任务名称和时间戳应换行、截断或在局部滚动区域展示。
- 不得通过压缩文字、按钮或图标来适应空间不足。必要时改变列数、换行或调整卡片排列。
- 页面主要布局避免固定宽高；固定尺寸只用于图标、按钮最小高度和明确的画布边界。
- 全局颜色使用 src/styles/tokens.css。普通文字对比度目标至少 4.5:1，大字号至少 3:1。
- 按钮文字水平、垂直居中；按钮必须具有清晰的 hover、active、focus 和 disabled 状态。
- 检查键盘焦点、200% 浏览器缩放、窄屏溢出和 reduced-motion。

### 3.2 可视化大屏（特殊规则，优先级高于普通页面规则）

只适用于 /command-center 和 src/modules/visualization/ 下的大屏页面。详细实现约定见 docs/visualization-display.md。

- 大屏必须作为独立路由页面显示，不得套用普通业务页面的侧边栏、顶部导航或内容容器。
- 设计基准固定为 1920×1080（16:9）。按 scale = min(viewportWidth / 1920, viewportHeight / 1080) 计算统一缩放比例，宽度和高度必须使用同一个比例。
- 使用 CSS transform 对整个设计画布进行等比例缩放，并始终以视口中心为定位基准。宽高比不一致时允许四周留白，不得拉伸画布填满屏幕。
- 浏览器窗口变化、显示器切换或全屏尺寸变化时，必须通过 ResizeObserver 重新计算比例；组件卸载时必须 disconnect。
- 大屏根节点固定覆盖整个视口：position: fixed; inset: 0; width: 100vw; height: 100dvh; overflow: hidden。
- 大屏模式下 html、body、#app 和大屏视口都必须禁止滚动。禁止出现任何滚动条，包括页面滚动条、面板滚动条和横向滚动条。
- 大屏内部不得使用 overflow: auto、overflow: scroll、虚拟滚动或依赖滚动才能访问的内容。信息必须在 1920×1080 设计画布内完成排布。
- 大屏内容超出设计画布时，应调整画布内的 Grid 行列、间距、字号、信息密度或使用省略号；不得通过增加滚动区域解决。
- 大屏禁止采用普通页面的断点重排方式。不得在窄屏下把三列卡片改为一列；整个画布必须继续按相同比例缩小。
- 不得单独缩放文字、图表、地图或某个面板。只允许缩放最外层设计画布，确保所有元素比例一致。
- 大屏画布和其中的组件不得因窗口变化而改变宽高比例；所有固定设计尺寸均以 1920×1080 画布坐标为准。
- Mock 数据必须明确标记。不得把演示值显示成真实在线状态或实时控制状态。

## 4. 颜色、控件和可读性

- 全局颜色集中在 src/styles/tokens.css，控件状态集中在 src/styles/controls.css。
- 普通文字与背景目标对比度至少 4.5:1，大字号至少 3:1。重要状态不能只靠颜色区分，必须带文字或图标。
- 按钮文本始终水平和垂直居中，使用稳定的 padding 和最小高度；不得让文字贴边或被 flex 压缩。
- 输入框、下拉选项、表格行、选中项、禁用项和焦点状态都必须保持可读。
- 大屏可使用独立配色，但同样必须保证文字和状态的可读性。大屏样式不得依赖普通后台页面的 Element Plus 主题覆盖。

## 5. 机器人安全规则

- 本前端不是安全控制器。运动指令必须由后端检查用户权限、设备状态、控制权和安全条件。
- 运动、急停复位、任务强制终止、地图覆盖等高风险操作必须二次确认并记录审计理由。
- 设备失联、数据过期或控制权未知时，界面必须显示失联或未知状态，不能继续展示过期数据并标记为在线。
- 实时消息应包含 deviceId、timestamp、sequence 等字段，以便识别过期、重复和乱序数据。

## 6. 身份与凭证

- 用户身份由平台 Auth API 管理；设备 SSH 凭证和设备 License 不属于用户 Session。
- access token 仅保存在内存中；refresh token 由后端通过 HttpOnly Cookie 保存。
- 禁止记录 Authorization、Cookie、密码、SSH 私钥、MQTT 密钥或 License 原文。
- MQTT 凭证必须由后端签发短时、按设备和 Topic 授权的 WSS ticket；浏览器不得保存长期 Broker 密码。
- 前端权限判断只控制界面，后端必须对每个 API 再次执行权限检查。
- Mock Auth 只用于本地开发，生产环境必须拒绝 Mock 模式。

## 7. 网络层约束

- HTTP 使用统一超时、取消、错误结构和 requestId；401 使用 single-flight refresh。
- 只有 GET/HEAD/OPTIONS 或带 Idempotency-Key 的写请求才允许在 refresh 后自动重放。
- MQTT 使用 WSS、短时 ticket、keepalive、QoS 0/1、指数退避与 jitter、订阅恢复和 disposer。
- 任务创建、运动控制等非幂等操作不得盲目重试。控制命令必须由后端验证并记录审计。
- 所有连接、订阅、ResizeObserver、DOM listener 和 Three.js 资源都必须有对应清理逻辑。

## 8. 完成标准

- 变更范围明确，命名和模块契约一致。
- 新增或移动文件后更新 .agent/INDEX.md 和 .agent/SOURCE_INDEX.md。
- 更新对应模块 README 和接口契约，不在多个文档重复维护同一份详细说明。
- 执行 npm run typecheck 和 npm run build；未实际执行时不得声称通过。
- 按 docs/manual-smoke-check.md 做人工检查。不得为了满足规范而新增测试目录。
- 普通页面检查响应式布局和局部滚动；大屏检查无滚动条、等比例缩放、居中和画布内容完整。

## 9. 禁止事项

- 禁止把全部业务放进 App.vue、巨型 Pinia Store 或单个 utils.ts。
- 禁止为了“通用”而创建没有实际需求的抽象层。
- 禁止把模拟设备状态当作真实设备状态。
- 禁止在前端存储或暴露 SSH、MQTT、数据库或 License 签名私钥。
- 禁止在生产环境使用 Mock 身份、非 TLS MQTT 或没有 ACL 的公共 Topic。
