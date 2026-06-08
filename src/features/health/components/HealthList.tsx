/**
 * [WHO]: Health Feature 入口组件
 * [FROM]: 依赖 ../hooks/useHealth 的 useHealthRecords；依赖 ../store 的 useHealthUIStore
 * [TO]: 被 src/App.tsx 渲染
 * [HERE]: src/features/health/components/HealthList.tsx
 */
import { IconPlus, IconHeart, IconClock, IconMoonStars, IconMoodSmile } from '@tabler/icons-react'
import { useHealthRecords } from '../hooks/useHealth'
import { useHealthUIStore } from '../store/useHealthUIStore'
import { HealthItem } from './HealthItem'
import { HealthForm } from './HealthForm'
import { today } from '../../../utils/storage'

const MOOD_EMOJIS = ['😢','😕','😐','🙂','😄']
const QUALITY_EMOJIS = ['😫','😔','😐','🙂','😊']

function SleepTrend({ records }: { records: import('../../../types').HealthRecord[] }) {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); days.push(d.toISOString().slice(0, 10))
  }
  const trend = days.map((d) => {
    const sleep = records.find((r) => r.date === d && r.type === 'sleep')
    let hours = 0
    if (sleep?.data?.sleepTime && sleep?.data?.wakeTime) {
      const [sh, sm] = sleep.data.sleepTime.split(':').map(Number)
      const [wh, wm] = sleep.data.wakeTime.split(':').map(Number)
      hours = ((wh * 60 + wm) - (sh * 60 + sm) + 1440) % 1440 / 60
    }
    return { date: d, hours, quality: sleep?.data?.quality || 0 }
  })

  return (
    <div className="card">
      <div className="card-title">
        <IconMoonStars size={18} stroke={1.8} className="icon" />
        最近7天睡眠
      </div>
      <div className="flex items-end gap-2 h-24">
        {trend.map((d, i) => {
          const pct = d.hours > 0 ? (d.hours / 10) * 100 : 0
          const dayName = ['日','一','二','三','四','五','六'][new Date(d.date).getDay()]
          return (
            <div key={i} className="flex-1 text-center">
              <div className="text-[10px] text-[var(--text-light)]">{d.hours > 0 ? d.hours.toFixed(1) + 'h' : ''}</div>
              <div className="rounded-sm mx-auto w-4 transition-all duration-300"
                style={{ height: Math.max(2, pct) + '%', background: 'var(--info)' }} />
              <div className="text-[11px] text-[var(--text-light)] mt-1">{dayName}</div>
              {d.quality > 0 && <div className="text-xs">{QUALITY_EMOJIS[d.quality-1]}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MoodCalendar({ records }: { records: import('../../../types').HealthRecord[] }) {
  const days: string[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); days.push(d.toISOString().slice(0, 10))
  }
  const calendar = days.map((d) => {
    const mood = records.find((r) => r.date === d && r.type === 'mood')
    return { date: d, mood: mood?.data?.mood || 0, note: mood?.data?.note || '' }
  })
  const dayLabels = ['一','二','三','四','五','六','日']
  const weeks: typeof calendar[] = []
  for (let i = 0; i < calendar.length; i += 7) weeks.push(calendar.slice(i, i + 7))

  return (
    <div className="card">
      <div className="card-title">
        <IconMoodSmile size={18} stroke={1.8} className="icon" />
        最近30天心情
      </div>
      <div className="flex gap-0.5">
        <div className="flex flex-col gap-0.5 mr-1">
          {dayLabels.map((l) => (
            <div key={l} className="w-5 h-5 text-[9px] text-[var(--text-light)] flex items-center justify-center">{l}</div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((d) => (
              <div key={d.date}
                className={`w-5 h-5 rounded-sm flex items-center justify-center text-xs cursor-default ${d.mood === 0 ? 'bg-[var(--border)]' : ''}`}
                style={d.mood > 0 ? { background: 'var(--primary-subtle)' } : undefined}
                title={`${d.date} ${d.mood > 0 ? MOOD_EMOJIS[d.mood-1] : '无记录'}${d.note ? ': ' + d.note : ''}`}>
                {d.mood > 0 ? MOOD_EMOJIS[d.mood-1] : ''}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HealthList() {
  const { records, isLoading, isError, isEmpty, refetch } = useHealthRecords()
  const { showForm, toggleShowForm } = useHealthUIStore()

  const todayRecords = records.filter((r) => r.date === today())
  const historyRecords = records.filter((r) => r.date !== today())

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="health-record animate-pulse">
            <div className="w-10 h-10 rounded-lg bg-[var(--border)]" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-[var(--border)] rounded w-1/4" />
              <div className="h-3 bg-[var(--border)] rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-[var(--text-muted)] mb-3">加载失败，请重试</p>
        <button className="btn btn-primary btn-sm" onClick={() => refetch()}>重试</button>
      </div>
    )
  }

  return (
    <div>
      <div className="section-header">
        <h2 className="text-lg font-semibold">身心健康</h2>
        <button className="btn btn-primary btn-sm flex items-center gap-1" onClick={toggleShowForm}>
          {showForm ? '取消' : <><IconPlus size={14} stroke={2} />记录</>}
        </button>
      </div>

      <HealthForm />

      {isEmpty && !showForm ? (
        <div className="empty-state">
          <IconHeart size={48} stroke={1} className="icon mx-auto" />
          <p>今天还没有健康记录，开始记录吧</p>
        </div>
      ) : todayRecords.length > 0 && (
        <div className="card">
          <div className="card-title">
            <IconClock size={18} stroke={1.8} className="icon" />
            今日记录
          </div>
          {todayRecords.map((r) => <HealthItem key={r.id} record={r} />)}
        </div>
      )}

      <SleepTrend records={records} />
      <MoodCalendar records={records} />

      {historyRecords.length > 0 && (
        <div className="card mt-3">
          <div className="card-title">历史记录</div>
          {historyRecords.slice(0, 20).map((r) => <HealthItem key={r.id} record={r} showDate />)}
        </div>
      )}
    </div>
  )
}
