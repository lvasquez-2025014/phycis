// =========================================================================
// MOVIMIENTO CIRCULAR UNIFORME (MCU) - SOLUCIONADOR Y DATASET COMPLETO
// Basado en el documento oficial: "Unidad 2 - Física II - Quinto - HT03: Movimiento Circular Uniforme MCU"
// Colegio Kinal - Diversificado
// =========================================================================

import { createPhysicsElement } from '../physics/physicsRegistry';

/**
 * 9 Preguntas Conceptuales oficiales de la Hoja de Trabajo HT03 (Forma 1)
 */
export const MCU_THEORY_QUESTIONS = [
  {
    id: 'ht03_q1',
    number: 1,
    question: 'En el Movimiento Circular Uniforme, la rapidez lineal del objeto se caracteriza por ser:',
    options: [
      'Variable durante todo el movimiento.',
      'Constante en magnitud.',
      'Igual a cero en algunos puntos.',
      'Dependiente únicamente de la masa.',
    ],
    correctIndex: 1,
    explanation:
      'En el MCU, el valor numérico (módulo o magnitud) de la rapidez tangencial es constante: v = cte. Lo que cambia en cada instante es únicamente la dirección del vector velocidad.',
  },
  {
    id: 'ht03_q2',
    number: 2,
    question: 'En el MCU, aunque la rapidez es constante, la velocidad cambia porque:',
    options: [
      'La masa del objeto disminuye.',
      'El radio cambia continuamente.',
      'Cambia su dirección en cada punto de la trayectoria.',
      'La aceleración desaparece.',
    ],
    correctIndex: 2,
    explanation:
      'La velocidad es una magnitud vectorial. Dado que el objeto describe una curva cerrada, el vector velocidad v⃗ es siempre tangente a la trayectoria y su dirección rota continuamente, existiendo por tanto aceleración.',
  },
  {
    id: 'ht03_q3',
    number: 3,
    question: 'La aceleración presente en el Movimiento Circular Uniforme está dirigida hacia:',
    options: [
      'El centro de la trayectoria.',
      'La dirección del movimiento.',
      'La distancia recorrida en una revolución.',
      'La rapidez angular del objeto.',
    ],
    correctIndex: 0,
    explanation:
      'En el MCU solo existe aceleración centrípeta (o normal), la cual es perpendicular a la velocidad en todo instante y apunta radialmente hacia el centro de giro: a⃗_c = (v²/r)(-r̂).',
  },
  {
    id: 'ht03_q4',
    number: 4,
    question: 'La frecuencia en un movimiento circular indica:',
    options: [
      'El número de vueltas por unidad de tiempo.',
      'El radio de la trayectoria.',
      'La fuerza que mantiene el movimiento.',
      'La longitud de la circunferencia.',
    ],
    correctIndex: 0,
    explanation:
      'Por definición física, la frecuencia f = 1/T representa la cantidad de ciclos, revoluciones o vueltas completadas por segundo (Hertz, s⁻¹) o por minuto (rpm).',
  },
  {
    id: 'ht03_q5',
    number: 5,
    question: 'Si un objeto gira más rápido en la misma trayectoria circular, entonces su frecuencia:',
    options: [
      'Disminuye.',
      'Permanece igual.',
      'Aumenta.',
      'Se vuelve cero.',
    ],
    correctIndex: 2,
    explanation:
      'Al girar con mayor rapidez angular ω, el período T (tiempo por vuelta) disminuye, y como f = 1/T = ω/(2π), la frecuencia f aumenta en proporción directa.',
  },
  {
    id: 'ht03_q6',
    number: 6,
    question: '¿Cuál de los siguientes ejemplos representa mejor un Movimiento Circular Uniforme?',
    options: [
      'Un automóvil que acelera en línea recta.',
      'Una pelota que cae libremente.',
      'Las aspas de un ventilador girando a velocidad constante.',
      'Un objeto lanzado verticalmente.',
    ],
    correctIndex: 2,
    explanation:
      'Las aspas de un ventilador en régimen estable giran con velocidad angular ω rigurosamente constante en torno a un eje fijo, describiendo circunferencias perfectas a rapidez constante.',
  },
  {
    id: 'ht03_q7',
    number: 7,
    question: 'En un MCU, la aceleración centrípeta existe aunque la rapidez permanezca constante porque:',
    options: [
      'La masa del objeto cambia constantemente.',
      'La dirección del vector velocidad cambia continuamente.',
      'El objeto pierde energía durante el movimiento.',
      'El radio disminuye con el tiempo.',
    ],
    correctIndex: 1,
    explanation:
      'La aceleración mide la tasa de cambio del vector velocidad respecto al tiempo (a⃗ = dv⃗/dt). Aunque |v⃗| no varíe, el giro continuo del vector produce una derivada no nula dirigida al centro.',
  },
  {
    id: 'ht03_q8',
    number: 8,
    question: 'Dos partículas describen trayectorias circulares con el mismo período, pero radios diferentes. Se puede afirmar que ambas partículas tienen la misma:',
    options: [
      'Velocidad tangencial.',
      'Aceleración centrípeta.',
      'Velocidad angular.',
      'Distancia recorrida.',
    ],
    correctIndex: 2,
    explanation:
      'La velocidad angular depende exclusivamente del período: ω = 2π / T. Si ambas partículas tienen el mismo período T, sus velocidades angulares ω son idénticas, aunque sus velocidades lineales (v = ω·r) y aceleraciones (a_c = ω²·r) sean distintas.',
  },
  {
    id: 'ht03_q9',
    number: 9,
    question: 'Si dos objetos giran con la misma velocidad angular, pero uno tiene un radio mayor, entonces el objeto con mayor radio tendrá:',
    options: [
      'Menor velocidad tangencial.',
      'La misma aceleración.',
      'Mayor velocidad tangencial.',
      'Menor período.',
    ],
    correctIndex: 2,
    explanation:
      'La relación lineal es v = ω·r. Manteniendo constante la velocidad angular ω, la rapidez tangencial es directamente proporcional al radio r. A mayor radio, mayor distancia recorrida por segundo.',
  },
];

/**
 * 10 Problemas de Aplicación oficiales de la Hoja de Trabajo HT03 (Forma 2)
 */
export const MCU_EXERCISES = [
  {
    id: 'ht03_p1_bici_35cm_18rads',
    number: 1,
    title: 'Rueda de bicicleta de 35 cm de radio a 18 rad/s',
    topic: 'Velocidad tangencial, período y revoluciones',
    source: 'Problema 1 • HT03 MCU Kinal',
    statement:
      'Una rueda de bicicleta de 35 cm de radio gira con una velocidad angular de 18 rad/s. Calcula:\na) La velocidad tangencial de un punto en el borde.\nb) El período de rotación.\nc) El número de vueltas que da en 3 minutos.',
    params: { rCm: 35, rM: 0.35, omega: 18.0, tMin: 3, tSec: 180 },
    steps: [
      {
        title: 'Conversión y Parámetros Iniciales',
        body: 'Radio: r = 35 cm = 0.35 m\nVelocidad angular: ω = 18 rad/s\nTiempo: t = 3 min = 3 × 60 s = 180 s',
      },
      {
        title: 'a) Velocidad tangencial en el borde',
        body: 'v = ω · r\nv = 18 rad/s · 0.35 m = 6.30 m/s',
      },
      {
        title: 'b) Período de rotación',
        body: 'T = 2π / ω\nT = 2π / 18 rad/s = π / 9 ≈ 0.349 s ≈ 0.35 s',
      },
      {
        title: 'c) Número de vueltas en 3 minutos',
        body: 'Frecuencia: f = 1 / T = 18 / (2π) ≈ 2.865 vueltas/s\nN = f · t = (18 / (2π)) · 180 s = 3240 / (2π) ≈ 515.66 vueltas',
      },
    ],
    finalAnswer:
      'a) Velocidad tangencial: 6.30 m/s\nb) Período de rotación: 0.35 s (0.349 s)\nc) Número de vueltas en 3 min: 515.66 vueltas',
    assemblyConfig: {
      radiusMeters: 0.35,
      omegaRadS: 18.0,
      scalePxPerMeter: 180,
      label: 'Rueda de Bicicleta (r = 35 cm)',
    },
  },

  {
    id: 'ht03_p2_satelite_orbita_100min',
    number: 2,
    title: 'Satélite en órbita circular (r = 7.2 × 10⁶ m, T = 100 min)',
    topic: 'Velocidad angular, rapidez lineal y aceleración centrípeta',
    source: 'Problema 2 • HT03 MCU Kinal',
    statement:
      'Un satélite describe una órbita circular de radio 7.2 × 10⁶ m y tarda 100 minutos en completar una vuelta. Determine:\na) La velocidad angular.\nb) La rapidez lineal del satélite.\nc) La aceleración centrípeta.',
    params: { rM: 7.2e6, tMin: 100, tSec: 6000 },
    steps: [
      {
        title: 'Conversión de Tiempo a Segundos',
        body: 'T = 100 min = 100 × 60 s = 6000 s\nRadio orbital: r = 7.2 × 10⁶ m = 7,200,000 m',
      },
      {
        title: 'a) Velocidad angular (ω)',
        body: 'ω = 2π / T\nω = 2π / 6000 s = π / 3000 ≈ 1.047 × 10⁻³ rad/s = 0.00105 rad/s',
      },
      {
        title: 'b) Rapidez lineal del satélite (v)',
        body: 'v = ω · r\nv = (1.0472 × 10⁻³ rad/s) · (7.2 × 10⁶ m) ≈ 7539.82 m/s ≈ 7.54 × 10³ m/s',
      },
      {
        title: 'c) Aceleración centrípeta (ac)',
        body: 'ac = v² / r = ω² · r\nac = (7539.82 m/s)² / (7.2 × 10⁶ m) ≈ 7.90 m/s²',
      },
    ],
    finalAnswer:
      'a) Velocidad angular: 1.05 × 10⁻³ rad/s (0.00105 rad/s)\nb) Rapidez lineal: 7539.82 m/s (7.54 × 10³ m/s)\nc) Aceleración centrípeta: 7.90 m/s²',
    assemblyConfig: {
      radiusMeters: 7.2e6,
      omegaRadS: 0.001047,
      scalePxPerMeter: 0.000015,
      label: 'Satélite en Órbita Terrestre',
    },
  },

  {
    id: 'ht03_p3_juego_mecanico_8m_12s',
    number: 3,
    title: 'Juego mecánico de radio 8 m y vuelta cada 12 s',
    topic: 'Atracción mecánica, rapidez tangencial y aceleración normal',
    source: 'Problema 3 • HT03 MCU Kinal',
    statement:
      'Un juego mecánico gira con radio de 8 m y realiza una vuelta cada 12 s. Calcula:\na) La velocidad angular.\nb) La velocidad tangencial.\nc) La aceleración centrípeta.',
    params: { rM: 8.0, periodS: 12.0 },
    steps: [
      {
        title: 'Parámetros del Movimiento',
        body: 'Radio de la trayectoria: r = 8.0 m\nPeríodo (tiempo por vuelta): T = 12.0 s',
      },
      {
        title: 'a) Velocidad angular (ω)',
        body: 'ω = 2π / T\nω = 2π / 12 s = π / 6 ≈ 0.524 rad/s ≈ 0.52 rad/s',
      },
      {
        title: 'b) Velocidad tangencial (v)',
        body: 'v = ω · r\nv = 0.5236 rad/s · 8.0 m ≈ 4.19 m/s',
      },
      {
        title: 'c) Aceleración centrípeta (ac)',
        body: 'ac = v² / r = ω² · r\nac = (4.1888 m/s)² / 8.0 m ≈ 2.19 m/s²',
      },
    ],
    finalAnswer:
      'a) Velocidad angular: 0.52 rad/s (0.524 rad/s)\nb) Velocidad tangencial: 4.19 m/s\nc) Aceleración centrípeta: 2.19 m/s²',
    assemblyConfig: {
      radiusMeters: 8.0,
      omegaRadS: 0.524,
      scalePxPerMeter: 12.0,
      label: 'Juego Mecánico Giratorio',
    },
  },

  {
    id: 'ht03_p4_lavadora_1200rpm_25cm',
    number: 4,
    title: 'Lavadora centrífuga a 1200 rpm con tambor de 25 cm',
    topic: 'Conversión de RPM a rad/s, velocidad y aceleración',
    source: 'Problema 4 • HT03 MCU Kinal',
    statement:
      'Una lavadora centrifuga a 1200 rpm con tambor de 25 cm de radio. Determina:\na) La velocidad angular.\nb) La velocidad tangencial de una prenda.\nc) La aceleración centrípeta.',
    params: { rpm: 1200, rCm: 25, rM: 0.25 },
    steps: [
      {
        title: 'Conversión de Unidades',
        body: 'Frecuencia: N = 1200 rpm\nRadio: r = 25 cm = 0.25 m\nFactor: 1 rev = 2π rad, 1 min = 60 s',
      },
      {
        title: 'a) Velocidad angular (ω)',
        body: 'ω = 1200 · (2π rad / 60 s) = 40π rad/s ≈ 125.66 rad/s',
      },
      {
        title: 'b) Velocidad tangencial de la prenda (v)',
        body: 'v = ω · r\nv = 125.664 rad/s · 0.25 m = 10π m/s ≈ 31.42 m/s',
      },
      {
        title: 'c) Aceleración centrípeta (ac)',
        body: 'ac = ω² · r = (125.664 rad/s)² · 0.25 m ≈ 3947.84 m/s²',
      },
    ],
    finalAnswer:
      'a) Velocidad angular: 125.66 rad/s (40π rad/s)\nb) Velocidad tangencial: 31.42 m/s (10π m/s)\nc) Aceleración centrípeta: 3947.84 m/s²',
    assemblyConfig: {
      radiusMeters: 0.25,
      omegaRadS: 125.66,
      scalePxPerMeter: 240,
      label: 'Tambor de Lavadora Centrífuga',
    },
  },

  {
    id: 'ht03_p5_luna_28dias_384e8m',
    number: 5,
    title: 'La Luna orbitando la Tierra (T ≈ 28 días, r = 3.84 × 10⁸ m)',
    topic: 'Mecánica celeste, período orbital y rapidez',
    source: 'Problema 5 • HT03 MCU Kinal',
    statement:
      'La Luna tarda aproximadamente 28 días en dar una vuelta alrededor de la Tierra, a una distancia promedio de 3.84 × 10⁸ m. Determina:\na) La velocidad angular.\nb) La rapidez tangencial.',
    params: { days: 28, rM: 3.84e8, tSec: 28 * 86400 },
    steps: [
      {
        title: 'Conversión de Período a Segundos',
        body: 'T = 28 días × 24 h/día × 3600 s/h = 2,419,200 s\nRadio orbital medio: r = 3.84 × 10⁸ m',
      },
      {
        title: 'a) Velocidad angular (ω)',
        body: 'ω = 2π / T\nω = 2π / 2,419,200 s ≈ 2.597 × 10⁻⁶ rad/s ≈ 2.60 × 10⁻⁶ rad/s (0.0000026 rad/s)',
      },
      {
        title: 'b) Rapidez tangencial (v)',
        body: 'v = ω · r\nv = (2.5972 × 10⁻⁶ rad/s) · (3.84 × 10⁸ m) ≈ 997.27 m/s',
      },
    ],
    finalAnswer:
      'a) Velocidad angular: 2.60 × 10⁻⁶ rad/s (0.0000026 rad/s)\nb) Rapidez tangencial: 997.27 m/s',
    assemblyConfig: {
      radiusMeters: 3.84e8,
      omegaRadS: 2.6e-6,
      scalePxPerMeter: 0.00000025,
      label: 'Órbita Lunar',
    },
  },

  {
    id: 'ht03_p6_plataforma_4rads_dos_objetos',
    number: 6,
    title: 'Plataforma circular a 4 rad/s con dos objetos (0.4 m y 1.2 m)',
    topic: 'Comparación de radios, rapidez lineal y aceleración proporcional',
    source: 'Problema 6 • HT03 MCU Kinal',
    statement:
      'Una plataforma circular gira con velocidad angular constante de 4 rad/s. Sobre ella se encuentran dos objetos: uno a 0.4 m del centro y otro a 1.2 m. Determine para ambos objetos:\na) La velocidad tangencial.\nb) La aceleración centrípeta.\nc) Explica cuál experimenta mayor aceleración y por qué.',
    params: { omega: 4.0, r1: 0.4, r2: 1.2 },
    steps: [
      {
        title: 'Datos de la Plataforma',
        body: 'Velocidad angular común: ω = 4.0 rad/s\nObjeto 1 (interior): r₁ = 0.4 m\nObjeto 2 (exterior): r₂ = 1.2 m',
      },
      {
        title: 'a) Velocidad tangencial de ambos objetos',
        body: 'v₁ = ω · r₁ = 4 rad/s · 0.4 m = 1.60 m/s\nv₂ = ω · r₂ = 4 rad/s · 1.2 m = 4.80 m/s',
      },
      {
        title: 'b) Aceleración centrípeta de ambos objetos',
        body: 'ac₁ = ω² · r₁ = (4)² · 0.4 = 16 · 0.4 = 6.40 m/s²\nac₂ = ω² · r₂ = (4)² · 1.2 = 16 · 1.2 = 19.20 m/s²',
      },
      {
        title: 'c) Justificación física',
        body: 'El objeto 2 experimenta mayor aceleración centrípeta (19.20 m/s² frente a 6.40 m/s²). Dado que ac = ω²·r y ambos comparten el mismo ω, la aceleración centrípeta es directamente proporcional al radio r. Al estar 3 veces más lejos del eje (1.2 / 0.4 = 3), su aceleración es exactamente 3 veces mayor.',
      },
    ],
    finalAnswer:
      'a) Velocidades tangenciales: v₁ = 1.60 m/s, v₂ = 4.80 m/s\nb) Aceleraciones centrípetas: ac₁ = 6.40 m/s², ac₂ = 19.20 m/s²\nc) El objeto a 1.2 m experimenta mayor aceleración por proporcionalidad directa con el radio (ac = ω²·r).',
    assemblyConfig: {
      radiusMeters: 1.2,
      omegaRadS: 4.0,
      scalePxPerMeter: 80.0,
      label: 'Plataforma Giratoria (r = 1.2 m)',
    },
  },

  {
    id: 'ht03_p7_satelite_68e6m_7500ms',
    number: 7,
    title: 'Satélite artificial de radio 6.8 × 10⁶ m y rapidez 7.5 × 10³ m/s',
    topic: 'Velocidad angular, período y órbitas en 24 horas',
    source: 'Problema 7 • HT03 MCU Kinal',
    statement:
      'Un satélite artificial describe una órbita circular alrededor de la Tierra con radio orbital de 6.8 × 10⁶ m y rapidez de 7.5 × 10³ m/s. Calcula:\na) La velocidad angular.\nb) El período orbital.\nc) El número de vueltas en 24 horas.',
    params: { rM: 6.8e6, v: 7500.0, tHours: 24, tSec: 86400 },
    steps: [
      {
        title: 'Datos del Satélite',
        body: 'Radio orbital: r = 6.8 × 10⁶ m\nRapidez tangencial: v = 7.5 × 10³ m/s = 7500 m/s\nTiempo de observación: t = 24 h = 86,400 s',
      },
      {
        title: 'a) Velocidad angular (ω)',
        body: 'ω = v / r\nω = 7500 m/s / (6.8 × 10⁶ m) ≈ 1.103 × 10⁻³ rad/s = 0.00110 rad/s',
      },
      {
        title: 'b) Período orbital (T)',
        body: 'T = 2π / ω = 2π · r / v\nT = (2π · 6.8 × 10⁶ m) / 7500 m/s ≈ 5696.75 s ≈ 94.95 min ≈ 1.58 h',
      },
      {
        title: 'c) Número de vueltas en 24 horas',
        body: 'N = t / T\nN = 86,400 s / 5696.75 s ≈ 15.17 vueltas',
      },
    ],
    finalAnswer:
      'a) Velocidad angular: 1.10 × 10⁻³ rad/s (0.00110 rad/s)\nb) Período orbital: 5696.75 s (94.95 min / 1.58 h)\nc) Vueltas en 24 horas: 15.17 vueltas',
    assemblyConfig: {
      radiusMeters: 6.8e6,
      omegaRadS: 0.001103,
      scalePxPerMeter: 0.000015,
      label: 'Satélite LEO Terrestre',
    },
  },

  {
    id: 'ht03_p8_dos_ruedas_12ms_02m_05m',
    number: 8,
    title: 'Dos ruedas con rapidez tangencial 12 m/s (rA = 0.2 m, rB = 0.5 m)',
    topic: 'Engranajes y ruedas, velocidad angular y RPM comparativas',
    source: 'Problema 8 • HT03 MCU Kinal',
    statement:
      'Dos ruedas giran con igual velocidad tangencial de 12 m/s. La rueda A tiene radio de 0.2 m y la rueda B de 0.5 m. Determina:\na) La velocidad angular de cada rueda.\nb) El período de cada una.\nc) ¿Cuál completa más vueltas por minuto?',
    params: { v: 12.0, rA: 0.2, rB: 0.5 },
    steps: [
      {
        title: 'Parámetros de las Ruedas',
        body: 'Velocidad lineal común: v = 12.0 m/s\nRueda A: rA = 0.2 m\nRueda B: rB = 0.5 m',
      },
      {
        title: 'a) Velocidad angular de cada rueda',
        body: 'ωA = v / rA = 12 / 0.2 = 60.00 rad/s\nωB = v / rB = 12 / 0.5 = 24.00 rad/s',
      },
      {
        title: 'b) Período de rotación de cada rueda',
        body: 'TA = 2π / ωA = 2π / 60 ≈ 0.105 s\nTB = 2π / ωB = 2π / 24 ≈ 0.262 s',
      },
      {
        title: 'c) Comparación de vueltas por minuto (rpm)',
        body: 'rpmA = (60 rad/s · 60 s) / (2π rad) = 3600 / (2π) ≈ 572.96 rpm\nrpmB = (24 rad/s · 60 s) / (2π rad) = 1440 / (2π) ≈ 229.18 rpm\nRespuesta: La rueda A completa más vueltas por minuto (572.96 rpm > 229.18 rpm) debido a que su radio es menor, necesitando girar más veces para igualar la velocidad tangencial.',
      },
    ],
    finalAnswer:
      'a) Velocidades angulares: ωA = 60.00 rad/s, ωB = 24.00 rad/s\nb) Períodos: TA = 0.105 s, TB = 0.262 s\nc) La rueda A completa más vueltas por minuto (572.96 rpm vs 229.18 rpm)',
    assemblyConfig: {
      radiusMeters: 0.5,
      omegaRadS: 24.0,
      scalePxPerMeter: 140.0,
      label: 'Rueda B (r = 0.5 m, 12 m/s)',
    },
  },

  {
    id: 'ht03_p9_centrifuga_3200rpm_18cm',
    number: 9,
    title: 'Centrífuga de laboratorio a 3200 rpm y radio de 18 cm',
    topic: 'Centrifugación clínica, aceleración centrípeta extrema',
    source: 'Problema 9 • HT03 MCU Kinal',
    statement:
      'Una centrífuga gira a 3200 rpm y el radio del recipiente es de 18 cm. Calcula:\na) La velocidad angular.\nb) La rapidez tangencial de la muestra.\nc) La aceleración centrípeta.',
    params: { rpm: 3200, rCm: 18, rM: 0.18 },
    steps: [
      {
        title: 'Datos Iniciales',
        body: 'Frecuencia de giro: 3200 rpm\nRadio del tubo de ensayo: r = 18 cm = 0.18 m',
      },
      {
        title: 'a) Velocidad angular (ω)',
        body: 'ω = 3200 · (2π rad / 60 s) = 320π / 3 ≈ 335.10 rad/s',
      },
      {
        title: 'b) Rapidez tangencial de la muestra (v)',
        body: 'v = ω · r\nv = 335.103 rad/s · 0.18 m ≈ 60.32 m/s',
      },
      {
        title: 'c) Aceleración centrípeta (ac)',
        body: 'ac = ω² · r\nac = (335.103 rad/s)² · 0.18 m ≈ 20212.87 m/s² ≈ 2.02 × 10⁴ m/s²',
      },
    ],
    finalAnswer:
      'a) Velocidad angular: 335.10 rad/s (320π/3 rad/s)\nb) Rapidez tangencial: 60.32 m/s\nc) Aceleración centrípeta: 20212.87 m/s² (2.02 × 10⁴ m/s² ≈ 2060 g)',
    assemblyConfig: {
      radiusMeters: 0.18,
      omegaRadS: 335.10,
      scalePxPerMeter: 360.0,
      label: 'Centrífuga de Laboratorio (3200 RPM)',
    },
  },

  {
    id: 'ht03_p10_planeta_23e11m_687dias',
    number: 10,
    title: 'Planeta en órbita circular (r = 2.3 × 10¹¹ m, T = 687 días)',
    topic: 'Astrofísica planetaria (Marte), velocidad y longitud orbital',
    source: 'Problema 10 • HT03 MCU Kinal',
    statement:
      'Un planeta describe una órbita circular de radio 2.3 × 10¹¹ m y tarda 687 días en completar una revolución. Determina:\na) La velocidad angular.\nb) La rapidez orbital.\nc) La distancia recorrida en una revolución.',
    params: { rM: 2.3e11, days: 687, tSec: 687 * 86400 },
    steps: [
      {
        title: 'Conversión del Año Planetario a Segundos',
        body: 'T = 687 días × 86,400 s/día = 59,356,800 s ≈ 5.94 × 10⁷ s\nRadio de órbita: r = 2.3 × 10¹¹ m',
      },
      {
        title: 'a) Velocidad angular (ω)',
        body: 'ω = 2π / T\nω = 2π / 59,356,800 s ≈ 1.059 × 10⁻⁷ rad/s = 1.06 × 10⁻⁷ rad/s',
      },
      {
        title: 'b) Rapidez orbital (v)',
        body: 'v = ω · r\nv = (1.05855 × 10⁻⁷ rad/s) · (2.3 × 10¹¹ m) ≈ 24346.59 m/s ≈ 24.35 km/s',
      },
      {
        title: 'c) Distancia recorrida en una revolución (Circunferencia)',
        body: 'C = 2π · r\nC = 2π · (2.3 × 10¹¹ m) ≈ 1.445 × 10¹² m ≈ 1.45 × 10¹² m (1.45 billones de metros)',
      },
    ],
    finalAnswer:
      'a) Velocidad angular: 1.06 × 10⁻⁷ rad/s\nb) Rapidez orbital: 24346.59 m/s (24.35 km/s)\nc) Distancia en una revolución: 1.45 × 10¹² m (1.445 × 10¹² m)',
    assemblyConfig: {
      radiusMeters: 2.3e11,
      omegaRadS: 1.059e-7,
      scalePxPerMeter: 0.00000000045,
      label: 'Órbita Planetaria',
    },
  },
];

/**
 * Calculadora interactiva universal para cualquier configuración de MCU
 */
export function solveCustomMcu({
  radiusM = 1.0,
  omegaRadS = 2.0,
  rpm = null,
  periodS = null,
  frequencyHz = null,
  tangentialVelocity = null,
}) {
  const r = Math.max(0.001, parseFloat(radiusM) || 1.0);
  let omega = 0.0;

  if (tangentialVelocity !== null && !isNaN(parseFloat(tangentialVelocity))) {
    omega = parseFloat(tangentialVelocity) / r;
  } else if (rpm !== null && !isNaN(parseFloat(rpm))) {
    omega = (parseFloat(rpm) * 2 * Math.PI) / 60;
  } else if (periodS !== null && parseFloat(periodS) > 0) {
    omega = (2 * Math.PI) / parseFloat(periodS);
  } else if (frequencyHz !== null && parseFloat(frequencyHz) > 0) {
    omega = 2 * Math.PI * parseFloat(frequencyHz);
  } else {
    omega = parseFloat(omegaRadS) || 2.0;
  }

  const absOmega = Math.abs(omega);
  const vt = absOmega * r;
  const ac = absOmega * absOmega * r;
  const T = absOmega > 0 ? (2 * Math.PI) / absOmega : Infinity;
  const f = absOmega > 0 ? absOmega / (2 * Math.PI) : 0;
  const calculatedRpm = f * 60;
  const circumference = 2 * Math.PI * r;

  return {
    radiusM: r,
    omegaRadS: omega,
    tangentialVelocity: vt,
    centripetalAccel: ac,
    periodS: T,
    frequencyHz: f,
    rpm: calculatedRpm,
    circumferenceM: circumference,
  };
}

/**
 * Genera el conjunto completo de elementos didácticos y físicos para montar el problema en la pizarra.
 */
export function buildMcuExerciseBoardElements(exercise, startX = 120, startY = 120) {
  const elements = [];

  // 1. Título General
  elements.push({
    id: `hdr_mcu_${Date.now()}`,
    type: 'text',
    x: startX,
    y: startY,
    text: `HT03: MOVIMIENTO CIRCULAR UNIFORME (MCU) • ${exercise.title.toUpperCase()}`,
    fontSize: 22,
    color: '#0f172a',
    fontWeight: 'bold',
  });

  // 2. Nota Adhesiva de Enunciado
  elements.push({
    id: `stmt_mcu_${Date.now()}`,
    type: 'sticky',
    x: startX,
    y: startY + 36,
    width: 290,
    height: 190,
    text: `📝 ENUNCIADO (HT03):\n${exercise.statement}`,
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
      id: `step_mcu_${idx}_${Date.now()}`,
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
    id: `ans_mcu_${Date.now()}`,
    type: 'sticky',
    x: startX,
    y: answerY,
    width: 590,
    height: 95,
    text: `🎯 RESULTADOS Y CONCLUSIÓN (HT03):\n${exercise.finalAnswer}`,
    color: '#d3f8df',
  });

  // 5. Ensamblaje Físico de Laboratorio MCU
  const cfg = exercise.assemblyConfig || {};
  const radiusMeters = cfg.radiusMeters || 1.0;
  const omegaRadS = cfg.omegaRadS || 3.0;

  // Centro geométrico del rotor en el lienzo
  const rotorCenterX = startX + 750;
  const rotorCenterY = startY + 180;
  const visualRadiusPx = 110; // Radio visual armonizado en píxeles

  // Plataforma / Rotor Central
  const turntable = createPhysicsElement('mcu_turntable', rotorCenterX - visualRadiusPx, rotorCenterY - visualRadiusPx, {
    label: `${cfg.label || 'Rotor MCU'} (r = ${radiusMeters} m, ω = ${omegaRadS.toFixed(2)} rad/s)`,
    width: visualRadiusPx * 2,
    height: visualRadiusPx * 2,
    radiusMeters,
    radiusPx: visualRadiusPx,
    omega: omegaRadS,
    initialOmega: omegaRadS,
    direction: omegaRadS >= 0 ? 'ccw' : 'cw',
    color: '#0284c7',
  });

  // Partícula o masa que orbita con vectores v_t y a_c
  const particleSize = 28;
  const particle = createPhysicsElement('mcu_particle', rotorCenterX + visualRadiusPx - particleSize / 2, rotorCenterY - particleSize / 2, {
    label: `Masa en Órbita (${(omegaRadS * radiusMeters).toFixed(2)} m/s)`,
    width: particleSize,
    height: particleSize,
    centerX: rotorCenterX,
    centerY: rotorCenterY,
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

  // Sensor Óptico de Vueltas / Fotopuerta angular ubicada a 0°
  const gateW = 46;
  const gateH = 40;
  const photogate = createPhysicsElement('mru_photogate', rotorCenterX + visualRadiusPx - gateW / 2, rotorCenterY - gateH / 2, {
    label: 'Sensor de Vueltas (0°)',
    gateName: 'Contador Lap',
  });

  elements.push(turntable, particle, photogate);

  return elements;
}
