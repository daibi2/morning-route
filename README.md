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

## 发布注意事项

1. **发布前体检**：确认环境变量已按目标环境配置（`DATABASE_URL`、`JWT_SECRET`、`PORT`、`WEB_ORIGIN`、`NODE_ENV`），生产环境请替换 `.env.example` 中的默认 `JWT_SECRET`；`.env` 不入库。
2. **依赖与检查**：`npm install` 后依次执行 `npm run lint`、`npm test`（必要时 `npm run test:e2e`），全部通过后再发布。
3. **数据库迁移**：发布前先执行 `npm run db:migrate`（`prisma migrate deploy`）并确认迁移成功；禁止跳过迁移直接启动服务。当前迁移目录为 `prisma/migrations`，数据库为 SQLite。
4. **发布顺序**：先迁移数据库 → 再发布 API → 最后发布 Web，避免前端调用到未就绪的接口。
5. **发布后验证**：访问 `GET /api/health` 应返回 200；打开 Web 首页确认注册/登录、打卡与统计页面正常。
6. **回滚**：应用回滚到上一个已验证版本；数据库如需回滚，按 `prisma/migrations` 的逆序人工编写并执行回退脚本，禁止直接删除或重建数据表。
7. **密钥与配置**：生产密钥通过部署平台注入，禁止写入仓库或前端构建产物。
