/**
 * [WHO]: Habit 新增表单（纯展示 + 表单状态）
 * [FROM]: 依赖 ../hooks/useHabits 的 useCreateHabit；依赖 ../store 的 useHabitsUIStore
 * [TO]: 被 HabitList.tsx 渲染
 * [HERE]: src/features/habits/components/HabitForm.tsx
 */
import { useState } from 'react'
import { IconPlus } from '@tabler/icons-react'
import { useCreateHabit } from '../hooks/useHabits'
import { useHabitsUIStore } from '../store/useHabitsUIStore'
import { uid, today } from '../../../utils/storage'
import type { Habit } from '../../../types'

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每周' },
  { value: 'custom', label: '自定义' },
] as const

const CATEGORY_OPTIONS = [
  { value: 'health', label: '健康' },
  { value: 'study', label: '学习' },
  { value: 'life', label: '生活' },
  { value: 'work', label: '工作' },
] as const

export function HabitForm() {
  const { showForm, setShowForm } = useHabitsUIStore()
  const createHabit = useCreateHabit()
  const [form, setForm] = useState({
    name: '',
    category: 'health',
    frequency: 'daily' as Habit['frequency'],
    frequencyCount: 3,
    frequencyUnit: 'week' as 'week' | 'day',
  })

  const handleSubmit = () => {
    if (!form.name.trim()) return
    const habit: Habit = {
      id: uid(),
      name: form.name,
      category: form.category,
      frequency: form.frequency,
      frequencyCount: form.frequency === 'custom' ? form.frequencyCount : undefined,
      frequencyUnit: form.frequency === 'custom' ? form.frequencyUnit : undefined,
      completedDates: [],
      createdAt: today(),
    }
    createHabit.mutate(habit)
    setForm({ name: '', category: 'health', frequency: 'daily', frequencyCount: 3, frequencyUnit: 'week' })
    setShowForm(false)
  }

  if (!showForm) return null

  return (
    <div className="add-form">
      <div className="form-group">
        <label>习惯名称</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="例如：每天跑步30分钟"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>分类</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>频率</label>
          <select
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value as Habit['frequency'] })}
          >
            {FREQUENCY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      {form.frequency === 'custom' && (
        <div className="form-row">
          <div className="form-group">
            <label>次数</label>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              max="7"
              value={form.frequencyCount}
              onChange={(e) => setForm({ ...form, frequencyCount: Number(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>单位</label>
            <select
              value={form.frequencyUnit}
              onChange={(e) => setForm({ ...form, frequencyUnit: e.target.value as 'week' | 'day' })}
            >
              <option value="week">每周</option>
              <option value="day">每隔N天</option>
            </select>
          </div>
        </div>
      )}
      <button className="btn btn-primary" onClick={handleSubmit}>
        添加习惯
      </button>
    </div>
  )
}
