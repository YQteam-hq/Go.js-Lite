interface ScopeCheckboxProps {
  checked: boolean
  onChange: (v: boolean) => void
  icon: React.ReactNode
  title: string
  desc: string
}

export function ScopeCheckbox({ checked, onChange, icon, title, desc }: ScopeCheckboxProps) {
  return (
    <label
      className={`
        flex items-start gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors
        ${checked ? 'border-accent/40 bg-accent/5' : 'border-border hover:bg-fg/5'}
      `}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 accent-accent"
      />
      <span className={checked ? 'text-accent' : 'text-fg-muted'}>{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-fg">{title}</p>
        <p className="text-[11px] text-fg-subtle mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </label>
  )
}
