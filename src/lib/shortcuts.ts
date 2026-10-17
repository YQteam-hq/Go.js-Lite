/** The elements whose key presses belong to the element rather than to the page. */
const TEXT_ENTRY_TAGS = ['INPUT', 'TEXTAREA', 'SELECT']

export interface ShortcutEventLike {
  key: string
  metaKey: boolean
  ctrlKey: boolean
  altKey: boolean
  target: EventTarget | null
}

/**
 * Reports whether a key press is going into a field the user is typing in.
 *
 * Inputs, textareas, selects and contenteditable regions handle their own
 * keys, so a page level shortcut has to stay out of them.
 */
export function isTextEntryTarget(target: EventTarget | null): boolean {
  if (target === null || typeof target !== 'object') return false
  const element = target as Element
  if (typeof element.tagName !== 'string') return false
  if (TEXT_ENTRY_TAGS.includes(element.tagName)) return true
  if (typeof element.closest === 'function') {
    const editable = element.closest('[contenteditable]')
    if (editable && (editable.getAttribute('contenteditable') || '').toLowerCase() !== 'false') {
      return true
    }
  }
  return (element as HTMLElement).isContentEditable === true
}

/**
 * Decides whether an event asks for the command palette.
 *
 * The check keeps the shortcut out of text entry targets so that editing a
 * file, writing SQL or renaming an entry never opens the palette and moves
 * the focus away from the caret, and it requires exactly one of the two
 * platform modifiers so that AltGr combinations stay untouched.
 */
export function isCommandPaletteShortcut(event: ShortcutEventLike): boolean {
  if (event.key.toLowerCase() !== 'k') return false
  if (event.altKey) return false
  if (!event.metaKey && !event.ctrlKey) return false
  return !isTextEntryTarget(event.target)
}
