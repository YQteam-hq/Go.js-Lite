import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { AvatarBadge } from '@/components/ui/AvatarBadge'
import { toast } from '@/components/ui/Toast'
import { usersApi, type UserRecord, type UserRole, type UpdateUserInput } from '@/api/users'
import { useI18n } from '@/hooks/useI18n'
import { resolveErrorText } from '@/lib/errorMessages'

interface EditUserModalProps {
  user: UserRecord | null
  onClose: () => void
  onSuccess: () => void
}

export function EditUserModal({ user, onClose, onSuccess }: EditUserModalProps) {
  const { t } = useI18n()
  const [editForm, setEditForm] = useState({
    username: user?.username || '',
    role: user?.role || 'viewer' as UserRole,
    path_allowlist: user?.path_allowlist?.join('\n') || '',
    permissions_boost: user?.permissions_boost?.join('\n') || '',
    disabled: !!user?.disabled,
    password: '',
  })

  const updateMutation = {
    isPending: false,
    mutate: async () => {
      if (!user) return
      try {
        const payload: UpdateUserInput = {
          username: editForm.username.trim(),
          role: editForm.role,
          path_allowlist: editForm.path_allowlist.split('\n').map(s => s.trim()).filter(Boolean),
          permissions_boost: editForm.permissions_boost.split('\n').map(s => s.trim()).filter(Boolean),
          disabled: editForm.disabled,
        }
        if (editForm.password) payload.password = editForm.password
        await usersApi.update(user.id, payload)
        toast({ type: 'success', title: t('users.updated') })
        onClose()
        onSuccess()
      } catch (err: unknown) {
        toast({ type: 'error', title: t('common.saveFailed'), description: resolveErrorText(err as Error) })
      }
    },
  }

  return (
    <Modal
      open={user !== null}
      onClose={onClose}
      title={t('users.edit')}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={() => updateMutation.mutate()} loading={updateMutation.isPending}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {user && (
          <>
            <div className="flex items-center gap-3 pb-2 border-b border-border/40">
              <AvatarBadge username={user.username} color={user.avatar_color} size="md" />
              <div>
                <div className="font-medium text-fg">{user.username}</div>
                <div className="text-xs text-fg-subtle">{user.id}</div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-fg mb-1">{t('users.username')}</label>
              <Input value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} autoComplete="off" />
            </div>
            <div>
              <label className="block text-sm font-medium text-fg mb-1">{t('users.newPassword')}</label>
              <Input type="password" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} placeholder={t('users.leaveBlankKeepPassword')} autoComplete="new-password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-fg mb-1">{t('users.role')}</label>
              <select
                className="w-full h-10 rounded-lg border border-border bg-bg-elevated px-3 text-sm"
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
              >
                <option value="viewer">{t('users.roleViewer')}</option>
                <option value="operator">{t('users.roleOperator')}</option>
                <option value="admin">{t('users.roleAdmin')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-fg mb-1">{t('users.pathAllowlist')}</label>
              <textarea
                className="w-full min-h-[100px] rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm font-mono"
                value={editForm.path_allowlist}
                onChange={(e) => setEditForm({ ...editForm, path_allowlist: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-fg mb-1">{t('users.permissionsBoost')}</label>
              <textarea
                className="w-full min-h-[80px] rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm font-mono"
                value={editForm.permissions_boost}
                onChange={(e) => setEditForm({ ...editForm, permissions_boost: e.target.value })}
                placeholder={t('users.permissionsBoostPlaceholder')}
              />
              <p className="text-xs text-fg-subtle mt-1">{t('users.permissionsBoostHint')}</p>
            </div>
            <label className="flex items-center gap-2 text-sm text-fg">
              <input
                type="checkbox"
                checked={editForm.disabled}
                onChange={(e) => setEditForm({ ...editForm, disabled: e.target.checked })}
              />
              {t('users.disabled')}
            </label>
          </>
        )}
      </div>
    </Modal>
  )
}
