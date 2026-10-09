// =========================================================================
// POLEAS MCU - SOLUCIONADOR Y DATASET COMPLETO
// Basado en el documento oficial: "Unidad 3 - Física II - Quinto - HT01: Poleas MCU"
// Colegio Kinal - Diversificado
// =========================================================================

import { createPhysicsElement } from '../physics/physicsRegistry';

/**
 * 5 Preguntas Conceptuales oficiales de la Hoja de Trabajo HT01 (Forma 1)
 */
export const POLEAS_MCU_THEORY_QUESTIONS = [
  {
    id: 'ht01_u3_q1',
    number: 1,
    question: 'En un sistema de poleas montadas sobre el mismo eje, ¿qué magnitud es igual para todas las poleas?',
    options: [
      'La velocidad tangencial',
      'La velocidad angular',
      'El radio',
      'La energía cinética',
    ],
    correctIndex: 1,
    explanation:
      'Al estar rígidamente fijadas al mismo eje de rotación, todas las poleas giran el mismo ángulo en el mismo intervalo de tiempo. Por tanto, comparten idéntica velocidad angular (ω₁ = ω₂), misma frecuencia (f₁ = f₂) y mismo período (T₁ = T₂).',
  },
  {
    id: 'ht01_u3_q2',
    number: 2,
    question: 'En un sistema de poleas unidas por una faja (sin deslizamiento), ¿qué magnitud se conserva igual en el borde de ambas poleas?',
    options: [
      'La velocidad angular',
      'La frecuencia',
      'La velocidad tangencial',
      'El periodo',
    ],
    correctIndex: 2,
    explanation:
      'La faja o correa de transmisión es continua e inextensible y no patina sobre las gargantas de las poleas. En consecuencia, cada punto de la faja y de la periferia de ambas poleas avanza con exactamente la misma rapidez tangencial: v₁ = v₂ = v_faja.',
  },
  {
    id: 'ht01_u3_q3',
    number: 3,
    question: 'Dos poleas de distinto radio están fijas al mismo eje. ¿Qué se puede afirmar sobre su velocidad tangencial?',
    options: [
      'Es igual en ambas',
      'Es mayor en la polea de mayor radio',
      'Es mayor en la polea de menor radio',
      'Es cero en ambas',
    ],
    correctIndex: 1,
    explanation:
      'Como ambas poleas giran a la misma velocidad angular (ω = cte), la rapidez tangencial en el borde depende directamente del radio según la ecuación v = ω · r. La polea más grande tiene un perímetro mayor que recorrer en una vuelta, por lo que su velocidad tangencial es mayor.',
  },
  {
    id: 'ht01_u3_q4',
    number: 4,
    question: 'Dos poleas de distinto radio están unidas por una faja. ¿Qué ocurre con su velocidad angular?',
    options: [
      'Es igual en ambas',
      'Gira más rápido (mayor ω) la de menor radio',
      'Gira más rápido la de mayor radio',
      'Ambas se detienen',
    ],
    correctIndex: 1,
    explanation:
      'Como la velocidad tangencial es idéntica (v₁ = v₂), se cumple que ω₁ · r₁ = ω₂ · r₂. Al despejar se obtiene ω = v / r; por lo tanto, la polea de menor radio debe girar a mayor velocidad angular (dar más vueltas por segundo) para igualar el avance de la correa.',
  },
  {
    id: 'ht01_u3_q5',
    number: 5,
    question: 'En el sistema del mismo eje, además de la velocidad angular, ¿qué otras magnitudes son iguales para todas las poleas?',
    options: [
      'La frecuencia y el periodo',
      'El radio y la velocidad tangencial',
      'La velocidad tangencial y la frecuencia',
      'Solo el periodo',
    ],
    correctIndex: 0,
    explanation:
      'La frecuencia f = ω / (2π) y el período T = 2π / ω dependen exclusivamente de la velocidad angular ω. Si las poleas comparten la misma velocidad angular por estar en el mismo eje, su frecuencia y su período son necesariamente iguales.',
  },
];

/**
 * 9 Problemas de Aplicación oficiales de la Hoja de Trabajo HT01 (Forma 2)
 */
export const POLEAS_MCU_EXERCISES = [
  {
    id: 'poleas_p1',
    number: 1,
    title: 'Problema 1: Discos Concéntricos en el Mismo Eje',
    subtitle: 'Relación de radios y velocidad tangencial en eje común',
    scenario:
      'En la figura, el disco pequeño de radio 5 in, tiene una velocidad tangencial de 15 in/s. ¿Con qué velocidad tangencial girará el disco grande, si su radio es de 15 in?',
    configuration: 'concentric',
    givenData: {
      r1: '5 in (0.127 m)',
      v1: '15 in/s (0.381 m/s)',
      r2: '15 in (0.381 m)',
      relacion: 'Mismo eje (ω₁ = ω₂)',
    },
    target: 'Velocidad tangencial del disco grande (v₂)',
    formulas: [
      'Mismo eje: ω₁ = ω₂',
      'Rapidez tangencial: v = ω · r  ⇒  ω = v / r',
      'Relación directa: v₂ / r₂ = v₁ / r₁  ⇒  v₂ = v₁ · (r₂ / r₁)',
    ],
    procedure: [
      'Paso 1: Identificar la configuración. Al estar montados sobre el mismo eje, la velocidad angular ω es exactamente igual para ambos discos (ω₁ = ω₂).',
      'Paso 2: Calcular la velocidad angular común del sistema a partir de los datos del disco menor:\nω = v₁ / r₁ = (15 in/s) / (5 in) = 3.0 rad/s.',
      'Paso 3: Calcular la velocidad tangencial en la periferia del disco mayor:\nv₂ = ω · r₂ = (3.0 rad/s) · (15 in) = 45 in/s.',
      'Paso 4 (Conversión SI complementaria):\n45 in/s · (0.0254 m / 1 in) = 1.143 m/s (1.14 m/s).',
    ],
    answers: [
      { label: 'Velocidad tangencial disco grande (v₂)', value: '45 in/s (1.14 m/s)', highlight: true },
      { label: 'Velocidad angular común (ω)', value: '3.0 rad/s (28.65 RPM)' },
      { label: 'Factor de amplificación de velocidad (r₂ / r₁)', value: '3.0x' },
    ],
    simParams: {
      config: 'concentric',
      r1: 0.127,
      r2: 0.381,
      omega1: 3.0,
      omega2: 3.0,
      v1: 0.381,
      v2: 1.143,
    },
  },
  {
    id: 'poleas_p2',
    number: 2,
    title: 'Problema 2: Tambor Doble con Carga en Descenso',
    subtitle: 'Polea concéntrica acoplada a cuerda con bloque colgante',
    scenario:
      'Determinar la rapidez angular, en rad/s con que gira la rueda B, si el bloque baja con una velocidad de 6 m/s. Radio de A: RA = 8 cm, Radio de B: RB = 12 cm.',
    configuration: 'concentric_hanging_block',
    givenData: {
      vBloque: '6 m/s',
      RA: '8 cm = 0.08 m (tambor interior donde enrolla la cuerda)',
      RB: '12 cm = 0.12 m (rueda concéntrica exterior B)',
      relacion: 'Mismo eje (ωA = ωB)',
    },
    target: 'Rapidez angular de la rueda B (ωB)',
    formulas: [
      'Cuerda sin deslizamiento: v_periferia_A = v_bloque = 6 m/s',
      'Velocidad angular de A: ω_A = v_A / R_A',
      'Mismo eje concéntrico: ω_B = ω_A',
      'Velocidad tangencial de B: v_B = ω_B · R_B',
    ],
    procedure: [
      'Paso 1: Como la cuerda del bloque está enrollada sobre la rueda A y no desliza, la rapidez lineal de descenso del bloque equivale a la rapidez tangencial en el borde de A:\nv_A = 6.0 m/s.',
      'Paso 2: Convertir el radio RA a metros:\nRA = 8 cm = 0.08 m.',
      'Paso 3: Calcular la velocidad angular de la rueda A:\nω_A = v_A / R_A = (6.0 m/s) / (0.08 m) = 75 rad/s.',
      'Paso 4: Dado que la rueda B está montada concéntricamente sobre el mismo eje rígidamente solidario:\nω_B = ω_A = 75 rad/s.',
      'Paso 5: Cálculo adicional de la velocidad en el borde exterior de B:\nv_B = ω_B · R_B = (75 rad/s) · (0.12 m) = 9.0 m/s.',
    ],
    answers: [
      { label: 'Rapidez angular de la rueda B (ω_B)', value: '75 rad/s', highlight: true },
      { label: 'Frecuencia de giro en RPM', value: '716.20 RPM (11.94 Hz)' },
      { label: 'Rapidez lineal en el borde de B (v_B)', value: '9.0 m/s' },
    ],
    simParams: {
      config: 'concentric_hanging_block',
      rA: 0.08,
      rB: 0.12,
      vA: 6.0,
      vB: 9.0,
      omegaA: 75.0,
      omegaB: 75.0,
    },
  },
  {
    id: 'poleas_p3',
    number: 3,
    title: 'Problema 3: Poleas con Faja y Aceleración Centrípeta',
    subtitle: 'Transmisión tangencial continua y aceleración normal',
    scenario:
      'La figura muestra dos poleas A y B unidas por una faja. Si la polea A gira a 5 rad/s, determine la magnitud de la aceleración centrípeta del punto C ubicada en la periferia de la polea B. RA = 20 cm, RB = 10 cm.',
    configuration: 'belt',
    givenData: {
      omegaA: '5 rad/s',
      RA: '20 cm = 0.20 m',
      RB: '10 cm = 0.10 m',
      puntoC: 'Ubicado en la periferia exterior de la polea B',
    },
    target: 'Magnitud de la aceleración centrípeta del punto C (ac_C)',
    formulas: [
      'Unidas por faja: v_A = v_B = v_faja',
      'Rapidez lineal motora: v_A = ω_A · R_A',
      'Rapidez angular conducida: ω_B = v_B / R_B = ω_A · (R_A / R_B)',
      'Aceleración centrípeta: a_c = v² / R = ω² · R',
    ],
    procedure: [
      'Paso 1: Convertir los radios a unidades del Sistema Internacional:\nRA = 20 cm = 0.20 m; RB = 10 cm = 0.10 m.',
      'Paso 2: Calcular la velocidad tangencial de la faja a partir de la polea motora A:\nv_A = ω_A · R_A = (5 rad/s) · (0.20 m) = 1.0 m/s.',
      'Paso 3: Como la faja no desliza, la velocidad en la periferia de la polea B es idéntica:\nv_B = v_A = 1.0 m/s.',
      'Paso 4: Obtener la velocidad angular de la polea B:\nω_B = v_B / R_B = (1.0 m/s) / (0.10 m) = 10 rad/s.',
      'Paso 5: Determinar la aceleración centrípeta en el punto C del borde de la polea B:\na_c = (v_B)² / R_B = (1.0 m/s)² / (0.10 m) = 10 m/s².\n(Comprobación: a_c = ω_B² · R_B = (10 rad/s)² · 0.10 m = 10 m/s²).',
    ],
    answers: [
      { label: 'Aceleración centrípeta punto C (a_c)', value: '10.00 m/s²', highlight: true },
      { label: 'Velocidad lineal de la faja (v_faja)', value: '1.00 m/s' },
      { label: 'Velocidad angular de B (ω_B)', value: '10.00 rad/s (95.49 RPM)' },
    ],
    simParams: {
      config: 'belt',
      rA: 0.20,
      rB: 0.10,
      omegaA: 5.0,
      omegaB: 10.0,
      vA: 1.0,
      vB: 1.0,
      acB: 10.0,
    },
  },
  {
    id: 'poleas_p4',
    number: 4,
    title: 'Problema 4: Eje Común Concéntrico con Faja a Polea Externa',
    subtitle: 'Sistema mixto (Mismo eje A-B + Transmisión por faja B-C)',
    scenario:
      'Si la velocidad angular de A es de 12 rad/s. Hallar la velocidad tangencial en C. Datos de radios: rA = 7 m, rB = 4 m (montadas concéntricamente en el mismo eje) y rC = 6 m (unida por faja a la polea B).',
    configuration: 'concentric_and_belt',
    givenData: {
      omegaA: '12 rad/s',
      rA: '7 m',
      rB: '4 m (mismo eje que A)',
      rC: '6 m (unida por faja a B)',
    },
    target: 'Velocidad tangencial en la periferia de la polea C (v_C)',
    formulas: [
      'Mismo eje (A y B): ω_B = ω_A',
      'Rapidez tangencial de B: v_B = ω_B · r_B',
      'Unidas por faja (B y C): v_C = v_B',
      'Velocidad angular en C: ω_C = v_C / r_C',
    ],
    procedure: [
      'Paso 1: Analizar el acoplamiento entre A y B. Dado que A y B comparten el mismo eje central concéntrico, giran solidariamente a la misma velocidad angular:\nω_B = ω_A = 12 rad/s.',
      'Paso 2: Calcular la velocidad tangencial en el borde de la polea intermedia B:\nv_B = ω_B · r_B = (12 rad/s) · (4 m) = 48 m/s.',
      'Paso 3: Analizar la transmisión por correa entre B y C. Al estar enlazadas por faja continua inextensible sin resbalamiento:\nv_C = v_B = 48 m/s.',
      'Paso 4: Como paso complementario, calcular la velocidad angular de la polea C:\nω_C = v_C / r_C = (48 m/s) / (6 m) = 8.0 rad/s.',
    ],
    answers: [
      { label: 'Velocidad tangencial en C (v_C)', value: '48.00 m/s', highlight: true },
      { label: 'Velocidad angular de C (ω_C)', value: '8.00 rad/s (76.39 RPM)' },
      { label: 'Velocidad tangencial en A (v_A)', value: '84.00 m/s' },
    ],
    simParams: {
      config: 'concentric_and_belt',
      rA: 7.0,
      rB: 4.0,
      rC: 6.0,
      omegaA: 12.0,
      omegaB: 12.0,
      omegaC: 8.0,
      vA: 84.0,
      vB: 48.0,
      vC: 48.0,
    },
  },
  {
    id: 'poleas_p5',
    number: 5,
    title: 'Problema 5: Transmisión por Faja con Polea Concéntrica Interna',
    subtitle: 'Sistema mixto (Faja exterior A-B + Mismo eje B-C)',
    scenario:
      'La velocidad en la periferia de la rueda A es de 40 m/s. Hallar la rapidez tangencial en la periferia, en m/s, de la rueda C. Datos: rA = 3 m, rB = 5 m (unidas por faja), y rC = 2 m (fija al mismo eje que B).',
    configuration: 'belt_and_concentric',
    givenData: {
      vA: '40 m/s (en la periferia de A)',
      rA: '3 m',
      rB: '5 m (unida por faja a A)',
      rC: '2 m (fija al mismo eje concéntrico que B)',
    },
    target: 'Rapidez tangencial en la periferia de la rueda C (v_C)',
    formulas: [
      'Unidas por faja (A y B): v_B = v_A',
      'Velocidad angular de B: ω_B = v_B / r_B',
      'Mismo eje (B y C): ω_C = ω_B',
      'Rapidez tangencial en C: v_C = ω_C · r_C = v_A · (r_C / r_B)',
    ],
    procedure: [
      'Paso 1: Como la rueda A está acoplada a la rueda B mediante faja flexible sin resbalamiento, la rapidez tangencial periférica se transfiere intacta:\nv_B = v_A = 40 m/s.',
      'Paso 2: Calcular la velocidad angular con la que gira el eje común de B:\nω_B = v_B / r_B = (40 m/s) / (5 m) = 8.0 rad/s.',
      'Paso 3: Como la rueda C está fijada concéntricamente al mismo eje que B, comparten la misma velocidad angular:\nω_C = ω_B = 8.0 rad/s.',
      'Paso 4: Determinar la rapidez tangencial en la periferia de C:\nv_C = ω_C · r_C = (8.0 rad/s) · (2 m) = 16 m/s.',
    ],
    answers: [
      { label: 'Rapidez tangencial en C (v_C)', value: '16.00 m/s', highlight: true },
      { label: 'Velocidad angular de B y C (ω)', value: '8.00 rad/s (76.39 RPM)' },
      { label: 'Velocidad angular de A (ω_A)', value: '13.33 rad/s (127.32 RPM)' },
    ],
    simParams: {
      config: 'belt_and_concentric',
      rA: 3.0,
      rB: 5.0,
      rC: 2.0,
      omegaA: 13.333,
      omegaB: 8.0,
      omegaC: 8.0,
      vA: 40.0,
      vB: 40.0,
      vC: 16.0,
    },
  },
  {
    id: 'poleas_p6',
    number: 6,
    title: 'Problema 6: Tren de Poleas Compuesto de Tres Etapas',
    subtitle: 'Reductor escalonado de velocidad industrial',
    scenario:
      'Un tren de poleas está constituido por tres escalonamientos, en los que las poleas motoras tienen unos diámetros de 10, 20 y 30 mm. Las tres poleas conducidas 40, 50 y 60 mm. Si lo arrastra un motor que gira a una velocidad de 3000 rpm. Determine: (a) la velocidad del eje de salida y (b) la frecuencia de la polea de 60 mm de diámetro.',
    configuration: 'compound_train_3stage',
    givenData: {
      N1: '3000 RPM (velocidad motora inicial)',
      motoras: 'd₁ = 10 mm, d₃ = 20 mm, d₅ = 30 mm',
      conducidas: 'd₂ = 40 mm, d₄ = 50 mm, d₆ = 60 mm',
    },
    target: '(a) Velocidad de giro del eje de salida N_salida y (b) frecuencia f_salida',
    formulas: [
      'Relación de transmisión total: i_total = (d₁ · d₃ · d₅) / (d₂ · d₄ · d₆)',
      'Velocidad de salida: N_salida = N_entrada · i_total',
      'Velocidad angular: ω = (2π · N) / 60',
      'Frecuencia: f = N / 60 (en Hz o rev/s)',
    ],
    procedure: [
      'Paso 1: Calcular la relación de reducción compuesta del tren:\ni_total = (10 · 20 · 30) / (40 · 50 · 60) = 6000 / 120000 = 1 / 20 = 0.05 (reducción 20:1).',
      'Paso 2: Calcular la velocidad en RPM del eje de salida acoplado a la polea de 60 mm:\nN_salida = N₁ · i_total = 3000 RPM · (1 / 20) = 150 RPM.',
      'Paso 3: Convertir a velocidad angular rad/s:\nω_salida = (150 · 2π) / 60 = 5π ≈ 15.71 rad/s.',
      'Paso 4: Determinar la frecuencia en Hertz (rev/s) de la polea final:\nf = N_salida / 60 = 150 / 60 = 2.5 Hz (o 150 RPM).',
    ],
    answers: [
      { label: '(a) Velocidad del eje de salida', value: '150 RPM (15.71 rad/s)', highlight: true },
      { label: '(b) Frecuencia de la polea de 60 mm', value: '2.5 Hz (150 rev/min)', highlight: true },
      { label: 'Relación total de transmisión (i)', value: '1 / 20 (0.05 - Reductor 20:1)' },
    ],
    simParams: {
      config: 'compound_train',
      motoras: [0.010, 0.020, 0.030],
      conducidas: [0.040, 0.050, 0.060],
      rpmIn: 3000,
      rpmOut: 150,
      omegaOut: 15.708,
      freqOut: 2.5,
    },
  },
  {
    id: 'poleas_p7',
    number: 7,
    title: 'Problema 7: Tren Reductor Inverso y Cálculo de Diámetro',
    subtitle: 'Determinación de diámetro de polea intermedia en tren de 2 etapas',
    scenario:
      'Dado el siguiente tren de poleas, y sabiendo que d₁ = 20 cm, d₃ = 25 cm, d₄ = 50 cm, la frecuencia de la polea 1 es de 200 rpm y la frecuencia de la polea 4 es de 50 rpm. Calcular: (a) la frecuencia de la rueda 2 y 3 y (b) el diámetro de la polea 2.',
    configuration: 'compound_train_2stage',
    givenData: {
      d1: '20 cm',
      d3: '25 cm',
      d4: '50 cm',
      N1: '200 RPM',
      N4: '50 RPM',
      acoplamiento: 'Poleas 2 y 3 en el mismo eje (N₂ = N₃)',
    },
    target: '(a) Frecuencia N₂ y N₃ en RPM, y (b) Diámetro d₂ en cm',
    formulas: [
      'Segunda etapa por faja: N₃ · d₃ = N₄ · d₄  ⇒  N₃ = (N₄ · d₄) / d₃',
      'Mismo eje intermedio: N₂ = N₃',
      'Primera etapa por faja: N₁ · d₁ = N₂ · d₂  ⇒  d₂ = (N₁ · d₁) / N₂',
    ],
    procedure: [
      'Paso 1: Analizar la segunda etapa (poleas 3 y 4 enlazadas por faja). Como la velocidad lineal se conserva:\nN₃ · d₃ = N₄ · d₄.\nDespejar la frecuencia de la polea 3:\nN₃ = (N₄ · d₄) / d₃ = (50 RPM · 50 cm) / (25 cm) = 2500 / 25 = 100 RPM.',
      'Paso 2: Como las poleas 2 y 3 están montadas rígidamente sobre el mismo eje intermedio:\nN₂ = N₃ = 100 RPM.',
      'Paso 3: Analizar la primera etapa (poleas 1 y 2 enlazadas por faja):\nN₁ · d₁ = N₂ · d₂.\nDespejar el diámetro d₂ de la polea 2:\nd₂ = (N₁ · d₁) / N₂ = (200 RPM · 20 cm) / (100 RPM) = 4000 / 100 = 40 cm.',
    ],
    answers: [
      { label: '(a) Frecuencia de las ruedas 2 y 3 (N₂ = N₃)', value: '100 RPM (1.67 Hz)', highlight: true },
      { label: '(b) Diámetro de la polea 2 (d₂)', value: '40 cm (0.40 m)', highlight: true },
      { label: 'Relación de reducción global', value: '4:1 (i = 0.25)' },
    ],
    simParams: {
      config: 'compound_train',
      d1: 0.20,
      d2: 0.40,
      d3: 0.25,
      d4: 0.50,
      n1: 200,
      n23: 100,
      n4: 50,
    },
  },
  {
    id: 'poleas_p8',
    number: 8,
    title: 'Problema 8: Combinación de Poleas Reductoras Simétricas',
    subtitle: 'Doble reducción 4:1 y cálculo de velocidad tangencial final',
    scenario:
      'Para la combinación de poleas, calcular: (a) la velocidad tangencial de la polea 4 y (b) la frecuencia de la polea 3 y 4. Datos: d₁ = d₃ = 5 cm, d₂ = d₄ = 20 cm y la frecuencia de la polea 1 es de 2000 rpm.',
    configuration: 'double_reduction',
    givenData: {
      d1: '5 cm',
      d2: '20 cm (mismo eje que 3)',
      d3: '5 cm',
      d4: '20 cm (eje final)',
      N1: '2000 RPM',
    },
    target: '(a) Velocidad tangencial en el borde de la polea 4 (v₄) y (b) Frecuencias N₃ y N₄',
    formulas: [
      'Reducción etapa 1: N₂ = N₁ · (d₁ / d₂) = 2000 · (5 / 20) = 500 RPM',
      'Mismo eje: N₃ = N₂ = 500 RPM',
      'Reducción etapa 2: N₄ = N₃ · (d₃ / d₄) = 500 · (5 / 20) = 125 RPM',
      'Velocidad angular: ω₄ = (2π · N₄) / 60',
      'Velocidad tangencial: v₄ = ω₄ · r₄ = ω₄ · (d₄ / 2)',
    ],
    procedure: [
      'Paso 1: Determinar la frecuencia del eje intermedio (poleas 2 y 3):\nN₂ = N₁ · (d₁ / d₂) = 2000 RPM · (5 cm / 20 cm) = 500 RPM.\nComo 2 y 3 están en el mismo eje:\nN₃ = N₂ = 500 RPM (f₃ = 500 / 60 ≈ 8.33 Hz).',
      'Paso 2: Determinar la frecuencia del eje de salida (polea 4):\nN₄ = N₃ · (d₃ / d₄) = 500 RPM · (5 cm / 20 cm) = 125 RPM (f₄ = 125 / 60 ≈ 2.08 Hz).',
      'Paso 3: Convertir la frecuencia de la polea 4 a velocidad angular:\nω₄ = (125 · 2π) / 60 = 250π / 60 ≈ 13.090 rad/s.',
      'Paso 4: Obtener el radio de la polea 4:\nr₄ = d₄ / 2 = 20 cm / 2 = 10 cm = 0.10 m.',
      'Paso 5: Calcular la velocidad tangencial en la periferia de la polea 4:\nv₄ = ω₄ · r₄ = (13.090 rad/s) · (0.10 m) ≈ 1.309 m/s (1.31 m/s o 130.9 cm/s).',
    ],
    answers: [
      { label: '(a) Velocidad tangencial polea 4 (v₄)', value: '1.31 m/s (130.9 cm/s)', highlight: true },
      { label: '(b) Frecuencia polea 3 (N₃)', value: '500 RPM (8.33 Hz)', highlight: true },
      { label: '(b) Frecuencia polea 4 (N₄)', value: '125 RPM (2.08 Hz)', highlight: true },
    ],
    simParams: {
      config: 'compound_train',
      d1: 0.05,
      d2: 0.20,
      d3: 0.05,
      d4: 0.20,
      n1: 2000,
      n3: 500,
      n4: 125,
      v4: 1.309,
    },
  },
  {
    id: 'poleas_p9',
    number: 9,
    title: 'Problema 9: Mecanismo de Transmisión de Lavadora',
    subtitle: 'Correa trapezoidal entre polea motora del motor y polea del tambor',
    scenario:
      'El tambor de la lavadora de la figura mide 45 cm de diámetro, y la polea del motor, 9 cm. Determine: la velocidad tangencial del tambor cuando el motor gira a 450 rpm.',
    configuration: 'washing_machine',
    givenData: {
      dtambor: '45 cm = 0.45 m',
      dmotor: '9 cm = 0.09 m',
      Nmotor: '450 RPM',
      tipo: 'Transmisión por correa trapezoidal sin resbalamiento',
    },
    target: 'Velocidad tangencial del tambor (v_tambor)',
    formulas: [
      'Transmisión por correa: v_tambor = v_motor = v_correa',
      'Velocidad angular del motor: ω_motor = (2π · N_motor) / 60',
      'Radio del motor: r_motor = d_motor / 2 = 0.045 m',
      'Rapidez tangencial: v = ω_motor · r_motor',
    ],
    procedure: [
      'Paso 1: Deducir el principio fundamental. Al estar unidas por una correa que no desliza, la velocidad lineal tangencial en la superficie de la polea del motor y en la superficie de la polea del tambor es exactamente igual:\nv_tambor = v_motor.',
      'Paso 2: Calcular el radio de la polea del motor:\nr_motor = d_motor / 2 = 9 cm / 2 = 4.5 cm = 0.045 m.',
      'Paso 3: Convertir la frecuencia del motor a velocidad angular en rad/s:\nω_motor = (450 · 2π) / 60 = 15π ≈ 47.124 rad/s.',
      'Paso 4: Calcular la velocidad tangencial:\nv = ω_motor · r_motor = (47.124 rad/s) · (0.045 m) ≈ 2.1206 m/s ≈ 2.12 m/s (212.1 cm/s).',
      'Paso 5 (Comprobación a través de la velocidad del tambor):\nN_tambor = N_motor · (d_motor / d_tambor) = 450 RPM · (9 / 45) = 90 RPM.\nω_tambor = (90 · 2π) / 60 = 3π ≈ 9.425 rad/s.\nr_tambor = 45 cm / 2 = 22.5 cm = 0.225 m.\nv = ω_tambor · r_tambor = 9.425 · 0.225 ≈ 2.12 m/s.',
    ],
    answers: [
      { label: 'Velocidad tangencial del tambor (v_tambor)', value: '2.12 m/s (212.1 cm/s)', highlight: true },
      { label: 'Velocidad angular del tambor (ω_tambor)', value: '9.42 rad/s (90 RPM)' },
      { label: 'Velocidad angular del motor (ω_motor)', value: '47.12 rad/s (450 RPM)' },
      { label: 'Relación de reducción de la lavadora', value: '5:1 (i = 0.20)' },
    ],
    simParams: {
      config: 'belt',
      rMotor: 0.045,
      rTambor: 0.225,
      omegaMotor: 47.124,
      omegaTambor: 9.425,
      vTambor: 2.121,
    },
  },
];

/**
 * Calculadora universal para acoplamientos de poleas
 */
export function solveCustomPoleasMcu({
  mode = 'belt', // 'belt' | 'concentric' | 'train'
  r1 = 0.2, // Radio polea 1 en m
  r2 = 0.1, // Radio polea 2 en m
  omega1 = 5.0, // rad/s polea 1
  rpm1 = null,
  dTrain = [0.01, 0.04, 0.02, 0.05, 0.03, 0.06], // tren alternado motora/conducida
}) {
  const w1 = rpm1 !== null && rpm1 !== undefined && !isNaN(rpm1) ? (rpm1 * 2 * Math.PI) / 60 : omega1;
  const safeR1 = Math.max(0.001, Number(r1) || 0.2);
  const safeR2 = Math.max(0.001, Number(r2) || 0.1);

  if (mode === 'concentric') {
    // Mismo eje: ω₁ = ω₂
    const w2 = w1;
    const v1 = w1 * safeR1;
    const v2 = w2 * safeR2;
    const rpmVal = (w1 * 60) / (2 * Math.PI);
    return {
      mode: 'concentric',
      modeTitle: 'Mismo Eje (Concéntricas)',
      omega1: w1,
      omega2: w2,
      rpm1: rpmVal,
      rpm2: rpmVal,
      v1,
      v2,
      ac1: w1 * w1 * safeR1,
      ac2: w2 * w2 * safeR2,
      ratio: safeR2 / safeR1,
      description: 'Ambas poleas comparten la misma velocidad angular ω y frecuencia f. La rapidez tangencial es directamente proporcional al radio.',
    };
  }

  if (mode === 'train') {
    // Tren compuesto
    const motoras = [];
    const conducidas = [];
    for (let i = 0; i < dTrain.length; i += 2) {
      if (dTrain[i] !== undefined && dTrain[i + 1] !== undefined) {
        motoras.push(Number(dTrain[i]) || 0.01);
        conducidas.push(Number(dTrain[i + 1]) || 0.04);
      }
    }
    const numProd = motoras.reduce((acc, v) => acc * v, 1);
    const denProd = conducidas.reduce((acc, v) => acc * v, 1);
    const iTotal = denProd > 0 ? numProd / denProd : 1;
    const wOut = w1 * iTotal;
    const rpmIn = (w1 * 60) / (2 * Math.PI);
    const rpmOut = rpmIn * iTotal;
    return {
      mode: 'train',
      modeTitle: 'Tren de Poleas Compuesto',
      omega1: w1,
      omega2: wOut,
      rpm1: rpmIn,
      rpm2: rpmOut,
      iTotal,
      numStages: motoras.length,
      description: `Tren escalonado de ${motoras.length} etapas con relación global i = ${iTotal.toFixed(4)}.`,
    };
  }

  // Por defecto: 'belt' (Unidas por faja)
  const vFaja = w1 * safeR1;
  const w2 = vFaja / safeR2;
  const rpm1Val = (w1 * 60) / (2 * Math.PI);
  const rpm2Val = (w2 * 60) / (2 * Math.PI);
  const ac1 = w1 * w1 * safeR1;
  const ac2 = w2 * w2 * safeR2;
  const ratio = safeR1 / safeR2;

  return {
    mode: 'belt',
    modeTitle: 'Unidas por Faja / Correa',
    omega1: w1,
    omega2: w2,
    rpm1: rpm1Val,
    rpm2: rpm2Val,
    vFaja,
    v1: vFaja,
    v2: vFaja,
    ac1,
    ac2,
    ratio,
    description: 'La faja transmite íntegramente la velocidad tangencial (v₁ = v₂ = v_faja). La polea de menor radio gira más rápido.',
  };
}

/**
 * Generador automático de pizarras para ejercicios de Poleas MCU
 */
export function buildPoleasMcuExerciseBoardElements(exercise, cx = 0, cy = 0) {
  const elements = [];

  // 1. Tarjeta de Enunciado
  const problemCardW = 460;
  const problemCardH = 200;
  const targetText = exercise.target || (Array.isArray(exercise.unknowns) ? exercise.unknowns.join(', ') : 'Resolver incógnitas');
  elements.push({
    id: `txt-enunciado-${Date.now()}`,
    type: 'sticky',
    x: cx - 440,
    y: cy - 250,
    width: problemCardW,
    height: problemCardH,
    color: '#ede9fe',
    text: `📋 ${exercise.title}\n\n${exercise.scenario}\n\n🎯 Objetivo: ${targetText}`,
  });

  // 2. Tarjeta de Fórmulas y Procedimiento Paso a Paso
  const procCardW = 460;
  const procCardH = 290;
  const procLines = Array.isArray(exercise.procedure)
    ? exercise.procedure.join('\n\n')
    : Array.isArray(exercise.stepByStepProcedure)
    ? exercise.stepByStepProcedure.map((s) => `• Paso ${s.step}: ${s.concept}\n  ${s.result}`).join('\n\n')
    : '';
  const ansLines = Array.isArray(exercise.answers)
    ? exercise.answers.map((a) => `• ${a.label}: ${a.value}`).join('\n')
    : exercise.finalAnswer || '';

  const procText =
    `📐 PROCEDIMIENTO ANALÍTICO:\n\n` +
    procLines +
    `\n\n✅ RESULTADOS:\n` +
    ansLines;

  elements.push({
    id: `txt-procedimiento-${Date.now() + 1}`,
    type: 'sticky',
    x: cx - 440,
    y: cy - 30,
    width: procCardW,
    height: procCardH,
    color: '#fdf4ff',
    text: procText,
  });

  // 3. Montaje Experimental de Poleas Interactivas
  const apparatusX = cx + 80;
  const apparatusY = cy - 40;

  // Mapear configuración de polea según el ejercicio
  let pulleyConfig = 'belt';
  let r1M = 0.20;
  let r2M = 0.10;
  let omegaVal = 5.0;

  if (exercise.number === 1) {
    pulleyConfig = 'concentric';
    r1M = 0.127;
    r2M = 0.381;
    omegaVal = 3.0;
  } else if (exercise.number === 2) {
    pulleyConfig = 'concentric_hanging_block';
    r1M = 0.08;
    r2M = 0.12;
    omegaVal = 75.0;
  } else if (exercise.number === 3) {
    pulleyConfig = 'belt';
    r1M = 0.20;
    r2M = 0.10;
    omegaVal = 5.0;
  } else if (exercise.number === 4) {
    pulleyConfig = 'concentric_and_belt';
    r1M = 0.70;
    r2M = 0.40;
    omegaVal = 12.0;
  } else if (exercise.number === 5) {
    pulleyConfig = 'belt_and_concentric';
    r1M = 0.30;
    r2M = 0.50;
    omegaVal = 13.33;
  } else if (exercise.number === 6) {
    pulleyConfig = 'compound_train_3stage';
    r1M = 0.02;
    r2M = 0.06;
    omegaVal = 25.0;
  } else if (exercise.number === 7) {
    pulleyConfig = 'compound_train_2stage';
    r1M = 0.20;
    r2M = 0.40;
    omegaVal = 20.94;
  } else if (exercise.number === 8) {
    pulleyConfig = 'double_reduction';
    r1M = 0.05;
    r2M = 0.20;
    omegaVal = 20.94;
  } else if (exercise.number === 9) {
    pulleyConfig = 'washing_machine';
    r1M = 0.045;
    r2M = 0.225;
    omegaVal = 15.0;
  }

  const pulleySystem = createPhysicsElement('mcu_pulley_system', apparatusX, apparatusY, {
    label: `${exercise.title}`,
    configuration: pulleyConfig,
    radiusMeters1: r1M,
    radiusMeters2: r2M,
    omega: omegaVal,
    initialOmega: omegaVal,
    exerciseNumber: exercise.number,
  });

  elements.push(pulleySystem);

  return elements;
}
