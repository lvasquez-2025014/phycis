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
  Target,
  GitFork,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Scale
} from 'lucide-react';
import { CONVERSIONS } from '../../services/mruExerciseSolver';
import {
  getDclBodies,
  OFFICIAL_TABLE_THREE_MASSES_VECTORS,
  OFFICIAL_TABLE_TWO_MASSES_VECTORS,
} from '../../services/canvasRenderers';

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
  const isMcuTurntable = element.physicsType === 'mcu_turntable';
  const isMcuParticle = element.physicsType === 'mcu_particle';
  const isMcuvTurntable = element.physicsType === 'mcuv_turntable';
  const isMcuvParticle = element.physicsType === 'mcuv_particle';
  const isPoleasMcu = element.physicsType === 'mcu_pulley_system';
  const isDcl = element.physicsType === 'dcl_diagram' || element.physicsType === 'translational_equilibrium';
  const isNewton = element.physicsType === 'newton_frictionless_system';

  // Form states initialized from element
  const [label, setLabel] = useState(
    props.label || element.name || 
    (isMruv ? 'Móvil MRUV' : isFreefallBody ? 'Cuerpo en Caída Libre' : isVerticalProj ? 'Proyectil Tiro Vertical' : isHorizontalProj ? 'Proyectil Horizontal' : isCliffPlatform ? 'Acantilado de Lanzamiento' : isFreefallTower ? 'Torre de Caída Libre' : isCannon ? 'Cañón Lanzador Angular' : isObliqueProj ? 'Proyectil Oblicuo (2D)' : isTargetWall ? 'Muro Diana / Objetivo' : isMcuTurntable ? 'Plataforma Giratoria MCU' : isMcuParticle ? 'Masa Orbitante MCU' : isMcuvTurntable ? 'Rotor Acelerado MCUV' : isMcuvParticle ? 'Masa en MCUV' : isPoleasMcu ? 'Sistema de Poleas MCU' : isNewton ? (props.systemTitle || 'Segunda Ley de Newton') : isDcl ? (element.physicsType === 'translational_equilibrium' ? 'Aparato de Equilibrio (HT03)' : 'Diagrama de Cuerpo Libre') : 'Móvil MRU')
  );

  // DCL & Newton States
  const dclBodies = (isDcl || isNewton) ? getDclBodies(element) : [];
  const [selectedDclBody, setSelectedDclBody] = useState(
    dclBodies.length > 1 ? dclBodies[1].id : (dclBodies[0]?.id || 'main')
  );
  const [dclUserVectors, setDclUserVectors] = useState(props.userVectors || []);
  const [dclShowOfficial, setDclShowOfficial] = useState(!!props.showOfficialSolution);

  // Newton Second Law States
  const [newtonMass1, setNewtonMass1] = useState(props.mass1 !== undefined ? props.mass1 : 2.0);
  const [newtonMass2, setNewtonMass2] = useState(props.mass2 !== undefined ? props.mass2 : 6.0);
  const [newtonForce, setNewtonForce] = useState(props.appliedForce !== undefined ? props.appliedForce : 80.0);

  const [newVecType, setNewVecType] = useState('weight');
  const [newVecSymbol, setNewVecSymbol] = useState('W');
  const [newVecAngle, setNewVecAngle] = useState(270);
  const [newVecMagnitude, setNewVecMagnitude] = useState(98);
  const [newVecColor, setNewVecColor] = useState('#ef4444');

  // MCU & MCUV States (ω in rad/s, r in m, direction, α in rad/s²)
  const [omegaRadSValue, setOmegaRadSValue] = useState(props.omega0 !== undefined ? props.omega0 : (props.omega !== undefined ? props.omega : (isMcuvTurntable || isMcuvParticle ? 0.0 : 3.0)));
  const [radiusMetersValue, setRadiusMetersValue] = useState(props.radiusMeters !== undefined ? props.radiusMeters : 1.0);
  const [mcuDirection, setMcuDirection] = useState(props.direction || 'ccw');
  const [mcuvAlphaValue, setMcuvAlphaValue] = useState(props.alpha !== undefined ? props.alpha : 2.0);
  const [showTangentialVector, setShowTangentialVector] = useState(props.showTangentialVector !== false);
  const [showCentripetalVector, setShowCentripetalVector] = useState(props.showCentripetalVector !== false);
  const [showTangentialAccelVector, setShowTangentialAccelVector] = useState(props.showTangentialAccelVector !== false);
  const [showTotalAccelVector, setShowTotalAccelVector] = useState(props.showTotalAccelVector !== false);

  // Poleas MCU States
  const [poleasConfig, setPoleasConfig] = useState(props.configuration || 'belt');
  const [poleasR1, setPoleasR1] = useState(props.radiusMeters1 !== undefined ? props.radiusMeters1 : 0.20);
  const [poleasR2, setPoleasR2] = useState(props.radiusMeters2 !== undefined ? props.radiusMeters2 : 0.10);
  const [poleasOmega1, setPoleasOmega1] = useState(props.omega1 !== undefined ? props.omega1 : (props.omega || 5.0));
  const [poleasBeltCrossed, setPoleasBeltCrossed] = useState(!!props.beltCrossed);

  
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
    const currIsNewton = element.physicsType === 'newton_frictionless_system';

    setLabel(
      p.label || element.name || 
      (currIsMruv ? 'Móvil MRUV' : currIsFfBody ? 'Cuerpo en Caída Libre' : currIsVertProj ? 'Proyectil Tiro Vertical' : currIsHzProj ? 'Proyectil Horizontal' : currIsCliff ? 'Acantilado de Lanzamiento' : currIsFfTower ? 'Torre de Caída Libre' : currIsCannon ? 'Cañón Lanzador Angular' : currIsOblique ? 'Proyectil Oblicuo (2D)' : currIsTarget ? 'Muro Diana / Objetivo' : currIsNewton ? (p.systemTitle || 'Segunda Ley de Newton') : 'Móvil MRU')
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
    setOmegaRadSValue(p.omega0 !== undefined ? p.omega0 : (p.omega !== undefined ? p.omega : (element.physicsType === 'mcuv_turntable' || element.physicsType === 'mcuv_particle' ? 0.0 : 3.0)));
    setRadiusMetersValue(p.radiusMeters !== undefined ? p.radiusMeters : 1.0);
    setMcuDirection(p.direction || 'ccw');
    setMcuvAlphaValue(p.alpha !== undefined ? p.alpha : 2.0);
    setShowTangentialVector(p.showTangentialVector !== false);
    setShowCentripetalVector(p.showCentripetalVector !== false);
    setShowTangentialAccelVector(p.showTangentialAccelVector !== false);
    setShowTotalAccelVector(p.showTotalAccelVector !== false);
    setPoleasConfig(p.configuration || 'belt');
    setPoleasR1(p.radiusMeters1 !== undefined ? p.radiusMeters1 : 0.20);
    setPoleasR2(p.radiusMeters2 !== undefined ? p.radiusMeters2 : 0.10);
    setPoleasOmega1(p.omega1 !== undefined ? p.omega1 : (p.omega || 5.0));
    setPoleasBeltCrossed(!!p.beltCrossed);

    setNewtonMass1(p.mass1 !== undefined ? p.mass1 : 2.0);
    setNewtonMass2(p.mass2 !== undefined ? p.mass2 : 6.0);
    setNewtonForce(p.appliedForce !== undefined ? p.appliedForce : 80.0);

    setDclUserVectors(p.userVectors || []);
    setDclShowOfficial(!!p.showOfficialSolution);
    const bds = (element.physicsType === 'dcl_diagram' || element.physicsType === 'translational_equilibrium' || element.physicsType === 'newton_frictionless_system') ? getDclBodies(element) : [];
    if (bds.length > 0) {
      setSelectedDclBody(bds.length > 1 ? bds[0].id : bds[0].id);
    }
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
    } else if (element.physicsType === 'mcu_turntable') {
      const numOmega = parseFloat(omegaRadSValue) || 3.0;
      const numR = parseFloat(radiusMetersValue) || 1.0;
      updatedProperties = {
        ...updatedProperties,
        label,
        omega: numOmega,
        initialOmega: numOmega,
        radiusMeters: numR,
        direction: mcuDirection || 'ccw',
        color,
      };
      updatedElement.color = color;
    } else if (element.physicsType === 'mcu_particle') {
      const numOmega = parseFloat(omegaRadSValue) || 3.0;
      const numR = parseFloat(radiusMetersValue) || 1.0;
      const numAngle = parseFloat(angleDegValue) || 0.0;
      updatedProperties = {
        ...updatedProperties,
        label,
        omega: numOmega,
        initialOmega: numOmega,
        radiusMeters: numR,
        angleRad: (numAngle * Math.PI) / 180,
        initialAngleRad: (numAngle * Math.PI) / 180,
        showTangentialVector,
        showCentripetalVector,
        showOrbit: showTrajectory,
        color,
      };
      updatedElement.color = color;
    } else if (element.physicsType === 'mcuv_turntable') {
      const numOmega = parseFloat(omegaRadSValue) || 0.0;
      const numAlpha = parseFloat(mcuvAlphaValue) || 2.0;
      const numR = parseFloat(radiusMetersValue) || 1.0;
      updatedProperties = {
        ...updatedProperties,
        label,
        omega0: numOmega,
        omega: numOmega,
        initialOmega: numOmega,
        alpha: numAlpha,
        initialAlpha: numAlpha,
        radiusMeters: numR,
        direction: mcuDirection || 'ccw',
        color,
      };
      updatedElement.color = color;
    } else if (element.physicsType === 'mcuv_particle') {
      const numOmega = parseFloat(omegaRadSValue) || 0.0;
      const numAlpha = parseFloat(mcuvAlphaValue) || 2.0;
      const numR = parseFloat(radiusMetersValue) || 1.0;
      const numAngle = parseFloat(angleDegValue) || 0.0;
      updatedProperties = {
        ...updatedProperties,
        label,
        omega0: numOmega,
        omega: numOmega,
        initialOmega: numOmega,
        alpha: numAlpha,
        initialAlpha: numAlpha,
        radiusMeters: numR,
        angleRad: (numAngle * Math.PI) / 180,
        initialAngleRad: (numAngle * Math.PI) / 180,
        showTangentialVector,
        showCentripetalVector,
        showTangentialAccelVector,
        showTotalAccelVector,
        showOrbit: showTrajectory,
        color,
      };
      updatedElement.color = color;
    } else if (element.physicsType === 'mcu_pulley_system') {
      const numOmega1 = parseFloat(poleasOmega1) || 5.0;
      const numR1 = parseFloat(poleasR1) || 0.20;
      const numR2 = parseFloat(poleasR2) || 0.10;
      let ratio = 1.0;
      let omega2 = numOmega1;
      let linearSpeed = Math.abs(numOmega1) * numR1;
      if (poleasConfig === 'belt' || poleasConfig === 'washing_machine') {
        ratio = numR1 / Math.max(0.001, numR2);
        omega2 = numOmega1 * ratio;
      }
      updatedProperties = {
        ...updatedProperties,
        label,
        configuration: poleasConfig,
        omega1: numOmega1,
        initialOmega1: numOmega1,
        omega: numOmega1,
        initialOmega: numOmega1,
        omega2,
        initialOmega2: omega2,
        radiusMeters1: numR1,
        radiusMeters2: numR2,
        linearSpeed,
        beltCrossed: poleasBeltCrossed,
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
    } else if (element.physicsType === 'dcl_diagram' || element.physicsType === 'translational_equilibrium') {
      updatedProperties = {
        ...updatedProperties,
        label,
        userVectors: dclUserVectors,
        showOfficialSolution: dclShowOfficial,
        color,
      };
      updatedElement.color = color;
    } else if (element.physicsType === 'newton_frictionless_system') {
      const m1 = Math.max(0.01, parseFloat(newtonMass1) || 2.0);
      const m2 = Math.max(0.01, parseFloat(newtonMass2) || 6.0);
      const f = parseFloat(newtonForce) || 0.0;
      updatedProperties = {
        ...updatedProperties,
        label,
        mass1: m1,
        mass2: m2,
        mass: m1 + m2,
        appliedForce: f,
        userVectors: dclUserVectors,
        showOfficialSolution: dclShowOfficial,
        color,
      };
      updatedElement.color = color;
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
              {element.physicsType === 'dcl_diagram' && <GitFork size={17} />}
              {element.physicsType === 'translational_equilibrium' && <Scale size={17} />}
              {element.physicsType === 'newton_frictionless_system' && <Weight size={17} />}
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
                {element.physicsType === 'dcl_diagram' && 'Diagrama de Cuerpo Libre (D.C.L.) • Fuerzas y Vectores'}
                {element.physicsType === 'translational_equilibrium' && 'Equilibrio Traslacional • Primera Ley de Newton (HT03)'}
                {element.physicsType === 'newton_frictionless_system' && 'Dinámica • 2ª Ley de Newton sin Fricción (HT01 U4)'}
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
                {element.physicsType === 'dcl_diagram' && (props.apparatusType === 'table_three_masses' ? 'Mesa con Tres Masas (D.C.L.)' : props.apparatusType === 'table_two_masses' ? 'Mesa con Dos Masas (D.C.L.)' : 'Diagrama de Cuerpo Libre')}
                {element.physicsType === 'translational_equilibrium' && (props.systemTitle || 'Aparato de Equilibrio Traslacional (HT03)')}
                {element.physicsType === 'newton_frictionless_system' && (props.systemTitle || 'Aparato Dinámico (2ª Ley de Newton)')}
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
          {/* ------------------------------------------------------------- */}
          {/* 7. MOVIMIENTO CIRCULAR UNIFORME (MCU)                         */}
          {/* ------------------------------------------------------------- */}
          {(element.physicsType === 'mcu_turntable' || element.physicsType === 'mcu_particle') && (
            <>
              {/* Angular speed omega */}
              <div className="inspector-field">
                <div className="inspector-field-header">
                  <label className="inspector-label">Velocidad Angular (ω en rad/s):</label>
                  <span className="field-badge-mru" style={{ background: '#e0f2fe', color: '#0284c7', borderColor: '#bae6fd' }}>
                    Constante (MCU)
                  </span>
                </div>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="0.1"
                    className="inspector-input number-input"
                    value={omegaRadSValue}
                    onChange={(e) => setOmegaRadSValue(e.target.value)}
                    placeholder="3.0"
                    required
                  />
                  <div className="static-unit-box">rad/s</div>
                </div>
                <div className="quick-presets-row">
                  <span className="quick-presets-label">Valores HT03:</span>
                  {[
                    { label: 'ω = 18 (P1)', w: 18.0 },
                    { label: 'ω = 4 (P6)', w: 4.0 },
                    { label: 'ω = 0.52 (P3)', w: 0.52 },
                    { label: '1200 RPM (P4)', w: 125.66 },
                    { label: '3200 RPM (P9)', w: 335.1 },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`quick-pill-btn ${parseFloat(omegaRadSValue) === p.w ? 'active' : ''}`}
                      onClick={() => setOmegaRadSValue(p.w)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Radius in meters */}
              <div className="inspector-field">
                <div className="inspector-field-header">
                  <label className="inspector-label">Radio de Giro (r en metros):</label>
                  <span className="field-badge-mru" style={{ background: '#f8fafc', color: '#475569' }}>
                    Distancia al eje
                  </span>
                </div>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="0.05"
                    min="0.01"
                    className="inspector-input number-input"
                    value={radiusMetersValue}
                    onChange={(e) => setRadiusMetersValue(e.target.value)}
                    placeholder="1.0"
                    required
                  />
                  <div className="static-unit-box">metros (m)</div>
                </div>
              </div>

              {/* Rotational Direction */}
              <div className="inspector-field">
                <label className="inspector-label">Sentido de Rotación:</label>
                <div className="toggle-group" style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className={`quick-pill-btn ${mcuDirection === 'ccw' ? 'active' : ''}`}
                    onClick={() => setMcuDirection('ccw')}
                  >
                    Antihorario (CCW ↺)
                  </button>
                  <button
                    type="button"
                    className={`quick-pill-btn ${mcuDirection === 'cw' ? 'active' : ''}`}
                    onClick={() => setMcuDirection('cw')}
                  >
                    Horario (CW ↻)
                  </button>
                </div>
              </div>

              {/* Dynamic Vectors Checkboxes */}
              {element.physicsType === 'mcu_particle' && (
                <div className="inspector-field">
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={showTangentialVector}
                      onChange={(e) => setShowTangentialVector(e.target.checked)}
                    />
                    <span>Mostrar Vector Velocidad Tangencial (v⃗_t, esmeralda)</span>
                  </label>
                  <label className="checkbox-row" style={{ marginTop: '6px' }}>
                    <input
                      type="checkbox"
                      checked={showCentripetalVector}
                      onChange={(e) => setShowCentripetalVector(e.target.checked)}
                    />
                    <span>Mostrar Vector Aceleración Centrípeta (a⃗_c, carmesí al centro)</span>
                  </label>
                </div>
              )}
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* 8. MOVIMIENTO CIRCULAR ACELERADO (MCUV / MCUA)                */}
          {/* ------------------------------------------------------------- */}
          {(element.physicsType === 'mcuv_turntable' || element.physicsType === 'mcuv_particle') && (
            <>
              {/* Initial Angular speed omega0 */}
              <div className="inspector-field">
                <div className="inspector-field-header">
                  <label className="inspector-label">Velocidad Angular Inicial (ω₀ en rad/s):</label>
                  <span className="field-badge-mruv">ω(t) = ω₀ + α·t</span>
                </div>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="0.1"
                    className="inspector-input number-input"
                    value={omegaRadSValue}
                    onChange={(e) => setOmegaRadSValue(e.target.value)}
                    placeholder="0.0"
                    required
                  />
                  <div className="static-unit-box">rad/s</div>
                </div>
                <div className="quick-presets-row">
                  <span className="quick-presets-label">Valores ω₀:</span>
                  {[
                    { label: '0 rad/s (Reposo P11, P13)', w: 0.0 },
                    { label: '2 rad/s (P15)', w: 2.0 },
                    { label: '15 rad/s (P12)', w: 15.0 },
                    { label: '30 rad/s (P23)', w: 30.0 },
                    { label: '50 rad/s (P14)', w: 50.0 },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`quick-pill-btn ${parseFloat(omegaRadSValue) === p.w ? 'active' : ''}`}
                      onClick={() => setOmegaRadSValue(p.w)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Constant Angular Acceleration alpha */}
              <div className="inspector-field">
                <div className="inspector-field-header">
                  <label className="inspector-label">Aceleración Angular (α en rad/s²):</label>
                  <span className="field-badge-accel">α = cte</span>
                </div>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="0.1"
                    className="inspector-input number-input"
                    value={mcuvAlphaValue}
                    onChange={(e) => setMcuvAlphaValue(e.target.value)}
                    placeholder="2.0"
                    required
                  />
                  <div className="static-unit-box">rad/s²</div>
                </div>
                <div className="quick-presets-row">
                  <span className="quick-presets-label">Valores α Kinal:</span>
                  {[
                    { label: '+3.5 rad/s² (P11)', a: 3.5 },
                    { label: '+4.0 rad/s² (P13)', a: 4.0 },
                    { label: '+5.0 rad/s² (P18)', a: 5.0 },
                    { label: '+8.0 rad/s² (P25)', a: 8.0 },
                    { label: '-2.5 rad/s² (Freno P12)', a: -2.5 },
                    { label: '-5.0 rad/s² (Freno P14)', a: -5.0 },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`quick-pill-btn ${parseFloat(mcuvAlphaValue) === p.a ? 'active' : ''}`}
                      onClick={() => setMcuvAlphaValue(p.a)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Radius in meters */}
              <div className="inspector-field">
                <div className="inspector-field-header">
                  <label className="inspector-label">Radio de Giro (r en metros):</label>
                  <span className="field-badge-mru" style={{ background: '#f8fafc', color: '#475569' }}>
                    Distancia al eje
                  </span>
                </div>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="0.05"
                    min="0.01"
                    className="inspector-input number-input"
                    value={radiusMetersValue}
                    onChange={(e) => setRadiusMetersValue(e.target.value)}
                    placeholder="1.0"
                    required
                  />
                  <div className="static-unit-box">metros (m)</div>
                </div>
                <div className="quick-presets-row">
                  <span className="quick-presets-label">Radios Unidad 2:</span>
                  {[
                    { label: '0.15 m (P14)', r: 0.15 },
                    { label: '0.20 m (P18)', r: 0.2 },
                    { label: '0.28 m (P25)', r: 0.28 },
                    { label: '0.30 m (P13)', r: 0.3 },
                    { label: '0.40 m (P11)', r: 0.4 },
                    { label: '0.60 m (P12)', r: 0.6 },
                    { label: '1.50 m (P23)', r: 1.5 },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`quick-pill-btn ${parseFloat(radiusMetersValue) === p.r ? 'active' : ''}`}
                      onClick={() => setRadiusMetersValue(p.r)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rotational Direction */}
              <div className="inspector-field">
                <label className="inspector-label">Sentido de Rotación Inicial:</label>
                <div className="toggle-group" style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className={`quick-pill-btn ${mcuDirection === 'ccw' ? 'active' : ''}`}
                    onClick={() => setMcuDirection('ccw')}
                  >
                    Antihorario (CCW ↺)
                  </button>
                  <button
                    type="button"
                    className={`quick-pill-btn ${mcuDirection === 'cw' ? 'active' : ''}`}
                    onClick={() => setMcuDirection('cw')}
                  >
                    Horario (CW ↻)
                  </button>
                </div>
              </div>

              {/* Dynamic Vectors Checkboxes for Particle */}
              {element.physicsType === 'mcuv_particle' && (
                <div className="inspector-field">
                  <label className="inspector-label">Vectores Dinámicos en Tiempo Real:</label>
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={showTangentialVector}
                      onChange={(e) => setShowTangentialVector(e.target.checked)}
                    />
                    <span>Mostrar Vector Rapidez Tangencial (v⃗_t, esmeralda)</span>
                  </label>
                  <label className="checkbox-row" style={{ marginTop: '6px' }}>
                    <input
                      type="checkbox"
                      checked={showCentripetalVector}
                      onChange={(e) => setShowCentripetalVector(e.target.checked)}
                    />
                    <span>Mostrar Vector Aceleración Centrípeta (a⃗_c, carmesí al centro)</span>
                  </label>
                  <label className="checkbox-row" style={{ marginTop: '6px' }}>
                    <input
                      type="checkbox"
                      checked={showTangentialAccelVector}
                      onChange={(e) => setShowTangentialAccelVector(e.target.checked)}
                    />
                    <span>Mostrar Vector Aceleración Tangencial (a⃗_t, ámbar tangencial)</span>
                  </label>
                  <label className="checkbox-row" style={{ marginTop: '6px' }}>
                    <input
                      type="checkbox"
                      checked={showTotalAccelVector}
                      onChange={(e) => setShowTotalAccelVector(e.target.checked)}
                    />
                    <span>Mostrar Vector Aceleración Total (a⃗_total, violeta resultante)</span>
                  </label>
                </div>
              )}

              {/* Theoretical Kinematic Calculations Card */}
              {(() => {
                const w0Val = parseFloat(omegaRadSValue) || 0.0;
                const aVal = parseFloat(mcuvAlphaValue) || 0.0;
                const rVal = parseFloat(radiusMetersValue) || 1.0;
                const vt0 = Math.abs(w0Val) * rVal;
                const at = Math.abs(aVal) * rVal;
                const ac0 = w0Val * w0Val * rVal;
                const aTot0 = Math.hypot(ac0, at);
                return (
                  <div className="conversions-box" style={{ background: '#f0fdfa', borderColor: '#ccfbf1' }}>
                    <div className="conversion-item">
                      <span className="conv-label" style={{ color: '#0d9488' }}>Rapidez Tangencial v_t(0):</span>
                      <span className="conv-value" style={{ color: '#0f766e', fontWeight: 800 }}>{vt0.toFixed(2)} m/s</span>
                    </div>
                    <div className="conversion-item">
                      <span className="conv-label" style={{ color: '#0d9488' }}>Aceleración Tangencial a_t:</span>
                      <span className="conv-value" style={{ color: '#0f766e', fontWeight: 800 }}>{at.toFixed(2)} m/s² (cte)</span>
                    </div>
                    <div className="conversion-item">
                      <span className="conv-label" style={{ color: '#0d9488' }}>Aceleración Centrípeta a_c(0):</span>
                      <span className="conv-value" style={{ color: '#0f766e', fontWeight: 800 }}>{ac0.toFixed(2)} m/s²</span>
                    </div>
                    <div className="conversion-item">
                      <span className="conv-label" style={{ color: '#0d9488' }}>Aceleración Total a_tot(0):</span>
                      <span className="conv-value" style={{ color: '#0f766e', fontWeight: 800 }}>{aTot0.toFixed(2)} m/s²</span>
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* 8. POLEAS MCU (mcu_pulley_system)                             */}
          {/* ------------------------------------------------------------- */}
          {element.physicsType === 'mcu_pulley_system' && (
            <>
              {/* Transmission Configuration */}
              <div className="inspector-field">
                <div className="inspector-field-header">
                  <label className="inspector-label">Tipo de Transmisión:</label>
                  <span className="field-badge-mru" style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}>
                    Poleas MCU
                  </span>
                </div>
                <select
                  className="inspector-input"
                  value={poleasConfig}
                  onChange={(e) => setPoleasConfig(e.target.value)}
                >
                  <option value="belt">Unidas por Faja / Correa (v₁ = v₂)</option>
                  <option value="concentric">Mismo Eje Concéntrico (ω₁ = ω₂)</option>
                  <option value="concentric_hanging_block">Tambor Concéntrico con Bloque Colgante</option>
                  <option value="concentric_and_belt">Eje Común A-B + Faja B-C</option>
                  <option value="belt_and_concentric">Faja A-B + Eje Común B-C</option>
                  <option value="compound_train_2stage">Tren Compuesto Reductor (2 Etapas)</option>
                  <option value="compound_train_3stage">Tren Compuesto 3 Etapas</option>
                  <option value="double_reduction">Tren Reductor Doble 4:1</option>
                  <option value="washing_machine">Transmisión Lavadora con Faja</option>
                </select>
              </div>

              {/* Pulley 1 Radius */}
              <div className="inspector-field">
                <label className="inspector-label">Radio Polea 1 r₁ (Entrada / Motriz):</label>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="inspector-input number-input"
                    value={poleasR1}
                    onChange={(e) => setPoleasR1(e.target.value)}
                    required
                  />
                  <div className="static-unit-box">m</div>
                </div>
              </div>

              {/* Pulley 2 Radius */}
              <div className="inspector-field">
                <label className="inspector-label">Radio Polea 2 r₂ (Salida / Conducida):</label>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="inspector-input number-input"
                    value={poleasR2}
                    onChange={(e) => setPoleasR2(e.target.value)}
                    required
                  />
                  <div className="static-unit-box">m</div>
                </div>
              </div>

              {/* Input Angular Velocity */}
              <div className="inspector-field">
                <label className="inspector-label">Velocidad Angular de Entrada (ω₁):</label>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="0.1"
                    className="inspector-input number-input"
                    value={poleasOmega1}
                    onChange={(e) => setPoleasOmega1(e.target.value)}
                    required
                  />
                  <div className="static-unit-box">rad/s</div>
                </div>
              </div>

              {/* Crossed Belt Toggle */}
              {poleasConfig === 'belt' && (
                <div className="inspector-field">
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={poleasBeltCrossed}
                      onChange={(e) => setPoleasBeltCrossed(e.target.checked)}
                    />
                    <span>Correa Cruzada (invierte sentido de giro)</span>
                  </label>
                </div>
              )}

              {/* Real-time Transmission Telemetry Card */}
              {(() => {
                const w1 = parseFloat(poleasOmega1) || 5.0;
                const r1 = parseFloat(poleasR1) || 0.20;
                const r2 = parseFloat(poleasR2) || 0.10;
                let w2 = w1;
                let v = Math.abs(w1) * r1;
                let ratio = 1.0;
                if (poleasConfig === 'belt' || poleasConfig === 'washing_machine') {
                  ratio = r1 / Math.max(0.001, r2);
                  w2 = w1 * ratio;
                }
                const rpm1 = (Math.abs(w1) * 60) / (2 * Math.PI);
                const rpm2 = (Math.abs(w2) * 60) / (2 * Math.PI);
                return (
                  <div className="conversions-box" style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}>
                    <div className="conversion-item">
                      <span className="conv-label" style={{ color: '#047857' }}>Velocidad Angular Salida (ω₂):</span>
                      <span className="conv-value" style={{ color: '#064e3b', fontWeight: 800 }}>{w2.toFixed(2)} rad/s ({rpm2.toFixed(0)} RPM)</span>
                    </div>
                    <div className="conversion-item">
                      <span className="conv-label" style={{ color: '#047857' }}>Rapidez Tangencial Periférica:</span>
                      <span className="conv-value" style={{ color: '#064e3b', fontWeight: 800 }}>{v.toFixed(2)} m/s</span>
                    </div>
                    <div className="conversion-item">
                      <span className="conv-label" style={{ color: '#047857' }}>Relación de Transmisión (i):</span>
                      <span className="conv-value" style={{ color: '#064e3b', fontWeight: 800 }}>{ratio.toFixed(3)}</span>
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* 8.5 SEGUNDA LEY DE NEWTON SIN FRICCIÓN (newton_frictionless_system) */}
          {/* ------------------------------------------------------------- */}
          {element.physicsType === 'newton_frictionless_system' && (
            <>
              {/* Type Information */}
              <div className="inspector-field">
                <div className="inspector-field-header">
                  <label className="inspector-label">Aparato Dinámico:</label>
                  <span className="field-badge-mru" style={{ background: '#eef2ff', color: '#4f46e5', borderColor: '#c7d2fe' }}>
                    {props.apparatusType === 'two_connected_blocks' && '2 Bloques Conectados por Cuerda'}
                    {props.apparatusType === 'single_block_force' && 'Bloque Simple con Fuerza F'}
                    {props.apparatusType === 'vertical_cable_mass' && 'Masa Suspendida / Elevador'}
                    {props.apparatusType === 'atwood_frictionless' && 'Máquina de Atwood sin Fricción'}
                    {props.apparatusType === 'inclined_plane_frictionless' && 'Plano Inclinado sin Fricción (32°)'}
                    {!props.apparatusType && 'Sistema Dinámico'}
                  </span>
                </div>
              </div>

              {/* Mass 1 (m1) */}
              <div className="inspector-field">
                <label className="inspector-label">
                  {props.apparatusType === 'two_connected_blocks' ? 'Masa Bloque 1 (m₁ - Trasero):' :
                   props.apparatusType === 'atwood_frictionless' ? 'Masa 1 (m₁ - Asciende):' :
                   props.apparatusType === 'inclined_plane_frictionless' ? 'Masa en Plano (m₁):' :
                   'Masa del Cuerpo (m₁):'}
                </label>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    className="inspector-input number-input"
                    value={newtonMass1}
                    onChange={(e) => setNewtonMass1(e.target.value)}
                    required
                  />
                  <div className="static-unit-box">kg</div>
                </div>
              </div>

              {/* Mass 2 (m2) if apparatus has 2 masses */}
              {(props.apparatusType === 'two_connected_blocks' ||
                props.apparatusType === 'atwood_frictionless' ||
                props.apparatusType === 'inclined_plane_frictionless') && (
                <div className="inspector-field">
                  <label className="inspector-label">
                    {props.apparatusType === 'two_connected_blocks' ? 'Masa Bloque 2 (m₂ - Delantero con F):' :
                     props.apparatusType === 'atwood_frictionless' ? 'Masa 2 (m₂ - Desciende):' :
                     'Masa Colgante (m₂):'}
                  </label>
                  <div className="inspector-unit-group">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      className="inspector-input number-input"
                      value={newtonMass2}
                      onChange={(e) => setNewtonMass2(e.target.value)}
                      required
                    />
                    <div className="static-unit-box">kg</div>
                  </div>
                </div>
              )}

              {/* Applied Force F (if apparatus has external pulling force) */}
              {(props.apparatusType === 'two_connected_blocks' ||
                props.apparatusType === 'single_block_force' ||
                props.apparatusType === 'vertical_cable_mass') && (
                <div className="inspector-field">
                  <label className="inspector-label">Fuerza Aplicada Externa (F):</label>
                  <div className="inspector-unit-group">
                    <input
                      type="number"
                      step="1"
                      className="inspector-input number-input"
                      value={newtonForce}
                      onChange={(e) => setNewtonForce(e.target.value)}
                      required
                    />
                    <div className="static-unit-box">N</div>
                  </div>
                </div>
              )}

              {/* Real-time Newton Physics Calculation Preview Card */}
              {(() => {
                const m1 = Math.max(0.01, parseFloat(newtonMass1) || 1.0);
                const m2 = Math.max(0.01, parseFloat(newtonMass2) || 1.0);
                const f = parseFloat(newtonForce) || 0.0;
                let a = 0;
                let t = 0;

                if (props.apparatusType === 'two_connected_blocks') {
                  a = f / (m1 + m2);
                  t = m1 * a;
                } else if (props.apparatusType === 'single_block_force') {
                  a = f / m1;
                } else if (props.apparatusType === 'vertical_cable_mass') {
                  const w = m1 * 9.8;
                  a = (f - w) / m1;
                } else if (props.apparatusType === 'atwood_frictionless') {
                  a = (9.8 * Math.abs(m2 - m1)) / (m1 + m2);
                  t = (2 * m1 * m2 * 9.8) / (m1 + m2);
                } else if (props.apparatusType === 'inclined_plane_frictionless') {
                  const sin32 = Math.sin((32 * Math.PI) / 180);
                  a = (m1 * 9.8 * sin32 - m2 * 9.8) / (m1 + m2);
                  t = m2 * (9.8 + a);
                }

                return (
                  <div className="conversions-box" style={{ background: '#f8fafc', borderColor: '#cbd5e1' }}>
                    <div className="conversion-item">
                      <span className="conv-label" style={{ color: '#4f46e5' }}>Aceleración Teórica (a):</span>
                      <span className="conv-value" style={{ color: '#4338ca', fontWeight: 800 }}>{a.toFixed(3)} m/s²</span>
                    </div>
                    {(props.apparatusType === 'two_connected_blocks' ||
                      props.apparatusType === 'atwood_frictionless' ||
                      props.apparatusType === 'inclined_plane_frictionless') && (
                      <div className="conversion-item">
                        <span className="conv-label" style={{ color: '#059669' }}>Tensión del Cable (T):</span>
                        <span className="conv-value" style={{ color: '#047857', fontWeight: 800 }}>{t.toFixed(2)} N</span>
                      </div>
                    )}
                    <div className="conversion-item">
                      <span className="conv-label" style={{ color: '#64748b' }}>Fricción en Superficie (μ):</span>
                      <span className="conv-value" style={{ color: '#0f172a', fontWeight: 800 }}>μ = 0 (Sin Fricción)</span>
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* 9. DIAGRAMA DE CUERPO LIBRE Y EQUILIBRIO TRASLACIONAL / NEWTON */}
          {/* ------------------------------------------------------------- */}
          {(element.physicsType === 'dcl_diagram' || element.physicsType === 'translational_equilibrium' || element.physicsType === 'newton_frictionless_system') && (
            <>
              {/* Body Selector Tabs */}
              {dclBodies.length > 1 && (
                <div className="inspector-field">
                  <label className="inspector-label">Seleccionar Cuerpo / Masa del Sistema:</label>
                  <div className="quick-presets-row">
                    {dclBodies.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        className={`quick-pill-btn ${selectedDclBody === b.id ? 'active' : ''}`}
                        onClick={() => setSelectedDclBody(b.id)}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Vector Panel */}
              <div className="dcl-inspector-add-panel" style={{ background: '#fffaf5', border: '1px solid #fed7aa', borderRadius: 10, padding: 12, marginBottom: 14 }}>
                <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ea580c', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Plus size={14} />
                  <span>Añadir Vector de Fuerza a {dclBodies.find((b) => b.id === selectedDclBody)?.label || 'Cuerpo'}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: 3 }}>Tipo de Fuerza:</label>
                    <select
                      className="inspector-input"
                      value={newVecType}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewVecType(val);
                        if (val === 'weight') { setNewVecSymbol('W'); setNewVecAngle(270); setNewVecColor('#ef4444'); }
                        else if (val === 'normal') { setNewVecSymbol('N'); setNewVecAngle(90); setNewVecColor('#3b82f6'); }
                        else if (val === 'tension') { setNewVecSymbol('T'); setNewVecColor('#10b981'); }
                        else if (val === 'friction') { setNewVecSymbol('fk'); setNewVecAngle(180); setNewVecColor('#f59e0b'); }
                        else { setNewVecSymbol('F'); setNewVecAngle(0); setNewVecColor('#8b5cf6'); }
                      }}
                    >
                      <option value="weight">🔴 Peso Gravitacional (W)</option>
                      <option value="normal">🔵 Fuerza Normal (N)</option>
                      <option value="tension">🟢 Tensión de Cuerda (T)</option>
                      <option value="friction">🟠 Fricción Cinética (fk)</option>
                      <option value="applied">🟣 Fuerza Externa / Aplicada (F)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: 3 }}>Símbolo / Etiqueta:</label>
                    <input
                      type="text"
                      className="inspector-input"
                      value={newVecSymbol}
                      onChange={(e) => setNewVecSymbol(e.target.value)}
                      placeholder="Ej. T₁, N, W..."
                    />
                  </div>
                </div>

                {/* Angle selection */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <label style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700 }}>Dirección (Ángulo θ):</label>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ea580c', fontFamily: 'monospace' }}>{newVecAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="5"
                    style={{ width: '100%', accentColor: '#ea580c' }}
                    value={newVecAngle}
                    onChange={(e) => setNewVecAngle(parseInt(e.target.value, 10))}
                  />
                  <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                    {[
                      { l: '↑ Arriba (90°)', deg: 90 },
                      { l: '↓ Abajo (270°)', deg: 270 },
                      { l: '→ Der (0°)', deg: 0 },
                      { l: '← Izq (180°)', deg: 180 },
                    ].map((d) => (
                      <button
                        key={d.deg}
                        type="button"
                        className="quick-pill-btn"
                        style={newVecAngle === d.deg ? { background: '#ea580c', color: '#fff', borderColor: '#ea580c' } : { fontSize: '0.68rem', padding: '2px 5px' }}
                        onClick={() => setNewVecAngle(d.deg)}
                      >
                        {d.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Magnitude */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: 3 }}>Magnitud (Newtons):</label>
                    <input
                      type="number"
                      step="0.1"
                      className="inspector-input"
                      value={newVecMagnitude}
                      onChange={(e) => setNewVecMagnitude(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <button
                    type="button"
                    className="inspector-btn submit"
                    style={{ height: 36, padding: '0 14px', fontSize: '0.78rem', background: '#ea580c' }}
                    onClick={() => {
                      const newId = `vec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
                      const newVec = {
                        id: newId,
                        targetBody: selectedDclBody,
                        name: newVecSymbol,
                        symbol: newVecSymbol,
                        label: `${newVecSymbol}${newVecMagnitude ? ` = ${newVecMagnitude} N` : ''}`,
                        type: newVecType,
                        angleDeg: newVecAngle,
                        color: newVecColor,
                        magnitude: newVecMagnitude,
                        lengthPx: 62,
                      };
                      setDclUserVectors((prev) => [...prev, newVec]);
                      setDclShowOfficial(false);
                    }}
                  >
                    + Añadir Vector
                  </button>
                </div>
              </div>

              {/* List of active vectors on current body */}
              <div className="inspector-field">
                <div className="inspector-field-header">
                  <label className="inspector-label">Vectores Colocados en {dclBodies.find((b) => b.id === selectedDclBody)?.label || 'este Cuerpo'}:</label>
                  <span className="field-badge-mru">
                    {dclUserVectors.filter((v) => (v.targetBody || 'main') === selectedDclBody).length} activos
                  </span>
                </div>

                {dclUserVectors.filter((v) => (v.targetBody || 'main') === selectedDclBody).length === 0 ? (
                  <div style={{ padding: 10, background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1', fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
                    No hay vectores colocados en este cuerpo. Añade uno arriba o arrastra la punta de flecha en el lienzo.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {dclUserVectors
                      .filter((v) => (v.targetBody || 'main') === selectedDclBody)
                      .map((v) => (
                        <div
                          key={v.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: 6,
                            padding: '6px 10px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: v.color || '#ea580c' }} />
                            <strong style={{ fontSize: '0.8rem', color: '#0f172a' }}>{v.symbol || v.name}</strong>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>θ = {Math.round(v.angleDeg)}°</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input
                              type="range"
                              min="0"
                              max="360"
                              step="5"
                              style={{ width: 70, accentColor: '#ea580c' }}
                              value={Math.round(v.angleDeg || 0)}
                              onChange={(e) => {
                                const newAngle = parseInt(e.target.value, 10);
                                setDclUserVectors((prev) =>
                                  prev.map((item) => (item.id === v.id ? { ...item, angleDeg: newAngle } : item))
                                );
                              }}
                            />
                            <button
                              type="button"
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2 }}
                              onClick={() => {
                                setDclUserVectors((prev) => prev.filter((item) => item.id !== v.id));
                              }}
                              title="Eliminar vector"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Official Solution and Clear Actions */}
              <div style={{ display: 'flex', gap: 8, margin: '10px 0' }}>
                <button
                  type="button"
                  className={`quick-pill-btn ${dclShowOfficial ? 'active' : ''}`}
                  style={{ flex: 1, padding: '7px 10px' }}
                  onClick={() => setDclShowOfficial((prev) => !prev)}
                >
                  {dclShowOfficial ? 'Ocultar Solución Teórica' : 'Ver Solución Teórica Oficial'}
                </button>
                {dclUserVectors.length > 0 && (
                  <button
                    type="button"
                    className="quick-pill-btn"
                    style={{ background: '#fef2f2', color: '#ef4444', borderColor: '#fecaca', padding: '7px 10px' }}
                    onClick={() => setDclUserVectors([])}
                  >
                    Limpiar Todos
                  </button>
                )}
              </div>
            </>
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
