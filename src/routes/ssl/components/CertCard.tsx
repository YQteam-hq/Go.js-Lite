import { useState } from 'react'
import { RefreshCw, Download, Trash2, CheckCircle2, Server } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CertStatusBadge } from './CertStatusBadge'
import { useI18n } from '@/hooks/useI18n'
import { sslApi } from '@/api/ssl'
import { toast } from '@/components/ui/Toast'
import { resolveErrorText } from '@/lib/errorMessages'
import { truncate } from '@/lib/format'
import type { AcmeCertStatus, AcmeCertificateRecord } from '@shared/types'

type CertListRecord = Omit<AcmeCertificateRecord, 'privkey_pem_enc' | 'status'> & {
  status_derived: AcmeCertStatus
}

interface CertCardProps {
  record: CertListRecord
  onRefresh: () => void
  onDelete: () => void
}

function formatDate(ts: number) {
  if (!ts) return '—'
  return new Date(ts * 1000).toISOString().slice(0, 10)
}

function daysFromNow(ts: number): string {
  if (!ts) return ''
  const diff = ts - Math.floor(Date.now() / 1000)
  const days = Math.floor(diff / 86400)
  if (days >= 0) return `Expires in ${days}d`
  return `Expired ${-days}d ago`
}

export function CertCard({
  record,
  onRefresh,
  onDelete,
}: CertCardProps) {
  const { t } = useI18n()
  const [renewing, setRenewing] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const handleRenew = async () => {
    setRenewing(true)
    try {
      await sslApi.renewCert(record.id)
      toast({ type: 'success', title: t('ssl.acme.renewButton') })
      onRefresh()
    } catch (err) {
      toast({ type: 'error', title: t('ssl.addFailed'), description: err instanceof Error ? resolveErrorText(err) : t('common.unknownError') })
    } finally {
      setRenewing(false)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const blob = await sslApi.downloadPem(record.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${record.domain}.pem`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      toast({ type: 'error', title: t('common.download') + ' ' + t('common.failure'), description: err instanceof Error ? resolveErrorText(err) : t('common.unknownError') })
    } finally {
      setDownloading(false)
    }
  }

  const autoRenewDays = record.auto_renew_days_before ?? 30
  const autoRenewEnabled = autoRenewDays > 0

  return (
    <Card>
      <CardHeader className="flex items-start justify-between gap-3 py-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-fg truncate">{record.domain}</div>
          <div className="mt-2"><CertStatusBadge status={record.status_derived} /></div>
          {record.last_renew_error && (
            <div className="text-[11px] text-danger mt-1 break-all" title={truncate(record.last_renew_error, 120)}>
              {t('ssl.acme.renewError')}：{truncate(record.last_renew_error, 120)}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon-sm" onClick={handleRenew} loading={renewing} aria-label={t('ssl.acme.renewButton')}>
            <RefreshCw size={14} />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={handleDownload} loading={downloading} aria-label={t('ssl.acme.downloadPem')}>
            <Download size={14} />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onDelete} aria-label={t('ssl.acme.deleteButton')} className="text-fg-muted hover:text-danger">
            <Trash2 size={14} />
          </Button>
        </div>
      </CardHeader>
      <CardBody className="space-y-2 pt-0">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-fg-subtle">{t('ssl.acme.colNotBefore')}</div>
            <div className="font-mono text-fg mt-0.5">{formatDate(record.not_before_ts)}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-fg-subtle">{t('ssl.acme.colNotAfter')}</div>
            <div className="font-mono text-fg mt-0.5">{formatDate(record.not_after_ts)}</div>
            <div className="text-fg-subtle mt-0.5">{daysFromNow(record.not_after_ts)}</div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="text-xs text-fg-muted flex items-center gap-1">
            <Server size={12} />
            {record.issuer_url || 'Let\'s Encrypt'}
          </div>
          {autoRenewEnabled ? (
            <Badge variant="success" className="text-[11px]">
              <CheckCircle2 size={11} />
              Renews {autoRenewDays}d before
            </Badge>
          ) : (
            <Badge variant="muted" className="text-[11px]">
              Manual renew
            </Badge>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
