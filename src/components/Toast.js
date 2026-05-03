import React, { useEffect } from 'react';
import './Toast.css';

const AUTO_DISMISS_MS = 6000;

function Toast({ id, message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(id), AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [id, onDismiss]);

  return (
    <div className="toast" role="status" onClick={() => onDismiss(id)}>
      <span className="toast-icon" aria-hidden="true">⚓</span>
      <span className="toast-message">{message}</span>
      <button
        className="toast-close"
        aria-label="Chiudi notifica"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(id);
        }}
      >
        ×
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <Toast key={t.id} id={t.id} message={t.message} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
