import { FileArchive, Cloud, Clock } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import type { BackupTab } from '../types'

interface BackupTabsProps {
  activeTab: BackupTab
  onTabChange: (tab: BackupTab) => void
}

export function BackupTabs({ activeTab, onTabChange }: BackupTabsProps) {
  const { t } = useI18n()
  const tabs: Array<{ key: BackupTab; label: string; icon: React.ReactNode }> = [
    { key: 'archives', label: t('remoteBackup.tabArchives'), icon: <FileArchive size={14} /> },
    { key: 'destinations', label: t('remoteBackup.tabDestinations'), icon: <Cloud size={14} /> },
    { key: 'schedules', label: t('remoteBackup.tabSchedules'), icon: <Clock size={14} /> },
  ]
  return (
    <div className="border-b border-border px-4 md:px-6">
      <div className="flex gap-0.5 -mb-px">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`
              px-4 py-3 text-xs font-medium flex items-center gap-2 border-b-2 transition-colors
              ${activeTab === key
                ? 'border-accent text-accent'
                : 'border-transparent text-fg-muted hover:text-fg hover:bg-fg/5'}
            `}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
