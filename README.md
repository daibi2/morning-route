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

## 项目结构

npm workspaces 单仓多包（monorepo）：`apps/*` 是可运行应用，`packages/*` 是被复用的共享库，`prisma/` 的 schema 与迁移由根脚本驱动（`apps/api` 通过生成的 Prisma Client 访问数据）。

```text
morning-route/
├── apps/
│   ├── web/                     # 前端应用：React 18 + Vite + Tailwind
│   │   ├── e2e/                 # Playwright 端到端用例（auth.spec.ts、full-flow.spec.ts）
│   │   ├── src/
│   │   │   ├── api/             # 后端接口客户端：client.ts + auth/habits/checkins/stats 资源封装
│   │   │   ├── auth/            # AuthContext、ProtectedRoute：登录态与路由守卫
│   │   │   ├── layout/          # AppLayout 页面骨架
│   │   │   ├── pages/           # LoginPage、RegisterPage、HomePage、HabitsPage、StatsPage
│   │   │   ├── test/            # Vitest 环境初始化（setup.ts）
│   │   │   ├── App.tsx          # 路由表
│   │   │   ├── main.tsx         # 前端入口
│   │   │   └── index.css        # Tailwind 样式入口
│   │   ├── index.html
│   │   ├── package.json         # workspace `web`：dev / build / test / test:e2e 脚本
│   │   ├── playwright.config.ts # E2E 配置：自动拉起 API 与 Web 服务
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts       # 开发服务器 5173，/api 代理到 127.0.0.1:3001
│   │   ├── vitest.config.ts
│   │   ├── tailwind.config.js
│   │   └── postcss.config.js    # Tailwind / autoprefixer 插件接线
│   └── api/                     # 后端应用：Express + TypeScript + Prisma
│       ├── src/
│       │   ├── auth/            # 注册 / 登录 / 登出 / me（router + service + 类型 + 序列化）
│       │   ├── habits/          # 习惯增删改与归档
│       │   ├── checkins/        # 每日打卡与撤销（按 localDate 幂等）
│       │   ├── stats/           # 统计概览（今日完成率、近 7 日）
│       │   ├── middleware/      # requireAuth 鉴权、errorHandler 统一错误响应
│       │   ├── lib/             # jwt、httpError、asyncHandler、prisma 客户端
│       │   ├── seed/            # 演示数据常量
│       │   ├── types/           # Express 类型扩展（express.d.ts）
│       │   ├── test/            # createTestApp 集成测试脚手架（临时 SQLite）
│       │   ├── config.ts        # 环境变量读取与校验
│       │   ├── app.ts           # 应用装配：CORS / JSON / Cookie / 路由挂载
│       │   └── index.ts         # 服务入口，监听 127.0.0.1:3001
│       ├── package.json         # workspace `api`：dev / start / test 脚本
│       ├── tsconfig.json
│       └── vitest.config.ts
├── packages/
│   └── shared/                  # @morning-route/shared：前后端共享（无 Node/DOM 专属 API）
│       ├── src/                 # index.ts 为包入口；dates、streak、errors、types 为具体模块
│       ├── package.json         # main / types 均指向 src/index.ts
│       ├── tsconfig.json
│       └── vitest.config.ts
├── prisma/
│   ├── schema.prisma            # 数据模型：User / Habit / CheckIn
│   ├── seed.ts                  # 演示数据（npm run db:seed）
│   └── migrations/              # 迁移历史，只由 prisma migrate 生成
├── .github/workflows/ci.yml     # CI：lint + 单测 + Playwright E2E
├── package.json                 # workspaces 根：dev / lint / test / test:e2e / db:*
├── tsconfig.base.json           # TypeScript 基础配置，各 workspace 继承
├── eslint.config.js
├── .prettierrc.json             # Prettier 配置（.prettierignore 为忽略清单）
├── .env.example                 # 环境变量样例，首次 cp 为 .env
├── PROJECT_CONTEXT.md           # 项目上下文与架构约束（开发前必读）
├── PROGRESS.md                  # 波次与 PR 进度记录
└── README.md
```

约定：

- 源码与测试同目录同名：`foo.ts` 对应 `foo.test.ts`，组件 `Foo.tsx` 对应 `Foo.test.tsx`（配置文件、纯类型与测试脚手架除外）。
- 后端每个业务模块独占一个目录（`auth/`、`habits/`、`checkins/`、`stats/`），统一含 router 与 service；其中 `auth` / `habits` / `checkins` 另有类型与序列化器文件，`stats` 的 DTO 内联在 service 中。
- 数据库结构变更只走 `prisma migrate`，不手工修改 SQLite 文件。

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
