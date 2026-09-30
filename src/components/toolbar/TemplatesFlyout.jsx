import React, { useState } from 'react';
import { 
  X, 
  Search, 
  ChevronRight, 
  ArrowLeft, 
  GraduationCap, 
  Calendar 
} from 'lucide-react';
import { MRU_SUBTOPICS } from '../../data/mruTemplates';

export default function TemplatesFlyout({ isOpen, onClose, onLoadTemplate }) {
  if (!isOpen) return null;

  const [templateView, setTemplateView] = useState('list'); // 'list' | 'mru'
  const [mruSearch, setMruSearch] = useState('');

  const filteredMruSubtopics = MRU_SUBTOPICS.filter((sub) => {
    if (!mruSearch.trim()) return true;
    const q = mruSearch.trim().toLowerCase();
    return (
      sub.title.toLowerCase().includes(q) ||
      sub.desc.toLowerCase().includes(q) ||
      sub.activity.toLowerCase().includes(q) ||
      sub.week.toLowerCase().includes(q) ||
      sub.badge.toLowerCase().includes(q)
    );
  });

  return (
    <div className={`templates-drawer-card ${templateView === 'mru' ? 'mru-expanded-drawer' : ''} miro-island`}>
      {templateView === 'list' ? (
        /* Vista Principal: Solamente MRU */
        <>
          <div className="drawer-header">
            <div className="tpl-drawer-header-left">
              <span className="tpl-main-badge">Plantillas de Estudio</span>
              <h3 className="drawer-title">Plantillas</h3>
            </div>
            <button className="drawer-close-btn" onClick={onClose} title="Cerrar">
              <X size={17} />
            </button>
          </div>

          <div className="templates-cards-list single-item-view">
            {/* Única plantilla principal: MRU */}
            <div
              className="mru-master-item-card"
              onClick={() => setTemplateView('mru')}
              title="Abrir subtemas de MRU"
            >
              <div className="mru-master-visual">
                <span className="mru-master-brand">MRU</span>
                <span className="mru-master-tag">Física</span>
              </div>
              <div className="mru-master-body">
                <div className="mru-master-top-line">
                  <h4 className="mru-master-title">MRU</h4>
                  <span className="mru-sub-count">8 subtemas</span>
                </div>
                <p className="mru-master-desc">
                  Movimiento Unidimensional: MRU, MRUV, Caída Libre, Laboratorio, Tiro Vertical y Evaluaciones.
                </p>
                <div className="mru-master-footer">
                  <span className="mru-open-label">Explorar subtemas</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Acceso Rápido al Cronograma del Colegio */}
          <div className="school-unit-summary-card">
            <div className="school-unit-title-row">
              <GraduationCap size={18} className="school-cap-icon" />
              <span className="school-unit-heading">Plan Previsto • Colegio</span>
            </div>
            <p className="school-unit-subtext">
              Unidad: <strong>Movimiento Unidimensional</strong> (Semanas 1 a 9). Ponderación total: 100 pts.
            </p>
            <button
              className="school-unit-action-btn"
              onClick={() => {
                onLoadTemplate('plan_colegio');
                onClose();
              }}
            >
              <Calendar size={14} />
              <span>Cargar cronograma escolar en pizarra</span>
            </button>
          </div>
        </>
      ) : (
        /* Vista Detallada: Subtemas de MRU */
        <>
          {/* Header con botón de regreso */}
          <div className="drawer-header mru-drawer-header">
            <button
              className="mru-back-nav-btn"
              onClick={() => setTemplateView('list')}
              title="Volver a Plantillas"
            >
              <ArrowLeft size={15} />
              <span>Plantillas</span>
            </button>
            <div className="mru-title-center">
              <span className="mru-sub-badge">Física • Plan Escolar</span>
              <h3 className="mru-sub-drawer-title">MRU: Subtemas</h3>
            </div>
            <button className="drawer-close-btn" onClick={onClose} title="Cerrar">
              <X size={17} />
            </button>
          </div>

          {/* Buscador de subtemas */}
          <div className="mru-search-bar">
            <Search size={15} className="mru-search-icon" />
            <input
              type="text"
              placeholder="Buscar subtema (ej. mruv, caída, laboratorio, parcial)..."
              value={mruSearch}
              onChange={(e) => setMruSearch(e.target.value)}
              autoFocus
            />
            {mruSearch && (
              <button className="mru-search-clear" onClick={() => setMruSearch('')} title="Limpiar">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Lista interactiva de los 8 subtemas del colegio */}
          <div className="mru-subtopics-list">
            {filteredMruSubtopics.length > 0 ? (
              filteredMruSubtopics.map((sub) => (
                <div
                  key={sub.id}
                  className="mru-subtopic-row"
                  onClick={() => {
                    onLoadTemplate(sub.id);
                    onClose();
                  }}
                  title={`Cargar pizarra de ${sub.title}`}
                >
                  <div className="mru-row-left-bar" style={{ backgroundColor: sub.color }} />
                  <div className="mru-row-content">
                    <div className="mru-row-meta-line">
                      <span className="mru-row-week">{sub.week}</span>
                      <span className="mru-row-pts">{sub.ponderacion}</span>
                    </div>
                    <h5 className="mru-row-title">{sub.title}</h5>
                    <span className="mru-row-activity">{sub.activity}</span>
                    <p className="mru-row-desc">{sub.desc}</p>
                  </div>
                  <div className="mru-row-action">
                    <ChevronRight size={16} className="mru-row-arrow" />
                  </div>
                </div>
              ))
            ) : (
              <div className="mru-empty-search">
                <p>No se encontraron subtemas para "{mruSearch}"</p>
                <button className="mru-empty-btn" onClick={() => setMruSearch('')}>Ver todos los subtemas</button>
              </div>
            )}
          </div>

          {/* Tip de pie de ventana */}
          <div className="mru-drawer-footer">
            <span>💡 Clic en cualquier subtema para abrir la pizarra lista con fórmulas, teoría y ejercicios.</span>
          </div>
        </>
      )}
    </div>
  );
}
