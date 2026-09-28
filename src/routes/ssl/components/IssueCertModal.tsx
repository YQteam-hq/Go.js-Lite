import { useState, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Mail, Globe, Plus, CheckSquare, Square, ExternalLink } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useI18n } from '@/hooks/useI18n'
import { sslApi } from '@/api/ssl'
import { toast } from '@/components/ui/Toast'
import { resolveErrorText } from '@/lib/errorMessages'

interface IssueCertModalProps {
  open: boolean
  onClose: () => void
  onIssued: () => void
}

export function IssueCertModal({
  open,
  onClose,
  onIssued,
}: IssueCertModalProps) {
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [domain, setDomain] = useState('')
  const [acceptTos, setAcceptTos] = useState(false)
  const [ca, setCa] = useState<'letsencrypt' | 'letsencrypt-staging'>('letsencrypt')
  const [issuing, setIssuing] = useState(false)

  const domainValid = useMemo(() => {
    const d = domain.trim()
    if (!d) return false
    return /^[a-zA-Z0-9][a-zA-Z0-9\-.]*\.[a-zA-Z]{2,}$/.test(d)
  }, [domain])

  const emailValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  }, [email])

  const canSubmit = domainValid && emailValid && acceptTos && !issuing

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIssuing(true)
    try {
      const result = await sslApi.issueCert({
        domain: domain.trim(),
        email: email.trim(),
        accept_tos: acceptTos,
        ca,
      })
      if (result.ok) {
        toast({ type: 'success', title: t('ssl.acme.issueCert') })
        queryClient.invalidateQueries({ queryKey: ['ssl-acme-certs'] })
        queryClient.invalidateQueries({ queryKey: ['ssl-acme-caps'] })
        onIssued()
        onClose()
        setEmail('')
        setDomain('')
        setAcceptTos(false)
      }
    } catch (err) {
      toast({
        type: 'error',
        title: t('ssl.checkFailed'),
        description: err instanceof Error ? resolveErrorText(err) : t('common.unknownError'),
      })
    } finally {
      setIssuing(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('ssl.acme.issueTitle')}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={issuing}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!canSubmit}
            loading={issuing}
          >
            {t('ssl.acme.issueCert')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-fg">
              {t('ssl.acme.emailLabel')} <span className="text-danger">*</span>
            </label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              icon={<Mail size={16} />}
              disabled={issuing}
            />
            <p className="text-xs text-fg-subtle">{t('ssl.acme.emailHint')}</p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-fg">
              {t('ssl.acme.domainLabel')} <span className="text-danger">*</span>
            </label>
            <Input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              icon={<Globe size={16} />}
              disabled={issuing}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-fg">{t('ssl.acme.sansDisabledLabel')}</label>
          <Input
            value=""
            disabled
            placeholder="SANs: Future release will support multiple domains"
            icon={<Plus size={16} />}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-fg">{t('ssl.acme.caLabel')}</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCa('letsencrypt')}
              disabled={issuing}
              className={`flex-1 px-3 py-2.5 rounded-xl text-sm border transition-all ${
                ca === 'letsencrypt'
                  ? 'border-accent bg-accent/10 text-fg'
                  : 'border-border bg-bg text-fg-muted hover:border-border/80'
              }`}
            >
              <div className="font-medium">Let&apos;s Encrypt Production</div>
              <div className="text-xs opacity-70 mt-0.5">Real certificates, rate limits apply</div>
            </button>
            <button
              type="button"
              disabled
              title="Staging environment - Coming soon"
              className="flex-1 px-3 py-2.5 rounded-xl text-sm border border-border bg-bg-sunken text-fg-subtle opacity-60 cursor-not-allowed"
            >
              <div className="font-medium">Let&apos;s Encrypt Staging</div>
              <div className="text-xs mt-0.5">For testing, untrusted certs</div>
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-bg-sunken/30 p-4">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <button
              type="button"
              onClick={() => !issuing && setAcceptTos((v) => !v)}
              className="mt-0.5 shrink-0 text-fg hover:text-accent transition-colors disabled:opacity-50"
              disabled={issuing}
            >
              {acceptTos ? (
                <CheckSquare size={20} className="text-accent" />
              ) : (
                <Square size={20} />
              )}
            </button>
            <div className="text-sm">
              <div className="font-medium text-fg">
                {t('ssl.acme.tosLabel')} <span className="text-danger">*</span>
              </div>
              <a
                href="https://letsencrypt.org/repository/"
                target="_blank"
                rel="noreferrer noopener"
                className="text-xs text-accent hover:underline inline-flex items-center gap-1 mt-1"
              >
                {t('ssl.acme.tosLink')}
                <ExternalLink size={12} />
              </a>
              {!acceptTos && (
                <p className="text-xs text-warning mt-2">{t('ssl.acme.acceptTosRequired')}</p>
              )}
            </div>
          </label>
        </div>
      </div>
    </Modal>
  )
}
