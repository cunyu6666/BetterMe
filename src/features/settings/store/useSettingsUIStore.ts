/**
 * [WHO]: Settings Feature UI 状态
 * [FROM]: 依赖 zustand
 * [TO]: 被 hooks 和 components 消费
 * [HERE]: src/features/settings/store/useSettingsUIStore.ts
 */
import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'auto'

type SettingsUIState = {
  theme: Theme
  migrating: boolean
  migrateResult: string | null
  exporting: boolean
  setTheme: (theme: Theme) => void
  setMigrating: (v: boolean) => void
  setMigrateResult: (r: string | null) => void
  setExporting: (v: boolean) => void
}

export const useSettingsUIStore = create<SettingsUIState>((set) => ({
  theme: (localStorage.getItem('bm_theme') as Theme) || 'auto',
  migrating: false,
  migrateResult: null,
  exporting: false,
  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('bm_theme', theme)
    set({ theme })
  },
  setMigrating: (v) => set({ migrating: v }),
  setMigrateResult: (r) => set({ migrateResult: r }),
  setExporting: (v) => set({ exporting: v }),
}))
