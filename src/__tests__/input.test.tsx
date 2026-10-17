import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Input, Textarea } from '@/components/ui/Input';

describe('Input accessibility', () => {
  it('exposes aria-invalid when the field is invalid', () => {
    const { container } = render(<Input invalid />);
    expect(container.querySelector('input')?.getAttribute('aria-invalid')).toBe('true');
  });

  it('does not expose aria-invalid by default', () => {
    const { container } = render(<Input />);
    expect(container.querySelector('input')?.hasAttribute('aria-invalid')).toBe(false);
  });

  it('lets an explicit aria-invalid value override the invalid prop', () => {
    const { container } = render(<Input invalid aria-invalid="spelling" />);
    expect(container.querySelector('input')?.getAttribute('aria-invalid')).toBe('spelling');
  });

  it('forwards aria-describedby so errors can be linked', () => {
    const { container } = render(<Input aria-describedby="email-error" />);
    expect(container.querySelector('input')?.getAttribute('aria-describedby')).toBe('email-error');
  });
});

describe('Textarea accessibility', () => {
  it('exposes aria-invalid when the field is invalid', () => {
    const { container } = render(<Textarea invalid />);
    expect(container.querySelector('textarea')?.getAttribute('aria-invalid')).toBe('true');
  });

  it('forwards aria-describedby so errors can be linked', () => {
    const { container } = render(<Textarea aria-describedby="bio-error" />);
    expect(container.querySelector('textarea')?.getAttribute('aria-describedby')).toBe('bio-error');
  });
});
