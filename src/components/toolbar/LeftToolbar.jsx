import React, { useState, useEffect } from 'react';
import { 
  MousePointer2,
  Hand,
  Type, 
  StickyNote,
  Shapes,
  Undo2, 
  Redo2,
  Gauge,
} from 'lucide-react';
import PenFlyout from './PenFlyout';
import StickyFlyout from './StickyFlyout';
import ShapesFlyout from './ShapesFlyout';
import GreekSymbolsFlyout from './GreekSymbolsFlyout';
import MruSystemsFlyout from './MruSystemsFlyout';

export default function LeftToolbar({
  activeTool,
  setActiveTool,
  activeShape,
  setActiveShape,
  stickyColor,
  setStickyColor,
  penColor,
  setPenColor,
  penWidth,
  setPenWidth,
  eraserSize,
  setEraserSize,
  eraserShape,
  setEraserShape,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onLoadTemplate,
  onOpenSaveModal,
  onInsertSymbol,
  onAddPhysicsObject,
  onAddAssembly,
  onSelectRopeTool,
  onOpenMruSolver,
  onOpenMruvSolver,
  onOpenFreefallSolver,
  onOpenTiroVerticalSolver,
  onOpenHorizontalLaunchSolver,
  onOpenProjectileMotionSolver,
  onOpenMcuSolver,
  onOpenMcuvSolver,
  onOpenPoleasMcuSolver,
  onOpenDclSolver,
  onOpenEquilibrioSolver,
  onOpenNewtonSolver,
  onOpenCustomExampleBuilder,
  onMountCustomExample,
  onInsertFlowchart,
  onInsertFormulaCard,
}) {
  // Flyout submenu visibility states ('pen' | 'templates' | 'sticky' | 'shapes' | 'greek_symbols' | 'physics_objects' | null)
  const [activeFlyout, setActiveFlyout] = useState(null);

  const isPenFamilyActive = [
    'pen',
    'chalk',
    'highlighter',
    'smart_pen',
    'stroke_eraser',
    'pencil_eraser',
    'object_eraser',
    'eraser',
    'lasso',
  ].includes(activeTool);

  const toggleFlyout = (toolName) => {
    setActiveFlyout((prev) => (prev === toolName ? null : toolName));
  };

  // Close any open flyout when returning to normal cursor ('select')
  useEffect(() => {
    if (activeTool === 'select' || activeTool === 'hand') {
      setActiveFlyout(null);
    }
  }, [activeTool]);

  // Global Escape key to dismiss any flyout and reset to normal cursor
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveFlyout(null);
        setActiveTool('select');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool]);

  return (
    <aside className="webwb-left-container">
      {/* Studio Workbench Left Rail */}
      <div className="left-main-rail">
        <div className="left-tools-top-group">
          {/* SECTION 1: Navigation & Selection */}
          <button
            className={`wb-tool-btn ${activeTool === 'select' ? 'active' : ''}`}
            onClick={() => {
              setActiveTool('select');
              setActiveFlyout(null);
            }}
            title="Seleccionar (V / Esc) — Mover, escalar y seleccionar"
          >
            <MousePointer2 size={19} />
          </button>

        <button
          className={`wb-tool-btn ${activeTool === 'hand' ? 'active' : ''}`}
          onClick={() => {
            setActiveTool('hand');
            setActiveFlyout(null);
          }}
          title="Mano para desplazar (H) — Arrastrar lienzo libremente"
        >
          <Hand size={19} />
        </button>

        <div className="toolbar-section-divider"></div>

        {/* SECTION 2: Drawing & Canvas Objects */}
        <button
          className={`wb-tool-btn ${isPenFamilyActive ? 'active' : ''}`}
          onClick={() => {
            if (!isPenFamilyActive) {
              setActiveTool('pen');
            }
            toggleFlyout('pen');
          }}
          title="Lápiz y Trazos (P) — Pluma, Dibujo Mágico 🪄, Resaltador y Borrador"
        >
          <div className="pen-btn-wrapper">
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
            <span
              className="pen-color-dot"
              style={{ backgroundColor: penColor || '#4262ff' }}
            />
          </div>
        </button>

        <button
          className={`wb-tool-btn ${activeTool === 'text' ? 'active' : ''}`}
          onClick={() => {
            setActiveTool('text');
            setActiveFlyout(null);
          }}
          title="Texto y Ecuaciones (T)"
        >
          <Type size={19} />
        </button>

        <button
          className={`wb-tool-btn ${activeTool === 'sticky' ? 'active' : ''}`}
          onClick={() => {
            setActiveTool('sticky');
            toggleFlyout('sticky');
          }}
          title="Nota adhesiva (N)"
        >
          <StickyNote size={19} />
        </button>

        <button
          className={`wb-tool-btn ${activeTool === 'shape' || activeTool === 'arrow' ? 'active' : ''}`}
          onClick={() => {
            if (activeTool !== 'shape' && activeTool !== 'arrow') {
              setActiveTool('shape');
            }
            toggleFlyout('shapes');
          }}
          title="Formas y Vectores (S) — Figuras y flechas de fuerza"
        >
          <Shapes size={19} />
        </button>

        <div className="toolbar-section-divider"></div>

        {/* SECTION 3: Mathematics & Physics Specialized Tools */}
        <button
          className={`wb-tool-btn physics-accent-tool ${activeFlyout === 'mru_systems' ? 'active' : ''}`}
          onClick={() => toggleFlyout('mru_systems')}
          title="Sistemas Físicos MRU (Móviles, pistas, sensores, variables y fórmulas)"
        >
          <Gauge size={19} />
        </button>

        <button
          className={`wb-tool-btn physics-accent-tool ${activeFlyout === 'greek_symbols' ? 'active' : ''}`}
          onClick={() => toggleFlyout('greek_symbols')}
          title="Alfabeto Griego y Símbolos de Física (Ω) — Σ, θ, α, π, ω, Δ..."
        >
          <span className="omega-symbol-glyph">Ω</span>
        </button>

        </div>

        {/* SECTION 4: History / Undo & Redo docked at bottom */}
        <div className="left-tools-bottom-group">
          <button
            className="wb-tool-btn"
            onClick={onUndo}
            disabled={!canUndo}
            title="Deshacer (Ctrl + Z)"
          >
            <Undo2 size={16} />
          </button>

          <button
            className="wb-tool-btn"
            onClick={onRedo}
            disabled={!canRedo}
            title="Rehacer (Ctrl + Y)"
          >
            <Redo2 size={16} />
          </button>
        </div>
      </div>

      {/* Modular Flyouts */}
      <PenFlyout
        isOpen={activeFlyout === 'pen'}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        penColor={penColor}
        setPenColor={setPenColor}
        eraserSize={eraserSize}
        setEraserSize={setEraserSize}
        eraserShape={eraserShape}
        setEraserShape={setEraserShape}
      />

      <StickyFlyout
        isOpen={activeFlyout === 'sticky'}
        stickyColor={stickyColor}
        setStickyColor={setStickyColor}
        setActiveTool={setActiveTool}
      />

      <ShapesFlyout
        isOpen={activeFlyout === 'shapes'}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        activeShape={activeShape}
        setActiveShape={setActiveShape}
        onClose={() => setActiveFlyout(null)}
        onInsertFlowchart={onInsertFlowchart}
      />

      <MruSystemsFlyout
        isOpen={activeFlyout === 'mru_systems'}
        onClose={() => setActiveFlyout(null)}
        onAddPhysicsObject={onAddPhysicsObject}
        onAddAssembly={onAddAssembly}
        onInsertFormulaCard={onInsertFormulaCard}
      />

      <GreekSymbolsFlyout
        isOpen={activeFlyout === 'greek_symbols'}
        onClose={() => setActiveFlyout(null)}
        onInsertSymbol={onInsertSymbol}
      />

      <style>{`
        .webwb-left-container {
          position: fixed;
          left: 0;
          top: 50px;
          bottom: 32px;
          width: 54px;
          z-index: 50;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-right: 1px solid #e2e8f0;
          box-shadow: 1px 0 4px rgba(15, 23, 42, 0.03);
        }

        .left-main-rail {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          padding: 8px 0;
        }

        .left-tools-top-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        }

        .left-tools-bottom-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          border-top: 1px solid #f1f5f9;
          padding-top: 6px;
          width: 100%;
        }

        .toolbar-section-divider {
          width: 24px;
          height: 1px;
          background: #e2e8f0;
          margin: 3px 0;
        }

        .wb-tool-btn {
          position: relative;
          width: 38px;
          height: 38px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid transparent;
          background: transparent;
          color: #475569;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .wb-tool-btn:hover:not(:disabled) {
          background-color: #f1f5f9;
          color: #0f172a;
        }

        .wb-tool-btn.active {
          background-color: #f0f9ff;
          color: #0284c7;
          border-color: #bae6fd;
        }

        .wb-tool-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .pen-btn-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pen-color-dot {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          border: 1px solid #ffffff;
        }

        .physics-accent-tool {
          color: #3b82f6;
        }

        .physics-accent-tool:hover {
          background-color: #eff6ff;
          color: #1d4ed8;
        }

        .omega-symbol-glyph {
          font-family: 'Cambria Math', 'KaTeX_Main', 'Times New Roman', serif;
          font-size: 1.25rem;
          font-weight: 700;
          line-height: 1;
        }

        /* ------------------------------------------------------------- */
        /* PEN FLYOUT */
        /* ------------------------------------------------------------- */
        .pen-flyout-card {
          position: absolute;
          left: calc(100% + 10px);
          top: 0;
          width: 232px;
          padding: 6px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 6px 24px rgba(5, 0, 56, 0.12);
          border: 1px solid #e1e3ea;
          display: flex;
          flex-direction: column;
          gap: 2px;
          animation: contextFadeIn 0.14s ease-out;
        }

        .flyout-tool-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 10px;
          border-radius: 6px;
          background: transparent;
          border: none;
          color: #050038;
          font-family: var(--font-sans);
          font-size: 0.82rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.12s ease;
          width: 100%;
          text-align: left;
        }

        .flyout-tool-row:hover {
          background: #f1f3f7;
        }

        .flyout-tool-row.active {
          background: #edf2fe;
          color: #4262ff;
          font-weight: 600;
        }

        .flyout-row-icon {
          color: currentColor;
          flex-shrink: 0;
        }

        .flyout-row-text {
          flex: 1;
        }

        .flyout-shortcut-key {
          font-size: 0.72rem;
          color: #5f5c80;
        }

        .flyout-tool-row.active .flyout-shortcut-key {
          color: #4262ff;
        }

        .flyout-colors-header {
          padding: 4px 10px 2px;
          font-size: 0.7rem;
          font-weight: 600;
          color: #5f5c80;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .flyout-colors-list {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 3px 6px 4px;
        }

        .color-chip-row {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 6px 4px;
          border-radius: 6px;
          background: #f4f6fc;
          border: 1.5px solid transparent;
          cursor: pointer;
          font-family: var(--font-sans);
          font-size: 0.75rem;
          font-weight: 600;
          color: #050038;
          transition: all 0.12s ease;
        }

        .color-chip-row:hover {
          background: #edf0f5;
        }

        .color-chip-row.active {
          border-color: #4262ff;
          background: #edf2fe;
          color: #4262ff;
        }

        .preset-inner-dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .wand-magic-icon {
          color: #8b5cf6;
          flex-shrink: 0;
        }

        .flyout-beta-badge {
          font-size: 0.62rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 1px 5px;
          border-radius: 4px;
          background: #f3e8ff;
          color: #7c3aed;
          border: 1px solid #ddd6fe;
          line-height: 1.2;
          margin-left: auto;
          margin-right: 4px;
        }

        .flyout-tool-row.active .flyout-beta-badge {
          background: #7c3aed;
          color: #ffffff;
          border-color: #6d28d9;
        }

        .custom-color-chip-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #f4f6fc;
          border: 1.5px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 3px;
          flex-shrink: 0;
          transition: all 0.12s ease;
          box-sizing: border-box;
        }

        .custom-color-chip-btn:hover {
          background: #edf0f5;
          border-color: #4262ff;
          transform: scale(1.05);
        }

        .custom-color-chip-btn.active,
        .custom-color-chip-btn.open {
          border-color: #4262ff;
          background: #edf2fe;
          box-shadow: 0 0 0 2px rgba(66, 98, 255, 0.2);
        }

        .custom-color-chip-preview {
          width: 100%;
          height: 100%;
          border-radius: 5px;
          box-shadow: 0 0 1px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.9);
        }

        .pen-flyout-picker-popover {
          position: absolute;
          left: calc(100% + 10px);
          bottom: -10px;
          z-index: 80;
          animation: contextFadeIn 0.14s ease-out;
        }

        /* ------------------------------------------------------------- */
        /* PENCIL ERASER CONFIGURATION PANEL (PHOTOSHOP STYLE)          */
        /* ------------------------------------------------------------- */
        .pencil-eraser-config-panel {
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin: 3px 0 4px;
          padding: 8px 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-sizing: border-box;
          animation: contextFadeIn 0.12s ease-out;
        }

        .config-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .config-label {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #64748b;
        }

        .config-value-badge {
          font-size: 0.72rem;
          font-weight: 700;
          color: #0284c7;
          background: #e0f2fe;
          padding: 1px 6px;
          border-radius: 4px;
        }


        .eraser-range-input {
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: #cbd5e1;
          outline: none;
          cursor: pointer;
          accent-color: #3b82f6;
          margin: 4px 0 2px;
        }

        .eraser-size-presets {
          display: flex;
          gap: 4px;
          margin-top: 2px;
        }

        .size-preset-pill {
          flex: 1;
          padding: 3px 0;
          font-size: 0.65rem;
          font-weight: 600;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          cursor: pointer;
          text-align: center;
          transition: all 0.1s ease;
        }

        .size-preset-pill:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .size-preset-pill.active {
          background: #0284c7;
          border-color: #0284c7;
          color: #ffffff;
        }

        /* ------------------------------------------------------------- */
        /* MRU & TEMPLATES DRAWER STYLING                                */
        /* ------------------------------------------------------------- */
        .templates-drawer-card {
          position: absolute;
          left: calc(100% + 10px);
          top: -40px;
          width: 380px;
          max-height: calc(100vh - 120px);
          overflow-y: auto;
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 8px 32px rgba(5, 0, 56, 0.16);
          border: 1px solid #e1e3ea;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          animation: contextFadeIn 0.14s ease-out;
          user-select: none;
        }

        .templates-drawer-card.mru-expanded-drawer {
          width: 430px;
        }

        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .drawer-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #050038;
          margin: 0;
        }

        .drawer-close-btn {
          background: none;
          border: none;
          color: #5f5c80;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }

        .drawer-close-btn:hover {
          background: #edf0f5;
          color: #050038;
        }

        .tpl-drawer-header-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .tpl-main-badge {
          display: inline-block;
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #4262ff;
          background: #edf2fe;
          padding: 2px 8px;
          border-radius: 12px;
          width: fit-content;
        }

        .templates-cards-list.single-item-view {
          display: flex;
          flex-direction: column;
        }

        .mru-master-item-card {
          display: flex;
          border: 1.5px solid #d5e0fc;
          border-radius: 12px;
          background: #fbfcff;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .mru-master-item-card:hover {
          border-color: #4262ff;
          background: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(66, 98, 255, 0.16);
        }

        .mru-master-visual {
          width: 90px;
          background: linear-gradient(135deg, #4262ff 0%, #2544d6 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 12px 6px;
          color: #ffffff;
        }

        .mru-master-brand {
          font-size: 1.3rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .mru-master-tag {
          font-size: 0.65rem;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.22);
          padding: 2px 6px;
          border-radius: 10px;
          text-transform: uppercase;
        }

        .mru-master-body {
          flex: 1;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .mru-master-top-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .mru-master-title {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 700;
          color: #050038;
        }

        .mru-sub-count {
          font-size: 0.72rem;
          font-weight: 600;
          color: #4262ff;
          background: #edf2fe;
          padding: 2px 7px;
          border-radius: 10px;
        }

        .mru-master-desc {
          margin: 0;
          font-size: 0.76rem;
          color: #5f5c80;
          line-height: 1.35;
        }

        .mru-master-footer {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
          color: #4262ff;
          font-size: 0.78rem;
          font-weight: 600;
        }

        .school-unit-summary-card {
          background: #f6f8fb;
          border: 1px solid #e1e3ea;
          border-radius: 10px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .school-unit-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .school-cap-icon {
          color: #4262ff;
        }

        .school-unit-heading {
          font-size: 0.85rem;
          font-weight: 700;
          color: #050038;
        }

        .school-unit-subtext {
          margin: 0;
          font-size: 0.76rem;
          color: #5f5c80;
          line-height: 1.4;
        }

        .school-unit-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: #4262ff;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 0.76rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
          margin-top: 2px;
        }

        .school-unit-action-btn:hover {
          background: #314bd9;
        }

        .mru-drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .mru-back-nav-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f0f1f4;
          border: none;
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 0.76rem;
          font-weight: 600;
          color: #5f5c80;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .mru-back-nav-btn:hover {
          background: #e1e3ea;
          color: #050038;
        }

        .mru-title-center {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .mru-sub-badge {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #4262ff;
        }

        .mru-sub-drawer-title {
          margin: 0;
          font-size: 0.98rem;
          font-weight: 700;
          color: #050038;
        }

        .mru-search-bar {
          position: relative;
          display: flex;
          align-items: center;
        }

        .mru-search-icon {
          position: absolute;
          left: 10px;
          color: #83809b;
          pointer-events: none;
        }

        .mru-search-bar input {
          width: 100%;
          height: 34px;
          padding: 0 30px 0 32px;
          background: #f5f6f8;
          border: 1px solid #e1e3ea;
          border-radius: 8px;
          font-size: 0.8rem;
          font-family: var(--font-sans);
          color: #050038;
          outline: none;
          box-sizing: border-box;
          transition: all 0.15s ease;
        }

        .mru-search-bar input:focus {
          background: #ffffff;
          border-color: #4262ff;
          box-shadow: 0 0 0 3px rgba(66, 98, 255, 0.14);
        }

        .mru-search-clear {
          position: absolute;
          right: 8px;
          background: none;
          border: none;
          color: #83809b;
          cursor: pointer;
          padding: 2px;
        }

        .mru-subtopics-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 420px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .mru-subtopics-list::-webkit-scrollbar {
          width: 5px;
        }

        .mru-subtopics-list::-webkit-scrollbar-thumb {
          background: #d0d3dc;
          border-radius: 4px;
        }

        .mru-subtopic-row {
          display: flex;
          align-items: stretch;
          background: #fbfcff;
          border: 1px solid #e4e7ee;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .mru-subtopic-row:hover {
          background: #ffffff;
          border-color: #4262ff;
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(66, 98, 255, 0.12);
        }

        .mru-row-left-bar {
          width: 5px;
          flex-shrink: 0;
        }

        .mru-row-content {
          flex: 1;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .mru-row-meta-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.68rem;
        }

        .mru-row-week {
          font-weight: 700;
          color: #4262ff;
        }

        .mru-row-pts {
          font-weight: 700;
          color: #10b981;
          background: #d3f8df;
          padding: 1px 6px;
          border-radius: 8px;
        }

        .mru-row-title {
          margin: 0;
          font-size: 0.88rem;
          font-weight: 700;
          color: #050038;
        }

        .mru-row-activity {
          font-size: 0.72rem;
          font-weight: 600;
          color: #5f5c80;
        }

        .mru-row-desc {
          margin: 2px 0 0 0;
          font-size: 0.72rem;
          color: #727088;
          line-height: 1.35;
        }

        .mru-row-action {
          display: flex;
          align-items: center;
          justify-content: center;
          padding-right: 12px;
          color: #83809b;
          transition: color 0.15s ease;
        }

        .mru-subtopic-row:hover .mru-row-action {
          color: #4262ff;
        }

        .mru-empty-search {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 16px;
          text-align: center;
          color: #5f5c80;
          font-size: 0.8rem;
        }

        .mru-empty-btn {
          margin-top: 8px;
          background: #edf2fe;
          color: #4262ff;
          border: none;
          border-radius: 6px;
          padding: 5px 12px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
        }

        .mru-drawer-footer {
          border-top: 1px solid #f0f1f4;
          padding-top: 8px;
          font-size: 0.7rem;
          color: #727088;
          line-height: 1.35;
        }

        /* ------------------------------------------------------------- */
        /* STICKY NOTES 16-COLOR PALETTE */
        /* ------------------------------------------------------------- */
        .sticky-flyout-card {
          position: absolute;
          left: calc(100% + 10px);
          top: 40px;
          width: 140px;
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 4px 20px rgba(5, 0, 56, 0.12);
          border: 1px solid #e1e3ea;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          animation: contextFadeIn 0.14s ease-out;
        }

        .sticky-palette-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .sticky-square-tile {
          width: 48px;
          height: 48px;
          border-radius: 6px;
          border: 1.5px solid transparent;
          cursor: pointer;
          transition: transform 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.06);
        }

        .sticky-square-tile:hover {
          transform: scale(1.06);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
        }

        .sticky-square-tile.active {
          border-color: #4262ff;
          box-shadow: 0 0 0 2px rgba(66, 98, 255, 0.35);
        }

        .sticky-actions-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          border-top: 1px solid #e1e3ea;
          padding-top: 10px;
        }

        .sticky-action-row-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          padding: 5px 6px;
          border-radius: 6px;
          color: #050038;
          font-family: var(--font-sans);
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.12s ease;
          width: 100%;
          text-align: left;
        }

        .sticky-action-row-btn:hover {
          background: #edf0f5;
        }

        .bulk-mode-label {
          font-size: 0.72rem;
          color: #5f5c80;
          padding: 2px 6px;
        }

        /* ------------------------------------------------------------- */
        /* SHAPES & LINES MENU */
        /* ------------------------------------------------------------- */
        .shapes-flyout-menu {
          position: absolute;
          left: calc(100% + 10px);
          top: 80px;
          width: 190px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 6px 24px rgba(5, 0, 56, 0.12);
          border: 1px solid #e1e3ea;
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          animation: contextFadeIn 0.14s ease-out;
        }

        .shape-item-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 10px;
          border-radius: 6px;
          background: transparent;
          border: none;
          color: #050038;
          font-family: var(--font-sans);
          font-size: 0.82rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.12s ease;
          width: 100%;
          text-align: left;
        }

        .shape-item-row:hover {
          background: #f1f3f7;
        }

        .shape-item-row.active {
          background: #edf2fe;
          color: #4262ff;
          font-weight: 600;
        }

        .shape-item-row.dim {
          color: #5f5c80;
          cursor: default;
        }

        .shape-row-icon {
          color: currentColor;
          flex-shrink: 0;
        }

        .shape-row-text {
          flex: 1;
        }

        .shape-shortcut-key {
          font-size: 0.72rem;
          color: #5f5c80;
        }

        .shape-item-row.active .shape-shortcut-key {
          color: #4262ff;
        }

        .menu-divider-line {
          height: 1px;
          background: #e1e3ea;
          margin: 4px 6px;
        }

        .diagram-orange-icon {
          color: #f97316;
        }

        /* ------------------------------------------------------------- */
        /* GREEK SYMBOLS DRAWER STYLING */
        /* ------------------------------------------------------------- */
        .symbols-drawer-card {
          position: absolute;
          left: calc(100% + 10px);
          top: 0;
          width: 440px;
          max-height: calc(100vh - 80px);
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 12px 36px rgba(15, 23, 42, 0.16), 0 4px 12px rgba(15, 23, 42, 0.08);
          border: 1px solid #e2e8f0;
          padding: 16px 16px 14px 16px;
          box-sizing: border-box;
          animation: flyoutSlideIn 0.15s ease-out;
          user-select: none;
          z-index: 100;
        }

        .symbols-drawer-header {
          flex-shrink: 0;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .symbols-header-titles {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .symbols-badge-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 2px;
        }

        .symbols-header-badge {
          display: inline-block;
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #2563eb;
          background: #eff6ff;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .symbols-count-badge {
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 500;
        }

        .symbols-drawer-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .symbols-drawer-subtitle {
          font-size: 0.75rem;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .symbols-close-btn {
          flex-shrink: 0;
          background: transparent;
          border: none;
          color: #64748b;
          border-radius: 6px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .symbols-close-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .symbols-search-container {
          flex-shrink: 0;
          position: relative;
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }

        .symbols-search-icon {
          position: absolute;
          left: 10px;
          color: #94a3b8;
          pointer-events: none;
        }

        .symbols-search-input {
          width: 100%;
          height: 36px;
          padding: 0 32px 0 32px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.82rem;
          font-family: var(--font-sans);
          color: #0f172a;
          outline: none;
          transition: all 0.15s ease;
          box-sizing: border-box;
        }

        .symbols-search-input:focus {
          background: #ffffff;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .symbols-clear-btn {
          position: absolute;
          right: 8px;
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        .symbols-clear-btn:hover {
          color: #0f172a;
          background: #e2e8f0;
        }

        .symbols-category-tabs {
          flex-shrink: 0;
          display: flex;
          gap: 6px;
          margin-bottom: 10px;
          overflow-x: auto;
          padding: 2px 2px 4px 2px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .symbols-category-tabs::-webkit-scrollbar {
          display: none;
        }

        .symbols-tab-pill {
          flex-shrink: 0;
          background: #f1f5f9;
          border: 1px solid transparent;
          border-radius: 16px;
          padding: 5px 10px;
          font-size: 0.72rem;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .symbols-tab-pill:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .symbols-tab-pill.active {
          background: #2563eb;
          border-color: #2563eb;
          color: #ffffff;
          box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
        }

        .symbols-grid-scrollable {
          flex: 1;
          min-height: 220px;
          max-height: 380px;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 4px 4px 8px 2px;
          box-sizing: border-box;
        }

        .symbols-grid-scrollable::-webkit-scrollbar {
          width: 5px;
        }

        .symbols-grid-scrollable::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .symbols-grid-scrollable::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .symbols-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
          width: 100%;
          box-sizing: border-box;
        }

        .symbol-tile-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 0;
          width: 100%;
          height: 70px;
          padding: 6px 4px 6px 4px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
          box-sizing: border-box;
          overflow: hidden;
          gap: 2px;
        }

        .symbol-tile-card:hover {
          background: #ffffff;
          border-color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }

        .symbol-tile-card:active {
          transform: scale(0.96);
        }

        .symbol-glyph {
          font-family: 'Cambria Math', 'KaTeX_Main', 'STIX Two Math', 'Times New Roman', serif;
          font-size: 1.6rem;
          line-height: 1;
          color: #0f172a;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 32px;
          user-select: none;
        }

        .symbol-tile-card:hover .symbol-glyph {
          color: #2563eb;
        }

        .symbol-label {
          font-size: 0.67rem;
          font-weight: 600;
          color: #64748b;
          text-align: center;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding: 0 3px;
          box-sizing: border-box;
          line-height: 1.2;
        }

        .symbol-tile-card:hover .symbol-label {
          color: #1d4ed8;
        }

        .symbols-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px 16px;
          text-align: center;
        }

        .empty-emoji {
          font-size: 2rem;
          margin-bottom: 8px;
        }

        .empty-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px 0;
        }

        .empty-desc {
          font-size: 0.74rem;
          color: #64748b;
          margin: 0 0 12px 0;
          line-height: 1.4;
        }

        .empty-clear-btn {
          background: #eff6ff;
          color: #2563eb;
          border: none;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 0.74rem;
          font-weight: 600;
          cursor: pointer;
        }

        .empty-clear-btn:hover {
          background: #2563eb;
          color: #ffffff;
        }

        .symbols-drawer-footer {
          flex-shrink: 0;
          margin-top: 10px;
          padding-top: 8px;
          border-top: 1px solid #f1f5f9;
        }

        .footer-tip-text {
          font-size: 0.7rem;
          color: #64748b;
          line-height: 1.35;
          display: block;
        }

        .footer-tip-text.text-copied {
          color: #059669;
          font-weight: 600;
        }
      `}</style>
    </aside>
  );
}
