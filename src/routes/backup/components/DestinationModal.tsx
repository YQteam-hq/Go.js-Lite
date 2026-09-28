import { useState, useEffect, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Zap, AlertTriangle, Cloud, Server, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { backupDestinationsApi } from '@/api/backupDestinations'
import type { BackupDestinationCreateInput, BackupDestinationUpdateInput } from '@/api/backupDestinations'
import { toast } from '@/components/ui/Toast'
import { useI18n } from '@/hooks/useI18n'
import type { BackupDestination } from '@shared/types'
import type { DestinationModalType } from '../types'

interface FormFieldProps {
  label: string
  children: React.ReactNode
  required?: boolean
  className?: string
}

function FormField({ label, children, required, className = '' }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-[11px] font-medium text-fg mb-1.5">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

interface DestinationModalProps {
  open: boolean
  editing: BackupDestination | null
  onClose: () => void
}

export function DestinationModal({ open, editing, onClose }: DestinationModalProps) {
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const isEdit = !!editing

  const [typeTab, setTypeTab] = useState<DestinationModalType>(isEdit ? editing.type : 's3')

  const [s3Form, setS3Form] = useState({
    name: '',
    access_key: '',
    secret_key: '',
    endpoint: 's3.amazonaws.com',
    region: 'us-east-1',
    bucket: '',
    path_prefix: '',
    sse: false,
  })

  const [ftpForm, setFtpForm] = useState({
    name: '',
    host: '',
    port: 21,
    username: '',
    password: '',
    path_prefix: '',
    use_tls: false,
  })

  const [sftpForm, setSftpForm] = useState({
    name: '',
    host: '',
    port: 22,
    username: '',
    password: '',
    private_key: '',
    path_prefix: '',
  })

  const [saveAnyway, setSaveAnyway] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message?: string } | null>(null)
  const [testing, setTesting] = useState(false)

  const resetForms = useCallback(() => {
    if (isEdit && editing) {
      setTypeTab(editing.type)
      if (editing.type === 's3') {
        setS3Form({
          name: editing.name,
          access_key: editing.access_key_enc ? '****' : '',
          secret_key: editing.secret_key_enc ? '****' : '',
          endpoint: editing.endpoint,
          region: editing.region || 'us-east-1',
          bucket: editing.bucket,
          path_prefix: editing.path_prefix || '',
          sse: !!editing.sse,
        })
      } else if (editing.type === 'ftp') {
        setFtpForm({
          name: editing.name,
          host: editing.host,
          port: editing.port,
          username: editing.username,
          password: editing.password_enc ? '****' : '',
          path_prefix: editing.path_prefix || '',
          use_tls: !!editing.use_tls,
        })
      } else if (editing.type === 'sftp') {
        setSftpForm({
          name: editing.name,
          host: editing.host,
          port: editing.port,
          username: editing.username,
          password: editing.password_enc ? '****' : '',
          private_key: editing.private_key_enc ? '****' : '',
          path_prefix: editing.path_prefix || '',
        })
      }
    } else {
      setS3Form({ name: '', access_key: '', secret_key: '', endpoint: 's3.amazonaws.com', region: 'us-east-1', bucket: '', path_prefix: '', sse: false })
      setFtpForm({ name: '', host: '', port: 21, username: '', password: '', path_prefix: '', use_tls: false })
      setSftpForm({ name: '', host: '', port: 22, username: '', password: '', private_key: '', path_prefix: '' })
    }
    setSaveAnyway(false)
    setTestResult(null)
    setTesting(false)
  }, [isEdit, editing])

  useEffect(() => {
    if (open) resetForms()
  }, [open, editing?.id, resetForms])

  const collectPayload = (): BackupDestinationCreateInput | null => {
    if (typeTab === 's3') {
      const f = s3Form
      if (!f.name || !f.bucket) return null
      if (!isEdit && (!f.access_key || !f.secret_key)) return null
      return { type: 's3', ...f }
    }
    if (typeTab === 'ftp') {
      const f = ftpForm
      if (!f.name || !f.host || !f.username) return null
      return { type: 'ftp', ...f }
    }
    if (typeTab === 'sftp') {
      const f = sftpForm
      if (!f.name || !f.host || !f.username) return null
      return { type: 'sftp', ...f }
    }
    return null
  }

  const testMutation = useMutation({
    mutationFn: async () => {
      const payload = collectPayload()
      if (!payload) throw new Error(t('common.requiredFields'))
      setTesting(true)
      setTestResult(null)
      try {
        const res = await backupDestinationsApi.test(
          isEdit && editing ? { ...payload, id: editing.id } : payload,
        )
        setTestResult({ ok: res.ok, message: res.error })
        if (res.ok) {
          toast({ type: 'success', title: t('remoteBackup.testSuccess'), description: t('remoteBackup.testSuccessDetail') })
        } else {
          toast({ type: 'error', title: t('remoteBackup.testFailed'), description: res.error || t('remoteBackup.testFailedDetail') })
        }
        return res
      } finally {
        setTesting(false)
      }
    },
    onError: (err) => {
      setTestResult({ ok: false, message: err instanceof Error ? err.message : t('common.unknownError') })
      toast({
        type: 'error',
        title: t('remoteBackup.testFailed'),
        description: err instanceof Error ? err.message : t('common.unknownError'),
      })
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = collectPayload()
      if (!payload) throw new Error(t('common.requiredFields'))
      if (isEdit && editing) {
        return await backupDestinationsApi.update(editing.id, payload as unknown as BackupDestinationUpdateInput)
      }
      return await backupDestinationsApi.create(payload)
    },
    onSuccess: () => {
      toast({ type: 'success', title: isEdit ? t('remoteBackup.updated') : t('remoteBackup.created') })
      queryClient.invalidateQueries({ queryKey: ['backup-destinations'] })
      onClose()
    },
    onError: (err) => {
      toast({
        type: 'error',
        title: t('common.saveFailed'),
        description: err instanceof Error ? err.message : t('common.unknownError'),
      })
    },
  })

  const canTest = !!collectPayload()
  const canSave = canTest && (saveAnyway || (testResult && testResult.ok))

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? t('remoteBackup.editDestination') : t('remoteBackup.newDestination')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => testMutation.mutate()}
            loading={testing || testMutation.isPending}
            disabled={!canTest || testing || testMutation.isPending}
          >
            <Zap size={14} />
            {t('remoteBackup.testConnection')}
          </Button>
          <Button
            onClick={() => saveMutation.mutate()}
            loading={saveMutation.isPending}
            disabled={!canSave || saveMutation.isPending}
          >
            {t('common.save')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex gap-1 p-1 bg-bg-sunken rounded-lg">
          {(
            [
              { key: 's3', label: t('remoteBackup.destinationTypeS3'), icon: <Cloud size={13} /> },
              { key: 'ftp', label: t('remoteBackup.destinationTypeFtp'), icon: <Server size={13} /> },
              { key: 'sftp', label: t('remoteBackup.destinationTypeSftp'), icon: <Shield size={13} /> },
            ] as Array<{ key: DestinationModalType; label: string; icon: React.ReactNode }>
          ).map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => {
                if (!isEdit) {
                  setTypeTab(key)
                  setTestResult(null)
                }
              }}
              disabled={isEdit}
              className={`
                flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all
                ${typeTab === key
                  ? 'bg-bg-card text-fg shadow-sm'
                  : 'text-fg-muted hover:text-fg disabled:opacity-50 disabled:cursor-not-allowed'}
              `}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden font-semibold uppercase">{key}</span>
            </button>
          ))}
        </div>

        {typeTab === 's3' && (
          <div className="space-y-3">
            <FormField label="Name" required>
              <Input
                value={s3Form.name}
                onChange={(e) => setS3Form({ ...s3Form, name: e.target.value })}
                placeholder="My S3 Backup"
              />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label={t('remoteBackup.s3AccessKeyId')} required>
                <Input
                  value={s3Form.access_key}
                  onChange={(e) => setS3Form({ ...s3Form, access_key: e.target.value })}
                  placeholder="AKIA..."
                />
              </FormField>
              <FormField label={t('remoteBackup.s3SecretKey')} required>
                <Input
                  type="password"
                  value={s3Form.secret_key}
                  onChange={(e) => setS3Form({ ...s3Form, secret_key: e.target.value })}
                  placeholder="••••••••••••••••"
                />
              </FormField>
            </div>
            <FormField label={t('remoteBackup.s3Endpoint')}>
              <Input
                value={s3Form.endpoint}
                onChange={(e) => setS3Form({ ...s3Form, endpoint: e.target.value })}
                placeholder="s3.amazonaws.com"
              />
              <p className="text-[10px] text-fg-subtle mt-1 leading-relaxed">{t('remoteBackup.s3EndpointHint')}</p>
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label={t('remoteBackup.s3Region')}>
                <Input
                  value={s3Form.region}
                  onChange={(e) => setS3Form({ ...s3Form, region: e.target.value })}
                  placeholder="us-east-1"
                />
              </FormField>
              <FormField label={t('remoteBackup.s3Bucket')} required>
                <Input
                  value={s3Form.bucket}
                  onChange={(e) => setS3Form({ ...s3Form, bucket: e.target.value })}
                  placeholder="my-backup-bucket"
                />
              </FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label={t('remoteBackup.s3PathPrefix')}>
                <Input
                  value={s3Form.path_prefix}
                  onChange={(e) => setS3Form({ ...s3Form, path_prefix: e.target.value })}
                  placeholder="backups/gojs"
                />
              </FormField>
              <div className="flex items-end pb-2">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={s3Form.sse}
                    onChange={(e) => setS3Form({ ...s3Form, sse: e.target.checked })}
                    className="accent-accent"
                  />
                  <span className="text-xs font-medium text-fg">{t('remoteBackup.s3Sse')}</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {typeTab === 'ftp' && (
          <div className="space-y-3">
            <FormField label="Name" required>
              <Input
                value={ftpForm.name}
                onChange={(e) => setFtpForm({ ...ftpForm, name: e.target.value })}
                placeholder="My FTP Server"
              />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField label={t('remoteBackup.ftpHost')} required className="sm:col-span-2">
                <Input
                  value={ftpForm.host}
                  onChange={(e) => setFtpForm({ ...ftpForm, host: e.target.value })}
                  placeholder="ftp.example.com"
                />
              </FormField>
              <FormField label={t('remoteBackup.ftpPort')}>
                <Input
                  type="number"
                  value={ftpForm.port}
                  onChange={(e) => setFtpForm({ ...ftpForm, port: Number(e.target.value) || 21 })}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label={t('remoteBackup.ftpUser')} required>
                <Input
                  value={ftpForm.username}
                  onChange={(e) => setFtpForm({ ...ftpForm, username: e.target.value })}
                  placeholder="ftpuser"
                />
              </FormField>
              <FormField label={t('remoteBackup.ftpPass')}>
                <Input
                  type="password"
                  value={ftpForm.password}
                  onChange={(e) => setFtpForm({ ...ftpForm, password: e.target.value })}
                  placeholder="••••••••"
                />
              </FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label={t('remoteBackup.ftpRemotePath')}>
                <Input
                  value={ftpForm.path_prefix}
                  onChange={(e) => setFtpForm({ ...ftpForm, path_prefix: e.target.value })}
                  placeholder="/backups/gojs"
                />
              </FormField>
              <div className="flex items-end pb-2">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={ftpForm.use_tls}
                    onChange={(e) => setFtpForm({ ...ftpForm, use_tls: e.target.checked })}
                    className="accent-accent"
                  />
                  <span className="text-xs font-medium text-fg">{t('remoteBackup.ftpUseTls')}</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {typeTab === 'sftp' && (
          <div className="space-y-3">
            <FormField label="Name" required>
              <Input
                value={sftpForm.name}
                onChange={(e) => setSftpForm({ ...sftpForm, name: e.target.value })}
                placeholder="My SFTP Server"
              />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField label={t('remoteBackup.sftpHost')} required className="sm:col-span-2">
                <Input
                  value={sftpForm.host}
                  onChange={(e) => setSftpForm({ ...sftpForm, host: e.target.value })}
                  placeholder="sftp.example.com"
                />
              </FormField>
              <FormField label={t('remoteBackup.sftpPort')}>
                <Input
                  type="number"
                  value={sftpForm.port}
                  onChange={(e) => setSftpForm({ ...sftpForm, port: Number(e.target.value) || 22 })}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label={t('remoteBackup.sftpUser')} required>
                <Input
                  value={sftpForm.username}
                  onChange={(e) => setSftpForm({ ...sftpForm, username: e.target.value })}
                  placeholder="root"
                />
              </FormField>
              <FormField label={t('remoteBackup.sftpPass')}>
                <Input
                  type="password"
                  value={sftpForm.password}
                  onChange={(e) => setSftpForm({ ...sftpForm, password: e.target.value })}
                  placeholder="••••••••"
                />
              </FormField>
            </div>
            <FormField label={t('remoteBackup.sftpPrivateKey')}>
              <textarea
                value={sftpForm.private_key}
                onChange={(e) => setSftpForm({ ...sftpForm, private_key: e.target.value })}
                rows={5}
                placeholder="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
                className="w-full rounded-md border border-border bg-bg-card px-3 py-2 text-xs font-mono text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40"
              />
              <p className="text-[10px] text-fg-subtle mt-1 leading-relaxed">{t('remoteBackup.sftpPrivateKeyHint')}</p>
            </FormField>
            <FormField label={t('remoteBackup.sftpRemotePath')}>
              <Input
                value={sftpForm.path_prefix}
                onChange={(e) => setSftpForm({ ...sftpForm, path_prefix: e.target.value })}
                placeholder="/var/backups/gojs"
              />
            </FormField>
          </div>
        )}

        {testResult && (
          <div
            className={`rounded-lg border px-3 py-2.5 flex items-start gap-2 text-xs ${
              testResult.ok
                ? 'bg-success/5 border-success/20 text-success'
                : 'bg-danger/5 border-danger/20 text-danger'
            }`}
          >
            {testResult.ok ? (
              <Badge variant="success" className="gap-1 shrink-0">
                <Zap size={10} />
                {t('remoteBackup.statusOk')}
              </Badge>
            ) : (
              <Badge variant="danger" className="gap-1 shrink-0">
                <AlertTriangle size={10} />
                {t('remoteBackup.statusFailed')}
              </Badge>
            )}
            <span className="text-fg-muted leading-relaxed break-all">
              {testResult.ok
                ? t('remoteBackup.testSuccessDetail')
                : testResult.message || t('remoteBackup.testFailedDetail')}
            </span>
          </div>
        )}

        <div className="flex items-start gap-2 rounded-lg border border-border bg-bg-sunken/50 px-3 py-2.5">
          <input
            type="checkbox"
            checked={saveAnyway}
            onChange={(e) => setSaveAnyway(e.target.checked)}
            className="mt-0.5 accent-accent"
          />
          <div>
            <label className="text-xs font-medium text-fg cursor-pointer select-none">
              {t('remoteBackup.saveAnyway')}
            </label>
            <p className="text-[10px] text-fg-subtle mt-0.5 leading-relaxed">
              {t('remoteBackup.saveAnywayHint')}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  )
}
