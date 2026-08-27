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
          minHeight: '100vh',
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
            maxWidth: '650px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
            textAlign: 'left'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#60a5fa', marginBottom: '12px' }}>
              NEXT CRM — Detalle del Error
            </h2>
            <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '12px' }}>
              <strong>Mensaje:</strong> {this.state.error?.message || 'Error desconocido'}
            </p>
            {this.state.error?.stack && (
              <pre style={{
                background: '#000',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '11px',
                color: '#f87171',
                overflowX: 'auto',
                maxHeight: '200px',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                marginBottom: '16px'
              }}>
                {this.state.error.stack}
              </pre>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.href = window.location.pathname;
                }}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                🔄 Limpiar Caché y Recargar
              </button>
            </div>
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
