export function formatUptime(seconds: number, t: (key: string) => string): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  return `${days}${t('system.days')} ${hours}${t('system.hours')} ${mins}${t('system.minutes')}`
}
