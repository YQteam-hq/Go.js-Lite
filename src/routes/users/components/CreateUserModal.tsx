import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { usersApi, type UserRole } from '@/api/users'
import { useI18n } from '@/hooks/useI18n'
import { resolveErrorText } from '@/lib/errorMessages'

interface CreateUserModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateUserModal({ open, onClose, onSuccess }: CreateUserModalProps) {
  const { t } = useI18n()
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [form, setForm] = useState({
    username: '',
    password: '',
    role: 'viewer' as UserRole,
    path_allowlist: '',
    permissions_boost: '',
  })

  const handleCreate = async () => {
    if (!form.username.trim() || !form.password) {
      setCreateError(t('users.usernameAndPasswordRequired'))
      return
    }
    setCreating(true)
    setCreateError('')
    try {
      await usersApi.create({
        username: form.username.trim(),
        password: form.password,
        role: form.role,
        path_allowlist: form.path_allowlist.split('\n').map(s => s.trim()).filter(Boolean),
        permissions_boost: form.permissions_boost.split('\n').map(s => s.trim()).filter(Boolean),
      })
      toast({ type: 'success', title: t('users.created') })
      onClose()
      setForm({ username: '', password: '', role: 'viewer', path_allowlist: '', permissions_boost: '' })
      setCreateError('')
      onSuccess()
    } catch (err: unknown) {
      setCreateError(resolveErrorText(err as Error))
    } finally {
      setCreating(false)
    }
  }

  const handleClose = () => {
    onClose()
    setCreateError('')
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t('users.create')}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleCreate} loading={creating}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-fg mb-1">{t('users.username')}</label>
          <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} autoComplete="off" />
        </div>
        <div>
          <label className="block text-sm font-medium text-fg mb-1">{t('users.password')}</label>
          <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
          <p className="text-xs text-fg-subtle mt-1">{t('users.passwordHint')}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-fg mb-1">{t('users.role')}</label>
          <select
            className="w-full h-10 rounded-lg border border-border bg-bg-elevated px-3 text-sm"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
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
            value={form.path_allowlist}
            onChange={(e) => setForm({ ...form, path_allowlist: e.target.value })}
            placeholder={t('users.pathAllowlistPlaceholder')}
          />
          <p className="text-xs text-fg-subtle mt-1">{t('users.pathAllowlistHint')}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-fg mb-1">{t('users.permissionsBoost')}</label>
          <textarea
            className="w-full min-h-[80px] rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm font-mono"
            value={form.permissions_boost}
            onChange={(e) => setForm({ ...form, permissions_boost: e.target.value })}
            placeholder={t('users.permissionsBoostPlaceholder')}
          />
          <p className="text-xs text-fg-subtle mt-1">{t('users.permissionsBoostHint')}</p>
        </div>
        {createError && (
          <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
            {createError}
          </div>
        )}
      </div>
    </Modal>
  )
}
