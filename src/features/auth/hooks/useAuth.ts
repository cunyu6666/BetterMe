/**
 * [WHO]: Auth Feature Hook
 * [FROM]: 依赖 ../api 的认证函数；依赖 ../store 的全局状态
 * [TO]: 被 components/ 和 App.tsx 消费
 * [HERE]: src/features/auth/hooks/useAuth.ts
 */
import { useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getCurrentUser, signIn, signUp, signOut } from '../api'
import { useAuthStore } from '../store/useAuthStore'
import type { AuthUser } from '../api'

// ── 初始化：应用启动时获取当前用户 ──

export function useInitAuth() {
  const { setUser, setLoading, setInitialized, initialized } = useAuthStore()

  useEffect(() => {
    if (initialized) return
    getCurrentUser().then((res) => {
      setUser(res.data ?? null)
      setLoading(false)
      setInitialized(true)
    })
  }, [initialized, setUser, setLoading, setInitialized])
}

// ── 读取状态 ──

export function useAuthState() {
  const { user, loading, initialized } = useAuthStore()
  return { user, loading, initialized, isAuthenticated: !!user }
}

// ── 登录 ──

export function useSignIn() {
  const { setUser } = useAuthStore()
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => signIn(email, password),
    onSuccess: (res) => {
      if (res.data) setUser(res.data)
    },
  })
}

// ── 注册 ──

export function useSignUp() {
  const { setUser } = useAuthStore()
  return useMutation({
    mutationFn: ({ email, password, name }: { email: string; password: string; name?: string }) => signUp(email, password, name),
    onSuccess: (res) => {
      if (res.data) setUser(res.data)
    },
  })
}

// ── 登出 ──

export function useSignOut() {
  const { setUser } = useAuthStore()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => signOut(),
    onSuccess: () => {
      setUser(null)
      qc.clear()
    },
  })
}
