import React from 'react';
import { X, Clock, Sparkles, Download, Check, ExternalLink } from 'lucide-react';

export default function SaveBoardModal({ isOpen, onClose, onExportPNG, onExportJSON, onNotify }) {
  if (!isOpen) return null;

  return (
    <div className="miro-modal-overlay" onClick={onClose}>
      <div className="miro-modal-card save-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="save-modal-header">
          <div className="clock-banner-badge">
            <Clock size={16} />
            <span>24-HOUR WEB WHITEBOARD</span>
          </div>
          <button className="share-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="save-modal-body">
          <h2 className="save-modal-heading">Keep this board forever</h2>
          <p className="save-modal-desc">
            Web Whiteboard boards automatically expire in 24 hours. You can export your board right now as an image or backup, or create a free Miro account to keep working on it indefinitely.
          </p>

          <div className="save-features-list">
            <div className="feature-item">
              <Check size={16} className="check-icon" />
              <span>Unlimited access with zero expiration</span>
            </div>
            <div className="feature-item">
              <Check size={16} className="check-icon" />
              <span>Access to 500+ templates on Miroverse</span>
            </div>
            <div className="feature-item">
              <Check size={16} className="check-icon" />
              <span>Export as vector PDF, High-Res PNG & JSON backup</span>
            </div>
          </div>

          <div className="save-actions-group">
            <button
              className="btn-miro-primary save-action-btn"
              onClick={() => {
                onNotify('🎉 Redirecting to free Miro plan sign up...');
                onClose();
              }}
            >
              <span>Sign up for free Miro account</span>
              <ExternalLink size={15} />
            </button>

            <button
              className="btn-miro-secondary download-action-btn"
              onClick={() => {
                onExportPNG();
                onClose();
              }}
            >
              <Download size={15} />
              <span>Download high-res PNG image</span>
            </button>

            {onExportJSON && (
              <button
                className="btn-miro-secondary download-action-btn"
                onClick={() => {
                  onExportJSON();
                  onClose();
                }}
              >
                <Download size={15} />
                <span>Download board backup (JSON)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .save-modal-card {
          max-width: 520px;
        }

        .save-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .clock-banner-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fff8e6;
          border: 1px solid #ffd02f;
          color: #92400e;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: var(--radius-pill);
        }

        .save-modal-body {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .save-modal-heading {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--miro-navy);
          letter-spacing: -0.01em;
        }

        .save-modal-desc {
          font-size: 0.84rem;
          color: var(--miro-gray-text);
          line-height: 1.5;
        }

        .save-features-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 14px;
          background: #f8f9fc;
          border-radius: var(--radius-sm);
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: var(--miro-navy);
          font-weight: 500;
        }

        .check-icon {
          color: var(--miro-blue);
          flex-shrink: 0;
        }

        .save-actions-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 6px;
        }

        .save-action-btn {
          height: 44px;
          font-size: 0.9rem;
        }

        .download-action-btn {
          height: 40px;
        }
      `}</style>
    </div>
  );
}
