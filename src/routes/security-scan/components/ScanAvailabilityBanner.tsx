import { AlertTriangle, Info } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import type { SecurityScanFrontendResult, SecurityScanBackendResult } from '@shared/types'

type ScanType = 'frontend' | 'backend'

export function ScanAvailabilityBanner({
  result,
  type,
}: {
  result: SecurityScanFrontendResult | SecurityScanBackendResult
  type: ScanType
}) {
  const { t } = useI18n()

  if (result.available === false) {
    return (
      <div className="flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/10 p-3 mb-4">
        <AlertTriangle size={16} className="shrink-0 mt-0.5 text-warning" />
        <div className="text-xs text-fg leading-relaxed">
          {t(result.reason_key ?? 'secscan.npmUnavailable')}
        </div>
      </div>
    )
  }

  if (type === 'backend' && (result as SecurityScanBackendResult).heuristicOnly) {
    return (
      <div className="flex items-start gap-2.5 rounded-lg border border-border bg-bg-sunken/60 p-3 mb-4">
        <Info size={16} className="shrink-0 mt-0.5 text-fg-subtle" />
        <div className="text-xs text-fg-muted leading-relaxed">
          {t((result as SecurityScanBackendResult).notice_key ?? 'secscan.heuristicOnlyBanner')}
        </div>
      </div>
    )
  }

  return null
}
