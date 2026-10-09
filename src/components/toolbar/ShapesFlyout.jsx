import React, { useState } from 'react';
import { 
  Minus, 
  ArrowUpRight, 
  CornerDownRight, 
  Square, 
  Circle, 
  Diamond, 
  Triangle, 
  Workflow,
  Star,
  Cloud,
  Hexagon,
  Database,
  FileText,
  Shapes,
  ChevronLeft,
  Zap,
} from 'lucide-react';

export default function ShapesFlyout({
  isOpen,
  activeTool,
  setActiveTool,
  activeShape,
  setActiveShape,
  onClose,
  onInsertFlowchart,
}) {
  const [activeCategory, setActiveCategory] = useState('basic'); // 'basic' | 'more' | 'diagram'

  if (!isOpen) return null;

  const handleSelectShape = (shapeId, tool = 'shape') => {
    setActiveTool(tool);
    setActiveShape(shapeId);
    onClose();
  };

  return (
    <div
      className="shapes-flyout-menu miro-island"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Category Tabs Header */}
      <div className="shapes-flyout-tabs">
        <button
          type="button"
          className={`shapes-tab-pill ${activeCategory === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveCategory('basic')}
        >
          Básicas
        </button>
        <button
          type="button"
          className={`shapes-tab-pill ${activeCategory === 'more' ? 'active' : ''}`}
          onClick={() => setActiveCategory('more')}
        >
          Más formas
        </button>
        <button
          type="button"
          className={`shapes-tab-pill ${activeCategory === 'diagram' ? 'active' : ''}`}
          onClick={() => setActiveCategory('diagram')}
        >
          Diagrama
        </button>
      </div>

      <div className="menu-divider-line" />

      {/* 1. CATEGORY: BASIC SHAPES */}
      {activeCategory === 'basic' && (
        <div className="shapes-category-list">
          <button
            type="button"
            className={`shape-item-row ${activeTool === 'shape' && activeShape === 'line' ? 'active' : ''}`}
            onClick={() => handleSelectShape('line')}
          >
            <Minus size={16} className="shape-row-icon" />
            <span className="shape-row-text">Línea</span>
            <span className="shape-shortcut-key">L</span>
          </button>

          <button
            type="button"
            className={`shape-item-row ${activeTool === 'arrow' ? 'active' : ''}`}
            onClick={() => handleSelectShape('arrow', 'arrow')}
          >
            <ArrowUpRight size={16} className="shape-row-icon" />
            <span className="shape-row-text">Flecha</span>
          </button>

          <button
            type="button"
            className={`shape-item-row ${activeTool === 'shape' && activeShape === 'elbow_arrow' ? 'active' : ''}`}
            onClick={() => handleSelectShape('elbow_arrow')}
          >
            <CornerDownRight size={16} className="shape-row-icon" />
            <span className="shape-row-text">Flecha acodada</span>
          </button>

          <div className="menu-divider-line" />

          <button
            type="button"
            className={`shape-item-row ${activeTool === 'shape' && activeShape === 'rectangle' ? 'active' : ''}`}
            onClick={() => handleSelectShape('rectangle')}
          >
            <Square size={16} className="shape-row-icon" />
            <span className="shape-row-text">Rectángulo</span>
            <span className="shape-shortcut-key">R</span>
          </button>

          <button
            type="button"
            className={`shape-item-row ${activeTool === 'shape' && activeShape === 'circle' ? 'active' : ''}`}
            onClick={() => handleSelectShape('circle')}
          >
            <Circle size={16} className="shape-row-icon" />
            <span className="shape-row-text">Círculo</span>
            <span className="shape-shortcut-key">O</span>
          </button>

          <button
            type="button"
            className={`shape-item-row ${activeTool === 'shape' && activeShape === 'diamond' ? 'active' : ''}`}
            onClick={() => handleSelectShape('diamond')}
          >
            <Diamond size={16} className="shape-row-icon" />
            <span className="shape-row-text">Rombo</span>
            <span className="shape-shortcut-key">D</span>
          </button>

          <button
            type="button"
            className={`shape-item-row ${activeTool === 'shape' && activeShape === 'triangle' ? 'active' : ''}`}
            onClick={() => handleSelectShape('triangle')}
          >
            <Triangle size={16} className="shape-row-icon" />
            <span className="shape-row-text">Triángulo</span>
          </button>

          <button
            type="button"
            className={`shape-item-row ${activeTool === 'shape' && activeShape === 'divider' ? 'active' : ''}`}
            onClick={() => handleSelectShape('divider')}
          >
            <Minus size={16} className="shape-row-icon" />
            <span className="shape-row-text">Divisor</span>
          </button>

          <div className="menu-divider-line" />

          {/* Quick link to Más Formas */}
          <button
            type="button"
            className="shape-item-row highlight-row"
            onClick={() => setActiveCategory('more')}
          >
            <Shapes size={16} className="shape-row-icon text-indigo" />
            <span className="shape-row-text">Más formas (5 figuras)</span>
            <span className="shape-badge-count">›</span>
          </button>

          {/* Quick link to Diagrama */}
          <button
            type="button"
            className="shape-item-row diagram-row"
            onClick={() => setActiveCategory('diagram')}
          >
            <Workflow size={16} className="diagram-orange-icon" />
            <span className="shape-row-text">Diagrama y Flujogramas</span>
            <span className="shape-badge-count">›</span>
          </button>
        </div>
      )}

      {/* 2. CATEGORY: MORE SHAPES (MÁS FORMAS) */}
      {activeCategory === 'more' && (
        <div className="shapes-category-list">
          <button
            type="button"
            className="shapes-back-row"
            onClick={() => setActiveCategory('basic')}
          >
            <ChevronLeft size={14} />
            <span>Volver a Básicas</span>
          </button>

          <button
            type="button"
            className={`shape-item-row ${activeTool === 'shape' && activeShape === 'block_arrow' ? 'active' : ''}`}
            onClick={() => handleSelectShape('block_arrow')}
          >
            <ArrowUpRight size={16} className="shape-row-icon text-blue" />
            <span className="shape-row-text">Flecha de bloque</span>
          </button>

          <button
            type="button"
            className={`shape-item-row ${activeTool === 'shape' && activeShape === 'star' ? 'active' : ''}`}
            onClick={() => handleSelectShape('star')}
          >
            <Star size={16} className="shape-row-icon text-amber" />
            <span className="shape-row-text">Estrella (5 puntas)</span>
          </button>

          <button
            type="button"
            className={`shape-item-row ${activeTool === 'shape' && activeShape === 'cloud' ? 'active' : ''}`}
            onClick={() => handleSelectShape('cloud')}
          >
            <Cloud size={16} className="shape-row-icon text-cyan" />
            <span className="shape-row-text">Nube de conceptos</span>
          </button>

          <button
            type="button"
            className={`shape-item-row ${activeTool === 'shape' && activeShape === 'hexagon' ? 'active' : ''}`}
            onClick={() => handleSelectShape('hexagon')}
          >
            <Hexagon size={16} className="shape-row-icon text-purple" />
            <span className="shape-row-text">Hexágono</span>
          </button>

          <button
            type="button"
            className={`shape-item-row ${activeTool === 'shape' && activeShape === 'pentagon' ? 'active' : ''}`}
            onClick={() => handleSelectShape('pentagon')}
          >
            <Square size={16} className="shape-row-icon text-emerald" />
            <span className="shape-row-text">Pentágono</span>
          </button>
        </div>
      )}

      {/* 3. CATEGORY: DIAGRAM (DIAGRAMA / FLUJOGRAMA) */}
      {activeCategory === 'diagram' && (
        <div className="shapes-category-list">
          <button
            type="button"
            className="shapes-back-row"
            onClick={() => setActiveCategory('basic')}
          >
            <ChevronLeft size={14} />
            <span>Volver a Básicas</span>
          </button>

          <button
            type="button"
            className={`shape-item-row ${activeTool === 'shape' && activeShape === 'capsule' ? 'active' : ''}`}
            onClick={() => handleSelectShape('capsule')}
          >
            <div className="shape-icon-capsule" />
            <span className="shape-row-text">Terminal (Inicio / Fin)</span>
          </button>

          <button
            type="button"
            className={`shape-item-row ${activeTool === 'shape' && activeShape === 'rectangle' ? 'active' : ''}`}
            onClick={() => handleSelectShape('rectangle')}
          >
            <Square size={16} className="shape-row-icon text-blue" />
            <span className="shape-row-text">Proceso (Rectángulo)</span>
          </button>

          <button
            type="button"
            className={`shape-item-row ${activeTool === 'shape' && activeShape === 'diamond' ? 'active' : ''}`}
            onClick={() => handleSelectShape('diamond')}
          >
            <Diamond size={16} className="shape-row-icon text-amber" />
            <span className="shape-row-text">Decisión (Rombo)</span>
          </button>

          <button
            type="button"
            className={`shape-item-row ${activeTool === 'shape' && activeShape === 'parallelogram' ? 'active' : ''}`}
            onClick={() => handleSelectShape('parallelogram')}
          >
            <div className="shape-icon-parallelogram" />
            <span className="shape-row-text">Datos / E/S</span>
          </button>

          <button
            type="button"
            className={`shape-item-row ${activeTool === 'shape' && activeShape === 'cylinder' ? 'active' : ''}`}
            onClick={() => handleSelectShape('cylinder')}
          >
            <Database size={16} className="shape-row-icon text-cyan" />
            <span className="shape-row-text">Base de datos</span>
          </button>

          <button
            type="button"
            className={`shape-item-row ${activeTool === 'shape' && activeShape === 'document' ? 'active' : ''}`}
            onClick={() => handleSelectShape('document')}
          >
            <FileText size={16} className="shape-row-icon text-rose" />
            <span className="shape-row-text">Documento</span>
          </button>

          <button
            type="button"
            className={`shape-item-row ${activeTool === 'shape' && activeShape === 'elbow_arrow' ? 'active' : ''}`}
            onClick={() => handleSelectShape('elbow_arrow')}
          >
            <CornerDownRight size={16} className="shape-row-icon" />
            <span className="shape-row-text">Conector de flujo</span>
          </button>

          {/* Quick Insert Complete Flowchart */}
          {onInsertFlowchart && (
            <>
              <div className="menu-divider-line" />
              <button
                type="button"
                className="diagram-insert-preset-btn"
                onClick={() => {
                  onInsertFlowchart();
                  onClose();
                }}
              >
                <Zap size={14} className="zap-icon" />
                <span>Insertar Flujograma</span>
              </button>
            </>
          )}
        </div>
      )}

      <style>{`
        .shapes-flyout-tabs {
          display: flex;
          background: #f1f3f8;
          border-radius: 8px;
          padding: 2px;
          gap: 2px;
          margin-bottom: 4px;
        }

        .shapes-tab-pill {
          flex: 1;
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 5px 4px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.12s ease;
          text-align: center;
          white-space: nowrap;
        }

        .shapes-tab-pill:hover {
          color: #0f172a;
        }

        .shapes-tab-pill.active {
          background: #ffffff;
          color: #2563eb;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        .shapes-category-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .shapes-back-row {
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          color: #64748b;
          font-size: 0.73rem;
          font-weight: 600;
          padding: 4px 6px 6px 6px;
          cursor: pointer;
          border-bottom: 1px solid #f1f3f8;
          margin-bottom: 4px;
          transition: color 0.12s ease;
        }

        .shapes-back-row:hover {
          color: #2563eb;
        }

        .shape-badge-count {
          color: #94a3b8;
          font-size: 0.85rem;
          font-weight: 700;
        }

        .highlight-row:hover {
          background: #f5f3ff !important;
          color: #6d28d9 !important;
        }

        .text-indigo { color: #6366f1; }
        .text-blue { color: #2563eb; }
        .text-amber { color: #f59e0b; }
        .text-cyan { color: #06b6d4; }
        .text-purple { color: #a855f7; }
        .text-emerald { color: #10b981; }
        .text-rose { color: #f43f5e; }

        .shape-icon-capsule {
          width: 15px;
          height: 10px;
          border: 1.5px solid #10b981;
          border-radius: 6px;
          flex-shrink: 0;
        }

        .shape-icon-parallelogram {
          width: 15px;
          height: 10px;
          border: 1.5px solid #2563eb;
          transform: skewX(-20deg);
          flex-shrink: 0;
        }

        .diagram-insert-preset-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;
          border: none;
          border-radius: 6px;
          padding: 7px 10px;
          font-size: 0.76rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 4px;
          transition: all 0.15s ease;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
        }

        .diagram-insert-preset-btn:hover {
          background: linear-gradient(135deg, #1d4ed8, #1e40af);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
        }

        .zap-icon {
          color: #fbbf24;
        }
      `}</style>
    </div>
  );
}
