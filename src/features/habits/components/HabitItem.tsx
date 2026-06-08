/**
 * [WHO]: 单个习惯卡片（勾选/连击/热力图/归档/恢复/删除）
 * [FROM]: 依赖 ../hooks/useHabits 的 mutation hooks；依赖 ../store 的 UI 状态
 * [TO]: 被 HabitList.tsx 渲染
 * [HERE]: src/features/habits/components/HabitItem.tsx - 纯展示，所有数据操作通过 hooks
 */
import { IconCheck, IconFlame, IconArchive, IconRestore, IconX } from '@tabler/icons-react'
import { useToggleHabit, useDeleteHabit, useArchiveHabit } from '../hooks/useHabits'
import { useHabitsUIStore } from '../store/useHabitsUIStore'
import { today } from '../../../utils/storage'
import type { Habit } from '../../../types'

const CAT_LABEL: Record<string, string> = { health: '健康', study: '学习', life: '生活', work: '工作' }

function freqLabel(h: Habit): string {
  if (h.frequency === 'daily') return '每天'
  if (h.frequency === 'weekly') return '每周'
  if (h.frequency === 'custom' && h.frequencyUnit === 'week') return `每周${h.frequencyCount}次`
  if (h.frequency === 'custom' && h.frequencyUnit === 'day') return `每隔${h.frequencyCount}天`
  return ''
}

function getStreak(habit: Habit): number {
  let streak = 0
  const d = new Date()
  while (true) {
    const ds = d.toISOString().slice(0, 10)
    if (habit.completedDates.includes(ds)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else break
  }
  return streak
}

function getRate(habit: Habit): number {
  const created = new Date(habit.createdAt)
  const now = new Date()
  const days = Math.max(1, Math.ceil((now.getTime() - created.getTime()) / 86400000))
  return Math.round((habit.completedDates.length / days) * 100)
}

// ── 12周热力图 ──
function CalendarHeatmap({ habit }: { habit: Habit }) {
  const weeks: string[][] = []
  const d = new Date()
  d.setDate(d.getDate() - 83)
  for (let w = 0; w < 12; w++) {
    const week: string[] = []
    for (let i = 0; i < 7; i++) {
      week.push(d.toISOString().slice(0, 10))
      d.setDate(d.getDate() + 1)
    }
    weeks.push(week)
  }
  const dayLabels = ['一', '二', '三', '四', '五', '六', '日']
  return (
    <div className="mt-3">
      <div className="text-xs text-[var(--text-light)] mb-2">最近12周</div>
      <div className="flex gap-0.5">
        <div className="flex flex-col gap-0.5 mr-1">
          {dayLabels.map((l) => (
            <div key={l} className="w-3 h-3 text-[8px] text-[var(--text-light)] flex items-center justify-center">{l}</div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((day) => {
              const done = habit.completedDates.includes(day)
              const isToday = day === today()
              return (
                <div
                  key={day}
                  className={`w-3 h-3 rounded-sm ${done ? 'bg-[var(--success)]' : 'bg-[var(--border)]'} ${isToday ? 'ring-1 ring-[var(--primary)]' : ''}`}
                  title={`${day} ${done ? '✓' : ''}`}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 单项 ──

export function HabitItem({ habit }: { habit: Habit }) {
  const { expandedId, toggleExpanded } = useHabitsUIStore()
  const toggleHabit = useToggleHabit()
  const deleteHabit = useDeleteHabit()
  const archiveHabit = useArchiveHabit()

  const isDone = habit.completedDates.includes(today())
  const isExpanded = expandedId === habit.id
  const streak = getStreak(habit)

  return (
    <div className="habit-item flex-col! items-stretch!">
      <div className="flex items-center gap-3">
        <div
          className={`habit-check ${isDone ? 'done' : ''}`}
          onClick={() => toggleHabit.mutate(habit.id)}
        >
          {isDone ? <IconCheck size={14} stroke={2.5} /> : ''}
        </div>
        <div className="habit-info flex-1" onClick={() => toggleExpanded(habit.id)}>
          <div className="habit-name">{habit.name}</div>
          <div className="habit-meta flex items-center gap-1">
            <span className={`tag tag-${habit.category}`}>{CAT_LABEL[habit.category] || habit.category}</span>
            <span className="text-[var(--text-light)]">· {freqLabel(habit)} · 完成率 {getRate(habit)}%</span>
          </div>
        </div>
        {streak > 0 && (
          <span className="streak-badge flex items-center gap-1">
            <IconFlame size={12} stroke={2} />{streak}天
          </span>
        )}
        {habit.archived ? (
          <button
            className="btn btn-ghost text-xs flex items-center gap-1"
            onClick={() => archiveHabit.mutate({ id: habit.id, archived: false })}
          >
            <IconRestore size={12} stroke={2} />恢复
          </button>
        ) : (
          <button className="delete-btn" onClick={() => deleteHabit.mutate(habit.id)}>
            <IconX size={14} stroke={2} />
          </button>
        )}
      </div>
      {isExpanded && !habit.archived && (
        <div className="mt-2 pt-2 border-t border-[var(--border)]">
          <CalendarHeatmap habit={habit} />
          <div className="mt-2 flex gap-2">
            <button
              className="btn btn-ghost text-xs flex items-center gap-1"
              onClick={() => archiveHabit.mutate({ id: habit.id, archived: true })}
            >
              <IconArchive size={12} stroke={2} />归档
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
