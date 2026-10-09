// =========================================================================
// HEADLESS MATTER.JS PHYSICS SIMULATION ENGINE FOR WHITEBOARD
// Compiles whiteboard elements (MRU carts, tracks, masses, pulleys, ropes)
// into an in-memory world, simulates real physical dynamics and syncs to canvas.
// =========================================================================
import MatterLib from 'matter-js';
import { getAnchorAbsolutePosition, getProjectileScale } from './physicsRegistry.js';

/**
 * Creates and compiles a headless simulation from whiteboard elements
 */
export function createHeadlessSimulation(elements, options = {}) {
  const Matter = MatterLib?.default || MatterLib;
  const { Engine, Bodies, Body, Constraint, World, Events } = Matter;

  const gravityScale = options.gravityScale !== undefined ? options.gravityScale : 1.0;
  const realG = options.realG !== undefined ? options.realG : 9.8; // m/s^2

  // 1. Create headless engine with stiff constraint iterations
  const engine = Engine.create({
    positionIterations: 16,
    velocityIterations: 16,
    constraintIterations: 16,
    gravity: {
      x: 0,
      y: gravityScale,
      scale: 0.001,
    },
  });

  const bodyMap = new Map();
  const atwoodSystems = [];
  const mruSystems = [];
  const standardConstraints = [];

  // Snapshot initial coordinates for reset capability
  const initialSnapshot = elements.map((el) => {
    if (el.type === 'physics_object') {
      return {
        id: el.id,
        x: el.x,
        y: el.y,
        properties: { ...el.properties },
      };
    }
    if (el.type === 'physics_connection') {
      return {
        id: el.id,
        properties: { ...el.properties },
      };
    }
    return null;
  }).filter(Boolean);

  const physicsObjects = elements.filter((el) => el.type === 'physics_object');
  const connections = elements.filter((el) => el.type === 'physics_connection');

  // -------------------------------------------------------------------------
  // 2. COMPILE MRU (MOVIMIENTO RECTILÍNEO UNIFORME) OBJECTS
  // -------------------------------------------------------------------------
  // 2. COMPILE CINEMÁTICA: MRU & MRUV (CARROS SOBRE RIEL GRADUADO O LIBRES)
  // -------------------------------------------------------------------------
  const mruCarts = physicsObjects.filter(
    (el) => el.physicsType === 'mru_cart' || el.physicsType === 'mruv_cart'
  );
  const mruTracks = physicsObjects.filter((el) => el.physicsType === 'mru_track');
  const mruGates = physicsObjects.filter((el) => el.physicsType === 'mru_photogate');

  mruCarts.forEach((cartEl) => {
    const isMruv = cartEl.physicsType === 'mruv_cart';
    const v = cartEl.properties?.velocity !== undefined 
      ? cartEl.properties.velocity 
      : (isMruv ? 0.0 : 2.0);
    const a = cartEl.properties?.acceleration !== undefined 
      ? cartEl.properties.acceleration 
      : (isMruv ? 2.0 : 0.0);
    const initialV = cartEl.properties?.initialVelocity !== undefined 
      ? cartEl.properties.initialVelocity 
      : v;

    // Find closest track underneath cart if present (with 65px vertical tolerance and horizontal alignment)
    const track = mruTracks.find(
      (t) => Math.abs(t.y - (cartEl.y + cartEl.height)) < 65 &&
             cartEl.x >= t.x - 60 && cartEl.x <= t.x + t.width + 60
    );

    let startX = cartEl.x;
    let trackMinX = -50000;
    let trackMaxX = 50000;

    if (track) {
      trackMinX = track.x + 10;
      trackMaxX = track.x + track.width - cartEl.width - 10;

      // If cart is already at or beyond bumper, reset to start of track
      if (initialV >= 0 && startX >= trackMaxX - 5) {
        startX = trackMinX;
      } else if (initialV < 0 && startX <= trackMinX + 5) {
        startX = trackMaxX;
      }
    }

    mruSystems.push({
      cartId: cartEl.id,
      physicsType: cartEl.physicsType,
      isMruv: isMruv || Math.abs(a) > 0.0001,
      velocity: initialV, // m/s (instantaneous velocity)
      initialVelocity: initialV,
      acceleration: a, // m/s²
      currentX: startX,
      initialX: startX,
      y: cartEl.y,
      width: cartEl.width,
      distanceMeters: cartEl.properties?.distance || 0.0,
      trackId: track ? track.id : null,
      trackMinX,
      trackMaxX,
      isFinished: false,
    });
  });

  // Sync initialSnapshot for any cart that was auto-reset from bumper
  mruSystems.forEach((sys) => {
    const snap = initialSnapshot.find((s) => s.id === sys.cartId);
    if (snap) {
      snap.x = sys.initialX;
    }
  });

  // -------------------------------------------------------------------------
  // 2.1 COMPILE CAÍDA LIBRE (HT03): CUERPOS EN CAÍDA VERTICAL BAJO GRAVEDAD
  // -------------------------------------------------------------------------
  const freefallSystems = [];
  const freefallBodies = physicsObjects.filter((el) => el.physicsType === 'freefall_body');
  const freefallTowers = physicsObjects.filter((el) => el.physicsType === 'freefall_tower');

  freefallBodies.forEach((bodyEl) => {
    const v0 = bodyEl.properties?.initialVelocity !== undefined 
      ? bodyEl.properties.initialVelocity 
      : (bodyEl.properties?.velocity !== undefined ? bodyEl.properties.velocity : 0.0);
    const g = bodyEl.properties?.gravity !== undefined ? bodyEl.properties.gravity : realG;

    // Find nearest tower (within reasonable horizontal range or closest)
    let tower = null;
    if (freefallTowers.length > 0) {
      tower = [...freefallTowers].sort(
        (a, b) => Math.abs((a.x + a.width / 2) - (bodyEl.x + bodyEl.width / 2)) - 
                  Math.abs((b.x + b.width / 2) - (bodyEl.x + bodyEl.width / 2))
      )[0];
    }

    let groundY;
    let travelMeters;
    let pxPerMeter;

    if (tower) {
      groundY = tower.y + tower.height - bodyEl.height - 12;
      travelMeters = tower.properties?.heightMeters || 50.0;
      const travelPx = Math.max(100, groundY - bodyEl.y);
      pxPerMeter = travelPx / travelMeters;
    } else {
      travelMeters = bodyEl.properties?.releaseHeight || 50.0;
      pxPerMeter = 24; // Standard vertical scale: 24px = 1m
      groundY = bodyEl.y + travelMeters * pxPerMeter;
    }

    freefallSystems.push({
      bodyId: bodyEl.id,
      physicsType: 'freefall_body',
      velocity: v0, // m/s downwards (+)
      initialVelocity: v0,
      gravity: g, // m/s² downwards (+)
      currentY: bodyEl.y,
      initialY: bodyEl.y,
      x: bodyEl.x,
      width: bodyEl.width,
      height: bodyEl.height,
      distanceFallen: 0.0, // meters
      groundY,
      towerId: tower ? tower.id : null,
      pxPerMeter,
      isFinished: false,
    });
  });

  // -------------------------------------------------------------------------
  // 2.2 COMPILE TIRO VERTICAL (HT04): LANZAMIENTO VERTICAL HACIA ARRIBA
  // -------------------------------------------------------------------------
  const verticalLaunchSystems = [];
  const verticalProjectiles = physicsObjects.filter((el) => el.physicsType === 'vertical_projectile');

  verticalProjectiles.forEach((projEl) => {
    const v0 = projEl.properties?.initialVelocity !== undefined 
      ? projEl.properties.initialVelocity 
      : (projEl.properties?.velocity !== undefined ? projEl.properties.velocity : 20.0);
    const g = projEl.properties?.gravity !== undefined ? projEl.properties.gravity : realG;

    // Find nearest vertical tower or scale if available
    let tower = null;
    if (freefallTowers.length > 0) {
      tower = [...freefallTowers].sort(
        (a, b) => Math.abs((a.x + a.width / 2) - (projEl.x + projEl.width / 2)) - 
                  Math.abs((b.x + b.width / 2) - (projEl.x + projEl.width / 2))
      )[0];
    }

    let pxPerMeter;
    if (tower) {
      const towerHeightMeters = tower.properties?.heightMeters || 50.0;
      pxPerMeter = (tower.height - 40) / towerHeightMeters;
    } else {
      pxPerMeter = 18; // 18px = 1m standard scale for vertical trajectory
    }

    const hMax = (v0 * v0) / (2 * Math.max(0.01, g));

    verticalLaunchSystems.push({
      bodyId: projEl.id,
      physicsType: 'vertical_projectile',
      velocity: v0, // m/s (positive = UPWARDS in kinematics convention)
      initialVelocity: v0,
      gravity: g, // m/s² deceleration
      currentY: projEl.y,
      initialY: projEl.y,
      launchY: projEl.y,
      x: projEl.x,
      width: projEl.width,
      height: projEl.height,
      currentHeightMeters: 0.0,
      maxHeightMeters: hMax,
      isAscending: v0 > 0,
      reachedApex: false,
      pxPerMeter,
      towerId: tower ? tower.id : null,
      isFinished: false,
    });
  });

  // -------------------------------------------------------------------------
  // 2.3 COMPILE LANZAMIENTO HORIZONTAL (HT01): MOVIMIENTO 2D (MRU X + CAÍDA LIBRE Y)
  // -------------------------------------------------------------------------
  const horizontalLaunchSystems = [];
  const horizontalProjectiles = physicsObjects.filter((el) => el.physicsType === 'horizontal_projectile');
  const cliffPlatforms = physicsObjects.filter((el) => el.physicsType === 'cliff_platform');

  horizontalProjectiles.forEach((projEl) => {
    const v0x = projEl.properties?.initialVelocity !== undefined 
      ? projEl.properties.initialVelocity 
      : (projEl.properties?.velocity !== undefined ? projEl.properties.velocity : 20.0);
    const g = projEl.properties?.gravity !== undefined ? projEl.properties.gravity : realG;
    const hMeters = projEl.properties?.heightMeters !== undefined ? projEl.properties.heightMeters : 20.0;

    // Detect if attached or near a cliff platform
    let cliff = null;
    if (cliffPlatforms.length > 0) {
      cliff = [...cliffPlatforms].sort(
        (a, b) => Math.abs((a.x + a.width) - projEl.x) - Math.abs((b.x + b.width) - projEl.x)
      )[0];
    }

    let pxPerMeter;
    let groundY;
    if (cliff) {
      const cliffHMeters = cliff.properties?.heightMeters || hMeters;
      pxPerMeter = cliff.height / Math.max(0.1, cliffHMeters);
      groundY = cliff.y + cliff.height;
    } else {
      pxPerMeter = 14; // Standard 14px = 1m
      groundY = projEl.y + projEl.height + hMeters * pxPerMeter;
    }

    const flightTime = Math.sqrt((2 * Math.max(0.1, hMeters)) / Math.max(0.1, g));
    const rangeTheoretical = v0x * flightTime;

    horizontalLaunchSystems.push({
      bodyId: projEl.id,
      physicsType: 'horizontal_projectile',
      vx: v0x,
      initialVx: v0x,
      vy: 0.0,
      vResultant: v0x,
      angleDeg: 0.0,
      gravity: g,
      initialX: projEl.x,
      initialY: projEl.y,
      currentX: projEl.x,
      currentY: projEl.y,
      groundY,
      heightMeters: hMeters,
      currentHeightMeters: hMeters,
      currentRangeMeters: 0.0,
      flightTimeTheoretical: flightTime,
      rangeTheoretical,
      trailPoints: [{ x: projEl.x + projEl.width / 2, y: projEl.y + projEl.height / 2 }],
      pxPerMeter,
      width: projEl.width,
      height: projEl.height,
      cliffId: cliff ? cliff.id : null,
      isFinished: false,
    });
  });

  // -------------------------------------------------------------------------
  // 2.4 COMPILE MOVIMIENTO DE PROYECTILES (HT02): TIRO PARABÓLICO 2D CON ÁNGULO θ
  // -------------------------------------------------------------------------
  const projectileMotionSystems = [];
  const obliqueProjectiles = physicsObjects.filter((el) => el.physicsType === 'oblique_projectile');
  const cannonLaunchers = physicsObjects.filter((el) => el.physicsType === 'cannon_launcher');

  obliqueProjectiles.forEach((projEl) => {
    const v0 = projEl.properties?.initialVelocity !== undefined 
      ? projEl.properties.initialVelocity 
      : (projEl.properties?.velocity !== undefined ? projEl.properties.velocity : 20.0);
    const thetaDeg = projEl.properties?.initialAngleDeg !== undefined 
      ? projEl.properties.initialAngleDeg 
      : (projEl.properties?.angleDeg !== undefined ? projEl.properties.angleDeg : 37.0);
    const g = projEl.properties?.gravity !== undefined ? projEl.properties.gravity : realG;
    const launchHeightM = projEl.properties?.launchHeight !== undefined ? projEl.properties.launchHeight : 0.0;

    let cannon = null;
    if (cannonLaunchers.length > 0) {
      cannon = [...cannonLaunchers].sort(
        (a, b) => Math.abs(a.x - projEl.x) - Math.abs(b.x - projEl.x)
      )[0];
    }

    const rad = (thetaDeg * Math.PI) / 180;
    const v0x = v0 * Math.cos(rad);
    const v0y = v0 * Math.sin(rad);

    const timeToApex = v0y > 0 ? v0y / g : 0.0;
    const hMaxTheoretical = launchHeightM + (v0y > 0 ? (v0y * v0y) / (2 * g) : 0);

    const aQuad = 0.5 * g;
    const bQuad = -v0y;
    const cQuad = -launchHeightM;
    const disc = bQuad * bQuad - 4 * aQuad * cQuad;
    const flightTimeTheoretical = disc >= 0 ? Math.max((-bQuad + Math.sqrt(disc)) / (2 * aQuad), (-bQuad - Math.sqrt(disc)) / (2 * aQuad)) : 0;
    const rangeTheoretical = v0x * flightTimeTheoretical;

    // --- Scale: prefer values already stamped by the exercise solver ---
    let pxPerMeter;
    if (projEl.properties?.pxPerMeter !== undefined) {
      pxPerMeter = projEl.properties.pxPerMeter;
    } else {
      pxPerMeter = getProjectileScale(rangeTheoretical);
    }

    let groundY;
    if (projEl.properties?.groundY !== undefined) {
      groundY = projEl.properties.groundY;
    } else if (launchHeightM > 0) {
      groundY = projEl.y + projEl.height + launchHeightM * pxPerMeter;
    } else {
      groundY = projEl.y + projEl.height;
    }


    projectileMotionSystems.push({
      bodyId: projEl.id,
      physicsType: 'oblique_projectile',
      v0,
      thetaDeg,
      initialThetaDeg: thetaDeg,
      vx: v0x,
      initialVx: v0x,
      vy: v0y,
      initialVy: v0y,
      vResultant: v0,
      angleDeg: thetaDeg,
      gravity: g,
      launchHeightMeters: launchHeightM,
      initialX: projEl.x,
      initialY: projEl.y,
      currentX: projEl.x,
      currentY: projEl.y,
      groundY,
      timeToApex,
      hMaxTheoretical,
      currentHeightMeters: launchHeightM,
      currentRangeMeters: 0.0,
      flightTimeTheoretical,
      rangeTheoretical,
      maxHeightReached: launchHeightM,
      reachedApex: v0y <= 0,
      trailPoints: [{ x: projEl.x + projEl.width / 2, y: projEl.y + projEl.height / 2 }],
      pxPerMeter,
      width: projEl.width,
      height: projEl.height,
      cannonId: cannon ? cannon.id : null,
      isFinished: false,
    });
  });

  // -------------------------------------------------------------------------
  // 2.5 COMPILE MOVIMIENTO CIRCULAR UNIFORME (HT03 MCU)
  // -------------------------------------------------------------------------
  const mcuSystems = [];
  const mcuParticles = physicsObjects.filter((el) => el.physicsType === 'mcu_particle');
  const mcuTurntables = physicsObjects.filter((el) => el.physicsType === 'mcu_turntable');

  mcuParticles.forEach((particleEl) => {
    const rM = particleEl.properties?.radiusMeters !== undefined ? particleEl.properties.radiusMeters : 1.0;
    const rPx = particleEl.properties?.radiusPx !== undefined ? particleEl.properties.radiusPx : 110;
    const omega = particleEl.properties?.initialOmega !== undefined
      ? particleEl.properties.initialOmega
      : (particleEl.properties?.omega !== undefined ? particleEl.properties.omega : 3.0);
    const angleRad = particleEl.properties?.initialAngleRad !== undefined
      ? particleEl.properties.initialAngleRad
      : (particleEl.properties?.angleRad !== undefined ? particleEl.properties.angleRad : 0.0);

    // Find nearest matching turntable or use particle's center reference
    let turntable = null;
    if (mcuTurntables.length > 0) {
      turntable = [...mcuTurntables].sort(
        (a, b) => Math.hypot((a.x + a.width / 2) - particleEl.x, (a.y + a.height / 2) - particleEl.y) -
                  Math.hypot((b.x + b.width / 2) - particleEl.x, (b.y + b.height / 2) - particleEl.y)
      )[0];
    }

    let cx, cy;
    if (turntable) {
      cx = turntable.x + turntable.width / 2;
      cy = turntable.y + turntable.height / 2;
    } else if (particleEl.properties?.centerX !== undefined && particleEl.properties?.centerY !== undefined) {
      cx = particleEl.properties.centerX;
      cy = particleEl.properties.centerY;
    } else {
      cx = particleEl.x + particleEl.width / 2 - rPx * Math.cos(angleRad);
      cy = particleEl.y + particleEl.height / 2 + rPx * Math.sin(angleRad);
    }

    const vt = Math.abs(omega) * rM;
    const ac = omega * omega * rM;
    const period = Math.abs(omega) > 0 ? (2 * Math.PI) / Math.abs(omega) : Infinity;
    const frequency = Math.abs(omega) > 0 ? Math.abs(omega) / (2 * Math.PI) : 0;
    const rpm = frequency * 60;

    mcuSystems.push({
      bodyId: particleEl.id,
      turntableId: turntable ? turntable.id : null,
      centerX: cx,
      centerY: cy,
      radiusMeters: rM,
      radiusPx: rPx,
      omega,
      initialOmega: omega,
      angleRad,
      initialAngleRad: angleRad,
      vt,
      ac,
      period,
      frequency,
      rpm,
      revolutions: 0.0,
      totalAngleRotated: 0.0,
      width: particleEl.width,
      height: particleEl.height,
      initialX: particleEl.x,
      initialY: particleEl.y,
      currentX: particleEl.x,
      currentY: particleEl.y,
      isFinished: false,
    });
  });

  // -------------------------------------------------------------------------
  // 2.6 COMPILE MOVIMIENTO CIRCULAR ACELERADO (MCUV / MCUA)
  // Unidad 2 Kinal - Diversificado
  // -------------------------------------------------------------------------
  const mcuvSystems = [];
  const mcuvParticles = physicsObjects.filter((el) => el.physicsType === 'mcuv_particle');
  const mcuvTurntables = physicsObjects.filter((el) => el.physicsType === 'mcuv_turntable');
  const pairedTurntableIds = new Set();

  mcuvParticles.forEach((particleEl) => {
    const rM = particleEl.properties?.radiusMeters !== undefined ? particleEl.properties.radiusMeters : 1.0;
    const rPx = particleEl.properties?.radiusPx !== undefined ? particleEl.properties.radiusPx : 110;
    const omega0 = particleEl.properties?.omega0 !== undefined
      ? particleEl.properties.omega0
      : (particleEl.properties?.initialOmega !== undefined
        ? particleEl.properties.initialOmega
        : (particleEl.properties?.omega !== undefined ? particleEl.properties.omega : 0.0));
    const alpha = particleEl.properties?.alpha !== undefined
      ? particleEl.properties.alpha
      : (particleEl.properties?.initialAlpha !== undefined ? particleEl.properties.initialAlpha : 2.0);
    const angleRad = particleEl.properties?.angleRad !== undefined
      ? particleEl.properties.angleRad
      : (particleEl.properties?.initialAngleRad !== undefined ? particleEl.properties.initialAngleRad : 0.0);

    // Find nearest matching turntable or use particle's center reference
    let turntable = null;
    if (mcuvTurntables.length > 0) {
      turntable = [...mcuvTurntables].sort(
        (a, b) => Math.hypot((a.x + a.width / 2) - particleEl.x, (a.y + a.height / 2) - particleEl.y) -
                  Math.hypot((b.x + b.width / 2) - particleEl.x, (b.y + b.height / 2) - particleEl.y)
      )[0];
    }

    if (turntable) {
      pairedTurntableIds.add(turntable.id);
    }

    let cx, cy;
    if (turntable) {
      cx = turntable.x + turntable.width / 2;
      cy = turntable.y + turntable.height / 2;
    } else if (particleEl.properties?.centerX !== undefined && particleEl.properties?.centerY !== undefined) {
      cx = particleEl.properties.centerX;
      cy = particleEl.properties.centerY;
    } else {
      cx = particleEl.x + particleEl.width / 2 - rPx * Math.cos(angleRad);
      cy = particleEl.y + particleEl.height / 2 + rPx * Math.sin(angleRad);
    }

    const vt = Math.abs(omega0) * rM;
    const ac = omega0 * omega0 * rM;
    const at = Math.abs(alpha) * rM;
    const aTotal = Math.hypot(ac, at);
    const rpm = (Math.abs(omega0) * 60) / (2 * Math.PI);

    mcuvSystems.push({
      bodyId: particleEl.id,
      turntableId: turntable ? turntable.id : null,
      centerX: cx,
      centerY: cy,
      radiusMeters: rM,
      radiusPx: rPx,
      omega0,
      initialOmega: omega0,
      omega: omega0,
      alpha,
      initialAlpha: alpha,
      angleRad,
      initialAngleRad: angleRad,
      vt,
      ac,
      at,
      aTotal,
      rpm,
      revolutions: 0.0,
      totalAngleRotated: 0.0,
      width: particleEl.width,
      height: particleEl.height,
      initialX: particleEl.x,
      initialY: particleEl.y,
      currentX: particleEl.x,
      currentY: particleEl.y,
      isFinished: false,
    });
  });

  // Also compile standalone MCUV Turntables (rotors with no orbiting particle)
  mcuvTurntables.forEach((turntableEl) => {
    if (pairedTurntableIds.has(turntableEl.id)) return;

    const rM = turntableEl.properties?.radiusMeters !== undefined ? turntableEl.properties.radiusMeters : 1.0;
    const rPx = turntableEl.width / 2;
    const omega0 = turntableEl.properties?.omega0 !== undefined
      ? turntableEl.properties.omega0
      : (turntableEl.properties?.initialOmega !== undefined
        ? turntableEl.properties.initialOmega
        : (turntableEl.properties?.omega !== undefined ? turntableEl.properties.omega : 0.0));
    const alpha = turntableEl.properties?.alpha !== undefined
      ? turntableEl.properties.alpha
      : (turntableEl.properties?.initialAlpha !== undefined ? turntableEl.properties.initialAlpha : 2.0);
    const angleRad = turntableEl.properties?.angleRad !== undefined
      ? turntableEl.properties.angleRad
      : (turntableEl.properties?.initialAngleRad !== undefined ? turntableEl.properties.initialAngleRad : 0.0);

    const cx = turntableEl.x + turntableEl.width / 2;
    const cy = turntableEl.y + turntableEl.height / 2;
    const vt = Math.abs(omega0) * rM;
    const ac = omega0 * omega0 * rM;
    const at = Math.abs(alpha) * rM;
    const aTotal = Math.hypot(ac, at);
    const rpm = (Math.abs(omega0) * 60) / (2 * Math.PI);

    mcuvSystems.push({
      bodyId: null,
      turntableId: turntableEl.id,
      centerX: cx,
      centerY: cy,
      radiusMeters: rM,
      radiusPx: rPx,
      omega0,
      initialOmega: omega0,
      omega: omega0,
      alpha,
      initialAlpha: alpha,
      angleRad,
      initialAngleRad: angleRad,
      vt,
      ac,
      at,
      aTotal,
      rpm,
      revolutions: 0.0,
      totalAngleRotated: 0.0,
      width: turntableEl.width,
      height: turntableEl.height,
      initialX: turntableEl.x,
      initialY: turntableEl.y,
      currentX: turntableEl.x,
      currentY: turntableEl.y,
      isFinished: false,
    });
  });

  // -------------------------------------------------------------------------
  // 2.7 COMPILE SISTEMAS DE POLEAS MCU (HT01 U3)
  // Unidad 3 Kinal - Transmisión por Fajas y Mismo Eje Concéntrico
  // -------------------------------------------------------------------------
  const poleasMcuSystems = [];
  const poleasElements = physicsObjects.filter((el) => el.physicsType === 'mcu_pulley_system');

  poleasElements.forEach((el) => {
    const props = el.properties || {};
    const config = props.configuration || 'belt';
    const r1 = props.radiusMeters1 !== undefined ? props.radiusMeters1 : 0.20;
    const r2 = props.radiusMeters2 !== undefined ? props.radiusMeters2 : 0.10;
    const r3 = props.radiusMeters3 !== undefined ? props.radiusMeters3 : (r1 * 0.5);
    const r4 = props.radiusMeters4 !== undefined ? props.radiusMeters4 : (r2 * 2.0);

    const omega1 = props.omega1 !== undefined 
      ? props.omega1 
      : (props.omega !== undefined ? props.omega : 5.0);

    let ratio = 1.0;
    let omega2 = omega1;
    let linearSpeed = 0.0;

    if (config === 'concentric' || config === 'concentric_hanging_block') {
      ratio = 1.0;
      omega2 = omega1;
      linearSpeed = Math.abs(omega1) * r2;
    } else if (config === 'belt' || config === 'washing_machine') {
      ratio = r1 / Math.max(0.001, r2);
      omega2 = omega1 * ratio;
      linearSpeed = Math.abs(omega1) * r1;
    } else if (config === 'concentric_and_belt') {
      ratio = r2 / Math.max(0.001, r3);
      omega2 = omega1 * ratio;
      linearSpeed = Math.abs(omega1) * r2;
    } else if (config === 'belt_and_concentric') {
      ratio = r1 / Math.max(0.001, r2);
      omega2 = omega1 * ratio;
      linearSpeed = Math.abs(omega1) * r1;
    } else if (config === 'compound_train_2stage' || config === 'double_reduction') {
      ratio = (r1 * r3) / Math.max(0.0001, r2 * r4);
      omega2 = omega1 * ratio;
      linearSpeed = Math.abs(omega1) * r1;
    } else if (config === 'compound_train_3stage') {
      ratio = 0.05; // (10*20*30)/(40*50*60)
      omega2 = omega1 * ratio;
      linearSpeed = Math.abs(omega1) * r1;
    }

    const angle1 = props.angleRad1 !== undefined ? props.angleRad1 : 0.0;
    const angle2 = props.angleRad2 !== undefined ? props.angleRad2 : 0.0;

    poleasMcuSystems.push({
      id: el.id,
      configuration: config,
      radiusMeters1: r1,
      radiusMeters2: r2,
      radiusMeters3: r3,
      radiusMeters4: r4,
      omega1,
      initialOmega1: omega1,
      omega2,
      initialOmega2: omega2,
      angleRad1: angle1,
      initialAngleRad1: angle1,
      angleRad2: angle2,
      initialAngleRad2: angle2,
      linearSpeed,
      gearRatio: ratio,
      beltCrossed: !!props.beltCrossed,
      revolutions1: 0.0,
      revolutions2: 0.0,
      exerciseNumber: props.exerciseNumber,
    });
  });

  // -------------------------------------------------------------------------
  // 2.8 COMPILE DIAGRAMAS DE CUERPO LIBRE (HT02 DCL: MESA CON MASAS Y POLEAS)
  // -------------------------------------------------------------------------
  const dclSystems = [];
  const dclElements = physicsObjects.filter((el) => el.physicsType === 'dcl_diagram');

  dclElements.forEach((dclEl) => {
    const props = dclEl.properties || {};
    const appType = props.apparatusType || 'table_three_masses';
    const g = realG;

    if (appType === 'table_three_masses') {
      const m1 = props.mass1 || 6.0; // kg left
      const m2 = props.mass2 || 10.0; // kg center table
      const m3 = props.mass3 || 9.0; // kg right
      const mu = props.frictionCoeff !== undefined ? props.frictionCoeff : 0.20;

      const W1 = m1 * g;
      const W3 = m3 * g;
      const fk = mu * m2 * g;

      let netForce = 0;
      let accel = 0;
      let dir = 0;

      if (W3 > W1 + fk) {
        netForce = W3 - W1 - fk;
        accel = netForce / (m1 + m2 + m3);
        dir = 1;
      } else if (W1 > W3 + fk) {
        netForce = W1 - W3 - fk;
        accel = -netForce / (m1 + m2 + m3);
        dir = -1;
      } else {
        netForce = 0;
        accel = 0;
        dir = 0;
      }

      const T1 = accel >= 0 ? m1 * (g + accel) : m1 * (g - Math.abs(accel));
      const T2 = accel >= 0 ? m3 * (g - accel) : m3 * (g + Math.abs(accel));

      dclSystems.push({
        id: dclEl.id,
        apparatusType: 'table_three_masses',
        m1,
        m2,
        m3,
        mu,
        g,
        W1,
        W3,
        fk,
        netForce,
        accel,
        dir,
        T1,
        T2,
        currentVelocity: 0.0,
        displacementX: props.displacementX || 0.0,
        maxDisplacementX: 120.0,
        isFinished: false,
      });
    } else if (appType === 'table_two_masses') {
      const m1 = props.mass1 || 8.0; // table
      const m2 = props.mass2 || 4.0; // hanging
      const mu = props.frictionCoeff !== undefined ? props.frictionCoeff : 0.15;

      const W2 = m2 * g;
      const fk = mu * m1 * g;
      const netForce = Math.max(0, W2 - fk);
      const accel = netForce > 0 ? netForce / (m1 + m2) : 0;
      const T = m2 * (g - accel);

      dclSystems.push({
        id: dclEl.id,
        apparatusType: 'table_two_masses',
        m1,
        m2,
        mu,
        g,
        W2,
        fk,
        netForce,
        accel,
        T,
        currentVelocity: 0.0,
        displacementX: props.displacementX || 0.0,
        maxDisplacementX: 130.0,
        isFinished: false,
      });
    }
  });

  // -------------------------------------------------------------------------
  // 2.9 COMPILE EQUILIBRIO TRASLACIONAL (HT03: PRIMERA LEY DE NEWTON)
  // -------------------------------------------------------------------------
  const NOMINAL_APPARATUS_LOADS = {
    cable_knot_wall: { loadN: 600, massKg: 61.22, name: 'Objeto de 600 N' },
    two_pulleys_three_weights: { loadN: 500, massKg: 51.02, name: 'Pesa central FW1 de 500 N' },
    engine_suspended_cables: { loadN: 1960, massKg: 200.0, name: 'Motor de 200 kg (1960 N)' },
    triangular_knot_slope: { loadN: 200, massKg: 20.41, name: 'Objeto de 200 N' },
    crate_two_cables: { loadN: 2224, massKg: 226.8, name: 'Caja de 500 lb (2224 N)' },
    pulley_cylinder_knot: { loadN: 196, massKg: 20.0, name: 'Cilindro A de 20 kg (196 N)' },
    traffic_lights_span: { loadN: 98, massKg: 10.0, name: 'Semáforo de 10 kg (98 N)' },
    double_inclined_planes: { loadN: 177.9, massKg: 18.14, name: 'Caja B de 40 lb (177.9 N)' },
  };

  const equilibriumSystems = [];
  const eqElements = physicsObjects.filter((el) => el.physicsType === 'translational_equilibrium');

  eqElements.forEach((eqEl) => {
    const props = eqEl.properties || {};
    const appType = props.apparatusType || 'cable_knot_wall';
    const nominal = NOMINAL_APPARATUS_LOADS[appType] || { loadN: 500, massKg: 20.0, name: 'Carga suspendida' };
    const massKg = Number(props.mass) || nominal.massKg;
    const showOfficial = !!props.showOfficialSolution;
    const userVectors = Array.isArray(props.userVectors) ? props.userVectors : [];

    if (showOfficial) {
      // Solución Teórica Oficial resuelta: ΣFx = 0, ΣFy = 0, a = 0 (Reposo estático)
      equilibriumSystems.push({
        id: eqEl.id,
        systemTitle: props.systemTitle || 'Equilibrio Traslacional',
        apparatusType: appType,
        massKg,
        netFx: 0.0,
        netFy: 0.0,
        netForce: 0.0,
        accel: 0.0,
        isEquilibrium: true,
        displacementX: 0.0,
        displacementY: 0.0,
        currentVelocityX: 0.0,
        currentVelocityY: 0.0,
        isFinished: false,
        statusNote: '✓ Solución Oficial: Fuerzas en equilibrio (ΣF = 0, a = 0)',
      });
    } else if (userVectors.length === 0) {
      // Práctica activa limpia: NO se han colocado vectores de soporte todavía.
      // El peso físico W actúa naturalmente hacia abajo (270°), por lo que sin cables/fuerzas equilibrantes
      // la fuerza neta es hacia abajo y el objeto cae con aceleración g = 9.8 m/s²!
      const gravityAccel = 9.80;
      equilibriumSystems.push({
        id: eqEl.id,
        systemTitle: props.systemTitle || 'Equilibrio Traslacional',
        apparatusType: appType,
        massKg,
        netFx: 0.0,
        netFy: -nominal.loadN, // Hacia abajo (-Y matemático)
        netForce: nominal.loadN,
        accel: gravityAccel,
        isEquilibrium: false,
        displacementX: props.displacementX || 0.0,
        displacementY: props.displacementY || 0.0,
        currentVelocityX: 0.0,
        currentVelocityY: 0.0,
        isFinished: false,
        statusNote: `⚡ Solo actúa el Peso W = ${nominal.loadN} N hacia abajo (sin cables). Cae con a = 9.80 m/s². Añade tensiones (+T) para equilibrarlo!`,
      });
    } else {
      // El profesor o estudiante ha añadido vectores interactivos sobre el sistema:
      let sumFx = 0;
      let sumFy = 0;
      const hasExplicitWeight = userVectors.some(
        (v) => v.type === 'weight' || (Math.abs((v.angleDeg ?? 0) - 270) < 5 && (v.magnitude ?? 0) > 0)
      );

      userVectors.forEach((v) => {
        const rad = ((v.angleDeg || 0) * Math.PI) / 180;
        const mag = v.magnitude !== undefined ? v.magnitude : (v.lengthPx || 50);
        sumFx += mag * Math.cos(rad);
        sumFy += mag * Math.sin(rad);
      });

      // Si el profesor no añadió el vector de peso explícito en el DCL, la carga física W sigue actuando hacia abajo:
      if (!hasExplicitWeight) {
        sumFy -= nominal.loadN;
      }

      const netF = Math.hypot(sumFx, sumFy);
      const isEq = netF < 1.0; // Tolerancia de 1.0 N para equilibrio estático
      const accel = isEq ? 0.0 : netF / massKg;

      equilibriumSystems.push({
        id: eqEl.id,
        systemTitle: props.systemTitle || 'Equilibrio Traslacional',
        apparatusType: appType,
        massKg,
        netFx: sumFx,
        netFy: sumFy,
        netForce: netF,
        accel,
        isEquilibrium: isEq,
        displacementX: props.displacementX || 0.0,
        displacementY: props.displacementY || 0.0,
        currentVelocityX: 0.0,
        currentVelocityY: 0.0,
        isFinished: false,
        statusNote: isEq
          ? '✓ Primera Ley de Newton: ΣF = 0 (Equilibrio Traslacional Estático, a = 0)'
          : `⚡ Segunda Ley de Newton: ΣF = ${netF.toFixed(1)} N ≠ 0 ⇒ a = ${accel.toFixed(2)} m/s²`,
      });
    }
  });

  // -------------------------------------------------------------------------
  // 2.95 COMPILE SEGUNDA LEY DE NEWTON SIN FRICCIÓN (HT01 U4)
  // -------------------------------------------------------------------------
  const newtonSystems = [];
  const newtonElements = physicsObjects.filter((el) => el.physicsType === 'newton_frictionless_system');

  newtonElements.forEach((newtonEl) => {
    const props = newtonEl.properties || {};
    const appType = props.apparatusType || 'two_connected_blocks';
    const g = realG;
    const userVectors = Array.isArray(props.userVectors) ? props.userVectors : [];

    let accel = 0.0;
    let tension = 0.0;
    let appliedForce = Number(props.appliedForce) || 0.0;
    let mass1 = Number(props.mass1) || 2.0;
    let mass2 = Number(props.mass2) || 6.0;
    let mTotal = mass1;
    let formula = 'a = F / m';

    if (appType === 'two_connected_blocks') {
      mTotal = mass1 + mass2;
      formula = 'a = F / (m₁ + m₂)';
      if (userVectors.length > 0) {
        let sumFx = 0;
        userVectors.forEach((v) => {
          const rad = ((v.angleDeg || 0) * Math.PI) / 180;
          const mag = v.magnitude !== undefined ? v.magnitude : (v.lengthPx || 50);
          sumFx += mag * Math.cos(rad);
        });
        if (Math.abs(sumFx) > 0.01) {
          appliedForce = sumFx;
        }
      }
      accel = appliedForce / Math.max(0.01, mTotal);
      tension = mass1 * accel;
    } else if (appType === 'single_block_force') {
      mTotal = mass1;
      formula = 'a = F / m';
      if (userVectors.length > 0) {
        let sumFx = 0;
        userVectors.forEach((v) => {
          const rad = ((v.angleDeg || 0) * Math.PI) / 180;
          const mag = v.magnitude !== undefined ? v.magnitude : (v.lengthPx || 50);
          sumFx += mag * Math.cos(rad);
        });
        if (Math.abs(sumFx) > 0.01) {
          appliedForce = sumFx;
        }
      }
      accel = appliedForce / Math.max(0.01, mTotal);
      tension = 0.0;
    } else if (appType === 'vertical_cable_mass') {
      mTotal = mass1;
      formula = 'a = (T - W) / m';
      const W = mass1 * g;
      const T = appliedForce > 0 ? appliedForce : (props.tension || 200.0);
      const netF = T - W;
      accel = netF / Math.max(0.01, mass1);
      tension = T;
    } else if (appType === 'atwood_frictionless') {
      mTotal = mass1 + mass2;
      formula = 'a = |m₂ - m₁|·g / (m₁ + m₂)';
      accel = ((mass2 - mass1) * g) / Math.max(0.01, mTotal);
      tension = (2 * mass1 * mass2 * g) / Math.max(0.01, mTotal);
    } else if (appType === 'inclined_plane_frictionless') {
      const thetaDeg = props.angleDeg !== undefined ? props.angleDeg : 32.0;
      const rad = (thetaDeg * Math.PI) / 180;
      mTotal = mass1 + mass2;
      formula = 'a = (m₂·g - m₁·g·sinθ) / (m₁ + m₂)';
      const netF = (mass2 * g) - (mass1 * g * Math.sin(rad));
      accel = netF / Math.max(0.01, mTotal);
      tension = mass2 * (g - accel);
    }

    newtonSystems.push({
      id: newtonEl.id,
      apparatusType: appType,
      exerciseNumber: props.exerciseNumber || 7,
      label: props.label || `Segunda Ley de Newton (Ej. ${props.exerciseNumber || 7})`,
      mass1,
      mass2,
      appliedForce,
      accel,
      tension,
      formula,
      currentVelocity: props.currentVelocity || 0.0,
      displacementX: props.displacementX || 0.0,
      maxTravelPx: 240.0,
      isFinished: false,
    });
  });

  // -------------------------------------------------------------------------
  // 2.10 COMPILE DINÁMICA DE NEWTON (BLOQUES CON FUERZAS VECTORIALES APLICADAS)
  // -------------------------------------------------------------------------
  const forcedMassSystems = [];
  const massElements = physicsObjects.filter((el) => el.physicsType === 'mass');

  massElements.forEach((massEl) => {
    const props = massEl.properties || {};
    const userVectors = Array.isArray(props.userVectors) ? props.userVectors : [];

    if (userVectors.length > 0) {
      const massKg = props.mass || 10.0;
      let sumFx = 0;
      let sumFy = 0;

      userVectors.forEach((v) => {
        const rad = ((v.angleDeg !== undefined ? v.angleDeg : 0) * Math.PI) / 180;
        const mag = v.magnitude !== undefined ? v.magnitude : 50;
        sumFx += mag * Math.cos(rad);
        sumFy += mag * Math.sin(rad);
      });

      const netF = Math.hypot(sumFx, sumFy);
      const isEq = netF < 0.2;
      const ax = sumFx / massKg;
      const ay = -sumFy / massKg; // Canvas Y inverted

      forcedMassSystems.push({
        id: massEl.id,
        massKg,
        userVectors,
        sumFx,
        sumFy,
        netF,
        ax,
        ay,
        accel: Math.hypot(ax, ay),
        isEquilibrium: isEq,
        currentX: massEl.x,
        initialX: massEl.x,
        currentY: massEl.y,
        initialY: massEl.y,
        vx: 0.0,
        vy: 0.0,
        distanceTraveled: 0.0,
        isFinished: false,
      });
    }
  });

  // -------------------------------------------------------------------------
  // 3. COMPILE DINÁMICA: MASAS & POLEAS (ATWOOD)
  // -------------------------------------------------------------------------
  physicsObjects.forEach((el) => {
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;

    if (el.physicsType === 'pulley') {
      const radius = Math.min(el.width, el.height) / 2;
      const pulleyBody = Bodies.circle(cx, cy, radius, {
        isStatic: true,
        friction: 0.0,
        restitution: 0.0,
        label: el.id,
      });
      bodyMap.set(el.id, pulleyBody);
      World.add(engine.world, pulleyBody);
    } else if (el.physicsType === 'mass') {
      const isForced = forcedMassSystems.some((f) => f.id === el.id);
      if (!isForced) {
        const massKg = el.properties?.mass || 100;
        const massBody = Bodies.rectangle(cx, cy, el.width, el.height, {
          frictionAir: 0.003,
          friction: 0.1,
          restitution: 0.05,
          label: el.id,
        });
        Body.setMass(massBody, Math.max(0.5, (massKg / 100) * 10));
        bodyMap.set(el.id, massBody);
        World.add(engine.world, massBody);
      }
    }
  });

  // Detect Atwood Machine Topologies
  const pulleys = physicsObjects.filter((el) => el.physicsType === 'pulley');

  pulleys.forEach((pulleyEl) => {
    const pulleyConns = connections.filter(
      (c) => c.from?.elementId === pulleyEl.id || c.to?.elementId === pulleyEl.id
    );

    if (pulleyConns.length >= 2) {
      const linked = [];
      pulleyConns.forEach((c) => {
        const isFromPulley = c.from?.elementId === pulleyEl.id;
        const otherId = isFromPulley ? c.to?.elementId : c.from?.elementId;
        const otherEl = physicsObjects.find((p) => p.id === otherId && p.physicsType === 'mass');
        const anchorOnPulley = isFromPulley ? c.from?.anchorId : c.to?.anchorId;

        if (otherEl) {
          linked.push({
            conn: c,
            massEl: otherEl,
            pulleyAnchor: anchorOnPulley,
          });
        }
      });

      if (linked.length >= 2) {
        const sorted = linked.sort((a, b) => a.massEl.x - b.massEl.x);
        const leftSide = sorted[0];
        const rightSide = sorted[1];

        const massAEl = leftSide.massEl;
        const massBEl = rightSide.massEl;
        const bodyA = bodyMap.get(massAEl.id);
        const bodyB = bodyMap.get(massBEl.id);
        const pulleyBody = bodyMap.get(pulleyEl.id);

        if (bodyA && bodyB && pulleyBody) {
          const mA = massAEl.properties?.mass || 100;
          const mB = massBEl.properties?.mass || 60;
          const totalMass = mA + mB;

          // Classical Atwood formulas
          const theoAccel = totalMass > 0 ? ((mA - mB) / totalMass) * realG : 0;
          const theoTension = totalMass > 0 ? ((2 * mA * mB) / totalMass) * realG : 0;

          const pr = pulleyEl.width / 2;
          const grooveLeftX = pulleyEl.x;
          const grooveRightX = pulleyEl.x + pulleyEl.width;

          // Physical clearances to ensure masses NEVER hit the pulley bottom rim or go above it
          // Pulley bottom rim is at pulleyBody.position.y + pr
          // Center of mass is at pulleyBody.position.y + drop
          // Top edge of mass is at center - height/2
          const minDropA = pr + massAEl.height / 2 + 18;
          const minDropB = pr + massBEl.height / 2 + 18;

          // Safe finite total rope length allowing free travel between physical limits
          const initialDropA = bodyA.position.y - pulleyBody.position.y;
          const initialDropB = bodyB.position.y - pulleyBody.position.y;

          // Ensure ample travel room (at least 220px) in the direction of motion
          const minTravelPx = 220;
          let totalRopeDrop = Math.max(initialDropA + initialDropB, minDropA + minDropB + 60);
          if (mA > mB && totalRopeDrop - minDropB < initialDropA + minTravelPx) {
            totalRopeDrop = initialDropA + minDropB + minTravelPx;
          } else if (mB > mA && totalRopeDrop - minDropA < initialDropB + minTravelPx) {
            totalRopeDrop = initialDropB + minDropA + minTravelPx;
          }

          // Mass A maximum downward travel corresponds to Mass B reaching its minimum top drop
          const maxDropA = totalRopeDrop - minDropB;

          // Clamped initial drop for Mass A to guarantee starting safely inside motion bounds
          let startingDropA = initialDropA;
          if (mA > mB) {
            startingDropA = Math.max(minDropA, Math.min(maxDropA - 20, initialDropA));
          } else if (mB > mA) {
            startingDropA = Math.max(minDropA + 20, Math.min(maxDropA, initialDropA));
          } else {
            startingDropA = Math.max(minDropA, Math.min(maxDropA, initialDropA));
          }

          atwoodSystems.push({
            pulleyEl,
            massAEl,
            massBEl,
            bodyA,
            bodyB,
            pulleyBody,
            ropeAId: leftSide.conn.id,
            ropeBId: rightSide.conn.id,
            mA,
            mB,
            theoAccel,
            theoTension,
            grooveLeftX,
            grooveRightX,
            totalRopeDrop,
            currentDropA: startingDropA,
            minDropA,
            maxDropA,
            minDropB,
            currentVel: 0,
            isStopped: false,
          });
        }
      }
    }
  });

  // Non-Atwood standard connections
  const atwoodRopeIds = new Set(atwoodSystems.flatMap((s) => [s.ropeAId, s.ropeBId]));
  const remainingConns = connections.filter((c) => !atwoodRopeIds.has(c.id));

  remainingConns.forEach((c) => {
    const fromBody = bodyMap.get(c.from?.elementId);
    const toBody = bodyMap.get(c.to?.elementId);
    if (fromBody && toBody) {
      const fromEl = physicsObjects.find((e) => e.id === c.from?.elementId);
      const toEl = physicsObjects.find((e) => e.id === c.to?.elementId);
      const p1 = getAnchorAbsolutePosition(fromEl, c.from?.anchorId);
      const p2 = getAnchorAbsolutePosition(toEl, c.to?.anchorId);

      if (p1 && p2) {
        const length = c.properties?.length || Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const constraint = Constraint.create({
          bodyA: fromBody,
          bodyB: toBody,
          pointA: { x: p1.x - fromBody.position.x, y: p1.y - fromBody.position.y },
          pointB: { x: p2.x - toBody.position.x, y: p2.y - toBody.position.y },
          stiffness: c.properties?.stiffness || 0.95,
          damping: c.properties?.damping || 0.05,
          length: Math.max(2, length),
        });
        standardConstraints.push(constraint);
        World.add(engine.world, constraint);
      }
    }
  });

  // -------------------------------------------------------------------------
  // 4. ATWOOD SIMULATION STEP (STRICT LIMIT CLAMPING)
  // -------------------------------------------------------------------------
  Events.on(engine, 'beforeUpdate', () => {
    atwoodSystems.forEach((sys) => {
      const {
        bodyA,
        bodyB,
        pulleyBody,
        theoAccel,
        minDropA,
        maxDropA,
        minDropB,
        grooveLeftX,
        grooveRightX,
        totalRopeDrop,
      } = sys;

      if (sys.isStopped) {
        Body.setVelocity(bodyA, { x: 0, y: 0 });
        Body.setVelocity(bodyB, { x: 0, y: 0 });
        Body.setAngularVelocity(bodyA, 0);
        Body.setAngularVelocity(bodyB, 0);
        const clampedDropB = Math.max(minDropB, totalRopeDrop - sys.currentDropA);
        Body.setPosition(bodyA, { x: grooveLeftX, y: pulleyBody.position.y + sys.currentDropA });
        Body.setPosition(bodyB, { x: grooveRightX, y: pulleyBody.position.y + clampedDropB });
        return;
      }

      const dt = 1 / 60;
      const pxPerMeter = 45;
      const accelPx = theoAccel * pxPerMeter;

      sys.currentVel += accelPx * dt;
      sys.currentDropA += sys.currentVel * dt;

      // STRICT DIRECTIONAL CLAMP:
      // Mass A reaches bottom (Mass B hits top) only when moving DOWN (currentVel >= 0)
      // Mass A reaches top (Mass B hits bottom) only when moving UP (currentVel <= 0)
      if (sys.currentDropA >= maxDropA && sys.currentVel >= 0) {
        sys.currentDropA = maxDropA;
        sys.currentVel = 0;
        sys.isStopped = true;
      } else if (sys.currentDropA <= minDropA && sys.currentVel <= 0) {
        sys.currentDropA = minDropA;
        sys.currentVel = 0;
        sys.isStopped = true;
      }

      const clampedDropB = Math.max(minDropB, totalRopeDrop - sys.currentDropA);

      // Lock positions directly so Matter.js gravity CANNOT cause infinite descent
      Body.setPosition(bodyA, { x: grooveLeftX, y: pulleyBody.position.y + sys.currentDropA });
      Body.setPosition(bodyB, { x: grooveRightX, y: pulleyBody.position.y + clampedDropB });

      Body.setVelocity(bodyA, { x: 0, y: 0 });
      Body.setVelocity(bodyB, { x: 0, y: 0 });
      Body.setAngularVelocity(bodyA, 0);
      Body.setAngularVelocity(bodyB, 0);
    });
  });

  // -------------------------------------------------------------------------
  // 5. INITIAL TELEMETRY
  // -------------------------------------------------------------------------
  let initialTelemetry = null;
  const hasMruObj = elements.some(
    (e) => e.type === 'physics_object' && (e.physicsType === 'mru_cart' || e.physicsType === 'mruv_cart')
  );
  if (hasMruObj && mruSystems.length > 0) {
    const primaryCart = mruSystems[0];
    const primaryEl = elements.find((e) => e.id === primaryCart.cartId);
    const dispV = primaryEl?.properties?.displayVelocity !== undefined ? primaryEl.properties.displayVelocity : primaryCart.velocity;
    const vUnit = primaryEl?.properties?.unit || 'm/s';
    const isMruv = primaryCart.isMruv;
    const cartLabel = primaryEl?.properties?.label || (isMruv ? 'Móvil MRUV' : 'Móvil MRU');
    initialTelemetry = {
      type: isMruv ? 'mruv' : 'mru',
      vel: dispV,
      unit: vUnit,
      label: cartLabel,
      accel: primaryCart.acceleration || 0.0,
      accelUnit: 'm/s²',
      dist: '0.00',
      time: '0.0',
      isFinished: false,
      isSimulationComplete: false,
    };
  } else if (freefallSystems.length > 0) {
    const primaryBody = freefallSystems[0];
    const primaryEl = elements.find((e) => e.id === primaryBody.bodyId);
    initialTelemetry = {
      type: 'freefall',
      vel: Number(primaryBody.velocity.toFixed(2)),
      unit: 'm/s',
      label: primaryEl?.properties?.label || 'Caída Libre',
      accel: primaryBody.gravity,
      accelUnit: 'm/s²',
      dist: '0.00',
      time: '0.0',
      isFinished: false,
      isSimulationComplete: false,
    };
  } else if (verticalLaunchSystems.length > 0) {
    const primaryProj = verticalLaunchSystems[0];
    const primaryEl = elements.find((e) => e.id === primaryProj.bodyId);
    initialTelemetry = {
      type: 'tiro_vertical',
      vel: Number(primaryProj.velocity.toFixed(2)),
      unit: 'm/s',
      label: primaryEl?.properties?.label || 'Tiro Vertical',
      accel: primaryProj.gravity,
      accelUnit: 'm/s²',
      height: '0.00',
      maxHeight: primaryProj.maxHeightMeters.toFixed(2),
      time: '0.0',
      stage: 'Lanzamiento ↑',
      isFinished: false,
      isSimulationComplete: false,
    };
  } else if (horizontalLaunchSystems.length > 0) {
    const primaryHz = horizontalLaunchSystems[0];
    const primaryEl = elements.find((e) => e.id === primaryHz.bodyId);
    initialTelemetry = {
      type: 'lanzamiento_horizontal',
      vx: Number(primaryHz.vx.toFixed(2)),
      vy: 0.0,
      vResultant: Number(primaryHz.vx.toFixed(2)),
      angleDeg: 0.0,
      label: primaryEl?.properties?.label || 'Lanzamiento Horizontal',
      accel: primaryHz.gravity,
      accelUnit: 'm/s²',
      rangeM: '0.00',
      heightM: primaryHz.heightMeters.toFixed(2),
      rangeTheoretical: primaryHz.rangeTheoretical.toFixed(2),
      time: '0.0',
      stage: 'Inicio en Borde',
      isFinished: false,
      isSimulationComplete: false,
    };
  } else if (projectileMotionSystems.length > 0) {
    const primaryProj = projectileMotionSystems[0];
    const primaryEl = elements.find((e) => e.id === primaryProj.bodyId);
    initialTelemetry = {
      type: 'movimiento_proyectiles',
      v0: Number(primaryProj.v0.toFixed(2)),
      vx: Number(primaryProj.vx.toFixed(2)),
      vy: Number(primaryProj.vy.toFixed(2)),
      vResultant: Number(primaryProj.vResultant.toFixed(2)),
      thetaDeg: Number(primaryProj.thetaDeg.toFixed(1)),
      label: primaryEl?.properties?.label || 'Tiro Parabólico 2D',
      accel: primaryProj.gravity,
      accelUnit: 'm/s²',
      rangeM: '0.00',
      rangeTheoretical: primaryProj.rangeTheoretical.toFixed(2),
      heightM: primaryProj.currentHeightMeters.toFixed(2),
      maxHeight: primaryProj.hMaxTheoretical.toFixed(2),
      flightTimeTheoretical: primaryProj.flightTimeTheoretical.toFixed(2),
      time: '0.0',
      stage: 'Listo para Disparo',
      isFinished: false,
      isSimulationComplete: false,
    };
  } else if (mcuSystems.length > 0) {
    const primary = mcuSystems[0];
    const primaryEl = elements.find((e) => e.id === primary.bodyId);
    initialTelemetry = {
      type: 'mcu',
      omega: Number(primary.omega.toFixed(2)),
      vt: Number(primary.vt.toFixed(2)),
      ac: Number(primary.ac.toFixed(2)),
      radiusM: Number(primary.radiusMeters.toFixed(2)),
      period: Number(primary.period.toFixed(2)),
      frequency: Number(primary.frequency.toFixed(2)),
      rpm: Number(primary.rpm.toFixed(1)),
      revolutions: '0.00',
      time: '0.0',
      label: primaryEl?.properties?.label || 'Movimiento Circular Uniforme',
      stage: 'Listo para Rotación',
      isFinished: false,
      isSimulationComplete: false,
    };
  } else if (mcuvSystems.length > 0) {
    const primary = mcuvSystems[0];
    const primaryEl = elements.find((e) => e.id === primary.bodyId);
    initialTelemetry = {
      type: 'mcuv',
      omega: Number(primary.omega.toFixed(2)),
      alpha: Number(primary.alpha.toFixed(2)),
      vt: Number(primary.vt.toFixed(2)),
      at: Number(primary.at.toFixed(2)),
      ac: Number(primary.ac.toFixed(2)),
      aTotal: Number(primary.aTotal.toFixed(2)),
      radiusM: Number(primary.radiusMeters.toFixed(2)),
      rpm: Number(primary.rpm.toFixed(1)),
      revolutions: '0.00',
      time: '0.0',
      label: primaryEl?.properties?.label || 'Movimiento Circular Variado',
      stage: 'Listo para Aceleración',
      isFinished: false,
      isSimulationComplete: false,
    };
  } else if (poleasMcuSystems.length > 0) {
    const primary = poleasMcuSystems[0];
    const primaryEl = elements.find((e) => e.id === primary.id);
    const rpm1 = (Math.abs(primary.omega1) * 60) / (2 * Math.PI);
    const rpm2 = (Math.abs(primary.omega2) * 60) / (2 * Math.PI);
    initialTelemetry = {
      type: 'poleas_mcu',
      configuration: primary.configuration,
      omega1: Number(primary.omega1.toFixed(2)),
      omega2: Number(primary.omega2.toFixed(2)),
      rpm1: Number(rpm1.toFixed(1)),
      rpm2: Number(rpm2.toFixed(1)),
      linearSpeed: Number(primary.linearSpeed.toFixed(2)),
      gearRatio: Number(primary.gearRatio.toFixed(3)),
      r1M: Number(primary.radiusMeters1.toFixed(3)),
      r2M: Number(primary.radiusMeters2.toFixed(3)),
      revolutions1: '0.00',
      revolutions2: '0.00',
      time: '0.0',
      label: primaryEl?.properties?.label || 'Poleas MCU',
      isFinished: false,
      isSimulationComplete: false,
    };
  } else if (forcedMassSystems.length > 0) {
    const primary = forcedMassSystems[0];
    initialTelemetry = {
      type: 'newton_dynamics',
      massKg: primary.massKg,
      netFx: Number(primary.sumFx.toFixed(2)),
      netFy: Number(primary.sumFy.toFixed(2)),
      netForce: Number(primary.netF.toFixed(2)),
      accel: Number(primary.accel.toFixed(2)),
      vel: 0.0,
      isEquilibrium: primary.isEquilibrium,
      time: '0.0',
      label: `Dinámica (2ª Ley) • Bloque ${primary.massKg} kg`,
      isFinished: false,
      isSimulationComplete: false,
    };
  } else if (dclSystems.length > 0) {
    const primary = dclSystems[0];
    initialTelemetry = {
      type: 'dcl',
      accel: Number(Math.abs(primary.accel).toFixed(3)),
      accelUnit: 'm/s²',
      vel: 0.0,
      unit: 'm/s',
      t1: Number(primary.T1.toFixed(2)),
      t2: Number(primary.T2.toFixed(2)),
      fk: Number(primary.fk.toFixed(2)),
      netForce: Number(primary.netForce.toFixed(2)),
      time: '0.0',
      label: primary.apparatusType === 'table_three_masses' ? 'Mesa con Tres Masas (HT02)' : 'Mesa con Dos Masas (HT02)',
      isEquilibrium: Math.abs(primary.accel) < 0.001,
      isFinished: false,
      isSimulationComplete: false,
    };
  } else if (equilibriumSystems.length > 0) {
    const primary = equilibriumSystems[0];
    initialTelemetry = {
      type: 'equilibrio',
      netFx: Number(primary.netFx.toFixed(2)),
      netFy: Number(primary.netFy.toFixed(2)),
      netForce: Number(primary.netForce.toFixed(2)),
      accel: Number(primary.accel.toFixed(2)),
      accelUnit: 'm/s²',
      isEquilibrium: primary.isEquilibrium,
      time: '0.0',
      label: primary.systemTitle || 'Equilibrio Traslacional (HT03)',
      isFinished: false,
      isSimulationComplete: false,
    };
  } else if (newtonSystems.length > 0) {
    const primary = newtonSystems[0];
    initialTelemetry = {
      type: 'segunda_ley_newton',
      accel: Number(primary.accel.toFixed(2)),
      tension: Number(primary.tension.toFixed(2)),
      force: Number(primary.appliedForce.toFixed(1)),
      vel: 0.0,
      disp: 0.0,
      time: '0.0',
      label: primary.label,
      formula: primary.formula,
      isFinished: false,
      isSimulationComplete: false,
    };
  } else if (atwoodSystems.length > 0) {
    const primary = atwoodSystems[0];
    initialTelemetry = {
      type: 'atwood',
      accel: primary.theoAccel,
      tension: primary.theoTension,
      velA: '0.00',
      time: '0.0',
      isStopped: false,
      isSimulationComplete: false,
    };
  }

  return {
    engine,
    bodyMap,
    atwoodSystems,
    mruSystems,
    freefallSystems,
    verticalLaunchSystems,
    horizontalLaunchSystems,
    projectileMotionSystems,
    mcuSystems,
    mcuvSystems,
    poleasMcuSystems,
    dclSystems,
    equilibriumSystems,
    newtonSystems,
    forcedMassSystems,
    mruGates,
    standardConstraints,
    initialSnapshot,
    realG,
    elapsedTime: 0,
    isRunning: false,
    isSimulationComplete: false,
    telemetry: initialTelemetry,
  };
}

/**
 * Executes a single physics simulation tick and synchronizes positions with elements
 */
export function stepHeadlessSimulation(simState, elements, dtMs = 1000 / 60) {
  if (!simState || !simState.engine) return elements;

  const dtSec = dtMs / 1000;
  simState.elapsedTime += dtSec;

  const Matter = MatterLib?.default || MatterLib;
  Matter.Engine.update(simState.engine, Math.min(dtMs, 1000 / 60));

  // -------------------------------------------------------------------------
  // 1. UPDATE MRU & MRUV CARTS (v = cte or v(t) = v0 + a·t)
  // -------------------------------------------------------------------------
  const pxPerMeter = 80; // 80 pixels = 1.0 meter

  simState.mruSystems.forEach((mruSys) => {
    if (mruSys.isFinished) return;

    // MRUV: Accelerate velocity if acceleration != 0
    if (mruSys.acceleration) {
      mruSys.velocity += mruSys.acceleration * dtSec;

      // Braking cart clamp: if initial was positive and accelerating backwards (a < 0), stop when v reaches 0
      if (mruSys.acceleration < 0 && mruSys.initialVelocity > 0 && mruSys.velocity <= 0) {
        mruSys.velocity = 0;
        mruSys.isFinished = true;
      }
    }

    const dx = mruSys.velocity * dtSec * pxPerMeter;
    mruSys.currentX += dx;
    mruSys.distanceMeters += Math.abs(mruSys.velocity) * dtSec;

    // Boundary check on track (reaches bumpers)
    if (mruSys.velocity > 0 && mruSys.currentX >= mruSys.trackMaxX) {
      mruSys.currentX = mruSys.trackMaxX;
      mruSys.isFinished = true;
    } else if (mruSys.velocity < 0 && mruSys.currentX <= mruSys.trackMinX) {
      mruSys.currentX = mruSys.trackMinX;
      mruSys.isFinished = true;
    }

    // Check photogate collisions
    const cartCenter = mruSys.currentX + mruSys.width / 2;
    simState.mruGates.forEach((gate) => {
      const gateCenter = gate.x + gate.width / 2;
      if (Math.abs(cartCenter - gateCenter) < 18 && !gate.properties?.triggered) {
        gate.properties = {
          ...gate.properties,
          triggered: true,
          recordedTime: `${simState.elapsedTime.toFixed(2)}s`,
        };
      }
    });
  });

  // Check 2-cart pursuit or head-on encounter collision/finish
  if (simState.mruSystems.length >= 2) {
    const activeCarts = simState.mruSystems.filter((s) => !s.isFinished);
    if (activeCarts.length >= 2) {
      const sortedByX = [...activeCarts].sort((a, b) => a.currentX - b.currentX);
      for (let i = 0; i < sortedByX.length - 1; i++) {
        const rear = sortedByX[i];
        const front = sortedByX[i + 1];

        // 1. Pursuit encounter (both moving right, rear is faster):
        // Only trigger if rear started behind front (not initially overlapping)
        const startedBehind = rear.initialX + rear.width <= front.initialX + 5;
        if (startedBehind && rear.velocity > 0 && front.velocity > 0 && rear.velocity > front.velocity) {
          if (rear.currentX + rear.width >= front.currentX) {
            // Encounter point reached!
            rear.currentX = front.currentX - rear.width;
            rear.isFinished = true;
            front.isFinished = true;
          }
        }

        // 2. Head-on encounter (rear moving right v > 0, front moving left v < 0):
        const startedApart = rear.initialX + rear.width <= front.initialX + 5;
        if (startedApart && rear.velocity > 0 && front.velocity < 0) {
          if (rear.currentX + rear.width >= front.currentX) {
            // Meeting point reached!
            rear.currentX = front.currentX - rear.width;
            rear.isFinished = true;
            front.isFinished = true;
          }
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // 1.1 UPDATE CAÍDA LIBRE (v(t) = v0 + g·t, y(t) = y0 + v(t)·dt·scale)
  // -------------------------------------------------------------------------
  if (simState.freefallSystems && simState.freefallSystems.length > 0) {
    simState.freefallSystems.forEach((ffSys) => {
      if (ffSys.isFinished) return;

      // Accelerate downwards by gravity
      ffSys.velocity += ffSys.gravity * dtSec;
      const dy = ffSys.velocity * dtSec * ffSys.pxPerMeter;
      ffSys.currentY += dy;
      ffSys.distanceFallen += ffSys.velocity * dtSec;

      // Ground impact clamp
      if (ffSys.currentY >= ffSys.groundY) {
        ffSys.currentY = ffSys.groundY;
        ffSys.isFinished = true;
      }

      // Check vertical photogate collisions
      const bodyCenterY = ffSys.currentY + ffSys.height / 2;
      simState.mruGates.forEach((gate) => {
        const gateCenterY = gate.y + gate.height / 2;
        if (
          Math.abs(bodyCenterY - gateCenterY) < 18 &&
          Math.abs(ffSys.x - gate.x) < 70 &&
          !gate.properties?.triggered
        ) {
          gate.properties = {
            ...gate.properties,
            triggered: true,
            recordedTime: `${simState.elapsedTime.toFixed(2)}s`,
          };
        }
      });
    });
  }

  // -------------------------------------------------------------------------
  // 1.2 UPDATE TIRO VERTICAL (v(t) = v0 - g·t, y(t) = y0 - v_avg·dt·scale)
  // -------------------------------------------------------------------------
  if (simState.verticalLaunchSystems && simState.verticalLaunchSystems.length > 0) {
    simState.verticalLaunchSystems.forEach((vtSys) => {
      if (vtSys.isFinished) return;

      const prevV = vtSys.velocity;
      // Gravity decelerates upward motion (positive v) or accelerates downward motion (negative v)
      vtSys.velocity -= vtSys.gravity * dtSec;

      // Detect apex when velocity crosses from positive to non-positive
      if (prevV > 0 && vtSys.velocity <= 0) {
        vtSys.reachedApex = true;
        vtSys.isAscending = false;
      }

      // Vertical position on canvas: upward is negative dy
      const avgV = (prevV + vtSys.velocity) / 2;
      const dy = -avgV * dtSec * vtSys.pxPerMeter;
      vtSys.currentY += dy;

      // Current height above launch pad (meters)
      vtSys.currentHeightMeters = Math.max(0, (vtSys.launchY - vtSys.currentY) / vtSys.pxPerMeter);

      // Landing clamp: once reached apex and falls back to or past launch point
      if (vtSys.reachedApex && vtSys.currentY >= vtSys.launchY) {
        vtSys.currentY = vtSys.launchY;
        vtSys.currentHeightMeters = 0.0;
        vtSys.velocity = -Math.abs(vtSys.initialVelocity);
        vtSys.isFinished = true;
      }

      // Check vertical photogate collisions (detects upward and downward crossings)
      const bodyCenterY = vtSys.currentY + vtSys.height / 2;
      simState.mruGates?.forEach((gate) => {
        const gateCenterY = gate.y + gate.height / 2;
        if (
          Math.abs(bodyCenterY - gateCenterY) < 22 &&
          Math.abs(vtSys.x - gate.x) < 70
        ) {
          if (!gate.properties?.triggered) {
            const dirLabel = vtSys.velocity >= 0 ? '↑ Subida' : '↓ Bajada';
            gate.properties = {
              ...gate.properties,
              triggered: true,
              recordedTime: `${simState.elapsedTime.toFixed(2)}s (${dirLabel})`,
            };
          }
        }
      });
    });
  }

  // -------------------------------------------------------------------------
  // 1.3 UPDATE LANZAMIENTO HORIZONTAL (x = x0 + vx·t, y = y0 + 0.5·g·t²)
  // -------------------------------------------------------------------------
  if (simState.horizontalLaunchSystems && simState.horizontalLaunchSystems.length > 0) {
    simState.horizontalLaunchSystems.forEach((hzSys) => {
      if (hzSys.isFinished) return;

      const prevVy = hzSys.vy;
      // Downward gravitational acceleration in Y
      hzSys.vy += hzSys.gravity * dtSec;

      // Increments in pixels
      const dxPx = hzSys.vx * dtSec * hzSys.pxPerMeter;
      const avgVy = (prevVy + hzSys.vy) / 2;
      const dyPx = avgVy * dtSec * hzSys.pxPerMeter;

      hzSys.currentX += dxPx;
      hzSys.currentY += dyPx;

      // Kinematic statistics in meters
      hzSys.currentRangeMeters = (hzSys.currentX - hzSys.initialX) / hzSys.pxPerMeter;
      const fallenMeters = (hzSys.currentY - hzSys.initialY) / hzSys.pxPerMeter;
      hzSys.currentHeightMeters = Math.max(0, hzSys.heightMeters - fallenMeters);

      hzSys.vResultant = Math.sqrt(hzSys.vx * hzSys.vx + hzSys.vy * hzSys.vy);
      hzSys.angleDeg = (Math.atan2(hzSys.vy, hzSys.vx) * 180) / Math.PI;

      // Record parabolic trajectory trail points (never shift from start)
      if (!hzSys.trailPoints) hzSys.trailPoints = [];
      const prevHzCenterX = hzSys.currentX + hzSys.width / 2;
      hzSys.trailPoints.push({
        x: hzSys.currentX + hzSys.width / 2,
        y: hzSys.currentY + hzSys.height / 2,
      });
      if (hzSys.trailPoints.length > 1200) {
        const decimated = [hzSys.trailPoints[0]];
        for (let ti = 2; ti < hzSys.trailPoints.length; ti += 2) {
          decimated.push(hzSys.trailPoints[ti]);
        }
        hzSys.trailPoints = decimated;
      }

      // Ground impact check (bottom of projectile touches ground level)
      const maxProjY = hzSys.groundY - hzSys.height;
      if (hzSys.currentY >= maxProjY || hzSys.currentHeightMeters <= 0) {
        hzSys.currentY = maxProjY;
        hzSys.currentHeightMeters = 0.0;
        hzSys.isFinished = true;
      }

      // Check optical photogate trigger (swept crossing + proximity fallback)
      const bodyCenterX = hzSys.currentX + hzSys.width / 2;
      const bodyCenterY = hzSys.currentY + hzSys.height / 2;
      simState.mruGates?.forEach((gate) => {
        if (gate.properties?.triggered) return;
        const gateCenterX = gate.x + gate.width / 2;
        const gateBeamY   = gate.y + gate.height * 0.65;
        const gateHalfH   = gate.height * 0.5;
        const crossesGate = (prevHzCenterX <= gateCenterX && bodyCenterX >= gateCenterX) ||
                            (prevHzCenterX >= gateCenterX && bodyCenterX <= gateCenterX);
        const nearGate = Math.abs(bodyCenterX - gateCenterX) < 36 &&
                         Math.abs(bodyCenterY - gateBeamY)   < gateHalfH + 14;
        if (crossesGate || nearGate) {
          gate.properties = {
            ...gate.properties,
            triggered: true,
            recordedTime: `${simState.elapsedTime.toFixed(2)}s (Impacto)`,
          };
        }
      });
    });
  }

  // -------------------------------------------------------------------------
  // 1.4 UPDATE MOVIMIENTO DE PROYECTILES (TIRO PARABÓLICO 2D)
  // vx = cte, vy(t) = v0y - g·t, x(t) = x0 + vx·t, y(t) = y0 + vy0·t - 0.5·g·t²
  // -------------------------------------------------------------------------
  if (simState.projectileMotionSystems && simState.projectileMotionSystems.length > 0) {
    simState.projectileMotionSystems.forEach((projSys) => {
      if (projSys.isFinished) return;

      const prevVy = projSys.vy;
      // Gravity decelerates upward vertical velocity (vy > 0 is up, vy < 0 is down)
      projSys.vy -= projSys.gravity * dtSec;

      // Displacement in pixels:
      // X: positive to the right
      // Y: on canvas, screen Y increases downward, so upward vy decreases screen Y
      const avgVy = (prevVy + projSys.vy) / 2;
      const dxPx = projSys.vx * dtSec * projSys.pxPerMeter;
      const dyPx = -avgVy * dtSec * projSys.pxPerMeter;

      // Save previous center X for continuous (swept) collision detection
      const prevCenterX = projSys.currentX + projSys.width / 2;

      projSys.currentX += dxPx;
      projSys.currentY += dyPx;

      // Kinematic statistics in meters
      projSys.currentRangeMeters = (projSys.currentX - projSys.initialX) / projSys.pxPerMeter;
      // Height relative to ground:
      projSys.currentHeightMeters = Math.max(0, (projSys.groundY - projSys.currentY - projSys.height) / projSys.pxPerMeter);
      if (projSys.currentHeightMeters > projSys.maxHeightReached) {
        projSys.maxHeightReached = projSys.currentHeightMeters;
      }

      // Detect apex when vertical velocity crosses zero
      if (prevVy > 0 && projSys.vy <= 0) {
        projSys.reachedApex = true;
      }

      // Instantaneous resultant speed & angle
      projSys.vResultant = Math.sqrt(projSys.vx * projSys.vx + projSys.vy * projSys.vy);
      projSys.angleDeg = (Math.atan2(projSys.vy, projSys.vx) * 180) / Math.PI;

      // Record parabolic trajectory trail points.
      // NOTE: We never discard points from the start so the full muzzle-to-landing
      // arc is always visible, even for long flights (>500 frames).
      if (!projSys.trailPoints) projSys.trailPoints = [];
      projSys.trailPoints.push({
        x: projSys.currentX + projSys.width / 2,
        y: projSys.currentY + projSys.height / 2,
      });
      // If the trail grows very large, decimate by keeping every other point
      // (preserving index 0 so the muzzle start is never dropped)
      if (projSys.trailPoints.length > 1200) {
        const decimated = [projSys.trailPoints[0]];
        for (let ti = 2; ti < projSys.trailPoints.length; ti += 2) {
          decimated.push(projSys.trailPoints[ti]);
        }
        projSys.trailPoints = decimated;
      }

      // Ground impact check (bottom of projectile reaches or penetrates ground level)
      const maxProjY = projSys.groundY - projSys.height;
      if (projSys.currentY >= maxProjY) {
        projSys.currentY = maxProjY;
        projSys.currentHeightMeters = 0.0;
        projSys.isFinished = true;
      }

      // Check optical photogate trigger with SWEPT / CONTINUOUS collision detection.
      // We test whether the projectile's horizontal center crossed the gate's center
      // line during THIS step (not just whether it is close right now), which
      // guarantees the sensor fires even when the projectile moves many pixels per frame.
      const bodyCenterX = projSys.currentX + projSys.width / 2;
      const bodyCenterY = projSys.currentY + projSys.height / 2;
      simState.mruGates?.forEach((gate) => {
        if (gate.properties?.triggered) return;
        const gateCenterX = gate.x + gate.width / 2;
        const gateBeamY   = gate.y + gate.height * 0.65; // infrared beam row
        const gateHalfH   = gate.height * 0.5;           // vertical tolerance

        // Swept horizontal crossing: prevCenter was left of gate, body is now right (or on) gate
        const crossesGate = (prevCenterX <= gateCenterX && bodyCenterX >= gateCenterX) ||
                            (prevCenterX >= gateCenterX && bodyCenterX <= gateCenterX);

        // Point proximity fallback (for very slow projectiles / small steps)
        const nearGate = Math.abs(bodyCenterX - gateCenterX) < 36 &&
                         Math.abs(bodyCenterY - gateBeamY)   < gateHalfH + 14;

        if (crossesGate || nearGate) {
          gate.properties = {
            ...gate.properties,
            triggered: true,
            recordedTime: `${simState.elapsedTime.toFixed(2)}s (Impacto)`,
          };
        }
      });
    });
  }

  // -------------------------------------------------------------------------
  // 1.5 UPDATE MOVIMIENTO CIRCULAR UNIFORME (HT03 MCU)
  // θ(t) = θ₀ + ω·t,  v_t = |ω|·r,  a_c = ω²·r,  x(t) = cx + R·cosθ, y(t) = cy - R·sinθ
  // -------------------------------------------------------------------------
  if (simState.mcuSystems && simState.mcuSystems.length > 0) {
    simState.mcuSystems.forEach((mcuSys) => {
      const dTheta = mcuSys.omega * dtSec;
      mcuSys.angleRad += dTheta;
      mcuSys.totalAngleRotated += Math.abs(dTheta);
      mcuSys.revolutions = mcuSys.totalAngleRotated / (2 * Math.PI);

      // Coordinates on canvas:
      // X = cx + R * cos(θ)
      // Y = cy - R * sin(θ) (Cartesian trigonometry: positive angle is counter-clockwise)
      const centerProjX = mcuSys.centerX + mcuSys.radiusPx * Math.cos(mcuSys.angleRad);
      const centerProjY = mcuSys.centerY - mcuSys.radiusPx * Math.sin(mcuSys.angleRad);

      mcuSys.currentX = centerProjX - mcuSys.width / 2;
      mcuSys.currentY = centerProjY - mcuSys.height / 2;

      // Check Photogate lap trigger
      simState.mruGates?.forEach((gate) => {
        const gateCenterX = gate.x + gate.width / 2;
        const gateCenterY = gate.y + gate.height / 2;
        const dist = Math.hypot(centerProjX - gateCenterX, centerProjY - gateCenterY);
        if (dist < 34) {
          if (!gate.properties?.triggered) {
            const lapNum = Math.max(1, Math.floor(mcuSys.revolutions));
            gate.properties = {
              ...gate.properties,
              triggered: true,
              recordedTime: `${simState.elapsedTime.toFixed(2)}s (Lap ${lapNum})`,
            };
          }
        } else if (dist > 52) {
          // Re-arm gate once particle moves away so subsequent laps trigger correctly
          if (gate.properties?.triggered) {
            gate.properties = {
              ...gate.properties,
              triggered: false,
            };
          }
        }
      });
    });
  }

  // -------------------------------------------------------------------------
  // 1.6 UPDATE MOVIMIENTO CIRCULAR ACELERADO (MCUV / MCUA)
  // ω(t) = ω₀ + α·t, Δθ = ω·dt + 0.5·α·dt², v_t = |ω|·r, a_c = ω²·r, a_t = α·r, a_tot = √(ac² + at²)
  // -------------------------------------------------------------------------
  if (simState.mcuvSystems && simState.mcuvSystems.length > 0) {
    simState.mcuvSystems.forEach((mcuvSys) => {
      if (mcuvSys.isFinished) return;

      const dTheta = mcuvSys.omega * dtSec + 0.5 * mcuvSys.alpha * dtSec * dtSec;
      mcuvSys.angleRad += dTheta;

      // Normalize angleRad to [0, 2π) to prevent floating-point catastrophic precision loss
      mcuvSys.angleRad = ((mcuvSys.angleRad % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

      // Braking detection: if initial omega and alpha have opposite signs,
      // the rotor stops when omega reaches or crosses 0
      const isBraking = (mcuvSys.initialOmega > 0 && mcuvSys.alpha < 0) ||
                        (mcuvSys.initialOmega < 0 && mcuvSys.alpha > 0);

      mcuvSys.omega += mcuvSys.alpha * dtSec;

      if (isBraking) {
        if ((mcuvSys.initialOmega > 0 && mcuvSys.omega <= 0) ||
            (mcuvSys.initialOmega < 0 && mcuvSys.omega >= 0)) {
          mcuvSys.omega = 0;
          mcuvSys.isFinished = true;
        }
      } else {
        // Visual stability cap for accelerating systems:
        // Cap visual omega at 35 rad/s (~335 RPM). This ensures smooth 60 FPS animation
        // without Nyquist-Shannon stroboscopic aliasing ("wagon-wheel" stutter/lag).
        const MAX_VISUAL_OMEGA = 35.0;
        if (mcuvSys.omega > MAX_VISUAL_OMEGA) {
          mcuvSys.omega = MAX_VISUAL_OMEGA;
        } else if (mcuvSys.omega < -MAX_VISUAL_OMEGA) {
          mcuvSys.omega = -MAX_VISUAL_OMEGA;
        }
      }

      mcuvSys.totalAngleRotated += Math.abs(dTheta);
      mcuvSys.revolutions = mcuvSys.totalAngleRotated / (2 * Math.PI);

      // Dynamic physical magnitudes
      mcuvSys.vt = Math.abs(mcuvSys.omega) * mcuvSys.radiusMeters;
      mcuvSys.ac = mcuvSys.omega * mcuvSys.omega * mcuvSys.radiusMeters;
      mcuvSys.at = mcuvSys.isFinished ? 0 : Math.abs(mcuvSys.alpha) * mcuvSys.radiusMeters;
      mcuvSys.aTotal = Math.hypot(mcuvSys.ac, mcuvSys.at);
      mcuvSys.rpm = (Math.abs(mcuvSys.omega) * 60) / (2 * Math.PI);

      // Coordinates on canvas
      const centerProjX = mcuvSys.centerX + mcuvSys.radiusPx * Math.cos(mcuvSys.angleRad);
      const centerProjY = mcuvSys.centerY - mcuvSys.radiusPx * Math.sin(mcuvSys.angleRad);

      mcuvSys.currentX = centerProjX - mcuvSys.width / 2;
      mcuvSys.currentY = centerProjY - mcuvSys.height / 2;

      // Check Photogate lap trigger (with distance threshold)
      simState.mruGates?.forEach((gate) => {
        const gateCenterX = gate.x + gate.width / 2;
        const gateCenterY = gate.y + gate.height / 2;
        const dist = Math.hypot(centerProjX - gateCenterX, centerProjY - gateCenterY);
        if (dist < 34) {
          if (!gate.properties?.triggered) {
            const lapNum = Math.max(1, Math.floor(mcuvSys.revolutions));
            gate.properties = {
              ...gate.properties,
              triggered: true,
              recordedTime: `${simState.elapsedTime.toFixed(2)}s (Lap ${lapNum})`,
            };
          }
        } else if (dist > 52) {
          if (gate.properties?.triggered) {
            gate.properties = {
              ...gate.properties,
              triggered: false,
            };
          }
        }
      });
    });
  }

  // -------------------------------------------------------------------------
  // 1.8 STEP SISTEMAS DE POLEAS MCU (HT01 U3)
  // -------------------------------------------------------------------------
  if (simState.poleasMcuSystems && simState.poleasMcuSystems.length > 0) {
    simState.poleasMcuSystems.forEach((pSys) => {
      // Rotation angle update for primary pulley
      const dTheta1 = pSys.omega1 * dtSec;
      pSys.angleRad1 = (pSys.angleRad1 + dTheta1) % (2 * Math.PI);
      pSys.revolutions1 += Math.abs(dTheta1) / (2 * Math.PI);

      // Secondary pulley rotation:
      const dirMult = pSys.beltCrossed ? -1 : 1;
      const dTheta2 = pSys.omega2 * dirMult * dtSec;
      pSys.angleRad2 = (pSys.angleRad2 + dTheta2) % (2 * Math.PI);
      pSys.revolutions2 += Math.abs(dTheta2) / (2 * Math.PI);
    });
  }

  // -------------------------------------------------------------------------
  // 1.9 STEP DIAGRAMAS DE CUERPO LIBRE (HT02 DCL: MESA CON MASAS Y POLEAS)
  // -------------------------------------------------------------------------
  if (simState.dclSystems && simState.dclSystems.length > 0) {
    simState.dclSystems.forEach((dclSys) => {
      if (dclSys.isFinished || Math.abs(dclSys.accel) < 0.0001) return;

      dclSys.currentVelocity += dclSys.accel * dtSec;
      const pxPerMeter = 60;
      const dx = dclSys.currentVelocity * dtSec * pxPerMeter;
      dclSys.displacementX += dx;

      if (Math.abs(dclSys.displacementX) >= dclSys.maxDisplacementX) {
        dclSys.displacementX = Math.sign(dclSys.displacementX) * dclSys.maxDisplacementX;
        dclSys.currentVelocity = 0;
        dclSys.isFinished = true;
      }
    });
  }

  // -------------------------------------------------------------------------
  // 1.10 STEP EQUILIBRIO TRASLACIONAL (HT03 PRIMERA LEY DE NEWTON)
  // -------------------------------------------------------------------------
  if (simState.equilibriumSystems && simState.equilibriumSystems.length > 0) {
    simState.equilibriumSystems.forEach((eqSys) => {
      if (eqSys.isEquilibrium) {
        // En reposo estático continuo (Primera Ley de Newton: ΣF = 0)
        eqSys.currentVelocityX = 0;
        eqSys.currentVelocityY = 0;
        eqSys.displacementX = 0;
        eqSys.displacementY = 0;
        eqSys.isFinished = false;
        return;
      }
      if (eqSys.isFinished) return;

      const m = eqSys.massKg || 20.0;
      const ax = eqSys.netFx / m;
      const ay = -eqSys.netFy / m; // canvas Y inverted (+Y hacia abajo en pantalla)
      eqSys.currentVelocityX += ax * dtSec;
      eqSys.currentVelocityY += ay * dtSec;

      // Amortiguamiento suave
      eqSys.currentVelocityX *= 0.994;
      eqSys.currentVelocityY *= 0.994;

      const pxPerMeter = 40;
      eqSys.displacementX += eqSys.currentVelocityX * dtSec * pxPerMeter;
      eqSys.displacementY += eqSys.currentVelocityY * dtSec * pxPerMeter;

      const maxDist = 95;
      const currentDist = Math.hypot(eqSys.displacementX, eqSys.displacementY);
      if (currentDist >= maxDist) {
        const factor = maxDist / currentDist;
        eqSys.displacementX *= factor;
        eqSys.displacementY *= factor;
        eqSys.currentVelocityX = 0;
        eqSys.currentVelocityY = 0;
        eqSys.isFinished = true;
      }
    });
  }

  // -------------------------------------------------------------------------
  // 1.11 STEP DINÁMICA DE NEWTON (BLOQUES CON FUERZAS APLICADAS)
  // -------------------------------------------------------------------------
  if (simState.forcedMassSystems && simState.forcedMassSystems.length > 0) {
    simState.forcedMassSystems.forEach((mSys) => {
      if (mSys.isEquilibrium || mSys.isFinished) return;

      mSys.vx += mSys.ax * dtSec;
      mSys.vy += mSys.ay * dtSec;

      const pxPerMeter = 60;
      mSys.currentX += mSys.vx * dtSec * pxPerMeter;
      mSys.currentY += mSys.vy * dtSec * pxPerMeter;
      mSys.distanceTraveled += Math.hypot(mSys.vx, mSys.vy) * dtSec;
    });
  }

  // -------------------------------------------------------------------------
  // 1.12 STEP SEGUNDA LEY DE NEWTON SIN FRICCIÓN (HT01 U4)
  // -------------------------------------------------------------------------
  if (simState.newtonSystems && simState.newtonSystems.length > 0) {
    simState.newtonSystems.forEach((nSys) => {
      if (nSys.isFinished) return;

      nSys.currentVelocity += nSys.accel * dtSec;
      const pxPerMeter = 28;
      nSys.displacementX += nSys.currentVelocity * dtSec * pxPerMeter;

      if (Math.abs(nSys.displacementX) >= nSys.maxTravelPx) {
        nSys.displacementX = Math.sign(nSys.displacementX || 1) * nSys.maxTravelPx;
        nSys.currentVelocity = 0;
        nSys.isFinished = true;
      }
    });
  }

  // -------------------------------------------------------------------------
  // 2. CHECK GLOBAL SIMULATION COMPLETION
  // -------------------------------------------------------------------------
  const hasMru = simState.mruSystems.length > 0;
  const hasAtwood = simState.atwoodSystems.length > 0;
  const hasFreefall = simState.freefallSystems && simState.freefallSystems.length > 0;
  const hasVertical = simState.verticalLaunchSystems && simState.verticalLaunchSystems.length > 0;
  const hasHorizontal = simState.horizontalLaunchSystems && simState.horizontalLaunchSystems.length > 0;
  const hasProjectile = simState.projectileMotionSystems && simState.projectileMotionSystems.length > 0;
  const hasMcuv = simState.mcuvSystems && simState.mcuvSystems.length > 0;
  const hasDcl = simState.dclSystems && simState.dclSystems.length > 0;
  const hasEq = simState.equilibriumSystems && simState.equilibriumSystems.length > 0;
  const hasNewton = simState.newtonSystems && simState.newtonSystems.length > 0;

  // Tracked carts (on a rail with bumpers) complete when they hit bumper or encounter.
  // Free carts (off-track) only finish if an encounter occurred or all carts finish.
  const trackedCarts = simState.mruSystems.filter((s) => s.trackId !== null);
  const freeCarts = simState.mruSystems.filter((s) => s.trackId === null);

  let allMruFinished = false;
  if (trackedCarts.length > 0 && freeCarts.length === 0) {
    allMruFinished = trackedCarts.every((s) => s.isFinished);
  } else if (simState.mruSystems.length >= 2) {
    allMruFinished = simState.mruSystems.every((s) => s.isFinished);
  } else if (trackedCarts.length > 0) {
    allMruFinished = trackedCarts.every((s) => s.isFinished);
  }

  const allAtwoodStopped = hasAtwood && simState.atwoodSystems.every((s) => s.isStopped);
  const allFreefallFinished = hasFreefall && simState.freefallSystems.every((s) => s.isFinished);
  const allVerticalFinished = hasVertical && simState.verticalLaunchSystems.every((s) => s.isFinished);
  const allHorizontalFinished = hasHorizontal && simState.horizontalLaunchSystems.every((s) => s.isFinished);
  const allProjectileFinished = hasProjectile && simState.projectileMotionSystems.every((s) => s.isFinished);
  const allMcuvFinished = hasMcuv && simState.mcuvSystems.every((s) => s.isFinished);
  const allDclFinished = hasDcl && simState.dclSystems.every((s) => s.isFinished);
  const allEqFinished = hasEq && simState.equilibriumSystems.every((s) => s.isFinished && !s.isEquilibrium);
  const allNewtonFinished = hasNewton && simState.newtonSystems.every((s) => s.isFinished);

  const isComplete =
    (hasMru || hasAtwood || hasFreefall || hasVertical || hasHorizontal || hasProjectile || (hasMcuv && allMcuvFinished) || (hasDcl && allDclFinished) || (hasEq && allEqFinished) || (hasNewton && allNewtonFinished)) &&
    (!hasMru || allMruFinished) &&
    (!hasAtwood || allAtwoodStopped) &&
    (!hasFreefall || allFreefallFinished) &&
    (!hasVertical || allVerticalFinished) &&
    (!hasHorizontal || allHorizontalFinished) &&
    (!hasProjectile || allProjectileFinished) &&
    (!hasMcuv || allMcuvFinished) &&
    (!hasDcl || allDclFinished) &&
    (!hasEq || allEqFinished) &&
    (!hasNewton || allNewtonFinished);

  if (isComplete) {
    simState.isSimulationComplete = true;
  }

  // -------------------------------------------------------------------------
  // 3. COMPILE TELEMETRY
  // -------------------------------------------------------------------------
  const hasMruObj = elements.some(
    (e) => e.type === 'physics_object' && (e.physicsType === 'mru_cart' || e.physicsType === 'mruv_cart')
  );
  if (hasMruObj && simState.mruSystems.length > 0) {
    // Show currently active cart or primary cart
    const activeCart = simState.mruSystems.find((s) => !s.isFinished) || simState.mruSystems[0];
    const activeEl = elements.find((e) => e.id === activeCart.cartId);
    const dispV = activeCart.velocity;
    const vUnit = activeEl?.properties?.unit || 'm/s';
    const isMruv = activeCart.isMruv;
    const activeCount = simState.mruSystems.filter((s) => !s.isFinished).length;
    const cartLabel = simState.mruSystems.length > 1
      ? `${activeCount}/${simState.mruSystems.length} Móviles Activos`
      : (activeEl?.properties?.label || (isMruv ? 'Móvil MRUV' : 'Móvil MRU'));

    simState.telemetry = {
      type: isMruv ? 'mruv' : 'mru',
      vel: activeCart.isFinished ? 0 : Number(dispV.toFixed(2)),
      unit: vUnit,
      label: cartLabel,
      accel: activeCart.acceleration || 0.0,
      accelUnit: 'm/s²',
      dist: activeCart.distanceMeters.toFixed(2),
      time: simState.elapsedTime.toFixed(1),
      isFinished: simState.isSimulationComplete,
      isSimulationComplete: simState.isSimulationComplete,
    };
  } else if (simState.freefallSystems && simState.freefallSystems.length > 0) {
    const activeSys = simState.freefallSystems.find((s) => !s.isFinished) || simState.freefallSystems[0];
    const activeEl = elements.find((e) => e.id === activeSys.bodyId);
    simState.telemetry = {
      type: 'freefall',
      vel: activeSys.isFinished ? 0 : Number(activeSys.velocity.toFixed(2)),
      unit: 'm/s',
      label: activeEl?.properties?.label || 'Caída Libre',
      accel: activeSys.gravity,
      accelUnit: 'm/s²',
      dist: activeSys.distanceFallen.toFixed(2),
      time: simState.elapsedTime.toFixed(1),
      isFinished: simState.isSimulationComplete,
      isSimulationComplete: simState.isSimulationComplete,
    };
  } else if (simState.verticalLaunchSystems && simState.verticalLaunchSystems.length > 0) {
    const activeSys = simState.verticalLaunchSystems.find((s) => !s.isFinished) || simState.verticalLaunchSystems[0];
    const activeEl = elements.find((e) => e.id === activeSys.bodyId);
    let stageText = 'Subiendo ↑';
    if (activeSys.isFinished) {
      stageText = 'Regresó a Base';
    } else if (Math.abs(activeSys.velocity) < 0.25) {
      stageText = 'CÚSPIDE (v = 0)';
    } else if (activeSys.velocity < 0) {
      stageText = 'Bajando ↓';
    }

    simState.telemetry = {
      type: 'tiro_vertical',
      vel: activeSys.isFinished ? 0 : Number(activeSys.velocity.toFixed(2)),
      unit: 'm/s',
      label: activeEl?.properties?.label || 'Tiro Vertical',
      accel: activeSys.gravity,
      accelUnit: 'm/s²',
      height: activeSys.currentHeightMeters.toFixed(2),
      maxHeight: activeSys.maxHeightMeters.toFixed(2),
      time: simState.elapsedTime.toFixed(1),
      stage: stageText,
      isFinished: simState.isSimulationComplete,
      isSimulationComplete: simState.isSimulationComplete,
    };
  } else if (simState.horizontalLaunchSystems && simState.horizontalLaunchSystems.length > 0) {
    const activeSys = simState.horizontalLaunchSystems.find((s) => !s.isFinished) || simState.horizontalLaunchSystems[0];
    const activeEl = elements.find((e) => e.id === activeSys.bodyId);
    let stageText = 'Vuelo Parabólico ↷';
    if (activeSys.isFinished) {
      stageText = 'Impacto en Suelo 💥';
    }

    simState.telemetry = {
      type: 'lanzamiento_horizontal',
      vx: Number(activeSys.vx.toFixed(2)),
      vy: Number(activeSys.vy.toFixed(2)),
      vResultant: Number(activeSys.vResultant.toFixed(2)),
      angleDeg: Number(activeSys.angleDeg.toFixed(1)),
      label: activeEl?.properties?.label || 'Lanzamiento Horizontal',
      accel: activeSys.gravity,
      accelUnit: 'm/s²',
      rangeM: activeSys.currentRangeMeters.toFixed(2),
      heightM: activeSys.currentHeightMeters.toFixed(2),
      rangeTheoretical: activeSys.rangeTheoretical.toFixed(2),
      time: simState.elapsedTime.toFixed(1),
      stage: stageText,
      isFinished: simState.isSimulationComplete,
      isSimulationComplete: simState.isSimulationComplete,
    };
  } else if (simState.projectileMotionSystems && simState.projectileMotionSystems.length > 0) {
    const activeSys = simState.projectileMotionSystems.find((s) => !s.isFinished) || simState.projectileMotionSystems[0];
    const activeEl = elements.find((e) => e.id === activeSys.bodyId);
    let stageText = 'Ascenso Parabólico ↗';
    if (activeSys.isFinished) {
      stageText = 'Impacto en Suelo 🎯';
    } else if (Math.abs(activeSys.vy) < 0.25) {
      stageText = 'CÚSPIDE APEX (vy = 0) ⭐';
    } else if (activeSys.vy < 0) {
      stageText = 'Descenso Parabólico ↘';
    }

    simState.telemetry = {
      type: 'movimiento_proyectiles',
      v0: Number(activeSys.v0.toFixed(2)),
      vx: Number(activeSys.vx.toFixed(2)),
      vy: Number(activeSys.vy.toFixed(2)),
      vResultant: Number(activeSys.vResultant.toFixed(2)),
      thetaDeg: Number(activeSys.angleDeg.toFixed(1)),
      label: activeEl?.properties?.label || 'Tiro Parabólico 2D',
      accel: activeSys.gravity,
      accelUnit: 'm/s²',
      rangeM: activeSys.currentRangeMeters.toFixed(2),
      rangeTheoretical: activeSys.rangeTheoretical.toFixed(2),
      heightM: activeSys.currentHeightMeters.toFixed(2),
      maxHeight: activeSys.maxHeightReached.toFixed(2),
      flightTimeTheoretical: activeSys.flightTimeTheoretical.toFixed(2),
      time: simState.elapsedTime.toFixed(1),
      stage: stageText,
      isFinished: simState.isSimulationComplete,
      isSimulationComplete: simState.isSimulationComplete,
    };
  } else if (simState.mcuSystems && simState.mcuSystems.length > 0) {
    const primary = simState.mcuSystems[0];
    const primaryEl = elements.find((e) => e.id === primary.bodyId);
    simState.telemetry = {
      type: 'mcu',
      omega: Number(primary.omega.toFixed(2)),
      vt: Number(primary.vt.toFixed(2)),
      ac: Number(primary.ac.toFixed(2)),
      radiusM: Number(primary.radiusMeters.toFixed(2)),
      period: Number(primary.period.toFixed(2)),
      frequency: Number(primary.frequency.toFixed(2)),
      rpm: Number(primary.rpm.toFixed(1)),
      revolutions: primary.revolutions.toFixed(2),
      time: simState.elapsedTime.toFixed(1),
      label: primaryEl?.properties?.label || 'Movimiento Circular Uniforme',
      stage: 'En Rotación Continua 🔄',
      isFinished: false,
      isSimulationComplete: false,
    };
  } else if (simState.mcuvSystems && simState.mcuvSystems.length > 0) {
    const primary = simState.mcuvSystems[0];
    const primaryEl = elements.find((e) => e.id === (primary.bodyId || primary.turntableId));
    let stageText = 'Acelerando Rotación 🔄⚡';
    if (primary.alpha < 0) {
      stageText = primary.isFinished ? 'Detenido por Frenado 🛑' : 'Frenando Rotación 🔄🛑';
    } else if (primary.omega >= 34.9) {
      stageText = 'Velocidad Terminal Estable 🔄⚡';
    }
    simState.telemetry = {
      type: 'mcuv',
      omega: Number(primary.omega.toFixed(2)),
      alpha: Number(primary.alpha.toFixed(2)),
      vt: Number(primary.vt.toFixed(2)),
      at: Number(primary.at.toFixed(2)),
      ac: Number(primary.ac.toFixed(2)),
      aTotal: Number(primary.aTotal.toFixed(2)),
      radiusM: Number(primary.radiusMeters.toFixed(2)),
      rpm: Number(primary.rpm.toFixed(1)),
      revolutions: primary.revolutions.toFixed(2),
      time: simState.elapsedTime.toFixed(1),
      label: primaryEl?.properties?.label || 'Movimiento Circular Variado',
      stage: stageText,
      isFinished: simState.isSimulationComplete,
      isSimulationComplete: simState.isSimulationComplete,
    };
  } else if (simState.poleasMcuSystems && simState.poleasMcuSystems.length > 0) {
    const primary = simState.poleasMcuSystems[0];
    const primaryEl = elements.find((e) => e.id === primary.id);
    const rpm1 = (Math.abs(primary.omega1) * 60) / (2 * Math.PI);
    const rpm2 = (Math.abs(primary.omega2) * 60) / (2 * Math.PI);
    simState.telemetry = {
      type: 'poleas_mcu',
      configuration: primary.configuration,
      omega1: Number(primary.omega1.toFixed(2)),
      omega2: Number(primary.omega2.toFixed(2)),
      rpm1: Number(rpm1.toFixed(1)),
      rpm2: Number(rpm2.toFixed(1)),
      linearSpeed: Number(primary.linearSpeed.toFixed(2)),
      gearRatio: Number(primary.gearRatio.toFixed(3)),
      r1M: Number(primary.radiusMeters1.toFixed(3)),
      r2M: Number(primary.radiusMeters2.toFixed(3)),
      revolutions1: primary.revolutions1.toFixed(2),
      revolutions2: primary.revolutions2.toFixed(2),
      time: simState.elapsedTime.toFixed(1),
      label: primaryEl?.properties?.label || 'Poleas MCU',
      isFinished: false,
      isSimulationComplete: false,
    };
  } else if (simState.forcedMassSystems && simState.forcedMassSystems.length > 0) {
    const primary = simState.forcedMassSystems[0];
    simState.telemetry = {
      type: 'newton_dynamics',
      massKg: primary.massKg,
      netFx: Number(primary.sumFx.toFixed(2)),
      netFy: Number(primary.sumFy.toFixed(2)),
      netForce: Number(primary.netF.toFixed(2)),
      accel: Number(primary.accel.toFixed(2)),
      vel: Number(Math.hypot(primary.vx, primary.vy).toFixed(2)),
      dist: Number(primary.distanceTraveled.toFixed(2)),
      isEquilibrium: primary.isEquilibrium,
      time: simState.elapsedTime.toFixed(1),
      label: `Dinámica (2ª Ley) • Bloque ${primary.massKg} kg`,
      isFinished: simState.isSimulationComplete,
      isSimulationComplete: simState.isSimulationComplete,
    };
  } else if (simState.dclSystems && simState.dclSystems.length > 0) {
    const primary = simState.dclSystems[0];
    simState.telemetry = {
      type: 'dcl',
      accel: Number(Math.abs(primary.accel).toFixed(3)),
      accelUnit: 'm/s²',
      vel: Number(Math.abs(primary.currentVelocity).toFixed(2)),
      unit: 'm/s',
      t1: Number(primary.T1.toFixed(2)),
      t2: Number(primary.T2.toFixed(2)),
      fk: Number(primary.fk.toFixed(2)),
      netForce: Number(primary.netForce.toFixed(2)),
      dispX: Number(primary.displacementX.toFixed(1)),
      time: simState.elapsedTime.toFixed(1),
      label: primary.apparatusType === 'table_three_masses' ? 'Mesa con Tres Masas (HT02)' : 'Mesa con Dos Masas (HT02)',
      isEquilibrium: Math.abs(primary.accel) < 0.001,
      isFinished: simState.isSimulationComplete,
      isSimulationComplete: simState.isSimulationComplete,
    };
  } else if (simState.equilibriumSystems && simState.equilibriumSystems.length > 0) {
    const primary = simState.equilibriumSystems[0];
    simState.telemetry = {
      type: 'equilibrio',
      netFx: Number(primary.netFx.toFixed(2)),
      netFy: Number(primary.netFy.toFixed(2)),
      netForce: Number(primary.netForce.toFixed(2)),
      accel: Number(primary.accel.toFixed(2)),
      accelUnit: 'm/s²',
      isEquilibrium: primary.isEquilibrium,
      time: simState.elapsedTime.toFixed(1),
      label: primary.systemTitle || 'Equilibrio Traslacional (HT03)',
      isFinished: simState.isSimulationComplete,
      isSimulationComplete: simState.isSimulationComplete,
    };
  } else if (simState.newtonSystems && simState.newtonSystems.length > 0) {
    const primary = simState.newtonSystems[0];
    const dispMeters = Math.abs(primary.displacementX) / 28;
    simState.telemetry = {
      type: 'segunda_ley_newton',
      accel: Number(primary.accel.toFixed(2)),
      tension: Number(primary.tension.toFixed(2)),
      force: Number(primary.appliedForce.toFixed(1)),
      vel: Number(primary.currentVelocity.toFixed(2)),
      disp: Number(dispMeters.toFixed(2)),
      time: simState.elapsedTime.toFixed(1),
      label: primary.label,
      formula: primary.formula,
      isFinished: simState.isSimulationComplete,
      isSimulationComplete: simState.isSimulationComplete,
    };
  } else if (simState.atwoodSystems.length > 0) {
    const primary = simState.atwoodSystems[0];
    simState.telemetry = {
      type: 'atwood',
      accel: primary.isStopped ? 0 : primary.theoAccel,
      tension: primary.isStopped ? 0 : primary.theoTension,
      velA: primary.isStopped ? '0.00' : (primary.currentVel / 45).toFixed(2),
      time: simState.elapsedTime.toFixed(1),
      isStopped: primary.isStopped,
      isSimulationComplete: simState.isSimulationComplete,
    };
  }

  // -------------------------------------------------------------------------
  // 4. SYNCHRONIZE ELEMENTS
  // -------------------------------------------------------------------------
  return elements.map((el) => {
    // Sync DCL Diagram (smooth displacement of table masses & cords)
    if (el.type === 'physics_object' && el.physicsType === 'dcl_diagram') {
      const dclSys = simState.dclSystems?.find((s) => s.id === el.id);
      if (dclSys) {
        return {
          ...el,
          properties: {
            ...el.properties,
            displacementX: dclSys.displacementX,
            currentVelocity: dclSys.currentVelocity,
            accel: dclSys.accel,
          },
        };
      }
    }

    // Sync Translational Equilibrium Apparatus (displacement if unbalanced)
    if (el.type === 'physics_object' && el.physicsType === 'translational_equilibrium') {
      const eqSys = simState.equilibriumSystems?.find((s) => s.id === el.id);
      if (eqSys) {
        return {
          ...el,
          properties: {
            ...el.properties,
            displacementX: eqSys.displacementX,
            displacementY: eqSys.displacementY,
            currentVelocityX: eqSys.currentVelocityX,
            currentVelocityY: eqSys.currentVelocityY,
          },
        };
      }
    }

    // Sync Newton Second Law Frictionless System
    if (el.type === 'physics_object' && el.physicsType === 'newton_frictionless_system') {
      const nSys = simState.newtonSystems?.find((s) => s.id === el.id);
      if (nSys) {
        return {
          ...el,
          properties: {
            ...el.properties,
            displacementX: nSys.displacementX,
            currentVelocity: nSys.currentVelocity,
            accel: nSys.accel,
            tension: nSys.tension,
            isFinished: nSys.isFinished,
          },
        };
      }
    }

    // Sync Forced Mass Body (smooth subpixel 2D motion driven by net forces)
    if (el.type === 'physics_object' && el.physicsType === 'mass') {
      const mSys = simState.forcedMassSystems?.find((s) => s.id === el.id);
      if (mSys) {
        return {
          ...el,
          x: mSys.currentX,
          y: mSys.currentY,
          properties: {
            ...el.properties,
            velocity: Math.hypot(mSys.vx, mSys.vy),
            acceleration: mSys.accel,
          },
        };
      }
    }

    // Sync MRU & MRUV Cart (smooth subpixel float coordinate & instantaneous velocity)
    if (el.type === 'physics_object' && (el.physicsType === 'mru_cart' || el.physicsType === 'mruv_cart')) {
      const mruSys = simState.mruSystems.find((s) => s.cartId === el.id);
      if (mruSys) {
        return {
          ...el,
          x: mruSys.currentX,
          properties: {
            ...el.properties,
            distance: mruSys.distanceMeters,
            velocity: mruSys.velocity,
          },
        };
      }
    }

    // Sync Freefall Body (smooth vertical fall & instantaneous velocity)
    if (el.type === 'physics_object' && el.physicsType === 'freefall_body') {
      const ffSys = simState.freefallSystems?.find((s) => s.bodyId === el.id);
      if (ffSys) {
        return {
          ...el,
          y: ffSys.currentY,
          properties: {
            ...el.properties,
            distanceFallen: ffSys.distanceFallen,
            velocity: ffSys.velocity,
          },
        };
      }
    }

    // Sync Vertical Projectile (smooth vertical trajectory, instantaneous velocity & height)
    if (el.type === 'physics_object' && el.physicsType === 'vertical_projectile') {
      const vtSys = simState.verticalLaunchSystems?.find((s) => s.bodyId === el.id);
      if (vtSys) {
        return {
          ...el,
          y: vtSys.currentY,
          properties: {
            ...el.properties,
            currentHeight: vtSys.currentHeightMeters,
            velocity: vtSys.velocity,
            reachedApex: vtSys.reachedApex,
            isAscending: vtSys.velocity > 0,
          },
        };
      }
    }

    // Sync Horizontal Projectile (2D parabolic trajectory, vx, vy, vResultant, trail)
    if (el.type === 'physics_object' && el.physicsType === 'horizontal_projectile') {
      const hzSys = simState.horizontalLaunchSystems?.find((s) => s.bodyId === el.id);
      if (hzSys) {
        return {
          ...el,
          x: hzSys.currentX,
          y: hzSys.currentY,
          properties: {
            ...el.properties,
            vx: hzSys.vx,
            vy: hzSys.vy,
            vResultant: hzSys.vResultant,
            angleDeg: hzSys.angleDeg,
            currentRange: hzSys.currentRangeMeters,
            currentHeight: hzSys.currentHeightMeters,
            isFinished: hzSys.isFinished,
            trailPoints: hzSys.trailPoints ? [...hzSys.trailPoints] : [],
          },
        };
      }
    }

    // Sync Oblique Projectile (2D parabolic trajectory, vx, vy, vResultant, angleDeg, trail)
    if (el.type === 'physics_object' && el.physicsType === 'oblique_projectile') {
      const pSys = simState.projectileMotionSystems?.find((s) => s.bodyId === el.id);
      if (pSys) {
        return {
          ...el,
          x: pSys.currentX,
          y: pSys.currentY,
          properties: {
            ...el.properties,
            vx: pSys.vx,
            vy: pSys.vy,
            vResultant: pSys.vResultant,
            angleDeg: pSys.angleDeg,
            currentRange: pSys.currentRangeMeters,
            currentHeight: pSys.currentHeightMeters,
            reachedApex: pSys.reachedApex,
            isFinished: pSys.isFinished,
            trailPoints: pSys.trailPoints ? [...pSys.trailPoints] : [],
          },
        };
      }
    }

    // Sync MCU Particle
    if (el.type === 'physics_object' && el.physicsType === 'mcu_particle') {
      const mSys = simState.mcuSystems?.find((s) => s.bodyId === el.id);
      if (mSys) {
        return {
          ...el,
          x: mSys.currentX,
          y: mSys.currentY,
          properties: {
            ...el.properties,
            angleRad: mSys.angleRad,
            omega: mSys.omega,
            tangentialVelocity: mSys.vt,
            centripetalAccel: mSys.ac,
            revolutions: mSys.revolutions,
            period: mSys.period,
            frequency: mSys.frequency,
            rpm: mSys.rpm,
          },
        };
      }
    }

    // Sync MCU Turntable
    if (el.type === 'physics_object' && el.physicsType === 'mcu_turntable') {
      const mSys = simState.mcuSystems?.find((s) => s.turntableId === el.id);
      if (mSys) {
        return {
          ...el,
          properties: {
            ...el.properties,
            omega: mSys.omega,
            rpm: mSys.rpm,
          },
        };
      }
    }

    // Sync MCUV Particle
    if (el.type === 'physics_object' && el.physicsType === 'mcuv_particle') {
      const mSys = simState.mcuvSystems?.find((s) => s.bodyId === el.id);
      if (mSys) {
        return {
          ...el,
          x: mSys.currentX,
          y: mSys.currentY,
          properties: {
            ...el.properties,
            angleRad: mSys.angleRad,
            omega: mSys.omega,
            alpha: mSys.alpha,
            tangentialVelocity: mSys.vt,
            tangentialAccel: mSys.at,
            centripetalAccel: mSys.ac,
            totalAccel: mSys.aTotal,
            revolutions: mSys.revolutions,
            rpm: mSys.rpm,
          },
        };
      }
    }

    // Sync MCUV Turntable
    if (el.type === 'physics_object' && el.physicsType === 'mcuv_turntable') {
      const mSys = simState.mcuvSystems?.find((s) => s.turntableId === el.id);
      if (mSys) {
        return {
          ...el,
          properties: {
            ...el.properties,
            angleRad: mSys.angleRad,
            omega: mSys.omega,
            alpha: mSys.alpha,
            rpm: mSys.rpm,
          },
        };
      }
    }

    // Sync Poleas MCU System
    if (el.type === 'physics_object' && el.physicsType === 'mcu_pulley_system') {
      const pSys = simState.poleasMcuSystems?.find((s) => s.id === el.id);
      if (pSys) {
        return {
          ...el,
          properties: {
            ...el.properties,
            angleRad1: pSys.angleRad1,
            angleRad2: pSys.angleRad2,
            omega1: pSys.omega1,
            omega2: pSys.omega2,
            linearSpeed: pSys.linearSpeed,
            revolutions1: pSys.revolutions1,
            revolutions2: pSys.revolutions2,
          },
        };
      }
    }

    // Sync Photogate
    if (el.type === 'physics_object' && el.physicsType === 'mru_photogate') {
      const gateMatch = simState.mruGates.find((g) => g.id === el.id);
      if (gateMatch && gateMatch.properties?.triggered) {
        return {
          ...el,
          properties: {
            ...el.properties,
            ...gateMatch.properties,
          },
        };
      }
    }

    // Sync Atwood Masses (exact mathematical string kinematics)
    const atwoodSys = simState.atwoodSystems.find(
      (s) => s.massAEl.id === el.id || s.massBEl.id === el.id
    );
    if (atwoodSys) {
      const isA = atwoodSys.massAEl.id === el.id;
      const drop = isA
        ? atwoodSys.currentDropA
        : Math.max(atwoodSys.minDropB, atwoodSys.totalRopeDrop - atwoodSys.currentDropA);
      const gx = isA ? atwoodSys.grooveLeftX : atwoodSys.grooveRightX;
      return {
        ...el,
        x: gx - el.width / 2,
        y: atwoodSys.pulleyBody.position.y + drop - el.height / 2,
      };
    }

    // Sync Dynamic Matter.js Bodies (Masses, etc.)
    if (el.type === 'physics_object') {
      const body = simState.bodyMap.get(el.id);
      if (body) {
        return {
          ...el,
          x: body.position.x - el.width / 2,
          y: body.position.y - el.height / 2,
        };
      }
    }

    // Sync Atwood Rope Tensions
    if (el.type === 'physics_connection') {
      const matchingAtwood = simState.atwoodSystems.find(
        (sys) => sys.ropeAId === el.id || sys.ropeBId === el.id
      );
      if (matchingAtwood) {
        return {
          ...el,
          properties: {
            ...el.properties,
            tension: matchingAtwood.theoTension,
          },
        };
      }
    }

    return el;
  });
}

/**
 * Resets simulation back to the original snapshot positions
 */
export function resetHeadlessSimulation(simState, elements) {
  if (!simState || !simState.initialSnapshot) return elements;

  const snapshotMap = new Map(simState.initialSnapshot.map((s) => [s.id, s]));

  // Zero velocities in Matter.js
  const Matter = MatterLib?.default || MatterLib;
  simState.bodyMap.forEach((body) => {
    Matter.Body.setVelocity(body, { x: 0, y: 0 });
    Matter.Body.setAngularVelocity(body, 0);
  });

  simState.atwoodSystems.forEach((sys) => {
    sys.currentVel = 0;
    sys.isStopped = false;
    const snap = snapshotMap.get(sys.massAEl.id);
    if (snap && sys.pulleyBody) {
      const snapDropA = snap.y + sys.massAEl.height / 2 - sys.pulleyBody.position.y;
      sys.currentDropA = Math.max(sys.minDropA, Math.min(sys.maxDropA, snapDropA));
    }
  });

  simState.mruSystems.forEach((sys) => {
    sys.currentX = sys.initialX;
    sys.velocity = sys.initialVelocity;
    sys.distanceMeters = 0.0;
    sys.isFinished = false;
  });

  if (simState.freefallSystems) {
    simState.freefallSystems.forEach((sys) => {
      sys.currentY = sys.initialY;
      sys.velocity = sys.initialVelocity;
      sys.distanceFallen = 0.0;
      sys.isFinished = false;
    });
  }

  if (simState.verticalLaunchSystems) {
    simState.verticalLaunchSystems.forEach((sys) => {
      sys.currentY = sys.initialY;
      sys.velocity = sys.initialVelocity;
      sys.currentHeightMeters = 0.0;
      sys.reachedApex = false;
      sys.isAscending = sys.initialVelocity > 0;
      sys.isFinished = false;
    });
  }

  if (simState.horizontalLaunchSystems) {
    simState.horizontalLaunchSystems.forEach((sys) => {
      sys.currentX = sys.initialX;
      sys.currentY = sys.initialY;
      sys.vx = sys.initialVx;
      sys.vy = 0.0;
      sys.vResultant = sys.initialVx;
      sys.angleDeg = 0.0;
      sys.currentHeightMeters = sys.heightMeters;
      sys.currentRangeMeters = 0.0;
      sys.trailPoints = [];
      sys.isFinished = false;
    });
  }

  if (simState.projectileMotionSystems) {
    simState.projectileMotionSystems.forEach((sys) => {
      sys.currentX = sys.initialX;
      sys.currentY = sys.initialY;
      sys.vx = sys.initialVx;
      sys.vy = sys.initialVy;
      sys.vResultant = sys.v0;
      sys.angleDeg = sys.initialThetaDeg;
      sys.currentHeightMeters = sys.launchHeightMeters;
      sys.currentRangeMeters = 0.0;
      sys.maxHeightReached = sys.launchHeightMeters;
      sys.reachedApex = sys.initialVy <= 0;
      sys.trailPoints = [];
      sys.isFinished = false;
    });
  }

  if (simState.mcuSystems) {
    simState.mcuSystems.forEach((sys) => {
      sys.currentX = sys.initialX;
      sys.currentY = sys.initialY;
      sys.angleRad = sys.initialAngleRad;
      sys.revolutions = 0.0;
      sys.totalAngleRotated = 0.0;
      sys.isFinished = false;
    });
  }

  if (simState.mcuvSystems) {
    simState.mcuvSystems.forEach((sys) => {
      sys.currentX = sys.initialX;
      sys.currentY = sys.initialY;
      sys.angleRad = sys.initialAngleRad;
      sys.omega = sys.initialOmega;
      sys.alpha = sys.initialAlpha;
      sys.vt = Math.abs(sys.initialOmega) * sys.radiusMeters;
      sys.ac = sys.initialOmega * sys.initialOmega * sys.radiusMeters;
      sys.at = Math.abs(sys.initialAlpha) * sys.radiusMeters;
      sys.aTotal = Math.hypot(sys.ac, sys.at);
      sys.rpm = (Math.abs(sys.initialOmega) * 60) / (2 * Math.PI);
      sys.revolutions = 0.0;
      sys.totalAngleRotated = 0.0;
      sys.isFinished = false;
    });
  }

  if (simState.poleasMcuSystems) {
    simState.poleasMcuSystems.forEach((sys) => {
      sys.angleRad1 = sys.initialAngleRad1;
      sys.angleRad2 = sys.initialAngleRad2;
      sys.omega1 = sys.initialOmega1;
      sys.omega2 = sys.initialOmega2;
      sys.revolutions1 = 0.0;
      sys.revolutions2 = 0.0;
    });
  }

  if (simState.dclSystems) {
    simState.dclSystems.forEach((sys) => {
      sys.displacementX = 0.0;
      sys.currentVelocity = 0.0;
      sys.isFinished = false;
    });
  }

  if (simState.equilibriumSystems) {
    simState.equilibriumSystems.forEach((sys) => {
      sys.displacementX = 0.0;
      sys.displacementY = 0.0;
      sys.currentVelocityX = 0.0;
      sys.currentVelocityY = 0.0;
      sys.isFinished = false;
    });
  }

  if (simState.newtonSystems) {
    simState.newtonSystems.forEach((sys) => {
      sys.displacementX = 0.0;
      sys.currentVelocity = 0.0;
      sys.isFinished = false;
    });
  }

  if (simState.forcedMassSystems) {
    simState.forcedMassSystems.forEach((sys) => {
      sys.currentX = sys.initialX;
      sys.currentY = sys.initialY;
      sys.vx = 0.0;
      sys.vy = 0.0;
      sys.distanceTraveled = 0.0;
      sys.isFinished = false;
    });
  }

  simState.mruGates.forEach((gate) => {
    gate.properties = {
      ...gate.properties,
      triggered: false,
      recordedTime: null,
    };
  });

  simState.elapsedTime = 0;
  simState.isSimulationComplete = false;

  if (simState.mruSystems.length > 0) {
    const primaryCart = simState.mruSystems[0];
    const snapCart = snapshotMap.get(primaryCart.cartId);
    const isMruv = primaryCart.isMruv;
    simState.telemetry = {
      type: isMruv ? 'mruv' : 'mru',
      vel: snapCart?.properties?.displayVelocity !== undefined 
        ? snapCart.properties.displayVelocity 
        : primaryCart.velocity,
      unit: snapCart?.properties?.unit || 'm/s',
      label: snapCart?.properties?.label || (isMruv ? 'Móvil MRUV' : 'Móvil MRU'),
      accel: primaryCart.acceleration || 0.0,
      accelUnit: 'm/s²',
      dist: '0.00',
      time: '0.0',
      isFinished: false,
      isSimulationComplete: false,
    };
  } else if (simState.freefallSystems && simState.freefallSystems.length > 0) {
    const primaryBody = simState.freefallSystems[0];
    const snapBody = snapshotMap.get(primaryBody.bodyId);
    simState.telemetry = {
      type: 'freefall',
      vel: snapBody?.properties?.initialVelocity !== undefined 
        ? snapBody.properties.initialVelocity 
        : primaryBody.initialVelocity,
      unit: 'm/s',
      label: snapBody?.properties?.label || 'Caída Libre',
      accel: primaryBody.gravity,
      accelUnit: 'm/s²',
      dist: '0.00',
      time: '0.0',
      isFinished: false,
      isSimulationComplete: false,
    };
  } else if (simState.verticalLaunchSystems && simState.verticalLaunchSystems.length > 0) {
    const primaryProj = simState.verticalLaunchSystems[0];
    const snapProj = snapshotMap.get(primaryProj.bodyId);
    simState.telemetry = {
      type: 'tiro_vertical',
      vel: snapProj?.properties?.initialVelocity !== undefined 
        ? snapProj.properties.initialVelocity 
        : primaryProj.initialVelocity,
      unit: 'm/s',
      label: snapProj?.properties?.label || 'Tiro Vertical',
      accel: primaryProj.gravity,
      accelUnit: 'm/s²',
      height: '0.00',
      maxHeight: primaryProj.maxHeightMeters.toFixed(2),
      time: '0.0',
      stage: 'Lanzamiento ↑',
      isFinished: false,
      isSimulationComplete: false,
    };
  } else if (simState.horizontalLaunchSystems && simState.horizontalLaunchSystems.length > 0) {
    const primaryHz = simState.horizontalLaunchSystems[0];
    const snapHz = snapshotMap.get(primaryHz.bodyId);
    const v0x = snapHz?.properties?.initialVelocity !== undefined 
      ? snapHz.properties.initialVelocity 
      : primaryHz.initialVx;
    simState.telemetry = {
      type: 'lanzamiento_horizontal',
      vx: Number(v0x.toFixed(2)),
      vy: 0.0,
      vResultant: Number(v0x.toFixed(2)),
      angleDeg: 0.0,
      label: snapHz?.properties?.label || 'Lanzamiento Horizontal',
      accel: primaryHz.gravity,
      accelUnit: 'm/s²',
      rangeM: '0.00',
      heightM: primaryHz.heightMeters.toFixed(2),
      rangeTheoretical: primaryHz.rangeTheoretical.toFixed(2),
      time: '0.0',
      stage: 'Inicio en Borde',
      isFinished: false,
      isSimulationComplete: false,
    };
  } else if (simState.projectileMotionSystems && simState.projectileMotionSystems.length > 0) {
    const primaryProj = simState.projectileMotionSystems[0];
    const snapProj = snapshotMap.get(primaryProj.bodyId);
    const v0 = snapProj?.properties?.initialVelocity !== undefined 
      ? snapProj.properties.initialVelocity 
      : primaryProj.v0;
    const thetaDeg = snapProj?.properties?.angleDeg !== undefined
      ? snapProj.properties.angleDeg
      : primaryProj.initialThetaDeg;
    const rad = (thetaDeg * Math.PI) / 180;
    const v0x = v0 * Math.cos(rad);
    const v0y = v0 * Math.sin(rad);
    simState.telemetry = {
      type: 'movimiento_proyectiles',
      v0: Number(v0.toFixed(2)),
      vx: Number(v0x.toFixed(2)),
      vy: Number(v0y.toFixed(2)),
      vResultant: Number(v0.toFixed(2)),
      thetaDeg: Number(thetaDeg.toFixed(1)),
      label: snapProj?.properties?.label || 'Tiro Parabólico 2D',
      accel: primaryProj.gravity,
      accelUnit: 'm/s²',
      rangeM: '0.00',
      rangeTheoretical: primaryProj.rangeTheoretical.toFixed(2),
      heightM: primaryProj.launchHeightMeters.toFixed(2),
      maxHeight: primaryProj.hMaxTheoretical.toFixed(2),
      flightTimeTheoretical: primaryProj.flightTimeTheoretical.toFixed(2),
      time: '0.0',
      stage: 'Listo para Disparo',
      isFinished: false,
      isSimulationComplete: false,
    };
  } else if (simState.mcuSystems && simState.mcuSystems.length > 0) {
    const primary = simState.mcuSystems[0];
    const snapMcu = snapshotMap.get(primary.bodyId);
    const initOmega = snapMcu?.properties?.initialOmega !== undefined
      ? snapMcu.properties.initialOmega
      : (snapMcu?.properties?.omega !== undefined ? snapMcu.properties.omega : primary.initialOmega);
    simState.telemetry = {
      type: 'mcu',
      omega: Number(initOmega.toFixed(2)),
      vt: Number((Math.abs(initOmega) * primary.radiusMeters).toFixed(2)),
      ac: Number((initOmega * initOmega * primary.radiusMeters).toFixed(2)),
      radiusM: Number(primary.radiusMeters.toFixed(2)),
      period: Number(primary.period.toFixed(2)),
      frequency: Number(primary.frequency.toFixed(2)),
      rpm: Number(primary.rpm.toFixed(1)),
      revolutions: '0.00',
      time: '0.0',
      label: snapMcu?.properties?.label || 'Movimiento Circular Uniforme',
      stage: 'Listo para Rotación',
      isFinished: false,
      isSimulationComplete: false,
    };
  } else if (simState.mcuvSystems && simState.mcuvSystems.length > 0) {
    const primary = simState.mcuvSystems[0];
    const snapMcuv = snapshotMap.get(primary.bodyId);
    const initOmega = snapMcuv?.properties?.initialOmega !== undefined
      ? snapMcuv.properties.initialOmega
      : (snapMcuv?.properties?.omega !== undefined ? snapMcuv.properties.omega : primary.initialOmega);
    const initAlpha = snapMcuv?.properties?.initialAlpha !== undefined
      ? snapMcuv.properties.initialAlpha
      : (snapMcuv?.properties?.alpha !== undefined ? snapMcuv.properties.alpha : primary.initialAlpha);
    const rM = primary.radiusMeters;
    const vt = Math.abs(initOmega) * rM;
    const ac = initOmega * initOmega * rM;
    const at = Math.abs(initAlpha) * rM;
    const aTot = Math.hypot(ac, at);
    const rpm = (Math.abs(initOmega) * 60) / (2 * Math.PI);
    simState.telemetry = {
      type: 'mcuv',
      omega: Number(initOmega.toFixed(2)),
      alpha: Number(initAlpha.toFixed(2)),
      vt: Number(vt.toFixed(2)),
      at: Number(at.toFixed(2)),
      ac: Number(ac.toFixed(2)),
      aTotal: Number(aTot.toFixed(2)),
      radiusM: Number(rM.toFixed(2)),
      rpm: Number(rpm.toFixed(1)),
      revolutions: '0.00',
      time: '0.0',
      label: snapMcuv?.properties?.label || 'Movimiento Circular Variado',
      stage: 'Listo para Aceleración',
      isFinished: false,
      isSimulationComplete: false,
    };
  } else if (simState.poleasMcuSystems && simState.poleasMcuSystems.length > 0) {
    const primary = simState.poleasMcuSystems[0];
    const snapPoleas = snapshotMap.get(primary.id);
    const omega1 = snapPoleas?.properties?.initialOmega1 !== undefined
      ? snapPoleas.properties.initialOmega1
      : primary.initialOmega1;
    const omega2 = snapPoleas?.properties?.initialOmega2 !== undefined
      ? snapPoleas.properties.initialOmega2
      : primary.initialOmega2;
    const rpm1 = (Math.abs(omega1) * 60) / (2 * Math.PI);
    const rpm2 = (Math.abs(omega2) * 60) / (2 * Math.PI);
    simState.telemetry = {
      type: 'poleas_mcu',
      configuration: primary.configuration,
      omega1: Number(omega1.toFixed(2)),
      omega2: Number(omega2.toFixed(2)),
      rpm1: Number(rpm1.toFixed(1)),
      rpm2: Number(rpm2.toFixed(1)),
      linearSpeed: Number(primary.linearSpeed.toFixed(2)),
      gearRatio: Number(primary.gearRatio.toFixed(3)),
      r1M: Number(primary.radiusMeters1.toFixed(3)),
      r2M: Number(primary.radiusMeters2.toFixed(3)),
      revolutions1: '0.00',
      revolutions2: '0.00',
      time: '0.0',
      label: snapPoleas?.properties?.label || 'Poleas MCU',
      isFinished: false,
      isSimulationComplete: false,
    };
  } else if (simState.forcedMassSystems && simState.forcedMassSystems.length > 0) {
    const primary = simState.forcedMassSystems[0];
    simState.telemetry = {
      type: 'newton_dynamics',
      massKg: primary.massKg,
      netFx: Number(primary.sumFx.toFixed(2)),
      netFy: Number(primary.sumFy.toFixed(2)),
      netForce: Number(primary.netF.toFixed(2)),
      accel: Number(primary.accel.toFixed(2)),
      vel: 0.0,
      dist: '0.00',
      isEquilibrium: primary.isEquilibrium,
      time: '0.0',
      label: `Dinámica (2ª Ley) • Bloque ${primary.massKg} kg`,
      isFinished: false,
      isSimulationComplete: false,
    };
  } else if (simState.dclSystems && simState.dclSystems.length > 0) {
    const primary = simState.dclSystems[0];
    simState.telemetry = {
      type: 'dcl',
      accel: Number(Math.abs(primary.accel).toFixed(3)),
      accelUnit: 'm/s²',
      vel: 0.0,
      unit: 'm/s',
      t1: Number(primary.T1.toFixed(2)),
      t2: Number(primary.T2.toFixed(2)),
      fk: Number(primary.fk.toFixed(2)),
      netForce: Number(primary.netForce.toFixed(2)),
      dispX: 0.0,
      time: '0.0',
      label: primary.apparatusType === 'table_three_masses' ? 'Mesa con Tres Masas (HT02)' : 'Mesa con Dos Masas (HT02)',
      isEquilibrium: Math.abs(primary.accel) < 0.001,
      isFinished: false,
      isSimulationComplete: false,
    };
  } else if (simState.equilibriumSystems && simState.equilibriumSystems.length > 0) {
    const primary = simState.equilibriumSystems[0];
    simState.telemetry = {
      type: 'equilibrio',
      netFx: Number(primary.netFx.toFixed(2)),
      netFy: Number(primary.netFy.toFixed(2)),
      netForce: Number(primary.netForce.toFixed(2)),
      accel: Number(primary.accel.toFixed(2)),
      accelUnit: 'm/s²',
      isEquilibrium: primary.isEquilibrium,
      time: '0.0',
      label: primary.systemTitle || 'Equilibrio Traslacional (HT03)',
      isFinished: false,
      isSimulationComplete: false,
    };
  } else if (simState.newtonSystems && simState.newtonSystems.length > 0) {
    const primary = simState.newtonSystems[0];
    simState.telemetry = {
      type: 'segunda_ley_newton',
      accel: Number(primary.accel.toFixed(2)),
      tension: Number(primary.tension.toFixed(2)),
      force: Number(primary.appliedForce.toFixed(1)),
      vel: 0.0,
      disp: 0.0,
      time: '0.0',
      label: primary.label,
      formula: primary.formula,
      isFinished: false,
      isSimulationComplete: false,
    };
  } else if (simState.atwoodSystems.length > 0) {
    const primary = atwoodSystems[0];
    simState.telemetry = {
      type: 'atwood',
      accel: primary.theoAccel,
      tension: primary.theoTension,
      velA: '0.00',
      time: '0.0',
      isStopped: false,
      isSimulationComplete: false,
    };
  }

  return elements.map((el) => {
    const snap = snapshotMap.get(el.id);
    if (snap) {
      if (el.type === 'physics_object') {
        const body = simState.bodyMap.get(el.id);
        if (body) {
          const cx = snap.x + el.width / 2;
          const cy = snap.y + el.height / 2;
          Matter.Body.setPosition(body, { x: cx, y: cy });
        }
        const baseProps = {
          ...el.properties,
          ...snap.properties,
          triggered: false,
          recordedTime: null,
          distance: 0,
          distanceFallen: 0,
          isFinished: false,
          trailPoints: [],
        };

        if (el.physicsType === 'oblique_projectile') {
          const initV = snap.properties?.initialVelocity !== undefined 
            ? snap.properties.initialVelocity 
            : (snap.properties?.velocity !== undefined ? snap.properties.velocity : 25.0);
          const initTheta = snap.properties?.initialAngleDeg !== undefined 
            ? snap.properties.initialAngleDeg 
            : (snap.properties?.angleDeg !== undefined ? snap.properties.angleDeg : 45.0);
          const rad = (initTheta * Math.PI) / 180;
          const initH = snap.properties?.launchHeight !== undefined 
            ? snap.properties.launchHeight 
            : (snap.properties?.launchHeightMeters !== undefined ? snap.properties.launchHeightMeters : 0.0);

          return {
            ...el,
            x: snap.x,
            y: snap.y,
            properties: {
              ...baseProps,
              velocity: initV,
              initialVelocity: initV,
              angleDeg: initTheta,
              initialAngleDeg: initTheta,
              vx: initV * Math.cos(rad),
              vy: initV * Math.sin(rad),
              vResultant: initV,
              currentRange: 0.0,
              currentHeight: initH,
              reachedApex: false,
              trailPoints: [],
            },
          };
        }

        if (el.physicsType === 'horizontal_projectile') {
          const initVx = snap.properties?.initialVelocity !== undefined 
            ? snap.properties.initialVelocity 
            : (snap.properties?.velocity !== undefined ? snap.properties.velocity : 20.0);
          const initH = snap.properties?.heightMeters !== undefined ? snap.properties.heightMeters : 20.0;
          return {
            ...el,
            x: snap.x,
            y: snap.y,
            properties: {
              ...baseProps,
              velocity: initVx,
              vx: initVx,
              vy: 0.0,
              vResultant: initVx,
              angleDeg: 0.0,
              currentRange: 0.0,
              currentHeight: initH,
              trailPoints: [],
            },
          };
        }

        if (el.physicsType === 'vertical_projectile') {
          const initV = snap.properties?.initialVelocity !== undefined 
            ? snap.properties.initialVelocity 
            : (snap.properties?.velocity !== undefined ? snap.properties.velocity : 20.0);
          return {
            ...el,
            x: snap.x,
            y: snap.y,
            properties: {
              ...baseProps,
              velocity: initV,
              currentHeight: 0.0,
              reachedApex: false,
              isAscending: true,
              trailPoints: [],
            },
          };
        }

        if (el.physicsType === 'freefall_body') {
          const initV = snap.properties?.initialVelocity !== undefined 
            ? snap.properties.initialVelocity 
            : (snap.properties?.velocity !== undefined ? snap.properties.velocity : 0.0);
          const initH = snap.properties?.releaseHeight || snap.properties?.heightMeters || 0.0;
          return {
            ...el,
            x: snap.x,
            y: snap.y,
            properties: {
              ...baseProps,
              velocity: initV,
              distanceFallen: 0.0,
              currentHeight: initH,
            },
          };
        }

        if (el.physicsType === 'mru_cart' || el.physicsType === 'mruv_cart') {
          const isMruv = el.physicsType === 'mruv_cart';
          const initV = snap.properties?.initialVelocity !== undefined 
            ? snap.properties.initialVelocity 
            : (snap.properties?.velocity !== undefined ? snap.properties.velocity : (isMruv ? 0.0 : 2.0));
          return {
            ...el,
            x: snap.x,
            y: snap.y,
            properties: {
              ...baseProps,
              velocity: initV,
              distance: 0.0,
            },
          };
        }

        if (el.physicsType === 'mcu_particle') {
          const initOmega = snap.properties?.initialOmega !== undefined
            ? snap.properties.initialOmega
            : (snap.properties?.omega !== undefined ? snap.properties.omega : 3.0);
          const initAngle = snap.properties?.initialAngleRad !== undefined
            ? snap.properties.initialAngleRad
            : (snap.properties?.angleRad !== undefined ? snap.properties.angleRad : 0.0);
          const rM = snap.properties?.radiusMeters || 1.0;
          return {
            ...el,
            x: snap.x,
            y: snap.y,
            properties: {
              ...baseProps,
              omega: initOmega,
              initialOmega: initOmega,
              angleRad: initAngle,
              initialAngleRad: initAngle,
              revolutions: 0.0,
              tangentialVelocity: Math.abs(initOmega) * rM,
              centripetalAccel: initOmega * initOmega * rM,
            },
          };
        }

        if (el.physicsType === 'mcuv_particle') {
          const initOmega = snap.properties?.omega0 !== undefined
            ? snap.properties.omega0
            : (snap.properties?.initialOmega !== undefined
              ? snap.properties.initialOmega
              : (snap.properties?.omega !== undefined ? snap.properties.omega : 0.0));
          const initAlpha = snap.properties?.alpha !== undefined
            ? snap.properties.alpha
            : (snap.properties?.initialAlpha !== undefined ? snap.properties.initialAlpha : 2.0);
          const initAngle = snap.properties?.initialAngleRad !== undefined
            ? snap.properties.initialAngleRad
            : (snap.properties?.angleRad !== undefined ? snap.properties.angleRad : 0.0);
          const rM = snap.properties?.radiusMeters || 1.0;
          return {
            ...el,
            x: snap.x,
            y: snap.y,
            properties: {
              ...baseProps,
              omega: initOmega,
              initialOmega: initOmega,
              omega0: initOmega,
              alpha: initAlpha,
              initialAlpha: initAlpha,
              angleRad: initAngle,
              initialAngleRad: initAngle,
              revolutions: 0.0,
              tangentialVelocity: Math.abs(initOmega) * rM,
              centripetalAccel: initOmega * initOmega * rM,
              tangentialAccel: Math.abs(initAlpha) * rM,
              totalAccel: Math.hypot(initOmega * initOmega * rM, Math.abs(initAlpha) * rM),
            },
          };
        }

        if (el.physicsType === 'mcuv_turntable') {
          const initOmega = snap.properties?.omega0 !== undefined
            ? snap.properties.omega0
            : (snap.properties?.initialOmega !== undefined
              ? snap.properties.initialOmega
              : (snap.properties?.omega !== undefined ? snap.properties.omega : 0.0));
          const initAlpha = snap.properties?.alpha !== undefined
            ? snap.properties.alpha
            : (snap.properties?.initialAlpha !== undefined ? snap.properties.initialAlpha : 2.0);
          const initAngle = snap.properties?.initialAngleRad !== undefined
            ? snap.properties.initialAngleRad
            : (snap.properties?.angleRad !== undefined ? snap.properties.angleRad : 0.0);
          return {
            ...el,
            x: snap.x,
            y: snap.y,
            properties: {
              ...baseProps,
              omega: initOmega,
              initialOmega: initOmega,
              omega0: initOmega,
              alpha: initAlpha,
              initialAlpha: initAlpha,
              angleRad: initAngle,
              initialAngleRad: initAngle,
              rpm: (Math.abs(initOmega) * 60) / (2 * Math.PI),
            },
          };
        }

        if (el.physicsType === 'mcu_pulley_system') {
          return {
            ...el,
            x: snap.x,
            y: snap.y,
            properties: {
              ...baseProps,
              angleRad1: snap.properties?.initialAngleRad1 || 0.0,
              angleRad2: snap.properties?.initialAngleRad2 || 0.0,
              revolutions1: 0.0,
              revolutions2: 0.0,
            },
          };
        }

        if (el.physicsType === 'translational_equilibrium') {
          return {
            ...el,
            x: snap.x,
            y: snap.y,
            properties: {
              ...baseProps,
              displacementX: 0.0,
              displacementY: 0.0,
              currentVelocityX: 0.0,
              currentVelocityY: 0.0,
            },
          };
        }

        if (el.physicsType === 'dcl_diagram') {
          return {
            ...el,
            x: snap.x,
            y: snap.y,
            properties: {
              ...baseProps,
              displacementX: 0.0,
              currentVelocity: 0.0,
            },
          };
        }

        if (el.physicsType === 'newton_frictionless_system') {
          return {
            ...el,
            x: snap.x,
            y: snap.y,
            properties: {
              ...baseProps,
              displacementX: 0.0,
              currentVelocity: 0.0,
              isFinished: false,
            },
          };
        }

        return {
          ...el,
          x: snap.x,
          y: snap.y,
          properties: {
            ...baseProps,
            velocity: snap.properties?.initialVelocity !== undefined 
              ? snap.properties.initialVelocity 
              : snap.properties?.velocity,
          },
        };
      }
      if (el.type === 'physics_connection') {
        return {
          ...el,
          properties: {
            ...el.properties,
            tension: 0,
          },
        };
      }
    }
    return el;
  });
}

/**
 * Validates if an existing headless simulation state is still structurally compatible
 * with the current whiteboard elements (e.g. checks if objects/connections were added or deleted).
 */
export function isSimStateCompatible(simState, elements) {
  if (!simState || !simState.engine || !simState.bodyMap) return false;

  const currentPhysicsObjs = elements.filter((el) => el.type === 'physics_object');
  const currentConns = elements.filter((el) => el.type === 'physics_connection');

  // If there are no physical objects or connections at all on canvas,
  // simState is not compatible if it holds any active compiled systems.
  if (currentPhysicsObjs.length === 0 && currentConns.length === 0) {
    return false;
  }

  // Check rigid bodies in bodyMap (unforced mass, pulley)
  const rigidBodies = currentPhysicsObjs.filter(
    (el) => (el.physicsType === 'mass' && (!el.properties?.userVectors || el.properties.userVectors.length === 0)) || el.physicsType === 'pulley'
  );
  if (simState.bodyMap.size !== rigidBodies.length) return false;
  for (const obj of rigidBodies) {
    if (!simState.bodyMap.has(obj.id)) return false;
  }

  // Check forced mass systems consistency
  const currentForcedMasses = currentPhysicsObjs.filter(
    (el) => el.physicsType === 'mass' && Array.isArray(el.properties?.userVectors) && el.properties.userVectors.length > 0
  );
  const simForced = simState.forcedMassSystems || [];
  if (simForced.length !== currentForcedMasses.length) return false;

  // Check DCL systems consistency
  const currentDcls = currentPhysicsObjs.filter((el) => el.physicsType === 'dcl_diagram');
  const simDcls = simState.dclSystems || [];
  if (simDcls.length !== currentDcls.length) return false;

  // Check Translational Equilibrium systems consistency
  const currentEqs = currentPhysicsObjs.filter((el) => el.physicsType === 'translational_equilibrium');
  const simEqs = simState.equilibriumSystems || [];
  if (simEqs.length !== currentEqs.length) return false;

  // Check Newton Second Law Frictionless systems consistency
  const currentNewton = currentPhysicsObjs.filter((el) => el.physicsType === 'newton_frictionless_system');
  const simNewton = simState.newtonSystems || [];
  if (simNewton.length !== currentNewton.length) return false;
  for (const sys of simNewton) {
    const match = currentNewton.find((o) => o.id === sys.id);
    if (!match) return false;
    const p = match.properties || {};
    if (p.appliedForce !== undefined && Math.abs((p.appliedForce || 0) - sys.appliedForce) > 0.01) return false;
    if (p.mass1 !== undefined && Math.abs((p.mass1 || 0) - sys.mass1) > 0.01) return false;
    if (p.mass2 !== undefined && Math.abs((p.mass2 || 0) - sys.mass2) > 0.01) return false;
  }

  // Check Atwood systems consistency
  for (const sys of simState.atwoodSystems) {
    if (!currentPhysicsObjs.some((o) => o.id === sys.pulleyEl.id)) return false;
    if (!currentPhysicsObjs.some((o) => o.id === sys.massAEl.id)) return false;
    if (!currentPhysicsObjs.some((o) => o.id === sys.massBEl.id)) return false;
    if (!currentConns.some((c) => c.id === sys.ropeAId)) return false;
    if (!currentConns.some((c) => c.id === sys.ropeBId)) return false;
  }

  // Check MRU & MRUV systems consistency
  const currentCarts = currentPhysicsObjs.filter(
    (o) => o.physicsType === 'mru_cart' || o.physicsType === 'mruv_cart'
  );
  if (simState.mruSystems.length !== currentCarts.length) return false;
  for (const sys of simState.mruSystems) {
    const match = currentCarts.find((o) => o.id === sys.cartId);
    if (!match) return false;
    const targetVel = match.properties?.initialVelocity !== undefined 
      ? match.properties.initialVelocity 
      : (match.properties?.velocity !== undefined ? match.properties.velocity : 2.0);
    const targetAccel = match.properties?.acceleration !== undefined ? match.properties.acceleration : 0.0;
    if (Math.abs(sys.initialVelocity - targetVel) > 0.001) return false;
    if (Math.abs((sys.acceleration || 0) - targetAccel) > 0.001) return false;
  }

  // Check Freefall systems consistency
  const currentBodies = currentPhysicsObjs.filter((o) => o.physicsType === 'freefall_body');
  const simBodies = simState.freefallSystems || [];
  if (simBodies.length !== currentBodies.length) return false;
  for (const sys of simBodies) {
    const match = currentBodies.find((o) => o.id === sys.bodyId);
    if (!match) return false;
    const targetV0 = match.properties?.initialVelocity !== undefined
      ? match.properties.initialVelocity
      : (match.properties?.velocity !== undefined ? match.properties.velocity : 0.0);
    const targetG = match.properties?.gravity !== undefined ? match.properties.gravity : 9.8;
    if (Math.abs(sys.initialVelocity - targetV0) > 0.001) return false;
    if (Math.abs(sys.gravity - targetG) > 0.001) return false;
  }

  // Check Tiro Vertical systems consistency
  const currentProjectiles = currentPhysicsObjs.filter((o) => o.physicsType === 'vertical_projectile');
  const simProjectiles = simState.verticalLaunchSystems || [];
  if (simProjectiles.length !== currentProjectiles.length) return false;
  for (const sys of simProjectiles) {
    const match = currentProjectiles.find((o) => o.id === sys.bodyId);
    if (!match) return false;
    const targetV0 = match.properties?.initialVelocity !== undefined
      ? match.properties.initialVelocity
      : (match.properties?.velocity !== undefined ? match.properties.velocity : 20.0);
    const targetG = match.properties?.gravity !== undefined ? match.properties.gravity : 9.8;
    if (Math.abs(sys.initialVelocity - targetV0) > 0.001) return false;
    if (Math.abs(sys.gravity - targetG) > 0.001) return false;
  }

  // Check Horizontal Launch systems consistency
  const currentHzProjectiles = currentPhysicsObjs.filter((o) => o.physicsType === 'horizontal_projectile');
  const simHzProjectiles = simState.horizontalLaunchSystems || [];
  if (simHzProjectiles.length !== currentHzProjectiles.length) return false;
  for (const sys of simHzProjectiles) {
    const match = currentHzProjectiles.find((o) => o.id === sys.bodyId);
    if (!match) return false;
    const targetV0x = match.properties?.initialVelocity !== undefined
      ? match.properties.initialVelocity
      : (match.properties?.velocity !== undefined ? match.properties.velocity : 20.0);
    const targetG = match.properties?.gravity !== undefined ? match.properties.gravity : 9.8;
    const targetH = match.properties?.heightMeters !== undefined
      ? match.properties.heightMeters
      : (match.properties?.launchHeight !== undefined ? match.properties.launchHeight : 20.0);
    if (Math.abs(sys.initialVx - targetV0x) > 0.001) return false;
    if (Math.abs(sys.gravity - targetG) > 0.001) return false;
    if (Math.abs(sys.heightMeters - targetH) > 0.001) return false;
  }

  // Check Oblique Projectile systems consistency
  const currentObliqueProjectiles = currentPhysicsObjs.filter((o) => o.physicsType === 'oblique_projectile');
  const simObliqueProjectiles = simState.projectileMotionSystems || [];
  if (simObliqueProjectiles.length !== currentObliqueProjectiles.length) return false;
  for (const sys of simObliqueProjectiles) {
    const match = currentObliqueProjectiles.find((o) => o.id === sys.bodyId);
    if (!match) return false;
    const targetV0 = match.properties?.initialVelocity !== undefined
      ? match.properties.initialVelocity
      : (match.properties?.velocity !== undefined ? match.properties.velocity : 25.0);
    const targetTheta = match.properties?.initialAngleDeg !== undefined
      ? match.properties.initialAngleDeg
      : (match.properties?.angleDeg !== undefined ? match.properties.angleDeg : 45.0);
    const targetG = match.properties?.gravity !== undefined ? match.properties.gravity : 9.8;
    const targetH = match.properties?.launchHeight !== undefined
      ? match.properties.launchHeight
      : (match.properties?.launchHeightMeters !== undefined ? match.properties.launchHeightMeters : 0.0);
    if (Math.abs(sys.v0 - targetV0) > 0.001) return false;
    if (Math.abs(sys.initialThetaDeg - targetTheta) > 0.001) return false;
    if (Math.abs(sys.gravity - targetG) > 0.001) return false;
    if (Math.abs(sys.launchHeightMeters - targetH) > 0.001) return false;
  }

  // Check MCU consistency (particles & turntables)
  const currentMcuParticles = currentPhysicsObjs.filter((o) => o.physicsType === 'mcu_particle');
  const currentMcuTurntables = currentPhysicsObjs.filter((o) => o.physicsType === 'mcu_turntable');
  const simMcu = simState.mcuSystems || [];
  const pairedMcuTurntableIds = new Set();
  currentMcuParticles.forEach((p) => {
    const tt = currentMcuTurntables.find(
      (t) => Math.hypot((t.x + t.width / 2) - (p.x + p.width / 2), (t.y + t.height / 2) - (p.y + p.height / 2)) < (t.width / 2 + 10)
    );
    if (tt) pairedMcuTurntableIds.add(tt.id);
  });
  const totalMcuExpected = currentMcuParticles.length + currentMcuTurntables.filter((t) => !pairedMcuTurntableIds.has(t.id)).length;
  if (simMcu.length !== totalMcuExpected) return false;
  for (const sys of simMcu) {
    if (sys.bodyId) {
      const match = currentMcuParticles.find((o) => o.id === sys.bodyId);
      if (!match) return false;
      const targetOmega = match.properties?.initialOmega !== undefined
        ? match.properties.initialOmega
        : (match.properties?.omega !== undefined ? match.properties.omega : 3.0);
      const targetR = match.properties?.radiusMeters !== undefined ? match.properties.radiusMeters : 1.0;
      if (Math.abs(sys.omega - targetOmega) > 0.001) return false;
      if (Math.abs(sys.radiusMeters - targetR) > 0.001) return false;
    } else if (sys.turntableId) {
      const match = currentMcuTurntables.find((o) => o.id === sys.turntableId);
      if (!match) return false;
    }
  }

  // Check MCUV consistency (particles & turntables)
  const currentMcuvParticles = currentPhysicsObjs.filter((o) => o.physicsType === 'mcuv_particle');
  const currentMcuvTurntables = currentPhysicsObjs.filter((o) => o.physicsType === 'mcuv_turntable');
  const simMcuv = simState.mcuvSystems || [];
  const pairedMcuvTurntableIds = new Set();
  currentMcuvParticles.forEach((p) => {
    const tt = currentMcuvTurntables.find(
      (t) => Math.hypot((t.x + t.width / 2) - (p.x + p.width / 2), (t.y + t.height / 2) - (p.y + p.height / 2)) < (t.width / 2 + 10)
    );
    if (tt) pairedMcuvTurntableIds.add(tt.id);
  });
  const totalMcuvExpected = currentMcuvParticles.length + currentMcuvTurntables.filter((t) => !pairedMcuvTurntableIds.has(t.id)).length;
  if (simMcuv.length !== totalMcuvExpected) return false;
  for (const sys of simMcuv) {
    if (sys.bodyId) {
      const match = currentMcuvParticles.find((o) => o.id === sys.bodyId);
      if (!match) return false;
      const targetOmega = match.properties?.initialOmega !== undefined
        ? match.properties.initialOmega
        : (match.properties?.omega !== undefined ? match.properties.omega : 0.0);
      const targetAlpha = match.properties?.initialAlpha !== undefined
        ? match.properties.initialAlpha
        : (match.properties?.alpha !== undefined ? match.properties.alpha : 2.0);
      const targetR = match.properties?.radiusMeters !== undefined ? match.properties.radiusMeters : 1.0;
      if (Math.abs(sys.initialOmega - targetOmega) > 0.001) return false;
      if (Math.abs(sys.initialAlpha - targetAlpha) > 0.001) return false;
      if (Math.abs(sys.radiusMeters - targetR) > 0.001) return false;
    } else if (sys.turntableId) {
      const match = currentMcuvTurntables.find((o) => o.id === sys.turntableId);
      if (!match) return false;
    }
  }

  // Check Poleas MCU systems consistency
  const currentPulleySystems = currentPhysicsObjs.filter((o) => o.physicsType === 'mcu_pulley_system');
  const simPulleySystems = simState.poleasMcuSystems || [];
  if (simPulleySystems.length !== currentPulleySystems.length) return false;
  for (const sys of simPulleySystems) {
    const match = currentPulleySystems.find((o) => o.id === sys.id);
    if (!match) return false;
    const matchOmega1 = match.properties?.initialOmega1 !== undefined
      ? match.properties.initialOmega1
      : (match.properties?.omega1 !== undefined ? match.properties.omega1 : (match.properties?.omega !== undefined ? match.properties.omega : 5.0));
    if (Math.abs(sys.initialOmega1 - matchOmega1) > 0.001) return false;
  }

  // Check if there are newly formed setups that are not in simState
  const hasPulleys = currentPhysicsObjs.some((o) => o.physicsType === 'pulley');
  if (hasPulleys && simState.atwoodSystems.length === 0 && currentConns.length >= 2) {
    return false;
  }
  if (currentCarts.length > 0 && simState.mruSystems.length === 0) return false;
  if (currentBodies.length > 0 && (!simState.freefallSystems || simState.freefallSystems.length === 0)) return false;
  if (currentProjectiles.length > 0 && (!simState.verticalLaunchSystems || simState.verticalLaunchSystems.length === 0)) return false;
  if (currentHzProjectiles.length > 0 && (!simState.horizontalLaunchSystems || simState.horizontalLaunchSystems.length === 0)) return false;
  if (currentObliqueProjectiles.length > 0 && (!simState.projectileMotionSystems || simState.projectileMotionSystems.length === 0)) return false;
  if (currentMcuParticles.length > 0 && (!simState.mcuSystems || simState.mcuSystems.length === 0)) return false;
  if (currentMcuvParticles.length > 0 && (!simState.mcuvSystems || simState.mcuvSystems.length === 0)) return false;
  if (currentPulleySystems.length > 0 && (!simState.poleasMcuSystems || simState.poleasMcuSystems.length === 0)) return false;

  // Exhaustive ID verification: ensure every active physical ID compiled in simState still exists on canvas
  const compiledIds = new Set();
  simState.bodyMap?.forEach((_, id) => compiledIds.add(id));
  simState.mruSystems?.forEach((s) => compiledIds.add(s.cartId));
  simState.freefallSystems?.forEach((s) => compiledIds.add(s.bodyId));
  simState.verticalLaunchSystems?.forEach((s) => compiledIds.add(s.bodyId));
  simState.horizontalLaunchSystems?.forEach((s) => compiledIds.add(s.bodyId));
  simState.projectileMotionSystems?.forEach((s) => compiledIds.add(s.bodyId));
  simState.mcuSystems?.forEach((s) => {
    if (s.bodyId) compiledIds.add(s.bodyId);
    if (s.turntableId) compiledIds.add(s.turntableId);
  });
  simState.mcuvSystems?.forEach((s) => {
    if (s.bodyId) compiledIds.add(s.bodyId);
    if (s.turntableId) compiledIds.add(s.turntableId);
  });
  simState.poleasMcuSystems?.forEach((s) => compiledIds.add(s.id));

  for (const id of compiledIds) {
    if (!currentPhysicsObjs.some((o) => o.id === id)) {
      return false;
    }
  }

  return true;
}


