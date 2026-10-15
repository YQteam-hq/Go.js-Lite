import { useEffect, useState } from 'react'
import {
  FolderOpen,
  FileText,
  Edit3,
  Copy,
  MoveRight,
  Download,
  Trash2,
  Shield,
  Package,
  Archive,
} from 'lucide-react'
import type { FileEntry } from '@shared/types'
import { useMenuNavigation } from '@/hooks/useMenuNavigation'

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  file: FileEntry
  onOpen: () => void
  onRename: () => void
  onCopy: () => void
  onMove: () => void
  onDownload: () => void
  onDelete: () => void
  onPermissions: () => void
  onZip?: () => void
  onUnzip?: () => void
  onTargz?: () => void
  onUntargz?: () => void
  canZip?: boolean
  canTargz?: boolean
  t: (key: string) => string
}

export function ContextMenu({
  x,
  y,
  onClose,
  file,
  onOpen,
  onRename,
  onCopy,
  onMove,
  onDownload,
  onDelete,
  onPermissions,
  onZip,
  onUnzip,
  onTargz,
  onUntargz,
  canZip,
  canTargz,
  t,
}: ContextMenuProps) {
  const { menuRef, handleKeyDown } = useMenuNavigation<HTMLDivElement>({ open: true, onClose })
  // Captured during the first render, before the menu moves the focus, so the
  // focus can go back to the element the user was on when the menu opened.
  const [restoreTarget] = useState<HTMLElement | null>(
    () => document.activeElement as HTMLElement | null,
  )

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuRef, onClose])

  useEffect(() => {
    return () => {
      restoreTarget?.focus?.({ preventScroll: true })
    }
  }, [restoreTarget])

  const adjustedX = Math.min(x, window.innerWidth - 220)
  const adjustedY = Math.min(y, window.innerHeight - 400)

  const lowerName = file.name.toLowerCase()
  const isZip = lowerName.endsWith('.zip')
  const isTargz = lowerName.endsWith('.tar.gz') || lowerName.endsWith('.tgz')

  const showExtractZip = canZip && isZip && !!onUnzip
  const showExtractTargz = canTargz && isTargz && !!onUntargz
  const showCompressZip = canZip && !!onZip
  const showCompressTargz = canTargz && !!onTargz
  const showArchiveSection =
    showExtractZip || showExtractTargz || showCompressZip || showCompressTargz

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[200px] bg-bg-elevated border border-border rounded-lg shadow-xl py-1 animate-scale-in origin-top-left"
      style={{ left: adjustedX, top: adjustedY }}
      role="menu"
      aria-orientation="vertical"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-fg hover:bg-bg-sunken transition-colors text-left"
        onClick={() => {
          onOpen()
          onClose()
        }}
        role="menuitem"
      >
        {file.type === 'dir' ? <FolderOpen size={16} /> : <FileText size={16} />}
        <span>{t('files.open')}</span>
      </button>

      <div className="my-1 h-px bg-border" />

      <button
        type="button"
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-fg hover:bg-bg-sunken transition-colors text-left"
        onClick={() => {
          onRename()
          onClose()
        }}
        role="menuitem"
      >
        <Edit3 size={16} />
        <span>{t('files.rename')}</span>
      </button>

      <button
        type="button"
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-fg hover:bg-bg-sunken transition-colors text-left"
        onClick={() => {
          onCopy()
          onClose()
        }}
        role="menuitem"
      >
        <Copy size={16} />
        <span>{t('files.copy')}</span>
      </button>

      <button
        type="button"
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-fg hover:bg-bg-sunken transition-colors text-left"
        onClick={() => {
          onMove()
          onClose()
        }}
        role="menuitem"
      >
        <MoveRight size={16} />
        <span>{t('files.move')}</span>
      </button>

      {showArchiveSection && (
        <>
          <div className="my-1 h-px bg-border" />
          {showExtractZip && (
            <button
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-fg hover:bg-bg-sunken transition-colors text-left"
              onClick={() => {
                onUnzip!()
                onClose()
              }}
              role="menuitem"
            >
              <Archive size={16} />
              <span>{t('files.extractZip')}</span>
            </button>
          )}
          {showExtractTargz && (
            <button
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-fg hover:bg-bg-sunken transition-colors text-left"
              onClick={() => {
                onUntargz!()
                onClose()
              }}
              role="menuitem"
            >
              <Archive size={16} />
              <span>{t('files.extractTargz')}</span>
            </button>
          )}
          {showCompressZip && (
            <button
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-fg hover:bg-bg-sunken transition-colors text-left"
              onClick={() => {
                onZip!()
                onClose()
              }}
              role="menuitem"
            >
              <Package size={16} />
              <span>{t('files.compressToZip')}</span>
            </button>
          )}
          {showCompressTargz && (
            <button
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-fg hover:bg-bg-sunken transition-colors text-left"
              onClick={() => {
                onTargz!()
                onClose()
              }}
              role="menuitem"
            >
              <Package size={16} />
              <span>{t('files.compressToTargz')}</span>
            </button>
          )}
        </>
      )}

      <div className="my-1 h-px bg-border" />

      <button
        type="button"
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-fg hover:bg-bg-sunken transition-colors text-left"
        onClick={() => {
          onDownload()
          onClose()
        }}
        role="menuitem"
      >
        <Download size={16} />
        <span>{t('files.download')}</span>
      </button>

      <button
        type="button"
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-fg hover:bg-bg-sunken transition-colors text-left"
        onClick={() => {
          onPermissions()
          onClose()
        }}
        role="menuitem"
      >
        <Shield size={16} />
        <span>{t('files.permissions')}</span>
      </button>

      <div className="my-1 h-px bg-border" />

      <button
        type="button"
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors text-left"
        onClick={() => {
          onDelete()
          onClose()
        }}
        role="menuitem"
      >
        <Trash2 size={16} />
        <span>{t('files.delete')}</span>
      </button>
    </div>
  )
}
