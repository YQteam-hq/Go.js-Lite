import type { DiskDirectory } from '@shared/types'

type TFunc = (key: string, params?: Record<string, string | number>) => string

export function DiskRing({
  percent,
  used,
  total,
  formatBytes,
  t,
}: {
  percent: number
  used: number
  total: number
  formatBytes: (n: number) => string
  t: TFunc
}) {
  const clamped = Math.min(Math.max(percent, 0), 100)
  const isHighUsage = clamped >= 80
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const dash = (clamped / 100) * circumference
  const displayPercent = total > 0 ? clamped.toFixed(0) : '—'

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg
          viewBox="0 0 160 160"
          className="w-36 h-36 md:w-40 md:h-40"
          role="img"
          aria-label={`${t('diskAnalysis.usage')} ${displayPercent}%`}
        >
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            strokeWidth="20"
            className="stroke-bg-sunken"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            strokeWidth="20"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            transform="rotate(-90 80 80)"
            className={isHighUsage ? 'stroke-warning' : 'stroke-accent'}
            style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
          <text
            x="80"
            y="80"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-fg font-mono"
            style={{ fontSize: 30, fontWeight: 700 }}
          >
            {total > 0 ? `${displayPercent}%` : displayPercent}
          </text>
        </svg>
      </div>
      <div className="mt-4 text-center space-y-1">
        <div className="text-sm text-fg-muted">
          {t('diskAnalysis.usedOfTotal', {
            used: formatBytes(used),
            total: formatBytes(total),
          })}
        </div>
        <div className="flex items-center justify-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span
              className={`inline-block w-2 h-2 rounded-full ${isHighUsage ? 'bg-warning' : 'bg-accent'}`}
            />
            <span className="text-fg-subtle">{t('diskAnalysis.used')}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-bg-sunken border border-border" />
            <span className="text-fg-subtle">{t('diskAnalysis.free')}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

export function DirBarChart({
  directories,
  totalSize,
  maxDirSize,
  onDrillDown,
  formatBytes,
  t,
}: {
  directories: DiskDirectory[]
  totalSize: number
  maxDirSize: number
  onDrillDown: (path: string) => void
  formatBytes: (n: number) => string
  t: TFunc
}) {
  return (
    <div className="p-3 space-y-1">
      {directories.map((dir, i) => {
        const barWidth = maxDirSize > 0 ? (dir.size / maxDirSize) * 100 : 0
        const sharePct = totalSize > 0 ? (dir.size / totalSize) * 100 : 0
        return (
          <button
            key={`${dir.path}-${i}`}
            type="button"
            onClick={() => onDrillDown(dir.path)}
            className="w-full text-left rounded-md px-2 py-1.5 transition-colors hover:bg-bg-sunken focus-ring group"
            title={t('diskAnalysis.drillHint')}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xs text-fg-subtle w-4 shrink-0 text-right font-mono">
                {i + 1}
              </span>
              <FolderIcon className="text-fg-muted shrink-0 group-hover:text-accent transition-colors" />
              <span
                className="text-sm font-medium text-fg truncate flex-1 min-w-0"
                title={dir.path}
              >
                {dir.name}
              </span>
              <ChevronRightIcon className="text-fg-subtle/50 shrink-0 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
              <span className="text-xs text-fg font-mono shrink-0 w-16 text-right">
                {formatBytes(dir.size)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 shrink-0" />
              <div className="flex-1 h-2 bg-bg-sunken rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(barWidth, 100)}%`,
                    background:
                      'linear-gradient(90deg, hsl(var(--accent)), hsl(var(--warning)))',
                  }}
                />
              </div>
              <span className="text-2xs text-fg-subtle shrink-0 w-12 text-right font-mono">
                {sharePct.toFixed(1)}%
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
