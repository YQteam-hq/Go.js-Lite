import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Trash2, Pencil, Zap, Cloud, Server, Lock, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { backupDestinationsApi } from '@/api/backupDestinations'
import { toast } from '@/components/ui/Toast'
import { useI18n } from '@/hooks/useI18n'
import { useFormat } from '@/lib/format'
import type { BackupDestination } from '@shared/types'
import type { BackupDestinationCreateInput } from '@/api/backupDestinations'

export function getDestinationMeta(type: BackupDestination['type']) {
  switch (type) {
    case 's3':
      return {
        label: 'S3',
        icon: <Cloud size={18} className="text-sky-600" />,
        badgeIcon: <Cloud size={10} />,
        bgClass: 'bg-sky-500/10',
      }
    case 'ftp':
      return {
        label: 'FTP',
        icon: <Server size={18} className="text-amber-600" />,
        badgeIcon: <Server size={10} />,
        bgClass: 'bg-amber-500/10',
      }
    case 'sftp':
      return {
        label: 'SFTP',
        icon: (
          <div className="relative">
            <Server size={18} className="text-emerald-600" />
            <Lock size={9} className="text-emerald-700 absolute -right-1 -bottom-1 bg-bg-card rounded-sm" />
          </div>
        ),
        badgeIcon: <Shield size={10} />,
        bgClass: 'bg-emerald-500/10',
      }
  }
}

export function getDestinationSummary(dest: BackupDestination): string {
  switch (dest.type) {
    case 's3': {
      const parts: string[] = []
      if (dest.bucket) parts.push(dest.bucket)
      if (dest.path_prefix) parts.push('/' + dest.path_prefix.replace(/^\/+/, ''))
      return parts.join('') || dest.endpoint || 'S3'
    }
    case 'ftp': {
      const host = dest.host || ''
      const prefix = dest.path_prefix ? '/' + dest.path_prefix.replace(/^\/+/, '') : ''
      return `${dest.username}@${host}${dest.port !== 21 ? ':' + dest.port : ''}${prefix}`
    }
    case 'sftp': {
      const host = dest.host || ''
      const prefix = dest.path_prefix ? '/' + dest.path_prefix.replace(/^\/+/, '') : ''
      return `${dest.username}@${host}${dest.port !== 22 ? ':' + dest.port : ''}${prefix}`
    }
  }
}

function buildTestPayloadFromDest(dest: BackupDestination): BackupDestinationCreateInput {
  const common = {
    name: dest.name,
    path_prefix: dest.path_prefix || '',
  }
  switch (dest.type) {
    case 's3':
      return {
        type: 's3',
        ...common,
        access_key: '****',
        secret_key: '****',
        endpoint: dest.endpoint,
        region: dest.region,
        bucket: dest.bucket,
        sse: dest.sse,
      }
    case 'ftp':
      return {
        type: 'ftp',
        ...common,
        host: dest.host,
        port: dest.port,
        username: dest.username,
        password: '****',
        use_tls: dest.use_tls,
      }
    case 'sftp':
      return {
        type: 'sftp',
        ...common,
        host: dest.host,
        port: dest.port,
        username: dest.username,
        password: dest.password_enc ? '****' : '',
        private_key: dest.private_key_enc ? '****' : '',
      }
  }
}

interface DestinationCardProps {
  dest: BackupDestination
  onEdit: () => void
  onDelete: () => void
}

export function DestinationCard({ dest, onEdit, onDelete }: DestinationCardProps) {
  const { t } = useI18n()
  const { formatRelativeTime } = useFormat()
  const [testing, setTesting] = useState(false)

  const typeMeta = getDestinationMeta(dest.type)

  const summary = getDestinationSummary(dest)
  const lastTestOk = (dest as BackupDestination & { last_test_ok?: boolean | null }).last_test_ok
  const lastTestAt = (dest as BackupDestination & { last_test_at?: number | null }).last_test_at

  const testMutation = useMutation({
    mutationFn: async () => {
      setTesting(true)
      try {
        const payload = buildTestPayloadFromDest(dest)
        return await backupDestinationsApi.test({ ...payload, id: dest.id })
      } finally {
        setTesting(false)
      }
    },
    onSuccess: (res) => {
      if (res.ok) {
        toast({ type: 'success', title: t('remoteBackup.testSuccess'), description: t('remoteBackup.testSuccessDetail') })
      } else {
        toast({ type: 'error', title: t('remoteBackup.testFailed'), description: res.error || t('remoteBackup.testFailedDetail') })
      }
    },
    onError: (err) => {
      toast({
        type: 'error',
        title: t('remoteBackup.testFailed'),
        description: err instanceof Error ? err.message : t('common.unknownError'),
      })
    },
  })

  return (
    <div className="rounded-xl border border-border bg-bg-card hover:border-accent/30 hover:shadow-sm transition-all p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${typeMeta.bgClass}`}
        >
          {typeMeta.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-fg truncate">{dest.name}</h3>
            <Badge variant="muted" className="text-[10px] gap-1">
              {typeMeta.badgeIcon}
              {typeMeta.label}
            </Badge>
          </div>
          <p className="text-[11px] text-fg-muted mt-1 truncate" title={summary}>
            {summary || '\u00A0'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {lastTestAt ? (
          <Badge variant={lastTestOk ? 'success' : 'danger'} className="gap-1 text-[10px]">
            <Zap size={10} />
            {lastTestOk ? t('remoteBackup.statusOk') : t('remoteBackup.statusFailed')}
            <span className="text-fg-muted font-normal">
              · {formatRelativeTime(lastTestAt)}
            </span>
          </Badge>
        ) : (
          <Badge variant="muted" className="text-[10px]">
            {t('remoteBackup.testNotRun')}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-1.5 pt-1 border-t border-border mt-auto">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => testMutation.mutate()}
          loading={testing || testMutation.isPending}
          disabled={testing || testMutation.isPending}
        >
          <Zap size={13} />
          {t('remoteBackup.testConnection')}
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
          title={t('common.delete')}
          aria-label={t('common.delete')}
          className="text-danger hover:text-danger"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  )
}
