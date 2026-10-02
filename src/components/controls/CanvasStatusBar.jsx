import React, { useState } from 'react';
import { 
  MousePointer2, 
  Hand, 
  Pen, 
  Type, 
  StickyNote, 
  Shapes, 
  Wand2, 
  HelpCircle, 
  X,
  Eraser,
  Minus,
  Plus,
  Compass,
  Maximize2
} from 'lucide-react';

const TOOL_INFOS = {
  select: {
    label: 'Seleccionar',
    icon: MousePointer2,
    tip: 'Clic o arrastra recuadro para seleccionar • Supr para borrar • Ctrl+D duplicar',
  },
  hand: {
    label: 'Mano (Desplazar)',
    icon: Hand,
    tip: 'Arrastra libremente para explorar el lienzo infinito • Rueda para zoom',
  },
  pen: {
    label: 'Pluma libre',
    icon: Pen,
    tip: 'Traza diagramas y esquemas vectoriales sin retardo',
  },
  highlighter: {
    label: 'Resaltador',
    icon: Pen,
    tip: 'Resalta fórmulas y datos clave con tinta translúcida',
  },
  smart_pen: {
    label: 'Dibujo Mágico',
    icon: Wand2,
    tip: '¡Escribe números o símbolos griegos y se convertirán en texto matemático!',
    isMagic: true,
  },
  stroke_eraser: {
    label: 'Borrador de trazos',
    icon: Eraser,
    tip: 'Haz clic o pasa por encima de cualquier trazo para eliminarlo por completo',
  },
  pencil_eraser: {
    label: 'Borrador libre',
    icon: Eraser,
    tip: 'Borra áreas continuas como una goma tradicional',
  },
  text: {
    label: 'Texto & Ecuaciones',
    icon: Type,
    tip: 'Haz clic en el lienzo para redactar enunciados o fórmulas',
  },
  sticky: {
    label: 'Nota adhesiva',
    icon: StickyNote,
    tip: 'Haz clic en el lienzo para colocar una nota de recordatorio',
  },
  shape: {
    label: 'Formas geométricas',
    icon: Shapes,
    tip: 'Arrastra para crear figuras, vectores y líneas de fuerzas',
  },
};

const SHORTCUTS = [
  { key: 'V', desc: 'Herramienta Selección' },
  { key: 'H / Espacio', desc: 'Mover/Arrastrar lienzo' },
  { key: 'P', desc: 'Lápiz / Pluma' },
  { key: 'W', desc: 'Dibujo Mágico (Auto-matemática)' },
  { key: 'T', desc: 'Insertar Texto' },
  { key: 'N', desc: 'Nota Adhesiva' },
  { key: 'S', desc: 'Formas y Flechas' },
  { key: 'E', desc: 'Borrador de trazos' },
  { key: 'Ctrl + Z', desc: 'Deshacer acción' },
  { key: 'Ctrl + Y', desc: 'Rehacer acción' },
  { key: 'Ctrl + D', desc: 'Duplicar selección' },
  { key: 'Supr / Backspace', desc: 'Eliminar seleccionados' },
  { key: 'Rueda / Ctrl + Rueda', desc: 'Zoom y navegación' },
];

export default function CanvasStatusBar({ 
  activeTool = 'select',
  scale = 1.0,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  minimapOpen = false,
  onToggleMinimap,
}) {
  const [showShortcuts, setShowShortcuts] = useState(false);

  const currentInfo = TOOL_INFOS[activeTool] || TOOL_INFOS.select;
  const ToolIcon = currentInfo.icon;

  return (
    <footer className="studio-bottom-bar">
      {/* 1. LEFT: Active Tool & Tip */}
      <div className="bottom-bar-left">
        <div className={`status-tool-badge ${currentInfo.isMagic ? 'magic-active' : ''}`}>
          <ToolIcon size={13} className={currentInfo.isMagic ? 'magic-spin-icon' : ''} />
          <span className="tool-badge-text">{currentInfo.label}</span>
          {currentInfo.isMagic && <span className="magic-dot" />}
        </div>

        <div className="status-divider" />

        <span className="status-tip-text">
          {currentInfo.tip}
        </span>
      </div>

      {/* 2. CENTER: Laboratory Reference System */}
      <div className="bottom-bar-center">
        <span className="studio-system-label">
          Sistema de Referencia Inercial (SI) • Escala Métrica
        </span>
      </div>

      {/* 3. RIGHT: Shortcuts & Integrated Zoom */}
      <div className="bottom-bar-right">
        {/* Shortcuts Trigger */}
        <button
          className="bottom-bar-btn"
          onClick={() => setShowShortcuts((prev) => !prev)}
          title="Atajos de teclado rápidos"
        >
          <HelpCircle size={13} />
          <span>Atajos</span>
        </button>

        <div className="status-divider" />

        {/* Zoom Controls */}
        <div className="zoom-controls-integrated">
          <button className="zoom-sub-btn" onClick={onZoomOut} title="Alejar (-)">
            <Minus size={13} />
          </button>

          <button className="zoom-value-btn" onClick={onResetZoom} title="Restablecer zoom al 100%">
            {Math.round(scale * 100)}%
          </button>

          <button className="zoom-sub-btn" onClick={onZoomIn} title="Acercar (+)">
            <Plus size={13} />
          </button>

          {onToggleMinimap && (
            <button
              className={`zoom-sub-btn ${minimapOpen ? 'active' : ''}`}
              onClick={onToggleMinimap}
              title="Mostrar / Ocultar radar minimapa"
            >
              <Compass size={13} />
            </button>
          )}

          {onResetZoom && (
            <button className="zoom-sub-btn" onClick={onResetZoom} title="Ajustar a 100%">
              <Maximize2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Shortcuts Modal Popover */}
      {showShortcuts && (
        <div className="shortcuts-popover-card">
          <div className="shortcuts-header">
            <h4 className="shortcuts-title">Atajos de Teclado del Laboratorio</h4>
            <button className="shortcuts-close-btn" onClick={() => setShowShortcuts(false)}>
              <X size={14} />
            </button>
          </div>
          <div className="shortcuts-list">
            {SHORTCUTS.map((s, idx) => (
              <div key={idx} className="shortcut-row">
                <span className="shortcut-desc">{s.desc}</span>
                <kbd className="shortcut-kbd">{s.key}</kbd>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .studio-bottom-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 32px;
          z-index: 52;
          background: #ffffff;
          border-top: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 12px 0 62px;
          user-select: none;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .bottom-bar-left {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          flex: 1;
        }

        .status-tool-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 2px 7px;
          border-radius: 4px;
          background: #f0f9ff;
          color: #0284c7;
          border: 1px solid #bae6fd;
          font-size: 0.72rem;
          font-weight: 700;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .status-tool-badge.magic-active {
          background: #f5f3ff;
          color: #7c3aed;
          border-color: #ddd6fe;
        }

        .magic-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #7c3aed;
        }

        .status-divider {
          width: 1px;
          height: 14px;
          background: #e2e8f0;
          flex-shrink: 0;
        }

        .status-tip-text {
          font-size: 0.7rem;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bottom-bar-center {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 16px;
          flex-shrink: 0;
        }

        .studio-system-label {
          font-size: 0.68rem;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        .bottom-bar-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .bottom-bar-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 7px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          color: #64748b;
          font-size: 0.7rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .bottom-bar-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .zoom-controls-integrated {
          display: flex;
          align-items: center;
          gap: 2px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 5px;
          padding: 1px 3px;
        }

        .zoom-sub-btn {
          width: 22px;
          height: 22px;
          border-radius: 3px;
          border: none;
          background: transparent;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .zoom-sub-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .zoom-sub-btn.active {
          color: #0284c7;
          background: #e0f2fe;
        }

        .zoom-value-btn {
          border: none;
          background: transparent;
          font-size: 0.72rem;
          font-weight: 700;
          color: #334155;
          padding: 0 4px;
          cursor: pointer;
          min-width: 42px;
          text-align: center;
          font-family: ui-monospace, SFMono-Regular, monospace;
        }

        .zoom-value-btn:hover {
          color: #0284c7;
        }

        /* Shortcuts Popover */
        .shortcuts-popover-card {
          position: fixed;
          bottom: 38px;
          right: 14px;
          width: 320px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.14);
          border-radius: 8px;
          padding: 12px 14px;
          animation: contextFadeIn 0.14s ease-out;
          z-index: 60;
        }

        .shortcuts-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          padding-bottom: 6px;
          border-bottom: 1px solid #f1f5f9;
        }

        .shortcuts-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .shortcuts-close-btn {
          border: none;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .shortcuts-close-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .shortcuts-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-height: 280px;
          overflow-y: auto;
        }

        .shortcut-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.72rem;
        }

        .shortcut-desc {
          color: #475569;
        }

        .shortcut-kbd {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          padding: 2px 6px;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.68rem;
          font-weight: 600;
          color: #0f172a;
        }
      `}</style>
    </footer>
  );
}
