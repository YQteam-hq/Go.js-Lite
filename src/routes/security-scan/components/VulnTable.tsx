import { ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { useI18n } from '@/hooks/useI18n'
import type { SecurityVulnItem } from '@shared/types'

const SEVERITY_ORDER: Array<SecurityVulnItem['severity']> = ['critical', 'high', 'moderate', 'low', 'info']

function sortedVulns(vulns: SecurityVulnItem[]): SecurityVulnItem[] {
  const rank = Object.fromEntries(SEVERITY_ORDER.map((s, i) => [s, i])) as Record<string, number>
  return [...vulns].sort((a, b) => {
    const ra = rank[a.severity] ?? 99
    const rb = rank[b.severity] ?? 99
    if (ra !== rb) return ra - rb
    return a.package.localeCompare(b.package)
  })
}

export function VulnTable({ vulns }: { vulns: SecurityVulnItem[] }) {
  const { t } = useI18n()
  const items = sortedVulns(vulns)

  if (items.length === 0) {
    return (
      <EmptyState
        icon={
          <div className="w-20 h-20 rounded-2xl bg-success/10 text-success flex items-center justify-center mx-auto">
            <ShieldCheckIcon size={36} strokeWidth={1.8} />
          </div>
        }
        title={t('secscan.noVulnsFound')}
      />
    )
  }

  return (
    <>
      <div className="hidden md:block overflow-x-auto rounded-lg border border-border/60">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-bg-sunken/70 text-fg-muted">
              <th className="text-left font-medium px-3 py-2.5">{t('secscan.colPackage')}</th>
              <th className="text-left font-medium px-3 py-2.5">{t('secscan.colInstalled')}</th>
              <th className="text-left font-medium px-3 py-2.5">{t('secscan.colFixedIn')}</th>
              <th className="text-left font-medium px-3 py-2.5">{t('secscan.colSeverity')}</th>
              <th className="text-left font-medium px-3 py-2.5">{t('secscan.colTitle')}</th>
              <th className="text-left font-medium px-3 py-2.5 w-24">{t('secscan.colAdvisory')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((v, i) => (
              <tr
                key={`${v.package}-${v.installed_version}-${i}`}
                className="border-t border-border/50 hover:bg-bg-sunken/40 transition-colors"
              >
                <td className="px-3 py-2.5 font-mono text-fg break-all">{v.package}</td>
                <td className="px-3 py-2.5 font-mono text-fg-subtle">{v.installed_version}</td>
                <td className="px-3 py-2.5 font-mono text-success/90">
                  {v.fixed_version ?? <span className="text-fg-subtle/70">—</span>}
                </td>
                <td className="px-3 py-2.5">
                  <Badge variant={v.severityBadgeVariant as 'danger' | 'warning' | 'muted' | 'accent' | 'success'}>
                    {t(`secscan.severity${v.severity.charAt(0).toUpperCase() + v.severity.slice(1)}`) ?? v.severity}
                  </Badge>
                </td>
                <td className="px-3 py-2.5 text-fg max-w-xs truncate" title={v.title}>
                  {v.title || <span className="text-fg-subtle/70">—</span>}
                </td>
                <td className="px-3 py-2.5">
                  {v.url ? (
                    <a
                      href={v.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 text-accent hover:text-accent-hover transition-colors"
                    >
                      {t('secscan.colAdvisory')}
                      <ExternalLink size={11} />
                    </a>
                  ) : (
                    <span className="text-fg-subtle/70">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-2.5">
        {items.map((v, i) => (
          <div
            key={`${v.package}-${v.installed_version}-${i}-m`}
            className="rounded-lg border border-border/60 p-3 bg-bg-sunken/20"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <div className="font-mono text-sm font-medium text-fg break-all">{v.package}</div>
                <div className="text-[11px] font-mono text-fg-subtle mt-0.5">
                  {t('secscan.colInstalled')}: {v.installed_version}
                  {v.fixed_version && (
                    <span className="ml-2 text-success/90">
                      → {t('secscan.colFixedIn')}: {v.fixed_version}
                    </span>
                  )}
                </div>
              </div>
              <Badge
                variant={v.severityBadgeVariant as 'danger' | 'warning' | 'muted' | 'accent' | 'success'}
                className="shrink-0"
              >
                {t(`secscan.severity${v.severity.charAt(0).toUpperCase() + v.severity.slice(1)}`) ?? v.severity}
              </Badge>
            </div>
            {v.title && (
              <div className="text-xs text-fg-muted leading-relaxed mb-2">{v.title}</div>
            )}
            {v.url && (
              <a
                href={v.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-[11px] text-accent hover:text-accent-hover transition-colors"
              >
                {t('secscan.colAdvisory')}
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

function ShieldCheckIcon({ size, strokeWidth }: { size: number; strokeWidth?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth ?? 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
