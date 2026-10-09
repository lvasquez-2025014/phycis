import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Sparkles,
  Save,
  Play,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Layers,
  Calculator,
  Info,
  Gauge,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  Navigation,
  Target,
  RotateCw,
  Disc,
  GitFork,
  Scale,
  Weight,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import {
  TOPIC_PRESETS_METADATA,
  CART_TYPES_CATALOG,
  BODY_TYPES_CATALOG,
  calculateTopicPhysicsPreview,
  saveTeacherCustomExample,
} from '../../services/customExampleBuilder';
import { PHYSICS_TOPICS } from '../../physics/physicsRegistry';

const TOPIC_ICONS = {
  mru: Gauge,
  mruv: TrendingUp,
  freefall: ArrowDownCircle,
  tiro_vertical: ArrowUpCircle,
  lanzamiento_horizontal: Navigation,
  movimiento_proyectiles: Target,
  mcu: RotateCw,
  mcuv: RotateCw,
  poleas_mcu: Disc,
  dcl: GitFork,
  equilibrio: Scale,
  mechanics: Weight,
};

const COLOR_PALETTE = [
  '#0284c7', // Blue
  '#16a34a', // Emerald Green
  '#d97706', // Amber / Orange
  '#dc2626', // Red
  '#7c3aed', // Purple
  '#0891b2', // Cyan
  '#475569', // Slate
  '#ec4899', // Pink
];

export default function CustomExampleBuilderModal({
  isOpen,
  onClose,
  initialTopic = 'mru',
  onMountCustomExample,
  onNotify,
}) {
  const activeTopicIds = useMemo(() => {
    return new Set(PHYSICS_TOPICS.filter((t) => t.active).map((t) => t.id));
  }, []);

  const availableTopics = useMemo(() => {
    return Object.values(TOPIC_PRESETS_METADATA).filter((meta) => activeTopicIds.has(meta.id));
  }, [activeTopicIds]);

  const [selectedTopic, setSelectedTopic] = useState('mru');
  const [formData, setFormData] = useState({});

  // Sync topic when modal opens or initialTopic changes
  useEffect(() => {
    if (isOpen) {
      const topic = (initialTopic && TOPIC_PRESETS_METADATA[initialTopic] && activeTopicIds.has(initialTopic))
        ? initialTopic
        : (availableTopics[0]?.id || 'mru');
      setSelectedTopic(topic);
      if (TOPIC_PRESETS_METADATA[topic]) {
        setFormData(JSON.parse(JSON.stringify(TOPIC_PRESETS_METADATA[topic].defaultConfig)));
      }
    }
  }, [isOpen, initialTopic, activeTopicIds, availableTopics]);

  const currentTopicMeta = TOPIC_PRESETS_METADATA[selectedTopic] || TOPIC_PRESETS_METADATA.mru;

  const handleSelectTopic = (topicId) => {
    setSelectedTopic(topicId);
    setFormData(JSON.parse(JSON.stringify(TOPIC_PRESETS_METADATA[topicId].defaultConfig)));
  };

  const handleScenarioChange = (scenarioId) => {
    const isMru = selectedTopic === 'mru';
    const isMruv = selectedTopic === 'mruv';

    setFormData((prev) => {
      const next = { ...prev, scenarioType: scenarioId };

      if (isMru) {
        if (scenarioId === 'single') {
          next.carts = [
            {
              id: 'c1',
              label: 'Móvil A',
              cartType: 'standard',
              velocity: 3.0,
              mass: 1.5,
              positionX: 0.0,
              direction: 1,
              color: '#0284c7',
            },
          ];
          next.trackLength = 6.0;
        } else if (scenarioId === 'encounter') {
          next.trackLength = 10.0;
          next.carts = [
            {
              id: 'c1',
              label: 'Móvil A',
              cartType: 'standard',
              velocity: 3.0,
              mass: 1.5,
              positionX: 0.5,
              direction: 1, // Moving right
              color: '#0284c7',
            },
            {
              id: 'c2',
              label: 'Móvil B',
              cartType: 'sports',
              velocity: 2.0,
              mass: 1.2,
              positionX: 9.0,
              direction: -1, // Moving left (towards A)
              color: '#dc2626',
            },
          ];
        } else if (scenarioId === 'pursuit') {
          next.trackLength = 10.0;
          next.carts = [
            {
              id: 'c1',
              label: 'Móvil A (Perseguidor)',
              cartType: 'sports',
              velocity: 4.5,
              mass: 1.2,
              positionX: 0.5,
              direction: 1,
              color: '#16a34a',
            },
            {
              id: 'c2',
              label: 'Móvil B (Adelante)',
              cartType: 'truck',
              velocity: 2.0,
              mass: 3.5,
              positionX: 4.0,
              direction: 1,
              color: '#d97706',
            },
          ];
        } else if (scenarioId === 'race') {
          next.trackLength = 8.0;
          next.carts = [
            { id: 'c1', label: 'Móvil 1', cartType: 'standard', velocity: 2.0, mass: 1.5, positionX: 0.5, direction: 1, color: '#0284c7' },
            { id: 'c2', label: 'Móvil 2', cartType: 'sports', velocity: 4.0, mass: 1.2, positionX: 0.5, direction: 1, color: '#16a34a' },
            { id: 'c3', label: 'Móvil 3', cartType: 'truck', velocity: 1.0, mass: 3.5, positionX: 0.5, direction: 1, color: '#d97706' },
          ];
        }
      }

      if (isMruv) {
        if (scenarioId === 'single') {
          next.carts = [
            { id: 'c1', label: 'Móvil A', cartType: 'sports', initialVelocity: 1.0, acceleration: 2.0, mass: 1.5, positionX: 0.0, direction: 1, color: '#d97706' },
          ];
        } else if (scenarioId === 'braking') {
          next.carts = [
            { id: 'c1', label: 'Móvil en Frenado', cartType: 'truck', initialVelocity: 6.0, acceleration: -1.5, mass: 2.5, positionX: 0.5, direction: 1, color: '#dc2626' },
          ];
        } else if (scenarioId === 'encounter') {
          next.trackLength = 10.0;
          next.carts = [
            { id: 'c1', label: 'Móvil A (Acelera →)', cartType: 'standard', initialVelocity: 0.5, acceleration: 1.5, mass: 1.5, positionX: 0.5, direction: 1, color: '#0284c7' },
            { id: 'c2', label: 'Móvil B (Acelera ←)', cartType: 'sports', initialVelocity: 0.5, acceleration: 1.0, mass: 1.2, positionX: 9.0, direction: -1, color: '#dc2626' },
          ];
        } else if (scenarioId === 'pursuit') {
          next.trackLength = 10.0;
          next.carts = [
            { id: 'c1', label: 'Móvil A (Perseguidor)', cartType: 'sports', initialVelocity: 1.0, acceleration: 2.5, mass: 1.2, positionX: 0.5, direction: 1, color: '#16a34a' },
            { id: 'c2', label: 'Móvil B', cartType: 'standard', initialVelocity: 2.0, acceleration: 0.5, mass: 1.5, positionX: 3.5, direction: 1, color: '#d97706' },
          ];
        }
      }

      if (selectedTopic === 'freefall') {
        if (scenarioId === 'two_bodies') {
          next.bodies = [
            { id: 'b1', label: 'Esfera Pesada A', bodyType: 'lead_sphere', mass: 4.0, height: 45.0, initialVelocity: 0.0, color: '#64748b' },
            { id: 'b2', label: 'Pelota Ligera B', bodyType: 'tennis_ball', mass: 0.5, height: 45.0, initialVelocity: 0.0, color: '#84cc16' },
          ];
        } else {
          next.bodies = [
            { id: 'b1', label: 'Esfera A', bodyType: 'lead_sphere', mass: 2.0, height: 45.0, initialVelocity: scenarioId === 'thrown_down' ? 5.0 : 0.0, color: '#16a34a' },
          ];
        }
      }

      return next;
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Cart attributes modifier (for MRU / MRUV)
  const handleCartChange = (cartIndex, field, value) => {
    setFormData((prev) => {
      const nextCarts = [...(prev.carts || [])];
      if (nextCarts[cartIndex]) {
        nextCarts[cartIndex] = {
          ...nextCarts[cartIndex],
          [field]: value,
        };

        // If user changed cartType, adapt default mass/color if desired
        if (field === 'cartType' && CART_TYPES_CATALOG[value]) {
          const typeCat = CART_TYPES_CATALOG[value];
          nextCarts[cartIndex].mass = typeCat.defaultMass;
          if (!nextCarts[cartIndex].color) {
            nextCarts[cartIndex].color = typeCat.defaultColor;
          }
        }
      }
      return { ...prev, carts: nextCarts };
    });
  };

  const handleAddCart = () => {
    const isMruv = selectedTopic === 'mruv';
    const currentCount = (formData.carts || []).length;
    const letter = String.fromCharCode(65 + currentCount); // 'A', 'B', 'C', 'D'
    const newCart = {
      id: `c${Date.now()}`,
      label: `Móvil ${letter}`,
      cartType: currentCount % 2 === 0 ? 'standard' : 'sports',
      velocity: isMruv ? 0 : 2.5,
      initialVelocity: 1.0,
      acceleration: isMruv ? 1.5 : 0,
      mass: 1.5,
      positionX: Math.min((formData.trackLength || 8) - 1, currentCount * 2.0),
      direction: 1,
      color: COLOR_PALETTE[currentCount % COLOR_PALETTE.length],
    };

    setFormData((prev) => ({
      ...prev,
      carts: [...(prev.carts || []), newCart],
    }));
  };

  const handleRemoveCart = (cartIndex) => {
    setFormData((prev) => {
      const nextCarts = (prev.carts || []).filter((_, i) => i !== cartIndex);
      return { ...prev, carts: nextCarts };
    });
  };

  // Body attributes modifier (for Freefall / Tiro Vertical)
  const handleBodyChange = (bodyIndex, field, value) => {
    setFormData((prev) => {
      const nextBodies = [...(prev.bodies || [])];
      if (nextBodies[bodyIndex]) {
        nextBodies[bodyIndex] = {
          ...nextBodies[bodyIndex],
          [field]: value,
        };
        if (field === 'bodyType' && BODY_TYPES_CATALOG[value]) {
          nextBodies[bodyIndex].mass = BODY_TYPES_CATALOG[value].defaultMass;
          nextBodies[bodyIndex].color = BODY_TYPES_CATALOG[value].defaultColor;
        }
      }
      return { ...prev, bodies: nextBodies };
    });
  };

  // Live preview metrics
  const livePreview = useMemo(() => {
    return calculateTopicPhysicsPreview(selectedTopic, formData);
  }, [selectedTopic, formData]);

  if (!isOpen) return null;

  const handleSaveOnly = () => {
    const exampleRecord = {
      id: `custom_ex_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      topic: selectedTopic,
      title: formData.title || currentTopicMeta.defaultConfig.title,
      badge: livePreview.badge,
      summary: livePreview.summary,
      config: JSON.parse(JSON.stringify(formData)),
    };
    saveTeacherCustomExample(exampleRecord);
    if (onNotify) onNotify(`⭐ Ejemplo guardado: ${exampleRecord.title}`);
    onClose();
  };

  const handleMountOnly = () => {
    const exampleRecord = {
      id: `custom_temp_${Date.now()}`,
      topic: selectedTopic,
      title: formData.title || currentTopicMeta.defaultConfig.title,
      badge: livePreview.badge,
      summary: livePreview.summary,
      config: JSON.parse(JSON.stringify(formData)),
    };
    if (onMountCustomExample) {
      onMountCustomExample(exampleRecord);
    }
    onClose();
  };

  const handleSaveAndMount = () => {
    const exampleRecord = {
      id: `custom_ex_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      topic: selectedTopic,
      title: formData.title || currentTopicMeta.defaultConfig.title,
      badge: livePreview.badge,
      summary: livePreview.summary,
      config: JSON.parse(JSON.stringify(formData)),
    };
    saveTeacherCustomExample(exampleRecord);
    if (onMountCustomExample) {
      onMountCustomExample(exampleRecord);
    }
    if (onNotify) onNotify(`✨ Ejemplo creado y montado: ${exampleRecord.title}`);
    onClose();
  };

  const handleResetToDefaults = () => {
    setFormData(JSON.parse(JSON.stringify(currentTopicMeta.defaultConfig)));
  };

  const TopicIcon = TOPIC_ICONS[selectedTopic] || Layers;
  const isCartsTopic = selectedTopic === 'mru' || selectedTopic === 'mruv';
  const isBodiesTopic = selectedTopic === 'freefall' || selectedTopic === 'tiro_vertical';

  return (
    <div className="custom-builder-modal-overlay">
      <div className="custom-builder-modal-window">
        {/* Header */}
        <div className="cbm-header" style={{ borderBottomColor: currentTopicMeta.color }}>
          <div className="cbm-header-left">
            <span className="cbm-badge" style={{ background: `${currentTopicMeta.color}18`, color: currentTopicMeta.color }}>
              TALLER DEL PROFESOR • LABORATORIO COMPLETO Y PERSONALIZADO
            </span>
            <div className="cbm-title-row">
              <TopicIcon size={20} style={{ color: currentTopicMeta.color }} />
              <h2 className="cbm-title">Configurar Ejercicio de {currentTopicMeta.name}</h2>
            </div>
          </div>
          <button className="cbm-close-btn" onClick={onClose} title="Cerrar (Esc)">
            <X size={18} />
          </button>
        </div>

        {/* Topic Selector Tabs (only shown if multiple active topics exist) */}
        {availableTopics.length > 1 && (
          <div className="cbm-topic-pills-bar">
            {availableTopics.map((meta) => {
              const Icon = TOPIC_ICONS[meta.id] || Layers;
              const isSel = selectedTopic === meta.id;
              return (
                <button
                  key={meta.id}
                  className={`cbm-pill-btn ${isSel ? 'active' : ''}`}
                  onClick={() => handleSelectTopic(meta.id)}
                  style={isSel ? { borderColor: meta.color, background: meta.color, color: '#fff' } : {}}
                >
                  <Icon size={13} />
                  <span>{meta.short}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Main Content: Form + Live Preview */}
        <div className="cbm-body-grid">
          {/* Left Column: Form Controls */}
          <div className="cbm-form-col">
            <div className="cbm-form-section">
              <label className="cbm-label">Nombre del Ejercicio / Problema</label>
              <input
                type="text"
                className="cbm-input"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ej: Problema 3: Móvil A persigue a Móvil B"
              />
            </div>

            {/* Scenario / Problem Type Selector */}
            {currentTopicMeta.scenarios && currentTopicMeta.scenarios.length > 0 && (
              <div className="cbm-form-section">
                <label className="cbm-label">Tipo de Ejercicio / Escenario Didáctico</label>
                <div className="cbm-scenarios-grid">
                  {currentTopicMeta.scenarios.map((sc) => {
                    const isSelectedSc = (formData.scenarioType || currentTopicMeta.scenarios[0].id) === sc.id;
                    return (
                      <button
                        key={sc.id}
                        type="button"
                        className={`cbm-scenario-card ${isSelectedSc ? 'active' : ''}`}
                        onClick={() => handleScenarioChange(sc.id)}
                        style={isSelectedSc ? { borderColor: currentTopicMeta.color, background: `${currentTopicMeta.color}10` } : {}}
                      >
                        <div className="cbm-scenario-title" style={isSelectedSc ? { color: currentTopicMeta.color } : {}}>
                          {sc.name}
                        </div>
                        <div className="cbm-scenario-desc">{sc.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* CARTS LIST & ATTRIBUTES (MRU & MRUV) */}
            {/* ------------------------------------------------------------- */}
            {isCartsTopic && (
              <div className="cbm-carts-section">
                <div className="cbm-section-header">
                  <span className="cbm-label" style={{ fontSize: '0.8rem', color: currentTopicMeta.color }}>
                    🏎️ Carritos en el Ejercicio ({(formData.carts || []).length})
                  </span>
                  <button
                    type="button"
                    className="cbm-add-cart-btn"
                    onClick={handleAddCart}
                    style={{ borderColor: currentTopicMeta.color, color: currentTopicMeta.color }}
                  >
                    <Plus size={13} />
                    <span>Agregar Carrito</span>
                  </button>
                </div>

                <div className="cbm-carts-list">
                  {(formData.carts || []).map((cart, cIdx) => {
                    const typeCat = CART_TYPES_CATALOG[cart.cartType] || CART_TYPES_CATALOG.standard;
                    return (
                      <div key={cart.id || cIdx} className="cbm-cart-item-card" style={{ borderLeftColor: cart.color || typeCat.defaultColor }}>
                        {/* Cart Top Bar */}
                        <div className="cbm-cart-header">
                          <div className="cbm-cart-header-title">
                            <span className="cbm-cart-icon">{typeCat.icon}</span>
                            <input
                              type="text"
                              className="cbm-cart-name-input"
                              value={cart.label || ''}
                              onChange={(e) => handleCartChange(cIdx, 'label', e.target.value)}
                              placeholder={`Móvil ${cIdx + 1}`}
                            />
                          </div>

                          {(formData.carts || []).length > 1 && (
                            <button
                              type="button"
                              className="cbm-del-cart-btn"
                              onClick={() => handleRemoveCart(cIdx)}
                              title="Eliminar este carrito"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>

                        {/* Cart Model / Vehicle Type Selection */}
                        <div className="cbm-cart-models-row">
                          {Object.values(CART_TYPES_CATALOG).map((tCat) => (
                            <button
                              key={tCat.id}
                              type="button"
                              className={`cbm-model-btn ${cart.cartType === tCat.id ? 'active' : ''}`}
                              onClick={() => handleCartChange(cIdx, 'cartType', tCat.id)}
                            >
                              <span>{tCat.icon}</span>
                              <span>{tCat.short}</span>
                            </button>
                          ))}
                        </div>

                        {/* Physical attributes for this cart */}
                        <div className="cbm-row-3" style={{ marginTop: '6px' }}>
                          {selectedTopic === 'mru' ? (
                            <div className="cbm-form-section">
                              <label className="cbm-mini-label">Velocidad v</label>
                              <div className="cbm-stepper-wrap">
                                <input
                                  type="number"
                                  step="0.5"
                                  className="cbm-input cbm-input-sm"
                                  value={cart.velocity ?? 3.0}
                                  onChange={(e) => handleCartChange(cIdx, 'velocity', parseFloat(e.target.value) || 0)}
                                />
                                <span className="cbm-unit cbm-unit-sm">m/s</span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="cbm-form-section">
                                <label className="cbm-mini-label">Velocidad v₀</label>
                                <div className="cbm-stepper-wrap">
                                  <input
                                    type="number"
                                    step="0.5"
                                    className="cbm-input cbm-input-sm"
                                    value={cart.initialVelocity ?? 1.0}
                                    onChange={(e) => handleCartChange(cIdx, 'initialVelocity', parseFloat(e.target.value) || 0)}
                                  />
                                  <span className="cbm-unit cbm-unit-sm">m/s</span>
                                </div>
                              </div>
                              <div className="cbm-form-section">
                                <label className="cbm-mini-label">Aceleración a</label>
                                <div className="cbm-stepper-wrap">
                                  <input
                                    type="number"
                                    step="0.5"
                                    className="cbm-input cbm-input-sm"
                                    value={cart.acceleration ?? 2.0}
                                    onChange={(e) => handleCartChange(cIdx, 'acceleration', parseFloat(e.target.value) || 0)}
                                  />
                                  <span className="cbm-unit cbm-unit-sm">m/s²</span>
                                </div>
                              </div>
                            </>
                          )}

                          <div className="cbm-form-section">
                            <label className="cbm-mini-label">Masa</label>
                            <div className="cbm-stepper-wrap">
                              <input
                                type="number"
                                step="0.5"
                                min="0.1"
                                className="cbm-input cbm-input-sm"
                                value={cart.mass ?? 1.5}
                                onChange={(e) => handleCartChange(cIdx, 'mass', parseFloat(e.target.value) || 1)}
                              />
                              <span className="cbm-unit cbm-unit-sm">kg</span>
                            </div>
                          </div>
                        </div>

                        <div className="cbm-row-3" style={{ marginTop: '6px' }}>
                          <div className="cbm-form-section">
                            <label className="cbm-mini-label">Posición Inicial x₀</label>
                            <div className="cbm-stepper-wrap">
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max={formData.trackLength || 12}
                                className="cbm-input cbm-input-sm"
                                value={cart.positionX ?? (cIdx * 2.0)}
                                onChange={(e) => handleCartChange(cIdx, 'positionX', parseFloat(e.target.value) || 0)}
                              />
                              <span className="cbm-unit cbm-unit-sm">m</span>
                            </div>
                          </div>

                          <div className="cbm-form-section">
                            <label className="cbm-mini-label">Sentido</label>
                            <div className="cbm-dir-btn-group">
                              <button
                                type="button"
                                className={`cbm-dir-btn ${cart.direction !== -1 ? 'active' : ''}`}
                                onClick={() => handleCartChange(cIdx, 'direction', 1)}
                                title="Hacia la derecha (+x)"
                              >
                                <ArrowRight size={13} />
                                <span>Derecha</span>
                              </button>
                              <button
                                type="button"
                                className={`cbm-dir-btn ${cart.direction === -1 ? 'active' : ''}`}
                                onClick={() => handleCartChange(cIdx, 'direction', -1)}
                                title="Hacia la izquierda (-x)"
                              >
                                <ArrowLeft size={13} />
                                <span>Izquierda</span>
                              </button>
                            </div>
                          </div>

                          <div className="cbm-form-section">
                            <label className="cbm-mini-label">Color Carrocería</label>
                            <div className="cbm-colors-strip">
                              {COLOR_PALETTE.map((col) => (
                                <button
                                  key={col}
                                  type="button"
                                  className={`cbm-color-dot ${cart.color === col ? 'active' : ''}`}
                                  style={{ background: col }}
                                  onClick={() => handleCartChange(cIdx, 'color', col)}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Track and Environment for Carts */}
                <div className="cbm-track-options-block" style={{ marginTop: '10px' }}>
                  <div className="cbm-row-2">
                    <div className="cbm-form-section">
                      <label className="cbm-label">Longitud de la Pista / Riel (m)</label>
                      <input
                        type="number"
                        step="1"
                        min="3"
                        max="20"
                        className="cbm-input"
                        value={formData.trackLength ?? 8.0}
                        onChange={(e) => handleInputChange('trackLength', parseFloat(e.target.value) || 8)}
                      />
                    </div>
                    <div className="cbm-form-section" style={{ justifyContent: 'center' }}>
                      <label className="cbm-checkbox-label" style={{ marginTop: '16px' }}>
                        <input
                          type="checkbox"
                          checked={formData.includePhotogates ?? true}
                          onChange={(e) => handleInputChange('includePhotogates', e.target.checked)}
                        />
                        <span>Sensores Fotopuerta en el Riel</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* BODIES LIST & ATTRIBUTES (Freefall & Tiro Vertical) */}
            {/* ------------------------------------------------------------- */}
            {isBodiesTopic && (
              <div className="cbm-bodies-section">
                {(formData.bodies || []).map((b, bIdx) => (
                  <div key={b.id || bIdx} className="cbm-cart-item-card" style={{ borderLeftColor: b.color || '#16a34a' }}>
                    <div className="cbm-cart-header">
                      <div className="cbm-cart-header-title">
                        <span>{BODY_TYPES_CATALOG[b.bodyType]?.icon || '⚪'}</span>
                        <input
                          type="text"
                          className="cbm-cart-name-input"
                          value={b.label || ''}
                          onChange={(e) => handleBodyChange(bIdx, 'label', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="cbm-cart-models-row">
                      {Object.values(BODY_TYPES_CATALOG).map((bCat) => (
                        <button
                          key={bCat.id}
                          type="button"
                          className={`cbm-model-btn ${b.bodyType === bCat.id ? 'active' : ''}`}
                          onClick={() => handleBodyChange(bIdx, 'bodyType', bCat.id)}
                        >
                          <span>{bCat.icon}</span>
                          <span>{bCat.short}</span>
                        </button>
                      ))}
                    </div>

                    <div className="cbm-row-3" style={{ marginTop: '8px' }}>
                      <div className="cbm-form-section">
                        <label className="cbm-mini-label">
                          {selectedTopic === 'freefall' ? 'Altura de Caída h' : 'Rapidez de Disparo v₀'}
                        </label>
                        <div className="cbm-stepper-wrap">
                          <input
                            type="number"
                            step="1"
                            className="cbm-input cbm-input-sm"
                            value={selectedTopic === 'freefall' ? (b.height ?? 45.0) : (b.initialVelocity ?? 25.0)}
                            onChange={(e) => handleBodyChange(bIdx, selectedTopic === 'freefall' ? 'height' : 'initialVelocity', parseFloat(e.target.value) || 0)}
                          />
                          <span className="cbm-unit cbm-unit-sm">
                            {selectedTopic === 'freefall' ? 'm' : 'm/s'}
                          </span>
                        </div>
                      </div>

                      <div className="cbm-form-section">
                        <label className="cbm-mini-label">Masa</label>
                        <div className="cbm-stepper-wrap">
                          <input
                            type="number"
                            step="0.5"
                            className="cbm-input cbm-input-sm"
                            value={b.mass ?? 2.0}
                            onChange={(e) => handleBodyChange(bIdx, 'mass', parseFloat(e.target.value) || 1)}
                          />
                          <span className="cbm-unit cbm-unit-sm">kg</span>
                        </div>
                      </div>

                      <div className="cbm-form-section">
                        <label className="cbm-mini-label">Color</label>
                        <div className="cbm-colors-strip">
                          {COLOR_PALETTE.map((col) => (
                            <button
                              key={col}
                              type="button"
                              className={`cbm-color-dot ${b.color === col ? 'active' : ''}`}
                              style={{ background: col }}
                              onClick={() => handleBodyChange(bIdx, 'color', col)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* OTHER TOPICS SPECIFIC FIELDS */}
            {/* ------------------------------------------------------------- */}
            {selectedTopic === 'lanzamiento_horizontal' && (
              <div className="cbm-row-2">
                <div className="cbm-form-section">
                  <label className="cbm-label">Altura del Acantilado h (m)</label>
                  <input
                    type="number"
                    step="2"
                    min="5"
                    max="100"
                    className="cbm-input"
                    value={formData.height ?? 20.0}
                    onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || 10)}
                  />
                </div>
                <div className="cbm-form-section">
                  <label className="cbm-label">Velocidad Horizontal v₀x (m/s)</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="60"
                    className="cbm-input"
                    value={formData.velocity ?? 18.0}
                    onChange={(e) => handleInputChange('velocity', parseFloat(e.target.value) || 5)}
                  />
                </div>
              </div>
            )}

            {selectedTopic === 'movimiento_proyectiles' && (
              <div className="cbm-row-3">
                <div className="cbm-form-section">
                  <label className="cbm-label">Rapidez Disparo v₀ (m/s)</label>
                  <input
                    type="number"
                    step="1"
                    min="5"
                    max="80"
                    className="cbm-input"
                    value={formData.velocity ?? 24.0}
                    onChange={(e) => handleInputChange('velocity', parseFloat(e.target.value) || 10)}
                  />
                </div>
                <div className="cbm-form-section">
                  <label className="cbm-label">Ángulo θ (°)</label>
                  <input
                    type="number"
                    step="5"
                    min="5"
                    max="85"
                    className="cbm-input"
                    value={formData.angleDeg ?? 40.0}
                    onChange={(e) => handleInputChange('angleDeg', parseFloat(e.target.value) || 45)}
                  />
                </div>
                <div className="cbm-form-section">
                  <label className="cbm-label">Altura Lanzador y₀ (m)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="50"
                    className="cbm-input"
                    value={formData.launchHeight ?? 0.0}
                    onChange={(e) => handleInputChange('launchHeight', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            )}

            {selectedTopic === 'mcu' && (
              <div className="cbm-row-2">
                <div className="cbm-form-section">
                  <label className="cbm-label">Radio r (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.2"
                    max="4.0"
                    className="cbm-input"
                    value={formData.radius ?? 1.2}
                    onChange={(e) => handleInputChange('radius', parseFloat(e.target.value) || 1)}
                  />
                </div>
                <div className="cbm-form-section">
                  <label className="cbm-label">Rapidez Angular ω (rad/s)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="20"
                    className="cbm-input"
                    value={formData.omega ?? 3.5}
                    onChange={(e) => handleInputChange('omega', parseFloat(e.target.value) || 2)}
                  />
                </div>
              </div>
            )}

            {selectedTopic === 'mcuv' && (
              <div className="cbm-row-2">
                <div className="cbm-form-section">
                  <label className="cbm-label">Rapidez Inicial ω₀ (rad/s)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="cbm-input"
                    value={formData.initialOmega ?? 2.0}
                    onChange={(e) => handleInputChange('initialOmega', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="cbm-form-section">
                  <label className="cbm-label">Aceleración Angular α (rad/s²)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="cbm-input"
                    value={formData.alpha ?? 1.5}
                    onChange={(e) => handleInputChange('alpha', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            )}

            {selectedTopic === 'poleas_mcu' && (
              <div className="cbm-row-3">
                <div className="cbm-form-section">
                  <label className="cbm-label">Radio Polea 1 (m)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.05"
                    max="1.5"
                    className="cbm-input"
                    value={formData.radius1 ?? 0.25}
                    onChange={(e) => handleInputChange('radius1', parseFloat(e.target.value) || 0.2)}
                  />
                </div>
                <div className="cbm-form-section">
                  <label className="cbm-label">Radio Polea 2 (m)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.05"
                    max="1.5"
                    className="cbm-input"
                    value={formData.radius2 ?? 0.12}
                    onChange={(e) => handleInputChange('radius2', parseFloat(e.target.value) || 0.1)}
                  />
                </div>
                <div className="cbm-form-section">
                  <label className="cbm-label">ω₁ Entrada (rad/s)</label>
                  <input
                    type="number"
                    step="1"
                    min="0.5"
                    max="30"
                    className="cbm-input"
                    value={formData.omega1 ?? 6.0}
                    onChange={(e) => handleInputChange('omega1', parseFloat(e.target.value) || 5)}
                  />
                </div>
              </div>
            )}

            {selectedTopic === 'dcl' && (
              <>
                <div className="cbm-row-3">
                  <div className="cbm-form-section">
                    <label className="cbm-label">Masa m₁ Colgante (kg)</label>
                    <input
                      type="number"
                      step="1"
                      min="0.5"
                      max="50"
                      className="cbm-input"
                      value={formData.m1 ?? 4.0}
                      onChange={(e) => handleInputChange('m1', parseFloat(e.target.value) || 1)}
                    />
                  </div>
                  <div className="cbm-form-section">
                    <label className="cbm-label">Masa m₂ Mesa (kg)</label>
                    <input
                      type="number"
                      step="1"
                      min="0.5"
                      max="50"
                      className="cbm-input"
                      value={formData.m2 ?? 10.0}
                      onChange={(e) => handleInputChange('m2', parseFloat(e.target.value) || 1)}
                    />
                  </div>
                  {formData.scenarioType !== 'table_two_masses' && (
                    <div className="cbm-form-section">
                      <label className="cbm-label">Masa m₃ Colgante (kg)</label>
                      <input
                        type="number"
                        step="1"
                        min="0.5"
                        max="50"
                        className="cbm-input"
                        value={formData.m3 ?? 7.0}
                        onChange={(e) => handleInputChange('m3', parseFloat(e.target.value) || 1)}
                      />
                    </div>
                  )}
                </div>

                <div className="cbm-row-2" style={{ marginTop: '6px' }}>
                  <div className="cbm-form-section">
                    <label className="cbm-label">Coeficiente de Fricción Dinámica (μk)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="0.8"
                      className="cbm-input"
                      value={formData.mu_k ?? 0.15}
                      onChange={(e) => handleInputChange('mu_k', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="cbm-form-section" style={{ justifyContent: 'center' }}>
                    <label className="cbm-checkbox-label" style={{ marginTop: '16px' }}>
                      <input
                        type="checkbox"
                        checked={formData.isCleanPractice ?? true}
                        onChange={(e) => handleInputChange('isCleanPractice', e.target.checked)}
                      />
                      <span>Mesa limpia para dibujar vectores</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            {selectedTopic === 'equilibrio' && (
              <>
                <div className="cbm-row-3">
                  <div className="cbm-form-section">
                    <label className="cbm-label">Carga / Peso W (N)</label>
                    <input
                      type="number"
                      step="20"
                      min="10"
                      max="2000"
                      className="cbm-input"
                      value={formData.load ?? 300}
                      onChange={(e) => handleInputChange('load', parseFloat(e.target.value) || 100)}
                    />
                  </div>
                  <div className="cbm-form-section">
                    <label className="cbm-label">Ángulo θ₁ (°)</label>
                    <input
                      type="number"
                      step="5"
                      min="10"
                      max="80"
                      className="cbm-input"
                      value={formData.angle1 ?? 35}
                      onChange={(e) => handleInputChange('angle1', parseFloat(e.target.value) || 30)}
                    />
                  </div>
                  <div className="cbm-form-section">
                    <label className="cbm-label">Ángulo θ₂ (°)</label>
                    <input
                      type="number"
                      step="5"
                      min="10"
                      max="80"
                      className="cbm-input"
                      value={formData.angle2 ?? 55}
                      onChange={(e) => handleInputChange('angle2', parseFloat(e.target.value) || 60)}
                    />
                  </div>
                </div>
                <div className="cbm-form-section" style={{ marginTop: '8px' }}>
                  <label className="cbm-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isCleanPractice !== false}
                      onChange={(e) => handleInputChange('isCleanPractice', e.target.checked)}
                    />
                    <span style={{ fontWeight: 600, color: '#065f46' }}>
                      ✨ Modo Práctica Limpia (Sin resolver: el profesor o estudiante dibuja los vectores y experimenta la física)
                    </span>
                  </label>
                </div>
              </>
            )}

            {selectedTopic === 'segunda_ley_newton' && (
              <>
                <div className="cbm-row-3">
                  <div className="cbm-form-section">
                    <label className="cbm-label">Masa m₁ (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="100"
                      className="cbm-input"
                      value={formData.mass1 ?? 2.0}
                      onChange={(e) => handleInputChange('mass1', parseFloat(e.target.value) || 1)}
                    />
                  </div>
                  <div className="cbm-form-section">
                    <label className="cbm-label">Masa m₂ (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="100"
                      className="cbm-input"
                      value={formData.mass2 ?? 6.0}
                      onChange={(e) => handleInputChange('mass2', parseFloat(e.target.value) || 1)}
                    />
                  </div>
                  <div className="cbm-form-section">
                    <label className="cbm-label">Fuerza Aplicada F (N)</label>
                    <input
                      type="number"
                      step="5"
                      min="1"
                      max="500"
                      className="cbm-input"
                      value={formData.appliedForce ?? 80.0}
                      onChange={(e) => handleInputChange('appliedForce', parseFloat(e.target.value) || 10)}
                    />
                  </div>
                </div>
                <div className="cbm-form-section" style={{ marginTop: '8px' }}>
                  <label className="cbm-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isCleanPractice !== false}
                      onChange={(e) => handleInputChange('isCleanPractice', e.target.checked)}
                    />
                    <span style={{ fontWeight: 600, color: '#1d4ed8' }}>
                      ✨ Modo Práctica Limpia (Sin resolver: el profesor o estudiante dibuja los vectores y experimenta la física)
                    </span>
                  </label>
                </div>
              </>
            )}

            {selectedTopic === 'mechanics' && (
              <div className="cbm-row-2">
                <div className="cbm-form-section">
                  <label className="cbm-label">Masa A (kg)</label>
                  <input
                    type="number"
                    step="5"
                    min="1"
                    max="200"
                    className="cbm-input"
                    value={formData.massA ?? 80.0}
                    onChange={(e) => handleInputChange('massA', parseFloat(e.target.value) || 10)}
                  />
                </div>
                <div className="cbm-form-section">
                  <label className="cbm-label">Masa B (kg)</label>
                  <input
                    type="number"
                    step="5"
                    min="1"
                    max="200"
                    className="cbm-input"
                    value={formData.massB ?? 50.0}
                    onChange={(e) => handleInputChange('massB', parseFloat(e.target.value) || 10)}
                  />
                </div>
              </div>
            )}

            {/* General Checkbox */}
            <div className="cbm-form-section" style={{ marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
              <label className="cbm-checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.includeStickyNote ?? true}
                  onChange={(e) => handleInputChange('includeStickyNote', e.target.checked)}
                />
                <span>Añadir nota adhesiva didáctica al lado con fórmulas y datos resueltos</span>
              </label>
            </div>
          </div>

          {/* Right Column: Live Educational Preview */}
          <div className="cbm-preview-col">
            <div className="cbm-preview-box">
              <div className="cbm-preview-badge">
                <Sparkles size={13} />
                <span>Vista Previa del Ejercicio</span>
              </div>

              {/* Sample card how it will look in the drawer */}
              <div
                className="cbm-sample-card"
                style={{ borderLeftColor: currentTopicMeta.color }}
              >
                <div className="cbm-sample-header">
                  <span className="cbm-sample-title">{formData.title || currentTopicMeta.defaultConfig.title}</span>
                  <span className="cbm-sample-tag">{livePreview.badge}</span>
                </div>
                <p className="cbm-sample-desc">{livePreview.summary}</p>
              </div>

              {/* Theoretical Physics Equations */}
              <div className="cbm-math-box">
                <div className="cbm-math-header">
                  <Calculator size={14} style={{ color: currentTopicMeta.color }} />
                  <span>Ecuaciones y Cálculos en Vivo</span>
                </div>
                <div className="cbm-math-list">
                  {livePreview.mathDetails.map((math, idx) => (
                    <div key={idx} className="cbm-math-row">
                      <span className="cbm-math-label">{math.label}:</span>
                      <span className="cbm-math-expr">{math.expr}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulation note */}
              <div className="cbm-sim-note">
                <Info size={14} style={{ color: '#0284c7', flexShrink: 0, marginTop: 1 }} />
                <span>
                  Al pulsar <strong>Simular (Play)</strong> en la pizarra, todos los cuerpos y móviles configurados se desplazarán e interactuarán de acuerdo con sus parámetros físicos.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="cbm-footer">
          <button
            type="button"
            className="cbm-btn cbm-btn-ghost"
            onClick={handleResetToDefaults}
            title="Restablecer valores predeterminados"
          >
            <RotateCcw size={14} />
            <span>Restablecer</span>
          </button>

          <div className="cbm-footer-actions">
            <button
              type="button"
              className="cbm-btn cbm-btn-secondary"
              onClick={handleSaveOnly}
              title="Guardar en el menú de objetos para usar en cualquier clase"
            >
              <Save size={14} />
              <span>Guardar en Mis Ejemplos</span>
            </button>

            <button
              type="button"
              className="cbm-btn cbm-btn-mount"
              onClick={handleMountOnly}
              title="Colocar inmediatamente en la pizarra"
            >
              <Play size={14} />
              <span>Añadir a la Pizarra</span>
            </button>

            <button
              type="button"
              className="cbm-btn cbm-btn-primary"
              onClick={handleSaveAndMount}
              style={{ background: currentTopicMeta.color, borderColor: currentTopicMeta.color }}
              title="Guardar en biblioteca y colocar en la pizarra"
            >
              <CheckCircle2 size={15} />
              <span>Guardar y Añadir a Pizarra</span>
            </button>
          </div>
        </div>

        {/* Scoped CSS */}
        <style>{`
          .custom-builder-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.65);
            backdrop-filter: blur(4px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
          }

          .custom-builder-modal-window {
            background: #ffffff;
            border-radius: 14px;
            width: 100%;
            max-width: 920px;
            max-height: 94vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 50px -10px rgba(15, 23, 42, 0.35);
            border: 1px solid #e2e8f0;
            overflow: hidden;
            animation: cbmFadeIn 0.18s ease-out;
          }

          @keyframes cbmFadeIn {
            from { opacity: 0; transform: scale(0.97); }
            to { opacity: 1; transform: scale(1); }
          }

          .cbm-header {
            padding: 13px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #e2e8f0;
            background: #f8fafc;
          }

          .cbm-badge {
            font-size: 0.62rem;
            font-weight: 800;
            letter-spacing: 0.06em;
            padding: 2px 7px;
            border-radius: 4px;
            display: inline-block;
            margin-bottom: 3px;
          }

          .cbm-title-row {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .cbm-title {
            font-size: 1.05rem;
            font-weight: 700;
            color: #0f172a;
            margin: 0;
          }

          .cbm-close-btn {
            background: transparent;
            border: none;
            color: #64748b;
            cursor: pointer;
            padding: 6px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.12s;
          }
          .cbm-close-btn:hover {
            background: #e2e8f0;
            color: #0f172a;
          }

          .cbm-topic-pills-bar {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 7px 16px;
            overflow-x: auto;
            background: #ffffff;
            border-bottom: 1px solid #f1f5f9;
            scrollbar-width: thin;
          }

          .cbm-pill-btn {
            display: flex;
            align-items: center;
            gap: 5px;
            padding: 4px 10px;
            border-radius: 20px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            color: #475569;
            font-size: 0.72rem;
            font-weight: 600;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.12s;
          }
          .cbm-pill-btn:hover {
            background: #f1f5f9;
            color: #0f172a;
          }

          .cbm-body-grid {
            display: grid;
            grid-template-columns: 1.25fr 0.85fr;
            gap: 18px;
            padding: 16px 20px;
            overflow-y: auto;
            max-height: calc(94vh - 180px);
          }

          @media (max-width: 820px) {
            .cbm-body-grid {
              grid-template-columns: 1fr;
            }
          }

          .cbm-form-col {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .cbm-form-section {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .cbm-label {
            font-size: 0.74rem;
            font-weight: 700;
            color: #334155;
          }

          .cbm-mini-label {
            font-size: 0.68rem;
            font-weight: 600;
            color: #64748b;
          }

          .cbm-input, .cbm-select {
            width: 100%;
            padding: 6px 10px;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            font-size: 0.8rem;
            color: #0f172a;
            background: #ffffff;
            box-sizing: border-box;
          }
          .cbm-input-sm {
            padding: 4px 8px;
            font-size: 0.76rem;
          }
          .cbm-input:focus, .cbm-select:focus {
            outline: none;
            border-color: #2563eb;
            box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.12);
          }

          .cbm-stepper-wrap {
            position: relative;
            display: flex;
            align-items: center;
          }
          .cbm-unit {
            position: absolute;
            right: 8px;
            font-size: 0.7rem;
            font-weight: 700;
            color: #64748b;
            pointer-events: none;
          }
          .cbm-unit-sm {
            font-size: 0.65rem;
          }

          .cbm-scenarios-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 7px;
          }

          .cbm-scenario-card {
            padding: 7px 10px;
            border-radius: 7px;
            border: 1.5px solid #e2e8f0;
            background: #ffffff;
            cursor: pointer;
            text-align: left;
            transition: all 0.12s;
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          .cbm-scenario-card:hover {
            border-color: #cbd5e1;
            background: #f8fafc;
          }
          .cbm-scenario-title {
            font-size: 0.74rem;
            font-weight: 700;
            color: #0f172a;
          }
          .cbm-scenario-desc {
            font-size: 0.64rem;
            color: #64748b;
            line-height: 1.25;
          }

          .cbm-section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 6px;
          }

          .cbm-add-cart-btn {
            display: flex;
            align-items: center;
            gap: 4px;
            background: #ffffff;
            border: 1px dashed #cbd5e1;
            padding: 3px 8px;
            border-radius: 5px;
            font-size: 0.68rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.12s;
          }
          .cbm-add-cart-btn:hover {
            background: #f8fafc;
          }

          .cbm-carts-list, .cbm-bodies-section {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .cbm-cart-item-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-left-width: 4px;
            border-radius: 7px;
            padding: 8px 10px;
          }

          .cbm-cart-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            margin-bottom: 6px;
          }

          .cbm-cart-header-title {
            display: flex;
            align-items: center;
            gap: 6px;
            flex: 1;
          }

          .cbm-cart-icon {
            font-size: 0.9rem;
          }

          .cbm-cart-name-input {
            border: 1px solid transparent;
            background: transparent;
            font-size: 0.78rem;
            font-weight: 700;
            color: #0f172a;
            padding: 2px 4px;
            border-radius: 4px;
            width: 160px;
          }
          .cbm-cart-name-input:focus {
            outline: none;
            border-color: #cbd5e1;
            background: #ffffff;
          }

          .cbm-del-cart-btn {
            background: transparent;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
          }
          .cbm-del-cart-btn:hover {
            color: #ef4444;
            background: #fee2e2;
          }

          .cbm-cart-models-row {
            display: flex;
            align-items: center;
            gap: 5px;
          }

          .cbm-model-btn {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 3px 7px;
            border-radius: 4px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            font-size: 0.67rem;
            color: #475569;
            cursor: pointer;
            transition: all 0.12s;
          }
          .cbm-model-btn.active {
            border-color: #2563eb;
            background: #eff6ff;
            color: #1d4ed8;
            font-weight: 700;
          }

          .cbm-dir-btn-group {
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .cbm-dir-btn {
            display: flex;
            align-items: center;
            gap: 3px;
            padding: 4px 6px;
            border-radius: 4px;
            background: #ffffff;
            border: 1px solid #cbd5e1;
            font-size: 0.67rem;
            color: #475569;
            cursor: pointer;
          }
          .cbm-dir-btn.active {
            border-color: #0f172a;
            background: #0f172a;
            color: #ffffff;
            font-weight: 700;
          }

          .cbm-colors-strip {
            display: flex;
            align-items: center;
            gap: 4px;
            padding-top: 4px;
          }

          .cbm-color-dot {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 1.5px solid transparent;
            cursor: pointer;
            padding: 0;
            transition: transform 0.12s;
          }
          .cbm-color-dot:hover {
            transform: scale(1.15);
          }
          .cbm-color-dot.active {
            border-color: #0f172a;
            box-shadow: 0 0 0 2px #ffffff inset;
          }

          .cbm-row-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .cbm-row-3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 8px;
          }

          .cbm-checkbox-label {
            display: flex;
            align-items: center;
            gap: 7px;
            font-size: 0.72rem;
            font-weight: 600;
            color: #334155;
            cursor: pointer;
          }

          .cbm-preview-col {
            display: flex;
            flex-direction: column;
          }

          .cbm-preview-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .cbm-preview-badge {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 0.68rem;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .cbm-sample-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-left-width: 4px;
            border-radius: 8px;
            padding: 10px 12px;
            box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);
          }

          .cbm-sample-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            margin-bottom: 4px;
          }

          .cbm-sample-title {
            font-size: 0.82rem;
            font-weight: 700;
            color: #0f172a;
          }

          .cbm-sample-tag {
            font-size: 0.67rem;
            font-weight: 600;
            background: #f1f5f9;
            color: #334155;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: ui-monospace, SFMono-Regular, monospace;
            white-space: nowrap;
          }

          .cbm-sample-desc {
            font-size: 0.7rem;
            color: #64748b;
            margin: 0;
            line-height: 1.3;
          }

          .cbm-math-box {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px 12px;
          }

          .cbm-math-header {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.72rem;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 8px;
            padding-bottom: 4px;
            border-bottom: 1px solid #f1f5f9;
          }

          .cbm-math-list {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .cbm-math-row {
            display: flex;
            flex-direction: column;
            gap: 1px;
          }

          .cbm-math-label {
            font-size: 0.66rem;
            font-weight: 700;
            color: #64748b;
          }

          .cbm-math-expr {
            font-size: 0.72rem;
            font-weight: 600;
            color: #0f172a;
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          }

          .cbm-sim-note {
            display: flex;
            align-items: flex-start;
            gap: 7px;
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 6px;
            padding: 8px 10px;
            font-size: 0.68rem;
            color: #0369a1;
            line-height: 1.35;
          }

          .cbm-footer {
            padding: 12px 20px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }

          .cbm-footer-actions {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .cbm-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 7px 12px;
            border-radius: 6px;
            font-size: 0.74rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.12s;
            border: 1px solid transparent;
          }

          .cbm-btn-ghost {
            background: transparent;
            color: #64748b;
          }
          .cbm-btn-ghost:hover {
            background: #e2e8f0;
            color: #0f172a;
          }

          .cbm-btn-secondary {
            background: #ffffff;
            border-color: #cbd5e1;
            color: #334155;
          }
          .cbm-btn-secondary:hover {
            background: #f1f5f9;
            color: #0f172a;
          }

          .cbm-btn-mount {
            background: #ffffff;
            border-color: #0284c7;
            color: #0284c7;
          }
          .cbm-btn-mount:hover {
            background: #f0f9ff;
          }

          .cbm-btn-primary {
            color: #ffffff;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          }
          .cbm-btn-primary:hover {
            filter: brightness(1.08);
          }
        `}</style>
      </div>
    </div>
  );
}
