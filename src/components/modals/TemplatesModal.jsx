import React from 'react';
import { 
  X, 
  ArrowRight,
  BookOpen,
  GraduationCap,
  Calendar,
  FileText
} from 'lucide-react';
import { MRU_SUBTOPICS, getMruTemplate } from '../../data/mruTemplates';

export default function TemplatesModal({ isOpen, onClose, onLoadTemplate }) {
  if (!isOpen) return null;

  return (
    <div className="miro-modal-overlay" onClick={onClose}>
      <div className="miro-modal-card templates-card" onClick={(e) => e.stopPropagation()}>
        <div className="tpl-modal-top">
          <div>
            <span className="tpl-modal-badge">Plan Previsto • Física</span>
            <h2 className="tpl-modal-heading">Plantillas: MRU (Movimiento Unidimensional)</h2>
            <p className="tpl-modal-sub">
              Selecciona cualquiera de los subtemas escolares para cargar su pizarra completa con teoría, fórmulas y ejercicios.
            </p>
          </div>
          <button className="share-close-btn" onClick={onClose} title="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="tpl-cards-grid">
          {MRU_SUBTOPICS.map((sub) => {
            return (
              <div
                key={sub.id}
                className="tpl-pick-box"
                onClick={() => {
                  const res = getMruTemplate(sub.id);
                  if (res) onLoadTemplate(res);
                  onClose();
                }}
              >
                <div
                  className="tpl-icon-bubble"
                  style={{ backgroundColor: `${sub.color}20`, color: sub.color }}
                >
                  <BookOpen size={20} />
                </div>
                <div className="tpl-details">
                  <div className="tpl-cat-row">
                    <span className="tpl-category">{sub.week}</span>
                    <span className="tpl-pts-badge">{sub.ponderacion}</span>
                  </div>
                  <h3 className="tpl-title">{sub.title}</h3>
                  <span className="tpl-sub-act">{sub.activity}</span>
                  <p className="tpl-description">{sub.desc}</p>
                </div>
                <div className="tpl-action-arrow">
                  <span>Usar</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .templates-card {
          max-width: 720px;
          max-height: 85vh;
          overflow-y: auto;
          border-radius: 16px;
        }

        .tpl-modal-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--miro-gray-border);
        }

        .tpl-modal-badge {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          color: #4262ff;
          background: #edf2fe;
          padding: 2px 8px;
          border-radius: 10px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 4px;
        }

        .tpl-modal-heading {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--miro-navy);
          letter-spacing: -0.01em;
          margin: 0;
        }

        .tpl-modal-sub {
          font-size: 0.8rem;
          color: var(--miro-gray-sub);
          margin-top: 4px;
          line-height: 1.4;
        }

        .tpl-cards-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 16px;
        }

        .tpl-pick-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px;
          border-radius: 12px;
          border: 1px solid #e1e3ea;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.16s ease;
          position: relative;
        }

        .tpl-pick-box:hover {
          border-color: #4262ff;
          box-shadow: 0 6px 20px rgba(66, 98, 255, 0.14);
          transform: translateY(-2px);
        }

        .tpl-icon-bubble {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .tpl-details {
          flex: 1;
        }

        .tpl-cat-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2px;
        }

        .tpl-category {
          font-size: 0.68rem;
          font-weight: 700;
          color: #4262ff;
        }

        .tpl-pts-badge {
          font-size: 0.68rem;
          font-weight: 700;
          color: #10b981;
          background: #d3f8df;
          padding: 1px 6px;
          border-radius: 8px;
        }

        .tpl-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--miro-navy);
          margin: 0;
          line-height: 1.25;
        }

        .tpl-sub-act {
          display: block;
          font-size: 0.72rem;
          font-weight: 600;
          color: #5f5c80;
          margin: 2px 0;
        }

        .tpl-description {
          font-size: 0.74rem;
          color: #727088;
          margin: 3px 0 0 0;
          line-height: 1.35;
        }

        .tpl-action-arrow {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #4262ff;
          opacity: 0;
          transform: translateX(-4px);
          transition: all 0.15s ease;
          position: absolute;
          bottom: 12px;
          right: 14px;
        }

        .tpl-pick-box:hover .tpl-action-arrow {
          opacity: 1;
          transform: translateX(0);
        }
      `}</style>
    </div>
  );
}
