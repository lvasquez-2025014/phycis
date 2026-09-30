import React, { useState } from 'react';
import { X, Copy, Check, Globe, Link, QrCode, ShieldCheck } from 'lucide-react';

export default function ShareModal({ isOpen, onClose, onNotify }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://webwhiteboard.com/app/board/uXjVO92...';

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    onNotify('🔗 Link copied to clipboard! Anyone with this link can join and collaborate.');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="miro-modal-overlay" onClick={onClose}>
      <div className="miro-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="share-modal-header">
          <div>
            <h2 className="share-modal-title">Share board</h2>
            <p className="share-modal-sub">Anyone with this link can view and edit with no sign-up required.</p>
          </div>
          <button className="share-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Access badge */}
        <div className="share-permission-badge">
          <Globe size={18} className="globe-icon" />
          <div className="perm-info">
            <span className="perm-title">Public editing link</span>
            <span className="perm-desc">Instant real-time collaboration active for 24 hours</span>
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
          <button className="btn-miro-primary copy-btn" onClick={handleCopy}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied' : 'Copy link'}</span>
          </button>
        </div>

        {/* Miro Collaboration Tips */}
        <div className="share-footer-note">
          <ShieldCheck size={16} className="shield-icon" />
          <span>No registration needed. Co-workers or students join as live guest cursors.</span>
        </div>
      </div>

      <style>{`
        .share-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .share-modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--miro-navy);
          letter-spacing: -0.01em;
        }

        .share-modal-sub {
          font-size: 0.8rem;
          color: var(--miro-gray-text);
          margin-top: 4px;
        }

        .share-close-btn {
          background: none;
          border: none;
          color: var(--miro-gray-text);
          cursor: pointer;
          padding: 4px;
          border-radius: var(--radius-xs);
        }

        .share-close-btn:hover {
          background: #f1f2f6;
          color: var(--miro-navy);
        }

        .share-permission-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: #f4f5f8;
          border-radius: var(--radius-sm);
        }

        .globe-icon {
          color: var(--miro-blue);
          flex-shrink: 0;
        }

        .perm-info {
          display: flex;
          flex-direction: column;
        }

        .perm-title {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--miro-navy);
        }

        .perm-desc {
          font-size: 0.72rem;
          color: var(--miro-gray-text);
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
          gap: 8px;
          padding: 8px 12px;
          background: #ffffff;
          border: 1px solid var(--miro-gray-border);
          border-radius: var(--radius-sm);
        }

        .link-icon {
          color: var(--miro-gray-text);
        }

        .share-link-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          font-family: var(--font-sans);
          font-size: 0.8rem;
          color: var(--miro-navy);
        }

        .copy-btn {
          height: 40px;
          padding: 0 18px;
          flex-shrink: 0;
        }

        .share-footer-note {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          color: var(--miro-gray-text);
          padding-top: 8px;
          border-top: 1px solid var(--miro-gray-border);
        }

        .shield-icon {
          color: #10b981;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
