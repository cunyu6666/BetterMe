/**
 * [WHO]: Goals Feature UI 状态
 * [FROM]: 依赖 zustand
 * [TO]: 被 hooks 和 components 消费
 * [HERE]: src/features/goals/store/useGoalsUIStore.ts
 */
import { create } from 'zustand'

type GoalsUIState = {
  showForm: boolean
  expandedId: string | null
  setShowForm: (show: boolean) => void
  toggleShowForm: () => void
  setExpandedId: (id: string | null) => void
  toggleExpanded: (id: string) => void
}

export const useGoalsUIStore = create<GoalsUIState>((set) => ({
  showForm: false,
  expandedId: null,
  setShowForm: (show) => set({ showForm: show }),
  toggleShowForm: () => set((s) => ({ showForm: !s.showForm })),
  setExpandedId: (id) => set({ expandedId: id }),
  toggleExpanded: (id) => set((s) => ({ expandedId: s.expandedId === id ? null : id })),
}))
