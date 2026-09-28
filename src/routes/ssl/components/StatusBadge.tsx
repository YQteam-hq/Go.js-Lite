import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { useI18n } from '@/hooks/useI18n'
import type { SSLInfo } from '@shared/types'

interface StatusBadgeProps {
  status: SSLInfo['status']
  certStatus?: SSLInfo['cert_status']
  daysRemaining?: number
}

export function StatusBadge({
  status,
  certStatus,
  daysRemaining,
}: StatusBadgeProps) {
  const { t } = useI18n()

  if (status === 'checking') {
    return (
      <Badge variant="muted" aria-label={t('ssl.statusChecking')}>
        <Spinner size="sm" />
        {t('ssl.statusChecking')}
      </Badge>
    )
  }

  if (status === 'failed') {
    return (
      <Badge variant="danger" aria-label={t('ssl.statusFailed')}>
        <XCircle size={12} />
        {t('ssl.statusFailed')}
      </Badge>
    )
  }

  if (status === 'pending') {
    return (
      <Badge variant="warning" aria-label={t('ssl.statusPending')}>
        <Clock size={12} />
        {t('ssl.statusPending')}
      </Badge>
    )
  }

  if (status === 'ok') {
    if (certStatus === 'expired') {
      return (
        <Badge variant="danger" aria-label={t('ssl.statusExpired')}>
          <XCircle size={12} />
          {t('ssl.statusExpired')}
        </Badge>
      )
    }
    if (certStatus === 'critical') {
      return (
        <Badge variant="danger" aria-label={t('ssl.statusCritical')}>
          <AlertTriangle size={12} />
          {t('ssl.statusCritical')}
        </Badge>
      )
    }
    if (certStatus === 'warning') {
      return (
        <Badge variant="warning" aria-label={t('ssl.statusWarning')}>
          <AlertTriangle size={12} />
          {t('ssl.statusWarning')}
        </Badge>
      )
    }
    const label = typeof daysRemaining === 'number'
      ? t('ssl.days', { count: daysRemaining })
      : t('ssl.statusOk')
    return (
      <Badge variant="success" aria-label={t('ssl.statusOk')}>
        <CheckCircle2 size={12} />
        {label}
      </Badge>
    )
  }

  return (
    <Badge variant="muted" aria-label={t('ssl.statusPending')}>
      <Clock size={12} />
      {t('ssl.statusPending')}
    </Badge>
  )
}
