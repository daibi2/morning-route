# morning-route

晨间习惯追踪 Web 应用：注册/登录、自定义习惯、每日打卡、连续天数、近 7 日可视化。

技术栈：React 18 + Vite + Tailwind、Express + TypeScript、Prisma + SQLite、JWT httpOnly Cookie、Vitest + Playwright、Recharts。

## 项目结构

npm workspaces 单仓多包，前端、后端、共享代码与数据库资产分开存放：

```
morning-route/
├── apps/
│   ├── web/                      # 前端：Vite + React 18 + Tailwind
│   │   ├── src/
│   │   │   ├── api/              # 后端接口封装（client.ts + 各领域请求）
│   │   │   ├── auth/             # AuthContext 登录态 + ProtectedRoute 路由守卫
│   │   │   ├── layout/           # AppLayout 应用外壳与导航
│   │   │   ├── pages/            # Login / Register / Home / Habits / Stats 页面
│   │   │   ├── main.tsx          # 应用入口（挂载 #root）
│   │   │   ├── App.tsx           # 路由表
│   │   │   └── test/             # Vitest 测试环境初始化
│   │   ├── e2e/                  # Playwright：auth.spec.ts、full-flow.spec.ts
│   │   ├── index.html
│   │   └── vite.config.ts        # dev server 与 /api → 127.0.0.1:3001 代理
│   └── api/                      # 后端：Express + TypeScript + Prisma
│       └── src/
│           ├── auth/             # 注册、登录、用户序列化
│           ├── habits/           # 习惯增删归档（service + router）
│           ├── checkins/         # 每日打卡：幂等写入与取消
│           ├── stats/            # 近 7 日统计聚合
│           ├── middleware/       # requireAuth、统一错误处理
│           ├── lib/              # Prisma 客户端、JWT、asyncHandler、httpError
│           ├── seed/             # 演示数据常量
│           ├── test/             # 测试用 app 工厂
│           ├── types/            # Express 类型扩展（express.d.ts）
│           └── config.ts · app.ts · index.ts   # 配置、应用组装与启动入口
├── packages/
│   └── shared/                   # 前后端共享：DTO 类型、错误码、日期与连续天数
│       └── src/                  # index.ts（barrel）、types.ts、errors.ts、dates.ts、streak.ts
├── prisma/
│   ├── schema.prisma             # User / Habit / CheckIn 数据模型
│   ├── migrations/               # 迁移 SQL（仅由 prisma migrate 生成）
│   └── seed.ts                   # 演示账号与习惯写入脚本
├── .github/workflows/ci.yml      # CI：lint + Vitest + Playwright E2E
├── PROJECT_CONTEXT.md            # 架构、领域模型与硬性约束
├── PROGRESS.md                   # 分阶段进度记录
└── package.json                  # 根脚本：dev / lint / format / test / test:e2e / db:*
```

约定：新增源文件与测试同目录配对（`foo.ts` ↔ `foo.test.ts`，组件同理 `Foo.tsx` ↔ `Foo.test.tsx`）；可复用的跨端类型与工具优先放 `packages/shared`；数据库结构变更只走 `prisma migrate`。

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
