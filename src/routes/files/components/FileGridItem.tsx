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

const FileGridItem = memo(function FileGridItem({
  file,
  selected,
  exiting,
  onToggleSelect,
  onContextMenu,
  onMoreActions,
  onOpen,
}: FileItemProps) {
  const { t } = useI18n()
  const { formatBytes } = useFormat()
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
        relative h-full w-full flex flex-col items-center justify-start gap-2 p-3 rounded-lg
        transition-all duration-150 cursor-pointer
        ${selected ? 'bg-accent/10 ring-2 ring-accent/30' : 'hover:bg-fg/5'}
        ${active ? 'bg-bg-sunken' : ''}
        ${animationClass}
      `}
      onClick={!selected ? () => onOpen(file) : undefined}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded border-2 border-accent bg-accent flex items-center justify-center z-10">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-accent-fg">
            <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0z" />
          </svg>
        </div>
      )}

      <div
        className={`
          w-14 h-14 rounded-lg flex items-center justify-center shrink-0
          ${file.type === 'dir' ? 'bg-accent/10 text-accent' : 'bg-bg-sunken text-fg-muted'}
        `}
      >
        <Icon size={28} />
      </div>

      <div className="w-full text-center">
        <span className="text-xs text-fg truncate block leading-tight">
          {file.name}
        </span>
        <span className="text-[10px] text-fg-subtle block mt-0.5">
          {file.type === 'dir' ? t('files.folder') : formatBytes(file.size)}
        </span>
      </div>

      <button
        className="absolute bottom-1 right-1 p-1 rounded-md text-fg-subtle hover:text-fg hover:bg-bg-sunken transition-colors opacity-0 hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation()
          onMoreActions(e, file)
        }}
        aria-label={t('files.moreActions')}
      >
        <MoreVertical size={14} />
      </button>
    </div>
  )
})

export { FileGridItem }
