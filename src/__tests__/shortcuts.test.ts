import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { isCommandPaletteShortcut, isTextEntryTarget } from '@/lib/shortcuts';

function element(tag: string): HTMLElement {
  return document.createElement(tag);
}

function shortcut(target: EventTarget | null, overrides: Partial<{ key: string; metaKey: boolean; ctrlKey: boolean; altKey: boolean }> = {}) {
  return {
    key: 'k',
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    target,
    ...overrides,
  };
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('isTextEntryTarget', () => {
  it('recognises the fields that own their keys', () => {
    expect(isTextEntryTarget(element('input'))).toBe(true);
    expect(isTextEntryTarget(element('textarea'))).toBe(true);
    expect(isTextEntryTarget(element('select'))).toBe(true);
  });

  it('recognises a contenteditable region', () => {
    const region = element('div');
    region.setAttribute('contenteditable', 'true');
    expect(isTextEntryTarget(region)).toBe(true);
  });

  it('leaves ordinary elements and missing targets alone', () => {
    expect(isTextEntryTarget(element('div'))).toBe(false);
    expect(isTextEntryTarget(document.body)).toBe(false);
    expect(isTextEntryTarget(null)).toBe(false);
    expect(isTextEntryTarget(new EventTarget())).toBe(false);
  });
});

describe('isCommandPaletteShortcut', () => {
  it('accepts the shortcut with either platform modifier', () => {
    expect(isCommandPaletteShortcut(shortcut(document.body, { metaKey: true }))).toBe(true);
    expect(isCommandPaletteShortcut(shortcut(document.body, { ctrlKey: true }))).toBe(true);
    expect(isCommandPaletteShortcut(shortcut(document.body, { metaKey: true, key: 'K' }))).toBe(true);
  });

  it('ignores a plain key press and other keys', () => {
    expect(isCommandPaletteShortcut(shortcut(document.body))).toBe(false);
    expect(isCommandPaletteShortcut(shortcut(document.body, { metaKey: true, key: 'j' }))).toBe(false);
  });

  it('ignores AltGr style combinations', () => {
    expect(isCommandPaletteShortcut(shortcut(document.body, { ctrlKey: true, altKey: true }))).toBe(false);
  });

  it('stays out of the fields the user is typing in', () => {
    expect(isCommandPaletteShortcut(shortcut(element('input'), { metaKey: true }))).toBe(false);
    expect(isCommandPaletteShortcut(shortcut(element('textarea'), { ctrlKey: true }))).toBe(false);
    expect(isCommandPaletteShortcut(shortcut(element('select'), { metaKey: true }))).toBe(false);
  });

  it('keeps a key press inside an editor away from the palette', () => {
    const editor = element('textarea');
    document.body.appendChild(editor);
    const onShortcut = vi.fn();
    const listener = (event: KeyboardEvent) => {
      if (isCommandPaletteShortcut(event)) onShortcut();
    };
    window.addEventListener('keydown', listener);

    fireEvent.keyDown(editor, { key: 'k', ctrlKey: true });
    expect(onShortcut).not.toHaveBeenCalled();

    fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
    expect(onShortcut).toHaveBeenCalledTimes(1);

    window.removeEventListener('keydown', listener);
  });
});
