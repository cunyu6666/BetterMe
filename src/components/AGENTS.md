# src/components/

> P2 | Parent: ../AGENTS.md

## Member List

Dashboard.tsx: 概览聚合页，读取 bm_habits/bm_goals/bm_health/bm_learning 计算今日统计 + 最近 7 日习惯柱状图 + 进行中目标进度 + 阅读进展，无表单（只读）
Habits.tsx: 习惯列表页，useState 持有 Habit[]，新增表单含名称/分类/频率，toggle 当日勾选，连击天数从今日倒推连续完成日
Goals.tsx: 目标列表页，useState 持有 Goal[]，子任务增删通过 SubtaskInput 子组件，状态切换 select 触发 updateStatus
Health.tsx: 健康记录页，4 种 type 共享页面，typeConfig 常量驱动图标与配色，renderForm/renderRecordContent 按 type 分发
Learning.tsx: 学习成长页，3 种 type 各自独立表单，书籍与技能带 range 滑块更新进度，笔记支持动态标签数组
Timer.tsx: 全屏计时器覆盖层，圆形 SVG 进度环（circumference 公式驱动），useRef + useCallback 管理 interval，3 个圆形控制按钮（开始/暂停/重置/关闭），onComplete 回调

## Submodules

- [P2: src/components/plans/](./plans/AGENTS.md) — 计划子模块（Rhinitis + Wrist）

---

[COVENANT]: Update this file header on changes and verify against parent AGENTS.md
