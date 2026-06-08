/**
 * [WHO]: 提供 WristPlan 默认导出组件（左腕 6 周复健计划），3 阶段 × 4 视图（daily/shopping/assess/rules）+ ActiveTimer 接口 + Timer 模态
 * [FROM]: 依赖 react 的 useState/useEffect；依赖 ../../utils/storage 的 load/save/today；依赖 ../../data/plans 的 WRIST_PLAN；依赖 ../../utils/timer 的 parseDuration；依赖 ../Timer 组件；依赖 ../../types 的 WristData
 * [TO]: 被 src/components/plans/Plans.tsx 在 selected === 'wrist' 时渲染；持久化键名 bm_plan_wrist；调用 ../Timer 启动训练计时
 * [HERE]: src/components/plans/WristPlan.tsx - 阶段选择 + 视图分发；用 parseDuration 解析动作时长决定是否显示「开始计时」按钮；土系墨色调色板
 */
import { useState, useEffect, useRef } from 'react'
import { today } from '../../utils/storage'
import { fetchPlanData, savePlanData } from '../../lib/api'
import { WRIST_PLAN } from '../../data/plans'
import { parseDuration } from '../../utils/timer'
import Timer from '../Timer'
import type { WristData } from '../../types'

interface ActiveTimer {
  duration: number
  label: string
  sessionKey: string
  itemId: string
}

export default function WristPlan() {
  const [data, setData] = useState<WristData>({
    startDate: '', dailyChecks: {}, assessments: {}, shopping: {},
  })
  const [phase, setPhase] = useState(0)
  const [view, setView] = useState<'daily'|'shopping'|'assess'|'rules'>('daily')
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null)
  const loaded = useRef(false)

  useEffect(() => {
    fetchPlanData('wrist').then(d => {
      if (d) setData(d as WristData)
      loaded.current = true
    }).catch(() => { loaded.current = true })
  }, [])

  useEffect(() => {
    if (loaded.current) savePlanData('wrist', data).catch(console.error)
  }, [data])

  const todayStr = today()
  const planDay = data.startDate
    ? Math.floor((new Date(todayStr).getTime() - new Date(data.startDate).getTime()) / 86400000) + 1
    : 0

  const currentPhase = WRIST_PLAN.phases[phase]

  const toggleCheck = (sessionKey: string, itemId: string) => {
    const key = todayStr + '_' + sessionKey + '_' + itemId
    setData(prev => {
      const checks = { ...prev.dailyChecks }
      checks[key] = !checks[key]
      return { ...prev, dailyChecks: checks }
    })
  }

  const toggleShop = (id: string) => {
    setData(prev => {
      const shop = { ...prev.shopping }
      shop[id] = !shop[id]
      return { ...prev, shopping: shop }
    })
  }

  const updateAssess = (week: number, field: string, value: string) => {
    setData(prev => {
      const assess = { ...prev.assessments }
      const wk = 'week' + week
      if (!assess[wk]) assess[wk] = {}
      assess[wk][field] = value
      return { ...prev, assessments: assess }
    })
  }

  const startPlan = () => setData(prev => ({ ...prev, startDate: todayStr }))

  const getSessionDone = (sk: string, items: { id: string }[]) =>
    items.filter(i => data.dailyChecks[todayStr + '_' + sk + '_' + i.id]).length

  return (
    <div>
      {/* Cover */}
      {!data.startDate ? (
        <div style={{ background: 'var(--wrist-ink)', color: '#fff', padding: '48px 36px', borderRadius: 'var(--radius)', marginBottom: 16 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginBottom: 20 }}>
            Left Wrist · Rehabilitation Protocol · 6 Weeks
          </div>
          <h2 style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 28, fontWeight: 400, lineHeight: 1.3, marginBottom: 12 }}>
            左腕 6 周复健<br/><em style={{ fontStyle: 'italic', color: '#f0c070' }}>完整执行计划</em>
          </h2>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', marginBottom: 20 }}>
            每日时间表 · 分阶段动作方案 · 周评估 · 退出条件 · 就医指引
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderLeft: '3px solid #f0c070', padding: '14px 18px', fontSize: 13, color: 'rgba(255,255,255,0.75)', maxWidth: 600, lineHeight: 1.6 }}>
            <strong>重要前提：</strong>本计划不含用药建议，因为你的情况尚未确诊。外用药部分请在购买前咨询药店药师。
          </div>
          <button className="btn" style={{ marginTop: 20, background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}
            onClick={startPlan}>
            今天开始执行
          </button>
        </div>
      ) : (
        <div style={{ background: 'linear-gradient(135deg, #2e7d52, #4CAF50)', color: '#fff', padding: '16px 20px', borderRadius: 'var(--radius)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>第 {planDay} 天</div>
          <div>
            <div style={{ fontWeight: 500 }}>左腕复健 · {currentPhase.name}</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>开始日期 {data.startDate} · 6周 = 42天</div>
          </div>
        </div>
      )}

      {/* Phase selector */}
      {data.startDate && (
        <div>
          <div className="phase-progress">
            {WRIST_PLAN.phases.map((_, i) => (
              <div key={i} className={`phase-dot ${i < phase ? 'done' : i === phase ? 'current' : ''}`} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
            {WRIST_PLAN.phases.map((p, i) => (
              <button key={i} className={`plan-phase-tab ${phase === i ? 'active' : ''}`}
                onClick={() => setPhase(i)} style={{ flex: 1, textAlign: 'center' }}>
                {p.weeks}周
              </button>
            ))}
          </div>
        </div>
      )}

      {/* View tabs */}
      <div className="plan-phase-tabs">
        {[
          { key: 'daily', label: '🏋️ 每日训练' },
          { key: 'shopping', label: '🛒 采购清单' },
          { key: 'assess', label: '📊 周评估' },
          { key: 'rules', label: '⛔ 退出条件' },
        ].map(v => (
          <button key={v.key} className={`plan-phase-tab ${view === v.key ? 'active' : ''}`}
            onClick={() => setView(v.key as typeof view)}>{v.label}</button>
        ))}
      </div>

      {/* Daily */}
      {view === 'daily' && (
        <div>
          {currentPhase.enterCondition && (
            <div className="alert alert-red">
              <strong>进入条件：</strong>{currentPhase.enterCondition}
            </div>
          )}

          <div className="alert alert-blue">
            <strong>本阶段目标：</strong>{currentPhase.goal}
          </div>

          {/* Quick ref */}
          <div className="quick-ref">
            <h3>每天出门前的 3 件事</h3>
            <ul style={{ paddingLeft: 18 }}>
              <li><strong>戴上护具</strong>再出门，下班到家后才摘</li>
              <li><strong>晨间 8 分钟 / 午间 3 分钟 / 晚间 14 分钟</strong></li>
              <li><strong>提醒自己今天不能做的动作</strong></li>
            </ul>
          </div>

          {/* Sessions */}
          {Object.entries(currentPhase.sessions).map(([sk, session]) => {
            const label = { morning: '🌅 晨间训练', lunch: '☀️ 午间训练', evening: '🌙 晚间训练' }[sk]!
            const done = getSessionDone(sk, session.items)
            return (
              <div key={sk} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 500, margin: 0, padding: 0, border: 'none' }}>{label}</h3>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--wrist-muted)' }}>
                    {session.time} · {session.duration} · {done}/{session.items.length}
                  </span>
                </div>
                {session.items.map(item => {
                  const checked = !!data.dailyChecks[todayStr + '_' + sk + '_' + item.id]
                  const duration = parseDuration(item.text)
                  return (
                    <div className="exercise-card" key={item.id} style={{ opacity: checked ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                      <div className="ex-header">
                        <span className="ex-name" style={{ cursor: 'pointer', flex: 1 }} onClick={() => toggleCheck(sk, item.id)}>
                          {checked ? '✅ ' : ''}{item.text}
                        </span>
                        {duration && !checked && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveTimer({ duration, label: item.text, sessionKey: sk, itemId: item.id })
                            }}
                            style={{
                              background: 'var(--wrist-amber)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 4,
                              padding: '4px 10px',
                              fontSize: 12,
                              cursor: 'pointer',
                              fontWeight: 500,
                            }}
                          >
                            开始计时
                          </button>
                        )}
                      </div>
                      {item.detail && (
                        <div className="ex-body">{item.detail}</div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}

          {/* Prohibited */}
          {currentPhase.prohibited && (
            <div className="card" style={{ background: '#fdf0ee', border: '1px solid #e8a89e' }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--wrist-red)', marginBottom: 8 }}>
                🚫 6 周内完全禁止的动作
              </div>
              <div style={{ fontSize: 13, color: 'var(--wrist-red)' }}>
                {currentPhase.prohibited.map((p, i) => <div key={i} style={{ padding: '3px 0' }}>· {p}</div>)}
              </div>
            </div>
          )}

          {/* Week calendar */}
          <div className="card">
            <div className="card-title">📅 每周日历总览</div>
            <div className="wk-calendar">
              <div className="wk-cal-header">
                <div className="wk-cal-cell" style={{ background: '#f8f6f2' }}></div>
                {['一','二','三','四','五','六','日'].map(d => (
                  <div key={d} className="wk-cal-cell" style={{ background: '#f8f6f2', fontWeight: 500 }}>{d}</div>
                ))}
              </div>
              {[
                { label: '晨间 09:00', slots: Array(7).fill('8 min') },
                { label: '午间 12:30', slots: Array(7).fill('3 min') },
                { label: '晚间 22:15', slots: Array(7).fill('14 min') },
                { label: '周评估', slots: [...Array(6).fill(null), '5 min'] },
              ].map((row, ri) => (
                <div className="wk-cal-row" key={ri}>
                  <div className="wk-cal-label">{row.label}</div>
                  {row.slots.map((s, si) => (
                    <div key={si} className={`wk-cal-slot ${s ? (ri === 3 ? 'slot-assess' : 'slot-do') : 'slot-rest'}`}>
                      {s || '—'}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'var(--wrist-muted)' }}>
              每天总计 <strong>25 分钟</strong>，周日总计 <strong>30 分钟</strong>
            </div>
          </div>

          {/* Pain scale */}
          <div className="alert alert-amber">
            <strong>疼痛尺度参考：</strong>0 分 = 完全不疼；2 分 = 隐约感觉到但不影响动作；5 分 = 明显影响动作但能忍；8 分 = 很难受无法继续；10 分 = 无法忍受。本方案所有动作不应超过 2 分。
          </div>
        </div>
      )}

      {/* Shopping */}
      {view === 'shopping' && (
        <div>
          <div className="card">
            <div className="card-title">🛒 采购清单</div>
            <table className="buy-table">
              <thead>
                <tr>
                  <th>物品</th>
                  <th>具体要求</th>
                  <th>参考价</th>
                  <th>优先级</th>
                </tr>
              </thead>
              <tbody>
                {WRIST_PLAN.shopping.map(item => {
                  const checked = !!data.shopping[item.id]
                  const priClass = { must: 'tag-high', should: 'tag-medium', could: 'tag-low' }[item.priority as string]
                  const priLabel = { must: '必须第1天前', should: '第1周内', could: '第5周前' }[item.priority as string]
                  return (
                    <tr key={item.id} style={{ opacity: checked ? 0.5 : 1 }}>
                      <td>
                        <span className="item" style={{ cursor: 'pointer' }} onClick={() => toggleShop(item.id)}>
                          {checked ? '✅ ' : ''}{item.name}
                        </span>
                      </td>
                      <td>{item.rec}</td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--wrist-amber)' }}>{item.price}</td>
                      <td><span className={`tag ${priClass}`}>{priLabel}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div style={{ background: 'var(--wrist-amber-bg, #fef3e2)', border: '1px solid var(--wrist-amber-border, #f0c070)', padding: '20px 24px', marginTop: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--wrist-amber, #b8660a)', marginBottom: 8 }}>
              ⚠️ 关于外用药的说明（重要）
            </div>
            <div style={{ fontSize: 13, color: 'var(--wrist-ink-soft, #4a4440)', lineHeight: 1.7 }}>
              <p style={{ margin: '0 0 8px' }}>我没办法帮你选外用药，原因是：</p>
              <ul style={{ margin: '0 0 8px 20px', padding: 0 }}>
                <li>你的疼痛来源未确诊——如果是软组织炎症，外用 NSAIDs（如扶他林/双氯芬酸）有帮助；如果是关节内结构损伤，外用药意义很有限</li>
                <li>你刚做完手术 2 个月，疤痕上的皮肤对某些药物可能更敏感</li>
                <li>部分外用药有禁忌症，需要确认你无药物过敏史</li>
              </ul>
              <p style={{ margin: '0 0 8px' }}><strong>建议你做的事：</strong>去附近药店，告诉药师"左手腕手术后 2 个月，局部有酸痛，想用外用消炎止痛药，有没有适合的"。药师可以根据你当面的情况推荐，比我远程推荐安全得多。</p>
              <p style={{ margin: 0 }}>常见的外用选择（仅供你与药师沟通参考，不是我的推荐）：双氯芬酸钠乳胶（扶他林）、氟比洛芬凝胶贴膏。使用前看说明书，避开疤痕敏感区域。</p>
            </div>
          </div>
          <div className="alert alert-green">
            <strong>采购总预算估算：</strong>必买物品约 ¥95—220，全部物品约 ¥165—320。核心是支具和筋膜球，其他都是生活中能找到的替代品。
          </div>
        </div>
      )}

      {/* Assessments */}
      {view === 'assess' && (
        <div>
          <div className="alert alert-blue">
            <strong>角度测量方法：</strong>下载手机 App"角度测量仪"。左手手心朝下放桌边，手腕悬空，让手自然下垂。把手机立在左手侧面，测量手背与手掌面的夹角，记录"开始出现酸痛时的角度"。
          </div>
          {WRIST_PLAN.assessments.map(a => {
            const wk = 'week' + a.week
            const assessData = data.assessments[wk] || {}
            return (
              <div className="card" key={a.week}>
                <div className="card-title">
                  第 {a.week} 周评估
                  {a.isCheckpoint && <span className="tag tag-high" style={{ marginLeft: 8 }}>阶段切换节点</span>}
                  {a.isFinal && <span className="tag tag-high" style={{ marginLeft: 8 }}>最终评估</span>}
                </div>
                <div className="assess-grid">
                  {a.fields.map(field => (
                    <div className="assess-field" key={field}>
                      <div className="assess-label">{field}</div>
                      <input className="assess-input" value={assessData[field] || ''}
                        onChange={e => updateAssess(a.week, field, e.target.value)}
                        placeholder="填写..." />
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8 }}>
                  <div className="assess-label">本周新症状 / 备注</div>
                  <input className="assess-input" value={assessData['备注'] || ''}
                    onChange={e => updateAssess(a.week, '备注', e.target.value)}
                    placeholder="..." style={{ width: '100%' }} />
                </div>
                {a.isCheckpoint && (
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--wrist-amber)' }}>
                    切换判断：疼痛没有加重？→ 进入下一阶段 · 有加重 → 继续当前阶段
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Exit rules */}
      {view === 'rules' && (
        <div>
          <div className="alert alert-red">
            <strong>不是吓你，是保护你。</strong>这 6 条是真实的临床警示信号，出现了继续练只会让结构损伤加重。
          </div>

          {WRIST_PLAN.exitRules.map((rule, i) => (
            <div className="exit-rule" key={i}>
              <div className="exit-num">{i + 1}</div>
              <div className="exit-text">{rule}</div>
            </div>
          ))}

          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-title">🏥 就医指引 — 杭州推荐医院</div>
            {WRIST_PLAN.hospitals.map((h, i) => (
              <div className="hospital-card" key={i}>
                <div className="hospital-header">
                  <div className="hospital-rank">{h.rank}</div>
                  <div className="hospital-name">{h.name}</div>
                  <div className="hospital-dept">{h.dept}</div>
                </div>
                <div className="hospital-body">{h.desc}</div>
              </div>
            ))}
          </div>

          <div className="alert alert-amber">
            <strong>特别提醒：</strong>6 周就是 6 周，不是"差不多 6 周"。第 42 天晚上做完最后一次周评估，当天晚上就要对自己做一个诚实的判断。不要因为"感觉好像在好转"就继续拖。
          </div>
        </div>
      )}

      {/* Timer overlay */}
      {activeTimer && (
        <Timer
          duration={activeTimer.duration}
          label={activeTimer.label}
          onComplete={() => {
            toggleCheck(activeTimer.sessionKey, activeTimer.itemId)
            setActiveTimer(null)
          }}
          onClose={() => setActiveTimer(null)}
        />
      )}
    </div>
  )
}
