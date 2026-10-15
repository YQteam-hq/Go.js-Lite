import { afterEach, describe, expect, it, vi } from 'vitest'
import { copyText } from '@/lib/clipboard'

function mockExecCommand(result: boolean) {
  return vi.fn(() => result)
}

function stubClipboard(writeText?: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', {
    value: writeText ? { writeText } : undefined,
    configurable: true,
    writable: true,
  })
}

afterEach(() => {
  vi.restoreAllMocks()
  stubClipboard(undefined)
  delete (document as unknown as Record<string, unknown>).execCommand
})

describe('copyText', () => {
  it('rejects empty input without touching the clipboard', async () => {
    const writeText = vi.fn(async () => undefined)
    stubClipboard(writeText)

    await expect(copyText('')).resolves.toBe(false)
    expect(writeText).not.toHaveBeenCalled()
  })

  it('uses the async clipboard API when it is available', async () => {
    const writeText = vi.fn(async () => undefined)
    stubClipboard(writeText)

    await expect(copyText('secret-token')).resolves.toBe(true)
    expect(writeText).toHaveBeenCalledWith('secret-token')
  })

  it('falls back to execCommand when the clipboard API rejects', async () => {
    stubClipboard(() => Promise.reject(new Error('denied')))
    const execCommand = mockExecCommand(true)
    ;(document as unknown as Record<string, unknown>).execCommand = execCommand

    await expect(copyText('fallback-value')).resolves.toBe(true)
    expect(execCommand).toHaveBeenCalledWith('copy')
  })

  it('falls back to execCommand when navigator.clipboard is missing', async () => {
    stubClipboard(undefined)
    const execCommand = mockExecCommand(true)
    ;(document as unknown as Record<string, unknown>).execCommand = execCommand

    await expect(copyText('http-panel')).resolves.toBe(true)
    expect(execCommand).toHaveBeenCalledTimes(1)
  })

  it('reports a failure when every strategy fails', async () => {
    stubClipboard(undefined)
    ;(document as unknown as Record<string, unknown>).execCommand = mockExecCommand(false)

    await expect(copyText('nothing-works')).resolves.toBe(false)
  })

  it('leaves no helper element behind', async () => {
    stubClipboard(undefined)
    ;(document as unknown as Record<string, unknown>).execCommand = mockExecCommand(true)
    const before = document.body.childElementCount

    await copyText('clean-up')
    expect(document.body.childElementCount).toBe(before)
    expect(document.querySelector('textarea')).toBeNull()
  })
})
