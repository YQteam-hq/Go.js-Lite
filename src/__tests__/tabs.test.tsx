import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

function TabsHarness() {
  const [value, setValue] = useState('first');
  return (
    <Tabs value={value} onValueChange={setValue}>
      <TabsList>
        <TabsTrigger value="first">First</TabsTrigger>
        <TabsTrigger value="second">Second</TabsTrigger>
        <TabsTrigger value="third">Third</TabsTrigger>
      </TabsList>
      <TabsContent value="first">first panel</TabsContent>
      <TabsContent value="second">second panel</TabsContent>
      <TabsContent value="third">third panel</TabsContent>
    </Tabs>
  );
}

function tabs() {
  return screen.getAllByRole('tab');
}

describe('Tabs accessibility', () => {
  it('wires every tab to the panel it controls', () => {
    render(<TabsHarness />);
    const [first] = tabs();
    const controls = first.getAttribute('aria-controls');
    expect(controls).toBeTruthy();

    const panel = document.getElementById(controls as string);
    expect(panel).toBeTruthy();
    expect(panel?.getAttribute('role')).toBe('tabpanel');
    expect(panel?.getAttribute('aria-labelledby')).toBe(first.id);
  });

  it('keeps a single stop in the tab order', () => {
    render(<TabsHarness />);
    const [first, second, third] = tabs();
    expect(first.getAttribute('tabindex')).toBe('0');
    expect(second.getAttribute('tabindex')).toBe('-1');
    expect(third.getAttribute('tabindex')).toBe('-1');
  });

  it('moves the selection with the arrow keys', () => {
    render(<TabsHarness />);
    const [, second] = tabs();
    second.focus();

    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { selected: true })).toBe(tabs()[2]);

    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowLeft' });
    expect(screen.getByRole('tab', { selected: true })).toBe(tabs()[1]);

    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'Home' });
    expect(screen.getByRole('tab', { selected: true })).toBe(tabs()[0]);

    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'End' });
    expect(screen.getByRole('tab', { selected: true })).toBe(tabs()[2]);
  });

  it('shows the panel that belongs to the selected tab', () => {
    render(<TabsHarness />);
    expect(screen.getByText('first panel')).toBeTruthy();

    fireEvent.click(tabs()[1]);
    expect(screen.getByText('second panel')).toBeTruthy();
    expect(screen.queryByText('first panel')).toBeNull();
  });

  it('exposes the orientation of the tab list', () => {
    render(<TabsHarness />);
    expect(screen.getByRole('tablist').getAttribute('aria-orientation')).toBe('horizontal');
  });
});
