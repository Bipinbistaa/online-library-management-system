import React from 'react';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div style={{
      background: '#fee2e2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      padding: '16px',
      textAlign: 'center',
      color: '#dc2626'
    }}>
      <p style={{ marginBottom: onRetry ? '12px' : 0 }}>⚠️ {message}</p>
      {onRetry && (
        <button className="btn btn-danger" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
