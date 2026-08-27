import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          backgroundColor: '#050505',
          color: '#fff',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            background: '#0a0f1c',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '500px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#60a5fa', marginBottom: '12px' }}>
              NEXT CRM — Recuperación Automática
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px', lineHeight: '1.5' }}>
              Se detectó una actualización en la interfaz. Haz clic en el botón de abajo para recargar la aplicación limpiamente.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('nextcrm_app_error');
                window.location.reload();
              }}
              style={{
                backgroundColor: '#2563eb',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '13px',
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              🔄 Recargar Sistema
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
