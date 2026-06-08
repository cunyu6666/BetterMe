/**
 * [WHO]: 提供 Dashboard 默认导出组件（概览聚合页），展示今日统计 + 周对比 + 睡眠趋势 + 即将到期目标 + 学习进展
 * [FROM]: 依赖 react 的 useState/useEffect；依赖 ../utils/storage 的 today；依赖 ../lib/api 的 fetch 函数
 * [TO]: 被 src/App.tsx 在 tab === 'dashboard' 时渲染；是 7 个一级 tab 中唯一的只读页面
 * [HERE]: src/components/Dashboard.tsx - 跨 4 类数据源的只读聚合层；纯计算 + 展示
 */
import { useState, useEffect } from 'react'
import { today } from '../utils/storage'
import { fetchHabits, fetchGoals, fetchHealthRecords, fetchLearningItems } from '../lib/api'
import type { Habit, Goal, HealthRecord, LearningItem } from '../types'

export default function Dashboard() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [health, setHealth] = useState<HealthRecord[]>([])
  const [learning, setLearning] = useState<LearningItem[]>([])

  useEffect(() => {
    fetchHabits().then(setHabits).catch(console.error)
    fetchGoals().then(setGoals).catch(console.error)
    fetchHealthRecords().then(setHealth).catch(console.error)
    fetchLearningItems().then(setLearning).catch(console.error)
  }, [])

  const todayDate = today()
  const todayHabits = habits.filter(h => h.completedDates.includes(todayDate))
  const todayHealth = health.filter(r => r.date === todayDate)
  const activeGoals = goals.filter(g => g.status === 'active')
  const todayMood = health.filter(r => r.date === todayDate && r.type === 'mood').pop()

  // 本周/上周日期
  const getWeekDates = (offset: number) => {
    const dates: string[] = []
    const d = new Date()
    const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1 // Monday = 0
    d.setDate(d.getDate() - dayOfWeek - offset * 7)
    for (let i = 0; i < 7; i++) {
      dates.push(d.toISOString().slice(0, 10))
      d.setDate(d.getDate() + 1)
    }
    return dates
  }

  const thisWeekDates = getWeekDates(0)
  const lastWeekDates = getWeekDates(1)

  const weekHabitData = thisWeekDates.map(d => {
    const done = habits.filter(h => h.completedDates.includes(d)).length
    return { date: d, done, total: habits.length }
  })

  // 本周 vs 上周习惯完成率
  const thisWeekDone = thisWeekDates.reduce((sum, d) => sum + habits.filter(h => h.completedDates.includes(d)).length, 0)
  const lastWeekDone = lastWeekDates.reduce((sum, d) => sum + habits.filter(h => h.completedDates.includes(d)).length, 0)
  const thisWeekRate = habits.length > 0 ? Math.round(thisWeekDone / (habits.length * 7) * 100) : 0
  const lastWeekRate = habits.length > 0 ? Math.round(lastWeekDone / (habits.length * 7) * 100) : 0
  const weekDiff = thisWeekRate - lastWeekRate

  // 最近7天睡眠
  const getSleepHours = () => {
    const days: { date: string; hours: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const ds = d.toISOString().slice(0, 10)
      const sleep = health.find(r => r.date === ds && r.type === 'sleep')
      let hours = 0
      if (sleep?.data?.sleepTime && sleep?.data?.wakeTime) {
        const [sh, sm] = sleep.data.sleepTime.split(':').map(Number)
        const [wh, wm] = sleep.data.wakeTime.split(':').map(Number)
        hours = ((wh * 60 + wm) - (sh * 60 + sm) + 1440) % 1440 / 60
      }
      days.push({ date: ds, hours })
    }
    return days
  }

  const sleepData = getSleepHours()
  const avgSleep = sleepData.filter(d => d.hours > 0).reduce((s, d) => s + d.hours, 0) / Math.max(1, sleepData.filter(d => d.hours > 0).length)

  // 即将到期的目标（7天内）
  const upcomingGoals = activeGoals
    .filter(g => {
      if (!g.deadline) return false
      const diff = Math.ceil((new Date(g.deadline).getTime() - new Date(todayDate).getTime()) / 86400000)
      return diff >= 0 && diff <= 7
    })
    .sort((a, b) => a.deadline.localeCompare(b.deadline))

  return (
    <div>
      <h2 className="text-lg mb-4">
        {(() => {
          const h = new Date().getHours()
          if (h < 6) return '🌙 夜深了，注意休息'
          if (h < 12) return '🌅 早上好，新的一天开始了'
          if (h < 18) return '☀️ 下午好，继续加油'
          return '🌆 晚上好，回顾一下今天吧'
        })()}
      </h2>

      <div className="stat-grid">
        <div className="stat-box">
          <div className="stat-value">{todayHabits.length}/{habits.length}</div>
          <div className="stat-label">今日习惯</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{activeGoals.length}</div>
          <div className="stat-label">进行中目标</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{todayHealth.length}</div>
          <div className="stat-label">健康记录</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{todayMood ? ['😢','😕','😐','🙂','😄'][todayMood.data.mood-1] : '-'}</div>
          <div className="stat-label">今日心情</div>
        </div>
      </div>

      {/* 周对比 */}
      {habits.length > 0 && (
        <div className="card">
          <div className="card-title">📊 习惯完成对比</div>
          <div className="flex items-center gap-4 mb-3 text-sm">
            <div>
              <span className="text-[var(--text-light)]">本周 </span>
              <span className="font-medium">{thisWeekRate}%</span>
            </div>
            <div>
              <span className="text-[var(--text-light)]">上周 </span>
              <span className="font-medium">{lastWeekRate}%</span>
            </div>
            <div className={weekDiff >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}>
              {weekDiff >= 0 ? '↑' : '↓'} {Math.abs(weekDiff)}%
            </div>
          </div>
          <div className="flex items-end gap-2 h-30 py-3">
            {weekHabitData.map((d, i) => {
              const pct = d.total > 0 ? (d.done / d.total) * 100 : 0
              const dayName = ['日','一','二','三','四','五','六'][new Date(d.date).getDay()]
              return (
                <div key={i} className="flex-1 text-center">
                  <div className="rounded-sm transition-all duration-300 min-h-1"
                    style={{
                      height: Math.max(4, pct) + '%',
                      background: d.date === todayDate ? 'var(--primary)' : 'var(--primary-light)',
                    }} />
                  <div className="text-[11px] text-[var(--text-light)] mt-1">
                    {d.date === todayDate ? '今' : dayName}
                  </div>
                  <div className="text-[10px] text-[#bbb]">{d.done}/{d.total}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 睡眠趋势 */}
      {sleepData.some(d => d.hours > 0) && (
        <div className="card">
          <div className="card-title">😴 最近7天睡眠</div>
          <div className="flex items-center gap-3 mb-2 text-sm">
            <span className="text-[var(--text-light)]">平均</span>
            <span className="font-medium">{avgSleep.toFixed(1)} 小时</span>
          </div>
          <div className="flex items-end gap-2 h-20">
            {sleepData.map((d, i) => {
              const pct = d.hours > 0 ? (d.hours / 10) * 100 : 0
              const dayName = ['日','一','二','三','四','五','六'][new Date(d.date).getDay()]
              return (
                <div key={i} className="flex-1 text-center">
                  <div className="text-[10px] text-[var(--text-light)]">{d.hours > 0 ? d.hours.toFixed(1) : ''}</div>
                  <div className="bg-[var(--info)] rounded-sm mx-auto w-5 transition-all duration-300"
                    style={{ height: Math.max(2, pct) + '%' }} />
                  <div className="text-[11px] text-[var(--text-light)] mt-1">{dayName}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 即将到期 */}
      {upcomingGoals.length > 0 && (
        <div className="card">
          <div className="card-title">⏰ 即将到期的目标</div>
          {upcomingGoals.map(g => {
            const daysLeft = Math.ceil((new Date(g.deadline).getTime() - new Date(todayDate).getTime()) / 86400000)
            return (
              <div key={g.id} className="flex justify-between items-center py-2 border-b border-[var(--border)] last:border-0">
                <div>
                  <div className="text-sm font-medium">{g.title}</div>
                  <div className="text-xs text-[var(--text-light)]">截止: {g.deadline}</div>
                </div>
                <span className={`text-sm font-medium ${daysLeft <= 1 ? 'text-[var(--danger)]' : daysLeft <= 3 ? 'text-[var(--warning)]' : 'text-[var(--text-light)]'}`}>
                  {daysLeft === 0 ? '今天' : daysLeft === 1 ? '明天' : `${daysLeft}天后`}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* 进行中的目标 */}
      {activeGoals.length > 0 && (
        <div className="card">
          <div className="card-title">🎯 进行中的目标</div>
          {activeGoals.slice(0, 3).map(g => {
            const progress = g.tasks.length > 0
              ? Math.round((g.tasks.filter(t => t.done).length / g.tasks.length) * 100)
              : 0
            return (
              <div key={g.id} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>{g.title}</span>
                  <span className="text-[var(--text-light)]">{progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: progress + '%' }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 学习进展 */}
      {learning.length > 0 && (
        <div className="card">
          <div className="card-title">📖 学习进展</div>
          {learning.filter(i => i.type === 'book').slice(0, 3).map(b => (
            <div key={b.id} className="mb-2">
              <div className="flex justify-between text-[13px]">
                <span>{b.title}</span>
                <span className="text-[var(--text-light)]">{b.progress}%</span>
              </div>
              <div className="progress-bar h-1">
                <div className="progress-fill h-1" style={{ width: b.progress + '%' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {(habits.length === 0 && goals.length === 0 && health.length === 0 && learning.length === 0) && (
        <div className="card text-center py-10">
          <div className="text-5xl mb-3">🚀</div>
          <h3 className="mb-2">开始你的 BetterMe 之旅</h3>
          <p className="text-[var(--text-light)] text-sm">
            点击上方标签页，开始记录习惯、设定目标、关注健康、记录学习
          </p>
        </div>
      )}
    </div>
  )
}
