import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useState } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

function Boom({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('boom');
  }
  return <div>safe content</div>;
}

describe('ErrorBoundary', () => {
  it('renders the fallback when a child throws', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary fallback={<div>something broke</div>}>
        <Boom shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText('something broke')).toBeTruthy();
    consoleError.mockRestore();
  });

  it('reports the error through componentDidCatch and onError', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError} fallback={<div>broken</div>}>
        <Boom shouldThrow />
      </ErrorBoundary>
    );
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('recovers when resetKeys change', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender } = render(
      <ErrorBoundary resetKeys={[true]} fallback={<div>broken</div>}>
        <Boom shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText('broken')).toBeTruthy();
    rerender(
      <ErrorBoundary resetKeys={[false]} fallback={<div>broken</div>}>
        <Boom shouldThrow={false} />
      </ErrorBoundary>
    );
    await waitFor(() => expect(screen.getByText('safe content')).toBeTruthy());
    consoleError.mockRestore();
  });

  it('exposes a reset function to a render-prop fallback', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    function Harness() {
      const [throwIt, setThrowIt] = useState(true);
      return (
        <ErrorBoundary
          fallback={({ reset }) => (
            <button
              onClick={() => {
                setThrowIt(false);
                reset();
              }}
            >
              retry
            </button>
          )}
        >
          <Boom shouldThrow={throwIt} />
        </ErrorBoundary>
      );
    }
    render(<Harness />);
    expect(screen.getByText('retry')).toBeTruthy();
    fireEvent.click(screen.getByText('retry'));
    await waitFor(() => expect(screen.getByText('safe content')).toBeTruthy());
    consoleError.mockRestore();
  });
});
