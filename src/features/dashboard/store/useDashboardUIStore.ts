/**
 * [WHO]: Dashboard Feature UI 状态（最小化，dashboard 是只读页面）
 * [FROM]: 依赖 zustand
 * [TO]: 被 components/ 消费
 * [HERE]: src/features/dashboard/store/useDashboardUIStore.ts
 */
import { create } from 'zustand'

type DashboardUIState = {
  // 预留：未来可加时间范围选择等 UI 状态
  _placeholder: true
}

export const useDashboardUIStore = create<DashboardUIState>(() => ({
  _placeholder: true,
}))
