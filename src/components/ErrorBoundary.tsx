import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode | ((args: { error: Error; reset: () => void }) => ReactNode);
  onError?: (error: Error, info: ErrorInfo) => void;
  resetKeys?: readonly unknown[];
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface the error during development and keep the only built-in sink
    // available; callers can still forward it to a reporting service via onError.
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, info);
    this.props.onError?.(error, info);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (!this.state.hasError) return;
    const prev = prevProps.resetKeys;
    const next = this.props.resetKeys;
    if (prev === next) return;
    const changed =
      !prev ||
      !next ||
      prev.length !== next.length ||
      next.some((key, index) => !Object.is(prev[index], key));
    if (changed) {
      this.setState({ hasError: false });
    }
  }

  private reset = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const { fallback } = this.props;
      if (typeof fallback === 'function') {
        return fallback({
          error: this.state.error ?? new Error('A previous render failed'),
          reset: this.reset,
        });
      }
      return fallback;
    }
    return this.props.children;
  }
}
