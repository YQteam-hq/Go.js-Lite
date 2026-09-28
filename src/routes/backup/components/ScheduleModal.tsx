import { useState, useEffect, useCallback, useMemo } from 'react'
import { useI18n } from '@/hooks/useI18n'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { AlertTriangle, Power, Clock, FileArchive, Cloud, Shield, Database, Settings as SettingsIcon } from 'lucide-react'
import { ScopeCheckbox } from './ScopeCheckbox'
import { getDestinationMeta, getDestinationSummary } from './DestinationCard'
import { CRON_PRESETS, SCHEDULE_MODAL_TABS } from '../types'
import { DEFAULT_EXCLUDE_DIRS } from '../types'
import type { ScheduleModalTab } from '../types'
import type { BackupSchedule, BackupDestination } from '@shared/types'
import type { BackupScheduleCreateInput } from '@/api/backup'

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

interface ScheduleModalProps {
  open: boolean
  editing: BackupSchedule | null
  destinations: BackupDestination[]
  runImmediately: boolean
  onRunImmediatelyChange: (v: boolean) => void
  onClose: () => void
  onSave: (data: BackupScheduleCreateInput) => void
  saving: boolean
  isEdit: boolean
}

export function ScheduleModal({
  open,
  editing,
  destinations,
  runImmediately,
  onRunImmediatelyChange,
  onClose,
  onSave,
  saving,
  isEdit,
}: ScheduleModalProps) {
  const { t } = useI18n()
  const [tab, setTab] = useState<ScheduleModalTab>('general')

  const [name, setName] = useState('')
  const [enabled, setEnabled] = useState(true)

  const [cronPreset, setCronPreset] = useState('daily')
  const [cronMin, setCronMin] = useState('0')
  const [cronHour, setCronHour] = useState('2')
  const [cronDom, setCronDom] = useState('*')
  const [cronMonth, setCronMonth] = useState('*')
  const [cronDow, setCronDow] = useState('*')

  const [includeFiles, setIncludeFiles] = useState(true)
  const [includeDb, setIncludeDb] = useState(true)
  const [includeConfig, setIncludeConfig] = useState(true)
  const [excludeDirsText, setExcludeDirsText] = useState(DEFAULT_EXCLUDE_DIRS)

  const [selectedDests, setSelectedDests] = useState<string[]>([])

  const [keepLast, setKeepLast] = useState<number | ''>(30)
  const [keepDaily, setKeepDaily] = useState<number | ''>(7)
  const [keepWeekly, setKeepWeekly] = useState<number | ''>(4)
  const [keepMonthly, setKeepMonthly] = useState<number | ''>(6)

  const cronExpr =
    cronPreset === 'custom'
      ? [cronMin, cronHour, cronDom, cronMonth, cronDow].map((s) => s.trim() || '*').join(' ')
      : (CRON_PRESETS.find((p) => p.key === cronPreset)?.expr ?? '0 2 * * *')

  const resetForms = useCallback(() => {
    if (editing) {
      setName(editing.name)
      setEnabled(!!editing.enabled)
      const existing = CRON_PRESETS.find((p) => p.expr === editing.cron_expr)
      if (existing) {
        setCronPreset(existing.key)
      } else {
        setCronPreset('custom')
        const parts = editing.cron_expr.split(/\s+/)
        setCronMin(parts[0] ?? '0')
        setCronHour(parts[1] ?? '2')
        setCronDom(parts[2] ?? '*')
        setCronMonth(parts[3] ?? '*')
        setCronDow(parts[4] ?? '*')
      }
      setIncludeFiles(!!editing.source?.include_files)
      setIncludeDb(!!editing.source?.include_db)
      setIncludeConfig(!!editing.source?.include_config)
      setExcludeDirsText((editing.source?.exclude_dirs ?? []).join(', '))
      setSelectedDests([...(editing.destination_ids ?? [])])
      setKeepLast((editing.retention?.keep_last ?? 0) || '')
      setKeepDaily((editing.retention?.keep_daily ?? 0) || '')
      setKeepWeekly((editing.retention?.keep_weekly ?? 0) || '')
      setKeepMonthly((editing.retention?.keep_monthly ?? 0) || '')
    } else {
      setName('')
      setEnabled(true)
      setCronPreset('daily')
      setCronMin('0')
      setCronHour('2')
      setCronDom('*')
      setCronMonth('*')
      setCronDow('*')
      setIncludeFiles(true)
      setIncludeDb(true)
      setIncludeConfig(true)
      setExcludeDirsText(DEFAULT_EXCLUDE_DIRS)
      setSelectedDests([])
      setKeepLast(30)
      setKeepDaily(7)
      setKeepWeekly(4)
      setKeepMonthly(6)
    }
    setTab('general')
  }, [editing])

  useEffect(() => {
    if (open) resetForms()
  }, [open, editing?.id, resetForms])

  const humanReadable = useMemo(() => {
    if (cronExpr === '0 2 * * *') return `Daily at 02:00`
    if (cronExpr === '0 0 * * 0') return `Weekly on Sunday 00:00`
    if (cronExpr === '0 0 1 * *') return `Monthly on day 1 00:00`
    if (cronExpr === '0 */6 * * *') return `Every 6 hours`
    return cronExpr
  }, [cronExpr])

  const canSave =
    name.trim().length > 0 &&
    (includeFiles || includeDb || includeConfig) &&
    selectedDests.length > 0 &&
    !saving

  const handleSave = () => {
    if (!canSave) return
    const payload: BackupScheduleCreateInput = {
      name: name.trim(),
      enabled,
      cron_expr: cronExpr,
      destination_ids: selectedDests,
      source: {
        include_files: includeFiles,
        include_db: includeDb,
        include_config: includeConfig,
        exclude_dirs: excludeDirsText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      },
      retention: {
        keep_last: typeof keepLast === 'number' ? keepLast : 0,
        keep_daily: typeof keepDaily === 'number' ? keepDaily : 0,
        keep_weekly: typeof keepWeekly === 'number' ? keepWeekly : 0,
        keep_monthly: typeof keepMonthly === 'number' ? keepMonthly : 0,
      },
    }
    onSave(payload)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? t('remoteBackup.editSchedule') : t('remoteBackup.createSchedule')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs text-fg-muted">
            <input
              type="checkbox"
              checked={runImmediately}
              onChange={(e) => onRunImmediatelyChange(e.target.checked)}
              className="accent-accent"
            />
            {t('remoteBackup.runImmediatelyAfterSave')}
          </label>
          <Button onClick={handleSave} loading={saving} disabled={!canSave}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex gap-0.5 p-1 bg-bg-sunken rounded-lg overflow-x-auto">
          {SCHEDULE_MODAL_TABS.map((tk) => (
            <button
              key={tk}
              onClick={() => setTab(tk)}
              className={`flex-1 min-w-[90px] flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
                tab === tk ? 'bg-bg-card text-fg shadow-sm' : 'text-fg-muted hover:text-fg'
              }`}
            >
              {tk === 'general' && <Power size={11} />}
              {tk === 'schedule' && <Clock size={11} />}
              {tk === 'source' && <FileArchive size={11} />}
              {tk === 'destinations' && <Cloud size={11} />}
              {tk === 'retention' && <Shield size={11} />}
              {t(`remoteBackup.tab${tk.charAt(0).toUpperCase() + tk.slice(1)}`)}
            </button>
          ))}
        </div>

        {tab === 'general' && (
          <div className="space-y-3">
            <FormField label={t('remoteBackup.scheduleName')} required>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Daily full backup"
              />
            </FormField>
            <div className="flex items-center gap-2.5">
              <label className="inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                />
                <div className="w-9 h-5 bg-border rounded-full peer peer-checked:bg-accent transition-colors relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 shadow-sm"></div>
              </label>
              <span className="text-xs font-medium text-fg">{t('remoteBackup.enabled')}</span>
            </div>
          </div>
        )}

        {tab === 'schedule' && (
          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-medium text-fg mb-1.5">{t('remoteBackup.cronExpr')}</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {CRON_PRESETS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setCronPreset(p.key)}
                    className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                      cronPreset === p.key
                        ? 'bg-accent text-white shadow-sm'
                        : 'bg-bg-sunken text-fg-muted hover:text-fg hover:bg-bg-card'
                    }`}
                  >
                    {t(`remoteBackup.${p.label_key}`)}
                  </button>
                ))}
              </div>
            </div>

            {cronPreset === 'custom' && (
              <div className="grid grid-cols-5 gap-2">
                {[
                  { label: 'Min', value: cronMin, onChange: setCronMin, ph: '0-59' },
                  { label: 'Hour', value: cronHour, onChange: setCronHour, ph: '0-23' },
                  { label: 'Dom', value: cronDom, onChange: setCronDom, ph: '1-31' },
                  { label: 'Month', value: cronMonth, onChange: setCronMonth, ph: '1-12' },
                  { label: 'Dow', value: cronDow, onChange: setCronDow, ph: '0-7' },
                ].map((f, i) => (
                  <div key={i}>
                    <label className="block text-[10px] text-fg-subtle mb-1">{f.label}</label>
                    <Input value={f.value} onChange={(e) => f.onChange(e.target.value)} placeholder={f.ph} className="!py-1.5 text-[11px]" />
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-lg border border-border bg-bg-sunken/50 px-3 py-2.5 space-y-1.5">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-fg-subtle font-medium">{t('remoteBackup.cronExpr')}:</span>
                <code className="font-mono text-fg">{cronExpr}</code>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-fg-subtle font-medium">{t('remoteBackup.cronHumanPreview')}:</span>
                <span className="text-fg">{humanReadable}</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'source' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <ScopeCheckbox
                checked={includeFiles}
                onChange={setIncludeFiles}
                icon={<FileArchive size={16} />}
                title={t('remoteBackup.sourceFiles')}
                desc="Back up web root files and directories"
              />
              <ScopeCheckbox
                checked={includeDb}
                onChange={setIncludeDb}
                icon={<Database size={16} />}
                title={t('remoteBackup.sourceDb')}
                desc="Export all configured databases"
              />
              <ScopeCheckbox
                checked={includeConfig}
                onChange={setIncludeConfig}
                icon={<SettingsIcon size={16} />}
                title={t('remoteBackup.sourceConfig')}
                desc="Include panel configuration in backup"
              />
            </div>
            <FormField label={t('remoteBackup.sourceExclude')}>
              <Input
                value={excludeDirsText}
                onChange={(e) => setExcludeDirsText(e.target.value)}
                placeholder={DEFAULT_EXCLUDE_DIRS}
              />
            </FormField>
            {!includeFiles && !includeDb && !includeConfig && (
              <div className="flex items-start gap-2 text-xs text-danger bg-danger/5 border border-danger/20 rounded-lg px-3 py-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>No source selected</span>
              </div>
            )}
          </div>
        )}

        {tab === 'destinations' && (
          <div className="space-y-3">
            {destinations.length === 0 ? (
              <div className="rounded-lg border border-warning/20 bg-warning/5 px-3 py-2.5 flex items-start gap-2.5">
                <AlertTriangle size={14} className="text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-fg">{t('remoteBackup.noDestsSelected')}</p>
                  <button
                    onClick={() => {
                      document.dispatchEvent(new CustomEvent('backup:switch-tab', { detail: 'destinations' }))
                    }}
                    className="text-[11px] text-accent hover:underline mt-0.5"
                  >
                    {t('remoteBackup.goCreateDestinations')} →
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                {destinations.map((d) => {
                  const checked = selectedDests.includes(d.id)
                  return (
                    <label
                      key={d.id}
                      className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                        checked ? 'border-accent/40 bg-accent/5' : 'border-border hover:bg-fg/5'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setSelectedDests((prev) =>
                            prev.includes(d.id) ? prev.filter((x) => x !== d.id) : [...prev, d.id]
                          )
                        }
                        className="mt-0.5 accent-accent"
                      />
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${getDestinationMeta(d.type).bgClass}`}>
                        <span className="scale-[0.75]">{getDestinationMeta(d.type).icon}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-fg truncate">{d.name}</p>
                        <p className="text-[10px] text-fg-subtle truncate">
                          {getDestinationSummary(d)}
                        </p>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}
            {selectedDests.length === 0 && destinations.length > 0 && (
              <div className="flex items-start gap-2 text-xs text-warning bg-warning/5 border border-warning/20 rounded-lg px-3 py-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>{t('remoteBackup.noDestsSelected')}</span>
              </div>
            )}
          </div>
        )}

        {tab === 'retention' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label={t('remoteBackup.keepLast')}>
              <Input
                type="number"
                min={0}
                value={keepLast}
                onChange={(e) => setKeepLast(e.target.value === '' ? '' : Math.max(0, Number(e.target.value) || 0))}
                placeholder="0 = disable"
              />
            </FormField>
            <FormField label={t('remoteBackup.keepDaily')}>
              <Input
                type="number"
                min={0}
                value={keepDaily}
                onChange={(e) => setKeepDaily(e.target.value === '' ? '' : Math.max(0, Number(e.target.value) || 0))}
                placeholder="0 = disable"
              />
            </FormField>
            <FormField label={t('remoteBackup.keepWeekly')}>
              <Input
                type="number"
                min={0}
                value={keepWeekly}
                onChange={(e) => setKeepWeekly(e.target.value === '' ? '' : Math.max(0, Number(e.target.value) || 0))}
                placeholder="0 = disable"
              />
            </FormField>
            <FormField label={t('remoteBackup.keepMonthly')}>
              <Input
                type="number"
                min={0}
                value={keepMonthly}
                onChange={(e) => setKeepMonthly(e.target.value === '' ? '' : Math.max(0, Number(e.target.value) || 0))}
                placeholder="0 = disable"
              />
            </FormField>
          </div>
        )}
      </div>
    </Modal>
  )
}
