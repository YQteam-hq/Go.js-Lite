import { useMemo } from 'react'
import { Clock } from 'lucide-react'

export function matchCronField(pattern: string, value: number): boolean {
  if (pattern === '*') return true
  if (pattern.includes(',')) {
    return pattern.split(',').some((p) => matchCronField(p, value))
  }
  if (pattern.includes('/')) {
    const [base, step] = pattern.split('/')
    const stepNum = parseInt(step, 10)
    if (Number.isNaN(stepNum) || stepNum <= 0) return false
    if (base === '*') return value % stepNum === 0
    const baseNum = parseInt(base, 10)
    if (Number.isNaN(baseNum)) return false
    return value >= baseNum && (value - baseNum) % stepNum === 0
  }
  if (pattern.includes('-')) {
    const [start, end] = pattern.split('-').map((n) => parseInt(n, 10))
    if (Number.isNaN(start) || Number.isNaN(end)) return false
    return value >= start && value <= end
  }
  const v = parseInt(pattern, 10)
  return !Number.isNaN(v) && v === value
}

export function getNextRunTime(expression: string): Date | null {
  const parts = expression.split(/\s+/)
  if (parts.length !== 5) return null
  const [min, hour, day, month, weekday] = parts
  const next = new Date()
  next.setSeconds(0, 0)
  next.setMinutes(next.getMinutes() + 1)

  for (let i = 0; i < 525600; i++) {
    if (
      matchCronField(min, next.getMinutes()) &&
      matchCronField(hour, next.getHours()) &&
      matchCronField(day, next.getDate()) &&
      matchCronField(month, next.getMonth() + 1) &&
      matchCronField(weekday, next.getDay())
    ) {
      return next
    }
    next.setMinutes(next.getMinutes() + 1)
  }
  return null
}

export function formatDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function NextRunPreview({
  expression,
  t,
}: {
  expression: string
  t: (key: string, params?: Record<string, string | number>) => string
}) {
  const next = useMemo(() => getNextRunTime(expression), [expression])
  if (!next) return null
  return (
    <p className="text-xs text-accent mt-1 flex items-center gap-1">
      <Clock size={12} />
      {t('cron.nextRun')}：{formatDateTime(next)}
    </p>
  )
}
