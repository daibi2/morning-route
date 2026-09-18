# morning-route

晨间习惯追踪 Web 应用：注册/登录、自定义习惯、每日打卡、连续天数、近 7 日可视化。

技术栈：React 18 + Vite + Tailwind、Express + TypeScript、Prisma + SQLite、JWT httpOnly Cookie、Vitest + Playwright、Recharts。

## 一键启动

```bash
cp .env.example .env   # 首次，已有 .env 可跳过
npm install
npm run dev
```

然后打开：

| 服务     | 地址                             |
| -------- | -------------------------------- |
| Web      | http://localhost:5173            |
| API      | http://127.0.0.1:3001            |
| 健康检查 | http://127.0.0.1:3001/api/health |

`npm run dev` 会先 `prisma migrate deploy`，再并行启动 API（`tsx watch`）与 Vite。前端把 `/api` 代理到 `127.0.0.1:3001`。Cookie 走同源代理，无需在浏览器里读 token。

可选演示账号：

```bash
npm run db:seed
```

登录 `demo@morning.route` / `password1`。

## 脚本

| 命令                 | 说明                            |
| -------------------- | ------------------------------- |
| `npm run dev`        | 迁移 + 前后端并行开发           |
| `npm run lint`       | ESLint + Prettier check         |
| `npm test`           | 各 workspace Vitest             |
| `npm run test:e2e`   | Playwright（认证闭环 + 全流程） |
| `npm run db:migrate` | 应用 Prisma migrations          |
| `npm run db:seed`    | 写入演示用户与习惯              |

数据库为 SQLite（`prisma/dev.db`），不依赖 Docker。Schema 变更只走 `prisma migrate`。

## 页面

- `/register` `/login` — 注册并自动登录
- `/` — 今日打卡与连续天数（客户端传入本地 `YYYY-MM-DD`）
- `/habits` — 习惯增删归档
- `/stats` — 今日完成率与近 7 日柱状图

## UI交互注意事项999

- 所有前端请求统一经 `apiRequest()`（`apps/web/src/api/client.ts`）发出，固定 `credentials: 'include'`，并借同源 `/api` 代理携带 httpOnly Cookie 中的 JWT；前端不读取、不存储 token。
- 服务端返回的 JSON 错误体统一抛 `ApiClientError`（携带 `code` / `message`；`apps/api/src/middleware/errorHandler.ts` 保证 API 自身错误响应均为 JSON）；非 JSON 响应体（代理错误页 / 未匹配路由）会在 `res.json()` 处先抛 `SyntaxError`，需由页面兜底。各页面就地渲染红字提示（`text-red-700`），不使用 `alert` / `confirm` 打断流程；读取类请求非 `ApiClientError` 时兜底为「加载失败」，表单类兜底为「登录失败」/「注册失败」/「创建失败」。
- 初始鉴权闸门失败（含网络异常 / 5xx，不只是 401）都会在 `loading` 结束后落到 `/login`：`AuthProvider` 启动时调用 `fetchMe()`，仅 `UNAUTHORIZED` 分支在 `catch` 中被显式处理清空登录态，而 `user` 初值本就是 `null`，故其余失败同样保持未登录，且**当前不展示任何错误文案**；`ProtectedRoute` / `GuestRoute` 在 `loading` 结束后按 `user` 重定向（`/login` ↔ `/`），鉴权未完成时先渲染「加载中…」。已登录后的页面内请求（习惯列表、统计）拿到 401 只展示错误文案，不自动跳转。
- 首屏占位由各页面自持状态控制：`ProtectedRoute` / `GuestRoute` 用鉴权 `loading`；`HomePage` / `HabitsPage` 用 `loading`（初值 `true`，`finally` 置 `false`）；`StatsPage` 用 `overview === null`（请求失败时占位与错误文案会同时出现）。
- 打卡 / 新增 / 归档 / 删除等写操作成功后必须重新拉取数据（`reload()` / `toggle()`），保证今日状态、连续天数与统计口径一致；`reload()` 不重置 `loading`，刷新期间仍展示旧数据且无加载指示，用户可能误以为操作未生效。
- 打卡日期一律取客户端本地 `YYYY-MM-DD`（`todayLocalDate()`，见 `packages/shared/src/dates.ts`），不得用 `toISOString()` 截取，避免时区导致日期偏移。
- 写操作普遍缺少进行中与失败反馈：目前仅登录 / 注册表单带 `disabled={submitting}`；打卡勾选框与「归档」「删除」按钮未做进行中禁用；打卡、归档、删除、登出四条写路径均未挂 `catch`（异常时既不提示也不回滚），连点或网络异常可能造成重复提交 / 无反馈，且登出失败时登录态不会被清除，新增交互建议同步补上。另外 `HabitsPage.onCreate` 把 `reload()` 与创建请求放在同一个 `try` 内，刷新失败会走 `catch`（非 `ApiClientError` 时误报为「创建失败」，`ApiClientError` 时显示其 message），二者都会掩盖「习惯实际已创建成功」这一事实，建议把刷新移出 `try` 或单独捕获。
- 交互控件需带可访问名称（`aria-label` 或可见文案），如打卡勾选框的 `aria-label`（形如「打卡 <习惯名>」），便于端到端测试与无障碍访问。
- 本节内容对应工单 1b066e96d4d544bd884172ff397a81d7（项目 zilun3-test / 仓库 morning-route），UI 交互改动前请据此自查。
