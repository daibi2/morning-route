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

- 接口请求统一走同源 `/api` 代理：开发环境下 `apps/web/vite.config.ts` 把 `/api` 代理到 API（默认 `127.0.0.1:3001`，为硬编码值，需与 `PORT` 保持一致）。由 `apps/web/src/api/client.ts` 的 `apiRequest` 统一封装并携带 `credentials: 'include'`；JWT 由服务端（`apps/api/src/auth/authRouter.ts`）写入 httpOnly Cookie，前端不读取、不存储 token。
- 错误处理：HTTP 错误响应体匹配 `{ error: { code, message } }` 信封时抛 `ApiClientError`（携带 `code` / `message`），否则抛兜底的 `ApiClientError('INTERNAL_ERROR', '请求失败')`；`204` 无响应体时返回 `undefined`。注意网络异常与非 JSON 响应体不会被包装（分别为 `TypeError` / `SyntaxError`），调用方需自行兜底。新增 UI 交互请沿用该封装，不要绕过它直接 `fetch`。
- 鉴权跳转由路由守卫负责（`apps/web/src/auth/ProtectedRoute.tsx`）：`ProtectedRoute` 未登录跳 `/login`，`GuestRoute` 已登录跳 `/`，鉴权 `loading` 期间先渲染「加载中…」。`AuthProvider` 启动时调用 `fetchMe()`：只有成功才写入用户，`UNAUTHORIZED` 与其他错误都不写入（其他错误目前被静默吞掉、不作区分），最终表现为未登录；用户显式 `logout()` 也会清空，但登出请求失败时不会清空本地态。
- 打卡与统计的日期一律取客户端本地 `YYYY-MM-DD`（`packages/shared/src/dates.ts` 的 `todayLocalDate`），不要用 `toISOString()` 截取，避免时区导致日期偏移。
- 写操作（打卡 / 新增 / 归档 / 删除）成功后必须重新拉取数据，保证今日状态、连续天数与统计口径一致。
- 交互控件需带可访问名称（`aria-label` 或可见文案），便于端到端测试（`apps/web/e2e/`）与无障碍访问。
