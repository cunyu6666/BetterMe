/**
 * [WHO]: Settings Feature 数据 Hook
 * [FROM]: 依赖 ../api
 * [TO]: 被 components/ 消费
 * [HERE]: src/features/settings/hooks/useSettings.ts
 */
import { useMutation } from '@tanstack/react-query'
import {
  getAllData, upsertHabit, upsertGoal, upsertHealthRecord,
  upsertLearningItem, savePlanData,
} from '../api'
import { load } from '../../../utils/storage'
import type { Habit, Goal, HealthRecord, LearningItem } from '../../../types'

export function useExportData() {
  return useMutation({
    mutationFn: async () => {
      const res = await getAllData()
      if (res.error) throw res.error
      const { habits, goals, health, learning, rhinitis, wrist } = res.data!
      const payload = {
        exportedAt: new Date().toISOString(),
        habits, goals, healthRecords: health, learningItems: learning,
        plans: { rhinitis, wrist },
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `betterme-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    },
  })
}

export function useMigrateFromLocalStorage() {
  return useMutation({
    mutationFn: async () => {
      const results: string[] = []

      const habits = load<Habit[]>('bm_habits', [])
      for (const h of habits) await upsertHabit(h)
      results.push(`习惯: ${habits.length} 条`)

      const goals = load<Goal[]>('bm_goals', [])
      for (const g of goals) await upsertGoal(g)
      results.push(`目标: ${goals.length} 条`)

      const health = load<HealthRecord[]>('bm_health', [])
      for (const r of health) await upsertHealthRecord(r)
      results.push(`健康记录: ${health.length} 条`)

      const learning = load<LearningItem[]>('bm_learning', [])
      for (const i of learning) await upsertLearningItem(i)
      results.push(`学习项: ${learning.length} 条`)

      const rhinitis = load<Record<string, unknown> | null>('bm_plan_rhinitis', null)
      if (rhinitis) await savePlanData('rhinitis', rhinitis)
      const wrist = load<Record<string, unknown> | null>('bm_plan_wrist', null)
      if (wrist) await savePlanData('wrist', wrist)
      results.push(`计划数据: ${(rhinitis ? 1 : 0) + (wrist ? 1 : 0)} 份`)

      return results
    },
  })
}
