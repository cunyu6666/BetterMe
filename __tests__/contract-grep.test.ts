/**
 * Harness 跨模块契约测试
 * 验证 P3 头部中声明的 [TO] 消费者文件存在
 * 验证 P2 文档中声明的源文件存在
 * 验证 P1 导航图的所有链接都存在
 */
import { describe, it, expect } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'

const SRC = path.resolve(__dirname, '..')
const read = (p: string) => fs.readFileSync(path.join(SRC, p), 'utf-8')
const exists = (p: string) => fs.existsSync(path.join(SRC, p))

describe('Cross-module contract', () => {
  // 文档-代码同构
  it('P1 links to all P2 directories that exist', () => {
    const p1 = read('AGENTS.md')
    const links = [...p1.matchAll(/\]\(\.\/(.+?\/)?AGENTS\.md\)/g)].map(m => m[1] || '')
    for (const dir of links) {
      const ag = path.join(SRC, dir, 'AGENTS.md')
      expect(fs.existsSync(ag), `P1 link broken: ${dir}AGENTS.md`).toBe(true)
    }
  })

  it('Every P2 file lists only real source files', () => {
    const p2Files = [
      ['src/AGENTS.md', 'src/'],
      ['src/components/AGENTS.md', 'src/components/'],
      ['src/components/plans/AGENTS.md', 'src/components/plans/'],
      ['src/data/AGENTS.md', 'src/data/'],
      ['src/types/AGENTS.md', 'src/types/'],
      ['src/utils/AGENTS.md', 'src/utils/'],
      ['__tests__/AGENTS.md', '__tests__/'],
    ] as [string, string][]
    for (const [p2, baseDir] of p2Files) {
      const text = read(p2)
      // 提取形如 "filename.ts: ..." 的成员行
      const members = [...text.matchAll(/^([\w\-./]+\.(?:ts|tsx)):/gm)].map(m => m[1])
      expect(members.length, `${p2} should list members`).toBeGreaterThan(0)
      for (const m of members) {
        // P2 中只列文件名，路径相对于 P2 文件所在目录
        const full = baseDir + m
        expect(exists(full), `${p2} lists missing file: ${m}`).toBe(true)
      }
    }
  })

  it('Every source file has a P3 header', () => {
    const sources = [
      'src/main.tsx', 'src/App.tsx',
      'src/types/index.ts', 'src/utils/storage.ts', 'src/utils/timer.ts',
      'src/data/plans.ts',
      'src/components/Dashboard.tsx', 'src/components/Habits.tsx',
      'src/components/Goals.tsx', 'src/components/Health.tsx',
      'src/components/Learning.tsx', 'src/components/Timer.tsx',
      'src/components/plans/Plans.tsx',
      'src/components/plans/RhinitisPlan.tsx',
      'src/components/plans/WristPlan.tsx',
    ]
    for (const f of sources) {
      const head = read(f).slice(0, 800)
      expect(head, `${f} missing P3 header`).toMatch(/\[WHO\]:/)
      expect(head, `${f} missing [FROM]`).toMatch(/\[FROM\]:/)
      expect(head, `${f} missing [TO]`).toMatch(/\[TO\]:/)
      expect(head, `${f} missing [HERE]`).toMatch(/\[HERE\]:/)
    }
  })

  // 关键依赖关系（与 P3 [TO]/[FROM] 声明一致）
  it('App.tsx imports all 6 first-level components', () => {
    const app = read('src/App.tsx')
    for (const c of ['Dashboard', 'Plans', 'Habits', 'Goals', 'Health', 'Learning']) {
      expect(app, `App.tsx must import ${c}`).toContain(c)
    }
  })
  it('Plans.tsx imports RhinitisPlan and WristPlan', () => {
    const p = read('src/components/plans/Plans.tsx')
    expect(p).toContain('RhinitisPlan')
    expect(p).toContain('WristPlan')
  })
  it('WristPlan.tsx imports Timer', () => {
    const p = read('src/components/plans/WristPlan.tsx')
    expect(p).toMatch(/import\s+Timer\s+from/)
  })
  it('Timer.tsx imports formatTime', () => {
    const p = read('src/components/Timer.tsx')
    expect(p).toContain('formatTime')
  })
  it('main.tsx imports App', () => {
    const p = read('src/main.tsx')
    expect(p).toMatch(/import\s+App\s+from/)
  })

  // 数据层：组件通过 insforge API 持久化
  it('data components import from lib/api', () => {
    const sources = [
      'src/components/Habits.tsx', 'src/components/Goals.tsx',
      'src/components/Health.tsx', 'src/components/Learning.tsx',
      'src/components/Dashboard.tsx',
    ]
    for (const f of sources) {
      const content = read(f)
      expect(content, `${f} should import from lib/api`).toContain('../lib/api')
    }
  })
})
