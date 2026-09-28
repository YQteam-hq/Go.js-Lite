function StatCard({
  label,
  value,
  tone,
}: {
  label: string
  value: React.ReactNode
  tone?: string
}) {
  return (
    <div className="px-3 py-2 rounded-lg bg-bg-sunken">
      <div className="text-[11px] text-fg-subtle">{label}</div>
      <div className={`text-sm font-mono ${tone || 'text-fg'}`}>{value}</div>
    </div>
  )
}

export { StatCard }
