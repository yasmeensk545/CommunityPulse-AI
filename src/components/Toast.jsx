import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export function Toast({ toasts = [], onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map(toast => {
        let Icon = CheckCircle2;
        let toastClass = 'toast-success';
        let iconColor = '#16A34A';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          toastClass = 'toast-error';
          iconColor = '#DC2626';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          toastClass = 'toast-warning';
          iconColor = '#EA580C';
        } else if (toast.type === 'info') {
          Icon = Info;
          toastClass = '';
          iconColor = '#0D9488';
        }

        return (
          <div key={toast.id} className={`toast ${toastClass}`}>
            <Icon size={18} style={{ color: iconColor, flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: '0.825rem', color: '#0F172A', fontWeight: 500 }}>
              {toast.message}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              style={{ color: '#94A3B8', padding: '2px', display: 'flex' }}
              aria-label="Dismiss toast"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
