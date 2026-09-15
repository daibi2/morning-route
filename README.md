# morning-route

晨间习惯追踪：注册/登录、自定义习惯、每日打卡、连续天数、基础可视化。

## 一键启动

```bash
cp .env.example .env   # 首次
npm install
npm run dev
```

- Web：http://localhost:5173
- API：http://localhost:3001
- 健康检查：http://localhost:3001/api/health

`npm run dev` 会先执行 `prisma migrate deploy`，再并行启动 API（tsx watch）与 Vite。前端把 `/api` 代理到 `127.0.0.1:3001`。

## 脚本

| 命令               | 说明                    |
| ------------------ | ----------------------- |
| `npm run dev`      | 迁移 + 前后端并行开发   |
| `npm run lint`     | ESLint + Prettier check |
| `npm test`         | 各 workspace Vitest     |
| `npm run test:e2e` | Playwright（后续模块）  |

数据库为 SQLite（`prisma/dev.db`），不依赖 Docker。Schema 变更只走 Prisma migrate。
