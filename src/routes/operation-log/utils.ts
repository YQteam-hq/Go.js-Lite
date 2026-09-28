import type { OperationLogAlertRule } from '@shared/types'

export const TYPE_OPTIONS = [
  'file_delete',
  'file_rename',
  'file_upload',
  'file_save',
  'file_mkdir',
  'file_chmod',
  'file_compress',
  'file_extract',
  'db_sql_exec',
  'db_import',
  'settings_update',
  'password_change',
  'token_regenerate',
  'operation_log_clear',
]

export const emptyRule = (): Omit<OperationLogAlertRule, 'id'> => ({
  name: '',
  enabled: true,
  when: {},
  then: { channel_ids: [], severity: 'warning' },
})

export function formatExportFilename(format: 'csv' | 'jsonl' | 'json'): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const stamp =
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    '_' +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  return `operation_log_${stamp}.${format}`
}

export function dateToTs(value: string, endOfDay: boolean): number | undefined {
  if (!value) return undefined
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) return undefined
  const dt = new Date(y, m - 1, d, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0)
  return dt.getTime()
}

export function getActionColor(action: string): {
  variant: 'danger' | 'accent' | 'success' | 'muted'
  className: string
} {
  const lower = action.toLowerCase()
  if (lower.indexOf('delete') !== -1 || lower.indexOf('drop') !== -1) {
    return { variant: 'danger', className: 'bg-danger/10 text-danger border-danger/20' }
  }
  if (
    lower.indexOf('upload') !== -1 ||
    lower.indexOf('create') !== -1 ||
    lower.indexOf('mkdir') !== -1
  ) {
    return { variant: 'accent', className: 'bg-accent/10 text-accent border-accent/20' }
  }
  if (lower.indexOf('import') !== -1 || lower.indexOf('export') !== -1) {
    return { variant: 'muted', className: 'bg-warning/10 text-warning border-warning/20' }
  }
  return { variant: 'success', className: 'bg-success/10 text-success border-success/20' }
}
