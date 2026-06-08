# VIBE.md

> 项目调性 + 架构锁定声明 + 决策日志。本文件由 oh-my-viber 维护，请通过命令更新而非手改。

---

## 一、项目调性

- **项目类型**：内部工具（个人健康 SPA）
- **目标受众**：关注自身健康与成长的中国都市青年（22-35岁）
- **设计来源**：自有设计 + .design-dna.md（禅意暖色风格）
- **核心价值**：习惯养成、健康追踪、目标管理、自我提升
- **设计师视角关键词**：
  - 体验：安静、呼吸感、专注
  - 视觉：暖珊瑚、圆润、留白
  - 产品逻辑：简洁、直觉、渐进

## 二、架构锁定（V5.0 God Mode）

- 框架：Vite + React 19 + TypeScript (Strict)
- 路由：TanStack Router（文件路由）
- 样式：Tailwind CSS 4 + shadcn/ui（按需注入）
- **图标库**：@tabler/icons-react（全项目唯一，禁止混用其他图标库）
- 数据层：TanStack Query v5（唯一 Server State）
- 状态层：Zustand（仅 UI State）
- **后端**：InsForge SDK（通过 `/lib/api` 封装，组件不直连）

> 架构已锁定 (V5.0 God Mode)，跨模块行为契约已生效。

## 三、跨模块行为契约

- 分页：`page` + `pageSize`（默认 20），queryKey `['<feat>-list', { page, pageSize, search, filters }]`
- 搜索：Zustand + `useDebounce(300ms)`
- L/E/E：统一 `<Skeleton/>` `<ErrorState/>` `<EmptyState/>` 组合
- 乐观更新：所有写操作三段式（onMutate + onError + onSettled）
- API 契约：所有函数返回 `APIResponse<T> = { data, error }`
- 调用链：Component → Hook → Feature API → /lib/api

## 四、Feature 清单

| Feature | 状态 | 操作 | 备注 |
|---------|------|------|------|
| habits | ✅ 已迁移 | CRUD + toggle + archive | 12周热力图、自定义频率 |
| goals | ✅ 已迁移 | CRUD + tasks + milestones | 到期提醒 |
| health | ✅ 已迁移 | CRUD（4种type） | 运动模板、睡眠趋势、心情日历 |
| learning | ✅ 已迁移 | CRUD（3种type） | 进度滑块、标签 |
| dashboard | ✅ 已迁移 | 聚合只读 | 周对比、睡眠趋势、即将到期 |
| plans | ✅ 已迁移 | 静态+持久化 | 鼻炎管理、手腕复健（子组件暂保留原实现） |
| settings | ✅ 已迁移 | 主题切换+数据迁移+导出 | light/dark/auto |
| auth | ✅ 已创建 | 登录认证 | insforge auth email/password |

## 五、解锁记录

> 任何偏离锁定栈的决策都必须在此登记。

- _暂无_

## 六、项目模式（沉淀）

> `/reflect` 发现的可复用模式。

- 空态文案统一格式：「还没有 X，点击按钮添加一个吧」
- 列表 queryKey 规范：`['<feat>-list', params]`
- 临时 ID 规范：`tmp-${Date.now()}`
- 热力图/日历组件：7列网格，按周分组

## 七、决策日志

### 2026-06-08 15:36 — /init
- 项目接管：已有 React 19 + Vite + TS + Tailwind 4 + Tabler Icons + InsForge
- 补齐依赖：@tanstack/react-router、@tanstack/react-query、zustand
- 创建目录骨架：lib/api/、lib/hooks/、components/ui/、features/、routes/
- API 层重构：新建 api/index.ts（{ data, error } 契约），旧 api.ts 降级为兼容层
- 图标库锁定：@tabler/icons-react
- 后端锁定：InsForge SDK
- 认证：需要（insforge auth，待实现）
- 下一步：/spark 拆解 Feature 迁移计划

### 2026-06-08 16:00 — /spark
- Feature 迁移计划：8 个 Feature，4 梯队依赖顺序
- 第一梯队（叶子节点，可并行）：habits、goals、health、learning
- 第二梯队：plans/rhinitis、plans/wrist
- 第三梯队：settings、dashboard
- 第四梯队：auth（全新）
- 推荐首个 Feature：habits（结构最典型，可做模板）

### 2026-06-08 16:10 — /scaffold habits
- 新增 Feature: habits，操作：CRUD + toggle + archive + 12周热力图
- 4 件套：api.ts、hooks/useHabits.ts、store/useHabitsUIStore.ts、components/{HabitList,HabitItem,HabitForm}.tsx
- main.tsx 接入 QueryClientProvider
- App.tsx 导入源迁移：components/Habits → features/habits/components/HabitList
- 全部 mutation 实现三段式乐观更新
- tsc + vite build 通过

### 2026-06-08 16:30 — /scaffold goals
- 新增 Feature: goals，操作：CRUD + tasks + milestones + status + 到期提醒
- 4 件套：api.ts、hooks/useGoals.ts、store/useGoalsUIStore.ts、components/{GoalList,GoalItem,GoalForm}.tsx
- 9 个 mutation hooks，全部三段式乐观更新
- App.tsx 导入源迁移：components/Goals → features/goals/components/GoalList

### 2026-06-08 16:35 — /scaffold health
- 新增 Feature: health，操作：CRUD（4种type）+ 运动模板 + 睡眠趋势 + 心情日历
- 4 件套：api.ts、hooks/useHealth.ts、store/useHealthUIStore.ts、components/{HealthList,HealthItem,HealthForm}.tsx
- App.tsx 导入源迁移：components/Health → features/health/components/HealthList

### 2026-06-08 16:40 — /scaffold learning
- 新增 Feature: learning，操作：CRUD（3种type）+ 进度滑块 + 标签
- 4 件套：api.ts、hooks/useLearning.ts、store/useLearningUIStore.ts、components/{LearningList,LearningItem,LearningForm}.tsx
- App.tsx 导入源迁移：components/Learning → features/learning/components/LearningList

### 2026-06-08 16:45 — /scaffold plans
- 新增 Feature: plans，操作：planData 读写 + 计划选择器
- 4 件套：api.ts、hooks/usePlans.ts、store/usePlansUIStore.ts、components/PlanList.tsx
- PlanList 委托现有 RhinitisPlan/WristPlan 子组件（暂保留原实现）
- App.tsx 导入源迁移：components/plans/Plans → features/plans/components/PlanList

### 2026-06-08 16:50 — /scaffold settings
- 新增 Feature: settings，操作：主题切换 + 数据迁移 + 数据导出
- 4 件套：api.ts、hooks/useSettings.ts、store/useSettingsUIStore.ts、components/SettingsPanel.tsx
- App.tsx 导入源迁移：components/Settings → features/settings/components/SettingsPanel

### 2026-06-08 16:55 — /scaffold dashboard
- 新增 Feature: dashboard，操作：聚合只读（跨 4 类数据源）
- 4 件套：api.ts、hooks/useDashboard.ts、store/useDashboardUIStore.ts、components/DashboardView.tsx
- App.tsx 导入源迁移：components/Dashboard → features/dashboard/components/DashboardView

### 2026-06-08 17:00 — 全量迁移完成
- 7/7 Feature 已迁移至 V5.0 God Mode 架构
- 旧组件（src/components/）保留作为兼容层，新 Feature 全部走 features/ 目录
- tsc + vite build 全部通过
- 下一步：/wire 注入跨 Feature 契约（分页/搜索/L/E/E 三态），/audit 红线扫描
- auth Feature 待创建（第四梯队）

### 2026-06-08 17:10 — /audit 全仓红线扫描
- 扫描范围：src/features/ 全部 7 个 Feature + App.tsx + main.tsx
- R1-R5, R8, R9：CLEAN
- R6 违规 1 处：HealthForm.tsx `as Record<string, any>` → 移除显式类型断言
- R7 违规 1 处：useHabitsUIStore.ts 未使用的 `search` 状态 → 删除
- 修复后重扫：0 违规
- tsc + vite build 通过

### 2026-06-08 17:20 — /scaffold auth
- 新增 Feature: auth，操作：email/password 登录/注册/登出 + 会话管理
- 4 件套：api.ts、hooks/useAuth.ts、store/useAuthStore.ts、components/{LoginForm,AuthGuard}.tsx
- AuthGuard 包裹 App.tsx，未登录显示 LoginForm，已登录显示主界面
- 登出按钮显示在右上角（邮箱 + 退出图标）
- tsc + vite build 通过
