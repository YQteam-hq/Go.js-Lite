import { LogIn, Pencil, KeyRound, Trash2, Users, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { FtpAccount } from '@shared/types'
import { accountStatus, homeDirDisplay } from '../utils'

interface MobileCardProps {
  acc: FtpAccount
  onEdit: () => void
  onReset: () => void
  onTest: () => void
  onDelete: () => void
  t: (k: string) => string
  formatRelativeTime: (ts: number) => string
}

export function MobileAccountCard({ acc, onEdit, onReset, onTest, onDelete, t, formatRelativeTime }: MobileCardProps) {
  const st = accountStatus(acc)
  return (
    <li className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <Users size={16} />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-fg truncate">{acc.username}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant={st.variant} className="text-[10px]">
                {st.variant === 'success' ? 'Enabled' : st.variant === 'danger' ? 'Expired' : st.variant === 'warning' ? 'Warning' : 'Disabled'}
              </Badge>
              {acc.last_login_at && (
                <span className="text-[10px] text-fg-subtle flex items-center gap-0.5">
                  <Clock size={10} />
                  {formatRelativeTime(acc.last_login_at)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-fg-subtle mb-0.5">{t('ftp.homeDir')}</div>
          <div className="font-mono text-fg-muted truncate" title={acc.home_dir}>
            {homeDirDisplay(acc.home_dir)}
          </div>
        </div>
        <div>
          <div className="text-fg-subtle mb-0.5">UID/GID</div>
          <div className="text-fg-muted">{acc.uid ?? '—'} / {acc.gid ?? '—'}</div>
        </div>
        <div>
          <div className="text-fg-subtle mb-0.5">{t('ftp.quotaSizeMb')}</div>
          <div className="text-fg-muted">{acc.quota_size_mb ? `${acc.quota_size_mb} MB` : 'Unlimited'}</div>
        </div>
        <div>
          <div className="text-fg-subtle mb-0.5">带宽</div>
          <div className="text-fg-muted">
            {(acc.upload_bw_kbps || acc.download_bw_kbps)
              ? `↑${acc.upload_bw_kbps ?? '∞'} / ↓${acc.download_bw_kbps ?? '∞'}`
              : 'Unlimited'}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-border/50">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={onTest}>
            <LogIn size={13} />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onEdit}>
            <Pencil size={13} />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onReset}>
            <KeyRound size={13} />
          </Button>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onDelete} className="text-danger hover:text-danger">
          <Trash2 size={13} />
        </Button>
      </div>
    </li>
  )
}
