/**
 * [WHO]: Goals Feature 数据通道
 * [FROM]: 委托 src/lib/api/index.ts
 * [TO]: 被 hooks/useGoals.ts 消费
 * [HERE]: src/features/goals/api.ts
 */
import {
  fetchGoals as _fetchGoals,
  upsertGoal as _upsertGoal,
  deleteGoal as _deleteGoal,
} from '../../lib/api/index'
import type { APIResponse } from '../../lib/api/index'
import type { Goal } from '../../types'

export async function getGoals(): Promise<APIResponse<Goal[]>> {
  return _fetchGoals()
}

export async function saveGoal(goal: Goal): Promise<APIResponse<void>> {
  return _upsertGoal(goal)
}

export async function removeGoal(id: string): Promise<APIResponse<void>> {
  return _deleteGoal(id)
}
