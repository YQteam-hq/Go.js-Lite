import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import type { AcmeCapabilities } from '@shared/types'

interface CapabilityBannerProps {
  caps?: AcmeCapabilities
  loading: boolean
}

export function CapabilityBanner({ caps, loading }: CapabilityBannerProps) {
  const { t } = useI18n()
  if (loading || !caps) return null

  if (caps.available) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 px-4 py-3 flex items-start gap-3">
        <CheckCircle2 size={18} className="text-success mt-0.5 shrink-0" />
        <div className="text-sm">
          <div className="font-medium text-success">{t('ssl.acme.subheaderReadyOk')}</div>
          <div className="text-fg-muted mt-1 text-xs">{t('ssl.acme.wellKnownNoticeBanner')}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 space-y-2">
      {!caps.acme_extensions_ok && (
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-warning mt-0.5 shrink-0" />
          <div className="text-sm text-fg">
            <div className="font-medium text-warning">{t('ssl.acme.subheaderNeedExtOpenssl')}</div>
          </div>
        </div>
      )}
      {!caps.docroot_known && (
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-warning mt-0.5 shrink-0" />
          <div className="text-sm text-fg">
            <div className="font-medium">{t('ssl.acme.subheaderDocrootUnknown')}</div>
          </div>
        </div>
      )}
      {!caps.challenges_dir_writable && (
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-warning mt-0.5 shrink-0" />
          <div className="text-sm text-fg">
            <div className="font-medium">{t('ssl.acme.subheaderChallengesNotWritable')}</div>
          </div>
        </div>
      )}
    </div>
  )
}
