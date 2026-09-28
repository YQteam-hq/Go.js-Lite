import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  HardDrive,
  BarChart3,
  FileText,
  RefreshCw,
  ArrowLeft,
  Home,
} from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'
import { StorageMeter } from '@/components/disk/StorageMeter'
import { diskAnalysisApi } from '@/api/diskAnalysis'
import { useFormat } from '@/lib/format'
import { useI18n } from '@/hooks/useI18n'
import type { DiskDirectory } from '@shared/types'
import { OverviewStat } from './components/OverviewStat'
import { DirectoryRow } from './components/DirectoryRow'
import { LargeFileRow } from './components/LargeFileRow'
import { DirectorySkeleton } from './components/DirectorySkeleton'
import { ErrorState } from './components/ErrorState'
import { DiskRing, DirBarChart } from './components/DiskRing'

function getParentPath(path: string): string {
  if (path === '/' || path === '') return '/'
  const trimmed = path.replace(/\/+$/, '')
  const lastSlash = trimmed.lastIndexOf('/')
  if (lastSlash <= 0) return '/'
  return trimmed.slice(0, lastSlash)
}

export default function DiskAnalysis() {
  const { t } = useI18n()
  const { formatBytes, formatDate } = useFormat()
  const [currentPath, setCurrentPath] = useState('/')

  const {
    data: analysis,
    isLoading: loadingAnalysis,
    error: analysisError,
    refetch: refetchAnalysis,
  } = useQuery({
    queryKey: ['disk-analysis', currentPath],
    queryFn: () => diskAnalysisApi.get(currentPath),
  })

  const {
    data: largeFiles,
    isLoading: loadingLarge,
    error: largeFilesError,
    refetch: refetchLarge,
  } = useQuery({
    queryKey: ['disk-analysis', 'large-files'],
    queryFn: () => diskAnalysisApi.getLargeFiles(),
  })

  const diskTotal = analysis?.diskTotal ?? 0
  const diskFree = analysis?.diskFree ?? 0
  const diskUsed = diskTotal > 0 ? diskTotal - diskFree : 0
  const usagePercent = diskTotal > 0 ? (diskUsed / diskTotal) * 100 : 0

  const directories = analysis?.directories ?? []
  const totalSize = analysis?.totalSize ?? 0
  const maxDirSize = directories.length > 0 ? directories[0].size : 0
  const files = largeFiles?.files ?? []

  const hasAnalysisError = !loadingAnalysis && !analysis && !!analysisError
  const hasLargeFilesError = !loadingLarge && !largeFiles && !!largeFilesError

  const canGoBack = currentPath !== '/' && currentPath !== ''

  const handleDrillDown = (path: string) => {
    setCurrentPath(path)
  }
  const handleBack = () => {
    setCurrentPath(getParentPath(currentPath))
  }
  const handleHome = () => {
    setCurrentPath('/')
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-fg">{t('diskAnalysis.title')}</h1>
          <p className="text-sm text-fg-muted mt-0.5">{t('diskAnalysis.subtitle')}</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            refetchAnalysis()
            refetchLarge()
          }}
        >
          <RefreshCw size={16} />
          {t('common.refresh')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DiskRingCard
          loading={loadingAnalysis}
          hasError={hasAnalysisError}
          percent={usagePercent}
          used={diskUsed}
          total={diskTotal}
          formatBytes={formatBytes}
          t={t}
        />
        <DirBarChartCard
          loading={loadingAnalysis}
          hasError={hasAnalysisError}
          directories={directories}
          totalSize={totalSize}
          maxDirSize={maxDirSize}
          currentPath={currentPath}
          canGoBack={canGoBack}
          onDrillDown={handleDrillDown}
          onBack={handleBack}
          onHome={handleHome}
          formatBytes={formatBytes}
          t={t}
        />
      </div>

      {loadingAnalysis ? (
        <SkeletonCard />
      ) : hasAnalysisError ? (
        <ErrorState
          message={
            analysisError instanceof Error
              ? analysisError.message
              : t('diskAnalysis.loadFailed')
          }
          onRetry={() => refetchAnalysis()}
          retryLabel={t('common.retry')}
        />
      ) : analysis ? (
        <Card className="card-hover">
          <CardHeader className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <HardDrive size={20} />
            </div>
            <div>
              <div className="text-sm font-medium text-fg">{t('diskAnalysis.overview')}</div>
              <div className="text-xs text-fg-subtle">{t('diskAnalysis.overviewSubtitle')}</div>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <OverviewStat
                label={t('diskAnalysis.total')}
                value={formatBytes(diskTotal)}
                color="info"
              />
              <OverviewStat
                label={t('diskAnalysis.used')}
                value={formatBytes(diskUsed)}
                color="warning"
              />
              <OverviewStat
                label={t('diskAnalysis.free')}
                value={formatBytes(diskFree)}
                color="success"
              />
            </div>
            <StorageMeter
              used={diskUsed}
              total={diskTotal}
              free={diskFree}
              label={t('diskAnalysis.usage')}
            />
          </CardBody>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="card-hover flex flex-col">
          <CardHeader className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info/10 text-info flex items-center justify-center">
              <BarChart3 size={20} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-fg truncate">
                {t('diskAnalysis.directories')}
              </div>
              <div className="text-xs text-fg-subtle truncate">
                {t('diskAnalysis.directoriesSubtitle')}
              </div>
            </div>
            {directories.length > 0 && (
              <Badge variant="muted" className="ml-auto shrink-0">
                {directories.length}
                {t('diskAnalysis.directoriesCount')}
              </Badge>
            )}
          </CardHeader>
          <CardBody className="p-0 flex-1 min-h-0">
            {loadingAnalysis ? (
              <DirectorySkeleton />
            ) : hasAnalysisError ? (
              <div className="p-6">
                <ErrorState
                  compact
                  message={t('diskAnalysis.loadFailed')}
                  onRetry={() => refetchAnalysis()}
                  retryLabel={t('common.retry')}
                />
              </div>
            ) : directories.length === 0 ? (
              <div className="p-8 text-center text-sm text-fg-muted">
                {t('diskAnalysis.noDirectories')}
              </div>
            ) : (
              <div className="max-h-96 overflow-auto">
                <ul className="divide-y divide-border">
                  {directories.map((dir, i) => (
                    <DirectoryRow
                      key={`${dir.path}-${i}`}
                      dir={dir}
                      maxDirSize={maxDirSize}
                      formatBytes={formatBytes}
                      t={t}
                    />
                  ))}
                </ul>
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="card-hover flex flex-col">
          <CardHeader className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-fg truncate">
                {t('diskAnalysis.largeFiles')}
              </div>
              <div className="text-xs text-fg-subtle truncate">
                {t('diskAnalysis.largeFilesSubtitle')}
              </div>
            </div>
            {files.length > 0 && (
              <Badge variant="muted" className="ml-auto shrink-0">
                {files.length}
                {t('diskAnalysis.largeFilesCount')}
              </Badge>
            )}
          </CardHeader>
          <CardBody className="p-0 flex-1 min-h-0">
            {loadingLarge ? (
              <DirectorySkeleton />
            ) : hasLargeFilesError ? (
              <div className="p-6">
                <ErrorState
                  compact
                  message={
                    largeFilesError instanceof Error
                      ? largeFilesError.message
                      : t('diskAnalysis.loadFailed')
                  }
                  onRetry={() => refetchLarge()}
                  retryLabel={t('common.retry')}
                />
              </div>
            ) : files.length === 0 ? (
              <div className="p-8 text-center text-sm text-fg-muted">
                {t('diskAnalysis.noLargeFiles')}
              </div>
            ) : (
              <div className="max-h-96 overflow-auto">
                <ul className="divide-y divide-border">
                  {files.map((file, i) => (
                    <LargeFileRow
                      key={`${file.path}-${i}`}
                      file={file}
                      formatBytes={formatBytes}
                      formatDate={formatDate}
                    />
                  ))}
                </ul>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

type TFunc = (key: string, params?: Record<string, string | number>) => string

function DiskRingCard({
  loading,
  hasError,
  percent,
  used,
  total,
  formatBytes,
  t,
}: {
  loading: boolean
  hasError: boolean
  percent: number
  used: number
  total: number
  formatBytes: (n: number) => string
  t: TFunc
}) {
  return (
    <Card className="card-hover">
      <CardHeader className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
          <HardDrive size={20} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-fg truncate">
            {t('diskAnalysis.usageRing')}
          </div>
          <div className="text-xs text-fg-subtle truncate">
            {t('diskAnalysis.overviewSubtitle')}
          </div>
        </div>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div className="flex flex-col items-center py-4">
            <Skeleton variant="circular" width={160} height={160} />
            <Skeleton variant="text" className="w-40 h-4 mt-4" />
          </div>
        ) : hasError ? (
          <div className="py-6 text-center text-sm text-fg-muted">
            {t('diskAnalysis.loadFailed')}
          </div>
        ) : (
          <DiskRing
            percent={percent}
            used={used}
            total={total}
            formatBytes={formatBytes}
            t={t}
          />
        )}
      </CardBody>
    </Card>
  )
}

function DirBarChartCard({
  loading,
  hasError,
  directories,
  totalSize,
  maxDirSize,
  currentPath,
  canGoBack,
  onDrillDown,
  onBack,
  onHome,
  formatBytes,
  t,
}: {
  loading: boolean
  hasError: boolean
  directories: DiskDirectory[]
  totalSize: number
  maxDirSize: number
  currentPath: string
  canGoBack: boolean
  onDrillDown: (path: string) => void
  onBack: () => void
  onHome: () => void
  formatBytes: (n: number) => string
  t: TFunc
}) {
  const topDirs = directories.slice(0, 10)

  return (
    <Card className="card-hover flex flex-col">
      <CardHeader className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-info/10 text-info flex items-center justify-center shrink-0">
          <BarChart3 size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-fg truncate">
            {t('diskAnalysis.topDirectories')}
          </div>
          <div className="text-xs text-fg-subtle truncate">
            {t('diskAnalysis.topDirectoriesSubtitle')}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {canGoBack && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onHome}
              title={t('nav.diskAnalysis')}
              aria-label={t('nav.diskAnalysis')}
            >
              <Home size={15} />
            </Button>
          )}
          {canGoBack && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onBack}
              title={t('diskAnalysis.backToParent')}
              aria-label={t('diskAnalysis.backToParent')}
            >
              <ArrowLeft size={15} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardBody className="flex-1 min-h-0 p-0">
        {canGoBack && (
          <div className="px-4 pt-3 pb-1 flex items-center gap-1 text-xs text-fg-subtle">
            <span className="text-fg-subtle/70">{t('diskAnalysis.currentPath')}:</span>
            <span className="font-mono truncate min-w-0" title={currentPath}>
              {currentPath}
            </span>
          </div>
        )}
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Skeleton variant="text" className="w-24 h-3.5" />
                  <Skeleton variant="text" className="w-12 h-3.5 ml-auto" />
                </div>
                <Skeleton variant="rectangular" height={8} className="w-full" />
              </div>
            ))}
          </div>
        ) : hasError ? (
          <div className="p-6 text-center text-sm text-fg-muted">
            {t('diskAnalysis.loadFailed')}
          </div>
        ) : topDirs.length === 0 ? (
          <div className="p-8 text-center text-sm text-fg-muted">
            {canGoBack ? t('diskAnalysis.noSubDirectories') : t('diskAnalysis.noDirectories')}
          </div>
        ) : (
          <DirBarChart
            directories={topDirs}
            totalSize={totalSize}
            maxDirSize={maxDirSize}
            onDrillDown={onDrillDown}
            formatBytes={formatBytes}
            t={t}
          />
        )}
      </CardBody>
    </Card>
  )
}
