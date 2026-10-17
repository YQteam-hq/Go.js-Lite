import { beforeAll, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { loadLocale } from '@/i18n';
import { useUiStore } from '@/stores/uiStore';

beforeAll(async () => {
  await loadLocale('en');
  useUiStore.setState({ language: 'en' });
});

describe('BottomSheet', () => {
  it('renders its content and a localized close button when open', () => {
    render(
      <BottomSheet open title="Menu" onClose={() => {}}>
        <p>Sheet body</p>
      </BottomSheet>
    );
    expect(screen.getByText('Sheet body')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open title="Menu" onClose={onClose}>
        <p>Sheet body</p>
      </BottomSheet>
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <BottomSheet open={false} title="Menu" onClose={() => {}}>
        <p>Sheet body</p>
      </BottomSheet>
    );
    expect(container.firstChild).toBeNull();
  });
});
