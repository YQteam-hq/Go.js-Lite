export function InfoRow({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-fg-muted shrink-0">{label}</span>
      <span className={`text-fg truncate ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}
