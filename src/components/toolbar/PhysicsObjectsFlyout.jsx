import React, { useState, useEffect } from 'react';
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
  RotateCw,
  Disc,
  GitFork,
  Scale,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { PHYSICS_TOPICS, PHYSICS_OBJECT_DEFINITIONS } from '../../physics/physicsRegistry';
import { loadTeacherCustomExamples, deleteTeacherCustomExample } from '../../services/customExampleBuilder';

const TOPIC_CONFIG = {
  mru: { icon: Gauge, short: 'MRU', tag: 'HT01', color: '#2563eb' },
  mruv: { icon: TrendingUp, short: 'MRUV', tag: 'HT02', color: '#d97706' },
  freefall: { icon: ArrowDownCircle, short: 'Caída Libre', tag: 'HT03', color: '#16a34a' },
  tiro_vertical: { icon: ArrowUpCircle, short: 'Tiro Vertical', tag: 'HT04', color: '#db2777' },
  lanzamiento_horizontal: { icon: Navigation, short: 'Lanz. Horiz.', tag: 'HT01 2D', color: '#0891b2' },
  movimiento_proyectiles: { icon: Target, short: 'Proyectiles', tag: 'HT02 2D', color: '#8b5cf6' },
  mcu: { icon: RotateCw, short: 'MCU', tag: 'HT03 MCU', color: '#0284c7' },
  mcuv: { icon: RotateCw, short: 'MCUV', tag: 'Unidad 2', color: '#0891b2' },
  poleas_mcu: { icon: Disc, short: 'Poleas MCU', tag: 'HT01 U3', color: '#059669' },
  dcl: { icon: GitFork, short: 'D.C.L.', tag: 'HT02', color: '#ea580c' },
  equilibrio: { icon: Scale, short: 'Equilibrio', tag: 'HT03', color: '#059669' },
  segunda_ley_newton: { icon: Weight, short: '2ª Ley Newton', tag: 'HT01 U4', color: '#2563eb' },
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
  onOpenPoleasMcuSolver,
  onOpenDclSolver,
  onOpenEquilibrioSolver,
  onOpenNewtonSolver,
  onOpenCustomExampleBuilder,
  onMountCustomExample,
}) {
  const [activeTopic, setActiveTopic] = useState('mru');
  const [customExamples, setCustomExamples] = useState([]);
  const handleAddAssembly = onAddAssembly || _onAddAssembly;

  useEffect(() => {
    if (isOpen) {
      setCustomExamples(loadTeacherCustomExamples());
    }
  }, [isOpen]);

  const handleDeleteCustomExample = (id) => {
    const updated = deleteTeacherCustomExample(id);
    setCustomExamples(updated);
  };

  const handleDragCustomExample = (e, customExample) => {
    e.dataTransfer.setData(
      'application/teacher-custom-example',
      JSON.stringify(customExample)
    );
    e.dataTransfer.effectAllowed = 'copy';
  };

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
  const poleasSystemDef = PHYSICS_OBJECT_DEFINITIONS.mcu_pulley_system;
  const dclDiagramDef = PHYSICS_OBJECT_DEFINITIONS.dcl_diagram;
  const translationalEquilibriumDef = PHYSICS_OBJECT_DEFINITIONS.translational_equilibrium;
  const newtonFrictionlessDef = PHYSICS_OBJECT_DEFINITIONS.newton_frictionless_system;
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
    if (!label || typeof label !== 'string') return '';
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

      {/* Topic Grid: only rendered when multiple topics are active */}
      {PHYSICS_TOPICS.filter((t) => t.active).length > 1 && (
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
      )}

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
        {/* Prominent Teacher Custom Example Creator Banner */}
        <div className="teacher-custom-cta-wrap">
          <button
            type="button"
            className="teacher-custom-cta-btn"
            onClick={() => {
              if (onOpenCustomExampleBuilder) {
                onOpenCustomExampleBuilder(activeTopic);
              }
            }}
            title={`Crear un ejemplo personalizado de ${TOPIC_CONFIG[activeTopic]?.short || 'Física'}`}
          >
            <div
              className="teacher-cta-icon-box"
              style={{
                background: `${TOPIC_CONFIG[activeTopic]?.color || '#2563eb'}18`,
                color: TOPIC_CONFIG[activeTopic]?.color || '#2563eb',
              }}
            >
              <Sparkles size={16} />
            </div>
            <div className="teacher-cta-text-col">
              <span className="teacher-cta-main-text">
                + Crear Ejemplo de {TOPIC_CONFIG[activeTopic]?.short || 'Física'}
              </span>
              <span className="teacher-cta-sub-text">
                Configura tus propios valores y objetos funcionales
              </span>
            </div>
            <span
              className="teacher-cta-badge"
              style={{ background: TOPIC_CONFIG[activeTopic]?.color || '#2563eb' }}
            >
              Docente
            </span>
          </button>
        </div>

        {/* Section: Mis Ejemplos Personalizados del Profesor para este tema */}
        {(() => {
          const topicSavedExamples = customExamples.filter((ex) => ex.topic === activeTopic);
          if (topicSavedExamples.length === 0) return null;
          return (
            <div className="teacher-custom-section">
              <div className="objects-section-heading">
                <span className="section-title">⭐ Mis Ejemplos ({topicSavedExamples.length})</span>
                <span className="section-formula">Configurados por el Profesor</span>
              </div>
              <div className="preset-cards-list">
                {topicSavedExamples.map((item) => (
                  <div
                    key={item.id}
                    className="formal-preset-card teacher-saved-card"
                    style={{ borderLeftColor: item.config?.color || TOPIC_CONFIG[activeTopic]?.color || '#2563eb' }}
                    draggable
                    onDragStart={(e) => handleDragCustomExample(e, item)}
                    onClick={() => {
                      if (onMountCustomExample) {
                        onMountCustomExample(item);
                        if (onClose) onClose();
                      }
                    }}
                    title="Haz clic para añadir a la pizarra o arrastra"
                  >
                    <div className="preset-card-main">
                      <div className="preset-card-header">
                        <span className="preset-card-name">{item.title}</span>
                        <span
                          className="preset-metric-tag"
                          style={{
                            color: TOPIC_CONFIG[activeTopic]?.color || '#2563eb',
                            background: `${TOPIC_CONFIG[activeTopic]?.color || '#2563eb'}18`,
                          }}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <span className="preset-card-desc">{item.summary}</span>
                    </div>
                    <div className="teacher-card-actions">
                      <button
                        type="button"
                        className="preset-add-btn"
                        title="Añadir al lienzo"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onMountCustomExample) {
                            onMountCustomExample(item);
                            if (onClose) onClose();
                          }
                        }}
                      >
                        Añadir
                      </button>
                      <button
                        type="button"
                        className="teacher-card-del-btn"
                        title="Eliminar este ejemplo"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomExample(item.id);
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

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

        {activeTopic === 'poleas_mcu' && (
          <>
            {/* Analytical Solver Card */}
            {onOpenPoleasMcuSolver && (
              <div
                className="solver-promo-card solver-promo-poleas"
                onClick={() => {
                  if (onClose) onClose();
                  onOpenPoleasMcuSolver();
                }}
                title="Abrir Solucionador Oficial HT01 U3 - Poleas MCU"
                style={{ borderColor: '#6ee7b7', background: '#f0fdf4' }}
              >
                <div className="solver-promo-badge" style={{ background: '#d1fae5', color: '#065f46' }}>
                  Colegio Kinal • Unidad 3 HT01
                </div>
                <h4 className="solver-promo-title" style={{ color: '#065f46' }}>
                  Solucionador Poleas MCU (Transmisiones)
                </h4>
                <p className="solver-promo-desc">
                  9 Problemas de aplicación (#1-#9) resueltos con pasos exactos, 5 preguntas conceptuales evaluadas y calculadora de transmisiones cinemáticas (v₁=v₂, ω₁=ω₂, trenes compuestos).
                </p>
                <div className="solver-promo-action">
                  <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.72rem' }}>
                    Abrir Solucionador HT01
                  </span>
                  <span className="arrow-icon" style={{ color: '#059669', marginLeft: 4 }}>→</span>
                </div>
              </div>
            )}

            {/* Quick Assembly / Lab Setup */}
            {handleAddAssembly && (
              <div
                className="assembly-quick-card"
                style={{
                  border: '1px solid #6ee7b7',
                  background: '#ecfdf5',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#065f46' }}>
                    Banco de Transmisión por Poleas
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#047857' }}>
                    Transmisión con faja + tacómetro digital de entrada
                  </div>
                </div>
                <button
                  type="button"
                  className="add-preset-btn"
                  style={{
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    handleAddAssembly('poleas_mcu_assembly');
                    if (onClose) onClose();
                  }}
                >
                  Insertar
                </button>
              </div>
            )}

            {/* Section: Pulley Systems & Transmissions */}
            <div className="objects-section-heading">
              <span className="section-title">Sistemas de Transmisión por Poleas</span>
              <span className="section-formula">v₁ = v₂ | ω₁ = ω₂</span>
            </div>

            <p className="objects-guide-text">
              9 Configuraciones oficiales de la Hoja de Trabajo HT01 Kinal:
            </p>

            <div className="preset-cards-list">
              {poleasSystemDef?.presets?.map((preset, idx) => (
                <div
                  key={idx}
                  className="formal-preset-card"
                  style={{ borderLeftColor: preset.color || '#059669' }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'mcu_pulley_system', preset)}
                  onClick={() => onAddPhysicsObject('mcu_pulley_system', preset)}
                  title="Haz clic para añadir o arrastra al lienzo"
                >
                  <div className="preset-card-main">
                    <div className="preset-card-header">
                      <span className="preset-card-name">{getCleanLabel(preset.label)}</span>
                      <span className="preset-metric-tag" style={{ color: '#065f46', background: '#d1fae5' }}>
                        {preset.configuration === 'concentric' || preset.configuration === 'concentric_hanging_block'
                          ? 'Mismo Eje (ω=cte)'
                          : preset.configuration?.includes('compound') || preset.configuration === 'double_reduction'
                          ? 'Tren Reductor'
                          : 'Transmisión Faja (v=cte)'}
                      </span>
                    </div>
                    <span className="preset-card-desc">
                      R₁: {preset.radiusMeters1 ? (preset.radiusMeters1 >= 1 ? `${preset.radiusMeters1} m` : `${(preset.radiusMeters1 * 100).toFixed(1)} cm`) : '—'} • R₂: {preset.radiusMeters2 ? (preset.radiusMeters2 >= 1 ? `${preset.radiusMeters2} m` : `${(preset.radiusMeters2 * 100).toFixed(1)} cm`) : '—'} • ω₁: {preset.omega1} rad/s
                    </span>
                  </div>
                  <button
                    type="button"
                    className="add-preset-btn"
                    style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: '0.69rem', cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('mcu_pulley_system', preset);
                    }}
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            {/* Theoretical note */}
            <div className="objects-info-note" style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}>
              <span className="info-note-label" style={{ color: '#059669' }}>
                Fundamento Teórico: Poleas MCU (HT01 U3 Kinal)
              </span>
              <p className="info-note-text">
                1. <strong>Mismo Eje (Discos Concéntricos):</strong> Giran solidarios con idéntica rapidez angular y frecuencia (<em>ω₁ = ω₂</em>, <em>f₁ = f₂</em>). La rapidez lineal es proporcional al radio: <em>v = ω·r</em>.<br />
                2. <strong>Poleas Unidas por Faja / Correa:</strong> La faja inextensible transmite la misma rapidez tangencial lineal (<em>v₁ = v₂ = v_faja</em>). Se cumple la relación de transmisión inversa: <em>ω₁·r₁ = ω₂·r₂</em> (o <em>N₁·d₁ = N₂·d₂</em>).
              </p>
            </div>
          </>
        )}

        {activeTopic === 'dcl' && (
          <>
            {/* Analytical Solver Promo Card */}
            {onOpenDclSolver && (
              <div
                className="solver-promo-card solver-promo-dcl"
                onClick={() => {
                  if (onClose) onClose();
                  onOpenDclSolver();
                }}
                title="Abrir Solucionador Oficial HT02 - Diagramas de Cuerpo Libre"
                style={{ borderColor: '#fed7aa', background: '#fff7ed' }}
              >
                <div className="solver-promo-badge" style={{ background: '#ffedd5', color: '#9a3412' }}>
                  Colegio Kinal • Unidad 3 HT02
                </div>
                <h4 className="solver-promo-title" style={{ color: '#9a3412' }}>
                  Solucionador Fuerzas y D.C.L.
                </h4>
                <p className="solver-promo-desc">
                  11 Problemas de aplicación (#1-#11) con DCL interactivo de cada cuerpo, descomposición rectangular, 5 preguntas conceptuales evaluadas y reglas de oro de aislamiento.
                </p>
                <div className="solver-promo-action">
                  <span style={{ color: '#ea580c', fontWeight: 700, fontSize: '0.72rem' }}>
                    Abrir Solucionador HT02
                  </span>
                  <span className="arrow-icon" style={{ color: '#ea580c', marginLeft: 4 }}>→</span>
                </div>
              </div>
            )}

            {/* Quick Assembly / Lab Setup */}
            {handleAddAssembly && (
              <div
                className="assembly-quick-card"
                style={{
                  border: '1px solid #fed7aa',
                  background: '#fffaf5',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9a3412' }}>
                    Laboratorio Vectorial DCL
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#c2410c' }}>
                    Diagrama con ejes cartesianos, vectores y ecuaciones ΣF
                  </div>
                </div>
                <button
                  type="button"
                  className="add-preset-btn"
                  style={{
                    background: '#ea580c',
                    color: '#ffffff',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    handleAddAssembly('dcl_assembly');
                    if (onClose) onClose();
                  }}
                >
                  Insertar
                </button>
              </div>
            )}

            {/* Section: DCL Diagram Presets */}
            <div className="objects-section-heading">
              <span className="section-title">Modelos DCL de la Guía HT02</span>
              <span className="section-formula">ΣFx = m·ax | ΣFy = m·ay</span>
            </div>

            <p className="objects-guide-text">
              Arrastra o haz clic para colocar un Diagrama de Cuerpo Libre en la pizarra:
            </p>

            <div className="preset-card-list">
              {dclDiagramDef && dclDiagramDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="preset-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'dcl_diagram', preset)}
                  style={{ borderLeft: `3px solid ${preset.color || '#ea580c'}` }}
                  onClick={() => {
                    onAddPhysicsObject('dcl_diagram', preset);
                    if (onClose) onClose();
                  }}
                >
                  <div className="preset-card-main">
                    <div className="preset-card-header">
                      <span className="preset-card-name">{preset.label}</span>
                      <span className="preset-metric-tag" style={{ color: '#9a3412', background: '#ffedd5' }}>
                        P{preset.exerciseNumber}
                      </span>
                    </div>
                    <span className="preset-card-desc">
                      {preset.showOfficialSolution === false ? (
                        <>✨ <strong>Lienzo Limpio:</strong> Coloca tú mismo los vectores hacia la dirección que quieras</>
                      ) : preset.showOfficialSolution === true ? (
                        <>📐 <strong>Solución Oficial:</strong> Sistema resuelto con todos los vectores y aceleración</>
                      ) : (
                        <>Cuerpo: <strong>{preset.bodyName}</strong> • {preset.forces ? `${preset.forces.length} fuerzas concurrentes` : ''} {preset.axisAngleDeg ? `• Ejes rotados ${preset.axisAngleDeg}°` : ''}</>
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="add-preset-btn"
                    style={{ background: '#ea580c', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: '0.69rem', cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('dcl_diagram', preset);
                    }}
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            {/* Theoretical note */}
            <div className="objects-info-note" style={{ background: '#fffaf5', borderColor: '#fed7aa' }}>
              <span className="info-note-label" style={{ color: '#ea580c' }}>
                Reglas de Oro del Diagrama de Cuerpo Libre (HT02 Kinal)
              </span>
              <p className="info-note-text">
                1. <strong>Aislamiento estricto:</strong> Solo graficar fuerzas externas que el entorno ejerce <em>SOBRE</em> el cuerpo analizado (jamás las que el cuerpo ejerce sobre otros).<br />
                2. <strong>Clasificación:</strong> Identificar el origen físico: Peso (a distancia, siempre hacia el centro terrestre), Normal (contacto perpendicular), Tensión (a lo largo de cuerdas), Fricción (opuesta al deslizamiento).<br />
                3. <strong>Ejes rotados:</strong> En planos inclinados, rotar los ejes con el ángulo de la rampa para minimizar descomposiciones trigonométricas.
              </p>
            </div>
          </>
        )}

        {activeTopic === 'equilibrio' && (
          <>
            {/* Analytical Solver Promo Card */}
            {onOpenEquilibrioSolver && (
              <div
                className="solver-promo-card solver-promo-equilibrio"
                onClick={() => {
                  if (onClose) onClose();
                  onOpenEquilibrioSolver();
                }}
                title="Abrir Solucionador Oficial HT03 - Equilibrio Traslacional y Primera Ley de Newton"
                style={{ borderColor: '#a7f3d0', background: '#ecfdf5' }}
              >
                <div className="solver-promo-badge" style={{ background: '#d1fae5', color: '#047857' }}>
                  Colegio Kinal • Unidad 3 HT03
                </div>
                <h4 className="solver-promo-title" style={{ color: '#065f46' }}>
                  Solucionador Equilibrio Traslacional (ΣF = 0)
                </h4>
                <p className="solver-promo-desc">
                  8 Problemas oficiales (#1-#8) de poleas, nudos concurrentes, motor, semáforos y planos inclinados; evaluación de 5 preguntas conceptuales con justificación teórica.
                </p>
                <div className="solver-promo-action">
                  <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.72rem' }}>
                    Abrir Solucionador HT03
                  </span>
                  <span className="arrow-icon" style={{ color: '#059669', marginLeft: 4 }}>→</span>
                </div>
              </div>
            )}

            {/* Quick Assembly / Lab Setup */}
            {handleAddAssembly && (
              <div
                className="assembly-quick-card"
                style={{
                  border: '1px solid #a7f3d0',
                  background: '#f0fdf4',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#065f46' }}>
                    Aparato de Equilibrio Estático
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#047857' }}>
                    Montaje de laboratorio con cables, nudos concurrentes y pesas
                  </div>
                </div>
                <button
                  type="button"
                  className="add-preset-btn"
                  style={{
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    handleAddAssembly('equilibrio_assembly');
                    if (onClose) onClose();
                  }}
                >
                  Insertar
                </button>
              </div>
            )}

            {/* Section: Equilibrium Presets */}
            <div className="objects-section-heading">
              <span className="section-title">Aparatos de la Hoja de Trabajo HT03</span>
              <span className="section-formula">ΣFx = 0 | ΣFy = 0 (a = 0)</span>
            </div>

            <p className="objects-guide-text">
              Arrastra o haz clic para colocar un aparato en la pizarra (con o sin vectores):
            </p>

            <div className="preset-card-list">
              {translationalEquilibriumDef && translationalEquilibriumDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="preset-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'translational_equilibrium', preset)}
                  style={{ borderLeft: `3px solid ${preset.color || '#059669'}` }}
                  onClick={() => {
                    onAddPhysicsObject('translational_equilibrium', preset);
                    if (onClose) onClose();
                  }}
                >
                  <div className="preset-card-main">
                    <div className="preset-card-header">
                      <span className="preset-card-name">{preset.label}</span>
                      <span className="preset-metric-tag" style={{ color: '#047857', background: '#ecfdf5' }}>
                        P{preset.exerciseNumber}
                      </span>
                    </div>
                    <span className="preset-card-desc">
                      {preset.showOfficialSolution === false ? (
                        <>✨ <strong>Lienzo Limpio:</strong> Dibuja tú mismo los vectores hacia la dirección que quieras</>
                      ) : (
                        <>📐 <strong>Solución de Equilibrio:</strong> Fuerzas concurrentes resueltas con valores exactos</>
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="add-preset-btn"
                    style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: '0.69rem', cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('translational_equilibrium', preset);
                    }}
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            {/* Theoretical note */}
            <div className="objects-info-note" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
              <span className="info-note-label" style={{ color: '#059669' }}>
                Condiciones de Equilibrio Traslacional (Primera Ley de Newton)
              </span>
              <p className="info-note-text">
                1. <strong>Primera Condición:</strong> La sumatoria vectorial de todas las fuerzas debe anularse: <em>ΣFx = 0</em> y <em>ΣFy = 0</em>, lo que garantiza aceleración nula (<em>a = 0</em>).<br />
                2. <strong>Cables y Tensiones:</strong> Las fuerzas de tracción siempre tiran a lo largo de las cuerdas hacia los puntos de anclaje.<br />
                3. <strong>Poleas Ideales:</strong> Redirigen la dirección de la cuerda manteniendo constante la magnitud de la tensión.
              </p>
            </div>
          </>
        )}

        {activeTopic === 'segunda_ley_newton' && (
          <>
            {/* Quick Solver Card */}
            {onOpenNewtonSolver && (
              <div
                className="solver-quick-card"
                style={{
                  border: '1px solid #bfdbfe',
                  background: '#eff6ff',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  onOpenNewtonSolver();
                  if (onClose) onClose();
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1d4ed8' }}>
                    Solucionario Oficial HT01 U4
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#2563eb' }}>
                    Segunda Ley de Newton Sin Fricción • 12 Problemas y 4 Preguntas
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#1d4ed8' }}>
                    Abrir Solucionador HT01
                  </span>
                  <span className="arrow-icon" style={{ color: '#2563eb', marginLeft: 4 }}>→</span>
                </div>
              </div>
            )}

            {/* Quick Assembly / Lab Setup */}
            {handleAddAssembly && (
              <div
                className="assembly-quick-card"
                style={{
                  border: '1px solid #bfdbfe',
                  background: '#f8fafc',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b' }}>
                    Aparato de Bloques Conectados (HT01 P7)
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    Montaje con m₁=2kg, m₂=6kg, F=80N y cuerda con tensión T
                  </div>
                </div>
                <button
                  type="button"
                  className="add-preset-btn"
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    handleAddAssembly('newton_assembly');
                    if (onClose) onClose();
                  }}
                >
                  Insertar
                </button>
              </div>
            )}

            {/* Section: Newton Presets */}
            <div className="objects-section-heading">
              <span className="section-title">Sistemas Sin Fricción de la Hoja de Trabajo HT01</span>
              <span className="section-formula">a = ΣF / m | T = m₁·a</span>
            </div>

            <p className="objects-guide-text">
              Arrastra o haz clic para colocar un aparato en la pizarra (con o sin vectores):
            </p>

            <div className="preset-card-list">
              {newtonFrictionlessDef && newtonFrictionlessDef.presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="preset-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'newton_frictionless_system', preset)}
                  style={{ borderLeft: `3px solid ${preset.color || '#2563eb'}` }}
                  onClick={() => {
                    onAddPhysicsObject('newton_frictionless_system', preset);
                    if (onClose) onClose();
                  }}
                >
                  <div className="preset-card-main">
                    <div className="preset-card-header">
                      <span className="preset-card-name">{preset.label}</span>
                      <span className="preset-metric-tag" style={{ color: '#1d4ed8', background: '#eff6ff' }}>
                        P{preset.exerciseNumber}
                      </span>
                    </div>
                    <span className="preset-card-desc">
                      {preset.showOfficialSolution === false ? (
                        <>✨ <strong>Lienzo Limpio:</strong> Dibuja tú mismo los vectores hacia la dirección que quieras</>
                      ) : (
                        <>📐 <strong>Solución Oficial:</strong> Fuerzas aplicadas, tensión en cuerda y aceleración calculada</>
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="add-preset-btn"
                    style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: '0.69rem', cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPhysicsObject('newton_frictionless_system', preset);
                    }}
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>

            {/* Theoretical note */}
            <div className="objects-info-note" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
              <span className="info-note-label" style={{ color: '#1d4ed8' }}>
                Dinámica y Segunda Ley de Newton (Sin Fricción)
              </span>
              <p className="info-note-text">
                1. <strong>Segunda Ley Fundamental:</strong> La aceleración que experimenta un cuerpo es directamente proporcional a la fuerza neta e inversamente proporcional a la masa: <em>a = ΣF / m</em>.<br />
                2. <strong>Sistemas de Cuerpos Conectados:</strong> Ambos bloques comparten la misma aceleración (<em>a = F / (m₁ + m₂)</em>) y la cuerda transmite una tensión interna <em>T = m₁ · a</em>.<br />
                3. <strong>Superficie Lisa Ideal:</strong> Sin fricción (<em>μ = 0</em>), toda fuerza horizontal se traduce íntegramente en aceleración uniforme instantánea.
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

        .teacher-custom-cta-wrap {
          margin-bottom: 8px;
        }

        .teacher-custom-cta-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          background: #ffffff;
          border: 1.5px dashed #cbd5e1;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }

        .teacher-custom-cta-btn:hover {
          border-color: #0284c7;
          background: #f8fafc;
          box-shadow: 0 3px 10px rgba(2, 132, 199, 0.08);
          transform: translateY(-1px);
        }

        .teacher-cta-icon-box {
          width: 32px;
          height: 32px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .teacher-cta-text-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .teacher-cta-main-text {
          font-size: 0.76rem;
          font-weight: 700;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .teacher-cta-sub-text {
          font-size: 0.64rem;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .teacher-cta-badge {
          font-size: 0.62rem;
          font-weight: 700;
          color: #ffffff;
          padding: 2px 6px;
          border-radius: 4px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          flex-shrink: 0;
        }

        .teacher-custom-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 12px;
          padding: 8px 10px;
          background: #faf5ff;
          border: 1px solid #e9d5ff;
          border-radius: 9px;
        }

        .teacher-saved-card {
          border-color: #e9d5ff;
        }

        .teacher-card-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .teacher-card-del-btn {
          background: transparent;
          border: 1px solid #e2e8f0;
          color: #94a3b8;
          border-radius: 5px;
          padding: 5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.12s;
        }

        .teacher-card-del-btn:hover {
          background: #fee2e2;
          color: #ef4444;
          border-color: #fca5a5;
        }
      `}</style>
    </div>
  );
}
