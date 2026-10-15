import { useCallback, useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react'

/**
 * Selector used to collect the entries of a menu that can receive the focus.
 * Disabled controls are skipped so the focus never lands on an inert item.
 */
export const MENU_ITEM_SELECTOR = '[role="menuitem"]:not([disabled]):not([aria-disabled="true"])'

export interface MenuNavigationOptions {
  /** Whether the menu is currently rendered. */
  open: boolean
  /** Called when the user asks to dismiss the menu with the keyboard. */
  onClose?: () => void
  /** Move the focus to the first entry when the menu opens. Defaults to true. */
  autoFocus?: boolean
  /** Wrap around when moving past the first or the last entry. Defaults to true. */
  loop?: boolean
}

export interface MenuNavigationResult<T extends HTMLElement> {
  menuRef: React.RefObject<T>
  handleKeyDown: (event: ReactKeyboardEvent<T>) => void
}

/**
 * Returns the menu entries that can receive the focus, in visual order.
 */
export function focusableMenuItems(menu: HTMLElement | null): HTMLElement[] {
  if (!menu) return []
  const nodes = Array.from(menu.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR))
  return nodes.filter((node) => !node.hasAttribute('hidden'))
}

function nextIndex(index: number, delta: number, length: number, loop: boolean): number {
  if (length === 0) return -1
  let candidate = index + delta
  if (index < 0) candidate = delta > 0 ? 0 : length - 1
  if (candidate < 0) candidate = loop ? length - 1 : 0
  if (candidate > length - 1) candidate = loop ? 0 : length - 1
  return candidate
}

/**
 * Keyboard support for `role="menu"` widgets: arrow keys move the focus between
 * entries, Home and End jump to the edges, Escape and Tab dismiss the menu.
 *
 * Screen readers already announce the entries once they own the focus, so the
 * implementation only has to keep the focus inside the menu and predictable.
 */
export function useMenuNavigation<T extends HTMLElement>({
  open,
  onClose,
  autoFocus = true,
  loop = true,
}: MenuNavigationOptions): MenuNavigationResult<T> {
  const menuRef = useRef<T>(null)

  useEffect(() => {
    if (!open || !autoFocus) return
    const menu = menuRef.current
    if (!menu) return
    const items = focusableMenuItems(menu)
    const target = items[0] ?? menu
    target.focus({ preventScroll: true })
  }, [open, autoFocus])

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<T>) => {
      const menu = menuRef.current
      if (!menu) return
      const items = focusableMenuItems(menu)
      const currentIndex = items.indexOf(document.activeElement as HTMLElement)

      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault()
          const index = nextIndex(currentIndex, 1, items.length, loop)
          if (index >= 0) items[index].focus({ preventScroll: true })
          break
        }
        case 'ArrowUp': {
          event.preventDefault()
          const index = nextIndex(currentIndex, -1, items.length, loop)
          if (index >= 0) items[index].focus({ preventScroll: true })
          break
        }
        case 'Home': {
          event.preventDefault()
          if (items.length > 0) items[0].focus({ preventScroll: true })
          break
        }
        case 'End': {
          event.preventDefault()
          if (items.length > 0) items[items.length - 1].focus({ preventScroll: true })
          break
        }
        case 'Escape': {
          event.preventDefault()
          event.stopPropagation()
          onClose?.()
          break
        }
        case 'Tab': {
          // Let the browser move the focus away, then close the menu so the
          // widget never stays open without its entries on screen.
          onClose?.()
          break
        }
        default:
          break
      }
    },
    [loop, onClose],
  )

  return { menuRef, handleKeyDown }
}
