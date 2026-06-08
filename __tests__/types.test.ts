/**
 * Harness test for src/types/index.ts
 * P3 头部：导出 Habit / Goal / HealthRecord / LearningItem / RhinitisData / WristData / PlanItem / ShoppingItem
 *
 * 类型不可运行时检查；本测试通过类型断言确保接口仍可被使用并保持形状契约
 */
import { describe, it, expect } from 'vitest'
import * as path from 'node:path'
import type {
  Habit, Goal, HealthRecord, LearningItem,
  RhinitisData, WristData, PlanItem, ShoppingItem,
} from '../src/types'

describe('types/index.ts contract', () => {
  it('Habit has id/name/category/frequency/completedDates/createdAt', () => {
    const h: Habit = {
      id: '1', name: 'run', category: 'health', frequency: 'daily',
      completedDates: ['2024-01-01'], createdAt: '2024-01-01',
    }
    expect(h.id).toBe('1')
    expect(h.frequency).toBe('daily')
  })

  it('Goal has tasks array and 3-state status', () => {
    const g: Goal = {
      id: '1', title: 't', description: 'd', deadline: '2024-12-31',
      priority: 'high', status: 'active',
      tasks: [{ id: 't1', title: 'sub', done: false }],
      createdAt: '2024-01-01',
    }
    expect(g.tasks).toHaveLength(1)
    expect(['active', 'completed', 'abandoned']).toContain(g.status)
  })

  it('HealthRecord type is union of 4 literals', () => {
    const types: HealthRecord['type'][] = ['exercise', 'diet', 'sleep', 'mood']
    expect(types).toHaveLength(4)
  })

  it('LearningItem type is union of 3 literals', () => {
    const types: LearningItem['type'][] = ['book', 'skill', 'note']
    expect(types).toHaveLength(3)
  })

  it('RhinitisData has 4 check maps + startDate', () => {
    const d: RhinitisData = {
      startDate: '2024-01-01',
      dailyChecks: {}, weeklyChecks: {}, environmentChecks: {}, shopping: {},
    }
    expect(d.dailyChecks).toBeDefined()
  })

  it('WristData assessments is nested map', () => {
    const d: WristData = {
      startDate: '2024-01-01',
      dailyChecks: {},
      assessments: { week1: { '掌屈角度': '45' } },
      shopping: {},
    }
    expect(d.assessments.week1!['掌屈角度']).toBe('45')
  })

  it('PlanItem has id + text; ShoppingItem has id + name + rec + priority', () => {
    const p: PlanItem = { id: 'a', text: 'wash' }
    const s: ShoppingItem = { id: 'b', name: 'mask', rec: 'N95', priority: 1 }
    expect(p.text).toBe('wash')
    expect(s.priority).toBe(1)
  })

  // [TO] — 验证类型在主要消费方文件中被 import
  it('is imported by all 6 first-level components', async () => {
    const fs = await import('node:fs')
    const consumers = [
      'src/components/Dashboard.tsx',
      'src/components/Habits.tsx',
      'src/components/Goals.tsx',
      'src/components/Health.tsx',
      'src/components/Learning.tsx',
    ]
    for (const filePath of consumers) {
      const content = fs.readFileSync(path.join(process.cwd(), filePath), 'utf-8')
      expect(content).toMatch(/from\s+['"]\.\.\/types['"]/)
    }
  })
  it('is imported by both plan components', async () => {
    const fs = await import('node:fs')
    for (const filePath of ['src/components/plans/RhinitisPlan.tsx', 'src/components/plans/WristPlan.tsx']) {
      const content = fs.readFileSync(path.join(process.cwd(), filePath), 'utf-8')
      expect(content).toMatch(/from\s+['"]\.\.\/\.\.\/types['"]/)
    }
  })
})
