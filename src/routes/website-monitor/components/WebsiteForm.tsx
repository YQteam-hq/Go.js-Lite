import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useI18n } from '@/hooks/useI18n'
import type { WebsiteMonitorTarget as WebsiteTarget } from '@/api/websiteMonitor'

interface WebsiteFormProps {
  website: WebsiteTarget | null
  onSave: () => void
  onCancel: () => void
}

export function WebsiteForm({ website, onSave, onCancel }: WebsiteFormProps) {
  const { t } = useI18n()

  if (!website) return null

  const handleChange = (field: keyof WebsiteTarget, value: string | number | boolean) => {
    Object.assign(website, { [field]: value })
  }

  return (
    <CardHeader>
      <CardTitle>
        {website.id ? t('websiteMonitor.editWebsite') : t('websiteMonitor.addWebsite')}
      </CardTitle>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">{t('websiteMonitor.websiteName')}</label>
            <Input
              value={website.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder={t('websiteMonitor.websiteNamePlaceholder')}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t('websiteMonitor.websiteUrl')}</label>
            <Input
              value={website.url}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t('websiteMonitor.timeout')}</label>
            <Input
              type="number"
              value={website.timeout}
              onChange={(e) => handleChange('timeout', parseInt(e.target.value) || 10)}
              min="1"
              max="60"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={website.enabled}
                onChange={(e) => handleChange('enabled', e.target.checked)}
              />
              {t('websiteMonitor.enabled')}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={website.notifications}
                onChange={(e) => handleChange('notifications', e.target.checked)}
              />
              {t('websiteMonitor.notifications')}
            </label>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={onSave}>{t('common.save')}</Button>
          <Button variant="ghost" onClick={onCancel}>{t('common.cancel')}</Button>
        </div>
      </CardContent>
    </CardHeader>
  )
}
