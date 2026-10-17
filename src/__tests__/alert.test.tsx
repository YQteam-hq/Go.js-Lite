import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'

describe('Alert', () => {
  it('maps every variant onto the semantic design tokens', () => {
    const expected: Record<string, string> = {
      default: 'bg-info-soft',
      destructive: 'bg-danger-soft',
      warning: 'bg-warning-soft',
      success: 'bg-success-soft',
    }
    for (const [variant, token] of Object.entries(expected)) {
      const { container, unmount } = render(
        <Alert variant={variant as 'default' | 'destructive' | 'warning' | 'success'}>
          <AlertTitle>Title</AlertTitle>
          <AlertDescription>Description</AlertDescription>
        </Alert>,
      )
      const alert = container.firstElementChild as HTMLElement
      expect(alert.className).toContain(token)
      expect(alert.className).not.toMatch(/bg-(blue|red|yellow|green)-\d+/)
      unmount()
    }
  })

  it('keeps the alert role and renders the title and description', () => {
    render(
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Something happened.</AlertDescription>
      </Alert>,
    )
    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.getByText('Heads up')).toBeTruthy()
    expect(screen.getByText('Something happened.')).toBeTruthy()
  })
})
