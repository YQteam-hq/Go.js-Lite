function InfoCard({
  icon,
  label,
  value,
  accent,
  mono,
  action,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  accent?: boolean
  mono?: boolean
  action?: React.ReactNode
}) {
  return (
    <div className="bg-bg-elevated rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            accent ? 'bg-accent/10 text-accent' : 'bg-bg-sunken text-fg-muted'
          }`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-fg-subtle">{label}</div>
          <div className="flex items-center gap-2 min-w-0">
            <div className={`min-w-0 flex-1 ${mono ? 'font-mono' : ''}`}>
              {typeof value === 'string' ? (
                <div className="text-base font-semibold text-fg mt-0.5 truncate">
                  {value}
                </div>
              ) : (
                value
              )}
            </div>
            {action}
          </div>
        </div>
      </div>
    </div>
  )
}

export { InfoCard }
