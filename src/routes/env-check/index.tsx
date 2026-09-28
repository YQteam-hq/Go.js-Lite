import { useQuery } from '@tanstack/react-query'
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Puzzle,
  Terminal,
  FolderTree,
  SlidersHorizontal,
} from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'
import { envCheckApi } from '@/api/envCheck'
import { useI18n } from '@/hooks/useI18n'
import { resolveErrorText } from '@/lib/errorMessages'
import { EnvCheckCard } from './components/EnvCheckCard'
import type { EnvCheckItem } from '@shared/types'

type Category = 'extension' | 'function' | 'system' | 'config'

const CATEGORY_ICON: Record<Category, React.ReactNode> = {
  extension: <Puzzle size={16} />,
  function: <Terminal size={16} />,
  system: <FolderTree size={16} />,
  config: <SlidersHorizontal size={16} />,
}

const CATEGORY_ORDER: Category[] = ['extension', 'function', 'system', 'config']

export default function EnvCheck() {
  const { t } = useI18n()

  const { data, isLoading, error } = useQuery({
    queryKey: ['env-check'],
    queryFn: () => envCheckApi.get(),
  })

  const summary = data?.summary
  const total = summary?.total ?? 0
  const passed = summary?.passed ?? 0
  const failed = summary?.failed ?? 0
  const score = total > 0 ? Math.round((passed / total) * 100) : 0

  const grouped: Record<Category, EnvCheckItem[]> = {
    extension: [],
    function: [],
    system: [],
    config: [],
  }
  if (data) {
    for (const item of data.items) {
      if (grouped[item.category]) {
        grouped[item.category].push(item)
      }
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-fg">{t('envCheck.title')}</h1>
        <p className="text-sm text-fg-muted mt-0.5">{t('envCheck.description')}</p>
      </div>

      {isLoading ? (
        <div className="space-y-5">
          <Skeleton variant="rectangular" height={96} className="w-full" />
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
          {}
          <Card>
            <CardBody className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-12 h-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  <ClipboardCheck size={24} />
                </div>
                <div>
                  <div className="text-xs text-fg-subtle">{t('envCheck.summary')}</div>
                  <div className="text-2xl font-bold text-fg">
                    {passed}
                    <span className="text-base text-fg-muted font-normal">/{total}</span>
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
                    {t('envCheck.passed')} {passed}
                  </span>
                  <span className="inline-flex items-center gap-1 text-danger">
                    <XCircle size={14} />
                    {t('envCheck.failed')} {failed}
                  </span>
                  <span className="inline-flex items-center gap-1 text-fg-muted">
                    {t('envCheck.total')} {total}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          {}
          {CATEGORY_ORDER.map((cat) => {
            const items = grouped[cat]
            if (!items || items.length === 0) return null
            return (
              <div key={cat} className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-fg-muted">
                  <span className="text-accent">{CATEGORY_ICON[cat]}</span>
                  <span>{t(`envCheck.${cat}`)}</span>
                  <span className="text-fg-subtle text-xs">
                    {items.filter((i) => i.available).length}/{items.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item) => (
                    <EnvCheckCard key={`${item.category}-${item.name}`} item={item} />
                  ))}
                </div>
              </div>
            )
          })}
        </>
      ) : null}
    </div>
  )
}
