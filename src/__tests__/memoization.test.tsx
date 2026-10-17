import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Progress } from '@/components/ui/Progress';
import { Sparkline } from '@/components/ui/Sparkline';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { EmptyState, EmptyFolder, EmptyError, EmptyData } from '@/components/ui/EmptyState';
import { loadLocale } from '@/i18n';
import { useUiStore } from '@/stores/uiStore';

beforeAll(async () => {
  await loadLocale('en');
  useUiStore.setState({ language: 'en' });
});

describe('Progress', () => {
  it('exposes the value as aria-valuenow', () => {
    const { container } = render(<Progress value={30} max={100} />);
    const bar = container.querySelector('[role="progressbar"]') as HTMLElement;
    expect(bar.getAttribute('aria-valuenow')).toBe('30');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
  });
});

describe('Spinner', () => {
  it('renders a status region with the loading label', () => {
    const { container } = render(<Spinner />);
    const status = container.querySelector('[role="status"]') as HTMLElement;
    expect(status).toBeTruthy();
    expect(status.getAttribute('aria-label')).toBe('Loading...');
  });
});

describe('Badge', () => {
  it('applies the muted variant by default and the requested variant', () => {
    const { container, rerender } = render(<Badge>Hi</Badge>);
    expect(container.firstElementChild?.className).toContain('badge-muted');
    expect(screen.getByText('Hi')).toBeTruthy();

    rerender(<Badge variant="danger">x</Badge>);
    expect(container.firstElementChild?.className).toContain('badge-danger');
  });
});

describe('Card', () => {
  it('renders its children inside the card surface', () => {
    const { container } = render(<Card>Body</Card>);
    expect(container.firstElementChild?.className).toContain('card');
    expect(screen.getByText('Body')).toBeTruthy();
  });
});

describe('Skeleton', () => {
  it('is hidden from assistive tech and uses the skeleton class', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.className).toContain('skeleton');
  });

  it('renders one placeholder per line', () => {
    const { container } = render(<SkeletonText lines={4} />);
    expect(container.querySelectorAll('.skeleton').length).toBe(4);
  });
});

describe('Sparkline', () => {
  it('renders a polyline for a data series', () => {
    const { container } = render(<Sparkline data={[1, 4, 2, 8, 3]} />);
    expect(container.querySelector('polyline')).toBeTruthy();
  });

  it('renders a placeholder dash when there is no data', () => {
    render(<Sparkline data={[]} />);
    expect(screen.getByText('—')).toBeTruthy();
  });
});

describe('EmptyState family', () => {
  it('renders the title and an action button when provided', () => {
    const onClick = vi.fn();
    render(<EmptyState title="Nothing here" action={{ label: 'Do it', onClick }} />);
    expect(screen.getByText('Nothing here')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Do it' })).toBeTruthy();
  });

  it('shows an Upload files action for an empty folder only when a handler exists', () => {
    const { unmount } = render(<EmptyFolder onUpload={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Upload Files' })).toBeTruthy();
    unmount();

    render(<EmptyFolder />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('shows the error text and a Retry action', () => {
    const onRetry = vi.fn();
    render(<EmptyError error="boom" onRetry={onRetry} />);
    expect(screen.getByText('boom')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
  });

  it('renders a custom EmptyData title', () => {
    render(<EmptyData title="Custom empty" />);
    expect(screen.getByText('Custom empty')).toBeTruthy();
  });
});
