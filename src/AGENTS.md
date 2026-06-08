# src/

> P2 | Parent: ../AGENTS.md

## Member List

main.tsx: React 19 启动入口，使用 createRoot 挂载到 #root，包 StrictMode，引入全局 index.css
App.tsx: 顶层 tab 容器，定义 6 个 tab 常量数组与 TabKey 类型，useState 维护当前 tab，renderContent switch 分发到 6 个子组件
index.css: 全局样式与设计令牌（CSS 变量），含 6 大组件类（tabs / card / habit / goal / health / plan-*）及响应式断点（@media 600px）
types/index.ts: 全部领域模型 TypeScript 接口（Habit / Goal / HealthRecord / LearningItem / RhinitisData / WristData / PlanItem / ShoppingItem）
utils/storage.ts: localStorage 持久化工具集（load / save / uid / today）
utils/timer.ts: 时长解析（"X MIN" / "X 秒"）与格式化（mm:ss），供 WristPlan + Timer 组件共用
data/plans.ts: 临床级静态数据常量（RHINITIS_PLAN / WRIST_PLAN），包含每日/每周/环境/采购/时间线/红线/用药/医院等结构
components/Dashboard.tsx: 概览聚合页，读取 4 类数据计算今日指标与最近 7 日习惯柱状图
components/Habits.tsx: 习惯列表页，含新增表单、勾选切换、连击天数（streak）计算、完成率统计
components/Goals.tsx: 目标列表页，含新增表单、子任务增删、状态切换（active/completed/abandoned）、进度条
components/Health.tsx: 健康记录页，4 种类型（exercise/diet/sleep/mood）共用页面，类型切换渲染不同表单
components/Learning.tsx: 学习成长页，3 种类型（book/skill/note），书籍与技能带进度条，笔记支持标签
components/Timer.tsx: 全屏计时器覆盖层，圆形 SVG 进度环 + 启停控制 + 振动反馈 + 跳过选项
components/plans/Plans.tsx: 计划选择器，根据 selected 状态渲染 RhinitisPlan 或 WristPlan
components/plans/RhinitisPlan.tsx: 鼻炎尘螨管理计划，6 个视图（每日/每周/环境/采购/用药/时间线），绿金调色板
components/plans/WristPlan.tsx: 左腕 6 周复健计划，3 阶段 + 4 视图（每日/采购/评估/退出），土系墨色调色板

## Submodules

- [P2: src/components/](./components/AGENTS.md) — 业务组件层
- [P2: src/components/plans/](./components/plans/AGENTS.md) — 计划子模块
- [P2: src/data/](./data/AGENTS.md) — 静态数据层
- [P2: src/types/](./types/AGENTS.md) — 类型契约
- [P2: src/utils/](./utils/AGENTS.md) — 工具层

---

[COVENANT]: Update this file header on changes and verify against parent AGENTS.md
