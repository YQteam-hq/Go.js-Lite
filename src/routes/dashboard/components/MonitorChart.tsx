import { Sparkline } from '@/components/ui/Sparkline'

function MonitorChart({
  title,
  current,
  threshold,
  data,
  color,
  max,
}: {
  title: string
  current: string
  threshold: string
  data: number[]
  color: string
  max?: number
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-fg-muted">{title}</span>
        <span className="text-2xs text-fg-subtle">{threshold}</span>
      </div>
      <div className="text-lg font-semibold text-fg leading-none">{current}</div>
      <Sparkline data={data} color={color} max={max} height={44} />
    </div>
  )
}

export { MonitorChart }
