import React, { useState } from 'react';
import { Wand2 } from 'lucide-react';
import CustomColorPicker from './CustomColorPicker';

export default function PenFlyout({
  isOpen,
  activeTool,
  setActiveTool,
  penColor,
  setPenColor,
  eraserSize = 24,
  setEraserSize,
  eraserShape = 'circle',
  setEraserShape,
}) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="pen-flyout-card miro-island"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* 1. Fountain / Fine Pen */}
      <button
        type="button"
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

      {/* 2. Lápiz Tiza (Chalk) */}
      <button
        type="button"
        className={`flyout-tool-row ${activeTool === 'chalk' ? 'active' : ''}`}
        onClick={() => {
          setActiveTool('chalk');
          if (penColor === '#050038' || !penColor) {
            setPenColor?.('#ffffff');
          }
        }}
        title="Lápiz Tiza (K) - Trazo realista de tiza escolar"
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
          <path d="M14 3l7 7L7 24H0v-7L14 3z" />
          <path d="M11 6l7 7" />
        </svg>
        <span className="flyout-row-text">Lápiz Tiza</span>
        <span className="flyout-shortcut-key">K</span>
      </button>

      {/* 3. Highlighter Marker (Chisel tip) */}
      <button
        type="button"
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

      {/* 3. Stroke Eraser (Borrador de elementos continuos) */}
      <button
        type="button"
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

      {/* 4. Pencil Eraser (Borrador tipo lápiz) */}
      <button
        type="button"
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

      {/* Opciones de tamaño del Borrador tipo lápiz */}
      {activeTool === 'pencil_eraser' && (
        <div className="pencil-eraser-config-panel">
          {/* Grosor / Tamaño con slider */}
          <div className="config-section-header">
            <span className="config-label">Grosor / Tamaño</span>
            <span className="config-value-badge">{eraserSize} px</span>
          </div>
          <input
            type="range"
            min="8"
            max="100"
            step="2"
            value={eraserSize}
            onChange={(e) => setEraserSize && setEraserSize(Number(e.target.value))}
            className="eraser-range-input"
          />

          {/* Preajustes rápidos de tamaño */}
          <div className="eraser-size-presets">
            {[12, 24, 48, 80].map((s) => (
              <button
                key={s}
                type="button"
                className={`size-preset-pill ${eraserSize === s ? 'active' : ''}`}
                onClick={() => setEraserSize && setEraserSize(s)}
              >
                {s} px
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Lasso Selection */}
      <button
        type="button"
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

      {/* 6. Smart Drawing (Dibujo mágico con varita) - HASTA ABAJO CON TEXTO BETA */}
      <button
        type="button"
        className={`flyout-tool-row ${activeTool === 'smart_pen' ? 'active' : ''}`}
        onClick={() => setActiveTool('smart_pen')}
        title="Dibujo mágico (W) - Digitaliza automáticamente figuras, letras, números y ecuaciones (Beta)"
      >
        <Wand2 size={18} className="flyout-row-icon wand-magic-icon" />
        <span className="flyout-row-text">Dibujo mágico</span>
        <span className="flyout-beta-badge">BETA</span>
        <span className="flyout-shortcut-key">W</span>
      </button>

      <div className="menu-divider-line"></div>

      {/* Color de trazo */}
      <div className="flyout-colors-header">
        <span>Colores</span>
      </div>
      <div className="flyout-colors-list">
        {/* Único cuadro para personalizar el color */}
        <button
          type="button"
          className={`custom-color-chip-btn ${showCustomPicker ? 'open' : ''}`}
          onClick={() => {
            setShowCustomPicker((prev) => !prev);
            if (
              [
                'stroke_eraser',
                'pencil_eraser',
                'object_eraser',
                'lasso',
                'select',
              ].includes(activeTool)
            ) {
              setActiveTool('pen');
            }
          }}
          title={`Color actual: ${penColor || '#4262ff'} (Clic para personalizar)`}
        >
          <span
            className="custom-color-chip-preview"
            style={{
              backgroundColor: penColor || '#4262ff',
            }}
          />
        </button>
      </div>

      {/* Pantallita desplegable para personalizar color */}
      {showCustomPicker && (
        <div className="pen-flyout-picker-popover">
          <CustomColorPicker
            color={penColor}
            onChange={(newHex) => {
              setPenColor(newHex);
              if (
                [
                  'stroke_eraser',
                  'pencil_eraser',
                  'object_eraser',
                  'lasso',
                  'select',
                ].includes(activeTool)
              ) {
                setActiveTool('pen');
              }
            }}
            onClose={() => setShowCustomPicker(false)}
          />
        </div>
      )}
    </div>
  );
}
