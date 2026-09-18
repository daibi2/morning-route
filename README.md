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

- 打卡与统计的日期一律取客户端本地日期 `YYYY-MM-DD`（`packages/shared/src/dates.ts` 的 `todayLocalDate()`），不要在浏览器里用 `toISOString()` 截取，否则跨时区会整体偏移一天。
- 未登录访问 `/` `/habits` `/stats` 会被 `ProtectedRoute` 重定向到 `/login`，已登录访问 `/login` `/register` 由 `GuestRoute` 重定向回 `/`；鉴权未完成时先渲染「加载中…」，不要提前展示页面内容。
- 登录态走 JWT httpOnly Cookie：前端请求统一经 `apiRequest`（`apps/web/src/api/client.ts`）走同源 `/api` 代理并携带 `credentials: 'include'`，前端既不读取也不存储 token，禁止把 token 放进 localStorage。
- 接口错误统一由服务端返回 `ErrorCode` + `message`，前端抛 `ApiClientError` 后就地渲染红字文案（读取类兜底「加载失败」，表单类为「登录失败」/「注册失败」），不使用 `alert` / `confirm` 打断流程。
- 打卡 / 新增 / 归档 / 删除等写操作成功后必须重新拉取数据（`reload()` / `toggle()`），保证今日打卡状态、连续天数与近 7 日统计口径一致。
- 交互控件需带可访问名称（可见文案或 `aria-label`，如 `aria-label={\`打卡 ${row.title}\`}`、`aria-label="新习惯名称"`），便于 Playwright E2E 定位与无障碍访问。
