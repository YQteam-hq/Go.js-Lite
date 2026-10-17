import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

function TabsHarness({ initial = 'one' }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <Tabs value={value} onValueChange={setValue}>
      <TabsList aria-label="Sample tabs">
        <TabsTrigger value="one">One</TabsTrigger>
        <TabsTrigger value="two">Two</TabsTrigger>
        <TabsTrigger value="three">Three</TabsTrigger>
      </TabsList>
      <TabsContent value="one">Panel one</TabsContent>
      <TabsContent value="two">Panel two</TabsContent>
      <TabsContent value="three">Panel three</TabsContent>
    </Tabs>
  );
}

function tabs(): HTMLElement[] {
  return screen.getAllByRole('tab') as HTMLElement[];
}

describe('Tabs', () => {
  it('marks the active tab and links the panel in both directions', () => {
    render(<TabsHarness />);
    const [one, two] = tabs();
    expect(one.getAttribute('aria-selected')).toBe('true');
    expect(two.getAttribute('aria-selected')).toBe('false');

    const panel = screen.getByRole('tabpanel');
    expect(panel.id).toBe(one.getAttribute('aria-controls'));
    expect(panel.getAttribute('aria-labelledby')).toBe(one.id);
    expect(panel.textContent).toBe('Panel one');
  });

  it('keeps a single tab stop with the roving tabindex', () => {
    render(<TabsHarness />);
    expect(tabs().map(tab => tab.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
  });

  it('selects the next tab with ArrowRight and wraps with ArrowLeft', () => {
    render(<TabsHarness />);
    const [one, two, three] = tabs();
    one.focus();

    fireEvent.keyDown(one, { key: 'ArrowRight' });
    expect(two.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(two);

    fireEvent.keyDown(two, { key: 'ArrowLeft' });
    expect(one.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(one);

    fireEvent.keyDown(one, { key: 'ArrowLeft' });
    expect(three.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(three);
  });

  it('jumps to the ends with Home and End', () => {
    render(<TabsHarness />);
    const [one, two, three] = tabs();
    two.focus();

    fireEvent.keyDown(two, { key: 'End' });
    expect(three.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(three);

    fireEvent.keyDown(three, { key: 'Home' });
    expect(one.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(one);
  });

  it('uses the vertical axis when the tablist is oriented vertically', () => {
    render(
      <Tabs value="one" onValueChange={() => {}}>
        <TabsList aria-orientation="vertical">
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    const [one, two] = tabs();
    one.focus();

    fireEvent.keyDown(one, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(one);

    fireEvent.keyDown(one, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(two);
  });

  it('still selects a tab on click', () => {
    render(<TabsHarness />);
    fireEvent.click(tabs()[2]);
    expect(tabs()[2].getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tabpanel').textContent).toBe('Panel three');
  });

  it('calls onValueChange for controlled consumers', () => {
    const onValueChange = vi.fn();
    render(
      <Tabs value="one" onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    const [one] = tabs();
    one.focus();
    fireEvent.keyDown(one, { key: 'ArrowRight' });
    expect(onValueChange).toHaveBeenCalledWith('two');
  });

  it('skips disabled tabs when navigating with the arrow keys', () => {
    render(
      <Tabs value="one" onValueChange={() => {}}>
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two" disabled>
            Two
          </TabsTrigger>
          <TabsTrigger value="three">Three</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    const [one, two, three] = tabs();
    expect(two.hasAttribute('disabled')).toBe(true);
    one.focus();

    // ArrowRight from the first tab skips the disabled middle tab.
    fireEvent.keyDown(one, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(three);

    // ArrowLeft wraps back to the first tab, again skipping the disabled one.
    fireEvent.keyDown(three, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(one);
  });

  it('does nothing when every tab is disabled', () => {
    render(
      <Tabs value="one" onValueChange={() => {}}>
        <TabsList>
          <TabsTrigger value="one" disabled>
            One
          </TabsTrigger>
          <TabsTrigger value="two" disabled>
            Two
          </TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    const list = screen.getByRole('tablist');
    const [one] = tabs();
    one.focus();

    fireEvent.keyDown(list, { key: 'ArrowRight' });
    fireEvent.keyDown(list, { key: 'End' });
    // Focus stays where it was and nothing crashes.
    expect(document.activeElement).toBe(one);
  });

  it('ignores keys that are not navigation keys', () => {
    render(<TabsHarness />);
    const [one] = tabs();
    one.focus();

    fireEvent.keyDown(one, { key: 'Enter' });
    fireEvent.keyDown(one, { key: 'a' });
    expect(document.activeElement).toBe(one);
    expect(one.getAttribute('aria-selected')).toBe('true');
  });

  it('paints with the semantic tokens instead of the raw palette', () => {
    render(<TabsHarness />);
    const list = screen.getByRole('tablist');
    expect(list.className).toContain('bg-bg-sunken');
    expect(list.className).not.toMatch(/bg-gray-\d+/);
    expect(tabs()[0].className).toContain('bg-bg-elevated');
    expect(tabs()[0].className).not.toMatch(/bg-white/);
  });
});
