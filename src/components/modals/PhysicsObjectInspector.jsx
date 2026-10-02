import React, { useState, useEffect } from 'react';
import { 
  X, 
  Gauge, 
  Clock, 
  Layers, 
  Weight, 
  Check, 
  Timer,
  Sparkles,
  TrendingUp,
  RotateCcw,
  ArrowDownCircle,
  ArrowUpCircle,
  Navigation,
  Target
} from 'lucide-react';
import { CONVERSIONS } from '../../services/mruExerciseSolver';

export default function PhysicsObjectInspector({
  element,
  isOpen,
  onClose,
  onUpdateElement,
}) {
  if (!isOpen || !element || element.type !== 'physics_object') return null;

  const props = element.properties || {};
  const isMruv = element.physicsType === 'mruv_cart';
  const isMru = element.physicsType === 'mru_cart';
  const isFreefallBody = element.physicsType === 'freefall_body';
  const isFreefallTower = element.physicsType === 'freefall_tower';
  const isVerticalProj = element.physicsType === 'vertical_projectile';
  const isHorizontalProj = element.physicsType === 'horizontal_projectile';
  const isCliffPlatform = element.physicsType === 'cliff_platform';
  const isCannon = element.physicsType === 'cannon_launcher';
  const isObliqueProj = element.physicsType === 'oblique_projectile';
  const isTargetWall = element.physicsType === 'target_wall';

  // Form states initialized from element
  const [label, setLabel] = useState(
    props.label || element.name || 
    (isMruv ? 'Móvil MRUV' : isFreefallBody ? 'Cuerpo en Caída Libre' : isVerticalProj ? 'Proyectil Tiro Vertical' : isHorizontalProj ? 'Proyectil Horizontal' : isCliffPlatform ? 'Acantilado de Lanzamiento' : isFreefallTower ? 'Torre de Caída Libre' : isCannon ? 'Cañón Lanzador Angular' : isObliqueProj ? 'Proyectil Oblicuo (2D)' : isTargetWall ? 'Muro Diana / Objetivo' : 'Móvil MRU')
  );
  
  // Speed (v for MRU, v0 for MRUV/Freefall/VerticalLaunch/HorizontalLaunch/Oblique)
  const rawVel = props.displayVelocity !== undefined 
    ? props.displayVelocity 
    : (props.velocity !== undefined ? props.velocity : (isMruv || isFreefallBody ? 0.0 : (isVerticalProj || isHorizontalProj ? 20.0 : (isCannon || isObliqueProj ? 25.0 : 2.0))));
  const [velocityValue, setVelocityValue] = useState(rawVel);
  const [velocityUnit, setVelocityUnit] = useState(props.unit || 'm/s');

  // Acceleration (a for MRUV)
  const rawAccel = props.acceleration !== undefined ? props.acceleration : 2.0;
  const [accelerationValue, setAccelerationValue] = useState(rawAccel);
  const [showAccelVector, setShowAccelVector] = useState(props.showAccelVector !== false);

  // Gravity (g for Freefall, Tiro Vertical, Horizontal Launch, Oblique Launch)
  const rawGravity = props.gravity !== undefined ? props.gravity : 9.8;
  const [gravityValue, setGravityValue] = useState(rawGravity);
  const [showGravityVector, setShowGravityVector] = useState(props.showGravityVector !== false);
  const [releaseHeightValue, setReleaseHeightValue] = useState(props.releaseHeight || 50.0);
  const [heightMetersValue, setHeightMetersValue] = useState(props.heightMeters || props.launchHeightMeters || (isCannon || isObliqueProj ? 0.0 : 20.0));
  
  // Angle for Oblique / Cannon Launch
  const [angleDegValue, setAngleDegValue] = useState(props.angleDeg !== undefined ? props.angleDeg : 45.0);
  const [targetDistanceValue, setTargetDistanceValue] = useState(props.distanceMeters || 50.0);
  const [targetHeightValue, setTargetHeightValue] = useState(props.targetHeightMeters || 10.0);

  // Departure Time
  const [departureTime, setDepartureTime] = useState(props.departureTime || '');
  
  // Vectors & Trajectory
  const [showVector, setShowVector] = useState(props.showVector !== false);
  const [showResultantVector, setShowResultantVector] = useState(props.showResultantVector !== false);
  const [showTrajectory, setShowTrajectory] = useState(props.showTrajectory !== false);
  
  // Color
  const [color, setColor] = useState(
    element.color || props.color || 
    (isMruv ? '#0ea5e9' : isFreefallBody ? '#ef4444' : isVerticalProj ? '#8b5cf6' : isHorizontalProj ? '#06b6d4' : isCliffPlatform ? '#475569' : isFreefallTower ? '#64748b' : isCannon ? '#334155' : isObliqueProj ? '#8b5cf6' : isTargetWall ? '#475569' : '#0284c7')
  );

  // Track / Tower / Cliff Length
  const [trackLength, setTrackLength] = useState(props.lengthMeters || props.heightMeters || 6.0);
  const [trackUnit, setTrackUnit] = useState(props.lengthUnit || 'm');

  // Mass
  const [massKg, setMassKg] = useState(props.mass || (isMru || isMruv ? 1.5 : isFreefallBody ? 1.0 : isVerticalProj || isHorizontalProj || isObliqueProj ? 0.5 : 100));

  // Sync when element changes
  useEffect(() => {
    if (!element) return;
    const p = element.properties || {};
    const currIsMruv = element.physicsType === 'mruv_cart';
    const currIsFfBody = element.physicsType === 'freefall_body';
    const currIsFfTower = element.physicsType === 'freefall_tower';
    const currIsVertProj = element.physicsType === 'vertical_projectile';
    const currIsHzProj = element.physicsType === 'horizontal_projectile';
    const currIsCliff = element.physicsType === 'cliff_platform';
    const currIsCannon = element.physicsType === 'cannon_launcher';
    const currIsOblique = element.physicsType === 'oblique_projectile';
    const currIsTarget = element.physicsType === 'target_wall';

    setLabel(
      p.label || element.name || 
      (currIsMruv ? 'Móvil MRUV' : currIsFfBody ? 'Cuerpo en Caída Libre' : currIsVertProj ? 'Proyectil Tiro Vertical' : currIsHzProj ? 'Proyectil Horizontal' : currIsCliff ? 'Acantilado de Lanzamiento' : currIsFfTower ? 'Torre de Caída Libre' : currIsCannon ? 'Cañón Lanzador Angular' : currIsOblique ? 'Proyectil Oblicuo (2D)' : currIsTarget ? 'Muro Diana / Objetivo' : 'Móvil MRU')
    );
    
    const v = p.displayVelocity !== undefined 
      ? p.displayVelocity 
      : (p.velocity !== undefined ? p.velocity : (currIsMruv || currIsFfBody ? 0.0 : (currIsVertProj || currIsHzProj ? 20.0 : (currIsCannon || currIsOblique ? 25.0 : 2.0))));
    setVelocityValue(v);
    setVelocityUnit(p.unit || 'm/s');
    
    const a = p.acceleration !== undefined ? p.acceleration : 2.0;
    setAccelerationValue(a);
    setShowAccelVector(p.showAccelVector !== false);

    setGravityValue(p.gravity !== undefined ? p.gravity : 9.8);
    setShowGravityVector(p.showGravityVector !== false);
    setReleaseHeightValue(p.releaseHeight || 50.0);
    setHeightMetersValue(p.heightMeters || p.launchHeightMeters || (currIsCannon || currIsOblique ? 0.0 : 20.0));
    setAngleDegValue(p.angleDeg !== undefined ? p.angleDeg : 45.0);
    setTargetDistanceValue(p.distanceMeters || 50.0);
    setTargetHeightValue(p.targetHeightMeters || 10.0);

    setDepartureTime(p.departureTime || '');
    setShowVector(p.showVector !== false);
    setShowResultantVector(p.showResultantVector !== false);
    setShowTrajectory(p.showTrajectory !== false);
    setColor(
      element.color || p.color || 
      (currIsMruv ? '#0ea5e9' : currIsFfBody ? '#ef4444' : currIsVertProj ? '#8b5cf6' : currIsHzProj ? '#06b6d4' : currIsCliff ? '#475569' : currIsFfTower ? '#64748b' : currIsCannon ? '#334155' : currIsOblique ? '#8b5cf6' : currIsTarget ? '#475569' : '#0284c7')
    );
    setTrackLength(p.lengthMeters || p.heightMeters || 6.0);
    setTrackUnit(p.lengthUnit || 'm');
    setMassKg(p.mass || (element.physicsType === 'mru_cart' || currIsMruv ? 1.5 : currIsFfBody ? 1.0 : currIsVertProj || currIsHzProj || currIsOblique ? 0.5 : 100));
  }, [element]);

  // Compute live conversions for velocity
  const numVel = parseFloat(velocityValue) || 0;
  let velMs = numVel;
  let velKmh = numVel * 3.6;
  let velMih = numVel * CONVERSIONS.MS_TO_MIH;

  if (velocityUnit === 'km/h') {
    velMs = numVel / 3.6;
    velKmh = numVel;
    velMih = numVel / 1.609344;
  } else if (velocityUnit === 'mi/h') {
    velMs = numVel * CONVERSIONS.MIH_TO_MS;
    velKmh = numVel * 1.609344;
    velMih = numVel;
  }

  const handleSave = (e) => {
    if (e) e.preventDefault();

    let updatedProperties = { ...props };
    let updatedElement = { ...element };

    if (element.physicsType === 'mru_cart') {
      let simVel = velMs;
      if (Math.abs(velMs) > 15) {
        simVel = Math.sign(velMs) * (15 + Math.log10(Math.abs(velMs) / 15) * 6);
      }

      updatedProperties = {
        ...updatedProperties,
        label,
        velocity: simVel, // Internal physics engine velocity
        initialVelocity: simVel,
        effectiveSpeedMs: +velMs.toFixed(3),
        displayVelocity: numVel,
        unit: velocityUnit,
        mass: parseFloat(massKg) || 1.5,
        departureTime: departureTime.trim(),
        showVector,
        color,
      };
      updatedElement.color = color;
    } else if (element.physicsType === 'mruv_cart') {
      const numAccel = parseFloat(accelerationValue) || 0;
      let simV0 = velMs;
      if (Math.abs(velMs) > 15) {
        simV0 = Math.sign(velMs) * (15 + Math.log10(Math.abs(velMs) / 15) * 6);
      }

      updatedProperties = {
        ...updatedProperties,
        label,
        velocity: simV0, // initial velocity v0 in m/s
        initialVelocity: simV0,
        acceleration: numAccel,
        effectiveSpeedMs: +velMs.toFixed(3),
        displayVelocity: numVel,
        unit: velocityUnit,
        accelUnit: 'm/s²',
        mass: parseFloat(massKg) || 1.5,
        departureTime: departureTime.trim(),
        showVector,
        showAccelVector,
        color,
      };
      updatedElement.color = color;
    } else if (element.physicsType === 'freefall_body') {
      const numG = parseFloat(gravityValue) || 9.8;
      const numH = parseFloat(releaseHeightValue) || 50.0;
      let simV0 = velMs;
      if (Math.abs(velMs) > 15) {
        simV0 = Math.sign(velMs) * (15 + Math.log10(Math.abs(velMs) / 15) * 6);
      }

      updatedProperties = {
        ...updatedProperties,
        label,
        velocity: simV0,
        initialVelocity: simV0,
        gravity: numG,
        releaseHeight: numH,
        displayVelocity: numVel,
        unit: velocityUnit,
        mass: parseFloat(massKg) || 1.0,
        showVector,
        showGravityVector,
        color,
      };
      updatedElement.color = color;
    } else if (element.physicsType === 'vertical_projectile') {
      const numG = parseFloat(gravityValue) || 9.8;
      let simV0 = velMs;
      if (Math.abs(velMs) > 35) {
        simV0 = Math.sign(velMs) * (35 + Math.log10(Math.abs(velMs) / 35) * 8);
      }

      updatedProperties = {
        ...updatedProperties,
        label,
        velocity: simV0,
        initialVelocity: simV0,
        gravity: numG,
        displayVelocity: numVel,
        unit: velocityUnit,
        mass: parseFloat(massKg) || 0.5,
        showVector,
        showGravityVector,
        color,
      };
      updatedElement.color = color;
    } else if (element.physicsType === 'horizontal_projectile') {
      const numG = parseFloat(gravityValue) || 9.8;
      const numH = parseFloat(heightMetersValue) || 20.0;
      let simV0 = velMs;
      if (Math.abs(velMs) > 40) {
        simV0 = Math.sign(velMs) * (40 + Math.log10(Math.abs(velMs) / 40) * 10);
      }

      updatedProperties = {
        ...updatedProperties,
        label,
        velocity: simV0,
        initialVelocity: simV0,
        heightMeters: numH,
        gravity: numG,
        displayVelocity: numVel,
        unit: velocityUnit,
        mass: parseFloat(massKg) || 1.0,
        showVector,
        showResultantVector,
        showTrajectory,
        color,
      };
      updatedElement.color = color;
    } else if (element.physicsType === 'cannon_launcher') {
      const numAngle = parseFloat(angleDegValue) || 45.0;
      const numH = parseFloat(heightMetersValue) || 0.0;
      const numG = parseFloat(gravityValue) || 9.8;
      let simV0 = velMs;
      if (Math.abs(velMs) > 40) {
        simV0 = Math.sign(velMs) * (40 + Math.log10(Math.abs(velMs) / 40) * 10);
      }
      updatedProperties = {
        ...updatedProperties,
        label,
        angleDeg: numAngle,
        initialVelocity: simV0,
        velocity: simV0,
        displayVelocity: numVel,
        unit: velocityUnit,
        gravity: numG,
        launchHeightMeters: numH,
        color,
      };
      updatedElement.color = color;
    } else if (element.physicsType === 'oblique_projectile') {
      const numAngle = parseFloat(angleDegValue) || 45.0;
      const numH = parseFloat(heightMetersValue) || 0.0;
      const numG = parseFloat(gravityValue) || 9.8;
      let simV0 = velMs;
      if (Math.abs(velMs) > 40) {
        simV0 = Math.sign(velMs) * (40 + Math.log10(Math.abs(velMs) / 40) * 10);
      }
      const rad = (numAngle * Math.PI) / 180;
      const v0x = simV0 * Math.cos(rad);
      const v0y = simV0 * Math.sin(rad);
      updatedProperties = {
        ...updatedProperties,
        label,
        angleDeg: numAngle,
        initialVelocity: simV0,
        velocity: simV0,
        displayVelocity: numVel,
        unit: velocityUnit,
        vx: v0x,
        vy: v0y,
        vResultant: simV0,
        gravity: numG,
        launchHeightMeters: numH,
        mass: parseFloat(massKg) || 0.5,
        showVector,
        showTrajectory,
        color,
      };
      updatedElement.color = color;
    } else if (element.physicsType === 'target_wall') {
      const parsedD = parseFloat(targetDistanceValue) || 50.0;
      const parsedH = parseFloat(targetHeightValue) || 10.0;
      updatedProperties = {
        ...updatedProperties,
        label,
        distanceMeters: parsedD,
        targetHeightMeters: parsedH,
        color,
      };
      updatedElement.color = color;
    } else if (element.physicsType === 'cliff_platform') {
      const parsedH = parseFloat(trackLength) || 20.0;
      updatedProperties = {
        ...updatedProperties,
        label,
        heightMeters: parsedH,
      };
      const newHeight = Math.max(160, Math.min(600, Math.round(parsedH * 13)));
      updatedElement.height = newHeight;
    } else if (element.physicsType === 'freefall_tower') {
      const parsedH = parseFloat(trackLength) || 50.0;
      updatedProperties = {
        ...updatedProperties,
        label,
        heightMeters: parsedH,
      };
      const newHeight = Math.max(260, Math.min(800, Math.round(parsedH * 8.5)));
      updatedElement.height = newHeight;
    } else if (element.physicsType === 'mru_track') {
      const parsedLen = parseFloat(trackLength) || 6.0;
      updatedProperties = {
        ...updatedProperties,
        label,
        lengthMeters: parsedLen,
        lengthUnit: trackUnit,
      };
      // Keep canvas track width comfortably scaled to meters
      const newWidth = Math.max(420, Math.min(1400, Math.round(parsedLen * 95)));
      updatedElement.width = newWidth;
    } else if (element.physicsType === 'mass') {
      updatedProperties = {
        ...updatedProperties,
        label,
        mass: parseFloat(massKg) || 100,
        color,
      };
      updatedElement.color = color;
    } else if (element.physicsType === 'mru_photogate') {
      updatedProperties = {
        ...updatedProperties,
        gateName: label,
        label,
      };
    }

    updatedElement.properties = updatedProperties;
    onUpdateElement(updatedElement);
    onClose();
  };

  const presetColors = [
    '#0284c7', // Blue
    '#0ea5e9', // Sky
    '#16a34a', // Emerald
    '#f59e0b', // Amber
    '#dc2626', // Red
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#334155', // Slate
  ];

  return (
    <div className="inspector-modal-backdrop" onClick={onClose}>
      <div className="inspector-modal-card miro-island" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="inspector-header">
          <div className="inspector-title-cluster">
            <div className={`inspector-icon-badge ${isMruv ? 'mruv' : isFreefallBody ? 'freefall' : isVerticalProj ? 'vertical' : isHorizontalProj ? 'horizontal' : isCannon || isObliqueProj ? 'oblique' : ''}`}>
              {element.physicsType === 'mru_cart' && <Gauge size={17} />}
              {element.physicsType === 'mruv_cart' && <TrendingUp size={17} />}
              {element.physicsType === 'freefall_body' && <ArrowDownCircle size={17} />}
              {element.physicsType === 'vertical_projectile' && <ArrowUpCircle size={17} />}
              {element.physicsType === 'horizontal_projectile' && <Navigation size={17} />}
              {element.physicsType === 'cannon_launcher' && <Target size={17} />}
              {element.physicsType === 'oblique_projectile' && <Target size={17} />}
              {element.physicsType === 'target_wall' && <Layers size={17} />}
              {element.physicsType === 'cliff_platform' && <Layers size={17} />}
              {element.physicsType === 'freefall_tower' && <Layers size={17} />}
              {element.physicsType === 'mru_track' && <Layers size={17} />}
              {element.physicsType === 'mru_photogate' && <Timer size={17} />}
              {element.physicsType === 'mass' && <Weight size={17} />}
            </div>
            <div>
              <span className="inspector-badge">
                {isMruv && 'Cinemática MRUV • Aceleración Constante'}
                {isMru && 'Cinemática MRU • Velocidad Constante'}
                {element.physicsType === 'freefall_body' && 'Cinemática Caída Libre • Gravedad Constante'}
                {element.physicsType === 'vertical_projectile' && 'Cinemática Tiro Vertical • Lanzamiento Hacia Arriba'}
                {element.physicsType === 'horizontal_projectile' && 'Cinemática 2D • Lanzamiento Horizontal'}
                {element.physicsType === 'cannon_launcher' && 'Cañón de Laboratorio • Tiro Parabólico Oblicuo'}
                {element.physicsType === 'oblique_projectile' && 'Cinemática 2D • Movimiento de Proyectiles (HT02)'}
                {element.physicsType === 'target_wall' && 'Objetivo / Blanco de Impacto'}
                {element.physicsType === 'cliff_platform' && 'Plataforma de Lanzamiento • Acantilado'}
                {element.physicsType === 'freefall_tower' && 'Instrumento Vertical • Torre Graduada'}
                {element.physicsType === 'mru_track' && 'Instrumento de Medición'}
                {element.physicsType === 'mru_photogate' && 'Sensor de Cronometraje'}
                {element.physicsType === 'mass' && 'Dinámica de Cuerpos'}
              </span>
              <h3 className="inspector-title">
                {element.physicsType === 'mru_cart' && 'Configuración de Móvil MRU'}
                {element.physicsType === 'mruv_cart' && 'Configuración de Móvil MRUV'}
                {element.physicsType === 'freefall_body' && 'Configuración de Cuerpo en Caída Libre'}
                {element.physicsType === 'vertical_projectile' && 'Configuración de Proyectil Vertical'}
                {element.physicsType === 'horizontal_projectile' && 'Configuración de Proyectil Horizontal'}
                {element.physicsType === 'cannon_launcher' && 'Configuración de Cañón Parabólico'}
                {element.physicsType === 'oblique_projectile' && 'Configuración de Proyectil Oblicuo (2D)'}
                {element.physicsType === 'target_wall' && 'Configuración de Muro Objetivo'}
                {element.physicsType === 'cliff_platform' && 'Configuración de Acantilado'}
                {element.physicsType === 'freefall_tower' && 'Configuración de Torre de Caída Libre'}
                {element.physicsType === 'mru_track' && 'Configuración de Riel Graduado'}
                {element.physicsType === 'mru_photogate' && 'Configuración de Fotopuerta'}
                {element.physicsType === 'mass' && 'Configuración de Masa Inercial'}
              </h3>
            </div>
          </div>
          <button className="inspector-close-btn" onClick={onClose} title="Cerrar (Esc)">
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <form className="inspector-body" onSubmit={handleSave}>
          {/* 1. Object Name / Label */}
          <div className="inspector-field">
            <label className="inspector-label">Nombre o Etiqueta:</label>
            <input
              type="text"
              className="inspector-input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ej: Automóvil, Móvil 1, Lancha, Guepardo..."
              autoFocus
            />
          </div>

          {/* ------------------------------------------------------------- */}
          {/* 2. MRU CART SPECIFIC FIELDS (VELOCIDAD CONSTANTE v, a = 0)   */}
          {/* ------------------------------------------------------------- */}
          {element.physicsType === 'mru_cart' && (
            <>
              {/* Velocity & Unit */}
              <div className="inspector-field">
                <div className="inspector-field-header">
                  <label className="inspector-label">Velocidad Constante (v):</label>
                  <span className="field-badge-mru">a = 0</span>
                </div>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="any"
                    className="inspector-input number-input"
                    value={velocityValue}
                    onChange={(e) => setVelocityValue(e.target.value)}
                    placeholder="Ej: 2, 4, 5, 20..."
                    required
                  />
                  <select
                    className="inspector-select"
                    value={velocityUnit}
                    onChange={(e) => setVelocityUnit(e.target.value)}
                  >
                    <option value="m/s">m/s (metros/seg)</option>
                    <option value="km/h">km/h</option>
                    <option value="mi/h">mi/h (millas/h)</option>
                  </select>
                </div>

                {/* Quick Speed Preset Buttons */}
                <div className="quick-presets-row">
                  <span className="quick-presets-label">Rápidos:</span>
                  {[
                    { label: '1 m/s (Lento)', v: 1.0 },
                    { label: '2 m/s (Normal)', v: 2.0 },
                    { label: '4 m/s (Rápido)', v: 4.0 },
                    { label: '6 m/s', v: 6.0 },
                    { label: '-2 m/s (Reversa)', v: -2.0 },
                  ].map((p, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      className={`quick-pill-btn ${Math.abs(numVel - p.v) < 0.01 && velocityUnit === 'm/s' ? 'active' : ''}`}
                      onClick={() => {
                        setVelocityValue(p.v);
                        setVelocityUnit('m/s');
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Live Conversions Display */}
                <div className="live-conversions-box">
                  <Sparkles size={13} className="sparkle-icon" />
                  <span>
                    Equivale a: <strong>{velMs.toFixed(2)} m/s</strong> • <strong>{velKmh.toFixed(1)} km/h</strong> • <strong>{velMih.toFixed(2)} mi/h</strong>
                  </span>
                </div>
              </div>

              {/* Mass */}
              <div className="inspector-field">
                <label className="inspector-label">Masa del Móvil (kg):</label>
                <input
                  type="number"
                  step="any"
                  className="inspector-input"
                  value={massKg}
                  onChange={(e) => setMassKg(e.target.value)}
                  placeholder="Ej: 1.5 kg"
                />
              </div>

              {/* Departure Time */}
              <div className="inspector-field">
                <label className="inspector-label">
                  Hora de Salida / Desfase (opcional):
                </label>
                <div className="time-input-row">
                  <Clock size={15} className="field-inner-icon" />
                  <input
                    type="text"
                    className="inspector-input with-icon"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    placeholder="Ej: 5:40 am, 10:55, 9:36, 2.25 h..."
                  />
                </div>
              </div>

              {/* Show Velocity Vector Toggle */}
              <div className="inspector-field checkbox-field">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={showVector}
                    onChange={(e) => setShowVector(e.target.checked)}
                  />
                  <span>Mostrar Vector Velocidad (<strong style={{ color: '#10b981' }}>v⃗</strong>)</span>
                </label>
              </div>

              {/* Color Palette */}
              <div className="inspector-field">
                <label className="inspector-label">Color del Móvil:</label>
                <div className="color-palette-row">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`color-swatch-btn ${color === c ? 'active' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    >
                      {color === c && <Check size={12} color="#ffffff" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* 3. MRUV CART SPECIFIC FIELDS (VELOCIDAD v0 Y ACELERACIÓN a)  */}
          {/* ------------------------------------------------------------- */}
          {element.physicsType === 'mruv_cart' && (
            <>
              {/* Initial Velocity v0 */}
              <div className="inspector-field">
                <div className="inspector-field-header">
                  <label className="inspector-label">Velocidad Inicial (v₀):</label>
                  <span className="field-badge-mruv">v(t) = v₀ + a·t</span>
                </div>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="any"
                    className="inspector-input number-input"
                    value={velocityValue}
                    onChange={(e) => setVelocityValue(e.target.value)}
                    placeholder="Ej: 0, 2, 4, 15, 30..."
                    required
                  />
                  <select
                    className="inspector-select"
                    value={velocityUnit}
                    onChange={(e) => setVelocityUnit(e.target.value)}
                  >
                    <option value="m/s">m/s (metros/seg)</option>
                    <option value="km/h">km/h</option>
                    <option value="mi/h">mi/h (millas/h)</option>
                  </select>
                </div>

                {/* Quick v0 Presets */}
                <div className="quick-presets-row">
                  <span className="quick-presets-label">Rápidos v₀:</span>
                  {[
                    { label: '0 m/s (Reposo)', v: 0.0 },
                    { label: '2 m/s', v: 2.0 },
                    { label: '4 m/s', v: 4.0 },
                    { label: '15 m/s (Autopista)', v: 15.0 },
                    { label: '30 m/s', v: 30.0 },
                  ].map((p, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      className={`quick-pill-btn ${Math.abs(numVel - p.v) < 0.01 && velocityUnit === 'm/s' ? 'active' : ''}`}
                      onClick={() => {
                        setVelocityValue(p.v);
                        setVelocityUnit('m/s');
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Live Conversions Display */}
                <div className="live-conversions-box">
                  <Sparkles size={13} className="sparkle-icon" />
                  <span>
                    v₀ equivale a: <strong>{velMs.toFixed(2)} m/s</strong> • <strong>{velKmh.toFixed(1)} km/h</strong> • <strong>{velMih.toFixed(2)} mi/h</strong>
                  </span>
                </div>
              </div>

              {/* Constant Acceleration a */}
              <div className="inspector-field">
                <div className="inspector-field-header">
                  <label className="inspector-label">Aceleración Constante (a en m/s²):</label>
                  <span className="field-badge-accel">a = cte</span>
                </div>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="any"
                    className="inspector-input number-input"
                    value={accelerationValue}
                    onChange={(e) => setAccelerationValue(e.target.value)}
                    placeholder="Ej: 2.0, 4.0, 5.0, -3.0..."
                    required
                  />
                  <div className="static-unit-box">m/s²</div>
                </div>

                {/* Quick Acceleration Presets */}
                <div className="quick-presets-row">
                  <span className="quick-presets-label">Rápidos a:</span>
                  {[
                    { label: '0 (MRU)', a: 0.0 },
                    { label: '+1.0 m/s²', a: 1.0 },
                    { label: '+2.0 m/s²', a: 2.0 },
                    { label: '+4.0 m/s²', a: 4.0 },
                    { label: '+5.0 m/s²', a: 5.0 },
                    { label: '+7.41 m/s² (Guepardo)', a: 7.41 },
                    { label: '-2.0 m/s² (Freno)', a: -2.0 },
                    { label: '-5.0 m/s² (Freno autopista)', a: -5.0 },
                  ].map((p, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      className={`quick-pill-btn ${Math.abs(parseFloat(accelerationValue) - p.a) < 0.01 ? 'active' : ''}`}
                      onClick={() => setAccelerationValue(p.a)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <span className="field-hint">
                  {parseFloat(accelerationValue) > 0 && '⚡ Valor positivo: acelera hacia la derecha (+x aumentando rapidez).'}
                  {parseFloat(accelerationValue) < 0 && '🛑 Valor negativo: desacelera / frena el vehículo (flecha opuesta).'}
                  {parseFloat(accelerationValue) === 0 && '⚖️ Aceleración nula: el móvil mantiene velocidad constante (MRU).'}
                </span>
              </div>

              {/* Mass */}
              <div className="inspector-field">
                <label className="inspector-label">Masa del Móvil (kg):</label>
                <input
                  type="number"
                  step="any"
                  className="inspector-input"
                  value={massKg}
                  onChange={(e) => setMassKg(e.target.value)}
                  placeholder="Ej: 1.5 kg"
                />
              </div>

              {/* Vector Toggles */}
              <div className="inspector-vectors-group">
                <div className="inspector-field checkbox-field">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={showVector}
                      onChange={(e) => setShowVector(e.target.checked)}
                    />
                    <span>Mostrar Vector Velocidad (<strong style={{ color: '#10b981' }}>v⃗</strong>, verde esmeralda)</span>
                  </label>
                </div>

                <div className="inspector-field checkbox-field">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={showAccelVector}
                      onChange={(e) => setShowAccelVector(e.target.checked)}
                    />
                    <span>Mostrar Vector Aceleración (<strong style={{ color: '#f59e0b' }}>a⃗</strong>, ámbar naranja)</span>
                  </label>
                </div>
              </div>

              {/* Color Palette */}
              <div className="inspector-field">
                <label className="inspector-label">Color del Móvil:</label>
                <div className="color-palette-row">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`color-swatch-btn ${color === c ? 'active' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    >
                      {color === c && <Check size={12} color="#ffffff" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* 4. TRACK SPECIFIC FIELDS                                      */}
          {/* ------------------------------------------------------------- */}
          {element.physicsType === 'mru_track' && (
            <>
              <div className="inspector-field">
                <label className="inspector-label">Longitud de la Pista / Riel:</label>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="any"
                    className="inspector-input"
                    value={trackLength}
                    onChange={(e) => setTrackLength(e.target.value)}
                    placeholder="Ej: 6.0, 8.0, 10.0..."
                    required
                  />
                  <select
                    className="inspector-select"
                    value={trackUnit}
                    onChange={(e) => setTrackUnit(e.target.value)}
                  >
                    <option value="m">metros (m)</option>
                    <option value="km">kilómetros (km)</option>
                    <option value="mi">millas (mi)</option>
                  </select>
                </div>
                <span className="field-hint">
                  El riel se escala visualmente en el lienzo con regla milimétrica y topes elásticos en los extremos.
                </span>
              </div>
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* 5. MASS SPECIFIC FIELDS (ATWOOD)                              */}
          {/* ------------------------------------------------------------- */}
          {element.physicsType === 'mass' && (
            <>
              <div className="inspector-field">
                <label className="inspector-label">Masa Inercial (kg):</label>
                <input
                  type="number"
                  step="any"
                  className="inspector-input"
                  value={massKg}
                  onChange={(e) => setMassKg(e.target.value)}
                  placeholder="Ej: 100, 60, 25..."
                  required
                />
              </div>

              <div className="inspector-field">
                <label className="inspector-label">Color:</label>
                <div className="color-palette-row">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`color-swatch-btn ${color === c ? 'active' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    >
                      {color === c && <Check size={12} color="#ffffff" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* 5.1 CAÍDA LIBRE ESFERA / CUERPO ESPECÍFICO (v0, g, h, vectores) */}
          {/* ------------------------------------------------------------- */}
          {element.physicsType === 'freefall_body' && (
            <>
              {/* Initial Velocity */}
              <div className="inspector-field">
                <div className="inspector-field-header">
                  <label className="inspector-label">Velocidad Inicial hacia abajo (v₀):</label>
                  <span className="field-badge-mruv">v₀ hacia abajo</span>
                </div>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="any"
                    className="inspector-input number-input"
                    value={velocityValue}
                    onChange={(e) => setVelocityValue(e.target.value)}
                    placeholder="0.0"
                  />
                  <select
                    className="inspector-select"
                    value={velocityUnit}
                    onChange={(e) => setVelocityUnit(e.target.value)}
                  >
                    <option value="m/s">m/s</option>
                    <option value="km/h">km/h</option>
                  </select>
                </div>
                <div className="quick-presets-row">
                  <span className="quick-presets-label">Valores HT03:</span>
                  <button
                    type="button"
                    className={`quick-pill-btn ${numVel === 0 ? 'active' : ''}`}
                    onClick={() => {
                      setVelocityValue(0);
                      setVelocityUnit('m/s');
                    }}
                  >
                    Reposo (v₀ = 0)
                  </button>
                  <button
                    type="button"
                    className={`quick-pill-btn ${numVel === 6 ? 'active' : ''}`}
                    onClick={() => {
                      setVelocityValue(6);
                      setVelocityUnit('m/s');
                    }}
                  >
                    6.0 m/s (P2)
                  </button>
                  <button
                    type="button"
                    className={`quick-pill-btn ${numVel === 8 ? 'active' : ''}`}
                    onClick={() => {
                      setVelocityValue(8);
                      setVelocityUnit('m/s');
                    }}
                  >
                    8.0 m/s (P8)
                  </button>
                </div>
              </div>

              {/* Gravity Acceleration (g) */}
              <div className="inspector-field">
                <div className="inspector-field-header">
                  <label className="inspector-label">Aceleración de la Gravedad (g):</label>
                  <span className="field-badge-accel">g = cte</span>
                </div>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="any"
                    className="inspector-input number-input"
                    value={gravityValue}
                    onChange={(e) => setGravityValue(e.target.value)}
                    placeholder="9.8"
                  />
                  <div className="static-unit-box">m/s²</div>
                </div>
                <div className="quick-presets-row">
                  <span className="quick-presets-label">Entornos gravitatorios:</span>
                  <button
                    type="button"
                    className={`quick-pill-btn ${parseFloat(gravityValue) === 9.8 ? 'active' : ''}`}
                    onClick={() => setGravityValue(9.8)}
                  >
                    Tierra (9.8 m/s²)
                  </button>
                  <button
                    type="button"
                    className={`quick-pill-btn ${parseFloat(gravityValue) === 1.62 ? 'active' : ''}`}
                    onClick={() => setGravityValue(1.62)}
                  >
                    Luna (1.62 m/s²)
                  </button>
                  <button
                    type="button"
                    className={`quick-pill-btn ${parseFloat(gravityValue) === 3.72 ? 'active' : ''}`}
                    onClick={() => setGravityValue(3.72)}
                  >
                    Marte (3.72 m/s²)
                  </button>
                  <button
                    type="button"
                    className={`quick-pill-btn ${parseFloat(gravityValue) === 24.79 ? 'active' : ''}`}
                    onClick={() => setGravityValue(24.79)}
                  >
                    Júpiter (24.8 m/s²)
                  </button>
                </div>
              </div>

              {/* Release Height (h) */}
              <div className="inspector-field">
                <div className="inspector-field-header">
                  <label className="inspector-label">Altura de Caída (h):</label>
                  <span className="field-badge-mru">h = ½gt²</span>
                </div>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="any"
                    className="inspector-input number-input"
                    value={releaseHeightValue}
                    onChange={(e) => setReleaseHeightValue(e.target.value)}
                    placeholder="50.0"
                  />
                  <div className="static-unit-box">m</div>
                </div>
                <div className="quick-presets-row">
                  <span className="quick-presets-label">Alturas HT03:</span>
                  <button
                    type="button"
                    className={`quick-pill-btn ${parseFloat(releaseHeightValue) === 18 ? 'active' : ''}`}
                    onClick={() => setReleaseHeightValue(18)}
                  >
                    18 m (P1)
                  </button>
                  <button
                    type="button"
                    className={`quick-pill-btn ${parseFloat(releaseHeightValue) === 25 ? 'active' : ''}`}
                    onClick={() => setReleaseHeightValue(25)}
                  >
                    25 m (P8)
                  </button>
                  <button
                    type="button"
                    className={`quick-pill-btn ${parseFloat(releaseHeightValue) === 40 ? 'active' : ''}`}
                    onClick={() => setReleaseHeightValue(40)}
                  >
                    40 m (P2)
                  </button>
                  <button
                    type="button"
                    className={`quick-pill-btn ${parseFloat(releaseHeightValue) === 50 ? 'active' : ''}`}
                    onClick={() => setReleaseHeightValue(50)}
                  >
                    50 m (P5)
                  </button>
                  <button
                    type="button"
                    className={`quick-pill-btn ${parseFloat(releaseHeightValue) === 120 ? 'active' : ''}`}
                    onClick={() => setReleaseHeightValue(120)}
                  >
                    120 m (P3)
                  </button>
                </div>
              </div>

              {/* Mass (Inertia) */}
              <div className="inspector-field">
                <label className="inspector-label">Masa de la Esfera (kg):</label>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    className="inspector-input number-input"
                    value={massKg}
                    onChange={(e) => setMassKg(e.target.value)}
                    placeholder="1.0"
                  />
                  <div className="static-unit-box">kg</div>
                </div>
                <span className="field-hint">
                  En el vacío, la caída libre es estrictamente independiente de la masa (Galileo Galilei).
                </span>
              </div>

              {/* Vectors */}
              <div className="inspector-vectors-group">
                <label className="inspector-label">Vectores Gráficos:</label>
                <div className="checkbox-field">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={showVector}
                      onChange={(e) => setShowVector(e.target.checked)}
                    />
                    <span>Mostrar vector velocidad descendente (v⃗ verde)</span>
                  </label>
                </div>
                <div className="checkbox-field">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={showGravityVector}
                      onChange={(e) => setShowGravityVector(e.target.checked)}
                    />
                    <span>Mostrar vector gravedad acelerador (g⃗ naranja)</span>
                  </label>
                </div>
              </div>

              {/* Color */}
              <div className="inspector-field">
                <label className="inspector-label">Color del Cuerpo:</label>
                <div className="color-palette-row">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`color-swatch-btn ${color === c ? 'active' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    >
                      {color === c && <Check size={12} color="#ffffff" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* 5.2 CAÍDA LIBRE TORRE GRADUADA (heightMeters)                */}
          {/* ------------------------------------------------------------- */}
          {element.physicsType === 'freefall_tower' && (
            <>
              <div className="inspector-field">
                <div className="inspector-field-header">
                  <label className="inspector-label">Altura Graduada de la Torre (m):</label>
                  <span className="field-badge-mru">Escala Vertical</span>
                </div>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="any"
                    className="inspector-input number-input"
                    value={trackLength}
                    onChange={(e) => setTrackLength(e.target.value)}
                    placeholder="50.0"
                  />
                  <div className="static-unit-box">metros</div>
                </div>
                <div className="quick-presets-row">
                  <span className="quick-presets-label">Alturas Estándar:</span>
                  <button
                    type="button"
                    className={`quick-pill-btn ${parseFloat(trackLength) === 25 ? 'active' : ''}`}
                    onClick={() => setTrackLength(25)}
                  >
                    25 m (Corta)
                  </button>
                  <button
                    type="button"
                    className={`quick-pill-btn ${parseFloat(trackLength) === 50 ? 'active' : ''}`}
                    onClick={() => setTrackLength(50)}
                  >
                    50 m (Estándar)
                  </button>
                  <button
                    type="button"
                    className={`quick-pill-btn ${parseFloat(trackLength) === 120 ? 'active' : ''}`}
                    onClick={() => setTrackLength(120)}
                  >
                    120 m (Alta HT03)
                  </button>
                </div>
                <span className="field-hint">
                  Estructura milimétrica con marcas de altura, plataforma superior de lanzamiento y base de amortiguamiento de impacto.
                </span>
              </div>
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* 5.3 TIRO VERTICAL PROYECTIL (v0 hacia arriba, g constante)    */}
          {/* ------------------------------------------------------------- */}
          {element.physicsType === 'vertical_projectile' && (
            <>
              {/* Initial Upward Velocity v0 & Unit */}
              <div className="inspector-field">
                <div className="inspector-field-header">
                  <label className="inspector-label">Velocidad Inicial Hacia Arriba (v₀):</label>
                  <span className="field-badge-mru">v(t) = v₀ - gt</span>
                </div>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="any"
                    className="inspector-input number-input"
                    value={velocityValue}
                    onChange={(e) => setVelocityValue(e.target.value)}
                    placeholder="20.0"
                    required
                  />
                  <select
                    className="inspector-select"
                    value={velocityUnit}
                    onChange={(e) => setVelocityUnit(e.target.value)}
                  >
                    <option value="m/s">m/s (metros/seg)</option>
                    <option value="km/h">km/h</option>
                    <option value="mi/h">mi/h (millas/h)</option>
                  </select>
                </div>

                {/* Quick Presets from HT04 */}
                <div className="quick-presets-row">
                  <span className="quick-presets-label">HT04:</span>
                  {[
                    { label: '20 m/s (P1/P7)', v: 20 },
                    { label: '24.5 m/s (P2)', v: 24.5 },
                    { label: '17.7 m/s (P3)', v: 17.71 },
                    { label: '2.94 m/s (P4)', v: 2.94 },
                    { label: '18 m/s (P5)', v: 18 },
                    { label: '30 m/s (P10)', v: 30 },
                    { label: '35 m/s (Luna P9)', v: 35 },
                    { label: '3.2 m/s (Luna P8)', v: 3.2 },
                  ].map((p, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      className={`quick-pill-btn ${parseFloat(velocityValue) === p.v ? 'active' : ''}`}
                      onClick={() => {
                        setVelocityValue(p.v);
                        setVelocityUnit('m/s');
                        if (p.label.includes('Luna')) {
                          setGravityValue(1.6);
                        } else {
                          setGravityValue(9.8);
                        }
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Live Conversions */}
                <div className="conversions-box">
                  <div className="conversion-item">
                    <span className="conv-label">SI (m/s):</span>
                    <span className="conv-value">{velMs.toFixed(2)} m/s</span>
                  </div>
                  <div className="conversion-item">
                    <span className="conv-label">km/h:</span>
                    <span className="conv-value">{velKmh.toFixed(2)} km/h</span>
                  </div>
                  <div className="conversion-item">
                    <span className="conv-label">mi/h:</span>
                    <span className="conv-value">{velMih.toFixed(2)} mi/h</span>
                  </div>
                </div>
              </div>

              {/* Gravitational Deceleration (g) */}
              <div className="inspector-field">
                <div className="inspector-field-header">
                  <label className="inspector-label">Aceleración Gravitatoria (g):</label>
                  <span className="field-badge-mru">Deceleración</span>
                </div>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="0.01"
                    className="inspector-input number-input"
                    value={gravityValue}
                    onChange={(e) => setGravityValue(e.target.value)}
                    placeholder="9.8"
                    required
                  />
                  <div className="static-unit-box">m/s²</div>
                </div>
                <div className="quick-presets-row">
                  <span className="quick-presets-label">Entorno:</span>
                  <button
                    type="button"
                    className={`quick-pill-btn ${parseFloat(gravityValue) === 9.8 ? 'active' : ''}`}
                    onClick={() => setGravityValue(9.8)}
                  >
                    9.80 m/s² (Tierra)
                  </button>
                  <button
                    type="button"
                    className={`quick-pill-btn ${parseFloat(gravityValue) === 1.6 ? 'active' : ''}`}
                    onClick={() => setGravityValue(1.6)}
                  >
                    1.60 m/s² (Luna HT04 P8/P9)
                  </button>
                </div>
              </div>

              {/* Theoretical Apex Kinematics Card */}
              {(() => {
                const gVal = Math.max(0.01, parseFloat(gravityValue) || 9.8);
                const v0Val = Math.max(0, velMs);
                const hMaxCalc = (v0Val * v0Val) / (2 * gVal);
                const tSubidaCalc = v0Val / gVal;
                const tVueloCalc = 2 * tSubidaCalc;
                return (
                  <div className="conversions-box" style={{ background: '#f5f3ff', borderColor: '#ddd6fe' }}>
                    <div className="conversion-item">
                      <span className="conv-label" style={{ color: '#6d28d9' }}>h_max (Cúspide):</span>
                      <span className="conv-value" style={{ color: '#4c1d95', fontWeight: 800 }}>{hMaxCalc.toFixed(2)} m</span>
                    </div>
                    <div className="conversion-item">
                      <span className="conv-label" style={{ color: '#6d28d9' }}>t_subida:</span>
                      <span className="conv-value" style={{ color: '#4c1d95', fontWeight: 800 }}>{tSubidaCalc.toFixed(2)} s</span>
                    </div>
                    <div className="conversion-item">
                      <span className="conv-label" style={{ color: '#6d28d9' }}>T_vuelo total:</span>
                      <span className="conv-value" style={{ color: '#4c1d95', fontWeight: 800 }}>{tVueloCalc.toFixed(2)} s</span>
                    </div>
                  </div>
                );
              })()}

              {/* Mass (Inertia) */}
              <div className="inspector-field">
                <label className="inspector-label">Masa del Proyectil (kg):</label>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    className="inspector-input number-input"
                    value={massKg}
                    onChange={(e) => setMassKg(e.target.value)}
                    placeholder="0.5"
                  />
                  <div className="static-unit-box">kg</div>
                </div>
              </div>

              {/* Vectors */}
              <div className="inspector-vectors-group">
                <label className="inspector-label">Vectores Gráficos:</label>
                <div className="checkbox-field">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={showVector}
                      onChange={(e) => setShowVector(e.target.checked)}
                    />
                    <span>Mostrar vector velocidad dinámico (v⃗ verde ↑/↓)</span>
                  </label>
                </div>
                <div className="checkbox-field">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={showGravityVector}
                      onChange={(e) => setShowGravityVector(e.target.checked)}
                    />
                    <span>Mostrar vector gravedad constante (g⃗ naranja ↓)</span>
                  </label>
                </div>
              </div>

              {/* Color */}
              <div className="inspector-field">
                <label className="inspector-label">Color del Proyectil:</label>
                <div className="color-palette-row">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`color-swatch-btn ${color === c ? 'active' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    >
                      {color === c && <Check size={12} color="#ffffff" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* 5.3 LANZAMIENTO HORIZONTAL (HT01) PROYECTIL (vx, h, g, vectores) */}
          {/* ------------------------------------------------------------- */}
          {element.physicsType === 'horizontal_projectile' && (
            <>
              {/* Horizontal Initial Velocity */}
              <div className="inspector-field">
                <div className="inspector-field-header">
                  <label className="inspector-label">Velocidad Horizontal Inicial (v₀x):</label>
                  <span className="field-badge-mru">MRU (vx = cte)</span>
                </div>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="any"
                    className="inspector-input number-input"
                    value={velocityValue}
                    onChange={(e) => setVelocityValue(e.target.value)}
                    placeholder="20.0"
                    required
                  />
                  <select
                    className="inspector-select"
                    value={velocityUnit}
                    onChange={(e) => setVelocityUnit(e.target.value)}
                  >
                    <option value="m/s">m/s</option>
                    <option value="km/h">km/h</option>
                    <option value="mi/h">mi/h</option>
                  </select>
                </div>
                {/* HT01 Quick Presets */}
                <div className="quick-presets-row">
                  <span className="quick-presets-label">Valores HT01:</span>
                  {[
                    { label: '40 m/s (P1)', v: 40.0, h: 150 },
                    { label: '2.56 m/s (P2)', v: 2.56, h: 3 },
                    { label: '4 m/s (P3)', v: 4.0, h: 10 },
                    { label: '120 m/s (P4)', v: 120.0, h: 78.4 },
                    { label: '41.7 m/s (P6)', v: 41.67, h: 7.06 },
                    { label: '9 m/s (P7)', v: 9.0, h: 11.03 },
                    { label: '7 m/s (P8)', v: 7.0, h: 15 },
                    { label: '990 m/s (P10)', v: 990.0, h: 20 },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`quick-pill-btn ${Math.abs(parseFloat(velocityValue) - p.v) < 0.1 ? 'active' : ''}`}
                      onClick={() => {
                        setVelocityValue(p.v);
                        setVelocityUnit('m/s');
                        setHeightMetersValue(p.h);
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Live Conversions */}
                <div className="conversions-box">
                  <div className="conversion-item">
                    <span className="conv-label">SI (m/s):</span>
                    <span className="conv-value">{velMs.toFixed(2)} m/s</span>
                  </div>
                  <div className="conversion-item">
                    <span className="conv-label">km/h:</span>
                    <span className="conv-value">{velKmh.toFixed(2)} km/h</span>
                  </div>
                  <div className="conversion-item">
                    <span className="conv-label">mi/h:</span>
                    <span className="conv-value">{velMih.toFixed(2)} mi/h</span>
                  </div>
                </div>
              </div>

              {/* Launch Height */}
              <div className="inspector-field">
                <div className="inspector-field-header">
                  <label className="inspector-label">Altura de Lanzamiento (h):</label>
                  <span className="field-badge-accel">Caída Libre en Y</span>
                </div>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    className="inspector-input number-input"
                    value={heightMetersValue}
                    onChange={(e) => setHeightMetersValue(e.target.value)}
                    placeholder="20.0"
                    required
                  />
                  <div className="static-unit-box">m</div>
                </div>
                <div className="quick-presets-row">
                  <span className="quick-presets-label">Alturas HT01:</span>
                  {[20, 15, 10, 3, 78.4, 150].map((hVal) => (
                    <button
                      key={hVal}
                      type="button"
                      className={`quick-pill-btn ${parseFloat(heightMetersValue) === hVal ? 'active' : ''}`}
                      onClick={() => setHeightMetersValue(hVal)}
                    >
                      {hVal} m
                    </button>
                  ))}
                </div>
              </div>

              {/* Gravity */}
              <div className="inspector-field">
                <div className="inspector-field-header">
                  <label className="inspector-label">Aceleración Gravitatoria (g):</label>
                  <span className="field-badge-mru">g = cte</span>
                </div>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="0.01"
                    className="inspector-input number-input"
                    value={gravityValue}
                    onChange={(e) => setGravityValue(e.target.value)}
                    placeholder="9.8"
                    required
                  />
                  <div className="static-unit-box">m/s²</div>
                </div>
                <div className="quick-presets-row">
                  <span className="quick-presets-label">Entorno:</span>
                  <button
                    type="button"
                    className={`quick-pill-btn ${parseFloat(gravityValue) === 9.8 ? 'active' : ''}`}
                    onClick={() => setGravityValue(9.8)}
                  >
                    9.80 m/s² (Tierra)
                  </button>
                  <button
                    type="button"
                    className={`quick-pill-btn ${parseFloat(gravityValue) === 1.6 ? 'active' : ''}`}
                    onClick={() => setGravityValue(1.6)}
                  >
                    1.60 m/s² (Luna)
                  </button>
                </div>
              </div>

              {/* Theoretical Kinematics Card */}
              {(() => {
                const gVal = Math.max(0.01, parseFloat(gravityValue) || 9.8);
                const hVal = Math.max(0.1, parseFloat(heightMetersValue) || 20.0);
                const v0Val = Math.max(0, velMs);
                const tFlight = Math.sqrt((2 * hVal) / gVal);
                const rangeMax = v0Val * tFlight;
                const vyFinal = gVal * tFlight;
                const vImpact = Math.sqrt(v0Val * v0Val + vyFinal * vyFinal);
                const angleDeg = (Math.atan2(vyFinal, v0Val) * 180) / Math.PI;

                return (
                  <div className="conversions-box" style={{ background: '#f0f9ff', borderColor: '#bae6fd' }}>
                    <div className="conversion-item">
                      <span className="conv-label" style={{ color: '#0369a1' }}>t_vuelo (caída):</span>
                      <span className="conv-value" style={{ color: '#0c4a6e', fontWeight: 800 }}>{tFlight.toFixed(2)} s</span>
                    </div>
                    <div className="conversion-item">
                      <span className="conv-label" style={{ color: '#0369a1' }}>Alcance X_máx:</span>
                      <span className="conv-value" style={{ color: '#0c4a6e', fontWeight: 800 }}>{rangeMax.toFixed(2)} m</span>
                    </div>
                    <div className="conversion-item">
                      <span className="conv-label" style={{ color: '#0369a1' }}>v_impacto (suelo):</span>
                      <span className="conv-value" style={{ color: '#0c4a6e', fontWeight: 800 }}>{vImpact.toFixed(2)} m/s</span>
                    </div>
                    <div className="conversion-item">
                      <span className="conv-label" style={{ color: '#0369a1' }}>Ángulo impacto:</span>
                      <span className="conv-value" style={{ color: '#0c4a6e', fontWeight: 800 }}>{angleDeg.toFixed(1)}°</span>
                    </div>
                  </div>
                );
              })()}

              {/* Mass */}
              <div className="inspector-field">
                <label className="inspector-label">Masa del Proyectil (kg):</label>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    className="inspector-input number-input"
                    value={massKg}
                    onChange={(e) => setMassKg(e.target.value)}
                    placeholder="1.0"
                  />
                  <div className="static-unit-box">kg</div>
                </div>
              </div>

              {/* Graphic Vectors Toggles */}
              <div className="inspector-vectors-group">
                <label className="inspector-label">Vectores y Trazado Gráfico:</label>
                <div className="checkbox-field">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={showResultantVector}
                      onChange={(e) => setShowResultantVector(e.target.checked)}
                    />
                    <span>Mostrar vector resultante v⃗ (esmeralda tangente)</span>
                  </label>
                </div>
                <div className="checkbox-field">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={showVector}
                      onChange={(e) => setShowVector(e.target.checked)}
                    />
                    <span>Mostrar componentes vectoriales (v_x azul y v_y rojo)</span>
                  </label>
                </div>
                <div className="checkbox-field">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={showTrajectory}
                      onChange={(e) => setShowTrajectory(e.target.checked)}
                    />
                    <span>Trazar estela de parábola con puntos brillantes</span>
                  </label>
                </div>
              </div>

              {/* Color */}
              <div className="inspector-field">
                <label className="inspector-label">Color del Proyectil:</label>
                <div className="color-palette-row">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`color-swatch-btn ${color === c ? 'active' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    >
                      {color === c && <Check size={12} color="#ffffff" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* 5.4 CAÑÓN / PROYECTIL OBLICUO 2D (HT02)                       */}
          {/* ------------------------------------------------------------- */}
          {(element.physicsType === 'cannon_launcher' || element.physicsType === 'oblique_projectile') && (
            <>
              {/* Launch Angle theta */}
              <div className="inspector-field">
                <div className="inspector-field-header">
                  <label className="inspector-label">Ángulo de Elevación (θ en grados):</label>
                  <span className="field-badge-mru" style={{ background: '#f3e8ff', color: '#7c3aed', borderColor: '#d8b4fe' }}>
                    0° a 90° (Oblicuo)
                  </span>
                </div>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="0.5"
                    min="-89"
                    max="89"
                    className="inspector-input number-input"
                    value={angleDegValue}
                    onChange={(e) => setAngleDegValue(e.target.value)}
                    placeholder="45.0"
                    required
                  />
                  <div className="static-unit-box">grados (°)</div>
                </div>
                <div className="quick-presets-row">
                  <span className="quick-presets-label">Ángulos HT02:</span>
                  {[
                    { label: '30° (P1/P6)', a: 30 },
                    { label: '37° (P2)', a: 37 },
                    { label: '40° (P5/P8)', a: 40 },
                    { label: '45° (Alcance Máx)', a: 45 },
                    { label: '50° (P3/P10)', a: 50 },
                    { label: '65° (P7)', a: 65 },
                    { label: '-30° (P4 Abajo)', a: -30 },
                    { label: '-20° (P9 Abajo)', a: -20 },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`quick-pill-btn ${parseFloat(angleDegValue) === p.a ? 'active' : ''}`}
                      onClick={() => setAngleDegValue(p.a)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Initial Speed v0 */}
              <div className="inspector-field">
                <div className="inspector-field-header">
                  <label className="inspector-label">Rapidez de Disparo Inicial (v₀):</label>
                  <span className="field-badge-mru">v₀x = v₀cosθ | v₀y = v₀sinθ</span>
                </div>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="any"
                    className="inspector-input number-input"
                    value={velocityValue}
                    onChange={(e) => setVelocityValue(e.target.value)}
                    placeholder="25.0"
                    required
                  />
                  <select
                    className="inspector-select"
                    value={velocityUnit}
                    onChange={(e) => setVelocityUnit(e.target.value)}
                  >
                    <option value="m/s">m/s</option>
                    <option value="km/h">km/h</option>
                    <option value="mi/h">mi/h</option>
                  </select>
                </div>
                <div className="quick-presets-row">
                  <span className="quick-presets-label">Rapidez HT02:</span>
                  {[
                    { label: '100 m/s (P1)', v: 100 },
                    { label: '50 m/s (P3)', v: 50 },
                    { label: '40 m/s (P4/P7)', v: 40 },
                    { label: '30 m/s (P6)', v: 30 },
                    { label: '20 m/s (P2/P5/P8)', v: 20 },
                    { label: '10 m/s (P9)', v: 10 },
                    { label: '1.5 m/s (P10)', v: 1.5 },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`quick-pill-btn ${Math.abs(parseFloat(velocityValue) - p.v) < 0.1 ? 'active' : ''}`}
                      onClick={() => {
                        setVelocityValue(p.v);
                        setVelocityUnit('m/s');
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Live Conversions */}
                <div className="conversions-box">
                  <div className="conversion-item">
                    <span className="conv-label">SI (m/s):</span>
                    <span className="conv-value">{velMs.toFixed(2)} m/s</span>
                  </div>
                  <div className="conversion-item">
                    <span className="conv-label">km/h:</span>
                    <span className="conv-value">{velKmh.toFixed(2)} km/h</span>
                  </div>
                  <div className="conversion-item">
                    <span className="conv-label">mi/h:</span>
                    <span className="conv-value">{velMih.toFixed(2)} mi/h</span>
                  </div>
                </div>
              </div>

              {/* Initial Launch Height h0 */}
              <div className="inspector-field">
                <div className="inspector-field-header">
                  <label className="inspector-label">Altura Inicial de Despegue (h₀):</label>
                  <span className="field-badge-accel">Elevación Base</span>
                </div>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    className="inspector-input number-input"
                    value={heightMetersValue}
                    onChange={(e) => setHeightMetersValue(e.target.value)}
                    placeholder="0.0"
                  />
                  <div className="static-unit-box">m</div>
                </div>
                <div className="quick-presets-row">
                  <span className="quick-presets-label">Alturas HT02:</span>
                  {[
                    { label: '0 m (Piso P1-3, P6)', h: 0 },
                    { label: '8 m (P9)', h: 8 },
                    { label: '10 m (P7)', h: 10 },
                    { label: '170 m (P4)', h: 170 },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`quick-pill-btn ${parseFloat(heightMetersValue) === p.h ? 'active' : ''}`}
                      onClick={() => setHeightMetersValue(p.h)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gravity */}
              <div className="inspector-field">
                <div className="inspector-field-header">
                  <label className="inspector-label">Aceleración Gravitatoria (g):</label>
                  <span className="field-badge-mru">g = cte</span>
                </div>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="0.01"
                    className="inspector-input number-input"
                    value={gravityValue}
                    onChange={(e) => setGravityValue(e.target.value)}
                    placeholder="9.8"
                    required
                  />
                  <div className="static-unit-box">m/s²</div>
                </div>
                <div className="quick-presets-row">
                  <span className="quick-presets-label">Entorno:</span>
                  <button
                    type="button"
                    className={`quick-pill-btn ${parseFloat(gravityValue) === 9.8 ? 'active' : ''}`}
                    onClick={() => setGravityValue(9.8)}
                  >
                    9.80 m/s² (Kinal HT02)
                  </button>
                  <button
                    type="button"
                    className={`quick-pill-btn ${parseFloat(gravityValue) === 1.6 ? 'active' : ''}`}
                    onClick={() => setGravityValue(1.6)}
                  >
                    1.60 m/s² (Luna)
                  </button>
                </div>
              </div>

              {/* Theoretical Kinematics Card for 2D Oblique Projectile */}
              {(() => {
                const gVal = Math.max(0.01, parseFloat(gravityValue) || 9.8);
                const h0Val = Math.max(0, parseFloat(heightMetersValue) || 0.0);
                const theta = (parseFloat(angleDegValue) || 45.0) * (Math.PI / 180);
                const v0Val = Math.max(0, velMs);
                const v0x = v0Val * Math.cos(theta);
                const v0y = v0Val * Math.sin(theta);
                
                // Apex
                const tApex = v0y > 0 ? v0y / gVal : 0;
                const hMax = h0Val + (v0y > 0 ? (v0y * v0y) / (2 * gVal) : 0);
                
                // Flight time
                const disc = v0y * v0y + 2 * gVal * h0Val;
                const tFlight = disc >= 0 ? (v0y + Math.sqrt(disc)) / gVal : 0;
                const xRange = v0x * tFlight;
                const vyFinal = v0y - gVal * tFlight;
                const vImpact = Math.sqrt(v0x * v0x + vyFinal * vyFinal);
                const thetaImpact = (Math.atan2(vyFinal, v0x) * 180) / Math.PI;

                return (
                  <div className="conversions-box" style={{ background: '#faf5ff', borderColor: '#e9d5ff' }}>
                    <div className="conversion-item">
                      <span className="conv-label" style={{ color: '#7e22ce' }}>v₀x / v₀y:</span>
                      <span className="conv-value" style={{ color: '#581c87', fontWeight: 800 }}>{v0x.toFixed(1)} / {v0y.toFixed(1)} m/s</span>
                    </div>
                    <div className="conversion-item">
                      <span className="conv-label" style={{ color: '#7e22ce' }}>t_subida / t_vuelo:</span>
                      <span className="conv-value" style={{ color: '#581c87', fontWeight: 800 }}>{tApex.toFixed(2)}s / {tFlight.toFixed(2)}s</span>
                    </div>
                    <div className="conversion-item">
                      <span className="conv-label" style={{ color: '#7e22ce' }}>H_máx (Ápice):</span>
                      <span className="conv-value" style={{ color: '#581c87', fontWeight: 800 }}>{hMax.toFixed(2)} m</span>
                    </div>
                    <div className="conversion-item">
                      <span className="conv-label" style={{ color: '#7e22ce' }}>Alcance X_máx:</span>
                      <span className="conv-value" style={{ color: '#581c87', fontWeight: 800 }}>{xRange.toFixed(2)} m</span>
                    </div>
                    <div className="conversion-item">
                      <span className="conv-label" style={{ color: '#7e22ce' }}>v_impacto / θ_f:</span>
                      <span className="conv-value" style={{ color: '#581c87', fontWeight: 800 }}>{vImpact.toFixed(1)} m/s ({thetaImpact.toFixed(1)}°)</span>
                    </div>
                  </div>
                );
              })()}

              {/* Graphic Vectors Toggles */}
              <div className="inspector-vectors-group">
                <label className="inspector-label">Vectores y Trazado Gráfico:</label>
                <div className="checkbox-field">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={showVector}
                      onChange={(e) => setShowVector(e.target.checked)}
                    />
                    <span>Mostrar componentes vectoriales (v_x azul y v_y verde/naranja)</span>
                  </label>
                </div>
                <div className="checkbox-field">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={showTrajectory}
                      onChange={(e) => setShowTrajectory(e.target.checked)}
                    />
                    <span>Trazar parábola con puntos de estela y marcador de Ápice</span>
                  </label>
                </div>
              </div>

              {/* Color */}
              <div className="inspector-field">
                <label className="inspector-label">Color:</label>
                <div className="color-palette-row">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`color-swatch-btn ${color === c ? 'active' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    >
                      {color === c && <Check size={12} color="#ffffff" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* 5.5 MURO OBJETIVO / DIANA (target_wall)                       */}
          {/* ------------------------------------------------------------- */}
          {element.physicsType === 'target_wall' && (
            <>
              <div className="inspector-field">
                <div className="inspector-field-header">
                  <label className="inspector-label">Distancia Horizontal al Cañón (d en metros):</label>
                  <span className="field-badge-mru">Posición X</span>
                </div>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    className="inspector-input number-input"
                    value={targetDistanceValue}
                    onChange={(e) => setTargetDistanceValue(e.target.value)}
                    placeholder="50.0"
                    required
                  />
                  <div className="static-unit-box">metros</div>
                </div>
                <div className="quick-presets-row">
                  <span className="quick-presets-label">Distancias HT02:</span>
                  {[
                    { label: '8 m (P5 Manguera)', d: 8 },
                    { label: '50 m (P8 Edificios)', d: 50 },
                    { label: '120 m (P7 Golf)', d: 120 },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`quick-pill-btn ${parseFloat(targetDistanceValue) === p.d ? 'active' : ''}`}
                      onClick={() => setTargetDistanceValue(p.d)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="inspector-field">
                <label className="inspector-label">Altura del Objetivo / Diana (h en metros):</label>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    className="inspector-input number-input"
                    value={targetHeightValue}
                    onChange={(e) => setTargetHeightValue(e.target.value)}
                    placeholder="10.0"
                  />
                  <div className="static-unit-box">m</div>
                </div>
              </div>
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* 5.6 PLATAFORMA / ACANTILADO DE LANZAMIENTO (cliff_platform)    */}
          {/* ------------------------------------------------------------- */}
          {element.physicsType === 'cliff_platform' && (
            <>
              <div className="inspector-field">
                <div className="inspector-field-header">
                  <label className="inspector-label">Altura del Acantilado (h en metros):</label>
                  <span className="field-badge-mru">Escala Vertical</span>
                </div>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    className="inspector-input number-input"
                    value={trackLength}
                    onChange={(e) => setTrackLength(e.target.value)}
                    placeholder="20.0"
                    required
                  />
                  <div className="static-unit-box">m</div>
                </div>
                <div className="quick-presets-row">
                  <span className="quick-presets-label">Alturas HT01:</span>
                  {[
                    { label: '20 m (P10)', h: 20 },
                    { label: '15 m (P8)', h: 15 },
                    { label: '10 m (P3)', h: 10 },
                    { label: '3 m (P2)', h: 3 },
                    { label: '150 m (P1)', h: 150 },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`quick-pill-btn ${parseFloat(trackLength) === p.h ? 'active' : ''}`}
                      onClick={() => setTrackLength(p.h)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="inspector-field">
                <label className="inspector-label">Color de la Estructura:</label>
                <div className="color-palette-row">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`color-swatch-btn ${color === c ? 'active' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    >
                      {color === c && <Check size={12} color="#ffffff" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* 6. PHOTOGATE SPECIFIC FIELDS                                  */}
          {/* ------------------------------------------------------------- */}
          {element.physicsType === 'mru_photogate' && (
            <div className="inspector-field">
              <span className="field-hint">
                Sensor óptico infrarrojo de laboratorio. Registra automáticamente el instante temporal en que el móvil atraviesa el haz.
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="inspector-footer">
            <button type="button" className="inspector-btn cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="inspector-btn submit">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .inspector-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 95;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.15s ease-out;
          padding: 16px;
        }

        .inspector-modal-card {
          width: 100%;
          max-width: 460px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 20px 45px rgba(15, 23, 42, 0.25), 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid #cbd5e1;
          overflow: hidden;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          animation: scaleUp 0.16s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .inspector-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          flex-shrink: 0;
        }

        .inspector-title-cluster {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .inspector-icon-badge {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #e0f2fe;
          color: #0284c7;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .inspector-icon-badge.mruv {
          background: #f0fdf4;
          color: #16a34a;
        }

        .inspector-icon-badge.freefall {
          background: #fef2f2;
          color: #ef4444;
        }

        .inspector-icon-badge.vertical {
          background: #f5f3ff;
          color: #8b5cf6;
        }

        .inspector-icon-badge.horizontal {
          background: #e0f2fe;
          color: #0284c7;
        }

        .inspector-badge {
          display: inline-block;
          font-size: 0.65rem;
          font-weight: 700;
          color: #0284c7;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .inspector-title {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
        }

        .inspector-close-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }

        .inspector-close-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .inspector-body {
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          overflow-y: auto;
          flex: 1;
        }

        .inspector-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .inspector-field-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .field-badge-mru {
          font-size: 10px;
          font-weight: 700;
          color: #0284c7;
          background: #e0f2fe;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .field-badge-mruv {
          font-size: 10px;
          font-weight: 700;
          color: #0284c7;
          background: #e0f2fe;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
        }

        .field-badge-accel {
          font-size: 10px;
          font-weight: 700;
          color: #b45309;
          background: #fef3c7;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
        }

        .inspector-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #334155;
        }

        .inspector-input {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1.5px solid #cbd5e1;
          font-size: 0.86rem;
          color: #0f172a;
          outline: none;
          transition: border-color 0.12s;
        }

        .inspector-input.number-input {
          font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
          font-weight: 600;
        }

        .inspector-input:focus {
          border-color: #0284c7;
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.12);
        }

        .inspector-unit-group {
          display: flex;
          gap: 8px;
        }

        .inspector-unit-group .inspector-input {
          flex: 1;
        }

        .static-unit-box {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 12px;
          background: #f1f5f9;
          border: 1.5px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 700;
          color: #475569;
          font-family: monospace;
        }

        .inspector-select {
          padding: 8px 10px;
          border-radius: 8px;
          border: 1.5px solid #cbd5e1;
          background: #f8fafc;
          font-size: 0.82rem;
          font-weight: 600;
          color: #1e293b;
          outline: none;
          cursor: pointer;
        }

        .inspector-select:focus {
          border-color: #0284c7;
        }

        /* Quick Presets Pills */
        .quick-presets-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 2px;
        }

        .quick-presets-label {
          font-size: 10px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          margin-right: 2px;
        }

        .quick-pill-btn {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 2px 8px;
          font-size: 10.5px;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all 0.12s;
        }

        .quick-pill-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .quick-pill-btn.active {
          background: #e0f2fe;
          border-color: #0284c7;
          color: #0369a1;
          font-weight: 700;
        }

        .live-conversions-box {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 6px;
          font-size: 0.72rem;
          color: #166534;
          margin-top: 2px;
        }

        .sparkle-icon {
          color: #16a34a;
          flex-shrink: 0;
        }

        .time-input-row {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-inner-icon {
          position: absolute;
          left: 10px;
          color: #64748b;
        }

        .inspector-input.with-icon {
          padding-left: 32px;
          width: 100%;
        }

        .field-hint {
          font-size: 0.7rem;
          color: #64748b;
          line-height: 1.4;
        }

        .inspector-vectors-group {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .checkbox-field {
          flex-direction: row;
          align-items: center;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #1e293b;
          cursor: pointer;
        }

        .color-palette-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .color-swatch-btn {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          border: 2px solid transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.12s, border-color 0.12s;
        }

        .color-swatch-btn:hover {
          transform: scale(1.12);
        }

        .color-swatch-btn.active {
          border-color: #0f172a;
          box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.2);
        }

        .inspector-footer {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding-top: 10px;
          border-top: 1px solid #f1f5f9;
          margin-top: 4px;
        }

        .inspector-btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 0.84rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }

        .inspector-btn.cancel {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #475569;
        }

        .inspector-btn.cancel:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .inspector-btn.submit {
          background: #0284c7;
          border: 1px solid #0284c7;
          color: #ffffff;
          box-shadow: 0 1px 3px rgba(2, 132, 199, 0.3);
        }

        .inspector-btn.submit:hover {
          background: #0369a1;
          border-color: #0369a1;
        }
      `}</style>
    </div>
  );
}
