/**
 * [WHO]: Plans Feature 入口组件
 * [FROM]: 依赖 ../store 的 usePlansUIStore；依赖现有子组件 RhinitisPlan/WristPlan
 * [TO]: 被 src/App.tsx 渲染
 * [HERE]: src/features/plans/components/PlanList.tsx - 计划选择器外壳，委托子组件渲染
 *
 * NOTE: RhinitisPlan 和 WristPlan 是复杂子组件，暂保留原有实现，
 * 后续可通过 usePlanData/useSavePlanData hook 替换其内部 fetch 逻辑。
 */
import { IconLungs, IconBandage } from '@tabler/icons-react'
import { usePlansUIStore } from '../store/usePlansUIStore'
import RhinitisPlan from '../../../components/plans/RhinitisPlan'
import WristPlan from '../../../components/plans/WristPlan'

export default function PlanList() {
  const { selected, setSelected } = usePlansUIStore()

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
