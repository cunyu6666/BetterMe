/**
 * [WHO]: 提供 Settings 默认导出组件，包含外观切换（浅色/深色/跟随系统）、数据迁移、数据导出
 * [FROM]: 依赖 react 的 useState/useEffect；依赖 @tabler/icons-react 图标；依赖 ../lib/api 的 CRUD 和 fetch 函数
 * [TO]: 被 src/App.tsx 在 tab === 'settings' 时渲染
 * [HERE]: src/components/Settings.tsx - 应用配置面板；主题持久化到 localStorage（bm_theme）
 */
import { useState, useEffect } from 'react'
import { IconSun, IconMoon, IconDeviceDesktop, IconDatabase, IconDownload } from '@tabler/icons-react'
import { upsertHabit, upsertGoal, upsertHealthRecord, upsertLearningItem, savePlanData, fetchHabits, fetchGoals, fetchHealthRecords, fetchLearningItems, fetchPlanData } from '../lib/api'
import type { Habit, Goal, HealthRecord, LearningItem } from '../types'
import { load } from '../utils/storage'

type Theme = 'light' | 'dark' | 'auto'

const themeOptions: { value: Theme; label: string; icon: typeof IconSun }[] = [
  { value: 'light', label: '浅色', icon: IconSun },
  { value: 'dark', label: '深色', icon: IconMoon },
  { value: 'auto', label: '跟随系统', icon: IconDeviceDesktop },
]

export default function Settings() {
  const [migrating, setMigrating] = useState(false)
  const [migrateResult, setMigrateResult] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('bm_theme') as Theme) || 'auto')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('bm_theme', theme)
  }, [theme])

  const migrateFromLocalStorage = async () => {
    setMigrating(true)
    setMigrateResult(null)
    const results: string[] = []

    try {
      const habits = load<Habit[]>('bm_habits', [])
      for (const h of habits) await upsertHabit(h)
      results.push(`习惯: ${habits.length} 条`)

      const goals = load<Goal[]>('bm_goals', [])
      for (const g of goals) await upsertGoal(g)
      results.push(`目标: ${goals.length} 条`)

      const health = load<HealthRecord[]>('bm_health', [])
      for (const r of health) await upsertHealthRecord(r)
      results.push(`健康记录: ${health.length} 条`)

      const learning = load<LearningItem[]>('bm_learning', [])
      for (const i of learning) await upsertLearningItem(i)
      results.push(`学习项: ${learning.length} 条`)

      const rhinitis = load<Record<string, any> | null>('bm_plan_rhinitis', null)
      if (rhinitis) await savePlanData('rhinitis', rhinitis)
      const wrist = load<Record<string, any> | null>('bm_plan_wrist', null)
      if (wrist) await savePlanData('wrist', wrist)
      results.push(`计划数据: ${rhinitis ? 1 : 0 + (wrist ? 1 : 0)} 份`)

      setMigrateResult(`迁移完成！\n${results.join('\n')}`)
    } catch (err) {
      setMigrateResult(`迁移出错: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setMigrating(false)
    }
  }

  const exportData = async () => {
    setExporting(true)
    try {
      const [habits, goals, health, learning, rhinitis, wrist] = await Promise.all([
        fetchHabits(), fetchGoals(), fetchHealthRecords(), fetchLearningItems(),
        fetchPlanData('rhinitis'), fetchPlanData('wrist'),
      ])
      const payload = {
        exportedAt: new Date().toISOString(), habits, goals,
        healthRecords: health, learningItems: learning, plans: { rhinitis, wrist },
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `betterme-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('导出失败: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <h2 className="text-lg mb-4 font-semibold">设置</h2>

      <div className="card">
        <div className="card-title">
          <IconSun size={18} stroke={1.8} className="icon" />
          外观
        </div>
        <div className="flex gap-2">
          {themeOptions.map(opt => {
            const Icon = opt.icon
            return (
              <button key={opt.value}
                className={`btn btn-sm flex items-center gap-1.5 ${theme === opt.value ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setTheme(opt.value)}>
                <Icon size={14} stroke={2} />
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="card mt-3">
        <div className="card-title">
          <IconDatabase size={18} stroke={1.8} className="icon" />
          数据迁移
        </div>
        <p className="text-[13px] text-[var(--text-light)] mb-3">
          将浏览器 localStorage 中的旧数据一次性迁移到 insforge 后端。不会删除 localStorage 原始数据。
        </p>
        <button className="btn btn-primary" onClick={migrateFromLocalStorage} disabled={migrating}>
          {migrating ? '迁移中...' : '从 localStorage 迁移'}
        </button>
        {migrateResult && (
          <pre className={`mt-3 text-[13px] whitespace-pre-wrap ${migrateResult.startsWith('迁移完成') ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
            {migrateResult}
          </pre>
        )}
      </div>

      <div className="card mt-3">
        <div className="card-title">
          <IconDownload size={18} stroke={1.8} className="icon" />
          数据导出
        </div>
        <p className="text-[13px] text-[var(--text-light)] mb-3">
          将所有数据导出为 JSON 文件，用于离线备份。
        </p>
        <button className="btn btn-primary flex items-center gap-1.5" onClick={exportData} disabled={exporting}>
          <IconDownload size={14} stroke={2} />
          {exporting ? '导出中...' : '导出数据'}
        </button>
      </div>
    </div>
  )
}
