/**
 * [WHO]: 单个学习项卡片
 * [FROM]: 依赖 ../hooks/useLearning 的 mutation hooks
 * [TO]: 被 LearningList.tsx 渲染
 * [HERE]: src/features/learning/components/LearningItem.tsx
 */
import { IconX } from '@tabler/icons-react'
import { useDeleteLearningItem, useUpdateProgress } from '../hooks/useLearning'
import type { LearningItem } from '../../../types'

export function LearningItemCard({ item }: { item: LearningItem }) {
  const deleteItem = useDeleteLearningItem()
  const updateProgress = useUpdateProgress()

  return (
    <div className="border-b border-[var(--border-light)] py-3">
      <div className="flex justify-between items-center mb-1">
        <div className="font-medium text-sm">{item.title}</div>
        <button className="delete-btn" onClick={() => deleteItem.mutate(item.id)}><IconX size={14} stroke={2} /></button>
      </div>
      {item.type !== 'note' && (
        <>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: item.progress + '%' }} />
          </div>
          <div className="text-xs text-[var(--text-light)] mb-1">
            进度 {item.progress}%{item.hours ? ` · ${item.hours}小时` : ''}
            <input type="range" min="0" max="100" value={item.progress}
              onChange={(e) => updateProgress.mutate({ id: item.id, progress: Number(e.target.value) })}
              className="w-20 ml-2 align-middle" />
          </div>
        </>
      )}
      {item.content && <div className="text-[13px] text-[var(--text-light)] mt-1">{item.content}</div>}
      {item.tags && item.tags.length > 0 && (
        <div className="note-tags">
          {item.tags.map((t) => <span key={t} className="note-tag">{t}</span>)}
        </div>
      )}
      <div className="text-[11px] text-[var(--text-muted)] mt-1">{item.createdAt}</div>
    </div>
  )
}
