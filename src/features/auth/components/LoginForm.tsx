/**
 * [WHO]: 登录/注册表单
 * [FROM]: 依赖 ../hooks/useAuth 的 useSignIn/useSignUp
 * [TO]: 被 AuthGuard.tsx 渲染
 * [HERE]: src/features/auth/components/LoginForm.tsx
 */
import { useState } from 'react'
import { IconLogin, IconUserPlus, IconHeart } from '@tabler/icons-react'
import { useSignIn, useSignUp } from '../hooks/useAuth'

export function LoginForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const signIn = useSignIn()
  const signUp = useSignUp()

  const isLoading = signIn.isPending || signUp.isPending
  const error = signIn.error || signUp.error

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    if (mode === 'login') {
      signIn.mutate({ email, password })
    } else {
      signUp.mutate({ email, password, name: name.trim() || undefined })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <IconHeart size={40} stroke={1.5} className="mx-auto mb-3" style={{ color: 'var(--primary)' }} />
          <h1 className="text-2xl font-semibold">BetterMe</h1>
          <p className="text-[var(--text-light)] text-sm mt-1">成为更好的自己</p>
        </div>

        <div className="card">
          <div className="flex gap-2 mb-6">
            <button
              className={`btn btn-sm flex-1 flex items-center justify-center gap-1.5 ${mode === 'login' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setMode('login')}
            >
              <IconLogin size={14} stroke={2} /> 登录
            </button>
            <button
              className={`btn btn-sm flex-1 flex items-center justify-center gap-1.5 ${mode === 'signup' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setMode('signup')}
            >
              <IconUserPlus size={14} stroke={2} /> 注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="form-group">
                <label>昵称（可选）</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="你的昵称"
                />
              </div>
            )}
            <div className="form-group">
              <label>邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="form-group">
              <label>密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 位"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="text-[var(--danger)] text-sm bg-[var(--danger)]/10 rounded-lg p-3">
                {error instanceof Error ? error.message : String(error)}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full flex items-center justify-center gap-1.5"
              disabled={isLoading}
            >
              {isLoading ? '请稍候...' : mode === 'login' ? '登录' : '注册'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
