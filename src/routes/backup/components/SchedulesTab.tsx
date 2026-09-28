import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, RefreshCw, Clock, Calendar as CalendarIcon, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { Confirm } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { backupApi } from '@/api/backup'
import { backupDestinationsApi } from '@/api/backupDestinations'
import { cronApi } from '@/api/cron'
import { apiFetch } from '@/api/client'
import { toast } from '@/components/ui/Toast'
import { useI18n } from '@/hooks/useI18n'
import { ScheduleCard } from './ScheduleCard'
import { ScheduleModal } from './ScheduleModal'
import { RunRow } from './RunRow'
import type { BackupSchedule, BackupRunRecord } from '@shared/types'

export function SchedulesTab() {
  const { t } = useI18n()
  const queryClient = useQueryClient()

  const [showModal, setShowModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<BackupSchedule | null>(null)
  const [runImmediately, setRunImmediately] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<BackupSchedule | null>(null)
  const [showRegenTokenConfirm, setShowRegenTokenConfirm] = useState(false)
  const [copied, setCopied] = useState(false)

  const schedulesQuery = useQuery({
    queryKey: ['backup-schedules'],
    queryFn: () => backupApi.listSchedules(),
    staleTime: 30_000,
  })

  const destinationsQuery = useQuery({
    queryKey: ['backup-destinations'],
    queryFn: () => backupDestinationsApi.list(),
    staleTime: 60_000,
  })

  const runsQuery = useQuery({
    queryKey: ['backup-runs-recent'],
    queryFn: () => backupApi.listRuns({ limit: 10, offset: 0 }),
    staleTime: 60_000,
    refetchInterval: (query) => {
      const data = query.state.data
      const hasRunning = (data?.runs ?? []).some((r: BackupRunRecord) => r.status === 'running')
      return hasRunning ? 10_000 : false
    },
  })

  const configQuery = useQuery({
    queryKey: ['internal-cron-config'],
    queryFn: async () => {
      try {
        const data = await apiFetch<{ config?: { internal_cron_token?: string } }>('/bootstrap')
        return { internal_cron_token: data.config?.internal_cron_token ?? '' }
      } catch {
        return { internal_cron_token: '' }
      }
    },
    staleTime: 60_000,
  })

  const webcronUrl = useMemo(() => {
    const token = configQuery.data?.internal_cron_token ?? ''
    const host = typeof window !== 'undefined' ? window.location.host : ''
    const proto = typeof window !== 'undefined' ? window.location.protocol : 'https:'
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
    const suffix = base ? `${base}/webcron.php` : '/webcron.php'
    return token ? `${proto}//${host}${suffix}?token=${encodeURIComponent(token)}` : ''
  }, [configQuery.data])

  const handleCopyUrl = async () => {
    if (!webcronUrl) return
    try {
      await navigator.clipboard.writeText(webcronUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
      toast({ type: 'success', title: t('common.copied') ?? 'Copied' })
    } catch {
      toast({ type: 'error', title: t('common.unknownError') })
    }
  }

  const regenTokenMutation = useMutation({
    mutationFn: () => cronApi.regenerateInternalCronToken(),
    onSuccess: (res) => {
      toast({ type: 'success', title: t('remoteBackup.regenerateToken') })
      queryClient.invalidateQueries({ queryKey: ['internal-cron-config'] })
      queryClient.setQueryData(['internal-cron-config'], { internal_cron_token: res.token })
      setShowRegenTokenConfirm(false)
    },
    onError: (err) => {
      toast({
        type: 'error',
        title: t('common.saveFailed'),
        description: err instanceof Error ? err.message : t('common.unknownError'),
      })
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof backupApi.createSchedule>[0]) => backupApi.createSchedule(data),
    onSuccess: async (res) => {
      toast({ type: 'success', title: t('remoteBackup.created') })
      queryClient.invalidateQueries({ queryKey: ['backup-schedules'] })
      setShowModal(false)
      if (runImmediately && res.schedule) {
        await backupApi.runScheduleNow(res.schedule.id)
        queryClient.invalidateQueries({ queryKey: ['backup-runs-recent'] })
      }
    },
    onError: (err) => {
      toast({
        type: 'error',
        title: t('common.saveFailed'),
        description: err instanceof Error ? err.message : t('common.unknownError'),
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof backupApi.updateSchedule>[1] }) =>
      backupApi.updateSchedule(id, data),
    onSuccess: async (res) => {
      toast({ type: 'success', title: t('remoteBackup.updated') })
      queryClient.invalidateQueries({ queryKey: ['backup-schedules'] })
      setShowModal(false)
      setEditingSchedule(null)
      if (runImmediately && res.schedule) {
        await backupApi.runScheduleNow(res.schedule.id)
        queryClient.invalidateQueries({ queryKey: ['backup-runs-recent'] })
      }
    },
    onError: (err) => {
      toast({
        type: 'error',
        title: t('common.saveFailed'),
        description: err instanceof Error ? err.message : t('common.unknownError'),
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => backupApi.deleteSchedule(id),
    onSuccess: () => {
      toast({ type: 'success', title: t('remoteBackup.deleted') })
      queryClient.invalidateQueries({ queryKey: ['backup-schedules'] })
      setDeleteTarget(null)
    },
    onError: (err) => {
      toast({
        type: 'error',
        title: t('common.deleteFailed'),
        description: err instanceof Error ? err.message : t('common.unknownError'),
      })
    },
  })

  const runNowMutation = useMutation({
    mutationFn: (id: string) => backupApi.runScheduleNow(id),
    onSuccess: () => {
      toast({ type: 'success', title: t('remoteBackup.runNow') })
      queryClient.invalidateQueries({ queryKey: ['backup-runs-recent'] })
      queryClient.invalidateQueries({ queryKey: ['backup-schedules'] })
    },
    onError: (err) => {
      toast({
        type: 'error',
        title: t('common.unknownError'),
        description: err instanceof Error ? err.message : t('common.unknownError'),
      })
    },
  })

  const schedules = useMemo(() => schedulesQuery.data?.schedules ?? [], [schedulesQuery.data])
  const destinations = destinationsQuery.data?.destinations ?? []
  const runs = runsQuery.data?.runs ?? []

  const scheduleMap = useMemo(() => {
    const m = new Map<string, BackupSchedule>()
    for (const s of schedules) m.set(s.id, s)
    return m
  }, [schedules])

  const openNew = () => {
    setEditingSchedule(null)
    setRunImmediately(false)
    setShowModal(true)
  }
  const openEdit = (s: BackupSchedule) => {
    setEditingSchedule(s)
    setRunImmediately(false)
    setShowModal(true)
  }

  return (
    <div className="p-4 md:p-5 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-sm font-semibold text-fg">{t('remoteBackup.tabSchedules')}</h2>
          <p className="text-[11px] text-fg-muted mt-0.5 leading-relaxed">
            {t('remoteBackup.schedulesHintCard')}
          </p>
        </div>
        <Button size="sm" onClick={openNew}>
          <Plus size={15} />
          {t('remoteBackup.createSchedule')}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-bg-sunken/30 px-4 py-3 space-y-2.5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <Clock size={14} className="text-accent shrink-0" />
            <span className="text-[11px] font-medium text-fg shrink-0">
              {t('remoteBackup.webcronUrl')}
            </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowRegenTokenConfirm(true)}
            loading={regenTokenMutation.isPending}
          >
            <RefreshCw size={13} className={regenTokenMutation.isPending ? 'animate-spin' : ''} />
            {t('remoteBackup.regenerateToken')}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Input
            readOnly
            value={webcronUrl}
            className="text-[11px] font-mono !py-1.5 bg-bg-card"
            placeholder="..."
          />
          <Button
            variant="secondary"
            size="icon-sm"
            onClick={handleCopyUrl}
            disabled={!webcronUrl}
            aria-label="Copy"
            title="Copy"
          >
            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
          </Button>
        </div>
      </div>

      {schedulesQuery.isLoading ? (
        <div className="p-10 flex justify-center">
          <Spinner />
        </div>
      ) : schedules.length === 0 ? (
        <EmptyState
          icon={
            <div className="w-16 h-16 rounded-full bg-bg-sunken flex items-center justify-center text-fg-subtle mx-auto">
              <Clock size={28} />
            </div>
          }
          title={t('remoteBackup.scheduleEmptyHint')}
          description={t('remoteBackup.scheduleEmptyDesc')}
          action={{
            label: t('remoteBackup.createSchedule'),
            onClick: openNew,
            variant: 'primary',
            icon: <Plus size={14} />,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedules.map((s) => (
            <ScheduleCard
              key={s.id}
              schedule={s}
              destinations={destinations.filter((d) => s.destination_ids.includes(d.id))}
              onRunNow={() => runNowMutation.mutate(s.id)}
              runNowLoading={runNowMutation.isPending}
              onEdit={() => openEdit(s)}
              onDelete={() => setDeleteTarget(s)}
            />
          ))}
        </div>
      )}

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-semibold text-fg flex items-center gap-2">
            <CalendarIcon size={15} className="text-accent" />
            {t('remoteBackup.recentRuns')}
          </h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['backup-runs-recent'] })}
            disabled={runsQuery.isLoading || runsQuery.isFetching}
          >
            <RefreshCw size={13} className={runsQuery.isFetching ? 'animate-spin' : ''} />
            {t('common.refresh')}
          </Button>
        </div>

        <div className="rounded-xl border border-border overflow-hidden bg-bg-card">
          <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
            <table className="w-full text-[11px]">
              <thead className="bg-bg-sunken sticky top-0 z-10">
                <tr>
                  <th className="text-left px-3 py-2.5 font-medium text-fg-muted whitespace-nowrap">
                    {t('remoteBackup.colsSchedule')}
                  </th>
                  <th className="text-left px-3 py-2.5 font-medium text-fg-muted whitespace-nowrap">
                    {t('remoteBackup.colsStartedAt')}
                  </th>
                  <th className="text-left px-3 py-2.5 font-medium text-fg-muted whitespace-nowrap">
                    {t('remoteBackup.colsDuration')}
                  </th>
                  <th className="text-left px-3 py-2.5 font-medium text-fg-muted whitespace-nowrap">
                    {t('remoteBackup.colsStatus')}
                  </th>
                  <th className="text-right px-3 py-2.5 font-medium text-fg-muted whitespace-nowrap">
                    {t('remoteBackup.colsBytes')}
                  </th>
                  <th className="text-right px-3 py-2.5 font-medium text-fg-muted whitespace-nowrap">
                    {t('remoteBackup.colsDests')}
                  </th>
                  <th className="text-right px-3 py-2.5 font-medium text-fg-muted whitespace-nowrap">
                    {t('remoteBackup.colsPruned')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {runsQuery.isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <Spinner />
                    </td>
                  </tr>
                ) : runs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-[11px] text-fg-muted">
                      {t('remoteBackup.scheduleEmptyHint')}
                    </td>
                  </tr>
                ) : (
                  runs.map((r) => (
                    <RunRow
                      key={r.id}
                      run={r}
                      schedule={scheduleMap.get(r.schedule_id) ?? null}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ScheduleModal
        open={showModal}
        editing={editingSchedule}
        destinations={destinations}
        runImmediately={runImmediately}
        onRunImmediatelyChange={setRunImmediately}
        onClose={() => {
          setShowModal(false)
          setEditingSchedule(null)
        }}
        onSave={(payload) => {
          if (editingSchedule) {
            updateMutation.mutate({ id: editingSchedule.id, data: payload })
          } else {
            createMutation.mutate(payload)
          }
        }}
        saving={createMutation.isPending || updateMutation.isPending}
        isEdit={!!editingSchedule}
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

      <Confirm
        open={showRegenTokenConfirm}
        title={t('remoteBackup.regenerateToken')}
        message={<span>{t('remoteBackup.tokenInvalidatedWarning')}</span>}
        confirmText={t('remoteBackup.regenerateToken')}
        variant="danger"
        loading={regenTokenMutation.isPending}
        onConfirm={() => regenTokenMutation.mutate()}
        onCancel={() => setShowRegenTokenConfirm(false)}
      />
    </div>
  )
}

export function SchedulesTabStub() {
  return <SchedulesTab />
}
