/**
 * [WHO]: Health Feature UI 状态
 * [FROM]: 依赖 zustand
 * [TO]: 被 hooks 和 components 消费
 * [HERE]: src/features/health/store/useHealthUIStore.ts
 */
import { create } from 'zustand'
import type { HealthRecord } from '../../../types'

type HealthUIState = {
  showForm: boolean
  recordType: HealthRecord['type']
  showTrend: boolean
  setShowForm: (show: boolean) => void
  toggleShowForm: () => void
  setRecordType: (type: HealthRecord['type']) => void
  setShowTrend: (show: boolean) => void
  toggleShowTrend: () => void
}

export const useHealthUIStore = create<HealthUIState>((set) => ({
  showForm: false,
  recordType: 'exercise',
  showTrend: false,
  setShowForm: (show) => set({ showForm: show }),
  toggleShowForm: () => set((s) => ({ showForm: !s.showForm })),
  setRecordType: (type) => set({ recordType: type }),
  setShowTrend: (show) => set({ showTrend: show }),
  toggleShowTrend: () => set((s) => ({ showTrend: !s.showTrend })),
}))
