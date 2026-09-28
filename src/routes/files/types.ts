import type { FileEntry } from '@shared/types'

export type SortField = 'name' | 'size' | 'mtime'
export type SortOrder = 'asc' | 'desc'
export type ViewMode = 'list' | 'grid'
export type NewItemType = 'file' | 'folder' | null

export interface ContextMenuState {
  x: number
  y: number
  file: FileEntry
}

export interface PathPickerState {
  open: boolean
  mode: 'copy' | 'move'
  file: FileEntry | null
  target: string
  error: string
}

export interface ChmodModalState {
  open: boolean
  file: FileEntry | null
  mode: string
  error: string
}

export interface DeleteConfirmState {
  open: boolean
  files: FileEntry[]
}
