import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  Share2, 
  Clock, 
  Save, 
  Trash2, 
  Undo2, 
  Redo2, 
  Edit2, 
  FileText, 
  Image as ImageIcon,
  ChevronDown,
  Sparkles,
  LayoutTemplate,
  Square,
  Grid,
  CircleDot,
  AlignJustify,
  Check,
  Compass,
  Play,
} from 'lucide-react';

const BOARD_TEMPLATES = [
  {
    id: 'cartesian',
    title: 'Plano cartesiano',
    description: 'Ejes coordenados X / Y y cuadrícula milimétrica para física',
    icon: Compass,
  },
  {
    id: 'blank',
    title: 'Hoja blanca normal',
    description: 'Lienzo blanco liso sin cuadrícula ni ejes de coordenadas',
    icon: Square,
  },
  {
    id: 'chalkboard',
    title: 'Pizarra de tiza verde',
    description: 'Pizarra clásica escolar con textura de tiza realista',
    icon: Sparkles,
  },
  {
    id: 'grid',
    title: 'Cuadrícula clásica',
    description: 'Cuadrícula limpia y técnica sin ejes cartesianos',
    icon: Grid,
  },
  {
    id: 'dots',
    title: 'Puntos discretos',
    description: 'Patrón sutil de puntos para diagramas y notas',
    icon: CircleDot,
  },
  {
    id: 'ruled',
    title: 'Líneas de cuaderno',
    description: 'Rayado horizontal con línea de margen lateral',
    icon: AlignJustify,
  },
];

export default function TopBar({
  boardName = 'Pizarra de Física y MRU',
  setBoardName,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onExportPNG,
  onExportJSON,
  onOpenShare,
  onOpenSaveModal,
  onClearBoard,
  boardTemplate = 'cartesian',
  setBoardTemplate,
  activeNav = 'board',
  onSelectNav,
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(boardName);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const inputRef = useRef(null);
  const exportMenuRef = useRef(null);
  const templateMenuRef = useRef(null);

  useEffect(() => {
    setTempName(boardName);
  }, [boardName]);

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setIsExportMenuOpen(false);
      }
      if (templateMenuRef.current && !templateMenuRef.current.contains(e.target)) {
        setIsTemplateMenuOpen(false);
      }
      if (showClearConfirm && !e.target.closest('.clear-board-group')) {
        setShowClearConfirm(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [showClearConfirm]);

  const handleFinishRename = () => {
    setIsEditingName(false);
    const trimmed = tempName.trim();
    if (trimmed && trimmed !== boardName && setBoardName) {
      setBoardName(trimmed);
    } else {
      setTempName(boardName);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleFinishRename();
    } else if (e.key === 'Escape') {
      setTempName(boardName);
      setIsEditingName(false);
    }
  };

  return (
    <header className="phy-studio-header">
      {/* 1. LEFT: Brand & Board Name & Navigation Sections */}
      <div className="studio-header-left">

        {/* Board Title */}
        <div className="studio-title-box">
          {isEditingName ? (
            <input
              ref={inputRef}
              type="text"
              className="studio-title-input"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleFinishRename}
              onKeyDown={handleKeyDown}
              maxLength={60}
            />
          ) : (
            <button
              className="studio-title-btn"
              onClick={() => setIsEditingName(true)}
              title="Haz clic para renombrar la sesión"
            >
              <span className="studio-title-text">{boardName}</span>
              <Edit2 size={12} className="studio-title-pencil" />
            </button>
          )}
        </div>

        <div className="studio-v-divider" />

        {/* Navigation Switcher: Pizarra vs Simulación */}
        <div className="studio-nav-segmented">
          <button
            type="button"
            className={`studio-nav-tab ${activeNav === 'board' ? 'active' : ''}`}
            onClick={() => onSelectNav?.('board')}
            title="Pizarra interactiva de física, notas y dibujos"
          >
            <Compass size={13} className="nav-tab-icon" />
            <span>Pizarra</span>
          </button>
          <button
            type="button"
            className={`studio-nav-tab ${activeNav === 'simulation' ? 'active' : ''}`}
            onClick={() => onSelectNav?.('simulation')}
            title="Módulo de Simulación interactiva de física"
          >
            <Play size={12} className="nav-tab-icon play" />
            <span>Simulación</span>
          </button>
        </div>
      </div>

      {/* 2. CENTER: History & Specialized Laboratory Modules */}
      <div className="studio-header-center">
        {/* Undo / Redo */}
        <div className="studio-btn-group">
          <button
            className="studio-icon-btn"
            onClick={onUndo}
            disabled={!canUndo}
            title="Deshacer (Ctrl + Z)"
          >
            <Undo2 size={15} />
          </button>
          <button
            className="studio-icon-btn"
            onClick={onRedo}
            disabled={!canRedo}
            title="Rehacer (Ctrl + Y)"
          >
            <Redo2 size={15} />
          </button>
        </div>

        <div className="studio-v-divider small" />

        {/* Plantillas de la pizarra Selector */}
        <div className="board-template-dropdown-wrapper" ref={templateMenuRef}>
          <button
            className={`board-template-btn ${isTemplateMenuOpen ? 'active' : ''}`}
            onClick={() => setIsTemplateMenuOpen((prev) => !prev)}
            title="Plantillas de la pizarra: cambiar cuadrícula o estilo del lienzo"
          >
            <LayoutTemplate size={14} className="template-btn-icon" />
            <span className="template-btn-label">Plantillas de la pizarra</span>
            <ChevronDown size={12} className={`template-chevron ${isTemplateMenuOpen ? 'open' : ''}`} />
          </button>

          {isTemplateMenuOpen && (
            <div className="board-template-popover">
              <div className="template-popover-header">
                <span>Plantillas de la pizarra</span>
              </div>
              <div className="template-options-list">
                {BOARD_TEMPLATES.map((tmpl) => {
                  const isSelected = boardTemplate === tmpl.id;
                  const Icon = tmpl.icon;
                  return (
                    <button
                      key={tmpl.id}
                      className={`template-option-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setBoardTemplate?.(tmpl.id);
                        setIsTemplateMenuOpen(false);
                      }}
                    >
                      <div className="template-item-preview">
                        <Icon size={15} />
                      </div>
                      <div className="template-item-info">
                        <span className="template-item-title">{tmpl.title}</span>
                        <span className="template-item-desc">{tmpl.description}</span>
                      </div>
                      {isSelected && <Check size={14} className="template-check-icon" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Clear Board Button */}
        {onClearBoard && (
          <div className="clear-board-group">
            {showClearConfirm ? (
              <div className="clear-confirm-popover">
                <span className="clear-confirm-text">¿Limpiar el lienzo entero?</span>
                <button
                  className="clear-confirm-yes"
                  onClick={() => {
                    onClearBoard();
                    setShowClearConfirm(false);
                  }}
                >
                  Sí, limpiar
                </button>
                <button
                  className="clear-confirm-no"
                  onClick={() => setShowClearConfirm(false)}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                className="studio-icon-btn danger"
                onClick={() => setShowClearConfirm(true)}
                title="Limpiar pizarra por completo"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. RIGHT: Session, Export & Actions */}
      <div className="studio-header-right">


        {/* Save Button */}
        <button className="studio-action-btn secondary" onClick={onOpenSaveModal} title="Guardar pizarra">
          <Save size={13} />
          <span>Guardar</span>
        </button>
      </div>

      <style>{`
        .phy-studio-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 50px;
          z-index: 55;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 14px;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          user-select: none;
        }

        .studio-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 260px;
        }

        .studio-brand-box {
          display: flex;
          align-items: center;
          gap: 9px;
          cursor: pointer;
        }

        .studio-brand-symbol {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: #0f172a;
          color: #38bdf8;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #1e293b;
        }

        .studio-brand-text {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
        }

        .studio-brand-title {
          font-size: 0.8rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: 0.06em;
        }

        .studio-brand-sub {
          font-size: 0.64rem;
          font-weight: 600;
          color: #0284c7;
        }

        .studio-v-divider {
          width: 1px;
          height: 22px;
          background-color: #e2e8f0;
        }

        .studio-v-divider.small {
          height: 16px;
          margin: 0 2px;
        }

        .studio-title-box {
          display: flex;
          align-items: center;
        }

        .studio-title-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 5px;
          background: transparent;
          border: 1px solid transparent;
          color: #1e293b;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.12s ease;
          max-width: 220px;
        }

        .studio-title-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .studio-title-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .studio-title-pencil {
          color: #94a3b8;
          flex-shrink: 0;
        }

        .studio-title-btn:hover .studio-title-pencil {
          color: #0284c7;
        }

        .studio-title-input {
          font-size: 0.82rem;
          font-weight: 600;
          color: #0f172a;
          border: 1px solid #0284c7;
          border-radius: 5px;
          padding: 3px 8px;
          outline: none;
          background: #ffffff;
          box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.15);
          width: 200px;
        }

        .studio-nav-segmented {
          display: flex;
          align-items: center;
          background: #f1f5f9;
          padding: 3px;
          border-radius: 8px;
          gap: 2px;
          border: 1px solid #e2e8f0;
        }

        .studio-nav-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 11px;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
        }

        .studio-nav-tab:hover {
          color: #0f172a;
          background: rgba(255, 255, 255, 0.7);
        }

        .studio-nav-tab.active {
          background: #ffffff;
          color: #0284c7;
          box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08);
          font-weight: 700;
        }

        .nav-tab-icon {
          flex-shrink: 0;
        }

        .nav-tab-icon.play {
          fill: currentColor;
        }

        .studio-header-center {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .studio-btn-group {
          display: flex;
          align-items: center;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 2px;
          gap: 2px;
        }

        .studio-icon-btn {
          width: 28px;
          height: 28px;
          border-radius: 4px;
          border: none;
          background: transparent;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .studio-icon-btn:hover:not(:disabled) {
          background: #ffffff;
          color: #0f172a;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        .studio-icon-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .studio-icon-btn.danger:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        .studio-module-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #334155;
          font-size: 0.76rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .studio-module-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }

        .studio-module-btn.accent-solver {
          color: #0369a1;
          border-color: #bae6fd;
          background: #f0f9ff;
        }

        .studio-module-btn.accent-solver:hover {
          background: #e0f2fe;
          border-color: #7dd3fc;
        }

        .studio-module-btn.accent-sandbox {
          color: #4338ca;
          border-color: #c7d2fe;
          background: #eef2ff;
        }

        .studio-module-btn.accent-sandbox:hover {
          background: #e0e7ff;
          border-color: #a5b4fc;
        }

        /* Board Template Selector */
        .board-template-dropdown-wrapper {
          position: relative;
        }

        .board-template-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #334155;
          font-size: 0.76rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.12s ease;
          user-select: none;
        }

        .board-template-btn:hover,
        .board-template-btn.active {
          background: #f8fafc;
          border-color: #0284c7;
          color: #0284c7;
        }

        .template-btn-icon {
          color: #0284c7;
          flex-shrink: 0;
        }

        .template-btn-label {
          white-space: nowrap;
        }

        .template-chevron {
          transition: transform 0.15s ease;
          color: #64748b;
        }

        .template-chevron.open {
          transform: rotate(180deg);
        }

        .board-template-popover {
          position: absolute;
          top: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.14);
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          z-index: 75;
          min-width: 270px;
          animation: contextFadeIn 0.15s ease-out;
        }

        .template-popover-header {
          padding: 4px 8px 6px 8px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 3px;
        }

        .template-options-list {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .template-option-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 10px;
          border-radius: 6px;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          text-align: left;
          transition: all 0.12s ease;
          width: 100%;
        }

        .template-option-item:hover {
          background: #f8fafc;
          border-color: #e2e8f0;
        }

        .template-option-item.selected {
          background: #f0f9ff;
          border-color: #bae6fd;
        }

        .template-item-preview {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #475569;
          flex-shrink: 0;
        }

        .template-option-item.selected .template-item-preview {
          background: #0284c7;
          color: #ffffff;
        }

        .template-item-info {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }

        .template-item-title {
          font-size: 0.78rem;
          font-weight: 600;
          color: #0f172a;
          line-height: 1.25;
        }

        .template-item-desc {
          font-size: 0.68rem;
          color: #64748b;
          line-height: 1.2;
          white-space: normal;
        }

        .template-check-icon {
          color: #0284c7;
          flex-shrink: 0;
        }

        .clear-board-group {
          position: relative;
        }

        .clear-confirm-popover {
          position: absolute;
          top: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 70;
          white-space: nowrap;
        }

        .clear-confirm-text {
          font-size: 0.74rem;
          font-weight: 600;
          color: #0f172a;
        }

        .clear-confirm-yes {
          padding: 4px 10px;
          border-radius: 4px;
          border: none;
          background: #dc2626;
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
        }

        .clear-confirm-no {
          padding: 4px 10px;
          border-radius: 4px;
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          color: #475569;
          font-size: 0.72rem;
          cursor: pointer;
        }

        .studio-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .studio-session-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 5px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          font-size: 0.7rem;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
        }

        .studio-session-tag:hover {
          color: #0f172a;
          border-color: #cbd5e1;
        }

        .studio-dropdown-wrapper {
          position: relative;
        }

        .chevron-indicator {
          transition: transform 0.14s ease;
        }

        .chevron-indicator.open {
          transform: rotate(180deg);
        }

        .studio-dropdown-menu {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.12);
          padding: 6px;
          width: 230px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          z-index: 60;
        }

        .studio-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: #1e293b;
          text-align: left;
          cursor: pointer;
          transition: background 0.12s;
        }

        .studio-dropdown-item:hover {
          background: #f1f5f9;
        }

        .dropdown-item-meta {
          display: flex;
          flex-direction: column;
        }

        .dropdown-item-title {
          font-size: 0.76rem;
          font-weight: 600;
          color: #0f172a;
        }

        .dropdown-item-sub {
          font-size: 0.65rem;
          color: #64748b;
        }

        /* 🎓 Topics & Solvers Menu Bar Styles */
        .topics-menu-wrapper {
          position: relative;
        }

        .topics-menu-btn {
          background: #f0fdf4;
          border-color: #bbf7d0;
          color: #166534;
          font-weight: 700;
          gap: 7px;
        }

        .topics-menu-btn:hover,
        .topics-menu-btn.active {
          background: #dcfce7;
          border-color: #86efac;
          color: #14532d;
        }

        .topics-menu-icon {
          color: #16a34a;
        }

        .topics-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 50%;
          right: auto;
          transform: translateX(-50%);
          width: 360px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.16), 0 2px 8px rgba(15, 23, 42, 0.08);
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 3px;
          z-index: 80;
          max-height: 85vh;
          overflow-y: auto;
        }

        .topics-dropdown-header {
          font-size: 0.62rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #94a3b8;
          padding: 8px 10px 4px 10px;
          text-transform: uppercase;
        }

        .topic-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid transparent;
          background: transparent;
          text-align: left;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .topic-item:hover {
          background: #f8fafc;
          border-color: #e2e8f0;
        }

        .topic-icon-badge {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .topic-icon-badge.badge-mru {
          background: #eff6ff;
          color: #2563eb;
          border: 1px solid #bfdbfe;
        }

        .topic-icon-badge.badge-mruv {
          background: #fffbeb;
          color: #d97706;
          border: 1px solid #fde68a;
        }

        .topic-icon-badge.badge-freefall {
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #bbf7d0;
        }

        .topic-icon-badge.badge-tiro {
          background: #fdf2f8;
          color: #db2777;
          border: 1px solid #fbcfe8;
        }

        .topic-icon-badge.badge-horizontal {
          background: #ecfeff;
          color: #0891b2;
          border: 1px solid #a5f3fc;
        }

        .topic-icon-badge.badge-proyectiles {
          background: #f5f3ff;
          color: #7c3aed;
          border: 1px solid #ddd6fe;
        }

        .topic-icon-badge.badge-mcu {
          background: #e0f2fe;
          color: #0284c7;
          border: 1px solid #bae6fd;
        }

        .topic-icon-badge.badge-mcuv {
          background: #fef3c7;
          color: #d97706;
          border: 1px solid #fde68a;
        }

        .topic-icon-badge.badge-poleas {
          background: #ecfdf5;
          color: #059669;
          border: 1px solid #a7f3d0;
        }

        .topic-icon-badge.badge-dcl {
          background: #fff7ed;
          color: #ea580c;
          border: 1px solid #fed7aa;
        }

        .topic-icon-badge.badge-sandbox {
          background: #eef2ff;
          color: #4f46e5;
          border: 1px solid #c7d2fe;
        }

        .topic-icon-badge.badge-templates {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #cbd5e1;
        }

        .topic-item-header {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .topic-tag {
          font-size: 0.6rem;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 4px;
        }

        .tag-mru { background: #dbeafe; color: #1e40af; }
        .tag-mruv { background: #fef3c7; color: #92400e; }
        .tag-freefall { background: #dcfce7; color: #166534; }
        .tag-tiro { background: #fce7f3; color: #9d174d; }
        .tag-horizontal { background: #cffafe; color: #155e75; }
        .tag-proyectiles { background: #ede9fe; color: #6d28d9; }
        .tag-mcu { background: #e0f2fe; color: #0369a1; }
        .tag-mcuv { background: #fef3c7; color: #b45309; }
        .tag-poleas { background: #ecfdf5; color: #047857; }
        .tag-dcl { background: #ffedd5; color: #9a3412; }
        .tag-sandbox { background: #e0e7ff; color: #3730a3; }
        .tag-templates { background: #e2e8f0; color: #334155; }

        .studio-user-badge {
          position: relative;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: #0f172a;
          color: #38bdf8;
          font-size: 0.65rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #1e293b;
        }

        .user-online-dot {
          position: absolute;
          bottom: -1px;
          right: -1px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          border: 1.5px solid #ffffff;
        }

        .studio-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.76rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .studio-action-btn.primary {
          background: #0284c7;
          border: 1px solid #0284c7;
          color: #ffffff;
        }

        .studio-action-btn.primary:hover {
          background: #0369a1;
          border-color: #0369a1;
        }

        .studio-action-btn.secondary {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #1e293b;
        }

        .studio-action-btn.secondary:hover {
          background: #f8fafc;
          border-color: #94a3b8;
        }
      `}</style>
    </header>
  );
}
