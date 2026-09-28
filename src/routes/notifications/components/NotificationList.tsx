import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Notification, NotificationCategory, NotificationSeverity } from '@shared/types'

interface NotificationListProps {
  items: Notification[]
  selectedId: string | null
  isLoading: boolean
  hasMore: boolean
  offset: number
  total: number
  unreadCount: number
  relTime: (ts: number) => string
  sevBadge: (s: NotificationSeverity) => 'accent' | 'warning' | 'danger' | 'success'
  sevLabel: (s: NotificationSeverity) => string
  catLabel: (c: NotificationCategory | 'all') => string
  onSelect: (id: string) => void
  onLoadMore: () => void
  onPrevPage: () => void
  onRefetch: () => void
  isFetching: boolean
}

const LIMIT = 50

export function NotificationList({
  items,
  selectedId,
  isLoading,
  hasMore,
  offset,
  total,
  relTime,
  sevBadge,
  sevLabel,
  catLabel,
  onSelect,
  onPrevPage,
  onRefetch,
  isFetching
}: NotificationListProps) {
  const listHeader = (
    <div className="flex items-center justify-between gap-2 mb-3">
      <div className="text-sm text-fg-muted">
        {isLoading
          ? '加载中...'
          : `显示 ${Math.min(offset + items.length, total)} / ${total}`}
      </div>
      <Button variant="ghost" size="icon-sm" onClick={onRefetch} disabled={isFetching}>
        <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
      </Button>
    </div>
  )

  const listPanel = (
    <div className="flex-1 rounded-2xl border border-border bg-bg-elevated overflow-hidden flex flex-col min-h-[50vh]">
      {items.length === 0 && !isLoading ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <EmptyState title="暂无通知" description="当前没有新通知" />
        </div>
      ) : (
        <div className="divide-y divide-border/60 overflow-auto flex-1">
          {items.map((it) => {
            const active = it.id === selectedId
            const unread = !it.read_at
            return (
              <button
                type="button"
                key={it.id}
                onClick={() => onSelect(it.id)}
                className={`w-full text-left p-3 transition-all group relative ${
                  active ? 'bg-accent/5' : 'hover:bg-bg-sunken/60'
                } ${unread ? 'bg-fg/[0.015]' : ''}`}
              >
                {unread && (
                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent shrink-0" />
                )}
                <div className={`flex items-start gap-2 ${unread ? 'pl-3' : 'pl-1'}`}>
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    <Badge variant="muted" className="text-[10px] px-1.5">{catLabel(it.category)}</Badge>
                    <Badge variant={sevBadge(it.severity)} className="text-[10px] px-1.5">{sevLabel(it.severity)}</Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm truncate ${unread ? 'font-semibold text-fg' : 'text-fg'}`}>
                      {it.title_key}
                    </div>
                    <div className="text-xs text-fg-subtle mt-0.5">{relTime(it.created_at)}</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
      {(hasMore || offset > 0) && (
        <div className="p-3 border-t border-border/60 flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" disabled={offset === 0} onClick={onPrevPage}>
            上一页
          </Button>
          <span className="text-xs text-fg-subtle">
            第 {Math.floor(offset / LIMIT) + 1} 页
          </span>
          <Button variant="secondary" size="sm" disabled={!hasMore} onClick={() => {}}>
            下一页
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col min-h-0">
      {listHeader}
      {listPanel}
    </div>
  )
}
