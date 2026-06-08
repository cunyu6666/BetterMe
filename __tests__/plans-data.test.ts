/**
 * Harness test for src/data/plans.ts
 * P3 头部：导出 RHINITIS_PLAN / WRIST_PLAN 临床级静态数据
 */
import { describe, it, expect } from 'vitest'
import * as path from 'node:path'
import * as sut from '../src/data/plans'

describe('plans.ts contract', () => {
  // [WHO] exports
  it('exports RHINITIS_PLAN', () => { expect(sut.RHINITIS_PLAN).toBeDefined() })
  it('exports WRIST_PLAN', () => { expect(sut.WRIST_PLAN).toBeDefined() })

  // RHINITIS_PLAN 结构契约
  it('RHINITIS_PLAN.id === "rhinitis"', () => {
    expect(sut.RHINITIS_PLAN.id).toBe('rhinitis')
  })
  it('RHINITIS_PLAN has dailyItems (morning/daytime/evening)', () => {
    const periods = Object.keys(sut.RHINITIS_PLAN.dailyItems)
    expect(periods).toEqual(expect.arrayContaining(['morning', 'daytime', 'evening']))
  })
  it('RHINITIS_PLAN has weeklyItems, environmentItems, shopping, timeline, redLines, medications', () => {
    expect(Array.isArray(sut.RHINITIS_PLAN.weeklyItems)).toBe(true)
    expect(Array.isArray(sut.RHINITIS_PLAN.environmentItems)).toBe(true)
    expect(Array.isArray(sut.RHINITIS_PLAN.shopping)).toBe(true)
    expect(Array.isArray(sut.RHINITIS_PLAN.timeline)).toBe(true)
    expect(Array.isArray(sut.RHINITIS_PLAN.redLines)).toBe(true)
    expect(Array.isArray(sut.RHINITIS_PLAN.medications)).toBe(true)
  })
  it('RHINITIS_PLAN shopping items have id/name/rec/priority', () => {
    for (const item of sut.RHINITIS_PLAN.shopping) {
      expect(item.id).toBeDefined()
      expect(item.name).toBeDefined()
      expect(item.rec).toBeDefined()
      expect(item.priority).toBeDefined()
    }
  })

  // WRIST_PLAN 结构契约
  it('WRIST_PLAN.id === "wrist"', () => {
    expect(sut.WRIST_PLAN.id).toBe('wrist')
  })
  it('WRIST_PLAN has 3 phases', () => {
    expect(sut.WRIST_PLAN.phases).toHaveLength(3)
  })
  it('WRIST_PLAN phases have sessions (morning/lunch/evening)', () => {
    for (const phase of sut.WRIST_PLAN.phases) {
      const sessions = Object.keys(phase.sessions)
      expect(sessions).toEqual(expect.arrayContaining(['morning', 'lunch', 'evening']))
    }
  })
  it('WRIST_PLAN phase items have parseable durations', async () => {
    const timerMod = await import('../src/utils/timer')
    for (const phase of sut.WRIST_PLAN.phases) {
      for (const session of Object.values(phase.sessions)) {
        for (const item of session.items) {
          // 至少有 id + text；duration 可选（部分项目不含时长）
          expect(item.id).toBeDefined()
          expect(item.text).toBeDefined()
          // 若声明了 duration 字段，必须可被 parseDuration 解析
          if (item.text.includes('MIN') || item.text.includes('秒')) {
            expect(timerMod.parseDuration(item.text)).not.toBeNull()
          }
        }
      }
    }
  })
  it('WRIST_PLAN has 6 weekly assessments', () => {
    expect(sut.WRIST_PLAN.assessments).toHaveLength(6)
  })
  it('WRIST_PLAN has exit rules and hospital recommendations', () => {
    expect(sut.WRIST_PLAN.exitRules.length).toBeGreaterThan(0)
    expect(sut.WRIST_PLAN.hospitals.length).toBeGreaterThan(0)
  })

  // [TO] — 被 RhinitisPlan / WristPlan 消费
  it('is consumed by RhinitisPlan.tsx', async () => {
    const fs = await import('node:fs')
    const content = fs.readFileSync(path.join(process.cwd(), 'src/components/plans/RhinitisPlan.tsx'), 'utf-8')
    expect(content).toMatch(/RHINITIS_PLAN/)
  })
  it('is consumed by WristPlan.tsx', async () => {
    const fs = await import('node:fs')
    const content = fs.readFileSync(path.join(process.cwd(), 'src/components/plans/WristPlan.tsx'), 'utf-8')
    expect(content).toMatch(/WRIST_PLAN/)
  })
})
