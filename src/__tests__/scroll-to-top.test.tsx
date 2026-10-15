import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import { ScrollToTop } from '@/components/ScrollToTop';

describe('ScrollToTop', () => {
  it('scrolls to the top when it mounts', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ScrollToTop />
      </MemoryRouter>
    );
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
    scrollTo.mockRestore();
  });

  it('scrolls again when the pathname changes', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(
      <MemoryRouter initialEntries={['/start']}>
        <ScrollToTop />
        <Routes>
          <Route path="/start" element={<Link to="/next">go</Link>} />
          <Route path="/next" element={<span>arrived</span>} />
        </Routes>
      </MemoryRouter>
    );
    expect(scrollTo).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText('go'));
    expect(scrollTo).toHaveBeenCalledTimes(2);
    expect(screen.getByText('arrived')).toBeTruthy();
    scrollTo.mockRestore();
  });
});
