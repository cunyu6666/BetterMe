/**
 * [WHO]: Plans Feature 数据 Hook
 * [FROM]: 依赖 @tanstack/react-query；依赖 ../api
 * [TO]: 被 components/ 消费
 * [HERE]: src/features/plans/hooks/usePlans.ts
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPlanData, updatePlanData } from '../api'

export function usePlanData(planType: string) {
  const query = useQuery({
    queryKey: ['plan-data', planType],
    queryFn: async () => {
      const res = await getPlanData(planType)
      if (res.error) throw res.error
      return res.data
    },
  })
  return {
    ...query,
    data: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}

export function useSavePlanData(planType: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => updatePlanData(planType, data),
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: ['plan-data', planType] })
      const previous = qc.getQueryData(['plan-data', planType])
      qc.setQueryData(['plan-data', planType], data)
      return { previous }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(['plan-data', planType], ctx.previous)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['plan-data', planType] })
    },
  })
}
