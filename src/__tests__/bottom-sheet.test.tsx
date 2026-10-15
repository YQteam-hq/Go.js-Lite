import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';

vi.mock('@/hooks/useI18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

import { BottomSheet } from '@/components/ui/BottomSheet';

describe('BottomSheet', () => {
  it('exposes dialog semantics and a labelled title', () => {
    const { container } = render(
      <BottomSheet open title="Settings" onClose={() => {}}>
        <p>sheet body</p>
      </BottomSheet>
    );
    const dialog = container.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    const labelledBy = dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    const titleEl = document.getElementById(labelledBy as string);
    expect(titleEl?.textContent).toBe('Settings');
  });

  it('moves focus into the sheet on open and closes on Escape', () => {
    const onClose = vi.fn();
    const { container } = render(
      <BottomSheet open onClose={onClose} title="Menu">
        <button>action</button>
      </BottomSheet>
    );
    const dialog = container.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog.contains(document.activeElement)).toBe(true);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when the backdrop is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <BottomSheet open onClose={onClose} title="Menu">
        <p>body</p>
      </BottomSheet>
    );
    const backdrop = container.querySelector('.absolute.inset-0') as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('uses the i18n close label on the close button', () => {
    const { container } = render(
      <BottomSheet open title="Menu" onClose={() => {}}>
        <p>body</p>
      </BottomSheet>
    );
    const closeButton = container.querySelector('[aria-label="common.close"]') as HTMLElement;
    expect(closeButton).toBeTruthy();
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <BottomSheet open={false} title="Menu" onClose={() => {}}>
        <p>body</p>
      </BottomSheet>
    );
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });
});
