/**
 * [WHO]: Auth Feature 数据通道
 * [FROM]: 委托 insforge SDK 的 auth 模块
 * [TO]: 被 hooks/useAuth.ts 消费
 * [HERE]: src/features/auth/api.ts - 所有函数返回 APIResponse<T>
 */
import insforge from '../../lib/insforge'
import type { APIResponse } from '../../lib/api/index'

function ok<T>(data: T): APIResponse<T> {
  return { data, error: null }
}

function fail(error: unknown): APIResponse<never> {
  return { data: null, error: error instanceof Error ? error : new Error(String(error)) }
}

export type AuthUser = {
  id: string
  email: string
  emailVerified: boolean
  profile: { name?: string; avatar_url?: string } | null
}

function mapUser(u: { id: string; email: string; emailVerified?: boolean; profile?: { name?: string; avatar_url?: string } | null } | null): AuthUser | null {
  if (!u) return null
  return {
    id: u.id,
    email: u.email,
    emailVerified: u.emailVerified ?? false,
    profile: u.profile ?? null,
  }
}

export async function getCurrentUser(): Promise<APIResponse<AuthUser | null>> {
  try {
    const { data, error } = await insforge.auth.getCurrentUser()
    if (error) return ok(null)
    return ok(mapUser(data?.user ?? null))
  } catch (e) { return fail(e) }
}

export async function signIn(email: string, password: string): Promise<APIResponse<AuthUser>> {
  try {
    const { data, error } = await insforge.auth.signInWithPassword({ email, password })
    if (error) return fail(error)
    return ok(mapUser(data.user)!)
  } catch (e) { return fail(e) }
}

export async function signUp(email: string, password: string, name?: string): Promise<APIResponse<AuthUser>> {
  try {
    const { data, error } = await insforge.auth.signUp({ email, password, name })
    if (error) return fail(error)
    return ok(mapUser(data.user)!)
  } catch (e) { return fail(e) }
}

export async function signOut(): Promise<APIResponse<void>> {
  try {
    const { error } = await insforge.auth.signOut()
    if (error) return fail(error)
    return ok(undefined)
  } catch (e) { return fail(e) }
}
