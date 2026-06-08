/**
 * [WHO]: 提供 Timer 默认导出组件（全屏计时器覆盖层），含 TimerProps 接口（duration/label/onComplete/onClose）
 * [FROM]: 依赖 react 的 useState/useEffect/useRef/useCallback；依赖 ../utils/timer 的 formatTime；可选依赖 navigator.vibrate
 * [TO]: 被 src/components/plans/WristPlan.tsx 在用户点击「开始计时」按钮时实例化；onComplete 回调里会回写勾选状态
 * [HERE]: src/components/Timer.tsx - 模态覆盖层（position: fixed inset 0 z-index 1000）；圆形 SVG 进度环由 circumference 公式驱动
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { formatTime } from '../utils/timer'

interface TimerProps {
  duration: number // seconds
  label: string
  onComplete?: () => void
  onClose?: () => void
}

export default function Timer({ duration, label, onComplete, onClose }: TimerProps) {
  const [remaining, setRemaining] = useState(duration)
  const [isRunning, setIsRunning] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const intervalRef = useRef<number | null>(null)

  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = window.setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            stopInterval()
            setIsRunning(false)
            setIsDone(true)
            onComplete?.()
            // Vibrate on mobile
            if (navigator.vibrate) navigator.vibrate([200, 100, 200])
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return stopInterval
  }, [isRunning, remaining, stopInterval, onComplete])

  const handleStart = () => setIsRunning(true)
  const handlePause = () => { setIsRunning(false); stopInterval() }
  const handleReset = () => { stopInterval(); setIsRunning(false); setRemaining(duration); setIsDone(false) }

  const progress = 1 - remaining / duration
  const circumference = 2 * Math.PI * 90
  const dashOffset = circumference * (1 - progress)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.2s ease',
    }}>
      {/* Label */}
      <div style={{
        color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 24,
        fontFamily: "'Noto Sans SC', sans-serif", textAlign: 'center', maxWidth: 300,
      }}>
        {label}
      </div>

      {/* Circular timer */}
      <div style={{ position: 'relative', width: 220, height: 220 }}>
        <svg width="220" height="220" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background ring */}
          <circle cx="110" cy="110" r="90" fill="none"
            stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
          {/* Progress ring */}
          <circle cx="110" cy="110" r="90" fill="none"
            stroke={isDone ? '#4CAF50' : isRunning ? '#6C63FF' : 'rgba(255,255,255,0.3)'}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s' }}
          />
        </svg>
        {/* Time display */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: isDone ? 40 : 56, fontWeight: 700,
            color: isDone ? '#4CAF50' : '#fff',
            transition: 'font-size 0.3s',
          }}>
            {isDone ? '✓' : formatTime(remaining)}
          </div>
          {isDone && (
            <div style={{ color: '#4CAF50', fontSize: 16, marginTop: 4, fontWeight: 500 }}>
              完成！
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
        {!isRunning && !isDone && (
          <button onClick={handleStart} style={{
            width: 64, height: 64, borderRadius: '50%',
            background: '#6C63FF', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(108,99,255,0.4)',
            transition: 'transform 0.2s',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <polygon points="8,5 20,12 8,19" />
            </svg>
          </button>
        )}
        {isRunning && (
          <button onClick={handlePause} style={{
            width: 64, height: 64, borderRadius: '50%',
            background: '#FF9800', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(255,152,0,0.4)',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          </button>
        )}
        <button onClick={handleReset} style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>
        <button onClick={onClose} style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Control labels */}
      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        {!isRunning && !isDone && <div style={{ width: 64, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>开始</div>}
        {isRunning && <div style={{ width: 64, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>暂停</div>}
        <div style={{ width: 64, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>重置</div>
        <div style={{ width: 64, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>关闭</div>
      </div>

      {/* Skip to complete */}
      {!isDone && (
        <button onClick={() => {
          stopInterval()
          setIsRunning(false)
          setRemaining(0)
          setIsDone(true)
          onComplete?.()
        }} style={{
          marginTop: 24, background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 12,
        }}>
          跳过计时，直接完成
        </button>
      )}
    </div>
  )
}
