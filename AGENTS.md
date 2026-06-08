# BetterMe · AGENTS.md

> P1 | 项目根宪章与导航图

---

## Identity

以可审计的工程纪律为基础：所有结论必须可执行、可验证、可维护；拒绝任何含糊或未经验证的断言。

---

## Project Overview

**BetterMe** 是一个个人成长追踪单页应用（BetterMe - 成为更好的自己）。使用 Vite + React 19 + TypeScript 构建，纯前端、零后端，数据全部存于 `localStorage`，核心能力是让用户在一个 App 内同时管理：日常习惯、长期目标、身心健康记录、学习成长、以及两个临床级「自我管理计划」（过敏性鼻炎管理、左腕 6 周复健）。

**核心支柱（Pillars）：**
- **习惯打卡** — 每日/每周习惯追踪，连击天数（streak）与完成率自动统计
- **目标拆解** — 长目标 → 子任务，进度百分比可视化，状态生命周期（active/completed/abandoned）
- **健康记录** — 运动/饮食/睡眠/情绪四类原始数据，今日+历史两层展示
- **学习成长** — 书籍/技能/笔记三类，标签系统，进度滑块
- **自我管理计划** — 沉淀医生级建议为可执行清单（鼻炎尘螨管理 + 左腕术后 6 周复健）
- **数据主权** — 所有数据本地化，键名以 `bm_` 前缀隔离，无云端依赖

---

## Architecture Topology

```
|---------------------------------------------------------------|
|                       ENTRY POINTS                             |
|  index.html  →  src/main.tsx  →  src/App.tsx                  |
|---------------------------------------------------------------|
                              |
                              v
|---------------------------------------------------------------|
|                  TAB SHELL (单页路由)                          |
|  6 个 tab：Dashboard / Plans / Habits / Goals / Health /     |
|           Learning                                            |
|---------------------------------------------------------------|
                              |
        +----------+-----------+-----------+----------+----------+
        |          |           |           |          |          |
        v          v           v           v          v          v
|-----------|  |---------|  |--------|  |--------|  |--------|  |--------|
| Dashboard |  |  Plans  |  | Habits |  | Goals  |  | Health |  |Learning|
| 概览聚合   |  | 计划    |  | 习惯   |  | 目标   |  | 健康   |  | 学习   |
|-----------|  |---------+  +--------+  +--------+  +--------+  +--------+
                     |
              +------+------+
              v             v
        |----------|  |----------|
        | Rhinitis |  |  Wrist   |
        |   Plan   |  |   Plan   |
        |----------|  |----------|
                              |
                              v
|---------------------------------------------------------------|
|                  SHARED LAYER                                 |
|  src/utils/storage.ts  —  load/save/uid/today (localStorage)  |
|  src/utils/timer.ts    —  parseDuration/formatTime            |
|  src/data/plans.ts     —  RHINITIS_PLAN / WRIST_PLAN 常量    |
|  src/types/index.ts    —  全部 TypeScript 类型契约            |
|  src/components/Timer.tsx — 全屏计时器组件（被 Wrist 调用）   |
|---------------------------------------------------------------|
                              |
                              v
|---------------------------------------------------------------|
|                  STYLES                                       |
|  src/index.css — 全局变量、组件样式、响应式（单文件 ~500 行） |
|---------------------------------------------------------------|
```

---

## Directory Structure

```
BetterMe/
|---- AGENTS.md                  # THIS FILE · P1 导航图
|---- index.html                 # Vite 入口 HTML，挂载 #root
|---- package.json               # npm 脚本：dev/build/lint/preview
|---- vite.config.ts             # Vite 配置（仅启用 react 插件）
|---- tsconfig.json              # 根 tsconfig（references app/node）
|---- tsconfig.app.json          # 浏览器端 TS 配置（jsx: react-jsx）
|---- tsconfig.node.json         # Node 端 TS 配置（vite.config）
|
|---- public/                    # 静态资源（favicon / icons）
|
|---- src/                       # 应用源码（P2: src/AGENTS.md）
|   |---- main.tsx               # React 19 createRoot 启动
|   |---- App.tsx                # 顶层 tab 容器 + 状态切换
|   |---- index.css              # 全局样式（CSS 变量 + 组件类）
|   |---- types/                 # 类型契约（P2: types/AGENTS.md）
|   |   |---- index.ts           # 全部业务类型
|   |---- utils/                 # 工具层（P2: utils/AGENTS.md）
|   |   |---- storage.ts         # localStorage 持久化
|   |   |---- timer.ts           # 时长解析/格式化
|   |---- data/                  # 静态数据层（P2: data/AGENTS.md）
|   |   |---- plans.ts           # 鼻炎 + 腕部计划常量
|   |---- components/            # 业务组件（P2: components/AGENTS.md）
|   |   |---- Dashboard.tsx      # 概览聚合页
|   |   |---- Habits.tsx         # 习惯列表 + 表单
|   |   |---- Goals.tsx          # 目标列表 + 子任务
|   |   |---- Health.tsx         # 健康记录 + 4 种子表单
|   |   |---- Learning.tsx       # 学习项 + 3 种子表单
|   |   |---- Timer.tsx          # 全屏计时器覆盖层
|   |   |---- plans/             # 计划子模块（P2: components/plans/AGENTS.md）
|   |       |---- Plans.tsx      # 计划选择器
|   |       |---- RhinitisPlan.tsx  # 鼻炎计划（绿金调色板）
|   |       |---- WristPlan.tsx     # 腕部计划（土系墨色调色板）
|   |
|   |---- assets/                # 静态图片
|
|---- __tests__/                 # Harness 测试套件（由 P3 生成）
```

---

## Build & Run Commands

```bash
# 安装依赖
npm install

# 开发服务器（Vite，默认 http://localhost:5173）
npm run dev

# 类型检查 + 生产构建（tsc -b 严格模式，noEmit 之后 vite build）
npm run build

# 预览生产包
npm run preview

# ESLint
npm run lint

# Harness 测试（添加 vitest 后）
npm test
```

---

## Key Abstractions

### Tab 路由（`src/App.tsx`）

用 `useState` 维护当前 tab key，`tabs` 常量数组声明 6 个 tab 标签 + emoji。`renderContent()` switch 分发到对应组件，是整个 App 的单一路由点。所有子组件自包含状态，无 React Router。

### 数据持久化（`src/utils/storage.ts`）

`load<T>(key, fallback)` 与 `save(key, data)` 是唯一与 `localStorage` 交互的入口。`uid()` 生成短随机 ID，`today()` 返回 `YYYY-MM-DD` 字符串。**所有数据键名前缀 `bm_`**（如 `bm_habits`、`bm_plan_rhinitis`），保证与其他应用隔离。

### 临床级计划常量（`src/data/plans.ts`）

`RHINITIS_PLAN` 与 `WRIST_PLAN` 是冻结的、医生级别的护理方案，以纯数据形式导出（不依赖 React）。组件层只负责消费和勾选状态管理，不修改原始数据。

### 类型契约（`src/types/index.ts`）

所有领域模型的 TypeScript 接口集中定义，组件文件只 `import type` 不内联声明。新增数据实体必须先在 types/ 增加接口。

### 全屏计时器（`src/components/Timer.tsx`）

圆形进度环 + 控制按钮的模态覆盖层。被 `WristPlan.tsx` 在用户点击"开始计时"时实例化，计时结束回调会回写到勾选状态。

---

## Configuration Paths

| 路径 | 用途 |
|------|------|
| `package.json` | 依赖与 npm 脚本 |
| `vite.config.ts` | Vite 构建配置（仅 react 插件） |
| `tsconfig.app.json` | 浏览器端 TS 严格模式（`noUnusedLocals` 等全开） |
| `tsconfig.node.json` | Node 端 TS 配置（仅含 `vite.config.ts`） |
| `src/index.css` :root | 主题色变量（`--primary`、`--sage`、`--wrist-ink` 等） |
| `localStorage` 键 | `bm_habits` / `bm_goals` / `bm_health` / `bm_learning` / `bm_plan_rhinitis` / `bm_plan_wrist` |

---

## Code Standards

### Language Policy

- **源代码注释**：中文（产品定位为中文用户）
- **类型与标识符**：英文（TypeScript 通用约定）
- **提交信息**：中英文皆可，推荐中文 + 类型前缀
- **文档（AGENTS.md 系列）**：中文（本宪章为中文）

### Commit Convention

```
<type>(<scope>): <summary>
```

常用类型：`feat` / `fix` / `refactor` / `docs` / `chore` / `test`

### TypeScript 规范

- `tsconfig.app.json` 严格模式全开（`noUnusedLocals`、`noUnusedParameters`、`noFallthroughCasesInSwitch`、`erasableSyntaxOnly`）
- `verbatimModuleSyntax: true`，所有类型导入必须用 `import type`
- 不使用 `enum`，优先 `as const` 联合类型
- 公共数据结构必须先在 `src/types/index.ts` 定义接口

### React 规范

- 函数组件 + Hooks，禁止 class 组件
- 本地状态用 `useState`，跨组件数据走 `localStorage`（不引入 Context，避免复杂度）
- 副作用（持久化）通过 `useEffect(() => save(...), [dep])` 自动同步
- 表单组件统一受控模式，提交后清空

---

## DIP Navigation

### P1 — Root

- [P1: This File](./AGENTS.md)

### P2 — Module Maps

- [P2: src/](./src/AGENTS.md) — 源码根目录
- [P2: src/components/](./src/components/AGENTS.md) — 业务组件层
- [P2: src/components/plans/](./src/components/plans/AGENTS.md) — 计划子模块
- [P2: src/data/](./src/data/AGENTS.md) — 静态数据层
- [P2: src/types/](./src/types/AGENTS.md) — 类型契约
- [P2: src/utils/](./src/utils/AGENTS.md) — 工具层
- [P2: __tests__/](./__tests__/AGENTS.md) — Harness 测试套件

### P3 — File Contracts

**状态**：🟡 部分完成 — 所有源文件需在头部添加 [WHO]/[FROM]/[TO]/[HERE] 注释块。
当前治理轮次将逐文件补齐，详见 `__tests__/AGENTS.md` 中的覆盖率报告。

---

**契约（Covenant）**：维护文档与代码的同构关系。任何代码变更必须先更新 P2/P3，否则视为违反协议。

<!-- INSFORGE:START -->
## InsForge backend

This project uses [InsForge](https://insforge.dev): an all-in-one, open-source Postgres-based backend (BaaS) that gives this app a database, authentication, file storage, edge functions, realtime, an AI model gateway, and payments through one platform.

- **Project:** **BetterMe** (API base `https://pndqy86c.ap-southeast.insforge.app`)
- **Skills:** these InsForge skills are installed for supported coding agents. Reach for them before implementing any InsForge feature instead of guessing the API:
  - `insforge`: app code with the `@insforge/sdk` client (database CRUD, auth, storage, edge functions, realtime, AI, email, and Stripe payments).
  - `insforge-cli`: backend and infrastructure via the `insforge` CLI (projects, SQL, migrations, RLS policies, storage buckets, functions, secrets, payment setup, schedules, deploys).
  - `insforge-debug`: diagnosing failures (SDK/HTTP errors, RLS denials, auth and OAuth issues) and running security or performance audits.
  - `insforge-integrations`: wiring external auth providers (Clerk, Auth0, WorkOS, Better Auth, etc.) for JWT-based RLS, or the OKX x402 payment facilitator.
  - `find-skills`: discovering additional skills on demand.
- **Credentials:** app code reads keys from `.env.local`; the CLI reads `.insforge/project.json`. Never hardcode or commit keys.

Key patterns:

- Database inserts take an array: `insert([{ ... }])`.
- Reference users with `auth.users(id)`; use `auth.uid()` in RLS policies.
- For storage uploads, persist both the returned `url` and `key`.
<!-- INSFORGE:END -->
