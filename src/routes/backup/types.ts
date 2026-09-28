export const DEFAULT_EXCLUDE_DIRS = 'cache,node_modules,.git,.gojs'

export type BackupTab = 'archives' | 'destinations' | 'schedules'
export type DestinationModalType = 's3' | 'ftp' | 'sftp'

export type ScheduleModalTab = 'general' | 'schedule' | 'source' | 'destinations' | 'retention'
export const SCHEDULE_MODAL_TABS: ScheduleModalTab[] = ['general', 'schedule', 'source', 'destinations', 'retention']

export const CRON_PRESETS: Array<{ key: string; label_key: string; expr: string }> = [
  { key: 'daily', label_key: 'cronPresetDaily', expr: '0 2 * * *' },
  { key: 'weekly', label_key: 'cronPresetWeekly', expr: '0 0 * * 0' },
  { key: 'monthly', label_key: 'cronPresetMonthly', expr: '0 0 1 * *' },
  { key: 'every6h', label_key: 'cronPresetEvery6h', expr: '0 */6 * * *' },
  { key: 'custom', label_key: 'cronPresetCustom', expr: '' },
]
