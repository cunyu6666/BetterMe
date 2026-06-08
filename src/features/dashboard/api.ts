/**
 * [WHO]: Dashboard Feature 数据通道（聚合只读）
 * [FROM]: 委托 src/lib/api/index.ts
 * [TO]: 被 hooks/useDashboard.ts 消费
 * [HERE]: src/features/dashboard/api.ts
 */
import {
  fetchHabits, fetchGoals, fetchHealthRecords, fetchLearningItems,
} from '../../lib/api/index'
import type { APIResponse } from '../../lib/api/index'
import type { Habit, Goal, HealthRecord, LearningItem } from '../../types'

export async function getDashboardData(): Promise<APIResponse<{
  habits: Habit[]; goals: Goal[]; health: HealthRecord[]; learning: LearningItem[];
}>> {
  try {
    const [habitsRes, goalsRes, healthRes, learningRes] = await Promise.all([
      fetchHabits(), fetchGoals(), fetchHealthRecords(), fetchLearningItems(),
    ])
    return {
      data: {
        habits: habitsRes.data ?? [],
        goals: goalsRes.data ?? [],
        health: healthRes.data ?? [],
        learning: learningRes.data ?? [],
      },
      error: null,
    }
  } catch (e) {
    return { data: null, error: e instanceof Error ? e : new Error(String(e)) }
  }
}
