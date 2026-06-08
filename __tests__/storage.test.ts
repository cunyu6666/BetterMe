/**
 * Harness test for src/utils/storage.ts
 * P3 头部：uid 短随机 ID / today YYYY-MM-DD / load<T> 带 fallback / save JSON 写入
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as path from 'node:path'
import * as sut from '../src/utils/storage'

describe('storage.ts contract', () => {
  beforeEach(() => localStorage.clear())

  // [WHO] exports
  it('exports uid', () => { expect(typeof sut.uid).toBe('function') })
  it('exports today', () => { expect(typeof sut.today).toBe('function') })
  it('exports load', () => { expect(typeof sut.load).toBe('function') })
  it('exports save', () => { expect(typeof sut.save).toBe('function') })

  // uid 行为契约
  it('uid returns a non-empty string', () => {
    const id = sut.uid()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })
  it('uid returns unique values', () => {
    const ids = new Set(Array.from({ length: 100 }, () => sut.uid()))
    expect(ids.size).toBe(100)
  })

  // today 行为契约
  it('today returns YYYY-MM-DD format', () => {
    expect(sut.today()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  // load 行为契约
  it('load returns fallback when key missing', () => {
    expect(sut.load('nope', ['default'])).toEqual(['default'])
  })
  it('load returns parsed JSON when key exists', () => {
    localStorage.setItem('bm_x', JSON.stringify({ a: 1 }))
    expect(sut.load<{ a: number }>('bm_x', { a: 0 })).toEqual({ a: 1 })
  })
  it('load returns fallback on JSON parse error', () => {
    localStorage.setItem('bm_bad', '{not json')
    expect(sut.load('bm_bad', 'fallback')).toBe('fallback')
  })

  // save 行为契约
  it('save writes JSON to localStorage', () => {
    sut.save('bm_test', { x: 1 })
    expect(localStorage.getItem('bm_test')).toBe('{"x":1}')
  })
  it('save + load roundtrip preserves data', () => {
    const data = [{ id: '1', name: 'foo' }]
    sut.save('bm_round', data)
    expect(sut.load('bm_round', [])).toEqual(data)
  })

  // [FROM] — localStorage is the only runtime dependency
  it('uses localStorage (mocked)', () => {
    const setSpy = vi.spyOn(Storage.prototype, 'setItem')
    sut.save('bm_mock', 'v')
    expect(setSpy).toHaveBeenCalledWith('bm_mock', JSON.stringify('v'))
  })

  // [TO] — 被 6 个数据组件消费（按 P3 声明）
  it('is consumed by Dashboard/Habits/Goals/Health/Learning/RhinitisPlan/WristPlan', async () => {
    const consumers = [
      'src/components/Dashboard.tsx',
      'src/components/Habits.tsx',
      'src/components/Goals.tsx',
      'src/components/Health.tsx',
      'src/components/Learning.tsx',
      'src/components/plans/RhinitisPlan.tsx',
      'src/components/plans/WristPlan.tsx',
    ]
    const fs = await import('node:fs')
    for (const filePath of consumers) {
      const content = fs.readFileSync(filePath, 'utf-8')
      expect(content).toMatch(/from\s+['"](?:\.\.\/)+utils\/storage['"]/)
    }
  })
})
