/**
 * [WHO]: 提供时长解析 parseDuration（支持 "X MIN" 与 "X 秒" 两种写法，返回秒数或 null）与格式化 formatTime（mm:ss 左零填充）
 * [FROM]: 纯函数；无运行时依赖
 * [TO]: 被 src/components/Timer.tsx 调用 formatTime 渲染剩余时间；被 src/components/plans/WristPlan.tsx 调用 parseDuration 决定是否启动计时
 * [HERE]: src/utils/timer.ts - 共享工具层；与 storage 并列；无副作用、无状态
 */
/**
 * Parse duration from exercise text like "① 疤痕松动 · 2 MIN" or "3×30秒"
 * Returns duration in seconds
 */
export function parseDuration(text: string): number | null {
  // Match "X MIN" pattern
  const minMatch = text.match(/(\d+)\s*MIN/i)
  if (minMatch) return parseInt(minMatch[1]) * 60

  // Match "X秒" or "X 秒" pattern
  const secMatch = text.match(/(\d+)\s*秒/)
  if (secMatch) return parseInt(secMatch[1])

  return null
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
