import { useMutation } from '@tanstack/react-query'
import { Trash2, Pencil, PlayCircle, Clock, FileArchive, Database, Settings as SettingsIcon, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { backupApi } from '@/api/backup'
import type { BackupScheduleCreateInput } from '@/api/backup'
import { toast } from '@/components/ui/Toast'
import { useI18n } from '@/hooks/useI18n'
import { useFormat } from '@/lib/format'
import { useQueryClient } from '@tanstack/react-query'
import { getDestinationMeta } from './DestinationCard'
import type { BackupSchedule, BackupDestination } from '@shared/types'

interface ScheduleCardProps {
  schedule: BackupSchedule
  destinations: BackupDestination[]
  onRunNow: () => void
  runNowLoading: boolean
  onEdit: () => void
  onDelete: () => void
}

export function ScheduleCard({ schedule, destinations, onRunNow, runNowLoading, onEdit, onDelete }: ScheduleCardProps) {
  const { t } = useI18n()
  const { formatRelativeTime } = useFormat()
  const queryClient = useQueryClient()

  const retention = schedule.retention ?? {}
  const retentionParts: string[] = []
  if (retention.keep_last) retentionParts.push(`${t('remoteBackup.keepLast')}: ${retention.keep_last}`)
  if (retention.keep_daily) retentionParts.push(`${t('remoteBackup.keepDaily')}: ${retention.keep_daily}`)
  if (retention.keep_weekly) retentionParts.push(`${t('remoteBackup.keepWeekly')}: ${retention.keep_weekly}`)
  if (retention.keep_monthly) retentionParts.push(`${t('remoteBackup.keepMonthly')}: ${retention.keep_monthly}`)
  const retentionText = retentionParts.length > 0 ? retentionParts.join(' · ') : '-'

  const toggleMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const payload: BackupScheduleCreateInput = {
        name: schedule.name,
        enabled,
        cron_expr: schedule.cron_expr,
        destination_ids: schedule.destination_ids,
        source: schedule.source ?? {},
        retention: schedule.retention ?? {},
      }
      return await backupApi.updateSchedule(schedule.id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-schedules'] })
    },
    onError: (err) => {
      toast({
        type: 'error',
        title: t('common.saveFailed'),
        description: err instanceof Error ? err.message : t('common.unknownError'),
      })
    },
  })

  return (
    <div className="rounded-xl border border-border bg-bg-card hover:border-accent/30 hover:shadow-sm transition-all p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-fg truncate">{schedule.name}</h3>
          </div>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <Badge variant="muted" className="text-[10px] gap-1">
              <Clock size={9} />
              {schedule.cron_expr}
            </Badge>
            {schedule.next_run_at ? (
              <span className="text-[10px] text-fg-muted">
                {t('remoteBackup.runsNext')}: {formatRelativeTime(schedule.next_run_at)}
              </span>
            ) : null}
          </div>
        </div>
        <label className="inline-flex items-center cursor-pointer shrink-0" title={schedule.enabled ? t('remoteBackup.enabled') : 'Disabled'}>
          <input
            type="checkbox"
            className="sr-only peer"
            checked={!!schedule.enabled}
            onChange={(e) => toggleMutation.mutate(e.target.checked)}
            disabled={toggleMutation.isPending}
          />
          <div className="w-9 h-5 bg-border rounded-full peer peer-checked:bg-accent transition-colors relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 shadow-sm"></div>
        </label>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {schedule.source?.include_files && (
          <Badge variant="accent" className="gap-1 text-[10px]">
            <FileArchive size={9} />
            {t('remoteBackup.sourceFiles')}
          </Badge>
        )}
        {schedule.source?.include_db && (
          <Badge variant="success" className="gap-1 text-[10px]">
            <Database size={9} />
            {t('remoteBackup.sourceDb')}
          </Badge>
        )}
        {schedule.source?.include_config && (
          <Badge variant="muted" className="gap-1 text-[10px]">
            <SettingsIcon size={9} />
            {t('remoteBackup.sourceConfig')}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {destinations.length === 0 ? (
          <Badge variant="danger" className="gap-1 text-[10px]">
            <AlertTriangle size={9} />
            -
          </Badge>
        ) : (
          destinations.slice(0, 3).map((d) => {
            const meta = getDestinationMeta(d.type)
            return (
              <div
                key={d.id}
                className={`w-6 h-6 rounded flex items-center justify-center ${meta.bgClass} shrink-0`}
                title={d.name}
              >
                <span className="scale-75">{meta.icon}</span>
              </div>
            )
          })
        )}
        {destinations.length > 3 && (
          <Badge variant="muted" className="text-[10px]">+{destinations.length - 3}</Badge>
        )}
      </div>

      <div className="text-[10px] text-fg-muted leading-relaxed" title={retentionText}>
        {t('remoteBackup.retentionSummary')}: {retentionText}
      </div>

      <div className="flex items-center gap-1.5 pt-1 border-t border-border mt-auto">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={onRunNow}
          loading={runNowLoading}
          disabled={runNowLoading}
        >
          <PlayCircle size={13} />
          {t('remoteBackup.runNow')}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onEdit}
          title={t('common.edit')}
          aria-label={t('common.edit')}
        >
          <Pencil size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          className="text-danger hover:text-danger"
          title={t('common.delete')}
          aria-label={t('common.delete')}
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  )
}
