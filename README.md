# BetterMe

成为更好的自己 — 个人健康管理 Web 应用

## 功能

- **习惯追踪** — 每日/每周习惯打卡，连击天数与完成率统计
- **目标管理** — 目标拆解为子任务，进度可视化，状态生命周期
- **健康记录** — 运动/饮食/睡眠/情绪四类记录，趋势分析
- **学习成长** — 书籍/技能/笔记管理，进度追踪
- **医疗自护计划** — 过敏性鼻炎管理、左腕6周复健方案

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | React 19 + TypeScript |
| 构建 | Vite 8 |
| 样式 | Tailwind CSS 4 |
| 后端 | InsForge (Postgres BaaS) |
| 测试 | Vitest + @testing-library/react |
| 部署 | Netlify |

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 运行测试
npm test

# 监听模式测试
npm run test:watch
```

## 项目结构

```
src/
  lib/insforge.ts    # InsForge SDK 客户端
  lib/api.ts         # 数据 CRUD API 层
  utils/storage.ts   # 工具函数 (uid, today)
  utils/timer.ts     # 计时器工具
  types/index.ts     # TypeScript 类型定义
  data/plans.ts      # 医疗计划静态数据
  components/        # UI 组件
    Dashboard.tsx    # 概览页
    Habits.tsx       # 习惯追踪
    Goals.tsx        # 目标管理
    Health.tsx       # 健康记录
    Learning.tsx     # 学习成长
    Settings.tsx     # 设置（数据迁移/导出）
    plans/           # 医疗计划模块
```

## 环境变量

创建 `.env.local`：

```
VITE_INSFORGE_URL=https://<your-project>.insforge.app
VITE_INSFORGE_ANON_KEY=<your-anon-key>
```
