import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { useI18n } from '@/hooks/useI18n'

type ItemStatus = 'pass' | 'warning' | 'danger'

export function StatusBadge({ status }: { status: ItemStatus }) {
  const { t } = useI18n()
  if (status === 'pass') {
    return (
      <Badge variant="success">
        <CheckCircle2 size={12} />
        {t('healthCheck.statusPass')}
      </Badge>
    )
  }
  if (status === 'warning') {
    return (
      <span className="badge bg-warning/10 text-warning">
        <AlertTriangle size={12} />
        {t('healthCheck.statusWarning')}
      </span>
    )
  }
  return (
    <Badge variant="danger">
      <XCircle size={12} />
      {t('healthCheck.statusDanger')}
    </Badge>
  )
}
