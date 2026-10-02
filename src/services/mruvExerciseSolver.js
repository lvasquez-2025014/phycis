// =========================================================================
// MRUV EXERCISE SOLVER & WHITEBOARD LAB GENERATOR
// Solves uniformly accelerated linear motion (MRUV) problems:
// accelerations, braking distances, multi-stage trips, velocity-time graphs,
// and mounts complete interactive physics experiments on the whiteboard.
// Contains all 10 problems + 6 conceptual questions from HT02 (Colegio Kinal).
// =========================================================================

import { createPhysicsElement } from '../physics/physicsRegistry';

/**
 * Standard Gravity
 */
export const G_EARTH = 9.81; // m/s²

/**
 * -------------------------------------------------------------------------
 * MRUV CORE ANALYTICAL FORMULA SOLVER
 * Supported variables: v0 (m/s), vf (m/s), a (m/s²), t (s), d (m)
 * -------------------------------------------------------------------------
 */
export function solveMruvEquations({ v0, vf, a, t, d }) {
  const hasV0 = v0 !== undefined && v0 !== null && !isNaN(v0);
  const hasVf = vf !== undefined && vf !== null && !isNaN(vf);
  const hasA = a !== undefined && a !== null && !isNaN(a);
  const hasT = t !== undefined && t !== null && !isNaN(t) && t > 0;
  const hasD = d !== undefined && d !== null && !isNaN(d);

  let numGiven = [hasV0, hasVf, hasA, hasT, hasD].filter(Boolean).length;
  if (numGiven < 3) return null;

  let rV0 = hasV0 ? Number(v0) : null;
  let rVf = hasVf ? Number(vf) : null;
  let rA = hasA ? Number(a) : null;
  let rT = hasT ? Number(t) : null;
  let rD = hasD ? Number(d) : null;

  const steps = [];

  // Case 1: Given (v0, vf, t) -> calculate a, d
  if (hasV0 && hasVf && hasT && !hasA && !hasD) {
    rA = (rVf - rV0) / rT;
    rD = ((rV0 + rVf) / 2) * rT;
    steps.push({
      title: '1. Cálculo de la Aceleración (a)',
      formula: 'a = (v_f - v_0) / t',
      calc: `a = (${rVf} - ${rV0}) / ${rT} = ${rA.toFixed(3)} m/s²`,
    });
    steps.push({
      title: '2. Cálculo de la Distancia (d)',
      formula: 'd = ((v_0 + v_f) / 2) · t',
      calc: `d = ((${rV0} + ${rVf}) / 2) · ${rT} = ${rD.toFixed(3)} m`,
    });
  }
  // Case 2: Given (v0, a, t) -> calculate vf, d
  else if (hasV0 && hasA && hasT && !hasVf && !hasD) {
    rVf = rV0 + rA * rT;
    rD = rV0 * rT + 0.5 * rA * rT * rT;
    steps.push({
      title: '1. Cálculo de la Velocidad Final (v_f)',
      formula: 'v_f = v_0 + a · t',
      calc: `v_f = ${rV0} + (${rA}) · ${rT} = ${rVf.toFixed(3)} m/s`,
    });
    steps.push({
      title: '2. Cálculo de la Distancia (d)',
      formula: 'd = v_0 · t + (1/2) · a · t²',
      calc: `d = ${rV0}·${rT} + 0.5·(${rA})·(${rT})² = ${rD.toFixed(3)} m`,
    });
  }
  // Case 3: Given (v0, vf, d) -> calculate a, t
  else if (hasV0 && hasVf && hasD && !hasA && !hasT) {
    rA = (rVf * rVf - rV0 * rV0) / (2 * rD);
    rT = (2 * rD) / (rV0 + rVf);
    steps.push({
      title: '1. Cálculo de la Aceleración (a)',
      formula: 'v_f² = v_0² + 2·a·d  ⟹  a = (v_f² - v_0²) / (2·d)',
      calc: `a = (${rVf}² - ${rV0}²) / (2 · ${rD}) = ${rA.toFixed(3)} m/s²`,
    });
    steps.push({
      title: '2. Cálculo del Tiempo (t)',
      formula: 't = 2·d / (v_0 + v_f)',
      calc: `t = 2 · ${rD} / (${rV0} + ${rVf}) = ${rT.toFixed(3)} s`,
    });
  }
  // Case 4: Given (v0, a, d) -> calculate vf, t
  else if (hasV0 && hasA && hasD && !hasVf && !hasT) {
    const vfSq = rV0 * rV0 + 2 * rA * rD;
    if (vfSq < 0) return null;
    rVf = Math.sqrt(vfSq);
    rT = (rVf - rV0) / rA;
    steps.push({
      title: '1. Cálculo de la Velocidad Final (v_f)',
      formula: 'v_f = √(v_0² + 2·a·d)',
      calc: `v_f = √(${rV0}² + 2·(${rA})·${rD}) = √(${vfSq.toFixed(2)}) = ${rVf.toFixed(3)} m/s`,
    });
    steps.push({
      title: '2. Cálculo del Tiempo (t)',
      formula: 't = (v_f - v_0) / a',
      calc: `t = (${rVf.toFixed(3)} - ${rV0}) / (${rA}) = ${rT.toFixed(3)} s`,
    });
  }
  // Case 5: Given (vf, a, t) -> calculate v0, d
  else if (hasVf && hasA && hasT && !hasV0 && !hasD) {
    rV0 = rVf - rA * rT;
    rD = rV0 * rT + 0.5 * rA * rT * rT;
    steps.push({
      title: '1. Cálculo de la Velocidad Inicial (v_0)',
      formula: 'v_0 = v_f - a · t',
      calc: `v_0 = ${rVf} - (${rA}) · ${rT} = ${rV0.toFixed(3)} m/s`,
    });
    steps.push({
      title: '2. Cálculo de la Distancia (d)',
      formula: 'd = v_0 · t + (1/2) · a · t²',
      calc: `d = ${rV0.toFixed(3)}·${rT} + 0.5·(${rA})·(${rT})² = ${rD.toFixed(3)} m`,
    });
  }

  return {
    v0: rV0,
    vf: rVf,
    a: rA,
    t: rT,
    d: rD,
    steps,
  };
}

/**
 * -------------------------------------------------------------------------
 * HT02 CONCEPTUAL QUESTIONS (FORMA 1 - COLEGIO KINAL)
 * -------------------------------------------------------------------------
 */
export const HT02_CONCEPTUAL_QUESTIONS = [
  {
    id: 'cq1_slope_xt',
    number: 1,
    question: '¿Qué representa la pendiente de una gráfica de posición contra tiempo (x vs t)?',
    answer: 'La velocidad instantánea del objeto (v = dx/dt o v = Δx/Δt).',
    explanation:
      'Por definición geométrica y física, la pendiente representa la razón de cambio de la posición con respecto al tiempo: m = Δx / Δt. En el Sistema Internacional se mide en metros por segundo (m/s). Si la recta es horizontal (pendiente = 0), el objeto está en reposo.',
    keyFormula: 'v = Δx / Δt  [m/s]',
    tag: 'Gráficas de Movimiento',
  },
  {
    id: 'cq2_slope_vt',
    number: 2,
    question: '¿Qué representa la pendiente de una gráfica de velocidad contra tiempo (v vs t)?',
    answer: 'La aceleración del móvil (a = dv/dt o a = Δv/Δt).',
    explanation:
      'La pendiente en el plano (v vs t) cuantifica qué tan rápido varía la velocidad por unidad de tiempo: m = Δv / Δt. Una pendiente positiva indica aceleración en sentido positivo, una pendiente negativa indica aceleración en sentido negativo (desaceleración o frenado si v > 0), y una pendiente nula indica velocidad constante (MRU).',
    keyFormula: 'a = Δv / Δt  [m/s²]',
    tag: 'Aceleración',
  },
  {
    id: 'cq3_area_vt',
    number: 3,
    question: '¿Qué representa el área bajo la curva de una gráfica de velocidad contra tiempo (v vs t)?',
    answer: 'El desplazamiento realizado por el objeto (Δx).',
    explanation:
      'El producto dimensional de los ejes es: (velocidad en m/s) · (tiempo en s) = metros (m). El área geométrica bajo la curva (integrando v con respecto al tiempo: Δx = ∫ v dt) corresponde al cambio neto de posición o desplazamiento. Las áreas sobre el eje t son desplazamientos positivos (+x) y las áreas bajo el eje t son desplazamientos negativos (-x).',
    keyFormula: 'Δx = Área(v vs t)  [m]',
    tag: 'Integración Geométrica',
  },
  {
    id: 'cq4_const_vel_accel',
    number: 4,
    question: 'Si un objeto se mueve con velocidad constante, ¿cuánto vale su aceleración?',
    answer: 'La aceleración es exactamente cero (a = 0 m/s²).',
    explanation:
      'La aceleración mide la tasa de variación de la velocidad con el tiempo: a = Δv / Δt. Si la velocidad es constante, entonces v_f = v_0, por lo que Δv = v_f - v_0 = 0. En consecuencia, la aceleración se anula por completo (condición fundamental del Movimiento Rectilíneo Uniforme, MRU).',
    keyFormula: 'v = cte  ⟹  Δv = 0  ⟹  a = 0 m/s²',
    tag: 'Fundamento Cinemático',
  },
  {
    id: 'cq5_negative_accel_braking',
    number: 5,
    question: 'Si la aceleración de un objeto es negativa, ¿significa siempre que está frenando? Explique.',
    answer: 'No necesariamente. Solo frena si la velocidad inicial es positiva. Si la velocidad también es negativa, el móvil aumenta su rapidez en sentido negativo.',
    explanation:
      'Un móvil frena (desacelera) únicamente cuando la velocidad y la aceleración tienen signos opuestos (v · a < 0). Si tanto la velocidad como la aceleración son negativas (v < 0 y a < 0), el objeto se desplaza hacia la izquierda aumentando progresivamente su rapidez (módulo de velocidad). El signo de la aceleración solo indica el sentido vectorial.',
    keyFormula: '|v| aumenta si signo(v) = signo(a); disminuye si signo(v) ≠ signo(a)',
    tag: 'Vectores y Signos',
  },
  {
    id: 'cq6_at_graph_mruv',
    number: 6,
    question: 'En el MRUV, ¿cómo es la gráfica de aceleración contra tiempo (a vs t)?',
    answer: 'Es una línea recta horizontal paralela al eje del tiempo (a = constante ≠ 0).',
    explanation:
      'Por definición de MRUV (Movimiento Rectilíneo Uniformemente Variado), la aceleración se mantiene estrictamente constante en magnitud, dirección y sentido durante todo el intervalo considerado. Por lo tanto, el valor de "a" no cambia a medida que transcurre el tiempo, produciendo una recta de pendiente cero a una altura constante.',
    keyFormula: 'a(t) = constante  (Línea horizontal)',
    tag: 'Gráficas MRUV',
  },
];

/**
 * -------------------------------------------------------------------------
 * HT02 COMPLETE EXERCISES CATALOG (PROBLEMAS 1 AL 10 - COLEGIO KINAL)
 * -------------------------------------------------------------------------
 */
export const HT02_MRUV_EXERCISES = [
  {
    id: 'ex1_guepardo_vs_moto',
    title: 'Guepardo vs Moto Deportiva (Aceleración y Comparación con g)',
    topic: 'Cálculo de Aceleración y Factor g',
    source: 'Hoja de Trabajo 02 • Ejercicio 1 (Kinal)',
    category: 'acceleration_comparison',
    statement:
      'Un guepardo puede acelerar de 0 a 80 km/h en 3.0 s, mientras que una motocicleta deportiva de 1000 cc acelera de 0 a 100 km/h en 2.8 s.\n\na) Calcule la aceleración de cada uno en m/s².\nb) ¿Cuál de los dos acelera más?\nc) Compare ambas aceleraciones con la aceleración de la gravedad terrestre (g = 9.81 m/s²).',
    params: {
      v0_guepardo: 0,
      vf_guepardo_kmh: 80,
      t_guepardo: 3.0,
      v0_moto: 0,
      vf_moto_kmh: 100,
      t_moto: 2.8,
      g: 9.81,
    },
    steps: [
      {
        title: '1. Conversión de Unidades al Sistema Internacional (SI)',
        body: '• Guepardo: 80 km/h · (1 m/s / 3.6 km/h) = 22.222 m/s\n• Moto: 100 km/h · (1 m/s / 3.6 km/h) = 27.778 m/s',
      },
      {
        title: '2. Aceleración del Guepardo',
        body: 'a_guepardo = (v_f - v_0) / t\na_guepardo = (22.222 - 0) / 3.0 = 7.407 m/s² (≈ 7.41 m/s²)',
      },
      {
        title: '3. Aceleración de la Motocicleta',
        body: 'a_moto = (v_f - v_0) / t\na_moto = (27.778 - 0) / 2.8 = 9.921 m/s² (≈ 9.92 m/s²)',
      },
      {
        title: '4. Comparación Relativa entre Móviles',
        body: 'a_moto (9.92 m/s²) > a_guepardo (7.41 m/s²)\nLa motocicleta deportiva supera al guepardo en aceleración por 2.51 m/s² (+33.9%).',
      },
      {
        title: '5. Comparación con la Gravedad Terrestre (g = 9.81 m/s²)',
        body: '• Guepardo: 7.407 / 9.81 = 0.755 g (75.5% de g)\n• Moto: 9.921 / 9.81 = 1.011 g (101.1% de g, ¡supera a la gravedad en aceleración horizontal!)',
      },
    ],
    finalAnswer:
      'a_guepardo = 7.41 m/s² (0.76 g) • a_moto = 9.92 m/s² (1.01 g). La motocicleta acelera más y supera ligeramente la aceleración de caída libre.',
    cartPreset: {
      type: 'mruv_cart',
      label: 'Moto 1000cc',
      velocity: 0.0,
      initialVelocity: 0.0,
      acceleration: 9.92,
      color: '#16a34a',
      showVector: true,
      showAccelVector: true,
    },
    secondCartPreset: {
      type: 'mruv_cart',
      label: 'Guepardo',
      velocity: 0.0,
      initialVelocity: 0.0,
      acceleration: 7.41,
      color: '#d97706',
      showVector: true,
      showAccelVector: true,
    },
  },

  {
    id: 'ex2_frenado_autopista',
    title: 'Frenado en Autopista (Relación Cuadrática v²)',
    topic: 'Distancia y Tiempo de Frenado',
    source: 'Hoja de Trabajo 02 • Ejercicio 2 (Kinal)',
    category: 'braking_distance',
    statement:
      'Un automóvil frena con una desaceleración uniforme de 5.0 m/s² (a = -5.0 m/s²) hasta detenerse por completo (v_f = 0).\n\na) Si viaja inicialmente a 15 m/s (54 km/h), determine el tiempo y la distancia de frenado.\nb) Si viaja inicialmente a 30 m/s (108 km/h), determine el tiempo y la distancia de frenado.\nc) ¿Qué conclusión física se obtiene al comparar ambos casos?',
    params: {
      a: -5.0,
      v0_a: 15,
      v0_b: 30,
    },
    steps: [
      {
        title: '1. Caso A (v₀ = 15 m/s • 54 km/h)',
        body: 'Tiempo: t₁ = (v_f - v_0) / a = (0 - 15) / (-5.0) = 3.0 s\nDistancia: d₁ = (v_f² - v_0²) / (2·a) = (0 - 15²) / (2·(-5)) = 225 / 10 = 22.5 m',
      },
      {
        title: '2. Caso B (v₀ = 30 m/s • 108 km/h)',
        body: 'Tiempo: t₂ = (v_f - v_0) / a = (0 - 30) / (-5.0) = 6.0 s\nDistancia: d₂ = (v_f² - v_0²) / (2·a) = (0 - 30²) / (2·(-5)) = 900 / 10 = 90.0 m',
      },
      {
        title: '3. Análisis Físico y Conclusión de Seguridad Vial',
        body: '• Razón de velocidades: v₂ / v₁ = 30 / 15 = 2 (se duplica la velocidad).\n• Razón de tiempos: t₂ / t₁ = 6 / 3 = 2 (el tiempo se duplica).\n• Razón de distancias: d₂ / d₁ = 90.0 / 22.5 = 4 (la distancia se cuadruplica, ya que d ∝ v₀²).\nAl duplicar la rapidez, se necesita el cuádruple de espacio para no colisionar.',
      },
    ],
    finalAnswer:
      'Caso A: t = 3.0 s, d = 22.5 m • Caso B: t = 6.0 s, d = 90.0 m. Conclusión: Al duplicar la velocidad, la distancia de frenado se cuadruplica (factor 2² = 4).',
    cartPreset: {
      type: 'mruv_cart',
      label: 'Auto Frenando',
      velocity: 30.0,
      initialVelocity: 30.0,
      acceleration: -5.0,
      color: '#dc2626',
      showVector: true,
      showAccelVector: true,
    },
  },

  {
    id: 'ex3_electron_crt',
    title: 'Electrón en Tubo de Rayos Catódicos (3 Etapas en Escala Nanosegundos)',
    topic: 'Movimiento Multietapa Subatómico',
    source: 'Hoja de Trabajo 02 • Ejercicio 3 (Kinal)',
    category: 'multi_stage',
    statement:
      'En un tubo de rayos catódicos (CRT), un electrón experimenta 3 etapas sucesivas:\n• Etapa 1: Acelera uniformemente en 1.5 cm desde 1.0×10⁴ m/s hasta 5.0×10⁶ m/s.\n• Etapa 2: Se desplaza a rapidez constante por un tubo de deriva de 12 cm.\n• Etapa 3: Frena hasta detenerse en 1.0 cm al chocar contra la pantalla fosforescente.\n\nCalcule la aceleración y tiempo en cada etapa, el tiempo total y la distancia total recorrida.',
    steps: [
      {
        title: '1. Etapa 1: Aceleración en d₁ = 1.5 cm (0.015 m)',
        body: 'v_f² = v_0² + 2·a₁·d₁  ⟹  a₁ = (v_f² - v_0²) / (2·d₁)\na₁ = ((5.0×10⁶)² - (1.0×10⁴)²) / (2 · 0.015) = (2.5×10¹³ - 1.0×10⁸) / 0.03\na₁ ≈ 8.333 × 10¹⁴ m/s²\nTiempo: t₁ = 2·d₁ / (v_0 + v_f) = 2(0.015) / (5.01×10⁶) ≈ 5.988 × 10⁻⁹ s = 5.99 ns',
      },
      {
        title: '2. Etapa 2: Movimiento Rectilíneo Uniforme en d₂ = 12 cm (0.12 m)',
        body: 'Rapidez constante: v = 5.0 × 10⁶ m/s • a₂ = 0\nTiempo: t₂ = d₂ / v = 0.12 / (5.0 × 10⁶) = 2.40 × 10⁻⁸ s = 24.0 ns',
      },
      {
        title: '3. Etapa 3: Frenado en d₃ = 1.0 cm (0.01 m)',
        body: 'a₃ = (0 - v²) / (2·d₃) = -(5.0×10⁶)² / (2 · 0.01) = -2.5×10¹³ / 0.02 = -1.25 × 10¹⁵ m/s²\nTiempo: t₃ = 2·d₃ / (v + 0) = 2(0.01) / (5.0 × 10⁶) = 4.0 × 10⁻⁹ s = 4.0 ns',
      },
      {
        title: '4. Totales de Distancia y Tiempo',
        body: '• Distancia total: d_total = 0.015 + 0.12 + 0.01 = 0.145 m (14.5 cm)\n• Tiempo total: t_total = 5.99 ns + 24.0 ns + 4.0 ns = 33.99 ns (3.399 × 10⁻⁸ s)',
      },
    ],
    finalAnswer:
      'Etapa 1: a₁ = 8.33×10¹⁴ m/s², t₁ = 5.99 ns • Etapa 2: t₂ = 24.0 ns • Etapa 3: a₃ = -1.25×10¹⁵ m/s², t₃ = 4.0 ns • Distancia total = 14.5 cm • Tiempo total = 33.99 ns.',
    cartPreset: {
      type: 'mruv_cart',
      label: 'Electrón CRT',
      velocity: 1.0,
      initialVelocity: 1.0,
      acceleration: 4.5,
      color: '#38bdf8',
      showVector: true,
      showAccelVector: true,
    },
  },

  {
    id: 'ex4_tren_monorriel',
    title: 'Frenado de Tren Monorriel (v₀ = 22 m/s, d = 120 m)',
    topic: 'Desaceleración y Tiempo de Detención',
    source: 'Hoja de Trabajo 02 • Ejercicio 4 (Kinal)',
    category: 'braking_distance',
    statement:
      'Un tren monorriel que viaja a 22.0 m/s (79.2 km/h) aplica los frenos con desaceleración constante y se detiene en una distancia de 120.0 m.\n\na) Calcule la desaceleración del tren.\nb) Calcule el tiempo necesario para detenerse.',
    params: {
      v0: 22.0,
      vf: 0.0,
      d: 120.0,
    },
    steps: [
      {
        title: '1. Identificación de Datos',
        body: '• Velocidad inicial: v₀ = 22.0 m/s\n• Velocidad final: v_f = 0 m/s (reposo)\n• Distancia recorrida: d = 120.0 m',
      },
      {
        title: '2. Cálculo de la Desaceleración (a)',
        body: 'v_f² = v_0² + 2·a·d\n0 = (22.0)² + 2·a·(120.0)\n484 + 240·a = 0  ⟹  a = -484 / 240 = -2.0167 m/s² (≈ -2.02 m/s²)',
      },
      {
        title: '3. Cálculo del Tiempo de Detención (t)',
        body: 'Método 1 (Fórmula media):\nd = ((v_0 + v_f) / 2) · t  ⟹  120 = ((22 + 0) / 2) · t = 11 · t\nt = 120 / 11 ≈ 10.909 s (≈ 10.91 s)\n\nMétodo 2 (Verificación por definición):\nt = (v_f - v_0) / a = (0 - 22) / (-2.0167) = 10.91 s  ✓ Coincide',
      },
    ],
    finalAnswer:
      'Desaceleración: a = -2.02 m/s² • Tiempo de detención: t = 10.91 segundos.',
    cartPreset: {
      type: 'mruv_cart',
      label: 'Tren Monorriel',
      velocity: 22.0,
      initialVelocity: 22.0,
      acceleration: -2.02,
      color: '#6366f1',
      showVector: true,
      showAccelVector: true,
    },
  },

  {
    id: 'ex5_rebote_superbola',
    title: 'Rebote de Súper Bola contra Pared (Δt = 3.5 ms y Factor g)',
    topic: 'Aceleración en Impacto Instantáneo',
    source: 'Hoja de Trabajo 02 • Ejercicio 5 (Kinal)',
    category: 'impact_acceleration',
    statement:
      'Una súper bola de 50 g choca perpendicularmente contra una pared sólida con una rapidez de 25.0 m/s hacia la derecha (+x) y rebota con una rapidez de 22.0 m/s hacia la izquierda (-x). El contacto con la pared dura 3.5 ms (0.0035 s).\n\na) Determine la aceleración media durante el choque.\nb) Exprese dicha aceleración en múltiplos de g (g = 9.81 m/s²).',
    params: {
      v_i: 25.0,
      v_f: -22.0,
      dt: 0.0035,
      g: 9.81,
    },
    steps: [
      {
        title: '1. Convención de Signos Vectoriales',
        body: '• Sentido hacia la derecha (+x): v_inicial = +25.0 m/s\n• Sentido hacia la izquierda (-x): v_final = -22.0 m/s (el signo negativo es fundamental por el rebote)',
      },
      {
        title: '2. Cambio de Velocidad (Δv)',
        body: 'Δv = v_final - v_inicial = -22.0 - (+25.0) = -47.0 m/s',
      },
      {
        title: '3. Aceleración Media durante el Contacto',
        body: 'a = Δv / Δt = -47.0 m/s / 0.0035 s = -13,428.57 m/s²\nMagnitud: |a| = 13,428.6 m/s² dirigida en sentido opuesto a la pared.',
      },
      {
        title: '4. Comparación con la Gravedad Terrestre',
        body: '|a| / g = 13,428.57 / 9.81 = 1,368.87 g\n¡La aceleración es aproximadamente 1,369 veces mayor que la gravedad terrestre!',
      },
    ],
    finalAnswer:
      'Aceleración media: a = -13,428.57 m/s² hacia la izquierda (equivalente a 1,369 veces la gravedad terrestre g).',
    cartPreset: {
      type: 'mruv_cart',
      label: 'Súper Bola',
      velocity: 5.0,
      initialVelocity: 5.0,
      acceleration: -6.0,
      color: '#ec4899',
      showVector: true,
      showAccelVector: true,
    },
  },

  {
    id: 'ex6_lancha_boya',
    title: 'Lancha Rápida hacia la Boya (v₀ = 30 m/s, d = 100 m, a = -3.5 m/s²)',
    topic: 'Evaluación de Detención y Paso por Punto Fijo',
    source: 'Hoja de Trabajo 02 • Ejercicio 6 (Kinal)',
    category: 'target_encounter',
    statement:
      'Una lancha rápida navega a 30.0 m/s dirigiéndose hacia una boya a 100.0 m de distancia. El piloto apaga el motor y aplica un hidro-freno con desaceleración constante de 3.5 m/s² (a = -3.5 m/s²).\n\na) ¿Logrará detenerse antes de la boya o pasará junto a ella?\nb) ¿Con qué rapidez pasa junto a la boya a los 100 m?\nc) ¿Cuánto tiempo le toma llegar a la boya?',
    params: {
      v0: 30.0,
      d_boya: 100.0,
      a: -3.5,
    },
    steps: [
      {
        title: '1. Verificación de Detención Completa (¿Llega a la boya?)',
        body: 'Distancia requerida para detenerse totalmente (v_f = 0):\nd_parada = (0 - v_0²) / (2·a) = (-30²) / (2 · (-3.5)) = -900 / -7 = 128.57 m\nComo 128.57 m > 100.0 m, la lancha NO se detiene antes de la boya: la sobrepasa por 28.57 m.',
      },
      {
        title: '2. Rapidez al pasar junto a la Boya (d = 100 m)',
        body: 'v² = v_0² + 2·a·d\nv² = (30)² + 2·(-3.5)·(100) = 900 - 700 = 200 m²/s²\nv = √200 ≈ 14.142 m/s (≈ 50.9 km/h)',
      },
      {
        title: '3. Tiempo empleado hasta la Boya',
        body: 'v = v_0 + a·t  ⟹  14.142 = 30 - 3.5·t\n3.5·t = 30 - 14.142 = 15.858  ⟹  t = 15.858 / 3.5 ≈ 4.531 s (≈ 4.53 s)',
      },
    ],
    finalAnswer:
      'a) Pasará junto a la boya (d_parada = 128.57 m > 100 m) • b) Rapidez en la boya = 14.14 m/s (50.9 km/h) • c) Tiempo = 4.53 s.',
    cartPreset: {
      type: 'mruv_cart',
      label: 'Lancha Hidro-freno',
      velocity: 30.0,
      initialVelocity: 30.0,
      acceleration: -3.5,
      color: '#0284c7',
      showVector: true,
      showAccelVector: true,
    },
  },

  {
    id: 'ex7_camion_reparto_3_etapas',
    title: 'Camión de Reparto en 3 Fases (Acelerado, Uniforme y Frenado)',
    topic: 'Cinemática Compuesta y Rapidez Media',
    source: 'Hoja de Trabajo 02 • Ejercicio 7 (Kinal)',
    category: 'multi_stage_trip',
    statement:
      'Un camión de reparto realiza un trayecto rectilíneo en 3 fases sucesivas:\n• Fase 1: Parte del reposo y acelera a 2.0 m/s² durante 8.0 s.\n• Fase 2: Mantiene la rapidez alcanzada de forma constante durante 20.0 s.\n• Fase 3: Frena uniformemente hasta detenerse en 5.0 s.\n\nCalcule la distancia total recorrida, el tiempo total y la rapidez media del viaje completo.',
    steps: [
      {
        title: '1. Fase 1: Aceleración desde el Reposo',
        body: '• Velocidad final alcanzada: v₁ = v_0 + a₁·t₁ = 0 + 2.0 · 8.0 = 16.0 m/s\n• Distancia recorrida: d₁ = (1/2)·a₁·t₁² = 0.5 · 2.0 · (8.0)² = 64.0 m',
      },
      {
        title: '2. Fase 2: Crucero a Velocidad Constante (MRU)',
        body: '• Rapidez: v = 16.0 m/s • Tiempo: t₂ = 20.0 s\n• Distancia recorrida: d₂ = v · t₂ = 16.0 · 20.0 = 320.0 m',
      },
      {
        title: '3. Fase 3: Frenado hasta Detenerse (Reposición)',
        body: '• Desaceleración: a₃ = (0 - 16.0) / 5.0 = -3.2 m/s²\n• Distancia recorrida: d₃ = ((16.0 + 0) / 2) · 5.0 = 8.0 · 5.0 = 40.0 m',
      },
      {
        title: '4. Totales y Rapidez Media',
        body: '• Distancia total: d_total = 64.0 + 320.0 + 40.0 = 424.0 m\n• Tiempo total: t_total = 8.0 + 20.0 + 5.0 = 33.0 s\n• Rapidez media: v_media = d_total / t_total = 424.0 / 33.0 ≈ 12.848 m/s (46.25 km/h)',
      },
    ],
    finalAnswer:
      'Distancia total = 424.0 m • Tiempo total = 33.0 s • Rapidez media = 12.85 m/s (46.25 km/h).',
    cartPreset: {
      type: 'mruv_cart',
      label: 'Camión Reparto',
      velocity: 0.0,
      initialVelocity: 0.0,
      acceleration: 2.0,
      color: '#f59e0b',
      showVector: true,
      showAccelVector: true,
    },
  },

  {
    id: 'ex8_piloto_caza_mach3',
    title: 'Piloto de Caza a 5g y Umbral de Tolerancia Fisiológica',
    topic: 'Fisiología en Aceleraciones Extremas',
    source: 'Hoja de Trabajo 02 • Ejercicio 8 (Kinal)',
    category: 'high_g_acceleration',
    statement:
      'Un piloto militar en un avión caza supersónico es sometido a una aceleración de 5.0g (a = 5.0 · 9.81 = 49.05 m/s²). El ser humano promedio soporta un máximo de 5.0 s a esta aceleración antes de sufrir un desmayo (blackout).\n\na) Si parte del reposo, ¿qué velocidad máxima alcanza en los 5.0 s límite?\nb) ¿Qué distancia recorre en ese intervalo?\nc) ¿Puede alcanzar Mach 3 (1020 m/s) a 5.0g sin desmayarse?',
    params: {
      a: 49.05,
      t_limite: 5.0,
      v_mach3: 1020,
    },
    steps: [
      {
        title: '1. Velocidad Máxima en el Umbral de Desmayo (t = 5.0 s)',
        body: 'v_f = v_0 + a·t = 0 + (49.05 m/s²) · 5.0 s = 245.25 m/s\nEn km/h: 245.25 · 3.6 = 882.9 km/h (≈ Mach 0.72)',
      },
      {
        title: '2. Distancia Recorrida en los 5.0 s',
        body: 'd = v_0·t + (1/2)·a·t² = 0 + 0.5 · 49.05 · (5.0)² = 0.5 · 49.05 · 25 = 613.125 m (≈ 613.1 m)',
      },
      {
        title: '3. Factibilidad de alcanzar Mach 3 (1020 m/s)',
        body: 'Tiempo necesario para llegar a 1020 m/s a 5.0g:\nt_requerido = (v - v_0) / a = 1020 / 49.05 ≈ 20.795 s (≈ 20.8 s)\nDado que 20.8 s supera con creces el límite fisiológico de 5.0 s, el piloto perdería el conocimiento a los 5.0 s mucho antes de alcanzar Mach 3.',
      },
    ],
    finalAnswer:
      'a) v_f = 245.25 m/s (882.9 km/h) • b) Distancia = 613.13 m • c) No es factible: requiere 20.8 s, perdiendo el conocimiento a los 5 s.',
    cartPreset: {
      type: 'mruv_cart',
      label: 'Caza 5.0g',
      velocity: 0.0,
      initialVelocity: 0.0,
      acceleration: 4.9, // escalado para simulador
      color: '#475569',
      showVector: true,
      showAccelVector: true,
    },
  },

  {
    id: 'ex9_grafica_vt_11_intervalos',
    title: 'Análisis de Gráfica v(t) por 11 Intervalos (Áreas y Pendientes)',
    topic: 'Integración y Diferenciación Geométrica',
    source: 'Hoja de Trabajo 02 • Ejercicio 9 (Kinal)',
    category: 'graph_analysis_11',
    statement:
      'Dada una gráfica de velocidad-tiempo v(t) particionada en 11 intervalos sucesivos:\n\na) Calcule la aceleración en cada intervalo mediante la pendiente de la recta a = Δv/Δt.\nb) Calcule el desplazamiento en cada intervalo calculando el área geométrica (rectángulos, triángulos y trapecios).\nc) Obtenga el desplazamiento neto total y la distancia total recorrida.',
    steps: [
      {
        title: '1. Fundamentos del Análisis Gráfico',
        body: '• Pendiente = Aceleración instantánea: a = (v_final - v_inicial) / (t_final - t_inicial)\n• Área sobre el eje t = Desplazamiento positivo (+Δx)\n• Área bajo el eje t = Desplazamiento negativo (-Δx)\n• Desplazamiento neto = Σ Áreas con su signo algebraico\n• Espacio total recorrido = Σ |Áreas| en valor absoluto',
      },
      {
        title: '2. Clasificación de Tramos Típicos',
        body: '1. Rectas ascendentes: Pendiente positiva ⟹ Movimiento uniformemente acelerado (a > 0).\n2. Rectas horizontales con v ≠ 0: Pendiente cero ⟹ Movimiento rectilíneo uniforme (a = 0).\n3. Rectas horizontales con v = 0: Reposo continuo (v = 0, a = 0).\n4. Rectas descendentes: Pendiente negativa ⟹ Desaceleración o aceleración negativa (a < 0).',
      },
      {
        title: '3. Procedimiento Numérico de Áreas',
        body: '• Triángulo: Área = (base · altura) / 2\n• Rectángulo: Área = base · altura\n• Trapecio: Área = ((base_menor + base_mayor) / 2) · altura',
      },
    ],
    finalAnswer:
      'El procedimiento riguroso consiste en descomponer los 11 intervalos en figuras elementales, sumar algebraicamente para el desplazamiento y en valor absoluto para la distancia total.',
    cartPreset: {
      type: 'mruv_cart',
      label: 'Móvil de Perfil v(t)',
      velocity: 0.0,
      initialVelocity: 0.0,
      acceleration: 2.5,
      color: '#0ea5e9',
      showVector: true,
      showAccelVector: true,
    },
  },

  {
    id: 'ex10_grafica_vt_puntos_af',
    title: 'Gráfica v(t) con Vértices A a F (5 Tramos Cinemáticos)',
    topic: 'Análisis Completo de Gráfica por Puntos',
    source: 'Hoja de Trabajo 02 • Ejercicio 10 (Kinal)',
    category: 'graph_analysis_vertices',
    statement:
      'Un móvil sigue el perfil de velocidad dado por los vértices:\nA(0 s, 0 m/s) ➔ B(4 s, 20 m/s) ➔ C(10 s, 20 m/s) ➔ D(14 s, 0 m/s) ➔ E(18 s, 0 m/s) ➔ F(22 s, -10 m/s).\n\na) Calcule la aceleración en cada tramo.\nb) Calcule el desplazamiento en cada intervalo.\nc) Determine el desplazamiento neto final y la rapidez media en los 22 s.',
    steps: [
      {
        title: '1. Tramo A ➔ B (t: 0s a 4s, v: 0 a 20 m/s)',
        body: '• Aceleración: a_AB = (20 - 0) / (4 - 0) = +5.0 m/s² (Acelerado hacia adelante)\n• Área (triángulo): Δx₁ = (4 · 20) / 2 = +40.0 m',
      },
      {
        title: '2. Tramo B ➔ C (t: 4s a 10s, v: 20 m/s constante)',
        body: '• Aceleración: a_BC = (20 - 20) / (10 - 4) = 0 m/s² (MRU)\n• Área (rectángulo): Δx₂ = (10 - 4) · 20 = 6 · 20 = +120.0 m',
      },
      {
        title: '3. Tramo C ➔ D (t: 10s a 14s, v: 20 a 0 m/s)',
        body: '• Aceleración: a_CD = (0 - 20) / (14 - 10) = -20 / 4 = -5.0 m/s² (Frenado uniforme)\n• Área (triángulo): Δx₃ = (4 · 20) / 2 = +40.0 m',
      },
      {
        title: '4. Tramo D ➔ E (t: 14s a 18s, v: 0 m/s en reposo)',
        body: '• Aceleración: a_DE = 0 m/s²\n• Desplazamiento: Δx₄ = 0 m (Móvil detenido)',
      },
      {
        title: '5. Tramo E ➔ F (t: 18s a 22s, v: 0 a -10 m/s)',
        body: '• Aceleración: a_EF = (-10 - 0) / (22 - 18) = -10 / 4 = -2.5 m/s² (Aceleración en reversa / -x)\n• Área (triángulo bajo eje t): Δx₅ = (4 · (-10)) / 2 = -20.0 m (retroceso)',
      },
      {
        title: '6. Desplazamiento Neto y Espacio Total',
        body: '• Desplazamiento neto: Δx_total = 40 + 120 + 40 + 0 - 20 = +180.0 m\n• Espacio total recorrido: d_total = |40| + |120| + |40| + |0| + |-20| = 220.0 m\n• Rapidez media: v_rap = 220.0 m / 22 s = 10.0 m/s (36.0 km/h)\n• Velocidad media vectorial: v_med = +180.0 m / 22 s = +8.18 m/s',
      },
    ],
    finalAnswer:
      'a_AB = +5 m/s², a_BC = 0, a_CD = -5 m/s², a_DE = 0, a_EF = -2.5 m/s² • Desplazamiento neto = 180.0 m • Distancia total = 220.0 m • Rapidez media = 10.0 m/s.',
    cartPreset: {
      type: 'mruv_cart',
      label: 'Móvil A-B (+5 m/s²)',
      velocity: 0.0,
      initialVelocity: 0.0,
      acceleration: 5.0,
      color: '#0ea5e9',
      showVector: true,
      showAccelVector: true,
    },
  },
];

/**
 * -------------------------------------------------------------------------
 * GENERATOR: Inserts Complete MRUV Exercise Solution & Physical Lab into Whiteboard
 * -------------------------------------------------------------------------
 */
export function buildMruvExerciseBoardElements(exercise, cx, cy) {
  const elements = [];
  const startX = cx - 440;
  const startY = cy - 230;

  // 1. Header Banner
  elements.push({
    id: `mruv_hdr_${Date.now()}`,
    type: 'text',
    x: startX,
    y: startY,
    text: `📐 RESOLUCIÓN MRUV: ${exercise.title.toUpperCase()}`,
    color: '#050038',
    fontSize: 20,
  });

  // 2. Statement Sticky Note
  elements.push({
    id: `mruv_stmt_${Date.now()}`,
    type: 'sticky',
    x: startX,
    y: startY + 36,
    width: 280,
    height: 190,
    text: `📝 ENUNCIADO:\n${exercise.statement}`,
    color: '#fff9b1',
  });

  // 3. Step by step solution cards
  const cardW = 270;
  const cardH = 190;
  exercise.steps.forEach((step, idx) => {
    const col = (idx + 1) % 3;
    const row = Math.floor((idx + 1) / 3);
    const cardX = startX + col * (cardW + 15);
    const cardY = startY + 36 + row * (cardH + 15);

    const colors = ['#d5f0ff', '#d3f8df', '#fed7aa', '#edd9ff', '#ffd5dc', '#fef08a'];
    const cardColor = colors[idx % colors.length];

    elements.push({
      id: `mruv_step_${idx}_${Date.now()}`,
      type: 'sticky',
      x: cardX,
      y: cardY,
      width: cardW,
      height: cardH,
      text: `${step.title}\n\n${step.body}`,
      color: cardColor,
    });
  });

  // 4. Final Answer Box
  const numRows = Math.ceil((exercise.steps.length + 1) / 3);
  const answerY = startY + 36 + numRows * (cardH + 15) - 15;
  elements.push({
    id: `mruv_ans_${Date.now()}`,
    type: 'sticky',
    x: startX,
    y: answerY,
    width: 580,
    height: 95,
    text: `🎯 RESPUESTA FINAL:\n${exercise.finalAnswer}`,
    color: '#d3f8df',
  });

  // 5. Interactive Physical Lab Assembly on Whiteboard
  const trackY = answerY + 145;
  const trackW = 760;

  // Track
  const track = createPhysicsElement('mru_track', startX + trackW / 2, trackY, {
    label: `Riel Graduado MRUV (${exercise.title})`,
    width: trackW,
    height: 38,
    lengthMeters: 8.0,
  });
  elements.push(track);

  // Cart 1
  const cartPreset = exercise.cartPreset || {
    type: 'mruv_cart',
    label: 'Móvil MRUV',
    velocity: 0.0,
    initialVelocity: 0.0,
    acceleration: 2.0,
    color: '#0ea5e9',
  };

  const cart1 = createPhysicsElement('mruv_cart', startX + 70, trackY - 38, {
    label: cartPreset.label || 'Móvil MRUV',
    velocity: cartPreset.velocity !== undefined ? cartPreset.velocity : 0.0,
    initialVelocity: cartPreset.initialVelocity !== undefined ? cartPreset.initialVelocity : 0.0,
    acceleration: cartPreset.acceleration !== undefined ? cartPreset.acceleration : 2.0,
    color: cartPreset.color || '#0ea5e9',
    showVector: true,
    showAccelVector: true,
  });
  elements.push(cart1);

  // If exercise has a second mobile (like Guepardo vs Moto)
  if (exercise.secondCartPreset) {
    const cart2 = createPhysicsElement('mruv_cart', startX + 220, trackY - 38, {
      label: exercise.secondCartPreset.label || 'Móvil 2',
      velocity: exercise.secondCartPreset.velocity || 0.0,
      initialVelocity: exercise.secondCartPreset.initialVelocity || 0.0,
      acceleration: exercise.secondCartPreset.acceleration || 7.41,
      color: exercise.secondCartPreset.color || '#d97706',
      showVector: true,
      showAccelVector: true,
    });
    elements.push(cart2);
  }

  return elements;
}
