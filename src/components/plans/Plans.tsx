/**
 * [WHO]: 提供 Plans 默认导出组件（计划选择器外壳），根据 selected 状态条件渲染 RhinitisPlan 或 WristPlan
 * [FROM]: 依赖 react 的 useState；依赖 @tabler/icons-react 图标；依赖 ./RhinitisPlan 与 ./WristPlan（同目录）
 * [TO]: 被 src/App.tsx 在 tab === 'plans' 时渲染；自身不持有持久化状态
 * [HERE]: src/components/plans/Plans.tsx - 计划模块的 2 选 1 入口；持久化在子组件内各自管理
 */
import { useState } from 'react'
import { IconLungs, IconBandage } from '@tabler/icons-react'
import RhinitisPlan from './RhinitisPlan'
import WristPlan from './WristPlan'

export default function Plans() {
  const [selected, setSelected] = useState<'rhinitis' | 'wrist'>('rhinitis')

  return (
    <div>
      <div className="section-header">
        <h2 className="text-lg font-semibold">执行计划</h2>
      </div>

      <div className="plan-selector">
        <div className={`plan-card ${selected === 'rhinitis' ? 'active' : ''}`}
          onClick={() => setSelected('rhinitis')}>
          <div className="icon"><IconLungs size={32} stroke={1.5} style={{ color: 'var(--sage)' }} /></div>
          <div className="name">过敏性鼻炎管理</div>
          <div className="desc">尘螨过敏 · 每日护理</div>
        </div>
        <div className={`plan-card ${selected === 'wrist' ? 'active' : ''}`}
          onClick={() => setSelected('wrist')}>
          <div className="icon"><IconBandage size={32} stroke={1.5} style={{ color: 'var(--wrist-amber)' }} /></div>
          <div className="name">左腕6周复健</div>
          <div className="desc">术后康复 · 每日训练</div>
        </div>
      </div>

      {selected === 'rhinitis' ? <RhinitisPlan /> : <WristPlan />}
    </div>
  )
}
