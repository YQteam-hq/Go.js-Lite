import { FileText, Clock } from 'lucide-react'
import type { LargeFile } from '@shared/types'

export function LargeFileRow({
  file,
  formatBytes,
  formatDate,
}: {
  file: LargeFile
  formatBytes: (n: number) => string
  formatDate: (ts: number) => string
}) {
  const modifiedTs = file.modified ? new Date(file.modified).getTime() / 1000 : 0
  return (
    <li className="px-4 py-3">
      <div className="flex items-center gap-2 mb-1">
        <FileText size={14} className="text-fg-muted shrink-0" />
        <span className="text-sm font-medium text-fg truncate flex-1 min-w-0" title={file.name}>
          {file.name}
        </span>
        <span className="text-sm text-fg font-mono shrink-0">{formatBytes(file.size)}</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-fg-subtle pl-5">
        <span className="truncate min-w-0" title={file.path}>
          {file.path}
        </span>
        {modifiedTs > 0 && (
          <span className="flex items-center gap-1 shrink-0">
            <Clock size={11} />
            {formatDate(modifiedTs)}
          </span>
        )}
      </div>
    </li>
  )
}
