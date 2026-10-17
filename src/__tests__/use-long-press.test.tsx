import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { MouseEvent, TouchEvent } from 'react';
import { useLongPress } from '@/hooks/useLongPress';

function mouseDown(x = 0, y = 0) {
  return { button: 0, clientX: x, clientY: y } as unknown as MouseEvent<HTMLElement>;
}

function touchStart(x = 0, y = 0) {
  return { touches: [{ clientX: x, clientY: y }] } as unknown as TouchEvent<HTMLElement>;
}

describe('useLongPress', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires the callback once the delay elapses', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useLongPress(callback, { delay: 500 }));

    act(() => {
      result.current.handlers.onMouseDown(mouseDown());
    });
    expect(result.current.active).toBe(true);
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.active).toBe(false);
  });

  it('ignores non-primary mouse buttons', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useLongPress(callback, { delay: 500 }));

    act(() => {
      result.current.handlers.onMouseDown({ button: 2 } as unknown as MouseEvent<HTMLElement>);
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(callback).not.toHaveBeenCalled();
  });

  it('does not fire when the pointer is released before the delay', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useLongPress(callback, { delay: 500 }));

    act(() => {
      result.current.handlers.onMouseDown(mouseDown());
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    act(() => {
      result.current.handlers.onMouseUp();
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(callback).not.toHaveBeenCalled();
    expect(result.current.active).toBe(false);
  });

  it('cancels the gesture when the pointer moves away', () => {
    const callback = vi.fn();
    const onEnd = vi.fn();
    const { result } = renderHook(() => useLongPress(callback, { delay: 500, onEnd }));

    act(() => {
      result.current.handlers.onMouseDown(mouseDown(10, 10));
    });
    act(() => {
      result.current.handlers.onMouseMove(mouseDown(80, 10));
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(callback).not.toHaveBeenCalled();
    expect(result.current.active).toBe(false);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('supports touch input', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useLongPress(callback, { delay: 400 }));

    act(() => {
      result.current.handlers.onTouchStart(touchStart());
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('calls onEnd exactly once when the gesture finishes', () => {
    const onEnd = vi.fn();
    const { result } = renderHook(() => useLongPress(vi.fn(), { delay: 500, onEnd }));

    act(() => {
      result.current.handlers.onMouseDown(mouseDown());
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    // The pointer-up and leave events that follow a finished gesture used to
    // fire onEnd a second and third time.
    act(() => {
      result.current.handlers.onMouseUp();
    });
    act(() => {
      result.current.handlers.onMouseLeave();
    });
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('drops the pending timer on unmount', () => {
    const callback = vi.fn();
    const { result, unmount } = renderHook(() => useLongPress(callback, { delay: 500 }));

    act(() => {
      result.current.handlers.onMouseDown(mouseDown());
    });
    unmount();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(callback).not.toHaveBeenCalled();
  });

  it('restarts the timer when a new press begins before the delay', () => {
    const callback = vi.fn();
    const onEnd = vi.fn();
    const { result } = renderHook(() => useLongPress(callback, { delay: 500, onEnd }));

    act(() => {
      result.current.handlers.onMouseDown(mouseDown());
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    // A second press without releasing the first replaces the pending timer,
    // so the original deadline passes without firing anything.
    act(() => {
      result.current.handlers.onMouseDown(mouseDown());
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(callback).not.toHaveBeenCalled();
    expect(onEnd).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });
});
