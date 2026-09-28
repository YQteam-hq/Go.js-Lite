import { AlertTriangle, AlertOctagon } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { useI18n } from '@/hooks/useI18n'
import type { SecurityVulnItem } from '@shared/types'

type SeverityCounts = {
  critical: number
  high: number
  moderate: number
  low: number
  info: number
  total: number
}

const SEVERITY_BADGE: Record<SecurityVulnItem['severity'], 'danger' | 'warning' | 'muted' | 'accent'> = {
  critical: 'danger',
  high: 'danger',
  moderate: 'warning',
  low: 'muted',
  info: 'accent',
}

export function SeverityChipsRow({ counts }: { counts: SeverityCounts }) {
  const { t } = useI18n()
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-xs font-medium text-fg-muted mr-1">{t('secscan.vulnsBySeverity')}:</span>
      <Badge variant={SEVERITY_BADGE.critical}>
        <AlertOctagon size={12} />
        {t('secscan.criticalCount')} {counts.critical}
      </Badge>
      <Badge variant={SEVERITY_BADGE.high}>
        <AlertTriangle size={12} />
        {t('secscan.highCount')} {counts.high}
      </Badge>
      <Badge variant={SEVERITY_BADGE.moderate}>{t('secscan.moderateCount')} {counts.moderate}</Badge>
      <Badge variant={SEVERITY_BADGE.low}>{t('secscan.lowCount')} {counts.low}</Badge>
      <span className="text-xs text-fg-subtle ml-auto font-mono">
        {t('secscan.totalCount')}: <span className="text-fg font-medium">{counts.total}</span>
      </span>
    </div>
  )
}
