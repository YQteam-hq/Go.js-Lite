import { Badge } from '@/components/ui/Badge'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { useFormat } from '@/lib/format'
import type { BackupRunRecord, BackupSchedule } from '@shared/types'

interface RunRowProps {
  run: BackupRunRecord
  schedule: BackupSchedule | null
}

export function RunRow({ run, schedule }: RunRowProps) {
  const { formatBytes, formatDate, formatDuration } = useFormat()
  const startedMs = (run.started_at ?? 0) * 1000
  const endedMs = run.ended_at ? run.ended_at * 1000 : null
  const durationSec = endedMs && startedMs ? Math.max(0, Math.floor((endedMs - startedMs) / 1000)) : null

  const destOk = (run.destination_results ?? []).filter((r) => r.ok).length
  const destTotal = (run.destination_results ?? []).length

  const statusVariant: 'success' | 'accent' | 'danger' =
    run.status === 'success' ? 'success' : run.status === 'running' ? 'accent' : 'danger'
  const statusIcon =
    run.status === 'success' ? (
      <CheckCircle2 size={11} />
    ) : run.status === 'running' ? (
      <Loader2 size={11} className="animate-spin" />
    ) : (
      <XCircle size={11} />
    )

  return (
    <tr className="hover:bg-fg/5 transition-colors">
      <td className="px-3 py-2 whitespace-nowrap text-fg font-medium">
        {schedule?.name ?? run.schedule_id}
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-fg-muted font-mono" title={formatDate(run.started_at)}>
        {formatDate(run.started_at)}
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-fg-muted">
        {run.status === 'running' ? (
          <Badge variant="accent" className="gap-1 text-[10px]">
            <Loader2 size={9} className="animate-spin" />
            ...
          </Badge>
        ) : durationSec !== null ? (
          formatDuration(durationSec)
        ) : (
          '-'
        )}
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <Badge variant={statusVariant} className="gap-1 text-[10px]">
          {statusIcon}
          {run.status}
        </Badge>
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-right font-mono text-fg-muted">
        {run.bytes_total > 0 ? formatBytes(run.bytes_total) : '-'}
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-right font-mono text-fg-muted">
        {destTotal > 0 ? `${destOk}/${destTotal}` : '-'}
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-right font-mono text-fg-muted">
        {run.pruned_count > 0 ? run.pruned_count : '-'}
      </td>
    </tr>
  )
}
