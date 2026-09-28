import { HardDrive } from 'lucide-react'

type Color = 'accent' | 'success' | 'warning' | 'danger' | 'info'

const overviewColorClasses: Record<Color, string> = {
  accent: 'bg-accent/10 text-accent',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  info: 'bg-info/10 text-info',
}

export function OverviewStat({
  label,
  value,
  color = 'accent',
}: {
  label: string
  value: string
  color?: Color
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={`w-8 h-8 rounded-md flex items-center justify-center ${overviewColorClasses[color]}`}
      >
        <HardDrive size={16} />
      </div>
      <div className="text-xs text-fg-subtle">{label}</div>
      <div className="text-sm font-medium text-fg font-mono truncate">{value}</div>
    </div>
  )
}
