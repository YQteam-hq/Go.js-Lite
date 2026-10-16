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
})