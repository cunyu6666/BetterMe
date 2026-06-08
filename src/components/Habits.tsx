/**
 * [WHO]: 提供 Habits 默认导出组件（习惯列表 + 新增表单 + 当日勾选 + 连击天数 + 完成率 + 自定义频率 + 日历热力图 + 归档）
 * [FROM]: 依赖 react 的 useState/useEffect；依赖 ../utils/storage 的 uid/today；依赖 ../lib/api 的 CRUD 函数；依赖 ../types 的 Habit
 * [TO]: 被 src/App.tsx 在 tab === 'habits' 时渲染
 * [HERE]: src/components/Habits.tsx - 习惯模块的 CRUD 入口；勾选用当日日期做 toggle key；getStreak 从今日倒推连续完成日；12周日历热力图
 */
import { useState, useEffect } from 'react'
import { uid, today } from '../utils/storage'
import { fetchHabits, upsertHabit, deleteHabit as apiDeleteHabit } from '../lib/api'
import type { Habit } from '../types'

const catLabel: Record<string, string> = { health: '健康', study: '学习', life: '生活', work: '工作' }

export default function Habits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [form, setForm] = useState<{
    name: string; category: string; frequency: 'daily' | 'weekly' | 'custom'
    frequencyCount: number; frequencyUnit: 'week' | 'day'
  }>({ name: '', category: 'health', frequency: 'daily', frequencyCount: 3, frequencyUnit: 'week' })

  useEffect(() => { fetchHabits().then(setHabits).catch(console.error) }, [])

  const activeHabits = habits.filter(h => !h.archived)
  const archivedHabits = habits.filter(h => h.archived)

  const addHabit = () => {
    if (!form.name.trim()) return
    const habit: Habit = {
      id: uid(), name: form.name, category: form.category, frequency: form.frequency,
      frequencyCount: form.frequency === 'custom' ? form.frequencyCount : undefined,
      frequencyUnit: form.frequency === 'custom' ? form.frequencyUnit : undefined,
      completedDates: [], createdAt: today(),
    }
    setHabits(prev => [habit, ...prev])
    upsertHabit(habit).catch(console.error)
    setForm({ name: '', category: 'health', frequency: 'daily', frequencyCount: 3, frequencyUnit: 'week' })
    setShowForm(false)
  }

  const toggle = (id: string) => {
    const d = today()
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h
      const dates = h.completedDates.includes(d)
        ? h.completedDates.filter(x => x !== d)
        : [...h.completedDates, d]
      const updated = { ...h, completedDates: dates }
      upsertHabit(updated).catch(console.error)
      return updated
    }))
  }

  const archive = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h
      const updated = { ...h, archived: true }
      upsertHabit(updated).catch(console.error)
      return updated
    }))
  }

  const unarchive = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h
      const updated = { ...h, archived: false }
      upsertHabit(updated).catch(console.error)
      return updated
    }))
  }

  const handleDeleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id))
    apiDeleteHabit(id).catch(console.error)
  }

  const getStreak = (habit: Habit) => {
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

  const getRate = (habit: Habit) => {
    const created = new Date(habit.createdAt)
    const now = new Date()
    const days = Math.max(1, Math.ceil((now.getTime() - created.getTime()) / 86400000))
    return Math.round((habit.completedDates.length / days) * 100)
  }

  const freqLabel = (h: Habit) => {
    if (h.frequency === 'daily') return '每天'
    if (h.frequency === 'weekly') return '每周'
    if (h.frequency === 'custom' && h.frequencyUnit === 'week') return `每周${h.frequencyCount}次`
    if (h.frequency === 'custom' && h.frequencyUnit === 'day') return `每隔${h.frequencyCount}天`
    return ''
  }

  // 最近12周日历热力图
  const renderCalendar = (habit: Habit) => {
    const weeks: string[][] = []
    const d = new Date()
    d.setDate(d.getDate() - 83) // 12 weeks - 1 day
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
            {dayLabels.map(l => (
              <div key={l} className="w-3 h-3 text-[8px] text-[var(--text-light)] flex items-center justify-center">{l}</div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map(day => {
                const done = habit.completedDates.includes(day)
                const isToday = day === today()
                return (
                  <div key={day}
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

  const renderHabit = (h: Habit) => (
    <div className="habit-item flex-col! items-stretch!" key={h.id}>
      <div className="flex items-center gap-3">
        <div className={`habit-check ${h.completedDates.includes(today()) ? 'done' : ''}`}
          onClick={() => toggle(h.id)}>
          {h.completedDates.includes(today()) ? '✓' : ''}
        </div>
        <div className="habit-info flex-1" onClick={() => setExpandedId(expandedId === h.id ? null : h.id)}>
          <div className="habit-name">{h.name}</div>
          <div className="habit-meta flex items-center gap-1">
            <span className={`tag tag-${h.category}`}>{catLabel[h.category] || h.category}</span>
            <span className="text-[var(--text-light)]">· {freqLabel(h)} · 完成率 {getRate(h)}%</span>
          </div>
        </div>
        {getStreak(h) > 0 && (
          <span className="streak-badge">🔥 {getStreak(h)}天</span>
        )}
        {h.archived ? (
          <button className="btn btn-ghost text-xs" onClick={() => unarchive(h.id)}>恢复</button>
        ) : (
          <button className="delete-btn" onClick={() => handleDeleteHabit(h.id)}>×</button>
        )}
      </div>
      {expandedId === h.id && !h.archived && (
        <div className="mt-2 pt-2 border-t border-[var(--border)]">
          {renderCalendar(h)}
          <div className="mt-2 flex gap-2">
            <button className="btn btn-ghost text-xs" onClick={() => archive(h.id)}>归档</button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div>
      <div className="section-header">
        <h2 className="text-lg">今日习惯</h2>
        <div className="flex gap-2">
          {archivedHabits.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={() => setShowArchived(!showArchived)}>
              {showArchived ? '隐藏归档' : `归档 (${archivedHabits.length})`}
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? '取消' : '+ 新习惯'}
          </button>
        </div>
      </div>
      {showForm && (
        <div className="add-form">
          <div className="form-group">
            <label>习惯名称</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="例如：每天跑步30分钟" onKeyDown={e => e.key === 'Enter' && addHabit()} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>分类</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="health">健康</option>
                <option value="study">学习</option>
                <option value="life">生活</option>
                <option value="work">工作</option>
              </select>
            </div>
            <div className="form-group">
              <label>频率</label>
              <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value as any })}>
                <option value="daily">每天</option>
                <option value="weekly">每周</option>
                <option value="custom">自定义</option>
              </select>
            </div>
          </div>
          {form.frequency === 'custom' && (
            <div className="form-row">
              <div className="form-group">
                <label>次数</label>
                <input type="number" inputMode="numeric" min="1" max="7" value={form.frequencyCount}
                  onChange={e => setForm({ ...form, frequencyCount: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label>单位</label>
                <select value={form.frequencyUnit} onChange={e => setForm({ ...form, frequencyUnit: e.target.value as any })}>
                  <option value="week">每周</option>
                  <option value="day">每隔N天</option>
                </select>
              </div>
            </div>
          )}
          <button className="btn btn-primary" onClick={addHabit}>添加习惯</button>
        </div>
      )}
      {activeHabits.length === 0 && !showForm ? (
        <div className="empty-state">
          <div className="icon">🎯</div>
          <p>还没有习惯，点击上方按钮添加一个吧</p>
        </div>
      ) : activeHabits.map(renderHabit)}
      {showArchived && archivedHabits.length > 0 && (
        <div className="mt-4">
          <div className="text-sm text-[var(--text-light)] mb-2">已归档</div>
          {archivedHabits.map(renderHabit)}
        </div>
      )}
    </div>
  )
}
