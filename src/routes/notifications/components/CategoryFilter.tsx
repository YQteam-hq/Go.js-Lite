import { Bell, ShieldCheck, Database, Lock, AlertTriangle, Activity } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { NotificationCategory } from '@shared/types'

const CATEGORY_META: Record<NotificationCategory, { icon: typeof Bell; origin: string | null }> = {
  login_anomaly: { icon: ShieldCheck, origin: null },
  backup: { icon: Database, origin: '/backup' },
  ssl: { icon: Lock, origin: '/ssl' },
  security: { icon: AlertTriangle, origin: null },
  system: { icon: Activity, origin: null },
  monitor: { icon: Activity, origin: '/dashboard' },
}

const CATEGORIES: (NotificationCategory | 'all')[] = ['all', 'login_anomaly', 'backup', 'ssl', 'security', 'system']

interface CategoryFilterProps {
  category: NotificationCategory | 'all'
  countMapTotal: number
  unreadOnly: boolean
  onCategoryChange: (category: NotificationCategory | 'all') => void
  onUnreadOnlyChange: (unreadOnly: boolean) => void
  catLabel: (c: NotificationCategory | 'all') => string
}

export function CategoryFilter({
  category,
  countMapTotal,
  unreadOnly,
  onCategoryChange,
  onUnreadOnlyChange,
  catLabel
}: CategoryFilterProps) {
  return (
    <div className="rounded-2xl border border-border bg-bg-elevated p-3 space-y-2">
      <div className="text-xs uppercase tracking-wide text-fg-subtle font-semibold px-2 pt-1">
        分类
      </div>
      <div className="flex flex-col gap-1">
        {CATEGORIES.map((c) => {
          const active = c === category
          const Icon = c === 'all' ? Bell : CATEGORY_META[c].icon
          return (
            <button
              key={c}
              onClick={() => { onCategoryChange(c) }}
              className={`w-full flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm transition-all ${
                active ? 'bg-accent/10 text-accent font-semibold' : 'text-fg-muted hover:bg-bg-sunken hover:text-fg'
              }`}
            >
              <span className="flex items-center gap-2 truncate"><Icon size={16} /><span className="truncate">{catLabel(c)}</span></span>
              {c === 'all' && (
                <Badge variant={active ? 'accent' : 'muted'} className="text-[11px] px-1.5">{countMapTotal}</Badge>
              )}
            </button>
          )
        })}
      </div>
      <div className="pt-2 border-t border-border mt-2">
        <label className="flex items-center gap-2 text-sm text-fg select-none px-2 py-1.5">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border accent-accent"
            checked={unreadOnly}
            onChange={(e) => { onUnreadOnlyChange(e.target.checked) }}
          />
          <span>仅未读</span>
        </label>
      </div>
    </div>
  )
}

export { CATEGORY_META }
