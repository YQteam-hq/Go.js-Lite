import { RefreshCw, AlertOctagon } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useI18n } from '@/hooks/useI18n'
import { useFormat } from '@/lib/format'
import type { SecurityVulnItem, SecurityScanFrontendResult, SecurityScanBackendResult } from '@shared/types'
import { ScanAvailabilityBanner } from './ScanAvailabilityBanner'
import { SeverityChipsRow } from './SeverityChipsRow'
import { VulnTable } from './VulnTable'
import { ScanCardSkeleton } from './ScanCardSkeleton'

type ScanType = 'frontend' | 'backend'

type SeverityCounts = {
  critical: number
  high: number
  moderate: number
  low: number
  info: number
  total: number
}

function countSeverities(vulns: SecurityVulnItem[]): SeverityCounts {
  const counts: SeverityCounts = { critical: 0, high: 0, moderate: 0, low: 0, info: 0, total: vulns.length }
  for (const v of vulns) {
    if (v.severity in counts) {
      (counts as Record<string, number>)[v.severity]++
    }
  }
  return counts
}

export function ScanCard({
  type,
  result,
  isLoading,
  error,
  counts,
  onRescan,
  isRescanning,
}: {
  type: ScanType
  result: SecurityScanFrontendResult | SecurityScanBackendResult | undefined
  isLoading: boolean
  error: unknown
  counts: SeverityCounts
  onRescan: () => void
  isRescanning: boolean
}) {
  const { t } = useI18n()
  const { formatRelativeTime } = useFormat()

  const titleKey = type === 'frontend' ? 'secscan.frontendCard' : 'secscan.backendCard'

  if (isLoading && !result) return <ScanCardSkeleton />

  if (error && !result) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="text-base font-semibold text-fg">{t(titleKey)}</div>
            <Button variant="primary" size="sm" onClick={onRescan} loading={isRescanning}>
              <RefreshCw size={14} />
              {t('secscan.rescan')}
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 flex items-start gap-2.5">
            <AlertOctagon size={16} className="shrink-0 mt-0.5 text-danger" />
            <div className="text-xs text-fg leading-relaxed">
              {t('secscan.scanFailed')} —{' '}
              {error instanceof Error ? error.message : t('common.unknownError')}
            </div>
          </div>
        </CardBody>
      </Card>
    )
  }

  const scannedAt = result?.scanned_at

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-base font-semibold text-fg">{t(titleKey)}</div>
          <div className="flex items-center gap-2.5 sm:justify-end">
            {scannedAt && (
              <div className="text-[11px] text-fg-subtle font-mono whitespace-nowrap">
                {t('secscan.lastScanned')}: {formatRelativeTime(scannedAt)}
              </div>
            )}
            <Button variant="primary" size="sm" onClick={onRescan} loading={isRescanning}>
              <RefreshCw size={14} />
              {t('secscan.rescan')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        {result && <ScanAvailabilityBanner result={result} type={type} />}
        <SeverityChipsRow counts={counts} />
        <VulnTable vulns={result?.vulns ?? []} />
      </CardBody>
    </Card>
  )
}

export { countSeverities }
