import { AlertCircle, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function ErrorState({
  message,
  onRetry,
  retryLabel,
  compact = false,
}: {
  message: string
  onRetry: () => void
  retryLabel: string
  compact?: boolean
}) {
  if (compact) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-danger/10 text-danger flex items-center justify-center">
          <AlertCircle size={24} />
        </div>
        <p className="text-sm text-fg-muted mb-4">{message}</p>
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshCw size={16} />
          {retryLabel}
        </Button>
      </div>
    )
  }
  return (
    <Card className="p-8 text-center">
      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-danger/10 text-danger flex items-center justify-center">
        <AlertCircle size={28} />
      </div>
      <p className="text-sm font-medium text-fg mb-1">{message}</p>
      <div className="mb-5">
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-3">
          <RefreshCw size={16} />
          {retryLabel}
        </Button>
      </div>
    </Card>
  )
}
