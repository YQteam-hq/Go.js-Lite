import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Toaster } from '@/components/ui/Toast';
import { DEFAULT_TOAST_DURATION, useUiStore } from '@/stores/uiStore';

interface ToastOverrides {
  type?: 'success' | 'error' | 'info' | 'warning'
  title?: string
  description?: string
  duration?: number
}

function addToast(overrides: ToastOverrides = {}) {
  return useUiStore.getState().addToast({ type: 'info', title: 'Saved', ...overrides })
}

beforeEach(() => {
  useUiStore.setState({ toasts: [] });
});

afterEach(() => {
  vi.useRealTimers();
  useUiStore.setState({ toasts: [] });
});

describe('Toaster', () => {
  it('announces errors assertively and other types politely', () => {
    addToast({ type: 'error', title: 'Failed', duration: 0 });
    addToast({ type: 'success', title: 'Done', duration: 0 });
    render(<Toaster />);

    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getAllByRole('status')).toHaveLength(1);
  });

  it('dismisses a toast once its duration elapses', () => {
    vi.useFakeTimers();
    addToast({ duration: DEFAULT_TOAST_DURATION });
    render(<Toaster />);
    expect(useUiStore.getState().toasts).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(DEFAULT_TOAST_DURATION + 400);
    });
    expect(useUiStore.getState().toasts).toHaveLength(0);
  });

  it('keeps a toast with a zero duration on screen', () => {
    vi.useFakeTimers();
    addToast({ duration: 0 });
    render(<Toaster />);

    act(() => {
      vi.advanceTimersByTime(DEFAULT_TOAST_DURATION * 2);
    });
    expect(useUiStore.getState().toasts).toHaveLength(1);
  });

  it('pauses the countdown while the pointer rests on the toast', () => {
    vi.useFakeTimers();
    addToast({ duration: 1000 });
    render(<Toaster />);

    const toast = screen.getByText('Saved').closest('[role="status"]') as HTMLElement;
    act(() => {
      fireEvent.mouseEnter(toast);
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(useUiStore.getState().toasts).toHaveLength(1);

    act(() => {
      fireEvent.mouseLeave(toast);
    });
    act(() => {
      vi.advanceTimersByTime(1400);
    });
    expect(useUiStore.getState().toasts).toHaveLength(0);
  });

  it('closes when the dismiss button is pressed', () => {
    vi.useFakeTimers();
    addToast({ duration: 0 });
    render(<Toaster />);

    const toast = screen.getByText('Saved').closest('[role="status"]') as HTMLElement
    act(() => {
      fireEvent.click(toast.querySelector('button') as HTMLElement);
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(useUiStore.getState().toasts).toHaveLength(0);
  });
});
