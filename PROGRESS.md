# PROGRESS

## 已完成模块

- 波次 0 — 脚手架：npm workspaces、Prisma 三表、CI、一键 `npm run dev`
- 波次 1 — 认证垂直切片：JWT httpOnly Cookie、注册/登录/登出/`/me`、受保护首页、Playwright 登录闭环
- 波次 2 — 习惯 CRUD（本 PR）

## 待审查 PR

- 脚手架 PR（见 GitHub）

## 云端服务

实现 agent 在应用可启动后于云端 VM 执行 `npm run dev` 并保持监听。你的笔记本不会被远程启动。

| 服务         | URL                                                   | 启动命令                                                        |
| ------------ | ----------------------------------------------------- | --------------------------------------------------------------- |
| 一键开发     | Web http://localhost:5173 ；API http://localhost:3001 | 仓库根目录 `npm run dev`                                        |
| API 健康检查 | http://localhost:3001/api/health                      | 含在 `npm run dev` 内（`apps/api` 的 `tsx watch src/index.ts`） |

环境变量见 `.env.example`（`DATABASE_URL=file:./dev.db`，相对 `prisma/schema.prisma`）。

## 已知问题

- 用户本机没有已连接的 Cursor worker，协调者无法在用户电脑上执行 `npm run dev`。请本机自行 `npm install && npm run dev`，或打开云端 agent 桌面。

## 下一步计划

1. 波次 1 认证垂直切片（独立 PR）
2. 波次 2 习惯 CRUD
3. 波次 3 打卡与 streak
4. 波次 4a 统计可视化、4b Playwright 全流程与 README
