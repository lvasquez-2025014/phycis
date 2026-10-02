// =========================================================================
// MOVIMIENTO DE PROYECTILES (LANZAMIENTO OBLICUO 2D) - SOLUCIONADOR Y DATASET
// Basado en el documento oficial: "Unidad 2 - Física II - Quinto - HT02: Lanzamiento de Proyectil"
// Colegio Kinal - Diversificado
// =========================================================================

import {
  createPhysicsElement,
  getCannonMuzzlePosition,
  getProjectileScale,
} from '../physics/physicsRegistry';

/**
 * 7 Preguntas Conceptuales oficiales de la Hoja de Trabajo HT02 (Forma 1)
 */
export const PROJECTILE_MOTION_THEORY_QUESTIONS = [
  {
    id: 'ht02_q1',
    number: 1,
    question: 'En el Movimiento parabólico ideal (sin resistencia del aire), ¿qué magnitud permanece constante durante todo el recorrido?',
    options: [
      'La velocidad vertical.',
      'La aceleración horizontal.',
      'La velocidad horizontal.',
      'La altura máxima.',
    ],
    correctIndex: 2,
    explanation:
      'En el movimiento parabólico ideal no existe ninguna fuerza neta en el eje horizontal (ax = 0), por lo que la velocidad horizontal vx = v₀·cos(θ) permanece rigurosamente constante en todo el trayecto (MRU en X).',
  },
  {
    id: 'ht02_q2',
    number: 2,
    question: 'Un futbolista patea un balón formando una trayectoria parabólica. En el punto más alto de la trayectoria, se cumple que:',
    options: [
      'La velocidad vertical es cero.',
      'La velocidad horizontal es cero.',
      'La velocidad total es cero.',
      'La aceleración es cero.',
    ],
    correctIndex: 0,
    explanation:
      'En la cúspide (ápice de la parábola), el proyectil deja de subir e inicia el descenso, por lo que su velocidad vertical se anula instantáneamente: vy = 0. Sin embargo, su velocidad horizontal vx sigue activa y la aceleración sigue siendo la gravedad g.',
  },
  {
    id: 'ht02_q3',
    number: 3,
    question: 'Dos proyectiles son lanzados con la misma rapidez inicial, pero con diferentes ángulos. Si uno se lanza más verticalmente, entonces tendrá:',
    options: [
      'Menor tiempo en el aire.',
      'Mayor tiempo en el aire.',
      'Menor aceleración.',
      'La misma altura máxima que el otro.',
    ],
    correctIndex: 1,
    explanation:
      'El tiempo en el aire depende de la componente vertical inicial: t_vuelo = 2·v₀y / g = 2·v₀·sin(θ) / g. A mayor ángulo de elevación θ, mayor es sin(θ) y v₀y, por lo que el proyectil permanece más tiempo en el aire y alcanza mayor altura.',
  },
  {
    id: 'ht02_q4',
    number: 4,
    question: 'Un bombero dirige un chorro de agua hacia una ventana lejana. Si desea aumentar el alcance horizontal sin cambiar la rapidez inicial, debe:',
    options: [
      'Disminuir el ángulo de lanzamiento demasiado.',
      'Lanzar completamente vertical.',
      'Esperar a que la gravedad disminuya.',
      'Elegir un ángulo adecuado entre horizontal y vertical.',
    ],
    correctIndex: 3,
    explanation:
      'El alcance horizontal sigue la función R = (v₀²·sin(2θ)) / g. El alcance es máximo a 45° al mismo nivel; por ello, para maximizar el alcance sin cambiar la rapidez, debe calibrarse un ángulo intermedio óptimo entre horizontal y vertical.',
  },
  {
    id: 'ht02_q5',
    number: 5,
    question: 'Un jugador lanza una pelota y esta tarda más tiempo en caer al suelo. Esto indica principalmente que:',
    options: [
      'Su componente vertical inicial fue mayor.',
      'Su componente horizontal fue cero.',
      'La gravedad desapareció.',
      'La pelota tenía menos masa.',
    ],
    correctIndex: 0,
    explanation:
      'La duración del vuelo está determinada por el eje vertical según t = 2·v₀y / g. Un mayor tiempo de caída es prueba directa de que la componente vertical inicial de velocidad v₀y = v₀·sin(θ) fue mayor.',
  },
  {
    id: 'ht02_q6',
    number: 6,
    question: 'Si durante un lanzamiento de proyectil se duplicara la gravedad del planeta, entonces el proyectil:',
    options: [
      'Permanecería más tiempo en el aire.',
      'Alcanzaría mayor altura.',
      'Tendría mayor velocidad horizontal constante.',
      'Descendería más rápidamente.',
    ],
    correctIndex: 3,
    explanation:
      'Al duplicarse g, la aceleración descendente es dos veces más intensa (ay = 2g), lo que reduce el tiempo de vuelo a la mitad (t ∝ 1/g) y hace que el proyectil sea atraído y descienda mucho más rápidamente hacia el suelo.',
  },
  {
    id: 'ht02_q7',
    number: 7,
    question: 'Un estudiante observa que una pelota lanzada regresa al mismo nivel desde donde salió. En ese caso, al llegar al suelo idealmente:',
    options: [
      'Tiene velocidad vertical cero.',
      'Tiene la misma rapidez que al inicio.',
      'Tiene menor rapidez siempre.',
      'Se detiene al tocar el suelo antes de llegar.',
    ],
    correctIndex: 1,
    explanation:
      'Por simetría parabólica y conservación de energía mecánica, al retornar al mismo nivel de referencia horizontal vy = -v₀y y vx = v₀x, de modo que la rapidez resultante final |v| = √(vx² + vy²) es exactamente igual a la rapidez inicial v₀.',
  },
];

/**
 * 10 Problemas de Aplicación oficiales de la Hoja de Trabajo HT02 (Forma 2)
 */
export const PROJECTILE_MOTION_EXERCISES = [
  {
    id: 'ht02_p1_baseball_100ms_30deg',
    number: 1,
    title: 'Pelota de béisbol lanzada a 100 m/s a 30.0°',
    topic: 'Alcance horizontal al mismo nivel de partida',
    source: 'Problema 1 • HT02 Lanzamiento de Proyectil Kinal',
    statement:
      'Se lanza una pelota de béisbol con una velocidad inicial de 100 m/s con un ángulo de 30.0° en relación con la horizontal, como se muestra en la figura. ¿A qué distancia del punto de lanzamiento alcanzará la pelota su nivel inicial?',
    params: { v0: 100.0, theta: 30.0, g: 9.80 },
    steps: [
      {
        title: 'Paso 1: Descomposición de la velocidad inicial',
        body: 'v₀x = v₀ · cos(30.0°) = 100 · cos(30°) = 100 · (√3 / 2) ≈ 86.60 m/s\nv₀y = v₀ · sin(30.0°) = 100 · sin(30°) = 100 · (0.5) = 50.00 m/s',
      },
      {
        title: 'Paso 2: Tiempo de vuelo hasta el nivel inicial',
        body: 'El tiempo de vuelo para volver al mismo nivel (y = 0):\nt_vuelo = 2 · v₀y / g = (2 · 50.00 m/s) / (9.80 m/s²) = 100 / 9.80 ≈ 10.20 s',
      },
      {
        title: 'Paso 3: Cálculo del alcance horizontal (X)',
        body: 'X = v₀x · t_vuelo = 86.6025 m/s · 10.2041 s ≈ 883.70 m\n(Comprobación directa: R = v₀²·sin(2θ) / g = 100² · sin(60°) / 9.80 = 10000 · 0.866025 / 9.80 ≈ 883.70 m)',
      },
    ],
    finalAnswer: 'Alcance horizontal: 883.70 m (Tiempo de permanencia en el aire: 10.20 s)',
    assemblyConfig: {
      v0: 100.0,
      thetaDeg: 30.0,
      launchHeightMeters: 0.0,
      targetRangeMeters: 883.70,
    },
  },

  {
    id: 'ht02_p2_soccer_20ms_37deg',
    number: 2,
    title: 'Balón de fútbol pateado a 20.0 m/s con ángulo de 37.0°',
    topic: 'Altura máxima, tiempo total, alcance y velocidad en la cúspide',
    source: 'Problema 2 • HT02 Lanzamiento de Proyectil Kinal',
    statement:
      'Un jugador patea un balón de futbol a un ángulo de θ = 37.0° con una velocidad de salida de 20.0 m/s. Calcule:\na) La altura máxima.\nb) El tiempo transcurrido antes de que el balón golpee el suelo.\nc) A qué distancia golpea el suelo.\nd) El vector velocidad en la altura máxima.',
    params: { v0: 20.0, theta: 37.0, g: 9.80 },
    steps: [
      {
        title: 'Descomposición vectorial inicial',
        body: 'v₀x = 20.0 · cos(37.0°) = 20.0 · 0.7986 ≈ 15.97 m/s\nv₀y = 20.0 · sin(37.0°) = 20.0 · 0.6018 ≈ 12.04 m/s',
      },
      {
        title: 'a) Altura máxima alcanzada (h_máx)',
        body: 'En el ápice vy = 0:\nh_máx = v₀y² / (2 · g) = (12.036 m/s)² / (2 · 9.80 m/s²) = 144.87 / 19.60 ≈ 7.39 m',
      },
      {
        title: 'b) Tiempo transcurrido hasta golpear el suelo',
        body: 't_vuelo = 2 · v₀y / g = (2 · 12.036 m/s) / (9.80 m/s²) ≈ 2.46 s',
      },
      {
        title: 'c) Distancia horizontal a la que golpea el suelo',
        body: 'X = v₀x · t_vuelo = 15.973 m/s · 2.456 s ≈ 39.24 m',
      },
      {
        title: 'd) Vector velocidad en la altura máxima',
        body: 'En la cúspide la componente vertical es cero (vy = 0). Por lo tanto:\nv⃗ = (15.97 î + 0 ĵ) m/s  (Magnitud: 15.97 m/s horizontal)',
      },
    ],
    finalAnswer:
      'a) Altura máxima: 7.39 m\nb) Tiempo de vuelo: 2.46 s\nc) Distancia horizontal: 39.24 m\nd) Velocidad en la cúspide: 15.97 m/s horizontalmente',
    assemblyConfig: {
      v0: 20.0,
      thetaDeg: 37.0,
      launchHeightMeters: 0.0,
      targetRangeMeters: 39.24,
    },
  },

  {
    id: 'ht02_p3_projectile_50ms_50deg',
    number: 3,
    title: 'Proyectil lanzado desde el piso a 50 m/s y 50°',
    topic: 'Tiempo de choque, distancia y ángulo de impacto',
    source: 'Problema 3 • HT02 Lanzamiento de Proyectil Kinal',
    statement:
      'Un cuerpo con rapidez inicial de 50 m/s, se lanza hacia arriba desde el nivel del piso, con un ángulo de 50° con la horizontal. Determine:\na) ¿Cuánto tiempo transcurrirá antes de que el cuerpo choque contra el suelo?\nb) ¿A qué distancia del punto de partida golpeará el piso?\nc) ¿Cuál será el ángulo con la horizontal al chocar?',
    params: { v0: 50.0, theta: 50.0, g: 9.80 },
    steps: [
      {
        title: 'Componentes de velocidad inicial',
        body: 'v₀x = 50 · cos(50°) = 50 · 0.64279 ≈ 32.14 m/s\nv₀y = 50 · sin(50°) = 50 · 0.76604 ≈ 38.30 m/s',
      },
      {
        title: 'a) Tiempo antes de chocar contra el suelo',
        body: 't_vuelo = 2 · v₀y / g = (2 · 38.302 m/s) / (9.80 m/s²) = 76.604 / 9.80 ≈ 7.82 s',
      },
      {
        title: 'b) Distancia horizontal de choque',
        body: 'X = v₀x · t_vuelo = 32.139 m/s · 7.817 s ≈ 251.23 m',
      },
      {
        title: 'c) Ángulo con la horizontal al chocar',
        body: 'Por simetría parabólica al mismo nivel:\nvx = v₀x = 32.14 m/s,  vy = -v₀y = -38.30 m/s\ntan(θ_f) = vy / vx = -38.30 / 32.14 = -1.1917  ⟹  θ_f = -50.0°\nEl proyectil choca a 50.0° por debajo de la horizontal.',
      },
    ],
    finalAnswer:
      'a) Tiempo de choque: 7.82 s\nb) Distancia horizontal: 251.23 m\nc) Ángulo de choque: 50.0° por debajo de la horizontal',
    assemblyConfig: {
      v0: 50.0,
      thetaDeg: 50.0,
      launchHeightMeters: 0.0,
      targetRangeMeters: 251.23,
    },
  },

  {
    id: 'ht02_p4_downward_building_170m_40ms',
    number: 4,
    title: 'Disparo hacia abajo desde edificio de 170 m a 40 m/s y 30°',
    topic: 'Lanzamiento con ángulo negativo hacia abajo desde altura',
    source: 'Problema 4 • HT02 Lanzamiento de Proyectil Kinal',
    statement:
      'Se lanza un cuerpo hacia abajo desde el punto más alto de un edificio de 170 m de altura, formando un ángulo de 30° con la horizontal. Su rapidez inicial es de 40 m/s. Determina:\na) ¿Cuánto tiempo transcurrirá antes de que el cuerpo llegue al piso?\nb) ¿A qué distancia del pie del edificio golpeará?\nc) ¿Cuál será el ángulo con la horizontal al cual chocará?',
    params: { h: 170.0, v0: 40.0, theta: -30.0, g: 9.80 },
    steps: [
      {
        title: 'Componentes con ángulo hacia abajo (θ = -30°)',
        body: 'v₀x = 40 · cos(30°) = 40 · (√3 / 2) ≈ 34.64 m/s\nv₀y = -40 · sin(30°) = -40 · 0.5 = -20.00 m/s (hacia abajo)',
      },
      {
        title: 'a) Tiempo hasta llegar al piso (y = 0 desde y₀ = 170 m)',
        body: 'y(t) = y₀ + v₀y·t - ½·g·t² = 170 - 20·t - 4.90·t² = 0\n4.90·t² + 20·t - 170 = 0\nt = [-20 + √(20² - 4·4.90·(-170))] / (2 · 4.90)\nt = [-20 + √(400 + 3332)] / 9.80 = [-20 + √3732] / 9.80 = [-20 + 61.09] / 9.80 ≈ 4.19 s',
      },
      {
        title: 'b) Distancia horizontal desde el pie del edificio',
        body: 'X = v₀x · t = 34.641 m/s · 4.193 s ≈ 145.25 m',
      },
      {
        title: 'c) Ángulo con la horizontal al chocar',
        body: 'vx = 34.64 m/s\nvy = v₀y - g·t = -20 - (9.80 · 4.193) = -20 - 41.09 = -61.09 m/s\ntan(θ) = vy / vx = -61.09 / 34.64 = -1.7635  ⟹  θ = -60.44°\nRapidez de choque: v = √(34.64² + (-61.09)²) = √4932 ≈ 70.23 m/s',
      },
    ],
    finalAnswer:
      'a) Tiempo de caída: 4.19 s\nb) Distancia del pie del edificio: 145.25 m\nc) Ángulo de impacto: 60.44° por debajo de la horizontal (v = 70.23 m/s)',
    assemblyConfig: {
      v0: 40.0,
      thetaDeg: -30.0,
      launchHeightMeters: 170.0,
      targetRangeMeters: 145.25,
    },
  },

  {
    id: 'ht02_p5_hose_wall_8m_20ms_40deg',
    number: 5,
    title: 'Manguera en el piso hacia pared a 8.0 m de distancia',
    topic: 'Cálculo de altura de impacto sobre una pared vertical',
    source: 'Problema 5 • HT02 Lanzamiento de Proyectil Kinal',
    statement:
      'Una manguera que se encuentra tendida en el piso lanza una corriente de agua hacia arriba con un ángulo de 40° con la horizontal. La rapidez del agua es de 20 m/s cuando sale de la manguera. ¿A qué altura golpeará sobre una pared que se encuentra a 8.0 m de distancia?',
    params: { v0: 20.0, theta: 40.0, x: 8.0, g: 9.80 },
    steps: [
      {
        title: 'Paso 1: Descomposición de la velocidad inicial',
        body: 'v₀x = 20 · cos(40°) = 20 · 0.76604 ≈ 15.32 m/s\nv₀y = 20 · sin(40°) = 20 · 0.64279 ≈ 12.86 m/s',
      },
      {
        title: 'Paso 2: Tiempo empleado en llegar a la pared a 8.0 m',
        body: 'El eje X es MRU:\nt = x / v₀x = 8.0 m / 15.321 m/s ≈ 0.522 s',
      },
      {
        title: 'Paso 3: Altura vertical y(t) al impactar en la pared',
        body: 'y = v₀y·t - ½·g·t²\ny = (12.856 m/s · 0.522 s) - (4.90 m/s² · (0.522 s)²)\ny = 6.713 m - (4.90 · 0.2725 m) = 6.713 - 1.335 ≈ 5.38 m',
      },
    ],
    finalAnswer: 'Altura de impacto en la pared: 5.38 m (en un tiempo de t = 0.522 s)',
    assemblyConfig: {
      v0: 20.0,
      thetaDeg: 40.0,
      launchHeightMeters: 0.0,
      targetRangeMeters: 8.0,
      targetHeightMeters: 5.38,
    },
  },

  {
    id: 'ht02_p6_baseball_30ms_30deg_after_3s',
    number: 6,
    title: 'Pelota de béisbol bateada a 30 m/s y 30° después de 3 s',
    topic: 'Componentes de velocidad instantánea tras un intervalo de tiempo',
    source: 'Problema 6 • HT02 Lanzamiento de Proyectil Kinal',
    statement:
      'Una pelota de béisbol sale golpeada por el bate con una velocidad de 30 m/s a un ángulo de 30°. ¿Cuáles son las componentes horizontal y vertical de su velocidad después de 3 s?',
    params: { v0: 30.0, theta: 30.0, t: 3.0, g: 9.80 },
    steps: [
      {
        title: 'Componentes de velocidad inicial al instante t = 0',
        body: 'v₀x = 30 · cos(30°) = 30 · (√3 / 2) ≈ 25.98 m/s\nv₀y = 30 · sin(30°) = 30 · 0.5 = 15.00 m/s',
      },
      {
        title: 'Componente horizontal a los t = 3 s (MRU)',
        body: 'En el eje X no actúa gravedad (ax = 0):\nvx(3 s) = v₀x = 25.98 m/s',
      },
      {
        title: 'Componente vertical a los t = 3 s (Aceleración gravitacional)',
        body: 'vy(t) = v₀y - g·t\nvy(3 s) = 15.00 m/s - (9.80 m/s² · 3.0 s) = 15.00 - 29.40 = -14.40 m/s\n(El signo negativo indica que la pelota va descendiendo a 14.40 m/s)',
      },
    ],
    finalAnswer: 'Componente horizontal: vx = 25.98 m/s | Componente vertical: vy = -14.40 m/s (hacia abajo)',
    assemblyConfig: {
      v0: 30.0,
      thetaDeg: 30.0,
      launchHeightMeters: 0.0,
      targetRangeMeters: 77.94,
    },
  },

  {
    id: 'ht02_p7_golf_green_10m_higher_40ms_65deg',
    number: 7,
    title: 'Pelota de golf hacia un green ubicado 10 m más arriba',
    topic: 'Tiempo de vuelo y distancia horizontal a desnivel positivo (+10 m)',
    source: 'Problema 7 • HT02 Lanzamiento de Proyectil Kinal',
    statement:
      'En la figura, una pelota de golf sale del punto de partida, al ser golpeada, con una velocidad de 40 m/s a 65°. Si cae sobre un green ubicado 10 m más arriba que el punto de partida, ¿Cuál fue el tiempo que permaneció en el aire y cuál fue la distancia horizontal recorrida respecto al palo?',
    params: { v0: 40.0, theta: 65.0, deltaY: 10.0, g: 9.80 },
    steps: [
      {
        title: 'Componentes de velocidad inicial',
        body: 'v₀x = 40 · cos(65°) = 40 · 0.42262 ≈ 16.90 m/s\nv₀y = 40 · sin(65°) = 40 · 0.90631 ≈ 36.25 m/s',
      },
      {
        title: 'Tiempo de vuelo hasta el green elevado (+10 m)',
        body: 'y(t) = v₀y·t - ½·g·t² = 10\n4.90·t² - 36.252·t + 10 = 0\nt = [36.252 ± √(36.252² - 4·4.90·10)] / (2 · 4.90)\nt = [36.252 ± √(1314.21 - 196)] / 9.80 = [36.252 ± √1118.21] / 9.80 = [36.252 ± 33.44] / 9.80\nt₁ = 0.287 s (en la subida cruzando 10 m)\nt₂ = (36.252 + 33.44) / 9.80 ≈ 7.11 s (al aterrizar en el green en la bajada)\nTiempo en el aire: t = 7.11 s',
      },
      {
        title: 'Distancia horizontal recorrida respecto al palo',
        body: 'X = v₀x · t = 16.905 m/s · 7.111 s ≈ 120.22 m',
      },
    ],
    finalAnswer: 'Tiempo en el aire: 7.11 s | Distancia horizontal: 120.22 m',
    assemblyConfig: {
      v0: 40.0,
      thetaDeg: 65.0,
      launchHeightMeters: 0.0,
      targetRangeMeters: 120.22,
      targetHeightMeters: 10.0,
    },
  },

  {
    id: 'ht02_p8_between_buildings_50m_20ms_40deg',
    number: 8,
    title: 'Pelota lanzada entre edificios a 50 m de distancia',
    topic: 'Impacto por encima o por debajo del nivel inicial en pared opuesta',
    source: 'Problema 8 • HT02 Lanzamiento de Proyectil Kinal',
    statement:
      'Como se muestra en la figura, se lanza una pelota desde lo alto de un edificio hacia otro más alto, a 50 m de distancia. La velocidad inicial de la pelota es de 20 m/s, con una inclinación de 40° sobre la horizontal. ¿A qué distancia, por encima o por debajo de su nivel inicial, golpeará la pelota sobre la pared opuesta?',
    params: { v0: 20.0, theta: 40.0, x: 50.0, g: 9.80 },
    steps: [
      {
        title: 'Descomposición de velocidad inicial',
        body: 'v₀x = 20 · cos(40°) = 20 · 0.76604 ≈ 15.32 m/s\nv₀y = 20 · sin(40°) = 20 · 0.64279 ≈ 12.86 m/s',
      },
      {
        title: 'Tiempo para recorrer los 50 m entre edificios',
        body: 't = x / v₀x = 50.0 m / 15.321 m/s ≈ 3.26 s',
      },
      {
        title: 'Posición vertical y(t) respecto al nivel inicial (y₀ = 0)',
        body: 'y = v₀y·t - ½·g·t²\ny = (12.856 · 3.2635) - (4.90 · (3.2635)²)\ny = 41.955 m - (4.90 · 10.651) = 41.955 - 52.188 ≈ -10.23 m\nEl resultado negativo indica que golpea por debajo del nivel inicial.',
      },
    ],
    finalAnswer: 'Golpea a 10.23 m por debajo de su nivel inicial (-10.23 m, en t = 3.26 s)',
    assemblyConfig: {
      v0: 20.0,
      thetaDeg: 40.0,
      launchHeightMeters: 30.0,
      targetRangeMeters: 50.0,
      targetHeightMeters: 19.77,
    },
  },

  {
    id: 'ht02_p9_window_8m_downward_20deg_10ms',
    number: 9,
    title: 'Pelota lanzada desde ventana de 8.0 m a 20° hacia abajo',
    topic: 'Alcance horizontal con ángulo por debajo de la horizontal desde altura',
    source: 'Problema 9 • HT02 Lanzamiento de Proyectil Kinal',
    statement:
      'Usted lanza una pelota desde una ventana de 8.0 m del suelo. Cuando la pelota sale de su mano, se mueve a 10.0 m/s con un ángulo de 20° debajo de la horizontal. ¿A qué distancia horizontal de su ventana llegará la pelota al piso?',
    params: { h: 8.0, v0: 10.0, theta: -20.0, g: 9.80 },
    steps: [
      {
        title: 'Componentes de velocidad inicial (θ = -20° hacia abajo)',
        body: 'v₀x = 10.0 · cos(20°) = 10.0 · 0.93969 ≈ 9.40 m/s\nv₀y = -10.0 · sin(20°) = -10.0 · 0.34202 ≈ -3.42 m/s',
      },
      {
        title: 'Tiempo transcurrido hasta tocar el piso (y₀ = 8.0 m, y = 0)',
        body: '8.0 - 3.4202·t - 4.90·t² = 0  ⟹  4.90·t² + 3.4202·t - 8.0 = 0\nt = [-3.4202 + √(3.4202² - 4·4.90·(-8.0))] / (2 · 4.90)\nt = [-3.4202 + √(11.70 + 156.80)] / 9.80 = [-3.4202 + √168.50] / 9.80\nt = [-3.4202 + 12.981] / 9.80 ≈ 0.976 s',
      },
      {
        title: 'Distancia horizontal desde la ventana',
        body: 'X = v₀x · t = 9.397 m/s · 0.9756 s ≈ 9.17 m',
      },
    ],
    finalAnswer: 'Distancia horizontal recorrida: 9.17 m (con un tiempo de vuelo de 0.976 s)',
    assemblyConfig: {
      v0: 10.0,
      thetaDeg: -20.0,
      launchHeightMeters: 8.0,
      targetRangeMeters: 9.17,
    },
  },

  {
    id: 'ht02_p10_grasshopper_cliff_50deg',
    number: 10,
    title: 'Saltamontes saltando del borde de un risco a 50.0°',
    topic: 'Determinación de rapidez inicial y altura del risco a partir de cúspide',
    source: 'Problema 10 • HT02 Lanzamiento de Proyectil Kinal',
    statement:
      'Un saltamontes salta hacia el aire del borde de un risco vertical, como se muestra en la figura. Use la información de la figura para determinar:\na) La rapidez inicial del saltamontes.\nb) La altura del risco.',
    params: { theta: 50.0, hApexAboveCliff: 0.0674, totalX: 1.06, g: 9.80 },
    steps: [
      {
        title: 'a) Determinación de la rapidez inicial (v₀)',
        body: 'En el punto más alto vy = 0. La altura sobre el risco es h = 6.74 cm = 0.0674 m:\nv₀y = √(2 · g · h_pico) = √(2 · 9.80 m/s² · 0.0674 m) = √1.3210 ≈ 1.149 m/s\nComo v₀y = v₀ · sin(50.0°):\nv₀ = v₀y / sin(50.0°) = 1.1494 m/s / 0.76604 ≈ 1.50 m/s',
      },
      {
        title: 'b) Componente horizontal y tiempo total de vuelo',
        body: 'v₀x = v₀ · cos(50.0°) = 1.500 m/s · 0.64279 ≈ 0.964 m/s\nAlcance horizontal total medido en la figura: x_total = 1.06 m\nt_total = x_total / v₀x = 1.06 m / 0.9644 m/s ≈ 1.10 s',
      },
      {
        title: 'c) Cálculo de la altura del risco (H)',
        body: 'Ecuación vertical desde el punto de salto:\ny(t) = v₀y·t - ½·g·t²\ny(1.099 s) = (1.1494 · 1.099) - (4.90 · (1.099)²)\ny = 1.263 m - 5.919 m ≈ -4.66 m\nPor lo tanto, la altura del risco vertical es H = 4.66 m',
      },
    ],
    finalAnswer: 'a) Rapidez inicial del saltamontes: 1.50 m/s\nb) Altura del risco: 4.66 m (Tiempo de vuelo total: 1.10 s)',
    assemblyConfig: {
      v0: 1.50,
      thetaDeg: 50.0,
      launchHeightMeters: 4.66,
      targetRangeMeters: 1.06,
    },
  },
];

/**
 * Solucionador dinámico analítico para cualquier combinación personalizada
 */
export function solveCustomProjectileMotion(v0, thetaDeg, launchHeightMeters = 0.0, g = 9.80) {
  const rad = (thetaDeg * Math.PI) / 180;
  const v0x = v0 * Math.cos(rad);
  const v0y = v0 * Math.sin(rad);

  // Tiempo hasta el punto más alto (si v0y > 0)
  const timeToApex = v0y > 0 ? v0y / g : 0.0;
  const maxApexHeight = v0y > 0 ? launchHeightMeters + (v0y * v0y) / (2 * g) : launchHeightMeters;

  // Ecuación cuadrática para el tiempo total de vuelo hasta el suelo (y = 0):
  // y0 + v0y*t - 0.5*g*t^2 = 0  =>  0.5*g*t^2 - v0y*t - y0 = 0
  const a = 0.5 * g;
  const b = -v0y;
  const c = -launchHeightMeters;

  const discriminant = b * b - 4 * a * c;
  let flightTime = 0.0;
  if (discriminant >= 0) {
    const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    flightTime = Math.max(t1, t2);
  }

  const horizontalRange = v0x * flightTime;
  const vyImpact = v0y - g * flightTime;
  const vImpact = Math.sqrt(v0x * v0x + vyImpact * vyImpact);
  const angleImpactDeg = (Math.atan2(vyImpact, v0x) * 180) / Math.PI;

  return {
    v0,
    thetaDeg,
    launchHeightMeters,
    g,
    v0x,
    v0y,
    timeToApex,
    maxApexHeight,
    flightTime,
    horizontalRange,
    vyImpact,
    vImpact,
    angleImpactDeg,
  };
}

/**
 * Generador de elementos de whiteboard para estampar un ejercicio en la pizarra
 */
export function buildProjectileMotionExerciseBoardElements(exercise, startX = 0, startY = 0) {
  const elements = [];

  // 1. Header Text
  elements.push({
    id: `hdr_pm_${Date.now()}`,
    type: 'text',
    x: startX,
    y: startY,
    text: `HT02: LANZAMIENTO DE PROYECTIL • ${exercise.title.toUpperCase()}`,
    fontSize: 22,
    color: '#0f172a',
    fontWeight: 'bold',
  });

  // 2. Statement Sticky Note
  elements.push({
    id: `stmt_pm_${Date.now()}`,
    type: 'sticky',
    x: startX,
    y: startY + 36,
    width: 290,
    height: 190,
    text: `📝 ENUNCIADO (HT02):\n${exercise.statement}`,
    color: '#fff9b1',
  });

  // 3. Step-by-Step Solution Cards
  const cardW = 270;
  const cardH = 190;
  const colors = ['#fdf2f8', '#fae8ff', '#f3e8ff', '#ede9fe', '#e0f2fe', '#dcfce7'];

  exercise.steps.forEach((step, idx) => {
    const col = (idx + 1) % 3;
    const row = Math.floor((idx + 1) / 3);
    const cardX = startX + col * (cardW + 15);
    const cardY = startY + 36 + row * (cardH + 15);
    const cardColor = colors[idx % colors.length];

    elements.push({
      id: `step_pm_${idx}_${Date.now()}`,
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
    id: `ans_pm_${Date.now()}`,
    type: 'sticky',
    x: startX,
    y: answerY,
    width: 590,
    height: 95,
    text: `🎯 RESULTADOS Y CONCLUSIÓN (HT02):\n${exercise.finalAnswer}`,
    color: '#d3f8df',
  });

  // 5. Physical Scale Laboratory Assembly:
  // Cannon Launcher + Oblique Projectile + Photogate / Target
  const launcherX = startX + 640;
  const launcherY = startY + 80;
  const cfg = exercise.assemblyConfig || {};
  const v0 = cfg.v0 || 20.0;
  const thetaDeg = cfg.thetaDeg !== undefined ? cfg.thetaDeg : 45.0;
  const launchHeightM = cfg.launchHeightMeters || 0.0;
  const targetRangeM = cfg.targetRangeMeters || 40.0;

  // Scale: px per meter
  const pxPerMeter = getProjectileScale(targetRangeM);

  // Cannon dimensions & elevation
  const cannonW = 90;
  const cannonH = 70;
  const projSize = 26;

  const elevatedPx = launchHeightM > 0 ? launchHeightM * pxPerMeter : 0;
  const groundY = launcherY + 120 + elevatedPx;
  const cannonGroundY = groundY - elevatedPx;
  const cannonY = cannonGroundY - cannonH + 2;

  // Cannon Launcher
  const cannon = createPhysicsElement('cannon_launcher', launcherX, cannonY, {
    label: `Cañón (θ = ${thetaDeg}°, v₀ = ${v0} m/s)`,
    width: cannonW,
    height: cannonH,
    angleDeg: thetaDeg,
    velocity: v0,
    initialVelocity: v0,
    launchHeight: launchHeightM,
    color: '#7c3aed',
  });

  // Calculate EXACT cannon barrel muzzle coordinates
  const muzzleInfo = getCannonMuzzlePosition(launcherX, cannonY, cannonW, cannonH, thetaDeg);
  const muzzleCenterX = muzzleInfo.muzzleCenterX;
  const muzzleCenterY = muzzleInfo.muzzleCenterY;

  // Oblique Projectile sitting snug in the cannon muzzle bore
  const projX = muzzleCenterX - projSize / 2;
  const projY = muzzleCenterY - projSize / 2;

  const projectile = createPhysicsElement('oblique_projectile', projX, projY, {
    label: `Proyectil (${v0} m/s, ${thetaDeg}°)`,
    velocity: v0,
    initialVelocity: v0,
    angleDeg: thetaDeg,
    initialAngleDeg: thetaDeg,
    launchHeight: launchHeightM,
    gravity: 9.80,
    color: '#a855f7',
    width: projSize,
    height: projSize,
    pxPerMeter,
    groundY,
    showVector: true,
    showResultantVector: true,
    showTrajectory: true,
  });

  // Calculate EXACT landing impact point for photogate placement
  const rad = (thetaDeg * Math.PI) / 180;
  const v0x = v0 * Math.cos(rad);
  const v0y = v0 * Math.sin(rad);
  const landingCenterY = groundY - projSize / 2;
  const dropPx = landingCenterY - muzzleCenterY;
  const dropM = dropPx / pxPerMeter;
  const g = 9.80;
  const disc = v0y * v0y + 2 * g * dropM;
  const flightTime = disc >= 0 ? (v0y + Math.sqrt(disc)) / g : (2 * v0y / g);
  const landingOffsetPx = v0x * flightTime * pxPerMeter;
  const landingCenterX = muzzleCenterX + landingOffsetPx;

  // Landing Target Sensor resting on ground
  const gateW = 50;
  const gateH = 44;
  const gateX = landingCenterX - gateW / 2;
  const gateY = groundY - gateH;

  const targetGate = createPhysicsElement('mru_photogate', gateX, gateY, {
    label: `Zona Impacto (${targetRangeM.toFixed(1)}m)`,
    gateName: 'Impacto HT02',
    targetDistanceM: targetRangeM,
  });

  elements.push(cannon, projectile, targetGate);

  return elements;
}
