import { useState } from 'react'
import { ShieldAlert, Check } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useI18n } from '@/hooks/useI18n'
import { TYPE_OPTIONS } from '../utils'
import type { OperationLogAlertRule, NotificationChannel } from '@shared/types'

interface AlertRuleModalProps {
  open: boolean
  editingRule: OperationLogAlertRule | null
  ruleForm: Omit<OperationLogAlertRule, 'id'>
  channels: NotificationChannel[]
  savingRule: boolean
  onClose: () => void
  onRuleFormChange: (form: Omit<OperationLogAlertRule, 'id'>) => void
  onSave: () => void
  onTest: () => void
}

function ToggleInline({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
        checked ? 'bg-accent' : 'bg-fg/15'
      }`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export function AlertRuleModal({
  open,
  editingRule,
  ruleForm,
  channels,
  savingRule,
  onClose,
  onRuleFormChange,
  onSave,
  onTest,
}: AlertRuleModalProps) {
  const { t } = useI18n()
  const [alertTab, setAlertTab] = useState<'conditions' | 'channels'>('conditions')
  const [actionInOpen, setActionInOpen] = useState(false)
  const [actionNotInOpen, setActionNotInOpen] = useState(false)

  const hours = ruleForm.when.outside_hours_range ?? ''
  const [hoursFrom, hoursTo] = hours.includes('-') ? hours.split('-', 2) : ['', '']

  const toggleConditionAction = (list: 'in' | 'notin', action: string) => {
    onRuleFormChange(
      (prev => {
        const key = list === 'in' ? 'action_in' : 'action_not_in'
        const current = new Set(prev.when[key] ?? [])
        if (current.has(action)) current.delete(action)
        else current.add(action)
        const arr = Array.from(current)
        return {
          ...prev,
          when: {
            ...prev.when,
            [key]: arr.length > 0 ? arr : undefined,
          },
        }
      })(ruleForm)
    )
  }

  const setHours = (from: string, to: string) => {
    onRuleFormChange({
      ...ruleForm,
      when: {
        ...ruleForm.when,
        outside_hours_range: from && to ? `${from}-${to}` : undefined,
      },
    })
  }

  const toggleChannel = (channelId: string) => {
    onRuleFormChange({
      ...ruleForm,
      then: {
        ...ruleForm.then,
        channel_ids: (() => {
          const ids = new Set(ruleForm.then.channel_ids ?? [])
          if (ids.has(channelId)) ids.delete(channelId)
          else ids.add(channelId)
          return Array.from(ids)
        })(),
      },
    })
  }

  return (
    <Modal
      open={open}
      onClose={() => !savingRule && onClose()}
      size="lg"
      title={
        <span className="flex items-center gap-2">
          <ShieldAlert size={18} className="text-accent" />
          {editingRule ? t('oplog.enableRule') : t('oplog.newAlertRule')}
        </span>
      }
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={savingRule}
          >
            {t('common.cancel')}
          </Button>
          <Button variant="secondary" size="sm" onClick={onTest} disabled={savingRule}>
            {t('oplog.alertRuleTest')}
          </Button>
          <Button variant="primary" size="sm" onClick={onSave} loading={savingRule}>
            {t('common.save')}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-2">
        <div className="flex items-center gap-3">
          <Input
            placeholder={t('oplog.alertRuleName')}
            value={ruleForm.name}
            onChange={(e) => onRuleFormChange({ ...ruleForm, name: e.target.value })}
            className="flex-1"
          />
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-fg-muted">{t('oplog.alertRuleEnabled')}</span>
            <ToggleInline
              checked={ruleForm.enabled}
              onChange={(v) => onRuleFormChange({ ...ruleForm, enabled: v })}
              label={t('oplog.alertRuleEnabled')}
            />
          </div>
        </div>

        <div className="flex items-center gap-1 bg-bg-sunken p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setAlertTab('conditions')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              alertTab === 'conditions'
                ? 'bg-bg-elevated text-fg shadow-sm'
                : 'text-fg-muted hover:text-fg'
            }`}
          >
            {t('oplog.alertRuleConditionsTab')}
          </button>
          <button
            type="button"
            onClick={() => setAlertTab('channels')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              alertTab === 'channels'
                ? 'bg-bg-elevated text-fg shadow-sm'
                : 'text-fg-muted hover:text-fg'
            }`}
          >
            {t('oplog.alertRuleChannelsTab')}
          </button>
        </div>

        {alertTab === 'conditions' ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-border p-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-fg">
                  {t('oplog.alertRuleActionIn')}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setActionInOpen((v) => !v)
                    setActionNotInOpen(false)
                  }}
                  className="text-xs text-accent hover:underline"
                >
                  {(ruleForm.when.action_in?.length ?? 0) > 0
                    ? `${ruleForm.when.action_in?.length} ${t('common.selected')}`
                    : t('common.add')}
                </button>
              </div>
              {actionInOpen && (
                <div className="grid grid-cols-2 gap-1 max-h-48 overflow-auto">
                  {TYPE_OPTIONS.map((opt) => {
                    const sel = (ruleForm.when.action_in ?? []).includes(opt)
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleConditionAction('in', opt)}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left transition-colors ${
                          sel ? 'bg-accent/10 text-accent' : 'hover:bg-fg/5 text-fg-muted'
                        }`}
                      >
                        {sel && <Check size={12} />}
                        <span className="font-mono">{opt}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border p-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-fg">
                  {t('oplog.alertRuleActionNotIn')}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setActionNotInOpen((v) => !v)
                    setActionInOpen(false)
                  }}
                  className="text-xs text-accent hover:underline"
                >
                  {(ruleForm.when.action_not_in?.length ?? 0) > 0
                    ? `${ruleForm.when.action_not_in?.length} ${t('common.selected')}`
                    : t('common.add')}
                </button>
              </div>
              {actionNotInOpen && (
                <div className="grid grid-cols-2 gap-1 max-h-48 overflow-auto">
                  {TYPE_OPTIONS.map((opt) => {
                    const sel = (ruleForm.when.action_not_in ?? []).includes(opt)
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleConditionAction('notin', opt)}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left transition-colors ${
                          sel ? 'bg-accent/10 text-accent' : 'hover:bg-fg/5 text-fg-muted'
                        }`}
                      >
                        {sel && <Check size={12} />}
                        <span className="font-mono">{opt}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border p-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-fg">
                  {t('oplog.alertRuleIpNotWhitelisted')}
                </label>
                <ToggleInline
                  checked={Boolean(ruleForm.when.ip_not_in_whitelist)}
                  onChange={(v) =>
                    onRuleFormChange({
                      ...ruleForm,
                      when: { ...ruleForm.when, ip_not_in_whitelist: v ? true : undefined },
                    })
                  }
                  label={t('oplog.alertRuleIpNotWhitelisted')}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border p-3">
              <label className="block text-sm font-medium text-fg mb-2">
                {t('oplog.alertRuleOutsideHours')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={hoursFrom}
                  onChange={(e) => setHours(e.target.value, hoursTo)}
                  className="input-base h-9 px-3 rounded-lg text-sm"
                />
                <span className="text-fg-muted">—</span>
                <input
                  type="time"
                  value={hoursTo}
                  onChange={(e) => setHours(hoursFrom, e.target.value)}
                  className="input-base h-9 px-3 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="rounded-xl border border-border p-3">
              <label className="block text-sm font-medium text-fg mb-2">
                {t('oplog.alertRuleConsecFailN')}
              </label>
              <input
                type="number"
                min={1}
                value={ruleForm.when.consecutive_fail_login_gt_N ?? ''}
                onChange={(e) => {
                  const v = e.target.value === '' ? undefined : Number(e.target.value)
                  onRuleFormChange({
                    ...ruleForm,
                    when: {
                      ...ruleForm.when,
                      consecutive_fail_login_gt_N: v && v > 0 ? v : undefined,
                    },
                  })
                }}
                placeholder="5"
                className="input-base h-9 px-3 rounded-lg text-sm w-32"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-fg">
                {t('oplog.alertRuleSeverity')}
              </span>
              <div className="flex items-center gap-1">
                {(['info', 'warning', 'critical'] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() =>
                      onRuleFormChange({ ...ruleForm, then: { ...ruleForm.then, severity: sev } })
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      ruleForm.then.severity === sev
                        ? sev === 'critical'
                          ? 'bg-danger/15 text-danger border border-danger/30'
                          : sev === 'warning'
                            ? 'bg-warning/15 text-warning border border-warning/30'
                            : 'bg-info/15 text-info border border-info/30'
                        : 'bg-fg/5 text-fg-muted hover:text-fg border border-transparent'
                    }`}
                  >
                    {t(`oplog.severity${sev.charAt(0).toUpperCase() + sev.slice(1)}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border">
              <div className="px-3 py-2 border-b border-border">
                <span className="text-sm font-medium text-fg">
                  {t('oplog.alertRuleChannelSelect')}
                </span>
              </div>
              {channels.length === 0 ? (
                <div className="p-6 text-center text-sm text-fg-muted">
                  {t('notify.noChannelsHint')}
                </div>
              ) : (
                <div className="max-h-60 overflow-auto">
                  {channels.map((ch) => {
                    const sel = (ruleForm.then.channel_ids ?? []).includes(ch.id)
                    return (
                      <label
                        key={ch.id}
                        className={`flex items-center gap-3 px-3 py-2 border-b last:border-b-0 border-border cursor-pointer transition-colors ${
                          sel ? 'bg-accent/5' : 'hover:bg-fg/5'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={sel}
                          onChange={() => toggleChannel(ch.id)}
                          className="w-4 h-4 rounded border-border text-accent"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-fg">{ch.name}</div>
                          <div className="text-xs text-fg-muted">
                            {ch.type} ·{' '}
                            {ch.type === 'email'
                              ? ch.from_addr ?? t('common.notSet')
                              : ch.type === 'smtp'
                                ? `${ch.host}:${ch.port}`
                                : ch.type === 'webhook'
                                  ? ch.url
                                  : t('common.notSet')}
                          </div>
                        </div>
                        {ch.enabled === false && (
                          <Badge variant="muted" className="text-[10px]">
                            {t('common.disabled')}
                          </Badge>
                        )}
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
