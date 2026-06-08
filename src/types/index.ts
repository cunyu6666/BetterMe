/**
 * [WHO]: 提供全部领域模型的 TypeScript 接口（Habit / Goal / HealthRecord / LearningItem / RhinitisData / WristData / PlanItem / ShoppingItem）
 * [FROM]: 无运行时依赖；纯类型声明；供整个 src/ 通过 `import type` 引用
 * [TO]: 被所有组件（Dashboard/Habits/Goals/Health/Learning/plans/*）与 utils（storage）通过 `import type` 消费；新领域实体必须先在此声明
 * [HERE]: src/types/index.ts - 集中式类型契约层；用 `as const` 联合类型实现枚举等价；不允许在组件内内联声明业务类型
 */
export interface Habit {
  id: string;
  name: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'custom';
  frequencyCount?: number;   // custom: 每周N次 或 每隔N天
  frequencyUnit?: 'week' | 'day'; // custom: 按周还是按天
  completedDates: string[];
  createdAt: string;
  archived?: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  done: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'abandoned';
  tasks: { id: string; title: string; done: boolean }[];
  milestones: Milestone[];
  createdAt: string;
}

export interface HealthRecord {
  id: string;
  type: 'exercise' | 'diet' | 'sleep' | 'mood';
  date: string;
  data: Record<string, any>;
}

export interface LearningItem {
  id: string;
  type: 'book' | 'skill' | 'note';
  title: string;
  content: string;
  progress: number;
  tags: string[];
  hours?: number;
  createdAt: string;
}

export interface RhinitisData {
  startDate: string;
  dailyChecks: Record<string, boolean>;
  weeklyChecks: Record<string, boolean>;
  environmentChecks: Record<string, boolean>;
  shopping: Record<string, boolean>;
}

export interface WristData {
  startDate: string;
  dailyChecks: Record<string, boolean>;
  assessments: Record<string, Record<string, string>>;
  shopping: Record<string, boolean>;
}

export interface PlanItem {
  id: string;
  text: string;
  detail?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  rec: string;
  priority: number | string;
  note?: string;
  price?: string;
}
