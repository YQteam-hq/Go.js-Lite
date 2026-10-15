import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from './Button'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { useMenuNavigation } from '@/hooks/useMenuNavigation'

interface DropdownMenuProps {
  trigger: ReactNode
  children: ReactNode
  align?: 'left' | 'right'
}

interface TriggerInjectedProps {
  onClick?: (event: ReactMouseEvent) => void
  onKeyDown?: (event: ReactKeyboardEvent) => void
}

export function DropdownMenu({ trigger, children, align = 'right' }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const menuId = useId()

  const closeWithTriggerFocus = useCallback(() => {
    setOpen(false)
    // Send the focus back to the trigger so keyboard users keep their place.
    triggerRef.current?.focus({ preventScroll: true })
  }, [])

  const { menuRef, handleKeyDown } = useMenuNavigation<HTMLDivElement>({
    open,
    onClose: closeWithTriggerFocus,
  })

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

  const injected: TriggerInjectedProps & Record<string, unknown> = {
    onClick: (event: ReactMouseEvent) => {
      event.preventDefault()
      setOpen((previous) => !previous)
    },
    onKeyDown: (event: ReactKeyboardEvent) => {
      // Arrow keys open the menu as well, matching the native select behavior.
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        setOpen(true)
      }
    },
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': open ? menuId : undefined,
  }

  // The trigger keeps its own markup and receives the widget props, which
  // avoids nesting a button inside another button.
  const triggerNode = isValidElement(trigger) ? (
    cloneElement(trigger as ReactElement<Record<string, unknown>>, {
      ...injected,
      ref: (node: HTMLElement | null) => {
        triggerRef.current = node
      },
    })
  ) : (
    <button type="button" ref={triggerRef as React.Ref<HTMLButtonElement>} {...injected}>
      {trigger}
    </button>
  )

  return (
    <div ref={containerRef} className="relative">
      {triggerNode}
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          tabIndex={-1}
          aria-orientation="vertical"
          onKeyDown={handleKeyDown}
          className={`
            absolute z-40 mt-2 min-w-[180px] bg-bg-elevated border border-border
            rounded-lg shadow-xl py-1 animate-scale-in origin-top-right
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
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
      type="button"
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
