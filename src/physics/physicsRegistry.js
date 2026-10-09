// =========================================================================
// PHYSICS REGISTRY & EXTENSIBLE OBJECT CATALOG
// Defines physics topics (MRU, Dinámica, etc.), blueprints, defaults & anchors
// =========================================================================

export const PHYSICS_TOPICS = [
  { id: 'mru', name: 'Cinemática (MRU)', active: true, icon: 'Gauge' },
  // Temas ocultos por solicitud: solo MRU visible. Poner active: true para reactivar cualquiera.
  { id: 'mruv', name: 'Cinemática (MRUV)', active: false, icon: 'TrendingUp' },
  { id: 'freefall', name: 'Caída Libre (HT03)', active: false, icon: 'ArrowDownCircle' },
  { id: 'tiro_vertical', name: 'Tiro Vertical (HT04)', active: false, icon: 'ArrowUpCircle' },
  { id: 'lanzamiento_horizontal', name: 'Lanzamiento Horizontal (HT01)', active: false, icon: 'Navigation' },
  { id: 'movimiento_proyectiles', name: 'Mov. Proyectiles (HT02)', active: false, icon: 'Target' },
  { id: 'mcu', name: 'Mov. Circular Uniforme (MCU)', active: false, icon: 'RotateCw' },
  { id: 'mcuv', name: 'Mov. Circular Acelerado (MCUV)', active: false, icon: 'RotateCw' },
  { id: 'poleas_mcu', name: 'Poleas MCU (HT01 U3)', active: false, icon: 'Disc' },
  { id: 'dcl', name: 'Diagramas de Cuerpo Libre (HT02)', active: false, icon: 'GitFork' },
  { id: 'equilibrio', name: 'Equilibrio Traslacional (HT03)', active: false, icon: 'Scale' },
  { id: 'segunda_ley_newton', name: 'Segunda Ley de Newton (HT01 U4)', active: false, icon: 'Weight' },
  { id: 'mechanics', name: 'Dinámica (Atwood & Poleas)', active: false, icon: 'Weight' },
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

  // -----------------------------------------------------------------------
  // TEMA: POLEAS MCU — TRANSMISIONES POR FAJA Y EJES CONCÉNTRICOS
  // Unidad 3 - Física II Quinto Diversificado - Colegio Kinal (HT01)
  // -----------------------------------------------------------------------
  mcu_pulley_system: {
    type: 'mcu_pulley_system',
    name: 'Sistema de Transmisión por Poleas (MCU)',
    category: 'poleas_mcu',
    desc: 'Transmisión cinemática por poleas: faja/correa sin deslizamiento (v₁ = v₂ = cte), discos en mismo eje concéntrico (ω₁ = ω₂ = cte) y trenes reductores compuestos.',
    defaultWidth: 320,
    defaultHeight: 180,
    defaultColor: '#059669',
    defaultProps: {
      configuration: 'belt', // 'belt', 'concentric', 'concentric_hanging_block', 'concentric_and_belt', 'belt_and_concentric', 'compound_train_2stage', 'compound_train_3stage', 'double_reduction', 'washing_machine'
      radiusMeters1: 0.20,
      radiusMeters2: 0.10,
      radiusMeters3: 0.25,
      radiusMeters4: 0.50,
      radiusPx1: 65,
      radiusPx2: 45,
      distancePx: 200,
      omega1: 5.0,
      initialOmega1: 5.0,
      omega2: 10.0,
      initialOmega2: 10.0,
      angleRad1: 0.0,
      angleRad2: 0.0,
      beltCrossed: false,
      rpm1: 47.75,
      rpm2: 95.49,
      linearSpeed: 1.0,
      showBelt: true,
      showVectors: true,
      showSpokes: true,
      showTelemetry: true,
      isStatic: true,
      label: 'Transmisión por Poleas MCU',
    },
    presets: [
      {
        label: 'P1: Mismo Eje (r₁ = 5 in, r₂ = 15 in, v₁ = 15 in/s → v₂ = 45 in/s)',
        configuration: 'concentric',
        radiusMeters1: 0.127,
        radiusMeters2: 0.381,
        omega1: 3.0,
        initialOmega1: 3.0,
        omega2: 3.0,
        initialOmega2: 3.0,
        linearSpeed: 0.381,
        exerciseNumber: 1,
        label: 'P1: Discos Concéntricos (Mismo Eje)',
        color: '#2563eb',
      },
      {
        label: 'P2: Tambor Concéntrico con Bloque (RA = 8 cm, RB = 12 cm, v = 6 m/s → ω = 75 rad/s)',
        configuration: 'concentric_hanging_block',
        radiusMeters1: 0.08,
        radiusMeters2: 0.12,
        omega1: 75.0,
        initialOmega1: 75.0,
        omega2: 75.0,
        initialOmega2: 75.0,
        linearSpeed: 6.0,
        exerciseNumber: 2,
        label: 'P2: Tambor Concéntrico con Bloque Colgante',
        color: '#d97706',
      },
      {
        label: 'P3: Poleas con Faja (RA = 20 cm, RB = 10 cm, ωA = 5 rad/s → ac = 10 m/s²)',
        configuration: 'belt',
        radiusMeters1: 0.20,
        radiusMeters2: 0.10,
        omega1: 5.0,
        initialOmega1: 5.0,
        omega2: 10.0,
        initialOmega2: 10.0,
        linearSpeed: 1.0,
        exerciseNumber: 3,
        label: 'P3: Poleas con Faja (ac = 10 m/s²)',
        color: '#16a34a',
      },
      {
        label: 'P4: Eje Común A-B y Faja B-C (rA = 7m, rB = 4m, rC = 6m, ωA = 12 rad/s → vC = 48 m/s)',
        configuration: 'concentric_and_belt',
        radiusMeters1: 0.70,
        radiusMeters2: 0.40,
        radiusMeters3: 0.60,
        omega1: 12.0,
        initialOmega1: 12.0,
        omega2: 12.0,
        initialOmega2: 12.0,
        linearSpeed: 4.8,
        exerciseNumber: 4,
        label: 'P4: Eje Común A-B + Faja B-C',
        color: '#0891b2',
      },
      {
        label: 'P5: Faja A-B y Eje Común B-C (rA = 3m, rB = 5m, rC = 2m, vA = 40 m/s → vC = 16 m/s)',
        configuration: 'belt_and_concentric',
        radiusMeters1: 0.30,
        radiusMeters2: 0.50,
        radiusMeters3: 0.20,
        omega1: 13.33,
        initialOmega1: 13.33,
        omega2: 8.0,
        initialOmega2: 8.0,
        linearSpeed: 4.0,
        exerciseNumber: 5,
        label: 'P5: Faja A-B + Eje Común B-C',
        color: '#7c3aed',
      },
      {
        label: 'P6: Tren Compuesto 3 Etapas (N₁ = 3000 RPM → N_salida = 150 RPM, f = 2.5 Hz)',
        configuration: 'compound_train_3stage',
        radiusMeters1: 0.01,
        radiusMeters2: 0.04,
        radiusMeters3: 0.02,
        radiusMeters4: 0.05,
        omega1: 314.16,
        initialOmega1: 314.16,
        omega2: 15.71,
        initialOmega2: 15.71,
        linearSpeed: 3.14,
        exerciseNumber: 6,
        label: 'P6: Tren de Poleas 3 Etapas',
        color: '#db2777',
      },
      {
        label: 'P7: Tren Reductor 2 Etapas (d₁=20cm, d₃=25cm, d₄=50cm, N₁=200 RPM → N₄=50 RPM, d₂=40cm)',
        configuration: 'compound_train_2stage',
        radiusMeters1: 0.10,
        radiusMeters2: 0.20,
        radiusMeters3: 0.125,
        radiusMeters4: 0.25,
        omega1: 20.94,
        initialOmega1: 20.94,
        omega2: 5.24,
        initialOmega2: 5.24,
        linearSpeed: 2.09,
        exerciseNumber: 7,
        label: 'P7: Tren Reductor 2 Etapas (d2 = 40 cm)',
        color: '#0284c7',
      },
      {
        label: 'P8: Tren Reductor Doble 4:1 (d₁=d₃=5cm, d₂=d₄=20cm, N₁=2000 RPM → N₄=125 RPM, v₄=1.31 m/s)',
        configuration: 'double_reduction',
        radiusMeters1: 0.025,
        radiusMeters2: 0.10,
        radiusMeters3: 0.025,
        radiusMeters4: 0.10,
        omega1: 209.44,
        initialOmega1: 209.44,
        omega2: 13.09,
        initialOmega2: 13.09,
        linearSpeed: 1.31,
        exerciseNumber: 8,
        label: 'P8: Tren Reductor Doble 4:1',
        color: '#059669',
      },
      {
        label: 'P9: Transmisión Lavadora (d_motor = 9 cm, d_tambor = 45 cm, N₁ = 450 RPM → v = 2.12 m/s)',
        configuration: 'washing_machine',
        radiusMeters1: 0.045,
        radiusMeters2: 0.225,
        omega1: 47.12,
        initialOmega1: 47.12,
        omega2: 9.42,
        initialOmega2: 9.42,
        linearSpeed: 2.12,
        exerciseNumber: 9,
        label: 'P9: Transmisión Lavadora con Faja',
        color: '#ea580c',
      },
    ],
    anchors: [
      { id: 'pulley1_center', label: 'Eje Polea 1 (Entrada)', relX: 0.25, relY: 0.5 },
      { id: 'pulley2_center', label: 'Eje Polea 2 (Salida)', relX: 0.75, relY: 0.5 },
      { id: 'belt_top', label: 'Tramo Superior de Correa', relX: 0.5, relY: 0.15 },
      { id: 'belt_bottom', label: 'Tramo Inferior de Correa', relX: 0.5, relY: 0.85 },
      { id: 'center', label: 'Centro de Montaje', relX: 0.5, relY: 0.5 },
    ],
  },

  // -----------------------------------------------------------------------
  // TEMA: FUERZAS Y DIAGRAMAS DE CUERPO LIBRE (DCL)
  // Unidad 3 - Física II Quinto Diversificado - Colegio Kinal (HT02)
  // -----------------------------------------------------------------------
  dcl_diagram: {
    type: 'dcl_diagram',
    name: 'Diagrama de Cuerpo Libre (DCL)',
    category: 'dcl',
    desc: 'Diagrama vectorial de cuerpo libre con ejes cartesianos (normales o inclinados), vectores de fuerza identificados por origen (peso, normal, tensión, fricción, fuerza aplicada), descomposición en componentes ortogonales y ecuaciones de equilibrio.',
    defaultWidth: 280,
    defaultHeight: 280,
    defaultColor: '#ea580c',
    defaultProps: {
      exerciseNumber: 1,
      systemTitle: 'Masa Suspendida (HT02 P1)',
      bodyName: 'Masa Suspendida (m)',
      axisAngleDeg: 0,
      showComponents: true,
      showEquations: true,
      showGrid: true,
      isStatic: true,
      label: 'DCL: Masa Suspendida',
      forces: [
        { id: 'f_w', name: 'W', label: 'W = m·g', type: 'weight', origin: 'A distancia (Tierra)', magnitude: 98, angleDeg: 270, direction: 'Abajo (-Y)', color: '#ef4444' },
        { id: 'f_t1', name: 'T₁', label: 'T₁', type: 'tension', origin: 'Contacto (Cuerda 1)', magnitude: 60, angleDeg: 125, direction: 'Arriba-Izq', color: '#10b981' },
        { id: 'f_t2', name: 'T₂', label: 'T₂', type: 'tension', origin: 'Contacto (Cuerda 2)', magnitude: 60, angleDeg: 55, direction: 'Arriba-Der', color: '#059669' },
      ],
      equations: [
        'ΣFx = T₂·sin(α) - T₁·sin(α) = 0  ⇒  T₁ = T₂',
        'ΣFy = 2T·cos(α) - W = 0  ⇒  T = W / (2·cos α)',
      ],
      criticalPoint: 'Masa suspendida (Punto de concurrencia)',
    },
    presets: [
      {
        label: 'Mesa con 3 Masas (Limpia para Dibujar D.C.L. HT02 #10)',
        exerciseNumber: 11,
        apparatusType: 'table_three_masses',
        width: 680,
        height: 390,
        systemTitle: 'Problema 10: Mesa con Tres Masas (6kg, 10kg, 9kg)',
        bodyName: 'Mesa y 3 Masas (m₁, m₂, m₃)',
        axisAngleDeg: 0,
        color: '#ea580c',
        showOfficialSolution: false,
        userVectors: [],
      },
      {
        label: 'Mesa con 2 Masas (Limpia para Dibujar D.C.L. HT02 #2)',
        exerciseNumber: 2,
        apparatusType: 'table_two_masses',
        width: 560,
        height: 350,
        systemTitle: 'Problema 2: Mesa con Bloque y Masa Suspendida',
        bodyName: 'Mesa y 2 Masas (m₁, m₂)',
        axisAngleDeg: 0,
        color: '#2563eb',
        showOfficialSolution: false,
        userVectors: [],
      },
      {
        label: 'Mesa con 3 Masas (Con Solución Teórica HT02 #10)',
        exerciseNumber: 11,
        apparatusType: 'table_three_masses',
        width: 680,
        height: 390,
        systemTitle: 'Problema 10: Mesa con Fricción y Tres Masas (Solución Oficial)',
        bodyName: 'Mesa y 3 Masas (m₁, m₂, m₃)',
        axisAngleDeg: 0,
        color: '#ea580c',
        showOfficialSolution: true,
        userVectors: [],
      },
      {
        label: 'Mesa con 2 Masas (Con Solución Teórica HT02 #2)',
        exerciseNumber: 2,
        apparatusType: 'table_two_masses',
        width: 560,
        height: 350,
        systemTitle: 'Problema 2: Mesa con Bloque y Masa Suspendida (Solución Oficial)',
        bodyName: 'Mesa y 2 Masas (m₁, m₂)',
        axisAngleDeg: 0,
        color: '#2563eb',
        showOfficialSolution: true,
        userVectors: [],
      },
      {
        label: 'P1: Masa Suspendida por 2 Cuerdas Simétricas (Ángulo α)',
        exerciseNumber: 1,
        systemTitle: 'Problema 1: Masa con 2 Cuerdas',
        bodyName: 'Masa Suspendida (m)',
        axisAngleDeg: 0,
        color: '#2563eb',
        forces: [
          { id: 'f_w', name: 'W', label: 'W = m·g', type: 'weight', origin: 'A distancia', magnitude: 98, angleDeg: 270, color: '#ef4444' },
          { id: 'f_t1', name: 'T₁', label: 'T₁', type: 'tension', origin: 'Contacto', magnitude: 60, angleDeg: 125, color: '#10b981' },
          { id: 'f_t2', name: 'T₂', label: 'T₂', type: 'tension', origin: 'Contacto', magnitude: 60, angleDeg: 55, color: '#059669' },
        ],
        equations: [
          'ΣFx = T₂·sin(α) - T₁·sin(α) = 0  ⇒  T₁ = T₂',
          'ΣFy = 2T·cos(α) - W = 0  ⇒  T = W / (2·cos α)',
        ],
      },
      {
        label: 'P2: Bloque m₁ en Mesa Horizontal',
        exerciseNumber: 2,
        systemTitle: 'Problema 2: Bloque en Mesa y Masa Colgante',
        bodyName: 'Bloque m₁ (Mesa)',
        axisAngleDeg: 0,
        color: '#0891b2',
        forces: [
          { id: 'f_w1', name: 'W₁', label: 'W₁ = m₁·g', type: 'weight', origin: 'A distancia', magnitude: 98, angleDeg: 270, color: '#ef4444' },
          { id: 'f_n', name: 'N', label: 'N', type: 'normal', origin: 'Contacto', magnitude: 98, angleDeg: 90, color: '#3b82f6' },
          { id: 'f_t', name: 'T', label: 'T', type: 'tension', origin: 'Contacto', magnitude: 49, angleDeg: 0, color: '#10b981' },
          { id: 'f_fr', name: 'fr', label: 'fr', type: 'friction', origin: 'Contacto', magnitude: 19.6, angleDeg: 180, color: '#f59e0b' },
        ],
        equations: ['ΣFy = N - W₁ = 0', 'ΣFx = T - fr = m₁·a'],
      },
      {
        label: 'P2: Masa Suspendida m₂',
        exerciseNumber: 2,
        systemTitle: 'Problema 2: Bloque en Mesa y Masa Colgante',
        bodyName: 'Masa Colgante m₂',
        axisAngleDeg: 0,
        color: '#059669',
        forces: [
          { id: 'f_w2', name: 'W₂', label: 'W₂ = m₂·g', type: 'weight', origin: 'A distancia', magnitude: 49, angleDeg: 270, color: '#ef4444' },
          { id: 'f_t', name: 'T', label: 'T', type: 'tension', origin: 'Contacto', magnitude: 49, angleDeg: 90, color: '#10b981' },
        ],
        equations: ['ΣFy = W₂ - T = m₂·a', 'ΣFx = 0'],
      },
      {
        label: 'P3: Tres Bloques en Contacto (m₁, m₂, m₃)',
        exerciseNumber: 3,
        systemTitle: 'Problema 3: Bloques en Contacto',
        bodyName: 'Bloque Central m₂ (Crítico)',
        axisAngleDeg: 0,
        color: '#7c3aed',
        forces: [
          { id: 'f_w2', name: 'W₂', label: 'W₂ = m₂·g', type: 'weight', origin: 'A distancia', magnitude: 98, angleDeg: 270, color: '#ef4444' },
          { id: 'f_n2', name: 'N₂', label: 'N₂', type: 'normal', origin: 'Contacto', magnitude: 98, angleDeg: 90, color: '#3b82f6' },
          { id: 'f_f32', name: 'F₃₂', label: 'F₃₂ (de m₃)', type: 'applied', origin: 'Contacto', magnitude: 60, angleDeg: 180, color: '#8b5cf6' },
          { id: 'f_f12', name: 'F₁₂', label: 'F₁₂ (de m₁)', type: 'applied', origin: 'Contacto', magnitude: 30, angleDeg: 0, color: '#06b6d4' },
        ],
        equations: ['ΣFy = N₂ - W₂ = 0', 'ΣFx = F₃₂ - F₁₂ = m₂·a'],
      },
      {
        label: 'P4: Bloque Retenido por Cuerda y Fuerza F',
        exerciseNumber: 4,
        systemTitle: 'Problema 4: Bloque con Cuerda Fija',
        bodyName: 'Bloque Retenido',
        axisAngleDeg: 0,
        color: '#ea580c',
        forces: [
          { id: 'f_w', name: 'W', label: 'W', type: 'weight', origin: 'A distancia', magnitude: 80, angleDeg: 270, color: '#ef4444' },
          { id: 'f_n', name: 'N', label: 'N', type: 'normal', origin: 'Contacto', magnitude: 80, angleDeg: 90, color: '#3b82f6' },
          { id: 'f_f', name: 'F', label: 'F', type: 'applied', origin: 'Contacto', magnitude: 60, angleDeg: 0, color: '#8b5cf6' },
          { id: 'f_t', name: 'T', label: 'T', type: 'tension', origin: 'Contacto', magnitude: 45, angleDeg: 180, color: '#10b981' },
          { id: 'f_fr', name: 'fr', label: 'fr', type: 'friction', origin: 'Contacto', magnitude: 15, angleDeg: 180, color: '#f59e0b' },
        ],
        equations: ['ΣFy = N - W = 0', 'ΣFx = F - T - fr = 0'],
      },
      {
        label: 'P5: Nudo Concurrente "O" (Cuerdas y Peso W)',
        exerciseNumber: 5,
        systemTitle: 'Problema 5: Nudo Concurrente O',
        bodyName: 'Nudo Concurrente O',
        axisAngleDeg: 0,
        color: '#16a34a',
        forces: [
          { id: 'f_t1', name: 'T₁', label: 'T₁ (Horizontal)', type: 'tension', origin: 'Contacto', magnitude: 53.3, angleDeg: 180, color: '#10b981' },
          { id: 'f_t2', name: 'T₂', label: 'T₂ (a 37°)', type: 'tension', origin: 'Contacto', magnitude: 66.5, angleDeg: 37, color: '#059669' },
          { id: 'f_t3', name: 'T₃', label: 'T₃ = W', type: 'tension', origin: 'Contacto', magnitude: 40, angleDeg: 270, color: '#14b8a6' },
        ],
        equations: ['ΣFx = T₂·cos(37°) - T₁ = 0', 'ΣFy = T₂·sin(37°) - W = 0'],
      },
      {
        label: 'P6: Bloque Q en Plano Inclinado (37°)',
        exerciseNumber: 6,
        systemTitle: 'Problema 6: Plano Inclinado 37°',
        bodyName: 'Bloque Q (Ejes Rotados 37°)',
        axisAngleDeg: 37,
        color: '#d97706',
        forces: [
          { id: 'f_n', name: 'N', label: 'N', type: 'normal', origin: 'Contacto', magnitude: 78.4, angleDeg: 90, color: '#3b82f6' },
          { id: 'f_t', name: 'T', label: 'T', type: 'tension', origin: 'Contacto', magnitude: 75, angleDeg: 0, color: '#10b981' },
          { id: 'f_wqy', name: 'WQy', label: 'WQ·cos(37°)', type: 'weight', origin: 'Descomposición', magnitude: 78.4, angleDeg: 270, color: '#ef4444' },
          { id: 'f_wqx', name: 'WQx', label: 'WQ·sin(37°)', type: 'weight', origin: 'Descomposición', magnitude: 59.0, angleDeg: 180, color: '#dc2626' },
          { id: 'f_fr', name: 'fr', label: 'fr', type: 'friction', origin: 'Contacto', magnitude: 15.7, angleDeg: 180, color: '#f59e0b' },
        ],
        equations: ['ΣFy = N - WQ·cos(37°) = 0', 'ΣFx = T - WQ·sin(37°) - fr = mQ·a'],
      },
      {
        label: 'P7: Dos Bloques en Serie Vertical (A y B)',
        exerciseNumber: 7,
        systemTitle: 'Problema 7: Bloques en Serie',
        bodyName: 'Bloque Superior A (Crítico)',
        axisAngleDeg: 0,
        color: '#dc2626',
        forces: [
          { id: 'f_wa', name: 'WA', label: 'WA = mA·g', type: 'weight', origin: 'A distancia', magnitude: 50, angleDeg: 270, color: '#ef4444' },
          { id: 'f_t2', name: 'T₂', label: 'T₂ (hacia B)', type: 'tension', origin: 'Contacto', magnitude: 40, angleDeg: 270, color: '#059669' },
          { id: 'f_t1', name: 'T₁', label: 'T₁ (Techo)', type: 'tension', origin: 'Contacto', magnitude: 90, angleDeg: 90, color: '#10b981' },
        ],
        equations: ['ΣFy = T₁ - WA - T₂ = 0  ⇒  T₁ = WA + WB'],
      },
      {
        label: 'P11: Mesa con Fricción (μ=0.20) y 3 Masas (10kg, 6kg, 9kg)',
        exerciseNumber: 11,
        systemTitle: 'Problema 11: Mesa con Fricción y 3 Masas',
        bodyName: 'Masa Central m₂ = 10 kg',
        axisAngleDeg: 0,
        color: '#10b981',
        forces: [
          { id: 'f_w2', name: 'W₂', label: 'W₂ = 98.00 N', type: 'weight', origin: 'A distancia', magnitude: 98.0, angleDeg: 270, color: '#ef4444' },
          { id: 'f_n', name: 'N', label: 'N = 98.00 N', type: 'normal', origin: 'Contacto', magnitude: 98.0, angleDeg: 90, color: '#3b82f6' },
          { id: 'f_t2', name: 'T₂', label: 'T₂ = 84.67 N', type: 'tension', origin: 'Contacto', magnitude: 84.67, angleDeg: 0, color: '#059669' },
          { id: 'f_t1', name: 'T₁', label: 'T₁ = 61.15 N', type: 'tension', origin: 'Contacto', magnitude: 61.15, angleDeg: 180, color: '#10b981' },
          { id: 'f_fk', name: 'fk', label: 'fk = 19.60 N', type: 'friction', origin: 'Contacto', magnitude: 19.6, angleDeg: 180, color: '#f59e0b' },
        ],
        equations: [
          'ΣFy = N - W₂ = 0  ⇒  N = 98 N,  fk = 0.20·N = 19.6 N',
          'a = (W₃ - W₁ - fk) / (m₁+m₂+m₃) = 0.392 m/s²',
          'ΣFx = T₂ - T₁ - fk = m₂·a',
        ],
      },
      {
        label: 'P12: Grúa con Carga 1200 lb y Punto Crítico "C"',
        exerciseNumber: 12,
        systemTitle: 'Problema 12: Grúa y Punto C',
        bodyName: 'Punto Crítico Concurrente C',
        axisAngleDeg: 0,
        color: '#0284c7',
        forces: [
          { id: 'f_w', name: 'W', label: 'W = 1200 lb', type: 'weight', origin: 'A distancia', magnitude: 1200, angleDeg: 270, color: '#ef4444' },
          { id: 'f_fa', name: 'FA', label: 'FA (Pluma 5° con vertical)', type: 'applied', origin: 'Contacto', magnitude: 1350, angleDeg: 95, color: '#3b82f6' },
          { id: 'f_tb', name: 'TB', label: 'TB (Tensor ángulo α)', type: 'tension', origin: 'Contacto', magnitude: 450, angleDeg: 340, color: '#10b981' },
        ],
        equations: [
          'ΣFx = -FA·sin(5°) + TB·cos(α) = 0',
          'ΣFy = FA·cos(5°) - TB·sin(α) - 1200 lb = 0',
        ],
      },
    ],
    anchors: [
      { id: 'center', label: 'Origen (0, 0)', relX: 0.5, relY: 0.5 },
      { id: 'pos_x', label: 'Eje +X', relX: 1.0, relY: 0.5 },
      { id: 'neg_x', label: 'Eje -X', relX: 0.0, relY: 0.5 },
      { id: 'pos_y', label: 'Eje +Y', relX: 0.5, relY: 0.0 },
      { id: 'neg_y', label: 'Eje -Y', relX: 0.5, relY: 1.0 },
    ],
  },

  // -----------------------------------------------------------------------
  // TEMA: EQUILIBRIO TRASLACIONAL – PRIMERA LEY DE NEWTON (HT03)
  // Unidad 3 - Física II Quinto Diversificado - Colegio Kinal
  // -----------------------------------------------------------------------
  translational_equilibrium: {
    type: 'translational_equilibrium',
    name: 'Equilibrio Traslacional (1ra Ley Newton)',
    category: 'equilibrio',
    desc: 'Sistema mecánico en equilibrio estático traslacional (ΣFx = 0, ΣFy = 0) con nudos concurrentes, cables, poleas, pesos y planos inclinados.',
    defaultWidth: 620,
    defaultHeight: 400,
    defaultColor: '#059669',
    defaultProps: {
      exerciseNumber: 1,
      apparatusType: 'cable_knot_wall',
      systemTitle: 'Problema 1: Objeto de 600 N con Cable a 50°',
      showOfficialSolution: false, // Limpio por defecto para que el profesor y alumnos dibujen los vectores
      userVectors: [],
      mass: 61.22, // 600 N / 9.8 m/s²
      label: 'Equilibrio: P1 Objeto 600 N (Limpio para Clase)',
    },
    presets: [
      {
        label: 'P1: Objeto 600 N con Cable a 50° (Limpio para Clase)',
        exerciseNumber: 1,
        apparatusType: 'cable_knot_wall',
        systemTitle: 'Problema 1: Objeto de 600 N con Cable a 50°',
        width: 620,
        height: 380,
        mass: 61.22,
        color: '#059669',
        showOfficialSolution: false,
        userVectors: [],
      },
      {
        label: 'P1: Objeto 600 N con Cable a 50° (Solución Teórica Oficial)',
        exerciseNumber: 1,
        apparatusType: 'cable_knot_wall',
        systemTitle: 'Problema 1: Objeto de 600 N con Cable a 50° (Solución Oficial)',
        width: 620,
        height: 380,
        mass: 61.22,
        color: '#059669',
        showOfficialSolution: true,
        userVectors: [],
      },
      {
        label: 'P2: Sistema 2 Poleas y 3 Pesas (Limpio para Clase)',
        exerciseNumber: 2,
        apparatusType: 'two_pulleys_three_weights',
        systemTitle: 'Problema 2: Sistema de Poleas con Pesas FW2 y FW3',
        width: 640,
        height: 390,
        mass: 51.02,
        color: '#0284c7',
        showOfficialSolution: false,
        userVectors: [],
      },
      {
        label: 'P2: Sistema 2 Poleas y 3 Pesas (Solución Teórica Oficial)',
        exerciseNumber: 2,
        apparatusType: 'two_pulleys_three_weights',
        systemTitle: 'Problema 2: Poleas y Pesas FW2 y FW3 (Solución Oficial)',
        width: 640,
        height: 390,
        mass: 51.02,
        color: '#0284c7',
        showOfficialSolution: true,
        userVectors: [],
      },
      {
        label: 'P3: Motor 200 kg Suspendido (Limpio para Clase)',
        exerciseNumber: 3,
        apparatusType: 'engine_suspended_cables',
        systemTitle: 'Problema 3: Motor de 200 kg Suspendido por Cables AB y AC',
        width: 620,
        height: 380,
        mass: 200.0,
        color: '#d97706',
        showOfficialSolution: false,
        userVectors: [],
      },
      {
        label: 'P3: Motor 200 kg Suspendido (Solución Teórica Oficial)',
        exerciseNumber: 3,
        apparatusType: 'engine_suspended_cables',
        systemTitle: 'Problema 3: Motor 200 kg Suspendido (Solución Oficial)',
        width: 620,
        height: 380,
        mass: 200.0,
        color: '#d97706',
        showOfficialSolution: true,
        userVectors: [],
      },
      {
        label: 'P4: Pesa 200 N Pendiente 3-4-5 (Limpio para Clase)',
        exerciseNumber: 4,
        apparatusType: 'triangular_knot_slope',
        systemTitle: 'Problema 4: Objeto 200 N con Triángulo de Pendiente 3-4-5',
        width: 620,
        height: 380,
        mass: 20.41,
        color: '#7c3aed',
        showOfficialSolution: false,
        userVectors: [],
      },
      {
        label: 'P4: Pesa 200 N Pendiente 3-4-5 (Solución Teórica Oficial)',
        exerciseNumber: 4,
        apparatusType: 'triangular_knot_slope',
        systemTitle: 'Problema 4: Objeto 200 N (Solución Oficial)',
        width: 620,
        height: 380,
        mass: 20.41,
        color: '#7c3aed',
        showOfficialSolution: true,
        userVectors: [],
      },
      {
        label: 'P5: Caja 500 lb con 2 Cables (Limpio para Clase)',
        exerciseNumber: 5,
        apparatusType: 'crate_two_cables',
        systemTitle: 'Problema 5: Caja de 500 lb Soportada por Cables AB y AC',
        width: 620,
        height: 380,
        mass: 226.8,
        color: '#b45309',
        showOfficialSolution: false,
        userVectors: [],
      },
      {
        label: 'P5: Caja 500 lb con 2 Cables (Solución Teórica Oficial)',
        exerciseNumber: 5,
        apparatusType: 'crate_two_cables',
        systemTitle: 'Problema 5: Caja 500 lb (Solución Oficial)',
        width: 620,
        height: 380,
        mass: 226.8,
        color: '#b45309',
        showOfficialSolution: true,
        userVectors: [],
      },
      {
        label: 'P6: Cilindro con Polea a 30° (Limpio para Clase)',
        exerciseNumber: 6,
        apparatusType: 'pulley_cylinder_knot',
        systemTitle: 'Problema 6: Cilindro C de 40 kg Sosteniendo Cilindro A',
        width: 640,
        height: 380,
        mass: 20.0,
        color: '#0891b2',
        showOfficialSolution: false,
        userVectors: [],
      },
      {
        label: 'P6: Cilindro con Polea a 30° (Solución Teórica Oficial)',
        exerciseNumber: 6,
        apparatusType: 'pulley_cylinder_knot',
        systemTitle: 'Problema 6: Cilindro C de 40 kg Sosteniendo Cilindro A (Solución Oficial)',
        width: 640,
        height: 380,
        mass: 20.0,
        color: '#0891b2',
        showOfficialSolution: true,
        userVectors: [],
      },
      {
        label: 'P7: Dos Semáforos entre Postes (Limpio para Clase)',
        exerciseNumber: 7,
        apparatusType: 'traffic_lights_span',
        systemTitle: 'Problema 7: Dos Semáforos Suspendidos entre Postes',
        width: 660,
        height: 380,
        mass: 10.0,
        color: '#4f46e5',
        showOfficialSolution: false,
        userVectors: [],
      },
      {
        label: 'P7: Dos Semáforos entre Postes (Solución Teórica Oficial)',
        exerciseNumber: 7,
        apparatusType: 'traffic_lights_span',
        systemTitle: 'Problema 7: Dos Semáforos Suspendidos entre Postes (Solución Oficial)',
        width: 660,
        height: 380,
        mass: 10.0,
        color: '#4f46e5',
        showOfficialSolution: true,
        userVectors: [],
      },
      {
        label: 'P8: Cajas en Planos Inclinados (Limpio para Clase)',
        exerciseNumber: 8,
        apparatusType: 'double_inclined_planes',
        systemTitle: 'Problema 8: Dos Cajas en Planos Inclinados Lisos',
        width: 660,
        height: 390,
        mass: 18.14,
        color: '#16a34a',
        showOfficialSolution: false,
        userVectors: [],
      },
      {
        label: 'P8: Cajas en Planos Inclinados (Solución Teórica Oficial)',
        exerciseNumber: 8,
        apparatusType: 'double_inclined_planes',
        systemTitle: 'Problema 8: Dos Cajas en Planos Inclinados Lisos (Solución Oficial)',
        width: 660,
        height: 390,
        mass: 18.14,
        color: '#16a34a',
        showOfficialSolution: true,
        userVectors: [],
      },
    ],
    anchors: [
      { id: 'center', label: 'Centro del Aparato', relX: 0.5, relY: 0.5 },
      { id: 'knot', label: 'Nudo Concurrente', relX: 0.5, relY: 0.45 },
    ],
  },

  // -----------------------------------------------------------------------
  // TEMA: SEGUNDA LEY DE NEWTON SIN FRICCIÓN (HT01)
  // Unidad 4 - Física II Quinto Diversificado - Colegio Kinal
  // -----------------------------------------------------------------------
  newton_frictionless_system: {
    type: 'newton_frictionless_system',
    name: 'Segunda Ley de Newton (Sin Fricción)',
    category: 'segunda_ley_newton',
    desc: 'Sistema dinámico con aceleración F = m·a, masas conectadas por cuerda sobre mesa sin fricción (HT01 P7, P1, P2, P6, P8, P12a).',
    defaultWidth: 640,
    defaultHeight: 380,
    defaultColor: '#4f46e5',
    defaultProps: {
      exerciseNumber: 7,
      apparatusType: 'two_connected_blocks',
      systemTitle: 'Problema 7: Dos Bloques de 2 kg y 6 kg con F = 80 N',
      mass: 8.0,
      mass1: 2.0,
      mass2: 6.0,
      appliedForce: 80.0,
      frictionCoeff: 0.0,
      angleDeg: 0.0,
      showOfficialSolution: false, // Limpio por defecto para que el profesor/alumnos expliquen y añadan vectores
      userVectors: [],
      displacementX: 0.0,
      currentVelocity: 0.0,
      label: '2ª Ley Newton: P7 Dos Bloques (Limpio para Clase)',
    },
    presets: [
      {
        label: 'P7: Dos Bloques 2 kg y 6 kg con F = 80 N (Limpio para Clase)',
        exerciseNumber: 7,
        apparatusType: 'two_connected_blocks',
        systemTitle: 'Problema 7: Dos Bloques de 2 kg y 6 kg con F = 80 N',
        mass: 8.0,
        mass1: 2.0,
        mass2: 6.0,
        appliedForce: 80.0,
        frictionCoeff: 0.0,
        angleDeg: 0.0,
        color: '#4f46e5',
        showOfficialSolution: false,
        userVectors: [],
      },
      {
        label: 'P7: Dos Bloques 2 kg y 6 kg (Solución Teórica: a = 10 m/s², T = 20 N)',
        exerciseNumber: 7,
        apparatusType: 'two_connected_blocks',
        systemTitle: 'Problema 7: Dos Bloques de 2 kg y 6 kg (Solución Oficial)',
        mass: 8.0,
        mass1: 2.0,
        mass2: 6.0,
        appliedForce: 80.0,
        frictionCoeff: 0.0,
        angleDeg: 0.0,
        color: '#4f46e5',
        showOfficialSolution: true,
        userVectors: [],
      },
      {
        label: 'P1: Masa 4 kg con F = 12 N (Limpio para Clase)',
        exerciseNumber: 1,
        apparatusType: 'single_block_force',
        systemTitle: 'Problema 1: Masa de 4 kg bajo Fuerza Resultante',
        mass: 4.0,
        mass1: 4.0,
        mass2: 0.0,
        appliedForce: 12.0,
        frictionCoeff: 0.0,
        color: '#0284c7',
        showOfficialSolution: false,
        userVectors: [],
      },
      {
        label: 'P2: Fuerza 20 N sobre Masa 2 kg (Limpio para Clase)',
        exerciseNumber: 2,
        apparatusType: 'single_block_force',
        systemTitle: 'Problema 2: Fuerza Constante de 20 N',
        mass: 2.0,
        mass1: 2.0,
        mass2: 0.0,
        appliedForce: 20.0,
        frictionCoeff: 0.0,
        color: '#059669',
        showOfficialSolution: false,
        userVectors: [],
      },
      {
        label: 'P6: Cable Elevador con Masa 10 kg (Limpio para Clase)',
        exerciseNumber: 6,
        apparatusType: 'vertical_cable_mass',
        systemTitle: 'Problema 6: Tensión en Cable Vertical de 10 kg',
        mass: 10.0,
        mass1: 10.0,
        mass2: 0.0,
        appliedForce: 158.0,
        frictionCoeff: 0.0,
        color: '#7c3aed',
        showOfficialSolution: false,
        userVectors: [],
      },
      {
        label: 'P8: Máquina de Atwood 7 kg y 9 kg (Limpio para Clase)',
        exerciseNumber: 8,
        apparatusType: 'atwood_frictionless',
        systemTitle: 'Problema 8: Máquina de Atwood sin Fricción (7 kg y 9 kg)',
        mass: 16.0,
        mass1: 7.0,
        mass2: 9.0,
        frictionCoeff: 0.0,
        color: '#0891b2',
        showOfficialSolution: false,
        userVectors: [],
      },
      {
        label: 'P12a: Plano Inclinado 32° Sin Fricción (Limpio para Clase)',
        exerciseNumber: 12,
        apparatusType: 'inclined_plane_frictionless',
        systemTitle: 'Problema 12: Bloque 10 kg en Plano 32° y Masa 2 kg (μ = 0)',
        mass: 12.0,
        mass1: 10.0,
        mass2: 2.0,
        angleDeg: 32.0,
        frictionCoeff: 0.0,
        color: '#ea580c',
        showOfficialSolution: false,
        userVectors: [],
      },
    ],
    anchors: [
      { id: 'center', label: 'Centro del Montaje', relX: 0.5, relY: 0.5 },
      { id: 'block1', label: 'Bloque Trasero (m₁)', relX: 0.28, relY: 0.5 },
      { id: 'block2', label: 'Bloque Delantero (m₂)', relX: 0.62, relY: 0.5 },
      { id: 'rope', label: 'Cuerda de Conexión', relX: 0.45, relY: 0.5 },
      { id: 'force_hook', label: 'Punto de Tracción F', relX: 0.85, relY: 0.5 },
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
      mass: 10, // kg
      friction: 0.1,
      frictionAir: 0.005,
      restitution: 0.05,
      isStatic: false,
      userVectors: [],
    },
    presets: [
      { label: '10 kg (Bloque de Laboratorio)', mass: 10, color: '#3b82f6', width: 64, height: 64 },
      { label: '5 kg (Bloque Ligero)', mass: 5, color: '#10b981', width: 54, height: 54 },
      { label: '20 kg (Bloque Pesado)', mass: 20, color: '#8b5cf6', width: 72, height: 72 },
      { label: '50 kg (Masa Dinámica)', mass: 50, color: '#f59e0b', width: 80, height: 80 },
      { label: '100 kg (Masa Grande)', mass: 100, color: '#ef4444', width: 88, height: 88 },
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

/**
 * Pre-configured Complete Poleas MCU Laboratory Assembly:
 * - 1 Complete Pulley Transmission System (belt configuration: RA = 20cm, RB = 10cm, ωA = 5 rad/s)
 * - 1 Digital Optical Tachometer / Lap Sensor
 */
export function createPoleasMcuLabAssembly(cx, cy) {
  const sysW = 340;
  const sysH = 190;
  const system = createPhysicsElement('mcu_pulley_system', cx - sysW / 2, cy - sysH / 2, {
    label: 'Banco de Transmisión por Poleas MCU',
    configuration: 'belt',
    radiusMeters1: 0.20,
    radiusMeters2: 0.10,
    radiusPx1: 65,
    radiusPx2: 45,
    distancePx: 200,
    omega1: 5.0,
    initialOmega1: 5.0,
    omega2: 10.0,
    initialOmega2: 10.0,
    linearSpeed: 1.0,
    exerciseNumber: 3,
    color: '#16a34a',
  });

  const gateW = 46;
  const gateH = 40;
  const photogate = createPhysicsElement('mru_photogate', cx - sysW / 2 + 50, cy - sysH / 2 - 28, {
    label: 'Tacómetro Digital de Entrada',
    gateName: 'Tacómetro Poleas MCU',
  });

  return [system, photogate];
}

/**
 * Pre-configured Complete Diagrama de Cuerpo Libre (DCL) Assembly:
 * - 1 Interactive DCL Vector Diagram with Cartesian axes, forces & equilibrium equations
 */
export function createDclLabAssembly(cx, cy, exerciseNumber = 11) {
  const dclDef = PHYSICS_OBJECT_DEFINITIONS.dcl_diagram;
  const preset = dclDef.presets.find((p) => p.exerciseNumber === exerciseNumber) || dclDef.presets[0];
  const diagram = createPhysicsElement('dcl_diagram', cx, cy, {
    exerciseNumber: preset.exerciseNumber,
    systemTitle: preset.systemTitle,
    bodyName: preset.bodyName,
    apparatusType: preset.apparatusType,
    width: preset.width || dclDef.defaultWidth,
    height: preset.height || dclDef.defaultHeight,
    axisAngleDeg: preset.axisAngleDeg || 0,
    forces: preset.forces,
    equations: preset.equations,
    color: preset.color,
    userVectors: preset.userVectors ? [...preset.userVectors] : [],
    showOfficialSolution: !!preset.showOfficialSolution,
    label: preset.label || `DCL: ${preset.bodyName}`,
  });

  return [diagram];
}

/**
 * Pre-configured Complete Equilibrio Traslacional (HT03) Assembly:
 * - 1 Interactive Translational Equilibrium Apparatus with cables, pulleys, weights & vectors
 */
export function createTranslationalEquilibriumLabAssembly(cx, cy, exerciseNumber = 1, options = {}) {
  const eqDef = PHYSICS_OBJECT_DEFINITIONS.translational_equilibrium;
  const isClean = options.cleanPractice !== false;
  const preset = eqDef.presets.find(
    (p) => p.exerciseNumber === exerciseNumber && (isClean ? !p.showOfficialSolution : p.showOfficialSolution)
  ) || eqDef.presets[0];

  const apparatus = createPhysicsElement('translational_equilibrium', cx, cy, {
    exerciseNumber: preset.exerciseNumber,
    systemTitle: preset.systemTitle,
    apparatusType: preset.apparatusType,
    width: preset.width || eqDef.defaultWidth,
    height: preset.height || eqDef.defaultHeight,
    color: preset.color,
    mass: preset.mass || 61.22,
    userVectors: preset.userVectors ? [...preset.userVectors] : [],
    showOfficialSolution: !isClean,
    label: isClean ? `Aparato Limpio (Práctica): P${preset.exerciseNumber}` : `Equilibrio Resuelto: P${preset.exerciseNumber} (HT03)`,
  });

  return [apparatus];
}

/**
 * Pre-configured Complete Segunda Ley de Newton sin Fricción (HT01 U4) Assembly:
 * - 1 Interactive Newton Second Law Apparatus with connected masses, smooth table, forces & ropes
 */
export function createNewtonSecondLawAssembly(cx, cy, exerciseNumber = 7, options = {}) {
  const newtonDef = PHYSICS_OBJECT_DEFINITIONS.newton_frictionless_system;
  const isClean = options.cleanPractice !== false;
  const preset =
    newtonDef.presets.find(
      (p) => p.exerciseNumber === exerciseNumber && (isClean ? !p.showOfficialSolution : p.showOfficialSolution)
    ) || newtonDef.presets[0];

  const apparatus = createPhysicsElement('newton_frictionless_system', cx, cy, {
    exerciseNumber: preset.exerciseNumber,
    systemTitle: preset.systemTitle,
    apparatusType: preset.apparatusType,
    width: preset.width || newtonDef.defaultWidth,
    height: preset.height || newtonDef.defaultHeight,
    color: preset.color,
    mass: preset.mass || 8.0,
    mass1: preset.mass1 !== undefined ? preset.mass1 : 2.0,
    mass2: preset.mass2 !== undefined ? preset.mass2 : 6.0,
    appliedForce: preset.appliedForce !== undefined ? preset.appliedForce : 80.0,
    frictionCoeff: preset.frictionCoeff !== undefined ? preset.frictionCoeff : 0.0,
    angleDeg: preset.angleDeg || 0.0,
    userVectors: preset.userVectors ? [...preset.userVectors] : [],
    showOfficialSolution: !isClean,
    label: isClean
      ? `2ª Ley de Newton: P${preset.exerciseNumber} (Limpio para Clase)`
      : `2ª Ley Resuelta: P${preset.exerciseNumber} (HT01)`,
  });

  return [apparatus];
}



// ---------------------------------------------------------------------------
// SEGUNDA LEY DE NEWTON: helpers compartidos (render + anclas + simulación)
// ---------------------------------------------------------------------------

/** Normaliza alias de tipo de aparato (p.ej. 'inclined_plane_masses' del solver). */
export function normalizeNewtonApparatusType(type) {
  if (type === 'inclined_plane_masses' || type === 'inclined_plane') return 'inclined_plane_frictionless';
  if (type === 'atwood' || type === 'atwood_machine') return 'atwood_frictionless';
  const known = ['two_connected_blocks', 'single_block_force', 'vertical_cable_mass', 'atwood_frictionless', 'inclined_plane_frictionless'];
  return known.includes(type) ? type : 'two_connected_blocks';
}

/**
 * Dinámica teórica (μ = 0) calculada a partir de las propiedades reales del aparato.
 * Convención de signo de `a`:
 *  - Mesa / bloque simple: + hacia la derecha.
 *  - Cable vertical: + hacia arriba.
 *  - Atwood / plano inclinado: + cuando m₂ desciende.
 */
export function computeNewtonDynamics(props = {}, overrideForce) {
  const g = 9.8;
  const type = normalizeNewtonApparatusType(props.apparatusType);
  const defM1 = type === 'atwood_frictionless' ? 7 : (type === 'inclined_plane_frictionless' || type === 'vertical_cable_mass') ? 10 : type === 'single_block_force' ? 4 : 2;
  const defM2 = type === 'atwood_frictionless' ? 9 : type === 'inclined_plane_frictionless' ? 2 : 6;
  const m1 = Math.max(0.01, Number(props.mass1) || defM1);
  const m2 = Math.max(0.01, Number(props.mass2) || defM2);
  const rawF = overrideForce !== undefined ? overrideForce : Number(props.appliedForce);
  const F = Number.isFinite(rawF) ? rawF : 0;
  const thetaDeg = Number(props.angleDeg) > 0 ? Number(props.angleDeg) : 32;
  const th = (thetaDeg * Math.PI) / 180;

  const r = { type, g, m1, m2, F, thetaDeg, a: 0, T: 0, W1: m1 * g, W2: m2 * g, N1: m1 * g, N2: m2 * g, W1par: 0, formula: 'a = ΣF / m' };

  if (type === 'two_connected_blocks') {
    r.a = F / (m1 + m2);
    r.T = m1 * r.a;
    r.formula = 'a = F / (m₁ + m₂)';
  } else if (type === 'single_block_force') {
    r.a = F / m1;
    r.formula = 'a = F / m';
  } else if (type === 'vertical_cable_mass') {
    r.T = F;
    r.a = (F - m1 * g) / m1;
    r.formula = 'a = (T − W) / m';
  } else if (type === 'atwood_frictionless') {
    r.a = ((m2 - m1) * g) / (m1 + m2);
    r.T = (2 * m1 * m2 * g) / (m1 + m2);
    r.formula = 'a = (m₂ − m₁)·g / (m₁ + m₂)';
  } else if (type === 'inclined_plane_frictionless') {
    r.W1par = m1 * g * Math.sin(th);
    r.N1 = m1 * g * Math.cos(th);
    r.a = (m2 * g - r.W1par) / (m1 + m2);
    r.T = m2 * (g - r.a);
    r.formula = 'a = (m₂·g − m₁·g·senθ) / (m₁ + m₂)';
  }
  return r;
}

/**
 * Geometría exacta del aparato (píxeles de mundo) para un desplazamiento dado.
 * Devuelve posiciones de cuerpos y los límites de recorrido [minDisp, maxDisp]
 * para que nada se salga de la mesa / tarjeta.
 */
export function getNewtonApparatusLayout(el, dispOverride) {
  const { x, y, width, height } = el;
  const props = el.properties || {};
  const type = normalizeNewtonApparatusType(props.apparatusType);
  const rawDisp = dispOverride !== undefined ? dispOverride : Number(props.displacementX) || 0;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const L = { type };

  if (type === 'two_connected_blocks') {
    const tableX = x + 24;
    const tableW = width - 48;
    const tableY = y + height * 0.70;
    const b1W = 72, b1H = 50, b2W = 88, b2H = 56, cord = 95, arrowLen = 70;
    const b1X0 = tableX + 36;
    const b2X0 = b1X0 + b1W + cord;
    const maxDisp = Math.max(0, x + width - 22 - (b2X0 + b2W + arrowLen));
    const minDisp = -Math.max(0, b1X0 - tableX - 4);
    const d = clamp(rawDisp, minDisp, maxDisp);
    Object.assign(L, {
      tableX, tableW, tableY, b1W, b1H, b2W, b2H, arrowLen, b1X0, b2X0,
      b1X: b1X0 + d, b1Y: tableY - b1H, b2X: b2X0 + d, b2Y: tableY - b2H,
      minDisp, maxDisp, disp: d,
      bodies: {
        block1: { x: b1X0 + d + b1W / 2, y: tableY - b1H / 2 },
        block2: { x: b2X0 + d + b2W / 2, y: tableY - b2H / 2 },
      },
    });
  } else if (type === 'single_block_force') {
    const tableX = x + 30;
    const tableW = width - 60;
    const tableY = y + height * 0.70;
    const bW = 86, bH = 56, arrowLen = 70;
    const bX0 = tableX + 60;
    const maxDisp = Math.max(0, x + width - 22 - (bX0 + bW + arrowLen));
    const minDisp = -Math.max(0, bX0 - tableX - 4);
    const d = clamp(rawDisp, minDisp, maxDisp);
    Object.assign(L, {
      tableX, tableW, tableY, bW, bH, arrowLen, bX0, bX: bX0 + d, bY: tableY - bH,
      minDisp, maxDisp, disp: d,
      bodies: { block: { x: bX0 + d + bW / 2, y: tableY - bH / 2 } },
    });
  } else if (type === 'vertical_cable_mass') {
    const beamY = y + 62;
    const cx = x + width / 2;
    const mW = 76, mH = 56;
    const mY0 = y + height * 0.48;
    const maxDisp = Math.max(0, mY0 - (beamY + 30));
    const minDisp = -Math.max(0, y + height - 44 - mH - mY0);
    const d = clamp(rawDisp, minDisp, maxDisp);
    const mY = mY0 - d;
    Object.assign(L, {
      beamY, cx, mW, mH, mY0, mY, minDisp, maxDisp, disp: d,
      bodies: { mass: { x: cx, y: mY + mH / 2 } },
    });
  } else if (type === 'atwood_frictionless') {
    const pX = x + width / 2;
    const pY = y + 78;
    const r = 26;
    const m1W = 56, m1H = 48, m2W = 60, m2H = 54;
    const mY0 = pY + 120;
    const upRoom = mY0 - (pY + r + 12);
    const downRoom = y + height - 44 - Math.max(m1H, m2H) - mY0;
    const lim = Math.max(0, Math.min(upRoom, downRoom));
    const d = clamp(rawDisp, -lim, lim);
    const m1Y = mY0 - d;
    const m2Y = mY0 + d;
    Object.assign(L, {
      pX, pY, r, m1W, m1H, m2W, m2H, m1Y, m2Y, minDisp: -lim, maxDisp: lim, disp: d,
      bodies: {
        mass1: { x: pX - r, y: m1Y + m1H / 2 },
        mass2: { x: pX + r, y: m2Y + m2H / 2 },
      },
    });
  } else {
    // inclined_plane_frictionless
    const thetaDeg = Number(props.angleDeg) > 0 ? Number(props.angleDeg) : 32;
    const th = (thetaDeg * Math.PI) / 180;
    const groundY = y + height - 46;
    const baseX = x + 40;
    const maxH = height - 46 - 84;
    const run = Math.min(width * 0.58, maxH / Math.tan(th));
    const rise = run * Math.tan(th);
    const apexX = baseX + run;
    const apexY = groundY - rise;
    const slopeLen = Math.hypot(run, rise);
    const ux = -Math.cos(th), uy = Math.sin(th); // hacia abajo por la rampa
    const nx = -Math.sin(th), ny = -Math.cos(th); // normal saliente de la superficie
    const bL = 60, bH = 36, pr = 16;
    const Px = apexX + (bH / 2 - pr) * nx;
    const Py = apexY + (bH / 2 - pr) * ny;
    const hW = 28, hH = 38;
    const hangX = Px + pr;
    const hY0 = Py + Math.min(130, (groundY - Py) * 0.55);
    const d0 = slopeLen * 0.55;

    // + desplazamiento = m₂ baja y el bloque sube hacia la polea
    const maxDisp = Math.max(0, Math.min(groundY - 2 - hH - hY0, d0 - (bL / 2 + pr * 2 + 6)));
    const minDisp = -Math.max(0, Math.min(hY0 - (Py + pr + 10), slopeLen - bL / 2 - 4 - d0));
    const d = clamp(rawDisp, minDisp, maxDisp);
    const dist = d0 - d;
    const cX = apexX + dist * ux + (bH / 2) * nx;
    const cY = apexY + dist * uy + (bH / 2) * ny;
    const hY = hY0 + d;
    Object.assign(L, {
      thetaDeg, th, groundY, baseX, apexX, apexY, ux, uy, nx, ny, bL, bH, pr, Px, Py,
      hW, hH, hangX, hY, blockCX: cX, blockCY: cY, minDisp, maxDisp, disp: d,
      bodies: {
        block_plane: { x: cX, y: cY },
        hanging_mass: { x: hangX, y: hY + hH / 2 },
      },
    });
  }
  return L;
}
