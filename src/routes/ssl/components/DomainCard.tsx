import { RefreshCw, Trash2, XCircle, ShieldCheck, Lock, Unlock, AlertTriangle } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { StatusBadge } from './StatusBadge'
import { useI18n } from '@/hooks/useI18n'
import type { SSLInfo } from '@shared/types'

interface DomainCardProps {
  domain: string
  info?: SSLInfo
  loading: boolean
  onCheck: () => void
  onDelete: () => void
  deleting: boolean
}

export function DomainCard({
  domain,
  info,
  loading,
  onCheck,
  onDelete,
  deleting,
}: DomainCardProps) {
  const { t, hasKey } = useI18n()

  const checkStatus: SSLInfo['status'] = loading
    ? 'checking'
    : !info
      ? 'pending'
      : info.status
  const certStatus = info?.cert_status
  const enabled = info?.enabled

  const errorKey = info?.error_key
  const errorTranslateKey = errorKey ? `ssl.${errorKey}` : null
  const errorText = errorTranslateKey && hasKey(errorTranslateKey)
    ? t(errorTranslateKey, info?.error_params as Record<string, string | number> | undefined)
    : (info?.message ?? '')

  const isFailed = checkStatus === 'failed'

  return (
    <Card className="card-hover">
      <CardHeader className="flex items-center justify-between gap-3 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              checkStatus === 'ok'
                ? certStatus === 'ok'
                  ? 'bg-success/10 text-success'
                  : certStatus === 'warning'
                    ? 'bg-warning/10 text-warning'
                    : certStatus === 'critical' || certStatus === 'expired'
                      ? 'bg-danger/10 text-danger'
                      : 'bg-success/10 text-success'
                : isFailed
                  ? 'bg-danger/10 text-danger'
                  : checkStatus === 'checking'
                    ? 'bg-accent/10 text-accent'
                    : 'bg-bg-sunken text-fg-muted'
            }`}
          >
            {checkStatus === 'checking' ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : isFailed ? (
              <XCircle size={18} />
            ) : (
              <ShieldCheck size={18} />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-fg truncate">{domain}</div>
            <div className="text-xs text-fg-subtle truncate">
              {info?.issuer ? info.issuer : t('ssl.notChecked')}
            </div>
          </div>
        </div>
        <StatusBadge status={checkStatus} certStatus={certStatus} daysRemaining={info?.days_remaining} />
      </CardHeader>
      <CardBody className="space-y-3">
        {checkStatus === 'checking' ? (
          <div className="space-y-2">
            <Skeleton variant="rectangular" height={16} className="w-3/4" />
            <Skeleton variant="rectangular" height={16} className="w-1/2" />
          </div>
        ) : info ? (
          enabled ? (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-fg-subtle">{t('ssl.validFrom')}</div>
                  <div className="font-mono text-xs text-fg mt-0.5 break-all">{info.valid_from ?? '—'}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-fg-subtle">{t('ssl.validTo')}</div>
                  <div className="font-mono text-xs text-fg mt-0.5 break-all">{info.valid_to ?? '—'}</div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/60">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-fg-muted">{t('ssl.daysRemaining')}</span>
                  <span
                    className={`font-semibold ${
                      (info.days_remaining ?? 0) < 0
                        ? 'text-danger'
                        : (info.days_remaining ?? 0) < 7
                          ? 'text-danger'
                          : (info.days_remaining ?? 0) < 14
                            ? 'text-warning'
                            : 'text-success'
                    }`}
                  >
                    {t('ssl.days', { count: info.days_remaining ?? 0 })}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-xs ${
                    info.chain_complete ? 'text-success' : 'text-warning'
                  }`}
                >
                  {info.chain_complete ? <Lock size={12} /> : <Unlock size={12} />}
                  {info.chain_complete ? t('ssl.chainComplete') : t('ssl.chainIncomplete')}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-start gap-2 text-sm text-danger">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="font-medium">{t('ssl.checkFailed')}</div>
                {errorText && (
                  <p className="text-xs text-fg-muted mt-0.5 break-all">{errorText}</p>
                )}
              </div>
            </div>
          )
        ) : (
          <p className="text-sm text-fg-muted">{t('ssl.notCheckedHint')}</p>
        )}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCheck}
            loading={loading}
          >
            <RefreshCw size={14} />
            {isFailed ? t('ssl.retry') : t('ssl.check')}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onDelete}
            disabled={deleting}
            loading={deleting}
            aria-label={t('common.delete')}
            className="text-fg-muted hover:text-danger"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
