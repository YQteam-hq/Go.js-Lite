import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { ComponentProps } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ContextMenu } from '@/components/ui/ContextMenu';
import { useI18n } from '@/hooks/useI18n';
import type { FileEntry } from '@shared/types';
import { loadLocale } from '@/i18n';
import { useUiStore } from '@/stores/uiStore';

beforeAll(async () => {
  await loadLocale('en');
  useUiStore.setState({ language: 'en' });
});

const file = { name: 'report.txt', type: 'file', path: '/report.txt' } as unknown as FileEntry;

function renderMenu(extra: Partial<ComponentProps<typeof ContextMenu>> = {}) {
  type MenuProps = ComponentProps<typeof ContextMenu>;
  const handlers: Omit<MenuProps, 'x' | 'y' | 'file' | 't'> = {
    onClose: vi.fn(),
    onOpen: vi.fn(),
    onRename: vi.fn(),
    onCopy: vi.fn(),
    onMove: vi.fn(),
    onDownload: vi.fn(),
    onDelete: vi.fn(),
    onPermissions: vi.fn(),
  };

  function Wrapper() {
    const { t } = useI18n();
    return <ContextMenu x={10} y={10} file={file} t={t} {...handlers} {...extra} />;
  }

  render(<Wrapper />);
  return handlers;
}

describe('ContextMenu', () => {
  it('lists the core file actions as menu items', () => {
    renderMenu();
    const items = screen.getAllByRole('menuitem');
    expect(items).toHaveLength(7);
    for (const label of ['Open', 'Rename', 'Copy', 'Move', 'Download', 'Permissions', 'Delete']) {
      expect(screen.getByText(label)).toBeTruthy();
    }
  });

  it('runs the action and closes the menu when an item is clicked', () => {
    const handlers = renderMenu();
    fireEvent.click(screen.getByText('Open'));
    expect(handlers.onOpen).toHaveBeenCalledTimes(1);
    expect(handlers.onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when Escape is pressed', () => {
    const handlers = renderMenu();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handlers.onClose).toHaveBeenCalledTimes(1);
  });

  it('hides archive actions unless compression is enabled', () => {
    renderMenu();
    expect(screen.queryByText('Compress to zip')).toBeNull();

    renderMenu({ canZip: true, onZip: vi.fn() });
    expect(screen.getByText('Compress to zip')).toBeTruthy();
  });
});
