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

- 接口统一走同源 `/api` 代理，`apiRequest` 固定 `credentials: 'include'`（`apps/web/src/api/client.ts`）；JWT 由服务端写入 httpOnly Cookie（`apps/api/src/auth/authRouter.ts`），前端不读取、不存储 token。
- 接口失败统一抛 `ApiClientError`（携带 `code` / `message`），页面就地渲染红字提示（`text-red-700`），不使用 `alert` / `confirm` 打断流程；非 `ApiClientError`（网络异常、响应体解析失败等）兜底文案为「加载失败」。
- 只有初始鉴权会自动跳转：`AuthProvider` 启动时调用 `fetchMe()`，返回 `UNAUTHORIZED` 时清空登录态；`ProtectedRoute` / `GuestRoute` 在鉴权 `loading` 结束后按 `user` 重定向到 `/login` 或 `/`，鉴权未完成时先渲染「加载中…」。
- 已登录后的页面内请求（习惯列表、统计）遇到 401 只展示错误文案，不自动跳登录页；各页面分别维护 `error` 状态。
- 首屏加载占位由各页面自持状态控制：`ProtectedRoute` / `GuestRoute` 用鉴权 `loading`，`HomePage` / `HabitsPage` 用初值为 `true` 的 `loading`，`StatsPage` 在 `overview === null` 时显示「加载中…」。
- 打卡 / 新增 / 归档 / 删除成功后必须 `reload()` 重新拉取数据，保证今日状态、连续天数与统计口径一致；`reload()` 不会重置 `loading`，需避免出现无反馈的空白页面。
- 打卡日期一律取客户端本地 `YYYY-MM-DD`（`todayLocalDate()`，见 `packages/shared/src/dates.ts`），不得用 `toISOString()` 截取，避免时区导致日期偏移。
- 写操作目前只有登录 / 注册表单带 `disabled={submitting}`；打卡勾选框与「归档」「删除」按钮未做进行中禁用，且 `HomePage.toggle()`、习惯归档与删除路径未挂 `catch`，异常时既不提示也不回滚，连点或网络异常可能造成重复提交，新增交互建议同步补上。
- 交互控件需带可访问名称（`aria-label` 或可见文案，如 `打卡 ${row.title}`、「新习惯名称」），便于端到端测试与无障碍访问。
- 本节对应工单 `3f1867807f3a47d68cc7fc272eb842b7`（zilun3-test / morning-route），用于 UI 交互改动自查。
