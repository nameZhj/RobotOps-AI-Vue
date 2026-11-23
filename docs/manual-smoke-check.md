# Manual Smoke Checklist

本项目不保留单元测试文件或测试框架。发布前按以下清单人工检查，不需要新增测试 fixture。

## 1. 普通业务页面

- [ ] 检查 1920×1080、1366×768、1024×768、768×1024、390×844 和 320×640。
- [ ] 检查 200% 浏览器缩放和不同 devicePixelRatio。
- [ ] 页面本身没有横向溢出；表格和导航只在各自容器内滚动。
- [ ] 长设备 ID、任务名称、路径和时间戳不会撑宽卡片。
- [ ] 浏览器窗口尺寸变化后，Three.js 画布和 ResizeObserver 尺寸正常。

## 2. 可视化大屏（/command-center）

- [ ] 1920×1080 下画布完整显示，四周无多余滚动条。
- [ ] 1366×768、2560×1080、3440×1440 和 3840×2160 下，大屏整体等比例缩放。
- [ ] 4:3、16:10、21:9 和竖屏窗口下，画布保持 16:9 并居中，空余区域留白。
- [ ] 缩放时文字、按钮、卡片、图表和地图使用同一缩放比例，不出现单独拉伸。
- [ ] 整个大屏没有垂直或水平滚动条；所有面板内部也没有滚动条。
- [ ] 窗口拖动、浏览器缩放和显示器切换后，ResizeObserver 重新计算比例。
- [ ] 离开大屏路由后，html/body 上的大屏模式 class 被移除，普通页面滚动恢复。
- [ ] 页面内的设备状态和指标明确显示为演示数据。

## 3. 颜色和控件

- [ ] 普通文字与背景对比度至少 4.5:1，大字号至少 3:1。
- [ ] 按钮的默认、hover、active、focus、loading 和 disabled 状态都清晰可读。
- [ ] 导航选中、表格选中、下拉选中、checkbox、radio 和 tab 状态清晰可读。
- [ ] 按钮文字水平和垂直居中，padding 足够，控件不会被挤压。
- [ ] reduced-motion 设置不会影响必要的状态反馈。

## 4. 登录与 HTTP

- [ ] Mock 登录只在本地开发模式启用。
- [ ] access token 只保存在内存中；refresh token 使用 HttpOnly Cookie。
- [ ] 多个 401 并发时只发起一次 refresh。
- [ ] GET 可在 refresh 后重试；写请求只有带 Idempotency-Key 时才重试。
- [ ] 超时、取消、网络错误、JSON 错误和 204 响应均有正确处理。
- [ ] 文件上传、下载经过统一 HTTP 层；浏览器存储和日志中没有凭证。

## 5. 地图与点云

- [ ] PGM 必须配对 ROS YAML 后才显示；分辨率和原点来自 YAML。
- [ ] 重新选择 PGM 后清除旧 YAML；YAML 中 image 文件名不匹配时阻止显示。
- [ ] PGM P2/P5、非法文件头和不匹配的像素数能够正确处理。
- [ ] PCD 超过大小限制或浏览器不支持 WebGL 时显示错误信息。
- [ ] 离开地图页面后，Three.js texture、geometry、material、renderer 和 ResizeObserver 正确释放。

## 6. MQTT

- [ ] ticket API 要求登录，并签发短时 WSS ticket。
- [ ] Broker ACL 限制用户可访问的 tenant/site/device Topic。
- [ ] 前端环境变量、URL、storage 和日志中不存在静态 Broker 凭证。
- [ ] 网络断开后按退避策略重连，并重新获取 ticket 和恢复订阅。
- [ ] ticket 失效或 ACL 拒绝时停止自动重试，等待重新授权。
- [ ] unsubscribe disposer 能移除订阅，disconnect 能清理重连计时器。
- [ ] 控制命令经过后端 API，不直接由大屏或普通页面发布到 MQTT。

## 7. 构建检查

执行以下命令：

- npm run typecheck
- npm run build

记录浏览器版本、窗口分辨率和检查结果。没有实际运行构建时，不得标记为通过。
