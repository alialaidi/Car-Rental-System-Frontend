import { Component } from 'react';
import type { ReactNode } from 'react';
import { Button } from '../shared/ui';

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }
  componentDidCatch(): void {
    /* Error reporting can be added through an adapter. */
  }

  render() {
    if (this.state.failed)
      return (
        <main className="app-error" role="alert">
          <h1>Something went wrong</h1>
          <p>Reload the page to try again.</p>
          <Button onClick={() => window.location.reload()}>Reload page</Button>
        </main>
      );
    return this.props.children;
  }
}
