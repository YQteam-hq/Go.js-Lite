import { useState, useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  History,
  RefreshCw,
  Trash2,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { Confirm } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  operationLogApi,
  alertRulesApi,
} from '@/api/operationLog'
import { notificationChannelsApi } from '@/api/notifications'
import { toast } from '@/components/ui/Toast'
import { useI18n } from '@/hooks/useI18n'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { resolveErrorText } from '@/lib/errorMessages'
import { formatExportFilename, dateToTs, emptyRule } from './utils'
import { LogEntry } from './components/LogList'
import { Pagination } from './components/Pagination'
import { ExportMenu } from './components/ExportMenu'
import { AlertRuleModal } from './components/AlertRuleModal'
import { LogFilters } from './components/LogFilters'
import type { OperationLogAlertRule } from '@shared/types'
import type { ExportParams } from '@/api/operationLog'

export default function OperationLog() {
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const isMobile = useIsMobile()

  const [page, setPage] = useState(1)
  const [type, setType] = useState('')
  const [ipInput, setIpInput] = useState('')
  const [ip, setIp] = useState('')
  const [userInput, setUserInput] = useState('')
  const [user, setUser] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showClear, setShowClear] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [alertModalOpen, setAlertModalOpen] = useState(false)
  const [savingRule, setSavingRule] = useState(false)
  const [editingRule, setEditingRule] = useState<OperationLogAlertRule | null>(null)
  const [ruleForm, setRuleForm] = useState<Omit<OperationLogAlertRule, 'id'>>(emptyRule())

  const filterActive = useMemo(
    () => Boolean(type || ip || user || dateFrom || dateTo),
    [type, ip, user, dateFrom, dateTo],
  )

  const { data: channels = [] } = useQuery({
    queryKey: ['notification-channels'],
    queryFn: () => notificationChannelsApi.list(),
    staleTime: 60_000,
  })

  useEffect(() => {
    const handle = setTimeout(() => {
      setIp(ipInput.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(handle)
  }, [ipInput])

  useEffect(() => {
    const handle = setTimeout(() => {
      setUser(userInput.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(handle)
  }, [userInput])

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['operation-log', { type, ip, user, dateFrom, dateTo, page }],
    queryFn: () =>
      operationLogApi.list({
        type: type || undefined,
        ip: ip || undefined,
        user: user || undefined,
        dateFrom: dateToTs(dateFrom, false),
        dateTo: dateToTs(dateTo, true),
        page,
      }),
    placeholderData: (prev) => prev,
  })

  const handleClear = async () => {
    setClearing(true)
    try {
      await operationLogApi.clear()
      toast({ type: 'success', title: t('operationLog.cleared') })
      setShowClear(false)
      setPage(1)
      queryClient.invalidateQueries({ queryKey: ['operation-log'] })
    } catch (err) {
      toast({
        type: 'error',
        title: t('operationLog.clearFailed'),
        description: err instanceof Error ? resolveErrorText(err) : t('common.unknownError'),
      })
    } finally {
      setClearing(false)
    }
  }

  const handleTypeChange = (value: string) => {
    setType(value)
    setPage(1)
  }

  const handleExport = async (
    format: 'csv' | 'jsonl' | 'json',
    scope: 'current_filter' | 'all',
  ) => {
    setExporting(true)
    try {
      const params: ExportParams = { format, scope }
      if (scope === 'current_filter') {
        if (type) params.action = [type]
        if (ip) params.ip_like = ip
        if (user) params.user = user
        const fromTs = dateToTs(dateFrom, false)
        const toTs = dateToTs(dateTo, true)
        if (fromTs !== undefined) params.date_from = fromTs
        if (toTs !== undefined) params.date_to = toTs
      }
      const blob = await operationLogApi.exportBlob(params)
      const filename = formatExportFilename(format)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 5000)
      toast({ type: 'success', title: t('oplog.exportDownloaded', { filename }) })
    } catch (err) {
      toast({
        type: 'error',
        title: t('oplog.exportFailed'),
        description: err instanceof Error ? resolveErrorText(err) : t('common.unknownError'),
      })
    } finally {
      setExporting(false)
    }
  }

  const openNewRule = () => {
    setEditingRule(null)
    setRuleForm(emptyRule())
    setAlertModalOpen(true)
  }

  const handleSaveRule = async () => {
    setSavingRule(true)
    try {
      if (editingRule) {
        await alertRulesApi.update(editingRule.id, ruleForm)
      } else {
        await alertRulesApi.create(ruleForm)
      }
      toast({ type: 'success', title: t('oplog.alertRuleSaved') })
      setAlertModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] })
    } catch (err) {
      toast({
        type: 'error',
        title: t('common.saveFailed'),
        description: err instanceof Error ? resolveErrorText(err) : t('common.unknownError'),
      })
    } finally {
      setSavingRule(false)
    }
  }

  const handleTestRule = async () => {
    if (!editingRule) {
      try {
        const created = await alertRulesApi.create({
          ...ruleForm,
          enabled: true,
        })
        try {
          await alertRulesApi.test(created.id)
          toast({ type: 'success', title: t('oplog.alertRuleTest') + ': OK' })
        } finally {
          await alertRulesApi.remove(created.id).catch(() => {})
        }
      } catch (err) {
        toast({
          type: 'error',
          title: t('oplog.alertRuleTest') + ' ' + t('common.failure'),
          description: err instanceof Error ? resolveErrorText(err) : t('common.unknownError'),
        })
      }
      return
    }
    try {
      await alertRulesApi.test(editingRule.id)
      toast({ type: 'success', title: t('oplog.alertRuleTest') + ': OK' })
    } catch (err) {
      toast({
        type: 'error',
        title: t('oplog.alertRuleTest') + ' ' + t('common.failure'),
        description: err instanceof Error ? resolveErrorText(err) : t('common.unknownError'),
      })
    }
  }

  const totalPages = data?.total_pages ?? 1
  const currentPage = data?.page ?? 1
  const total = data?.total ?? 0
  const logs = data?.logs ?? []

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-fg flex items-center gap-2">
            <History size={22} className="text-accent" />
            {t('operationLog.title')}
          </h1>
          <p className="text-sm text-fg-muted mt-0.5">{t('operationLog.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
            {!isMobile && t('operationLog.refresh')}
          </Button>

          <ExportMenu
            filterActive={filterActive}
            exporting={exporting}
            onExport={handleExport}
            onExportingChange={setExporting}
          />

          <Button variant="secondary" size="sm" onClick={openNewRule}>
            <ShieldAlert size={16} />
            {!isMobile && t('oplog.alertRules')}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowClear(true)}
            disabled={isLoading || total === 0}
          >
            <Trash2 size={16} />
            {!isMobile && t('operationLog.clear')}
          </Button>
        </div>
      </div>

      <Card className="card-hover">
        <CardHeader>
          <LogFilters
            type={type}
            ipInput={ipInput}
            userInput={userInput}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onTypeChange={handleTypeChange}
            onIpChange={setIpInput}
            onUserChange={setUserInput}
            onDateFromChange={(v) => { setDateFrom(v); setPage(1) }}
            onDateToChange={(v) => { setDateTo(v); setPage(1) }}
          />
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <Spinner />
            </div>
          ) : error ? (
            <div className="p-8 text-center text-danger">
              <AlertTriangle size={24} className="mx-auto mb-2" />
              <p className="text-sm">
                {resolveErrorText(error) || t('common.error')}
              </p>
            </div>
          ) : logs.length === 0 ? (
            <EmptyState
              icon={
                <div className="w-16 h-16 rounded-full bg-bg-sunken flex items-center justify-center text-fg-subtle mx-auto">
                  <History size={28} />
                </div>
              }
              title={t('operationLog.empty')}
              description={
                type || ip || user || dateFrom || dateTo
                  ? t('operationLog.emptyHintFiltered')
                  : t('operationLog.emptyHint')
              }
            />
          ) : isMobile ? (
            <ul className="divide-y divide-border">
              {logs.map((entry, idx) => (
                <LogEntry key={idx} entry={entry} idx={idx} />
              ))}
            </ul>
          ) : (
            <div className="max-h-[600px] overflow-auto">
              <ul className="divide-y divide-border">
                {logs.map((entry, idx) => (
                  <LogEntry key={idx} entry={entry} idx={idx} />
                ))}
              </ul>
            </div>
          )}
        </CardBody>
      </Card>

      {!isLoading && !error && logs.length > 0 && (
        <div className="pb-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
            isFetching={isFetching}
            onPageChange={setPage}
          />
        </div>
      )}

      <Confirm
        open={showClear}
        onCancel={() => setShowClear(false)}
        title={t('operationLog.clearTitle')}
        message={t('operationLog.clearConfirm')}
        confirmText={t('operationLog.clearConfirmBtn')}
        variant="danger"
        loading={clearing}
        onConfirm={handleClear}
      />

      <AlertRuleModal
        open={alertModalOpen}
        editingRule={editingRule}
        ruleForm={ruleForm}
        channels={channels}
        savingRule={savingRule}
        onClose={() => setAlertModalOpen(false)}
        onRuleFormChange={setRuleForm}
        onSave={handleSaveRule}
        onTest={handleTestRule}
      />
    </div>
  )
}
