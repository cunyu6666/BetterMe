/**
 * [WHO]: Learning Feature 入口组件
 * [FROM]: 依赖 ../hooks/useLearning 的 useLearningItems；依赖 ../store 的 useLearningUIStore
 * [TO]: 被 src/App.tsx 渲染
 * [HERE]: src/features/learning/components/LearningList.tsx
 */
import { IconPlus, IconBook, IconTarget, IconNote, IconBook2, IconAward } from '@tabler/icons-react'
import { useLearningItems } from '../hooks/useLearning'
import { useLearningUIStore } from '../store/useLearningUIStore'
import { LearningItemCard } from './LearningItem'
import { LearningForm } from './LearningForm'
import type { LearningItem } from '../../../types'

function Section({ title, Icon, items }: { title: string; Icon: typeof IconBook; items: LearningItem[] }) {
  return (
    <div className="card">
      <div className="card-title">
        <Icon size={18} stroke={1.8} className="icon" />
        {title} ({items.length})
      </div>
      {items.length === 0 ? (
        <div className="text-[var(--text-light)] text-[13px] py-3">暂无{title}</div>
      ) : items.map((item) => <LearningItemCard key={item.id} item={item} />)}
    </div>
  )
}

export default function LearningList() {
  const { items, isLoading, isError, isEmpty, refetch } = useLearningItems()
  const { showForm, toggleShowForm } = useLearningUIStore()

  const books = items.filter((i) => i.type === 'book')
  const skills = items.filter((i) => i.type === 'skill')
  const notes = items.filter((i) => i.type === 'note')

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-[var(--border)] rounded w-1/3 mb-2" />
            <div className="h-3 bg-[var(--border)] rounded w-2/3" />
          </div>
        ))}
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

  return (
    <div>
      <div className="section-header">
        <h2 className="text-lg font-semibold">学习成长</h2>
        <button className="btn btn-primary btn-sm flex items-center gap-1" onClick={toggleShowForm}>
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
          <div className="stat-value">{items.filter((i) => i.progress === 100).length}</div><div className="stat-label">已完成</div>
        </div>
      </div>

      <LearningForm />

      {isEmpty && !showForm ? (
        <div className="empty-state">
          <IconBook2 size={48} stroke={1} className="icon mx-auto" />
          <p>开始记录你的学习之旅吧</p>
        </div>
      ) : (
        <>
          {books.length > 0 && <Section title="阅读清单" Icon={IconBook} items={books} />}
          {skills.length > 0 && <Section title="技能学习" Icon={IconTarget} items={skills} />}
          {notes.length > 0 && <Section title="知识笔记" Icon={IconNote} items={notes} />}
        </>
      )}
    </div>
  )
}
