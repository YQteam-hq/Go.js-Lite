import { beforeAll, describe, expect, it } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Input, Textarea } from '@/components/ui/Input';
import { loadLocale } from '@/i18n';
import { useUiStore } from '@/stores/uiStore';

beforeAll(async () => {
  await loadLocale('en');
  useUiStore.setState({ language: 'en' });
});

describe('Input', () => {
  it('renders a text input that forwards its props', () => {
    render(<Input placeholder="Search" type="search" />);
    const input = screen.getByPlaceholderText('Search') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.type).toBe('search');
  });

  it('marks the input invalid when requested', () => {
    const { container } = render(<Input invalid placeholder="Name" />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.className).toContain('input-invalid');
  });

  it('forwards the ref to the underlying input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} placeholder="Name" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('renders the leading icon', () => {
    const { container } = render(<Input icon={<span data-testid="ico" />} placeholder="Name" />);
    expect(container.querySelector('[data-testid="ico"]')).toBeTruthy();
    expect(container.querySelector('input')?.className).toContain('pl-10');
  });
});

describe('Textarea', () => {
  it('renders a textarea element', () => {
    const { container } = render(<Textarea placeholder="Notes" />);
    expect(container.querySelector('textarea')).toBeTruthy();
  });

  it('marks the textarea invalid when requested', () => {
    const { container } = render(<Textarea invalid placeholder="Notes" />);
    expect(container.querySelector('textarea')?.className).toContain('input-invalid');
  });
});
