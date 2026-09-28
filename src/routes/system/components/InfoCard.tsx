type InfoCardColor = 'accent' | 'success' | 'warning' | 'danger' | 'info'

export function InfoCard({
  icon,
  label,
  value,
  color = 'accent',
}: {
  icon: React.ReactNode
  label: string
  value: string
  color?: InfoCardColor
}) {
  const colorClasses: Record<InfoCardColor, string> = {
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
    info: 'bg-info/10 text-info',
  }

  return (
    <div className="flex flex-col gap-2">
      <div className={`w-8 h-8 rounded-md flex items-center justify-center ${colorClasses[color]}`}>
        {icon}
      </div>
      <div>
        <div className="text-xs text-fg-subtle">{label}</div>
        <div className="text-sm font-medium text-fg font-mono truncate">{value}</div>
      </div>
    </div>
  )
}
