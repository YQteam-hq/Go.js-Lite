import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RotateCcw, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { backupApi } from '@/api/backup'
import { backupDestinationsApi } from '@/api/backupDestinations'
import { toast } from '@/components/ui/Toast'
import { useI18n } from '@/hooks/useI18n'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { useFormat } from '@/lib/format'

function remoteItemName(key: string) {
  const idx = key.lastIndexOf('/')
  return idx >= 0 ? key.slice(idx + 1) : key
}

function formatRemoteModified(iso: string) {
  const ts = Date.parse(iso)
  if (Number.isNaN(ts)) return iso
  return new Date(ts).toLocaleString()
}

interface RemoteRestoreModalProps {
  open: boolean
  onClose: () => void
  onRestored: () => void
}

export function RemoteRestoreModal({ open, onClose, onRestored }: RemoteRestoreModalProps) {
  const { t } = useI18n()
  const isMobile = useIsMobile()
  const { formatBytes } = useFormat()
  const queryClient = useQueryClient()

  const [destId, setDestId] = useState('')
  const [selectedKey, setSelectedKey] = useState('')

  useEffect(() => {
    if (open) {
      setDestId('')
      setSelectedKey('')
    }
  }, [open])

  const destinationsQuery = useQuery({
    queryKey: ['backup-destinations'],
    queryFn: () => backupDestinationsApi.list(),
    enabled: open,
    staleTime: 60_000,
  })
  const destinations = destinationsQuery.data?.destinations ?? []

  const browseQuery = useQuery({
    queryKey: ['backup-remote-browse', destId],
    queryFn: () => backupDestinationsApi.browse(destId),
    enabled: open && destId !== '',
  })
  const items = browseQuery.data?.items ?? []

  const downloadRestoreMutation = useMutation({
    mutationFn: async () => {
      const res = await backupDestinationsApi.download(destId, selectedKey)
      return backupApi.restore(res.filename)
    },
    onSuccess: (res) => {
      const parts: string[] = []
      if (res.restored_files > 0) {
        parts.push(t('backup.restoredFilesCount', { count: res.restored_files }))
      }
      if (res.restored_db > 0) {
        parts.push(t('backup.restoredDbCount', { count: res.restored_db }))
      }
      toast({
        type: 'success',
        title: t('backupRemote.restoreRemoteSuccess'),
        description: parts.length > 0 ? parts.join(' · ') : undefined,
      })
      queryClient.invalidateQueries({ queryKey: ['backups'] })
      onRestored()
      onClose()
    },
    onError: (err) => {
      toast({
        type: 'error',
        title: t('backupRemote.restoreRemoteFailed'),
        description: err instanceof Error ? err.message : t('common.unknownError'),
      })
    },
  })

  const canRestore = destId !== '' && selectedKey !== '' && !downloadRestoreMutation.isPending

  const listBody = (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-fg mb-1.5">
          {t('backupRemote.selectDestination')}
        </label>
        <select
          value={destId}
          onChange={(e) => {
            setDestId(e.target.value)
            setSelectedKey('')
          }}
          className="w-full rounded-md border border-border bg-bg-card px-3 py-2 text-xs text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40"
        >
          <option value="">{t('backupRemote.selectDestinationPlaceholder')}</option>
          {destinations.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} · {d.type.toUpperCase()}
            </option>
          ))}
        </select>
        {destinationsQuery.isError && (
          <p className="text-[11px] text-danger mt-1.5">{t('backupRemote.loadDestinationsFailed')}</p>
        )}
      </div>

      {destId !== '' &&
        (browseQuery.isLoading ? (
          <div className="p-8 flex justify-center">
            <Spinner />
          </div>
        ) : browseQuery.isError ? (
          <div className="p-6 text-center text-xs text-danger">
            <AlertTriangle size={20} className="mx-auto mb-2" />
            {browseQuery.error instanceof Error
              ? browseQuery.error.message
              : t('backupRemote.loadFailed')}
          </div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-xs text-fg-muted">{t('backupRemote.noRemoteFiles')}</div>
        ) : (
          <div className="max-h-[260px] overflow-y-auto divide-y divide-border rounded-lg border border-border">
            {items.map((item) => (
              <label
                key={item.key}
                className={`flex items-start gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                  selectedKey === item.key ? 'bg-accent/5' : 'hover:bg-fg/5'
                }`}
              >
                <input
                  type="radio"
                  name="remote-backup-select"
                  className="mt-1 accent-accent shrink-0"
                  checked={selectedKey === item.key}
                  onChange={() => setSelectedKey(item.key)}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-mono text-fg break-all">{remoteItemName(item.key)}</p>
                  <p className="text-[11px] text-fg-subtle mt-0.5 flex items-center gap-3 flex-wrap">
                    <span>{formatBytes(item.size)}</span>
                    {item.modified && <span title={item.modified}>{formatRemoteModified(item.modified)}</span>}
                  </p>
                </div>
              </label>
            ))}
          </div>
        ))}
    </div>
  )

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose}>
        {t('common.cancel')}
      </Button>
      <Button
        onClick={() => downloadRestoreMutation.mutate()}
        loading={downloadRestoreMutation.isPending}
        disabled={!canRestore}
      >
        <RotateCcw size={15} />
        {downloadRestoreMutation.isPending
          ? t('backupRemote.downloadRestoreInProgress')
          : t('backupRemote.downloadAndRestore')}
      </Button>
    </>
  )

  return isMobile ? (
    <BottomSheet open={open} onClose={onClose} title={t('backupRemote.browse')}>
      <div className="px-5 pb-6 flex flex-col gap-4">
        {listBody}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">{footer}</div>
      </div>
    </BottomSheet>
  ) : (
    <Modal open={open} onClose={onClose} title={t('backupRemote.browse')} size="md" footer={footer}>
      {listBody}
    </Modal>
  )
}
