/**
 * [WHO]: Health 记录表单（4 种 type 共用）
 * [FROM]: 依赖 ../hooks/useHealth 的 useCreateHealthRecord；依赖 ../store 的 useHealthUIStore
 * [TO]: 被 HealthList.tsx 渲染
 * [HERE]: src/features/health/components/HealthForm.tsx
 */
import { useState } from 'react'
import { IconPlus, IconRun, IconBowlChopsticks, IconMoonStars, IconMoodSmile, IconCheck } from '@tabler/icons-react'
import { useCreateHealthRecord } from '../hooks/useHealth'
import { useHealthUIStore } from '../store/useHealthUIStore'
import { uid, today } from '../../../utils/storage'
import type { HealthRecord } from '../../../types'

const TYPE_CONFIG = {
  exercise: { icon: IconRun, label: '运动' },
  diet: { icon: IconBowlChopsticks, label: '饮食' },
  sleep: { icon: IconMoonStars, label: '睡眠' },
  mood: { icon: IconMoodSmile, label: '情绪' },
}

const EXERCISE_TEMPLATES = [
  { name: '跑步', duration: 30, intensity: 'medium' },
  { name: '散步', duration: 30, intensity: 'low' },
  { name: '游泳', duration: 45, intensity: 'medium' },
  { name: '瑜伽', duration: 30, intensity: 'low' },
  { name: '力量训练', duration: 45, intensity: 'high' },
]

const MOOD_EMOJIS = ['😢','😕','😐','🙂','😄']
const QUALITY_EMOJIS = ['😫','😔','😐','🙂','😊']

export function HealthForm() {
  const { showForm, setShowForm, recordType, setRecordType } = useHealthUIStore()
  const createRecord = useCreateHealthRecord()
  const [form, setForm] = useState<Record<string, unknown>>({})

  const handleSubmit = () => {
    const record: HealthRecord = { id: uid(), type: recordType, date: today(), data: { ...form } }
    createRecord.mutate(record)
    setForm({})
    setShowForm(false)
  }

  if (!showForm) return null

  const renderFormFields = () => {
    switch (recordType) {
      case 'exercise':
        return (
          <>
            <div className="form-group">
              <label>快速选择</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {EXERCISE_TEMPLATES.map((t) => (
                  <button key={t.name} className="btn btn-ghost btn-sm text-xs"
                    onClick={() => setForm({ exerciseType: t.name, duration: t.duration, intensity: t.intensity })}>
                    {t.name} {t.duration}分钟
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>运动类型</label>
              <input value={(form.exerciseType as string) || ''} onChange={(e) => setForm({ ...form, exerciseType: e.target.value })} placeholder="例如：跑步、游泳、瑜伽" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>时长(分钟)</label>
                <input type="number" inputMode="numeric" value={(form.duration as number) || ''} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="30" />
              </div>
              <div className="form-group">
                <label>强度</label>
                <select value={(form.intensity as string) || 'medium'} onChange={(e) => setForm({ ...form, intensity: e.target.value })}>
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
              <select value={(form.meal as string) || 'lunch'} onChange={(e) => setForm({ ...form, meal: e.target.value })}>
                <option value="breakfast">早餐</option><option value="lunch">午餐</option>
                <option value="dinner">晚餐</option><option value="snack">加餐</option>
              </select>
            </div>
            <div className="form-group">
              <label>内容</label>
              <textarea value={(form.content as string) || ''} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="吃了什么..." />
            </div>
            <div className="form-group">
              <label>热量(千卡，可选)</label>
              <input type="number" inputMode="numeric" value={(form.calories as number) || ''} onChange={(e) => setForm({ ...form, calories: e.target.value })} placeholder="500" />
            </div>
          </>
        )
      case 'sleep':
        return (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>入睡时间</label>
                <input type="time" value={(form.sleepTime as string) || ''} onChange={(e) => setForm({ ...form, sleepTime: e.target.value })} />
              </div>
              <div className="form-group">
                <label>起床时间</label>
                <input type="time" value={(form.wakeTime as string) || ''} onChange={(e) => setForm({ ...form, wakeTime: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>睡眠质量 (1-5)</label>
              <div className="mood-selector">
                {[1,2,3,4,5].map((n) => (
                  <div key={n} className={`mood-btn ${form.quality === n ? 'selected' : ''}`}
                    onClick={() => setForm({ ...form, quality: n })}>
                    {QUALITY_EMOJIS[n-1]}
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
                {[1,2,3,4,5].map((n) => (
                  <div key={n} className={`mood-btn ${form.mood === n ? 'selected' : ''}`}
                    onClick={() => setForm({ ...form, mood: n })}>
                    {MOOD_EMOJIS[n-1]}
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>心情日记</label>
              <textarea value={(form.note as string) || ''} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="今天发生了什么..." />
            </div>
          </>
        )
    }
  }

  return (
    <div className="add-form">
      <div className="form-group">
        <label>记录类型</label>
        <div className="flex gap-2">
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
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
      {renderFormFields()}
      <button className="btn btn-primary flex items-center gap-1" onClick={handleSubmit}>
        <IconCheck size={14} stroke={2} /> 保存记录
      </button>
    </div>
  )
}
