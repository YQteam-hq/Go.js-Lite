import { useState } from 'react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { Modal } from '@/components/ui/Modal'

beforeAll(() => {
  // jsdom has no matchMedia, and Modal asks for it through useIsMobile.
  if (typeof window.matchMedia !== 'function') {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia
  }
})

afterEach(() => {
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
})

function Harness({ title }: { title?: string }) {
  const [open, setOpen] = useState(true)
  return (
    <Modal open={open} onClose={() => setOpen(false)} title={title}>
      <p>dialog body</p>
    </Modal>
  )
}

describe('Modal', () => {
  it('renders a titled header with the title wired to the dialog', () => {
    render(<Harness title="Create account" />)
    const dialog = screen.getByRole('dialog')

    expect(screen.getByText('Create account').id).toBe(dialog.getAttribute('aria-labelledby'))
  })

  it('keeps a close control when there is no title', () => {
    render(<Harness />)
    const dialog = screen.getByRole('dialog')
    const closeButton = dialog.querySelector('button') as HTMLButtonElement

    expect(closeButton).toBeTruthy()
    expect(closeButton.getAttribute('aria-label')).toBeTruthy()
    expect(dialog.querySelector('h3')).toBeNull()

    fireEvent.click(closeButton)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('locks the page scroll while it is open', () => {
    const { unmount } = render(<Harness title="Create account" />)
    expect(document.body.style.overflow).toBe('hidden')

    unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('closes on Escape', () => {
    render(<Harness title="Create account" />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('does not close on a backdrop press when it is disabled', () => {
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} closeOnBackdrop={false}>
        <p>body</p>
      </Modal>,
    )
    const backdrop = document.querySelector('.absolute.inset-0') as HTMLElement
    fireEvent.click(backdrop)
    expect(onClose).not.toHaveBeenCalled()
  })
})
