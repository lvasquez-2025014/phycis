import React, { useState } from 'react';
import { 
  RotateCw, 
  Sliders, 
  Eye, 
  EyeOff, 
  RotateCcw,
  Copy,
  Trash2
} from 'lucide-react';
import { getDclBodies } from '../../services/canvasRenderers';

export default function DclVectorOverlayHUD({
  element,
  transform,
  onUpdateVectors,
  onOpenInspector,
  onDuplicate,
  onDelete,
}) {
  const isEligible =
    element &&
    (element.physicsType === 'dcl_diagram' ||
      element.physicsType === 'translational_equilibrium' ||
      element.physicsType === 'mass' ||
      element.physicsType === 'mruv_cart' ||
      element.physicsType === 'mru_cart');
  if (!isEligible) return null;

  const props = element.properties || {};
  const bodies = getDclBodies(element);
  const defaultBody = bodies.length > 1 ? bodies[0].id : (bodies[0]?.id || 'main');
  const [selectedBodyId, setSelectedBodyId] = useState(defaultBody);

  const userVectors = Array.isArray(props.userVectors) ? props.userVectors : [];
  const showOfficialSolution = !!props.showOfficialSolution;
  const hasOfficialSolution =
    element.physicsType === 'dcl_diagram' || element.physicsType === 'translational_equilibrium';

  const massKg = props.mass || (element.physicsType === 'mass' ? 10 : 1.5);

  // Smart Positioning relative to viewport and element
  const screenX = element.x * transform.scale + transform.x;
  const screenY = element.y * transform.scale + transform.y;
  const screenW = element.width * transform.scale;
  const screenH = element.height * transform.scale;

  // If element is close to the top bar (< 115px), place HUD below element; otherwise place above
  const isCloseToTop = screenY < 115;
  const topPos = isCloseToTop ? screenY + screenH + 10 : screenY - 48;

  const currentBodyVectors = userVectors.filter((v) => (v.targetBody || 'main') === selectedBodyId);

  // Live resultant force on current body
  const sumFx = currentBodyVectors.reduce((s, v) => {
    const rad = ((v.angleDeg || 0) * Math.PI) / 180;
    const mag = v.magnitude !== undefined ? v.magnitude : (v.lengthPx || 50);
    return s + mag * Math.cos(rad);
  }, 0);
  const sumFy = currentBodyVectors.reduce((s, v) => {
    const rad = ((v.angleDeg || 0) * Math.PI) / 180;
    const mag = v.magnitude !== undefined ? v.magnitude : (v.lengthPx || 50);
    return s + mag * Math.sin(rad);
  }, 0);
  const netF = Math.hypot(sumFx, sumFy);
  const theoAccel = netF / massKg;
  const isEquilibrium = netF < 0.2;

  // Helper to add a force vector to the active body
  const handleAddVector = (type, symbol, defaultAngle, color, magnitude = 50) => {
    const newId = `vec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newVec = {
      id: newId,
      targetBody: selectedBodyId,
      name: symbol,
      symbol,
      label: symbol,
      type,
      angleDeg: defaultAngle,
      color,
      magnitude,
      lengthPx: Math.max(45, Math.min(110, Math.round(magnitude * 1.1))),
    };
    onUpdateVectors([...userVectors, newVec], false);
  };

  // Step magnitude (+10 N / -10 N)
  const handleStepMagnitude = (vecId, delta) => {
    onUpdateVectors(
      userVectors.map((v) => {
        if (v.id !== vecId) return v;
        const cur = v.magnitude !== undefined ? v.magnitude : 50;
        const next = Math.max(5, cur + delta);
        return {
          ...v,
          magnitude: next,
          lengthPx: Math.max(42, Math.min(125, Math.round(next * 1.1))),
        };
      }),
      false
    );
  };

  // Helper to delete a specific vector
  const handleDeleteVector = (vecId) => {
    onUpdateVectors(userVectors.filter((v) => v.id !== vecId));
  };

  // Clear all vectors
  const handleClearAll = () => {
    onUpdateVectors([], false);
  };

  // Toggle official solution
  const handleToggleOfficial = () => {
    onUpdateVectors(userVectors, !showOfficialSolution);
  };

  return (
    <div
      className="dcl-hud-root"
      style={{
        position: 'absolute',
        left: `${Math.max(20, screenX + screenW / 2)}px`,
        top: `${Math.max(16, topPos)}px`,
        transform: 'translateX(-50%)',
        zIndex: 42,
        pointerEvents: 'auto',
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Main Single-Row Floating Action Bar */}
      <div className="dcl-hud-bar miro-island">
        {/* 1. Body Selector Tabs (Only if multiple bodies) */}
        {bodies.length > 1 && (
          <div className="dcl-body-tabs-group">
            {bodies.map((b) => {
              const count = userVectors.filter((v) => (v.targetBody || 'main') === b.id).length;
              const isActive = selectedBodyId === b.id;
              return (
                <button
                  key={b.id}
                  className={`dcl-body-tab ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedBodyId(b.id)}
                  title={`Seleccionar ${b.label}`}
                >
                  <span className="tab-name">{b.label}</span>
                  {count > 0 && <span className="tab-badge">{count}</span>}
                </button>
              );
            })}
          </div>
        )}

        {bodies.length > 1 && <div className="dcl-hud-sep" />}

        {/* 2. Fast Force Quick Add Buttons */}
        <div className="dcl-forces-group">
          <button
            className="dcl-force-chip red"
            onClick={() => handleAddVector('weight', 'W', 270, '#ef4444', Math.round(massKg * 9.8))}
            title={`Añadir Peso W (↓ Hacia abajo 270°, ${Math.round(massKg * 9.8)} N)`}
          >
            <span className="force-dot red" />
            <span className="force-sym">+W</span>
            <span className="force-desc">Peso</span>
          </button>

          <button
            className="dcl-force-chip blue"
            onClick={() => handleAddVector('normal', 'N', 90, '#3b82f6', Math.round(massKg * 9.8))}
            title={`Añadir Normal N (↑ Perpendicular 90°, ${Math.round(massKg * 9.8)} N)`}
          >
            <span className="force-dot blue" />
            <span className="force-sym">+N</span>
            <span className="force-desc">Normal</span>
          </button>

          <button
            className="dcl-force-chip green"
            onClick={() => {
              const angle = selectedBodyId === 'm1' ? 90 : selectedBodyId === 'm3' ? 90 : 0;
              const sym = selectedBodyId === 'm1' ? 'T₁' : selectedBodyId === 'm3' ? 'T₂' : 'T';
              handleAddVector('tension', sym, angle, '#10b981', 50);
            }}
            title="Añadir Tensión T (Cuerda tensa)"
          >
            <span className="force-dot green" />
            <span className="force-sym">+T</span>
            <span className="force-desc">Tensión</span>
          </button>

          <button
            className="dcl-force-chip amber"
            onClick={() => handleAddVector('friction', 'fk', 180, '#f59e0b', 20)}
            title="Añadir Fricción fk (← Opuesta al movimiento, 20 N)"
          >
            <span className="force-dot amber" />
            <span className="force-sym">+fk</span>
            <span className="force-desc">Fricción</span>
          </button>

          <button
            className="dcl-force-chip purple"
            onClick={() => handleAddVector('applied', 'F', 0, '#8b5cf6', 50)}
            title="Añadir Fuerza Aplicada F (→ Externa, 50 N)"
          >
            <span className="force-dot purple" />
            <span className="force-sym">+F</span>
            <span className="force-desc">Fuerza</span>
          </button>
        </div>

        {/* Live Vector Sum / Equilibrium Status Chip */}
        {currentBodyVectors.length > 0 && (
          <>
            <div className="dcl-hud-sep" />
            <div
              className={`dcl-live-summary-chip ${isEquilibrium ? 'chip-equilibrium' : 'chip-dynamic'}`}
              title={`Componentes: ΣFx = ${sumFx.toFixed(1)} N | ΣFy = ${sumFy.toFixed(1)} N`}
            >
              {isEquilibrium ? (
                <span>✓ 1ª Ley: ΣF = 0 (Equilibrio)</span>
              ) : (
                <span>⚡ 2ª Ley: ΣF = {netF.toFixed(1)} N ⇒ a = {theoAccel.toFixed(2)} m/s²</span>
              )}
            </div>
          </>
        )}

        <div className="dcl-hud-sep" />

        {/* 3. Utility Actions */}
        <div className="dcl-actions-group">
          {hasOfficialSolution && (
            <button
              className={`dcl-tool-btn ${showOfficialSolution ? 'active' : ''}`}
              onClick={handleToggleOfficial}
              title={showOfficialSolution ? 'Ocultar solución oficial' : 'Ver DCL resuelto oficial'}
            >
              {showOfficialSolution ? <EyeOff size={14} /> : <Eye size={14} />}
              <span className="tool-lbl">{showOfficialSolution ? 'Ocultar' : 'Solución'}</span>
            </button>
          )}

          {userVectors.length > 0 && (
            <button
              className="dcl-icon-btn"
              onClick={handleClearAll}
              title="Borrar todos los vectores añadidos"
            >
              <RotateCcw size={14} />
            </button>
          )}

          {onOpenInspector && (
            <button
              className="dcl-icon-btn"
              onClick={onOpenInspector}
              title="Ajustar valores físicos exactos (Inspector)"
            >
              <Sliders size={14} />
            </button>
          )}

          {onDuplicate && (
            <button
              className="dcl-icon-btn"
              onClick={onDuplicate}
              title="Duplicar objeto"
            >
              <Copy size={14} />
            </button>
          )}

          {onDelete && (
            <button
              className="dcl-icon-btn delete"
              onClick={onDelete}
              title="Eliminar de la pizarra"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Slim Active Vectors Strip with Real-time Magnitude Steppers */}
      {currentBodyVectors.length > 0 && (
        <div className="dcl-vectors-strip miro-island">
          <span className="strip-title">Fuerzas activas:</span>
          {currentBodyVectors.map((v) => (
            <div key={v.id} className="strip-chip">
              <span className="strip-dot" style={{ backgroundColor: v.color || '#ea580c' }} />
              <span className="strip-name">{v.symbol || v.name}</span>
              <span className="strip-angle">{Math.round(v.angleDeg || 0)}°</span>
              <span className="strip-mag">{v.magnitude !== undefined ? `${v.magnitude}N` : '50N'}</span>
              
              <div className="strip-steppers">
                <button
                  className="step-btn"
                  onClick={() => handleStepMagnitude(v.id, -10)}
                  title="Reducir 10 N"
                >
                  -
                </button>
                <button
                  className="step-btn"
                  onClick={() => handleStepMagnitude(v.id, 10)}
                  title="Aumentar 10 N"
                >
                  +
                </button>
              </div>

              <button
                className="strip-del"
                onClick={() => handleDeleteVector(v.id)}
                title={`Eliminar fuerza ${v.symbol || v.name}`}
              >
                ×
              </button>
            </div>
          ))}
          <span className="strip-hint">Arrastra las puntas en el lienzo para girar en 360°</span>
        </div>
      )}

      <style>{`
        .dcl-hud-root {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          user-select: none;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .dcl-hud-bar {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 8px;
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.10), 0 1px 3px rgba(15, 23, 42, 0.05);
          white-space: nowrap;
        }

        .dcl-hud-sep {
          width: 1px;
          height: 18px;
          background: #e2e8f0;
          margin: 0 2px;
        }

        /* Body Tabs */
        .dcl-body-tabs-group {
          display: flex;
          background: #f1f5f9;
          border-radius: 16px;
          padding: 2px;
          gap: 2px;
        }

        .dcl-body-tab {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 9px;
          border-radius: 14px;
          border: none;
          background: transparent;
          color: #475569;
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .dcl-body-tab:hover {
          color: #0f172a;
        }

        .dcl-body-tab.active {
          background: #ffffff;
          color: #0f172a;
          font-weight: 700;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        .tab-badge {
          background: #ea580c;
          color: #ffffff;
          font-size: 0.60rem;
          font-weight: 800;
          padding: 0 4px;
          border-radius: 8px;
          line-height: 1.3;
        }

        /* Forces Group */
        .dcl-forces-group {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .dcl-force-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #334155;
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .dcl-force-chip:hover {
          background: #ffffff;
          border-color: #cbd5e1;
          color: #0f172a;
          transform: translateY(-1px);
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }

        .dcl-force-chip.red:hover { border-color: #fca5a5; background: #fff5f5; color: #dc2626; }
        .dcl-force-chip.blue:hover { border-color: #93c5fd; background: #eff6ff; color: #2563eb; }
        .dcl-force-chip.green:hover { border-color: #86efac; background: #f0fdf4; color: #16a34a; }
        .dcl-force-chip.amber:hover { border-color: #fcd34d; background: #fffbeb; color: #d97706; }
        .dcl-force-chip.purple:hover { border-color: #d8b4fe; background: #faf5ff; color: #7c3aed; }

        .force-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .force-dot.red { background: #ef4444; }
        .force-dot.blue { background: #3b82f6; }
        .force-dot.green { background: #10b981; }
        .force-dot.amber { background: #f59e0b; }
        .force-dot.purple { background: #8b5cf6; }

        .force-sym {
          font-weight: 700;
          font-size: 0.72rem;
        }

        .force-desc {
          font-size: 0.65rem;
          color: #64748b;
          font-weight: 500;
        }

        /* Actions Group */
        .dcl-actions-group {
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .dcl-tool-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #475569;
          font-size: 0.70rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .dcl-tool-btn:hover {
          background: #ffffff;
          border-color: #cbd5e1;
          color: #0f172a;
        }

        .dcl-tool-btn.active {
          background: #fff7ed;
          border-color: #fdba74;
          color: #c2410c;
        }

        .dcl-icon-btn {
          width: 26px;
          height: 26px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          border: 1px solid transparent;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .dcl-icon-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .dcl-icon-btn.delete:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        /* Active Vectors Strip */
        .dcl-vectors-strip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 3px 10px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
          font-size: 0.68rem;
        }

        .strip-title {
          font-weight: 600;
          color: #64748b;
        }

        .strip-chip {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1px 6px;
          font-size: 0.67rem;
        }

        .strip-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        .strip-name {
          font-weight: 700;
          color: #0f172a;
        }

        .strip-angle {
          color: #64748b;
          font-family: monospace;
          font-size: 0.64rem;
        }

        .strip-del {
          border: none;
          background: transparent;
          color: #94a3b8;
          font-size: 0.85rem;
          cursor: pointer;
          padding: 0 1px;
          line-height: 1;
        }

        .strip-del:hover {
          color: #ef4444;
        }

        .dcl-live-summary-chip {
          display: inline-flex;
          align-items: center;
          padding: 3px 9px;
          border-radius: 12px;
          font-size: 0.69rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }

        .chip-equilibrium {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .chip-dynamic {
          background: #f0f9ff;
          color: #0369a1;
          border: 1px solid #bae6fd;
        }

        .strip-mag {
          font-family: monospace;
          font-weight: 700;
          color: #2563eb;
          font-size: 0.65rem;
          margin-left: 2px;
        }

        .strip-steppers {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          margin-left: 2px;
        }

        .step-btn {
          width: 14px;
          height: 14px;
          border-radius: 4px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          font-size: 0.65rem;
          font-weight: 800;
          line-height: 1;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          transition: all 0.1s ease;
        }

        .step-btn:hover {
          background: #0284c7;
          border-color: #0284c7;
          color: #ffffff;
        }

        .strip-hint {
          font-size: 0.63rem;
          color: #94a3b8;
          margin-left: 4px;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
