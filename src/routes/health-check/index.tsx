import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { HeartPulse, ShieldCheck, Gauge, Boxes, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'
import { healthCheckApi } from '@/api/healthCheck'
import { useI18n } from '@/hooks/useI18n'
import { resolveErrorText } from '@/lib/errorMessages'
import { CheckCard } from './components/CheckCard'
import { CompatibilityCard } from './components/CompatibilityCard'

type TabKey = 'security' | 'performance' | 'compatibility'

export default function HealthCheck() {
  const { t } = useI18n()
  const [tab, setTab] = useState<TabKey>('security')

  const { data, isLoading, error } = useQuery({
    queryKey: ['health-check'],
    queryFn: () => healthCheckApi.get(),
  })

  const summary = data?.summary
  const score = summary && summary.total > 0 ? Math.round((summary.pass / summary.total) * 100) : 0

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'security', label: t('healthCheck.tabSecurity'), icon: <ShieldCheck size={16} /> },
    { key: 'performance', label: t('healthCheck.tabPerformance'), icon: <Gauge size={16} /> },
    { key: 'compatibility', label: t('healthCheck.tabCompatibility'), icon: <Boxes size={16} /> },
  ]

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-fg">{t('healthCheck.title')}</h1>
        <p className="text-sm text-fg-muted mt-0.5">{t('healthCheck.subtitle')}</p>
      </div>

      {isLoading ? (
        <div className="space-y-5">
          <Skeleton variant="rectangular" height={96} className="w-full" />
          <div className="flex gap-2">
            <Skeleton variant="rectangular" height={40} width={120} />
            <Skeleton variant="rectangular" height={40} width={120} />
            <Skeleton variant="rectangular" height={40} width={120} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      ) : error ? (
        <Card className="p-6 text-center text-danger">
          {t('common.error')}：{resolveErrorText(error) || t('common.unknownError')}
        </Card>
      ) : data ? (
        <>

          <Card>
            <CardBody className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-12 h-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  <HeartPulse size={24} />
                </div>
                <div>
                  <div className="text-xs text-fg-subtle">{t('healthCheck.overallScore')}</div>
                  <div className="text-2xl font-bold text-fg">
                    {summary?.pass ?? 0}
                    <span className="text-base text-fg-muted font-normal">/{summary?.total ?? 0}</span>
                    <span className="ml-2 text-sm text-fg-muted font-normal">({score}%)</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="h-2.5 rounded-full bg-bg-sunken overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${score}%`,
                      background:
                        score >= 80
                          ? 'hsl(var(--success))'
                          : score >= 50
                            ? 'hsl(var(--warning))'
                            : 'hsl(var(--danger))',
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-3 mt-3 text-xs">
                  <span className="inline-flex items-center gap-1 text-success">
                    <CheckCircle2 size={14} />
                    {t('healthCheck.statusPass')} {summary?.pass ?? 0}
                  </span>
                  <span className="inline-flex items-center gap-1 text-warning">
                    <AlertTriangle size={14} />
                    {t('healthCheck.statusWarning')} {summary?.warning ?? 0}
                  </span>
                  <span className="inline-flex items-center gap-1 text-danger">
                    <XCircle size={14} />
                    {t('healthCheck.statusDanger')} {summary?.danger ?? 0}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>


          <div className="flex gap-1 p-1 bg-bg-sunken rounded-lg overflow-x-auto">
            {tabs.map((tb) => (
              <button
                key={tb.key}
                type="button"
                onClick={() => setTab(tb.key)}
                className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 h-10 px-3 rounded-md text-sm font-medium transition-colors duration-150 focus-ring ${
                  tab === tb.key
                    ? 'bg-bg-elevated text-fg shadow-sm'
                    : 'text-fg-muted hover:text-fg'
                }`}
              >
                {tb.icon}
                <span>{tb.label}</span>
              </button>
            ))}
          </div>


          {tab === 'security' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.security.map((item) => (
                <CheckCard key={item.name} item={item} />
              ))}
            </div>
          )}
          {tab === 'performance' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.performance.map((item) => (
                <CheckCard key={item.name} item={item} />
              ))}
            </div>
          )}
          {tab === 'compatibility' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.compatibility.map((item) => (
                <CompatibilityCard key={item.name} item={item} />
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
