import React, { useState, useEffect } from 'react';
import { 
  MousePointer2,
  Hand,
  Type, 
  StickyNote,
  Shapes, 
  BookOpen,
  Undo2, 
  Redo2,
  Weight
} from 'lucide-react';
import PenFlyout from './PenFlyout';
import TemplatesFlyout from './TemplatesFlyout';
import StickyFlyout from './StickyFlyout';
import ShapesFlyout from './ShapesFlyout';
import GreekSymbolsFlyout from './GreekSymbolsFlyout';
import PhysicsObjectsFlyout from './PhysicsObjectsFlyout';

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
}) {
  // Flyout submenu visibility states ('pen' | 'templates' | 'sticky' | 'shapes' | 'greek_symbols' | 'physics_objects' | null)
  const [activeFlyout, setActiveFlyout] = useState(null);

  const isPenFamilyActive = [
    'pen',
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
      {/* Main Unified Tools Floating Island */}
      <div className="left-main-island">
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

        {/* SECTION 3: Physics & Mathematics Specialized Tools */}
        <button
          className={`wb-tool-btn physics-accent-tool ${activeFlyout === 'physics_objects' ? 'active' : ''}`}
          onClick={() => toggleFlyout('physics_objects')}
          title="Objetos Físicos Interactivos (Masas, Poleas, Cuerdas...)"
        >
          <Weight size={19} />
        </button>

        <button
          className={`wb-tool-btn physics-accent-tool ${activeFlyout === 'greek_symbols' ? 'active' : ''}`}
          onClick={() => toggleFlyout('greek_symbols')}
          title="Alfabeto Griego y Símbolos de Física (Ω) — Σ, θ, α, π, ω, Δ..."
        >
          <span className="omega-symbol-glyph">Ω</span>
        </button>

        <button
          className={`wb-tool-btn physics-accent-tool ${activeFlyout === 'templates' ? 'active' : ''}`}
          onClick={() => toggleFlyout('templates')}
          title="Plantillas Escolares y Temario de MRU (Física)"
        >
          <BookOpen size={19} />
        </button>

        <div className="toolbar-section-divider"></div>

        {/* SECTION 4: History / Undo & Redo */}
        <button
          className="wb-tool-btn"
          onClick={onUndo}
          disabled={!canUndo}
          title="Deshacer (Ctrl + Z)"
        >
          <Undo2 size={17} />
        </button>

        <button
          className="wb-tool-btn"
          onClick={onRedo}
          disabled={!canRedo}
          title="Rehacer (Ctrl + Y)"
        >
          <Redo2 size={17} />
        </button>
      </div>

      {/* Modular Flyouts */}
      <PhysicsObjectsFlyout
        isOpen={activeFlyout === 'physics_objects'}
        onClose={() => setActiveFlyout(null)}
        onAddPhysicsObject={(type, preset) => {
          if (onAddPhysicsObject) {
            onAddPhysicsObject(type, preset);
          }
          setActiveFlyout(null);
        }}
        onAddAssembly={(assemblyType) => {
          if (onAddAssembly) {
            onAddAssembly(assemblyType);
          }
          setActiveFlyout(null);
        }}
        onSelectRopeTool={() => {
          if (onSelectRopeTool) {
            onSelectRopeTool();
          }
          setActiveFlyout(null);
        }}
        onOpenMruSolver={onOpenMruSolver}
      />

      <PenFlyout
        isOpen={activeFlyout === 'pen'}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        penColor={penColor}
        setPenColor={setPenColor}
      />

      <TemplatesFlyout
        isOpen={activeFlyout === 'templates'}
        onClose={() => setActiveFlyout(null)}
        onLoadTemplate={onLoadTemplate}
      />

      <StickyFlyout
        isOpen={activeFlyout === 'sticky'}
        stickyColor={stickyColor}
        setStickyColor={setStickyColor}
        setActiveTool={setActiveTool}
        onOpenTemplates={() => toggleFlyout('templates')}
      />

      <ShapesFlyout
        isOpen={activeFlyout === 'shapes'}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        activeShape={activeShape}
        setActiveShape={setActiveShape}
        onClose={() => setActiveFlyout(null)}
        onOpenTemplates={() => toggleFlyout('templates')}
      />

      <GreekSymbolsFlyout
        isOpen={activeFlyout === 'greek_symbols'}
        onClose={() => setActiveFlyout(null)}
        onInsertSymbol={onInsertSymbol}
      />

      <style>{`
        .webwb-left-container {
          position: fixed;
          left: 14px;
          top: 90px;
          z-index: 50;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .left-main-island {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 6px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-radius: 14px;
          box-shadow: 0 6px 20px -2px rgba(15, 23, 42, 0.1);
          border: 1px solid rgba(225, 230, 240, 0.85);
          transition: box-shadow 0.2s ease;
        }

        .left-main-island:hover {
          box-shadow: 0 8px 28px -2px rgba(15, 23, 42, 0.14);
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
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid transparent;
          background: transparent;
          color: #475569;
          cursor: pointer;
          transition: all 0.16s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .wb-tool-btn:hover:not(:disabled) {
          background-color: #f1f5f9;
          color: #0f172a;
          transform: scale(1.04);
        }

        .wb-tool-btn.active {
          background-color: #eff6ff;
          color: #2563eb;
          border-color: #bfdbfe;
          box-shadow: 0 1px 3px rgba(37, 99, 235, 0.12);
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
          width: 216px;
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
          width: 380px;
          max-height: 560px;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 10px 36px rgba(5, 0, 56, 0.16);
          border: 1px solid #e1e3ea;
          padding: 16px;
          box-sizing: border-box;
          animation: flyoutSlideIn 0.15s ease-out;
          user-select: none;
        }

        .symbols-drawer-header {
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
          color: #4262ff;
          background: #edf2fe;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .symbols-count-badge {
          font-size: 0.72rem;
          color: #5f5c80;
          font-weight: 500;
        }

        .symbols-drawer-title {
          font-size: 1rem;
          font-weight: 700;
          color: #050038;
          margin: 0;
        }

        .symbols-drawer-subtitle {
          font-size: 0.74rem;
          color: #5f5c80;
          margin: 2px 0 0 0;
        }

        .symbols-close-btn {
          background: transparent;
          border: none;
          color: #5f5c80;
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
          background: #f0f1f4;
          color: #050038;
        }

        .symbols-search-container {
          position: relative;
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }

        .symbols-search-icon {
          position: absolute;
          left: 10px;
          color: #83809b;
          pointer-events: none;
        }

        .symbols-search-input {
          width: 100%;
          height: 36px;
          padding: 0 32px 0 32px;
          background: #f5f6f8;
          border: 1px solid #e1e3ea;
          border-radius: 8px;
          font-size: 0.82rem;
          font-family: var(--font-sans);
          color: #050038;
          outline: none;
          transition: all 0.15s ease;
          box-sizing: border-box;
        }

        .symbols-search-input:focus {
          background: #ffffff;
          border-color: #4262ff;
          box-shadow: 0 0 0 3px rgba(66, 98, 255, 0.15);
        }

        .symbols-clear-btn {
          position: absolute;
          right: 8px;
          background: transparent;
          border: none;
          color: #83809b;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        .symbols-clear-btn:hover {
          color: #050038;
          background: #e1e3ea;
        }

        .symbols-category-tabs {
          display: flex;
          gap: 6px;
          margin-bottom: 12px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }

        .symbols-category-tabs::-webkit-scrollbar {
          display: none;
        }

        .symbols-tab-pill {
          background: #f0f1f4;
          border: none;
          border-radius: 16px;
          padding: 4px 10px;
          font-size: 0.72rem;
          font-weight: 600;
          color: #5f5c80;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .symbols-tab-pill:hover {
          background: #e1e3ea;
          color: #050038;
        }

        .symbols-tab-pill.active {
          background: #4262ff;
          color: #ffffff;
        }

        .symbols-grid-scrollable {
          flex: 1;
          max-height: 320px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .symbols-grid-scrollable::-webkit-scrollbar {
          width: 5px;
        }

        .symbols-grid-scrollable::-webkit-scrollbar-thumb {
          background: #d0d3dc;
          border-radius: 4px;
        }

        .symbols-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        .symbol-tile-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 10px 4px 8px 4px;
          background: #fbfcff;
          border: 1px solid #e7e9f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
          gap: 4px;
        }

        .symbol-tile-card:hover {
          background: #edf2fe;
          border-color: #4262ff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(66, 98, 255, 0.16);
        }

        .symbol-tile-card:active {
          transform: scale(0.96);
        }

        .symbol-glyph {
          font-family: 'Cambria Math', 'KaTeX_Main', 'Times New Roman', serif;
          font-size: 1.55rem;
          line-height: 1;
          color: #050038;
          font-weight: 500;
        }

        .symbol-tile-card:hover .symbol-glyph {
          color: #4262ff;
        }

        .symbol-label {
          font-size: 0.65rem;
          font-weight: 600;
          color: #5f5c80;
          text-align: center;
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding: 0 2px;
        }

        .symbol-tile-card:hover .symbol-label {
          color: #2b45cb;
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
          color: #050038;
          margin: 0 0 4px 0;
        }

        .empty-desc {
          font-size: 0.74rem;
          color: #5f5c80;
          margin: 0 0 12px 0;
          line-height: 1.4;
        }

        .empty-clear-btn {
          background: #edf2fe;
          color: #4262ff;
          border: none;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 0.74rem;
          font-weight: 600;
          cursor: pointer;
        }

        .empty-clear-btn:hover {
          background: #4262ff;
          color: #ffffff;
        }

        .symbols-drawer-footer {
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid #f0f1f4;
        }

        .footer-tip-text {
          font-size: 0.7rem;
          color: #727088;
          line-height: 1.35;
          display: block;
        }
      `}</style>
    </aside>
  );
}
