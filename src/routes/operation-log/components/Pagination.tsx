import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useI18n } from '@/hooks/useI18n'

interface PaginationProps {
  currentPage: number
  totalPages: number
  total: number
  isFetching: boolean
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, total, isFetching, onPageChange }: PaginationProps) {
  const { t } = useI18n()

  if (total === 0) return null

  const pages: number[] = []
  const start = Math.max(1, currentPage - 2)
  const end = Math.min(totalPages, start + 4)
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="text-xs text-fg-muted">
        {t('operationLog.totalCount', { count: total })}
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isFetching}
          aria-label={t('operationLog.prevPage')}
        >
          <ChevronLeft size={16} />
        </Button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            disabled={isFetching}
            className={`
              min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium transition-colors
              ${p === currentPage
                ? 'bg-accent text-accent-fg'
                : 'text-fg-muted hover:text-fg hover:bg-fg/5'}
            `}
          >
            {p}
          </button>
        ))}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isFetching}
          aria-label={t('operationLog.nextPage')}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}
