/**
 * [WHO]: Settings Feature 入口组件
 * [FROM]: 依赖 ../hooks/useSettings；依赖 ../store 的 useSettingsUIStore
 * [TO]: 被 src/App.tsx 渲染
 * [HERE]: src/features/settings/components/SettingsPanel.tsx
 */
import { IconSun, IconMoon, IconDeviceDesktop, IconDatabase, IconDownload } from '@tabler/icons-react'
import { useExportData, useMigrateFromLocalStorage } from '../hooks/useSettings'
import { useSettingsUIStore } from '../store/useSettingsUIStore'

const THEME_OPTIONS = [
  { value: 'light' as const, label: '浅色', icon: IconSun },
  { value: 'dark' as const, label: '深色', icon: IconMoon },
  { value: 'auto' as const, label: '跟随系统', icon: IconDeviceDesktop },
]

export default function SettingsPanel() {
  const { theme, setTheme } = useSettingsUIStore()
  const exportData = useExportData()
  const migrate = useMigrateFromLocalStorage()

  return (
    <div>
      <h2 className="text-lg mb-4 font-semibold">设置</h2>

      <div className="card">
        <div className="card-title">
          <IconSun size={18} stroke={1.8} className="icon" />
          外观
        </div>
        <div className="flex gap-2">
          {THEME_OPTIONS.map((opt) => {
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
        <button className="btn btn-primary" onClick={() => migrate.mutate()} disabled={migrate.isPending}>
          {migrate.isPending ? '迁移中...' : '从 localStorage 迁移'}
        </button>
        {migrate.isSuccess && (
          <pre className="mt-3 text-[13px] whitespace-pre-wrap text-[var(--success)]">
            迁移完成！{'\n'}{migrate.data.join('\n')}
          </pre>
        )}
        {migrate.isError && (
          <pre className="mt-3 text-[13px] whitespace-pre-wrap text-[var(--danger)]">
            迁移出错: {migrate.error instanceof Error ? migrate.error.message : String(migrate.error)}
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
        <button className="btn btn-primary flex items-center gap-1.5" onClick={() => exportData.mutate()} disabled={exportData.isPending}>
          <IconDownload size={14} stroke={2} />
          {exportData.isPending ? '导出中...' : '导出数据'}
        </button>
      </div>
    </div>
  )
}
