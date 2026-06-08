/**
 * [WHO]: Goals Feature 数据 Hook
 * [FROM]: 依赖 @tanstack/react-query；依赖 ../api
 * [TO]: 被 components/ 消费
 * [HERE]: src/features/goals/hooks/useGoals.ts
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getGoals, saveGoal, removeGoal } from '../api'
import type { Goal, Milestone } from '../../../types'
import { uid } from '../../../utils/storage'

const QUERY_KEY = ['goals-list']

export function useGoals() {
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await getGoals()
      if (res.error) throw res.error
      return res.data ?? []
    },
  })
  return {
    ...query,
    goals: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    isEmpty: !query.isLoading && (query.data?.length ?? 0) === 0,
  }
}

export function useCreateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (goal: Goal) => saveGoal(goal),
    onMutate: async (goal) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const previous = qc.getQueryData<Goal[]>(QUERY_KEY)
      qc.setQueryData<Goal[]>(QUERY_KEY, (old = []) => [goal, ...old])
      return { previous }
    },
    onError: (_e, _v, ctx) => ctx?.previous && qc.setQueryData(QUERY_KEY, ctx.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false }),
  })
}

export function useUpdateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (goal: Goal) => saveGoal(goal),
    onMutate: async (goal) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const previous = qc.getQueryData<Goal[]>(QUERY_KEY)
      qc.setQueryData<Goal[]>(QUERY_KEY, (old = []) =>
        old.map((g) => (g.id === goal.id ? goal : g))
      )
      return { previous }
    },
    onError: (_e, _v, ctx) => ctx?.previous && qc.setQueryData(QUERY_KEY, ctx.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false }),
  })
}

export function useDeleteGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => removeGoal(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const previous = qc.getQueryData<Goal[]>(QUERY_KEY)
      qc.setQueryData<Goal[]>(QUERY_KEY, (old = []) => old.filter((g) => g.id !== id))
      return { previous }
    },
    onError: (_e, _v, ctx) => ctx?.previous && qc.setQueryData(QUERY_KEY, ctx.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false }),
  })
}

// ── 子任务操作（乐观更新） ──

export function useToggleTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ goalId, taskId }: { goalId: string; taskId: string }) => {
      const goals = qc.getQueryData<Goal[]>(QUERY_KEY) ?? []
      const goal = goals.find((g) => g.id === goalId)
      if (!goal) throw new Error('Goal not found')
      const updated = { ...goal, tasks: goal.tasks.map((t) => t.id === taskId ? { ...t, done: !t.done } : t) }
      const res = await saveGoal(updated)
      if (res.error) throw res.error
      return updated
    },
    onMutate: async ({ goalId, taskId }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const previous = qc.getQueryData<Goal[]>(QUERY_KEY)
      qc.setQueryData<Goal[]>(QUERY_KEY, (old = []) =>
        old.map((g) => {
          if (g.id !== goalId) return g
          return { ...g, tasks: g.tasks.map((t) => t.id === taskId ? { ...t, done: !t.done } : t) }
        })
      )
      return { previous }
    },
    onError: (_e, _v, ctx) => ctx?.previous && qc.setQueryData(QUERY_KEY, ctx.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false }),
  })
}

export function useAddTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ goalId, title }: { goalId: string; title: string }) => {
      const goals = qc.getQueryData<Goal[]>(QUERY_KEY) ?? []
      const goal = goals.find((g) => g.id === goalId)
      if (!goal) throw new Error('Goal not found')
      const updated = { ...goal, tasks: [...goal.tasks, { id: uid(), title, done: false }] }
      const res = await saveGoal(updated)
      if (res.error) throw res.error
      return updated
    },
    onMutate: async ({ goalId, title }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const previous = qc.getQueryData<Goal[]>(QUERY_KEY)
      const newTask = { id: `tmp-${Date.now()}`, title, done: false }
      qc.setQueryData<Goal[]>(QUERY_KEY, (old = []) =>
        old.map((g) => g.id === goalId ? { ...g, tasks: [...g.tasks, newTask] } : g)
      )
      return { previous }
    },
    onError: (_e, _v, ctx) => ctx?.previous && qc.setQueryData(QUERY_KEY, ctx.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false }),
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ goalId, taskId }: { goalId: string; taskId: string }) => {
      const goals = qc.getQueryData<Goal[]>(QUERY_KEY) ?? []
      const goal = goals.find((g) => g.id === goalId)
      if (!goal) throw new Error('Goal not found')
      const updated = { ...goal, tasks: goal.tasks.filter((t) => t.id !== taskId) }
      const res = await saveGoal(updated)
      if (res.error) throw res.error
      return updated
    },
    onMutate: async ({ goalId, taskId }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const previous = qc.getQueryData<Goal[]>(QUERY_KEY)
      qc.setQueryData<Goal[]>(QUERY_KEY, (old = []) =>
        old.map((g) => g.id === goalId ? { ...g, tasks: g.tasks.filter((t) => t.id !== taskId) } : g)
      )
      return { previous }
    },
    onError: (_e, _v, ctx) => ctx?.previous && qc.setQueryData(QUERY_KEY, ctx.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false }),
  })
}

// ── 里程碑操作 ──

export function useAddMilestone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ goalId, title, dueDate }: { goalId: string; title: string; dueDate: string }) => {
      const goals = qc.getQueryData<Goal[]>(QUERY_KEY) ?? []
      const goal = goals.find((g) => g.id === goalId)
      if (!goal) throw new Error('Goal not found')
      const ms: Milestone = { id: uid(), title, dueDate, done: false }
      const updated = { ...goal, milestones: [...goal.milestones, ms] }
      const res = await saveGoal(updated)
      if (res.error) throw res.error
      return updated
    },
    onMutate: async ({ goalId, title, dueDate }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const previous = qc.getQueryData<Goal[]>(QUERY_KEY)
      const ms: Milestone = { id: `tmp-${Date.now()}`, title, dueDate, done: false }
      qc.setQueryData<Goal[]>(QUERY_KEY, (old = []) =>
        old.map((g) => g.id === goalId ? { ...g, milestones: [...g.milestones, ms] } : g)
      )
      return { previous }
    },
    onError: (_e, _v, ctx) => ctx?.previous && qc.setQueryData(QUERY_KEY, ctx.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false }),
  })
}

export function useToggleMilestone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ goalId, msId }: { goalId: string; msId: string }) => {
      const goals = qc.getQueryData<Goal[]>(QUERY_KEY) ?? []
      const goal = goals.find((g) => g.id === goalId)
      if (!goal) throw new Error('Goal not found')
      const updated = { ...goal, milestones: goal.milestones.map((m) => m.id === msId ? { ...m, done: !m.done } : m) }
      const res = await saveGoal(updated)
      if (res.error) throw res.error
      return updated
    },
    onMutate: async ({ goalId, msId }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const previous = qc.getQueryData<Goal[]>(QUERY_KEY)
      qc.setQueryData<Goal[]>(QUERY_KEY, (old = []) =>
        old.map((g) => {
          if (g.id !== goalId) return g
          return { ...g, milestones: g.milestones.map((m) => m.id === msId ? { ...m, done: !m.done } : m) }
        })
      )
      return { previous }
    },
    onError: (_e, _v, ctx) => ctx?.previous && qc.setQueryData(QUERY_KEY, ctx.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false }),
  })
}

export function useDeleteMilestone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ goalId, msId }: { goalId: string; msId: string }) => {
      const goals = qc.getQueryData<Goal[]>(QUERY_KEY) ?? []
      const goal = goals.find((g) => g.id === goalId)
      if (!goal) throw new Error('Goal not found')
      const updated = { ...goal, milestones: goal.milestones.filter((m) => m.id !== msId) }
      const res = await saveGoal(updated)
      if (res.error) throw res.error
      return updated
    },
    onMutate: async ({ goalId, msId }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const previous = qc.getQueryData<Goal[]>(QUERY_KEY)
      qc.setQueryData<Goal[]>(QUERY_KEY, (old = []) =>
        old.map((g) => g.id === goalId ? { ...g, milestones: g.milestones.filter((m) => m.id !== msId) } : g)
      )
      return { previous }
    },
    onError: (_e, _v, ctx) => ctx?.previous && qc.setQueryData(QUERY_KEY, ctx.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false }),
  })
}

export function useUpdateGoalStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ goalId, status }: { goalId: string; status: Goal['status'] }) => {
      const goals = qc.getQueryData<Goal[]>(QUERY_KEY) ?? []
      const goal = goals.find((g) => g.id === goalId)
      if (!goal) throw new Error('Goal not found')
      const updated = { ...goal, status }
      const res = await saveGoal(updated)
      if (res.error) throw res.error
      return updated
    },
    onMutate: async ({ goalId, status }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const previous = qc.getQueryData<Goal[]>(QUERY_KEY)
      qc.setQueryData<Goal[]>(QUERY_KEY, (old = []) =>
        old.map((g) => g.id === goalId ? { ...g, status } : g)
      )
      return { previous }
    },
    onError: (_e, _v, ctx) => ctx?.previous && qc.setQueryData(QUERY_KEY, ctx.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false }),
  })
}
