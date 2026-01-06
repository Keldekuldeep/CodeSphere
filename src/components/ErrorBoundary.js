import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    console.error('🚨 ErrorBoundary caught an error:', error);
    console.error('🚨 Error info:', errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#f8f9fa',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            maxWidth: '600px',
            width: '100%'
          }}>
            <h1 style={{ color: '#dc3545', marginBottom: '20px' }}>
              🚨 BloodSaathi Error
            </h1>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Something went wrong while loading the application. This error has been logged for debugging.
            </p>
            
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '15px', 
              borderRadius: '4px',
              marginBottom: '20px',
              fontFamily: 'monospace',
              fontSize: '14px',
              overflow: 'auto'
            }}>
              <strong>Error:</strong> {this.state.error && this.state.error.toString()}
              <br/><br/>
              <strong>Stack Trace:</strong>
              <pre style={{ whiteSpace: 'pre-wrap', margin: '10px 0' }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => window.location.reload()} 
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                🔄 Reload Page
              </button>
              
              <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }} 
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                🗑️ Clear Data & Reload
              </button>
            </div>
            
            <div style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
              <p>If this error persists, please check:</p>
              <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
                <li>Browser console for additional error messages</li>
                <li>Network connectivity</li>
                <li>Firebase configuration</li>
                <li>Try a different browser</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;