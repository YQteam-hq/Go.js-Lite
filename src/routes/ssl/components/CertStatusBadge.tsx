import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { useI18n } from '@/hooks/useI18n'
import type { AcmeCertStatus } from '@shared/types'

export function CertStatusBadge({ status }: { status: AcmeCertStatus }) {
  const { t } = useI18n()
  const map: Record<AcmeCertStatus, { variant: 'success' | 'warning' | 'danger' | 'muted' | 'accent'; label: string; icon: typeof CheckCircle2 }> = {
    valid: { variant: 'success', label: t('ssl.acme.statusValid'), icon: CheckCircle2 },
    pending: { variant: 'accent', label: t('ssl.acme.statusPending'), icon: Clock },
    invalid: { variant: 'muted', label: t('ssl.acme.statusInvalid'), icon: XCircle },
    expiring_soon: { variant: 'warning', label: t('ssl.acme.statusExpiringSoon'), icon: AlertTriangle },
    expired: { variant: 'danger', label: t('ssl.acme.statusExpired'), icon: XCircle },
    renew_failed: { variant: 'danger', label: t('ssl.acme.renewFailed'), icon: AlertTriangle },
  }
  const cfg = map[status] ?? map.invalid
  const Icon = cfg.icon
  return (
    <Badge variant={cfg.variant}>
      <Icon size={12} />
      {cfg.label}
    </Badge>
  )
}
