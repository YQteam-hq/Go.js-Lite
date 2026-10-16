import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
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

/** Selector matching the menu items that can receive keyboard focus. */
const MENU_ITEM_SELECTOR = '[role="menuitem"]:not([disabled])'

/**
 * Focuses the menu item at `index`, wrapping around in both directions.
 * Any out-of-range index (including negatives) is normalised, and an empty
 * list is a no-op, so callers never need their own bounds checks.
 */
function focusItemAt(items: HTMLElement[], index: number): void {
  if (items.length === 0) return
  const normalized = ((index % items.length) + items.length) % items.length
  items[normalized]?.focus()
}

export function DropdownMenu({ trigger, children, align = 'right' }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  /**
   * Which edge of the menu the open effect should focus: 'last' when the
   * menu was opened with ArrowUp, 'first' otherwise. Reset to the default
   * as soon as it is consumed so a later opening starts at the top again.
   */
  const pendingFocusRef = useRef<'first' | 'last'>('first')

  /**
   * Collects the enabled menu items from the DOM. The callback identity is
   * stable; the query itself runs at most once per keystroke / opening,
   * which is negligible next to the focus() call it feeds.
   */
  const getItems = useCallback(
    () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR) ?? []),
    [],
  )

  const focusTrigger = useCallback(() => {
    const focusable = getFocusableElements(triggerRef.current)
    ;(focusable[0] ?? triggerRef.current)?.focus()
  }, [])

  /**
   * Closes the menu without touching focus. Used when the user dismisses
   * the menu with the pointer (outside click, trigger toggle) and focus is
   * already where they want it.
   */
  const closeMenu = useCallback(() => setOpen(false), [])

  /**
   * Closes the menu and returns focus to the trigger. Used by keyboard
   * dismissals (Escape / Tab) and item activation so focus never falls back
   * to the document body.
   */
  const closeMenuAndRestoreFocus = useCallback(() => {
    setOpen(false)
    focusTrigger()
  }, [focusTrigger])

  // Close on an outside pointer press. Focus is intentionally left alone:
  // the user just clicked elsewhere and does not expect it to jump back.
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeMenu()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, closeMenu])

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
      if (!open) {
        pendingFocusRef.current = event.key === 'ArrowUp' ? 'last' : 'first'
        setOpen(true)
        return
      }
      // Already open (opened with the pointer, focus still on the trigger):
      // move focus straight into the menu instead of waiting for a re-render.
      const items = getItems()
      focusItemAt(items, event.key === 'ArrowUp' ? items.length - 1 : 0)
      return
    }
    if (event.key === 'Escape' && open) {
      event.preventDefault()
      closeMenuAndRestoreFocus()
    }
  }

  /**
   * Keyboard navigation inside the open menu. `activeIndex` is -1 when focus
   * is not on a menu item (for example the menu was opened by a click that
   * did not move focus); Arrow keys then start from the matching edge.
   */
  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = getItems()
    const activeIndex = items.indexOf(document.activeElement as HTMLElement)

    switch (event.key) {
      case 'Escape':
      case 'Tab':
        event.preventDefault()
        closeMenuAndRestoreFocus()
        return
      case 'ArrowDown':
        event.preventDefault()
        focusItemAt(items, activeIndex < 0 ? 0 : activeIndex + 1)
        return
      case 'ArrowUp':
        event.preventDefault()
        focusItemAt(items, activeIndex < 0 ? items.length - 1 : activeIndex - 1)
        return
      case 'Home':
        event.preventDefault()
        focusItemAt(items, 0)
        return
      case 'End':
        event.preventDefault()
        focusItemAt(items, items.length - 1)
        return
      default:
        return
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        ref={triggerRef}
        onClick={() => (open ? closeMenu() : setOpen(true))}
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
          onClick={() => closeMenuAndRestoreFocus()}
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