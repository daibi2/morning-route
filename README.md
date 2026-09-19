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

迭代前请务必确认以下事项：

- 提交流程：先同步最新 `main` 并按需 `npm install`；提交前在本机跑通 `npm run lint` 与 `npm test`，涉及页面或交互改动时再跑 `npm run test:e2e`。CI 的 `lint-and-test` 与 `e2e` 两个 job 会在每个 PR 上无条件执行。
- 数据库：结构变更只走 Prisma 迁移——本地用 `npm run db:migrate:dev` 生成迁移文件，部署用 `npm run db:migrate`，并把 `prisma/migrations/` 下的迁移文件随代码一起提交；不要绕过迁移直接改本地库文件（`prisma/dev.db` 为本地生成，已被 `.gitignore` 忽略）。
- 接口契约：新增或修改接口时同步更新 `packages/shared` 中的 DTO 类型与 `ERROR_CODES` 错误码，保持前后端一致。
- 分支规范：不要在 `main` 上直接提交；开发与修复分支沿用 `fix-<issue>-<slug>-<日期>-<seq>` 命名。
- 评审与发布：改动需本地自测通过后再提交评审，禁止跳过评审直接进入测试与发布环节。

**迭代注意事项，这个非常重要！** 请务必逐条确认后再开始迭代。
