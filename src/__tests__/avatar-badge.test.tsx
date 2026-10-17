import { beforeAll, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AvatarBadge } from '@/components/ui/AvatarBadge';
import { loadLocale } from '@/i18n';
import { useUiStore } from '@/stores/uiStore';

beforeAll(async () => {
  await loadLocale('en');
  useUiStore.setState({ language: 'en' });
});

describe('AvatarBadge', () => {
  it('derives initials from a single-word username', () => {
    render(<AvatarBadge username="alice" />);
    expect(screen.getByText('AL')).toBeTruthy();
  });

  it('derives initials from the first two words of a username', () => {
    render(<AvatarBadge username="alice wong" />);
    expect(screen.getByText('AW')).toBeTruthy();
  });

  it('splits on dots, underscores and dashes too', () => {
    render(<AvatarBadge username="a.b_c-d" />);
    expect(screen.getByText('AB')).toBeTruthy();
  });

  it('falls back to a question mark when no username is given', () => {
    render(<AvatarBadge />);
    expect(screen.getByText('?')).toBeTruthy();
    expect(screen.getByLabelText('avatar')).toBeTruthy();
  });

  it('labels the avatar with the username', () => {
    render(<AvatarBadge username="alice" />);
    expect(screen.getByLabelText('avatar of alice')).toBeTruthy();
  });

  it('applies the provided color as the background', () => {
    const { container } = render(<AvatarBadge username="alice" color="#123456" />);
    const badge = container.firstElementChild as HTMLElement;
    expect(badge.style.backgroundColor).toBe('rgb(18, 52, 86)');
  });

  it('maps each size onto its dimension classes', () => {
    const { container, rerender } = render(<AvatarBadge username="alice" size="sm" />);
    expect(container.firstElementChild?.className).toContain('w-7 h-7 text-xs');

    rerender(<AvatarBadge username="alice" size="lg" />);
    expect(container.firstElementChild?.className).toContain('w-12 h-12 text-base');
  });
});
