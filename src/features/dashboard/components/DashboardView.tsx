/**
 * [WHO]: Dashboard Feature 入口组件（只读聚合页）
 * [FROM]: 依赖 ../hooks/useDashboard
 * [TO]: 被 src/App.tsx 渲染
 * [HERE]: src/features/dashboard/components/DashboardView.tsx
 */
import { IconTarget, IconTrophy, IconHeart, IconMoodSmile, IconMoonStars, IconClock, IconBook, IconSparkles, IconTrendingUp, IconTrendingDown, IconFlame, IconTargetArrow } from '@tabler/icons-react'
import { useDashboard } from '../hooks/useDashboard'
import { today } from '../../../utils/storage'

const MOOD_EMOJIS = ['😢','😕','😐','🙂','😄']

export default function DashboardView() {
  const { habits, goals, health, learning, isLoading, isError, refetch } = useDashboard()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-[var(--border)] rounded w-1/3 animate-pulse" />
        <div className="stat-grid">
          {[1, 2, 3, 4].map((i) => <div key={i} className="stat-box animate-pulse"><div className="h-12 bg-[var(--border)] rounded" /></div>)}
        </div>
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

  const todayDate = today()
  const todayHabits = habits.filter((h) => h.completedDates.includes(todayDate))
  const todayHealth = health.filter((r) => r.date === todayDate)
  const activeGoals = goals.filter((g) => g.status === 'active')
  const todayMood = health.filter((r) => r.date === todayDate && r.type === 'mood').pop()

  const getWeekDates = (offset: number) => {
    const dates: string[] = []
    const d = new Date()
    const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1
    d.setDate(d.getDate() - dayOfWeek - offset * 7)
    for (let i = 0; i < 7; i++) { dates.push(d.toISOString().slice(0, 10)); d.setDate(d.getDate() + 1) }
    return dates
  }

  const thisWeekDates = getWeekDates(0)
  const lastWeekDates = getWeekDates(1)

  const weekHabitData = thisWeekDates.map((d) => ({
    date: d, done: habits.filter((h) => h.completedDates.includes(d)).length, total: habits.length,
  }))

  const thisWeekDone = thisWeekDates.reduce((sum, d) => sum + habits.filter((h) => h.completedDates.includes(d)).length, 0)
  const lastWeekDone = lastWeekDates.reduce((sum, d) => sum + habits.filter((h) => h.completedDates.includes(d)).length, 0)
  const thisWeekRate = habits.length > 0 ? Math.round(thisWeekDone / (habits.length * 7) * 100) : 0
  const lastWeekRate = habits.length > 0 ? Math.round(lastWeekDone / (habits.length * 7) * 100) : 0
  const weekDiff = thisWeekRate - lastWeekRate

  const getSleepHours = () => {
    const days: { date: string; hours: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const ds = d.toISOString().slice(0, 10)
      const sleep = health.find((r) => r.date === ds && r.type === 'sleep')
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
  const avgSleep = sleepData.filter((d) => d.hours > 0).reduce((s, d) => s + d.hours, 0) / Math.max(1, sleepData.filter((d) => d.hours > 0).length)

  const upcomingGoals = activeGoals
    .filter((g) => {
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
          if (h < 6) return '夜深了，注意休息'
          if (h < 12) return '早上好，新的一天开始了'
          if (h < 18) return '下午好，继续加油'
          return '晚上好，回顾一下今天吧'
        })()}
      </h2>

      <div className="stat-grid">
        <div className="stat-box">
          <IconTarget size={20} stroke={1.5} className="mx-auto mb-1" style={{ color: 'var(--primary)' }} />
          <div className="stat-value">{todayHabits.length}/{habits.length}</div>
          <div className="stat-label">今日习惯</div>
        </div>
        <div className="stat-box">
          <IconTrophy size={20} stroke={1.5} className="mx-auto mb-1" style={{ color: 'var(--warning)' }} />
          <div className="stat-value">{activeGoals.length}</div>
          <div className="stat-label">进行中目标</div>
        </div>
        <div className="stat-box">
          <IconHeart size={20} stroke={1.5} className="mx-auto mb-1" style={{ color: 'var(--success)' }} />
          <div className="stat-value">{todayHealth.length}</div>
          <div className="stat-label">健康记录</div>
        </div>
        <div className="stat-box">
          <IconMoodSmile size={20} stroke={1.5} className="mx-auto mb-1" style={{ color: 'var(--info)' }} />
          <div className="stat-value">{todayMood ? MOOD_EMOJIS[todayMood.data.mood-1] : '-'}</div>
          <div className="stat-label">今日心情</div>
        </div>
      </div>

      {habits.length > 0 && (
        <div className="card">
          <div className="card-title"><IconFlame size={18} stroke={1.8} className="icon" />习惯完成对比</div>
          <div className="flex items-center gap-4 mb-3 text-sm">
            <div><span className="text-[var(--text-light)]">本周 </span><span className="font-medium">{thisWeekRate}%</span></div>
            <div><span className="text-[var(--text-light)]">上周 </span><span className="font-medium">{lastWeekRate}%</span></div>
            <div className={`flex items-center gap-1 ${weekDiff >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
              {weekDiff >= 0 ? <IconTrendingUp size={14} /> : <IconTrendingDown size={14} />}
              {Math.abs(weekDiff)}%
            </div>
          </div>
          <div className="flex items-end gap-2 h-30 py-3">
            {weekHabitData.map((d, i) => {
              const pct = d.total > 0 ? (d.done / d.total) * 100 : 0
              const dayName = ['日','一','二','三','四','五','六'][new Date(d.date).getDay()]
              return (
                <div key={i} className="flex-1 text-center">
                  <div className="rounded-sm transition-all duration-300 min-h-1"
                    style={{ height: Math.max(4, pct) + '%', background: d.date === todayDate ? 'var(--primary)' : 'var(--primary-light)', opacity: d.date === todayDate ? 1 : 0.5 }} />
                  <div className="text-[11px] text-[var(--text-light)] mt-1">{d.date === todayDate ? '今' : dayName}</div>
                  <div className="text-[10px] text-[var(--text-muted)]">{d.done}/{d.total}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {sleepData.some((d) => d.hours > 0) && (
        <div className="card">
          <div className="card-title"><IconMoonStars size={18} stroke={1.8} className="icon" />最近7天睡眠</div>
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
                  <div className="rounded-sm mx-auto w-5 transition-all duration-300" style={{ height: Math.max(2, pct) + '%', background: 'var(--info)' }} />
                  <div className="text-[11px] text-[var(--text-light)] mt-1">{dayName}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {upcomingGoals.length > 0 && (
        <div className="card">
          <div className="card-title"><IconClock size={18} stroke={1.8} className="icon" />即将到期的目标</div>
          {upcomingGoals.map((g) => {
            const daysLeft = Math.ceil((new Date(g.deadline).getTime() - new Date(todayDate).getTime()) / 86400000)
            return (
              <div key={g.id} className="flex justify-between items-center py-2 border-b border-[var(--border-light)] last:border-0">
                <div>
                  <div className="text-sm font-medium">{g.title}</div>
                  <div className="text-xs text-[var(--text-muted)]">截止: {g.deadline}</div>
                </div>
                <span className={`text-sm font-medium ${daysLeft <= 1 ? 'text-[var(--danger)]' : daysLeft <= 3 ? 'text-[var(--warning)]' : 'text-[var(--text-light)]'}`}>
                  {daysLeft === 0 ? '今天' : daysLeft === 1 ? '明天' : `${daysLeft}天后`}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {activeGoals.length > 0 && (
        <div className="card">
          <div className="card-title"><IconTargetArrow size={18} stroke={1.8} className="icon" />进行中的目标</div>
          {activeGoals.slice(0, 3).map((g) => {
            const progress = g.tasks.length > 0 ? Math.round((g.tasks.filter((t) => t.done).length / g.tasks.length) * 100) : 0
            return (
              <div key={g.id} className="mb-3">
                <div className="flex justify-between text-sm mb-1"><span>{g.title}</span><span className="text-[var(--text-light)]">{progress}%</span></div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: progress + '%' }} /></div>
              </div>
            )
          })}
        </div>
      )}

      {learning.length > 0 && (
        <div className="card">
          <div className="card-title"><IconBook size={18} stroke={1.8} className="icon" />学习进展</div>
          {learning.filter((i) => i.type === 'book').slice(0, 3).map((b) => (
            <div key={b.id} className="mb-2">
              <div className="flex justify-between text-[13px]"><span>{b.title}</span><span className="text-[var(--text-light)]">{b.progress}%</span></div>
              <div className="progress-bar h-1"><div className="progress-fill h-1" style={{ width: b.progress + '%' }} /></div>
            </div>
          ))}
        </div>
      )}

      {(habits.length === 0 && goals.length === 0 && health.length === 0 && learning.length === 0) && (
        <div className="card text-center py-10">
          <IconSparkles size={40} stroke={1.2} className="mx-auto mb-3" style={{ color: 'var(--primary)' }} />
          <h3 className="mb-2 font-semibold">开始你的 BetterMe 之旅</h3>
          <p className="text-[var(--text-light)] text-sm">点击下方标签页，开始记录习惯、设定目标、关注健康、记录学习</p>
        </div>
      )}
    </div>
  )
}
