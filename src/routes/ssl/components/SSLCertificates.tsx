import { useCallback, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FileCheck2, Plus } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Confirm } from '@/components/ui/Modal'
import { sslApi } from '@/api/ssl'
import { toast } from '@/components/ui/Toast'
import { useI18n } from '@/hooks/useI18n'
import { resolveErrorText } from '@/lib/errorMessages'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { CapabilityBanner } from './CapabilityBanner'
import { CertRow } from './CertRow'
import { CertCard } from './CertCard'
import { IssueCertModal } from './IssueCertModal'

export function SSLCertificates() {
  const { t } = useI18n()
  const isMobile = useIsMobile()
  const queryClient = useQueryClient()
  const [issueModalOpen, setIssueModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: caps, isLoading: capsLoading } = useQuery({
    queryKey: ['ssl-acme-caps'],
    queryFn: () => sslApi.acmeCapabilities(),
  })

  const { data: records, isLoading: listLoading } = useQuery({
    queryKey: ['ssl-acme-certs'],
    queryFn: () => sslApi.listCertificates(),
  })

  const refreshList = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['ssl-acme-certs'] })
  }, [queryClient])

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap stagger-2">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-fg flex items-center gap-2">
            <FileCheck2 size={18} className="text-accent" />
            {t('ssl.acme.tabCertificates')}
          </h2>
          <p className="text-sm text-fg-muted mt-0.5">{t('ssl.acme.subheaderReadyOk')}</p>
        </div>
        <Button
          onClick={() => setIssueModalOpen(true)}
          disabled={!caps?.available && !capsLoading}
        >
          <Plus size={16} />
          {t('ssl.acme.issueCert')}
        </Button>
      </div>

      <CapabilityBanner caps={caps} loading={capsLoading} />

      {listLoading ? (
        <div className="space-y-3">
          <Skeleton variant="rectangular" height={56} className="w-full" />
          <Skeleton variant="rectangular" height={56} className="w-full" />
          <Skeleton variant="rectangular" height={56} className="w-full" />
        </div>
      ) : !records || records.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-bg-sunken flex items-center justify-center text-fg-subtle">
              <FileCheck2 size={28} />
            </div>
            <p className="text-sm text-fg-muted">{t('ssl.empty')}</p>
            <p className="text-xs text-fg-subtle mt-1">{t('ssl.emptyHint')}</p>
          </CardBody>
        </Card>
      ) : isMobile ? (
        <div className="space-y-3">
          {records.map((r) => (
            <CertCard
              key={r.id}
              record={r}
              onRefresh={refreshList}
              onDelete={() => setDeleteId(r.id)}
            />
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-sunken/50 border-b border-border">
                  <th className="text-left font-medium text-fg-muted px-4 py-3">{t('ssl.acme.colDomain')}</th>
                  <th className="text-left font-medium text-fg-muted px-4 py-3">{t('ssl.acme.colStatus')}</th>
                  <th className="text-left font-medium text-fg-muted px-4 py-3">{t('ssl.acme.colNotBefore')}</th>
                  <th className="text-left font-medium text-fg-muted px-4 py-3">{t('ssl.acme.colNotAfter')}</th>
                  <th className="text-left font-medium text-fg-muted px-4 py-3">{t('ssl.acme.colIssuer')}</th>
                  <th className="text-left font-medium text-fg-muted px-4 py-3">{t('ssl.acme.colAutoRenew')}</th>
                  <th className="text-right font-medium text-fg-muted px-4 py-3">{t('ssl.acme.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <CertRow
                    key={r.id}
                    record={r}
                    onRefresh={refreshList}
                    onDelete={() => setDeleteId(r.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <IssueCertModal
        open={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        onIssued={refreshList}
      />

      <Confirm
        open={deleteId !== null}
        title={t('common.delete')}
        message={t('ssl.deleteConfirm', {
          domain: records?.find((r) => r.id === deleteId)?.domain ?? '',
        })}
        variant="danger"
        onConfirm={async () => {
          if (deleteId === null) return
          try {
            await sslApi.removeCert(deleteId)
            toast({ type: 'success', title: t('common.deleted') })
            refreshList()
          } catch (err) {
            toast({ type: 'error', title: t('common.deleteFailed'), description: err instanceof Error ? resolveErrorText(err) : t('common.unknownError') })
          }
          setDeleteId(null)
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
