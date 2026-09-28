import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  CheckCheck,
  Trash2,
  RefreshCw,
  Settings as SettingsIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Confirm } from '@/components/ui/Modal'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { toast } from '@/components/ui/Toast'
import { notificationsApi } from '@/api/notifications'
import { useRelativeTime } from '@/components/notifications/helpers'
import { CategoryFilter } from './components/CategoryFilter'
import { NotificationList } from './components/NotificationList'
import { NotificationDetail } from './components/NotificationDetail'
import { ChannelsCard } from './components/ChannelsCard'
import type {
  NotificationCategory,
  NotificationSeverity,
} from '@shared/types'

const LIMIT = 50

export default function Notifications() {
  const isMobile = useIsMobile()
  const relTime = useRelativeTime()

  const [category, setCategory] = useState<NotificationCategory | 'all'>('all')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)
  const [offset, setOffset] = useState(0)
  const [channelsModalOpen, setChannelsModalOpen] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['notificationsList', category, unreadOnly, offset],
    queryFn: () =>
      notificationsApi.list({
        category: category === 'all' ? undefined : category,
        unread_only: unreadOnly,
        limit: LIMIT,
        offset,
      }),
  })
  const { data: summary } = useQuery({
    queryKey: ['notificationsSummary'],
    queryFn: () => notificationsApi.summary(),
    refetchInterval: 60000,
  })

  const items = useMemo(() => data?.items ?? [], [data])
  const total = data?.total ?? 0
  const unreadCount = data?.unread_count ?? summary?.unread ?? 0
  const countMapTotal = summary?.total ?? 0
  const selectedItem = useMemo(() => items.find((i) => i.id === selectedId) || null, [items, selectedId])

  const invalidateAll = () => {
  }

  const markReadMut = useMutation({ mutationFn: (id: string) => notificationsApi.markRead(id), onSuccess: invalidateAll })
  const markAllMut = useMutation({
    mutationFn: () => notificationsApi.readAll(),
    onSuccess: () => { toast({ type: 'success', title: '已全部标记为已读' }); invalidateAll() },
    onError: (e: Error) => toast({ type: 'error', title: '保存失败', description: e.message }),
  })
  const delMut = useMutation({
    mutationFn: (id: string) => notificationsApi.remove(id),
    onSuccess: () => { invalidateAll(); setSelectedId(null); setMobileDetailOpen(false) },
  })
  const clearMut = useMutation({
    mutationFn: () => notificationsApi.clearRead(),
    onSuccess: () => {
      toast({ type: 'success', title: '已清空已读通知' })
      invalidateAll()
      setConfirmClear(false)
    },
  })

  const catLabel = (c: NotificationCategory | 'all') =>
    c === 'all'
      ? '全部'
      : c

  const sevBadge = (s: NotificationSeverity): 'accent' | 'warning' | 'danger' | 'success' => {
    switch (s) {
      case 'info': return 'accent'
      case 'warning': return 'warning'
      case 'critical': return 'danger'
      case 'success': return 'success'
      default: return 'accent'
    }
  }
  const sevLabel = (s: NotificationSeverity) => s
  const hasMore = items.length === LIMIT && offset + LIMIT < total

  const handleCategoryChange = (newCategory: NotificationCategory | 'all') => {
    setCategory(newCategory)
    setOffset(0)
  }

  const handleUnreadOnlyChange = (newUnreadOnly: boolean) => {
    setUnreadOnly(newUnreadOnly)
    setOffset(0)
  }

  const handleSelect = (id: string) => {
    setSelectedId(id)
    if (isMobile) setMobileDetailOpen(true)
  }

  return (
    <div className="p-4 md:p-6 space-y-4 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-fg">通知</h1>
          <p className="text-sm text-fg-muted mt-0.5">未读通知: {unreadCount}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => markAllMut.mutate()} loading={markAllMut.isPending}>
            <CheckCheck size={16} />全部已读
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setConfirmClear(true)} loading={clearMut.isPending}>
            <Trash2 size={16} />清空已读
          </Button>
          <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />刷新
          </Button>
          <Button variant="primary" size="sm" onClick={() => setChannelsModalOpen(true)}>
            <SettingsIcon size={16} />通知通道设置
          </Button>
        </div>
      </div>

      {isMobile ? (
        <div className="space-y-3">
          <CategoryFilter
            category={category}
            countMapTotal={countMapTotal}
            unreadOnly={unreadOnly}
            onCategoryChange={handleCategoryChange}
            onUnreadOnlyChange={handleUnreadOnlyChange}
            catLabel={catLabel}
          />
          <NotificationList
            items={items}
            selectedId={selectedId}
            isLoading={isLoading}
            hasMore={hasMore}
            offset={offset}
            total={total}
            unreadCount={unreadCount}
            relTime={relTime}
            sevBadge={sevBadge}
            sevLabel={sevLabel}
            catLabel={catLabel}
            onSelect={handleSelect}
            onLoadMore={() => {}}
            onPrevPage={() => setOffset((o) => Math.max(0, o - LIMIT))}
            onRefetch={refetch}
            isFetching={isFetching}
          />
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4 min-h-[calc(100vh-12rem)]">
          <div className="col-span-3 space-y-3">
            <CategoryFilter
              category={category}
              countMapTotal={countMapTotal}
              unreadOnly={unreadOnly}
              onCategoryChange={handleCategoryChange}
              onUnreadOnlyChange={handleUnreadOnlyChange}
              catLabel={catLabel}
            />
          </div>
          <div className="col-span-5 flex flex-col min-h-0">
            <NotificationList
              items={items}
              selectedId={selectedId}
              isLoading={isLoading}
              hasMore={hasMore}
              offset={offset}
              total={total}
              unreadCount={unreadCount}
              relTime={relTime}
              sevBadge={sevBadge}
              sevLabel={sevLabel}
              catLabel={catLabel}
              onSelect={handleSelect}
              onLoadMore={() => {}}
              onPrevPage={() => setOffset((o) => Math.max(0, o - LIMIT))}
              onRefetch={refetch}
              isFetching={isFetching}
            />
          </div>
          <div className="col-span-4 rounded-2xl border border-border bg-bg-elevated p-4 overflow-auto">
            <NotificationDetail
              item={selectedItem}
              sevBadge={sevBadge}
              sevLabel={sevLabel}
              catLabel={catLabel}
              markRead={(id) => markReadMut.mutate(id)}
              deleteNotif={(id) => setConfirmDeleteId(id)}
              isMarkReadPending={markReadMut.isPending}
              isDeletePending={delMut.isPending}
            />
          </div>
        </div>
      )}

      {isMobile && (
        <BottomSheet open={mobileDetailOpen} onClose={() => setMobileDetailOpen(false)} title="通知">
          <div className="px-4 pb-6">
            <NotificationDetail
              item={selectedItem}
              sevBadge={sevBadge}
              sevLabel={sevLabel}
              catLabel={catLabel}
              markRead={(id) => markReadMut.mutate(id)}
              deleteNotif={(id) => setConfirmDeleteId(id)}
              isMarkReadPending={markReadMut.isPending}
              isDeletePending={delMut.isPending}
            />
          </div>
        </BottomSheet>
      )}

      <ChannelsCard open={channelsModalOpen} onClose={() => setChannelsModalOpen(false)} />
      <Confirm
        open={!!confirmDeleteId}
        title="删除通知"
        message="确认删除该条通知吗？此操作无法撤销。"
        variant="danger"
        onConfirm={() => { if (confirmDeleteId) delMut.mutate(confirmDeleteId); setConfirmDeleteId(null) }}
        onCancel={() => setConfirmDeleteId(null)}
        loading={delMut.isPending}
      />
      <Confirm
        open={confirmClear}
        title="清空已读通知"
        message="确认删除所有已读通知？此操作无法撤销。"
        variant="danger"
        onConfirm={() => clearMut.mutate()}
        onCancel={() => setConfirmClear(false)}
        loading={clearMut.isPending}
      />
    </div>
  )
}
