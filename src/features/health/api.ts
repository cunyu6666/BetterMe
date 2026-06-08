/**
 * [WHO]: Health Feature 数据通道
 * [FROM]: 委托 src/lib/api/index.ts
 * [TO]: 被 hooks/useHealth.ts 消费
 * [HERE]: src/features/health/api.ts
 */
import {
  fetchHealthRecords as _fetchHealthRecords,
  upsertHealthRecord as _upsertHealthRecord,
  deleteHealthRecord as _deleteHealthRecord,
} from '../../lib/api/index'
import type { APIResponse } from '../../lib/api/index'
import type { HealthRecord } from '../../types'

export async function getHealthRecords(): Promise<APIResponse<HealthRecord[]>> {
  return _fetchHealthRecords()
}

export async function saveHealthRecord(record: HealthRecord): Promise<APIResponse<void>> {
  return _upsertHealthRecord(record)
}

export async function removeHealthRecord(id: string): Promise<APIResponse<void>> {
  return _deleteHealthRecord(id)
}
