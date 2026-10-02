import React, { useState } from 'react';
import { X, Copy, Check, Globe, Link, ShieldCheck } from 'lucide-react';

export default function ShareModal({ isOpen, onClose, onNotify }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'http://localhost:5173/';

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    if (onNotify) {
      onNotify('🔗 Enlace copiado al portapapeles. Cualquiera con este enlace puede ingresar a la sesión.');
    }
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="studio-modal-overlay" onClick={onClose}>
      <div className="studio-modal-card share-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="share-modal-header">
          <div>
            <h2 className="share-modal-title">Compartir Sesión de Laboratorio</h2>
            <p className="share-modal-sub">Permite a estudiantes o profesores ver y colaborar en esta pizarra física.</p>
          </div>
          <button className="share-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Access badge */}
        <div className="share-permission-badge">
          <Globe size={16} className="globe-icon" />
          <div className="perm-info">
            <span className="perm-title">Enlace de acceso directo</span>
            <span className="perm-desc">Visualización y edición interactiva en tiempo real</span>
          </div>
        </div>

        {/* Copy Link Input Bar */}
        <div className="share-copy-row">
          <div className="share-input-wrap">
            <Link size={14} className="link-icon" />
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="share-link-input"
            />
          </div>
          <button className="studio-copy-btn" onClick={handleCopy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copiado' : 'Copiar enlace'}</span>
          </button>
        </div>

        {/* Collaboration Note */}
        <div className="share-footer-note">
          <ShieldCheck size={15} className="shield-icon" />
          <span>No requiere inicio de sesión. Ideal para proyectar en clase o resolver problemas en equipo.</span>
        </div>
      </div>

      <style>{`
        .studio-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(4px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: modalFadeIn 0.16s ease-out;
        }

        .studio-modal-card.share-card {
          width: 440px;
          background: #ffffff;
          border-radius: 10px;
          box-shadow: 0 20px 45px rgba(15, 23, 42, 0.2);
          border: 1px solid #e2e8f0;
          padding: 20px 22px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .share-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .share-modal-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .share-modal-sub {
          font-size: 0.76rem;
          color: #64748b;
          margin: 4px 0 0;
          line-height: 1.35;
        }

        .share-close-btn {
          border: none;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          padding: 3px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.12s;
        }

        .share-close-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .share-permission-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 7px;
        }

        .globe-icon {
          color: #0284c7;
          flex-shrink: 0;
        }

        .perm-info {
          display: flex;
          flex-direction: column;
        }

        .perm-title {
          font-size: 0.76rem;
          font-weight: 700;
          color: #0f172a;
        }

        .perm-desc {
          font-size: 0.68rem;
          color: #64748b;
        }

        .share-copy-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .share-input-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 6px 10px;
        }

        .link-icon {
          color: #64748b;
          flex-shrink: 0;
        }

        .share-link-input {
          border: none;
          background: transparent;
          width: 100%;
          outline: none;
          font-size: 0.74rem;
          color: #0f172a;
          font-family: ui-monospace, SFMono-Regular, monospace;
        }

        .studio-copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 6px;
          border: none;
          background: #0284c7;
          color: #ffffff;
          font-size: 0.76rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.12s;
        }

        .studio-copy-btn:hover {
          background: #0369a1;
        }

        .share-footer-note {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.7rem;
          color: #64748b;
          padding-top: 6px;
          border-top: 1px solid #f1f5f9;
        }

        .shield-icon {
          color: #059669;
          flex-shrink: 0;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
