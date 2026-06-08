/**
 * [WHO]: 通用 debounce hook，用于搜索/过滤输入
 * [FROM]: 依赖 react 的 useState/useEffect
 * [TO]: 被各 Feature 的搜索/过滤组件消费
 * [HERE]: src/lib/hooks/useDebounce.ts - 延迟更新值，默认 300ms
 */
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
