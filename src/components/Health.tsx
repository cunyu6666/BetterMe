/**
 * [WHO]: 提供 Health 默认导出组件（健康记录页，4 种 type：exercise/diet/sleep/mood 共用页面），运动模板 + 睡眠趋势 + 心情日历
 * [FROM]: 依赖 react 的 useState/useEffect；依赖 @tabler/icons-react 图标；依赖 ../lib/api 的 CRUD 函数
 * [TO]: 被 src/App.tsx 在 tab === 'health' 时渲染
 * [HERE]: src/components/Health.tsx - 多态表单页面；renderForm/renderRecordContent 按 type 分发；今日+历史两层展示
 */
import { useState, useEffect } from 'react'
import { IconPlus, IconRun, IconBowlChopsticks, IconMoonStars, IconMoodSmile, IconHeart, IconX, IconCheck, IconClock } from '@tabler/icons-react'
import { uid, today } from '../utils/storage'
import { fetchHealthRecords, upsertHealthRecord, deleteHealthRecord as apiDeleteHealthRecord } from '../lib/api'
import type { HealthRecord } from '../types'

const typeConfig = {
  exercise: { icon: IconRun, label: '运动', color: 'var(--success-subtle)' },
  diet: { icon: IconBowlChopsticks, label: '饮食', color: 'var(--warning-subtle)' },
  sleep: { icon: IconMoonStars, label: '睡眠', color: 'var(--info-subtle)' },
  mood: { icon: IconMoodSmile, label: '情绪', color: 'var(--primary-subtle)' },
}

const exerciseTemplates = [
  { name: '跑步', duration: 30, intensity: 'medium' },
  { name: '散步', duration: 30, intensity: 'low' },
  { name: '游泳', duration: 45, intensity: 'medium' },
  { name: '瑜伽', duration: 30, intensity: 'low' },
  { name: '力量训练', duration: 45, intensity: 'high' },
]

const moodEmojis = ['😢','😕','😐','🙂','😄']
const qualityEmojis = ['😫','😔','😐','🙂','😊']

export default function Health() {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [showForm, setShowForm] = useState(false)
  const [recordType, setRecordType] = useState<HealthRecord['type']>('exercise')
  const [form, setForm] = useState<Record<string, any>>({})
  const [showTrend, setShowTrend] = useState(false)

  useEffect(() => { fetchHealthRecords().then(setRecords).catch(console.error) }, [])

  const addRecord = () => {
    const record: HealthRecord = { id: uid(), type: recordType, date: today(), data: { ...form } }
    setRecords(prev => [record, ...prev])
    upsertHealthRecord(record).catch(console.error)
    setForm({})
    setShowForm(false)
  }

  const applyTemplate = (t: typeof exerciseTemplates[0]) => {
    setForm({ exerciseType: t.name, duration: t.duration, intensity: t.intensity })
  }

  const handleDeleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id))
    apiDeleteHealthRecord(id).catch(console.error)
  }

  const todayRecords = records.filter(r => r.date === today())

  const getSleepTrend = () => {
    const days: string[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push(d.toISOString().slice(0, 10))
    }
    return days.map(d => {
      const sleepRecords = records.filter(r => r.date === d && r.type === 'sleep')
      const sleep = sleepRecords[0]
      let hours = 0
      if (sleep?.data?.sleepTime && sleep?.data?.wakeTime) {
        const [sh, sm] = sleep.data.sleepTime.split(':').map(Number)
        const [wh, wm] = sleep.data.wakeTime.split(':').map(Number)
        hours = ((wh * 60 + wm) - (sh * 60 + sm) + 1440) % 1440 / 60
      }
      return { date: d, hours, quality: sleep?.data?.quality || 0 }
    })
  }

  const getMoodCalendar = () => {
    const days: string[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push(d.toISOString().slice(0, 10))
    }
    return days.map(d => {
      const moodRecord = records.find(r => r.date === d && r.type === 'mood')
      return { date: d, mood: moodRecord?.data?.mood || 0, note: moodRecord?.data?.note || '' }
    })
  }

  const renderForm = () => {
    switch (recordType) {
      case 'exercise':
        return (
          <>
            <div className="form-group">
              <label>快速选择</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {exerciseTemplates.map(t => (
                  <button key={t.name} className="btn btn-ghost btn-sm text-xs"
                    onClick={() => applyTemplate(t)}>
                    {t.name} {t.duration}分钟
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>运动类型</label>
              <input value={form.exerciseType || ''} onChange={e => setForm({ ...form, exerciseType: e.target.value })}
                placeholder="例如：跑步、游泳、瑜伽" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>时长(分钟)</label>
                <input type="number" inputMode="numeric" value={form.duration || ''} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="30" />
              </div>
              <div className="form-group">
                <label>强度</label>
                <select value={form.intensity || 'medium'} onChange={e => setForm({ ...form, intensity: e.target.value })}>
                  <option value="low">低</option><option value="medium">中</option><option value="high">高</option>
                </select>
              </div>
            </div>
          </>
        )
      case 'diet':
        return (
          <>
            <div className="form-group">
              <label>餐次</label>
              <select value={form.meal || 'lunch'} onChange={e => setForm({ ...form, meal: e.target.value })}>
                <option value="breakfast">早餐</option><option value="lunch">午餐</option>
                <option value="dinner">晚餐</option><option value="snack">加餐</option>
              </select>
            </div>
            <div className="form-group">
              <label>内容</label>
              <textarea value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="吃了什么..." />
            </div>
            <div className="form-group">
              <label>热量(千卡，可选)</label>
              <input type="number" inputMode="numeric" value={form.calories || ''} onChange={e => setForm({ ...form, calories: e.target.value })} placeholder="500" />
            </div>
          </>
        )
      case 'sleep':
        return (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>入睡时间</label>
                <input type="time" value={form.sleepTime || ''} onChange={e => setForm({ ...form, sleepTime: e.target.value })} />
              </div>
              <div className="form-group">
                <label>起床时间</label>
                <input type="time" value={form.wakeTime || ''} onChange={e => setForm({ ...form, wakeTime: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>睡眠质量 (1-5)</label>
              <div className="mood-selector">
                {[1,2,3,4,5].map(n => (
                  <div key={n} className={`mood-btn ${form.quality === n ? 'selected' : ''}`}
                    onClick={() => setForm({ ...form, quality: n })}>
                    {qualityEmojis[n-1]}
                  </div>
                ))}
              </div>
            </div>
          </>
        )
      case 'mood':
        return (
          <>
            <div className="form-group">
              <label>今日心情</label>
              <div className="mood-selector">
                {[1,2,3,4,5].map(n => (
                  <div key={n} className={`mood-btn ${form.mood === n ? 'selected' : ''}`}
                    onClick={() => setForm({ ...form, mood: n })}>
                    {moodEmojis[n-1]}
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>心情日记</label>
              <textarea value={form.note || ''} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="今天发生了什么..." />
            </div>
          </>
        )
    }
  }

  const renderRecordContent = (r: HealthRecord) => {
    switch (r.type) {
      case 'exercise':
        return `${r.data.exerciseType || '运动'} · ${r.data.duration || '?'}分钟 · ${r.data.intensity === 'high' ? '高强度' : r.data.intensity === 'low' ? '低强度' : '中等强度'}`
      case 'diet':
        return `${({ breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' } as Record<string,string>)[r.data.meal] || '饮食'} · ${r.data.content || ''} ${r.data.calories ? r.data.calories + '千卡' : ''}`
      case 'sleep':
        return `${r.data.sleepTime || '?'} - ${r.data.wakeTime || '?'} · 质量 ${r.data.quality ? qualityEmojis[r.data.quality-1] : '?'}`
      case 'mood':
        return `心情 ${r.data.mood ? moodEmojis[r.data.mood-1] : '?'} ${r.data.note ? '· ' + r.data.note : ''}`
    }
  }

  const renderSleepTrend = () => {
    const trend = getSleepTrend()
    const maxHours = 10
    return (
      <div className="card">
        <div className="card-title cursor-pointer flex items-center gap-2" onClick={() => setShowTrend(!showTrend)}>
          <IconMoonStars size={18} stroke={1.8} className="icon" />
          最近7天睡眠
          <span className="text-xs text-[var(--text-muted)] ml-auto">{showTrend ? '收起' : '展开'}</span>
        </div>
        {showTrend && (
          <div>
            <div className="flex items-end gap-2 h-24">
              {trend.map((d, i) => {
                const pct = d.hours > 0 ? (d.hours / maxHours) * 100 : 0
                const dayName = ['日','一','二','三','四','五','六'][new Date(d.date).getDay()]
                return (
                  <div key={i} className="flex-1 text-center">
                    <div className="text-[10px] text-[var(--text-light)]">{d.hours > 0 ? d.hours.toFixed(1) + 'h' : ''}</div>
                    <div className="rounded-sm mx-auto w-4 transition-all duration-300"
                      style={{ height: Math.max(2, pct) + '%', background: 'var(--info)' }} />
                    <div className="text-[11px] text-[var(--text-light)] mt-1">{dayName}</div>
                    {d.quality > 0 && <div className="text-xs">{qualityEmojis[d.quality-1]}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderMoodCalendar = () => {
    const calendar = getMoodCalendar()
    const dayLabels = ['一','二','三','四','五','六','日']
    const weeks: typeof calendar[] = []
    for (let i = 0; i < calendar.length; i += 7) {
      weeks.push(calendar.slice(i, i + 7))
    }
    return (
      <div className="card">
        <div className="card-title">
          <IconMoodSmile size={18} stroke={1.8} className="icon" />
          最近30天心情
        </div>
        <div className="flex gap-0.5">
          <div className="flex flex-col gap-0.5 mr-1">
            {dayLabels.map(l => (
              <div key={l} className="w-5 h-5 text-[9px] text-[var(--text-light)] flex items-center justify-center">{l}</div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map(d => (
                <div key={d.date}
                  className={`w-5 h-5 rounded-sm flex items-center justify-center text-xs cursor-default
                    ${d.mood === 0 ? 'bg-[var(--border)]' : ''}`}
                  style={d.mood > 0 ? { background: 'var(--primary-subtle)' } : undefined}
                  title={`${d.date} ${d.mood > 0 ? moodEmojis[d.mood-1] : '无记录'}${d.note ? ': ' + d.note : ''}`}>
                  {d.mood > 0 ? moodEmojis[d.mood-1] : ''}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="section-header">
        <h2 className="text-lg font-semibold">身心健康</h2>
        <button className="btn btn-primary btn-sm flex items-center gap-1" onClick={() => setShowForm(!showForm)}>
          {showForm ? '取消' : <><IconPlus size={14} stroke={2} />记录</>}
        </button>
      </div>
      {showForm && (
        <div className="add-form">
          <div className="form-group">
            <label>记录类型</label>
            <div className="flex gap-2">
              {Object.entries(typeConfig).map(([key, cfg]) => {
                const Icon = cfg.icon
                return (
                  <button key={key} className={`btn btn-sm flex items-center gap-1 ${recordType === key ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => { setRecordType(key as HealthRecord['type']); setForm({}); }}>
                    <Icon size={14} stroke={2} /> {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>
          {renderForm()}
          <button className="btn btn-primary flex items-center gap-1" onClick={addRecord}>
            <IconCheck size={14} stroke={2} /> 保存记录
          </button>
        </div>
      )}
      {todayRecords.length === 0 && !showForm ? (
        <div className="empty-state">
          <IconHeart size={48} stroke={1} className="icon mx-auto" />
          <p>今天还没有健康记录，开始记录吧</p>
        </div>
      ) : todayRecords.length > 0 && (
        <div className="card">
          <div className="card-title">
            <IconClock size={18} stroke={1.8} className="icon" />
            今日记录
          </div>
          {todayRecords.map(r => {
            const cfg = typeConfig[r.type]
            const Icon = cfg.icon
            return (
              <div className="health-record" key={r.id}>
                <div className="health-icon" style={{ background: cfg.color }}>
                  <Icon size={18} stroke={1.8} style={{ color: 'var(--text)' }} />
                </div>
                <div className="health-details">
                  <div className="health-type">{cfg.label}</div>
                  <div className="health-meta">{renderRecordContent(r)}</div>
                </div>
                <button className="delete-btn" onClick={() => handleDeleteRecord(r.id)}><IconX size={14} stroke={2} /></button>
              </div>
            )
          })}
        </div>
      )}
      {renderSleepTrend()}
      {renderMoodCalendar()}
      {records.filter(r => r.date !== today()).length > 0 && (
        <div className="card mt-3">
          <div className="card-title">历史记录</div>
          {records.filter(r => r.date !== today()).slice(0, 20).map(r => {
            const cfg = typeConfig[r.type]
            const Icon = cfg.icon
            return (
              <div className="health-record" key={r.id}>
                <div className="health-icon" style={{ background: cfg.color }}>
                  <Icon size={18} stroke={1.8} style={{ color: 'var(--text)' }} />
                </div>
                <div className="health-details">
                  <div className="health-type">{cfg.label}</div>
                  <div className="health-meta">{r.date} · {renderRecordContent(r)}</div>
                </div>
                <button className="delete-btn" onClick={() => handleDeleteRecord(r.id)}><IconX size={14} stroke={2} /></button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
