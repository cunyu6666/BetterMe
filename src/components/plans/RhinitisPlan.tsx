/**
 * [WHO]: 提供 RhinitisPlan 默认导出组件（过敏性鼻炎尘螨管理计划），6 视图（daily/weekly/env/shopping/meds/timeline）+ 勾选状态机
 * [FROM]: 依赖 react 的 useState/useEffect；依赖 ../../utils/storage 的 load/save/today；依赖 ../../data/plans 的 RHINITIS_PLAN；依赖 ../../types 的 RhinitisData
 * [TO]: 被 src/components/plans/Plans.tsx 在 selected === 'rhinitis' 时渲染；持久化键名 bm_plan_rhinitis
 * [HERE]: src/components/plans/RhinitisPlan.tsx - 6 视图 tab 切换；toggle 函数命名风格统一；绿金调色板（--sage/--gold）；从 startDate 推算 planDay
 */
import { useState, useEffect, useRef } from 'react'
import { today } from '../../utils/storage'
import { fetchPlanData, savePlanData } from '../../lib/api'
import { RHINITIS_PLAN } from '../../data/plans'
import type { RhinitisData } from '../../types'

export default function RhinitisPlan() {
  const [data, setData] = useState<RhinitisData>({
    startDate: '', dailyChecks: {}, weeklyChecks: {}, environmentChecks: {}, shopping: {},
  })
  const [view, setView] = useState<'daily'|'weekly'|'env'|'shopping'|'timeline'|'meds'>('daily')
  const loaded = useRef(false)

  useEffect(() => {
    fetchPlanData('rhinitis').then(d => {
      if (d) setData(d as RhinitisData)
      loaded.current = true
    }).catch(() => { loaded.current = true })
  }, [])

  useEffect(() => {
    if (loaded.current) savePlanData('rhinitis', data).catch(console.error)
  }, [data])

  const todayStr = today()
  const planDay = data.startDate
    ? Math.floor((new Date(todayStr).getTime() - new Date(data.startDate).getTime()) / 86400000) + 1
    : 0

  const getWeekKey = () => {
    const d = new Date(todayStr)
    const dow = d.getDay()
    const mon = new Date(d)
    mon.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
    return mon.toISOString().slice(0, 10)
  }

  const toggleDaily = (key: string) => {
    setData(prev => {
      const checks = { ...prev.dailyChecks }
      const dk = todayStr + '_' + key
      checks[dk] = !checks[dk]
      return { ...prev, dailyChecks: checks }
    })
  }

  const toggleWeekly = (key: string) => {
    const wk = getWeekKey() + '_' + key
    setData(prev => {
      const checks = { ...prev.weeklyChecks }
      checks[wk] = !checks[wk]
      return { ...prev, weeklyChecks: checks }
    })
  }

  const toggleShop = (id: string) => {
    setData(prev => {
      const shop = { ...prev.shopping }
      shop[id] = !shop[id]
      return { ...prev, shopping: shop }
    })
  }

  const toggleEnvironment = (id: string) => {
    setData(prev => {
      const checks = { ...prev.environmentChecks }
      checks[id] = !checks[id]
      return { ...prev, environmentChecks: checks }
    })
  }

  const startPlan = () => setData(prev => ({ ...prev, startDate: todayStr }))

  return (
    <div>
      {/* Header */}
      <div className="rhinitis-header">
        <p className="rhinitis-kicker">Self-Care Plan</p>
        <h2>过敏性鼻炎（尘螨）<br/>自我管理与恢复</h2>
        <p className="sub">针对尘螨过敏制定。源头控螨 + 屏障隔离 + 对症护理 + 守住就医底线</p>
        {!data.startDate && (
          <button className="btn" style={{ marginTop: 16, background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
            onClick={startPlan}>
            今天开始执行
          </button>
        )}
        {data.startDate && (
          <div style={{ marginTop: 14, fontSize: 12, color: '#bcd2c9', borderTop: '1px solid rgba(255,255,255,0.18)', paddingTop: 10 }}>
            第 <strong style={{ color: '#fff', fontSize: 16 }}>{planDay}</strong> 天 · 开始日期 {data.startDate}
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="plan-phase-tabs">
        {[
          { key: 'daily', label: '📋 每日执行' },
          { key: 'weekly', label: '🧹 每周执行' },
          { key: 'env', label: '🏠 环境改造' },
          { key: 'shopping', label: '🛒 采购清单' },
          { key: 'meds', label: '💊 用药指南' },
          { key: 'timeline', label: '📅 时间表' },
        ].map(v => (
          <button key={v.key} className={`plan-phase-tab ${view === v.key ? 'active' : ''}`}
            onClick={() => setView(v.key as typeof view)}>{v.label}</button>
        ))}
      </div>

      {/* Daily */}
      {view === 'daily' && (
        <div className="card">
          <div className="sage-sec-head">
            <div className="sage-sec-num">3</div>
            <div className="sage-sec-title">每日执行</div>
          </div>
          <div className="routine-grid">
            {Object.entries(RHINITIS_PLAN.dailyItems).map(([period, items]) => {
              const label = { morning: '早上', daytime: '白天', evening: '晚上 / 睡前' }[period]!
              const icon = { morning: '🌅', daytime: '☀️', evening: '🌙' }[period]!
              const done = items.filter(i => data.dailyChecks[todayStr + '_' + i.id]).length
              return (
                <div className="routine-block" key={period} style={period === 'evening' ? { gridColumn: '1 / -1' } : undefined}>
                  <h4><span className="dot" />{icon} {label} <span style={{ marginLeft: 'auto', fontSize: 11, color: '#aaa' }}>{done}/{items.length}</span></h4>
                  <ul className="sage-check">
                    {items.map(item => {
                      const checked = !!data.dailyChecks[todayStr + '_' + item.id]
                      return (
                        <li key={item.id} className={checked ? 'checked' : ''} onClick={() => toggleDaily(item.id)}>
                          {item.text}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Weekly */}
      {view === 'weekly' && (
        <div className="card">
          <div className="sage-sec-head">
            <div className="sage-sec-num">4</div>
            <div className="sage-sec-title">每周执行</div>
          </div>
          <div className="routine-grid">
            <div className="routine-block">
              <h4><span className="dot" />清洗</h4>
              <ul className="sage-check">
                {RHINITIS_PLAN.weeklyItems.slice(0, 2).map(item => {
                  const wk = getWeekKey()
                  const checked = !!data.weeklyChecks[wk + '_' + item.id]
                  return (
                    <li key={item.id} className={checked ? 'checked' : ''} onClick={() => toggleWeekly(item.id)}>
                      {item.text}
                    </li>
                  )
                })}
              </ul>
            </div>
            <div className="routine-block">
              <h4><span className="dot" />除尘</h4>
              <ul className="sage-check">
                {RHINITIS_PLAN.weeklyItems.slice(2).map(item => {
                  const wk = getWeekKey()
                  const checked = !!data.weeklyChecks[wk + '_' + item.id]
                  return (
                    <li key={item.id} className={checked ? 'checked' : ''} onClick={() => toggleWeekly(item.id)}>
                      {item.text}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Environment */}
      {view === 'env' && (
        <div className="card">
          <div className="sage-sec-head">
            <div className="sage-sec-num">5</div>
            <div className="sage-sec-title">一次性环境改造</div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 12 }}>
            开头做好，后续省力。
          </p>
          <ul className="sage-check">
            {RHINITIS_PLAN.environmentItems.map(item => {
              const checked = !!data.environmentChecks[item.id]
              return (
                <li key={item.id} className={checked ? 'checked' : ''} onClick={() => toggleEnvironment(item.id)}>
                  {item.text}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Shopping */}
      {view === 'shopping' && (
        <div className="card">
          <div className="sage-sec-head">
            <div className="sage-sec-num">1</div>
            <div className="sage-sec-title">购买清单</div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 12 }}>
            按「对尘螨的实际效果」从高到低排序。①②承担大部分效果，③④为辅助。
          </p>
          <table className="buy-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>优先级</th>
                <th style={{ width: 110 }}>物品</th>
                <th>推荐 / 选择要点</th>
                <th style={{ width: 160 }}>作用</th>
              </tr>
            </thead>
            <tbody>
              {RHINITIS_PLAN.shopping.map(item => {
                const checked = !!data.shopping[item.id]
                return (
                  <tr key={item.id} style={{ opacity: checked ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                    <td><span className={`pri-badge pri-${item.priority}`}>{item.priority}</span></td>
                    <td>
                      <span className="item" style={{ cursor: 'pointer' }} onClick={() => toggleShop(item.id)}>
                        {checked ? '✅ ' : ''}{item.name}
                      </span>
                    </td>
                    <td><span className="rec">{item.rec}</span></td>
                    <td>{item.note}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="note-inline">
            购买顺序建议：① 防螨包套 → ② 除湿机 + 湿度计 → ③ 戴森。再好的设备也只是工具，关键在坚持。
          </div>
        </div>
      )}

      {/* Medications */}
      {view === 'meds' && (
        <div>
          <div className="card">
            <div className="sage-sec-head">
              <div className="sage-sec-num">2</div>
              <div className="sage-sec-title">用药指南</div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 12 }}>
              下面是常见的非处方类别与用法方向。具体药名、剂量请先告诉药剂师你的情况，由他/她确定。
            </p>
            <div className="med-cards">
              {RHINITIS_PLAN.medications.map(med => (
                <div className="med-card" key={med.name}>
                  <span className={`med-tag med-tag-${med.tag}`}>{med.tagLabel}</span>
                  <div>
                    <h4>{med.name}</h4>
                    <p>{med.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, background: '#fbeeea', border: '1px solid #eecabf', borderRadius: 10, padding: '14px 16px', fontSize: 13, color: '#7c2e1c' }}>
              <strong style={{ color: 'var(--danger)' }}>⚠ 关于抗生素：不要自行购买服用。</strong>
              很多鼻窦炎是病毒性的，抗生素无效。是否需要、用哪种，必须由能开处方的医生判断——这是本计划唯一不能在家自己决定的环节。附近医院一般，也可以考虑找药剂师转介或使用在线问诊获取处方。
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {view === 'timeline' && (
        <div>
          <div className="card">
            <div className="sage-sec-head">
              <div className="sage-sec-num">6</div>
              <div className="sage-sec-title">时间表与观察节点</div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 16 }}>
              以「黄涕 + 鼻塞」开始认真护理的第一天算起。
            </p>
            <div className="timeline">
              {RHINITIS_PLAN.timeline.map((t, i) => (
                <div className={`tl ${t.flag ? 'flag' : ''}`} key={i}>
                  <span className="day">{t.day}</span>
                  <p>{t.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="redbox">
            <h3>⛔ 就医红线</h3>
            <p className="lead">出现以下任何一条，立刻停止自我护理、想办法就医。</p>
            <div className="redgrid">
              {RHINITIS_PLAN.redLines.map((r, i) => <div key={i}>{r}</div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
