import { CheckCheck, Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { JsonTree } from '@/components/notifications/helpers'
import type { Notification, NotificationCategory, NotificationSeverity } from '@shared/types'
import { useNavigate } from 'react-router-dom'

const CATEGORY_META: Record<NotificationCategory, { icon: string; origin: string | null }> = {
  login_anomaly: { icon: 'ShieldCheck', origin: null },
  backup: { icon: 'Database', origin: '/backup' },
  ssl: { icon: 'Lock', origin: '/ssl' },
  security: { icon: 'AlertTriangle', origin: null },
  system: { icon: 'Activity', origin: null },
  monitor: { icon: 'Activity', origin: '/dashboard' },
}

interface NotificationDetailProps {
  item: Notification | null
  sevBadge: (s: NotificationSeverity) => 'accent' | 'warning' | 'danger' | 'success'
  sevLabel: (s: NotificationSeverity) => string
  catLabel: (c: NotificationCategory | 'all') => string
  markRead: (id: string) => void
  deleteNotif: (id: string) => void
  isMarkReadPending: boolean
  isDeletePending: boolean
}

export function NotificationDetail({
  item,
  sevBadge,
  sevLabel,
  catLabel,
  markRead,
  deleteNotif,
  isMarkReadPending,
  isDeletePending
}: NotificationDetailProps) {
  const nav = useNavigate()

  if (!item) {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyState
          title="选择一条通知查看详情"
          description="点击左侧列表项即可查看完整内容与操作。"
        />
      </div>
    )
  }

  const origin = CATEGORY_META[item.category]?.origin

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="muted">{catLabel(item.category)}</Badge>
          <Badge variant={sevBadge(item.severity)}>{sevLabel(item.severity)}</Badge>
          <Badge variant={item.read_at ? 'muted' : 'accent'}>
            {item.read_at ? '已读' : '未读'}
          </Badge>
        </div>
        <h2 className="text-lg font-semibold text-fg leading-snug">
          {item.title_key}
        </h2>
        <div className="text-xs text-fg-subtle">{new Date(item.created_at * 1000).toLocaleString()}</div>
      </div>
      {item.body_key && (
        <div className="rounded-xl border border-border bg-bg-sunken/30 p-4 text-sm text-fg leading-relaxed whitespace-pre-wrap">
          {item.body_key}
        </div>
      )}
      <div className="space-y-2">
        <div className="text-xs uppercase tracking-wide text-fg-subtle font-semibold">
          原始数据
        </div>
        <JsonTree data={item.payload ?? { id: item.id, body_params: item.body_params }} />
      </div>
      <div className="flex flex-wrap gap-2 pt-2">
        {!item.read_at && (
          <Button variant="secondary" size="sm" onClick={() => markRead(item.id)} loading={isMarkReadPending}>
            <CheckCheck size={16} />标记已读
          </Button>
        )}
        {origin && (
          <Button variant="secondary" size="sm" onClick={() => nav(origin)}>
            <ExternalLink size={16} />跳转到相关页面
          </Button>
        )}
        <Button variant="danger" size="sm" onClick={() => deleteNotif(item.id)} loading={isDeletePending}>
          <Trash2 size={16} />删除
        </Button>
      </div>
    </div>
  )
}
