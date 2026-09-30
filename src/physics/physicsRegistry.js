// =========================================================================
// PHYSICS REGISTRY & EXTENSIBLE OBJECT CATALOG
// Defines physics topics (MRU, Dinámica, etc.), blueprints, defaults & anchors
// =========================================================================

export const PHYSICS_TOPICS = [
  { id: 'mru', name: 'Cinemática (MRU)', active: true, icon: 'Gauge' },
  { id: 'mechanics', name: 'Dinámica (Atwood & Poleas)', active: true, icon: 'Weight' },
  { id: 'electricity', name: 'Electricidad', active: false, icon: 'Zap' },
  { id: 'waves', name: 'Ondas y Óptica', active: false, icon: 'Radio' },
  { id: 'thermodynamics', name: 'Termodinámica', active: false, icon: 'Flame' },
];

export const PHYSICS_OBJECT_DEFINITIONS = {
  // -----------------------------------------------------------------------
  // TEMA 1: CINEMÁTICA — MOVIMIENTO RECTILÍNEO UNIFORME (MRU)
  // -----------------------------------------------------------------------
  mru_cart: {
    type: 'mru_cart',
    name: 'Móvil MRU',
    category: 'mru',
    desc: 'Vehículo de laboratorio con velocidad constante (v = cte, a = 0) y vector velocidad visible.',
    defaultWidth: 105,
    defaultHeight: 52,
    defaultColor: '#0284c7',
    defaultProps: {
      velocity: 2.0, // m/s
      acceleration: 0.0, // a = 0 en MRU
      mass: 1.5, // kg
      distance: 0.0, // metros recorridos
      initialX: 0.0,
      showVector: true,
      label: 'Móvil MRU',
    },
    presets: [
      { label: 'Móvil Estándar (v = 2.0 m/s)', velocity: 2.0, color: '#0284c7', width: 105, height: 52 },
      { label: 'Móvil Rápido (v = 5.0 m/s)', velocity: 5.0, color: '#16a34a', width: 105, height: 52 },
      { label: 'Móvil Lento (v = 1.0 m/s)', velocity: 1.0, color: '#f59e0b', width: 105, height: 52 },
      { label: 'Móvil en Reversa (v = -2.5 m/s)', velocity: -2.5, color: '#dc2626', width: 105, height: 52 },
    ],
    anchors: [
      { id: 'front', label: 'Parachoques Delantero', relX: 1, relY: 0.6 },
      { id: 'back', label: 'Gancho Trasero', relX: 0, relY: 0.6 },
      { id: 'top', label: 'Soporte Sensor / Mástil', relX: 0.5, relY: 0 },
      { id: 'center', label: 'Centro de Masa', relX: 0.5, relY: 0.5 },
    ],
  },

  mru_track: {
    type: 'mru_track',
    name: 'Riel Graduado de 6 Metros',
    category: 'mru',
    desc: 'Pista de baja fricción con regla milimétrica graduada en metros para medir d = v·t.',
    defaultWidth: 620,
    defaultHeight: 38,
    defaultColor: '#e2e8f0',
    defaultProps: {
      lengthMeters: 6.0,
      isStatic: true,
      hasBumper: true,
    },
    presets: [
      { label: 'Riel de 6 Metros', width: 620, height: 38, lengthMeters: 6.0, color: '#e2e8f0' },
      { label: 'Riel Compacto (4 Metros)', width: 440, height: 38, lengthMeters: 4.0, color: '#e2e8f0' },
    ],
    anchors: [
      { id: 'start', label: 'Origen (0.0 m)', relX: 0.04, relY: 0.1 },
      { id: 'gate_a', label: 'Punto 1.0 m', relX: 0.20, relY: 0.1 },
      { id: 'mid', label: 'Punto Medio', relX: 0.50, relY: 0.1 },
      { id: 'gate_b', label: 'Punto 4.0 m', relX: 0.70, relY: 0.1 },
      { id: 'end', label: 'Extremo Final', relX: 0.96, relY: 0.1 },
    ],
  },

  mru_photogate: {
    type: 'mru_photogate',
    name: 'Fotopuerta con Cronómetro',
    category: 'mru',
    desc: 'Sensor óptico infrarrojo que registra el tiempo exacto en que cruza el móvil.',
    defaultWidth: 42,
    defaultHeight: 74,
    defaultColor: '#334155',
    defaultProps: {
      targetDistanceM: 2.0,
      triggered: false,
      recordedTime: null,
      gateName: 'Sensor A',
    },
    presets: [
      { label: 'Fotopuerta 1 (Sensor A)', gateName: 'Sensor A', targetDistanceM: 1.5, color: '#334155' },
      { label: 'Fotopuerta 2 (Sensor B)', gateName: 'Sensor B', targetDistanceM: 4.5, color: '#1e293b' },
    ],
    anchors: [
      { id: 'beam', label: 'Haz Infrarrojo', relX: 0.5, relY: 0.65 },
      { id: 'mount', label: 'Fijación al Riel', relX: 0.5, relY: 1.0 },
    ],
  },

  // -----------------------------------------------------------------------
  // TEMA 2: DINÁMICA & MÁQUINAS (ATWOOD, MASAS, POLEAS)
  // -----------------------------------------------------------------------
  mass: {
    type: 'mass',
    name: 'Masa / Bloque',
    category: 'mechanics',
    desc: 'Cuerpo rígido con inercia, masa en kg y respuesta a gravedad.',
    defaultWidth: 64,
    defaultHeight: 64,
    defaultColor: '#3b82f6',
    defaultProps: {
      mass: 100, // kg
      friction: 0.1,
      frictionAir: 0.005,
      restitution: 0.05,
      isStatic: false,
    },
    presets: [
      { label: '100 kg (Masa A)', mass: 100, color: '#3b82f6', width: 64, height: 64 },
      { label: '60 kg (Masa B)', mass: 60, color: '#ec4899', width: 52, height: 52 },
      { label: '25 kg (Cuerpo C)', mass: 25, color: '#10b981', width: 44, height: 44 },
    ],
    anchors: [
      { id: 'top', label: 'Enganche Superior', relX: 0.5, relY: 0 },
      { id: 'bottom', label: 'Enganche Inferior', relX: 0.5, relY: 1 },
      { id: 'center', label: 'Centro de Masa', relX: 0.5, relY: 0.5 },
    ],
  },

  pulley: {
    type: 'pulley',
    name: 'Polea Fija',
    category: 'mechanics',
    desc: 'Polea ideal sin fricción que redirige la tensión de cuerdas.',
    defaultWidth: 70,
    defaultHeight: 70,
    defaultColor: '#64748b',
    defaultProps: {
      radius: 35,
      isStatic: true,
      friction: 0.0,
      inertia: Infinity,
    },
    presets: [
      { label: 'Polea Fija (Superior)', width: 70, height: 70, color: '#475569', isStatic: true },
      { label: 'Polea Móvil (Ligera)', width: 56, height: 56, color: '#334155', isStatic: false },
    ],
    anchors: [
      { id: 'left_groove', label: 'Garganta Izquierda', relX: 0, relY: 0.5 },
      { id: 'right_groove', label: 'Garganta Derecha', relX: 1, relY: 0.5 },
      { id: 'top_mount', label: 'Soporte Techo', relX: 0.5, relY: -0.2 },
      { id: 'axle', label: 'Eje Central', relX: 0.5, relY: 0.5 },
    ],
  },
};

/**
 * Creates a new physical element instance for the whiteboard state
 */
export function createPhysicsElement(physicsType, worldX, worldY, options = {}) {
  const definition = PHYSICS_OBJECT_DEFINITIONS[physicsType];
  if (!definition) {
    throw new Error(`Tipo de objeto físico desconocido: ${physicsType}`);
  }

  const width = options.width || definition.defaultWidth;
  const height = options.height || definition.defaultHeight;
  const color = options.color || definition.defaultColor;
  const mass = options.mass !== undefined ? options.mass : definition.defaultProps.mass;
  const isStatic = options.isStatic !== undefined ? options.isStatic : definition.defaultProps.isStatic;

  const id = `phys-${physicsType}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

  return {
    id,
    type: 'physics_object',
    physicsType,
    name: options.label || `${definition.name}${mass !== undefined ? ` (${mass} kg)` : ''}`,
    x: Math.round(worldX - width / 2),
    y: Math.round(worldY - height / 2),
    width,
    height,
    color,
    properties: {
      ...definition.defaultProps,
      mass,
      isStatic,
      ...options,
      ...options.properties,
    },
    anchors: definition.anchors.map((a) => ({ ...a })),
  };
}

/**
 * Creates a physical connection (rope, rod, etc.) between two object anchors
 */
export function createPhysicsConnection(fromObjId, fromAnchorId, toObjId, toAnchorId, options = {}) {
  return {
    id: `conn-rope-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    type: 'physics_connection',
    connectionType: options.connectionType || 'rope',
    from: {
      elementId: fromObjId,
      anchorId: fromAnchorId,
    },
    to: {
      elementId: toObjId,
      anchorId: toAnchorId,
    },
    color: options.color || '#334155',
    lineWidth: options.lineWidth || 2.5,
    properties: {
      stiffness: options.stiffness || 0.95,
      damping: options.damping || 0.1,
      length: options.length || null,
      ...options.properties,
    },
  };
}

/**
 * Computes world coordinates for a given anchor of a physical object
 */
export function getAnchorAbsolutePosition(element, anchorId) {
  if (!element) return null;
  const w = element.width || 60;
  const h = element.height || 60;
  const x = element.x || 0;
  const y = element.y || 0;

  const anchor = element.anchors?.find((a) => a.id === anchorId);
  if (anchor) {
    return {
      x: x + anchor.relX * w,
      y: y + anchor.relY * h,
    };
  }

  // Fallback to geometric center
  return { x: x + w / 2, y: y + h / 2 };
}

/**
 * Pre-configured Atwood Machine assembly containing:
 * - 1 Fixed Pulley
 * - 1 Mass A (100 kg)
 * - 1 Mass B (60 kg)
 * - 2 Connecting physical ropes passing over the pulley
 */
export function createAtwoodMachineAssembly(cx, cy) {
  const pulley = createPhysicsElement('pulley', cx, cy, {
    label: 'Polea Principal',
    width: 70,
    height: 70,
  });

  // Pulley width is 70, left groove is at cx, right groove is at cx + 70.
  // Mass A (100 kg) starts near top so it has ample travel to accelerate downward.
  const massA = createPhysicsElement('mass', cx - 32, cy + 105, {
    label: 'Masa A (100 kg)',
    mass: 100,
    color: '#3b82f6',
    width: 64,
    height: 64,
  });

  // Mass B (60 kg) starts lower down so it can be pulled upward smoothly.
  const massB = createPhysicsElement('mass', cx + 70 - 26, cy + 315, {
    label: 'Masa B (60 kg)',
    mass: 60,
    color: '#ec4899',
    width: 52,
    height: 52,
  });

  const ropeLeft = createPhysicsConnection(massA.id, 'top', pulley.id, 'left_groove');
  const ropeRight = createPhysicsConnection(pulley.id, 'right_groove', massB.id, 'top');

  return [pulley, massA, massB, ropeLeft, ropeRight];
}

/**
 * Pre-configured Complete MRU Laboratory Assembly:
 * - 1 Precision graduated track (6.0 meters)
 * - 1 MRU laboratory cart with constant speed v = 2.0 m/s & emerald velocity vector arrow
 * - 2 Photogate sensors at x = 1.5 m and x = 4.5 m
 */
export function createMruLabAssembly(cx, cy) {
  const trackW = 620;
  const trackH = 38;

  // Track centered at (cx, cy + 30)
  const track = createPhysicsElement('mru_track', cx, cy + 30, {
    label: 'Riel Graduado (6.0 m)',
    width: trackW,
    height: trackH,
    lengthMeters: 6.0,
  });

  // Cart placed near origin on top of track
  const cartW = 105;
  const cartH = 52;
  const cart = createPhysicsElement('mru_cart', cx - trackW / 2 + 70, cy - 8, {
    label: 'Móvil MRU (v = 2.0 m/s)',
    velocity: 2.0,
    color: '#0284c7',
    width: cartW,
    height: cartH,
    showVector: true,
  });

  // Photogate Sensor A at x ≈ 1.5 m
  const gateA = createPhysicsElement('mru_photogate', cx - trackW / 2 + 190, cy - 18, {
    label: 'Sensor A (1.5 m)',
    gateName: 'Sensor A',
    targetDistanceM: 1.5,
  });

  // Photogate Sensor B at x ≈ 4.5 m
  const gateB = createPhysicsElement('mru_photogate', cx - trackW / 2 + 460, cy - 18, {
    label: 'Sensor B (4.5 m)',
    gateName: 'Sensor B',
    targetDistanceM: 4.5,
  });

  return [track, cart, gateA, gateB];
}
