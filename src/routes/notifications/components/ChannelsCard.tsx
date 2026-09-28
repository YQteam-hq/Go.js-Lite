import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { notificationChannelsApi } from '@/api/notifications'
import { toast } from '@/components/ui/Toast'
import { Mail, Send, Webhook } from 'lucide-react'

const CHANNEL_TYPE_ICONS: Record<'email' | 'smtp' | 'webhook', typeof Mail> = {
  email: Mail,
  smtp: Send,
  webhook: Webhook,
}

interface ChannelsCardProps {
  open: boolean
  onClose: () => void
}

export function ChannelsCard({ open, onClose }: ChannelsCardProps) {
  const qc = useQueryClient()

  const { data: channels } = useQuery({
    queryKey: ['notificationChannels'],
    queryFn: () => notificationChannelsApi.list(),
  })

  const removeChMut = useMutation({
    mutationFn: (id: string) => notificationChannelsApi.remove(id),
    onSuccess: () => {
      toast({ type: 'success', title: '已删除' })
      qc.invalidateQueries({ queryKey: ['notificationChannels'] })
    },
    onError: (e: Error) => toast({ type: 'error', title: '保存失败', description: e.message }),
  })

  const channelTypeLabel = (tp: 'email' | 'smtp' | 'webhook') =>
    tp === 'email'
      ? '邮件'
      : tp === 'smtp'
        ? 'SMTP'
        : 'Webhook'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="通知通道设置"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>关闭</Button>
          <Button
            variant="primary"
            onClick={() => {}}
          >
            <Plus size={16} />添加通知通道
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {(channels ?? []).length === 0 ? (
          <EmptyState
            title="尚无通知通道"
            description="点击右上角「添加通知通道」开始配置。"
          />
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            {(channels ?? []).map((ch) => {
              const Icon = CHANNEL_TYPE_ICONS[ch.type]
              return (
                <div key={ch.id} className="p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-bg-sunken text-fg-muted flex items-center justify-center shrink-0">
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-fg truncate">{ch.name}</div>
                    <div className="text-xs text-fg-subtle flex items-center gap-1.5 mt-0.5">
                      <Badge variant={ch.enabled ? 'success' : 'muted'} className="text-[10px] px-1.5">
                        {ch.enabled ? '已启用' : '已停用'}
                      </Badge>
                      <span>{channelTypeLabel(ch.type)}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={() => {}}>
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="ghost" size="icon-sm" className="text-fg-muted hover:text-danger"
                    onClick={() => removeChMut.mutate(ch.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Modal>
  )
}
