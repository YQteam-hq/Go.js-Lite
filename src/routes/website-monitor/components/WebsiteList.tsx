import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Plus, Trash2 } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import type { WebsiteMonitorTarget as WebsiteTarget } from '@/api/websiteMonitor'

interface StatusInfo {
  status: string
  response_time: number
  trend?: string
}

interface WebsiteListProps {
  websites: WebsiteTarget[]
  status: Record<string, StatusInfo | null>
  onEdit: (website: WebsiteTarget) => void
  onDelete: (id: string) => void
  onAdd: () => void
}

export function WebsiteList({ websites, status, onEdit, onDelete, onAdd }: WebsiteListProps) {
  const { t } = useI18n()

  const getStatusIcon = (statusValue: string | undefined) => {
    switch (statusValue) {
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

  return (
    <div className="space-y-4">
      {websites.map((website) => {
        const websiteStatus = status[website.url]
        return (
          <div key={website.id} className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(websiteStatus?.status)}
                <div>
                  <h3 className="font-medium">{website.name}</h3>
                  <p className="text-sm text-muted-foreground">{website.url}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {websiteStatus && (
                  <div className="text-sm text-muted-foreground">
                    {t('websiteMonitor.responseTime')}: {websiteStatus.response_time}ms
                  </div>
                )}
                <Badge variant={website.enabled ? 'success' : 'muted'}>
                  {website.enabled ? t('websiteMonitor.enabled') : t('websiteMonitor.disabled')}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button variant="ghost" size="sm" onClick={() => onEdit(website)}>
                {t('websiteMonitor.edit')}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(website.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )
      })}
      {websites.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {t('websiteMonitor.noWebsites')}
        </div>
      )}
      <Button className="mt-4" onClick={onAdd}>
        <Plus className="w-4 h-4 mr-2" />
        {t('websiteMonitor.addWebsite')}
      </Button>
    </div>
  )
}
