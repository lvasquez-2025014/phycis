// =========================================================================
// PHYSICS REGISTRY & EXTENSIBLE OBJECT CATALOG
// Defines physics topics (MRU, Dinámica, etc.), blueprints, defaults & anchors
// =========================================================================

export const PHYSICS_TOPICS = [
  { id: 'mru', name: 'Cinemática (MRU)', active: true, icon: 'Gauge' },
  { id: 'mruv', name: 'Cinemática (MRUV)', active: true, icon: 'TrendingUp' },
  { id: 'freefall', name: 'Caída Libre (HT03)', active: true, icon: 'ArrowDownCircle' },
  { id: 'tiro_vertical', name: 'Tiro Vertical (HT04)', active: true, icon: 'ArrowUpCircle' },
  { id: 'lanzamiento_horizontal', name: 'Lanzamiento Horizontal (HT01)', active: true, icon: 'Navigation' },
  { id: 'movimiento_proyectiles', name: 'Mov. Proyectiles (HT02)', active: true, icon: 'Target' },
  { id: 'mcu', name: 'Mov. Circular Uniforme (MCU)', active: true, icon: 'RotateCw' },
  { id: 'mcuv', name: 'Mov. Circular Acelerado (MCUV)', active: true, icon: 'RotateCw' },
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
  // TEMA 1.5: CINEMÁTICA — MOVIMIENTO RECTILÍNEO UNIFORMEMENTE VARIADO (MRUV)
  // -----------------------------------------------------------------------
  mruv_cart: {
    type: 'mruv_cart',
    name: 'Móvil MRUV (Acelerado)',
    category: 'mruv',
    desc: 'Vehículo de laboratorio con aceleración constante (a = cte), velocímetro digital en tiempo real y vectores de velocidad v⃗ y aceleración a⃗.',
    defaultWidth: 108,
    defaultHeight: 52,
    defaultColor: '#0ea5e9',
    defaultProps: {
      velocity: 0.0, // m/s (velocidad inicial v0)
      initialVelocity: 0.0,
      acceleration: 2.0, // m/s²
      mass: 1.5, // kg
      distance: 0.0, // metros recorridos
      initialX: 0.0,
      showVector: true,
      showAccelVector: true,
      label: 'Móvil MRUV',
      unit: 'm/s',
      accelUnit: 'm/s²',
    },
    presets: [
      {
        label: 'Aceleración Estándar (v₀ = 0, a = +2.0 m/s²)',
        velocity: 0.0,
        initialVelocity: 0.0,
        acceleration: 2.0,
        color: '#0284c7',
        width: 108,
        height: 52,
      },
      {
        label: 'Aceleración Intensa (v₀ = 1.0 m/s, a = +5.0 m/s²)',
        velocity: 1.0,
        initialVelocity: 1.0,
        acceleration: 5.0,
        color: '#16a34a',
        width: 108,
        height: 52,
      },
      {
        label: 'Frenado / Desaceleración (v₀ = 6.0 m/s, a = -3.0 m/s²)',
        velocity: 6.0,
        initialVelocity: 6.0,
        acceleration: -3.0,
        color: '#dc2626',
        width: 108,
        height: 52,
      },
      {
        label: 'Guepardo HT02 (v₀ = 0, a = +7.41 m/s²)',
        velocity: 0.0,
        initialVelocity: 0.0,
        acceleration: 7.41,
        color: '#d97706',
        width: 108,
        height: 52,
      },
      {
        label: 'Frenado Autopista HT02 (v₀ = 30 m/s, a = -5.0 m/s²)',
        velocity: 30.0,
        initialVelocity: 30.0,
        acceleration: -5.0,
        color: '#7c3aed',
        width: 108,
        height: 52,
      },
    ],
    anchors: [
      { id: 'front', label: 'Parachoques Delantero', relX: 1, relY: 0.6 },
      { id: 'back', label: 'Gancho Trasero', relX: 0, relY: 0.6 },
      { id: 'top', label: 'Soporte Sensor / Mástil', relX: 0.5, relY: 0 },
      { id: 'center', label: 'Centro de Masa', relX: 0.5, relY: 0.5 },
    ],
  },

  // -----------------------------------------------------------------------
  // TEMA 1.6: CAÍDA LIBRE (HT03) — MOVIMIENTO VERTICAL BAJO GRAVEDAD
  // -----------------------------------------------------------------------
  freefall_body: {
    type: 'freefall_body',
    name: 'Cuerpo en Caída Libre',
    category: 'freefall',
    desc: 'Cuerpo esférico de laboratorio sometido a aceleración de gravedad (g = 9.8 m/s²) con velocímetro digital en tiempo real y vectores v⃗ y g⃗.',
    defaultWidth: 46,
    defaultHeight: 46,
    defaultColor: '#ef4444',
    defaultProps: {
      velocity: 0.0, // m/s (velocidad inicial hacia abajo)
      initialVelocity: 0.0,
      gravity: 9.8, // m/s²
      mass: 1.0, // kg
      distanceFallen: 0.0, // m
      releaseHeight: 50.0, // m
      showVector: true,
      showGravityVector: true,
      label: 'Esfera en Caída Libre',
      unit: 'm/s',
    },
    presets: [
      {
        label: 'Caída desde Reposo (v₀ = 0, h = 50 m)',
        velocity: 0.0,
        initialVelocity: 0.0,
        gravity: 9.8,
        releaseHeight: 50.0,
        color: '#ef4444',
      },
      {
        label: 'Lanzamiento Hacia Abajo (v₀ = 6.0 m/s - HT03 P2)',
        velocity: 6.0,
        initialVelocity: 6.0,
        gravity: 9.8,
        releaseHeight: 40.0,
        color: '#f59e0b',
      },
      {
        label: 'Piedra a 25 m (v₀ = 8.0 m/s - HT03 P8)',
        velocity: 8.0,
        initialVelocity: 8.0,
        gravity: 9.8,
        releaseHeight: 25.0,
        color: '#8b5cf6',
      },
      {
        label: 'Maceta de Edificio (h = 18.5 m - HT03 P4)',
        velocity: 0.0,
        initialVelocity: 0.0,
        gravity: 9.8,
        releaseHeight: 18.5,
        color: '#10b981',
      },
      {
        label: 'Canica desde Puente (t = 5 s - HT03 P7)',
        velocity: 0.0,
        initialVelocity: 0.0,
        gravity: 9.8,
        releaseHeight: 122.5,
        color: '#0ea5e9',
      },
    ],
    anchors: [
      { id: 'top', label: 'Gancho Superior', relX: 0.5, relY: 0 },
      { id: 'center', label: 'Centro de Masa', relX: 0.5, relY: 0.5 },
      { id: 'bottom', label: 'Punto de Impacto', relX: 0.5, relY: 1.0 },
    ],
  },

  freefall_tower: {
    type: 'freefall_tower',
    name: 'Torre / Regla Vertical Graduada',
    category: 'freefall',
    desc: 'Estructura vertical milimétrica con marcas de altura en metros, plataforma superior de lanzamiento y base de impacto.',
    defaultWidth: 44,
    defaultHeight: 460,
    defaultColor: '#64748b',
    defaultProps: {
      heightMeters: 50.0,
      isStatic: true,
      label: 'Torre de Caída Libre',
    },
    presets: [
      { label: 'Torre Estándar (50 Metros)', heightMeters: 50.0, width: 44, height: 460, color: '#64748b' },
      { label: 'Torre Alta (120 Metros - HT03)', heightMeters: 120.0, width: 44, height: 580, color: '#475569' },
      { label: 'Torre Corta (25 Metros)', heightMeters: 25.0, width: 44, height: 340, color: '#64748b' },
    ],
    anchors: [
      { id: 'top_ledge', label: 'Plataforma Superior', relX: 0.5, relY: 0.04 },
      { id: 'mid', label: 'Punto Medio', relX: 0.5, relY: 0.5 },
      { id: 'base', label: 'Suelo de Impacto', relX: 0.5, relY: 0.96 },
    ],
  },

  // -----------------------------------------------------------------------
  // TEMA 1.7: TIRO VERTICAL (HT04) — LANZAMIENTO HACIA ARRIBA Y GRAVEDAD
  // -----------------------------------------------------------------------
  vertical_projectile: {
    type: 'vertical_projectile',
    name: 'Proyectil Tiro Vertical',
    category: 'tiro_vertical',
    desc: 'Cuerpo lanzado verticalmente hacia arriba con velocidad inicial (v₀ > 0), desaceleración por gravedad (a = -g) hasta la cúspide (v = 0) y posterior caída simétrica.',
    defaultWidth: 46,
    defaultHeight: 46,
    defaultColor: '#8b5cf6',
    defaultProps: {
      velocity: 20.0, // m/s inicial hacia arriba
      initialVelocity: 20.0,
      gravity: 9.80, // m/s²
      mass: 1.0, // kg
      heightReached: 0.0, // m
      showVector: true,
      showGravityVector: true,
      label: 'Pelota Tiro Vertical',
      unit: 'm/s',
    },
    presets: [
      {
        label: 'Pelota HT04 P1 (v₀ = 20 m/s)',
        velocity: 20.0,
        initialVelocity: 20.0,
        gravity: 9.80,
        color: '#8b5cf6',
      },
      {
        label: 'Proyectil HT04 P2 (v₀ = 24.5 m/s, T = 5 s)',
        velocity: 24.5,
        initialVelocity: 24.5,
        gravity: 9.80,
        color: '#ec4899',
      },
      {
        label: 'Béisbol Tierra HT04 P10 (v₀ = 30 m/s)',
        velocity: 30.0,
        initialVelocity: 30.0,
        gravity: 9.80,
        color: '#f59e0b',
      },
      {
        label: 'Salto de Pulga HT04 P4 (v₀ = 2.94 m/s)',
        velocity: 2.94,
        initialVelocity: 2.94,
        gravity: 9.80,
        color: '#10b981',
      },
      {
        label: 'Martillo al Techo HT04 P3 (v₀ = 17.71 m/s)',
        velocity: 17.71,
        initialVelocity: 17.71,
        gravity: 9.80,
        color: '#0284c7',
      },
      {
        label: 'Lanzamiento en la Luna HT04 P8 (v₀ = 3.2 m/s, g = 1.6 m/s²)',
        velocity: 3.2,
        initialVelocity: 3.2,
        gravity: 1.60,
        color: '#64748b',
      },
      {
        label: 'Béisbol Lunar HT04 P9 (v₀ = 35 m/s, g = 1.6 m/s²)',
        velocity: 35.0,
        initialVelocity: 35.0,
        gravity: 1.60,
        color: '#06b6d4',
      },
    ],
    anchors: [
      { id: 'top', label: 'Cúspide de Medición', relX: 0.5, relY: 0 },
      { id: 'center', label: 'Centro de Masa', relX: 0.5, relY: 0.5 },
      { id: 'bottom', label: 'Base de Lanzamiento', relX: 0.5, relY: 1.0 },
    ],
  },

  // -----------------------------------------------------------------------
  // TEMA 1.8: LANZAMIENTO HORIZONTAL (HT01) — MOVIMIENTO EN DOS DIMENSIONES
  // -----------------------------------------------------------------------
  horizontal_projectile: {
    type: 'horizontal_projectile',
    name: 'Proyectil Lanzamiento Horizontal',
    category: 'lanzamiento_horizontal',
    desc: 'Cuerpo lanzado horizontalmente con velocidad constante en X (MRU: vx = cte) y aceleración constante en Y (Caída Libre: vy = g·t).',
    defaultWidth: 44,
    defaultHeight: 44,
    defaultColor: '#06b6d4',
    defaultProps: {
      velocity: 20.0, // m/s inicial horizontal (vx)
      initialVelocity: 20.0,
      heightMeters: 20.0, // m altura de lanzamiento
      gravity: 9.80, // m/s²
      mass: 1.0, // kg
      showVector: true, // muestra vectores vx y vy
      showResultantVector: true, // muestra vector velocidad resultante v
      showTrajectory: true, // dibuja la trayectoria parabólica
      label: 'Proyectil Horizontal',
      unit: 'm/s',
    },
    presets: [
      {
        label: 'Cuerpo a 150m (HT01 P1: v₀ = 40 m/s, h = 150 m)',
        velocity: 40.0,
        initialVelocity: 40.0,
        heightMeters: 150.0,
        gravity: 9.80,
        color: '#06b6d4',
      },
      {
        label: 'Surtidor de Fuente (HT01 P2: v₀ = 2.56 m/s, h = 3 m)',
        velocity: 2.56,
        initialVelocity: 2.56,
        heightMeters: 3.0,
        gravity: 9.80,
        color: '#3b82f6',
      },
      {
        label: 'Tiro desde 10m (HT01 P3a: v₀ = 4.0 m/s, h = 10 m)',
        velocity: 4.0,
        initialVelocity: 4.0,
        heightMeters: 10.0,
        gravity: 9.80,
        color: '#8b5cf6',
      },
      {
        label: 'Tiro desde 5m (HT01 P3b: v₀ = 5.66 m/s, h = 5 m)',
        velocity: 5.66,
        initialVelocity: 5.66,
        heightMeters: 5.0,
        gravity: 9.80,
        color: '#ec4899',
      },
      {
        label: 'Bala Horizontal (HT01 P4: v₀ = 120 m/s, h = 78.4 m)',
        velocity: 120.0,
        initialVelocity: 120.0,
        heightMeters: 78.4,
        gravity: 9.80,
        color: '#ef4444',
      },
      {
        label: 'Pelota de Golf (HT01 P6: v₀ = 41.67 m/s, h = 7.06 m)',
        velocity: 41.67,
        initialVelocity: 41.67,
        heightMeters: 7.06,
        gravity: 9.80,
        color: '#10b981',
      },
      {
        label: 'Lanzador Béisbol (HT01 P7: v₀ = 9.0 m/s, h = 11.03 m)',
        velocity: 9.0,
        initialVelocity: 9.0,
        heightMeters: 11.03,
        gravity: 9.80,
        color: '#f59e0b',
      },
      {
        label: 'Resorte en Edificio (HT01 P8: v₀ = 7.0 m/s, h = 15 m)',
        velocity: 7.0,
        initialVelocity: 7.0,
        heightMeters: 15.0,
        gravity: 9.80,
        color: '#6366f1',
      },
      {
        label: 'Acantilado al Río (HT01 P10: v₀ = 990 m/s, h = 20 m)',
        velocity: 990.0,
        initialVelocity: 990.0,
        heightMeters: 20.0,
        gravity: 9.80,
        color: '#0284c7',
      },
    ],
    anchors: [
      { id: 'origin', label: 'Boca del Lanzador', relX: 0, relY: 0.5 },
      { id: 'center', label: 'Centro de Masa', relX: 0.5, relY: 0.5 },
      { id: 'impact', label: 'Punto de Impacto', relX: 1.0, relY: 1.0 },
    ],
  },

  cliff_platform: {
    type: 'cliff_platform',
    name: 'Acantilado / Mesa de Lanzamiento',
    category: 'lanzamiento_horizontal',
    desc: 'Estructura elevada para disparo horizontal con escala métrica de altura vertical h y zona de impacto horizontal.',
    defaultWidth: 160,
    defaultHeight: 280,
    defaultColor: '#475569',
    defaultProps: {
      heightMeters: 20.0,
      rangeMeters: 40.0,
      isStatic: true,
      label: 'Acantilado h = 20m',
    },
    presets: [
      { label: 'Acantilado 20 Metros (HT01 P10)', heightMeters: 20.0, width: 160, height: 280, color: '#475569' },
      { label: 'Edificio 15 Metros (HT01 P8)', heightMeters: 15.0, width: 150, height: 240, color: '#334155' },
      { label: 'Montículo 10 Metros (HT01 P3)', heightMeters: 10.0, width: 140, height: 180, color: '#64748b' },
      { label: 'Mesa de Laboratorio 3m (HT01 P2)', heightMeters: 3.0, width: 120, height: 140, color: '#64748b' },
      { label: 'Acantilado Alto 150m (HT01 P1)', heightMeters: 150.0, width: 180, height: 380, color: '#1e293b' },
    ],
    anchors: [
      { id: 'launch_edge', label: 'Borde de Lanzamiento', relX: 1.0, relY: 0.08 },
      { id: 'ground_base', label: 'Base del Acantilado', relX: 1.0, relY: 0.95 },
      { id: 'center', label: 'Centro Estructura', relX: 0.5, relY: 0.5 },
    ],
  },

  // -----------------------------------------------------------------------
  // TEMA: MOVIMIENTO DE PROYECTILES (HT02 KINAL - ÁNGULO OBLICUO θ)
  // -----------------------------------------------------------------------
  cannon_launcher: {
    type: 'cannon_launcher',
    name: 'Cañón Balístico Graduado',
    category: 'movimiento_proyectiles',
    desc: 'Lanzador balístico de laboratorio con goniómetro de ángulo regulable (-85° a +85°), base de soporte y lectura digital.',
    defaultWidth: 90,
    defaultHeight: 70,
    defaultColor: '#7c3aed',
    defaultProps: {
      velocity: 20.0,
      initialVelocity: 20.0,
      angleDeg: 37.0,
      initialAngleDeg: 37.0,
      launchHeight: 0.0,
      gravity: 9.80,
      isStatic: true,
      label: 'Cañón θ = 37°',
    },
    presets: [
      { label: 'Béisbol 30° (HT02 P1: v₀ = 100 m/s)', velocity: 100.0, angleDeg: 30.0, color: '#2563eb' },
      { label: 'Fútbol 37° (HT02 P2: v₀ = 20 m/s)', velocity: 20.0, angleDeg: 37.0, color: '#7c3aed' },
      { label: 'Cañón 50° (HT02 P3: v₀ = 50 m/s)', velocity: 50.0, angleDeg: 50.0, color: '#d97706' },
      { label: 'Edificio Hacia Abajo -30° (HT02 P4: v₀ = 40 m/s)', velocity: 40.0, angleDeg: -30.0, color: '#dc2626' },
      { label: 'Manguera 40° (HT02 P5: v₀ = 20 m/s)', velocity: 20.0, angleDeg: 40.0, color: '#06b6d4' },
      { label: 'Golf a Green 65° (HT02 P7: v₀ = 40 m/s)', velocity: 40.0, angleDeg: 65.0, color: '#16a34a' },
      { label: 'Ventana Hacia Abajo -20° (HT02 P9: v₀ = 10 m/s)', velocity: 10.0, angleDeg: -20.0, color: '#e11d48' },
      { label: 'Saltamontes 50° (HT02 P10: v₀ = 1.5 m/s)', velocity: 1.5, angleDeg: 50.0, color: '#84cc16' },
    ],
    anchors: [
      { id: 'muzzle', label: 'Boca del Cañón', relX: 0.9, relY: 0.3 },
      { id: 'pivot', label: 'Eje de Giro', relX: 0.3, relY: 0.7 },
      { id: 'base', label: 'Base del Soporte', relX: 0.3, relY: 1.0 },
    ],
  },

  oblique_projectile: {
    type: 'oblique_projectile',
    name: 'Proyectil Balístico Parabólico',
    category: 'movimiento_proyectiles',
    desc: 'Cuerpo proyectil con velocidad oblicua v₀ y ángulo θ. Simula vx = cte y vy(t) = v₀y - gt con estela parabólica y descomposición vectorial.',
    defaultWidth: 38,
    defaultHeight: 38,
    defaultColor: '#a855f7',
    defaultProps: {
      velocity: 20.0,
      initialVelocity: 20.0,
      angleDeg: 37.0,
      initialAngleDeg: 37.0,
      gravity: 9.80,
      launchHeight: 0.0,
      mass: 0.5,
      showVector: true,
      showResultantVector: true,
      showTrajectory: true,
      isStatic: false,
      label: 'Proyectil θ = 37°',
    },
    presets: [
      { label: 'Béisbol P1 (100 m/s a 30°)', velocity: 100.0, angleDeg: 30.0, color: '#2563eb' },
      { label: 'Fútbol P2 (20 m/s a 37°)', velocity: 20.0, angleDeg: 37.0, color: '#a855f7' },
      { label: 'Proyectil P3 (50 m/s a 50°)', velocity: 50.0, angleDeg: 50.0, color: '#d97706' },
      { label: 'Descendente P4 (40 m/s a -30°)', velocity: 40.0, angleDeg: -30.0, color: '#dc2626' },
      { label: 'Manguera P5 (20 m/s a 40°)', velocity: 20.0, angleDeg: 40.0, color: '#06b6d4' },
      { label: 'Béisbol 3s P6 (30 m/s a 30°)', velocity: 30.0, angleDeg: 30.0, color: '#3b82f6' },
      { label: 'Golf P7 (40 m/s a 65°)', velocity: 40.0, angleDeg: 65.0, color: '#16a34a' },
      { label: 'Entre Edificios P8 (20 m/s a 40°)', velocity: 20.0, angleDeg: 40.0, color: '#6366f1' },
      { label: 'Ventana P9 (10 m/s a -20°)', velocity: 10.0, angleDeg: -20.0, color: '#e11d48' },
      { label: 'Saltamontes P10 (1.5 m/s a 50°)', velocity: 1.5, angleDeg: 50.0, color: '#84cc16' },
    ],
    anchors: [
      { id: 'center', label: 'Centro de Masa', relX: 0.5, relY: 0.5 },
      { id: 'top', label: 'Ápice Superior', relX: 0.5, relY: 0.0 },
      { id: 'bottom', label: 'Punto de Apoyo', relX: 0.5, relY: 1.0 },
    ],
  },

  target_wall: {
    type: 'target_wall',
    name: 'Pared / Obstáculo de Medición',
    category: 'movimiento_proyectiles',
    desc: 'Barrera vertical milimétrica para comprobar la altura de impacto del proyectil a cierta distancia.',
    defaultWidth: 26,
    defaultHeight: 220,
    defaultColor: '#475569',
    defaultProps: {
      heightMeters: 15.0,
      distanceMeters: 8.0,
      isStatic: true,
      label: 'Pared Objetivo (15 m)',
    },
    presets: [
      { label: 'Pared Manguera (HT02 P5: d = 8m, h = 10m)', heightMeters: 10.0, distanceMeters: 8.0, height: 180, color: '#64748b' },
      { label: 'Green Elevado (HT02 P7: h = +10m)', heightMeters: 10.0, distanceMeters: 120.0, height: 160, color: '#16a34a' },
      { label: 'Edificio Opuesto (HT02 P8: d = 50m)', heightMeters: 30.0, distanceMeters: 50.0, height: 260, color: '#334155' },
    ],
    anchors: [
      { id: 'top', label: 'Extremo Superior', relX: 0.5, relY: 0.0 },
      { id: 'impact', label: 'Zona Central', relX: 0.5, relY: 0.5 },
      { id: 'base', label: 'Pie de la Pared', relX: 0.5, relY: 1.0 },
    ],
  },

  mcu_turntable: {
    type: 'mcu_turntable',
    name: 'Plataforma Giratoria / Disco MCU',
    category: 'movimiento_circular',
    desc: 'Rotor, disco o plataforma giratoria con eje central graduado para experimentos de Movimiento Circular Uniforme (MCU).',
    defaultWidth: 220,
    defaultHeight: 220,
    defaultColor: '#0284c7',
    defaultProps: {
      radiusMeters: 1.0,
      radiusPx: 110,
      omega: 3.0,
      initialOmega: 3.0,
      rpm: 28.65,
      direction: 'ccw',
      showGrid: true,
      showVectors: true,
      isStatic: true,
      label: 'Plataforma Giratoria MCU',
    },
    presets: [
      { label: 'Rueda Bicicleta (HT03 P1: ω = 18 rad/s, r = 0.35m)', radiusMeters: 0.35, omega: 18.0, rpm: 171.89, color: '#2563eb' },
      { label: 'Satélite LEO (HT03 P2: T = 100min, r = 7.2×10⁶m)', radiusMeters: 7.2e6, omega: 0.001047, rpm: 0.01, color: '#0284c7' },
      { label: 'Juego Mecánico (HT03 P3: T = 12s, r = 8m)', radiusMeters: 8.0, omega: 0.5236, rpm: 5.0, color: '#7c3aed' },
      { label: 'Lavadora 1200 RPM (HT03 P4: r = 0.25m)', radiusMeters: 0.25, omega: 125.66, rpm: 1200.0, color: '#06b6d4' },
      { label: 'Órbita Lunar (HT03 P5: T = 28 días)', radiusMeters: 3.84e8, omega: 2.6e-6, rpm: 0.000025, color: '#64748b' },
      { label: 'Plataforma Disco (HT03 P6: ω = 4 rad/s, r = 1.2m)', radiusMeters: 1.2, omega: 4.0, rpm: 38.2, color: '#10b981' },
      { label: 'Rueda A Alta Frecuencia (HT03 P8: ω = 60 rad/s, r = 0.2m)', radiusMeters: 0.2, omega: 60.0, rpm: 572.96, color: '#f59e0b' },
      { label: 'Centrífuga Clínica (HT03 P9: 3200 RPM, r = 0.18m)', radiusMeters: 0.18, omega: 335.10, rpm: 3200.0, color: '#ef4444' },
    ],
    anchors: [
      { id: 'center', label: 'Eje de Giro', relX: 0.5, relY: 0.5 },
      { id: 'rim_0', label: 'Borde 0° (Este)', relX: 1.0, relY: 0.5 },
      { id: 'rim_90', label: 'Borde 90° (Norte)', relX: 0.5, relY: 0.0 },
      { id: 'rim_180', label: 'Borde 180° (Oeste)', relX: 0.0, relY: 0.5 },
      { id: 'rim_270', label: 'Borde 270° (Sur)', relX: 0.5, relY: 1.0 },
    ],
  },

  mcu_particle: {
    type: 'mcu_particle',
    name: 'Partícula / Masa Orbitante MCU',
    category: 'movimiento_circular',
    desc: 'Cuerpo en trayectoria circular uniforme con vectores dinámicos de velocidad tangencial (v⃗_t) y aceleración centrípeta (a⃗_c).',
    defaultWidth: 28,
    defaultHeight: 28,
    defaultColor: '#3b82f6',
    defaultProps: {
      radiusMeters: 1.0,
      radiusPx: 110,
      omega: 3.0,
      initialOmega: 3.0,
      angleRad: 0.0,
      mass: 0.5,
      showTangentialVector: true,
      showCentripetalVector: true,
      showOrbit: true,
      showRadiusLine: true,
      isStatic: false,
      label: 'Masa Orbitante MCU',
    },
    presets: [
      { label: 'Punto en Borde (HT03 P1: v_t = 6.3 m/s, r = 0.35m)', radiusMeters: 0.35, omega: 18.0, color: '#2563eb' },
      { label: 'Satélite (HT03 P2: v = 7.54 km/s, ac = 7.9 m/s²)', radiusMeters: 7.2e6, omega: 0.001047, color: '#0284c7' },
      { label: 'Cabina Mecánica (HT03 P3: v = 4.19 m/s, ac = 2.19 m/s²)', radiusMeters: 8.0, omega: 0.5236, color: '#7c3aed' },
      { label: 'Prenda en Tambor (HT03 P4: v = 31.4 m/s, ac = 3948 m/s²)', radiusMeters: 0.25, omega: 125.66, color: '#06b6d4' },
      { label: 'Cuerpo Lunar (HT03 P5: v = 997 m/s)', radiusMeters: 3.84e8, omega: 2.6e-6, color: '#64748b' },
      { label: 'Masa Interior (HT03 P6: r = 0.4m, v = 1.6 m/s)', radiusMeters: 0.4, omega: 4.0, color: '#10b981' },
      { label: 'Masa Exterior (HT03 P6: r = 1.2m, v = 4.8 m/s)', radiusMeters: 1.2, omega: 4.0, color: '#16a34a' },
      { label: 'Muestra Centrífuga (HT03 P9: v = 60.3 m/s, ac = 20213 m/s²)', radiusMeters: 0.18, omega: 335.10, color: '#ef4444' },
    ],
    anchors: [
      { id: 'center', label: 'Centro de Masa', relX: 0.5, relY: 0.5 },
    ],
  },

  // -----------------------------------------------------------------------
  // TEMA: MOVIMIENTO CIRCULAR UNIFORMEMENTE VARIADO / ACELERADO (MCUV / MCUA)
  // Unidad 2 - Física 5to Diversificado - Colegio Kinal
  // -----------------------------------------------------------------------
  mcuv_turntable: {
    type: 'mcuv_turntable',
    name: 'Rotor Acelerado / Disco MCUV',
    category: 'mcuv',
    desc: 'Plataforma o disco con aceleración angular α constante, velocidad angular inicial ω₀ y tacómetro digital integrado.',
    defaultWidth: 220,
    defaultHeight: 220,
    defaultColor: '#0891b2',
    defaultProps: {
      radiusMeters: 1.0,
      radiusPx: 110,
      omega0: 0.0,
      omega: 0.0,
      initialOmega: 0.0,
      alpha: 2.0, // rad/s²
      initialAlpha: 2.0,
      rpm: 0.0,
      direction: 'ccw',
      showGrid: true,
      showVectors: true,
      isStatic: true,
      label: 'Rotor Acelerado MCUV',
    },
    presets: [
      { label: 'P11: Turbina Centrífuga (ω₀=0, α=3.5 rad/s², r=0.4m)', radiusMeters: 0.4, omega0: 0.0, omega: 0.0, initialOmega: 0.0, alpha: 3.5, initialAlpha: 3.5, color: '#0284c7' },
      { label: 'P12: Volante Frenado (ω₀=15 rad/s, α=-2.5 rad/s², r=0.6m)', radiusMeters: 0.6, omega0: 15.0, omega: 15.0, initialOmega: 15.0, alpha: -2.5, initialAlpha: -2.5, color: '#dc2626' },
      { label: 'P13: Ventilador Eléctrico (ω₀=0, α=4 rad/s², r=0.3m)', radiusMeters: 0.3, omega0: 0.0, omega: 0.0, initialOmega: 0.0, alpha: 4.0, initialAlpha: 4.0, color: '#16a34a' },
      { label: 'P14: Centrífuga Médica (ω₀=50 rad/s, α=-5 rad/s², r=0.15m)', radiusMeters: 0.15, omega0: 50.0, omega: 50.0, initialOmega: 50.0, alpha: -5.0, initialAlpha: -5.0, color: '#d97706' },
      { label: 'P15: Engranaje Motor (ω₀=2 rad/s, α=1.8 rad/s², r=0.25m)', radiusMeters: 0.25, omega0: 2.0, omega: 2.0, initialOmega: 2.0, alpha: 1.8, initialAlpha: 1.8, color: '#7c3aed' },
      { label: 'P18: Polea Transmisión (ω₀=0, α=5 rad/s², r=0.2m)', radiusMeters: 0.2, omega0: 0.0, omega: 0.0, initialOmega: 0.0, alpha: 5.0, initialAlpha: 5.0, color: '#0d9488' },
      { label: 'P23: Generador Eólico (ω₀=30 rad/s, α=-1.5 rad/s², r=1.5m)', radiusMeters: 1.5, omega0: 30.0, omega: 30.0, initialOmega: 30.0, alpha: -1.5, initialAlpha: -1.5, color: '#475569' },
      { label: 'P25: Tambor Lavado (ω₀=0, α=8 rad/s², r=0.28m)', radiusMeters: 0.28, omega0: 0.0, omega: 0.0, initialOmega: 0.0, alpha: 8.0, initialAlpha: 8.0, color: '#2563eb' },
    ],
    anchors: [
      { id: 'center', label: 'Eje Central de Giro', relX: 0.5, relY: 0.5 },
      { id: 'rim_0', label: 'Borde 0° (Este)', relX: 1.0, relY: 0.5 },
      { id: 'rim_90', label: 'Borde 90° (Norte)', relX: 0.5, relY: 0.0 },
      { id: 'rim_180', label: 'Borde 180° (Oeste)', relX: 0.0, relY: 0.5 },
      { id: 'rim_270', label: 'Borde 270° (Sur)', relX: 0.5, relY: 1.0 },
    ],
  },

  mcuv_particle: {
    type: 'mcuv_particle',
    name: 'Partícula Acelerada MCUV',
    category: 'mcuv',
    desc: 'Cuerpo en trayectoria circular acelerada con 4 vectores dinámicos: rapidez tangencial (v⃗_t), aceleración centrípeta (a⃗_c), aceleración tangencial (a⃗_t) y aceleración total (a⃗_total).',
    defaultWidth: 28,
    defaultHeight: 28,
    defaultColor: '#06b6d4',
    defaultProps: {
      radiusMeters: 1.0,
      radiusPx: 110,
      omega0: 0.0,
      omega: 0.0,
      initialOmega: 0.0,
      alpha: 2.0,
      initialAlpha: 2.0,
      angleRad: 0.0,
      mass: 0.5,
      showTangentialVector: true, // v_t (esmeralda)
      showCentripetalVector: true, // a_c (carmesí al centro)
      showTangentialAccelVector: true, // a_t (ámbar tangencial)
      showTotalAccelVector: true, // a_total (violeta resultante)
      showOrbit: true,
      showRadiusLine: true,
      isStatic: false,
      label: 'Masa en MCUV',
    },
    presets: [
      { label: 'P11: Turbina (r=0.4m, α=3.5 rad/s², at=1.4 m/s²)', radiusMeters: 0.4, omega0: 0.0, omega: 0.0, initialOmega: 0.0, alpha: 3.5, initialAlpha: 3.5, color: '#0284c7' },
      { label: 'P12: Frenado Volante (r=0.6m, ω₀=15 rad/s, α=-2.5)', radiusMeters: 0.6, omega0: 15.0, omega: 15.0, initialOmega: 15.0, alpha: -2.5, initialAlpha: -2.5, color: '#dc2626' },
      { label: 'P13: Borde Ventilador (r=0.3m, α=4 rad/s², at=1.2 m/s²)', radiusMeters: 0.3, omega0: 0.0, omega: 0.0, initialOmega: 0.0, alpha: 4.0, initialAlpha: 4.0, color: '#16a34a' },
      { label: 'P14: Tubo Centrífuga (r=0.15m, ω₀=50, α=-5)', radiusMeters: 0.15, omega0: 50.0, omega: 50.0, initialOmega: 50.0, alpha: -5.0, initialAlpha: -5.0, color: '#d97706' },
      { label: 'P18: Cuerda en Polea (r=0.2m, α=5 rad/s², at=1.0 m/s²)', radiusMeters: 0.2, omega0: 0.0, omega: 0.0, initialOmega: 0.0, alpha: 5.0, initialAlpha: 5.0, color: '#0d9488' },
      { label: 'P25: Aspa Lavadora (r=0.28m, α=8 rad/s², at=2.24 m/s²)', radiusMeters: 0.28, omega0: 0.0, omega: 0.0, initialOmega: 0.0, alpha: 8.0, initialAlpha: 8.0, color: '#2563eb' },
    ],
    anchors: [
      { id: 'center', label: 'Centro de Masa', relX: 0.5, relY: 0.5 },
    ],
  },

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
      ...(physicsType === 'mcuv_turntable' || physicsType === 'mcuv_particle'
        ? {
            omega: options.omega !== undefined ? options.omega : (options.omega0 !== undefined ? options.omega0 : definition.defaultProps.omega),
            initialOmega: options.initialOmega !== undefined ? options.initialOmega : (options.omega0 !== undefined ? options.omega0 : definition.defaultProps.initialOmega),
            alpha: options.alpha !== undefined ? options.alpha : definition.defaultProps.alpha,
            initialAlpha: options.initialAlpha !== undefined ? options.initialAlpha : (options.alpha !== undefined ? options.alpha : definition.defaultProps.initialAlpha),
          }
        : {}),
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

/**
 * Pre-configured Complete MRUV Laboratory Assembly:
 * - 1 Long precision graduated track (8.0 meters)
 * - 1 MRUV laboratory cart with acceleration a = 1.8 m/s² & dual vector display (v⃗ and a⃗)
 * - 2 Photogate sensors at x = 1.0 m and x = 5.0 m
 */
export function createMruvLabAssembly(cx, cy) {
  const trackW = 760;
  const trackH = 38;

  const track = createPhysicsElement('mru_track', cx, cy + 30, {
    label: 'Riel Graduado MRUV (8.0 m)',
    width: trackW,
    height: trackH,
    lengthMeters: 8.0,
  });

  const cartW = 108;
  const cartH = 52;
  const cart = createPhysicsElement('mruv_cart', cx - trackW / 2 + 75, cy - 8, {
    label: 'Móvil MRUV (a = 1.8 m/s²)',
    velocity: 0.0,
    initialVelocity: 0.0,
    acceleration: 1.8,
    color: '#0ea5e9',
    width: cartW,
    height: cartH,
    showVector: true,
    showAccelVector: true,
  });

  const gateA = createPhysicsElement('mru_photogate', cx - trackW / 2 + 180, cy - 18, {
    label: 'Sensor 1 (1.0 m)',
    gateName: 'Sensor 1',
    targetDistanceM: 1.0,
  });

  const gateB = createPhysicsElement('mru_photogate', cx - trackW / 2 + 540, cy - 18, {
    label: 'Sensor 2 (5.0 m)',
    gateName: 'Sensor 2',
    targetDistanceM: 5.0,
  });

  return [track, cart, gateA, gateB];
}

/**
 * Pre-configured Complete Caída Libre Laboratory Assembly:
 * - 1 Vertical graduated tower (50 meters, height: 460px)
 * - 1 Free fall body starting from rest on upper ledge
 * - 2 Optical photogate sensors at vertical heights
 */
export function createFreefallLabAssembly(cx, cy) {
  const towerW = 44;
  const towerH = 460;

  const tower = createPhysicsElement('freefall_tower', cx, cy, {
    label: 'Torre de Caída Libre (50 m)',
    width: towerW,
    height: towerH,
    heightMeters: 50.0,
  });

  const bodyW = 44;
  const bodyH = 44;
  const body = createPhysicsElement('freefall_body', cx + 45, cy - towerH / 2 + 30, {
    label: 'Esfera en Caída Libre',
    velocity: 0.0,
    initialVelocity: 0.0,
    gravity: 9.8,
    releaseHeight: 50.0,
    color: '#ef4444',
    width: bodyW,
    height: bodyH,
    showVector: true,
    showGravityVector: true,
  });

  const gateA = createPhysicsElement('mru_photogate', cx + 45, cy - towerH / 2 + 150, {
    label: 'Sensor 1 (15 m)',
    gateName: 'Sensor 1',
    targetDistanceM: 15.0,
  });

  const gateB = createPhysicsElement('mru_photogate', cx + 45, cy + towerH / 2 - 40, {
    label: 'Sensor 2 (45 m)',
    gateName: 'Sensor 2',
    targetDistanceM: 45.0,
  });

  return [tower, body, gateA, gateB];
}

/**
 * Pre-configured Complete Tiro Vertical Laboratory Assembly:
 * - 1 Vertical graduated tower / scale (50 meters, height: 480px)
 * - 1 Upward vertical projectile with initial launch speed v0 = 20.0 m/s
 * - 2 Optical photogate sensors (intermediate height at 15m and apex near 20m)
 */
export function createVerticalLaunchLabAssembly(cx, cy) {
  const towerW = 44;
  const towerH = 480;

  const tower = createPhysicsElement('freefall_tower', cx - 20, cy, {
    label: 'Escala Vertical Tiro (50 m)',
    width: towerW,
    height: towerH,
    heightMeters: 50.0,
  });

  const projW = 44;
  const projH = 44;
  const projectile = createPhysicsElement('vertical_projectile', cx + 35, cy + towerH / 2 - 30, {
    label: 'Proyectil Vertical (v₀ = 20.0 m/s)',
    velocity: 20.0,
    initialVelocity: 20.0,
    gravity: 9.8,
    launchHeight: 0.0,
    color: '#8b5cf6',
    width: projW,
    height: projH,
    showVector: true,
    showGravityVector: true,
  });

  const gateA = createPhysicsElement('mru_photogate', cx + 35, cy + towerH / 2 - 170, {
    label: 'Sensor 1 (15 m)',
    gateName: 'Sensor 1 (15m)',
    targetDistanceM: 15.0,
  });

  const gateApex = createPhysicsElement('mru_photogate', cx + 35, cy + towerH / 2 - 225, {
    label: 'Sensor Cúspide (20.4 m)',
    gateName: 'Sensor Cúspide',
    targetDistanceM: 20.4,
  });

  return [tower, projectile, gateA, gateApex];
}

/**
 * Pre-configured Complete Lanzamiento Horizontal Laboratory Assembly:
 * - 1 Cliff / elevated launching platform (h = 20 meters, height: 260px)
 * - 1 Horizontal projectile placed at launch edge (v0x = 20.0 m/s)
 * - 1 Target photogate sensor placed at calculated landing range
 */
export function createHorizontalLaunchLabAssembly(cx, cy) {
  const cliffW = 160;
  const cliffH = 260;
  const heightMeters = 20.0;
  const v0x = 20.0;
  const g = 9.80;

  const cliffCenterWorldX = cx - 220;
  const cliffCenterWorldY = cy - 30;

  const cliff = createPhysicsElement('cliff_platform', cliffCenterWorldX, cliffCenterWorldY, {
    label: 'Acantilado de Lanzamiento (h = 20m)',
    width: cliffW,
    height: cliffH,
    heightMeters,
    rangeMeters: 50.0,
    color: '#475569',
  });

  const cliffLeft = cliffCenterWorldX - cliffW / 2;
  const cliffTop = cliffCenterWorldY - cliffH / 2;
  const cliffRight = cliffLeft + cliffW;
  const groundLevel = cliffTop + cliffH;

  const projW = 44;
  const projH = 44;
  // Position projectile resting directly on the top launch ledge
  const projCenterX = cliffRight - projW / 2;
  const projCenterY = cliffTop - projH / 2;

  const projectile = createPhysicsElement('horizontal_projectile', projCenterX, projCenterY, {
    label: 'Proyectil Parabólico (v₀ = 20.0 m/s)',
    velocity: v0x,
    initialVelocity: v0x,
    heightMeters,
    gravity: g,
    color: '#06b6d4',
    width: projW,
    height: projH,
    showVector: true,
    showResultantVector: true,
    showTrajectory: true,
  });

  // Theoretical landing range: X = 20 * sqrt(2 * 20 / 9.8) ≈ 40.4 m
  const pxPerMeter = cliffH / heightMeters;
  const targetDistanceM = 40.4;
  const landingOffsetPx = targetDistanceM * pxPerMeter;
  const gateH = 44;
  const gateCenterX = cliffRight + landingOffsetPx;
  const gateCenterY = groundLevel - gateH / 2;

  const targetSensor = createPhysicsElement('mru_photogate', gateCenterX, gateCenterY, {
    label: 'Sensor de Impacto (X ≈ 40.4m)',
    gateName: 'Impacto (40.4m)',
    targetDistanceM,
  });

  return [cliff, projectile, targetSensor];
}

/**
 * Calculates exact cannon barrel muzzle coordinates and ground level
 */
export function getCannonMuzzlePosition(cannonX, cannonY, cannonW = 90, cannonH = 70, angleDeg = 45.0) {
  const pivotX = cannonX + 30;
  const pivotY = cannonY + cannonH - 22;
  const barrelLen = 52;
  const rad = (angleDeg * Math.PI) / 180;
  const muzzleCenterX = pivotX + barrelLen * Math.cos(rad);
  const muzzleCenterY = pivotY - barrelLen * Math.sin(rad);
  const cannonGroundY = cannonY + cannonH - 2;

  return {
    pivotX,
    pivotY,
    muzzleCenterX,
    muzzleCenterY,
    cannonGroundY,
  };
}

/**
 * Harmonized scale mapping physical meters to canvas pixels for projectile trajectories
 */
export function getProjectileScale(targetRangeM) {
  if (targetRangeM > 500) return 1.0;
  if (targetRangeM > 150) return 2.2;
  if (targetRangeM > 60) return 5.5;
  if (targetRangeM > 25) return 11.0;
  if (targetRangeM > 8) return 22.0;
  return 80.0;
}

/**
 * Pre-configured Complete Movimiento de Proyectiles (HT02) Laboratory Assembly:
 * - 1 Cannon Launcher (v0 = 20.0 m/s, θ = 37.0°)
 * - 1 Oblique Projectile ready at cannon muzzle
 * - 1 Target Photogate sensor placed at calculated landing range (X = 39.24 m)
 */
export function createProjectileMotionLabAssembly(cx, cy) {
  const v0 = 20.0;
  const thetaDeg = 37.0; // HT02 P2 soccer ball
  const g = 9.80;
  const targetRangeM = 39.24;
  const pxPerMeter = getProjectileScale(targetRangeM);

  const cannonW = 90;
  const cannonH = 70;
  const projSize = 26;

  const cannonX = cx - 220;
  const cannonY = cy + 40;

  const cannon = createPhysicsElement('cannon_launcher', cannonX, cannonY, {
    label: 'Cañón Balístico (v₀ = 20 m/s, θ = 37°)',
    width: cannonW,
    height: cannonH,
    velocity: v0,
    initialVelocity: v0,
    angleDeg: thetaDeg,
    color: '#7c3aed',
  });

  const muzzleInfo = getCannonMuzzlePosition(cannonX, cannonY, cannonW, cannonH, thetaDeg);
  const muzzleCenterX = muzzleInfo.muzzleCenterX;
  const muzzleCenterY = muzzleInfo.muzzleCenterY;
  const groundY = muzzleInfo.cannonGroundY;

  const projX = muzzleCenterX - projSize / 2;
  const projY = muzzleCenterY - projSize / 2;

  const projectile = createPhysicsElement('oblique_projectile', projX, projY, {
    label: 'Proyectil Parabólico (20 m/s, 37°)',
    velocity: v0,
    initialVelocity: v0,
    angleDeg: thetaDeg,
    initialAngleDeg: thetaDeg,
    gravity: g,
    color: '#a855f7',
    width: projSize,
    height: projSize,
    pxPerMeter,
    groundY,
    showVector: true,
    showResultantVector: true,
    showTrajectory: true,
  });

  // Calculate EXACT landing impact point for photogate
  const rad = (thetaDeg * Math.PI) / 180;
  const v0x = v0 * Math.cos(rad);
  const v0y = v0 * Math.sin(rad);
  const landingCenterY = groundY - projSize / 2;
  const dropPx = landingCenterY - muzzleCenterY;
  const dropM = dropPx / pxPerMeter;
  const disc = v0y * v0y + 2 * g * dropM;
  const flightTime = disc >= 0 ? (v0y + Math.sqrt(disc)) / g : (2 * v0y / g);
  const landingOffsetPx = v0x * flightTime * pxPerMeter;
  const landingCenterX = muzzleCenterX + landingOffsetPx;

  const gateW = 50;
  const gateH = 44;
  const gateX = landingCenterX - gateW / 2;
  const gateY = groundY - gateH;

  const targetSensor = createPhysicsElement('mru_photogate', gateX, gateY, {
    label: 'Sensor de Impacto (X ≈ 39.2m)',
    gateName: 'Impacto (39.2m)',
    targetDistanceM: 39.24,
  });

  return [cannon, projectile, targetSensor];
}

/**
 * Pre-configured Complete Movimiento Circular Uniforme (HT03 MCU) Laboratory Assembly:
 * - 1 Central Turntable / Rotor Platform (r = 1.0 m, ω = 3.0 rad/s)
 * - 1 Orbiting Particle / Test Mass with Tangential & Centripetal Vectors
 * - 1 Optical Lap / Revolution Counter Photogate Sensor
 */
export function createMcuLabAssembly(cx, cy) {
  const visualRadiusPx = 110;
  const radiusMeters = 1.0;
  const omegaRadS = 3.0;

  const turntable = createPhysicsElement('mcu_turntable', cx - visualRadiusPx, cy - visualRadiusPx, {
    label: 'Plataforma Giratoria MCU (ω = 3.0 rad/s)',
    width: visualRadiusPx * 2,
    height: visualRadiusPx * 2,
    radiusMeters,
    radiusPx: visualRadiusPx,
    omega: omegaRadS,
    initialOmega: omegaRadS,
    direction: 'ccw',
    color: '#0284c7',
  });

  const particleSize = 28;
  const particle = createPhysicsElement('mcu_particle', cx + visualRadiusPx - particleSize / 2, cy - particleSize / 2, {
    label: 'Masa Orbitante (vt = 3.0 m/s, ac = 9.0 m/s²)',
    width: particleSize,
    height: particleSize,
    centerX: cx,
    centerY: cy,
    radiusMeters,
    radiusPx: visualRadiusPx,
    omega: omegaRadS,
    initialOmega: omegaRadS,
    angleRad: 0.0,
    color: '#3b82f6',
    showTangentialVector: true,
    showCentripetalVector: true,
    showOrbit: true,
    showRadiusLine: true,
  });

  const gateW = 46;
  const gateH = 40;
  const photogate = createPhysicsElement('mru_photogate', cx + visualRadiusPx - gateW / 2, cy - gateH / 2, {
    label: 'Sensor de Vueltas (Lap)',
    gateName: 'Contador Lap',
  });

  return [turntable, particle, photogate];
}

/**
 * Pre-configured Complete Movimiento Circular Uniformemente Acelerado (MCUV / MCUA) Laboratory Assembly:
 * - 1 Central Rotor Platform (r = 1.0 m, ω₀ = 0.0 rad/s, α = 2.0 rad/s²)
 * - 1 Orbiting Particle / Test Mass with 4 dynamic vectors (v⃗_t, a⃗_c, a⃗_t, a⃗_total)
 * - 1 Optical Lap / Revolution Counter Photogate Sensor
 */
export function createMcuvLabAssembly(cx, cy) {
  const visualRadiusPx = 110;
  const radiusMeters = 1.0;
  const omega0 = 0.0;
  const alpha = 2.0;

  const turntable = createPhysicsElement('mcuv_turntable', cx - visualRadiusPx, cy - visualRadiusPx, {
    label: `Rotor MCUV (α = ${alpha} rad/s²)`,
    width: visualRadiusPx * 2,
    height: visualRadiusPx * 2,
    radiusMeters,
    radiusPx: visualRadiusPx,
    omega0,
    omega: omega0,
    initialOmega: omega0,
    alpha,
    initialAlpha: alpha,
    direction: 'ccw',
    color: '#0891b2',
  });

  const particleSize = 28;
  const particle = createPhysicsElement('mcuv_particle', cx + visualRadiusPx - particleSize / 2, cy - particleSize / 2, {
    label: `Masa MCUV (α = ${alpha} rad/s²)`,
    width: particleSize,
    height: particleSize,
    centerX: cx,
    centerY: cy,
    radiusMeters,
    radiusPx: visualRadiusPx,
    omega0,
    omega: omega0,
    initialOmega: omega0,
    alpha,
    initialAlpha: alpha,
    angleRad: 0.0,
    color: '#06b6d4',
    showTangentialVector: true,
    showCentripetalVector: true,
    showTangentialAccelVector: true,
    showTotalAccelVector: true,
    showOrbit: true,
    showRadiusLine: true,
  });

  const gateW = 46;
  const gateH = 40;
  const photogate = createPhysicsElement('mru_photogate', cx + visualRadiusPx - gateW / 2, cy - gateH / 2, {
    label: 'Sensor de Vueltas (MCUV)',
    gateName: 'Contador MCUV',
  });

  return [turntable, particle, photogate];
}

