import { Confirm } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { usersApi, type UserRecord } from '@/api/users'
import { useI18n } from '@/hooks/useI18n'
import { resolveErrorText } from '@/lib/errorMessages'

interface DeleteUserConfirmProps {
  user: UserRecord | null
  onClose: () => void
  onSuccess: () => void
}

export function DeleteUserConfirm({ user, onClose, onSuccess }: DeleteUserConfirmProps) {
  const { t } = useI18n()

  const handleDelete = async () => {
    if (!user) return
    try {
      await usersApi.remove(user.id)
      toast({ type: 'success', title: t('users.deleted') })
      onClose()
      onSuccess()
    } catch (err: unknown) {
      toast({ type: 'error', title: t('common.delete') + ' ' + t('common.failed'), description: resolveErrorText(err as Error) })
    }
  }

  return (
    <Confirm
      open={user !== null}
      title={t('users.confirmDeleteTitle')}
      message={user ? t('users.confirmDeleteMessage', { username: user.username }) : ''}
      confirmText={t('common.delete')}
      variant="danger"
      onConfirm={handleDelete}
      onCancel={onClose}
    />
  )
}
