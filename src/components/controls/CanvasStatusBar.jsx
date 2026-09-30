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
  Sparkles,
  Eraser
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

export default function CanvasStatusBar({ activeTool = 'select' }) {
  const [showShortcuts, setShowShortcuts] = useState(false);

  const currentInfo = TOOL_INFOS[activeTool] || TOOL_INFOS.select;
  const ToolIcon = currentInfo.icon;

  return (
    <div className="canvas-status-bar">
      <div className="status-pill-main">
        {/* Active Tool Badge */}
        <div className={`active-tool-chip ${currentInfo.isMagic ? 'magic-active' : ''}`}>
          <ToolIcon size={14} className={currentInfo.isMagic ? 'magic-spin-icon' : ''} />
          <span className="tool-chip-name">{currentInfo.label}</span>
          {currentInfo.isMagic && <span className="magic-dot"></span>}
        </div>

        <div className="status-pill-divider"></div>

        {/* Tip text */}
        <span className="status-tip-text">
          {currentInfo.tip}
        </span>

        {/* Shortcuts Cheat Sheet Button */}
        <button
          className="shortcuts-trigger-btn"
          onClick={() => setShowShortcuts((prev) => !prev)}
          title="Atajos de teclado rápidos"
        >
          <HelpCircle size={14} />
          <span className="shortcuts-btn-label">Atajos</span>
        </button>
      </div>

      {/* Shortcuts Modal Popover */}
      {showShortcuts && (
        <div className="shortcuts-popover-card">
          <div className="shortcuts-header">
            <h4 className="shortcuts-title">Atajos de Teclado</h4>
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
        .canvas-status-bar {
          position: fixed;
          bottom: 18px;
          left: 18px;
          z-index: 45;
          display: flex;
          flex-direction: column;
          gap: 8px;
          pointer-events: none;
        }

        .status-pill-main {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(225, 230, 240, 0.85);
          box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.08);
          border-radius: 9999px;
          padding: 4px 10px 4px 5px;
          transition: all 0.2s ease;
          max-width: 580px;
        }

        .active-tool-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 3px 10px;
          border-radius: 9999px;
          background: #eff6ff;
          color: #2563eb;
          font-family: var(--font-sans);
          font-size: 0.76rem;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 1px 3px rgba(37, 99, 235, 0.1);
        }

        .active-tool-chip.magic-active {
          background: linear-gradient(135deg, #ede9fe 0%, #fae8ff 100%);
          color: #7c3aed;
        }

        .magic-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #a855f7;
          box-shadow: 0 0 6px #a855f7;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }

        .status-pill-divider {
          width: 1px;
          height: 14px;
          background: #e2e8f0;
        }

        .status-tip-text {
          font-size: 0.73rem;
          font-weight: 500;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .shortcuts-trigger-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 9999px;
          color: #475569;
          font-size: 0.7rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          margin-left: auto;
          white-space: nowrap;
        }

        .shortcuts-trigger-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        /* Shortcuts Popover */
        .shortcuts-popover-card {
          pointer-events: auto;
          width: 320px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.14);
          border-radius: 12px;
          padding: 12px 14px;
          animation: contextFadeIn 0.16s ease-out;
        }

        .shortcuts-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 8px;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 8px;
        }

        .shortcuts-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .shortcuts-close-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
        }

        .shortcuts-close-btn:hover {
          color: #0f172a;
        }

        .shortcuts-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-height: 260px;
          overflow-y: auto;
        }

        .shortcut-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          font-size: 0.74rem;
        }

        .shortcut-desc {
          color: #475569;
        }

        .shortcut-kbd {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          padding: 2px 6px;
          font-family: var(--font-sans);
          font-size: 0.68rem;
          font-weight: 700;
          color: #1e293b;
          box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
        }

        @media (max-width: 768px) {
          .status-tip-text {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
