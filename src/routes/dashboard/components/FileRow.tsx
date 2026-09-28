import { Link } from 'react-router-dom'
import { FolderOpen, Image, FileCode, FileText, File } from 'lucide-react'
import { useFormat, getFileExtension, isImageFile, isTextFile } from '@/lib/format'
import type { FileEntry } from '@shared/types'

function isCodeFile(name: string) {
  const ext = getFileExtension(name)
  return ['php', 'js', 'ts', 'tsx', 'css', 'html', 'json', 'sql', 'py', 'sh', 'bash', 'yml', 'yaml', 'xml'].includes(ext)
}

function renderFileIcon(file: FileEntry, size: number) {
  let Icon = File
  if (file.type === 'dir') Icon = FolderOpen
  else if (isImageFile(file.name)) Icon = Image
  else if (isCodeFile(file.name)) Icon = FileCode
  else if (isTextFile(file.name)) Icon = FileText
  return <Icon size={size} />
}

function FileRow({ file, index }: { file: FileEntry; index: number }) {
  const { formatBytes, formatRelativeTime } = useFormat()

  return (
    <li
      className="flex items-center gap-3 px-5 py-3 hover:bg-fg/[0.03] transition-colors group"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
        file.type === 'dir' ? 'bg-accent/10 text-accent' :
        isImageFile(file.name) ? 'bg-purple-500/10 text-purple-500' :
        isCodeFile(file.name) ? 'bg-info/10 text-info' :
        'bg-bg-sunken text-fg-muted'
      }`}>
        {renderFileIcon(file, 16)}
      </div>
      <div className="flex-1 min-w-0">
        <Link
          to={`/files${file.path}`}
          className="text-sm text-fg truncate block hover:text-accent transition-colors font-medium"
        >
          {file.name}
        </Link>
        <div className="text-xs text-fg-subtle mt-0.5 flex items-center gap-2">
          <span className="truncate">{file.path}</span>
        </div>
      </div>
      <div className="text-right shrink-0 hidden sm:block">
        <div className="text-sm text-fg-muted">{formatBytes(file.size)}</div>
        <div className="text-xs text-fg-subtle mt-0.5">{formatRelativeTime(file.mtime)}</div>
      </div>
    </li>
  )
}

export { FileRow, renderFileIcon }
