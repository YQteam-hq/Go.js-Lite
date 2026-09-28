import { FolderOpen, FileText, Image, FileCode, File } from 'lucide-react'
import { getFileExtension, isImageFile, isTextFile } from '@/lib/format'
import type { FileEntry } from '@shared/types'

export const getFileKey = (file: FileEntry) => file.path

export function getFileIcon(file: FileEntry) {
  if (file.type === 'dir') return FolderOpen
  if (isImageFile(file.name)) return Image
  const ext = getFileExtension(file.name)
  if (['php', 'js', 'ts', 'tsx', 'css', 'html', 'json', 'sql', 'py'].includes(ext)) return FileCode
  if (isTextFile(file.name)) return FileText
  return File
}

export function permsToSymbolic(perms: string, isDir: boolean): string {
  let mode = perms
  if (mode.length === 4) mode = mode.slice(1)
  if (mode.length !== 3 || !/^[0-7]{3}$/.test(mode)) return perms
  const chars = 'rwxrwxrwx'
  let result = isDir ? 'd' : '-'
  for (let i = 0; i < 9; i++) {
    const octalDigit = parseInt(mode[Math.floor(i / 3)], 10)
    const bit = octalDigit & (1 << (2 - (i % 3)))
    result += bit ? chars[i] : '-'
  }
  return result
}
