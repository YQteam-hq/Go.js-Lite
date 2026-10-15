import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Progress } from '@/components/ui/Progress';

describe('Progress', () => {
  it('exposes the value through ARIA and a percentage text', () => {
    const { container } = render(<Progress value={50} />);
    const bar = container.querySelector('[role="progressbar"]') as HTMLElement;
    expect(bar.getAttribute('aria-valuenow')).toBe('50');
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
    expect(bar.getAttribute('aria-valuetext')).toBe('50%');
  });

  it('uses theme tokens instead of hard-coded gray and blue', () => {
    const { container } = render(<Progress value={30} />);
    const bar = container.querySelector('[role="progressbar"]') as HTMLElement;
    expect(bar.className).toContain('bg-bg-sunken');
    expect(bar.className).not.toContain('bg-gray-200');
    const fill = bar.firstElementChild as HTMLElement;
    expect(fill.className).toContain('bg-accent');
    expect(fill.className).not.toContain('bg-blue-500');
  });

  it('fills the bar to the computed percentage for a custom max', () => {
    const { container } = render(<Progress value={1} max={4} />);
    const bar = container.querySelector('[role="progressbar"]') as HTMLElement;
    expect(bar.getAttribute('aria-valuemax')).toBe('4');
    const fill = bar.firstElementChild as HTMLElement;
    expect(fill.style.width).toBe('25%');
  });

  it('clamps the percentage and keeps a custom className', () => {
    const { container } = render(<Progress value={200} className="my-progress" />);
    const bar = container.querySelector('[role="progressbar"]') as HTMLElement;
    const fill = bar.firstElementChild as HTMLElement;
    expect(fill.style.width).toBe('100%');
    expect(bar.className).toContain('my-progress');
  });
});
