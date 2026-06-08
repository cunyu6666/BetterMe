/**
 * [WHO]: 认证守卫组件
 * [FROM]: 依赖 ../hooks/useAuth 的 useAuthState/useInitAuth/useSignOut
 * [TO]: 被 App.tsx 包裹，控制登录/主界面切换
 * [HERE]: src/features/auth/components/AuthGuard.tsx
 */
import { IconLogout } from '@tabler/icons-react'
import { useAuthState, useInitAuth, useSignOut } from '../hooks/useAuth'
import { LoginForm } from './LoginForm'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  useInitAuth()
  const { user, loading, initialized } = useAuthState()
  const signOut = useSignOut()

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[var(--text-light)] text-sm">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <>
      {children}
      <button
        className="fixed top-4 right-4 z-50 btn btn-ghost btn-sm flex items-center gap-1 text-[var(--text-light)] hover:text-[var(--danger)]"
        onClick={() => signOut.mutate()}
        title="退出登录"
      >
        <IconLogout size={14} stroke={2} />
        <span className="text-xs hidden sm:inline">{user.email}</span>
      </button>
    </>
  )
}
