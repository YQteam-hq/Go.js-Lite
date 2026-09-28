import type { FtpAccount } from '@shared/types'

export type { FtpAccount }

export function accountStatus(acc: FtpAccount): { variant: 'success' | 'warning' | 'danger' | 'muted'; key: string } {
  const now = Math.floor(Date.now() / 1000)
  if (!acc.enabled) return { variant: 'muted', key: 'ftp.statusDisabled' }
  if (acc.expires_at_ts && acc.expires_at_ts < now) return { variant: 'danger', key: 'ftp.statusExpired' }
  return { variant: 'success', key: 'ftp.statusEnabled' }
}

export function homeDirDisplay(path: string): string {
  return path || '/'
}

export function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  if (!pw) return { score: 0, label: '' }
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const labels = ['ftp.pwWeak', 'ftp.pwFair', 'ftp.pwGood', 'ftp.pwStrong', 'ftp.pwStrong']
  return { score: score as 0 | 1 | 2 | 3 | 4, label: labels[score] }
}
