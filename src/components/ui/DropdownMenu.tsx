import { cloneElement, isValidElement, useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactElement, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from './Button'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { getFocusableElements } from '@/hooks/useFocusTrap'

interface DropdownMenuProps {
  trigger: ReactNode
  children: ReactNode
  align?: 'left' | 'right'
}

/**
 * Exposes the menu semantics on the trigger element itself so assistive
 * technology announces the expanded state. Falls back to the plain trigger
 * when it is not a single element.
 */
function withTriggerAria(trigger: ReactNode, open: boolean): ReactNode {
  if (!isValidElement(trigger)) return trigger
  return cloneElement(trigger as ReactElement<Record<string, unknown>>, {
    'aria-haspopup': 'menu',
    'aria-expanded': open,
  })
}

export function DropdownMenu({ trigger, children, align = 'right' }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const pendingFocusRef = useRef<'first' | 'last'>('first')

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const getItems = useCallback(
    () =>
      Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? [],
      ),
    [],
  )

  const focusTrigger = useCallback(() => {
    const focusable = getFocusableElements(triggerRef.current)
    ;(focusable[0] ?? triggerRef.current)?.focus()
  }, [])

  const closeMenu = useCallback(
    (restoreFocus: boolean) => {
      setOpen(false)
      if (restoreFocus) focusTrigger()
    },
    [focusTrigger],
  )

  // Move focus into the menu when it opens, honouring the direction the
  // keyboard asked for (ArrowUp opens on the last item).
  useEffect(() => {
    if (!open) return
    const items = getItems()
    const target = pendingFocusRef.current === 'last' ? items[items.length - 1] : items[0]
    pendingFocusRef.current = 'first'
    target?.focus()
  }, [open, getItems])

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      pendingFocusRef.current = event.key === 'ArrowUp' ? 'last' : 'first'
      if (!open) setOpen(true)
      return
    }
    if (event.key === 'Escape' && open) {
      event.preventDefault()
      closeMenu(true)
    }
  }

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = getItems()
    const currentIndex = items.indexOf(document.activeElement as HTMLElement)
    switch (event.key) {
      case 'Escape':
      case 'Tab':
        event.preventDefault()
        closeMenu(true)
        return
      case 'ArrowDown':
        event.preventDefault()
        items[(currentIndex + 1) % Math.max(items.length, 1)]?.focus()
        return
      case 'ArrowUp':
        event.preventDefault()
        items[currentIndex <= 0 ? items.length - 1 : currentIndex - 1]?.focus()
        return
      case 'Home':
        event.preventDefault()
        items[0]?.focus()
        return
      case 'End':
        event.preventDefault()
        items[items.length - 1]?.focus()
        return
      default:
        return
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        ref={triggerRef}
        onClick={() => (open ? closeMenu(false) : setOpen(true))}
        onKeyDown={handleTriggerKeyDown}
      >
        {withTriggerAria(trigger, open)}
      </div>
      {open && (
        <div
          ref={menuRef}
          className={`
            absolute z-40 mt-2 min-w-[180px] bg-bg-elevated border border-border
            rounded-lg shadow-xl py-1 animate-scale-in origin-top-right
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
          role="menu"
          onClick={() => closeMenu(true)}
          onKeyDown={handleMenuKeyDown}
        >
          {children}
        </div>
      )}
    </div>
  )
}

interface MenuItemProps {
  icon?: ReactNode
  label: ReactNode
  description?: ReactNode
  onClick?: () => void
  danger?: boolean
  disabled?: boolean
}

export function MenuItem({ icon, label, description, onClick, danger, disabled }: MenuItemProps) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center gap-3 px-3 py-2 text-sm text-left
        transition-colors
        ${disabled
          ? 'text-fg-subtle opacity-50 cursor-not-allowed'
          : danger
          ? 'text-danger hover:bg-danger/10'
          : 'text-fg hover:bg-bg-sunken'
        }
      `}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="flex-1 min-w-0">
        <div className="truncate">{label}</div>
        {description && <div className="text-xs text-fg-subtle truncate">{description}</div>}
      </span>
    </button>
  )
}

export function MenuSeparator() {
  return <div className="my-1 h-px bg-border" />
}

interface NewDropdownProps {
  onNewFile: () => void
  onNewFolder: () => void
  t: (key: string) => string
}

export function NewDropdown({ onNewFile, onNewFolder, t }: NewDropdownProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Button variant="secondary" size="icon" onClick={onNewFile} aria-label={t('files.newFile')}>
        <ChevronDown size={18} />
      </Button>
    )
  }

  return (
    <DropdownMenu
      trigger={
        <Button variant="secondary" size="icon" aria-label={t('files.newFile')}>
          <ChevronDown size={18} />
        </Button>
      }
    >
      <MenuItem
        icon={<span className="w-4 h-4 flex items-center justify-center">📄</span>}
        label={t('files.newFileItem')}
        onClick={onNewFile}
      />
      <MenuItem
        icon={<span className="w-4 h-4 flex items-center justify-center">📁</span>}
        label={t('files.newFolder')}
        onClick={onNewFolder}
      />
    </DropdownMenu>
  )
}