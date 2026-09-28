import { useState } from 'react'
import { Download, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useI18n } from '@/hooks/useI18n'
import { useIsMobile } from '@/hooks/useMediaQuery'

interface ExportMenuProps {
  filterActive: boolean
  exporting: boolean
  onExport: (format: 'csv' | 'jsonl' | 'json', scope: 'current_filter' | 'all') => void
  onExportingChange: (v: boolean) => void
}

export function ExportMenu({ filterActive, exporting, onExport, onExportingChange }: ExportMenuProps) {
  const [exportOpen, setExportOpen] = useState(false)
  const { t } = useI18n()
  const isMobile = useIsMobile()

  const handleExport = (format: 'csv' | 'jsonl' | 'json', scope: 'current_filter' | 'all') => {
    setExportOpen(false)
    onExportingChange(true)
    onExport(format, scope)
  }

  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setExportOpen((v) => !v)}
        disabled={exporting}
        className="relative"
      >
        <Download size={16} />
        {!isMobile && t('oplog.exportMenu')}
        <ChevronDown size={14} />
      </Button>
      {exportOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setExportOpen(false)} />
          <div className="absolute right-0 mt-1 z-50 min-w-[200px] rounded-xl border border-border bg-bg-elevated shadow-lg p-1">
            <button
              onClick={() => handleExport('csv', 'current_filter')}
              disabled={!filterActive}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                filterActive
                  ? 'hover:bg-fg/5 text-fg'
                  : 'text-fg-muted opacity-60 cursor-not-allowed'
              }`}
            >
              {t('oplog.exportCsvCurrent')}
            </button>
            <button
              onClick={() => handleExport('csv', 'all')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-fg/5 text-fg transition-colors"
            >
              {t('oplog.exportCsvAll')}
            </button>
            <button
              onClick={() => handleExport('jsonl', 'current_filter')}
              disabled={!filterActive}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                filterActive
                  ? 'hover:bg-fg/5 text-fg'
                  : 'text-fg-muted opacity-60 cursor-not-allowed'
              }`}
            >
              {t('oplog.exportJsonlCurrent')}
            </button>
            <button
              onClick={() => handleExport('jsonl', 'all')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-fg/5 text-fg transition-colors"
            >
              {t('oplog.exportJsonlAll')}
            </button>
            <button
              onClick={() => handleExport('json', 'current_filter')}
              disabled={!filterActive}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                filterActive
                  ? 'hover:bg-fg/5 text-fg'
                  : 'text-fg-muted opacity-60 cursor-not-allowed'
              }`}
            >
              {t('oplog.exportJsonCurrent')}
            </button>
            <button
              onClick={() => handleExport('json', 'all')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-fg/5 text-fg transition-colors"
            >
              {t('oplog.exportJsonAll')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
