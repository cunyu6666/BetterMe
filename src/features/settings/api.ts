/**
 * [WHO]: Settings Feature 数据通道（聚合所有 Feature 的 fetch 函数用于导出/迁移）
 * [FROM]: 委托 src/lib/api/index.ts
 * [TO]: 被 hooks/useSettings.ts 消费
 * [HERE]: src/features/settings/api.ts
 */
import {
  fetchHabits, fetchGoals, fetchHealthRecords, fetchLearningItems,
  fetchPlanData, upsertHabit, upsertGoal, upsertHealthRecord,
  upsertLearningItem, savePlanData,
} from '../../lib/api/index'
import type { APIResponse } from '../../lib/api/index'
import type { Habit, Goal, HealthRecord, LearningItem } from '../../types'

export async function getAllData(): Promise<APIResponse<{
  habits: Habit[]; goals: Goal[]; health: HealthRecord[]; learning: LearningItem[];
  rhinitis: Record<string, unknown> | null; wrist: Record<string, unknown> | null;
}>> {
  try {
    const [habitsRes, goalsRes, healthRes, learningRes, rhinitisRes, wristRes] = await Promise.all([
      fetchHabits(), fetchGoals(), fetchHealthRecords(), fetchLearningItems(),
      fetchPlanData('rhinitis'), fetchPlanData('wrist'),
    ])
    return {
      data: {
        habits: habitsRes.data ?? [],
        goals: goalsRes.data ?? [],
        health: healthRes.data ?? [],
        learning: learningRes.data ?? [],
        rhinitis: rhinitisRes.data ?? null,
        wrist: wristRes.data ?? null,
      },
      error: null,
    }
  } catch (e) {
    return { data: null, error: e instanceof Error ? e : new Error(String(e)) }
  }
}

export { upsertHabit, upsertGoal, upsertHealthRecord, upsertLearningItem, savePlanData }
