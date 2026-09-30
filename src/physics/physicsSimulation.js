// =========================================================================
// HEADLESS MATTER.JS PHYSICS SIMULATION ENGINE FOR WHITEBOARD
// Compiles whiteboard elements (MRU carts, tracks, masses, pulleys, ropes)
// into an in-memory world, simulates real physical dynamics and syncs to canvas.
// =========================================================================
import MatterLib from 'matter-js';
import { getAnchorAbsolutePosition } from './physicsRegistry.js';

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
  const mruCarts = physicsObjects.filter((el) => el.physicsType === 'mru_cart');
  const mruTracks = physicsObjects.filter((el) => el.physicsType === 'mru_track');
  const mruGates = physicsObjects.filter((el) => el.physicsType === 'mru_photogate');

  mruCarts.forEach((cartEl) => {
    const v = cartEl.properties?.velocity !== undefined ? cartEl.properties.velocity : 2.0;
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
      if (v > 0 && startX >= trackMaxX - 5) {
        startX = trackMinX;
      } else if (v < 0 && startX <= trackMinX + 5) {
        startX = trackMaxX;
      }
    }

    mruSystems.push({
      cartId: cartEl.id,
      velocity: v, // m/s
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
  const hasMruObj = elements.some((e) => e.type === 'physics_object' && e.physicsType === 'mru_cart');
  if (hasMruObj && mruSystems.length > 0) {
    const primaryCart = mruSystems[0];
    const primaryEl = elements.find((e) => e.id === primaryCart.cartId);
    const dispV = primaryEl?.properties?.displayVelocity !== undefined ? primaryEl.properties.displayVelocity : primaryCart.velocity;
    const vUnit = primaryEl?.properties?.unit || 'm/s';
    const cartLabel = primaryEl?.properties?.label || 'Móvil MRU';
    initialTelemetry = {
      type: 'mru',
      vel: dispV,
      unit: vUnit,
      label: cartLabel,
      accel: 0.0,
      dist: '0.00',
      time: '0.0',
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
  // 1. UPDATE MRU CARTS (STRICT CONSTANT VELOCITY v = cte, a = 0)
  // -------------------------------------------------------------------------
  const pxPerMeter = 80; // 80 pixels = 1.0 meter

  simState.mruSystems.forEach((mruSys) => {
    if (mruSys.isFinished) return;

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
  // 2. CHECK GLOBAL SIMULATION COMPLETION
  // -------------------------------------------------------------------------
  const hasMru = simState.mruSystems.length > 0;
  const hasAtwood = simState.atwoodSystems.length > 0;

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

  const isComplete =
    (hasMru || hasAtwood) &&
    (!hasMru || allMruFinished) &&
    (!hasAtwood || allAtwoodStopped);

  if (isComplete) {
    simState.isSimulationComplete = true;
  }

  // -------------------------------------------------------------------------
  // 3. COMPILE TELEMETRY
  // -------------------------------------------------------------------------
  const hasMruObj = elements.some((e) => e.type === 'physics_object' && e.physicsType === 'mru_cart');
  if (hasMruObj && simState.mruSystems.length > 0) {
    // Show currently active cart or primary cart
    const activeCart = simState.mruSystems.find((s) => !s.isFinished) || simState.mruSystems[0];
    const activeEl = elements.find((e) => e.id === activeCart.cartId);
    const dispV = activeEl?.properties?.displayVelocity !== undefined 
      ? activeEl.properties.displayVelocity 
      : activeCart.velocity;
    const vUnit = activeEl?.properties?.unit || 'm/s';
    const activeCount = simState.mruSystems.filter((s) => !s.isFinished).length;
    const cartLabel = simState.mruSystems.length > 1
      ? `${activeCount}/${simState.mruSystems.length} Móviles Activos`
      : (activeEl?.properties?.label || 'Móvil MRU');

    simState.telemetry = {
      type: 'mru',
      vel: activeCart.isFinished ? 0 : dispV,
      unit: vUnit,
      label: cartLabel,
      accel: 0.0,
      dist: activeCart.distanceMeters.toFixed(2),
      time: simState.elapsedTime.toFixed(1),
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
  // 3. SYNCHRONIZE ELEMENTS
  // -------------------------------------------------------------------------
  return elements.map((el) => {
    // Sync MRU Cart (smooth subpixel float coordinate)
    if (el.type === 'physics_object' && el.physicsType === 'mru_cart') {
      const mruSys = simState.mruSystems.find((s) => s.cartId === el.id);
      if (mruSys) {
        return {
          ...el,
          x: mruSys.currentX,
          properties: {
            ...el.properties,
            distance: mruSys.distanceMeters,
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
    sys.distanceMeters = 0.0;
    sys.isFinished = false;
  });

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
    simState.telemetry = {
      type: 'mru',
      vel: snapCart?.properties?.displayVelocity !== undefined ? snapCart.properties.displayVelocity : primaryCart.velocity,
      unit: snapCart?.properties?.unit || 'm/s',
      label: snapCart?.properties?.label || 'Móvil MRU',
      accel: 0.0,
      dist: '0.00',
      time: '0.0',
      isFinished: false,
      isSimulationComplete: false,
    };
  } else if (simState.atwoodSystems.length > 0) {
    const primary = simState.atwoodSystems[0];
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
        return {
          ...el,
          x: snap.x,
          y: snap.y,
          properties: {
            ...el.properties,
            ...snap.properties,
            triggered: false,
            recordedTime: null,
            distance: 0,
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

  // Check MRU systems consistency
  const currentCarts = currentPhysicsObjs.filter((o) => o.physicsType === 'mru_cart');
  if (simState.mruSystems.length !== currentCarts.length) return false;
  for (const sys of simState.mruSystems) {
    if (!currentCarts.some((o) => o.id === sys.cartId)) return false;
  }

  // Check if there are newly formed Atwood or MRU setups that are not in simState
  const hasPulleys = currentPhysicsObjs.some((o) => o.physicsType === 'pulley');
  if (hasPulleys && simState.atwoodSystems.length === 0 && currentConns.length >= 2) {
    return false;
  }

  if (currentCarts.length > 0 && simState.mruSystems.length === 0) {
    return false;
  }

  return true;
}


