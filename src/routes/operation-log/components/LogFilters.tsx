import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { TYPE_OPTIONS } from '../utils'
import { useI18n } from '@/hooks/useI18n'

interface LogFiltersProps {
  type: string
  ipInput: string
  userInput: string
  dateFrom: string
  dateTo: string
  onTypeChange: (value: string) => void
  onIpChange: (value: string) => void
  onUserChange: (value: string) => void
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
}

export function LogFilters({
  type,
  ipInput,
  userInput,
  dateFrom,
  dateTo,
  onTypeChange,
  onIpChange,
  onUserChange,
  onDateFromChange,
  onDateToChange,
}: LogFiltersProps) {
  const { t } = useI18n()

  return (
    <div className="flex items-center gap-2 flex-wrap w-full">
      <div className="relative">
        <Filter
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none"
        />
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          className="input-base pl-9 pr-8 h-10 appearance-none cursor-pointer text-sm min-w-[180px]"
          aria-label={t('operationLog.typeFilter')}
        >
          <option value="">{t('operationLog.allTypes')}</option>
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-w-[180px]">
        <Input
          placeholder={t('operationLog.ipPlaceholder')}
          value={ipInput}
          onChange={(e) => onIpChange(e.target.value)}
          icon={<Search size={16} />}
        />
      </div>
      <div className="flex-1 min-w-[180px]">
        <Input
          placeholder={t('operationLog.userFilter')}
          value={userInput}
          onChange={(e) => onUserChange(e.target.value)}
          icon={<Search size={16} />}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-fg-muted shrink-0 whitespace-nowrap">
          {t('operationLog.dateFrom')}
        </span>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="input-base h-10 px-3 rounded-lg text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-fg-muted shrink-0 whitespace-nowrap">
          {t('operationLog.dateTo')}
        </span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="input-base h-10 px-3 rounded-lg text-sm"
        />
      </div>
    </div>
  )
}
