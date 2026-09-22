import type { DeprecationNotice } from '@shared/types'

const REQUIRED_TEXT_FIELDS = ['id', 'feature', 'target', 'replacement', 'removeIn', 'message'] as const

function isNotice(value: unknown): value is DeprecationNotice {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const record = value as Record<string, unknown>
  return REQUIRED_TEXT_FIELDS.every((field) => typeof record[field] === 'string')
}

export function normalizeDeprecations(value: unknown): DeprecationNotice[] {
  let entries: unknown[]

  if (Array.isArray(value)) {
    entries = value
  } else if (value !== null && typeof value === 'object') {
    entries = Object.values(value)
  } else {
    entries = []
  }

  return entries.filter(isNotice)
}
