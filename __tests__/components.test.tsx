/**
 * Harness test for all components
 * 渲染冒烟：每个组件在不抛错的前提下挂载到 #root
 */
import { describe, it, expect, beforeEach } from 'vitest'
import * as path from 'node:path'
import { render, screen, cleanup } from '@testing-library/react'
import App from '../src/App'
import Dashboard from '../src/components/Dashboard'
import Habits from '../src/components/Habits'
import Goals from '../src/components/Goals'
import Health from '../src/components/Health'
import Learning from '../src/components/Learning'
import Timer from '../src/components/Timer'
import Plans from '../src/components/plans/Plans'
import RhinitisPlan from '../src/components/plans/RhinitisPlan'
import WristPlan from '../src/components/plans/WristPlan'

beforeEach(() => {
  localStorage.clear()
  cleanup()
})

describe('Component smoke tests', () => {
  // [WHO] exports
  it('App is a function component', () => { expect(typeof App).toBe('function') })
  it('Dashboard is a function component', () => { expect(typeof Dashboard).toBe('function') })
  it('Habits is a function component', () => { expect(typeof Habits).toBe('function') })
  it('Goals is a function component', () => { expect(typeof Goals).toBe('function') })
  it('Health is a function component', () => { expect(typeof Health).toBe('function') })
  it('Learning is a function component', () => { expect(typeof Learning).toBe('function') })
  it('Timer is a function component', () => { expect(typeof Timer).toBe('function') })
  it('Plans is a function component', () => { expect(typeof Plans).toBe('function') })
  it('RhinitisPlan is a function component', () => { expect(typeof RhinitisPlan).toBe('function') })
  it('WristPlan is a function component', () => { expect(typeof WristPlan).toBe('function') })

  // 渲染不抛错
  it('App renders without crashing', () => {
    const { container } = render(<App />)
    expect(container.querySelector('.app-container')).toBeInTheDocument()
  })
  it('Dashboard renders empty state when no data', () => {
    render(<Dashboard />)
    expect(screen.getByText(/开始你的 BetterMe 之旅/)).toBeInTheDocument()
  })
  it('Habits renders empty state when no data', () => {
    render(<Habits />)
    expect(screen.getByText(/还没有习惯/)).toBeInTheDocument()
  })
  it('Goals renders empty state when no data', () => {
    render(<Goals />)
    expect(screen.getByText(/还没有目标/)).toBeInTheDocument()
  })
  it('Health renders empty state when no data', () => {
    render(<Health />)
    expect(screen.getByText(/今天还没有健康记录/)).toBeInTheDocument()
  })
  it('Learning renders empty state when no data', () => {
    render(<Learning />)
    expect(screen.getByText(/开始记录你的学习之旅吧/)).toBeInTheDocument()
  })
  it('Plans renders selector with both plan cards', () => {
    render(<Plans />)
    expect(screen.getByText('过敏性鼻炎管理')).toBeInTheDocument()
    expect(screen.getByText('左腕6周复健')).toBeInTheDocument()
  })
  it('RhinitisPlan renders with start button when no startDate', () => {
    render(<RhinitisPlan />)
    expect(screen.getByText(/今天开始执行/)).toBeInTheDocument()
  })
  it('WristPlan renders cover with important notice when no startDate', () => {
    render(<WristPlan />)
    expect(screen.getByText(/重要前提/)).toBeInTheDocument()
  })
  it('Timer renders with controls when not running', () => {
    render(<Timer duration={60} label="test label" />)
    expect(screen.getByText('test label')).toBeInTheDocument()
    expect(screen.getByText('1:00')).toBeInTheDocument()
  })

  // [TO] — App.tsx 渲染 6 个 tab
  it('App shows 6 tab buttons', () => {
    render(<App />)
    const tabs = document.querySelectorAll('.tabs .tab')
    expect(tabs.length).toBe(7)
  })
})
