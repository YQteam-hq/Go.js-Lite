import { memo, useCallback } from 'react'
import { MoreVertical } from 'lucide-react'
import { useFormat } from '@/lib/format'
import { useI18n } from '@/hooks/useI18n'
import { useLongPress } from '@/hooks/useLongPress'
import type { FileEntry } from '@shared/types'
import { getFileIcon } from '../utils'

export type FileItemHandlers = {
  onToggleSelect: (path: string) => void
  onContextMenu: (e: React.MouseEvent, file: FileEntry) => void
  onMoreActions: (e: React.MouseEvent, file: FileEntry) => void
  onOpen: (file: FileEntry) => void
}

export type FileItemProps = FileItemHandlers & {
  file: FileEntry
  selected: boolean
  exiting: boolean
}

const FileRow = memo(function FileRow({
  file,
  selected,
  exiting,
  onToggleSelect,
  onContextMenu,
  onMoreActions,
  onOpen,
}: FileItemProps) {
  const { t } = useI18n()
  const { formatDate, formatBytes } = useFormat()
  const handleLongPress = useCallback(
    () => onToggleSelect(file.path),
    [onToggleSelect, file.path],
  )
  const { handlers, active } = useLongPress<HTMLDivElement>(handleLongPress, {
    delay: 400,
  })

  const Icon = getFileIcon(file)
  const animationClass = exiting ? 'animate-list-exit' : ''

  return (
    <div
      {...handlers}
      onContextMenu={(e) => onContextMenu(e, file)}
      className={`
        h-full w-full flex items-center gap-3 px-3 md:px-4
        transition-colors cursor-pointer
        ${selected ? 'bg-accent/10' : 'hover:bg-fg/5'}
        ${active ? 'bg-bg-sunken' : ''}
        ${animationClass}
      `}
    >
      {selected && (
        <div className="w-5 h-5 rounded border-2 border-accent bg-accent flex items-center justify-center shrink-0">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-accent-fg">
            <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0z" />
          </svg>
        </div>
      )}

      <div
        className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${
          file.type === 'dir' ? 'bg-accent/10 text-accent' : 'bg-bg-sunken text-fg-muted'
        }`}
      >
        <Icon size={18} />
      </div>

      <div className="flex-1 min-w-0" onClick={!selected ? () => onOpen(file) : undefined}>
        <span
          className="text-sm text-fg truncate block hover:text-accent transition-colors"
        >
          {file.name}
        </span>
        <div className="flex items-center gap-3 text-xs text-fg-subtle mt-0.5 md:hidden">
          <span>{formatBytes(file.size)}</span>
          <span>{formatDate(file.mtime)}</span>
        </div>
      </div>

      <div className="hidden md:block w-24 text-right text-sm text-fg-muted">
        {file.type === 'dir' ? '—' : formatBytes(file.size)}
      </div>

      <div className="hidden lg:block w-36 text-right text-xs text-fg-subtle">
        {formatDate(file.mtime)}
      </div>

      <div className="hidden md:block w-10 text-right text-xs text-fg-subtle font-mono">
        {file.perms}
      </div>

      <div className="flex justify-end md:w-10 md:block">
        <button
          className="min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center p-1.5 rounded-md text-fg-subtle hover:text-fg hover:bg-bg-sunken transition-colors"
          onClick={(e) => onMoreActions(e, file)}
          aria-label={t('files.moreActions')}
        >
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  )
})

export { FileRow }
