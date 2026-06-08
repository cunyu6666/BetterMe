# src/utils/

> P2 | Parent: ../AGENTS.md

## Member List

storage.ts: localStorage 持久化工具集，导出 uid（短随机 ID：Date.now base36 + 6 位 random）/ today（YYYY-MM-DD ISO 切片）/ load<T>（JSON.parse 失败回退 fallback）/ save（JSON.stringify 写入）
timer.ts: 时长解析与格式化工具，导出 parseDuration（支持 "X MIN" 与 "X 秒" 正则，秒为单位返回）/ formatTime（mm:ss 格式，左侧零填充），纯函数无副作用

---

[COVENANT]: Update this file header on changes and verify against parent AGENTS.md
