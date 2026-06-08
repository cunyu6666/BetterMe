/**
 * [WHO]: Plans Feature UI 状态
 * [FROM]: 依赖 zustand
 * [TO]: 被 hooks 和 components 消费
 * [HERE]: src/features/plans/store/usePlansUIStore.ts
 */
import { create } from 'zustand'

type PlansUIState = {
  selected: 'rhinitis' | 'wrist'
  setSelected: (plan: 'rhinitis' | 'wrist') => void
}

export const usePlansUIStore = create<PlansUIState>((set) => ({
  selected: 'rhinitis',
  setSelected: (plan) => set({ selected: plan }),
}))
