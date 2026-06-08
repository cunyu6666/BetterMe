# src/components/plans/

> P2 | Parent: ../AGENTS.md

## Member List

Plans.tsx: 计划选择器外壳，useState<'rhinitis'|'wrist'> 维护 selected，根据值条件渲染 RhinitisPlan 或 WristPlan，2 个 plan-card 供切换
RhinitisPlan.tsx: 鼻炎尘螨管理计划，6 个视图（daily/weekly/env/shopping/meds/timeline），toggle 函数命名风格统一（toggleDaily/Weekly/Shop/Environment），绿金调色板（--sage/--gold），从开始日期推算 planDay
WristPlan.tsx: 左腕 6 周复健计划，3 阶段（phase 0/1/2 对应 1-2/3-4/5-6 周），4 视图（daily/shopping/assess/rules），调用 parseDuration 解析每项动作时长并通过 Timer 覆盖层执行，土系墨色调色板（--wrist-ink/--wrist-amber）

---

[COVENANT]: Update this file header on changes and verify against parent AGENTS.md
