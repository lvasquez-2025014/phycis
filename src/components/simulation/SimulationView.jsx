import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Maximize2 } from 'lucide-react';

export default function SimulationView({ onBackToBoard }) {
  const [reloadKey, setReloadKey] = useState(0);

  const handleReload = () => {
    setReloadKey((prev) => prev + 1);
  };

  return (
    <div className="simulation-view-container">
      {/* Top status & quick actions bar */}
      <div className="simulation-top-strip">
        <div className="simulation-strip-left">
          <button
            type="button"
            className="simulation-strip-back-btn"
            onClick={onBackToBoard}
            title="Volver a la Pizarra principal"
          >
            <ArrowLeft size={14} />
            <span>Volver a la Pizarra</span>
          </button>
          <div className="strip-divider" />
          <span className="strip-title">Motion Lab</span>
          <span className="strip-badge">Simulador de Cinemática 1D</span>
        </div>

        <div className="simulation-strip-right">
          <button
            type="button"
            className="simulation-strip-btn"
            onClick={handleReload}
            title="Recargar simulador"
          >
            <RefreshCw size={13} />
            <span>Reiniciar Lab</span>
          </button>
        </div>
      </div>

      {/* Main Simulation Frame */}
      <div className="simulation-frame-wrapper">
        <iframe
          key={reloadKey}
          title="Motion Lab — Pizarrón de cinemática"
          src="/simulation.html"
          className="simulation-iframe"
          sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-modals allow-popups"
        />
      </div>

      <style>{`
        .simulation-view-container {
          position: fixed;
          top: 50px;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 52;
          background: #f6f9fb;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
        }

        .simulation-top-strip {
          height: 38px;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          flex-shrink: 0;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
        }

        .simulation-strip-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .simulation-strip-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f1f5f9;
          color: #0f172a;
          border: 1px solid #e2e8f0;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.76rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .simulation-strip-back-btn:hover {
          background: #e2e8f0;
          color: #0284c7;
        }

        .strip-divider {
          width: 1px;
          height: 18px;
          background: #e2e8f0;
        }

        .strip-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: #0f172a;
        }

        .strip-badge {
          font-size: 0.68rem;
          font-weight: 600;
          color: #0284c7;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .simulation-strip-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .simulation-strip-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          color: #64748b;
          border: 1px solid #e2e8f0;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.74rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .simulation-strip-btn:hover {
          background: #f8fafc;
          color: #0f172a;
          border-color: #cbd5e1;
        }

        .simulation-frame-wrapper {
          flex: 1;
          width: 100%;
          height: calc(100% - 38px);
          border: none;
          background: #f6f9fb;
          overflow: hidden;
        }

        .simulation-iframe {
          width: 100%;
          height: 100%;
          border: none;
          background: #f6f9fb;
          display: block;
        }
      `}</style>
    </div>
  );
}
