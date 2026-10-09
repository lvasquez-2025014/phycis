// =========================================================================
// MOVIMIENTO CIRCULAR UNIFORMEMENTE ACELERADO (MCUV / MCUA) - SOLUCIONADOR Y DATASET
// Basado en el documento oficial: "Unidad 2 - Física 5to. - Movimiento Circular Acelerado"
// Colegio Kinal - Diversificado
// =========================================================================

import { createPhysicsElement } from '../physics/physicsRegistry';

/**
 * 10 Preguntas Teóricas oficiales de la Hoja de Trabajo (Kinal 5to)
 */
export const MCUV_THEORY_QUESTIONS = [
  {
    id: 'mcuv_q1',
    number: 1,
    question: '¿Qué es el movimiento circular uniformemente acelerado (MCUA / MCUV)?',
    options: [
      'Es un movimiento en línea recta con aceleración gravitacional constante.',
      'Es aquel movimiento en el cual un cuerpo describe una trayectoria circular con aceleración angular (α) constante en el tiempo.',
      'Es un giro donde la velocidad angular nunca cambia de valor.',
      'Es un movimiento donde la aceleración centrípeta es siempre cero.',
    ],
    correctIndex: 1,
    explanation:
      'En el MCUA/MCUV, la partícula se desplaza sobre una circunferencia mientras su velocidad angular ω varía uniformemente debido a una aceleración angular constante α = dω/dt = cte.',
  },
  {
    id: 'mcuv_q2',
    number: 2,
    question: 'Explica cómo se relacionan la aceleración angular α y la aceleración tangencial at en el MCUA:',
    options: [
      'Se relacionan mediante la ecuación at = α · r, donde r es el radio de giro.',
      'Son magnitudes independientes que no guardan relación geométrica.',
      'La aceleración tangencial es el inverso del radio: at = α / r.',
      'at siempre es igual a la gravedad terrestre g.',
    ],
    correctIndex: 0,
    explanation:
      'La aceleración tangencial at mide la variación de la rapidez lineal (dv/dt). Dado que v = ω·r, diferenciando respecto al tiempo se obtiene: at = (dω/dt)·r = α·r.',
  },
  {
    id: 'mcuv_q3',
    number: 3,
    question: '¿Por qué la aceleración centrípeta en el MCUA no es constante?',
    options: [
      'Porque el radio de la circunferencia cambia a cada instante.',
      'Porque la masa del objeto se reduce con la velocidad.',
      'Porque la rapidez tangencial v(t) y la velocidad angular ω(t) varían con el tiempo, haciendo que ac = v²/r = ω²·r cambie continuamente.',
      'Porque la aceleración centrípeta desaparece cuando hay aceleración angular.',
    ],
    correctIndex: 2,
    explanation:
      'La aceleración centrípeta ac = ω²·r depende del cuadrado de la velocidad angular. Como en el MCUA la velocidad angular cambia a cada instante (ω = ω₀ + αt), el valor de ac crece o disminuye continuamente.',
  },
  {
    id: 'mcuv_q4',
    number: 4,
    question: 'Escribe la fórmula de la aceleración centrípeta ac en el MCUA y explica sus componentes:',
    options: [
      'ac = α · r, donde α es la aceleración angular y r el radio.',
      'ac = v² / r = ω² · r, donde v es la rapidez tangencial instantánea, ω la velocidad angular instantánea y r el radio de curvatura.',
      'ac = m · g, donde m es la masa del objeto.',
      'ac = 2π · r / T, donde T es el período.',
    ],
    correctIndex: 1,
    explanation:
      'ac = v²/r = ω²·r representa la componente perpendicular a la trayectoria que apunta hacia el centro y es la responsable de cambiar continuamente la dirección del vector velocidad.',
  },
  {
    id: 'mcuv_q5',
    number: 5,
    question: '¿Cómo se calcula la velocidad angular final en un movimiento circular uniformemente acelerado?',
    options: [
      'ω = v / t.',
      'ωf = ω₀ + α · t (y también mediante ωf² = ω₀² + 2α·Δθ).',
      'ω = 2π / f.',
      'ωf = α / t.',
    ],
    correctIndex: 1,
    explanation:
      'Análoga a la cinemática lineal (v = v₀ + at), la velocidad angular final se obtiene integrando la aceleración angular constante: ωf = ω₀ + α·t, o por conservación cinemática: ωf² = ω₀² + 2α·Δθ.',
  },
  {
    id: 'mcuv_q6',
    number: 6,
    question: 'Define la relación entre la velocidad tangencial v y la velocidad angular ω en el MCUA:',
    options: [
      'v = ω · r en cada instante temporal t.',
      'v = ω / r.',
      'v = ω + r.',
      'v = α · t².',
    ],
    correctIndex: 0,
    explanation:
      'La rapidez tangencial es el producto directo de la velocidad angular instantánea por el radio: v(t) = ω(t)·r. A mayor distancia del centro, mayor es la rapidez tangencial.',
  },
  {
    id: 'mcuv_q7',
    number: 7,
    question: '¿Qué significa que el objeto en MCUA tenga una aceleración angular constante? ¿Qué efecto tiene sobre la velocidad tangencial?',
    options: [
      'Significa que no gira; el objeto permanece estático.',
      'Significa que su velocidad angular cambia a una tasa constante, produciendo una aceleración tangencial at = α·r también constante que aumenta o disminuye uniformemente la rapidez lineal.',
      'Significa que la velocidad lineal es constante.',
      'Significa que el radio aumenta en cada vuelta.',
    ],
    correctIndex: 1,
    explanation:
      'Una aceleración angular constante (α = cte) implica que cada segundo la velocidad angular cambia la misma cantidad de rad/s, provocando un cambio lineal uniforme en la rapidez tangencial con at = α·r constante.',
  },
  {
    id: 'mcuv_q8',
    number: 8,
    question: '¿Cómo se determina la aceleración total de un objeto en movimiento circular uniformemente acelerado?',
    options: [
      'Sumando algebraicamente: atotal = at + ac.',
      'Restando las aceleraciones: atotal = ac - at.',
      'Mediante el teorema de Pitágoras: atotal = √(at² + ac²), debido a que at (tangencial) y ac (centrípeta) son vectores perpendiculares entre sí.',
      'atotal = α · r².',
    ],
    correctIndex: 2,
    explanation:
      'La aceleración lineal total a⃗ es la suma vectorial de sus dos componentes ortogonales: la aceleración tangencial a⃗t (tangente al círculo) y la aceleración centrípeta a⃗c (radial hacia el centro). Por tanto: |a⃗| = √(at² + ac²).',
  },
  {
    id: 'mcuv_q9',
    number: 9,
    question: '¿Cuál es la diferencia principal entre el MCU y el MCUA?',
    options: [
      'En MCU el radio es cero y en MCUA el radio es infinito.',
      'En MCU la aceleración angular es nula (α = 0, ω = cte, at = 0), mientras que en MCUA existe aceleración angular constante (α = cte ≠ 0), por lo que ω y v cambian y coexisten at y ac.',
      'En MCU el movimiento es rectilíneo y en MCUA es circular.',
      'No existe ninguna diferencia; son exactamente el mismo movimiento.',
    ],
    correctIndex: 1,
    explanation:
      'En el MCU solo existe aceleración centrípeta con magnitud constante (at = 0, ac = cte). En el MCUA coexisten aceleración angular (α), aceleración tangencial (at) y aceleración centrípeta variable en el tiempo ac(t).',
  },
  {
    id: 'mcuv_q10',
    number: 10,
    question: 'Escribe las ecuaciones principales de movimiento para el MCUA (aceleración angular constante):',
    options: [
      'x = v·t, v = d/t.',
      'ωf = ω₀ + α·t | Δθ = ω₀·t + ½·α·t² | ωf² = ω₀² + 2α·Δθ | Δθ = ((ω₀ + ωf) / 2)·t.',
      'F = m·a | W = F·d.',
      'ac = v²/r | T = 2π/ω.',
    ],
    correctIndex: 1,
    explanation:
      'Son las 4 ecuaciones maestras de la cinemática angular uniformemente variada, análogas directas a las del MRUV reemplazando posición x por ángulo θ, velocidad v por ω y aceleración lineal a por α.',
  },
];

/**
 * 15 Situaciones Problemas oficiales de la Hoja de Trabajo (Problemas 11 al 25)
 */
export const MCUV_EXERCISES = [
  {
    id: 'mcuv_p11_disco_2rads2_5s_3rads',
    number: 11,
    title: 'Disco con α = 2 rad/s² durante 5 s (ω₀ = 3 rad/s)',
    topic: 'Velocidad angular final y desplazamiento angular',
    source: 'Problema 11 • Kinal 5to',
    statement:
      'Un disco gira con una aceleración angular constante de 2 rad/s² durante 5 segundos. Si su velocidad angular inicial es de 3 rad/s:\na) ¿Cuál es la velocidad angular final del disco?\nb) ¿Cuánto ha girado el disco en esos 5 segundos en términos de desplazamiento angular?',
    params: { alpha: 2.0, t: 5.0, omega0: 3.0 },
    steps: [
      {
        title: 'Datos del Problema',
        body: 'Aceleración angular: α = 2 rad/s²\nTiempo: t = 5 s\nVelocidad angular inicial: ω₀ = 3 rad/s',
      },
      {
        title: 'a) Velocidad angular final (ωf)',
        body: 'ωf = ω₀ + α · t\nωf = 3 rad/s + (2 rad/s² · 5 s)\nωf = 3 + 10 = 13 rad/s',
      },
      {
        title: 'b) Desplazamiento angular (Δθ)',
        body: 'Δθ = ω₀ · t + ½ · α · t²\nΔθ = (3 · 5) + ½ · 2 · (5)²\nΔθ = 15 + 25 = 40 rad\n(Equivale a 40 / 2π ≈ 6.37 vueltas completas)',
      },
    ],
    finalAnswer:
      'a) Velocidad angular final: 13.00 rad/s\nb) Desplazamiento angular: 40.00 rad (≈ 6.37 vueltas)',
    assemblyConfig: {
      radiusMeters: 0.8,
      omega0: 3.0,
      alpha: 2.0,
      duration: 5.0,
      label: 'Disco MCUV (α = 2 rad/s²)',
    },
  },

  {
    id: 'mcuv_p12_rueda_04m_reposo_3rads2_6s',
    number: 12,
    title: 'Rueda de 0.4 m desde el reposo con α = 3 rad/s² (t = 6 s)',
    topic: 'Velocidad angular y rapidez tangencial en el borde',
    source: 'Problema 12 • Kinal 5to',
    statement:
      'Una rueda tiene un radio de 0.4 m y comienza a girar desde el reposo con una aceleración angular de 3 rad/s².\na) ¿Cuál es la velocidad angular después de 6 segundos?\nb) ¿Qué velocidad tangencial alcanzará un punto en el borde de la rueda después de esos 6 segundos?',
    params: { r: 0.4, omega0: 0.0, alpha: 3.0, t: 6.0 },
    steps: [
      {
        title: 'Datos Iniciales',
        body: 'Radio: r = 0.4 m\nParte del reposo: ω₀ = 0 rad/s\nAceleración angular: α = 3 rad/s²\nTiempo: t = 6 s',
      },
      {
        title: 'a) Velocidad angular a los 6 s (ωf)',
        body: 'ωf = ω₀ + α · t\nωf = 0 + (3 rad/s² · 6 s) = 18 rad/s',
      },
      {
        title: 'b) Rapidez tangencial en el borde (vt)',
        body: 'vt = ωf · r\nvt = 18 rad/s · 0.4 m = 7.20 m/s',
      },
    ],
    finalAnswer:
      'a) Velocidad angular: 18.00 rad/s\nb) Rapidez tangencial en el borde: 7.20 m/s',
    assemblyConfig: {
      radiusMeters: 0.4,
      omega0: 0.0,
      alpha: 3.0,
      duration: 6.0,
      label: 'Rueda r = 0.4 m (α = 3 rad/s²)',
    },
  },

  {
    id: 'mcuv_p13_motor_10_a_40rads_8s',
    number: 13,
    title: 'Motor que acelera de 10 rad/s a 40 rad/s en 8 s',
    topic: 'Cálculo de aceleración angular y vueltas giradas',
    source: 'Problema 13 • Kinal 5to',
    statement:
      'Un motor aumenta su velocidad angular de 10 rad/s a 40 rad/s en 8 segundos con una aceleración angular constante.\na) ¿Cuál es la aceleración angular?\nb) ¿Cuánto ha girado el motor en esos 8 segundos?',
    params: { omega0: 10.0, omegaf: 40.0, t: 8.0 },
    steps: [
      {
        title: 'Datos del Motor',
        body: 'ω₀ = 10 rad/s,  ωf = 40 rad/s,  t = 8 s',
      },
      {
        title: 'a) Aceleración angular (α)',
        body: 'α = (ωf - ω₀) / t\nα = (40 - 10) / 8 = 30 / 8 = 3.75 rad/s²',
      },
      {
        title: 'b) Desplazamiento angular (Δθ)',
        body: 'Δθ = ((ω₀ + ωf) / 2) · t\nΔθ = ((10 + 40) / 2) · 8 = 25 · 8 = 200 rad\n(Equivale a 200 / 2π ≈ 31.83 revoluciones)',
      },
    ],
    finalAnswer:
      'a) Aceleración angular: 3.75 rad/s²\nb) Giro total: 200.00 rad (≈ 31.83 vueltas)',
    assemblyConfig: {
      radiusMeters: 0.6,
      omega0: 10.0,
      alpha: 3.75,
      duration: 8.0,
      label: 'Rotor de Motor (α = 3.75 rad/s²)',
    },
  },

  {
    id: 'mcuv_p14_objeto_5rads2_2m_4s',
    number: 14,
    title: 'Objeto con α = 5 rad/s² y r = 2 m desde el reposo (t = 4 s)',
    topic: 'Velocidad tangencial y aceleración centrípeta instantánea',
    source: 'Problema 14 • Kinal 5to',
    statement:
      'Un objeto gira con una aceleración angular de 5 rad/s² y un radio de 2 m. Si su velocidad angular inicial es de 0:\na) ¿Cuál es la velocidad tangencial después de 4 segundos?\nb) ¿Qué aceleración centrípeta experimenta el objeto en ese instante?',
    params: { alpha: 5.0, r: 2.0, omega0: 0.0, t: 4.0 },
    steps: [
      {
        title: 'Datos Iniciales',
        body: 'α = 5 rad/s²,  r = 2.0 m,  ω₀ = 0 rad/s,  t = 4 s',
      },
      {
        title: 'a) Velocidad angular y velocidad tangencial',
        body: 'ωf = ω₀ + α · t = 0 + (5 · 4) = 20 rad/s\nvt = ωf · r = 20 rad/s · 2 m = 40.00 m/s',
      },
      {
        title: 'b) Aceleración centrípeta a los 4 s (ac)',
        body: 'ac = vt² / r = (40)² / 2 = 1600 / 2 = 800.00 m/s²\n(O bien: ac = ωf² · r = (20)² · 2 = 400 · 2 = 800 m/s²)',
      },
    ],
    finalAnswer:
      'a) Rapidez tangencial: 40.00 m/s\nb) Aceleración centrípeta: 800.00 m/s²',
    assemblyConfig: {
      radiusMeters: 2.0,
      omega0: 0.0,
      alpha: 5.0,
      duration: 4.0,
      label: 'Partícula en Órbita r = 2 m',
    },
  },

  {
    id: 'mcuv_p15_patin_08rads2_2rads_10s',
    number: 15,
    title: 'Patín de hielo con α = 0.8 rad/s² y ω₀ = 2 rad/s (t = 10 s)',
    topic: 'Giro de patinador, velocidad final y ángulo recorrido',
    source: 'Problema 15 • Kinal 5to',
    statement:
      'Un patín de hielo gira con una aceleración angular de 0.8 rad/s². Si su velocidad angular inicial es 2 rad/s:\na) ¿Cuál será su velocidad angular después de 10 segundos?\nb) ¿Cuál será el desplazamiento angular en esos 10 segundos?',
    params: { alpha: 0.8, omega0: 2.0, t: 10.0 },
    steps: [
      {
        title: 'Datos del Patín',
        body: 'α = 0.8 rad/s²,  ω₀ = 2 rad/s,  t = 10 s',
      },
      {
        title: 'a) Velocidad angular final (ωf)',
        body: 'ωf = ω₀ + α · t\nωf = 2 + (0.8 · 10) = 2 + 8 = 10.00 rad/s',
      },
      {
        title: 'b) Desplazamiento angular (Δθ)',
        body: 'Δθ = ω₀ · t + ½ · α · t²\nΔθ = (2 · 10) + ½ · 0.8 · (10)²\nΔθ = 20 + 40 = 60.00 rad (≈ 9.55 vueltas)',
      },
    ],
    finalAnswer:
      'a) Velocidad angular final: 10.00 rad/s\nb) Desplazamiento angular: 60.00 rad (≈ 9.55 vueltas)',
    assemblyConfig: {
      radiusMeters: 0.5,
      omega0: 2.0,
      alpha: 0.8,
      duration: 10.0,
      label: 'Patín de Hielo (α = 0.8 rad/s²)',
    },
  },

  {
    id: 'mcuv_p16_tren_4_a_16rads_12s',
    number: 16,
    title: 'Tren que aumenta de 4 rad/s a 16 rad/s en 12 s',
    topic: 'Ruedas de tren, aceleración angular y revoluciones',
    source: 'Problema 16 • Kinal 5to',
    statement:
      'Un tren aumenta su velocidad angular de 4 rad/s a 16 rad/s en 12 segundos.\na) ¿Cuál es la aceleración angular del tren?\nb) ¿Cuánto ha girado el tren en esos 12 segundos?',
    params: { omega0: 4.0, omegaf: 16.0, t: 12.0 },
    steps: [
      {
        title: 'Parámetros del Tren',
        body: 'ω₀ = 4 rad/s,  ωf = 16 rad/s,  t = 12 s',
      },
      {
        title: 'a) Aceleración angular (α)',
        body: 'α = (ωf - ω₀) / t\nα = (16 - 4) / 12 = 12 / 12 = 1.00 rad/s²',
      },
      {
        title: 'b) Ángulo girado (Δθ)',
        body: 'Δθ = ((ω₀ + ωf) / 2) · t\nΔθ = ((4 + 16) / 2) · 12 = 10 · 12 = 120.00 rad (≈ 19.10 vueltas)',
      },
    ],
    finalAnswer:
      'a) Aceleración angular: 1.00 rad/s²\nb) Desplazamiento angular: 120.00 rad (≈ 19.10 vueltas)',
    assemblyConfig: {
      radiusMeters: 0.6,
      omega0: 4.0,
      alpha: 1.0,
      duration: 12.0,
      label: 'Rueda de Tren (α = 1 rad/s²)',
    },
  },

  {
    id: 'mcuv_p17_rueda_05m_reposo_15rads2_4s',
    number: 17,
    title: 'Rueda r = 0.5 m desde reposo con α = 1.5 rad/s² (t = 4 s)',
    topic: 'Velocidad lineal y aceleración centrípeta',
    source: 'Problema 17 • Kinal 5to',
    statement:
      'Una rueda tiene un radio de 0.5 m y comienza a girar con una aceleración angular constante de 1.5 rad/s².\na) ¿Cuál es la velocidad tangencial de un punto en el borde de la rueda después de 4 segundos?\nb) ¿Qué aceleración centrípeta experimenta ese punto después de 4 segundos?',
    params: { r: 0.5, omega0: 0.0, alpha: 1.5, t: 4.0 },
    steps: [
      {
        title: 'Datos Iniciales',
        body: 'r = 0.5 m,  ω₀ = 0 rad/s,  α = 1.5 rad/s²,  t = 4 s',
      },
      {
        title: 'a) Velocidad tangencial en el borde (vt)',
        body: 'ωf = ω₀ + α · t = 0 + (1.5 · 4) = 6.00 rad/s\nvt = ωf · r = 6 · 0.5 = 3.00 m/s',
      },
      {
        title: 'b) Aceleración centrípeta a los 4 s (ac)',
        body: 'ac = ωf² · r = (6)² · 0.5 = 36 · 0.5 = 18.00 m/s²\n(Aceleración tangencial constante: at = α·r = 1.5·0.5 = 0.75 m/s²)',
      },
    ],
    finalAnswer:
      'a) Rapidez tangencial: 3.00 m/s\nb) Aceleración centrípeta: 18.00 m/s²',
    assemblyConfig: {
      radiusMeters: 0.5,
      omega0: 0.0,
      alpha: 1.5,
      duration: 4.0,
      label: 'Rueda r = 0.5 m (α = 1.5 rad/s²)',
    },
  },

  {
    id: 'mcuv_p18_objeto_25rads2_3m_6s',
    number: 18,
    title: 'Objeto con α = 2.5 rad/s² y r = 3 m desde reposo (t = 6 s)',
    topic: 'Velocidad tangencial y aceleración normal',
    source: 'Problema 18 • Kinal 5to',
    statement:
      'Un objeto tiene una aceleración angular constante de 2.5 rad/s² y un radio de 3 m.\na) Si comienza desde el reposo, ¿qué velocidad tangencial alcanzará después de 6 segundos?\nb) ¿Cuál es la aceleración centrípeta en ese instante?',
    params: { alpha: 2.5, r: 3.0, omega0: 0.0, t: 6.0 },
    steps: [
      {
        title: 'Datos del Giro',
        body: 'α = 2.5 rad/s²,  r = 3.0 m,  ω₀ = 0,  t = 6 s',
      },
      {
        title: 'a) Velocidad tangencial alcanzada',
        body: 'ωf = α · t = 2.5 · 6 = 15.00 rad/s\nvt = ωf · r = 15 · 3 = 45.00 m/s',
      },
      {
        title: 'b) Aceleración centrípeta (ac)',
        body: 'ac = ωf² · r = (15)² · 3 = 225 · 3 = 675.00 m/s²',
      },
    ],
    finalAnswer:
      'a) Velocidad tangencial: 45.00 m/s\nb) Aceleración centrípeta: 675.00 m/s²',
    assemblyConfig: {
      radiusMeters: 3.0,
      omega0: 0.0,
      alpha: 2.5,
      duration: 6.0,
      label: 'Objeto r = 3 m (α = 2.5 rad/s²)',
    },
  },

  {
    id: 'mcuv_p19_rueda_4rads2_10s_reposo',
    number: 19,
    title: 'Rueda con α = 4 rad/s² durante 10 s desde reposo',
    topic: 'Velocidad angular final y distancia angular',
    source: 'Problema 19 • Kinal 5to',
    statement:
      'Una rueda gira con una aceleración angular de 4 rad/s² durante 10 segundos, comenzando desde el reposo.\na) ¿Cuál es la velocidad angular final?\nb) ¿Qué distancia angular ha recorrido la rueda en esos 10 segundos?',
    params: { alpha: 4.0, t: 10.0, omega0: 0.0 },
    steps: [
      {
        title: 'Datos Iniciales',
        body: 'α = 4 rad/s²,  t = 10 s,  ω₀ = 0 rad/s',
      },
      {
        title: 'a) Velocidad angular final (ωf)',
        body: 'ωf = ω₀ + α · t = 0 + (4 · 10) = 40.00 rad/s',
      },
      {
        title: 'b) Distancia angular recorrida (Δθ)',
        body: 'Δθ = ½ · α · t² = ½ · 4 · (10)² = 2 · 100 = 200.00 rad (≈ 31.83 vueltas)',
      },
    ],
    finalAnswer:
      'a) Velocidad angular final: 40.00 rad/s\nb) Distancia angular: 200.00 rad (≈ 31.83 vueltas)',
    assemblyConfig: {
      radiusMeters: 0.8,
      omega0: 0.0,
      alpha: 4.0,
      duration: 10.0,
      label: 'Rueda Acelerada (α = 4 rad/s²)',
    },
  },

  {
    id: 'mcuv_p20_ciclista_2_a_8rads_6s',
    number: 20,
    title: 'Ciclista que aumenta de 2 rad/s a 8 rad/s en 6 s',
    topic: 'Aceleración angular y distancia angular del ciclista',
    source: 'Problema 20 • Kinal 5to',
    statement:
      'Un ciclista aumenta su velocidad angular de 2 rad/s a 8 rad/s en 6 segundos.\na) ¿Cuál es la aceleración angular?\nb) ¿Qué distancia angular ha recorrido el ciclista durante este tiempo?',
    params: { omega0: 2.0, omegaf: 8.0, t: 6.0 },
    steps: [
      {
        title: 'Datos del Ciclista',
        body: 'ω₀ = 2 rad/s,  ωf = 8 rad/s,  t = 6 s',
      },
      {
        title: 'a) Aceleración angular (α)',
        body: 'α = (ωf - ω₀) / t = (8 - 2) / 6 = 6 / 6 = 1.00 rad/s²',
      },
      {
        title: 'b) Distancia angular recorrida (Δθ)',
        body: 'Δθ = ((ω₀ + ωf) / 2) · t = ((2 + 8) / 2) · 6 = 5 · 6 = 30.00 rad (≈ 4.77 vueltas)',
      },
    ],
    finalAnswer:
      'a) Aceleración angular: 1.00 rad/s²\nb) Distancia angular: 30.00 rad (≈ 4.77 vueltas)',
    assemblyConfig: {
      radiusMeters: 0.35,
      omega0: 2.0,
      alpha: 1.0,
      duration: 6.0,
      label: 'Rueda de Ciclista (α = 1 rad/s²)',
    },
  },

  {
    id: 'mcuv_p21_disco_3rads2_07m_5rads_3s',
    number: 21,
    title: 'Disco con α = 3 rad/s² y r = 0.7 m (ω₀ = 5 rad/s, t = 3 s)',
    topic: 'Rapidez tangencial y aceleración centrípeta',
    source: 'Problema 21 • Kinal 5to',
    statement:
      'Un disco tiene una aceleración angular constante de 3 rad/s² y un radio de 0.7 m. Si su velocidad angular inicial es de 5 rad/s:\na) ¿Cuál es la velocidad tangencial después de 3 segundos?\nb) ¿Qué aceleración centrípeta experimenta el borde del disco?',
    params: { alpha: 3.0, r: 0.7, omega0: 5.0, t: 3.0 },
    steps: [
      {
        title: 'Datos del Disco',
        body: 'α = 3 rad/s²,  r = 0.7 m,  ω₀ = 5 rad/s,  t = 3 s',
      },
      {
        title: 'a) Velocidad tangencial a los 3 s (vt)',
        body: 'ωf = ω₀ + α · t = 5 + (3 · 3) = 14.00 rad/s\nvt = ωf · r = 14 · 0.7 = 9.80 m/s',
      },
      {
        title: 'b) Aceleración centrípeta en el borde (ac)',
        body: 'ac = ωf² · r = (14)² · 0.7 = 196 · 0.7 = 137.20 m/s²',
      },
    ],
    finalAnswer:
      'a) Rapidez tangencial: 9.80 m/s\nb) Aceleración centrípeta: 137.20 m/s²',
    assemblyConfig: {
      radiusMeters: 0.7,
      omega0: 5.0,
      alpha: 3.0,
      duration: 3.0,
      label: 'Disco r = 0.7 m (α = 3 rad/s²)',
    },
  },

  {
    id: 'mcuv_p22_satelite_104km_01_a_04rads_50s',
    number: 22,
    title: 'Satélite en órbita r = 104 km que acelera de 0.1 a 0.4 rad/s en 50 s',
    topic: 'Órbita espacial acelerada y desplazamiento angular',
    source: 'Problema 22 • Kinal 5to',
    statement:
      'Un satélite en órbita tiene un radio de 104 km y aumenta su velocidad angular de 0.1 rad/s a 0.4 rad/s en 50 segundos.\na) ¿Cuál es la aceleración angular del satélite?\nb) ¿Cuánto ha girado el satélite en esos 50 segundos?',
    params: { rKm: 104, rM: 104000, omega0: 0.1, omegaf: 0.4, t: 50.0 },
    steps: [
      {
        title: 'Datos del Satélite',
        body: 'r = 104 km = 104,000 m\nω₀ = 0.1 rad/s,  ωf = 0.4 rad/s,  t = 50 s',
      },
      {
        title: 'a) Aceleración angular (α)',
        body: 'α = (ωf - ω₀) / t = (0.4 - 0.1) / 50 = 0.3 / 50 = 0.006 rad/s² (6 × 10⁻³ rad/s²)',
      },
      {
        title: 'b) Ángulo girado en 50 s (Δθ)',
        body: 'Δθ = ((ω₀ + ωf) / 2) · t = ((0.1 + 0.4) / 2) · 50 = 0.25 · 50 = 12.50 rad (≈ 1.99 vueltas)',
      },
    ],
    finalAnswer:
      'a) Aceleración angular: 0.006 rad/s² (6.00 × 10⁻³ rad/s²)\nb) Ángulo girado: 12.50 rad (≈ 1.99 vueltas)',
    assemblyConfig: {
      radiusMeters: 104000,
      omega0: 0.1,
      alpha: 0.006,
      duration: 50.0,
      label: 'Satélite en Órbita (r = 104 km)',
    },
  },

  {
    id: 'mcuv_p23_objeto_4m_05rads2_2rads_6s',
    number: 23,
    title: 'Objeto con r = 4 m y α = 0.5 rad/s² (ω₀ = 2 rad/s, t = 6 s)',
    topic: 'Velocidad angular final y desplazamiento angular',
    source: 'Problema 23 • Kinal 5to',
    statement:
      'Un objeto en movimiento circular tiene un radio de 4 m y comienza a girar con una aceleración angular de 0.5 rad/s². Si su velocidad angular inicial es de 2 rad/s:\na) ¿Qué velocidad angular alcanzará después de 6 segundos?\nb) ¿Qué desplazamiento angular tendrá en ese tiempo?',
    params: { r: 4.0, alpha: 0.5, omega0: 2.0, t: 6.0 },
    steps: [
      {
        title: 'Datos del Movimiento',
        body: 'r = 4.0 m,  α = 0.5 rad/s²,  ω₀ = 2.0 rad/s,  t = 6 s',
      },
      {
        title: 'a) Velocidad angular final (ωf)',
        body: 'ωf = ω₀ + α · t = 2 + (0.5 · 6) = 2 + 3 = 5.00 rad/s',
      },
      {
        title: 'b) Desplazamiento angular (Δθ)',
        body: 'Δθ = ω₀ · t + ½ · α · t² = (2 · 6) + ½ · 0.5 · (6)² = 12 + 9 = 21.00 rad (≈ 3.34 vueltas)',
      },
    ],
    finalAnswer:
      'a) Velocidad angular final: 5.00 rad/s\nb) Desplazamiento angular: 21.00 rad (≈ 3.34 vueltas)',
    assemblyConfig: {
      radiusMeters: 4.0,
      omega0: 2.0,
      alpha: 0.5,
      duration: 6.0,
      label: 'Objeto Circular r = 4 m',
    },
  },

  {
    id: 'mcuv_p24_rueda_03m_reposo_2rads2_5s',
    number: 24,
    title: 'Rueda de radio 0.3 m desde reposo con α = 2 rad/s² (t = 5 s)',
    topic: 'Rapidez tangencial y aceleración centrípeta en el borde',
    source: 'Problema 24 • Kinal 5to',
    statement:
      'Una rueda de radio 0.3 m comienza a girar desde el reposo con una aceleración angular de 2 rad/s².\na) ¿Qué velocidad tangencial alcanzará después de 5 segundos?\nb) ¿Qué aceleración centrípeta experimentará el borde de la rueda en ese momento?',
    params: { r: 0.3, omega0: 0.0, alpha: 2.0, t: 5.0 },
    steps: [
      {
        title: 'Datos de la Rueda',
        body: 'r = 0.3 m,  ω₀ = 0 rad/s,  α = 2 rad/s²,  t = 5 s',
      },
      {
        title: 'a) Velocidad tangencial después de 5 s (vt)',
        body: 'ωf = ω₀ + α · t = 0 + (2 · 5) = 10.00 rad/s\nvt = ωf · r = 10 · 0.3 = 3.00 m/s',
      },
      {
        title: 'b) Aceleración centrípeta en ese instante (ac)',
        body: 'ac = ωf² · r = (10)² · 0.3 = 100 · 0.3 = 30.00 m/s²\n(Aceleración tangencial constante: at = α·r = 2·0.3 = 0.60 m/s²)',
      },
    ],
    finalAnswer:
      'a) Rapidez tangencial: 3.00 m/s\nb) Aceleración centrípeta: 30.00 m/s²',
    assemblyConfig: {
      radiusMeters: 0.3,
      omega0: 0.0,
      alpha: 2.0,
      duration: 5.0,
      label: 'Rueda r = 0.3 m (α = 2 rad/s²)',
    },
  },

  {
    id: 'mcuv_p25_reloj_15_a_3rads_10s',
    number: 25,
    title: 'Reloj que aumenta de 1.5 rad/s a 3 rad/s en 10 s',
    topic: 'Aceleración angular y distancia angular de la manecilla',
    source: 'Problema 25 • Kinal 5to',
    statement:
      'Un reloj de pulsera aumenta su velocidad angular de 1.5 rad/s a 3 rad/s en 10 segundos.\na) ¿Cuál es la aceleración angular?\nb) ¿Qué distancia angular ha recorrido la manecilla en esos 10 segundos?',
    params: { omega0: 1.5, omegaf: 3.0, t: 10.0 },
    steps: [
      {
        title: 'Datos del Reloj',
        body: 'ω₀ = 1.5 rad/s,  ωf = 3.0 rad/s,  t = 10 s',
      },
      {
        title: 'a) Aceleración angular (α)',
        body: 'α = (ωf - ω₀) / t = (3 - 1.5) / 10 = 1.5 / 10 = 0.15 rad/s²',
      },
      {
        title: 'b) Distancia angular recorrida (Δθ)',
        body: 'Δθ = ((ω₀ + ωf) / 2) · t = ((1.5 + 3) / 2) · 10 = 2.25 · 10 = 22.50 rad (≈ 3.58 vueltas)',
      },
    ],
    finalAnswer:
      'a) Aceleración angular: 0.15 rad/s²\nb) Distancia angular: 22.50 rad (≈ 3.58 vueltas)',
    assemblyConfig: {
      radiusMeters: 0.2,
      omega0: 1.5,
      alpha: 0.15,
      duration: 10.0,
      label: 'Manecilla de Reloj (α = 0.15 rad/s²)',
    },
  },
];

/**
 * Calculadora interactiva universal para MCUV / MCUA
 */
export function solveCustomMcuv({
  radiusM = 1.0,
  omega0RadS = 0.0,
  alphaRadS2 = 2.0,
  timeS = 5.0,
}) {
  const r = Math.max(0.001, parseFloat(radiusM) || 1.0);
  const w0 = parseFloat(omega0RadS) || 0.0;
  const a = parseFloat(alphaRadS2) || 0.0;
  const t = Math.max(0.0, parseFloat(timeS) || 0.0);

  const wf = w0 + a * t;
  const deltaTheta = w0 * t + 0.5 * a * t * t;
  const revs = deltaTheta / (2 * Math.PI);
  const vt = Math.abs(wf) * r;
  const at = Math.abs(a) * r;
  const ac = wf * wf * r;
  const aTotal = Math.sqrt(at * at + ac * ac);
  const rpm = (Math.abs(wf) * 60) / (2 * Math.PI);

  return {
    radiusM: r,
    omega0RadS: w0,
    alphaRadS2: a,
    timeS: t,
    omegaFinalRadS: wf,
    deltaThetaRad: deltaTheta,
    revolutions: revs,
    tangentialVelocity: vt,
    tangentialAccel: at,
    centripetalAccel: ac,
    totalAccel: aTotal,
    rpmFinal: rpm,
  };
}

/**
 * Genera el conjunto completo de elementos didácticos y físicos para montar el problema de MCUV en la pizarra.
 */
export function buildMcuvExerciseBoardElements(exercise, startX = 120, startY = 120) {
  const elements = [];

  // 1. Título General
  elements.push({
    id: `hdr_mcuv_${Date.now()}`,
    type: 'text',
    x: startX,
    y: startY,
    text: `MOVIMIENTO CIRCULAR ACELERADO (MCUV) • ${exercise.title.toUpperCase()}`,
    fontSize: 22,
    color: '#0f172a',
    fontWeight: 'bold',
  });

  // 2. Nota Adhesiva de Enunciado
  elements.push({
    id: `stmt_mcuv_${Date.now()}`,
    type: 'sticky',
    x: startX,
    y: startY + 36,
    width: 290,
    height: 190,
    text: `📝 ENUNCIADO (Kinal):\n${exercise.statement}`,
    color: '#fff9b1',
  });

  // 3. Fichas de Procedimiento Paso a Paso
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
      id: `step_mcuv_${idx}_${Date.now()}`,
      type: 'sticky',
      x: cardX,
      y: cardY,
      width: cardW,
      height: cardH,
      text: `${step.title}\n\n${step.body}`,
      color: cardColor,
    });
  });

  // 4. Caja de Resultados y Conclusiones
  const totalCards = exercise.steps.length + 1;
  const totalRows = Math.ceil(totalCards / 3);
  const answerY = startY + 36 + totalRows * (cardH + 15) - 10;

  elements.push({
    id: `ans_mcuv_${Date.now()}`,
    type: 'sticky',
    x: startX,
    y: answerY,
    width: 590,
    height: 95,
    text: `🎯 RESULTADOS Y CONCLUSIÓN (MCUV):\n${exercise.finalAnswer}`,
    color: '#d3f8df',
  });

  // 5. Ensamblaje Físico de Laboratorio MCUV
  const cfg = exercise.assemblyConfig || {};
  const radiusMeters = cfg.radiusMeters || 1.0;
  const omega0 = cfg.omega0 !== undefined ? cfg.omega0 : 0.0;
  const alpha = cfg.alpha !== undefined ? cfg.alpha : 2.0;

  // Centro geométrico del rotor en el lienzo
  const rotorCenterX = startX + 750;
  const rotorCenterY = startY + 180;
  const visualRadiusPx = 110; // Radio visual armonizado en píxeles

  // Plataforma / Rotor Central MCUV
  const turntable = createPhysicsElement('mcuv_turntable', rotorCenterX - visualRadiusPx, rotorCenterY - visualRadiusPx, {
    label: `${cfg.label || 'Rotor MCUV'} (r = ${radiusMeters}m, α = ${alpha} rad/s²)`,
    width: visualRadiusPx * 2,
    height: visualRadiusPx * 2,
    radiusMeters,
    radiusPx: visualRadiusPx,
    omega0,
    omega: omega0,
    alpha,
    direction: alpha >= 0 ? 'ccw' : 'cw',
    color: '#0891b2',
  });

  // Partícula o masa que orbita con aceleración angular y vectores v_t, a_t, a_c
  const particleSize = 28;
  const particle = createPhysicsElement('mcuv_particle', rotorCenterX + visualRadiusPx - particleSize / 2, rotorCenterY - particleSize / 2, {
    label: `Masa en MCUV (α = ${alpha} rad/s²)`,
    width: particleSize,
    height: particleSize,
    centerX: rotorCenterX,
    centerY: rotorCenterY,
    radiusMeters,
    radiusPx: visualRadiusPx,
    omega0,
    omega: omega0,
    alpha,
    angleRad: 0.0,
    color: '#06b6d4',
    showTangentialVector: true,
    showCentripetalVector: true,
    showTangentialAccelVector: true,
    showTotalAccelVector: true,
    showOrbit: true,
    showRadiusLine: true,
  });

  // Sensor Óptico de Vueltas / Fotopuerta angular ubicada a 0°
  const gateW = 46;
  const gateH = 40;
  const photogate = createPhysicsElement('mru_photogate', rotorCenterX + visualRadiusPx - gateW / 2, rotorCenterY - gateH / 2, {
    label: 'Sensor de Vueltas (MCUV)',
    gateName: 'Contador MCUV',
  });

  elements.push(turntable, particle, photogate);

  return elements;
}
