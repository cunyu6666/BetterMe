/**
 * [WHO]: 单个目标卡片（子任务/里程碑/状态切换/进度条/到期提醒）
 * [FROM]: 依赖 ../hooks/useGoals 的 mutation hooks；依赖 ../store 的 UI 状态
 * [TO]: 被 GoalList.tsx 渲染
 * [HERE]: src/features/goals/components/GoalItem.tsx
 */
import { useState } from 'react'
import { IconPlus, IconCheck, IconCircleCheck, IconClock, IconX } from '@tabler/icons-react'
import {
  useToggleTask, useAddTask, useDeleteTask,
  useAddMilestone, useToggleMilestone, useDeleteMilestone,
  useUpdateGoalStatus, useDeleteGoal,
} from '../hooks/useGoals'
import { useGoalsUIStore } from '../store/useGoalsUIStore'
import { today } from '../../../utils/storage'
import type { Goal } from '../../../types'

const PRIORITY_LABEL: Record<string, string> = { high: '高', medium: '中', low: '低' }

function SubtaskInput({ onAdd }: { onAdd: (title: string) => void }) {
  const [val, setVal] = useState('')
  const handleAdd = () => { if (val.trim()) { onAdd(val); setVal('') } }
  return (
    <div className="subtask-input">
      <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="添加子任务..."
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
      <button className="btn btn-primary btn-sm" onClick={handleAdd}>添加</button>
    </div>
  )
}

function MilestoneInput({ onAdd }: { onAdd: (title: string, dueDate: string) => void }) {
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const handleAdd = () => { if (title.trim()) { onAdd(title, dueDate); setTitle(''); setDueDate('') } }
  return (
    <div className="flex gap-2 mt-2">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="里程碑名称" className="flex-1" />
      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-36" />
      <button className="btn btn-primary btn-sm" onClick={handleAdd}>添加</button>
    </div>
  )
}

export function GoalItem({ goal }: { goal: Goal }) {
  const { expandedId, toggleExpanded } = useGoalsUIStore()
  const toggleTask = useToggleTask()
  const addTask = useAddTask()
  const deleteTask = useDeleteTask()
  const addMilestone = useAddMilestone()
  const toggleMilestone = useToggleMilestone()
  const deleteMilestone = useDeleteMilestone()
  const updateStatus = useUpdateGoalStatus()
  const deleteGoal = useDeleteGoal()

  const isExpanded = expandedId === goal.id
  const progress = goal.tasks.length > 0
    ? Math.round((goal.tasks.filter((t) => t.done).length / goal.tasks.length) * 100)
    : 0
  const daysLeft = goal.deadline
    ? Math.ceil((new Date(goal.deadline).getTime() - new Date(today()).getTime()) / 86400000)
    : null
  const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3 && goal.status === 'active'

  return (
    <div className={`goal-item ${goal.status !== 'active' ? 'opacity-60' : ''}`}>
      <div className="goal-header">
        <div className="flex-1 cursor-pointer" onClick={() => toggleExpanded(goal.id)}>
          <div className="goal-title flex items-center gap-1.5">
            {goal.status === 'completed' && <IconCircleCheck size={16} stroke={2} style={{ color: 'var(--success)' }} />}
            {goal.title}
          </div>
          {goal.description && <div className="goal-desc">{goal.description}</div>}
        </div>
        <div className="flex gap-1">
          <select value={goal.status} onChange={(e) => updateStatus.mutate({ goalId: goal.id, status: e.target.value as Goal['status'] })}
            className="text-xs px-2 py-1 rounded">
            <option value="active">进行中</option>
            <option value="completed">已完成</option>
            <option value="abandoned">已放弃</option>
          </select>
          <button className="delete-btn" onClick={() => deleteGoal.mutate(goal.id)}><IconX size={14} stroke={2} /></button>
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{
          width: progress + '%',
          background: goal.status === 'completed' ? 'var(--success)' : 'var(--primary)',
        }} />
      </div>
      <div className="text-xs text-[var(--text-light)] mb-2">
        进度 {progress}% · {goal.tasks.filter((t) => t.done).length}/{goal.tasks.length} 个子任务
        {isUrgent && <span className="ml-2 text-[var(--warning)] font-medium flex items-center gap-1"><IconClock size={12} stroke={2} />{daysLeft === 0 ? '今天截止' : `还剩${daysLeft}天`}</span>}
      </div>

      {goal.tasks.map((t) => (
        <div className="task-item" key={t.id}>
          <div className={`task-check ${t.done ? 'done' : ''}`} onClick={() => toggleTask.mutate({ goalId: goal.id, taskId: t.id })}>
            {t.done ? <IconCheck size={12} stroke={2.5} /> : ''}
          </div>
          <span className={`task-text ${t.done ? 'done' : ''}`}>{t.title}</span>
          <button className="delete-btn" onClick={() => deleteTask.mutate({ goalId: goal.id, taskId: t.id })}><IconX size={12} stroke={2} /></button>
        </div>
      ))}
      <SubtaskInput onAdd={(title) => addTask.mutate({ goalId: goal.id, title })} />

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-[var(--border)]">
          <div className="text-xs font-medium text-[var(--text-light)] mb-2">里程碑</div>
          {goal.milestones.length > 0 && (
            <div className="space-y-1 mb-2">
              {goal.milestones.map((m) => {
                const msDaysLeft = m.dueDate ? Math.ceil((new Date(m.dueDate).getTime() - new Date(today()).getTime()) / 86400000) : null
                return (
                  <div key={m.id} className="flex items-center gap-2 text-sm">
                    <div className={`task-check ${m.done ? 'done' : ''}`} onClick={() => toggleMilestone.mutate({ goalId: goal.id, msId: m.id })}>
                      {m.done ? <IconCheck size={12} stroke={2.5} /> : ''}
                    </div>
                    <span className={`flex-1 ${m.done ? 'line-through text-[var(--text-light)]' : ''}`}>{m.title}</span>
                    {m.dueDate && (
                      <span className={`text-xs ${msDaysLeft !== null && msDaysLeft <= 3 && !m.done ? 'text-[var(--warning)]' : 'text-[var(--text-light)]'}`}>
                        {m.dueDate}
                      </span>
                    )}
                    <button className="delete-btn" onClick={() => deleteMilestone.mutate({ goalId: goal.id, msId: m.id })}><IconX size={12} stroke={2} /></button>
                  </div>
                )
              })}
            </div>
          )}
          <MilestoneInput onAdd={(title, dueDate) => addMilestone.mutate({ goalId: goal.id, title, dueDate })} />
        </div>
      )}

      <div className="goal-meta">
        <span className={`tag tag-${goal.priority}`}>优先级: {PRIORITY_LABEL[goal.priority]}</span>
        {goal.deadline && <span>截止: {goal.deadline}</span>}
        <span>创建: {goal.createdAt}</span>
        {goal.milestones.length > 0 && <span>里程碑: {goal.milestones.filter((m) => m.done).length}/{goal.milestones.length}</span>}
      </div>
    </div>
  )
}
