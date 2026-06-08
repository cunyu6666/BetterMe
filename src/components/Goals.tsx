/**
 * [WHO]: 提供 Goals 默认导出组件（目标列表 + 新增表单 + 子任务增删 + 里程碑 + 状态切换 + 进度条 + 到期提醒）
 * [FROM]: 依赖 react 的 useState/useEffect；依赖 ../utils/storage 的 uid/today；依赖 ../lib/api 的 CRUD 函数；依赖 ../types 的 Goal/Milestone
 * [TO]: 被 src/App.tsx 在 tab === 'goals' 时渲染
 * [HERE]: src/components/Goals.tsx - 目标模块的 CRUD 入口；SubtaskInput/MilestoneInput 是同文件内部组件；状态三态 active/completed/abandoned
 */
import { useState, useEffect } from 'react'
import { uid, today } from '../utils/storage'
import { fetchGoals, upsertGoal, deleteGoal as apiDeleteGoal } from '../lib/api'
import type { Goal, Milestone } from '../types'

const priorityLabel: Record<string, string> = { high: '高', medium: '中', low: '低' }

function SubtaskInput({ onAdd }: { onAdd: (title: string) => void }) {
  const [val, setVal] = useState('')
  const handleAdd = () => { onAdd(val); setVal('') }
  return (
    <div className="subtask-input">
      <input value={val} onChange={e => setVal(e.target.value)} placeholder="添加子任务..."
        onKeyDown={e => e.key === 'Enter' && handleAdd()} />
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
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="里程碑名称" className="flex-1" />
      <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-36" />
      <button className="btn btn-primary btn-sm" onClick={handleAdd}>添加</button>
    </div>
  )
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [form, setForm] = useState<{ title: string; description: string; deadline: string; priority: 'high' | 'medium' | 'low' }>({ title: '', description: '', deadline: '', priority: 'medium' })

  useEffect(() => { fetchGoals().then(setGoals).catch(console.error) }, [])

  const syncGoal = (goal: Goal) => {
    setGoals(prev => prev.map(g => g.id === goal.id ? goal : g))
    upsertGoal(goal).catch(console.error)
  }

  const addGoal = () => {
    if (!form.title.trim()) return
    const goal: Goal = { id: uid(), ...form, status: 'active', tasks: [], milestones: [], createdAt: today() }
    setGoals(prev => [goal, ...prev])
    upsertGoal(goal).catch(console.error)
    setForm({ title: '', description: '', deadline: '', priority: 'medium' })
    setShowForm(false)
  }

  const toggleTask = (goalId: string, taskId: string) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return
    const updated = { ...goal, tasks: goal.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t) }
    syncGoal(updated)
  }

  const addTask = (goalId: string, title: string) => {
    if (!title.trim()) return
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return
    const updated = { ...goal, tasks: [...goal.tasks, { id: uid(), title, done: false }] }
    syncGoal(updated)
  }

  const deleteTask = (goalId: string, taskId: string) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return
    const updated = { ...goal, tasks: goal.tasks.filter(t => t.id !== taskId) }
    syncGoal(updated)
  }

  const addMilestone = (goalId: string, title: string, dueDate: string) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return
    const ms: Milestone = { id: uid(), title, dueDate, done: false }
    const updated = { ...goal, milestones: [...goal.milestones, ms] }
    syncGoal(updated)
  }

  const toggleMilestone = (goalId: string, msId: string) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return
    const updated = { ...goal, milestones: goal.milestones.map(m => m.id === msId ? { ...m, done: !m.done } : m) }
    syncGoal(updated)
  }

  const deleteMilestone = (goalId: string, msId: string) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return
    const updated = { ...goal, milestones: goal.milestones.filter(m => m.id !== msId) }
    syncGoal(updated)
  }

  const updateStatus = (goalId: string, status: Goal['status']) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return
    syncGoal({ ...goal, status })
  }

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id))
    apiDeleteGoal(id).catch(console.error)
  }

  const getProgress = (goal: Goal) => {
    if (goal.tasks.length === 0) return 0
    return Math.round((goal.tasks.filter(t => t.done).length / goal.tasks.length) * 100)
  }

  const getDaysLeft = (deadline: string) => {
    if (!deadline) return null
    const diff = Math.ceil((new Date(deadline).getTime() - new Date(today()).getTime()) / 86400000)
    return diff
  }

  return (
    <div>
      <div className="section-header">
        <h2 className="text-lg">我的目标</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? '取消' : '+ 新目标'}
        </button>
      </div>
      {showForm && (
        <div className="add-form">
          <div className="form-group">
            <label>目标标题</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="例如：三个月内学会吉他基础" onKeyDown={e => e.key === 'Enter' && addGoal()} />
          </div>
          <div className="form-group">
            <label>描述</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="详细描述你的目标..." />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>截止日期</label>
              <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div className="form-group">
              <label>优先级</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as 'high' | 'medium' | 'low' })}>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary" onClick={addGoal}>创建目标</button>
        </div>
      )}
      {goals.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🏆</div>
          <p>还没有目标，创建一个开始行动吧</p>
        </div>
      ) : goals.map(g => {
        const daysLeft = getDaysLeft(g.deadline)
        const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3 && g.status === 'active'
        return (
          <div className={`goal-item ${g.status !== 'active' ? 'opacity-60' : ''}`} key={g.id}>
            <div className="goal-header">
              <div className="flex-1 cursor-pointer" onClick={() => setExpandedId(expandedId === g.id ? null : g.id)}>
                <div className="goal-title">
                  {g.status === 'completed' ? '✅ ' : ''}{g.title}
                </div>
                {g.description && <div className="goal-desc">{g.description}</div>}
              </div>
              <div className="flex gap-1">
                <select value={g.status} onChange={e => updateStatus(g.id, e.target.value as Goal['status'])}
                  className="text-xs px-2 py-1 rounded">
                  <option value="active">进行中</option>
                  <option value="completed">已完成</option>
                  <option value="abandoned">已放弃</option>
                </select>
                <button className="delete-btn" onClick={() => handleDeleteGoal(g.id)}>×</button>
              </div>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{
                width: getProgress(g) + '%',
                background: g.status === 'completed' ? 'var(--success)' : 'var(--primary)'
              }} />
            </div>
            <div className="text-xs text-[var(--text-light)] mb-2">
              进度 {getProgress(g)}% · {g.tasks.filter(t => t.done).length}/{g.tasks.length} 个子任务
              {isUrgent && <span className="ml-2 text-[var(--warning)] font-medium">⏰ {daysLeft === 0 ? '今天截止' : `还剩${daysLeft}天`}</span>}
            </div>

            {/* 子任务 */}
            {g.tasks.map(t => (
              <div className="task-item" key={t.id}>
                <div className={`task-check ${t.done ? 'done' : ''}`} onClick={() => toggleTask(g.id, t.id)}>
                  {t.done ? '✓' : ''}
                </div>
                <span className={`task-text ${t.done ? 'done' : ''}`}>{t.title}</span>
                <button className="delete-btn" onClick={() => deleteTask(g.id, t.id)}>×</button>
              </div>
            ))}
            <SubtaskInput onAdd={(title) => addTask(g.id, title)} />

            {/* 里程碑 */}
            {expandedId === g.id && (
              <div className="mt-3 pt-3 border-t border-[var(--border)]">
                <div className="text-xs font-medium text-[var(--text-light)] mb-2">里程碑</div>
                {g.milestones.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {g.milestones.map(m => {
                      const msDaysLeft = getDaysLeft(m.dueDate)
                      return (
                        <div key={m.id} className="flex items-center gap-2 text-sm">
                          <div className={`task-check ${m.done ? 'done' : ''}`} onClick={() => toggleMilestone(g.id, m.id)}>
                            {m.done ? '✓' : ''}
                          </div>
                          <span className={`flex-1 ${m.done ? 'line-through text-[var(--text-light)]' : ''}`}>{m.title}</span>
                          {m.dueDate && (
                            <span className={`text-xs ${msDaysLeft !== null && msDaysLeft <= 3 && !m.done ? 'text-[var(--warning)]' : 'text-[var(--text-light)]'}`}>
                              {m.dueDate}
                            </span>
                          )}
                          <button className="delete-btn" onClick={() => deleteMilestone(g.id, m.id)}>×</button>
                        </div>
                      )
                    })}
                  </div>
                )}
                <MilestoneInput onAdd={(title, dueDate) => addMilestone(g.id, title, dueDate)} />
              </div>
            )}

            <div className="goal-meta">
              <span className={`tag tag-${g.priority}`}>优先级: {priorityLabel[g.priority]}</span>
              {g.deadline && <span>截止: {g.deadline}</span>}
              <span>创建: {g.createdAt}</span>
              {g.milestones.length > 0 && <span>里程碑: {g.milestones.filter(m => m.done).length}/{g.milestones.length}</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
