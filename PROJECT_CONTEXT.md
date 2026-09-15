# MORNING-ROUTINE 项目上下文

后续子智能体开工前必须通读本文，并遵守「硬性约束」与「架构约束」。技术栈不可更改。决策表已锁定。用户已要求一次做完全部编码，**认证模块完成后不要暂停等人审，继续波次 2–4**。

## 目标

从零构建全栈晨间习惯追踪 Web 应用。核心：注册/登录、自定义习惯、每日打卡、连续天数、基础可视化。目标用户：希望改善早晨效率的个人。交付：本地一键启动，核心流程可跑通。

仓库现状：`https://github.com/daibi2/morning-route` 几乎为空（仅 README）。无自托管 worker，实现工作走独立云端 agent + 每模块独立 PR。

## 强制技术栈

- 前端：React 18 + TypeScript + Vite + Tailwind CSS
- 后端：Node.js + Express + TypeScript
- ORM：Prisma（规则要求 migration + 生成类型；未列入栈名但必须使用）
- 测试：Vitest（单元/集成）+ Playwright（端到端）
- 质量：ESLint + Prettier；提交前 `npm run lint` 必须通过

## 硬性约束

- 所有新增代码必须附带同目录测试（`foo.ts` → `foo.test.ts`；React 组件同理 `Foo.test.tsx`）。
- 禁止 `any`；Prisma 生成类型必须显式使用（`Prisma.User`、`Prisma.HabitGetPayload` 等）。
- API 遵循 REST；错误响应统一 `{ error: { code: string, message: string } }`。
- 每个功能模块一个独立 PR；PR 描述必须列出该模块文件清单。
- 前端仅函数式组件 + Hooks，禁止 class 组件。
- Schema 变更只允许 Prisma migration，禁止手改数据库文件。
- 同类错误出现两次：不要只在对话里纠正，把规则补进本文「运行时规则」节。

## 架构（已锁定）

### 仓库结构（npm workspaces）

```
apps/web          # Vite + React 18
apps/api          # Express + Prisma
packages/shared   # 错误码、DTO 类型、日期工具（前后端共享，无 Node/DOM 专属 API）
prisma/           # schema + migrations（由 apps/api 调用）
.github/workflows/ci.yml
```

根脚本：`npm run dev`（前后端并行）、`npm run lint`、`npm run test`、`npm run test:e2e`。

### 数据存储

默认 **SQLite**（`file:./dev.db`），服务一键启动不依赖 Docker。Prisma 仍走 migration。

### 认证

默认 **JWT 写入 httpOnly + Secure(生产) + SameSite=Lax Cookie**。密码 bcrypt。不把 token 交给 JS。CORS 仅允许 web origin，cookie `credentials: include`。

### 领域模型

- `User`: id, email (unique), passwordHash, createdAt, updatedAt
- `Habit`: id, userId, title, archivedAt (nullable), sortOrder, createdAt, updatedAt
- `CheckIn`: id, habitId, userId, localDate (`YYYY-MM-DD`), createdAt；`@@unique([habitId, localDate])`

连续天数：**现算不存**。定义：以「今天」（客户端传入的 `localDate`，服务端校验格式）为锚，该习惯向前连续有打卡的日历天数；若今天未打卡，则从昨天起算历史连续（当天 streak 为 0 或显示昨日 streak 由产品约定，默认：**今天未打卡则 currentStreak 从昨天往回数，todayCheckedIn 单独返回**）。

「晨间」不强制时间窗：任何时刻可为「今天」打卡；日期以用户本地日历日为准（客户端传 `localDate`，服务端不擅自用 UTC 日切）。

### API 草案

前缀 `/api`。

| 方法   | 路径                                   | 说明                           |
| ------ | -------------------------------------- | ------------------------------ |
| POST   | `/api/auth/register`                   | 注册并登录                     |
| POST   | `/api/auth/login`                      | 登录                           |
| POST   | `/api/auth/logout`                     | 清 cookie                      |
| GET    | `/api/auth/me`                         | 当前用户                       |
| GET    | `/api/habits`                          | 当前用户习惯（默认不含已归档） |
| POST   | `/api/habits`                          | 创建                           |
| PATCH  | `/api/habits/:id`                      | 改标题/排序/归档               |
| DELETE | `/api/habits/:id`                      | 删除（级联打卡）               |
| PUT    | `/api/habits/:id/check-ins/:localDate` | 打卡（幂等）                   |
| DELETE | `/api/habits/:id/check-ins/:localDate` | 撤销打卡                       |
| GET    | `/api/habits/:id/stats`                | streak + 近期日历              |
| GET    | `/api/stats/overview`                  | 今日完成率、各习惯 streak      |

错误码（`packages/shared`）：`VALIDATION_ERROR`、`UNAUTHORIZED`、`CONFLICT`、`NOT_FOUND`、`INTERNAL_ERROR`。

### 前端

- 路由：`/login`、`/register`、`/`（今日打卡）、`/habits`（清单管理）、`/stats`（可视化）
- 未登录重定向 `/login`
- 中文 UI
- 图表默认 **Recharts**（柱状/折线：近 7 日完成数）

### 测试与 CI

- Vitest：API handler/service、日期/streak 纯函数、关键组件
- Playwright：注册→建习惯→打卡→看见 streak（第一完整模块先覆盖登录闭环）
- GitHub Actions：`lint` + `test`；有 Playwright 的 PR 再跑 e2e

## 为何这样拆

1. 仓库是空的，**脚手架必须串行且独占**，否则 lint/Prisma/workspace 会互相踩。
2. 规则要求「每个功能模块一个 PR」且「第一个完整功能模块（库→页）跑通后暂停」，因此 **认证必须做成垂直切片**，不能先堆一堆无 UI 的 API。
3. 习惯 → 打卡/streak → 可视化 **数据依赖链是真的**，强行并行只会合同冲突或假接口。并行放在「同波互不依赖」的位置：脚手架之后暂无；人工确认后的可视化与 e2e 可并行。
4. 共享类型与错误格式放进脚手架，避免每个模块各写一套错误体。

## 任务拆分与验收

### 波次 0 — 脚手架（1 个 agent，1 个 PR）

**不可并行。** 产出可安装的 monorepo。

验收：

- `npm install` 后 `npm run lint` 通过（可几乎无业务代码）
- `apps/api` 能 `prisma migrate` 到空库（至少 `User` 表，或最小 schema 占位 + 后续模块再迁；**推荐脚手架即含完整三表**，减少后续 migration 往返）
- `npm run dev` 文档写在 README：一条命令起 web+api
- CI workflow 在 PR 上跑 lint + vitest
- 含 ESLint/Prettier、禁止 `any` 的 TS 配置、Vitest 样例测试同目录
- PR 描述含文件清单

### 波次 1 — 认证垂直切片（1 个 agent，1 个 PR）← 人工关卡

依赖波次 0。后端注册/登录 + 前端页 + 受保护空壳首页。

验收：

- 注册、登录、登出、`/me` 集成测试（Vitest + supertest 或等效）
- 前端登录/注册页可提交；成功后进入首页；未登录不可进首页
- Playwright：注册 → 自动进入首页 → 登出 → 无法再进首页
- `npm run lint` 通过
- **协调者本地跑验收后暂停，等用户审查，不派波次 2**

### 波次 2 — 习惯清单（1 个 agent，1 个 PR）

依赖波次 1 + 用户放行。

验收：登录用户可增/改/归档或删习惯；列表仅本人数据；API 与页面均有测试。

### 波次 3 — 每日打卡与连续天数（1 个 agent，1 个 PR）

依赖波次 2。

验收：对某日幂等打卡/撤销；streak 纯函数有单测（含跨月、断签、今天未打卡）；今日页可勾选并显示 streak。

### 波次 4 — 并行（2 个 agent，2 个 PR）

依赖波次 3。互不改同一文件则并行：

- **4a 可视化**：overview API + `/stats` 近 7 日图 + 单测
- **4b 交付打磨**：Playwright 全流程、README 一键启动、种子数据可选

若 4a/4b 文件冲突风险高，则 4b 等 4a 合并后再开。

## 派活策略

| 波次 | Agent 数 | 并行 | 说明              |
| ---- | -------- | ---- | ----------------- |
| 0    | 1        | 否   | 空仓只能单写      |
| 1    | 1        | 否   | 第一垂直切片      |
| 停   | 0        | —    | 用户审查          |
| 2    | 1        | 否   | 依赖认证          |
| 3    | 1        | 否   | 依赖习惯          |
| 4    | 1～2     | 是   | 统计页与 e2e/文档 |

子智能体汇报格式：`产出文件路径 + 运行了什么命令 + 结果摘要`。

子智能体禁止：改技术栈、手改 SQLite、class 组件、跨模块塞进同一个 PR、不写测试。

## 决策表（已锁定）

| ID  | 议题          | 选择                  |
| --- | ------------- | --------------------- |
| D1  | 数据库        | SQLite 文件，一键启动 |
| D2  | 登录态        | JWT + httpOnly Cookie |
| D3  | 图表          | Recharts              |
| D4  | 脚手架 schema | 三表一次迁完          |

## 运行时规则

（子智能体连续两次同类错误后追加。当前无。）

## 协调者职责

- 更新本文与仓库根目录 `PROGRESS.md`
- 每模块合并前：跑该模块验收命令；失败则返工不进入下一波
- 监听本仓 PR 的 CI；失败则打包日志交给对应 agent
- 向用户汇报用进度表；需要决策时给 2～3 个选项及权衡
