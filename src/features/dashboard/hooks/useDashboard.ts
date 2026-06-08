/**
 * [WHO]: Dashboard Feature 数据 Hook
 * [FROM]: 依赖 @tanstack/react-query；依赖 ../api
 * [TO]: 被 components/ 消费
 * [HERE]: src/features/dashboard/hooks/useDashboard.ts
 */
import { useQuery } from '@tanstack/react-query'
import { getDashboardData } from '../api'

export function useDashboard() {
  const query = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      const res = await getDashboardData()
      if (res.error) throw res.error
      return res.data!
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  return {
    ...query,
    habits: query.data?.habits ?? [],
    goals: query.data?.goals ?? [],
    health: query.data?.health ?? [],
    learning: query.data?.learning ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
