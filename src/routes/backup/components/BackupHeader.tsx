import { HardDriveDownload } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'

export function BackupHeader() {
  const { t } = useI18n()
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold text-fg flex items-center gap-2">
          <HardDriveDownload size={22} className="text-accent" />
          {t('backup.title')}
        </h1>
        <p className="text-sm text-fg-muted mt-0.5">{t('backup.subtitle')}</p>
      </div>
    </div>
  )
}
