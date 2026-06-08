/**
 * [WHO]: Auth Feature 全局状态（用户会话）
 * [FROM]: 依赖 zustand；应用启动时由 useAuth() 水合
 * [TO]: 被 hooks/useAuth.ts 和 components/ 消费
 * [HERE]: src/features/auth/store/useAuthStore.ts
 *
 * NOTE: 用户对象是全局单例会话状态，不属于常规 Server State 查询，
 * 因此用 Zustand 管理而非 TanStack Query。
 */
import { create } from 'zustand'
import type { AuthUser } from '../api'

type AuthState = {
  user: AuthUser | null
  loading: boolean
  initialized: boolean
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
}))
