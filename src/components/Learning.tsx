/**
 * [WHO]: 提供 Learning 默认导出组件（学习成长页，3 种 type：book/skill/note），typeConfig 类型配置 + renderSection 内部渲染函数
 * [FROM]: 依赖 react 的 useState/useEffect；依赖 @tabler/icons-react 图标；依赖 ../lib/api 的 CRUD 函数
 * [TO]: 被 src/App.tsx 在 tab === 'learning' 时渲染
 * [HERE]: src/components/Learning.tsx - 书籍/技能/笔记三类学习项；book 与 skill 带 range 滑块更新 progress；note 支持动态 tag 数组
 */
import { useState, useEffect } from 'react'
import { IconPlus, IconBook, IconTarget, IconNote, IconBook2, IconX, IconCheck, IconAward } from '@tabler/icons-react'
import { uid, today } from '../utils/storage'
import { fetchLearningItems, upsertLearningItem, deleteLearningItem as apiDeleteLearningItem } from '../lib/api'
import type { LearningItem } from '../types'

const typeConfig = {
  book: { icon: IconBook, label: '书籍' },
  skill: { icon: IconTarget, label: '技能' },
  note: { icon: IconNote, label: '笔记' },
}

export default function Learning() {
  const [items, setItems] = useState<LearningItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [itemType, setItemType] = useState<LearningItem['type']>('book')
  const [form, setForm] = useState<Partial<LearningItem>>({})
  const [tagInput, setTagInput] = useState('')

  useEffect(() => { fetchLearningItems().then(setItems).catch(console.error) }, [])

  const addItem = () => {
    if (!form.title?.trim()) return
    const item: LearningItem = {
      id: uid(), type: itemType, title: form.title!, content: form.content || '',
      progress: form.progress || 0, tags: form.tags || [], hours: form.hours, createdAt: today()
    }
    setItems(prev => [item, ...prev])
    upsertLearningItem(item).catch(console.error)
    setForm({})
    setTagInput('')
    setShowForm(false)
  }

  const updateProgress = (id: string, progress: number) => {
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i
      const updated = { ...i, progress }
      upsertLearningItem(updated).catch(console.error)
      return updated
    }))
  }

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
    apiDeleteLearningItem(id).catch(console.error)
  }

  const addTag = () => {
    if (!tagInput.trim()) return
    setForm(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }))
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setForm(prev => ({ ...prev, tags: (prev.tags || []).filter(t => t !== tag) }))
  }

  const books = items.filter(i => i.type === 'book')
  const skills = items.filter(i => i.type === 'skill')
  const notes = items.filter(i => i.type === 'note')

  const renderForm = () => {
    switch (itemType) {
      case 'book':
        return (
          <>
            <div className="form-group">
              <label>书名</label>
              <input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="例如：原子习惯" />
            </div>
            <div className="form-group">
              <label>阅读进度 (%)</label>
              <input type="number" inputMode="numeric" min="0" max="100" value={form.progress || ''} onChange={e => setForm({ ...form, progress: Number(e.target.value) })} placeholder="0-100" />
            </div>
            <div className="form-group">
              <label>读书笔记</label>
              <textarea value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="记录你的感想..." />
            </div>
          </>
        )
      case 'skill':
        return (
          <>
            <div className="form-group">
              <label>技能名称</label>
              <input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="例如：Python编程" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>学习进度 (%)</label>
                <input type="number" inputMode="numeric" min="0" max="100" value={form.progress || ''} onChange={e => setForm({ ...form, progress: Number(e.target.value) })} placeholder="0-100" />
              </div>
              <div className="form-group">
                <label>累计学习(小时)</label>
                <input type="number" inputMode="decimal" min="0" value={form.hours || ''} onChange={e => setForm({ ...form, hours: Number(e.target.value) })} placeholder="0" />
              </div>
            </div>
            <div className="form-group">
              <label>学习笔记</label>
              <textarea value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="记录学习心得..." />
            </div>
          </>
        )
      case 'note':
        return (
          <>
            <div className="form-group">
              <label>标题</label>
              <input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="笔记标题" />
            </div>
            <div className="form-group">
              <label>内容</label>
              <textarea value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="写下你的想法..." className="min-h-30" />
            </div>
            <div className="form-group">
              <label>标签</label>
              <div className="flex gap-2 mb-2">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="输入标签"
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                <button className="btn btn-primary btn-sm" onClick={addTag}>添加</button>
              </div>
              <div className="flex gap-1 flex-wrap">
                {(form.tags || []).map(t => (
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

  const renderSection = (title: string, Icon: typeof IconBook, sectionItems: LearningItem[]) => (
    <div className="card">
      <div className="card-title">
        <Icon size={18} stroke={1.8} className="icon" />
        {title} ({sectionItems.length})
      </div>
      {sectionItems.length === 0 ? (
        <div className="text-[var(--text-light)] text-[13px] py-3">暂无{title}</div>
      ) : sectionItems.map(item => (
        <div key={item.id} className="border-b border-[var(--border-light)] py-3">
          <div className="flex justify-between items-center mb-1">
            <div className="font-medium text-sm">{item.title}</div>
            <button className="delete-btn" onClick={() => handleDeleteItem(item.id)}><IconX size={14} stroke={2} /></button>
          </div>
          {item.type !== 'note' && (
            <>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: item.progress + '%' }} />
              </div>
              <div className="text-xs text-[var(--text-light)] mb-1">
                进度 {item.progress}%{item.hours ? ` · ${item.hours}小时` : ''}
                <input type="range" min="0" max="100" value={item.progress}
                  onChange={e => updateProgress(item.id, Number(e.target.value))}
                  className="w-20 ml-2 align-middle" />
              </div>
            </>
          )}
          {item.content && <div className="text-[13px] text-[var(--text-light)] mt-1">{item.content}</div>}
          {item.tags && item.tags.length > 0 && (
            <div className="note-tags">
              {item.tags.map(t => <span key={t} className="note-tag">{t}</span>)}
            </div>
          )}
          <div className="text-[11px] text-[var(--text-muted)] mt-1">{item.createdAt}</div>
        </div>
      ))}
    </div>
  )

  return (
    <div>
      <div className="section-header">
        <h2 className="text-lg font-semibold">学习成长</h2>
        <button className="btn btn-primary btn-sm flex items-center gap-1" onClick={() => setShowForm(!showForm)}>
          {showForm ? '取消' : <><IconPlus size={14} stroke={2} />添加</>}
        </button>
      </div>
      <div className="stat-grid">
        <div className="stat-box">
          <IconBook size={20} stroke={1.5} className="mx-auto mb-1" style={{ color: 'var(--primary)' }} />
          <div className="stat-value">{books.length}</div><div className="stat-label">在读书籍</div>
        </div>
        <div className="stat-box">
          <IconTarget size={20} stroke={1.5} className="mx-auto mb-1" style={{ color: 'var(--success)' }} />
          <div className="stat-value">{skills.length}</div><div className="stat-label">学习技能</div>
        </div>
        <div className="stat-box">
          <IconNote size={20} stroke={1.5} className="mx-auto mb-1" style={{ color: 'var(--info)' }} />
          <div className="stat-value">{notes.length}</div><div className="stat-label">知识笔记</div>
        </div>
        <div className="stat-box">
          <IconAward size={20} stroke={1.5} className="mx-auto mb-1" style={{ color: 'var(--warning)' }} />
          <div className="stat-value">{items.filter(i => i.progress === 100).length}</div><div className="stat-label">已完成</div>
        </div>
      </div>
      {showForm && (
        <div className="add-form">
          <div className="form-group">
            <label>类型</label>
            <div className="flex gap-2">
              {Object.entries(typeConfig).map(([key, cfg]) => {
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
          {renderForm()}
          <button className="btn btn-primary flex items-center gap-1" onClick={addItem}>
            <IconCheck size={14} stroke={2} /> 保存
          </button>
        </div>
      )}
      {items.length === 0 && !showForm ? (
        <div className="empty-state">
          <IconBook2 size={48} stroke={1} className="icon mx-auto" />
          <p>开始记录你的学习之旅吧</p>
        </div>
      ) : (
        <>
          {books.length > 0 && renderSection('阅读清单', IconBook, books)}
          {skills.length > 0 && renderSection('技能学习', IconTarget, skills)}
          {notes.length > 0 && renderSection('知识笔记', IconNote, notes)}
        </>
      )}
    </div>
  )
}
