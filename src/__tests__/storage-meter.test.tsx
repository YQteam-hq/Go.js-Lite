import { beforeAll, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StorageMeter } from '@/components/disk/StorageMeter';
import { loadLocale } from '@/i18n';
import { useUiStore } from '@/stores/uiStore';

beforeAll(async () => {
  await loadLocale('en');
  useUiStore.setState({ language: 'en' });
});

describe('StorageMeter', () => {
  it('shows an unavailable message instead of a bar when total is missing', () => {
    const { container } = render(<StorageMeter used={0} total={0} />);
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(container.querySelector('p')).not.toBeNull();
  });

  it('renders a progressbar with the rounded usage percentage', () => {
    render(<StorageMeter used={0} total={100} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toBeTruthy();
    expect(bar.getAttribute('aria-valuenow')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
  });

  it('computes the percentage from used and total', () => {
    render(<StorageMeter used={90} total={100} />);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('90');
  });

  it('describes the bar with used and total bytes', () => {
    render(<StorageMeter used={0} total={100} />);
    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuetext')).toContain('0 B of 100 B');
  });

  it('renders the byte counts for used and free space', () => {
    const { container } = render(<StorageMeter used={0} total={100} />);
    expect(container.textContent).toContain('0 B');
    expect(container.textContent).toContain('100 B');
  });

  it('uses the disk usage heading by default', () => {
    render(<StorageMeter used={0} total={100} />);
    expect(screen.getByText('Disk Usage')).toBeTruthy();
  });
});
