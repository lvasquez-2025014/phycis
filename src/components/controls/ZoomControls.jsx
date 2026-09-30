import React from 'react';
import { Minus, Plus, Maximize2, Compass } from 'lucide-react';

export default function ZoomControls({
  scale,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  minimapOpen,
  onToggleMinimap,
}) {
  return (
    <div className="webwb-zoom-controls">
      <button className="zoom-btn" onClick={onZoomOut} title="Alejar (-)">
        <Minus size={15} />
      </button>

      <button className="zoom-pct-display" onClick={onResetZoom} title="Restablecer zoom al 100%">
        {Math.round(scale * 100)}%
      </button>

      <button className="zoom-btn" onClick={onZoomIn} title="Acercar (+)">
        <Plus size={15} />
      </button>

      <div className="zoom-divider"></div>

      <button
        className={`zoom-btn ${minimapOpen ? 'active' : ''}`}
        onClick={onToggleMinimap}
        title="Mostrar / Ocultar radar minimapa"
      >
        <Compass size={15} />
      </button>

      <button className="zoom-btn" onClick={onResetZoom} title="Ajustar a pantalla completa">
        <Maximize2 size={15} />
      </button>

      <style>{`
        .webwb-zoom-controls {
          position: fixed;
          bottom: 18px;
          right: 18px;
          z-index: 45;
          display: flex;
          align-items: center;
          gap: 3px;
          padding: 4px 6px;
          height: 38px;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(225, 230, 240, 0.85);
          box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.08);
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .webwb-zoom-controls:hover {
          box-shadow: 0 6px 22px -2px rgba(15, 23, 42, 0.12);
        }

        .zoom-btn {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          background: transparent;
          border: 1px solid transparent;
          color: #475569;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }

        .zoom-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .zoom-btn.active {
          color: #2563eb;
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        .zoom-pct-display {
          background: none;
          border: none;
          font-family: var(--font-sans);
          font-size: 0.77rem;
          font-weight: 700;
          color: #1e293b;
          padding: 3px 6px;
          border-radius: 6px;
          cursor: pointer;
          min-width: 48px;
          text-align: center;
          transition: background 0.15s;
        }

        .zoom-pct-display:hover {
          background: #f1f5f9;
        }

        .zoom-divider {
          width: 1px;
          height: 18px;
          background: #e2e8f0;
          margin: 0 3px;
        }
      `}</style>
    </div>
  );
}
