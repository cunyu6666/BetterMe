/**
 * [WHO]: 单条健康记录展示
 * [FROM]: 依赖 ../hooks/useHealth 的 useDeleteHealthRecord
 * [TO]: 被 HealthList.tsx 渲染
 * [HERE]: src/features/health/components/HealthItem.tsx
 */
import { IconRun, IconBowlChopsticks, IconMoonStars, IconMoodSmile, IconX } from '@tabler/icons-react'
import { useDeleteHealthRecord } from '../hooks/useHealth'
import type { HealthRecord } from '../../../types'

const TYPE_CONFIG = {
  exercise: { icon: IconRun, label: '运动', color: 'var(--success-subtle)' },
  diet: { icon: IconBowlChopsticks, label: '饮食', color: 'var(--warning-subtle)' },
  sleep: { icon: IconMoonStars, label: '睡眠', color: 'var(--info-subtle)' },
  mood: { icon: IconMoodSmile, label: '情绪', color: 'var(--primary-subtle)' },
}

const MOOD_EMOJIS = ['😢','😕','😐','🙂','😄']
const QUALITY_EMOJIS = ['😫','😔','😐','🙂','😊']

function renderContent(r: HealthRecord): string {
  switch (r.type) {
    case 'exercise':
      return `${r.data.exerciseType || '运动'} · ${r.data.duration || '?'}分钟 · ${r.data.intensity === 'high' ? '高强度' : r.data.intensity === 'low' ? '低强度' : '中等强度'}`
    case 'diet':
      return `${({ breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' } as Record<string,string>)[r.data.meal] || '饮食'} · ${r.data.content || ''} ${r.data.calories ? r.data.calories + '千卡' : ''}`
    case 'sleep':
      return `${r.data.sleepTime || '?'} - ${r.data.wakeTime || '?'} · 质量 ${r.data.quality ? QUALITY_EMOJIS[r.data.quality-1] : '?'}`
    case 'mood':
      return `心情 ${r.data.mood ? MOOD_EMOJIS[r.data.mood-1] : '?'} ${r.data.note ? '· ' + r.data.note : ''}`
  }
}

export function HealthItem({ record, showDate = false }: { record: HealthRecord; showDate?: boolean }) {
  const deleteRecord = useDeleteHealthRecord()
  const cfg = TYPE_CONFIG[record.type]
  const Icon = cfg.icon

  return (
    <div className="health-record">
      <div className="health-icon" style={{ background: cfg.color }}>
        <Icon size={18} stroke={1.8} style={{ color: 'var(--text)' }} />
      </div>
      <div className="health-details">
        <div className="health-type">{cfg.label}</div>
        <div className="health-meta">{showDate ? `${record.date} · ` : ''}{renderContent(record)}</div>
      </div>
      <button className="delete-btn" onClick={() => deleteRecord.mutate(record.id)}><IconX size={14} stroke={2} /></button>
    </div>
  )
}
