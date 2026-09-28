import { Button } from '@/components/ui/Button'
import { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useI18n } from '@/hooks/useI18n'
import type { WebsiteMonitorNotification as Notification } from '@/api/websiteMonitor'

interface NotificationListProps {
  notifications: Notification[]
  isLoading: boolean
  onAcknowledge: (id: string) => void
}

export function NotificationList({ notifications, isLoading, onAcknowledge }: NotificationListProps) {
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
      <CardTitle>{t('websiteMonitor.notifications')}</CardTitle>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">{t('common.loading')}</div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {Array.isArray(notifications) && notifications.length > 0 ? (
              notifications.slice().reverse().map((notification: Notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border rounded-lg ${notification.acknowledged ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(notification.status)}
                      <div>
                        <span className="font-medium">{notification.website_name}</span>
                        <span className="text-sm text-muted-foreground ml-2">({notification.url})</span>
                      </div>
                      {getStatusBadge(notification.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{formatTime(notification.timestamp)}</span>
                      {!notification.acknowledged && (
                        <Button variant="ghost" size="sm" onClick={() => onAcknowledge(notification.id)}>
                          {t('websiteMonitor.acknowledge')}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>{t('websiteMonitor.statusCode')}: {notification.status_code}</div>
                    <div>{t('websiteMonitor.responseTime')}: {notification.response_time}ms</div>
                    {notification.error && (
                      <div className="text-red-600 mt-1">{t('websiteMonitor.error')}: {notification.error}</div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">{t('websiteMonitor.noNotifications')}</div>
            )}
          </div>
        )}
      </CardContent>
    </CardHeader>
  )
}
