import { CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useI18n } from '@/hooks/useI18n'
import type { CompatibilityItem } from '@shared/types'

export function CompatibilityCard({ item }: { item: CompatibilityItem }) {
  const { t } = useI18n()
  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-fg">{item.name}</div>
          {item.pass ? (
            <Badge variant="success">
              <CheckCircle2 size={12} />
              {t('healthCheck.compatSupported')}
            </Badge>
          ) : (
            <Badge variant="danger">
              <XCircle size={12} />
              {t('healthCheck.compatNotSupported')}
            </Badge>
          )}
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wide text-fg-subtle mb-1.5">
            {t('healthCheck.requirements')}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {item.requirements.map((req, i) => {
              const isMissingExt = item.missing.some((m) => req.endsWith(': ' + m))
              return (
                <span
                  key={i}
                  className={`badge font-mono ${
                    isMissingExt ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
                  }`}
                >
                  {req}
                </span>
              )
            })}
          </div>
        </div>

        {item.missing.length > 0 && (
          <div className="pt-2 border-t border-border/60">
            <div className="text-[10px] uppercase tracking-wide text-danger mb-1">
              {t('healthCheck.missingItems')}
            </div>
            <ul className="space-y-1">
              {item.missing.map((m, i) => (
                <li key={i} className="text-xs text-danger flex items-start gap-1.5">
                  <XCircle size={12} className="mt-0.5 shrink-0" />
                  <span>
                    <span className="font-mono font-medium">{m}</span>
                    <span className="text-fg-muted ml-1">
                      {m === 'PHP 版本不满足'
                        ? t('healthCheck.suggestionPhp')
                        : t('healthCheck.suggestionExt', { name: m })}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
