/**
 * [WHO]: Learning Feature 数据通道
 * [FROM]: 委托 src/lib/api/index.ts
 * [TO]: 被 hooks/useLearning.ts 消费
 * [HERE]: src/features/learning/api.ts
 */
import {
  fetchLearningItems as _fetchLearningItems,
  upsertLearningItem as _upsertLearningItem,
  deleteLearningItem as _deleteLearningItem,
} from '../../lib/api/index'
import type { APIResponse } from '../../lib/api/index'
import type { LearningItem } from '../../types'

export async function getLearningItems(): Promise<APIResponse<LearningItem[]>> {
  return _fetchLearningItems()
}

export async function saveLearningItem(item: LearningItem): Promise<APIResponse<void>> {
  return _upsertLearningItem(item)
}

export async function removeLearningItem(id: string): Promise<APIResponse<void>> {
  return _deleteLearningItem(id)
}
