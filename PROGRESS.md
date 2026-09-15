# PROGRESS

## 已完成模块

- 波次 0 — 脚手架：npm workspaces、Prisma 三表、CI、一键 `npm run dev` — PR https://github.com/daibi2/morning-route/pull/1
- 波次 1 — 认证垂直切片 — PR https://github.com/daibi2/morning-route/pull/2
- 波次 2 — 习惯 CRUD — PR https://github.com/daibi2/morning-route/pull/3
- 波次 3 — 打卡与连续天数 — PR https://github.com/daibi2/morning-route/pull/4
- 波次 4a — 统计可视化 — PR https://github.com/daibi2/morning-route/pull/5
- 波次 4b — Playwright 全流程与 README（本 PR）

## 待审查 PR

叠放草稿 PR，base 指向上一模块分支：

1. https://github.com/daibi2/morning-route/pull/1
2. https://github.com/daibi2/morning-route/pull/2
3. https://github.com/daibi2/morning-route/pull/3
4. https://github.com/daibi2/morning-route/pull/4
5. https://github.com/daibi2/morning-route/pull/5
6. https://github.com/daibi2/morning-route/pull/6

## 云端服务

实现 agent 在云端 VM 执行 `npm run dev` 并保持监听。无法启动用户笔记本。

| 服务         | URL                                                   | 启动命令                                                      |
| ------------ | ----------------------------------------------------- | ------------------------------------------------------------- |
| 一键开发     | Web http://localhost:5173 ；API http://127.0.0.1:3001 | 仓库根目录 `npm run dev`                                      |
| API 健康检查 | http://127.0.0.1:3001/api/health                      | 含在 `npm run dev` 内（`apps/api`：`tsx watch src/index.ts`） |
| 演示账号     | demo@morning.route / password1                        | `npm run db:seed`                                             |

环境变量见 `.env.example`（`DATABASE_URL=file:./dev.db`，相对 `prisma/schema.prisma`）。

## 已知问题

- 用户本机没有已连接的 Cursor worker，请自行 `npm install && npm run dev`，或打开云端 agent 桌面。
- 叠放 PR 需按 1→6 顺序合并。

## 下一步计划

合并叠放 PR；本机或云端桌面验收全流程。
