import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useI18n } from '@/hooks/useI18n'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
  closeOnBackdrop?: boolean
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
}: ModalProps) {
  const isMobile = useIsMobile()
  const dialogRef = useRef<HTMLDivElement>(null)
  const { t } = useI18n()
  const titleId = useId()

  useFocusTrap(dialogRef, { active: open, onEscape: onClose })

  useEffect(() => {
    if (!open) return

    // Locking the body hides the scrollbar, which shifts the whole page to the
    // right. Padding by the scrollbar width keeps the layout where it was.
    const { body, documentElement } = document
    const prevOverflow = body.style.overflow
    const prevPaddingRight = body.style.paddingRight
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth

    body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPaddingRight
    }
  }, [open])

  if (!open) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    full: 'max-w-none w-full h-full rounded-none',
  }

  const fullscreen = isMobile && size !== 'full' ? 'h-[85vh] flex flex-col' : ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`relative w-full ${sizeClasses[size]} bg-bg-elevated rounded-2xl shadow-2xl border border-border/50 animate-scale-in will-change-transform outline-none ${fullscreen}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
      >
        {title ? (
          <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            <h3 id={titleId} className="text-base font-semibold text-fg">
              {title}
            </h3>
            <CloseButton onClick={onClose} label={t('common.close')} />
          </div>
        ) : (
          // Without a title the dialog still needs a reachable way out, so the
          // control floats over the content instead of owning an empty header.
          <div className="absolute right-3 top-3 z-10">
            <CloseButton onClick={onClose} label={t('common.close')} />
          </div>
        )}
        <div className={`px-5 py-4 ${fullscreen ? 'flex-1 overflow-auto' : ''}`}>{children}</div>
        {footer && (
          <div className="px-5 py-3 border-t border-border shrink-0 flex justify-end gap-2 flex-wrap">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

interface CloseButtonProps {
  onClick: () => void
  label: string
}

function CloseButton({ onClick, label }: CloseButtonProps) {
  return (
    <Button variant="ghost" size="icon-sm" onClick={onClick} aria-label={label}>
      <X size={18} />
    </Button>
  )
}

interface ConfirmProps {
  open: boolean
  title: string
  message: ReactNode
  confirmText?: string
  cancelText?: string
  variant?: 'primary' | 'danger'
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
  requireKeyword?: string
  keywordPlaceholder?: string
}

export function Confirm({
  open,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'primary',
  onConfirm,
  onCancel,
  loading,
  requireKeyword,
  keywordPlaceholder,
}: ConfirmProps) {
  const { t } = useI18n()
  const [keyword, setKeyword] = useState('')
  useEffect(() => {
    if (open) setKeyword('')
  }, [open])
  const keywordMatched = !requireKeyword || keyword === requireKeyword
  const defaultConfirmText = variant === 'danger' ? t('common.delete') : t('common.confirm')
  const finalConfirmText = confirmText ?? defaultConfirmText
  const finalCancelText = cancelText ?? t('common.cancel')
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            {finalCancelText}
          </Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading} disabled={!keywordMatched}>
            {finalConfirmText}
          </Button>
        </>
      }
    >
      <p className="text-sm text-fg-muted leading-relaxed">{message}</p>
      {requireKeyword && (
        <div className="mt-3">
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={keywordPlaceholder || requireKeyword}
            autoComplete="off"
          />
          <p className="text-xs text-danger mt-1.5">{t('common.typeToConfirm')}</p>
        </div>
      )}
    </Modal>
  )
}
