import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { DropdownMenu, MenuItem, MenuSeparator } from '@/components/ui/DropdownMenu'
import { Button } from '@/components/ui/Button'

function renderMenu() {
  const onFirst = vi.fn()
  const onSecond = vi.fn()
  const utils = render(
    <DropdownMenu
      trigger={<Button variant="secondary">Open menu</Button>}
    >
      <MenuItem label="First" onClick={onFirst} />
      <MenuSeparator />
      <MenuItem label="Second" onClick={onSecond} />
    </DropdownMenu>,
  )
  return { onFirst, onSecond, ...utils }
}

function items(): HTMLElement[] {
  return screen.getAllByRole('menuitem') as HTMLElement[]
}

describe('DropdownMenu', () => {
  it('opens on click and exposes the menu semantics on the trigger', () => {
    renderMenu()
    const trigger = screen.getByRole('button', { name: 'Open menu' })
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('menu')).toBeNull()

    fireEvent.click(trigger)
    expect(screen.getByRole('menu')).toBeTruthy()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  it('focuses the first item when opened with ArrowDown', () => {
    renderMenu()
    const trigger = screen.getByRole('button', { name: 'Open menu' })
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })

    expect(items()).toHaveLength(2)
    expect(document.activeElement).toBe(items()[0])
  })

  it('focuses the last item when opened with ArrowUp', () => {
    renderMenu()
    fireEvent.keyDown(screen.getByRole('button', { name: 'Open menu' }), { key: 'ArrowUp' })
    expect(document.activeElement).toBe(items()[1])
  })

  it('moves focus with the arrow keys and wraps around', () => {
    renderMenu()
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(document.activeElement).toBe(items()[0])

    fireEvent.keyDown(items()[0], { key: 'ArrowDown' })
    expect(document.activeElement).toBe(items()[1])

    fireEvent.keyDown(items()[1], { key: 'ArrowDown' })
    expect(document.activeElement).toBe(items()[0])

    fireEvent.keyDown(items()[0], { key: 'ArrowUp' })
    expect(document.activeElement).toBe(items()[1])
  })

  it('jumps to the first and last item with Home and End', () => {
    renderMenu()
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))

    fireEvent.keyDown(items()[0], { key: 'End' })
    expect(document.activeElement).toBe(items()[1])

    fireEvent.keyDown(items()[1], { key: 'Home' })
    expect(document.activeElement).toBe(items()[0])
  })

  it('runs the item action and closes on activation', () => {
    const { onFirst } = renderMenu()
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    fireEvent.click(items()[0])

    expect(onFirst).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('closes and restores focus to the trigger on Escape', () => {
    renderMenu()
    const trigger = screen.getByRole('button', { name: 'Open menu' })
    fireEvent.click(trigger)
    fireEvent.keyDown(items()[0], { key: 'Escape' })

    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('closes on Tab and restores focus to the trigger', () => {
    renderMenu()
    const trigger = screen.getByRole('button', { name: 'Open menu' })
    fireEvent.click(trigger)
    fireEvent.keyDown(items()[0], { key: 'Tab' })

    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('closes when clicking outside', () => {
    renderMenu()
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.getByRole('menu')).toBeTruthy()

    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('toggles closed when the trigger is clicked again', () => {
    renderMenu()
    const trigger = screen.getByRole('button', { name: 'Open menu' })
    fireEvent.click(trigger)
    expect(screen.getByRole('menu')).toBeTruthy()

    fireEvent.click(trigger)
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('never focuses or navigates to a disabled item', () => {
    render(
      <DropdownMenu trigger={<Button variant="secondary">Open menu</Button>}>
        <MenuItem label="First" disabled onClick={() => {}} />
        <MenuItem label="Second" onClick={() => {}} />
        <MenuItem label="Third" disabled onClick={() => {}} />
      </DropdownMenu>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    const enabled = () => screen.getAllByRole('menuitem').filter((el) => !el.hasAttribute('disabled'))

    // The open effect skips the disabled leading item.
    expect(document.activeElement).toBe(enabled()[0])

    // ArrowDown from the only enabled item wraps back to it.
    fireEvent.keyDown(enabled()[0], { key: 'ArrowDown' })
    expect(document.activeElement).toBe(enabled()[0])

    // Home / End also stay on the enabled item.
    fireEvent.keyDown(enabled()[0], { key: 'End' })
    expect(document.activeElement).toBe(enabled()[0])
  })

  it('starts navigation from the edges when focus is not on a menu item', () => {
    renderMenu()
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    items()[0].blur()
    expect(document.activeElement).not.toBe(items()[0])

    // activeIndex === -1: ArrowDown starts at the first item...
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' })
    expect(document.activeElement).toBe(items()[0])

    // ...and ArrowUp starts at the last item.
    items()[0].blur()
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowUp' })
    expect(document.activeElement).toBe(items()[1])
  })

  it('moves focus into an already open menu when the trigger gets arrow keys', () => {
    renderMenu()
    const trigger = screen.getByRole('button', { name: 'Open menu' })
    fireEvent.click(trigger)
    // Focus is still on the trigger after a pointer opening.
    trigger.focus()

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(items()[0])

    fireEvent.keyDown(trigger, { key: 'ArrowUp' })
    expect(document.activeElement).toBe(items()[1])
  })

  it('does not crash when the menu has no items', () => {
    render(
      <DropdownMenu trigger={<Button variant="secondary">Open menu</Button>}>
        <MenuSeparator />
      </DropdownMenu>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' })
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'End' })

    expect(screen.queryByRole('menu')).toBeTruthy()
  })
})