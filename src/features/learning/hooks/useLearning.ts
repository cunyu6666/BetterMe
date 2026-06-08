/**
 * [WHO]: Learning Feature 数据 Hook
 * [FROM]: 依赖 @tanstack/react-query；依赖 ../api
 * [TO]: 被 components/ 消费
 * [HERE]: src/features/learning/hooks/useLearning.ts
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLearningItems, saveLearningItem, removeLearningItem } from '../api'
import type { LearningItem } from '../../../types'

const QUERY_KEY = ['learning-list']

export function useLearningItems() {
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await getLearningItems()
      if (res.error) throw res.error
      return res.data ?? []
    },
  })
  return {
    ...query,
    items: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    isEmpty: !query.isLoading && (query.data?.length ?? 0) === 0,
  }
}

export function useCreateLearningItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (item: LearningItem) => saveLearningItem(item),
    onMutate: async (item) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const previous = qc.getQueryData<LearningItem[]>(QUERY_KEY)
      qc.setQueryData<LearningItem[]>(QUERY_KEY, (old = []) => [item, ...old])
      return { previous }
    },
    onError: (_e, _v, ctx) => ctx?.previous && qc.setQueryData(QUERY_KEY, ctx.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false }),
  })
}

export function useUpdateLearningItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (item: LearningItem) => saveLearningItem(item),
    onMutate: async (item) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const previous = qc.getQueryData<LearningItem[]>(QUERY_KEY)
      qc.setQueryData<LearningItem[]>(QUERY_KEY, (old = []) =>
        old.map((i) => (i.id === item.id ? item : i))
      )
      return { previous }
    },
    onError: (_e, _v, ctx) => ctx?.previous && qc.setQueryData(QUERY_KEY, ctx.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false }),
  })
}

export function useDeleteLearningItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => removeLearningItem(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const previous = qc.getQueryData<LearningItem[]>(QUERY_KEY)
      qc.setQueryData<LearningItem[]>(QUERY_KEY, (old = []) => old.filter((i) => i.id !== id))
      return { previous }
    },
    onError: (_e, _v, ctx) => ctx?.previous && qc.setQueryData(QUERY_KEY, ctx.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false }),
  })
}

export function useUpdateProgress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, progress }: { id: string; progress: number }) => {
      const items = qc.getQueryData<LearningItem[]>(QUERY_KEY) ?? []
      const item = items.find((i) => i.id === id)
      if (!item) throw new Error('Item not found')
      const updated = { ...item, progress }
      const res = await saveLearningItem(updated)
      if (res.error) throw res.error
      return updated
    },
    onMutate: async ({ id, progress }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const previous = qc.getQueryData<LearningItem[]>(QUERY_KEY)
      qc.setQueryData<LearningItem[]>(QUERY_KEY, (old = []) =>
        old.map((i) => (i.id === id ? { ...i, progress } : i))
      )
      return { previous }
    },
    onError: (_e, _v, ctx) => ctx?.previous && qc.setQueryData(QUERY_KEY, ctx.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false }),
  })
}
