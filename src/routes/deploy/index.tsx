import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyError } from '@/components/ui/EmptyState'
import { deployApi } from '@/api/deploy'
import { useI18n } from '@/hooks/useI18n'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { APP_ICONS, Rocket } from './components/AppIcons'
import { DeployModal } from './components/DeployModal'
import type { DeployAppInfo } from '@shared/types'

export default function Deploy() {
  const { t } = useI18n()
  useDocumentTitle('deploy.documentTitle')

  const appsQuery = useQuery({
    queryKey: ['deploy', 'apps'],
    queryFn: () => deployApi.apps(),
  })

  const [selected, setSelected] = useState<DeployAppInfo | null>(null)

  const openModal = (app: DeployAppInfo) => {
    setSelected(app)
  }

  const closeModal = () => {
    setSelected(null)
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <Card>
        <CardHeader className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Rocket size={16} className="text-fg-muted shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium text-fg">{t('deploy.pageTitle')}</div>
              <div className="text-xs text-fg-subtle">{t('deploy.description')}</div>
            </div>
          </div>
          <Badge variant="muted" className="shrink-0">
            {t('deploy.apps')}
          </Badge>
        </CardHeader>
        <CardBody>
          {appsQuery.isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[0, 1].map((i) => (
                <div key={i} className="rounded-xl border border-border p-4 space-y-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          )}

          {appsQuery.isError && (
            <EmptyError error={appsQuery.error instanceof Error ? appsQuery.error.message : undefined} onRetry={() => appsQuery.refetch()} />
          )}

          {appsQuery.data && appsQuery.data.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-fg-muted">{t('deploy.noApps')}</p>
            </div>
          )}

          {appsQuery.data && appsQuery.data.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appsQuery.data.map((app) => {
                const Icon = APP_ICONS[app.id] ?? Rocket
                return (
                  <div
                    key={app.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-border p-4 hover:border-accent/40 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                        <Icon size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-fg">{t(app.name_key)}</span>
                          <Badge variant="muted">{app.version}</Badge>
                        </div>
                        <p className="text-xs text-fg-subtle mt-1 leading-relaxed">
                          {t(app.description_key)}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="secondary" className="shrink-0" onClick={() => openModal(app)}>
                      <Download size={14} className="mr-1.5" />
                      {t('deploy.deploy')}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardBody>
      </Card>

      <DeployModal selected={selected} onClose={closeModal} />
    </div>
  )
}
