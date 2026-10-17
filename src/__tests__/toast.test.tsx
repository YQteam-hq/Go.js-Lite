import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toaster } from '@/components/ui/Toast';
import { useUiStore } from '@/stores/uiStore';
import { loadLocale } from '@/i18n';

beforeAll(async () => {
  await loadLocale('en');
  useUiStore.setState({ language: 'en' });
});

beforeEach(() => {
  useUiStore.setState({ toasts: [] });
});

describe('Toast', () => {
  it('announces errors assertively through role="alert"', () => {
    useUiStore.getState().addToast({ type: 'error', title: 'Permission denied' });
    render(<Toaster />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeTruthy();
    expect(alert.getAttribute('aria-live')).toBe('assertive');
    expect(alert.getAttribute('aria-atomic')).toBe('true');
    expect(alert.textContent).toContain('Permission denied');
  });

  it('announces non-error toasts politely through role="status"', () => {
    useUiStore.getState().addToast({ type: 'success', title: 'Saved' });
    render(<Toaster />);
    const status = screen.getByRole('status');
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.textContent).toContain('Saved');
  });

  it('exposes a localized close button', () => {
    useUiStore.getState().addToast({ type: 'info', title: 'Heads up' });
    render(<Toaster />);
    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
  });
});
