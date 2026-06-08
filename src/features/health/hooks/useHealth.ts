/**
 * [WHO]: Health Feature 数据 Hook
 * [FROM]: 依赖 @tanstack/react-query；依赖 ../api
 * [TO]: 被 components/ 消费
 * [HERE]: src/features/health/hooks/useHealth.ts
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getHealthRecords, saveHealthRecord, removeHealthRecord } from '../api'
import type { HealthRecord } from '../../../types'

const QUERY_KEY = ['health-list']

export function useHealthRecords() {
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await getHealthRecords()
      if (res.error) throw res.error
      return res.data ?? []
    },
  })
  return {
    ...query,
    records: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    isEmpty: !query.isLoading && (query.data?.length ?? 0) === 0,
  }
}

export function useCreateHealthRecord() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (record: HealthRecord) => saveHealthRecord(record),
    onMutate: async (record) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const previous = qc.getQueryData<HealthRecord[]>(QUERY_KEY)
      qc.setQueryData<HealthRecord[]>(QUERY_KEY, (old = []) => [record, ...old])
      return { previous }
    },
    onError: (_e, _v, ctx) => ctx?.previous && qc.setQueryData(QUERY_KEY, ctx.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false }),
  })
}

export function useDeleteHealthRecord() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => removeHealthRecord(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const previous = qc.getQueryData<HealthRecord[]>(QUERY_KEY)
      qc.setQueryData<HealthRecord[]>(QUERY_KEY, (old = []) => old.filter((r) => r.id !== id))
      return { previous }
    },
    onError: (_e, _v, ctx) => ctx?.previous && qc.setQueryData(QUERY_KEY, ctx.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY, exact: false }),
  })
}
