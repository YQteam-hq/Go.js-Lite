import { beforeAll, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { Modal } from '@/components/ui/Modal'
import { loadLocale } from '@/i18n'
import { useUiStore } from '@/stores/uiStore'

beforeAll(async () => {
  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  }
  await loadLocale('en')
  useUiStore.setState({ language: 'en' })
})

describe('Modal', () => {
  it('renders the header with the title and the close button', () => {
    render(
      <Modal open onClose={() => {}} title="Edit item">
        <p>Body</p>
      </Modal>,
    )
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3 }).textContent).toBe('Edit item')
    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy()
    expect(screen.getByText('Body')).toBeTruthy()
  })

  it('renders no header when no title is provided', () => {
    render(
      <Modal open onClose={() => {}}>
        <p>Body</p>
      </Modal>,
    )
    expect(screen.queryByRole('heading', { level: 3 })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
    expect(screen.getByText('Body')).toBeTruthy()
  })

  it('closes on Escape through the focus trap', () => {
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} title="Edit item">
        <p>Body</p>
      </Modal>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders nothing while closed', () => {
    render(
      <Modal open={false} onClose={() => {}} title="Edit item">
        <p>Body</p>
      </Modal>,
    )
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
