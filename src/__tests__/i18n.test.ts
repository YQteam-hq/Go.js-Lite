import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { SUPPORTED_LOCALES, getLocale, loadLocale } from '@/i18n';
import type { Translation } from '@/i18n';
import { useI18n } from '@/hooks/useI18n';
import { useUiStore } from '@/stores/uiStore';

type Entry = [string, string];

let zh: Translation;
let en: Translation;

beforeAll(async () => {
  await loadLocale('en');
  zh = getLocale('zh');
  en = getLocale('en');
});

function walk(value: unknown, prefix: string, visit: (key: string, text: string) => void): void {
  if (value === null || typeof value !== 'object') {
    if (prefix) visit(prefix, String(value));
    return;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    walk(child, prefix ? `${prefix}.${key}` : key, visit);
  }
}

function collect(value: unknown): Entry[] {
  const entries: Entry[] = [];
  walk(value, '', (key, text) => entries.push([key, text]));
  return entries;
}

function placeholders(text: string): string[] {
  return (text.match(/\{(\w+)\}/g) ?? []).slice().sort();
}

function useSubject() {
  return useI18n();
}

beforeEach(() => {
  useUiStore.setState({ language: 'zh' });
});

describe('locale catalogues', () => {
  it('exposes chinese and english', () => {
    expect(SUPPORTED_LOCALES).toEqual(['zh', 'en']);
  });

  it('defines the same keys in both languages', () => {
    const zhKeys = collect(zh)
      .map(([key]) => key)
      .sort();
    const enKeys = collect(en)
      .map(([key]) => key)
      .sort();
    expect(enKeys).toEqual(zhKeys);
  });

  it('never leaves a message empty', () => {
    for (const [key, text] of collect(zh)) {
      expect(text.trim().length, key).toBeGreaterThan(0);
    }
    for (const [key, text] of collect(en)) {
      expect(text.trim().length, key).toBeGreaterThan(0);
    }
  });

  it('uses the same placeholders in both languages', () => {
    const zhMap = new Map(
      collect(zh).map(([key, text]) => [key, placeholders(text).join('|')])
    );
    const enMap = new Map(
      collect(en).map(([key, text]) => [key, placeholders(text).join('|')])
    );

    for (const [key, value] of zhMap) {
      expect(enMap.get(key), key).toBe(value);
    }
  });

  it('ships more than a trivial number of messages', () => {
    expect(collect(zh).length).toBeGreaterThan(200);
  });
});

describe('useI18n', () => {
  it('returns the value of the active language', () => {
    const { result } = renderHook(() => useSubject());
    expect(result.current.language).toBe('zh');
    expect(result.current.t('common.save')).toBe(zh.common.save);
    expect(result.current.t('errors.notFound')).toBe(zh.errors.notFound);
  });

  it('follows a language switch', () => {
    useUiStore.setState({ language: 'en' });
    const { result } = renderHook(() => useSubject());
    expect(result.current.language).toBe('en');
    expect(result.current.t('common.save')).toBe(en.common.save);
  });

  it('falls back to the key when it is unknown', () => {
    const { result } = renderHook(() => useSubject());
    expect(result.current.t('common.doesNotExist')).toBe('common.doesNotExist');
    expect(result.current.t('nope')).toBe('nope');
  });

  it('interpolates named params', () => {
    const { result } = renderHook(() => useSubject());
    expect(result.current.t('common.minutesAgo', { count: 5 })).toBe(
      zh.common.minutesAgo.replace('{count}', '5')
    );
    expect(result.current.t('codeEditor.lineCount', { count: 12 })).toBe(
      zh.codeEditor.lineCount.replace('{count}', '12')
    );
  });

  it('returns the raw message when no params are given', () => {
    const { result } = renderHook(() => useSubject());
    expect(result.current.t('common.minutesAgo')).toBe(zh.common.minutesAgo);
  });

  it('leaves a placeholder untouched when the param is missing', () => {
    const { result } = renderHook(() => useSubject());
    expect(result.current.t('common.minutesAgo', { other: 1 })).toBe(zh.common.minutesAgo);
  });

  it('reports whether a key exists', () => {
    const { result } = renderHook(() => useSubject());
    expect(result.current.hasKey('common.save')).toBe(true);
    expect(result.current.hasKey('errors.unauthorized')).toBe(true);
    expect(result.current.hasKey('common.doesNotExist')).toBe(false);
    expect(result.current.hasKey('nope')).toBe(false);
  });

  it('rejects a key that points at an object', () => {
    const { result } = renderHook(() => useSubject());
    expect(result.current.hasKey('common')).toBe(false);
  });

  it('updates the language through the hook', async () => {
    const { result } = renderHook(() => useSubject());

    await act(async () => {
      await result.current.setLanguage('en');
    });

    expect(useUiStore.getState().language).toBe('en');
    expect(result.current.t('common.save')).toBe(en.common.save);
  });

  it('falls back to chinese for an unsupported language', () => {
    useUiStore.setState({ language: 'fr' as never });
    const { result } = renderHook(() => useSubject());
    expect(result.current.t('common.save')).toBe(zh.common.save);
  });
});

describe('lazy locale loading', () => {
  it('materialises only the bootstrap catalogue up front', async () => {
    vi.resetModules();
    const fresh = await import('@/i18n');
    expect(fresh.isLocaleLoaded(fresh.BOOTSTRAP_LOCALE)).toBe(true);
    expect(fresh.isLocaleLoaded('en')).toBe(false);
  });

  it('serves the bootstrap catalogue until the requested one arrives', async () => {
    vi.resetModules();
    const fresh = await import('@/i18n');
    const bootstrap = fresh.getLocale(fresh.BOOTSTRAP_LOCALE);
    expect(fresh.getLocale('en')).toBe(bootstrap);
    await fresh.loadLocale('en');
    expect(fresh.getLocale('en')).not.toBe(bootstrap);
  });

  it('loads a catalogue at most once', async () => {
    vi.resetModules();
    const fresh = await import('@/i18n');
    await fresh.loadLocale('en');
    const first = fresh.getLocale('en');
    await fresh.loadLocale('en');
    expect(fresh.getLocale('en')).toBe(first);
  });

  it('switches the language only once the catalogue is in place', async () => {
    vi.resetModules();
    const fresh = await import('@/i18n');
    const ui = await import('@/stores/uiStore');

    ui.useUiStore.setState({ language: 'zh' });
    expect(fresh.isLocaleLoaded('en')).toBe(false);

    const pending = ui.useUiStore.getState().setLanguage('en');
    expect(fresh.isLocaleLoaded('en')).toBe(false);
    expect(ui.useUiStore.getState().language).toBe('zh');

    await pending;

    expect(fresh.isLocaleLoaded('en')).toBe(true);
    expect(ui.useUiStore.getState().language).toBe('en');
  });

  it('reports the requested locale once it is in place', async () => {
    vi.resetModules();
    const fresh = await import('@/i18n');
    await expect(fresh.resolveLocale('en')).resolves.toBe('en');
    await expect(fresh.resolveLocale('zh')).resolves.toBe('zh');
  });

  it('falls back to the bootstrap locale when a chunk cannot be fetched', async () => {
    vi.resetModules();
    vi.doMock('@/i18n/locales/en', () => {
      throw new Error('chunk load failed');
    });
    const fresh = await import('@/i18n');

    await expect(fresh.loadLocale('en')).rejects.toThrow();
    await expect(fresh.resolveLocale('en')).resolves.toBe(fresh.BOOTSTRAP_LOCALE);
    expect(fresh.isLocaleLoaded('en')).toBe(false);

    vi.doUnmock('@/i18n/locales/en');
    vi.resetModules();
  });

  it('treats the bootstrap catalogue as always available', async () => {
    vi.resetModules();
    const fresh = await import('@/i18n');
    const ui = await import('@/stores/uiStore');

    await ui.useUiStore.getState().setLanguage(fresh.BOOTSTRAP_LOCALE);

    expect(fresh.isLocaleLoaded(fresh.BOOTSTRAP_LOCALE)).toBe(true);
    expect(ui.useUiStore.getState().language).toBe(fresh.BOOTSTRAP_LOCALE);
    expect(fresh.BOOTSTRAP_LOCALE).toBe('zh');
  });
});
