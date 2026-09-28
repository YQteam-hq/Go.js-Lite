import React, { useState, useEffect } from 'react'
import { FolderOpen, Database, CheckCircle2, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { deployApi } from '@/api/deploy'
import { useI18n } from '@/hooks/useI18n'
import { APP_ICONS, Rocket } from './AppIcons'
import type { DeployAppInfo, DeployRunResult } from '@shared/types'

interface DeployModalProps {
  selected: DeployAppInfo | null
  onClose: () => void
}

export function DeployModal({ selected, onClose }: DeployModalProps) {
  const { t } = useI18n()
  const [targetDir, setTargetDir] = useState('')
  const [dbHost, setDbHost] = useState('')
  const [dbName, setDbName] = useState('')
  const [dbUser, setDbUser] = useState('')
  const [dbPass, setDbPass] = useState('')
  const [dbPrefix, setDbPrefix] = useState('')
  const [overwrite, setOverwrite] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [result, setResult] = useState<DeployRunResult | null>(null)

  useEffect(() => {
    if (selected) {
      setTargetDir(`/${selected.id}`)
    }
  }, [selected])

  const handleSubmit = async () => {
    if (!selected) return
    setDeploying(true)
    setResult(null)
    try {
      const res = await deployApi.run({
        app_id: selected.id,
        target_dir: targetDir,
        db_host: dbHost || undefined,
        db_name: dbName || undefined,
        db_user: dbUser || undefined,
        db_pass: dbPass || undefined,
        db_prefix: dbPrefix || undefined,
        overwrite,
      })
      setResult(res)
      toast({ type: 'success', title: t('deploy.deploySuccess') })
    } catch (e) {
      toast({
        type: 'error',
        title: t('deploy.deployFailed'),
        description: e instanceof Error ? e.message : undefined,
      })
    } finally {
      setDeploying(false)
    }
  }

  const handleClose = () => {
    if (deploying) return
    onClose()
    setResult(null)
    setTargetDir('')
    setDbHost('')
    setDbName('')
    setDbUser('')
    setDbPass('')
    setDbPrefix('')
    setOverwrite(false)
  }

  const resultIcon = result?.db_configured ? CheckCircle2 : AlertCircle

  return (
    <Modal
      open={selected !== null}
      onClose={handleClose}
      size="md"
      title={
        selected ? (
          <span className="flex items-center gap-2">
            {(() => {
              const Icon = APP_ICONS[selected.id] ?? Rocket
              return <Icon size={18} className="text-accent" />
            })()}
            {t('deploy.deploy')} · {t(selected.name_key)}
          </span>
        ) : undefined
      }
      footer={
        result ? (
          <Button variant="secondary" onClick={handleClose}>
            {t('common.close')}
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={handleClose} disabled={deploying}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit} loading={deploying}>
              {deploying ? t('deploy.deploying') : t('deploy.deploy')}
            </Button>
          </>
        )
      }
    >
      {selected && (
        <div className="space-y-4">
          {result ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 rounded-lg border border-success/30 bg-success/10 p-3">
                {React.createElement(resultIcon, { size: 16, className: 'shrink-0 mt-0.5 text-success' })}
                <div className="text-xs text-fg leading-relaxed">
                  <div className="font-semibold">{t(result.next_step_key)}</div>
                  <div className="mt-1">{t('deploy.deployingTo', { dir: `/${result.target_dir}` })}</div>
                  {result.db_configured === false && (
                    <div className="mt-1 opacity-80">{t('deploy.dbOptional')}</div>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-lg border border-border bg-bg-sunken p-3">
                <FolderOpen size={16} className="shrink-0 mt-0.5 text-fg-muted" />
                <div className="text-xs text-fg leading-relaxed break-all">
                  {t('deploy.targetDir')}：<span className="font-mono">/{result.target_dir}</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs text-fg-muted font-medium">{t('deploy.targetDir')}</label>
                <Input
                  className="mt-1.5"
                  value={targetDir}
                  onChange={(e) => setTargetDir(e.target.value)}
                  placeholder={`/${selected.id}`}
                  icon={<FolderOpen size={15} />}
                />
                <p className="text-[11px] text-fg-subtle mt-1">
                  {t('deploy.targetHint', { app: selected.id })}
                </p>
              </div>

              {selected.db_required && (
                <div className="space-y-3 rounded-xl border border-border p-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-fg-muted">
                    <Database size={14} />
                    {t('deploy.dbOptional')}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-fg-muted">{t('deploy.dbHost')}</label>
                      <Input
                        className="mt-1"
                        value={dbHost}
                        onChange={(e) => setDbHost(e.target.value)}
                        placeholder="localhost"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-fg-muted">{t('deploy.dbName')}</label>
                      <Input
                        className="mt-1"
                        value={dbName}
                        onChange={(e) => setDbName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-fg-muted">{t('deploy.dbUser')}</label>
                      <Input
                        className="mt-1"
                        value={dbUser}
                        onChange={(e) => setDbUser(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-fg-muted">{t('deploy.dbPass')}</label>
                      <Input
                        type="password"
                        className="mt-1"
                        value={dbPass}
                        onChange={(e) => setDbPass(e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs text-fg-muted">{t('deploy.dbPrefix')}</label>
                      <Input
                        className="mt-1"
                        value={dbPrefix}
                        onChange={(e) => setDbPrefix(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              <label className="flex items-start gap-2.5 text-xs text-fg-muted cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="mt-0.5 accent-[var(--accent)]"
                  checked={overwrite}
                  onChange={(e) => setOverwrite(e.target.checked)}
                />
                <span>{t('deploy.overwrite')}</span>
              </label>
            </>
          )}
        </div>
      )}
    </Modal>
  )
}
