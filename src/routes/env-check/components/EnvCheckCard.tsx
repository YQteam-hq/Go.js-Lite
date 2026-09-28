import { useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  Lightbulb,
} from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useI18n } from '@/hooks/useI18n'
import type { EnvCheckItem } from '@shared/types'

export function EnvCheckCard({ item }: { item: EnvCheckItem }) {
  const { t, hasKey } = useI18n()
  const [expanded, setExpanded] = useState(false)

  const relatedFeatureKey = item.feature_key
    ? `envCheck.feature_${item.feature_key}`
    : null
  const relatedFeatureText = relatedFeatureKey && hasKey(relatedFeatureKey)
    ? t(relatedFeatureKey)
    : (item.related_feature ?? '')

  const reasonKey = item.reason_key ? `envCheck.reason_${item.reason_key}` : null
  const reasonText = reasonKey && hasKey(reasonKey)
    ? t(reasonKey, item.reason_params as Record<string, string | number> | undefined)
    : (item.reason ?? '')

  const suggestionKey = item.suggestion_key
    ? `envCheck.suggestion_${item.suggestion_key}`
    : null
  const suggestionText = suggestionKey && hasKey(suggestionKey)
    ? t(suggestionKey, item.suggestion_params as Record<string, string | number> | undefined)
    : (item.suggestion ?? '')

  const canExpand = !item.available && (!!reasonText || !!suggestionText)

  return (
    <Card>
      <CardBody className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="mt-0.5 shrink-0">
              {item.available ? (
                <CheckCircle2 size={18} className="text-success" />
              ) : (
                <XCircle size={18} className="text-danger" />
              )}
            </span>
            <div className="min-w-0">
              <div className="font-mono text-sm font-medium text-fg break-all">{item.name}</div>
              {relatedFeatureText && (
                <p className="text-xs text-fg-muted mt-1 leading-relaxed">
                  {t('envCheck.relatedFeature')}：{relatedFeatureText}
                </p>
              )}
            </div>
          </div>
          <div className="shrink-0">
            {item.available ? (
              <Badge variant="success">
                <CheckCircle2 size={12} />
                {t('envCheck.available')}
              </Badge>
            ) : (
              <Badge variant="danger">
                <XCircle size={12} />
                {t('envCheck.unavailable')}
              </Badge>
            )}
          </div>
        </div>

        {canExpand && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors focus-ring rounded"
            >
              <span>{t('envCheck.viewDetails')}</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              />
            </button>
            {expanded && (
              <div className="mt-2 space-y-2 pt-2 border-t border-border/60">
                {reasonText && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-fg-subtle">
                      {t('envCheck.reason')}
                    </div>
                    <div className="text-xs text-danger mt-0.5">{reasonText}</div>
                  </div>
                )}
                {suggestionText && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-fg-subtle">
                      {t('envCheck.suggestion')}
                    </div>
                    <div className="text-xs text-fg mt-0.5 flex items-start gap-1.5">
                      <Lightbulb size={12} className="mt-0.5 shrink-0 text-warning" />
                      <span>{suggestionText}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  )
}
