import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  Share2, 
  Clock, 
  Save,
  Check, 
  BookOpen, 
  Trash2, 
  Undo2, 
  Redo2, 
  Edit2, 
  FileText, 
  Image as ImageIcon,
  ChevronDown,
  Atom,
  Sparkles,
  Calculator
} from 'lucide-react';

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
  onOpenTemplates,
  onOpenMruSolver,
  onOpenPhysicsSandbox,
  onClearBoard,
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(boardName);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const inputRef = useRef(null);
  const exportMenuRef = useRef(null);

  useEffect(() => {
    setTempName(boardName);
  }, [boardName]);

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  // Click outside to close export menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setIsExportMenuOpen(false);
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
    <header className="phy-topbar">
      {/* 1. LEFT CLUSTER: Brand & Board Name */}
      <div className="topbar-cluster left-cluster">
        {/* Brand Logo & Badge */}
        <div className="phy-brand-container" title="Physics Whiteboard — Pizarra de Física & Matemáticas">
          <div className="phy-brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="2.5" fill="currentColor" />
              <path d="M12 2a10 5 0 0 1 10 5c0 2.76-4.48 5-10 5S2 9.76 2 7a10 5 0 0 1 10-5z" />
              <path d="M2.5 14.5c2.4 1.4 5.9 2.5 9.5 2.5s7.1-1.1 9.5-2.5" />
              <path d="M6 19c1.7.6 3.8 1 6 1s4.3-.4 6-1" />
            </svg>
          </div>
          <div className="phy-brand-meta">
            <span className="phy-brand-title">PhyBoard</span>
            <span className="phy-brand-tag">Física & MRU</span>
          </div>
        </div>

        <div className="topbar-divider"></div>

        {/* Editable Board Title */}
        <div className="phy-board-title-box">
          {isEditingName ? (
            <input
              ref={inputRef}
              type="text"
              className="phy-title-input"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleFinishRename}
              onKeyDown={handleKeyDown}
              maxLength={60}
            />
          ) : (
            <button
              className="phy-title-btn"
              onClick={() => setIsEditingName(true)}
              title="Haz clic para renombrar la pizarra"
            >
              <span className="phy-title-text">{boardName}</span>
              <Edit2 size={13} className="phy-title-pencil" />
            </button>
          )}
        </div>
      </div>

      {/* 2. CENTER CLUSTER: History & Canvas Quick Tools */}
      <div className="topbar-cluster center-cluster">
        {/* Undo / Redo */}
        <div className="history-btn-group">
          <button
            className="topbar-icon-btn"
            onClick={onUndo}
            disabled={!canUndo}
            title="Deshacer (Ctrl + Z)"
          >
            <Undo2 size={16} />
          </button>
          <button
            className="topbar-icon-btn"
            onClick={onRedo}
            disabled={!canRedo}
            title="Rehacer (Ctrl + Y)"
          >
            <Redo2 size={16} />
          </button>
        </div>

        {/* Templates Button */}
        {onOpenTemplates && (
          <button
            className="topbar-pill-btn templates-accent-btn"
            onClick={onOpenTemplates}
            title="Abrir temario escolar de MRU y plantillas de física"
          >
            <BookOpen size={15} />
            <span>Plantillas MRU</span>
          </button>
        )}

        {/* MRU Solver Button */}
        {onOpenMruSolver && (
          <button
            className="topbar-pill-btn mru-solver-btn"
            onClick={onOpenMruSolver}
            title="Resolver ejercicios de MRU paso a paso (Tiempo de viaje, alcance, conversiones)"
          >
            <Calculator size={15} />
            <span>Resolver Ejercicios MRU</span>
          </button>
        )}

        {/* Physics Sandbox Button */}
        {onOpenPhysicsSandbox && (
          <button
            className="topbar-pill-btn sandbox-accent-btn"
            onClick={onOpenPhysicsSandbox}
            title="Abrir Sandbox Físico con Matter.js (Máquina de Atwood)"
          >
            <Sparkles size={15} />
            <span>Sandbox Físico</span>
          </button>
        )}

        {/* Clear Board Button with confirmation safeguard */}
        {onClearBoard && (
          <div className="clear-board-group">
            {showClearConfirm ? (
              <div className="clear-confirm-popover">
                <span className="clear-confirm-text">¿Borrar todo el lienzo?</span>
                <button
                  className="clear-confirm-yes"
                  onClick={() => {
                    onClearBoard();
                    setShowClearConfirm(false);
                  }}
                >
                  Sí, borrar
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
                className="topbar-icon-btn danger-hover"
                onClick={() => setShowClearConfirm(true)}
                title="Limpiar pizarra entera"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. RIGHT CLUSTER: Export, Sharing & User */}
      <div className="topbar-cluster right-cluster">
        {/* 24-hr Expiration Badge */}
        <div
          className="session-timer-pill"
          onClick={onOpenSaveModal}
          title="Sesión temporal (24 horas). Haz clic para guardar permanentemente."
        >
          <Clock size={13} className="clock-icon" />
          <span className="session-timer-text">24h activa</span>
        </div>

        {/* Export Dropdown Menu */}
        <div className="export-dropdown-wrapper" ref={exportMenuRef}>
          <button
            className="topbar-pill-btn export-toggle-btn"
            onClick={() => setIsExportMenuOpen((prev) => !prev)}
            title="Exportar pizarra"
          >
            <Download size={14} />
            <span>Exportar</span>
            <ChevronDown size={13} className={`chevron-indicator ${isExportMenuOpen ? 'open' : ''}`} />
          </button>

          {isExportMenuOpen && (
            <div className="export-menu-dropdown">
              <button
                className="export-menu-item"
                onClick={() => {
                  setIsExportMenuOpen(false);
                  if (onExportPNG) onExportPNG();
                }}
              >
                <ImageIcon size={15} className="export-item-icon" />
                <div className="export-item-meta">
                  <span className="export-item-name">Imagen PNG (HD)</span>
                  <span className="export-item-sub">Ideal para tareas y reportes</span>
                </div>
              </button>
              <button
                className="export-menu-item"
                onClick={() => {
                  setIsExportMenuOpen(false);
                  if (onExportJSON) onExportJSON();
                }}
              >
                <FileText size={15} className="export-item-icon" />
                <div className="export-item-meta">
                  <span className="export-item-name">Archivo JSON de Respaldo</span>
                  <span className="export-item-sub">Para importar luego</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Online Collaborator Avatar */}
        <div className="topbar-avatar-pill" title="Estás en línea como profesor/estudiante">
          <div className="user-avatar-circle">TÚ</div>
          <span className="online-status-dot"></span>
        </div>

        {/* Share Button */}
        <button className="btn-topbar-primary" onClick={onOpenShare} title="Compartir enlace de la pizarra">
          <Share2 size={14} strokeWidth={2.4} />
          <span>Compartir</span>
        </button>

        {/* Save to Miro / Cloud */}
        <button className="btn-topbar-secondary" onClick={onOpenSaveModal} title="Guardar pizarra">
          <Save size={14} />
          <span>Guardar</span>
        </button>
      </div>

      <style>{`
        .phy-topbar {
          position: fixed;
          top: 12px;
          left: 14px;
          right: 14px;
          height: 48px;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          pointer-events: none;
          gap: 12px;
        }

        .topbar-cluster {
          pointer-events: auto;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(225, 230, 240, 0.85);
          box-shadow: 0 4px 18px -2px rgba(15, 23, 42, 0.08);
          border-radius: 12px;
          height: 44px;
          padding: 0 10px;
          transition: all 0.2s ease;
        }

        .topbar-cluster:hover {
          box-shadow: 0 6px 24px -2px rgba(15, 23, 42, 0.12);
        }

        .left-cluster {
          gap: 10px;
          padding-left: 8px;
        }

        .center-cluster {
          gap: 6px;
        }

        .right-cluster {
          gap: 8px;
        }

        /* Brand Styling */
        .phy-brand-container {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
          padding: 2px 4px;
        }

        .phy-brand-icon {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: linear-gradient(135deg, #4262ff 0%, #7042ff 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(66, 98, 255, 0.35);
        }

        .phy-brand-meta {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
        }

        .phy-brand-title {
          font-family: var(--font-display, sans-serif);
          font-size: 0.92rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .phy-brand-tag {
          font-size: 0.65rem;
          font-weight: 700;
          color: #4262ff;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .topbar-divider {
          width: 1px;
          height: 20px;
          background-color: #e2e8f0;
          margin: 0 2px;
        }

        /* Board Title */
        .phy-board-title-box {
          display: flex;
          align-items: center;
        }

        .phy-title-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 6px;
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          color: #1e293b;
          font-family: var(--font-sans);
          font-size: 0.84rem;
          font-weight: 600;
          transition: all 0.15s ease;
          max-width: 240px;
        }

        .phy-title-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .phy-title-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .phy-title-pencil {
          color: #94a3b8;
          flex-shrink: 0;
          transition: color 0.15s;
        }

        .phy-title-btn:hover .phy-title-pencil {
          color: #4262ff;
        }

        .phy-title-input {
          font-family: var(--font-sans);
          font-size: 0.84rem;
          font-weight: 600;
          color: #0f172a;
          background: #ffffff;
          border: 1.5px solid #4262ff;
          border-radius: 6px;
          padding: 3px 8px;
          outline: none;
          box-shadow: 0 0 0 3px rgba(66, 98, 255, 0.15);
          width: 200px;
        }

        /* Center Tools */
        .history-btn-group {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .topbar-icon-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .topbar-icon-btn:hover:not(:disabled) {
          background: #f1f5f9;
          color: #0f172a;
        }

        .topbar-icon-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .topbar-icon-btn.danger-hover:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        .topbar-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0 10px;
          height: 30px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #334155;
          font-family: var(--font-sans);
          font-size: 0.79rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .topbar-pill-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }

        .templates-accent-btn {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #2563eb;
        }

        .templates-accent-btn:hover {
          background: #dbeafe;
          border-color: #93c5fd;
          color: #1d4ed8;
        }

        .mru-solver-btn {
          background: #f0fdf4;
          border-color: #bbf7d0;
          color: #15803d;
        }

        .mru-solver-btn:hover {
          background: #dcfce7;
          border-color: #86efac;
          color: #166534;
        }

        .sandbox-accent-btn {
          background: #f5f3ff;
          border-color: #ddd6fe;
          color: #7c3aed;
        }

        .sandbox-accent-btn:hover {
          background: #ede9fe;
          border-color: #c4b5fd;
          color: #6d28d9;
        }

        /* Clear Confirm Popover */
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
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.15);
          border-radius: 8px;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          z-index: 60;
          animation: contextFadeIn 0.15s ease-out;
        }

        .clear-confirm-text {
          font-size: 0.76rem;
          font-weight: 600;
          color: #334155;
        }

        .clear-confirm-yes {
          padding: 3px 8px;
          background: #ef4444;
          color: #ffffff;
          border: none;
          border-radius: 4px;
          font-size: 0.74rem;
          font-weight: 600;
          cursor: pointer;
        }

        .clear-confirm-no {
          padding: 3px 8px;
          background: #f1f5f9;
          color: #475569;
          border: none;
          border-radius: 4px;
          font-size: 0.74rem;
          font-weight: 500;
          cursor: pointer;
        }

        /* Session Timer Pill */
        .session-timer-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 3px 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .session-timer-pill:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .clock-icon {
          color: #3b82f6;
        }

        .session-timer-text {
          font-size: 0.73rem;
          font-weight: 600;
          color: #475569;
        }

        /* Export Dropdown */
        .export-dropdown-wrapper {
          position: relative;
        }

        .chevron-indicator {
          transition: transform 0.15s ease;
        }

        .chevron-indicator.open {
          transform: rotate(180deg);
        }

        .export-menu-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 220px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 28px -4px rgba(15, 23, 42, 0.14);
          border-radius: 10px;
          padding: 5px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          z-index: 60;
          animation: contextFadeIn 0.14s ease-out;
        }

        .export-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          text-align: left;
          transition: background 0.12s ease;
          width: 100%;
        }

        .export-menu-item:hover {
          background: #f1f5f9;
        }

        .export-item-icon {
          color: #4262ff;
          flex-shrink: 0;
        }

        .export-item-meta {
          display: flex;
          flex-direction: column;
        }

        .export-item-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: #0f172a;
        }

        .export-item-sub {
          font-size: 0.68rem;
          color: #64748b;
        }

        /* Avatar Pill */
        .topbar-avatar-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 2px 7px 2px 4px;
          border-radius: 9999px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
        }

        .user-avatar-circle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #10b981;
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          letter-spacing: -0.02em;
        }

        .online-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
        }

        /* Buttons */
        .btn-topbar-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 32px;
          padding: 0 13px;
          background: linear-gradient(135deg, #4262ff 0%, #3158e0 100%);
          color: #ffffff;
          border: none;
          border-radius: 7px;
          font-family: var(--font-sans);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(66, 98, 255, 0.25);
          transition: all 0.15s ease;
        }

        .btn-topbar-primary:hover {
          background: linear-gradient(135deg, #3353e8 0%, #2546cc 100%);
          box-shadow: 0 4px 10px rgba(66, 98, 255, 0.35);
        }

        .btn-topbar-secondary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 32px;
          padding: 0 12px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 7px;
          color: #1e293b;
          font-family: var(--font-sans);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-topbar-secondary:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        @media (max-width: 860px) {
          .center-cluster {
            display: none;
          }
        }

        @media (max-width: 600px) {
          .session-timer-pill, .phy-brand-tag {
            display: none;
          }
          .phy-title-btn {
            max-width: 140px;
          }
        }
      `}</style>
    </header>
  );
}
