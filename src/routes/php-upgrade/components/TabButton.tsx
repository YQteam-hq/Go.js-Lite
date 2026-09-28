type TabKey = 'upgrade' | 'autoload'

function TabButton({
  tab,
  keyName,
  label,
  onClick,
}: {
  tab: TabKey
  keyName: TabKey
  label: string
  onClick: (key: TabKey) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(keyName)}
      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
        tab === keyName ? 'border-accent bg-accent/10 text-accent' : 'border-border text-fg-muted hover:text-fg'
      }`}
    >
      {label}
    </button>
  )
}

export { TabButton }
export type { TabKey }
