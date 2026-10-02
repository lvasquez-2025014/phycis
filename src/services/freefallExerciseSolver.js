// =========================================================================
// CAÍDA LIBRE (HT03) EXERCISE SOLVER & WHITEBOARD LABORATORY GENERATOR
// Unidad 1: Movimiento Unidimensional • Física II • Quinto Bachillerato
// Colegio Kinal • Hoja de Trabajo 03: Caída Libre
// Includes all 10 problems from HT03 + 5 Conceptual Questions + Custom Calculator
// =========================================================================

import { createPhysicsElement } from '../physics/physicsRegistry';

/**
 * Standard Gravitational Acceleration
 */
export const STANDARD_GRAVITY = 9.80; // m/s²

/**
 * -------------------------------------------------------------------------
 * 1. PREGUNTAS CONCEPTUALES HT03 (FORMA 1)
 * -------------------------------------------------------------------------
 */
export const HT03_CONCEPTUAL_QUESTIONS = [
  {
    id: 'cq1_dripping_faucet',
    number: 1,
    title: 'Separación entre gotas de agua de un grifo',
    statement:
      'Un grifo gotea a un ritmo constante en el tiempo. A medida que las gotas caen hacia el suelo, ¿la distancia de separación entre dos gotas consecutivas aumenta, disminuye o permanece igual? Justifique su respuesta.',
    options: [
      { id: 'a', text: 'Disminuye, porque la aceleración de la gravedad las empuja hacia el mismo centro.' },
      { id: 'b', text: 'Permanece igual, porque cada gota sale con el mismo intervalo temporal fijo Δt.' },
      { id: 'c', text: 'Aumenta, porque la gota delantera partió antes y ha acelerado más tiempo, teniendo mayor rapidez instantánea.' },
      { id: 'd', text: 'Disminuye inicialmente y luego se mantiene fija al alcanzar el suelo.' },
    ],
    correctOptionId: 'c',
    explanation:
      'Si el intervalo entre gotas consecutivas es Δt, la gota inferior lleva cayendo un tiempo t mientras que la superior lleva un tiempo (t - Δt). La separación vertical entre ellas es Δy = y₁(t) - y₂(t - Δt) = ½g·t² - ½g(t - Δt)² = g·Δt·t - ½g(Δt)². Como esta diferencia depende linealmente de t (con coeficiente g·Δt > 0), a medida que el tiempo transcurre la distancia de separación entre gotas consecutivas AUMENTA continuamente.',
  },

  {
    id: 'cq2_triple_height',
    number: 2,
    title: 'Tiempo de caída al triplicar la altura (3h)',
    statement:
      'Un objeto se deja caer desde una altura h y tarda un tiempo T en llegar al suelo. Si el mismo objeto se deja caer desde una altura de 3h, ¿cuánto tiempo tardará en llegar al suelo en términos de T?',
    options: [
      { id: 'a', text: '3 · T' },
      { id: 'b', text: '9 · T' },
      { id: 'c', text: '√3 · T ≈ 1.732 T' },
      { id: 'd', text: 'T / √3' },
    ],
    correctOptionId: 'c',
    explanation:
      'Para un cuerpo que parte del reposo (v₀ = 0), la ecuación de posición es h = ½g·t², de donde el tiempo de caída es t = √(2h / g). Para la altura original h: T = √(2h / g). Para la nueva altura h\' = 3h: t\' = √(2·(3h) / g) = √3 · √(2h / g) = √3 · T ≈ 1.732 T. Por tanto, el tiempo se multiplica por √3, no por 3.',
  },

  {
    id: 'cq3_constant_acceleration',
    number: 3,
    title: 'Aceleración en caída libre en el vacío',
    statement:
      'A medida que un objeto cae libremente en el vacío, ¿su aceleración aumenta, disminuye o permanece igual?',
    options: [
      { id: 'a', text: 'Aumenta de forma lineal conforme incrementa su velocidad.' },
      { id: 'b', text: 'Aumenta proporcionalmente con el cuadrado de la distancia recorrida.' },
      { id: 'c', text: 'Disminuye debido a la compresión del campo gravitacional local.' },
      { id: 'd', text: 'Permanece constante e igual a la aceleración de la gravedad (a = g ≈ 9.80 m/s² hacia abajo).' },
    ],
    correctOptionId: 'd',
    explanation:
      'Por definición de caída libre ideal (en ausencia de resistencia del aire y en las cercanías de la superficie terrestre), la fuerza neta actuante es exclusivamente el peso del cuerpo (F = m·g). De acuerdo con la Segunda Ley de Newton, a = F / m = (m·g) / m = g = constante (9.80 m/s² dirigida verticalmente hacia abajo). Lo que aumenta con el tiempo es la RAPIDEZ (v = g·t), pero la ACELERACIÓN se mantiene estrictamente constante.',
  },

  {
    id: 'cq4_hammer_vs_eraser',
    number: 4,
    title: 'Goma de borrar vs Martillo en una cámara de vacío',
    statement:
      'Si se deja caer simultáneamente una goma de borrar y un martillo desde la misma altura en una cámara de vacío (sin resistencia del aire), ¿cuál de los dos llega primero al suelo?',
    options: [
      { id: 'a', text: 'El martillo, debido a que posee mayor masa e inercia gravitatoria.' },
      { id: 'b', text: 'Llegan exactamente al mismo tiempo, porque la aceleración de gravedad es independiente de la masa del objeto.' },
      { id: 'c', text: 'La goma de borrar, porque su menor peso le permite acelerar más rápidamente.' },
      { id: 'd', text: 'Depende de la forma geométrica y del volumen de cada uno.' },
    ],
    correctOptionId: 'b',
    explanation:
      'En el vacío no existe fricción aerodinámica. Aunque el martillo experimenta mayor fuerza de atracción gravitatoria (su peso es mayor), también posee proporcionalmente mayor inercia que resiste la aceleración. Ambos efectos se cancelan exactamente: a = F_grav / m = (G·M_T·m / R_T²) / m = g. Por ende, todos los cuerpos en caída libre en el vacío caen con la misma aceleración g = 9.80 m/s² e impactan el suelo en el mismo instante exacto (comprobado célebremente por Galileo en Pisa y por el astronauta David Scott en la Luna durante la misión Apolo 15 con un martillo y una pluma).',
  },

  {
    id: 'cq5_phone_drop_instants',
    number: 5,
    title: 'Velocidad y aceleración en el instante justo al soltar un objeto',
    statement:
      'Un estudiante suelta su teléfono celular desde lo alto de un puente. Justo en el instante inmediatamente posterior a soltarlo (t = 0⁺), ¿cuál es el estado de su velocidad y de su aceleración?',
    options: [
      { id: 'a', text: 'Su velocidad es cero y su aceleración es cero.' },
      { id: 'b', text: 'Su velocidad es cero (o infinitesimal hacia abajo), pero su aceleración es g = 9.80 m/s² hacia abajo desde el primer instante.' },
      { id: 'c', text: 'Su velocidad es máxima y su aceleración comienza en cero.' },
      { id: 'd', text: 'Su aceleración requiere de 1 segundo para alcanzar el valor de la gravedad.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Al soltar un cuerpo desde el reposo, su velocidad instantánea en t = 0 es v₀ = 0 m/s. Sin embargo, desde el preciso milisegundo en que el estudiante retira el contacto de su mano, la única fuerza que actúa sobre el teléfono es la gravedad terrestre (su peso). Por lo tanto, la aceleración gravitacional (a = g = 9.80 m/s² hacia abajo) actúa inmediatamente y con toda su magnitud desde el instante t = 0.',
  },
];

/**
 * -------------------------------------------------------------------------
 * 2. PROBLEMAS DE CÁLCULO HT03 (FORMA 2 - 10 PROBLEMAS COLEGIO KINAL)
 * -------------------------------------------------------------------------
 */
export const HT03_FREEFALL_EXERCISES = [
  {
    id: 'ht03_p1_stone_building_18m',
    number: 1,
    title: 'Piedra dejada caer desde azotea (h = 18.0 m)',
    topic: 'Caída desde el reposo',
    source: 'Problema 1 • HT03 Caída Libre Kinal',
    statement:
      'Se deja caer una piedra desde la azotea de un edificio y tarda en llegar al suelo después de caer 18.0 m. Calcule:\na) El tiempo que tarda en caer.\nb) La velocidad con la que choca contra el suelo.',
    category: 'rest_drop',
    params: {
      v0: 0.0,
      h: 18.0,
      g: 9.80,
    },
    assemblyConfig: {
      towerHeightM: 25.0,
      releaseHeightM: 18.0,
      v0: 0.0,
      color: '#ef4444',
      label: 'Piedra (h = 18 m)',
    },
    steps: [
      {
        title: '1. Identificación de Datos y Sistema de Coordenadas',
        body: '• Velocidad inicial: v₀ = 0 m/s ("se deja caer desde el reposo")\n• Distancia de caída: h = 18.0 m\n• Aceleración de la gravedad: g = 9.80 m/s² (hacia abajo)\n• Incógnitas: t = ? , vf = ?',
      },
      {
        title: '2. Cálculo del Tiempo de Caída (Inciso a)',
        body: 'Ecuación horaria de posición:\nh = v₀·t + ½·g·t²\nComo v₀ = 0:\nh = ½·g·t²  ⟹  t² = 2·h / g\nt = √(2 · 18.0 m / 9.80 m/s²)\nt = √(36.0 / 9.80) = √(3.6735 s²)\nt = 1.917 s ≈ 1.92 s',
      },
      {
        title: '3. Cálculo de la Velocidad de Impacto (Inciso b)',
        body: 'Ecuación de velocidad en función del tiempo:\nvf = v₀ + g·t\nvf = 0 + (9.80 m/s²) · (1.917 s)\nvf = 18.78 m/s  (hacia abajo)\n\nComprobación por ecuación independiente del tiempo:\nvf² = v₀² + 2·g·h = 0 + 2·(9.80)·(18.0) = 352.8 m²/s²\nvf = √(352.8) = 18.78 m/s  (67.62 km/h)',
      },
    ],
    finalAnswer: 'a) El tiempo de caída es t = 1.92 s.\nb) La velocidad con la que choca contra el suelo es vf = 18.78 m/s (67.6 km/h hacia abajo).',
  },

  {
    id: 'ht03_p2_brick_thrown_down',
    number: 2,
    title: 'Ladrillo lanzado hacia abajo con v₀ = 6.00 m/s desde torre de 40.0 m',
    topic: 'Lanzamiento vertical hacia abajo con velocidad inicial',
    source: 'Problema 2 • HT03 Caída Libre Kinal',
    statement:
      'Un ladrillo se lanza hacia abajo con una velocidad inicial de 6.00 m/s desde lo alto de una torre de 40.0 m de altura. ¿Con qué velocidad choca contra el suelo?',
    category: 'downward_throw',
    params: {
      v0: 6.0,
      h: 40.0,
      g: 9.80,
    },
    assemblyConfig: {
      towerHeightM: 50.0,
      releaseHeightM: 40.0,
      v0: 6.0,
      color: '#f59e0b',
      label: 'Ladrillo (v₀ = 6 m/s)',
    },
    steps: [
      {
        title: '1. Identificación de Datos',
        body: '• Velocidad inicial hacia abajo: v₀ = 6.00 m/s (no parte del reposo)\n• Altura de la torre: h = 40.0 m\n• Aceleración de la gravedad: g = 9.80 m/s²\n• Incógnita: Velocidad de choque vf = ?',
      },
      {
        title: '2. Aplicación de la Ecuación Independiente del Tiempo',
        body: 'vf² = v₀² + 2·g·h\nSustituyendo los valores conocidos:\nvf² = (6.00 m/s)² + 2 · (9.80 m/s²) · (40.0 m)\nvf² = 36.0 m²/s² + 784.0 m²/s²\nvf² = 820.0 m²/s²',
      },
      {
        title: '3. Despeje de la Rapidez Final',
        body: 'vf = √(820.0 m²/s²)\nvf = 28.636 m/s ≈ 28.64 m/s\n(Equivalente a: 28.64 · 3.6 = 103.09 km/h hacia abajo)',
      },
    ],
    finalAnswer: 'El ladrillo choca contra el suelo con una velocidad de vf = 28.64 m/s (103.1 km/h).',
  },

  {
    id: 'ht03_p3_last_second_fall',
    number: 3,
    title: 'Cuerpo cae de 120 m: Distancia recorrida en el último segundo',
    topic: 'Intervalos temporales y último segundo de caída',
    source: 'Problema 3 • HT03 Caída Libre Kinal',
    statement:
      'Un cuerpo cae libremente desde una altura de 120 m partiendo del reposo. ¿Qué distancia recorre en el último segundo de su caída?',
    category: 'last_second',
    params: {
      v0: 0.0,
      h: 120.0,
      g: 9.80,
    },
    assemblyConfig: {
      towerHeightM: 120.0,
      releaseHeightM: 120.0,
      v0: 0.0,
      color: '#6366f1',
      label: 'Cuerpo (h = 120 m)',
    },
    steps: [
      {
        title: '1. Cálculo del Tiempo Total de Caída',
        body: 'Para h = 120 m partiendo del reposo (v₀ = 0):\nh = ½·g·t_total²  ⟹  t_total = √(2·h / g)\nt_total = √(2 · 120 m / 9.80 m/s²) = √(240 / 9.80) = √(24.4898)\nt_total = 4.949 s ≈ 4.95 s',
      },
      {
        title: '2. Tiempo un segundo antes de tocar tierra',
        body: 'El último segundo transcurre en el intervalo entre t₁ y t_total:\nt₁ = t_total - 1.00 s = 4.949 s - 1.00 s = 3.949 s',
      },
      {
        title: '3. Distancia recorrida hasta t₁ = 3.949 s',
        body: 'h₁ = ½·g·t₁² = ½ · (9.80 m/s²) · (3.949 s)²\nh₁ = 4.90 · 15.5946 = 76.41 m\n(A los 3.949 s el cuerpo ha descendido 76.41 m desde la azotea).',
      },
      {
        title: '4. Distancia en el Último Segundo',
        body: 'Δh_último_segundo = h_total - h₁\nΔh = 120.0 m - 76.41 m = 43.59 m ≈ 43.60 m',
      },
    ],
    finalAnswer: 'En el último segundo de su caída, el cuerpo recorre una distancia de 43.60 m.',
  },

  {
    id: 'ht03_p4_flowerpot_window',
    number: 4,
    title: 'Maceta pasa por una ventana de 4.00 m en 0.200 s',
    topic: 'Paso por ventana de altura finita',
    source: 'Problema 4 • HT03 Caída Libre Kinal',
    statement:
      'Una maceta cae desde una repisa en un edificio. Pasa por una ventana de 4.00 m de altura en un tiempo de 0.200 s. ¿A qué distancia por encima de la parte superior de la ventana se encuentra la repisa desde donde cayó?',
    category: 'window_crossing',
    params: {
      windowHeight: 4.0,
      windowTime: 0.2,
      g: 9.80,
    },
    assemblyConfig: {
      towerHeightM: 30.0,
      releaseHeightM: 22.46,
      v0: 0.0,
      color: '#10b981',
      label: 'Maceta (h = 18.5 m s/ventana)',
    },
    steps: [
      {
        title: '1. Modelo Físico del Paso por la Ventana',
        body: 'Sea v₁ la velocidad de la maceta al llegar al borde superior de la ventana.\nDurante el paso de la ventana (altura Δy = 4.00 m en Δt = 0.200 s):\nΔy = v₁·Δt + ½·g·(Δt)²',
      },
      {
        title: '2. Cálculo de la Velocidad al Entrar a la Ventana (v₁)',
        body: '4.00 = v₁ · (0.200) + ½ · (9.80) · (0.200)²\n4.00 = 0.200·v₁ + 4.90 · (0.040)\n4.00 = 0.200·v₁ + 0.196\n0.200·v₁ = 4.00 - 0.196 = 3.804\nv₁ = 3.804 / 0.200 = 19.02 m/s',
      },
      {
        title: '3. Distancia desde la Repisa hasta el Tope de la Ventana',
        body: 'Desde el reposo (v₀ = 0) en la repisa hasta el borde superior de la ventana:\nv₁² = v₀² + 2·g·h_repisa\n(19.02 m/s)² = 0 + 2 · (9.80 m/s²) · h_repisa\n361.76 = 19.60 · h_repisa\nh_repisa = 361.76 / 19.60 = 18.457 m ≈ 18.46 m',
      },
    ],
    finalAnswer: 'La repisa se encuentra a 18.46 m por encima de la parte superior de la ventana.',
  },

  {
    id: 'ht03_p5_ball_50m',
    number: 5,
    title: 'Pelota soltada desde una altura de 50.0 m',
    topic: 'Caída desde 50 metros',
    source: 'Problema 5 • HT03 Caída Libre Kinal',
    statement:
      'Una pelota se suelta desde una altura de 50.0 m sobre el nivel del suelo. Calcule:\na) Su velocidad justo antes de tocar el suelo.\nb) El tiempo que tarda en caer.',
    category: 'rest_drop',
    params: {
      v0: 0.0,
      h: 50.0,
      g: 9.80,
    },
    assemblyConfig: {
      towerHeightM: 50.0,
      releaseHeightM: 50.0,
      v0: 0.0,
      color: '#0284c7',
      label: 'Pelota (50 m)',
    },
    steps: [
      {
        title: '1. Cálculo de la Velocidad de Impacto (Inciso a)',
        body: 'v₀ = 0 m/s , h = 50.0 m , g = 9.80 m/s²\nvf² = v₀² + 2·g·h\nvf² = 0 + 2 · (9.80 m/s²) · (50.0 m) = 980.0 m²/s²\nvf = √(980.0) = 31.305 m/s ≈ 31.30 m/s  (112.7 km/h hacia abajo)',
      },
      {
        title: '2. Cálculo del Tiempo de Caída (Inciso b)',
        body: 'Método 1 (por definición de velocidad):\nvf = g·t  ⟹  t = vf / g = 31.305 / 9.80 = 3.194 s ≈ 3.19 s\n\nMétodo 2 (directo de altura):\nt = √(2·h / g) = √(2 · 50.0 / 9.80) = √(100 / 9.80) = √(10.204) = 3.19 s',
      },
    ],
    finalAnswer: 'a) La velocidad de impacto es vf = 31.30 m/s.\nb) El tiempo que tarda en caer es t = 3.19 s.',
  },

  {
    id: 'ht03_p6_multi_questions_rest',
    number: 6,
    title: 'Estudio cinemático completo de caída libre (5 incisos)',
    topic: 'Parámetros cinemáticos múltiples',
    source: 'Problema 6 • HT03 Caída Libre Kinal',
    statement:
      'Un cuerpo cae libremente desde el reposo. Calcule:\na) La aceleración del cuerpo.\nb) La distancia recorrida después de 3.00 s.\nc) La rapidez después de caer 70.0 m.\nd) El tiempo necesario para alcanzar una rapidez de 25.0 m/s.\ne) El tiempo que tarda en recorrer 300 m.',
    category: 'kinematic_multi',
    params: {
      v0: 0.0,
      t_b: 3.0,
      h_c: 70.0,
      v_d: 25.0,
      h_e: 300.0,
      g: 9.80,
    },
    assemblyConfig: {
      towerHeightM: 120.0,
      releaseHeightM: 70.0,
      v0: 0.0,
      color: '#d97706',
      label: 'Cuerpo Multi-Inciso',
    },
    steps: [
      {
        title: 'a) Aceleración del cuerpo',
        body: 'En caída libre cerca de la superficie terrestre, la aceleración es constante:\na = g = 9.80 m/s² dirigida verticalmente hacia abajo.',
      },
      {
        title: 'b) Distancia recorrida tras t = 3.00 s',
        body: 'd = ½·g·t² = ½ · (9.80 m/s²) · (3.00 s)²\nd = 4.90 · 9.00 = 44.10 m',
      },
      {
        title: 'c) Rapidez después de caer h = 70.0 m',
        body: 'v² = 2·g·h = 2 · (9.80 m/s²) · (70.0 m) = 1372.0 m²/s²\nv = √(1372.0) = 37.04 m/s',
      },
      {
        title: 'd) Tiempo para alcanzar v = 25.0 m/s',
        body: 'v = g·t  ⟹  t = v / g = 25.0 m/s / 9.80 m/s² = 2.551 s ≈ 2.55 s',
      },
      {
        title: 'e) Tiempo para recorrer h = 300 m',
        body: 'h = ½·g·t²  ⟹  t = √(2·h / g) = √(2 · 300 m / 9.80 m/s²) = √(600 / 9.80)\nt = √(61.224) = 7.825 s ≈ 7.82 s',
      },
    ],
    finalAnswer: 'a) a = 9.80 m/s²\nb) d(3 s) = 44.10 m\nc) v(70 m) = 37.04 m/s\nd) t(25 m/s) = 2.55 s\ne) t(300 m) = 7.82 s',
  },

  {
    id: 'ht03_p7_marble_bridge_water',
    number: 7,
    title: 'Canica desde puente cae al agua en 5.00 s',
    topic: 'Tiempo de vuelo dado',
    source: 'Problema 7 • HT03 Caída Libre Kinal',
    statement:
      'Una canica se deja caer desde un puente y golpea el agua debajo 5.00 s después. Calcule:\na) La rapidez con la que golpea el agua.\nb) La altura del puente sobre el nivel del agua.',
    category: 'bridge_drop',
    params: {
      v0: 0.0,
      t: 5.0,
      g: 9.80,
    },
    assemblyConfig: {
      towerHeightM: 120.0,
      releaseHeightM: 122.5,
      v0: 0.0,
      color: '#06b6d4',
      label: 'Canica (t = 5 s)',
    },
    steps: [
      {
        title: '1. Rapidez de Impacto en el Agua (Inciso a)',
        body: 'v₀ = 0 m/s , t = 5.00 s , g = 9.80 m/s²\nv = v₀ + g·t\nv = 0 + (9.80 m/s²) · (5.00 s) = 49.00 m/s  (176.4 km/h)',
      },
      {
        title: '2. Altura del Puente (Inciso b)',
        body: 'h = v₀·t + ½·g·t²\nh = 0 + ½ · (9.80 m/s²) · (5.00 s)²\nh = 4.90 · 25.00 = 122.50 m',
      },
    ],
    finalAnswer: 'a) La rapidez con la que golpea el agua es v = 49.00 m/s.\nb) La altura del puente sobre el agua es h = 122.50 m.',
  },

  {
    id: 'ht03_p8_stone_thrown_25m',
    number: 8,
    title: 'Piedra lanzada a 8.00 m/s desde una altura de 25.0 m',
    topic: 'Lanzamiento vertical hacia abajo de altura intermedia',
    source: 'Problema 8 • HT03 Caída Libre Kinal',
    statement:
      'Se lanza una piedra verticalmente hacia abajo con una rapidez inicial de 8.00 m/s desde una altura de 25.0 m. Calcule:\na) El tiempo que tarda en llegar al suelo.\nb) La rapidez con la que impacta contra el suelo.',
    category: 'downward_throw',
    params: {
      v0: 8.0,
      h: 25.0,
      g: 9.80,
    },
    assemblyConfig: {
      towerHeightM: 30.0,
      releaseHeightM: 25.0,
      v0: 8.0,
      color: '#8b5cf6',
      label: 'Piedra (v₀ = 8 m/s)',
    },
    steps: [
      {
        title: '1. Rapidez de Impacto contra el Suelo (Inciso b)',
        body: 'vf² = v₀² + 2·g·h\nvf² = (8.00 m/s)² + 2 · (9.80 m/s²) · (25.0 m)\nvf² = 64.0 + 490.0 = 554.0 m²/s²\nvf = √(554.0) = 23.537 m/s ≈ 23.54 m/s',
      },
      {
        title: '2. Tiempo de Caída (Inciso a)',
        body: 'Método 1 (a partir de la velocidad final calculada):\nvf = v₀ + g·t  ⟹  t = (vf - v₀) / g\nt = (23.537 m/s - 8.00 m/s) / 9.80 m/s² = 15.537 / 9.80 = 1.585 s ≈ 1.59 s\n\nMétodo 2 (Ecuación cuadrática de posición):\nh = v₀·t + ½·g·t²  ⟹  4.90·t² + 8.00·t - 25.0 = 0\nt = [-8.00 + √(64.0 - 4(4.90)(-25.0))] / (2 · 4.90) = (-8.00 + √554) / 9.80 = 1.59 s',
      },
    ],
    finalAnswer: 'a) El tiempo en llegar al suelo es t = 1.59 s.\nb) La rapidez de impacto es vf = 23.54 m/s.',
  },

  {
    id: 'ht03_p9_two_balls_delayed',
    number: 9,
    title: 'Dos pelotas dejadas caer con 1.50 s de diferencia',
    topic: 'Problema de dos cuerpos con desfase temporal',
    source: 'Problema 9 • HT03 Caída Libre Kinal',
    statement:
      'Una pelota se deja caer desde el reposo desde una torre alta. Exactamente 1.50 s más tarde, se deja caer una segunda pelota desde la misma altura. Cuando la primera pelota lleva 5.00 s en el aire:\na) ¿Cuál es la distancia de separación entre las dos pelotas?\nb) ¿Qué distancia ha recorrido cada pelota?',
    category: 'delayed_two_balls',
    params: {
      v0: 0.0,
      t1: 5.0,
      delay: 1.5,
      g: 9.80,
    },
    assemblyConfig: {
      towerHeightM: 120.0,
      releaseHeightM: 122.5,
      v0: 0.0,
      color: '#ec4899',
      label: 'Pelota 1 vs Pelota 2',
    },
    steps: [
      {
        title: '1. Tiempo en el Aire de Cada Pelota',
        body: '• Pelota 1: t₁ = 5.00 s\n• Pelota 2 partió 1.50 s después: t₂ = t₁ - 1.50 s = 5.00 s - 1.50 s = 3.50 s',
      },
      {
        title: '2. Distancia Recorrida por la Pelota 1 (Inciso b - parte 1)',
        body: 'h₁ = ½·g·t₁² = ½ · (9.80 m/s²) · (5.00 s)² = 4.90 · 25.00 = 122.50 m',
      },
      {
        title: '3. Distancia Recorrida por la Pelota 2 (Inciso b - parte 2)',
        body: 'h₂ = ½·g·t₂² = ½ · (9.80 m/s²) · (3.50 s)² = 4.90 · 12.25 = 60.025 m ≈ 60.03 m',
      },
      {
        title: '4. Distancia de Separación entre las Pelotas (Inciso a)',
        body: 'Δh = h₁ - h₂ = 122.50 m - 60.025 m = 62.475 m ≈ 62.48 m',
      },
    ],
    finalAnswer: 'a) La distancia de separación es Δh = 62.48 m.\nb) La Pelota 1 ha recorrido 122.50 m y la Pelota 2 ha recorrido 60.03 m.',
  },

  {
    id: 'ht03_p10_cat_landing_flex',
    number: 10,
    title: 'Gato cae desde 6.40 m y flexiona patas 14.0 cm',
    topic: 'Caída libre combinada con desaceleración de impacto (MRUV)',
    source: 'Problema 10 • HT03 Caída Libre Kinal',
    statement:
      'Un gato cae desde un balcón a una altura de 6.40 m. Al aterrizar, flexiona sus patas desacelerando uniformemente a lo largo de una distancia de 14.0 cm (0.140 m) hasta detenerse por completo. Calcule:\na) La rapidez del gato justo antes de tocar el suelo.\nb) La magnitud de la aceleración de frenado experimentada por el gato al flexionar sus patas (exprese también en múltiplos de g).',
    category: 'cat_landing',
    params: {
      v0: 0.0,
      h_fall: 6.4,
      d_cushion: 0.14,
      g: 9.80,
    },
    assemblyConfig: {
      towerHeightM: 20.0,
      releaseHeightM: 6.4,
      v0: 0.0,
      color: '#14b8a6',
      label: 'Gato (h = 6.4 m)',
    },
    steps: [
      {
        title: '1. Fase 1: Caída Libre (Balcón hasta tocar el suelo)',
        body: 'v₀ = 0 m/s , h = 6.40 m , g = 9.80 m/s²\nv_impacto² = v₀² + 2·g·h = 0 + 2 · (9.80 m/s²) · (6.40 m) = 125.44 m²/s²\nv_impacto = √(125.44) = 11.20 m/s  (40.32 km/h hacia abajo)',
      },
      {
        title: '2. Fase 2: Frenado de Aterrizaje al Flexionar Patas (MRUV)',
        body: '• Rapidez inicial de frenado: v_i = 11.20 m/s\n• Rapidez final: v_f = 0 m/s (se detiene)\n• Distancia de compresión de patas: d = 14.0 cm = 0.140 m\nEcuación de MRUV: v_f² = v_i² + 2·a·d',
      },
      {
        title: '3. Magnitud de la Aceleración de Frenado (Inciso b)',
        body: '0 = (11.20 m/s)² + 2 · a · (0.140 m)\n0 = 125.44 + 0.280 · a\n0.280 · a = -125.44\na = -125.44 / 0.280 = -448.00 m/s²\nMagnitud: |a| = 448.00 m/s² (dirigida hacia arriba frenando el cuerpo)',
      },
      {
        title: '4. Expresión en Múltiplos de la Gravedad (g)',
        body: 'n_g = |a| / g = 448.00 m/s² / 9.80 m/s² = 45.714 g ≈ 45.7 g\nEl cuerpo del gato resiste una aceleración de 45.7 veces la gravedad terrestre durante el impacto.',
      },
    ],
    finalAnswer: 'a) La rapidez del gato justo antes de tocar el suelo es v = 11.20 m/s (40.3 km/h).\nb) La aceleración de frenado es de 448.00 m/s² (hacia arriba), equivalente a 45.7 g.',
  },
];

/**
 * -------------------------------------------------------------------------
 * 3. CALCULADORA DINÁMICA DE CAÍDA LIBRE (2 variables de entrada)
 * -------------------------------------------------------------------------
 */
export function solveCustomFreefall({
  v0 = 0,
  h = null,
  t = null,
  vf = null,
  g = 9.80,
}) {
  const gVal = parseFloat(g) || 9.80;
  const v0Val = parseFloat(v0) || 0;
  const hVal = h !== null && h !== '' ? parseFloat(h) : null;
  const tVal = t !== null && t !== '' ? parseFloat(t) : null;
  const vfVal = vf !== null && vf !== '' ? parseFloat(vf) : null;

  let computedH = hVal;
  let computedT = tVal;
  let computedVf = vfVal;
  const steps = [];

  // Case 1: Given h
  if (hVal !== null && hVal > 0) {
    // vf² = v0² + 2gh
    computedVf = Math.sqrt(v0Val * v0Val + 2 * gVal * hVal);
    computedT = (computedVf - v0Val) / gVal;
    steps.push({
      title: '1. Velocidad de Impacto (vf)',
      body: `vf² = v₀² + 2·g·h = (${v0Val})² + 2·(${gVal})·(${hVal}) = ${(v0Val * v0Val + 2 * gVal * hVal).toFixed(2)} m²/s²\nvf = √(${(v0Val * v0Val + 2 * gVal * hVal).toFixed(2)}) = ${computedVf.toFixed(2)} m/s (${(computedVf * 3.6).toFixed(1)} km/h)`,
    });
    steps.push({
      title: '2. Tiempo de Caída (t)',
      body: `t = (vf - v₀) / g = (${computedVf.toFixed(2)} - ${v0Val}) / ${gVal} = ${computedT.toFixed(2)} s`,
    });
  } 
  // Case 2: Given t
  else if (tVal !== null && tVal > 0) {
    computedVf = v0Val + gVal * tVal;
    computedH = v0Val * tVal + 0.5 * gVal * tVal * tVal;
    steps.push({
      title: '1. Velocidad Final (vf)',
      body: `vf = v₀ + g·t = ${v0Val} + (${gVal})·(${tVal}) = ${computedVf.toFixed(2)} m/s (${(computedVf * 3.6).toFixed(1)} km/h)`,
    });
    steps.push({
      title: '2. Altura de Caída (h)',
      body: `h = v₀·t + ½·g·t² = ${v0Val}·(${tVal}) + ½·(${gVal})·(${tVal})² = ${computedH.toFixed(2)} m`,
    });
  }
  // Case 3: Given vf
  else if (vfVal !== null && vfVal > v0Val) {
    computedT = (vfVal - v0Val) / gVal;
    computedH = (vfVal * vfVal - v0Val * v0Val) / (2 * gVal);
    steps.push({
      title: '1. Tiempo de Caída (t)',
      body: `t = (vf - v₀) / g = (${vfVal} - ${v0Val}) / ${gVal} = ${computedT.toFixed(2)} s`,
    });
    steps.push({
      title: '2. Altura de Caída (h)',
      body: `h = (vf² - v₀²) / (2·g) = (${vfVal * vfVal} - ${v0Val * v0Val}) / (2·${gVal}) = ${computedH.toFixed(2)} m`,
    });
  }

  return {
    v0: v0Val,
    h: computedH ? +computedH.toFixed(2) : 0,
    t: computedT ? +computedT.toFixed(2) : 0,
    vf: computedVf ? +computedVf.toFixed(2) : 0,
    g: gVal,
    steps,
  };
}

/**
 * -------------------------------------------------------------------------
 * 4. WHITEBOARD ASSEMBLY GENERATOR: MOUNT HT03 EXERCISE ON BOARD
 * Creates full engineering pedagogical cards and interactive physical assembly
 * -------------------------------------------------------------------------
 */
export function buildFreefallExerciseBoardElements(exercise, cx, cy) {
  const elements = [];
  const startX = cx - 440;
  const startY = cy - 240;

  // 1. Header Banner
  elements.push({
    id: `hdr_ff_${Date.now()}`,
    type: 'text',
    x: startX,
    y: startY,
    text: `🌍 HT03 CAÍDA LIBRE: ${exercise.title.toUpperCase()}`,
    color: '#050038',
    fontSize: 20,
  });

  // 2. Statement Sticky Note
  elements.push({
    id: `stmt_ff_${Date.now()}`,
    type: 'sticky',
    x: startX,
    y: startY + 36,
    width: 290,
    height: 190,
    text: `📝 ENUNCIADO (HT03):\n${exercise.statement}`,
    color: '#fff9b1',
  });

  // 3. Step-by-Step Solution Cards
  const cardW = 270;
  const cardH = 190;
  const colors = ['#d5f0ff', '#d3f8df', '#fed7aa', '#edd9ff', '#ffd5dc'];

  exercise.steps.forEach((step, idx) => {
    const col = (idx + 1) % 3;
    const row = Math.floor((idx + 1) / 3);
    const cardX = startX + col * (cardW + 15);
    const cardY = startY + 36 + row * (cardH + 15);
    const cardColor = colors[idx % colors.length];

    elements.push({
      id: `step_ff_${idx}_${Date.now()}`,
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
  const totalCards = exercise.steps.length + 1;
  const totalRows = Math.ceil(totalCards / 3);
  const answerY = startY + 36 + totalRows * (cardH + 15) - 10;

  elements.push({
    id: `ans_ff_${Date.now()}`,
    type: 'sticky',
    x: startX,
    y: answerY,
    width: 590,
    height: 95,
    text: `🎯 RESULTADOS Y CONCLUSIÓN (HT03):\n${exercise.finalAnswer}`,
    color: '#d3f8df',
  });

  // 5. Physical Scale Laboratory Assembly:
  // Right side of cards: Vertical Drop Tower + Freefall Body + Photogates
  const towerX = startX + 640;
  const towerY = startY + 50;
  const cfg = exercise.assemblyConfig || {};
  const towerH = 460;
  const towerW = 44;

  // Tower
  const tower = createPhysicsElement('freefall_tower', towerX, towerY, {
    label: `Torre HT03 (${cfg.towerHeightM || 50} m)`,
    width: towerW,
    height: towerH,
    heightMeters: cfg.towerHeightM || 50.0,
  });

  // Falling Body
  const bodyW = 42;
  const bodyH = 42;
  const body = createPhysicsElement('freefall_body', towerX + 46, towerY - towerH / 2 + 24, {
    label: cfg.label || 'Cuerpo HT03',
    velocity: cfg.v0 || 0.0,
    initialVelocity: cfg.v0 || 0.0,
    gravity: 9.80,
    releaseHeight: cfg.releaseHeightM || 50.0,
    color: cfg.color || '#ef4444',
    width: bodyW,
    height: bodyH,
    showVector: true,
    showGravityVector: true,
  });

  // Mid-way Photogate Sensor 1
  const gateA = createPhysicsElement('mru_photogate', towerX + 46, towerY - towerH / 2 + 160, {
    label: 'Sensor 1',
    gateName: 'Sensor 1',
  });

  // Ground-level Photogate Sensor 2
  const gateB = createPhysicsElement('mru_photogate', towerX + 46, towerY + towerH / 2 - 40, {
    label: 'Sensor 2',
    gateName: 'Sensor 2',
  });

  elements.push(tower, body, gateA, gateB);

  return elements;
}
