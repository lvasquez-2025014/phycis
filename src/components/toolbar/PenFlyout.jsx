import React from 'react';
import { Wand2 } from 'lucide-react';

const PEN_PRESETS = [
  { id: '#4262ff', label: 'Azul' },
  { id: '#f87171', label: 'Coral' },
  { id: '#10b981', label: 'Verde' },
];

export default function PenFlyout({
  isOpen,
  activeTool,
  setActiveTool,
  penColor,
  setPenColor,
}) {
  if (!isOpen) return null;

  return (
    <div className="pen-flyout-card miro-island">
      {/* 1. Fountain / Fine Pen */}
      <button
        className={`flyout-tool-row ${activeTool === 'pen' ? 'active' : ''}`}
        onClick={() => setActiveTool('pen')}
        title="Pluma (P) - Trazo libre normal"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flyout-row-icon"
        >
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          <path d="M2 2l7.586 7.586" />
          <circle cx="11" cy="11" r="2" />
        </svg>
        <span className="flyout-row-text">Pluma</span>
        <span className="flyout-shortcut-key">P</span>
      </button>

      {/* 2. Highlighter Marker (Chisel tip) */}
      <button
        className={`flyout-tool-row ${activeTool === 'highlighter' ? 'active' : ''}`}
        onClick={() => setActiveTool('highlighter')}
        title="Resaltador (M) - Marcado translúcido normal"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flyout-row-icon"
        >
          <path d="M15 3l4 4-9 9-4-1 1-4 8-8z" />
          <path d="M12 5l4 4" />
          <path d="M5 16l-3 5 5-3" />
        </svg>
        <span className="flyout-row-text">Resaltador</span>
        <span className="flyout-shortcut-key">M</span>
      </button>

      {/* 3. Smart Drawing (Dibujo mágico con varita) */}
      <button
        className={`flyout-tool-row ${activeTool === 'smart_pen' ? 'active' : ''}`}
        onClick={() => setActiveTool('smart_pen')}
        title="Dibujo mágico (W) - Digitaliza automáticamente figuras, letras, números y ecuaciones"
      >
        <Wand2 size={18} className="flyout-row-icon" />
        <span className="flyout-row-text">Dibujo mágico</span>
        <span className="flyout-shortcut-key">W</span>
      </button>

      {/* 4. Stroke Eraser (Borrador de elementos continuos) */}
      <button
        className={`flyout-tool-row ${activeTool === 'stroke_eraser' ? 'active' : ''}`}
        onClick={() => setActiveTool('stroke_eraser')}
        title="Borrador de trazos (E)"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flyout-row-icon"
        >
          <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
          <path d="m5 11 9 9" />
        </svg>
        <span className="flyout-row-text">Borrador de trazos</span>
        <span className="flyout-shortcut-key">E</span>
      </button>

      {/* 5. Pencil Eraser (Borrador tipo lápiz) */}
      <button
        className={`flyout-tool-row ${activeTool === 'pencil_eraser' ? 'active' : ''}`}
        onClick={() => setActiveTool('pencil_eraser')}
        title="Borrador tipo lápiz"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flyout-row-icon"
        >
          <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
          <path d="M22 21H7" />
          <path d="m5 11 9 9" />
        </svg>
        <span className="flyout-row-text">Borrador tipo lápiz</span>
      </button>

      {/* 6. Lasso Selection */}
      <button
        className={`flyout-tool-row ${activeTool === 'lasso' ? 'active' : ''}`}
        onClick={() => setActiveTool('lasso')}
        title="Lazo de selección"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flyout-row-icon"
        >
          <path d="M12 4C7.5 4 4 7.2 4 11.5c0 3.8 2.8 7 6.8 7.8L8.2 22l3.2-1.8c.2.03.4.05.6.05 4.5 0 8-3.2 8-8.7S16.5 4 12 4z" />
        </svg>
        <span className="flyout-row-text">Lazo de selección</span>
      </button>

      <div className="menu-divider-line"></div>

      {/* Colores de trazo */}
      <div className="flyout-colors-header">
        <span>Colores</span>
      </div>
      <div className="flyout-colors-list">
        {PEN_PRESETS.map((p) => {
          const isSelected = penColor === p.id;
          return (
            <button
              key={p.id}
              className={`color-chip-row ${isSelected ? 'active' : ''}`}
              onClick={() => {
                setPenColor(p.id);
                if (['stroke_eraser', 'pencil_eraser', 'object_eraser', 'lasso', 'select'].includes(activeTool)) {
                  setActiveTool('pen');
                }
              }}
              title={p.label}
            >
              <span
                className="preset-inner-dot"
                style={{ backgroundColor: p.id }}
              />
              <span className="color-chip-label">{p.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
