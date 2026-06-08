/**
 * [WHO]: Learning 新增表单（3 种 type 共用）
 * [FROM]: 依赖 ../hooks/useLearning 的 useCreateLearningItem；依赖 ../store 的 useLearningUIStore
 * [TO]: 被 LearningList.tsx 渲染
 * [HERE]: src/features/learning/components/LearningForm.tsx
 */
import { useState } from 'react'
import { IconPlus, IconBook, IconTarget, IconNote, IconCheck, IconX } from '@tabler/icons-react'
import { useCreateLearningItem } from '../hooks/useLearning'
import { useLearningUIStore } from '../store/useLearningUIStore'
import { uid, today } from '../../../utils/storage'
import type { LearningItem } from '../../../types'

const TYPE_CONFIG = {
  book: { icon: IconBook, label: '书籍' },
  skill: { icon: IconTarget, label: '技能' },
  note: { icon: IconNote, label: '笔记' },
}

export function LearningForm() {
  const { showForm, setShowForm, itemType, setItemType } = useLearningUIStore()
  const createItem = useCreateLearningItem()
  const [form, setForm] = useState<Partial<LearningItem>>({})
  const [tagInput, setTagInput] = useState('')

  const addTag = () => {
    if (!tagInput.trim()) return
    setForm((prev) => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }))
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setForm((prev) => ({ ...prev, tags: (prev.tags || []).filter((t) => t !== tag) }))
  }

  const handleSubmit = () => {
    if (!form.title?.trim()) return
    const item: LearningItem = {
      id: uid(),
      type: itemType,
      title: form.title,
      content: form.content || '',
      progress: form.progress || 0,
      tags: form.tags || [],
      hours: form.hours,
      createdAt: today(),
    }
    createItem.mutate(item)
    setForm({})
    setTagInput('')
    setShowForm(false)
  }

  if (!showForm) return null

  const renderFormFields = () => {
    switch (itemType) {
      case 'book':
        return (
          <>
            <div className="form-group">
              <label>书名</label>
              <input value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="例如：原子习惯" />
            </div>
            <div className="form-group">
              <label>阅读进度 (%)</label>
              <input type="number" inputMode="numeric" min="0" max="100" value={form.progress || ''} onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })} placeholder="0-100" />
            </div>
            <div className="form-group">
              <label>读书笔记</label>
              <textarea value={form.content || ''} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="记录你的感想..." />
            </div>
          </>
        )
      case 'skill':
        return (
          <>
            <div className="form-group">
              <label>技能名称</label>
              <input value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="例如：Python编程" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>学习进度 (%)</label>
                <input type="number" inputMode="numeric" min="0" max="100" value={form.progress || ''} onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })} placeholder="0-100" />
              </div>
              <div className="form-group">
                <label>累计学习(小时)</label>
                <input type="number" inputMode="decimal" min="0" value={form.hours || ''} onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })} placeholder="0" />
              </div>
            </div>
            <div className="form-group">
              <label>学习笔记</label>
              <textarea value={form.content || ''} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="记录学习心得..." />
            </div>
          </>
        )
      case 'note':
        return (
          <>
            <div className="form-group">
              <label>标题</label>
              <input value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="笔记标题" />
            </div>
            <div className="form-group">
              <label>内容</label>
              <textarea value={form.content || ''} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="写下你的想法..." className="min-h-30" />
            </div>
            <div className="form-group">
              <label>标签</label>
              <div className="flex gap-2 mb-2">
                <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="输入标签"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                <button className="btn btn-primary btn-sm" onClick={addTag}>添加</button>
              </div>
              <div className="flex gap-1 flex-wrap">
                {(form.tags || []).map((t) => (
                  <span key={t} className="note-tag cursor-pointer flex items-center gap-1" onClick={() => removeTag(t)}>
                    {t} <IconX size={10} stroke={2} />
                  </span>
                ))}
              </div>
            </div>
          </>
        )
    }
  }

  return (
    <div className="add-form">
      <div className="form-group">
        <label>类型</label>
        <div className="flex gap-2">
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
            const TypeIcon = cfg.icon
            return (
              <button key={key} className={`btn btn-sm flex items-center gap-1 ${itemType === key ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => { setItemType(key as LearningItem['type']); setForm({}); }}>
                <TypeIcon size={14} stroke={2} /> {cfg.label}
              </button>
            )
          })}
        </div>
      </div>
      {renderFormFields()}
      <button className="btn btn-primary flex items-center gap-1" onClick={handleSubmit}>
        <IconCheck size={14} stroke={2} /> 保存
      </button>
    </div>
  )
}
