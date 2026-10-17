/**
 * Clipboard helpers for the panel.
 *
 * Shared hosting panels are often served over plain HTTP, and on any origin
 * that is not a secure context `navigator.clipboard` is undefined. The helpers
 * below keep the copy buttons working there by falling back to a hidden
 * textarea plus `document.execCommand('copy')`.
 */

function copyWithExecCommand(text: string): boolean {
  if (typeof document === 'undefined') return false

  const textarea = document.createElement('textarea')
  textarea.value = text
  // Keep the helper off screen while staying selectable: iOS refuses to copy
  // from a textarea that has no size at all.
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.left = '0'
  textarea.style.width = '2em'
  textarea.style.height = '2em'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)

  const selection = document.getSelection()
  const previousRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null

  try {
    textarea.focus()
    textarea.select()
    textarea.setSelectionRange(0, text.length)
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    document.body.removeChild(textarea)
    if (selection && previousRange) {
      selection.removeAllRanges()
      selection.addRange(previousRange)
    }
  }
}

/**
 * Copies `text` to the clipboard and reports whether it worked, so callers can
 * show a success or a failure message instead of failing silently.
 */
export async function copyText(text: string): Promise<boolean> {
  if (typeof text !== 'string' || text.length === 0) return false

  const clipboard = typeof navigator === 'undefined' ? undefined : navigator.clipboard
  if (clipboard && typeof clipboard.writeText === 'function') {
    try {
      await clipboard.writeText(text)
      return true
    } catch {
      // Permission denied, or an insecure context: try the legacy path below.
    }
  }

  return copyWithExecCommand(text)
}
