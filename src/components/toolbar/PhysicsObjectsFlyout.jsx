import React, { useState } from 'react';
import { 
  X, 
  Weight, 
  Layers, 
  Info,
  CircleDot,
  Move,
  Plus,
  Link2,
  Sparkles,
  Gauge,
  Timer,
  Calculator
} from 'lucide-react';
import { PHYSICS_TOPICS, PHYSICS_OBJECT_DEFINITIONS } from '../../physics/physicsRegistry';

export default function PhysicsObjectsFlyout({
  isOpen,
  onClose,
  onAddPhysicsObject,
  onAddAssembly,
  onSelectRopeTool,
  onOpenMruSolver,
}) {
  if (!isOpen) return null;

  const [activeTopic, setActiveTopic] = useState('mru');

  const mruCartDef = PHYSICS_OBJECT_DEFINITIONS.mru_cart;
  const mruTrackDef = PHYSICS_OBJECT_DEFINITIONS.mru_track;
  const mruGateDef = PHYSICS_OBJECT_DEFINITIONS.mru_photogate;
  const massDef = PHYSICS_OBJECT_DEFINITIONS.mass;
  const pulleyDef = PHYSICS_OBJECT_DEFINITIONS.pulley;

  const handleDragStart = (e, physicsType, preset) => {
    e.dataTransfer.setData(
      'application/physics-object',
      JSON.stringify({
        physicsType,
        preset,
      })
    );
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="physics-objects-drawer miro-island">
      {/* Header */}
      <div className="drawer-header">
        <div>
          <span className="objects-badge">Laboratorio de Física</span>
          <h3 className="drawer-title">Objetos Físicos</h3>
        </div>
        <button className="drawer-close-btn" onClick={onClose} title="Cerrar (Esc)">
          <X size={16} />
        </button>
      </div>

      {/* Topic Tabs */}
      <div className="topic-tabs-row">
        {PHYSICS_TOPICS.map((topic) => (
          <button
            key={topic.id}
            className={`topic-tab-btn ${activeTopic === topic.id ? 'active' : ''} ${!topic.active ? 'disabled' : ''}`}
            onClick={() => topic.active && setActiveTopic(topic.id)}
            title={topic.active ? `Tema: ${topic.name}` : `${topic.name} (Próximamente)`}
          >
            <span>{topic.name}</span>
            {!topic.active && <span className="coming-tag">Pronto</span>}
          </button>
        ))}
      </div>

      {/* Objects Content depending on Active Topic */}
      <div className="objects-scroll-area">
        {activeTopic === 'mru' && (
          <>
            {/* Solver Promo Card */}
            {onOpenMruSolver && (
              <div 
                className="solver-promo-card"
                onClick={() => {
                  onOpenMruSolver();
                  onClose();
                }}
                title="Resolver ejercicios de MRU paso a paso con los 5 problemas de clase precargados"
              >
                <div className="solver-promo-icon">
                  <Calculator size={18} />
                </div>
                <div className="solver-promo-info">
                  <span className="solver-promo-title">Solucionador de Ejercicios MRU</span>
                  <span className="solver-promo-desc">Resuelve tiempo, llegada y alcance paso a paso</span>
                </div>
                <button className="solver-promo-btn">Abrir</button>
              </div>
            )}

            {/* Quick Pre-assembled MRU Experiment */}
            <div className="objects-section-heading">
              <Sparkles size={15} className="section-icon gold" />
              <span>Experimento Listo para Demostración</span>
            </div>

            <div 
              className="assembly-preset-card mru-banner"
              onClick={() => {
                if (onAddAssembly) onAddAssembly('mru');
                onClose();
              }}
              title="Insertar Laboratorio Completo MRU con riel graduado, móvil y fotopuertas"
            >
              <div className="assembly-card-content">
                <div className="assembly-title-row">
                  <span className="assembly-name">Laboratorio MRU Completo</span>
                  <span className="assembly-badge mru">1 Clic</span>
                </div>
                <p className="assembly-desc">
                  Riel de 6 m + Móvil (v = 2.0 m/s con vector velocidad) + 2 Fotopuertas láser sincronizadas.
                </p>
              </div>
              <button className="assembly-add-btn mru">
                Insertar
              </button>
            </div>

            {/* Section 1: MRU Carts */}
            <div className="objects-section-heading">
              <Gauge size={15} className="section-icon" />
              <span>Móviles MRU (v = cte, a = 0)</span>
            </div>

            <p className="objects-guide-text">
              Arrastra hacia el riel o haz clic para colocar en el centro:
            </p>

            <div className="mass-presets-list">
              {mruCartDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="mass-preset-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'mru_cart', preset)}
                  onClick={() => onAddPhysicsObject('mru_cart', preset)}
                  title="Arrastra al lienzo o haz clic para colocar"
                >
                  <div className="cart-visual-preview">
                    <div className="cart-preview-body" style={{ backgroundColor: preset.color }}>
                      <span className="cart-preview-spd">{Math.abs(preset.velocity)}</span>
                    </div>
                    <div className="cart-preview-wheels">
                      <div className="cart-preview-wheel" />
                      <div className="cart-preview-wheel" />
                    </div>
                  </div>

                  <div className="mass-preset-info">
                    <div className="mass-preset-title-row">
                      <span className="mass-preset-name">{preset.label}</span>
                      <span className="drag-hint-badge">
                        <Move size={11} /> Arrastrar
                      </span>
                    </div>
                    <span className="mass-preset-desc">
                      Velocidad: {preset.velocity > 0 ? `+${preset.velocity}` : preset.velocity} m/s • Aceleración: a = 0
                    </span>
                  </div>

                  <button
                    className="mass-quick-add-btn"
                    title="Colocar en el centro del lienzo"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('mru_cart', preset);
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Section 2: Graduated Rails */}
            <div className="objects-section-heading">
              <Layers size={15} className="section-icon" />
              <span>Riel Graduado de Laboratorio</span>
            </div>

            <div className="mass-presets-list">
              {mruTrackDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="mass-preset-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'mru_track', preset)}
                  onClick={() => onAddPhysicsObject('mru_track', preset)}
                  title="Arrastra al lienzo o haz clic para colocar"
                >
                  <div className="track-visual-preview">
                    <div className="track-preview-bar">
                      <div className="track-preview-tick" />
                      <div className="track-preview-tick" />
                      <div className="track-preview-tick" />
                    </div>
                    <div className="track-preview-feet">
                      <div className="track-preview-foot" />
                      <div className="track-preview-foot" />
                    </div>
                  </div>

                  <div className="mass-preset-info">
                    <div className="mass-preset-title-row">
                      <span className="mass-preset-name">{preset.label}</span>
                      <span className="drag-hint-badge">
                        <Move size={11} /> Arrastrar
                      </span>
                    </div>
                    <span className="mass-preset-desc">
                      Regla graduada milimétrica (0 a {preset.lengthMeters.toFixed(1)} m) • Tope final
                    </span>
                  </div>

                  <button
                    className="mass-quick-add-btn"
                    title="Colocar en el centro del lienzo"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('mru_track', preset);
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Section 3: Photogates */}
            <div className="objects-section-heading">
              <Timer size={15} className="section-icon" />
              <span>Fotopuertas & Sensores de Paso</span>
            </div>

            <div className="mass-presets-list">
              {mruGateDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="mass-preset-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'mru_photogate', preset)}
                  onClick={() => onAddPhysicsObject('mru_photogate', preset)}
                  title="Arrastra al lienzo o haz clic para colocar"
                >
                  <div className="gate-visual-preview">
                    <div className="gate-preview-arch">
                      <div className="gate-preview-laser" />
                    </div>
                    <div className="gate-preview-base" />
                  </div>

                  <div className="mass-preset-info">
                    <div className="mass-preset-title-row">
                      <span className="mass-preset-name">{preset.label}</span>
                      <span className="drag-hint-badge">
                        <Move size={11} /> Arrastrar
                      </span>
                    </div>
                    <span className="mass-preset-desc">
                      Sensor óptico con haz infrarrojo y cronometraje digital
                    </span>
                  </div>

                  <button
                    className="mass-quick-add-btn"
                    title="Colocar en el centro del lienzo"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('mru_photogate', preset);
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Informative Note for MRU */}
            <div className="objects-info-note">
              <Info size={14} className="info-icon" />
              <span>
                En el <strong>MRU</strong> la velocidad es constante (<strong>a = 0</strong>) y la trayectoria es recta. Cumple la ley horaria <em>x(t) = x₀ + v·t</em>.
              </span>
            </div>
          </>
        )}

        {activeTopic === 'mechanics' && (
          <>
            {/* Quick Pre-assembled Experiments */}
            <div className="objects-section-heading">
              <Sparkles size={15} className="section-icon gold" />
              <span>Experimento Listo para Demostración</span>
            </div>

            <div 
              className="assembly-preset-card"
              onClick={() => {
                if (onAddAssembly) onAddAssembly('atwood');
                onClose();
              }}
              title="Insertar Máquina de Atwood completa con polea y masas interconectadas"
            >
              <div className="assembly-card-content">
                <div className="assembly-title-row">
                  <span className="assembly-name">Máquina de Atwood</span>
                  <span className="assembly-badge">1 Clic</span>
                </div>
                <p className="assembly-desc">
                  Polea superior fija conectada por cuerda a Masa A (100 kg) y Masa B (60 kg).
                </p>
              </div>
              <button className="assembly-add-btn">
                Insertar
              </button>
            </div>

            {/* Section 1: Masses */}
            <div className="objects-section-heading">
              <Weight size={15} className="section-icon" />
              <span>Masas & Cuerpos Rígidos</span>
            </div>

            <p className="objects-guide-text">
              Arrastra hacia la pizarra o haz clic para colocar en el centro:
            </p>

            {/* Mass Preset Cards */}
            <div className="mass-presets-list">
              {massDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="mass-preset-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'mass', preset)}
                  onClick={() => onAddPhysicsObject('mass', preset)}
                  title="Arrastra al lienzo o haz clic para colocar"
                >
                  <div
                    className="mass-visual-preview"
                    style={{ backgroundColor: preset.color }}
                  >
                    <span className="mass-preview-kg">{preset.mass}</span>
                    <span className="mass-preview-unit">kg</span>
                    <div className="mass-preview-hook" />
                  </div>

                  <div className="mass-preset-info">
                    <div className="mass-preset-title-row">
                      <span className="mass-preset-name">{preset.label}</span>
                      <span className="drag-hint-badge">
                        <Move size={11} /> Arrastrar
                      </span>
                    </div>
                    <span className="mass-preset-desc">
                      Inercia: {preset.mass} kg • Peso: {(preset.mass * 9.8).toFixed(0)} N
                    </span>
                  </div>

                  <button
                    className="mass-quick-add-btn"
                    title="Colocar en el centro del lienzo"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('mass', preset);
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Section 2: Pulleys */}
            <div className="objects-section-heading">
              <CircleDot size={15} className="section-icon" />
              <span>Poleas & Redirección</span>
            </div>

            <div className="mass-presets-list">
              {pulleyDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="mass-preset-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'pulley', preset)}
                  onClick={() => onAddPhysicsObject('pulley', preset)}
                  title="Arrastra al lienzo o haz clic para colocar"
                >
                  <div className="pulley-visual-preview">
                    <div className="pulley-preview-bracket" />
                    <div className="pulley-preview-wheel">
                      <div className="pulley-preview-groove" />
                      <div className="pulley-preview-pin" />
                    </div>
                  </div>

                  <div className="mass-preset-info">
                    <div className="mass-preset-title-row">
                      <span className="mass-preset-name">{preset.label}</span>
                      <span className="drag-hint-badge">
                        <Move size={11} /> Arrastrar
                      </span>
                    </div>
                    <span className="mass-preset-desc">
                      {preset.isStatic ? 'Fijación al techo • Gargantas laterales' : 'Polea móvil libre'}
                    </span>
                  </div>

                  <button
                    className="mass-quick-add-btn"
                    title="Colocar en el centro del lienzo"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('pulley', preset);
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Section 3: Connections / Rope */}
            <div className="objects-section-heading">
              <Link2 size={15} className="section-icon" />
              <span>Cuerdas & Conexiones Físicas</span>
            </div>

            <div className="rope-action-box">
              <div className="rope-action-header">
                <span className="rope-action-title">Herramienta Cuerda</span>
                {onSelectRopeTool && (
                  <button 
                    className="rope-activate-btn"
                    onClick={() => {
                      onSelectRopeTool();
                      onClose();
                    }}
                    title="Activar herramienta de tender cuerda"
                  >
                    Activar
                  </button>
                )}
              </div>
              <p className="rope-action-desc">
                Haz clic o arrastra desde cualquier punto de anclaje (anillo celeste) de una masa o polea hacia otro para unirlos físicamente.
              </p>
            </div>

            {/* Informative Tip */}
            <div className="objects-info-note">
              <Info size={14} className="info-icon" />
              <span>
                Las conexiones transmiten tensión en tiempo real. Al conectar una polea y dos masas se construye automáticamente la <strong>Máquina de Atwood</strong>.
              </span>
            </div>
          </>
        )}
      </div>

      <style>{`
        .physics-objects-drawer {
          position: absolute;
          left: calc(100% + 12px);
          top: 0;
          width: 320px;
          max-height: calc(100vh - 120px);
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
          border: 1px solid #e1e3ea;
          display: flex;
          flex-direction: column;
          z-index: 60;
          animation: contextFadeIn 0.14s ease-out;
          overflow: hidden;
        }

        .drawer-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 14px 16px 10px;
          border-bottom: 1px solid #f1f3f7;
        }

        .objects-badge {
          display: inline-block;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #2563eb;
          background: #eff6ff;
          padding: 2px 7px;
          border-radius: 9999px;
          margin-bottom: 3px;
        }

        .drawer-title {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
        }

        .drawer-close-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 3px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.12s;
        }

        .drawer-close-btn:hover {
          background-color: #f1f5f9;
          color: #0f172a;
        }

        .topic-tabs-row {
          display: flex;
          gap: 4px;
          padding: 8px 12px;
          background: #f8fafc;
          border-bottom: 1px solid #f1f3f7;
          overflow-x: auto;
        }

        .topic-tab-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 5px 9px;
          border-radius: 6px;
          border: 1px solid transparent;
          background: transparent;
          font-size: 0.72rem;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.12s;
        }

        .topic-tab-btn:hover:not(.disabled) {
          color: #0f172a;
          background: #e2e8f0;
        }

        .topic-tab-btn.active {
          background: #ffffff;
          color: #2563eb;
          border-color: #e2e8f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .topic-tab-btn.disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .coming-tag {
          font-size: 0.55rem;
          background: #f1f5f9;
          color: #94a3b8;
          padding: 1px 4px;
          border-radius: 4px;
        }

        .objects-scroll-area {
          flex: 1;
          overflow-y: auto;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .objects-section-heading {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.76rem;
          font-weight: 700;
          color: #1e293b;
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .section-icon {
          color: #2563eb;
        }

        .section-icon.gold {
          color: #f59e0b;
        }

        .objects-guide-text {
          font-size: 0.72rem;
          color: #64748b;
          line-height: 1.35;
          margin: 0;
        }

        .assembly-preset-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-radius: 10px;
          background: linear-gradient(135deg, #fefce8 0%, #fffbeb 100%);
          border: 1px solid #fde68a;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .assembly-preset-card:hover {
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
          border-color: #f59e0b;
          transform: translateY(-1px);
        }

        .solver-promo-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
          border: 1.5px solid #86efac;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .solver-promo-card:hover {
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.18);
          border-color: #16a34a;
          transform: translateY(-1px);
        }

        .solver-promo-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #dcfce7;
          color: #15803d;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .solver-promo-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .solver-promo-title {
          font-size: 0.78rem;
          font-weight: 800;
          color: #14532d;
        }

        .solver-promo-desc {
          font-size: 0.65rem;
          color: #166534;
          line-height: 1.25;
        }

        .solver-promo-btn {
          padding: 4px 8px;
          border-radius: 6px;
          background: #16a34a;
          color: #ffffff;
          border: none;
          font-size: 0.7rem;
          font-weight: 700;
          cursor: pointer;
        }

        .assembly-card-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .assembly-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .assembly-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: #92400e;
        }

        .assembly-badge {
          font-size: 0.6rem;
          font-weight: 700;
          background: #f59e0b;
          color: #ffffff;
          padding: 1px 5px;
          border-radius: 4px;
        }

        .assembly-desc {
          font-size: 0.68rem;
          color: #78350f;
          margin: 0;
          line-height: 1.3;
        }

        .assembly-add-btn {
          padding: 5px 10px;
          border-radius: 6px;
          background: #f59e0b;
          color: #ffffff;
          border: none;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.12s;
        }

        .assembly-add-btn:hover {
          background: #d97706;
        }

        .assembly-preset-card.mru-banner {
          background: linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%);
          border: 1px solid #a7f3d0;
        }

        .assembly-preset-card.mru-banner:hover {
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
          border-color: #10b981;
        }

        .assembly-badge.mru {
          background: #059669;
        }

        .assembly-add-btn.mru {
          background: #059669;
        }

        .assembly-add-btn.mru:hover {
          background: #047857;
        }

        .cart-visual-preview {
          position: relative;
          width: 38px;
          height: 34px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cart-preview-body {
          width: 34px;
          height: 18px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 800;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
        }

        .cart-preview-wheels {
          display: flex;
          justify-content: space-between;
          width: 26px;
          margin-top: 1px;
        }

        .cart-preview-wheel {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #0f172a;
          border: 1px solid #94a3b8;
        }

        .track-visual-preview {
          position: relative;
          width: 38px;
          height: 34px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .track-preview-bar {
          width: 36px;
          height: 9px;
          background: #e2e8f0;
          border: 1.5px solid #64748b;
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: space-evenly;
        }

        .track-preview-tick {
          width: 1px;
          height: 5px;
          background: #475569;
        }

        .track-preview-feet {
          display: flex;
          justify-content: space-between;
          width: 30px;
          margin-top: 2px;
        }

        .track-preview-foot {
          width: 5px;
          height: 4px;
          background: #475569;
          border-radius: 1px;
        }

        .gate-visual-preview {
          position: relative;
          width: 38px;
          height: 34px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .gate-preview-arch {
          width: 20px;
          height: 20px;
          border: 2.5px solid #334155;
          border-bottom: none;
          border-radius: 4px 4px 0 0;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .gate-preview-laser {
          width: 100%;
          height: 1.5px;
          background: #ef4444;
          box-shadow: 0 0 3px #ef4444;
        }

        .gate-preview-base {
          width: 26px;
          height: 4px;
          background: #1e293b;
          border-radius: 2px;
        }

        .mass-presets-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mass-preset-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 10px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          cursor: grab;
          transition: all 0.14s ease;
        }

        .mass-preset-card:hover {
          border-color: #bfdbfe;
          background: #f8fafc;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .mass-preset-card:active {
          cursor: grabbing;
        }

        .mass-visual-preview {
          position: relative;
          width: 36px;
          height: 36px;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 800;
          line-height: 1;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          flex-shrink: 0;
        }

        .mass-preview-kg {
          font-size: 0.85rem;
        }

        .mass-preview-unit {
          font-size: 0.55rem;
          opacity: 0.85;
        }

        .mass-preview-hook {
          position: absolute;
          top: -3px;
          width: 7px;
          height: 4px;
          border: 1.5px solid #475569;
          border-bottom: none;
          border-radius: 4px 4px 0 0;
          background: #ffffff;
        }

        .pulley-visual-preview {
          position: relative;
          width: 36px;
          height: 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .pulley-preview-bracket {
          width: 14px;
          height: 5px;
          border-top: 2px solid #475569;
          border-left: 1.5px solid #64748b;
          border-right: 1.5px solid #64748b;
          margin-bottom: -1px;
        }

        .pulley-preview-wheel {
          position: relative;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #e2e8f0;
          border: 1.5px solid #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.12);
        }

        .pulley-preview-groove {
          position: absolute;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #cbd5e1;
          border: 1px solid rgba(0, 0, 0, 0.15);
        }

        .pulley-preview-pin {
          position: relative;
          z-index: 1;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #1e293b;
          border: 1px solid #ffffff;
        }

        .mass-preset-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .mass-preset-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .mass-preset-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: #0f172a;
        }

        .drag-hint-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 0.64rem;
          font-weight: 600;
          color: #64748b;
          background: #f1f5f9;
          padding: 1px 5px;
          border-radius: 4px;
        }

        .mass-preset-desc {
          font-size: 0.68rem;
          color: #64748b;
        }

        .mass-quick-add-btn {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          background: #eff6ff;
          color: #2563eb;
          border: 1px solid #bfdbfe;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.12s;
        }

        .mass-quick-add-btn:hover {
          background: #2563eb;
          color: #ffffff;
        }

        .rope-action-box {
          padding: 10px 12px;
          background: #f1f5f9;
          border-radius: 10px;
          border: 1px dashed #cbd5e1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .rope-action-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .rope-action-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: #1e293b;
        }

        .rope-activate-btn {
          padding: 3px 8px;
          border-radius: 5px;
          background: #2563eb;
          color: #ffffff;
          border: none;
          font-size: 0.7rem;
          font-weight: 600;
          cursor: pointer;
        }

        .rope-activate-btn:hover {
          background: #1d4ed8;
        }

        .rope-action-desc {
          font-size: 0.68rem;
          color: #64748b;
          line-height: 1.35;
          margin: 0;
        }

        .objects-info-note {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          padding: 8px 10px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          font-size: 0.68rem;
          color: #64748b;
          line-height: 1.35;
          margin-top: 4px;
        }

        .info-icon {
          color: #3b82f6;
          flex-shrink: 0;
          margin-top: 1px;
        }
      `}</style>
    </div>
  );
}
