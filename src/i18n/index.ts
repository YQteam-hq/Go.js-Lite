import zh from './locales/zh'
import type { Translation } from './locales/zh'

export type { Translation }

export const SUPPORTED_LOCALES = ['zh', 'en'] as const
export type LocaleKey = (typeof SUPPORTED_LOCALES)[number]

export const BOOTSTRAP_LOCALE: LocaleKey = 'zh'

interface LocaleModule {
  default: Translation
}

const loaders: Record<LocaleKey, () => Promise<LocaleModule>> = {
  zh: () => Promise.resolve({ default: zh }),
  en: () => import('./locales/en'),
}

const catalogues = new Map<LocaleKey, Translation>([[BOOTSTRAP_LOCALE, zh]])

export function isLocaleLoaded(key: LocaleKey): boolean {
  return catalogues.has(key)
}

export function getLocale(key: LocaleKey): Translation {
  return catalogues.get(key) ?? zh
}

export async function loadLocale(key: LocaleKey): Promise<void> {
  if (catalogues.has(key)) return
  const module = await loaders[key]()
  catalogues.set(key, module.default)
}

export async function resolveLocale(key: LocaleKey): Promise<LocaleKey> {
  try {
    await loadLocale(key)
    return key
  } catch {
    return BOOTSTRAP_LOCALE
  }
}
