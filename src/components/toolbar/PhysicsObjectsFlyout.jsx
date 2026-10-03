import React, { useState } from 'react';
import { 
  X, 
  Gauge, 
  TrendingUp, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Navigation, 
  Weight, 
  Layers,
  Target,
  RotateCw
} from 'lucide-react';
import { PHYSICS_TOPICS, PHYSICS_OBJECT_DEFINITIONS } from '../../physics/physicsRegistry';

const TOPIC_CONFIG = {
  mru: { icon: Gauge, short: 'MRU', tag: 'HT01', color: '#2563eb' },
  mruv: { icon: TrendingUp, short: 'MRUV', tag: 'HT02', color: '#d97706' },
  freefall: { icon: ArrowDownCircle, short: 'Caída Libre', tag: 'HT03', color: '#16a34a' },
  tiro_vertical: { icon: ArrowUpCircle, short: 'Tiro Vertical', tag: 'HT04', color: '#db2777' },
  lanzamiento_horizontal: { icon: Navigation, short: 'Lanz. Horiz.', tag: 'HT01 2D', color: '#0891b2' },
  movimiento_proyectiles: { icon: Target, short: 'Proyectiles', tag: 'HT02 2D', color: '#8b5cf6' },
  mcu: { icon: RotateCw, short: 'MCU', tag: 'HT03 MCU', color: '#0284c7' },
  mcuv: { icon: RotateCw, short: 'MCUV', tag: 'Unidad 2', color: '#0891b2' },
  mechanics: { icon: Weight, short: 'Dinámica', tag: 'Atwood', color: '#4f46e5' },
};

export default function PhysicsObjectsFlyout({
  isOpen,
  onClose,
  onAddPhysicsObject,
  onAddAssembly,
  _onAddAssembly,
  onSelectRopeTool,
  onOpenMruSolver,
  onOpenMruvSolver,
  onOpenFreefallSolver,
  onOpenTiroVerticalSolver,
  onOpenHorizontalLaunchSolver,
  onOpenProjectileMotionSolver,
  onOpenMcuSolver,
  onOpenMcuvSolver,
}) {
  const [activeTopic, setActiveTopic] = useState('mru');
  const handleAddAssembly = onAddAssembly || _onAddAssembly;

  if (!isOpen) return null;

  const mruCartDef = PHYSICS_OBJECT_DEFINITIONS.mru_cart;
  const mruvCartDef = PHYSICS_OBJECT_DEFINITIONS.mruv_cart;
  const freefallBodyDef = PHYSICS_OBJECT_DEFINITIONS.freefall_body;
  const freefallTowerDef = PHYSICS_OBJECT_DEFINITIONS.freefall_tower;
  const verticalProjectileDef = PHYSICS_OBJECT_DEFINITIONS.vertical_projectile;
  const horizontalProjectileDef = PHYSICS_OBJECT_DEFINITIONS.horizontal_projectile;
  const cliffPlatformDef = PHYSICS_OBJECT_DEFINITIONS.cliff_platform;
  const cannonLauncherDef = PHYSICS_OBJECT_DEFINITIONS.cannon_launcher;
  const obliqueProjectileDef = PHYSICS_OBJECT_DEFINITIONS.oblique_projectile;
  const targetWallDef = PHYSICS_OBJECT_DEFINITIONS.target_wall;
  const mcuTurntableDef = PHYSICS_OBJECT_DEFINITIONS.mcu_turntable;
  const mcuParticleDef = PHYSICS_OBJECT_DEFINITIONS.mcu_particle;
  const mcuvTurntableDef = PHYSICS_OBJECT_DEFINITIONS.mcuv_turntable;
  const mcuvParticleDef = PHYSICS_OBJECT_DEFINITIONS.mcuv_particle;
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

  const getCleanLabel = (label) => {
    return label.replace(/\s*\(.*\)$/, '');
  };

  return (
    <div className="physics-objects-drawer miro-island">
      {/* Header */}
      <div className="drawer-header">
        <div className="drawer-header-meta">
          <span className="objects-badge">Laboratorio de Física</span>
          <h3 className="drawer-title">Objetos e Instrumentos</h3>
        </div>
        <button className="drawer-close-btn" onClick={onClose} title="Cerrar (Esc)">
          <X size={16} />
        </button>
      </div>

      {/* 3x2 Topic Grid: ALL 6 topics always visible */}
      <div className="topic-grid-control">
        {PHYSICS_TOPICS.filter((t) => t.active).map((topic) => {
          const cfg = TOPIC_CONFIG[topic.id] || { icon: Layers, short: topic.name, color: '#475569' };
          const IconComponent = cfg.icon;
          const isActive = activeTopic === topic.id;
          return (
            <button
              key={topic.id}
              className={`topic-grid-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTopic(topic.id)}
              title={`Tema: ${topic.name}`}
              style={isActive ? { borderColor: cfg.color, background: cfg.color } : {}}
            >
              <IconComponent size={13} className="topic-grid-icon" style={!isActive ? { color: cfg.color } : {}} />
              <span className="topic-grid-label">{cfg.short}</span>
            </button>
          );
        })}
      </div>

      {/* Active Topic Banner */}
      <div className="active-topic-banner">
        <div className="active-topic-info">
          <span className="active-topic-title">
            {PHYSICS_TOPICS.find((t) => t.id === activeTopic)?.name}
          </span>
          <span className="active-topic-tag">
            {TOPIC_CONFIG[activeTopic]?.tag || 'Física'}
          </span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="objects-scroll-area">
        {activeTopic === 'mru' && (
          <>
            {/* Analytical Solver Card */}
            {onOpenMruSolver && (
              <div
                className="solver-promo-card"
                onClick={() => {
                  onOpenMruSolver();
                  onClose();
                }}
                title="Abrir solucionador analítico paso a paso"
              >
                <div className="solver-promo-top">
                  <span className="solver-kicker">Módulo Analítico</span>
                  <span className="solver-tag">Resolución Guiada</span>
                </div>
                <h4 className="solver-promo-title">Solucionador de Problemas MRU</h4>
                <p className="solver-promo-desc">
                  Cálculo detallado de tiempo, velocidad, distancias y puntos de encuentro.
                </p>
                <div className="solver-promo-action">
                  <span className="solver-action-text">Abrir solucionador &rarr;</span>
                </div>
              </div>
            )}

            {/* Section 1: MRU Carts */}
            <div className="objects-section-heading">
              <span className="section-title">Móviles a Velocidad Constante</span>
              <span className="section-formula">v = cte • a = 0</span>
            </div>

            <p className="objects-guide-text">
              Haz clic para insertar o arrastra directamente al lienzo:
            </p>

            <div className="preset-cards-list">
              {mruCartDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="formal-preset-card"
                  style={{ borderLeftColor: preset.color }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'mru_cart', preset)}
                  onClick={() => onAddPhysicsObject('mru_cart', preset)}
                  title="Haz clic para añadir o arrastra al lienzo"
                >
                  <div className="preset-card-main">
                    <div className="preset-card-header">
                      <span className="preset-card-name">{getCleanLabel(preset.label)}</span>
                      <span className="preset-metric-tag">
                        v = {preset.velocity > 0 ? `+${preset.velocity}` : preset.velocity} m/s
                      </span>
                    </div>
                    <span className="preset-card-desc">
                      Velocidad constante • Aceleración a = 0 • Masa: 1.5 kg
                    </span>
                  </div>
                  <button
                    type="button"
                    className="preset-add-btn"
                    title="Añadir al lienzo"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('mru_cart', preset);
                    }}
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            {/* Section 2: Graduated Rails */}
            <div className="objects-section-heading">
              <span className="section-title">Riel Graduado de Guía</span>
              <span className="section-formula">Escala Métrica</span>
            </div>

            <div className="preset-cards-list">
              {mruTrackDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="formal-preset-card"
                  style={{ borderLeftColor: '#64748b' }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'mru_track', preset)}
                  onClick={() => onAddPhysicsObject('mru_track', preset)}
                  title="Haz clic para añadir o arrastra al lienzo"
                >
                  <div className="preset-card-main">
                    <div className="preset-card-header">
                      <span className="preset-card-name">{preset.label}</span>
                      <span className="preset-metric-tag">
                        L = {preset.lengthMeters.toFixed(1)} m
                      </span>
                    </div>
                    <span className="preset-card-desc">
                      Pista de baja fricción • Graduación milimétrica con tope
                    </span>
                  </div>
                  <button
                    type="button"
                    className="preset-add-btn"
                    title="Añadir al lienzo"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('mru_track', preset);
                    }}
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            {/* Section 3: Photogates */}
            <div className="objects-section-heading">
              <span className="section-title">Fotopuertas y Cronometría</span>
              <span className="section-formula">Sensor Óptico</span>
            </div>

            <div className="preset-cards-list">
              {mruGateDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="formal-preset-card"
                  style={{ borderLeftColor: '#334155' }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'mru_photogate', preset)}
                  onClick={() => onAddPhysicsObject('mru_photogate', preset)}
                  title="Haz clic para añadir o arrastra al lienzo"
                >
                  <div className="preset-card-main">
                    <div className="preset-card-header">
                      <span className="preset-card-name">{preset.label}</span>
                      <span className="preset-metric-tag">{preset.gateName}</span>
                    </div>
                    <span className="preset-card-desc">
                      Barrera infrarroja de paso • Medición de intervalo temporal
                    </span>
                  </div>
                  <button
                    type="button"
                    className="preset-add-btn"
                    title="Añadir al lienzo"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('mru_photogate', preset);
                    }}
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            {/* Informative Theory Box */}
            <div className="objects-info-note">
              <span className="info-note-label">Fundamento Teórico</span>
              <p className="info-note-text">
                En el <strong>MRU</strong> la velocidad permanece constante y la aceleración es nula (<strong>a = 0</strong>). La trayectoria es rectilínea y cumple la función horaria <em>x(t) = x₀ + v·t</em>.
              </p>
            </div>
          </>
        )}

        {activeTopic === 'mruv' && (
          <>
            {/* Analytical MRUV Solver Card */}
            {onOpenMruvSolver && (
              <div
                className="solver-promo-card"
                onClick={() => {
                  onOpenMruvSolver();
                  onClose();
                }}
                title="Abrir solucionador analítico MRUV (HT02 Kinal)"
              >
                <div className="solver-promo-top">
                  <span className="solver-kicker">Módulo Analítico HT02</span>
                  <span className="solver-tag">10 Problemas Resueltos</span>
                </div>
                <h4 className="solver-promo-title">Solucionador Cinemático MRUV</h4>
                <p className="solver-promo-desc">
                  Problemas HT02 Kinal, 6 preguntas conceptuales y calculadora con fórmulas cuadráticas.
                </p>
                <div className="solver-promo-action">
                  <span className="solver-action-text">Abrir solucionador MRUV &rarr;</span>
                </div>
              </div>
            )}

            {/* Section 1: MRUV Accelerated Carts */}
            <div className="objects-section-heading">
              <span className="section-title">Móviles con Aceleración Constante</span>
              <span className="section-formula">a = cte ≠ 0 • v(t) = v₀ + at</span>
            </div>

            <p className="objects-guide-text">
              Haz clic para insertar o arrastra directamente al lienzo:
            </p>

            <div className="preset-cards-list">
              {mruvCartDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="formal-preset-card"
                  style={{ borderLeftColor: preset.color }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'mruv_cart', preset)}
                  onClick={() => onAddPhysicsObject('mruv_cart', preset)}
                  title="Haz clic para añadir o arrastra al lienzo"
                >
                  <div className="preset-card-main">
                    <div className="preset-card-header">
                      <span className="preset-card-name">{getCleanLabel(preset.label)}</span>
                      <span className="preset-metric-tag">
                        a = {preset.acceleration > 0 ? `+${preset.acceleration}` : preset.acceleration} m/s²
                      </span>
                    </div>
                    <span className="preset-card-desc">
                      v₀ = {preset.velocity} m/s • Vectores v⃗ y a⃗ en tiempo real
                    </span>
                  </div>
                  <button
                    type="button"
                    className="preset-add-btn"
                    title="Añadir al lienzo"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('mruv_cart', preset);
                    }}
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            {/* Section 2: Graduated Rails */}
            <div className="objects-section-heading">
              <span className="section-title">Riel Graduado de Guía</span>
              <span className="section-formula">Escala Métrica</span>
            </div>

            <div className="preset-cards-list">
              {mruTrackDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="formal-preset-card"
                  style={{ borderLeftColor: '#64748b' }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'mru_track', preset)}
                  onClick={() => onAddPhysicsObject('mru_track', preset)}
                  title="Haz clic para añadir o arrastra al lienzo"
                >
                  <div className="preset-card-main">
                    <div className="preset-card-header">
                      <span className="preset-card-name">{preset.label}</span>
                      <span className="preset-metric-tag">{preset.lengthMeters} m</span>
                    </div>
                    <span className="preset-card-desc">
                      Superficie de aluminio anodizado de baja fricción con topes elásticos
                    </span>
                  </div>
                  <button
                    type="button"
                    className="preset-add-btn"
                    title="Añadir al lienzo"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('mru_track', preset);
                    }}
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            {/* Section 3: Photogates */}
            <div className="objects-section-heading">
              <span className="section-title">Sensores de Fotopuerta Óptica</span>
              <span className="section-formula">Cronometraje</span>
            </div>

            <div className="preset-cards-list">
              {mruGateDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="formal-preset-card"
                  style={{ borderLeftColor: '#334155' }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'mru_photogate', preset)}
                  onClick={() => onAddPhysicsObject('mru_photogate', preset)}
                  title="Haz clic para añadir o arrastra al lienzo"
                >
                  <div className="preset-card-main">
                    <div className="preset-card-header">
                      <span className="preset-card-name">{preset.label}</span>
                      <span className="preset-metric-tag">{preset.gateName}</span>
                    </div>
                    <span className="preset-card-desc">
                      Barrera infrarroja de paso • Medición de aceleración y tiempos
                    </span>
                  </div>
                  <button
                    type="button"
                    className="preset-add-btn"
                    title="Añadir al lienzo"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('mru_photogate', preset);
                    }}
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            {/* Informative Theory Box */}
            <div className="objects-info-note">
              <span className="info-note-label">Fundamento Teórico MRUV</span>
              <p className="info-note-text">
                En el <strong>MRUV</strong> la aceleración es constante (<strong>a = cte ≠ 0</strong>). Ecuaciones horarias: <em>v(t) = v₀ + a·t</em> y <em>x(t) = x₀ + v₀·t + ½·a·t²</em>. Ecuación independiente del tiempo: <em>v_f² = v₀² + 2·a·d</em>.
              </p>
            </div>
          </>
        )}

        {activeTopic === 'freefall' && (
          <>
            {/* Analytical Freefall Solver Card */}
            {onOpenFreefallSolver && (
              <div
                className="solver-promo-card freefall"
                onClick={() => {
                  onOpenFreefallSolver();
                  onClose();
                }}
                title="Abrir solucionador analítico de Caída Libre (HT03 Kinal)"
              >
                <div className="solver-promo-top">
                  <span className="solver-kicker freefall">Módulo Analítico HT03</span>
                  <span className="solver-tag freefall">10 Problemas + 5 Conceptuales</span>
                </div>
                <h4 className="solver-promo-title">Solucionador de Caída Libre</h4>
                <p className="solver-promo-desc">
                  Problemas de azoteas, torres, ventanas y canicas con fundamentación y simulador.
                </p>
                <div className="solver-promo-action">
                  <span className="solver-action-text freefall">Abrir solucionador HT03 &rarr;</span>
                </div>
              </div>
            )}

            {/* Section 1: Freefall Bodies */}
            <div className="objects-section-heading">
              <span className="section-title">Cuerpos en Caída Libre</span>
              <span className="section-formula">g = 9.80 m/s² • a = g</span>
            </div>

            <p className="objects-guide-text">
              Haz clic para insertar o arrastra directamente al lienzo:
            </p>

            <div className="preset-cards-list">
              {freefallBodyDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="formal-preset-card"
                  style={{ borderLeftColor: preset.color }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'freefall_body', preset)}
                  onClick={() => onAddPhysicsObject('freefall_body', preset)}
                  title="Haz clic para añadir o arrastra al lienzo"
                >
                  <div className="preset-card-main">
                    <div className="preset-card-header">
                      <span className="preset-card-name">{getCleanLabel(preset.label)}</span>
                      <span className="preset-metric-tag">
                        h = {preset.releaseHeight} m
                      </span>
                    </div>
                    <span className="preset-card-desc">
                      {preset.velocity > 0 ? `Lanzado v₀ = ${preset.velocity} m/s` : 'Parte del reposo (v₀ = 0)'} • g = 9.8 m/s²
                    </span>
                  </div>
                  <button
                    type="button"
                    className="preset-add-btn"
                    title="Añadir al lienzo"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('freefall_body', preset);
                    }}
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            {/* Section 2: Drop Towers */}
            <div className="objects-section-heading">
              <span className="section-title">Torres y Reglas Verticales</span>
              <span className="section-formula">Escala Vertical</span>
            </div>

            <div className="preset-cards-list">
              {freefallTowerDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="formal-preset-card"
                  style={{ borderLeftColor: '#64748b' }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'freefall_tower', preset)}
                  onClick={() => onAddPhysicsObject('freefall_tower', preset)}
                  title="Haz clic para añadir o arrastra al lienzo"
                >
                  <div className="preset-card-main">
                    <div className="preset-card-header">
                      <span className="preset-card-name">{preset.label}</span>
                      <span className="preset-metric-tag">{preset.heightMeters} m</span>
                    </div>
                    <span className="preset-card-desc">
                      Estructura vertical graduada con plataforma superior y base de impacto
                    </span>
                  </div>
                  <button
                    type="button"
                    className="preset-add-btn"
                    title="Añadir al lienzo"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('freefall_tower', preset);
                    }}
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            {/* Section 3: Photogates */}
            <div className="objects-section-heading">
              <span className="section-title">Sensores de Cronometraje Vertical</span>
              <span className="section-formula">Barrera Óptica</span>
            </div>

            <div className="preset-cards-list">
              {mruGateDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="formal-preset-card"
                  style={{ borderLeftColor: '#334155' }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'mru_photogate', preset)}
                  onClick={() => onAddPhysicsObject('mru_photogate', preset)}
                  title="Haz clic para añadir o arrastra al lienzo"
                >
                  <div className="preset-card-main">
                    <div className="preset-card-header">
                      <span className="preset-card-name">{preset.label}</span>
                      <span className="preset-metric-tag">{preset.gateName}</span>
                    </div>
                    <span className="preset-card-desc">
                      Fotopuerta para registro de tiempos en puntos clave de la caída
                    </span>
                  </div>
                  <button
                    type="button"
                    className="preset-add-btn"
                    title="Añadir al lienzo"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('mru_photogate', preset);
                    }}
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            {/* Informative Theory Box */}
            <div className="objects-info-note">
              <span className="info-note-label">Fundamento Teórico Caída Libre (HT03)</span>
              <p className="info-note-text">
                En la <strong>Caída Libre</strong> la aceleración es constante y dirigida verticalmente hacia abajo (<strong>g = 9.80 m/s²</strong>). Ecuaciones: <em>v(t) = v₀ + g·t</em>, <em>h(t) = v₀·t + ½·g·t²</em> y <em>v_f² = v₀² + 2·g·h</em>. Todos los cuerpos caen con idéntica aceleración en el vacío sin importar su masa.
              </p>
            </div>
          </>
        )}

        {activeTopic === 'tiro_vertical' && (
          <>
            {/* Analytical Tiro Vertical Solver Card */}
            {onOpenTiroVerticalSolver && (
              <div
                className="solver-promo-card vertical"
                onClick={() => {
                  onOpenTiroVerticalSolver();
                  onClose();
                }}
                title="Abrir solucionador analítico de Tiro Vertical (HT04 Kinal)"
              >
                <div className="solver-promo-top">
                  <span className="solver-kicker vertical">Módulo Analítico HT04</span>
                  <span className="solver-tag vertical">10 Problemas + 6 Conceptuales</span>
                </div>
                <h4 className="solver-promo-title">Solucionador de Tiro Vertical</h4>
                <p className="solver-promo-desc">
                  Problemas de cúspide, tiempos simétricos, saltos, béisbol terrestre y lunar.
                </p>
                <div className="solver-promo-action">
                  <span className="solver-action-text vertical">Abrir solucionador HT04 &rarr;</span>
                </div>
              </div>
            )}

            {/* Section 1: Vertical Projectiles */}
            <div className="objects-section-heading">
              <span className="section-title">Proyectiles de Tiro Vertical</span>
              <span className="section-formula">v(t) = v₀ - gt</span>
            </div>

            <p className="objects-guide-text">
              Haz clic para insertar o arrastra directamente al lienzo:
            </p>

            <div className="preset-cards-list">
              {verticalProjectileDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="formal-preset-card"
                  style={{ borderLeftColor: preset.color }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'vertical_projectile', preset)}
                  onClick={() => onAddPhysicsObject('vertical_projectile', preset)}
                  title="Haz clic para añadir o arrastra al lienzo"
                >
                  <div className="preset-card-main">
                    <div className="preset-card-header">
                      <span className="preset-card-name">{getCleanLabel(preset.label)}</span>
                      <span className="preset-metric-tag">
                        v₀ = {preset.velocity} m/s
                      </span>
                    </div>
                    <span className="preset-card-desc">
                      g = {preset.gravity || 9.8} m/s² • h_max = {((preset.velocity * preset.velocity) / (2 * (preset.gravity || 9.8))).toFixed(1)} m
                    </span>
                  </div>
                  <button
                    type="button"
                    className="preset-add-btn"
                    title="Añadir al lienzo"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('vertical_projectile', preset);
                    }}
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            {/* Section 2: Vertical Scales & Towers */}
            <div className="objects-section-heading">
              <span className="section-title">Torres y Escalas de Altura</span>
              <span className="section-formula">Graduación</span>
            </div>

            <div className="preset-cards-list">
              {freefallTowerDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="formal-preset-card"
                  style={{ borderLeftColor: '#8b5cf6' }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'freefall_tower', preset)}
                  onClick={() => onAddPhysicsObject('freefall_tower', preset)}
                  title="Haz clic para añadir o arrastra al lienzo"
                >
                  <div className="preset-card-main">
                    <div className="preset-card-header">
                      <span className="preset-card-name">{preset.label}</span>
                      <span className="preset-metric-tag">{preset.heightMeters} m</span>
                    </div>
                    <span className="preset-card-desc">
                      Escala vertical para medición visual de la altura máxima alcanzada
                    </span>
                  </div>
                  <button
                    type="button"
                    className="preset-add-btn"
                    title="Añadir al lienzo"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('freefall_tower', preset);
                    }}
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            {/* Section 3: Photogates */}
            <div className="objects-section-heading">
              <span className="section-title">Sensores Bidireccionales</span>
              <span className="section-formula">Subida & Bajada</span>
            </div>

            <div className="preset-cards-list">
              {mruGateDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="formal-preset-card"
                  style={{ borderLeftColor: '#334155' }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'mru_photogate', preset)}
                  onClick={() => onAddPhysicsObject('mru_photogate', preset)}
                  title="Haz clic para añadir o arrastra al lienzo"
                >
                  <div className="preset-card-main">
                    <div className="preset-card-header">
                      <span className="preset-card-name">{preset.label}</span>
                      <span className="preset-metric-tag">{preset.gateName}</span>
                    </div>
                    <span className="preset-card-desc">
                      Detecta el paso tanto en la trayectoria ascendente como descendente
                    </span>
                  </div>
                  <button
                    type="button"
                    className="preset-add-btn"
                    title="Añadir al lienzo"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('mru_photogate', preset);
                    }}
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            {/* Informative Theory Box */}
            <div className="objects-info-note vertical">
              <span className="info-note-label vertical">Fundamento Teórico Tiro Vertical (HT04)</span>
              <p className="info-note-text">
                En el <strong>Tiro Vertical</strong> el proyectil se impulsa verticalmente hacia arriba con rapidez inicial <em>v₀</em> y experimenta deceleración constante debida a la gravedad (<strong>a = -g</strong>). En la cúspide la velocidad se anula instantáneamente (<em>v = 0</em>, <em>h_max = v₀² / 2g</em>). El tiempo de subida es igual al tiempo de bajada (<em>T = 2·t_subida</em>) y regresa con la misma rapidez original <em>v₀</em>.
              </p>
            </div>
          </>
        )}

        {activeTopic === 'lanzamiento_horizontal' && (
          <>
            {/* Analytical Horizontal Launch Solver Card */}
            {onOpenHorizontalLaunchSolver && (
              <div
                className="solver-promo-card horizontal"
                onClick={() => {
                  onOpenHorizontalLaunchSolver();
                  onClose();
                }}
                title="Abrir solucionador analítico de Lanzamiento Horizontal (HT01 Kinal)"
              >
                <div className="solver-promo-top">
                  <span className="solver-kicker horizontal">Módulo Analítico HT01</span>
                  <span className="solver-tag horizontal">10 Problemas + 6 Conceptuales</span>
                </div>
                <h4 className="solver-promo-title">Solucionador de Lanzamiento Horizontal</h4>
                <p className="solver-promo-desc">
                  Problemas de alcances, acantilados, fuentes, bala, golf y persecución con simulación.
                </p>
                <div className="solver-promo-action">
                  <span className="solver-action-text horizontal">Abrir solucionador HT01 &rarr;</span>
                </div>
              </div>
            )}

            {/* Section 1: Horizontal Projectiles */}
            <div className="objects-section-heading">
              <span className="section-title">Proyectiles Horizontales</span>
              <span className="section-formula">vx = cte • vy = gt</span>
            </div>

            <p className="objects-guide-text">
              Haz clic para insertar o arrastra directamente al lienzo:
            </p>

            <div className="preset-cards-list">
              {horizontalProjectileDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="formal-preset-card"
                  style={{ borderLeftColor: preset.color }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'horizontal_projectile', preset)}
                  onClick={() => onAddPhysicsObject('horizontal_projectile', preset)}
                  title="Haz clic para añadir o arrastra al lienzo"
                >
                  <div className="preset-card-main">
                    <div className="preset-card-header">
                      <span className="preset-card-name">{getCleanLabel(preset.label)}</span>
                      <span className="preset-metric-tag" style={{ color: preset.color, borderColor: `${preset.color}40` }}>
                        v₀x = {preset.velocity} m/s
                      </span>
                    </div>
                    <span className="preset-card-desc">
                      Altura h = {preset.heightMeters} m • Alcance X ≈ {(preset.velocity * Math.sqrt((2 * preset.heightMeters) / 9.8)).toFixed(1)} m
                    </span>
                  </div>
                  <button
                    type="button"
                    className="preset-add-btn"
                    title="Añadir al lienzo"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('horizontal_projectile', preset);
                    }}
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            {/* Section 2: Cliff Platforms */}
            <div className="objects-section-heading">
              <span className="section-title">Acantilados y Plataformas</span>
              <span className="section-formula">h = ½gt²</span>
            </div>

            <div className="preset-cards-list">
              {cliffPlatformDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="formal-preset-card"
                  style={{ borderLeftColor: preset.color }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'cliff_platform', preset)}
                  onClick={() => onAddPhysicsObject('cliff_platform', preset)}
                  title="Haz clic para añadir o arrastra al lienzo"
                >
                  <div className="preset-card-main">
                    <div className="preset-card-header">
                      <span className="preset-card-name">{preset.label}</span>
                      <span className="preset-metric-tag">h = {preset.heightMeters}m</span>
                    </div>
                    <span className="preset-card-desc">
                      Base elevada para disparo horizontal con escala métrica vertical
                    </span>
                  </div>
                  <button
                    type="button"
                    className="preset-add-btn"
                    title="Añadir al lienzo"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('cliff_platform', preset);
                    }}
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            {/* Section 3: Impact Sensors */}
            <div className="objects-section-heading">
              <span className="section-title">Dianas y Sensores de Impacto</span>
              <span className="section-formula">Registro de Contacto</span>
            </div>

            <div className="preset-cards-list">
              {mruGateDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="formal-preset-card"
                  style={{ borderLeftColor: '#334155' }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'mru_photogate', preset)}
                  onClick={() => onAddPhysicsObject('mru_photogate', preset)}
                  title="Haz clic para añadir o arrastra al lienzo"
                >
                  <div className="preset-card-main">
                    <div className="preset-card-header">
                      <span className="preset-card-name">{preset.label}</span>
                      <span className="preset-metric-tag">{preset.gateName}</span>
                    </div>
                    <span className="preset-card-desc">
                      Fotopuerta para registro de tiempos en la zona de aterrizaje
                    </span>
                  </div>
                  <button
                    type="button"
                    className="preset-add-btn"
                    title="Añadir al lienzo"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('mru_photogate', preset);
                    }}
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            {/* Informative Theory Box */}
            <div className="objects-info-note horizontal">
              <span className="info-note-label horizontal">Fundamento Teórico Lanzamiento Horizontal (HT01)</span>
              <p className="info-note-text">
                El <strong>Lanzamiento Horizontal</strong> es un movimiento compuesto bidimensional: en el eje X un <strong>MRU</strong> (<em>v_x = v₀x = cte</em>) y en el eje Y una <strong>Caída Libre</strong> (<em>v_y = g·t</em>, <em>h = ½·g·t²</em>). El tiempo de vuelo depende únicamente de la altura: <em>t = √(2h / g)</em> y el alcance horizontal es <em>X = v₀x · t</em>.
              </p>
            </div>
          </>
        )}

        {activeTopic === 'movimiento_proyectiles' && (
          <>
            {/* Analytical Solver Card */}
            {onOpenProjectileMotionSolver && (
              <div
                className="solver-promo-card"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}
                onClick={() => {
                  onOpenProjectileMotionSolver();
                  onClose();
                }}
                title="Abrir Solucionador de Problemas de Movimiento de Proyectiles HT02"
              >
                <div className="solver-promo-badge">Colegio Kinal • Física II</div>
                <h4 className="solver-promo-title">Solucionador Movimiento de Proyectiles (HT02)</h4>
                <p className="solver-promo-desc">
                  10 Problemas resueltos paso a paso con fórmulas completas, 7 preguntas conceptuales autocorregidas y calculadora 2D de alcance y altura máxima.
                </p>
                <div className="solver-promo-action">
                  <span>Abrir Solucionador HT02</span>
                  <span className="arrow-icon">→</span>
                </div>
              </div>
            )}

            {/* Section 1: Cannon Launchers */}
            <div className="objects-section-heading">
              <span className="section-title">Cañones Lanzadores de Laboratorio</span>
              <span className="section-formula">θ & v₀</span>
            </div>

            <p className="objects-guide-text">
              Haz clic para insertar o arrastra directamente al lienzo:
            </p>

            <div className="preset-cards-list">
              {cannonLauncherDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="formal-preset-card"
                  style={{ borderLeftColor: '#8b5cf6' }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'cannon_launcher', preset)}
                  onClick={() => onAddPhysicsObject('cannon_launcher', preset)}
                  title="Haz clic para añadir o arrastra al lienzo"
                >
                  <div className="preset-card-main">
                    <div className="preset-card-header">
                      <span className="preset-card-name">{preset.label}</span>
                      <span className="preset-metric-tag" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
                        θ = {preset.angleDeg}° | v₀ = {preset.initialVelocity}m/s
                      </span>
                    </div>
                    <span className="preset-card-desc">
                      Cañón graduado con transportador de ángulos y elevación ajustable
                    </span>
                  </div>
                  <button
                    type="button"
                    className="preset-add-btn"
                    title="Añadir al lienzo"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('cannon_launcher', preset);
                    }}
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            {/* Section 2: Oblique Projectiles */}
            <div className="objects-section-heading">
              <span className="section-title">Proyectiles Parabólicos (2D)</span>
              <span className="section-formula">v_x = cte | v_y(t) = v₀y - gt</span>
            </div>

            <div className="preset-cards-list">
              {obliqueProjectileDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="formal-preset-card"
                  style={{ borderLeftColor: preset.color || '#8b5cf6' }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'oblique_projectile', preset)}
                  onClick={() => onAddPhysicsObject('oblique_projectile', preset)}
                  title="Haz clic para añadir o arrastra al lienzo"
                >
                  <div className="preset-card-main">
                    <div className="preset-card-header">
                      <span className="preset-card-name">{preset.label}</span>
                      <span className="preset-metric-tag" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
                        {preset.angleDeg}° • {preset.initialVelocity} m/s
                      </span>
                    </div>
                    <span className="preset-card-desc">
                      Esfera violeta metálica con descomposición vectorial v⃗, vx, vy y trazado parabólico
                    </span>
                  </div>
                  <button
                    type="button"
                    className="preset-add-btn"
                    title="Añadir al lienzo"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('oblique_projectile', preset);
                    }}
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            {/* Section 3: Targets and Walls */}
            <div className="objects-section-heading">
              <span className="section-title">Dianas y Muros Objetivo</span>
              <span className="section-formula">Obstáculos y Receptores</span>
            </div>

            <div className="preset-cards-list">
              {targetWallDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="formal-preset-card"
                  style={{ borderLeftColor: preset.color || '#475569' }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'target_wall', preset)}
                  onClick={() => onAddPhysicsObject('target_wall', preset)}
                  title="Haz clic para añadir o arrastra al lienzo"
                >
                  <div className="preset-card-main">
                    <div className="preset-card-header">
                      <span className="preset-card-name">{preset.label}</span>
                      <span className="preset-metric-tag">
                        d = {preset.distanceMeters}m | h = {preset.targetHeightMeters}m
                      </span>
                    </div>
                    <span className="preset-card-desc">
                      Muro con diana de impacto para problemas de alcance y tiro con obstáculo
                    </span>
                  </div>
                  <button
                    type="button"
                    className="preset-add-btn"
                    title="Añadir al lienzo"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('target_wall', preset);
                    }}
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            {/* Informative Theory Box */}
            <div className="objects-info-note" style={{ background: '#faf5ff', borderColor: '#e9d5ff' }}>
              <span className="info-note-label" style={{ color: '#7e22ce' }}>Fundamento Teórico Movimiento de Proyectiles (HT02)</span>
              <p className="info-note-text">
                En el <strong>Tiro Parabólico Oblicuo</strong>, el movimiento se desacopla en dos componentes independientes (Principio de Superposición de Galileo):
                horizontalmente es un <strong>MRU</strong> (<em>v_x = v₀·cosθ = cte</em>, <em>x = v₀·cosθ·t</em>) y verticalmente es un <strong>MRUV / Tiro Vertical</strong> (<em>v_y = v₀·sinθ - g·t</em>, <em>y = v₀·sinθ·t - ½g·t²</em>). En el punto de máxima altura (ápice), <em>v_y = 0</em> y la velocidad total es puramente horizontal: <em>v = v_x</em>.
              </p>
            </div>
          </>
        )}

        {activeTopic === 'mcu' && (
          <>
            {/* Analytical Solver Card */}
            {onOpenMcuSolver && (
              <div
                className="solver-promo-card solver-promo-mcu"
                onClick={() => {
                  if (onClose) onClose();
                  onOpenMcuSolver();
                }}
                title="Abrir Solucionador de Problemas de MCU HT03"
              >
                <div className="solver-promo-badge">Colegio Kinal • Física II</div>
                <h4 className="solver-promo-title">Solucionador MCU (HT03)</h4>
                <p className="solver-promo-desc">
                  10 Problemas resueltos paso a paso con fórmulas completas, 9 preguntas conceptuales autocorregidas y calculadora interactiva de velocidad angular y aceleración centrípeta.
                </p>
                <div className="solver-promo-action">
                  <span>Abrir Solucionador HT03</span>
                  <span className="arrow-icon">→</span>
                </div>
              </div>
            )}

            {/* Section 1: Turntables / Rotors */}
            <div className="objects-section-heading">
              <span className="section-title">Plataformas y Rotores Giratorios</span>
              <span className="section-formula">ω = cte</span>
            </div>

            <p className="objects-guide-text">
              Haz clic para insertar o arrastra directamente al lienzo:
            </p>

            <div className="preset-cards-list">
              {mcuTurntableDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="formal-preset-card"
                  style={{ borderLeftColor: preset.color }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'mcu_turntable', preset)}
                  onClick={() => onAddPhysicsObject('mcu_turntable', preset)}
                  title="Haz clic para añadir o arrastra al lienzo"
                >
                  <div className="preset-card-main">
                    <div className="preset-card-header">
                      <span className="preset-card-name">{getCleanLabel(preset.label)}</span>
                      <span className="preset-metric-tag">{preset.omega} rad/s</span>
                    </div>
                    <span className="preset-card-desc">
                      Radio: {preset.radiusMeters} m • Frecuencia: {preset.rpm} RPM
                    </span>
                  </div>
                  <button
                    type="button"
                    className="add-preset-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('mcu_turntable', preset);
                    }}
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            {/* Section 2: Orbiting Particles */}
            <div className="objects-section-heading">
              <span className="section-title">Partículas y Masas en Órbita</span>
              <span className="section-formula">v = ω·r | ac = ω²·r</span>
            </div>

            <p className="objects-guide-text">
              Móviles circulares con vectores de velocidad tangencial y aceleración centrípeta:
            </p>

            <div className="preset-cards-list">
              {mcuParticleDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="formal-preset-card"
                  style={{ borderLeftColor: preset.color }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'mcu_particle', preset)}
                  onClick={() => onAddPhysicsObject('mcu_particle', preset)}
                  title="Haz clic para añadir o arrastra al lienzo"
                >
                  <div className="preset-card-main">
                    <div className="preset-card-header">
                      <span className="preset-card-name">{getCleanLabel(preset.label)}</span>
                      <span className="preset-metric-tag">{(preset.omega * preset.radiusMeters).toFixed(1)} m/s</span>
                    </div>
                    <span className="preset-card-desc">
                      ω: {preset.omega} rad/s • ac: {(preset.omega * preset.omega * preset.radiusMeters).toFixed(1)} m/s²
                    </span>
                  </div>
                  <button
                    type="button"
                    className="add-preset-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('mcu_particle', preset);
                    }}
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            {/* Theoretical note */}
            <div className="objects-info-note" style={{ background: '#f0f9ff', borderColor: '#bae6fd' }}>
              <span className="info-note-label" style={{ color: '#0284c7' }}>Fundamento Teórico MCU (HT03)</span>
              <p className="info-note-text">
                En el <strong>Movimiento Circular Uniforme</strong>, la rapidez lineal es rigurosamente constante (<em>v = cte</em>).
                Sin embargo, la dirección del vector velocidad cambia continuamente, produciendo una <strong>aceleración centrípeta</strong> (<em>ac = v²/r = ω²·r</em>) dirigida perpendicularmente hacia el eje central.
                El período es el tiempo de 1 revolución (<em>T = 2π/ω</em>) y la frecuencia es su recíproco (<em>f = 1/T</em>).
              </p>
            </div>
          </>
        )}

        {activeTopic === 'mcuv' && (
          <>
            {/* Analytical Solver Card */}
            {onOpenMcuvSolver && (
              <div
                className="solver-promo-card solver-promo-mcuv"
                onClick={() => {
                  if (onClose) onClose();
                  onOpenMcuvSolver();
                }}
                title="Abrir Solucionador de Problemas de MCUV Unidad 2"
                style={{ borderColor: '#a5f3fc', background: '#f0fdfa' }}
              >
                <div className="solver-promo-badge" style={{ background: '#cffafe', color: '#0e7490' }}>Colegio Kinal • Unidad 2</div>
                <h4 className="solver-promo-title">Solucionador MCUV (Acelerado)</h4>
                <p className="solver-promo-desc">
                  15 Problemas de aplicación (#11-#25) resueltos paso a paso, 10 preguntas conceptuales evaluadas y calculadora universal (α, ω₀, ωf, Δθ, t, at, ac, atotal).
                </p>
                <div className="solver-promo-action">
                  <span style={{ color: '#0891b2', fontWeight: 700, fontSize: '0.72rem' }}>Abrir Solucionador Unidad 2</span>
                  <span className="arrow-icon" style={{ color: '#0891b2', marginLeft: 4 }}>→</span>
                </div>
              </div>
            )}

            {/* Quick Assembly / Lab Setup */}
            {handleAddAssembly && (
              <div className="assembly-quick-card" style={{ border: '1px solid #67e8f9', background: '#ecfeff', padding: '10px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0e7490' }}>Montaje de Laboratorio MCUV</div>
                  <div style={{ fontSize: '0.68rem', color: '#155e75' }}>Disco rotatorio + partícula sincronizada</div>
                </div>
                <button
                  type="button"
                  className="add-preset-btn"
                  style={{ background: '#0891b2', color: '#ffffff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => {
                    handleAddAssembly('mcuv_assembly');
                    if (onClose) onClose();
                  }}
                >
                  Insertar
                </button>
              </div>
            )}

            {/* Section 1: MCUV Turntables / Rotors */}
            <div className="objects-section-heading">
              <span className="section-title">Discos y Rotores con Aceleración</span>
              <span className="section-formula">ω(t) = ω₀ + α·t</span>
            </div>

            <p className="objects-guide-text">
              Haz clic para insertar o arrastra directamente al lienzo:
            </p>

            <div className="preset-cards-list">
              {mcuvTurntableDef?.presets?.map((preset, idx) => (
                <div
                  key={idx}
                  className="formal-preset-card"
                  style={{ borderLeftColor: preset.color || '#0891b2' }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'mcuv_turntable', preset)}
                  onClick={() => onAddPhysicsObject('mcuv_turntable', preset)}
                  title="Haz clic para añadir o arrastra al lienzo"
                >
                  <div className="preset-card-main">
                    <div className="preset-card-header">
                      <span className="preset-card-name">{getCleanLabel(preset.label)}</span>
                      <span className="preset-metric-tag">α = {preset.alpha} rad/s²</span>
                    </div>
                    <span className="preset-card-desc">
                      ω₀: {preset.omega0} rad/s ({preset.rpm0} RPM) • R: {preset.radiusMeters} m
                    </span>
                  </div>
                  <button
                    type="button"
                    className="add-preset-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('mcuv_turntable', preset);
                    }}
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            {/* Section 2: MCUV Orbiting Particles */}
            <div className="objects-section-heading">
              <span className="section-title">Móviles con Aceleración Total</span>
              <span className="section-formula">at = α·r | atot = √(at² + ac²)</span>
            </div>

            <p className="objects-guide-text">
              Móviles circulares acelerados con descomposición vectorial completa:
            </p>

            <div className="preset-cards-list">
              {mcuvParticleDef?.presets?.map((preset, idx) => (
                <div
                  key={idx}
                  className="formal-preset-card"
                  style={{ borderLeftColor: preset.color || '#06b6d4' }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'mcuv_particle', preset)}
                  onClick={() => onAddPhysicsObject('mcuv_particle', preset)}
                  title="Haz clic para añadir o arrastra al lienzo"
                >
                  <div className="preset-card-main">
                    <div className="preset-card-header">
                      <span className="preset-card-name">{getCleanLabel(preset.label)}</span>
                      <span className="preset-metric-tag">at = {(preset.alpha * preset.radiusMeters).toFixed(2)} m/s²</span>
                    </div>
                    <span className="preset-card-desc">
                      ω₀: {preset.omega0} rad/s • α: {preset.alpha} rad/s² • R: {preset.radiusMeters} m
                    </span>
                  </div>
                  <button
                    type="button"
                    className="add-preset-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('mcuv_particle', preset);
                    }}
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            {/* Theoretical note */}
            <div className="objects-info-note" style={{ background: '#ecfeff', borderColor: '#a5f3fc' }}>
              <span className="info-note-label" style={{ color: '#0891b2' }}>Fundamento Teórico MCUV (Unidad 2 Kinal)</span>
              <p className="info-note-text">
                En el <strong>Movimiento Circular Uniformemente Variado (MCUV / MCUA)</strong> la aceleración angular es constante (<em>α = cte</em>).
                La aceleración lineal total de la partícula se compone de dos vectores perpendiculares:
                la <strong>aceleración tangencial</strong> (<em>at = α·r</em>) que modifica la magnitud de la rapidez tangencial, y la <strong>aceleración centrípeta o normal</strong> (<em>ac = vt²/r = ω²·r</em>) que modifica la dirección del movimiento hacia el centro.
                La resultante es <em>atot = √(at² + ac²)</em>.
              </p>
            </div>
          </>
        )}

        {activeTopic === 'mechanics' && (
          <>
            {/* Section 1: Masses */}
            <div className="objects-section-heading">
              <span className="section-title">Masas y Cuerpos Rígidos</span>
              <span className="section-formula">Inercia & Peso</span>
            </div>

            <p className="objects-guide-text">
              Haz clic para insertar o arrastra directamente al lienzo:
            </p>

            <div className="preset-cards-list">
              {massDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="formal-preset-card"
                  style={{ borderLeftColor: preset.color }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'mass', preset)}
                  onClick={() => onAddPhysicsObject('mass', preset)}
                  title="Haz clic para añadir o arrastra al lienzo"
                >
                  <div className="preset-card-main">
                    <div className="preset-card-header">
                      <span className="preset-card-name">{preset.label}</span>
                      <span className="preset-metric-tag">{preset.mass} kg</span>
                    </div>
                    <span className="preset-card-desc">
                      Inercia: {preset.mass} kg • Fuerza peso: {(preset.mass * 9.8).toFixed(0)} N
                    </span>
                  </div>
                  <button
                    type="button"
                    className="preset-add-btn"
                    title="Añadir al lienzo"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('mass', preset);
                    }}
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            {/* Section 2: Pulleys */}
            <div className="objects-section-heading">
              <span className="section-title">Poleas y Transmisión</span>
              <span className="section-formula">Redirección Ideal</span>
            </div>

            <div className="preset-cards-list">
              {pulleyDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="formal-preset-card"
                  style={{ borderLeftColor: '#475569' }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'pulley', preset)}
                  onClick={() => onAddPhysicsObject('pulley', preset)}
                  title="Haz clic para añadir o arrastra al lienzo"
                >
                  <div className="preset-card-main">
                    <div className="preset-card-header">
                      <span className="preset-card-name">{preset.label}</span>
                      <span className="preset-metric-tag">{preset.isStatic ? 'Fija' : 'Móvil'}</span>
                    </div>
                    <span className="preset-card-desc">
                      {preset.isStatic ? 'Anclaje superior fijo • Redirección de tensión' : 'Polea móvil libre • Ventaja mecánica'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="preset-add-btn"
                    title="Añadir al lienzo"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('pulley', preset);
                    }}
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            {/* Section 3: Connections / Rope */}
            <div className="objects-section-heading">
              <span className="section-title">Cuerdas y Enlaces Físicos</span>
              <span className="section-formula">Tensión Dinámica</span>
            </div>

            <div className="formal-preset-card" style={{ borderLeftColor: '#2563eb' }}>
              <div className="preset-card-main">
                <div className="preset-card-header">
                  <span className="preset-card-name">Herramienta de Cuerda Ideal</span>
                  <span className="preset-metric-tag">Conector</span>
                </div>
                <span className="preset-card-desc">
                  Une puntos de anclaje de masas y poleas para transmitir tensión continua.
                </span>
              </div>
              {onSelectRopeTool && (
                <button
                  type="button"
                  className="preset-add-btn"
                  onClick={() => {
                    onSelectRopeTool();
                    onClose();
                  }}
                  title="Activar herramienta de cuerda"
                >
                  Activar
                </button>
              )}
            </div>

            {/* Informative Theory Box */}
            <div className="objects-info-note">
              <span className="info-note-label">Fundamento Teórico</span>
              <p className="info-note-text">
                Las conexiones modelan cuerdas inextensibles sin masa. El acoplamiento entre poleas y masas calcula la aceleración del sistema mediante la <strong>Segunda Ley de Newton</strong> (<em>ΣF = m·a</em>).
              </p>
            </div>
          </>
        )}
      </div>

      <style>{`
        .physics-objects-drawer {
          position: absolute;
          left: calc(100% + 14px);
          top: 0;
          width: 380px;
          max-height: calc(100vh - 90px);
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12), 0 2px 6px rgba(15, 23, 42, 0.04);
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          z-index: 60;
          animation: contextFadeIn 0.14s ease-out;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .drawer-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 14px 18px 12px;
          border-bottom: 1px solid #f1f5f9;
        }

        .drawer-header-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .objects-badge {
          display: inline-block;
          align-self: flex-start;
          font-size: 0.62rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #2563eb;
          background: #eff6ff;
          padding: 2px 7px;
          border-radius: 4px;
        }

        .drawer-title {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.01em;
        }

        .drawer-close-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.12s, color 0.12s;
        }

        .drawer-close-btn:hover {
          background-color: #f1f5f9;
          color: #0f172a;
        }

        /* Grid Topic Selector: All 7 topics visible */
        .topic-grid-control {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          padding: 8px 12px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .topic-grid-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 7px 6px;
          border-radius: 7px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          font-size: 0.72rem;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all 0.12s ease;
          text-align: center;
          white-space: nowrap;
        }

        .topic-grid-btn:hover {
          color: #0f172a;
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .topic-grid-btn.active {
          color: #ffffff !important;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          font-weight: 700;
        }

        .topic-grid-btn.active .topic-grid-icon {
          color: #ffffff !important;
        }

        .topic-grid-icon {
          flex-shrink: 0;
          transition: color 0.12s ease;
        }

        .topic-grid-label {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .active-topic-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 14px;
          background: #f1f5f9;
          border-bottom: 1px solid #e2e8f0;
        }

        .active-topic-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .active-topic-title {
          font-size: 0.74rem;
          font-weight: 700;
          color: #0f172a;
        }

        .active-topic-tag {
          font-size: 0.62rem;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
          background: #e2e8f0;
          color: #475569;
        }

        .objects-scroll-area {
          flex: 1;
          overflow-y: auto;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .objects-scroll-area::-webkit-scrollbar {
          width: 5px;
        }

        .objects-scroll-area::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .objects-scroll-area::-webkit-scrollbar-track {
          background: transparent;
        }

        .solver-promo-card {
          padding: 12px 14px;
          border-radius: 8px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          cursor: pointer;
          transition: all 0.14s ease;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .solver-promo-card:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
          box-shadow: 0 3px 10px rgba(15, 23, 42, 0.06);
          transform: translateY(-1px);
        }

        .solver-promo-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .solver-kicker {
          font-size: 0.62rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #0284c7;
        }

        .solver-tag {
          font-size: 0.62rem;
          font-weight: 600;
          color: #0369a1;
          background: #e0f2fe;
          padding: 1px 6px;
          border-radius: 3px;
        }

        .solver-promo-title {
          margin: 2px 0 0;
          font-size: 0.84rem;
          font-weight: 700;
          color: #0f172a;
        }

        .solver-promo-desc {
          margin: 0;
          font-size: 0.7rem;
          color: #64748b;
          line-height: 1.35;
        }

        .solver-promo-action {
          margin-top: 4px;
          display: flex;
          justify-content: flex-end;
        }

        .solver-action-text {
          font-size: 0.72rem;
          font-weight: 700;
          color: #0284c7;
        }

        .solver-promo-card.vertical {
          border-color: #ddd6fe;
          background: #fdfcff;
        }

        .solver-promo-card.vertical:hover {
          background: #f5f3ff;
          border-color: #c4b5fd;
          box-shadow: 0 3px 10px rgba(124, 58, 237, 0.08);
        }

        .solver-kicker.vertical {
          color: #7c3aed;
        }

        .solver-tag.vertical {
          background: #f5f3ff;
          color: #6d28d9;
        }

        .solver-action-text.vertical {
          color: #7c3aed;
        }

        .objects-info-note.vertical {
          border-left-color: #8b5cf6;
        }

        .info-note-label.vertical {
          color: #7c3aed;
        }

        .solver-promo-card.horizontal {
          border-color: #bae6fd;
          background: #f0f9ff;
        }

        .solver-promo-card.horizontal:hover {
          background: #e0f2fe;
          border-color: #7dd3fc;
          box-shadow: 0 3px 10px rgba(2, 132, 199, 0.1);
        }

        .solver-kicker.horizontal {
          color: #0284c7;
        }

        .solver-tag.horizontal {
          background: #e0f2fe;
          color: #0369a1;
        }

        .solver-action-text.horizontal {
          color: #0284c7;
        }

        .objects-info-note.horizontal {
          border-left-color: #0284c7;
        }

        .info-note-label.horizontal {
          color: #0284c7;
        }

        .objects-section-heading {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          padding-bottom: 4px;
          border-bottom: 1px solid #f1f5f9;
          margin-top: 4px;
        }

        .section-title {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #334155;
        }

        .section-formula {
          font-size: 0.67rem;
          font-weight: 500;
          color: #64748b;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .objects-guide-text {
          font-size: 0.7rem;
          color: #64748b;
          line-height: 1.35;
          margin: -4px 0 2px;
        }

        .preset-cards-list {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .formal-preset-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 9px 12px;
          border-radius: 7px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-left-width: 4px;
          cursor: grab;
          transition: all 0.12s ease;
        }

        .formal-preset-card:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
        }

        .formal-preset-card:active {
          cursor: grabbing;
        }

        .preset-card-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }

        .preset-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .preset-card-name {
          font-size: 0.78rem;
          font-weight: 700;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .preset-metric-tag {
          font-size: 0.67rem;
          font-weight: 600;
          color: #334155;
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .preset-card-desc {
          font-size: 0.67rem;
          color: #64748b;
          line-height: 1.25;
        }

        .preset-add-btn {
          padding: 5px 10px;
          border-radius: 5px;
          background: #f8fafc;
          color: #334155;
          border: 1px solid #cbd5e1;
          font-size: 0.69rem;
          font-weight: 600;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.12s ease;
        }

        .preset-add-btn:hover {
          background: #0f172a;
          color: #ffffff;
          border-color: #0f172a;
        }

        .objects-info-note {
          display: flex;
          flex-direction: column;
          gap: 3px;
          padding: 9px 12px;
          background: #f8fafc;
          border-radius: 7px;
          border: 1px solid #e2e8f0;
          border-left: 3px solid #3b82f6;
          margin-top: 4px;
        }

        .info-note-label {
          font-size: 0.64rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #2563eb;
        }

        .info-note-text {
          font-size: 0.68rem;
          color: #475569;
          line-height: 1.35;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
