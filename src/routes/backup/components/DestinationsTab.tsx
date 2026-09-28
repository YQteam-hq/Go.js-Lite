import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, RefreshCw, Cloud } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Confirm } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { backupDestinationsApi } from '@/api/backupDestinations'
import { toast } from '@/components/ui/Toast'
import { useI18n } from '@/hooks/useI18n'
import { DestinationCard } from './DestinationCard'
import { DestinationModal } from './DestinationModal'
import type { BackupDestination } from '@shared/types'

export function DestinationsTab() {
  const { t } = useI18n()
  const queryClient = useQueryClient()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingDest, setEditingDest] = useState<BackupDestination | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BackupDestination | null>(null)

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['backup-destinations'],
    queryFn: () => backupDestinationsApi.list(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => backupDestinationsApi.remove(id),
    onSuccess: () => {
      toast({ type: 'success', title: t('remoteBackup.deleted') })
      setDeleteTarget(null)
      queryClient.invalidateQueries({ queryKey: ['backup-destinations'] })
    },
    onError: (err) => {
      toast({
        type: 'error',
        title: t('common.deleteFailed'),
        description: err instanceof Error ? err.message : t('common.unknownError'),
      })
    },
  })

  const destinations = data?.destinations ?? []

  return (
    <div className="p-4 md:p-5 space-y-4">
      <div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-sm font-semibold text-fg">{t('remoteBackup.tabDestinations')}</h2>
            <p className="text-[11px] text-fg-muted mt-1 leading-relaxed">
              {t('remoteBackup.credentialsEncryptedHint')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => refetch()} disabled={isLoading || isFetching}>
              <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
              {t('common.refresh')}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditingDest(null)
                setModalOpen(true)
              }}
            >
              <Plus size={15} />
              {t('remoteBackup.newDestination')}
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-10 flex justify-center">
          <Spinner />
        </div>
      ) : destinations.length === 0 ? (
        <EmptyState
          icon={
            <div className="w-16 h-16 rounded-full bg-bg-sunken flex items-center justify-center text-fg-subtle mx-auto">
              <Cloud size={28} />
            </div>
          }
          title={t('remoteBackup.destinationsEmptyHint')}
          description={t('remoteBackup.destinationsEmptyDescription')}
          action={{
            label: t('remoteBackup.newDestination'),
            onClick: () => {
              setEditingDest(null)
              setModalOpen(true)
            },
            variant: 'primary',
            icon: <Plus size={14} />,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {destinations.map((dest) => (
            <DestinationCard
              key={dest.id}
              dest={dest}
              onEdit={() => {
                setEditingDest(dest)
                setModalOpen(true)
              }}
              onDelete={() => setDeleteTarget(dest)}
            />
          ))}
        </div>
      )}

      <DestinationModal
        open={modalOpen}
        editing={editingDest}
        onClose={() => {
          setModalOpen(false)
          setEditingDest(null)
        }}
      />

      <Confirm
        open={!!deleteTarget}
        title={t('remoteBackup.deleteDestination')}
        message={
          <>
            <span>{t('remoteBackup.deleteDestinationConfirm')}</span>
            {deleteTarget && (
              <code className="block mt-2 text-xs bg-bg-sunken px-2 py-1 rounded font-mono">
                {deleteTarget.name}
              </code>
            )}
          </>
        }
        confirmText={t('common.delete')}
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id)
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
