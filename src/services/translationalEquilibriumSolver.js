// =========================================================================
// EQUILIBRIO TRASLACIONAL – PRIMERA LEY DE NEWTON
// Hoja de Trabajo Oficial HT03: Unidad 3 - Física II - Quinto Diversificado
// Colegio Kinal - Diversificado
// =========================================================================

import { createPhysicsElement } from '../physics/physicsRegistry';

/**
 * Forma 1 – 5 PREGUNTAS CONCEPTUALES OFICIALES (HT03)
 */
export const EQUILIBRIO_THEORY_QUESTIONS = [
  {
    id: 'ht03_eq_q1',
    number: 1,
    question: 'Para que un cuerpo esté en equilibrio traslacional, la fuerza resultante debe ser:',
    options: [
      'Mayor que cero.',
      'Menor que cero.',
      'Igual a cero.',
      'Igual al peso.',
    ],
    correctIndex: 2,
    formula: '\\sum \\vec{F} = \\vec{R} = 0 \\iff \\sum F_x = 0, \\; \\sum F_y = 0',
    explanation:
      'La Primera Condición de Equilibrio (Primera Ley de Newton) establece que una partícula se encuentra en equilibrio traslacional si y solo si la fuerza neta o resultante que actúa sobre ella es exactamente igual a cero (ΣF = 0). Esto garantiza que la aceleración sea nula (a⃗ = 0), manteniéndose en reposo o en movimiento rectilíneo uniforme.',
  },
  {
    id: 'ht03_eq_q2',
    number: 2,
    question: 'La tensión en una cuerda siempre actúa:',
    options: [
      'Hacia abajo.',
      'A lo largo de la cuerda.',
      'Perpendicular a la cuerda.',
      'Hacia el centro del objeto.',
    ],
    correctIndex: 1,
    formula: '\\vec{T} \\parallel \\text{línea de la cuerda} \\quad (\\text{siempre tracción / tirando})',
    explanation:
      'Las cuerdas y cables ideales son elementos flexibles unidimensionales incapaces de resistir compresión o flexión. En consecuencia, la fuerza de tensión solo puede tirar del cuerpo y actúa obligatoriamente en la misma dirección longitudinal de la cuerda, saliendo del punto de contacto o nudo.',
  },
  {
    id: 'ht03_eq_q3',
    number: 3,
    question: 'Un cuerpo puede estar en equilibrio traslacional y al mismo tiempo:',
    options: [
      'Girar.',
      'Aumentar su rapidez.',
      'Estar acelerando.',
      'Moverse con velocidad constante.',
    ],
    correctIndex: 3,
    formula: '\\sum \\vec{F} = 0 \\implies \\vec{a} = 0 \\implies \\vec{v} = \\text{constante}',
    explanation:
      'El equilibrio traslacional no exige que el cuerpo esté inmóvil. Existen dos estados de equilibrio traslacional: Estático (en reposo, v = 0) y Dinámico (desplazándose en línea recta con velocidad constante, v = cte, a = 0). Las opciones de acelerar o aumentar rapidez implican a ≠ 0, lo cual viola ΣF = 0.',
  },
  {
    id: 'ht03_eq_q4',
    number: 4,
    question: 'En un diagrama de cuerpo libre se deben representar:',
    options: [
      'Todas las fuerzas externas.',
      'Solo las tensiones.',
      'Solo el peso.',
      'Solo las fuerzas conocidas.',
    ],
    correctIndex: 0,
    formula: '\\text{DCL} = \\{ \\vec{F}_{\\text{externas sobre el cuerpo}} \\}',
    explanation:
      'El Diagrama de Cuerpo Libre (DCL) es una herramienta de aislamiento donde se deben representar absolutamente todas las fuerzas externas que el entorno ejerce sobre el cuerpo de estudio (pesos, normales, tensiones, fricciones, reacciones), tanto las conocidas como las incógnitas, omitiendo las fuerzas internas.',
  },
  {
    id: 'ht03_eq_q5',
    number: 5,
    question: 'Si una de las fuerzas que actúa sobre un cuerpo aumenta y las demás permanecen iguales, el cuerpo:',
    options: [
      'Sigue en equilibrio.',
      'Reduce su peso.',
      'Pierde el equilibrio.',
      'Conserva la misma resultante.',
    ],
    correctIndex: 2,
    formula: '\\Delta \\vec{F}_i \\neq 0 \\implies \\sum \\vec{F}_{\\text{nuevo}} \\neq 0 \\implies \\vec{a} \\neq 0',
    explanation:
      'Si inicialmente el sistema estaba balanceado con ΣF = 0, al aumentar una sola de las fuerzas sin compensar las restantes se rompe la simetría vectorial. La fuerza resultante neta pasa a ser diferente de cero (ΣF ≠ 0), produciendo una aceleración según la Segunda Ley de Newton y rompiendo el equilibrio.',
  },
];

/**
 * Forma 2 – 8 PROBLEMAS DE APLICACIÓN OFICIALES (HT03)
 */
export const EQUILIBRIO_EXERCISES = [
  {
    id: 'eq_p1',
    number: 1,
    title: 'Problema 1: Objeto de 600 N con Cable Horizontal y Cable Inclinado a 50°',
    subtitle: 'Método Matemático: Despeje directo y razones trigonométricas',
    method: 'algebraic',
    unitSystem: 'SI (Newtons)',
    apparatusType: 'cable_knot_wall',
    statement:
      'Para la situación mostrada en la figura, encuentre los valores de FT1 y FT2 si el peso del objeto es de 600 N.',
    criticalPoint: 'Nudo central de concurrencia de cables',
    parameters: {
      weight: 600,
      angle2Deg: 50.0,
      angle1Deg: 180.0, // horizontal hacia la izquierda (-X)
    },
    bodies: [
      {
        bodyId: 'knot',
        name: 'Nudo Central de Concurrencia',
        knots: ['knot'],
        forces: [
          {
            id: 'f_w',
            name: 'W',
            symbol: 'W',
            label: 'Peso W = 600 N',
            magnitude: 600,
            angleDeg: 270,
            direction: 'Hacia abajo (-Y)',
            color: '#ef4444',
            components: { fx: 0, fy: -600 },
          },
          {
            id: 'f_t1',
            name: 'FT1',
            symbol: 'FT1',
            label: 'Tensión FT1 = 503.46 N',
            magnitude: 503.46,
            angleDeg: 180,
            direction: 'Horizontal a la izquierda (-X)',
            color: '#3b82f6',
            components: { fx: -503.46, fy: 0 },
          },
          {
            id: 'f_t2',
            name: 'FT2',
            symbol: 'FT2',
            label: 'Tensión FT2 = 783.24 N',
            magnitude: 783.24,
            angleDeg: 50.0,
            direction: 'Arriba y a la derecha (I Cuadrante a 50.0°)',
            color: '#10b981',
            components: { fx: 503.46, fy: 600 },
          },
        ],
        equations: [
          'ΣFx = FT2 · cos(50.0°) - FT1 = 0',
          'ΣFy = FT2 · sen(50.0°) - 600 = 0',
        ],
        steps: [
          '1. Análisis del nudo: El cable FT2 apunta a 50.0° sobre la horizontal hacia la derecha, FT1 es horizontal hacia la izquierda, y el peso W = 600 N actúa verticalmente hacia abajo.',
          '2. De la sumatoria en Y: FT2 · sen(50.0°) = 600 N',
          '   FT2 = 600 / sen(50.0°) = 600 / 0.766044 = 783.24 N',
          '3. De la sumatoria en X: FT1 = FT2 · cos(50.0°)',
          '   FT1 = 783.2444 · cos(50.0°) = 783.2444 · 0.642788 = 503.46 N',
        ],
      },
    ],
    results: [
      { name: 'FT1', label: 'Tensión en Cable Horizontal FT1', value: '503.46 N', numeric: 503.46, unit: 'N' },
      { name: 'FT2', label: 'Tensión en Cable Inclinado FT2', value: '783.24 N', numeric: 783.24, unit: 'N' },
    ],
  },

  {
    id: 'eq_p2',
    number: 2,
    title: 'Problema 2: Sistema de Poleas con Pesas FW2 y FW3 Sosteniendo FW1 = 500 N',
    subtitle: 'Método Matemático: Sistema 2x2 por sustitución / igualación',
    method: 'algebraic',
    unitSystem: 'SI (Newtons)',
    apparatusType: 'two_pulleys_three_weights',
    statement:
      'Suponga que FW1 de la figura es de 500 N. Encuentre los valores de FW2 y FW3 si el sistema cuelga en equilibrio como se muestra.',
    criticalPoint: 'Nudo central entre las dos poleas',
    parameters: {
      fw1: 500,
      angle2Deg: 50.0, // ángulo cuerda 2 con horizontal (hacia arriba-izquierda)
      angle3Deg: 35.0, // ángulo cuerda 3 con horizontal (hacia arriba-derecha)
    },
    bodies: [
      {
        bodyId: 'knot',
        name: 'Nudo Central (Concurrencia de Cables)',
        knots: ['knot'],
        forces: [
          {
            id: 'f_w1',
            name: 'FW1',
            symbol: 'FW1',
            label: 'Peso FW1 = 500 N',
            magnitude: 500,
            angleDeg: 270,
            direction: 'Hacia abajo (-Y)',
            color: '#ef4444',
            components: { fx: 0, fy: -500 },
          },
          {
            id: 'f_w2',
            name: 'FW2',
            symbol: 'FW2',
            label: 'Tensión / Pesa FW2 = 411.14 N',
            magnitude: 411.14,
            angleDeg: 130.0, // 180 - 50 = 130°
            direction: 'Arriba y a la izquierda (II Cuadrante a 50.0° respecto a -X)',
            color: '#3b82f6',
            components: { fx: -264.28, fy: 314.95 },
          },
          {
            id: 'f_w3',
            name: 'FW3',
            symbol: 'FW3',
            label: 'Tensión / Pesa FW3 = 322.62 N',
            magnitude: 322.62,
            angleDeg: 35.0,
            direction: 'Arriba y a la derecha (I Cuadrante a 35.0°)',
            color: '#10b981',
            components: { fx: 264.28, fy: 185.05 },
          },
        ],
        equations: [
          'ΣFx = FW3 · cos(35.0°) - FW2 · cos(50.0°) = 0',
          'ΣFy = FW2 · sen(50.0°) + FW3 · sen(35.0°) - 500 = 0',
        ],
        steps: [
          '1. Por tratarse de poleas ideales sin rozamiento, la tensión en cada ramal es idéntica al peso suspendido: T2 = FW2 y T3 = FW3.',
          '2. Ecuación de equilibrio en X: FW3 · cos(35.0°) = FW2 · cos(50.0°)',
          '   FW3 = FW2 · [cos(50.0°) / cos(35.0°)] = FW2 · (0.642788 / 0.819152) = 0.784699 · FW2',
          '3. Sustituimos FW3 en la sumatoria en Y:',
          '   FW2 · sen(50.0°) + (0.784699 · FW2) · sen(35.0°) = 500',
          '   FW2 · [0.766044 + 0.784699 · 0.573576] = 500',
          '   FW2 · [0.766044 + 0.450085] = FW2 · (1.216129) = 500',
          '   FW2 = 500 / 1.216129 = 411.14 N',
          '4. Calculamos FW3:',
          '   FW3 = 0.784699 · 411.14 N = 322.62 N',
        ],
      },
    ],
    results: [
      { name: 'FW2', label: 'Peso de la Carga FW2', value: '411.14 N', numeric: 411.14, unit: 'N' },
      { name: 'FW3', label: 'Peso de la Carga FW3', value: '322.62 N', numeric: 322.62, unit: 'N' },
    ],
  },

  {
    id: 'eq_p3',
    number: 3,
    title: 'Problema 3: Motor de Automóvil de 200 kg Suspendido por Cables AB y AC',
    subtitle: 'Método Matemático: Regla de Cramer / Eliminación y gravedad g = 9.8 m/s²',
    method: 'algebraic',
    unitSystem: 'SI (Newtons)',
    apparatusType: 'engine_suspended_cables',
    statement:
      'El motor de automóvil que se muestra en la figura está suspendido mediante un sistema de cables. La masa del motor es de 200 kg. ¿Cuáles son las tensiones en los cables AB y AC?',
    criticalPoint: 'Nudo A de suspensión del motor',
    parameters: {
      massKg: 200,
      g: 9.8,
      weightN: 1960,
      angleB: 60.0, // ángulo en techo en B con la horizontal -> alternos internos 60° en nudo A
      angleC: 45.0, // ángulo en techo en C con la horizontal -> alternos internos 45° en nudo A
    },
    bodies: [
      {
        bodyId: 'knot_A',
        name: 'Nudo A (Punto de Soporte del Motor)',
        knots: ['A'],
        forces: [
          {
            id: 'f_w',
            name: 'W',
            symbol: 'W',
            label: 'Peso Motor W = 1960 N (200 kg · 9.8 m/s²)',
            magnitude: 1960,
            angleDeg: 270,
            direction: 'Hacia abajo (-Y)',
            color: '#ef4444',
            components: { fx: 0, fy: -1960 },
          },
          {
            id: 'f_tab',
            name: 'TAB',
            symbol: 'TAB',
            label: 'Tensión Cable AB = 1434.82 N',
            magnitude: 1434.82,
            angleDeg: 120.0, // 180 - 60 = 120°
            direction: 'Arriba y a la izquierda (II Cuadrante a 60.0° con horizontal)',
            color: '#3b82f6',
            components: { fx: -717.41, fy: 1242.59 },
          },
          {
            id: 'f_tac',
            name: 'TAC',
            symbol: 'TAC',
            label: 'Tensión Cable AC = 1014.57 N',
            magnitude: 1014.57,
            angleDeg: 45.0,
            direction: 'Arriba y a la derecha (I Cuadrante a 45.0° con horizontal)',
            color: '#10b981',
            components: { fx: 717.41, fy: 717.41 },
          },
        ],
        equations: [
          'W = m · g = 200 kg · 9.8 m/s² = 1960 N',
          'ΣFx = TAC · cos(45°) - TAB · cos(60°) = 0',
          'ΣFy = TAB · sen(60°) + TAC · sen(45°) - 1960 = 0',
        ],
        steps: [
          '1. Determinamos el peso del motor: W = m · g = 200 kg · 9.8 m/s² = 1960 N.',
          '2. Por ángulos alternos internos respecto al techo horizontal, el cable AB forma 60° con la horizontal hacia la izquierda y el cable AC forma 45° con la horizontal hacia la derecha.',
          '3. Ecuación en X: TAC · cos(45°) = TAB · cos(60°)',
          '   TAC = TAB · [cos(60°) / cos(45°)] = TAB · (0.5000 / 0.707107) = 0.707107 · TAB',
          '4. Sustituimos en la ecuación en Y:',
          '   TAB · sen(60°) + (0.707107 · TAB) · sen(45°) = 1960',
          '   TAB · [0.866025 + 0.707107 · 0.707107] = 1960',
          '   TAB · [0.866025 + 0.500000] = TAB · (1.366025) = 1960',
          '   TAB = 1960 / 1.366025 = 1434.82 N',
          '5. Calculamos TAC:',
          '   TAC = 0.707107 · 1434.82 N = 1014.57 N',
        ],
      },
    ],
    results: [
      { name: 'TAB', label: 'Tensión en Cable AB', value: '1434.82 N', numeric: 1434.82, unit: 'N' },
      { name: 'TAC', label: 'Tensión en Cable AC', value: '1014.57 N', numeric: 1014.57, unit: 'N' },
      { name: 'W', label: 'Peso del Motor (m·g)', value: '1960.00 N', numeric: 1960.00, unit: 'N' },
    ],
  },

  {
    id: 'eq_p4',
    number: 4,
    title: 'Problema 4: Objeto de 200 N con Triángulo de Pendiente 3-4-5 y Ángulo de 30° Vertical',
    subtitle: 'Método Matemático: Triángulo geométrico 3-4-5 y ángulo complementario',
    method: 'algebraic',
    unitSystem: 'SI (Newtons)',
    apparatusType: 'triangular_knot_slope',
    statement:
      'Para el sistema mostrado encuentre TBA y TCA, si el peso del objeto es de 200 N.',
    criticalPoint: 'Nudo A de unión de los cables',
    parameters: {
      weight: 200,
      slopeBase: 3,
      slopeHeight: 4,
      slopeHyp: 5,
      angleWithVertical: 30.0, // cable CA a 30° con la vertical
    },
    bodies: [
      {
        bodyId: 'knot_A',
        name: 'Nudo A (Concurrencia de Cables)',
        knots: ['A'],
        forces: [
          {
            id: 'f_w',
            name: 'W',
            symbol: 'W',
            label: 'Peso W = 200 N',
            magnitude: 200,
            angleDeg: 270,
            direction: 'Hacia abajo (-Y)',
            color: '#ef4444',
            components: { fx: 0, fy: -200 },
          },
          {
            id: 'f_tba',
            name: 'TBA',
            symbol: 'TBA',
            label: 'Tensión Cable BA = 108.74 N',
            magnitude: 108.74,
            angleDeg: 126.87, // arctan(4/3) = 53.13° respecto a -X -> 180 - 53.13° = 126.87°
            direction: 'Arriba-Izq según pendiente 3-4-5 (cos θ = 3/5, sen θ = 4/5)',
            color: '#3b82f6',
            components: { fx: -65.24, fy: 86.99 },
          },
          {
            id: 'f_tca',
            name: 'TCA',
            symbol: 'TCA',
            label: 'Tensión Cable CA = 130.49 N',
            magnitude: 130.49,
            angleDeg: 60.0, // 30° con la vertical => 60° con la horizontal
            direction: 'Arriba-Der a 30.0° con la vertical (60.0° con la horizontal)',
            color: '#10b981',
            components: { fx: 65.24, fy: 113.01 },
          },
        ],
        equations: [
          'Descomposición Cable BA: cos(α) = 3/5 = 0.6, sen(α) = 4/5 = 0.8',
          'Descomposición Cable CA (30° con vertical): Fx = TCA · sen(30°), Fy = TCA · cos(30°)',
          'ΣFx = TCA · sen(30°) - TBA · (3/5) = 0',
          'ΣFy = TBA · (4/5) + TCA · cos(30°) - 200 = 0',
        ],
        steps: [
          '1. Descomposición geométrica del cable BA: mediante el triángulo 3-4-5, cos(α) = 3/5 = 0.6 y sen(α) = 4/5 = 0.8.',
          '2. Descomposición del cable CA: forma 30° con el eje vertical Y, por lo que su componente horizontal es TCA · sen(30°) y la vertical es TCA · cos(30°).',
          '3. Sumatoria en X: TCA · sen(30°) = TBA · (3/5)',
          '   TCA · 0.5 = TBA · 0.6  ⇒  TCA = (0.6 / 0.5) · TBA = 1.2 · TBA',
          '4. Sustitución en la sumatoria en Y:',
          '   TBA · 0.8 + (1.2 · TBA) · cos(30°) = 200',
          '   TBA · [0.8 + 1.2 · 0.866025] = 200',
          '   TBA · [0.8 + 1.03923] = TBA · (1.83923) = 200',
          '   TBA = 200 / 1.83923 = 108.74 N',
          '5. Cálculo de TCA:',
          '   TCA = 1.2 · 108.74 N = 130.49 N',
        ],
      },
    ],
    results: [
      { name: 'TBA', label: 'Tensión en Cable BA', value: '108.74 N', numeric: 108.74, unit: 'N' },
      { name: 'TCA', label: 'Tensión en Cable CA', value: '130.49 N', numeric: 130.49, unit: 'N' },
    ],
  },

  {
    id: 'eq_p5',
    number: 5,
    title: 'Problema 5: Caja de 500 lb Soportada por Cables AB (30°) y AC (Pendiente 3-4-5)',
    subtitle: 'Método: Calculadora científica y unidades inglesas (libras-fuerza lb)',
    method: 'calculator',
    unitSystem: 'Inglés (Libras lb)',
    apparatusType: 'crate_two_cables',
    statement:
      'La caja tiene un peso de 500 lb. Determine la fuerza en cada cable de soporte.',
    criticalPoint: 'Nudo A que sostiene la caja D',
    parameters: {
      weightLb: 500,
      angleABDeg: 30.0, // con la horizontal hacia la izquierda
      slopeACBase: 4,
      slopeACHeight: 3,
      slopeACHyp: 5,
    },
    bodies: [
      {
        bodyId: 'knot_A',
        name: 'Nudo A (Conexión de Cables)',
        knots: ['A'],
        forces: [
          {
            id: 'f_ad',
            name: 'FAD',
            symbol: 'FAD',
            label: 'Tensión Cable AD = Peso Caja = 500 lb',
            magnitude: 500,
            angleDeg: 270,
            direction: 'Hacia abajo (-Y)',
            color: '#ef4444',
            components: { fx: 0, fy: -500 },
          },
          {
            id: 'f_ab',
            name: 'FAB',
            symbol: 'FAB',
            label: 'Fuerza Cable AB = 434.96 lb',
            magnitude: 434.96,
            angleDeg: 150.0, // 180 - 30 = 150°
            direction: 'Arriba y a la izquierda (II Cuadrante a 30.0° con horizontal)',
            color: '#3b82f6',
            components: { fx: -376.69, fy: 217.48 },
          },
          {
            id: 'f_ac',
            name: 'FAC',
            symbol: 'FAC',
            label: 'Fuerza Cable AC = 470.86 lb',
            magnitude: 470.86,
            angleDeg: 36.87, // arctan(3/4) = 36.87°
            direction: 'Arriba y a la derecha según pendiente (cos β = 4/5, sen β = 3/5)',
            color: '#10b981',
            components: { fx: 376.69, fy: 282.52 },
          },
        ],
        equations: [
          'Cable AD vertical: FAD = W = 500 lb',
          'Cable AC: cos(β) = 4/5 = 0.8,  sen(β) = 3/5 = 0.6',
          'ΣFx = FAC · (4/5) - FAB · cos(30°) = 0',
          'ΣFy = FAB · sen(30°) + FAC · (3/5) - 500 = 0',
        ],
        steps: [
          '1. Equilibrio de la caja: el cable vertical soporta directamente el peso, por lo tanto FAD = 500 lb.',
          '2. Cable AC: la base es 4 y la altura es 3, por lo que cos(β) = 4/5 = 0.8 y sen(β) = 3/5 = 0.6.',
          '3. Sumatoria en X: FAC · 0.8 = FAB · cos(30°)',
          '   FAC = FAB · [cos(30°) / 0.8] = FAB · (0.866025 / 0.8) = 1.082532 · FAB',
          '4. Sustitución en sumatoria en Y:',
          '   FAB · sen(30°) + (1.082532 · FAB) · 0.6 = 500',
          '   FAB · [0.5000 + 0.649519] = FAB · (1.149519) = 500',
          '   FAB = 500 / 1.149519 = 434.96 lb',
          '5. Cálculo de FAC:',
          '   FAC = 1.082532 · 434.96 lb = 470.86 lb',
        ],
      },
    ],
    results: [
      { name: 'FAB', label: 'Fuerza en Cable AB', value: '434.96 lb', numeric: 434.96, unit: 'lb' },
      { name: 'FAC', label: 'Fuerza en Cable AC', value: '470.86 lb', numeric: 470.86, unit: 'lb' },
      { name: 'FAD', label: 'Fuerza en Cable AD (Soporte Caja)', value: '500.00 lb', numeric: 500.00, unit: 'lb' },
    ],
  },

  {
    id: 'eq_p6',
    number: 6,
    title: 'Problema 6: Cilindro C de 40 kg con Polea Sosteniendo Cilindro A a 30°',
    subtitle: 'Método: Calculadora científica, polea de reenvío y equilibrio en nudo E',
    method: 'calculator',
    unitSystem: 'SI (Kilogramos y Newtons)',
    apparatusType: 'pulley_cylinder_knot',
    statement:
      'Si la masa del cilindro C es de 40 kg, determine la masa del cilindro A para sostener el ensamble en la posición mostrada.',
    criticalPoint: 'Nudo / Anillo E',
    parameters: {
      massC: 40.0,
      angleEB: 30.0, // ángulo con la horizontal hacia polea B
      g: 9.8,
    },
    bodies: [
      {
        bodyId: 'knot_E',
        name: 'Nudo E (Intersección de Cables)',
        knots: ['E'],
        forces: [
          {
            id: 'f_wa',
            name: 'WA',
            symbol: 'WA',
            label: 'Peso Cilindro A: WA = mA · g',
            magnitude: 196,
            angleDeg: 270,
            direction: 'Hacia abajo (-Y)',
            color: '#ef4444',
            components: { fx: 0, fy: -196 },
          },
          {
            id: 'f_ed',
            name: 'TED',
            symbol: 'TED',
            label: 'Tensión Cable Horizontal ED = 339.48 N',
            magnitude: 339.48,
            angleDeg: 180,
            direction: 'Horizontal a la pared izquierda (-X)',
            color: '#3b82f6',
            components: { fx: -339.48, fy: 0 },
          },
          {
            id: 'f_eb',
            name: 'TEB',
            symbol: 'TEB',
            label: 'Tensión Cuerda EB = mC · g = 392 N',
            magnitude: 392,
            angleDeg: 30.0,
            direction: 'Hacia polea B (I Cuadrante a 30.0°)',
            color: '#10b981',
            components: { fx: 339.48, fy: 196 },
          },
        ],
        equations: [
          'Tensión en la cuerda continua: TEB = WC = mC · g = 40 kg · 9.8 m/s² = 392 N',
          'ΣFx = TEB · cos(30°) - TED = 0  ⇒  TED = 392 · cos(30°) = 339.48 N',
          'ΣFy = TEB · sen(30°) - WA = 0  ⇒  mA · g = (mC · g) · sen(30°)',
          'mA = mC · sen(30°) = 40 kg · 0.50 = 20.00 kg',
        ],
        steps: [
          '1. Análisis del cilindro C: Cuelga verticalmente de una cuerda ideal sobre la polea B, por lo tanto la tensión en toda la cuerda hasta el nudo E es TEB = mC · g = 40 · 9.8 = 392 N.',
          '2. Sumatoria en Y en el nudo E: La componente vertical de TEB debe equilibrar el peso del cilindro A:',
          '   WA = TEB · sen(30°)',
          '   mA · g = (mC · g) · sen(30°)',
          '3. Cancelamos la aceleración de la gravedad g en ambos miembros:',
          '   mA = mC · sen(30°) = 40 kg · 0.5000 = 20.00 kg',
          '4. (Opcional) La tensión en el cable horizontal sujeto a la pared D es: TED = 392 · cos(30°) = 339.48 N.',
        ],
      },
    ],
    results: [
      { name: 'mA', label: 'Masa del Cilindro A', value: '20.00 kg', numeric: 20.0, unit: 'kg' },
      { name: 'WA', label: 'Peso del Cilindro A', value: '196.00 N', numeric: 196.0, unit: 'N' },
      { name: 'TEB', label: 'Tensión en Cable hacia Polea (TEB)', value: '392.00 N', numeric: 392.0, unit: 'N' },
      { name: 'TED', label: 'Tensión en Cable Horizontal (TED)', value: '339.48 N', numeric: 339.48, unit: 'N' },
    ],
  },

  {
    id: 'eq_p7',
    number: 7,
    title: 'Problema 7: Dos Semáforos de 10 kg y 15 kg Suspendidos entre Postes',
    subtitle: 'Método: Calculadora científica, dos nudos de concurrencia acoplados (B y C)',
    method: 'calculator',
    unitSystem: 'SI (Newtons)',
    apparatusType: 'traffic_lights_span',
    statement:
      'Determine la tensión necesaria en los cables AB, BC y CD para sostener los semáforos de 10 kg y 15 kg en B y C, respectivamente. El ángulo θ = 22°.',
    criticalPoint: 'Dos nudos de concurrencia independientes: Nudo B y Nudo C',
    parameters: {
      m1: 10.0,
      m2: 15.0,
      g: 9.8,
      w1: 98.0, // N
      w2: 147.0, // N
      angleABDeg: 15.0, // con la horizontal hacia poste A
      angleBCDeg: 0.0, // cable horizontal
      angleCDDeg: 22.0, // θ = 22° con la horizontal hacia poste D
    },
    bodies: [
      {
        bodyId: 'knot_B',
        name: 'Nudo B (Semáforo 1: 10 kg)',
        knots: ['B'],
        forces: [
          {
            id: 'f_w1',
            name: 'W1',
            symbol: 'W1',
            label: 'Peso Semáforo 1 = 98 N (10 kg · 9.8)',
            magnitude: 98,
            angleDeg: 270,
            direction: 'Hacia abajo (-Y)',
            color: '#ef4444',
            components: { fx: 0, fy: -98 },
          },
          {
            id: 'f_tab',
            name: 'TAB',
            symbol: 'TAB',
            label: 'Tensión Cable AB = 378.64 N',
            magnitude: 378.64,
            angleDeg: 165.0, // 180 - 15 = 165°
            direction: 'Arriba e izquierda a 15.0° con horizontal',
            color: '#3b82f6',
            components: { fx: -365.74, fy: 98 },
          },
          {
            id: 'f_tbc',
            name: 'TBC',
            symbol: 'TBC',
            label: 'Tensión Cable Horizontal BC = 365.74 N',
            magnitude: 365.74,
            angleDeg: 0.0,
            direction: 'Horizontal a la derecha (+X)',
            color: '#10b981',
            components: { fx: 365.74, fy: 0 },
          },
        ],
        equations: [
          'W1 = 10 kg · 9.8 m/s² = 98 N',
          'ΣFy = TAB · sen(15.0°) - 98 = 0  ⇒  TAB = 98 / sen(15.0°) = 378.64 N',
          'ΣFx = TBC - TAB · cos(15.0°) = 0  ⇒  TBC = 378.64 · cos(15.0°) = 365.74 N',
        ],
        steps: [
          '1. Peso del semáforo B: W1 = 10 kg · 9.8 m/s² = 98 N.',
          '2. En el nudo B, el cable BC es estrictamente horizontal, por lo que toda la carga vertical de 98 N la soporta la componente vertical de TAB:',
          '   TAB · sen(15.0°) = 98 N',
          '   TAB = 98 / sen(15.0°) = 98 / 0.258819 = 378.64 N',
          '3. Sumatoria en X en el nudo B:',
          '   TBC = TAB · cos(15.0°) = 378.6435 · 0.965926 = 365.74 N',
        ],
      },
      {
        bodyId: 'knot_C',
        name: 'Nudo C (Semáforo 2: 15 kg)',
        knots: ['C'],
        forces: [
          {
            id: 'f_w2',
            name: 'W2',
            symbol: 'W2',
            label: 'Peso Semáforo 2 = 147 N (15 kg · 9.8)',
            magnitude: 147,
            angleDeg: 270,
            direction: 'Hacia abajo (-Y)',
            color: '#ef4444',
            components: { fx: 0, fy: -147 },
          },
          {
            id: 'f_tbc_pull',
            name: 'TBC',
            symbol: 'TBC',
            label: 'Tensión Cable Horizontal BC = 365.74 N',
            magnitude: 365.74,
            angleDeg: 180.0,
            direction: 'Horizontal a la izquierda (-X)',
            color: '#10b981',
            components: { fx: -365.74, fy: 0 },
          },
          {
            id: 'f_tcd',
            name: 'TCD',
            symbol: 'TCD',
            label: 'Tensión Cable CD = 392.41 N',
            magnitude: 392.41,
            angleDeg: 22.0,
            direction: 'Arriba y a la derecha a 22.0° con horizontal',
            color: '#8b5cf6',
            components: { fx: 363.84, fy: 147 },
          },
        ],
        equations: [
          'W2 = 15 kg · 9.8 m/s² = 147 N',
          'ΣFy = TCD · sen(22.0°) - 147 = 0  ⇒  TCD = 147 / sen(22.0°) = 392.41 N',
        ],
        steps: [
          '1. Peso del semáforo C: W2 = 15 kg · 9.8 m/s² = 147 N.',
          '2. En el nudo C, el cable BC es horizontal hacia la izquierda y no tiene componente vertical.',
          '3. Por lo tanto, la componente vertical de TCD soporta el peso completo de 147 N:',
          '   TCD · sen(22.0°) = 147 N',
          '   TCD = 147 / sen(22.0°) = 147 / 0.374607 = 392.41 N',
        ],
      },
    ],
    results: [
      { name: 'TAB', label: 'Tensión en Cable AB', value: '378.64 N', numeric: 378.64, unit: 'N' },
      { name: 'TBC', label: 'Tensión en Cable BC (Horizontal)', value: '365.74 N', numeric: 365.74, unit: 'N' },
      { name: 'TCD', label: 'Tensión en Cable CD (θ = 22°)', value: '392.41 N', numeric: 392.41, unit: 'N' },
    ],
  },

  {
    id: 'eq_p8',
    number: 8,
    title: 'Problema 8: Dos Cajas de 40 lb en Planos Inclinados Lisos (70° y 20°)',
    subtitle: 'Método: Calculadora científica, planos inclinados ortogonales complementarios',
    method: 'calculator',
    unitSystem: 'Inglés (Libras lb)',
    apparatusType: 'double_inclined_planes',
    statement:
      'Cada caja pesa 40 lb. Los ángulos se miden en relación con la horizontal. Las superficies son lisas. Determine la tensión en la cuerda A y la fuerza normal ejercida sobre la caja B por la superficie inclinada.',
    criticalPoint: 'Cajas B y D apoyadas en superficies con inclinaciones de 70° y 20°',
    parameters: {
      weightB: 40.0,
      weightD: 40.0,
      anglePlaneB: 70.0,
      anglePlaneD: 20.0,
    },
    bodies: [
      {
        bodyId: 'box_D',
        name: 'Caja D (Plano Inclinado a 20°)',
        knots: ['D'],
        forces: [
          {
            id: 'f_wd',
            name: 'WD',
            symbol: 'WD',
            label: 'Peso Caja D = 40 lb',
            magnitude: 40,
            angleDeg: 270,
            direction: 'Hacia abajo (-Y)',
            color: '#ef4444',
            components: { fx: 0, fy: -40 },
          },
          {
            id: 'f_nd',
            name: 'ND',
            symbol: 'ND',
            label: 'Normal Superficie D = 37.59 lb',
            magnitude: 37.59,
            angleDeg: 110.0, // perpendicular a 20° hacia arriba
            direction: 'Perpendicular al plano D (70° sobre horizontal)',
            color: '#3b82f6',
            components: { fx: -13.68, fy: 37.59 },
          },
          {
            id: 'f_tc',
            name: 'TC',
            symbol: 'TC',
            label: 'Tensión Cuerda C (Conexión) = 13.68 lb',
            magnitude: 13.68,
            angleDeg: 160.0, // paralela al plano D hacia el vértice
            direction: 'Hacia arriba a lo largo del plano a 20°',
            color: '#10b981',
            components: { fx: -12.86, fy: 4.68 },
          },
        ],
        equations: [
          'Plano D (inclinado a 20°):',
          'ΣF∥ = TC - WD · sen(20°) = 0  ⇒  TC = 40 lb · sen(20°) = 13.68 lb',
          'ΣF⊥ = ND - WD · cos(20°) = 0  ⇒  ND = 40 lb · cos(20°) = 37.59 lb',
        ],
        steps: [
          '1. Análisis de la caja D en el plano de 20°: No hay fricción (superficie lisa).',
          '2. La componente del peso de la caja D a lo largo de su plano es: WD∥ = WD · sen(20°) = 40 · sen(20°) = 13.6808 lb.',
          '3. Como la caja D está en equilibrio estático, la cuerda C que la sostiene debe equilibrar exactamente esta fuerza: TC = 13.68 lb.',
        ],
      },
      {
        bodyId: 'box_B',
        name: 'Caja B (Plano Inclinado a 70°)',
        knots: ['B'],
        forces: [
          {
            id: 'f_wb',
            name: 'WB',
            symbol: 'WB',
            label: 'Peso Caja B = 40 lb',
            magnitude: 40,
            angleDeg: 270,
            direction: 'Hacia abajo (-Y)',
            color: '#ef4444',
            components: { fx: 0, fy: -40 },
          },
          {
            id: 'f_nb',
            name: 'NB',
            symbol: 'NB',
            label: 'Normal Superficie B = 13.68 lb',
            magnitude: 13.68,
            angleDeg: 160.0, // perpendicular a 70° (90 + 70 = 160°)
            direction: 'Perpendicular al plano B hacia afuera',
            color: '#3b82f6',
            components: { fx: -12.86, fy: 4.68 },
          },
          {
            id: 'f_ta',
            name: 'TA',
            symbol: 'TA',
            label: 'Tensión Cuerda A = 23.91 lb',
            magnitude: 23.91,
            angleDeg: 70.0, // a lo largo del plano hacia arriba
            direction: 'Hacia arriba a lo largo del plano B (70°)',
            color: '#10b981',
            components: { fx: 8.18, fy: 22.47 },
          },
          {
            id: 'f_tc_pull_b',
            name: 'TC',
            symbol: 'TC',
            label: 'Tensión Cuerda C que tira de B = 13.68 lb',
            magnitude: 13.68,
            angleDeg: 70.0, // asiste hacia arriba a la caja B o tira hacia D
            direction: 'A lo largo del cable de unión C',
            color: '#f59e0b',
            components: { fx: 4.68, fy: 12.86 },
          },
        ],
        equations: [
          'Plano B (inclinado a 70°):',
          'Componente perpendicular del peso: WB⊥ = WB · cos(70°) = 40 lb · cos(70°) = 13.68 lb',
          'ΣF⊥ = NB - WB · cos(70°) = 0  ⇒  NB = 13.68 lb',
          'Componente paralela del peso: WB∥ = WB · sen(70°) = 40 lb · sen(70°) = 37.59 lb',
          'ΣF∥ = TA + TC - WB · sen(70°) = 0  ⇒  TA = 37.5877 - 13.6808 = 23.91 lb',
        ],
        steps: [
          '1. Fuerzas perpendiculares al plano B:',
          '   NB = WB · cos(70°) = 40 · cos(70°) = 40 · 0.342020 = 13.68 lb',
          '2. Fuerzas paralelas al plano B (hacia abajo tiende a deslizarse con WB · sen(70°) = 40 · 0.939693 = 37.5877 lb):',
          '   La cuerda de enlace C tira con TC = 13.6808 lb.',
          '   La cuerda A anclada a la pared superior sostiene el resto:',
          '   TA = WB · sen(70°) - TC = 37.5877 - 13.6808 = 23.91 lb.',
        ],
      },
    ],
    results: [
      { name: 'TA', label: 'Tensión en la Cuerda A', value: '23.91 lb', numeric: 23.91, unit: 'lb' },
      { name: 'NB', label: 'Fuerza Normal sobre la Caja B', value: '13.68 lb', numeric: 13.68, unit: 'lb' },
      { name: 'TC', label: 'Tensión en Cable C (Enlace B-D)', value: '13.68 lb', numeric: 13.68, unit: 'lb' },
    ],
  },
];

/**
 * Helper to generate canvas elements for the Whiteboard
 * supports clean practice (cleanPractice: true) and full solved solution (cleanPractice: false)
 */
export function generateEquilibrioCanvasElements(exerciseNumber, cx = 600, cy = 400, options = {}) {
  const isClean = options.cleanPractice !== false;
  const exercise = EQUILIBRIO_EXERCISES.find((e) => e.number === Number(exerciseNumber)) || EQUILIBRIO_EXERCISES[0];
  const elements = [];

  // Generate main apparatus object
  const apparatusObj = createPhysicsElement('translational_equilibrium', cx, cy - 40, {
    exerciseNumber: exercise.number,
    systemTitle: exercise.title,
    apparatusType: exercise.apparatusType,
    showOfficialSolution: !isClean,
    userVectors: [],
    mass: exercise.mass || 61.22,
    width: 620,
    height: 400,
    label: isClean
      ? `Aparato Limpio (Práctica): ${exercise.title}`
      : `Sistema Físico y Equilibrio (Resuelto HT03 #${exercise.number})`,
  });

  elements.push(apparatusObj);

  return elements;
}
