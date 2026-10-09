// =========================================================================
// CUSTOM EXAMPLE BUILDER SERVICE (TEACHER'S EXPERIMENTAL WORKSHOP)
// Allows physics teachers to configure, save, and spawn fully functional
// custom laboratory experiments for each physics topic with support for:
// - Multiple objects (e.g., Encounter / Pursuit problems with 2+ carts)
// - Multiple vehicle / body types & models
// - Comprehensive custom attributes (velocity, accel, mass, color, pos, etc.)
// =========================================================================

import {
  createPhysicsElement,
  createPhysicsConnection,
  getCannonMuzzlePosition,
} from '../physics/physicsRegistry';

export const LOCAL_STORAGE_KEY = 'teacher_custom_physics_examples_v3';

// -------------------------------------------------------------------------
// CATALOGS OF VEHICLES & RIGID BODIES
// -------------------------------------------------------------------------

export const CART_TYPES_CATALOG = {
  standard: {
    id: 'standard',
    name: 'Carrito de Laboratorio Estándar',
    short: 'Estándar',
    icon: '🚗',
    defaultColor: '#0284c7',
    width: 105,
    height: 52,
    defaultMass: 1.5,
    desc: 'Móvil de baja fricción sobre ruedas con rodamientos',
  },
  sports: {
    id: 'sports',
    name: 'Móvil Rápido / Deportivo',
    short: 'Deportivo',
    icon: '🏎️',
    defaultColor: '#16a34a',
    width: 115,
    height: 48,
    defaultMass: 1.2,
    desc: 'Perfil aerodinámico alargado para alta velocidad',
  },
  truck: {
    id: 'truck',
    name: 'Camión / Vehículo Pesado',
    short: 'Pesado',
    icon: '🚛',
    defaultColor: '#d97706',
    width: 130,
    height: 60,
    defaultMass: 3.5,
    desc: 'Chasis robusto y pesado para estudios de inercia',
  },
  compact: {
    id: 'compact',
    name: 'Móvil Compacto con Sensor',
    short: 'Sensor',
    icon: '🚙',
    defaultColor: '#dc2626',
    width: 90,
    height: 48,
    defaultMass: 1.0,
    desc: 'Vehículo compacto con mástil para fotopuertas',
  },
};

export const BODY_TYPES_CATALOG = {
  lead_sphere: {
    id: 'lead_sphere',
    name: 'Esfera Metálica / Plomo',
    short: 'Esfera Plomo',
    icon: '⚪',
    defaultColor: '#64748b',
    width: 36,
    height: 36,
    defaultMass: 3.0,
  },
  tennis_ball: {
    id: 'tennis_ball',
    name: 'Pelota de Tenis / Goma',
    short: 'Pelota Goma',
    icon: '🎾',
    defaultColor: '#84cc16',
    width: 34,
    height: 34,
    defaultMass: 0.58,
  },
  lab_cylinder: {
    id: 'lab_cylinder',
    name: 'Cilindro de Laboratorio',
    short: 'Cilindro',
    icon: '🔋',
    defaultColor: '#0ea5e9',
    width: 32,
    height: 44,
    defaultMass: 1.8,
  },
  wooden_block: {
    id: 'wooden_block',
    name: 'Bloque de Madera',
    short: 'Bloque',
    icon: '📦',
    defaultColor: '#b45309',
    width: 40,
    height: 40,
    defaultMass: 1.2,
  },
};

// -------------------------------------------------------------------------
// TOPIC METADATA, SCENARIOS & DEFAULTS
// -------------------------------------------------------------------------

export const TOPIC_PRESETS_METADATA = {
  mru: {
    id: 'mru',
    name: 'Cinemática (MRU)',
    short: 'MRU',
    color: '#2563eb',
    formula: 'x(t) = x₀ + v·t • a = 0',
    scenarios: [
      { id: 'single', name: '1 Móvil Individual', desc: 'Un móvil a velocidad constante v' },
      { id: 'encounter', name: 'Encuentro (2 Móviles)', desc: 'Móvil A (→) y Móvil B (←) en sentidos opuestos' },
      { id: 'pursuit', name: 'Persecución (2 Móviles)', desc: 'Móvil rápido persigue a móvil lento (→)' },
      { id: 'race', name: 'Carrera (3 Móviles)', desc: 'Tres móviles con diferentes velocidades' },
    ],
    defaultConfig: {
      title: 'Problema MRU: Movimiento Uniforme',
      scenarioType: 'single',
      carts: [
        {
          id: 'c1',
          label: 'Móvil A',
          cartType: 'standard',
          velocity: 3.0,
          mass: 1.5,
          positionX: 0.0,
          direction: 1, // 1: right, -1: left
          color: '#0284c7',
        },
      ],
      includeTrack: true,
      trackLength: 6.0,
      includePhotogates: true,
      gate1Dist: 1.5,
      gate2Dist: 4.5,
      includeStickyNote: true,
    },
  },

  mruv: {
    id: 'mruv',
    name: 'Cinemática (MRUV)',
    short: 'MRUV',
    color: '#d97706',
    formula: 'v(t) = v₀ + a·t • d = v₀t + ½at²',
    scenarios: [
      { id: 'single', name: '1 Móvil Acelerado', desc: 'Aceleración constante v(t) = v₀ + a·t' },
      { id: 'braking', name: 'Frenado hasta Detenerse', desc: 'Móvil con rapidez inicial y aceleración de frenado a < 0' },
      { id: 'encounter', name: 'Encuentro MRUV (2 Móviles)', desc: 'Dos móviles acelerados al encuentro' },
      { id: 'pursuit', name: 'Persecución MRUV', desc: 'Móvil acelerado persigue a otro móvil' },
    ],
    defaultConfig: {
      title: 'Problema MRUV: Aceleración Constante',
      scenarioType: 'single',
      carts: [
        {
          id: 'c1',
          label: 'Móvil A',
          cartType: 'sports',
          initialVelocity: 1.0,
          acceleration: 2.0,
          mass: 1.5,
          positionX: 0.0,
          direction: 1,
          color: '#d97706',
        },
      ],
      includeTrack: true,
      trackLength: 8.0,
      includePhotogates: true,
      gate1Dist: 1.0,
      gate2Dist: 5.0,
      includeStickyNote: true,
    },
  },

  freefall: {
    id: 'freefall',
    name: 'Caída Libre (HT03)',
    short: 'Caída Libre',
    color: '#16a34a',
    formula: 'v(t) = g·t • h = ½g·t²',
    scenarios: [
      { id: 'drop_rest', name: 'Caída desde el Reposo (v₀ = 0)', desc: 'Cuerpo soltado desde altura h' },
      { id: 'thrown_down', name: 'Lanzamiento hacia Abajo (v₀ > 0)', desc: 'Cuerpo arrojado hacia abajo' },
      { id: 'two_bodies', name: 'Dos Cuerpos Simultáneos', desc: 'Comparación de masas y caída libre' },
    ],
    defaultConfig: {
      title: 'Laboratorio de Caída Libre',
      scenarioType: 'drop_rest',
      bodies: [
        {
          id: 'b1',
          label: 'Esfera A',
          bodyType: 'lead_sphere',
          mass: 2.0,
          height: 45.0,
          initialVelocity: 0.0,
          color: '#16a34a',
        },
      ],
      gravity: 9.8,
      includeTower: true,
      includeGroundSensor: true,
      includeStickyNote: true,
    },
  },

  tiro_vertical: {
    id: 'tiro_vertical',
    name: 'Tiro Vertical (HT04)',
    short: 'Tiro Vertical',
    color: '#db2777',
    formula: 'h_max = v₀² / (2g) • t_s = v₀ / g',
    scenarios: [
      { id: 'ground_launch', name: 'Tiro desde el Suelo', desc: 'Disparo vertical hasta altura máxima' },
      { id: 'cliff_launch', name: 'Tiro desde Azotea / Edificio', desc: 'Sube, alcanza cúspide y cae al suelo de la calle' },
      { id: 'two_projectiles', name: 'Dos Proyectiles (Encuentro Vertical)', desc: 'Uno sube mientras el otro se suelta' },
    ],
    defaultConfig: {
      title: 'Disparo de Tiro Vertical',
      scenarioType: 'ground_launch',
      bodies: [
        {
          id: 'b1',
          label: 'Proyectil 1',
          bodyType: 'lead_sphere',
          initialVelocity: 25.0,
          launchHeight: 0.0,
          mass: 1.5,
          color: '#db2777',
        },
      ],
      gravity: 9.8,
      includeTower: true,
      includeApexSensor: true,
      includeStickyNote: true,
    },
  },

  lanzamiento_horizontal: {
    id: 'lanzamiento_horizontal',
    name: 'Lanzamiento Horizontal (HT01)',
    short: 'Lanz. Horiz.',
    color: '#0891b2',
    formula: 'X = v₀x · √(2h/g) • y = ½g·t²',
    scenarios: [
      { id: 'cliff_standard', name: 'Lanzamiento desde Acantilado / Mesa', desc: 'Trayectoria curva hasta el suelo' },
      { id: 'target_impact', name: 'Disparo con Sensor de Blanco', desc: 'Medición de alcance exacto X' },
      { id: 'galileo_comparison', name: 'Comparación de Galileo', desc: 'Un cuerpo cae vertical y otro es lanzado horizontal' },
    ],
    defaultConfig: {
      title: 'Lanzamiento Horizontal',
      scenarioType: 'cliff_standard',
      height: 20.0,
      velocity: 18.0,
      mass: 2.0,
      bodyType: 'lead_sphere',
      gravity: 9.8,
      color: '#0891b2',
      includeCliff: true,
      includeLandingSensor: true,
      includeStickyNote: true,
    },
  },

  movimiento_proyectiles: {
    id: 'movimiento_proyectiles',
    name: 'Movimiento de Proyectiles (HT02)',
    short: 'Proyectiles',
    color: '#8b5cf6',
    formula: 'X_max = (v₀²·sin 2θ) / g',
    scenarios: [
      { id: 'ground_to_ground', name: 'Tiro Suelo a Suelo', desc: 'Parábola balística simétrica' },
      { id: 'elevated_launch', name: 'Disparo desde Colina / Altura', desc: 'Lanzador ubicado a altura y₀ > 0' },
      { id: 'wall_target', name: 'Disparo hacia Muro / Diana', desc: 'Prueba de impacto a distancia fija' },
    ],
    defaultConfig: {
      title: 'Tiro Balístico Parabólico',
      scenarioType: 'ground_to_ground',
      velocity: 24.0,
      angleDeg: 40.0,
      launchHeight: 0.0,
      mass: 2.0,
      bodyType: 'lead_sphere',
      gravity: 9.8,
      color: '#8b5cf6',
      includeCannon: true,
      includeLandingSensor: true,
      includeStickyNote: true,
    },
  },

  mcu: {
    id: 'mcu',
    name: 'Movimiento Circular Uniforme (MCU)',
    short: 'MCU',
    color: '#0284c7',
    formula: 'vt = ω·r • ac = ω²·r • T = 2π/ω',
    scenarios: [
      { id: 'single_particle', name: 'Partícula Única en Radio r', desc: 'Rapidez tangencial y aceleración centrípeta' },
      { id: 'two_particles_concentric', name: 'Dos Partículas Concéntricas (r₁ < r₂)', desc: 'Comparación: misma ω, diferentes v_t' },
    ],
    defaultConfig: {
      title: 'Plataforma Giratoria MCU',
      scenarioType: 'single_particle',
      radius: 1.2,
      radius2: 0.6,
      omega: 3.5,
      direction: 'ccw',
      color: '#0284c7',
      includeStickyNote: true,
    },
  },

  mcuv: {
    id: 'mcuv',
    name: 'Movimiento Circular Acelerado (MCUV)',
    short: 'MCUV',
    color: '#0891b2',
    formula: 'ω(t) = ω₀ + α·t • at = α·r',
    scenarios: [
      { id: 'accelerating', name: 'Arranque Acelerado (α > 0)', desc: 'Aceleración angular uniforme' },
      { id: 'decelerating', name: 'Frenado Angular hasta el Reposo (α < 0)', desc: 'Desaceleración angular uniforme' },
      { id: 'two_particles', name: 'Dos Radios Concéntricos Acelerados', desc: 'Comparación at y ac simultáneas' },
    ],
    defaultConfig: {
      title: 'Rotor Acelerado MCUV',
      scenarioType: 'accelerating',
      radius: 1.0,
      initialOmega: 2.0,
      alpha: 1.5,
      direction: 'ccw',
      color: '#0891b2',
      includeStickyNote: true,
    },
  },

  poleas_mcu: {
    id: 'poleas_mcu',
    name: 'Poleas MCU (HT01 U3)',
    short: 'Poleas MCU',
    color: '#059669',
    formula: 'v₁ = v₂ (Correa) | ω₁ = ω₂ (Mismo eje)',
    scenarios: [
      { id: 'belt', name: 'Transmisión por Correa / Faja (v₁ = v₂)', desc: 'Dos poleas conectadas por faja externa' },
      { id: 'concentric', name: 'Discos Concéntricos en Mismo Eje (ω₁ = ω₂)', desc: 'Dos poleas fijas solidarias al mismo eje' },
      { id: 'gears', name: 'Engranajes en Contacto Directo', desc: 'Transmisión tangencial con inversión de giro' },
    ],
    defaultConfig: {
      title: 'Banco de Transmisión por Poleas',
      scenarioType: 'belt',
      radius1: 0.25,
      radius2: 0.12,
      omega1: 6.0,
      color: '#059669',
      includeStickyNote: true,
    },
  },

  dcl: {
    id: 'dcl',
    name: 'Diagramas de Cuerpo Libre (DCL)',
    short: 'D.C.L.',
    color: '#ea580c',
    formula: 'a = g(m₃ - m₁ - μ m₂) / (m₁+m₂+m₃)',
    scenarios: [
      { id: 'table_three_masses', name: 'Mesa con 3 Masas y 2 Poleas', desc: 'm₁ colgada izq, m₂ mesa central, m₃ colgada der' },
      { id: 'table_two_masses', name: 'Mesa con 2 Masas', desc: 'm₁ mesa horizontal, m₂ colgada der' },
    ],
    defaultConfig: {
      title: 'Mesa Experimental de Dinámica y Fuerzas',
      scenarioType: 'table_three_masses',
      m1: 4.0,
      m2: 10.0,
      m3: 7.0,
      mu_k: 0.15,
      isCleanPractice: true,
      includeStickyNote: true,
    },
  },

  equilibrio: {
    id: 'equilibrio',
    name: 'Equilibrio Traslacional (1ª Ley)',
    short: 'Equilibrio',
    color: '#059669',
    formula: 'ΣFx = 0 • ΣFy = 0 (a = 0)',
    scenarios: [
      { id: 'cable_knot_wall', name: 'P1: Cable en Pared y Nudo Central (50°)', desc: 'Cable horizontal y diagonal a 50° sosteniendo peso W' },
      { id: 'two_pulleys_three_weights', name: 'P2: Sistema 2 Poleas y 3 Pesas', desc: 'Dos poleas superiores equilibrando pesas FW2 y FW3' },
      { id: 'engine_suspended_cables', name: 'P3: Motor Suspendido por Cables AB y AC', desc: 'Motor de carga suspendido entre vigas' },
      { id: 'triangular_knot_slope', name: 'P4: Nudo con Pendiente 3-4-5', desc: 'Cables con pendiente proporcional y ángulo vertical' },
      { id: 'crate_two_cables', name: 'P5: Caja con 2 Cables en Tensión', desc: 'Caja con cables a 30° y pendiente geométrica' },
      { id: 'pulley_cylinder_knot', name: 'P6: Cilindro con Polea a 30°', desc: 'Cilindro contrapeso sobre polea' },
      { id: 'traffic_lights_span', name: 'P7: Semáforos en Vano de Cables', desc: 'Dos cargas en vano de 3 tramos' },
      { id: 'double_inclined_planes', name: 'P8: Planos Inclinados Dobles', desc: 'Polea y cajas en pendientes de 70° y 20°' },
    ],
    defaultConfig: {
      title: 'Aparato de Equilibrio de Cables',
      scenarioType: 'cable_knot_wall',
      load: 300,
      angle1: 35,
      angle2: 55,
      isCleanPractice: true,
      includeStickyNote: true,
    },
  },

  segunda_ley_newton: {
    id: 'segunda_ley_newton',
    name: 'Segunda Ley de Newton (Sin Fricción)',
    short: '2ª Ley Newton',
    color: '#2563eb',
    formula: 'a = ΣF / m • T = m₁·a',
    scenarios: [
      { id: 'two_connected_blocks', name: 'P7: Dos Bloques Conectados por Cuerda', desc: 'm₁ y m₂ sobre mesa lisa jalados por fuerza horizontal F' },
      { id: 'single_block_force', name: 'P1/P2: Bloque Único Jalado por Fuerza F', desc: 'Masa m sobre superficie horizontal sin fricción acelerada por fuerza F' },
      { id: 'vertical_cable_mass', name: 'P3: Montacargas / Cable Vertical', desc: 'Masa m izada verticalmente con cable y tensión T' },
      { id: 'atwood_frictionless', name: 'P6: Máquina de Atwood Sin Fricción', desc: 'Dos masas suspendidas de polea ideal sin masa' },
      { id: 'inclined_plane_frictionless', name: 'P8: Plano Inclinado 32° Sin Fricción', desc: 'Bloque en rampa conectado por polea a masa colgante' },
    ],
    defaultConfig: {
      title: 'Sistema de Dinámica de Newton Sin Fricción',
      scenarioType: 'two_connected_blocks',
      mass1: 2.0,
      mass2: 6.0,
      appliedForce: 80.0,
      frictionCoeff: 0.0,
      isCleanPractice: true,
      includeStickyNote: true,
    },
  },

  mechanics: {
    id: 'mechanics',
    name: 'Dinámica (Máquina de Atwood)',
    short: 'Dinámica',
    color: '#4f46e5',
    formula: 'a = g·(m_A - m_B) / (m_A + m_B)',
    scenarios: [
      { id: 'classic_atwood', name: 'Máquina de Atwood Clásica (2 Masas)', desc: 'Dos masas colgadas verticalmente' },
    ],
    defaultConfig: {
      title: 'Máquina de Atwood Experimental',
      scenarioType: 'classic_atwood',
      massA: 80.0,
      massB: 50.0,
      gravity: 9.8,
      includeStickyNote: true,
    },
  },
};

// -------------------------------------------------------------------------
// LOCAL STORAGE PERSISTENCE
// -------------------------------------------------------------------------

export function loadTeacherCustomExamples(topicFilter = null) {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    if (topicFilter) {
      return list.filter((item) => item.topic === topicFilter);
    }
    return list;
  } catch (err) {
    console.error('Error loading custom teacher examples:', err);
    return [];
  }
}

export function saveTeacherCustomExample(exampleData) {
  try {
    const current = loadTeacherCustomExamples();
    const existingIndex = current.findIndex((item) => item.id === exampleData.id);
    let updated;
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...exampleData, updatedAt: Date.now() };
    } else {
      updated = [
        {
          ...exampleData,
          id: exampleData.id || `custom_ex_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          createdAt: Date.now(),
        },
        ...current,
      ];
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving custom teacher example:', err);
    return [];
  }
}

export function deleteTeacherCustomExample(exampleId) {
  try {
    const current = loadTeacherCustomExamples();
    const updated = current.filter((item) => item.id !== exampleId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error deleting custom teacher example:', err);
    return [];
  }
}

// -------------------------------------------------------------------------
// THEORETICAL PHYSICS PREVIEW CALCULATOR
// -------------------------------------------------------------------------

export function calculateTopicPhysicsPreview(topicId, config) {
  const g = Number(config.gravity) || 9.8;
  const scenario = config.scenarioType || 'single';

  switch (topicId) {
    case 'mru': {
      const carts = Array.isArray(config.carts) && config.carts.length > 0
        ? config.carts
        : [{ label: 'Móvil A', velocity: config.velocity || 3.0, mass: config.mass || 1.5, cartType: 'standard', direction: 1, positionX: 0 }];

      const L = Number(config.trackLength) || 6.0;

      if (carts.length === 1) {
        const c1 = carts[0];
        const v = (Number(c1.velocity) || 0) * (c1.direction || 1);
        const tTravel = v !== 0 ? Math.abs(L / v).toFixed(2) : '∞';
        const typeInfo = CART_TYPES_CATALOG[c1.cartType] || CART_TYPES_CATALOG.standard;
        return {
          badge: `${typeInfo.icon} ${c1.label}: v = ${v > 0 ? `+${v}` : v} m/s • ${c1.mass || 1.5} kg`,
          summary: `1 Móvil (${typeInfo.short}) • Recorrido en ${L}m: ~${tTravel} s • a = 0`,
          mathDetails: [
            { label: 'Ecuación Horaria', expr: `x(t) = ${c1.positionX || 0} + (${v})·t` },
            { label: 'Tiempo de Recorrido', expr: `t = L / |v| = ${L} / ${Math.abs(v) || 0.001} ≈ ${tTravel} s` },
            { label: 'Condición Física', expr: 'v = constante ⇒ a = 0 (1ª Ley de Newton)' },
          ],
        };
      }

      if (carts.length >= 2 && scenario === 'encounter') {
        const c1 = carts[0];
        const c2 = carts[1];
        const v1 = Math.abs(Number(c1.velocity) || 3.0);
        const v2 = Math.abs(Number(c2.velocity) || 2.0);
        const x01 = Number(c1.positionX) || 0.0;
        const x02 = Number(c2.positionX) || L;
        const vRel = v1 + v2;
        const tEnc = vRel > 0 ? (Math.abs(x02 - x01) / vRel).toFixed(2) : '∞';
        const xEnc = (x01 + v1 * Number(tEnc)).toFixed(2);
        return {
          badge: `Encuentro: ${c1.label} (${v1} m/s →) con ${c2.label} (← ${v2} m/s)`,
          summary: `Tiempo de Encuentro: ${tEnc} s • Posición de Encuentro: x = ${xEnc} m`,
          mathDetails: [
            { label: 'Ecuación Móvil A', expr: `xA(t) = ${x01} + (${v1})·t` },
            { label: 'Ecuación Móvil B', expr: `xB(t) = ${x02} - (${v2})·t` },
            { label: 'Tiempo de Encuentro', expr: `te = |x0B - x0A| / (vA + vB) = ${Math.abs(x02 - x01).toFixed(1)} / (${v1} + ${v2}) ≈ ${tEnc} s` },
            { label: 'Punto de Encuentro', expr: `xe = xA(te) = ${x01} + (${v1})·(${tEnc}) ≈ ${xEnc} m` },
          ],
        };
      }

      if (carts.length >= 2 && scenario === 'pursuit') {
        const c1 = carts[0];
        const c2 = carts[1];
        const v1 = Math.abs(Number(c1.velocity) || 4.0); // Perseguidor
        const v2 = Math.abs(Number(c2.velocity) || 2.0); // Perseguido
        const x01 = Number(c1.positionX) || 0.0;
        const x02 = Number(c2.positionX) || 3.0;
        const deltaV = v1 - v2;
        const tPur = deltaV > 0 ? ((x02 - x01) / deltaV).toFixed(2) : 'Nunca (vA ≤ vB)';
        const xPur = deltaV > 0 ? (x01 + v1 * Number(tPur)).toFixed(2) : '—';
        return {
          badge: `Persecución: ${c1.label} (vA = ${v1} m/s) persigue a ${c2.label} (vB = ${v2} m/s)`,
          summary: deltaV > 0 ? `Tiempo de alcance: ${tPur} s • Posición: x = ${xPur} m` : 'El móvil trasero no alcanza al delantero',
          mathDetails: [
            { label: 'Ecuación Perseguidor (A)', expr: `xA(t) = ${x01} + (${v1})·t` },
            { label: 'Ecuación Perseguido (B)', expr: `xB(t) = ${x02} + (${v2})·t` },
            { label: 'Tiempo de Alcance', expr: deltaV > 0 ? `ta = (x0B - x0A) / (vA - vB) = ${(x02 - x01).toFixed(1)} / (${v1} - ${v2}) ≈ ${tPur} s` : 'vA ≤ vB ⇒ No hay alcance' },
          ],
        };
      }

      // Default multiple carts
      const summaryBadges = carts.map((c) => `${c.label} (${c.velocity} m/s)`).join(', ');
      return {
        badge: `${carts.length} Móviles en Riel de ${L}m`,
        summary: summaryBadges,
        mathDetails: carts.map((c) => ({
          label: `Ecuación ${c.label}`,
          expr: `x(t) = ${c.positionX || 0} + (${c.velocity || 2})·t`,
        })),
      };
    }

    case 'mruv': {
      const carts = Array.isArray(config.carts) && config.carts.length > 0
        ? config.carts
        : [{ label: 'Móvil A', initialVelocity: config.initialVelocity || 1.0, acceleration: config.acceleration || 2.0, mass: 1.5, cartType: 'sports', direction: 1, positionX: 0 }];

      const L = Number(config.trackLength) || 8.0;

      if (carts.length === 1) {
        const c1 = carts[0];
        const v0 = Number(c1.initialVelocity) || 0.0;
        const a = Number(c1.acceleration) || 0.0;
        const typeInfo = CART_TYPES_CATALOG[c1.cartType] || CART_TYPES_CATALOG.sports;

        if (scenario === 'braking' || a < 0) {
          const tStop = a !== 0 ? Math.abs(v0 / a).toFixed(2) : '0';
          const dStop = a !== 0 ? Math.abs((v0 * v0) / (2 * Math.abs(a))).toFixed(2) : '0';
          return {
            badge: `${typeInfo.icon} Frenado: v₀ = ${v0} m/s • a = ${a} m/s²`,
            summary: `Distancia de frenado: ${dStop} m • Tiempo hasta detenerse: ${tStop} s`,
            mathDetails: [
              { label: 'Tiempo hasta Detenerse', expr: `t_alto = v₀ / |a| = ${v0} / ${Math.abs(a)} ≈ ${tStop} s` },
              { label: 'Distancia de Frenado', expr: `d_frenado = v₀² / (2·|a|) = ${v0}² / (2·${Math.abs(a)}) ≈ ${dStop} m` },
              { label: 'Velocidad Final', expr: 'vf = 0 m/s' },
            ],
          };
        }

        const vf = Math.sqrt(Math.max(0, v0 * v0 + 2 * a * L)).toFixed(2);
        return {
          badge: `${typeInfo.icon} ${c1.label}: v₀ = ${v0} m/s • a = ${a > 0 ? `+${a}` : a} m/s²`,
          summary: `1 Móvil (${typeInfo.short}) • vf al final de ${L}m: ~${vf} m/s`,
          mathDetails: [
            { label: 'Ecuación de Velocidad', expr: `v(t) = ${v0} + (${a})·t` },
            { label: 'Ecuación de Posición', expr: `x(t) = ${c1.positionX || 0} + ${v0}·t + ½·(${a})·t²` },
            { label: 'Velocidad Final Teórica', expr: `vf = √(v₀² + 2·a·L) ≈ ${vf} m/s` },
          ],
        };
      }

      return {
        badge: `${carts.length} Móviles Acelerados`,
        summary: `Configuración MRUV (${scenario}) con ${carts.length} vehículos`,
        mathDetails: carts.map((c) => ({
          label: `Ecuación ${c.label}`,
          expr: `v(t) = ${c.initialVelocity || 0} + (${c.acceleration || 1})·t`,
        })),
      };
    }

    case 'freefall': {
      const bodies = Array.isArray(config.bodies) && config.bodies.length > 0
        ? config.bodies
        : [{ label: 'Esfera A', bodyType: 'lead_sphere', mass: config.mass || 2.0, height: config.height || 45.0, initialVelocity: 0.0 }];

      const b1 = bodies[0];
      const h = Number(b1.height) || 45.0;
      const v0 = Number(b1.initialVelocity) || 0.0;
      const bodyInfo = BODY_TYPES_CATALOG[b1.bodyType] || BODY_TYPES_CATALOG.lead_sphere;

      // h = v0*t + 1/2*g*t^2 => 1/2*g*t^2 + v0*t - h = 0
      const disc = v0 * v0 + 2 * g * h;
      const tFall = disc >= 0 ? ((-v0 + Math.sqrt(disc)) / g).toFixed(2) : '0';
      const vf = Math.sqrt(Math.max(0, disc)).toFixed(2);

      return {
        badge: `${bodyInfo.icon} ${b1.label}: h = ${h} m • m = ${b1.mass} kg`,
        summary: `${bodyInfo.name} • Tiempo de caída: ${tFall} s • vf: ${vf} m/s (${(vf * 3.6).toFixed(1)} km/h)`,
        mathDetails: [
          { label: 'Tiempo de Caída', expr: v0 === 0 ? `t = √(2·h / g) ≈ ${tFall} s` : `t = (-v₀ + √(v₀² + 2·g·h)) / g ≈ ${tFall} s` },
          { label: 'Rapidez de Impacto', expr: `vf = √(v₀² + 2·g·h) ≈ ${vf} m/s` },
          { label: 'Gravedad Usada', expr: `g = ${g} m/s²` },
        ],
      };
    }

    case 'tiro_vertical': {
      const bodies = Array.isArray(config.bodies) && config.bodies.length > 0
        ? config.bodies
        : [{ label: 'Proyectil 1', bodyType: 'lead_sphere', initialVelocity: config.initialVelocity || 25.0, launchHeight: 0.0, mass: 1.5 }];

      const b1 = bodies[0];
      const v0 = Number(b1.initialVelocity) || 25.0;
      const y0 = Number(b1.launchHeight) || 0.0;
      const hMaxFromLaunch = (v0 * v0) / (2 * g);
      const totalHMax = (y0 + hMaxFromLaunch).toFixed(2);
      const tUp = (v0 / g).toFixed(2);
      // Total flight time to ground: y(t) = y0 + v0*t - 1/2*g*t^2 = 0
      const disc = v0 * v0 + 2 * g * y0;
      const tTotal = disc >= 0 ? ((v0 + Math.sqrt(disc)) / g).toFixed(2) : (2 * Number(tUp)).toFixed(2);

      return {
        badge: `v₀ = ${v0} m/s ↑ • y₀ = ${y0} m`,
        summary: `Altura máx total: ${totalHMax} m • Tiempo de subida: ${tUp} s • Tiempo total: ${tTotal} s`,
        mathDetails: [
          { label: 'Altura Máxima Total', expr: `Y_max = y₀ + v₀² / (2·g) = ${y0} + ${hMaxFromLaunch.toFixed(2)} ≈ ${totalHMax} m` },
          { label: 'Tiempo de Subida', expr: `t_subida = v₀ / g = ${v0} / ${g} ≈ ${tUp} s` },
          { label: 'Tiempo Total de Vuelo', expr: `t_vuelo ≈ ${tTotal} s` },
        ],
      };
    }

    case 'lanzamiento_horizontal': {
      const h = Number(config.height) || 20.0;
      const v0x = Number(config.velocity) || 18.0;
      const tFlight = Math.sqrt((2 * h) / g).toFixed(2);
      const rangeX = (v0x * Number(tFlight)).toFixed(2);
      const vyImpact = (g * Number(tFlight)).toFixed(2);
      const vImpact = Math.sqrt(v0x * v0x + vyImpact * vyImpact).toFixed(2);
      return {
        badge: `h = ${h} m • v₀x = ${v0x} m/s`,
        summary: `Alcance horizontal: ${rangeX} m • Tiempo de vuelo: ${tFlight} s • v_impacto: ${vImpact} m/s`,
        mathDetails: [
          { label: 'Tiempo de Caída', expr: `t = √(2·h / g) = √(2·${h} / ${g}) ≈ ${tFlight} s` },
          { label: 'Alcance Horizontal', expr: `X = v₀x · t = ${v0x} · ${tFlight} ≈ ${rangeX} m` },
          { label: 'Rapidez de Impacto', expr: `v_imp = √(v₀x² + (g·t)²) ≈ ${vImpact} m/s` },
        ],
      };
    }

    case 'movimiento_proyectiles': {
      const v0 = Number(config.velocity) || 24.0;
      const deg = Number(config.angleDeg) || 40.0;
      const y0 = Number(config.launchHeight) || 0.0;
      const rad = (deg * Math.PI) / 180;
      const v0x = v0 * Math.cos(rad);
      const v0y = v0 * Math.sin(rad);
      const disc = v0y * v0y + 2 * g * y0;
      const tFlight = disc >= 0 ? ((v0y + Math.sqrt(disc)) / g).toFixed(2) : '0';
      const rangeX = (v0x * Number(tFlight)).toFixed(2);
      const hMax = (y0 + (v0y * v0y) / (2 * g)).toFixed(2);

      return {
        badge: `v₀ = ${v0} m/s • θ = ${deg}°${y0 > 0 ? ` • y₀ = ${y0}m` : ''}`,
        summary: `Alcance máx: ${rangeX} m • Altura máx: ${hMax} m • Tiempo de vuelo: ${tFlight} s`,
        mathDetails: [
          { label: 'Componentes de Velocidad', expr: `v₀x = ${v0x.toFixed(2)} m/s, v₀y = ${v0y.toFixed(2)} m/s` },
          { label: 'Altura Máxima', expr: `Y_max = y₀ + v₀y² / (2·g) ≈ ${hMax} m` },
          { label: 'Alcance Horizontal Total', expr: `X_max = v₀x · t_vuelo ≈ ${rangeX} m` },
        ],
      };
    }

    case 'mcu': {
      const r1 = Number(config.radius) || 1.2;
      const r2 = Number(config.radius2) || 0.6;
      const w = Number(config.omega) || 3.5;
      const isConcentric = scenario === 'two_particles_concentric';
      const vt1 = (w * r1).toFixed(2);
      const vt2 = (w * r2).toFixed(2);
      const ac1 = (w * w * r1).toFixed(2);
      const period = ((2 * Math.PI) / w).toFixed(2);

      return {
        badge: isConcentric ? `ω = ${w} rad/s • r₁ = ${r1}m, r₂ = ${r2}m` : `r = ${r1} m • ω = ${w} rad/s`,
        summary: isConcentric
          ? `Partícula 1 (r=${r1}m): vt=${vt1} m/s • Partícula 2 (r=${r2}m): vt=${vt2} m/s`
          : `Rapidez tangencial: ${vt1} m/s • Aceleración centrípeta: ${ac1} m/s² • T = ${period} s`,
        mathDetails: [
          { label: 'Rapidez Tangencial', expr: `vt₁ = ω·r₁ = ${w}·${r1} = ${vt1} m/s${isConcentric ? ` | vt₂ = ${w}·${r2} = ${vt2} m/s` : ''}` },
          { label: 'Aceleración Centrípeta', expr: `ac = ω²·r = ${w}²·${r1} = ${ac1} m/s²` },
          { label: 'Período', expr: `T = 2π / ω ≈ ${period} s (Frecuencia: ${(1 / Number(period)).toFixed(2)} Hz)` },
        ],
      };
    }

    case 'mcuv': {
      const r = Number(config.radius) || 1.0;
      const w0 = Number(config.initialOmega) || 2.0;
      const alpha = Number(config.alpha) || 1.5;
      const at = (Math.abs(alpha) * r).toFixed(2);
      const ac0 = (w0 * w0 * r).toFixed(2);

      return {
        badge: `ω₀ = ${w0} rad/s • α = ${alpha} rad/s²`,
        summary: `Aceleración tangencial: at = ${at} m/s² • Aceleración centrípeta inicial: ac₀ = ${ac0} m/s²`,
        mathDetails: [
          { label: 'Aceleración Tangencial', expr: `at = α·r = ${alpha} · ${r} = ${at} m/s²` },
          { label: 'Aceleración Centrípeta Inicial', expr: `ac₀ = ω₀²·r = ${w0}² · ${r} = ${ac0} m/s²` },
          { label: 'Ecuación Horaria Angular', expr: `ω(t) = ${w0} + (${alpha})·t` },
        ],
      };
    }

    case 'poleas_mcu': {
      const r1 = Number(config.radius1) || 0.25;
      const r2 = Number(config.radius2) || 0.12;
      const w1 = Number(config.omega1) || 6.0;
      const isConcentric = scenario === 'concentric';
      const w2 = isConcentric ? w1 : Number(((w1 * r1) / r2).toFixed(2));
      const vBelt = (w1 * r1).toFixed(2);

      return {
        badge: `R₁ = ${r1 * 100}cm, R₂ = ${r2 * 100}cm`,
        summary: `ω₁ = ${w1} rad/s ⇒ ω₂ = ${w2} rad/s • Rapidez de faja: ${vBelt} m/s`,
        mathDetails: [
          { label: 'Relación Cinemática', expr: isConcentric ? 'ω₁ = ω₂ (Mismo eje solidario)' : `v₁ = v₂ ⇒ ω₂ = ω₁·(R₁/R₂) = ${w1}·(${r1}/${r2}) = ${w2} rad/s` },
          { label: 'Velocidad Lineal de Faja', expr: `v = ω₁·R₁ = ${w1}·${r1} = ${vBelt} m/s` },
        ],
      };
    }

    case 'dcl': {
      const is3M = scenario === 'table_three_masses';
      const m1 = Number(config.m1) || 4.0;
      const m2 = Number(config.m2) || 10.0;
      const m3 = Number(config.m3) || 7.0;
      const mu = Number(config.mu_k) || 0.15;
      let aVal, t1Val, t2Val;

      if (is3M) {
        const netPull = g * (m3 - m1 - mu * m2);
        const totalMass = m1 + m2 + m3;
        aVal = Math.max(0, netPull / totalMass).toFixed(3);
        t1Val = (m1 * (g + Number(aVal))).toFixed(1);
        t2Val = (m3 * (g - Number(aVal))).toFixed(1);
      } else {
        const netPull = g * (m2 - mu * m1);
        const totalMass = m1 + m2;
        aVal = Math.max(0, netPull / totalMass).toFixed(3);
        t1Val = (m2 * (g - Number(aVal))).toFixed(1);
        t2Val = '—';
      }

      return {
        badge: is3M ? `m₁=${m1}kg, m₂=${m2}kg, m₃=${m3}kg` : `m₁=${m1}kg, m₂=${m2}kg`,
        summary: `Aceleración del sistema: a = ${aVal} m/s² • μk = ${mu}`,
        mathDetails: [
          { label: 'Aceleración del Sistema', expr: `a = [g·(${is3M ? 'm₃ - m₁ - μ·m₂' : 'm₂ - μ·m₁'})] / M_tot ≈ ${aVal} m/s²` },
          { label: 'Tensiones en Cuerdas', expr: is3M ? `T₁ = ${t1Val} N, T₂ = ${t2Val} N` : `T = ${t1Val} N` },
          { label: 'Fuerza de Fricción', expr: `fk = μ·m·g = ${mu}·${is3M ? m2 : m1}·${g} ≈ ${(mu * (is3M ? m2 : m1) * g).toFixed(1)} N` },
        ],
      };
    }

    case 'equilibrio': {
      const load = Number(config.load) || 300;
      const th1 = Number(config.angle1) || 35;
      const th2 = Number(config.angle2) || 55;
      const rad1 = (th1 * Math.PI) / 180;
      const rad2 = (th2 * Math.PI) / 180;
      const denom = Math.sin(rad1) + (Math.cos(rad1) / Math.cos(rad2)) * Math.sin(rad2);
      const ta = (load / denom).toFixed(1);
      const tb = ((Number(ta) * Math.cos(rad1)) / Math.cos(rad2)).toFixed(1);

      return {
        badge: `W = ${load} N • θ₁=${th1}°, θ₂=${th2}°`,
        summary: `ΣFx = 0, ΣFy = 0 (1ª Ley) • TA = ${ta} N, TB = ${tb} N`,
        mathDetails: [
          { label: 'Equilibrio Horizontal', expr: 'ΣFx = 0 ⇒ TA·cos θ₁ - TB·cos θ₂ = 0' },
          { label: 'Equilibrio Vertical', expr: 'ΣFy = 0 ⇒ TA·sin θ₁ + TB·sin θ₂ - W = 0' },
          { label: 'Tensiones Resultantes', expr: `TA = ${ta} N, TB = ${tb} N` },
        ],
      };
    }

    case 'segunda_ley_newton': {
      const m1 = Number(config.mass1) || 2.0;
      const m2 = Number(config.mass2) || 6.0;
      const F = Number(config.appliedForce) || 80.0;
      const appType = config.scenarioType || 'two_connected_blocks';

      let aVal = 0;
      let tVal = 0;
      if (appType === 'two_connected_blocks') {
        aVal = F / (m1 + m2);
        tVal = m1 * aVal;
      } else if (appType === 'single_block_force') {
        aVal = F / m1;
        tVal = 0;
      } else if (appType === 'vertical_cable_mass') {
        aVal = (F - m1 * g) / m1;
        tVal = F;
      } else if (appType === 'atwood_frictionless') {
        aVal = (g * Math.abs(m2 - m1)) / (m1 + m2);
        tVal = (2 * m1 * m2 * g) / (m1 + m2);
      } else if (appType === 'inclined_plane_frictionless') {
        const rad = (32 * Math.PI) / 180;
        aVal = (m2 * g - m1 * g * Math.sin(rad)) / (m1 + m2);
        tVal = m2 * (g - aVal);
      }

      return {
        badge: `m₁ = ${m1} kg, m₂ = ${m2} kg • F = ${F} N`,
        summary: `Segunda Ley: a = ${aVal.toFixed(2)} m/s² • Tensión Cuerda T = ${tVal.toFixed(1)} N`,
        mathDetails: [
          { label: 'Ecuación Fundamental', expr: 'ΣF = m_tot · a' },
          { label: 'Aceleración del Sistema', expr: `a = ${aVal.toFixed(2)} m/s²` },
          { label: 'Tensión en la Cuerda', expr: `T = ${tVal.toFixed(1)} N` },
        ],
      };
    }

    case 'mechanics': {
      const mA = Number(config.massA) || 80;
      const mB = Number(config.massB) || 50;
      const aAtwood = (g * Math.abs(mA - mB) / (mA + mB)).toFixed(2);
      const tension = ((2 * mA * mB * g) / (mA + mB)).toFixed(1);

      return {
        badge: `mA = ${mA} kg, mB = ${mB} kg`,
        summary: `Aceleración Atwood: a = ${aAtwood} m/s² • Tensión: T = ${tension} N`,
        mathDetails: [
          { label: 'Aceleración del Sistema', expr: `a = g·|mA - mB| / (mA + mB) ≈ ${aAtwood} m/s²` },
          { label: 'Tensión en la Cuerda', expr: `T = 2·mA·mB·g / (mA + mB) ≈ ${tension} N` },
        ],
      };
    }

    default:
      return {
        badge: 'Personalizado',
        summary: 'Configuración personalizada del profesor',
        mathDetails: [],
      };
  }
}

// -------------------------------------------------------------------------
// CANVAS ASSEMBLY ELEMENT BUILDER
// -------------------------------------------------------------------------

export function buildCustomExampleBoardElements(customExample, cx, cy) {
  const { topic, config } = customExample;
  const elements = [];
  const g = Number(config.gravity) || 9.8;
  const metrics = calculateTopicPhysicsPreview(topic, config);
  const scenario = config.scenarioType || 'single';

  // Optional sticky note with educational data & resolved formulas
  if (config.includeStickyNote !== false) {
    const noteLines = [
      `📌 ${config.title || 'Ejemplo del Profesor'}`,
      `Tema: ${TOPIC_PRESETS_METADATA[topic]?.name || topic}`,
      `Valores: ${metrics.badge}`,
      `Comportamiento: ${metrics.summary}`,
      '',
      'Ecuaciones Didácticas:',
      ...metrics.mathDetails.map((m) => `• ${m.label}: ${m.expr}`),
    ];

    const noteEl = {
      id: `sticky-note-ex-${Date.now()}`,
      type: 'sticky',
      x: Math.round(cx - 370),
      y: Math.round(cy - 130),
      width: 250,
      height: Math.max(180, 50 + noteLines.length * 17),
      text: noteLines.join('\n'),
      color: '#fef08a',
    };
    elements.push(noteEl);
  }

  switch (topic) {
    case 'mru':
    case 'mruv': {
      const isMruv = topic === 'mruv';
      const rawCarts = Array.isArray(config.carts) && config.carts.length > 0
        ? config.carts
        : [
            {
              id: 'c1',
              label: 'Móvil A',
              cartType: 'standard',
              velocity: config.velocity || 3.0,
              initialVelocity: config.initialVelocity || 1.0,
              acceleration: config.acceleration || 2.0,
              mass: config.mass || 1.5,
              positionX: 0.0,
              direction: 1,
              color: isMruv ? '#d97706' : '#0284c7',
            },
          ];

      const trackL = Number(config.trackLength) || (rawCarts.length > 1 ? 10.0 : 6.0);
      const pxPerM = Math.max(70, Math.min(105, 750 / trackL));
      const trackW = Math.round(trackL * pxPerM);
      const trackH = 38;

      if (config.includeTrack) {
        const track = createPhysicsElement('mru_track', cx, cy + 30, {
          label: `Riel Graduado (${trackL} m)`,
          width: trackW,
          height: trackH,
          lengthMeters: trackL,
        });
        elements.push(track);
      }

      const trackLeftX = cx - trackW / 2;

      rawCarts.forEach((cartCfg, idx) => {
        const typeInfo = CART_TYPES_CATALOG[cartCfg.cartType] || CART_TYPES_CATALOG.standard;
        const cWidth = typeInfo.width;
        const cHeight = typeInfo.height;
        const dir = cartCfg.direction !== undefined ? cartCfg.direction : 1;
        const rawVel = isMruv ? (Number(cartCfg.initialVelocity) || 0) : (Number(cartCfg.velocity) || 2.0);
        const signedVel = dir < 0 ? -Math.abs(rawVel) : Math.abs(rawVel);
        const accel = isMruv ? (Number(cartCfg.acceleration) || 0) : 0;
        const massVal = Number(cartCfg.mass) || typeInfo.defaultMass;

        // Position along the track
        let posX = Number(cartCfg.positionX);
        if (isNaN(posX)) {
          if (scenario === 'encounter' && idx === 1) {
            posX = trackL - 0.5;
          } else if (scenario === 'pursuit' && idx === 1) {
            posX = 3.0;
          } else {
            posX = idx * 1.5;
          }
        }

        const worldCartX = config.includeTrack
          ? trackLeftX + Math.max(20, Math.min(trackW - cWidth - 20, posX * pxPerM)) + cWidth / 2
          : cx + (idx - (rawCarts.length - 1) / 2) * 130;

        const worldCartY = config.includeTrack ? cy - 8 : cy;

        const cartEl = createPhysicsElement(isMruv ? 'mruv_cart' : 'mru_cart', worldCartX, worldCartY, {
          label: cartCfg.label || `${typeInfo.name} ${idx + 1}`,
          cartType: cartCfg.cartType,
          velocity: signedVel,
          initialVelocity: signedVel,
          acceleration: accel,
          initialAcceleration: accel,
          mass: massVal,
          color: cartCfg.color || typeInfo.defaultColor,
          width: cWidth,
          height: cHeight,
          showVector: true,
          showAccelerationVector: isMruv,
        });
        elements.push(cartEl);
      });

      if (config.includePhotogates && config.includeTrack) {
        const g1 = Number(config.gate1Dist) || (trackL * 0.25);
        const g2 = Number(config.gate2Dist) || (trackL * 0.75);
        const gateA = createPhysicsElement('mru_photogate', trackLeftX + g1 * pxPerM, cy - 18, {
          label: `Sensor A (${g1.toFixed(1)}m)`,
          gateName: 'Sensor A',
          targetDistanceM: g1,
        });
        const gateB = createPhysicsElement('mru_photogate', trackLeftX + g2 * pxPerM, cy - 18, {
          label: `Sensor B (${g2.toFixed(1)}m)`,
          gateName: 'Sensor B',
          targetDistanceM: g2,
        });
        elements.push(gateA, gateB);
      }
      break;
    }

    case 'freefall': {
      const bodies = Array.isArray(config.bodies) && config.bodies.length > 0
        ? config.bodies
        : [{ label: 'Esfera A', bodyType: 'lead_sphere', mass: config.mass || 2.0, height: config.height || 45.0, initialVelocity: 0.0, color: '#16a34a' }];

      const maxH = Math.max(...bodies.map((b) => Number(b.height) || 45.0));
      const towerH = Math.min(320, Math.max(160, maxH * 5));
      const towerW = 60;

      if (config.includeTower) {
        const tower = createPhysicsElement('freefall_tower', cx - 50, cy, {
          label: `Torre Graduada (h = ${maxH}m)`,
          width: towerW,
          height: towerH,
          heightMeters: maxH,
        });
        elements.push(tower);
      }

      bodies.forEach((bCfg, idx) => {
        const bInfo = BODY_TYPES_CATALOG[bCfg.bodyType] || BODY_TYPES_CATALOG.lead_sphere;
        const bH = Number(bCfg.height) || 45.0;
        const v0 = Number(bCfg.initialVelocity) || 0.0;
        const massVal = Number(bCfg.mass) || bInfo.defaultMass;
        const bodySize = bInfo.width || 36;

        // Spread horizontally if multiple bodies
        const spawnX = cx + 25 + idx * 45;
        const spawnY = cy - towerH / 2 + 20 + ((maxH - bH) / maxH) * (towerH - 40);

        const body = createPhysicsElement('freefall_body', spawnX, spawnY, {
          label: bCfg.label || bInfo.name,
          bodyType: bCfg.bodyType,
          mass: massVal,
          releaseHeight: bH,
          velocity: v0,
          initialVelocity: v0,
          gravity: g,
          color: bCfg.color || bInfo.defaultColor,
          width: bodySize,
          height: bodySize,
          showVector: true,
        });
        elements.push(body);
      });

      if (config.includeGroundSensor) {
        const sensor = createPhysicsElement('mru_photogate', cx + 25, cy + towerH / 2 - 20, {
          label: `Sensor Suelo (${maxH}m)`,
          gateName: 'Impacto',
          targetDistanceM: maxH,
        });
        elements.push(sensor);
      }
      break;
    }

    case 'tiro_vertical': {
      const bodies = Array.isArray(config.bodies) && config.bodies.length > 0
        ? config.bodies
        : [{ label: 'Proyectil 1', bodyType: 'lead_sphere', initialVelocity: config.initialVelocity || 25.0, launchHeight: config.launchHeight || 0.0, mass: 1.5, color: '#db2777' }];

      const maxV0 = Math.max(...bodies.map((b) => Number(b.initialVelocity) || 25.0));
      const hMax = (maxV0 * maxV0) / (2 * g);
      const towerH = Math.min(330, Math.max(180, hMax * 5));
      const towerW = 60;

      if (config.includeTower) {
        const tower = createPhysicsElement('freefall_tower', cx - 50, cy, {
          label: `Torre de Tiro Vertical (h_máx = ${hMax.toFixed(1)}m)`,
          width: towerW,
          height: towerH,
          heightMeters: hMax,
        });
        elements.push(tower);
      }

      bodies.forEach((bCfg, idx) => {
        const bInfo = BODY_TYPES_CATALOG[bCfg.bodyType] || BODY_TYPES_CATALOG.lead_sphere;
        const v0 = Number(bCfg.initialVelocity) || 25.0;
        const spawnX = cx + 25 + idx * 45;
        const spawnY = cy + towerH / 2 - 35;
        const projSize = bInfo.width || 38;

        const projectile = createPhysicsElement('vertical_projectile', spawnX, spawnY, {
          label: bCfg.label || bInfo.name,
          bodyType: bCfg.bodyType,
          velocity: v0,
          initialVelocity: v0,
          mass: Number(bCfg.mass) || bInfo.defaultMass,
          gravity: g,
          color: bCfg.color || bInfo.defaultColor,
          width: projSize,
          height: projSize,
          showVector: true,
          showGravityVector: true,
        });
        elements.push(projectile);
      });

      if (config.includeApexSensor) {
        const sensor = createPhysicsElement('mru_photogate', cx + 25, cy - towerH / 2 + 15, {
          label: `Sensor Cúspide (${hMax.toFixed(1)}m)`,
          gateName: 'Cúspide',
          targetDistanceM: Number(hMax.toFixed(1)),
        });
        elements.push(sensor);
      }
      break;
    }

    case 'lanzamiento_horizontal': {
      const hMeters = Number(config.height) || 20.0;
      const v0x = Number(config.velocity) || 18.0;
      const cliffW = 160;
      const cliffH = 260;
      const cliffCenterX = cx - 200;
      const cliffCenterY = cy - 20;

      if (config.includeCliff) {
        const cliff = createPhysicsElement('cliff_platform', cliffCenterX, cliffCenterY, {
          label: `Acantilado (h = ${hMeters}m)`,
          width: cliffW,
          height: cliffH,
          heightMeters: hMeters,
          color: '#475569',
        });
        elements.push(cliff);
      }

      const bInfo = BODY_TYPES_CATALOG[config.bodyType] || BODY_TYPES_CATALOG.lead_sphere;
      const projSize = bInfo.width || 40;
      const ledgeX = cliffCenterX + cliffW / 2;
      const ledgeY = cliffCenterY - cliffH / 2;

      const projectile = createPhysicsElement('horizontal_projectile', ledgeX - projSize / 2, ledgeY - projSize / 2, {
        label: `${config.title || 'Proyectil'} (v₀x = ${v0x} m/s)`,
        bodyType: config.bodyType,
        velocity: v0x,
        initialVelocity: v0x,
        heightMeters: hMeters,
        mass: Number(config.mass) || bInfo.defaultMass,
        gravity: g,
        color: config.color || bInfo.defaultColor,
        width: projSize,
        height: projSize,
        showVector: true,
        showTrajectory: true,
      });
      elements.push(projectile);

      if (config.includeLandingSensor) {
        const tFlight = Math.sqrt((2 * hMeters) / g);
        const rangeX = v0x * tFlight;
        const pxPerM = cliffH / hMeters;
        const sensorX = ledgeX + rangeX * pxPerM;
        const groundY = cliffCenterY + cliffH / 2;

        const sensor = createPhysicsElement('mru_photogate', sensorX, groundY - 22, {
          label: `Sensor Impacto (X ≈ ${rangeX.toFixed(1)}m)`,
          gateName: `Impacto (${rangeX.toFixed(1)}m)`,
          targetDistanceM: Number(rangeX.toFixed(1)),
        });
        elements.push(sensor);
      }
      break;
    }

    case 'movimiento_proyectiles': {
      const v0 = Number(config.velocity) || 24.0;
      const thetaDeg = Number(config.angleDeg) || 40.0;
      const cannonW = 95;
      const cannonH = 75;
      const cannonX = cx - 220;
      const cannonY = cy + 40;

      if (config.includeCannon) {
        const cannon = createPhysicsElement('cannon_launcher', cannonX, cannonY, {
          label: `Cañón Balístico (θ = ${thetaDeg}°)`,
          width: cannonW,
          height: cannonH,
          velocity: v0,
          angleDeg: thetaDeg,
          color: '#7c3aed',
        });
        elements.push(cannon);
      }

      const muzzleInfo = getCannonMuzzlePosition(cannonX, cannonY, cannonW, cannonH, thetaDeg);
      const bInfo = BODY_TYPES_CATALOG[config.bodyType] || BODY_TYPES_CATALOG.lead_sphere;
      const projSize = bInfo.width ? Math.min(30, bInfo.width) : 28;

      const projectile = createPhysicsElement('oblique_projectile', muzzleInfo.muzzleCenterX - projSize / 2, muzzleInfo.muzzleCenterY - projSize / 2, {
        label: `${config.title || 'Proyectil'} (${v0} m/s, ${thetaDeg}°)`,
        bodyType: config.bodyType,
        velocity: v0,
        initialVelocity: v0,
        angleDeg: thetaDeg,
        initialAngleDeg: thetaDeg,
        gravity: g,
        color: config.color || bInfo.defaultColor,
        width: projSize,
        height: projSize,
        groundY: muzzleInfo.cannonGroundY,
        showVector: true,
        showTrajectory: true,
      });
      elements.push(projectile);

      if (config.includeLandingSensor) {
        const rad = (thetaDeg * Math.PI) / 180;
        const v0x = v0 * Math.cos(rad);
        const v0y = v0 * Math.sin(rad);
        const flightTime = (2 * v0y) / g;
        const rangeX = v0x * flightTime;
        const pxPerMeter = 14;
        const landingX = muzzleInfo.muzzleCenterX + rangeX * pxPerMeter;

        const sensor = createPhysicsElement('mru_photogate', landingX, muzzleInfo.cannonGroundY - 22, {
          label: `Sensor de Impacto (X ≈ ${rangeX.toFixed(1)}m)`,
          gateName: `Impacto (${rangeX.toFixed(1)}m)`,
          targetDistanceM: Number(rangeX.toFixed(1)),
        });
        elements.push(sensor);
      }
      break;
    }

    case 'mcu': {
      const rMeters1 = Number(config.radius) || 1.2;
      const rMeters2 = Number(config.radius2) || 0.6;
      const w = Number(config.omega) || 3.5;
      const visualR1 = Math.round(Math.max(80, Math.min(160, rMeters1 * 90)));
      const dir = config.direction || 'ccw';
      const isConcentric = scenario === 'two_particles_concentric';

      const turntable = createPhysicsElement('mcu_turntable', cx - visualR1, cy - visualR1, {
        label: `${config.title || 'Plataforma MCU'} (ω = ${w} rad/s)`,
        width: visualR1 * 2,
        height: visualR1 * 2,
        radiusMeters: rMeters1,
        radiusPx: visualR1,
        omega: w,
        initialOmega: w,
        direction: dir,
        color: config.color || '#0284c7',
      });
      elements.push(turntable);

      const p1 = createPhysicsElement('mcu_particle', cx + visualR1 - 15, cy - 15, {
        label: `Masa 1 (r = ${rMeters1}m)`,
        width: 30,
        height: 30,
        centerX: cx,
        centerY: cy,
        radiusMeters: rMeters1,
        radiusPx: visualR1,
        omega: w,
        initialOmega: w,
        direction: dir,
        color: '#3b82f6',
        showTangentialVector: true,
        showCentripetalVector: true,
      });
      elements.push(p1);

      if (isConcentric) {
        const visualR2 = Math.round((rMeters2 / rMeters1) * visualR1);
        const p2 = createPhysicsElement('mcu_particle', cx + visualR2 - 13, cy - 13, {
          label: `Masa 2 (r = ${rMeters2}m)`,
          width: 26,
          height: 26,
          centerX: cx,
          centerY: cy,
          radiusMeters: rMeters2,
          radiusPx: visualR2,
          omega: w,
          initialOmega: w,
          direction: dir,
          color: '#10b981',
          showTangentialVector: true,
          showCentripetalVector: true,
        });
        elements.push(p2);
      }
      break;
    }

    case 'mcuv': {
      const rMeters = Number(config.radius) || 1.0;
      const w0 = Number(config.initialOmega) || 2.0;
      const alpha = Number(config.alpha) || 1.5;
      const visualR = Math.round(Math.max(80, Math.min(160, rMeters * 90)));
      const dir = config.direction || 'ccw';

      const turntable = createPhysicsElement('mcuv_turntable', cx - visualR, cy - visualR, {
        label: `${config.title || 'Rotor MCUV'} (α = ${alpha} rad/s²)`,
        width: visualR * 2,
        height: visualR * 2,
        radiusMeters: rMeters,
        radiusPx: visualR,
        omega: w0,
        initialOmega: w0,
        alpha,
        initialAlpha: alpha,
        direction: dir,
        color: config.color || '#0891b2',
      });

      const particle = createPhysicsElement('mcuv_particle', cx + visualR - 15, cy - 15, {
        label: `Masa Acelerada (at = ${(Math.abs(alpha) * rMeters).toFixed(2)} m/s²)`,
        width: 30,
        height: 30,
        centerX: cx,
        centerY: cy,
        radiusMeters: rMeters,
        radiusPx: visualR,
        omega: w0,
        initialOmega: w0,
        alpha,
        initialAlpha: alpha,
        direction: dir,
        color: '#0284c7',
        showTangentialVector: true,
        showCentripetalVector: true,
      });

      elements.push(turntable, particle);
      break;
    }

    case 'poleas_mcu': {
      const r1 = Number(config.radius1) || 0.25;
      const r2 = Number(config.radius2) || 0.12;
      const w1 = Number(config.omega1) || 6.0;
      const cfgType = scenario === 'concentric' ? 'concentric' : (scenario === 'gears' ? 'gears' : 'belt');
      const w2 = cfgType === 'concentric' ? w1 : Number(((w1 * r1) / r2).toFixed(2));

      const sysW = 340;
      const sysH = 200;
      const system = createPhysicsElement('mcu_pulley_system', cx - sysW / 2, cy - sysH / 2, {
        label: `${config.title || 'Transmisión Poleas'} (${cfgType})`,
        configuration: cfgType,
        radiusMeters1: r1,
        radiusMeters2: r2,
        radiusPx1: Math.round(Math.max(35, Math.min(80, r1 * 220))),
        radiusPx2: Math.round(Math.max(25, Math.min(65, r2 * 220))),
        distancePx: 200,
        omega1: w1,
        initialOmega1: w1,
        omega2: w2,
        initialOmega2: w2,
        linearSpeed: Number((w1 * r1).toFixed(2)),
        color: config.color || '#059669',
      });
      elements.push(system);
      break;
    }

    case 'dcl': {
      const is3M = scenario === 'table_three_masses';
      const m1 = Number(config.m1) || 4.0;
      const m2 = Number(config.m2) || 10.0;
      const m3 = Number(config.m3) || 7.0;
      const mu = Number(config.mu_k) || 0.15;
      const isClean = config.isCleanPractice !== false;

      const dclEl = createPhysicsElement('dcl_diagram', cx, cy, {
        label: `${config.title || 'Mesa de Fuerzas DCL'} (${is3M ? '3 Masas' : '2 Masas'})`,
        apparatusType: is3M ? 'table_three_masses' : 'table_two_masses',
        systemTitle: config.title || 'Mesa Experimental de Dinámica y Fuerzas',
        bodyName: 'Masa Central (Mesa)',
        m1,
        m2,
        m3: is3M ? m3 : 0,
        mu_k: mu,
        frictionCoeff: mu,
        showOfficialSolution: !isClean,
        userVectors: isClean ? [] : undefined,
        width: 380,
        height: 250,
      });
      elements.push(dclEl);
      break;
    }

    case 'equilibrio': {
      const appType = scenario || 'cable_knot_wall';
      const load = Number(config.load) || 300;
      const isClean = config.isCleanPractice !== false;
      const mass = Number((load / 9.8).toFixed(2));

      const eqEl = createPhysicsElement('translational_equilibrium', cx, cy, {
        label: `${config.title || 'Aparato Equilibrio'} (W = ${load} N)`,
        apparatusType: appType,
        systemTitle: config.title || 'Aparato de Equilibrio Traslacional',
        load,
        mass,
        angle1: Number(config.angle1) || 35,
        angle2: Number(config.angle2) || 55,
        showOfficialSolution: !isClean,
        userVectors: [],
        width: 620,
        height: 390,
      });
      elements.push(eqEl);
      break;
    }

    case 'segunda_ley_newton': {
      const appType = scenario || 'two_connected_blocks';
      const m1 = Number(config.mass1) || 2.0;
      const m2 = Number(config.mass2) || 6.0;
      const F = Number(config.appliedForce) || 80.0;
      const isClean = config.isCleanPractice !== false;

      const newtonEl = createPhysicsElement('newton_frictionless_system', cx, cy, {
        label: `${config.title || 'Sistema 2ª Ley Newton'} (${m1}kg + ${m2}kg)`,
        apparatusType: appType,
        exerciseNumber: appType === 'two_connected_blocks' ? 7 : (appType === 'single_block_force' ? 1 : (appType === 'vertical_cable_mass' ? 3 : (appType === 'atwood_frictionless' ? 6 : 8))),
        mass1: m1,
        mass2: m2,
        appliedForce: F,
        frictionCoeff: 0.0,
        showOfficialSolution: !isClean,
        userVectors: isClean ? [] : undefined,
        width: 620,
        height: 380,
      });
      elements.push(newtonEl);
      break;
    }

    case 'mechanics': {
      const mA = Number(config.massA) || 80;
      const mB = Number(config.massB) || 50;

      const pulley = createPhysicsElement('pulley', cx, cy - 80, {
        label: 'Polea Principal',
        width: 70,
        height: 70,
      });

      const massA = createPhysicsElement('mass', cx - 35, cy + 25, {
        label: `Masa A (${mA} kg)`,
        mass: mA,
        color: '#3b82f6',
        width: 62,
        height: 62,
      });

      const massB = createPhysicsElement('mass', cx + 70 - 25, cy + 180, {
        label: `Masa B (${mB} kg)`,
        mass: mB,
        color: '#ec4899',
        width: 52,
        height: 52,
      });

      const ropeLeft = createPhysicsConnection(massA.id, 'top', pulley.id, 'left_groove');
      const ropeRight = createPhysicsConnection(pulley.id, 'right_groove', massB.id, 'top');

      elements.push(pulley, massA, massB, ropeLeft, ropeRight);
      break;
    }

    default:
      break;
  }

  return elements;
}
