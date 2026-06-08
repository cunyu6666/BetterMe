/**
 * [WHO]: Learning Feature UI 状态
 * [FROM]: 依赖 zustand
 * [TO]: 被 hooks 和 components 消费
 * [HERE]: src/features/learning/store/useLearningUIStore.ts
 */
import { create } from 'zustand'
import type { LearningItem } from '../../../types'

type LearningUIState = {
  showForm: boolean
  itemType: LearningItem['type']
  setShowForm: (show: boolean) => void
  toggleShowForm: () => void
  setItemType: (type: LearningItem['type']) => void
}

export const useLearningUIStore = create<LearningUIState>((set) => ({
  showForm: false,
  itemType: 'book',
  setShowForm: (show) => set({ showForm: show }),
  toggleShowForm: () => set((s) => ({ showForm: !s.showForm })),
  setItemType: (type) => set({ itemType: type }),
}))
