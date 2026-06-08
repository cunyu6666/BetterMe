# __tests__/

> P2 | Parent: ../AGENTS.md

## Member List

setup.ts: vitest 全局 setup，引入 @testing-library/jest-dom 断言扩展（toBeInTheDocument 等）
storage.test.ts: storage.ts 契约测试 — [WHO] 导出 uid/today/load/save；[FROM] 依赖 localStorage；[TO] 被 6 个数据组件消费
timer.test.ts: timer.ts 契约测试 — [WHO] 导出 parseDuration/formatTime；[FROM] 纯函数无依赖；[TO] 被 Timer/WristPlan 消费
plans-data.test.ts: plans.ts 契约测试 — [WHO] 导出 RHINITIS_PLAN/WRIST_PLAN；[FROM] 无运行时依赖；[TO] 被 RhinitisPlan/WristPlan 消费
types.test.ts: types/index.ts 契约测试 — [WHO] 导出 8 个接口；[FROM] 纯类型；[TO] 被全应用消费
components.test.tsx: 6 个一级组件的渲染冒烟测试（Dashboard/Habits/Goals/Health/Learning/App）+ 计划子组件（Plans/RhinitisPlan/WristPlan）+ Timer 覆盖层
contract-grep.test.ts: 跨模块契约测试 — 验证每个 P3 header 中声明的 [TO] 消费者文件确实存在并导入；P2 文档中声明的源文件确实存在

## Submodules

（无 — __tests__/ 是叶子目录）

---

[COVENANT]: Update this file header on changes and verify against parent AGENTS.md
