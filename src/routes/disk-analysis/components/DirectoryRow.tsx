import { Folder } from 'lucide-react'
import type { DiskDirectory } from '@shared/types'

export function DirectoryRow({
  dir,
  maxDirSize,
  formatBytes,
  t,
}: {
  dir: DiskDirectory
  maxDirSize: number
  formatBytes: (n: number) => string
  t: (key: string) => string
}) {
  const barWidth = maxDirSize > 0 ? (dir.size / maxDirSize) * 100 : 0
  return (
    <li className="px-4 py-3">
      <div className="flex items-center gap-2 mb-1.5">
        <Folder size={14} className="text-fg-muted shrink-0" />
        <span className="text-sm font-medium text-fg truncate flex-1 min-w-0" title={dir.path}>
          {dir.name}
        </span>
        <span className="text-sm text-fg font-mono shrink-0">{formatBytes(dir.size)}</span>
      </div>
      <div className="h-1.5 bg-bg-sunken rounded-full overflow-hidden mb-1">
        <div
          className="h-full bg-accent/70 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(barWidth, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-fg-subtle">
        <span>
          {dir.fileCount} {t('diskAnalysis.fileCount')}
        </span>
        <span>{dir.percent.toFixed(1)}%</span>
      </div>
    </li>
  )
}
