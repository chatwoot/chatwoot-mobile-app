import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackRender?: (args: { error: Error; resetErrorBoundary: () => void }) => React.ReactNode;
}

interface ErrorBoundaryState {
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: undefined };
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    // Optionally integrate logging here (e.g., Sentry). Sentry.wrap is already applied at root.
    // console.error('ErrorBoundary caught error:', error);
  }

  resetErrorBoundary() {
    this.setState({ error: undefined });
  }

  render(): React.ReactNode {
    const { children, fallbackRender } = this.props;
    const { error } = this.state;
    if (error && fallbackRender) {
      return fallbackRender({ error, resetErrorBoundary: this.resetErrorBoundary });
    }
    return children;
  }
}

export default ErrorBoundary;


