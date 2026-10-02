import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  Share2, 
  Clock, 
  Save,
  BookOpen, 
  Trash2, 
  Undo2, 
  Redo2, 
  Edit2, 
  FileText, 
  Image as ImageIcon,
  ChevronDown,
  Sparkles,
  Calculator,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  Navigation,
  GraduationCap,
  Target
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
  onOpenMruvSolver,
  onOpenFreefallSolver,
  onOpenTiroVerticalSolver,
  onOpenHorizontalLaunchSolver,
  onOpenProjectileMotionSolver,
  onOpenPhysicsSandbox,
  onClearBoard,
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(boardName);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isTopicsMenuOpen, setIsTopicsMenuOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const inputRef = useRef(null);
  const exportMenuRef = useRef(null);
  const topicsMenuRef = useRef(null);

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
      if (topicsMenuRef.current && !topicsMenuRef.current.contains(e.target)) {
        setIsTopicsMenuOpen(false);
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
      {/* 1. LEFT: Brand & Board Name */}
      <div className="studio-header-left">
        {/* Brand Logo */}
        <div className="studio-brand-box" title="Physics Studio — Laboratorio Digital de Física y Matemáticas">
          <div className="studio-brand-symbol">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" fill="currentColor" />
              <path d="M12 2a10 5 0 0 1 10 5c0 2.76-4.48 5-10 5S2 9.76 2 7a10 5 0 0 1 10-5z" />
              <path d="M2.5 14.5c2.4 1.4 5.9 2.5 9.5 2.5s7.1-1.1 9.5-2.5" />
              <path d="M6 19c1.7.6 3.8 1 6 1s4.3-.4 6-1" />
            </svg>
          </div>
          <div className="studio-brand-text">
            <span className="studio-brand-title">PHYSICS LAB</span>
            <span className="studio-brand-sub">Estudio de Cinemática</span>
          </div>
        </div>

        <div className="studio-v-divider" />

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

        {/* 📚 Unified Topics & Solvers Menu Bar Dropdown */}
        <div className="studio-dropdown-wrapper topics-menu-wrapper" ref={topicsMenuRef}>
          <button
            className={`studio-module-btn topics-menu-btn ${isTopicsMenuOpen ? 'active' : ''}`}
            onClick={() => setIsTopicsMenuOpen((prev) => !prev)}
            title="Seleccionar módulo curricular o solucionador de física"
          >
            <GraduationCap size={15} className="topics-menu-icon" />
            <span className="topics-menu-label">Temas y Solucionadores</span>
            <ChevronDown size={12} className={`chevron-indicator ${isTopicsMenuOpen ? 'open' : ''}`} />
          </button>

          {isTopicsMenuOpen && (
            <div className="studio-dropdown-menu topics-dropdown-menu">
              {/* Category: 1D Kinematics */}
              <div className="topics-dropdown-header">CINEMÁTICA EN 1D</div>

              {onOpenMruSolver && (
                <button
                  className="studio-dropdown-item topic-item"
                  onClick={() => {
                    setIsTopicsMenuOpen(false);
                    onOpenMruSolver();
                  }}
                >
                  <div className="topic-icon-badge badge-mru">
                    <Calculator size={14} />
                  </div>
                  <div className="dropdown-item-meta">
                    <div className="topic-item-header">
                      <span className="dropdown-item-title">MRU: Movimiento Uniforme</span>
                      <span className="topic-tag tag-mru">HT01</span>
                    </div>
                    <span className="dropdown-item-sub">Velocidad constante (v = cte) • 10 ejercicios y calculadora</span>
                  </div>
                </button>
              )}

              {onOpenMruvSolver && (
                <button
                  className="studio-dropdown-item topic-item"
                  onClick={() => {
                    setIsTopicsMenuOpen(false);
                    onOpenMruvSolver();
                  }}
                >
                  <div className="topic-icon-badge badge-mruv">
                    <TrendingUp size={14} />
                  </div>
                  <div className="dropdown-item-meta">
                    <div className="topic-item-header">
                      <span className="dropdown-item-title">MRUV: Movimiento Variado</span>
                      <span className="topic-tag tag-mruv">HT02</span>
                    </div>
                    <span className="dropdown-item-sub">Aceleración constante, 4 fórmulas • 10 ejercicios</span>
                  </div>
                </button>
              )}

              {/* Category: Vertical Kinematics & 2D */}
              <div className="topics-dropdown-header">CINEMÁTICA VERTICAL Y 2D</div>

              {onOpenFreefallSolver && (
                <button
                  className="studio-dropdown-item topic-item"
                  onClick={() => {
                    setIsTopicsMenuOpen(false);
                    onOpenFreefallSolver();
                  }}
                >
                  <div className="topic-icon-badge badge-freefall">
                    <ArrowDownCircle size={14} />
                  </div>
                  <div className="dropdown-item-meta">
                    <div className="topic-item-header">
                      <span className="dropdown-item-title">Caída Libre</span>
                      <span className="topic-tag tag-freefall">HT03</span>
                    </div>
                    <span className="dropdown-item-sub">Gravedad g = 9.80 m/s², caída desde reposo • 10 ejercicios</span>
                  </div>
                </button>
              )}

              {onOpenTiroVerticalSolver && (
                <button
                  className="studio-dropdown-item topic-item"
                  onClick={() => {
                    setIsTopicsMenuOpen(false);
                    onOpenTiroVerticalSolver();
                  }}
                >
                  <div className="topic-icon-badge badge-tiro">
                    <ArrowUpCircle size={14} />
                  </div>
                  <div className="dropdown-item-meta">
                    <div className="topic-item-header">
                      <span className="dropdown-item-title">Tiro Vertical</span>
                      <span className="topic-tag tag-tiro">HT04</span>
                    </div>
                    <span className="dropdown-item-sub">Lanzamiento hacia arriba, altura máxima • 10 ejercicios</span>
                  </div>
                </button>
              )}

              {onOpenHorizontalLaunchSolver && (
                <button
                  className="studio-dropdown-item topic-item"
                  onClick={() => {
                    setIsTopicsMenuOpen(false);
                    onOpenHorizontalLaunchSolver();
                  }}
                >
                  <div className="topic-icon-badge badge-horizontal">
                    <Navigation size={14} />
                  </div>
                  <div className="dropdown-item-meta">
                    <div className="topic-item-header">
                      <span className="dropdown-item-title">Lanzamiento Horizontal</span>
                      <span className="topic-tag tag-horizontal">HT01 2D</span>
                    </div>
                    <span className="dropdown-item-sub">Movimiento parabólico 2D: MRU + Caída Libre • 10 problemas</span>
                  </div>
                </button>
              )}

              {onOpenProjectileMotionSolver && (
                <button
                  className="studio-dropdown-item topic-item"
                  onClick={() => {
                    setIsTopicsMenuOpen(false);
                    onOpenProjectileMotionSolver();
                  }}
                >
                  <div className="topic-icon-badge badge-proyectiles">
                    <Target size={14} />
                  </div>
                  <div className="dropdown-item-meta">
                    <div className="topic-item-header">
                      <span className="dropdown-item-title">Movimiento de Proyectiles</span>
                      <span className="topic-tag tag-proyectiles">HT02 2D</span>
                    </div>
                    <span className="dropdown-item-sub">Tiro parabólico oblicuo con ángulo θ • 10 problemas y 7 conceptuales</span>
                  </div>
                </button>
              )}

              {/* Category: Tools & Syllabus */}
              <div className="topics-dropdown-header">SIMULACIÓN & TEMARIO</div>

              {onOpenPhysicsSandbox && (
                <button
                  className="studio-dropdown-item topic-item"
                  onClick={() => {
                    setIsTopicsMenuOpen(false);
                    onOpenPhysicsSandbox();
                  }}
                >
                  <div className="topic-icon-badge badge-sandbox">
                    <Sparkles size={14} />
                  </div>
                  <div className="dropdown-item-meta">
                    <div className="topic-item-header">
                      <span className="dropdown-item-title">Sandbox Dinámico</span>
                      <span className="topic-tag tag-sandbox">Matter.js</span>
                    </div>
                    <span className="dropdown-item-sub">Laboratorio de cuerpos rígidos, masas y máquina de Atwood</span>
                  </div>
                </button>
              )}

              {onOpenTemplates && (
                <button
                  className="studio-dropdown-item topic-item"
                  onClick={() => {
                    setIsTopicsMenuOpen(false);
                    onOpenTemplates();
                  }}
                >
                  <div className="topic-icon-badge badge-templates">
                    <BookOpen size={14} />
                  </div>
                  <div className="dropdown-item-meta">
                    <div className="topic-item-header">
                      <span className="dropdown-item-title">Plantillas Curriculares</span>
                      <span className="topic-tag tag-templates">Kinal</span>
                    </div>
                    <span className="dropdown-item-sub">Plan escolar previsto, guías teóricas y pizarras de examen</span>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick Access: Templates */}
        {onOpenTemplates && (
          <button
            className="studio-module-btn"
            onClick={onOpenTemplates}
            title="Abrir temario curricular de física y plantillas"
          >
            <BookOpen size={14} />
            <span>Plantillas</span>
          </button>
        )}

        {/* Quick Access: Physics Sandbox */}
        {onOpenPhysicsSandbox && (
          <button
            className="studio-module-btn accent-sandbox"
            onClick={onOpenPhysicsSandbox}
            title="Laboratorio de simulación dinámica (Matter.js)"
          >
            <Sparkles size={14} />
            <span>Sandbox</span>
          </button>
        )}

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
        {/* Session Status */}
        <div className="studio-session-tag" onClick={onOpenSaveModal} title="Sesión local activa (24h)">
          <Clock size={12} />
          <span>24h Activa</span>
        </div>

        {/* Export Dropdown */}
        <div className="studio-dropdown-wrapper" ref={exportMenuRef}>
          <button
            className="studio-module-btn"
            onClick={() => setIsExportMenuOpen((prev) => !prev)}
            title="Exportar laboratorio"
          >
            <Download size={14} />
            <span>Exportar</span>
            <ChevronDown size={12} className={`chevron-indicator ${isExportMenuOpen ? 'open' : ''}`} />
          </button>

          {isExportMenuOpen && (
            <div className="studio-dropdown-menu">
              <button
                className="studio-dropdown-item"
                onClick={() => {
                  setIsExportMenuOpen(false);
                  if (onExportPNG) onExportPNG();
                }}
              >
                <ImageIcon size={14} />
                <div className="dropdown-item-meta">
                  <span className="dropdown-item-title">Imagen PNG (HD)</span>
                  <span className="dropdown-item-sub">Captura completa en alta resolución</span>
                </div>
              </button>
              <button
                className="studio-dropdown-item"
                onClick={() => {
                  setIsExportMenuOpen(false);
                  if (onExportJSON) onExportJSON();
                }}
              >
                <FileText size={14} />
                <div className="dropdown-item-meta">
                  <span className="dropdown-item-title">Archivo de Datos JSON</span>
                  <span className="dropdown-item-sub">Guarda objetos, fórmulas y estado</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="studio-user-badge" title="Sesión de laboratorio activa">
          <span className="user-initials">LAB</span>
          <span className="user-online-dot" />
        </div>

        {/* Share Button */}
        <button className="studio-action-btn primary" onClick={onOpenShare} title="Compartir enlace del laboratorio">
          <Share2 size={13} strokeWidth={2.4} />
          <span>Compartir</span>
        </button>

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
