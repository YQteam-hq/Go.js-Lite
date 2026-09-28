import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Trash2, Play, AlertTriangle, Settings, BarChart3 } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import {
  websiteMonitorApi,
  type WebsiteMonitorConfig as WebsiteConfig,
  type WebsiteMonitorHistoryEntry as MonitorHistory,
  type WebsiteMonitorTarget as WebsiteTarget,
} from '@/api/websiteMonitor'
import { WebsiteList, HistoryList, NotificationList } from './components'

export default function WebsiteMonitor() {
  const { t } = useI18n()
  const [config, setConfig] = useState<WebsiteConfig>({ websites: [], check_interval: 60 })
  const [editingWebsite, setEditingWebsite] = useState<WebsiteTarget | null>(null)
  const [activeTab, setActiveTab] = useState<'websites' | 'history' | 'notifications'>('websites')

  const queryClient = useQueryClient()

  const { data: monitorConfig } = useQuery({
    queryKey: ['website-monitor', 'config'],
    queryFn: () => websiteMonitorApi.config(),
  })

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['website-monitor', 'history'],
    queryFn: () => websiteMonitorApi.history(),
  })

  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ['website-monitor', 'notifications'],
    queryFn: () => websiteMonitorApi.notifications(),
  })

  const updateConfigMutation = useMutation({
    mutationFn: (newConfig: WebsiteConfig) => websiteMonitorApi.updateConfig(newConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-monitor', 'config'] })
    }
  })

  const runCheckMutation = useMutation({
    mutationFn: () => websiteMonitorApi.runCheck(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-monitor', 'history'] })
      queryClient.invalidateQueries({ queryKey: ['website-monitor', 'notifications'] })
    }
  })

  const clearNotificationsMutation = useMutation({
    mutationFn: () => websiteMonitorApi.clearNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-monitor', 'notifications'] })
    }
  })

  const acknowledgeNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => websiteMonitorApi.acknowledgeNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-monitor', 'notifications'] })
    }
  })

  useEffect(() => {
    if (monitorConfig) {
      setConfig(monitorConfig)
    }
  }, [monitorConfig])

  const handleSaveWebsite = () => {
    if (!editingWebsite) return

    const newConfig = { ...config }
    const index = newConfig.websites.findIndex(w => w.id === editingWebsite.id)
    if (index !== -1) {
      newConfig.websites[index] = editingWebsite
    } else {
      newConfig.websites.push(editingWebsite)
    }

    updateConfigMutation.mutate(newConfig)
    setEditingWebsite(null)
  }

  const handleDeleteWebsite = (id: string) => {
    if (!confirm(t('websiteMonitor.confirmDelete'))) return

    const newConfig = { ...config }
    newConfig.websites = newConfig.websites.filter(w => w.id !== id)
    updateConfigMutation.mutate(newConfig)
  }

  const handleRunCheck = () => {
    runCheckMutation.mutate()
  }

  const handleClearNotifications = () => {
    if (confirm(t('websiteMonitor.confirmClearNotifications'))) {
      clearNotificationsMutation.mutate()
    }
  }

  const handleAcknowledgeNotification = (id: string) => {
    acknowledgeNotificationMutation.mutate(id)
  }

  const handleAddWebsite = () => {
    setEditingWebsite({
      id: Date.now().toString(),
      name: '',
      url: '',
      enabled: true,
      timeout: 10,
      notifications: true
    })
  }

  const getWebsiteStatus = (websiteUrl: string) => {
    if (!history) return null

    const websiteHistory = history
      .filter((h: MonitorHistory) => h.url === websiteUrl)
      .slice(-5)

    if (websiteHistory.length === 0) return null

    const latest = websiteHistory[websiteHistory.length - 1]
    return {
      status: latest.status,
      response_time: latest.response_time,
      trend: websiteHistory.length > 1 ?
        (latest.status === 'up' ? 'up' : 'down') : 'unknown'
    }
  }

  const websiteStatuses: Record<string, { status: string; response_time: number; trend?: string } | null> = {}
  config.websites.forEach(website => {
    websiteStatuses[website.url] = getWebsiteStatus(website.url)
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('websiteMonitor.title')}</h1>
        <div className="flex gap-2">
          <Button onClick={handleRunCheck} disabled={runCheckMutation.isPending}>
            <Play className="w-4 h-4 mr-2" />
            {t('websiteMonitor.runCheck')}
          </Button>
          <Button variant="ghost" onClick={handleClearNotifications} disabled={clearNotificationsMutation.isPending}>
            <Trash2 className="w-4 h-4 mr-2" />
            {t('websiteMonitor.clearNotifications')}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'websites' | 'history' | 'notifications')} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="websites" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {t('websiteMonitor.websites')}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            {t('websiteMonitor.history')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {t('websiteMonitor.notifications')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="websites" className="space-y-4">
          <Card>
            <div className="p-6">
              <WebsiteList
                websites={config.websites}
                status={websiteStatuses}
                onEdit={setEditingWebsite}
                onDelete={handleDeleteWebsite}
                onAdd={handleAddWebsite}
              />
            </div>
          </Card>

          {editingWebsite && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">
                  {editingWebsite?.id && !config.websites.find(w => w.id === editingWebsite.id)
                    ? t('websiteMonitor.editWebsite')
                    : t('websiteMonitor.addWebsite')}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">{t('websiteMonitor.websiteName')}</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md"
                      value={editingWebsite.name}
                      onChange={(e) => setEditingWebsite({...editingWebsite, name: e.target.value})}
                      placeholder={t('websiteMonitor.websiteNamePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">{t('websiteMonitor.websiteUrl')}</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md"
                      value={editingWebsite.url}
                      onChange={(e) => setEditingWebsite({...editingWebsite, url: e.target.value})}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">{t('websiteMonitor.timeout')}</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border rounded-md"
                      value={editingWebsite.timeout}
                      onChange={(e) => setEditingWebsite({...editingWebsite, timeout: parseInt(e.target.value) || 10})}
                      min="1"
                      max="60"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingWebsite.enabled}
                        onChange={(e) => setEditingWebsite({...editingWebsite, enabled: e.target.checked})}
                      />
                      {t('websiteMonitor.enabled')}
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingWebsite.notifications}
                        onChange={(e) => setEditingWebsite({...editingWebsite, notifications: e.target.checked})}
                      />
                      {t('websiteMonitor.notifications')}
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveWebsite}>{t('common.save')}</Button>
                    <Button variant="ghost" onClick={() => setEditingWebsite(null)}>{t('common.cancel')}</Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <HistoryList history={history || []} isLoading={historyLoading} />
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <NotificationList
              notifications={notifications || []}
              isLoading={notificationsLoading}
              onAcknowledge={handleAcknowledgeNotification}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
