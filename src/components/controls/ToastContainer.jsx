import React from 'react';
import { Sparkles, X, CheckCircle, Info } from 'lucide-react';

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast-item glass-panel">
          <div className="toast-glow-accent"></div>
          <div className="toast-icon-box">
            <Sparkles size={15} />
          </div>
          <div className="toast-content">
            <span className="toast-text">{toast.message}</span>
          </div>
          <button
            className="toast-dismiss-btn"
            onClick={() => onDismiss(toast.id)}
            aria-label="Cerrar notificación"
          >
            <X size={13} />
          </button>
        </div>
      ))}

      <style>{`
        .toast-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 120;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
        }

        .toast-item {
          pointer-events: auto;
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(14, 18, 30, 0.95);
          border: 1px solid rgba(0, 242, 254, 0.4);
          border-radius: var(--radius-md);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 25px rgba(0, 242, 254, 0.2);
          animation: toastSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          max-width: 380px;
          overflow: hidden;
        }

        .toast-glow-accent {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, var(--cyan), var(--violet));
        }

        @keyframes toastSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .toast-icon-box {
          color: var(--cyan);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .toast-content {
          flex: 1;
        }

        .toast-text {
          font-size: 0.8rem;
          font-weight: 500;
          color: #fff;
          line-height: 1.35;
        }

        .toast-dismiss-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color var(--transition-fast);
        }

        .toast-dismiss-btn:hover {
          color: #fff;
        }
      `}</style>
    </div>
  );
}
