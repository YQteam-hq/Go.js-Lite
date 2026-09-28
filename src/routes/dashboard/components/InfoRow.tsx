function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-fg-muted shrink-0 text-sm">{label}</span>
      <span className="text-fg truncate font-medium">{value}</span>
    </div>
  )
}

export { InfoRow }
