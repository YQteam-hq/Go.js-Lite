import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Shield, AlertOctagon } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { secscanApi } from '@/api/secscan'
import { useI18n } from '@/hooks/useI18n'
import { useUiStore } from '@/stores/uiStore'
import type { SecurityScanFrontendResult, SecurityScanBackendResult } from '@shared/types'
import { ScanCard, countSeverities } from './components'

export default function SecurityScan() {
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const addToast = useUiStore((s) => s.addToast)

  const frontendQuery = useQuery({
    queryKey: ['secscan', 'frontend'],
    queryFn: () => secscanApi.frontend(false),
    retry: 1,
    staleTime: 30 * 60 * 1000,
  })

  const backendQuery = useQuery({
    queryKey: ['secscan', 'backend'],
    queryFn: () => secscanApi.backend(false),
    retry: 1,
    staleTime: 30 * 60 * 1000,
  })

  const rescanFrontendMut = useMutation({
    mutationFn: () => secscanApi.frontend(true),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['secscan', 'frontend'] })
      addToast({ type: 'success', title: t('secscan.frontendCard'), description: t('secscan.scanning') })
    },
    onError: (err) => {
      addToast({
        type: 'error',
        title: t('secscan.frontendCard'),
        description: err instanceof Error ? err.message : t('secscan.scanFailed'),
      })
    },
  })

  const rescanBackendMut = useMutation({
    mutationFn: () => secscanApi.backend(true),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['secscan', 'backend'] })
      addToast({ type: 'success', title: t('secscan.backendCard'), description: t('secscan.scanning') })
    },
    onError: (err) => {
      addToast({
        type: 'error',
        title: t('secscan.backendCard'),
        description: err instanceof Error ? err.message : t('secscan.scanFailed'),
      })
    },
  })

  const frontendResult = frontendQuery.data as SecurityScanFrontendResult | undefined
  const backendResult = backendQuery.data as SecurityScanBackendResult | undefined

  const frontendCounts = countSeverities(frontendResult?.vulns ?? [])
  const backendCounts = countSeverities(backendResult?.vulns ?? [])

  const bothFailed =
    frontendQuery.isError && backendQuery.isError && !frontendResult && !backendResult

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-fg flex items-center gap-2">
            <Shield size={20} className="text-accent" />
            {t('nav.securityScan')}
          </h1>
          <p className="text-xs text-fg-muted mt-1">
            <Shield size={14} className="inline mr-1 mb-0.5 opacity-70" />
            {t('security.policyLinkIntro')}
            <a
              href="/SECURITY.md"
              target="_blank"
              rel="noreferrer noopener"
              className="underline text-accent hover:text-accent-hover ml-1"
            >
              {t('security.policyLinkLabel')}
            </a>
          </p>
        </div>
      </div>

      {bothFailed && (
        <Card className="border-danger/40">
          <CardBody>
            <div className="flex items-start gap-2.5">
              <AlertOctagon size={18} className="shrink-0 mt-0.5 text-danger" />
              <div className="text-sm text-danger leading-relaxed">
                {t('secscan.scanFailed')} (frontend + backend) —{' '}
                {frontendQuery.error instanceof Error
                  ? frontendQuery.error.message
                  : backendQuery.error instanceof Error
                    ? backendQuery.error.message
                    : t('common.unknownError')}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ScanCard
          type="frontend"
          result={frontendResult}
          isLoading={frontendQuery.isLoading}
          error={frontendQuery.error}
          counts={frontendCounts}
          onRescan={() => rescanFrontendMut.mutate()}
          isRescanning={rescanFrontendMut.isPending}
        />
        <ScanCard
          type="backend"
          result={backendResult}
          isLoading={backendQuery.isLoading}
          error={backendQuery.error}
          counts={backendCounts}
          onRescan={() => rescanBackendMut.mutate()}
          isRescanning={rescanBackendMut.isPending}
        />
      </div>
    </div>
  )
}
