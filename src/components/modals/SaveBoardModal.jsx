import React from 'react';
import { X, Clock, Download, Check, Save } from 'lucide-react';

export default function SaveBoardModal({ isOpen, onClose, onExportPNG, onExportJSON, onNotify }) {
  if (!isOpen) return null;

  return (
    <div className="studio-modal-overlay" onClick={onClose}>
      <div className="studio-modal-card save-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="save-modal-header">
          <div className="clock-banner-badge">
            <Clock size={15} />
            <span>SESIÓN LOCAL DE LABORATORIO</span>
          </div>
          <button className="share-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="save-modal-body">
          <h2 className="save-modal-heading">Respaldar y Guardar Sesión de Física</h2>
          <p className="save-modal-desc">
            Tu pizarra científica y los datos de simulación física pueden exportarse en cualquier momento para conservarlos de forma permanente o compartirlos con estudiantes y profesores.
          </p>

          <div className="save-features-list">
            <div className="feature-item">
              <Check size={15} className="check-icon" />
              <span>Cálculos, móviles y ecuaciones preservadas con precisión milimétrica</span>
            </div>
            <div className="feature-item">
              <Check size={15} className="check-icon" />
              <span>Exportación gráfica en alta resolución PNG para reportes y tareas</span>
            </div>
            <div className="feature-item">
              <Check size={15} className="check-icon" />
              <span>Respaldo portable en formato JSON para restaurar en cualquier equipo</span>
            </div>
          </div>

          <div className="save-actions-group">
            <button
              className="studio-modal-btn primary save-action-btn"
              onClick={() => {
                if (onExportPNG) onExportPNG();
                if (onNotify) onNotify('🖼️ Exportando imagen PNG en alta resolución...');
                onClose();
              }}
            >
              <Download size={14} />
              <span>Exportar Imagen PNG (HD)</span>
            </button>

            {onExportJSON && (
              <button
                className="studio-modal-btn secondary download-action-btn"
                onClick={() => {
                  onExportJSON();
                  if (onNotify) onNotify('💾 Descargando archivo de datos JSON...');
                  onClose();
                }}
              >
                <Save size={14} />
                <span>Descargar Respaldo Completo (JSON)</span>
              </button>
            )}
          </div>
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

        .studio-modal-card {
          width: 440px;
          background: #ffffff;
          border-radius: 10px;
          box-shadow: 0 20px 45px rgba(15, 23, 42, 0.2);
          border: 1px solid #e2e8f0;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .save-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          border-bottom: 1px solid #f1f5f9;
        }

        .clock-banner-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #0284c7;
          background: #f0f9ff;
          padding: 3px 8px;
          border-radius: 4px;
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

        .save-modal-body {
          padding: 18px 20px 22px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .save-modal-heading {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .save-modal-desc {
          font-size: 0.78rem;
          color: #64748b;
          line-height: 1.45;
          margin: 0;
        }

        .save-features-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 14px;
        }

        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 0.74rem;
          color: #334155;
          line-height: 1.35;
        }

        .check-icon {
          color: #059669;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .save-actions-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 4px;
        }

        .studio-modal-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 9px 16px;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .studio-modal-btn.primary {
          background: #0284c7;
          border: 1px solid #0284c7;
          color: #ffffff;
        }

        .studio-modal-btn.primary:hover {
          background: #0369a1;
          border-color: #0369a1;
        }

        .studio-modal-btn.secondary {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #1e293b;
        }

        .studio-modal-btn.secondary:hover {
          background: #f8fafc;
          border-color: #94a3b8;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
