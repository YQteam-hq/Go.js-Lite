import { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useI18n } from '@/hooks/useI18n'
import type { WebsiteMonitorHistoryEntry as MonitorHistory } from '@/api/websiteMonitor'

interface HistoryListProps {
  history: MonitorHistory[]
  isLoading: boolean
}

export function HistoryList({ history, isLoading }: HistoryListProps) {
  const { t } = useI18n()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up':
        return <span className="w-4 h-4 rounded-full bg-green-500" />
      case 'down':
        return <span className="w-4 h-4 rounded-full bg-red-500" />
      case 'error':
        return <span className="w-4 h-4 rounded-full bg-yellow-500" />
      default:
        return <span className="w-4 h-4 rounded-full bg-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'up':
        return <span className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-700">{t('websiteMonitor.statusUp')}</span>
      case 'down':
        return <span className="px-2 py-0.5 text-xs rounded bg-red-100 text-red-700">{t('websiteMonitor.statusDown')}</span>
      case 'error':
        return <span className="px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-700">{t('websiteMonitor.statusError')}</span>
      default:
        return <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700">{t('websiteMonitor.statusUnknown')}</span>
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  return (
    <CardHeader>
      <CardTitle>{t('websiteMonitor.monitorHistory')}</CardTitle>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">{t('common.loading')}</div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {Array.isArray(history) && history.length > 0 ? (
              history.slice().reverse().map((item: MonitorHistory, index: number) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className="font-medium">{item.url}</span>
                      {getStatusBadge(item.status)}
                    </div>
                    <span className="text-xs text-muted-foreground">{formatTime(item.timestamp)}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">{t('websiteMonitor.statusCode')}:</span>
                      <span className="ml-2 font-mono">{item.status_code}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('websiteMonitor.responseTime')}:</span>
                      <span className="ml-2">{item.response_time}ms</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('websiteMonitor.contentSize')}:</span>
                      <span className="ml-2">{item.content_size} bytes</span>
                    </div>
                    {item.error && (
                      <div className="text-red-600">
                        <span className="text-muted-foreground">{t('websiteMonitor.error')}:</span>
                        <span className="ml-2">{item.error}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">{t('websiteMonitor.noHistory')}</div>
            )}
          </div>
        )}
      </CardContent>
    </CardHeader>
  )
}
