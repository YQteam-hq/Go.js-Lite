import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { DropdownMenu, MenuItem } from '@/components/ui/DropdownMenu'
import { ContextMenu } from '@/components/ui/ContextMenu'
import { focusableMenuItems } from '@/hooks/useMenuNavigation'
import type { FileEntry } from '@shared/types'

const t = (key: string) => key

function renderDropdown() {
  return render(
    <DropdownMenu trigger={<button type="button">actions</button>}>
      <MenuItem label="first" onClick={() => undefined} />
      <MenuItem label="second" onClick={() => undefined} />
      <MenuItem label="third" onClick={() => undefined} disabled />
    </DropdownMenu>,
  )
}

function menuItems() {
  return screen.getAllByRole('menuitem')
}

describe('DropdownMenu keyboard support', () => {
  it('exposes the expanded state on the trigger', () => {
    renderDropdown()
    const trigger = screen.getByRole('button', { name: 'actions' })
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('menu')).toBeTruthy()
  })

  it('opens with ArrowDown and focuses the first entry', () => {
    renderDropdown()
    const trigger = screen.getByRole('button', { name: 'actions' })
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })

    expect(document.activeElement).toBe(menuItems()[0])
  })

  it('moves the focus with the arrow keys and skips disabled entries', () => {
    renderDropdown()
    fireEvent.click(screen.getByRole('button', { name: 'actions' }))
    const items = menuItems()

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' })
    expect(document.activeElement).toBe(items[1])

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' })
    expect(document.activeElement).toBe(items[0])

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'End' })
    expect(document.activeElement).toBe(items[1])

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Home' })
    expect(document.activeElement).toBe(items[0])
  })

  it('closes on Escape and restores the focus to the trigger', () => {
    renderDropdown()
    const trigger = screen.getByRole('button', { name: 'actions' })
    fireEvent.click(trigger)

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('closes when the focus leaves the menu with Tab', () => {
    renderDropdown()
    fireEvent.click(screen.getByRole('button', { name: 'actions' }))

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Tab' })
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('closes when a pointer press lands outside', () => {
    renderDropdown()
    fireEvent.click(screen.getByRole('button', { name: 'actions' }))
    expect(screen.getByRole('menu')).toBeTruthy()

    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('menu')).toBeNull()
  })
})

const file: FileEntry = {
  name: 'notes.txt',
  path: '/notes.txt',
  type: 'file',
  size: 10,
  mtime: 1700000000,
  perms: '0644',
  readable: true,
  writable: true,
}

function renderContextMenu(onClose = vi.fn()) {
  const noop = vi.fn()
  const view = render(
    <ContextMenu
      x={10}
      y={10}
      file={file}
      onClose={onClose}
      onOpen={noop}
      onRename={noop}
      onCopy={noop}
      onMove={noop}
      onDownload={noop}
      onDelete={noop}
      onPermissions={noop}
      t={t}
    />,
  )
  return { onClose, noop, view }
}

describe('ContextMenu keyboard support', () => {
  it('focuses the first entry when it opens', () => {
    renderContextMenu()
    expect(document.activeElement).toBe(menuItems()[0])
  })

  it('wraps the focus around the entries', () => {
    renderContextMenu()
    const items = menuItems()
    const menu = screen.getByRole('menu')

    fireEvent.keyDown(menu, { key: 'ArrowUp' })
    expect(document.activeElement).toBe(items[items.length - 1])

    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(items[0])
  })

  it('reports the dismissal on Escape', () => {
    const { onClose } = renderContextMenu()
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('restores the previous focus when it unmounts', () => {
    const anchor = document.createElement('button')
    document.body.appendChild(anchor)
    anchor.focus()

    const { view } = renderContextMenu()
    view.unmount()
    expect(document.activeElement).toBe(anchor)
    anchor.remove()
  })
})

describe('focusableMenuItems', () => {
  it('ignores containers without entries', () => {
    expect(focusableMenuItems(null)).toEqual([])
  })

  it('skips disabled entries', () => {
    renderDropdown()
    fireEvent.click(screen.getByRole('button', { name: 'actions' }))
    const items = focusableMenuItems(screen.getByRole('menu'))
    expect(items).toHaveLength(2)
    expect(items.map((item) => item.textContent)).toEqual(['first', 'second'])
  })
})
