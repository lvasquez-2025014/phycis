// =========================================================================
// LANZAMIENTO HORIZONTAL (HT01) EXERCISE SOLVER & WHITEBOARD GENERATOR
// Unidad 2: Movimiento en Dos Dimensiones • Física II • Quinto Bachillerato
// Colegio Kinal • Hoja de Trabajo 01: Lanzamiento Horizontal
// Includes all 10 problems from HT01 + 6 Conceptual Questions + Custom Calculator
// =========================================================================

import { createPhysicsElement } from '../physics/physicsRegistry';

/**
 * Standard Gravitational Acceleration
 */
export const STANDARD_GRAVITY = 9.80; // m/s² (Tierra)

/**
 * -------------------------------------------------------------------------
 * 1. PREGUNTAS CONCEPTUALES HT01 (FORMA 1)
 * -------------------------------------------------------------------------
 */
export const HT01_CONCEPTUAL_QUESTIONS = [
  {
    id: 'cq1_vertical_speed_behavior',
    number: 1,
    title: 'Comportamiento de la velocidad vertical',
    statement:
      'Un objeto se lanza horizontalmente desde cierta altura. ¿Cuál de las siguientes afirmaciones es correcta?',
    options: [
      { id: 'a', text: 'Su velocidad vertical es constante.' },
      { id: 'b', text: 'Su velocidad horizontal cambia debido a la gravedad.' },
      { id: 'c', text: 'Su velocidad vertical aumenta con el tiempo.' },
      { id: 'd', text: 'Su velocidad total permanece constante.' },
    ],
    correctOptionId: 'c',
    explanation:
      'En el eje vertical actúa de forma exclusiva la aceleración constante de la gravedad (g = 9.80 m/s² hacia abajo). Dado que el objeto se dispara estrictamente horizontal, su velocidad inicial en el eje Y es nula (v₀y = 0). A medida que desciende, su velocidad vertical obedece la ley de caída libre v_y(t) = g·t, aumentando de forma continua y lineal en cada segundo transcurrido.',
  },

  {
    id: 'cq2_motion_independence_principle',
    number: 2,
    title: 'Principio de Independencia de Movimientos de Galileo',
    statement:
      '¿Por qué el movimiento horizontal y vertical en un lanzamiento horizontal se analizan por separado?',
    options: [
      { id: 'a', text: 'Porque son independientes entre sí.' },
      { id: 'b', text: 'Porque ocurren en tiempos diferentes.' },
      { id: 'c', text: 'Porque uno depende de la masa y el otro no.' },
      { id: 'd', text: 'Porque la gravedad solo afecta al movimiento vertical en teoría.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Por el Principio de Independencia de los Movimientos formulado por Galileo Galilei: cuando un cuerpo está sometido a dos movimientos simultáneos y perpendiculares entre sí (eje X en MRU sin aceleración y eje Y en Caída Libre con aceleración g), cada movimiento se desarrolla de forma totalmente autónoma como si el otro no existiese, compartiendo únicamente la variable escalar del tiempo (t).',
  },

  {
    id: 'cq3_simultaneous_drop_and_horizontal',
    number: 3,
    title: 'Caída libre vs. Lanzamiento horizontal simultáneo',
    statement:
      'Si se lanza una pelota horizontalmente y otra se deja caer desde la misma altura al mismo tiempo, ¿qué sucede?',
    options: [
      { id: 'a', text: 'La lanzada cae primero.' },
      { id: 'b', text: 'Ambas llegan al mismo tiempo.' },
      { id: 'c', text: 'La que se deja caer llega primero.' },
      { id: 'd', text: 'Depende de la masa.' },
    ],
    correctOptionId: 'b',
    explanation:
      'Ambos cuerpos poseen la misma condición inicial en el eje vertical: velocidad inicial vertical cero (v₀y = 0) y la misma aceleración descendente (g = 9.80 m/s²). Dado que la altura h es idéntica, el tiempo de caída vertical viene dado por t = √(2h / g). La velocidad horizontal v₀x no altera en lo absoluto el tiempo que tarda la gravedad en atraer el objeto hasta el suelo; por consiguiente, ambas pelotas tocan el suelo exactamente en el mismo instante.',
  },

  {
    id: 'cq4_horizontal_speed_constancy',
    number: 4,
    title: 'Comportamiento de la componente horizontal',
    statement:
      '¿Qué ocurre con la componente horizontal de la velocidad durante el movimiento?',
    options: [
      { id: 'a', text: 'Aumenta por la gravedad.' },
      { id: 'b', text: 'Disminuye por el peso.' },
      { id: 'c', text: 'Se vuelve cero al caer.' },
      { id: 'd', text: 'Permanece constante (sin resistencia del aire).' },
    ],
    correctOptionId: 'd',
    explanation:
      'Al no actuar ninguna fuerza neta en la dirección horizontal (despreciando el rozamiento con el aire, F_x = 0), por la 1ª Ley de Newton (Inercia) la aceleración horizontal es nula (a_x = 0). En consecuencia, la componente horizontal de la velocidad se mantiene estrictamente constante durante todo el vuelo: v_x(t) = v₀x.',
  },

  {
    id: 'cq5_factor_determining_fall_time',
    number: 5,
    title: 'Factor que determina el tiempo de caída',
    statement:
      '¿Qué factor determina el tiempo que tarda en caer el objeto al suelo?',
    options: [
      { id: 'a', text: 'La altura desde la que se lanza.' },
      { id: 'b', text: 'La velocidad horizontal inicial.' },
      { id: 'c', text: 'La masa del objeto.' },
      { id: 'd', text: 'La forma del objeto.' },
    ],
    correctOptionId: 'a',
    explanation:
      'La ecuación cinemática para el desplazamiento vertical es h = ½·g·t², de donde se despeja t = √(2h / g). Para un valor dado de la aceleración gravitacional terrestre g, el tiempo de vuelo depende única y exclusivamente de la altura inicial de lanzamiento h. La velocidad horizontal inicial v₀x solo influye en el alcance horizontal (x = v₀x · t), no en el tiempo de caída.',
  },

  {
    id: 'cq6_vertical_speed_at_launch_apex',
    number: 6,
    title: 'Velocidad vertical en el instante de disparo',
    statement:
      'En el punto más alto del movimiento (justo al ser lanzado), ¿cómo es la velocidad vertical?',
    options: [
      { id: 'a', text: 'Máxima' },
      { id: 'b', text: 'Negativa' },
      { id: 'c', text: 'Cero' },
      { id: 'd', text: 'Igual a la horizontal' },
    ],
    correctOptionId: 'c',
    explanation:
      'Por la propia definición de un lanzamiento horizontal, toda la velocidad inicial se imprime en el eje X, siendo su vector inicial v⃗₀ = (v₀x, 0). En el instante exacto del disparo (t = 0), el cuerpo todavía no ha adquirido ninguna velocidad hacia abajo por efecto de la gravedad, de modo que su componente vertical es exactamente cero (v₀y = 0).',
  },
];

/**
 * -------------------------------------------------------------------------
 * 2. PROBLEMAS DE APLICACIÓN HT01 (FORMA 2 - 10 PROBLEMAS COLEGIO KINAL)
 * -------------------------------------------------------------------------
 */
export const HT01_HORIZONTAL_EXERCISES = [
  {
    id: 'ht01_p1_body_40ms_150m',
    number: 1,
    title: 'Cuerpo lanzado a 40 m/s desde 150 m de altura',
    topic: 'Cinemática básica 2D: tiempo, alcance y velocidad a 50m del suelo',
    source: 'Problema 1 • HT01 Lanzamiento Horizontal Kinal',
    statement:
      'Se lanza un cuerpo horizontalmente con una velocidad de 40 m/s desde una altura de 150 m. Calcular:\na) El tiempo de vuelo.\nb) El alcance.\nc) La velocidad que tendrá a 50 m del suelo.',
    params: { v0x: 40.0, h: 150.0, g: 9.80, targetH: 50.0 },
    steps: [
      {
        title: 'a) Cálculo del Tiempo de Vuelo (t)',
        body: 'El tiempo depende exclusivamente del eje vertical (caída libre):\nh = ½·g·t²  ⟹  t = √(2·h / g)\nt = √(2 · 150 m / 9.80 m/s²) = √(300 / 9.80) = √30.6122\nt = 5.53 s',
      },
      {
        title: 'b) Cálculo del Alcance Horizontal (x)',
        body: 'En el eje horizontal el movimiento es uniforme (MRU):\nx = v₀x · t\nx = (40.0 m/s) · (5.5328 s) = 221.31 m',
      },
      {
        title: 'c) Cálculo de la Velocidad a 50 m del Suelo',
        body: 'A 50 m del suelo, la distancia vertical descendida es:\nΔy = 150 m - 50 m = 100 m\nVelocidad vertical por caída libre:\n(v_y)² = 2·g·Δy = 2 · (9.80 m/s²) · (100 m) = 1960  ⟹  v_y = √1960 ≈ 44.27 m/s\nComponente horizontal (constante):\nv_x = 40.0 m/s\nMagnitud del vector velocidad resultante:\nv = √(v_x² + v_y²) = √(40² + 44.27²) = √(1600 + 1960) = √3560 ≈ 59.67 m/s\nDirección: θ = arctan(v_y / v_x) = arctan(44.27 / 40.0) ≈ 47.90° (por debajo de la horizontal)',
      },
    ],
    finalAnswer: 'a) Tiempo de vuelo: 5.53 s\nb) Alcance horizontal: 221.31 m\nc) Velocidad a 50 m del suelo: 59.67 m/s (con ángulo θ = 47.90°)',
    assemblyConfig: {
      cliffHeightMeters: 150.0,
      v0x: 40.0,
      targetRangeMeters: 221.31,
    },
  },

  {
    id: 'ht01_p2_water_fountain_spout',
    number: 2,
    title: 'Surtidor de agua de fuente (h = 3 m, alcance = 2 m)',
    topic: 'Cálculo de velocidad de salida y nueva altura para duplicar alcance',
    source: 'Problema 2 • HT01 Lanzamiento Horizontal Kinal',
    statement:
      'Un surtidor de agua de una fuente se halla situado a 3 m del suelo. Si el agua sale horizontalmente, hallar qué velocidad debe tener para que alcance una distancia de 2 m. Con la velocidad calculada antes, determinar ahora a qué altura ha de ponerse el surtidor para que el alcance sea de 4 m.',
    params: { h1: 3.0, x1: 2.0, x2: 4.0, g: 9.80 },
    steps: [
      {
        title: 'Parte 1: Tiempo de caída y velocidad inicial',
        body: 'Para h₁ = 3 m:\nt₁ = √(2·h₁ / g) = √(2 · 3 m / 9.80 m/s²) = √(6 / 9.80) ≈ 0.782 s\nVelocidad horizontal requerida para alcance x₁ = 2 m:\nv₀ = x₁ / t₁ = 2.0 m / 0.78246 s = 2.56 m/s',
      },
      {
        title: 'Parte 2: Nueva altura para alcance de 4 m con v₀ = 2.56 m/s',
        body: 'Tiempo necesario para cubrir x₂ = 4 m con la misma v₀:\nt₂ = x₂ / v₀ = 4.0 m / 2.556 m/s ≈ 1.565 s\nAltura necesaria para ese tiempo de caída:\nh₂ = ½·g·(t₂)² = ½ · (9.80 m/s²) · (1.5649 s)² = 4.9 · 2.449 ≈ 12.00 m\n(Nota proporcional: duplicar el alcance duplica el tiempo, lo que cuadruplica la altura: h₂ = 4 · h₁ = 12 m)',
      },
    ],
    finalAnswer: 'Velocidad de salida requerida: 2.56 m/s\nNueva altura del surtidor para 4 m de alcance: 12.00 m',
    assemblyConfig: {
      cliffHeightMeters: 3.0,
      v0x: 2.56,
      targetRangeMeters: 2.0,
    },
  },

  {
    id: 'ht01_p3_two_shots_same_range',
    number: 3,
    title: 'Dos tiros horizontales a 10 m y 5 m con mismo alcance',
    topic: 'Igualación de alcances para diferentes alturas',
    source: 'Problema 3 • HT01 Lanzamiento Horizontal Kinal',
    statement:
      'En los tiros horizontales mostrados en la figura, v₁ = 4 m/s y las alturas de lanzamiento son las que se indican, 10 y 5 m. Hallar cuál debe ser la velocidad v₂ para que el alcance de ambos tiros sea el mismo.',
    params: { v1: 4.0, h1: 10.0, h2: 5.0, g: 9.80 },
    steps: [
      {
        title: 'Paso 1: Alcance del primer tiro (desde 10 m)',
        body: 'Tiempo de caída 1:\nt₁ = √(2·h₁ / g) = √(2 · 10 m / 9.80 m/s²) = √(20 / 9.80) ≈ 1.429 s\nAlcance 1:\nx₁ = v₁ · t₁ = (4.0 m/s) · (1.4286 s) ≈ 5.71 m',
      },
      {
        title: 'Paso 2: Tiempo de caída del segundo tiro (desde 5 m)',
        body: 'Tiempo de caída 2:\nt₂ = √(2·h₂ / g) = √(2 · 5 m / 9.80 m/s²) = √(10 / 9.80) ≈ 1.010 s',
      },
      {
        title: 'Paso 3: Determinación de la velocidad v₂',
        body: 'Condición de igualdad: x₂ = x₁ = 5.714 m\nv₂ · t₂ = x₁  ⟹  v₂ = x₁ / t₂\nv₂ = 5.714 m / 1.0102 s = 4 · √2 ≈ 5.66 m/s',
      },
    ],
    finalAnswer: 'Velocidad necesaria v₂: 5.66 m/s (v₂ = v₁·√(h₁/h₂) = 4·√2 m/s)',
    assemblyConfig: {
      cliffHeightMeters: 10.0,
      v0x: 4.0,
      targetRangeMeters: 5.71,
    },
  },

  {
    id: 'ht01_p4_bullet_120ms_4s',
    number: 4,
    title: 'Bala disparada a 120 m/s que tarda 4 s en tocar el suelo',
    topic: 'Cálculo de altura, alcance y desplazamiento real en línea recta',
    source: 'Problema 4 • HT01 Lanzamiento Horizontal Kinal',
    statement:
      'Se dispara horizontalmente una bala con una rapidez de 120 m/s, que tarda 4 s en tocar el suelo. Calcular:\na) La altura desde la cual fue lanzada.\nb) El alcance.\nc) La distancia real desde el punto de lanzamiento hasta el punto donde choca contra el suelo.',
    params: { v0x: 120.0, t: 4.0, g: 9.80 },
    steps: [
      {
        title: 'a) Altura de lanzamiento (h)',
        body: 'h = ½·g·t²\nh = ½ · (9.80 m/s²) · (4.0 s)² = 4.90 · 16 = 78.40 m',
      },
      {
        title: 'b) Alcance horizontal (x)',
        body: 'x = v₀x · t\nx = (120.0 m/s) · (4.0 s) = 480.00 m',
      },
      {
        title: 'c) Distancia real en línea recta (d)',
        body: 'El desplazamiento neto une el punto de disparo con el punto de impacto:\nd = √(x² + h²)\nd = √(480² + 78.40²) = √(230400 + 6146.56) = √236546.56 ≈ 486.36 m',
      },
    ],
    finalAnswer: 'a) Altura de lanzamiento: 78.40 m\nb) Alcance horizontal: 480.00 m\nc) Distancia real de impacto: 486.36 m',
    assemblyConfig: {
      cliffHeightMeters: 78.4,
      v0x: 120.0,
      targetRangeMeters: 480.0,
    },
  },

  {
    id: 'ht01_p5_supersonic_jet_motor_drop',
    number: 5,
    title: 'Transporte supersónico (h = 15 km, v = 2500 km/h) desprende motor',
    topic: 'Lanzamiento horizontal de gran escala con conversión de unidades',
    source: 'Problema 5 • HT01 Lanzamiento Horizontal Kinal',
    statement:
      'Un transporte supersónico está volando horizontalmente a una altura de 15 km, con una velocidad de 2500 km/h cuando se desprende un motor.\na) ¿Cuánto tardará el motor en chocar contra el suelo?\nb) ¿A qué distancia horizontal está el motor de donde se produjo el desprendimiento hasta donde choca contra el suelo?',
    params: { hKm: 15.0, vKmh: 2500.0, g: 9.80 },
    steps: [
      {
        title: 'Conversión de Unidades al Sistema Internacional',
        body: 'Altura: h = 15 km = 15,000 m\nVelocidad inicial horizontal: v₀x = 2500 km/h / 3.6 ≈ 694.44 m/s',
      },
      {
        title: 'a) Tiempo de caída del motor (t)',
        body: 't = √(2·h / g) = √(2 · 15000 m / 9.80 m/s²) = √(30000 / 9.80) = √3061.22\nt = 55.33 s',
      },
      {
        title: 'b) Distancia horizontal recorrida (alcance x)',
        body: 'x = v₀x · t\nx = (694.444 m/s) · (55.328 s) ≈ 38,422.44 m ≈ 38.42 km',
      },
    ],
    finalAnswer: 'a) Tiempo en chocar: 55.33 s\nb) Distancia horizontal: 38,422.44 m (38.42 km)',
    assemblyConfig: {
      cliffHeightMeters: 150.0,
      v0x: 69.4,
      targetRangeMeters: 384.2,
    },
  },

  {
    id: 'ht01_p6_golf_ball_50m_1_2s',
    number: 6,
    title: 'Pelota de golf en montículo (alcance = 50 m, t = 1.2 s)',
    topic: 'Cálculo de altura, rapidez de lanzamiento y ángulo de impacto',
    source: 'Problema 6 • HT01 Lanzamiento Horizontal Kinal',
    statement:
      'Desde un montículo se lanza horizontalmente una pelota de golf, logrando un alcance de 50 m en un tiempo de 1.2 s. Calcular:\na) La altura del montículo.\nb) La rapidez con que fue lanzada.\nc) El ángulo que forma la velocidad con la horizontal en el momento en que toca el suelo.',
    params: { x: 50.0, t: 1.2, g: 9.80 },
    steps: [
      {
        title: 'a) Altura del montículo (h)',
        body: 'h = ½·g·t² = ½ · (9.80 m/s²) · (1.2 s)² = 4.90 · 1.44 = 7.056 ≈ 7.06 m',
      },
      {
        title: 'b) Rapidez de lanzamiento (v₀x)',
        body: 'v₀x = x / t = 50.0 m / 1.2 s ≈ 41.67 m/s',
      },
      {
        title: 'c) Ángulo del vector velocidad con la horizontal al impacto (θ)',
        body: 'Componente horizontal: v_x = 41.67 m/s\nComponente vertical al impacto: v_y = g·t = (9.80 m/s²) · (1.2 s) = 11.76 m/s\nTangente del ángulo: tan(θ) = v_y / v_x = 11.76 / 41.67 ≈ 0.2822\nθ = arctan(0.2822) ≈ 15.76° (por debajo de la horizontal)',
      },
    ],
    finalAnswer: 'a) Altura del montículo: 7.06 m\nb) Rapidez de lanzamiento: 41.67 m/s\nc) Ángulo de impacto: 15.76° bajo la horizontal',
    assemblyConfig: {
      cliffHeightMeters: 7.06,
      v0x: 41.67,
      targetRangeMeters: 50.0,
    },
  },

  {
    id: 'ht01_p7_baseball_9ms_1_5s',
    number: 7,
    title: 'Lanzador de béisbol en barranco (v₀ = 9 m/s, t = 1.5 s)',
    topic: 'Posición bidimensional instantánea (x, y)',
    source: 'Problema 7 • HT01 Lanzamiento Horizontal Kinal',
    statement:
      'Un lanzador de béisbol arroja una pelota horizontal desde lo alto de un barranco, dicha pelota posee una velocidad de 9 m/s. Calcular:\na) La distancia horizontal y vertical a los 1.5 s.',
    params: { v0x: 9.0, t: 1.5, g: 9.80 },
    steps: [
      {
        title: 'Distancia horizontal recorrida en 1.5 s (x)',
        body: 'x(t) = v₀x · t\nx(1.5 s) = (9.0 m/s) · (1.5 s) = 13.50 m',
      },
      {
        title: 'Distancia vertical descendida en 1.5 s (y)',
        body: 'y(t) = ½·g·t²\ny(1.5 s) = ½ · (9.80 m/s²) · (1.5 s)² = 4.90 · 2.25 = 11.025 ≈ 11.03 m',
      },
    ],
    finalAnswer: 'A los 1.5 s:\nDistancia horizontal (x): 13.50 m\nDistancia vertical descendida (y): 11.03 m',
    assemblyConfig: {
      cliffHeightMeters: 15.0,
      v0x: 9.0,
      targetRangeMeters: 13.5,
    },
  },

  {
    id: 'ht01_p8_spring_building_15m_7ms',
    number: 8,
    title: 'Resorte en edificio de 15 m dispara pelota a 7 m/s',
    topic: 'Tiempo de caída, distancia de la base y componentes de velocidad final',
    source: 'Problema 8 • HT01 Lanzamiento Horizontal Kinal',
    statement:
      'Con un resorte comprimiéndose se dispara horizontalmente una pelota, desde la parte superior de un edificio de 15 metros de altura, la velocidad inicial con la que sale la pelota es de 7 m/s. Calcular:\na) El tiempo de caída.\nb) La distancia que cae de la base del edificio.\nc) Componente horizontal y vertical de la velocidad al tocar el suelo.',
    params: { h: 15.0, v0x: 7.0, g: 9.80 },
    steps: [
      {
        title: 'a) Tiempo de caída (t)',
        body: 't = √(2·h / g) = √(2 · 15 m / 9.80 m/s²) = √(30 / 9.80) = √3.0612 ≈ 1.75 s',
      },
      {
        title: 'b) Distancia que cae de la base del edificio (x)',
        body: 'x = v₀x · t = (7.0 m/s) · (1.7496 s) ≈ 12.25 m',
      },
      {
        title: 'c) Componentes de la velocidad al tocar el suelo',
        body: 'Componente horizontal: v_x = 7.00 m/s (constante)\nComponente vertical: v_y = g·t = (9.80 m/s²) · (1.7496 s) ≈ 17.15 m/s (hacia abajo)\nVelocidad total resultante: v = √(7² + 17.15²) = √(49 + 293.98) ≈ 18.52 m/s',
      },
    ],
    finalAnswer: 'a) Tiempo de caída: 1.75 s\nb) Distancia a la base: 12.25 m\nc) Componentes al impacto: v_x = 7.00 m/s, v_y = 17.15 m/s (v_total = 18.52 m/s)',
    assemblyConfig: {
      cliffHeightMeters: 15.0,
      v0x: 7.0,
      targetRangeMeters: 12.25,
    },
  },

  {
    id: 'ht01_p9_plane_bomb_submarine_chase',
    number: 9,
    title: 'Avión (1200 m, 80 m/s) lanza proyectil contra submarino a 3500 m',
    topic: 'Lanzamiento horizontal combinado con persecución en MRU acuático',
    source: 'Problema 9 • HT01 Lanzamiento Horizontal Kinal',
    statement:
      'Desde una altura de 1200 m un avión con velocidad de 80 m/s deja caer un proyectil el cual al caer al agua mantiene su rapidez gracias a un motor de propulsión. ¿Calcule el tiempo que tarda el proyectil en impactar un submarino que está a 3500 metros del avión y que se desplaza con MRU a 25 m/s?',
    params: { h: 1200.0, vPlane: 80.0, dInit: 3500.0, vSub: 25.0, g: 9.80 },
    steps: [
      {
        title: 'Fase 1: Vuelo en el Aire hasta el Agua',
        body: 'Tiempo de caída en el aire:\nt_aire = √(2·h / g) = √(2 · 1200 m / 9.80 m/s²) = √(2400 / 9.80) ≈ 15.65 s\nAvance horizontal del proyectil en el aire:\nx_aire = v_avión · t_aire = (80.0 m/s) · (15.649 s) ≈ 1251.94 m',
      },
      {
        title: 'Fase 2: Posición del Submarino al entrar el Proyectil al Agua',
        body: 'Asumiendo que el submarino se aleja en el mismo sentido:\nx_sub(t_aire) = 3500 m + (25.0 m/s) · (15.649 s) = 3500 + 391.23 = 3891.23 m\nDistancia de separación en el agua:\nΔx_agua = x_sub(t_aire) - x_aire = 3891.23 m - 1251.94 m = 2639.29 m',
      },
      {
        title: 'Fase 3: Persecución en el Agua y Tiempo Total',
        body: 'Rapidez de acercamiento relativa en el agua:\nv_rel = v_proyectil - v_sub = 80.0 m/s - 25.0 m/s = 55.0 m/s\nTiempo de persecución en el agua:\nt_agua = Δx_agua / v_rel = 2639.29 m / 55.0 m/s ≈ 47.99 s\nTiempo total transcurrido:\nt_total = t_aire + t_agua = 15.65 s + 47.99 s = 63.64 s\n(Nota pedagógica: si el submarino navega en sentido opuesto hacia el avión: v_rel = 105 m/s ⟹ t_agua ≈ 17.68 s ⟹ t_total = 33.33 s)',
      },
    ],
    finalAnswer: 'Tiempo total hasta el impacto: 63.64 s (15.65 s en el aire + 47.99 s en el agua)',
    assemblyConfig: {
      cliffHeightMeters: 40.0,
      v0x: 30.0,
      targetRangeMeters: 60.0,
    },
  },

  {
    id: 'ht01_p10_cliff_20m_river_2000m',
    number: 10,
    title: 'Disparo desde acantilado de 20 m que impacta río a 2000 m',
    topic: 'Cálculo de velocidad inicial horizontal de alta rapidez',
    source: 'Problema 10 • HT01 Lanzamiento Horizontal Kinal',
    statement:
      'Un proyectil es disparado desde un acantilado de 20 m de altura en dirección paralela al río, éste hace impacto en el agua a 2000 m del lugar del disparo. Determinar:\na) ¿Qué velocidad inicial tenía el proyectil?\nb) ¿Cuánto tardó en tocar el agua?',
    params: { h: 20.0, x: 2000.0, g: 9.80 },
    steps: [
      {
        title: 'b) Tiempo que tardó en tocar el agua (t)',
        body: 'El tiempo de caída depende únicamente de la altura del acantilado:\nt = √(2·h / g) = √(2 · 20 m / 9.80 m/s²) = √(40 / 9.80) = √4.0816 ≈ 2.02 s',
      },
      {
        title: 'a) Velocidad inicial del proyectil (v₀x)',
        body: 'El alcance horizontal es x = v₀x · t:\nv₀x = x / t = 2000.0 m / 2.0203 s ≈ 989.95 m/s (≈ 990 m/s)',
      },
    ],
    finalAnswer: 'a) Velocidad inicial: 989.95 m/s (≈ 990 m/s)\nb) Tiempo en tocar el agua: 2.02 s',
    assemblyConfig: {
      cliffHeightMeters: 20.0,
      v0x: 989.95,
      targetRangeMeters: 2000.0,
    },
  },
];

/**
 * -------------------------------------------------------------------------
 * 3. DYNAMIC CUSTOM HORIZONTAL LAUNCH CALCULATOR
 * Solves any combination of v0x, h, and g
 * -------------------------------------------------------------------------
 */
export function solveCustomHorizontalLaunch({
  v0x = 20.0,
  h = 20.0,
  g = 9.80,
}) {
  const gVal = Math.max(0.01, parseFloat(g) || 9.80);
  const v0xVal = Math.max(0, parseFloat(v0x) || 0);
  const hVal = Math.max(0.1, parseFloat(h) || 0.1);

  const tFlight = Math.sqrt((2 * hVal) / gVal);
  const rangeMax = v0xVal * tFlight;
  const vyFinal = gVal * tFlight;
  const vImpact = Math.sqrt(v0xVal * v0xVal + vyFinal * vyFinal);
  const angleDeg = (Math.atan2(vyFinal, v0xVal) * 180) / Math.PI;

  const steps = [];

  steps.push({
    title: '1. Tiempo de Caída (Vuelo en el Aire)',
    body: `t = √(2·h / g) = √(2 · ${hVal.toFixed(2)} m / ${gVal.toFixed(2)} m/s²) = √${((2 * hVal) / gVal).toFixed(4)} = ${tFlight.toFixed(2)} s`,
  });

  steps.push({
    title: '2. Alcance Horizontal Máximo (X_máx)',
    body: `X = v₀x · t = (${v0xVal.toFixed(2)} m/s) · (${tFlight.toFixed(2)} s) = ${rangeMax.toFixed(2)} m`,
  });

  steps.push({
    title: '3. Velocidad y Dirección al Impactar el Suelo',
    body: `v_x = ${v0xVal.toFixed(2)} m/s (constante)\nv_y = g·t = (${gVal.toFixed(2)} m/s²) · (${tFlight.toFixed(2)} s) = ${vyFinal.toFixed(2)} m/s\nv = √(v_x² + v_y²) = √(${v0xVal.toFixed(2)}² + ${vyFinal.toFixed(2)}²) = ${vImpact.toFixed(2)} m/s\nθ = arctan(v_y / v_x) = arctan(${vyFinal.toFixed(2)} / ${v0xVal.toFixed(2)}) = ${angleDeg.toFixed(1)}°`,
  });

  return {
    v0x: v0xVal,
    h: hVal,
    g: gVal,
    tFlight: +tFlight.toFixed(2),
    rangeMax: +rangeMax.toFixed(2),
    vyFinal: +vyFinal.toFixed(2),
    vImpact: +vImpact.toFixed(2),
    angleDeg: +angleDeg.toFixed(1),
    steps,
  };
}

/**
 * -------------------------------------------------------------------------
 * 4. WHITEBOARD ASSEMBLY GENERATOR: MOUNT HT01 EXERCISE ON BOARD
 * Creates full pedagogical sticky note cards and physical launch assembly
 * -------------------------------------------------------------------------
 */
export function buildHorizontalLaunchExerciseBoardElements(exercise, cx, cy) {
  const elements = [];
  const startX = cx - 440;
  const startY = cy - 240;

  // 1. Header Banner
  elements.push({
    id: `hdr_hz_${Date.now()}`,
    type: 'text',
    x: startX,
    y: startY,
    text: `🎯 HT01 LANZAMIENTO HORIZONTAL: ${exercise.title.toUpperCase()}`,
    color: '#050038',
    fontSize: 20,
  });

  // 2. Statement Sticky Note
  elements.push({
    id: `stmt_hz_${Date.now()}`,
    type: 'sticky',
    x: startX,
    y: startY + 36,
    width: 290,
    height: 190,
    text: `📝 ENUNCIADO (HT01):\n${exercise.statement}`,
    color: '#fff9b1',
  });

  // 3. Step-by-Step Solution Cards
  const cardW = 270;
  const cardH = 190;
  const colors = ['#e0f2fe', '#dbeafe', '#d3f8df', '#fed7aa', '#edd9ff', '#ffd5dc'];

  exercise.steps.forEach((step, idx) => {
    const col = (idx + 1) % 3;
    const row = Math.floor((idx + 1) / 3);
    const cardX = startX + col * (cardW + 15);
    const cardY = startY + 36 + row * (cardH + 15);
    const cardColor = colors[idx % colors.length];

    elements.push({
      id: `step_hz_${idx}_${Date.now()}`,
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
    id: `ans_hz_${Date.now()}`,
    type: 'sticky',
    x: startX,
    y: answerY,
    width: 590,
    height: 95,
    text: `🎯 RESULTADOS Y CONCLUSIÓN (HT01):\n${exercise.finalAnswer}`,
    color: '#d3f8df',
  });

  // 5. Physical Scale Laboratory Assembly:
  // Right side of cards: Cliff Platform + Horizontal Projectile + Target Sensor
  const cliffX = startX + 640;
  const cliffY = startY + 60;
  const cfg = exercise.assemblyConfig || {};
  const cliffW = 160;
  const cliffH = 260;
  const cliffHeightM = cfg.cliffHeightMeters || 20.0;

  const cliff = createPhysicsElement('cliff_platform', cliffX, cliffY, {
    label: `Acantilado (h = ${cliffHeightM} m)`,
    width: cliffW,
    height: cliffH,
    heightMeters: cliffHeightM,
    color: '#475569',
  });

  // Calculate actual bounds of cliff:
  const cliffLeft = cliffX - cliffW / 2;
  const cliffTop = cliffY - cliffH / 2;
  const cliffRight = cliffLeft + cliffW;
  const groundLevel = cliffTop + cliffH;

  const projW = 44;
  const projH = 44;
  // Projectile sits directly on the top launch ledge (bottom touches cliffTop)
  const projCenterX = cliffRight - projW / 2;
  const projCenterY = cliffTop - projH / 2;

  const projectile = createPhysicsElement('horizontal_projectile', projCenterX, projCenterY, {
    label: `Proyectil (v₀x = ${cfg.v0x || 20} m/s)`,
    velocity: cfg.v0x || 20.0,
    initialVelocity: cfg.v0x || 20.0,
    heightMeters: cliffHeightM,
    gravity: 9.80,
    color: '#06b6d4',
    width: projW,
    height: projH,
    showVector: true,
    showResultantVector: true,
    showTrajectory: true,
  });

  // Scale: cliffH pixels corresponds to cliffHeightM meters
  const pxPerMeter = cliffH / Math.max(0.1, cliffHeightM);
  const targetRangeM = cfg.targetRangeMeters || 40.0;
  const landingOffsetPx = targetRangeM * pxPerMeter;
  const gateH = 44;
  // Photogate sits on the ground line (bottom touches groundLevel)
  const gateCenterX = cliffRight + landingOffsetPx;
  const gateCenterY = groundLevel - gateH / 2;

  const targetGate = createPhysicsElement('mru_photogate', gateCenterX, gateCenterY, {
    label: `Diana Impacto (${targetRangeM.toFixed(1)}m)`,
    gateName: 'Impacto',
    targetDistanceM: targetRangeM,
  });

  elements.push(cliff, projectile, targetGate);

  return elements;
}
