/**
 * Harness test for src/utils/timer.ts
 * P3 头部：parseDuration 支持 "X MIN" / "X 秒" / formatTime mm:ss
 */
import { describe, it, expect } from 'vitest'
import * as path from 'node:path'
import * as sut from '../src/utils/timer'

describe('timer.ts contract', () => {
  // [WHO] exports
  it('exports parseDuration', () => { expect(typeof sut.parseDuration).toBe('function') })
  it('exports formatTime', () => { expect(typeof sut.formatTime).toBe('function') })

  // parseDuration 行为契约
  it('parseDuration: "X MIN" returns X*60', () => {
    expect(sut.parseDuration('① 疤痕松动 · 2 MIN')).toBe(120)
    expect(sut.parseDuration('5 MIN')).toBe(300)
  })
  it('parseDuration: "X秒" returns X', () => {
    expect(sut.parseDuration('3×30秒')).toBe(30)
    expect(sut.parseDuration('15 秒')).toBe(15)
  })
  it('parseDuration: returns null when no match', () => {
    expect(sut.parseDuration('plain text')).toBeNull()
  })
  it('parseDuration: case-insensitive on MIN', () => {
    expect(sut.parseDuration('3 min')).toBe(180)
  })

  // formatTime 行为契约
  it('formatTime: 0 → "0:00"', () => {
    expect(sut.formatTime(0)).toBe('0:00')
  })
  it('formatTime: pads seconds with leading zero', () => {
    expect(sut.formatTime(65)).toBe('1:05')
    expect(sut.formatTime(9)).toBe('0:09')
  })
  it('formatTime: handles large minutes', () => {
    expect(sut.formatTime(600)).toBe('10:00')
  })

  // [FROM] — 纯函数无依赖
  it('has no module-level side effects (pure)', () => {
    const a = sut.formatTime(120)
    const b = sut.formatTime(120)
    expect(a).toBe(b)
  })

  // [TO] — 被 Timer.tsx 与 WristPlan.tsx 消费
  it('formatTime is consumed by Timer.tsx', async () => {
    const fs = await import('node:fs')
    const content = fs.readFileSync(path.join(process.cwd(), 'src/components/Timer.tsx'), 'utf-8')
    expect(content).toMatch(/from\s+['"]\.\.\/utils\/timer['"]/)
    expect(content).toMatch(/formatTime/)
  })
  it('parseDuration is consumed by WristPlan.tsx', async () => {
    const fs = await import('node:fs')
    const content = fs.readFileSync(path.join(process.cwd(), 'src/components/plans/WristPlan.tsx'), 'utf-8')
    expect(content).toMatch(/from\s+['"]\.\.\/\.\.\/utils\/timer['"]/)
    expect(content).toMatch(/parseDuration/)
  })
})
