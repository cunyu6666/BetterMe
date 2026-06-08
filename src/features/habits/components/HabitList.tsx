/**
 * [WHO]: Habits Feature 入口组件（列表容器 + L/E/E 三态）
 * [FROM]: 依赖 ../hooks/useHabits 的 useHabits；依赖 ../store 的 useHabitsUIStore
 * [TO]: 被 src/App.tsx 在 tab === 'habits' 时渲染
 * [HERE]: src/features/habits/components/HabitList.tsx - 替代旧 src/components/Habits.tsx
 */
import { IconPlus, IconTarget } from '@tabler/icons-react'
import { useHabits } from '../hooks/useHabits'
import { useHabitsUIStore } from '../store/useHabitsUIStore'
import { HabitItem } from './HabitItem'
import { HabitForm } from './HabitForm'

export default function HabitList() {
  const { habits, isLoading, isError, isEmpty, refetch } = useHabits()
  const { showArchived, toggleShowArchived, showForm, toggleShowForm } = useHabitsUIStore()

  const activeHabits = habits.filter((h) => !h.archived)
  const archivedHabits = habits.filter((h) => h.archived)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="habit-item animate-pulse">
            <div className="w-5 h-5 rounded-full bg-[var(--border)]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[var(--border)] rounded w-1/3" />
              <div className="h-3 bg-[var(--border)] rounded w-1/2" />
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
        <h2 className="text-lg">今日习惯</h2>
        <div className="flex gap-2">
          {archivedHabits.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={toggleShowArchived}>
              {showArchived ? '隐藏归档' : `归档 (${archivedHabits.length})`}
            </button>
          )}
          <button className="btn btn-primary btn-sm flex items-center gap-1" onClick={toggleShowForm}>
            {showForm ? '取消' : <><IconPlus size={14} stroke={2} />新习惯</>}
          </button>
        </div>
      </div>

      <HabitForm />

      {isEmpty && !showForm ? (
        <div className="empty-state">
          <IconTarget size={48} stroke={1} className="icon mx-auto" />
          <p>还没有习惯，点击上方按钮添加一个吧</p>
        </div>
      ) : (
        activeHabits.map((h) => <HabitItem key={h.id} habit={h} />)
      )}

      {showArchived && archivedHabits.length > 0 && (
        <div className="mt-4">
          <div className="text-sm text-[var(--text-light)] mb-2">已归档</div>
          {archivedHabits.map((h) => <HabitItem key={h.id} habit={h} />)}
        </div>
      )}
    </div>
  )
}
