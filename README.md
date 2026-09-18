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

## UI交互注意事项666

- 所有接口请求统一走同源 `/api` 代理并携带 `credentials: 'include'`；JWT 由服务端写入 httpOnly Cookie，前端不读取也不存储 token（见 `apps/web/src/api/client.ts`）。
- 请求失败统一抛出 `ApiClientError`（携带 `code` / `message`），页面就地渲染红字提示（`text-red-700`），不使用 `alert` / `confirm` 打断流程。
- 仅初始鉴权失败会跳登录页：`AuthProvider` 启动时 `fetchMe()` 返回 `UNAUTHORIZED` 会清空登录态，`ProtectedRoute` / `GuestRoute` 分别重定向到 `/login` 与 `/`；已登录后的页面内请求（习惯列表、统计）拿到 401 只展示错误文案，不自动跳转。
- 首屏加载期间展示「加载中…」占位：`ProtectedRoute` / `GuestRoute` 由鉴权 `loading` 控制，`HomePage` / `HabitsPage` 由 `loading` 初值 `true` 控制，`StatsPage` 由 `overview === null` 控制；写操作触发的 `reload()` 不重置该占位，需避免出现无反馈的空白页面。
- 打卡 / 添加 / 归档 / 删除等写操作成功后必须调用 `reload()` 重新拉取数据，保证今日状态、连续天数与统计一致。
- 打卡日期一律使用客户端本地 `YYYY-MM-DD`（`todayLocalDate()`），禁止用 `toISOString()` 截取，避免时区导致日期偏移。
- 交互控件需带可访问名称（`aria-label` 或可见文案），便于端到端测试与无障碍访问。
- 本节内容对应工单 84c91157c8ae486da1aad66701454a1e（项目 zilun2-test / 仓库 morning-route），UI 交互改动前请据此自查。
