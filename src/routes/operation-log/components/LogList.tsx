import type { OperationLogEntry } from '@shared/types'
import { Badge } from '@/components/ui/Badge'
import { getActionColor } from '../utils'
import { useI18n } from '@/hooks/useI18n'
import { useIsMobile } from '@/hooks/useMediaQuery'

export function LogEntry({ entry, idx }: { entry: OperationLogEntry; idx: number }) {
  const { t } = useI18n()
  const isMobile = useIsMobile()
  const color = getActionColor(entry.action)

  return (
    <li key={idx} className="p-3 hover:bg-fg/5 transition-colors">
      <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-start sm:items-center">
        <div className="flex items-start gap-3 min-w-0">
          <Badge
            variant={color.variant}
            className={`shrink-0 mt-0.5 border ${color.className} font-mono text-[10px]`}
          >
            {entry.action}
          </Badge>
          <div className="min-w-0 flex-1">
            <code className="text-xs text-fg break-all font-mono leading-relaxed block">
              {entry.target || '—'}
            </code>
            {entry.detail ? (
              <p className="text-[11px] text-fg-subtle mt-1 break-all">{entry.detail}</p>
            ) : null}
            {!entry.result && (
              <p className="text-[11px] text-danger mt-1">{t('operationLog.failed')}</p>
            )}
          </div>
        </div>
        <time className="font-mono text-[11px] text-fg-muted shrink-0 hidden sm:block whitespace-nowrap">
          {entry.time}
        </time>
        <span className="text-[11px] text-fg-muted shrink-0 hidden sm:block whitespace-nowrap">
          {entry.ip}
        </span>
      </div>
      {isMobile && (
        <div className="flex items-center gap-3 mt-2 text-[11px] text-fg-muted pl-9">
          <time className="font-mono">{entry.time}</time>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-fg-subtle" />
            {entry.ip}
          </span>
        </div>
      )}
    </li>
  )
}
