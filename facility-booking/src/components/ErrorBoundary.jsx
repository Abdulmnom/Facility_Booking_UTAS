import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unknown error' };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="dark-card" style={{ maxWidth: 480, width: '100%', textAlign: 'center', padding: 36 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚠</div>
            <h2 style={{ color: '#fff', fontWeight: 700, marginBottom: 8 }}>Something went wrong</h2>
            <p style={{ color: 'var(--clr-muted)', fontSize: '.9rem', marginBottom: 20 }}>{this.state.message}</p>
            <button
              className="btn-teal btn px-4 py-2"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
