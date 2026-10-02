// =========================================================================
// TIRO VERTICAL (HT04) EXERCISE SOLVER & WHITEBOARD LABORATORY GENERATOR
// Unidad 1: Movimiento Unidimensional • Física II • Quinto Bachillerato
// Colegio Kinal • Hoja de Trabajo 04: Tiro Vertical
// Includes all 10 problems from HT04 + 6 Conceptual Questions + Dynamic Calculator
// =========================================================================

import { createPhysicsElement } from '../physics/physicsRegistry';

/**
 * Standard Gravitational Acceleration
 */
export const STANDARD_GRAVITY = 9.80; // m/s² (Tierra)
export const LUNAR_GRAVITY = 1.60;    // m/s² (Luna HT04 P8 y P9)

/**
 * -------------------------------------------------------------------------
 * 1. PREGUNTAS CONCEPTUALES HT04 (FORMA 1)
 * -------------------------------------------------------------------------
 */
export const HT04_CONCEPTUAL_QUESTIONS = [
  {
    id: 'cq1_max_acceleration_instant',
    number: 1,
    title: 'Momento de mayor aceleración en tiro vertical',
    statement:
      'Una pelota se lanza verticalmente hacia arriba en el aire. ¿En qué momento es mayor su aceleración?',
    options: [
      { id: 'a', text: 'Justo después de soltarla de la mano, porque lleva la máxima velocidad.' },
      { id: 'b', text: 'En el punto más alto (cúspide), porque allí la velocidad se detiene instantáneamente.' },
      { id: 'c', text: 'Justo antes de tocar el suelo al regresar, debido a la caída acumulada.' },
      { id: 'd', text: 'Es la misma en todos los puntos de la trayectoria (constante e igual a g = 9.80 m/s² hacia abajo).' },
    ],
    correctOptionId: 'd',
    explanation:
      'Una vez que el objeto abandona la mano del lanzador y se mueve libremente en el aire (despreciando la resistencia aerodinámica), la única fuerza que actúa sobre él es la fuerza de atracción gravitacional terrestre (su peso W = m·g). Por la 2ª Ley de Newton: a = F_neta / m = -m·g / m = -g. La aceleración es estrictamente CONSTANTE en magnitud (9.80 m/s²) y dirección (vertical hacia abajo) en la subida, en la cúspide y en la bajada.',
  },

  {
    id: 'cq2_speed_return_launch_point',
    number: 2,
    title: 'Rapidez al regresar al punto de lanzamiento',
    statement:
      'Un proyectil se lanza verticalmente hacia arriba con una rapidez v₀. Si se desprecia la resistencia del aire, ¿cuál es su rapidez en el instante en que regresa exactamente al mismo nivel desde donde fue lanzado?',
    options: [
      { id: 'a', text: 'Cero, porque toda su energía se disipó en la cúspide.' },
      { id: 'b', text: 'La mitad de la rapidez inicial (v₀ / 2).' },
      { id: 'c', text: 'Exactamente la misma rapidez inicial (v = v₀).' },
      { id: 'd', text: 'El doble de la rapidez inicial (2·v₀).' },
    ],
    correctOptionId: 'c',
    explanation:
      'Por cinemática simétrica y por la ley de conservación de la energía mecánica (E_cinética + E_potencial = constante), en ausencia de fricción del aire: E_c(inicial) + 0 = 0 + E_p(cúspide) = E_c(final) + 0. Por ende, ½·m·(v_f)² = ½·m·(v₀)², de modo que |v_f| = |v₀|. La rapidez es idéntica; únicamente se invierte el sentido del vector velocidad (apuntando hacia abajo).',
  },

  {
    id: 'cq3_flight_time_symmetry',
    number: 3,
    title: 'Relación entre tiempo de vuelo total T y tiempo de subida',
    statement:
      'Un objeto es lanzado verticalmente hacia arriba y tarda un tiempo t_subida en alcanzar su altura máxima. Si regresa al mismo nivel de lanzamiento, ¿cuál es la relación entre el tiempo total en el aire T y el tiempo de subida t_subida?',
    options: [
      { id: 'a', text: 'T = t_subida' },
      { id: 'b', text: 'T = 4 · t_subida' },
      { id: 'c', text: 'T = 2 · t_subida (el tiempo de subida es exactamente igual al tiempo de bajada)' },
      { id: 'd', text: 'T = √2 · t_subida' },
    ],
    correctOptionId: 'c',
    explanation:
      'En la subida: v_cúspide = 0 = v₀ - g·t_subida ⟹ t_subida = v₀ / g. En la bajada desde el reposo: 0 - (-v₀) = g·t_bajada ⟹ t_bajada = v₀ / g. Como la aceleración de frenado en el ascenso es idéntica en magnitud a la aceleración de impulso en el descenso, t_subida = t_bajada. Por consiguiente, el tiempo total de permanencia en el aire es T = t_subida + t_bajada = 2·t_subida.',
  },

  {
    id: 'cq4_acceleration_at_apex',
    number: 4,
    title: 'Aceleración en la cúspide cuando la velocidad es cero (v = 0)',
    statement:
      'En el punto más alto de la trayectoria de un tiro vertical, la velocidad del cuerpo es instantáneamente cero (v = 0). ¿Cuál es el valor de su aceleración en ese preciso instante?',
    options: [
      { id: 'a', text: 'a = 9.80 m/s² dirigida hacia abajo (la gravedad sigue actuando constantemente).' },
      { id: 'b', text: 'a = 0 m/s², porque al no haber movimiento no existe aceleración.' },
      { id: 'c', text: 'a = 9.80 m/s² dirigida hacia arriba, para prepararlo para descender.' },
      { id: 'd', text: 'a = Infinito, debido al cambio abrupto de signo en la velocidad.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Si en la cúspide la aceleración fuese cero cuando la velocidad es cero, por la 1ª Ley de Newton el objeto permanecería flotando indefinidamente en el reposo. La aceleración es la tasa de cambio de la velocidad (a = dv/dt). En la cúspide, aunque v = 0, la velocidad está cambiando continuamente de valores positivos (hacia arriba) a negativos (hacia abajo). La fuerza de gravedad nunca deja de atraer a la masa: a = -g = -9.80 m/s².',
  },

  {
    id: 'cq5_average_velocity_whole_flight',
    number: 5,
    title: 'Módulo de la velocidad media durante todo el vuelo de retorno',
    statement:
      'Una pelota se lanza verticalmente hacia arriba y regresa a la mano del lanzador tras un tiempo T. ¿Cuál es la velocidad media vectorial del movimiento completo?',
    options: [
      { id: 'a', text: 'v_media = v₀ / 2' },
      { id: 'b', text: 'v_media = 0 m/s, porque el desplazamiento neto es cero (Δy = 0).' },
      { id: 'c', text: 'v_media = g · T' },
      { id: 'd', text: 'v_media = 2 · v₀' },
    ],
    correctOptionId: 'b',
    explanation:
      'Por definición física, la velocidad media es el desplazamiento neto dividido entre el tiempo transcurrido: v_media = Δy / Δt = (y_final - y_inicial) / T. Como la pelota regresa al mismo punto de partida, su posición final es igual a la inicial: y_final = y_inicial ⟹ Δy = 0. Por ende: v_media = 0 / T = 0 m/s. (Nota: la rapidez media escalar no es cero, pero la velocidad media vectorial sí es estrictamente cero).',
  },

  {
    id: 'cq6_double_initial_velocity',
    number: 6,
    title: 'Efecto en la altura máxima al duplicar la velocidad inicial (2v₀)',
    statement:
      'Si un proyectil lanzado verticalmente hacia arriba alcanza una altura máxima h con velocidad inicial v₀, ¿qué altura máxima alcanzará si se lanza con el doble de velocidad inicial (2·v₀)?',
    options: [
      { id: 'a', text: 'Alcanzará 4 · h (se cuadruplica).' },
      { id: 'b', text: 'Alcanzará 2 · h (se duplica).' },
      { id: 'c', text: 'Alcanzará 8 · h.' },
      { id: 'd', text: 'Alcanzará √2 · h.' },
    ],
    correctOptionId: 'a',
    explanation:
      'La ecuación cinemática en la cúspide (donde v = 0) es: v² = v₀² - 2g·h ⟹ 0 = v₀² - 2g·h ⟹ h = v₀² / (2g). La altura máxima es proporcional al CUADRADO de la velocidad inicial (h ∝ v₀²). Si la velocidad se duplica a v₀\' = 2·v₀: h\' = (2·v₀)² / (2g) = 4·v₀² / (2g) = 4 · h. Por lo tanto, duplicar la rapidez inicial cuadruplica la altura alcanzada.',
  },
];

/**
 * -------------------------------------------------------------------------
 * 2. PROBLEMAS DE CÁLCULO HT04 (FORMA 2 - 10 PROBLEMAS COLEGIO KINAL)
 * -------------------------------------------------------------------------
 */
export const HT04_VERTICAL_EXERCISES = [
  {
    id: 'ht04_p1_ball_20ms',
    number: 1,
    title: 'Pelota lanzada verticalmente hacia arriba (v₀ = 20.0 m/s)',
    topic: 'Cinemática básica de tiro vertical',
    source: 'Problema 1 • HT04 Tiro Vertical Kinal',
    statement:
      'Una pelota se lanza verticalmente hacia arriba con una velocidad inicial de 20.0 m/s. Calcule:\na) El tiempo que la pelota permanece en el aire.\nb) La altura máxima que alcanza.\nc) Los momentos en que la pelota está a una altura de 15.0 m.',
    category: 'ground_to_ground',
    params: {
      v0: 20.0,
      g: 9.80,
      hTarget: 15.0,
    },
    assemblyConfig: {
      v0: 20.0,
      g: 9.80,
      label: 'Pelota (v₀ = 20 m/s)',
      color: '#8b5cf6',
      targetHeightM: 15.0,
    },
    steps: [
      {
        title: '1. Identificación de Datos y Sistema de Coordenadas',
        body: '• Velocidad inicial: v₀ = +20.0 m/s (hacia arriba)\n• Aceleración de la gravedad: g = 9.80 m/s² (deceleración: a = -g)\n• Nivel de referencia: y₀ = 0 en el suelo.',
      },
      {
        title: '2. Tiempo de Permanencia en el Aire (Inciso a)',
        body: 'Tiempo de subida a la cúspide (v = 0):\nt_subida = v₀ / g = 20.0 m/s / 9.80 m/s² = 2.041 s\nPor simetría parabólica de retorno al suelo (y = 0):\nT = 2 · t_subida = 2 · (2.041 s) = 4.08 s',
      },
      {
        title: '3. Altura Máxima Alcanzada (Inciso b)',
        body: 'h_max = v₀² / (2·g) = (20.0)² / (2 · 9.80) = 400.0 / 19.60 = 20.41 m',
      },
      {
        title: '4. Momentos en que está a 15.0 m (Inciso c)',
        body: 'Ecuación de posición: y(t) = v₀·t - ½·g·t²\n15.0 = 20.0·t - 4.90·t²  ⟹  4.90·t² - 20.0·t + 15.0 = 0\nDiscriminante: Δ = (-20.0)² - 4·(4.90)·(15.0) = 400 - 294 = 106.0\n√Δ = 10.296 m/s\nt₁ (subiendo) = (20.0 - 10.296) / (2 · 4.90) = 9.704 / 9.80 = 0.99 s\nt₂ (bajando)  = (20.0 + 10.296) / 9.80 = 30.296 / 9.80 = 3.09 s',
      },
    ],
    finalAnswer: 'a) Tiempo en el aire: T = 4.08 s.\nb) Altura máxima: h_max = 20.41 m.\nc) Momentos a 15.0 m: t₁ = 0.99 s (en la subida) y t₂ = 3.09 s (en la bajada).',
  },

  {
    id: 'ht04_p2_projectile_return_5s',
    number: 2,
    title: 'Proyectil lanzado que regresa al suelo en 5.0 s',
    topic: 'Cálculo inverso a partir del tiempo de vuelo',
    source: 'Problema 2 • HT04 Tiro Vertical Kinal',
    statement:
      'Un proyectil se lanza verticalmente hacia arriba y regresa a la tierra después de 5.0 s. Calcule:\na) La velocidad con la que fue lanzado.\nb) La altura que alcanzó.',
    category: 'ground_to_ground',
    params: {
      T: 5.0,
      g: 9.80,
    },
    assemblyConfig: {
      v0: 24.5,
      g: 9.80,
      label: 'Proyectil (T = 5.0 s)',
      color: '#0ea5e9',
    },
    steps: [
      {
        title: '1. Relación entre Tiempo Total y Velocidad Inicial (Inciso a)',
        body: 'El tiempo de subida a la cúspide es la mitad del tiempo total de vuelo:\nt_subida = T / 2 = 5.0 s / 2 = 2.50 s\nEn la cúspide v = 0: 0 = v₀ - g·t_subida ⟹ v₀ = g·t_subida\nv₀ = (9.80 m/s²) · (2.50 s) = 24.50 m/s (88.2 km/h)',
      },
      {
        title: '2. Cálculo de la Altura Alcanzada (Inciso b)',
        body: 'h_max = v₀² / (2·g) = (24.50)² / (2 · 9.80) = 600.25 / 19.60 = 30.63 m\nAlternativamente con t_subida:\nh_max = v₀·t_subida - ½·g·(t_subida)² = (24.50)(2.50) - 0.5(9.80)(2.50)² = 61.25 - 30.625 = 30.63 m',
      },
    ],
    finalAnswer: 'a) Velocidad inicial de lanzamiento: v₀ = 24.50 m/s (hacia arriba).\nb) Altura máxima alcanzada: h = 30.63 m.',
  },

  {
    id: 'ht04_p3_hammer_roof_16m',
    number: 3,
    title: 'Martillo lanzado hacia un tejado de 16.0 m',
    topic: 'Velocidad mínima para alcanzar un objetivo elevado',
    source: 'Problema 3 • HT04 Tiro Vertical Kinal',
    statement:
      'Un obrero de la construcción lanza verticalmente hacia arriba un martillo a su compañero que se encuentra en un tejado a 16.0 m de altura. ¿Con qué velocidad mínima debe lanzar el martillo para que llegue a las manos del compañero?',
    category: 'target_height',
    params: {
      h: 16.0,
      g: 9.80,
    },
    assemblyConfig: {
      v0: 17.71,
      g: 9.80,
      label: 'Martillo (h = 16 m)',
      color: '#f59e0b',
    },
    steps: [
      {
        title: '1. Condición de Velocidad Mínima',
        body: 'Para que el lanzamiento sea mínimo, el martillo debe alcanzar exactamente el tejado justo al detenerse en su cúspide (vf = 0 m/s en h = 16.0 m).\nDatos:\n• vf = 0 m/s\n• h = 16.0 m\n• g = 9.80 m/s²',
      },
      {
        title: '2. Ecuación Independiente del Tiempo',
        body: 'vf² = v₀² - 2·g·h  ⟹  0 = v₀² - 2·g·h\nv₀ = √(2 · g · h)\nv₀ = √(2 · 9.80 m/s² · 16.0 m) = √(313.60) = 17.71 m/s (63.8 km/h)',
      },
      {
        title: '3. Verificación de Tiempo de Vuelo',
        body: 't = v₀ / g = 17.71 m/s / 9.80 m/s² = 1.81 s\nEl compañero recibe el martillo cómodamente a velocidad casi nula tras 1.81 s.',
      },
    ],
    finalAnswer: 'El martillo debe lanzarse con una velocidad mínima de v₀ = 17.71 m/s (hacia arriba).',
  },

  {
    id: 'ht04_p4_flea_jump_44cm',
    number: 4,
    title: 'Salto vertical de una pulga (h = 0.440 m)',
    topic: 'Biomecánica y cinemática animal',
    source: 'Problema 4 • HT04 Tiro Vertical Kinal',
    statement:
      'Una pulga salta verticalmente hacia arriba una altura de 0.440 m (44.0 cm). Calcule:\na) Su rapidez inicial al despegar del suelo.\nb) El tiempo que permanece en el aire.',
    category: 'ground_to_ground',
    params: {
      h: 0.440,
      g: 9.80,
    },
    assemblyConfig: {
      v0: 2.94,
      g: 9.80,
      label: 'Pulga (h = 0.44 m)',
      color: '#10b981',
    },
    steps: [
      {
        title: '1. Cálculo de la Rapidez Inicial de Despegue (Inciso a)',
        body: 'En la altura máxima h = 0.440 m la rapidez de la pulga es vf = 0:\nvf² = v₀² - 2·g·h  ⟹  v₀ = √(2 · g · h)\nv₀ = √(2 · 9.80 m/s² · 0.440 m) = √(8.624) = 2.94 m/s (10.6 km/h)',
      },
      {
        title: '2. Tiempo de Permanencia en el Aire (Inciso b)',
        body: 'Tiempo de subida:\nt_subida = v₀ / g = 2.9367 m/s / 9.80 m/s² = 0.2997 s\nTiempo total en el aire (ida y vuelta):\nT = 2 · t_subida = 2 · (0.2997 s) = 0.60 s (0.599 s)',
      },
    ],
    finalAnswer: 'a) Rapidez inicial de despegue: v₀ = 2.94 m/s.\nb) Tiempo en el aire: T = 0.60 s.',
  },

  {
    id: 'ht04_p5_stone_building_30m_launch',
    number: 5,
    title: 'Piedra lanzada hacia arriba desde edificio de 30.0 m (v₀ = 18.0 m/s)',
    topic: 'Tiro vertical con desnivel (altura inicial y₀ > 0)',
    source: 'Problema 5 • HT04 Tiro Vertical Kinal',
    statement:
      'Desde la azotea de un edificio de 30.0 m de altura se lanza una piedra verticalmente hacia arriba con una velocidad de 18.0 m/s. Calcule:\na) La velocidad con la que la piedra choca contra la calle.\nb) El tiempo total transcurrido desde el lanzamiento hasta el impacto contra la calle.',
    category: 'elevated_launch',
    params: {
      y0: 30.0,
      v0: 18.0,
      g: 9.80,
    },
    assemblyConfig: {
      v0: 18.0,
      g: 9.80,
      label: 'Piedra (Edificio 30 m)',
      color: '#ef4444',
      towerHeightM: 50.0,
    },
    steps: [
      {
        title: '1. Sistema de Coordenadas y Datos',
        body: '• Origen y = 0 en la calle.\n• Posición inicial: y₀ = +30.0 m (azotea)\n• Posición final de impacto: y_f = 0 m (calle)\n• Desplazamiento neto: Δy = y_f - y₀ = 0 - 30.0 = -30.0 m\n• Velocidad inicial: v₀ = +18.0 m/s\n• Aceleración: a = -g = -9.80 m/s²',
      },
      {
        title: '2. Velocidad de Choque contra la Calle (Inciso a)',
        body: 'vf² = v₀² - 2·g·Δy  (con Δy = -30.0 m):\nvf² = (18.0)² - 2 · (9.80) · (-30.0)\nvf² = 324.0 + 588.0 = 912.00 m²/s²\nvf = -√(912.00) = -30.20 m/s\nRapidez de impacto: 30.20 m/s (108.7 km/h) dirigida hacia abajo.',
      },
      {
        title: '3. Tiempo Total hasta el Impacto (Inciso b)',
        body: 'Método cinemático directo: vf = v₀ - g·t\n-30.20 = 18.0 - 9.80·t\n9.80·t = 18.0 + 30.20 = 48.20\nt = 48.20 / 9.80 = 4.92 s\n(Subida: 1.84 s, alcanzando h_max = 46.53 m desde el suelo; Bajada: 3.08 s).',
      },
    ],
    finalAnswer: 'a) Velocidad al chocar en la calle: vf = 30.20 m/s (hacia abajo, -30.20 m/s).\nb) Tiempo total de vuelo: t = 4.92 s.',
  },

  {
    id: 'ht04_p6_putty_ceiling_3_6m',
    number: 6,
    title: 'Pelota de masilla lanzada hacia el techo a 3.60 m (v₀ = 9.50 m/s)',
    topic: 'Impacto durante la fase ascendente',
    source: 'Problema 6 • HT04 Tiro Vertical Kinal',
    statement:
      'Una pelota de masilla se lanza verticalmente hacia arriba hacia el techo de una habitación que está a 3.60 m sobre el punto de lanzamiento. La rapidez inicial es de 9.50 m/s. Calcule:\na) La rapidez de la masilla justo antes de chocar contra el techo.\nb) El tiempo que tarda en llegar al techo.',
    category: 'target_height',
    params: {
      h: 3.60,
      v0: 9.50,
      g: 9.80,
    },
    assemblyConfig: {
      v0: 9.50,
      g: 9.80,
      label: 'Masilla (Techo 3.6 m)',
      color: '#ec4899',
    },
    steps: [
      {
        title: '1. Rapidez de la Masilla justo antes de Chocar (Inciso a)',
        body: 'vf² = v₀² - 2·g·h\nvf² = (9.50)² - 2 · (9.80) · (3.60)\nvf² = 90.25 - 70.56 = 19.69 m²/s²\nvf = √(19.69) = 4.44 m/s (16.0 km/h)',
      },
      {
        title: '2. Tiempo para Llegar al Techo (Inciso b)',
        body: 'vf = v₀ - g·t  ⟹  g·t = v₀ - vf\nt = (v₀ - vf) / g = (9.50 - 4.437) / 9.80 = 5.063 / 9.80 = 0.52 s (0.517 s)',
      },
    ],
    finalAnswer: 'a) Rapidez al chocar contra el techo: vf = 4.44 m/s (hacia arriba).\nb) Tiempo que tarda: t = 0.52 s.',
  },

  {
    id: 'ht04_p7_stone_caught_falling_5m',
    number: 7,
    title: 'Piedra atrapada a 5.00 m en su trayectoria de bajada (v₀ = 20.0 m/s)',
    topic: 'Posición idéntica en fase de descenso',
    source: 'Problema 7 • HT04 Tiro Vertical Kinal',
    statement:
      'Una piedra se lanza verticalmente hacia arriba con una velocidad de 20.0 m/s. Al regresar es atrapada a 5.00 m por encima del punto de lanzamiento. Calcule:\na) La velocidad con la que se atrapa la piedra.\nb) El tiempo transcurrido desde el lanzamiento hasta ser atrapada.',
    category: 'ground_to_ground',
    params: {
      v0: 20.0,
      yCatch: 5.00,
      g: 9.80,
    },
    assemblyConfig: {
      v0: 20.0,
      g: 9.80,
      label: 'Piedra (Atrapada a 5 m)',
      color: '#3b82f6',
    },
    steps: [
      {
        title: '1. Velocidad al Ser Atrapada de Bajada (Inciso a)',
        body: 'Ecuación de velocidades para y = +5.00 m:\nvf² = v₀² - 2·g·y\nvf² = (20.0)² - 2 · (9.80) · (5.00) = 400.0 - 98.0 = 302.00 m²/s²\n|vf| = √(302.00) = 17.38 m/s\nComo el enunciado especifica que es atrapada AL REGRESAR (de bajada), el vector apunta hacia abajo:\nvf = -17.38 m/s (rapidez = 17.38 m/s).',
      },
      {
        title: '2. Tiempo Transcurrido (Inciso b)',
        body: 'vf = v₀ - g·t  ⟹  -17.38 = 20.0 - 9.80·t\n9.80·t = 20.0 + 17.38 = 37.38\nt = 37.38 / 9.80 = 3.81 s\n(Nota: en la subida pasa a 5.0 m a t = (20 - 17.38)/9.80 = 0.27 s; en la bajada se atrapa a t = 3.81 s).',
      },
    ],
    finalAnswer: 'a) Velocidad al atraparla: vf = -17.38 m/s (rapidez: 17.38 m/s hacia abajo).\nb) Tiempo transcurrido: t = 3.81 s.',
  },

  {
    id: 'ht04_p8_moon_ball_4s',
    number: 8,
    title: 'Pelota lanzada en la Luna que regresa en 4.00 s (g = 1.60 m/s²)',
    topic: 'Cinemática lunar (gravedad reducida)',
    source: 'Problema 8 • HT04 Tiro Vertical Kinal',
    statement:
      'Un astronauta en la superficie de la Luna lanza una pelota verticalmente hacia arriba y ésta regresa a su mano después de 4.00 s. Si la aceleración de la gravedad en la Luna es de 1.60 m/s², ¿con qué rapidez fue lanzada la pelota?',
    category: 'lunar_kinematics',
    params: {
      T: 4.00,
      gMoon: 1.60,
    },
    assemblyConfig: {
      v0: 3.20,
      g: 1.60,
      label: 'Pelota Lunar (g = 1.6 m/s²)',
      color: '#94a3b8',
    },
    steps: [
      {
        title: '1. Datos Lunares y Simetría Temporal',
        body: '• Tiempo total de vuelo: T = 4.00 s\n• Gravedad lunar: g_Luna = 1.60 m/s²\n• Tiempo de subida a la cúspide lunar:\nt_subida = T / 2 = 4.00 s / 2 = 2.00 s',
      },
      {
        title: '2. Cálculo de la Rapidez de Lanzamiento',
        body: 'En la cúspide v = 0:\nv = v₀ - g_Luna · t_subida  ⟹  0 = v₀ - (1.60 m/s²) · (2.00 s)\nv₀ = (1.60 m/s²) · (2.00 s) = 3.20 m/s (11.5 km/h)',
      },
      {
        title: '3. Altura Máxima en la Luna',
        body: 'h_max = v₀² / (2·g_Luna) = (3.20)² / (2 · 1.60) = 10.24 / 3.20 = 3.20 m',
      },
    ],
    finalAnswer: 'La rapidez inicial con la que fue lanzada en la Luna es v₀ = 3.20 m/s.',
  },

  {
    id: 'ht04_p9_moon_baseball_35ms',
    number: 9,
    title: 'Pelota de béisbol lanzada en la Luna a 35.0 m/s (g = 1.60 m/s²)',
    topic: 'Vuelo parabólico prolongado en gravedad lunar',
    source: 'Problema 9 • HT04 Tiro Vertical Kinal',
    statement:
      'Una pelota de béisbol se lanza verticalmente hacia arriba en la Luna con una rapidez inicial de 35.0 m/s. La gravedad en la Luna es de 1.60 m/s². Calcule:\na) La altura máxima que alcanza.\nb) El tiempo que tarda en alcanzar la altura máxima.\nc) Su velocidad y posición después de 30.0 s de haber sido lanzada.\nd) Los momentos en que la pelota está a 100.0 m de altura.',
    category: 'lunar_kinematics',
    params: {
      v0: 35.0,
      gMoon: 1.60,
      tEval: 30.0,
      hTarget: 100.0,
    },
    assemblyConfig: {
      v0: 35.0,
      g: 1.60,
      label: 'Béisbol Lunar (v₀ = 35 m/s)',
      color: '#a855f7',
    },
    steps: [
      {
        title: '1. Altura Máxima en la Luna (Inciso a)',
        body: 'h_max = v₀² / (2·g_Luna) = (35.0)² / (2 · 1.60) = 1225.0 / 3.20 = 382.81 m\n(En la Tierra con g = 9.8 m/s² solo alcanzaría 62.5 m).',
      },
      {
        title: '2. Tiempo para Alcanzar la Altura Máxima (Inciso b)',
        body: 't_subida = v₀ / g_Luna = 35.0 m/s / 1.60 m/s² = 21.88 s',
      },
      {
        title: '3. Velocidad y Posición a los 30.0 s (Inciso c)',
        body: 'Velocidad:\nv(30) = v₀ - g_Luna·t = 35.0 - (1.60)·(30.0) = 35.0 - 48.0 = -13.00 m/s\n(Como es negativa, la pelota va bajando a 13.00 m/s).\nPosición:\ny(30) = v₀·t - ½·g_Luna·t² = (35.0)·(30.0) - 0.5·(1.60)·(30.0)²\ny(30) = 1050.0 - 0.8 · 900.0 = 1050.0 - 720.0 = 330.00 m sobre la superficie lunar.',
      },
      {
        title: '4. Momentos en que está a 100.0 m de Altura (Inciso d)',
        body: 'y(t) = 35.0·t - 0.80·t² = 100.0  ⟹  0.80·t² - 35.0·t + 100.0 = 0\nDiscriminante: Δ = (-35.0)² - 4·(0.80)·(100.0) = 1225 - 320 = 905.0\n√Δ = 30.083 m/s\nt₁ (subiendo) = (35.0 - 30.083) / (2 · 0.80) = 4.917 / 1.60 = 3.07 s\nt₂ (bajando)  = (35.0 + 30.083) / 1.60 = 65.083 / 1.60 = 40.68 s',
      },
    ],
    finalAnswer: 'a) Altura máxima: h_max = 382.81 m.\nb) Tiempo de subida: t_subida = 21.88 s.\nc) A los 30.0 s: velocidad = -13.00 m/s (bajando), posición = 330.00 m.\nd) Momentos a 100.0 m: t₁ = 3.07 s (subiendo) y t₂ = 40.68 s (bajando).',
  },

  {
    id: 'ht04_p10_earth_baseball_30ms',
    number: 10,
    title: 'Pelota de béisbol lanzada en la Tierra a 30.0 m/s (g = 9.80 m/s²)',
    topic: 'Análisis completo de vuelo y velocidades simétricas',
    source: 'Problema 10 • HT04 Tiro Vertical Kinal',
    statement:
      'Una pelota de béisbol se lanza verticalmente hacia arriba con una rapidez de 30.0 m/s. Calcule:\na) El tiempo que tarda en alcanzar el punto más alto.\nb) La altura máxima que alcanza.\nc) El tiempo total en regresar al punto de partida.\nd) Los momentos en que su rapidez es de 16.0 m/s.',
    category: 'ground_to_ground',
    params: {
      v0: 30.0,
      g: 9.80,
      vTarget: 16.0,
    },
    assemblyConfig: {
      v0: 30.0,
      g: 9.80,
      label: 'Béisbol Terrestre (v₀ = 30 m/s)',
      color: '#16a34a',
    },
    steps: [
      {
        title: '1. Tiempo para Alcanzar el Punto más Alto (Inciso a)',
        body: 'En la cúspide vf = 0:\nt_subida = v₀ / g = 30.0 m/s / 9.80 m/s² = 3.06 s',
      },
      {
        title: '2. Altura Máxima Alcanzada (Inciso b)',
        body: 'h_max = v₀² / (2·g) = (30.0)² / (2 · 9.80) = 900.0 / 19.60 = 45.92 m',
      },
      {
        title: '3. Tiempo Total para Regresar al Punto de Partida (Inciso c)',
        body: 'T = 2 · t_subida = 2 · (3.061 s) = 6.12 s',
      },
      {
        title: '4. Momentos en que su Rapidez es de 16.0 m/s (Inciso d)',
        body: 'La rapidez es de 16.0 m/s en dos instantes (subiendo v = +16.0 m/s y bajando v = -16.0 m/s):\n• Subiendo: vf = v₀ - g·t₁  ⟹  +16.0 = 30.0 - 9.80·t₁\nt₁ = (30.0 - 16.0) / 9.80 = 14.0 / 9.80 = 1.43 s\n• Bajando: vf = -16.0 m/s  ⟹  -16.0 = 30.0 - 9.80·t₂\nt₂ = (30.0 - (-16.0)) / 9.80 = 46.0 / 9.80 = 4.69 s\n(Nótese la simetría: 3.06 - 1.43 = 1.63 s antes de la cúspide; 3.06 + 1.63 = 4.69 s después de la cúspide).',
      },
    ],
    finalAnswer: 'a) Tiempo a punto más alto: t_subida = 3.06 s.\nb) Altura máxima: h_max = 45.92 m.\nc) Tiempo total de retorno: T = 6.12 s.\nd) Momentos con rapidez de 16.0 m/s: t₁ = 1.43 s (subiendo) y t₂ = 4.69 s (bajando).',
  },
];

/**
 * -------------------------------------------------------------------------
 * 3. CALCULADORA DINÁMICA ANALÍTICA DE TIRO VERTICAL
 * -------------------------------------------------------------------------
 */
export function solveCustomVerticalLaunch({
  v0 = 20.0,
  g = 9.80,
  hTarget = null,
}) {
  const gVal = Math.max(0.01, parseFloat(g) || 9.80);
  const v0Val = Math.max(0, parseFloat(v0) || 0);
  const hTargetVal = hTarget !== null && hTarget !== '' ? parseFloat(hTarget) : null;

  const hMax = (v0Val * v0Val) / (2 * gVal);
  const tSubida = v0Val / gVal;
  const tTotal = 2 * tSubida;

  const steps = [];

  steps.push({
    title: '1. Tiempo de Subida a la Cúspide (t_subida)',
    body: `t_subida = v₀ / g = ${v0Val.toFixed(2)} m/s / ${gVal.toFixed(2)} m/s² = ${tSubida.toFixed(2)} s`,
  });

  steps.push({
    title: '2. Altura Máxima Alcanzada (h_max)',
    body: `h_max = v₀² / (2·g) = (${v0Val.toFixed(2)})² / (2 · ${gVal.toFixed(2)}) = ${(v0Val * v0Val).toFixed(2)} / ${(2 * gVal).toFixed(2)} = ${hMax.toFixed(2)} m`,
  });

  steps.push({
    title: '3. Tiempo Total de Vuelo (T)',
    body: `T = 2 · t_subida = 2 · (${tSubida.toFixed(2)} s) = ${tTotal.toFixed(2)} s`,
  });

  let t1Target = null;
  let t2Target = null;
  if (hTargetVal !== null && hTargetVal > 0) {
    if (hTargetVal <= hMax) {
      const disc = v0Val * v0Val - 2 * gVal * hTargetVal;
      const sqrtDisc = Math.sqrt(Math.max(0, disc));
      t1Target = (v0Val - sqrtDisc) / gVal;
      t2Target = (v0Val + sqrtDisc) / gVal;
      steps.push({
        title: `4. Momentos a la Altura Objetivo (h = ${hTargetVal.toFixed(2)} m)`,
        body: `Δ = v₀² - 2·g·h = (${v0Val.toFixed(2)})² - 2·(${gVal.toFixed(2)})·(${hTargetVal.toFixed(2)}) = ${disc.toFixed(2)}\nt₁ (subiendo) = (${v0Val.toFixed(2)} - ${sqrtDisc.toFixed(2)}) / ${gVal.toFixed(2)} = ${t1Target.toFixed(2)} s\nt₂ (bajando)  = (${v0Val.toFixed(2)} + ${sqrtDisc.toFixed(2)}) / ${gVal.toFixed(2)} = ${t2Target.toFixed(2)} s`,
      });
    } else {
      steps.push({
        title: `4. Verificación de Altura Objetivo (h = ${hTargetVal.toFixed(2)} m)`,
        body: `La altura objetivo (${hTargetVal.toFixed(2)} m) es MAYOR que la altura máxima alcanzable (${hMax.toFixed(2)} m). El proyectil nunca alcanza esta cota.`,
      });
    }
  }

  return {
    v0: v0Val,
    g: gVal,
    hMax: +hMax.toFixed(2),
    tSubida: +tSubida.toFixed(2),
    tTotal: +tTotal.toFixed(2),
    hTarget: hTargetVal,
    t1Target: t1Target !== null ? +t1Target.toFixed(2) : null,
    t2Target: t2Target !== null ? +t2Target.toFixed(2) : null,
    steps,
  };
}

/**
 * -------------------------------------------------------------------------
 * 4. WHITEBOARD ASSEMBLY GENERATOR: MOUNT HT04 EXERCISE ON BOARD
 * Creates full pedagogical sticky note cards and interactive physical launch assembly
 * -------------------------------------------------------------------------
 */
export function buildVerticalLaunchExerciseBoardElements(exercise, cx, cy) {
  const elements = [];
  const startX = cx - 440;
  const startY = cy - 240;

  // 1. Header Banner
  elements.push({
    id: `hdr_vt_${Date.now()}`,
    type: 'text',
    x: startX,
    y: startY,
    text: `🚀 HT04 TIRO VERTICAL: ${exercise.title.toUpperCase()}`,
    color: '#050038',
    fontSize: 20,
  });

  // 2. Statement Sticky Note
  elements.push({
    id: `stmt_vt_${Date.now()}`,
    type: 'sticky',
    x: startX,
    y: startY + 36,
    width: 290,
    height: 190,
    text: `📝 ENUNCIADO (HT04):\n${exercise.statement}`,
    color: '#fff9b1',
  });

  // 3. Step-by-Step Solution Cards
  const cardW = 270;
  const cardH = 190;
  const colors = ['#f5f3ff', '#d5f0ff', '#d3f8df', '#fed7aa', '#edd9ff', '#ffd5dc'];

  exercise.steps.forEach((step, idx) => {
    const col = (idx + 1) % 3;
    const row = Math.floor((idx + 1) / 3);
    const cardX = startX + col * (cardW + 15);
    const cardY = startY + 36 + row * (cardH + 15);
    const cardColor = colors[idx % colors.length];

    elements.push({
      id: `step_vt_${idx}_${Date.now()}`,
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
    id: `ans_vt_${Date.now()}`,
    type: 'sticky',
    x: startX,
    y: answerY,
    width: 590,
    height: 95,
    text: `🎯 RESULTADOS Y CONCLUSIÓN (HT04):\n${exercise.finalAnswer}`,
    color: '#d3f8df',
  });

  // 5. Physical Scale Laboratory Assembly:
  // Right side of cards: Vertical Tower + Vertical Projectile + Photogates
  const towerX = startX + 640;
  const towerY = startY + 50;
  const cfg = exercise.assemblyConfig || {};
  const towerH = 480;
  const towerW = 44;

  // Tower Scale
  const tower = createPhysicsElement('freefall_tower', towerX, towerY, {
    label: `Escala Graduada (${exercise.params?.gMoon ? 'Luna 1.6 m/s²' : 'Tierra 9.8 m/s²'})`,
    width: towerW,
    height: towerH,
    heightMeters: 50.0,
  });

  // Vertical Projectile positioned at bottom launch pad
  const projW = 44;
  const projH = 44;
  const projY = towerY + towerH / 2 - 32;

  const projectile = createPhysicsElement('vertical_projectile', towerX + 46, projY, {
    label: cfg.label || 'Proyectil HT04',
    velocity: cfg.v0 || 20.0,
    initialVelocity: cfg.v0 || 20.0,
    gravity: cfg.g || (exercise.params?.gMoon ? 1.60 : 9.80),
    color: cfg.color || '#8b5cf6',
    width: projW,
    height: projH,
    showVector: true,
    showGravityVector: true,
  });

  // Photogate Sensor 1 (Intermediate height or target height)
  const gateA = createPhysicsElement('mru_photogate', towerX + 46, towerY + towerH / 2 - 160, {
    label: 'Sensor 1 (15m)',
    gateName: 'Sensor 1',
    targetDistanceM: 15.0,
  });

  // Photogate Sensor 2 (Apex region)
  const gateB = createPhysicsElement('mru_photogate', towerX + 46, towerY + towerH / 2 - 230, {
    label: 'Sensor Cúspide',
    gateName: 'Sensor Cúspide',
    targetDistanceM: 20.4,
  });

  elements.push(tower, projectile, gateA, gateB);

  return elements;
}
