import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw, Download, Trash2, CheckCircle2, XCircle, Settings } from 'lucide-react'
import { Button } from '@/components/ui/Button'
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

interface CertRowProps {
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

export function CertRow({
  record,
  onRefresh,
  onDelete,
}: CertRowProps) {
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const [renewing, setRenewing] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [editingAutoRenew, setEditingAutoRenew] = useState(false)
  const [autoRenewInput, setAutoRenewInput] = useState(String(record.auto_renew_days_before ?? 30))

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

  const saveAutoRenew = async () => {
    const days = Math.max(0, Math.min(90, parseInt(autoRenewInput, 10) || 0))
    try {
      await sslApi.updateAutoRenew(record.id, days)
      toast({ type: 'success', title: t('common.updated') })
      queryClient.invalidateQueries({ queryKey: ['ssl-acme-certs'] })
    } catch (err) {
      toast({ type: 'error', title: t('common.saveFailed'), description: err instanceof Error ? resolveErrorText(err) : t('common.unknownError') })
    } finally {
      setEditingAutoRenew(false)
    }
  }

  const autoRenewDays = record.auto_renew_days_before ?? 30
  const autoRenewEnabled = autoRenewDays > 0

  return (
    <tr className="border-b border-border/50 hover:bg-bg-sunken/30 transition-colors">
      <td className="px-4 py-3">
        <div className="font-medium text-fg">{record.domain}</div>
        {record.san_domains && record.san_domains.length > 1 && (
          <div className="text-xs text-fg-subtle mt-0.5">+{record.san_domains.length - 1} SAN</div>
        )}
      </td>
      <td className="px-4 py-3">
        <CertStatusBadge status={record.status_derived} />
        {record.last_renew_error && (
          <div
            className="text-[11px] text-danger mt-1 max-w-[240px] truncate"
            title={truncate(record.last_renew_error, 120)}
          >
            {t('ssl.acme.renewError')}：{truncate(record.last_renew_error, 120)}
          </div>
        )}
      </td>
      <td className="px-4 py-3 font-mono text-xs text-fg-muted">
        {formatDate(record.not_before_ts)}
      </td>
      <td className="px-4 py-3">
        <div className="font-mono text-xs text-fg">{formatDate(record.not_after_ts)}</div>
        <div className="text-xs text-fg-subtle mt-0.5">{daysFromNow(record.not_after_ts)}</div>
      </td>
      <td className="px-4 py-3 text-sm text-fg-muted">
        {record.issuer_url || 'Let\'s Encrypt'}
      </td>
      <td className="px-4 py-3">
        {editingAutoRenew ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={90}
              value={autoRenewInput}
              onChange={(e) => setAutoRenewInput(e.target.value)}
              className="w-20 px-2 py-1 text-xs border border-border rounded-lg bg-bg text-fg focus:outline-none focus:border-accent"
            />
            <Button size="icon-sm" variant="primary" onClick={saveAutoRenew}>
              <CheckCircle2 size={14} />
            </Button>
            <Button size="icon-sm" variant="ghost" onClick={() => setEditingAutoRenew(false)}>
              <XCircle size={14} />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => {
              setAutoRenewInput(String(autoRenewDays))
              setEditingAutoRenew(true)
            }}
            className="group inline-flex items-center gap-1.5 text-xs"
          >
            {autoRenewEnabled ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-success/10 text-success group-hover:bg-success/20">
                <CheckCircle2 size={12} />
                Renews {autoRenewDays}d before
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-bg-sunken text-fg-muted group-hover:bg-bg-sunken/80">
                <Settings size={12} />
                Manual renew
              </span>
            )}
          </button>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
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
      </td>
    </tr>
  )
}

export { formatDate, daysFromNow }
