/**
 * [WHO]: 全局 TanStack QueryClient 配置
 * [FROM]: 依赖 @tanstack/react-query
 * [TO]: 被 main.tsx 的 QueryClientProvider 消费
 * [HERE]: src/lib/queryClient.ts - 全局查询客户端；默认错误处理；staleTime 配置
 */
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => {
        console.error('[Mutation Error]', error)
        // TODO: 接入全局 Toast 通知
      },
    },
  },
})
