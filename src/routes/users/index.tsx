import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Shield, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { AvatarBadge } from '@/components/ui/AvatarBadge'
import { usersApi, type UserRecord, type UserRole } from '@/api/users'
import { useFormat } from '@/lib/format'
import { useI18n } from '@/hooks/useI18n'
import { CreateUserModal } from './components/CreateUserModal'
import { EditUserModal } from './components/EditUserModal'
import { DeleteUserConfirm } from './components/DeleteUserConfirm'

const ROLE_META: Record<UserRole, { labelKey: string; variant: 'danger' | 'warning' | 'success' }> = {
  admin:    { labelKey: 'users.roleAdmin',    variant: 'danger' },
  operator: { labelKey: 'users.roleOperator', variant: 'warning' },
  viewer:   { labelKey: 'users.roleViewer',   variant: 'success' },
}

export default function Users() {
  const { t } = useI18n()
  const { formatDate } = useFormat()
  const queryClient = useQueryClient()

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<UserRecord | null>(null)
  const [deleting, setDeleting] = useState<UserRecord | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list(),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['users'] })

  const rows = useMemo(() => data?.users || [], [data])

  const startEdit = (u: UserRecord) => {
    setEditing(u)
  }

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto page-enter">
      <div className="stagger-1 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-fg flex items-center gap-2">
            <Shield size={20} className="text-accent" />
            {t('users.title')}
          </h1>
          <p className="text-sm text-fg-muted mt-0.5">{t('users.subtitle')}</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} />
          {t('users.create')}
        </Button>
      </div>

      <Card className="stagger-2 card-hover">
        <CardHeader>
          <div className="text-sm font-semibold text-fg">{t('users.listTitle')}</div>
          <div className="text-xs text-fg-subtle">{t('users.totalUsers', { count: data?.total ?? 0 })}</div>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <SkeletonTable rows={4} columns={5} />
          ) : rows.length === 0 ? (
            <EmptyState
              title={t('users.empty')}
              description={t('users.emptyDesc')}
              action={{
                label: t('users.create'),
                onClick: () => setShowCreate(true),
                variant: 'primary',
              }}
            />
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-fg-subtle border-b border-border">
                    <th className="px-3 py-2 font-medium" scope="col">{t('common.user')}</th>
                    <th className="px-3 py-2 font-medium" scope="col">{t('users.role')}</th>
                    <th className="px-3 py-2 font-medium" scope="col">{t('users.pathAllowlist')}</th>
                    <th className="px-3 py-2 font-medium" scope="col">{t('users.lastLogin')}</th>
                    <th className="px-3 py-2 font-medium text-right" scope="col">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((u) => {
                    const meta2 = ROLE_META[u.role]
                    return (
                      <tr key={u.id} className="border-b border-border/40 hover:bg-bg-sunken/40">
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <AvatarBadge username={u.username} color={u.avatar_color} size="sm" />
                            <span className="font-medium text-fg">{u.username}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant={meta2.variant}>{t(meta2.labelKey)}</Badge>
                          {u.disabled && (
                            <Badge variant="muted" className="ml-1">{t('users.disabled')}</Badge>
                          )}
                          {(u.permissions_boost || []).length > 0 && (
                            <Badge variant="accent" className="ml-1">
                              {t('users.permissionsBoostCount', { count: (u.permissions_boost || []).length })}
                            </Badge>
                          )}
                        </td>
                        <td className="px-3 py-3 text-fg-muted text-xs">
                          {(u.path_allowlist || []).length === 0 ? (
                            <span className="text-fg-subtle">—</span>
                          ) : (
                            (u.path_allowlist || []).map((p, i) => (
                              <code key={i} className="block font-mono">{p}</code>
                            ))
                          )}
                        </td>
                        <td className="px-3 py-3 text-fg-muted text-xs">
                          {u.last_login_at ? formatDate(u.last_login_at) : '—'}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <Button size="sm" variant="ghost" onClick={() => startEdit(u)}>
                            <Edit2 size={14} />
                            {t('common.edit')}
                          </Button>
                          <Button size="sm" variant="ghost" className="ml-1 text-danger hover:text-danger" onClick={() => setDeleting(u)}>
                            <Trash2 size={14} />
                            {t('common.delete')}
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <CreateUserModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={invalidate}
      />
      <EditUserModal
        user={editing}
        onClose={() => setEditing(null)}
        onSuccess={invalidate}
      />
      <DeleteUserConfirm
        user={deleting}
        onClose={() => setDeleting(null)}
        onSuccess={invalidate}
      />
    </div>
  )
}
