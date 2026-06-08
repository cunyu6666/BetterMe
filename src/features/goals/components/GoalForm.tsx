/**
 * [WHO]: Goal 新增表单
 * [FROM]: 依赖 ../hooks/useGoals 的 useCreateGoal；依赖 ../store 的 useGoalsUIStore
 * [TO]: 被 GoalList.tsx 渲染
 * [HERE]: src/features/goals/components/GoalForm.tsx
 */
import { useState } from 'react'
import { useCreateGoal } from '../hooks/useGoals'
import { useGoalsUIStore } from '../store/useGoalsUIStore'
import { uid, today } from '../../../utils/storage'
import type { Goal } from '../../../types'

export function GoalForm() {
  const { showForm, setShowForm } = useGoalsUIStore()
  const createGoal = useCreateGoal()
  const [form, setForm] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium' as Goal['priority'],
  })

  const handleSubmit = () => {
    if (!form.title.trim()) return
    const goal: Goal = {
      id: uid(),
      title: form.title,
      description: form.description,
      deadline: form.deadline,
      priority: form.priority,
      status: 'active',
      tasks: [],
      milestones: [],
      createdAt: today(),
    }
    createGoal.mutate(goal)
    setForm({ title: '', description: '', deadline: '', priority: 'medium' })
    setShowForm(false)
  }

  if (!showForm) return null

  return (
    <div className="add-form">
      <div className="form-group">
        <label>目标标题</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="例如：三个月内学会吉他基础"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
      </div>
      <div className="form-group">
        <label>描述</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="详细描述你的目标..."
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>截止日期</label>
          <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
        </div>
        <div className="form-group">
          <label>优先级</label>
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Goal['priority'] })}>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>
      </div>
      <button className="btn btn-primary" onClick={handleSubmit}>创建目标</button>
    </div>
  )
}
