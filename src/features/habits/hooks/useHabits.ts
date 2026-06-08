/**
 * [WHO]: Habits Feature 数据 Hook
 * [FROM]: 依赖 @tanstack/react-query；依赖 ../api 的数据函数；依赖 ../store 的 UI 状态
 * [TO]: 被 components/ 消费（组件禁止直连 API）
 * [HERE]: src/features/habits/hooks/useHabits.ts - 封装查询 + 三段式乐观更新
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getHabits, saveHabit, removeHabit } from '../api'
import { today } from '../../../utils/storage'
import type { Habit } from '../../../types'

const QUERY_KEY = ['habits-list']

// ── 查询 ──

export function useHabits() {
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await getHabits()
      if (res.error) throw res.error
      return res.data ?? []
    },
  })

  return {
    ...query,
    habits: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    isEmpty: !query.isLoading && (query.data?.length ?? 0) === 0,
  }
}

// ── 创建 ──

export function useCreateHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (habit: Habit) => saveHabit(habit),
    onMutate: async (habit) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const previous = qc.getQueryData<Habit[]>(QUERY_KEY)
      qc.setQueryData<Habit[]>(QUERY_KEY, (old = []) => [habit, ...old])
      return { previous }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(QUERY_KEY, ctx.previous)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false })
    },
  })
}

// ── 更新（含 toggle / archive / unarchive） ──

export function useUpdateHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (habit: Habit) => saveHabit(habit),
    onMutate: async (habit) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const previous = qc.getQueryData<Habit[]>(QUERY_KEY)
      qc.setQueryData<Habit[]>(QUERY_KEY, (old = []) =>
        old.map((h) => (h.id === habit.id ? habit : h))
      )
      return { previous }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(QUERY_KEY, ctx.previous)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false })
    },
  })
}

// ── 当日勾选（高频，乐观更新） ──

export function useToggleHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const habits = qc.getQueryData<Habit[]>(QUERY_KEY) ?? []
      const habit = habits.find((h) => h.id === id)
      if (!habit) throw new Error('Habit not found')
      const d = today()
      const completedDates = habit.completedDates.includes(d)
        ? habit.completedDates.filter((x) => x !== d)
        : [...habit.completedDates, d]
      const updated = { ...habit, completedDates }
      const res = await saveHabit(updated)
      if (res.error) throw res.error
      return updated
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const previous = qc.getQueryData<Habit[]>(QUERY_KEY)
      const d = today()
      qc.setQueryData<Habit[]>(QUERY_KEY, (old = []) =>
        old.map((h) => {
          if (h.id !== id) return h
          const completedDates = h.completedDates.includes(d)
            ? h.completedDates.filter((x) => x !== d)
            : [...h.completedDates, d]
          return { ...h, completedDates }
        })
      )
      return { previous }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(QUERY_KEY, ctx.previous)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false })
    },
  })
}

// ── 删除（低频，确认式） ──

export function useDeleteHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => removeHabit(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const previous = qc.getQueryData<Habit[]>(QUERY_KEY)
      qc.setQueryData<Habit[]>(QUERY_KEY, (old = []) => old.filter((h) => h.id !== id))
      return { previous }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(QUERY_KEY, ctx.previous)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false })
    },
  })
}

// ── 归档 / 恢复 ──

export function useArchiveHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, archived }: { id: string; archived: boolean }) => {
      const habits = qc.getQueryData<Habit[]>(QUERY_KEY) ?? []
      const habit = habits.find((h) => h.id === id)
      if (!habit) throw new Error('Habit not found')
      const updated = { ...habit, archived }
      const res = await saveHabit(updated)
      if (res.error) throw res.error
      return updated
    },
    onMutate: async ({ id, archived }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const previous = qc.getQueryData<Habit[]>(QUERY_KEY)
      qc.setQueryData<Habit[]>(QUERY_KEY, (old = []) =>
        old.map((h) => (h.id === id ? { ...h, archived } : h))
      )
      return { previous }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(QUERY_KEY, ctx.previous)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false })
    },
  })
}
