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
  // 2. CHECK GLOBAL SIMULATION COMPLETION
  // -------------------------------------------------------------------------
  const hasMru = simState.mruSystems.length > 0;
  const hasAtwood = simState.atwoodSystems.length > 0;
  const hasFreefall = simState.freefallSystems && simState.freefallSystems.length > 0;
  const hasVertical = simState.verticalLaunchSystems && simState.verticalLaunchSystems.length > 0;
  const hasHorizontal = simState.horizontalLaunchSystems && simState.horizontalLaunchSystems.length > 0;
  const hasProjectile = simState.projectileMotionSystems && simState.projectileMotionSystems.length > 0;

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

  const isComplete =
    (hasMru || hasAtwood || hasFreefall || hasVertical || hasHorizontal || hasProjectile) &&
    (!hasMru || allMruFinished) &&
    (!hasAtwood || allAtwoodStopped) &&
    (!hasFreefall || allFreefallFinished) &&
    (!hasVertical || allVerticalFinished) &&
    (!hasHorizontal || allHorizontalFinished) &&
    (!hasProjectile || allProjectileFinished);

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

  // Check rigid bodies in bodyMap (mass, pulley)
  const rigidBodies = currentPhysicsObjs.filter(
    (el) => el.physicsType === 'mass' || el.physicsType === 'pulley'
  );
  if (simState.bodyMap.size !== rigidBodies.length) return false;
  for (const obj of rigidBodies) {
    if (!simState.bodyMap.has(obj.id)) return false;
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

  // Check if there are newly formed setups that are not in simState
  const hasPulleys = currentPhysicsObjs.some((o) => o.physicsType === 'pulley');
  if (hasPulleys && simState.atwoodSystems.length === 0 && currentConns.length >= 2) {
    return false;
  }

  if (currentCarts.length > 0 && simState.mruSystems.length === 0) {
    return false;
  }

  if (currentBodies.length > 0 && (!simState.freefallSystems || simState.freefallSystems.length === 0)) {
    return false;
  }

  if (currentProjectiles.length > 0 && (!simState.verticalLaunchSystems || simState.verticalLaunchSystems.length === 0)) {
    return false;
  }

  if (currentHzProjectiles.length > 0 && (!simState.horizontalLaunchSystems || simState.horizontalLaunchSystems.length === 0)) {
    return false;
  }

  if (currentObliqueProjectiles.length > 0 && (!simState.projectileMotionSystems || simState.projectileMotionSystems.length === 0)) {
    return false;
  }

  return true;
}


