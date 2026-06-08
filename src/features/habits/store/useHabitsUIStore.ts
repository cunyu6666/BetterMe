/**
 * [WHO]: Habits Feature UI 状态
 * [FROM]: 依赖 zustand
 * [TO]: 被 hooks/useHabits.ts 和 components/ 消费
 * [HERE]: src/features/habits/store/useHabitsUIStore.ts - 仅 UI 状态，禁存 Server State
 */
import { create } from 'zustand'

type HabitsUIState = {
  showForm: boolean
  showArchived: boolean
  expandedId: string | null
  setShowForm: (show: boolean) => void
  toggleShowForm: () => void
  setShowArchived: (show: boolean) => void
  toggleShowArchived: () => void
  setExpandedId: (id: string | null) => void
  toggleExpanded: (id: string) => void
}

export const useHabitsUIStore = create<HabitsUIState>((set) => ({
  showForm: false,
  showArchived: false,
  expandedId: null,
  setShowForm: (show) => set({ showForm: show }),
  toggleShowForm: () => set((s) => ({ showForm: !s.showForm })),
  setShowArchived: (show) => set({ showArchived: show }),
  toggleShowArchived: () => set((s) => ({ showArchived: !s.showArchived })),
  setExpandedId: (id) => set({ expandedId: id }),
  toggleExpanded: (id) => set((s) => ({ expandedId: s.expandedId === id ? null : id })),
}))
