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

## UI交互注意事项777

- 所有接口请求走同源 `/api` 代理，统一携带 `credentials: 'include'`；JWT 由服务端写入 httpOnly Cookie，前端不读取也不存储 token。
- 接口报错就地渲染成红字提示（`text-red-700`），不使用 `alert`/`confirm` 打断流程；错误统一封装为 `ApiClientError`（携带 `code` / `message`），页面按需展示其 `message`。
- 仅初始鉴权会触发回登录页：`AuthContext` 启动时调用 `fetchMe()`，`UNAUTHORIZED` 清零登录态；`ProtectedRoute` 在鉴权结束后只要 `user === null` 就渲染 `<Navigate to="/login">`。页面内的读/刷新请求（习惯列表、统计）若返回 401 只展示错误文案、不会自动跳登录页；打卡/归档/删除等写操作当前未捕获 rejection，新增逻辑需自行处理 401。
- 首屏加载期间展示「加载中…」占位（`HomePage` / `HabitsPage` 由 `loading` 初值 `true` 控制，`StatsPage` 由 `overview === null` 控制），`ProtectedRoute` 在鉴权完成前同样显示「加载中…」；写操作触发的 `reload()` 不会重置该占位，需避免出现无反馈的空白页面。
- 打卡、添加、归档、删除等写操作成功后必须重新拉取数据（`reload()`）再刷新界面，保证今日状态与连续天数一致。
- 写操作进行中应禁用对应控件（打卡勾选、归档/删除按钮当前未禁用），避免连点导致重复提交；`StatsPage` 仅在挂载时拉取一次数据，跨页签的写操作不会自动同步。
- 注册/登录/新习惯名称依赖表单原生 `required` 校验，提交失败时保留用户已填内容，不清空表单。
- 打卡日期一律用客户端本地 `YYYY-MM-DD`（`todayLocalDate()`），禁止用 `toISOString()` 截取，避免时区导致日期偏移。
- 交互控件需带可访问名称（`aria-label` / 可见文案），便于端到端测试与无障碍访问。
- 本节内容对应工单 b62883491637446491eeffd0852ed499（项目 zilun2-test / 仓库 morning-route），用于交互改动时的自查。
