/**
 * [WHO]: 提供顶层 App 组件（默认导出），定义 6 个 tab 常量与 TabKey 联合类型；用 useState 维护当前 tab
 * [FROM]: 依赖 react 的 useState；依赖 ./components/Dashboard / ./components/plans/Plans / Habits / Goals / Health / Learning
 * [TO]: 被 src/main.tsx 作为根组件挂载；与 index.css 的 .app-container / .tabs / .tab 样式类耦合
 * [HERE]: src/App.tsx - 单页应用唯一的 tab 路由点；renderContent switch 分发到 6 个一级组件；下钻子路由由各组件自管
 */
import { useState } from 'react'
import Dashboard from './components/Dashboard'
import Plans from './components/plans/Plans'
import Habits from './components/Habits'
import Goals from './components/Goals'
import Health from './components/Health'
import Learning from './components/Learning'
import Settings from './components/Settings'

const tabs = [
  { key: 'dashboard', label: '📊 概览' },
  { key: 'plans', label: '📋 计划' },
  { key: 'habits', label: '🎯 习惯' },
  { key: 'goals', label: '🏆 目标' },
  { key: 'health', label: '💚 健康' },
  { key: 'learning', label: '📖 学习' },
  { key: 'settings', label: '⚙️ 设置' },
] as const

type TabKey = typeof tabs[number]['key']

export default function App() {
  const [tab, setTab] = useState<TabKey>('dashboard')

  const renderContent = () => {
    switch (tab) {
      case 'dashboard': return <Dashboard />
      case 'plans': return <Plans />
      case 'habits': return <Habits />
      case 'goals': return <Goals />
      case 'health': return <Health />
      case 'learning': return <Learning />
      case 'settings': return <Settings />
    }
  }

  return (
    <div className="app-container">
      <div className="header">
        <h1>BetterMe</h1>
        <p>成为更好的自己</p>
      </div>
      <div className="tabs">
        {tabs.map(t => (
          <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      {renderContent()}
    </div>
  )
}
