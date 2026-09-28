import { Card, CardBody } from '@/components/ui/Card'
import { useI18n } from '@/hooks/useI18n'
import { StatusBadge } from './StatusBadge'
import type { HealthCheckItem } from '@shared/types'

export function CheckCard({ item }: { item: HealthCheckItem }) {
  const { t } = useI18n()
  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-mono text-sm font-medium text-fg break-all">{item.name}</div>
            <p className="text-xs text-fg-muted mt-1 leading-relaxed">{item.description}</p>
          </div>
          <div className="shrink-0">
            <StatusBadge status={item.status} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-fg-subtle">
              {t('healthCheck.currentValue')}
            </div>
            <div className="font-mono text-xs text-fg mt-0.5 break-all">{item.currentValue || '—'}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-fg-subtle">
              {t('healthCheck.recommendedValue')}
            </div>
            <div className="font-mono text-xs text-fg mt-0.5 break-all">{item.recommendedValue}</div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
