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

## git使用注意事项

- 本仓库按模块叠放（stacked）开发：一个模块一个分支、一个 PR，PR 的 base 指向上一模块分支，需按分支顺序依次合并（禁止把多个模块混进同一个 PR）。
- 分支名沿用 agent 分支前缀 `cursor/<模块描述>-<短后缀>`（如 `cursor/habits-crud-acae`），禁止直接在 `main` 上提交。
- 提交信息一句话说明改了什么（如 `Add habits CRUD API and management page.`），一次提交只做一件事。
- 提交前先跑 `npm run lint` 与 `npm test`，本地全绿再提交；新增代码必须附带同目录测试（`foo.ts` → `foo.test.ts`）。
- Schema 变更只能改 `prisma/schema.prisma` 并由 `prisma migrate` 生成迁移文件，`.sql` 迁移必须随代码一起提交，禁止手改数据库文件。
- 不要提交 `.env`、`prisma/dev.db`（已由 `*.db` 忽略）、`node_modules/` 等本地文件；密钥只放 `.env`（模板见 `.env.example`），严禁写进代码或 README。
- 合并前先 `git fetch` 同步当前 PR 的 base 分支并解决冲突；叠放分支只在自身分支上追加提交，禁止改写已推送历史（`git push --force`）。
