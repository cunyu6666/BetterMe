/**
 * [WHO]: Plans Feature 数据通道
 * [FROM]: 委托 src/lib/api/index.ts
 * [TO]: 被 hooks/usePlans.ts 消费
 * [HERE]: src/features/plans/api.ts
 */
import {
  fetchPlanData as _fetchPlanData,
  savePlanData as _savePlanData,
} from '../../lib/api/index'
import type { APIResponse } from '../../lib/api/index'

export async function getPlanData(planType: string): Promise<APIResponse<Record<string, unknown> | null>> {
  return _fetchPlanData(planType)
}

export async function updatePlanData(planType: string, data: Record<string, unknown>): Promise<APIResponse<void>> {
  return _savePlanData(planType, data)
}
