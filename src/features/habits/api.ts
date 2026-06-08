/**
 * [WHO]: Habits Feature 数据通道
 * [FROM]: 委托 src/lib/api/index.ts 的全局 API 函数
 * [TO]: 被 hooks/useHabits.ts 消费
 * [HERE]: src/features/habits/api.ts - 所有函数返回 APIResponse<T>
 */
import {
  fetchHabits as _fetchHabits,
  upsertHabit as _upsertHabit,
  deleteHabit as _deleteHabit,
} from '../../lib/api/index'
import type { APIResponse } from '../../lib/api/index'
import type { Habit } from '../../types'

export async function getHabits(): Promise<APIResponse<Habit[]>> {
  return _fetchHabits()
}

export async function saveHabit(habit: Habit): Promise<APIResponse<void>> {
  return _upsertHabit(habit)
}

export async function removeHabit(id: string): Promise<APIResponse<void>> {
  return _deleteHabit(id)
}
