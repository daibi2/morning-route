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

## 迭代注意事项，这个非常重要！

- 只改与本次需求相关的文件，不要顺带重构无关代码，保证改动范围可审。
- 数据库结构变更只走 `prisma migrate`（禁止手工改 `prisma/dev.db`）：改 schema 用 `npm run db:migrate:dev` 生成迁移，提交前用 `npm run db:migrate` 应用并校验。
- 提交前本地必须全绿：`npm run lint`、`npm test`、`npm run test:e2e`。
- 前后端契约变更需同时改 `packages/shared`（共享类型/DTO 的单一来源）与 `apps/api`、`apps/web`，保持请求/响应类型一致。
- 修复分支命名遵循 `fix-<issue_uid>-<slug>-<日期>-<seq>`，提交信息写清 Trace 段（需求 → 改动 → 验证）。
