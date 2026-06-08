/**
 * [WHO]: Goals Feature 入口组件
 * [FROM]: 依赖 ../hooks/useGoals 的 useGoals；依赖 ../store 的 useGoalsUIStore
 * [TO]: 被 src/App.tsx 渲染
 * [HERE]: src/features/goals/components/GoalList.tsx
 */
import { IconPlus, IconTrophy } from '@tabler/icons-react'
import { useGoals } from '../hooks/useGoals'
import { useGoalsUIStore } from '../store/useGoalsUIStore'
import { GoalItem } from './GoalItem'
import { GoalForm } from './GoalForm'

export default function GoalList() {
  const { goals, isLoading, isError, isEmpty, refetch } = useGoals()
  const { showForm, toggleShowForm } = useGoalsUIStore()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="goal-item animate-pulse">
            <div className="h-4 bg-[var(--border)] rounded w-1/3 mb-2" />
            <div className="h-3 bg-[var(--border)] rounded w-2/3 mb-2" />
            <div className="h-2 bg-[var(--border)] rounded w-full" />
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
        <h2 className="text-lg">我的目标</h2>
        <button className="btn btn-primary btn-sm flex items-center gap-1" onClick={toggleShowForm}>
          {showForm ? '取消' : <><IconPlus size={14} stroke={2} />新目标</>}
        </button>
      </div>

      <GoalForm />

      {isEmpty && !showForm ? (
        <div className="empty-state">
          <IconTrophy size={48} stroke={1} className="icon mx-auto" />
          <p>还没有目标，创建一个开始行动吧</p>
        </div>
      ) : (
        goals.map((g) => <GoalItem key={g.id} goal={g} />)
      )}
    </div>
  )
}
