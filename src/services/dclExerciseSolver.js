// =========================================================================
// DIAGRAMAS DE CUERPO LIBRE (DCL) - SOLUCIONADOR Y DATASET OFICIAL COMPLETO
// Basado en el documento oficial: "Unidad 3 - Física II - Quinto - HT02: Fuerzas y Diagramas de Cuerpo Libre"
// Colegio Kinal - Diversificado
// =========================================================================

import { createPhysicsElement } from '../physics/physicsRegistry';

/**
 * 5 Preguntas Conceptuales oficiales de la Hoja de Trabajo HT02 (Forma 1)
 */
export const DCL_THEORY_QUESTIONS = [
  {
    id: 'ht02_dcl_q1',
    number: 1,
    question: 'Un estudiante afirma: "Si un cuerpo se mueve, es porque tiene una fuerza que lo empuja en la dirección de su movimiento." Según lo estudiado, esta afirmación es:',
    options: [
      'Correcta, porque el movimiento siempre requiere una fuerza en su misma dirección.',
      'Incorrecta, porque la velocidad no es una fuerza y un cuerpo puede moverse sin fuerza neta actuando sobre él.',
      'Correcta solo si el cuerpo se mueve en línea recta.',
      'Incorrecta, porque solo el peso puede causar movimiento.',
    ],
    correctIndex: 1,
    explanation:
      'De acuerdo con la Primera Ley de Newton (Ley de la Inercia), si la fuerza neta resultante sobre un cuerpo es nula (ΣF = 0), el cuerpo permanece en reposo o continúa en Movimiento Rectilíneo Uniforme (MRU) con velocidad constante. La velocidad es un estado cinemático, no una fuerza; por lo tanto, no se requiere ninguna fuerza neta en la dirección del movimiento para que este continúe.',
  },
  {
    id: 'ht02_dcl_q2',
    number: 2,
    question: '¿Cuál de las siguientes NO es una razón válida para considerar la fuerza como una magnitud vectorial?',
    options: [
      'Porque se necesita conocer su dirección además de su magnitud.',
      'Porque se representa mediante una flecha.',
      'Porque su valor depende únicamente de la masa del cuerpo que la recibe.',
      'Porque dos fuerzas de igual magnitud pueden producir efectos distintos si apuntan en direcciones diferentes.',
    ],
    correctIndex: 2,
    explanation:
      'Una magnitud es vectorial porque posee módulo, dirección y sentido, sumándose según las reglas del álgebra vectorial. La afirmación (c) es falsa porque la fuerza no depende únicamente de la masa del receptor, sino de la interacción mutua entre dos cuerpos (3ra Ley de Newton), y además no define la naturaleza vectorial de una magnitud.',
  },
  {
    id: 'ht02_dcl_q3',
    number: 3,
    question: 'Un bloque descansa sobre una mesa horizontal y nadie más interactúa con él. ¿Qué par de fuerzas conforman su DCL, y a qué clasificación (contacto o a distancia) pertenece cada una?',
    options: [
      'Peso (contacto) y normal (a distancia).',
      'Peso (a distancia) y normal (contacto).',
      'Ambas son fuerzas de contacto.',
      'Ambas son fuerzas a distancia.',
    ],
    correctIndex: 1,
    explanation:
      'El Peso (W = m·g) es la atracción gravitacional que la Tierra ejerce sobre el bloque sin necesidad de tocarlo, por lo que es una fuerza a distancia. La Fuerza Normal (N) es la fuerza de soporte perpendicular que ejerce la superficie de la mesa sobre el bloque debido al contacto microscópico directo entre ambos, por lo que es una fuerza de contacto.',
  },
  {
    id: 'ht02_dcl_q4',
    number: 4,
    question: 'Un objeto es trasladado de la Tierra a la Luna, donde la gravedad es menor. ¿Qué ocurre con su masa y su peso?',
    options: [
      'Ambos disminuyen, porque son la misma magnitud física.',
      'La masa se mantiene igual y el peso disminuye, porque el peso depende de g.',
      'La masa disminuye y el peso se mantiene igual.',
      'Ambos se mantienen iguales, porque no dependen del lugar donde se mida.',
    ],
    correctIndex: 1,
    explanation:
      'La masa (m) es la medida intrínseca de la inercia y cantidad de materia del objeto, por lo que es constante en cualquier lugar del universo. El peso (W = m·g) depende de la aceleración gravitacional del astro; al ser la gravedad lunar aproximadamente 1.62 m/s² (1/6 de la terrestre), el peso disminuye notablemente.',
  },
  {
    id: 'ht02_dcl_q5',
    number: 5,
    question: '¿Cuál de las siguientes situaciones representa un error conceptual al construir un DCL, según las reglas de oro estudiadas?',
    options: [
      'Dibujar el peso como la primera fuerza del diagrama.',
      'Incluir en el DCL de un bloque una fuerza que dicho bloque ejerce sobre otro cuerpo.',
      'Girar los ejes coordenados cuando el cuerpo está en un plano inclinado.',
      'Omitir una fuerza cuyo origen no se puede identificar.',
    ],
    correctIndex: 1,
    explanation:
      'La Regla de Oro fundamental del DCL dicta que SOLO se dibujan las fuerzas externas que el entorno ejerce SOBRE el cuerpo analizado, y NUNCA las fuerzas que el cuerpo ejerce sobre otros cuerpos. Incluir fuerzas que el cuerpo ejerce viola el principio de aislamiento del DCL y genera sumatorias incorrectas.',
  },
];

/**
 * 11 Problemas de Aplicación oficiales de la Hoja de Trabajo HT02 (Forma 2)
 */
export const DCL_EXERCISES = [
  {
    id: 'dcl_p1',
    number: 1,
    title: 'Problema 1: Masa Suspendida por Dos Cuerdas Simétricas',
    subtitle: 'Simetría angular con respecto a la vertical',
    scenario:
      'Elabore el Diagrama de Cuerpo Libre (D.C.L.) para la masa suspendida por dos cuerdas que forman ángulos iguales α con respecto a la vertical.',
    criticalPoint: 'Masa suspendida (Punto de concurrencia)',
    bodies: [
      {
        bodyId: 'body_m',
        name: 'Masa Suspendida (m)',
        axes: 'Cartesianos Estándar (X horizontal, Y vertical)',
        forces: [
          { name: 'Peso', symbol: 'W', label: 'W = m·g', type: 'weight', origin: 'A distancia (Tierra)', angleDeg: 270, direction: 'Vertical hacia abajo (-Y)', color: '#ef4444' },
          { name: 'Tensión Cuerda 1', symbol: 'T₁', label: 'T₁', type: 'tension', origin: 'Contacto (Cuerda izquierda)', angleDeg: 125, direction: 'Hacia arriba e izquierda (ángulo α con vertical)', color: '#10b981' },
          { name: 'Tensión Cuerda 2', symbol: 'T₂', label: 'T₂', type: 'tension', origin: 'Contacto (Cuerda derecha)', angleDeg: 55, direction: 'Hacia arriba y derecha (ángulo α con vertical)', color: '#059669' },
        ],
        equations: [
          'ΣFx = T₂·sin(α) - T₁·sin(α) = 0  ⇒  T₁ = T₂ = T',
          'ΣFy = T₁·cos(α) + T₂·cos(α) - W = 0  ⇒  2T·cos(α) = W',
          'T = W / (2·cos α)',
        ],
        analysis: 'Por simetría física y geométrica, ambas cuerdas soportan exactamente la misma tensión. Cada cuerda aporta una componente vertical T·cos(α) para equilibrar el peso total W.',
      },
    ],
  },
  {
    id: 'dcl_p2',
    number: 2,
    apparatusType: 'table_two_masses',
    title: 'Problema 2: Masa en Mesa y Masa Suspendida',
    subtitle: 'Sistema de dos cuerpos ligados por cuerda ideal y polea',
    scenario:
      'Elabore el D.C.L. para la masa m₁ apoyada sobre la mesa horizontal y para la masa m₂ suspendida verticalmente.',
    criticalPoint: 'Masa m₁ (mayor número de interacciones concurrentes: normal, peso, tensión y fricción)',
    bodies: [
      {
        bodyId: 'body_m1',
        name: 'Bloque m₁ (Sobre la mesa)',
        axes: 'Cartesianos Estándar (X horizontal paralelo a la mesa, Y vertical)',
        forces: [
          { name: 'Peso de m₁', symbol: 'W₁', label: 'W₁ = m₁·g', type: 'weight', origin: 'A distancia (Tierra)', angleDeg: 270, direction: 'Hacia abajo (-Y)', color: '#ef4444' },
          { name: 'Fuerza Normal', symbol: 'N', label: 'N', type: 'normal', origin: 'Contacto (Superficie de la mesa)', angleDeg: 90, direction: 'Perpendicular hacia arriba (+Y)', color: '#3b82f6' },
          { name: 'Tensión de la Cuerda', symbol: 'T', label: 'T', type: 'tension', origin: 'Contacto (Cuerda conectada a m₂)', angleDeg: 0, direction: 'Horizontal hacia la derecha (+X)', color: '#10b981' },
          { name: 'Fuerza de Fricción (si existe)', symbol: 'fr', label: 'fr = μ·N', type: 'friction', origin: 'Contacto (Rugosidad de la mesa)', angleDeg: 180, direction: 'Horizontal hacia la izquierda (-X)', color: '#f59e0b' },
        ],
        equations: [
          'ΣFy = N - W₁ = 0  ⇒  N = m₁·g',
          'ΣFx = T - fr = m₁·a  (o T - fr = 0 en reposo)',
        ],
        analysis: 'El bloque m₁ experimenta 4 fuerzas en dos ejes ortogonales. La normal anula exactamente al peso W₁ en Y, mientras que la tensión T compite contra la fricción en X.',
      },
      {
        bodyId: 'body_m2',
        name: 'Masa m₂ (Suspendida en el aire)',
        axes: 'Cartesianos Estándar (Eje Y vertical)',
        forces: [
          { name: 'Peso de m₂', symbol: 'W₂', label: 'W₂ = m₂·g', type: 'weight', origin: 'A distancia (Tierra)', angleDeg: 270, direction: 'Hacia abajo (-Y)', color: '#ef4444' },
          { name: 'Tensión de la Cuerda', symbol: 'T', label: 'T', type: 'tension', origin: 'Contacto (Cuerda superior)', angleDeg: 90, direction: 'Hacia arriba (+Y)', color: '#10b981' },
        ],
        equations: [
          'ΣFx = 0 (No hay fuerzas en el eje horizontal)',
          'ΣFy = T - W₂ = -m₂·a  ⇒  W₂ - T = m₂·a  (o T = W₂ en equilibrio)',
        ],
        analysis: 'La masa m₂ no tiene contacto con ninguna superficie, por lo que NO existe fuerza normal. Solo actúan el peso y la tensión de la cuerda.',
      },
    ],
  },
  {
    id: 'dcl_p3',
    number: 3,
    title: 'Problema 3: Tres Bloques en Contacto Empujados por Fuerza F',
    subtitle: 'Fuerzas de contacto mutuo entre cuerpos contiguos (3ra Ley de Newton)',
    scenario:
      'Realice el D.C.L. de cada uno de los tres bloques (m₁, m₂, m₃) colocados en línea recta sobre una superficie horizontal y empujados por una fuerza F hacia la izquierda.',
    criticalPoint: 'Bloque m₂ (Punto crítico: recibe dos fuerzas de contacto opuestas N₁₂ y N₃₂ más peso y normal)',
    bodies: [
      {
        bodyId: 'body_m1',
        name: 'Bloque m₁ (Extremo izquierdo)',
        axes: 'Cartesianos Estándar',
        forces: [
          { name: 'Peso de m₁', symbol: 'W₁', label: 'W₁ = m₁·g', type: 'weight', origin: 'A distancia', angleDeg: 270, direction: 'Abajo (-Y)', color: '#ef4444' },
          { name: 'Normal N₁', symbol: 'N₁', label: 'N₁', type: 'normal', origin: 'Contacto (Suelo)', angleDeg: 90, direction: 'Arriba (+Y)', color: '#3b82f6' },
          { name: 'Fuerza de Contacto de m₂', symbol: 'F₂₁', label: 'F₂₁', type: 'applied', origin: 'Contacto (Bloque m₂ empuja a m₁)', angleDeg: 180, direction: 'Hacia la izquierda (-X)', color: '#8b5cf6' },
        ],
        equations: [
          'ΣFy = N₁ - W₁ = 0  ⇒  N₁ = m₁·g',
          'ΣFx = -F₂₁ = -m₁·a  ⇒  F₂₁ = m₁·a',
        ],
        analysis: 'El bloque m₁ no siente la fuerza F directamente; la fuerza impulsora le llega como contacto directo F₂₁ ejercida por el bloque vecino m₂.',
      },
      {
        bodyId: 'body_m2',
        name: 'Bloque m₂ (Bloque central)',
        axes: 'Cartesianos Estándar',
        forces: [
          { name: 'Peso de m₂', symbol: 'W₂', label: 'W₂ = m₂·g', type: 'weight', origin: 'A distancia', angleDeg: 270, direction: 'Abajo (-Y)', color: '#ef4444' },
          { name: 'Normal N₂', symbol: 'N₂', label: 'N₂', type: 'normal', origin: 'Contacto (Suelo)', angleDeg: 90, direction: 'Arriba (+Y)', color: '#3b82f6' },
          { name: 'Fuerza de Contacto de m₃', symbol: 'F₃₂', label: 'F₃₂', type: 'applied', origin: 'Contacto (Bloque m₃)', angleDeg: 180, direction: 'Izquierda (-X)', color: '#8b5cf6' },
          { name: 'Reacción de Contacto de m₁', symbol: 'F₁₂', label: 'F₁₂', type: 'applied', origin: 'Contacto (Reacción de m₁)', angleDeg: 0, direction: 'Derecha (+X)', color: '#06b6d4' },
        ],
        equations: [
          'ΣFy = N₂ - W₂ = 0  ⇒  N₂ = m₂·g',
          'ΣFx = F₁₂ - F₃₂ = -m₂·a  (F₃₂ - F₁₂ = m₂·a)',
        ],
        analysis: 'El bloque central transmite la fuerza. Por Tercera Ley de Newton: F₁₂ = F₂₁ (par de acción y reacción).',
      },
      {
        bodyId: 'body_m3',
        name: 'Bloque m₃ (Extremo derecho donde se aplica F)',
        axes: 'Cartesianos Estándar',
        forces: [
          { name: 'Peso de m₃', symbol: 'W₃', label: 'W₃ = m₃·g', type: 'weight', origin: 'A distancia', angleDeg: 270, direction: 'Abajo (-Y)', color: '#ef4444' },
          { name: 'Normal N₃', symbol: 'N₃', label: 'N₃', type: 'normal', origin: 'Contacto (Suelo)', angleDeg: 90, direction: 'Arriba (+Y)', color: '#3b82f6' },
          { name: 'Fuerza Externa Aplicada', symbol: 'F', label: 'F', type: 'applied', origin: 'Contacto (Agente externo)', angleDeg: 180, direction: 'Izquierda (-X)', color: '#7c3aed' },
          { name: 'Reacción de Contacto de m₂', symbol: 'F₂₃', label: 'F₂₃', type: 'applied', origin: 'Contacto (Reacción de m₂)', angleDeg: 0, direction: 'Derecha (+X)', color: '#06b6d4' },
        ],
        equations: [
          'ΣFy = N₃ - W₃ = 0  ⇒  N₃ = m₃·g',
          'ΣFx = F₂₃ - F = -m₃·a  ⇒  F - F₂₃ = m₃·a',
        ],
        analysis: 'Aquí actúa directamente la fuerza exterior F. F₂₃ es la resistencia que oponen los bloques anteriores.',
      },
    ],
  },
  {
    id: 'dcl_p4',
    number: 4,
    title: 'Problema 4: Bloque con Cuerda Fija y Fuerza Externa F',
    subtitle: 'Equilibrio estático con restricción fija',
    scenario:
      'Realice el D.C.L. del bloque apoyado en una superficie horizontal, retenido por una cuerda atada a la pared izquierda y sometido a una fuerza externa F horizontal hacia la derecha.',
    criticalPoint: 'Bloque central',
    bodies: [
      {
        bodyId: 'body_block',
        name: 'Bloque Retenido',
        axes: 'Cartesianos Estándar',
        forces: [
          { name: 'Peso', symbol: 'W', label: 'W = m·g', type: 'weight', origin: 'A distancia', angleDeg: 270, direction: 'Vertical abajo (-Y)', color: '#ef4444' },
          { name: 'Normal', symbol: 'N', label: 'N', type: 'normal', origin: 'Contacto (Mesa)', angleDeg: 90, direction: 'Vertical arriba (+Y)', color: '#3b82f6' },
          { name: 'Fuerza Aplicada', symbol: 'F', label: 'F', type: 'applied', origin: 'Contacto (Tracción externa)', angleDeg: 0, direction: 'Horizontal derecha (+X)', color: '#8b5cf6' },
          { name: 'Tensión Cuerda', symbol: 'T', label: 'T', type: 'tension', origin: 'Contacto (Cuerda fija)', angleDeg: 180, direction: 'Horizontal izquierda (-X)', color: '#10b981' },
          { name: 'Fuerza de Fricción', symbol: 'fr', label: 'fr', type: 'friction', origin: 'Contacto (Superficie)', angleDeg: 180, direction: 'Horizontal izquierda (-X)', color: '#f59e0b' },
        ],
        equations: [
          'ΣFy = N - W = 0  ⇒  N = W',
          'ΣFx = F - T - fr = 0  ⇒  T + fr = F',
        ],
        analysis: 'La tensión de la cuerda T y la fricción fr colaboran para equilibrar la fuerza externa F, manteniendo el bloque inmóvil.',
      },
    ],
  },
  {
    id: 'dcl_p5',
    number: 5,
    title: 'Problema 5: Bloque W y Nudo Concurrente "O"',
    subtitle: 'Análisis de equilibrio de nodos y cuerpos concurrentes',
    scenario:
      'Elabore el D.C.L. para el bloque W y para el punto (nudo) "O". El nudo O está unido a una cuerda horizontal fijada a la pared izquierda, una cuerda inclinada a 37° con el techo y sostiene al bloque W.',
    criticalPoint: 'Punto "O" (Punto Crítico: concurren 3 cuerdas con distintas orientaciones)',
    bodies: [
      {
        bodyId: 'body_W',
        name: 'Bloque W (Carga suspendida)',
        axes: 'Eje vertical Y',
        forces: [
          { name: 'Peso', symbol: 'W', label: 'W', type: 'weight', origin: 'A distancia', angleDeg: 270, direction: 'Abajo (-Y)', color: '#ef4444' },
          { name: 'Tensión Cuerda 3', symbol: 'T₃', label: 'T₃', type: 'tension', origin: 'Contacto (Cuerda vertical)', angleDeg: 90, direction: 'Arriba (+Y)', color: '#10b981' },
        ],
        equations: [
          'ΣFy = T₃ - W = 0  ⇒  T₃ = W',
        ],
        analysis: 'El bloque W transmite directamente su peso como tensión en la cuerda vertical 3: T₃ = W.',
      },
      {
        bodyId: 'node_O',
        name: 'Punto / Nudo "O" (Nodo Concurrente)',
        axes: 'Cartesianos Estándar',
        forces: [
          { name: 'Tensión Cuerda 1 (Horizontal)', symbol: 'T₁', label: 'T₁', type: 'tension', origin: 'Contacto (Pared izquierda)', angleDeg: 180, direction: 'Horizontal hacia la izquierda (-X)', color: '#10b981' },
          { name: 'Tensión Cuerda 2 (Inclinada 37°)', symbol: 'T₂', label: 'T₂ (37°)', type: 'tension', origin: 'Contacto (Techo derecho)', angleDeg: 37, direction: 'Hacia arriba y derecha a 37° (+X, +Y)', color: '#059669' },
          { name: 'Tensión Cuerda 3 (Vertical)', symbol: 'T₃', label: 'T₃ = W', type: 'tension', origin: 'Contacto (Cuerda bloque W)', angleDeg: 270, direction: 'Vertical hacia abajo (-Y)', color: '#14b8a6' },
        ],
        equations: [
          'ΣFx = T₂·cos(37°) - T₁ = 0  ⇒  T₁ = T₂·cos(37°)',
          'ΣFy = T₂·sin(37°) - W = 0  ⇒  T₂ = W / sin(37°) = W / 0.6018 = 1.66·W',
          'T₁ = (1.66·W)·cos(37°) = 1.33·W',
        ],
        analysis: 'El nodo O no tiene masa (punto geométrico ideal), por lo que la suma vectorial de tensiones debe anularse rigurosamente: ΣFx = 0 y ΣFy = 0.',
      },
    ],
  },
  {
    id: 'dcl_p6',
    number: 6,
    title: 'Problema 6: Bloque Q en Plano Inclinado (37°) y Bloque P Colgante',
    subtitle: 'Rotación de ejes coordenados en planos inclinados',
    scenario:
      'Construya el D.C.L. para los bloques P (suspendido) y Q (sobre rampa inclinada a 37° con la horizontal), unidos mediante una cuerda que pasa por una polea en la cúspide.',
    criticalPoint: 'Bloque Q (Requiere rotación de ejes a 37° y descomposición del peso en Qx y Qy)',
    bodies: [
      {
        bodyId: 'body_P',
        name: 'Bloque P (Colgante)',
        axes: 'Cartesianos Estándar (Eje vertical Y)',
        forces: [
          { name: 'Peso de P', symbol: 'WP', label: 'WP = mP·g', type: 'weight', origin: 'A distancia', angleDeg: 270, direction: 'Abajo (-Y)', color: '#ef4444' },
          { name: 'Tensión', symbol: 'T', label: 'T', type: 'tension', origin: 'Contacto (Cuerda)', angleDeg: 90, direction: 'Arriba (+Y)', color: '#10b981' },
        ],
        equations: [
          'ΣFy = T - WP = mP·a  (o T = WP en equilibrio)',
        ],
        analysis: 'El bloque P se mueve verticalmente sin restricción lateral.',
      },
      {
        bodyId: 'body_Q',
        name: 'Bloque Q (Sobre Plano Inclinado 37°)',
        axes: 'Ejes Rotados a 37° (X paralelo a la rampa hacia arriba, Y perpendicular a la rampa hacia afuera)',
        forces: [
          { name: 'Fuerza Normal', symbol: 'N', label: 'N', type: 'normal', origin: 'Contacto (Superficie de la rampa)', angleDeg: 90, direction: 'Perpendicular a la rampa (+Y rotado)', color: '#3b82f6' },
          { name: 'Tensión de la Cuerda', symbol: 'T', label: 'T', type: 'tension', origin: 'Contacto (Cuerda hacia polea)', angleDeg: 0, direction: 'Paralelo a la rampa hacia arriba (+X rotado)', color: '#10b981' },
          { name: 'Componente Normal del Peso', symbol: 'WQy', label: 'WQ·cos(37°)', type: 'weight', origin: 'Descomposición del Peso', angleDeg: 270, direction: 'Hacia adentro de la rampa (-Y rotado)', color: '#ef4444' },
          { name: 'Componente Tangencial del Peso', symbol: 'WQx', label: 'WQ·sin(37°)', type: 'weight', origin: 'Descomposición del Peso', angleDeg: 180, direction: 'Rampa abajo (-X rotado)', color: '#dc2626' },
          { name: 'Fuerza de Fricción', symbol: 'fr', label: 'fr', type: 'friction', origin: 'Contacto (Rampa)', angleDeg: 180, direction: 'Opuesta a la tendencia de movimiento', color: '#f59e0b' },
        ],
        equations: [
          'ΣFy = N - WQ·cos(37°) = 0  ⇒  N = WQ·cos(37°) = 0.7986·WQ',
          'ΣFx = T - WQ·sin(37°) - fr = mQ·a  ⇒  WQx = WQ·sin(37°) = 0.6018·WQ',
        ],
        analysis: 'Al girar los ejes 37°, la aceleración y 3 de las fuerzas quedan alineadas con X o Y. Solo el peso vertical se descompone: WQx = WQ·sin(37°) y WQy = WQ·cos(37°).',
      },
    ],
  },
  {
    id: 'dcl_p7',
    number: 7,
    title: 'Problema 7: Dos Bloques Colgados en Serie Vertical (A y B)',
    subtitle: 'Tensiones escalonadas en suspensión vertical',
    scenario:
      'Realiza el D.C.L. para los bloques A y B colgados en serie vertical mediante cuerdas fijadas a un soporte superior.',
    criticalPoint: 'Bloque A (Soporta su propio peso más la tracción de la cuerda que sostiene a B)',
    bodies: [
      {
        bodyId: 'body_B',
        name: 'Bloque B (Inferior)',
        axes: 'Eje vertical Y',
        forces: [
          { name: 'Peso de B', symbol: 'WB', label: 'WB = mB·g', type: 'weight', origin: 'A distancia', angleDeg: 270, direction: 'Abajo (-Y)', color: '#ef4444' },
          { name: 'Tensión Cuerda 2', symbol: 'T₂', label: 'T₂', type: 'tension', origin: 'Contacto (Cuerda intermedia)', angleDeg: 90, direction: 'Arriba (+Y)', color: '#10b981' },
        ],
        equations: [
          'ΣFy = T₂ - WB = 0  ⇒  T₂ = WB',
        ],
        analysis: 'El bloque inferior B solo está sostenido por la cuerda 2, por lo que T₂ es igual a su peso WB.',
      },
      {
        bodyId: 'body_A',
        name: 'Bloque A (Superior)',
        axes: 'Eje vertical Y',
        forces: [
          { name: 'Peso de A', symbol: 'WA', label: 'WA = mA·g', type: 'weight', origin: 'A distancia', angleDeg: 270, direction: 'Abajo (-Y)', color: '#ef4444' },
          { name: 'Tensión Cuerda 2 (Tira hacia abajo)', symbol: 'T₂', label: 'T₂', type: 'tension', origin: 'Contacto (Cuerda que cuelga hacia B)', angleDeg: 270, direction: 'Abajo (-Y)', color: '#059669' },
          { name: 'Tensión Cuerda 1 (Soporta todo)', symbol: 'T₁', label: 'T₁', type: 'tension', origin: 'Contacto (Cuerda fijada al techo)', angleDeg: 90, direction: 'Arriba (+Y)', color: '#10b981' },
        ],
        equations: [
          'ΣFy = T₁ - WA - T₂ = 0  ⇒  T₁ = WA + T₂ = WA + WB = (mA + mB)·g',
        ],
        analysis: 'La cuerda 2 tira hacia abajo del bloque A con la misma fuerza que tira hacia arriba del bloque B (3ra Ley de Newton). La cuerda superior 1 soporta el peso combinado de ambos bloques.',
      },
    ],
  },
  {
    id: 'dcl_p8',
    number: 8,
    title: 'Problema 8: Bloques A, B y C en Doble Rampa Inclinada',
    subtitle: 'Sistema triple acoplado con dos planos inclinados opuestos',
    scenario:
      'Realiza el D.C.L. para los bloques A, B y C. Los bloques A y C descansan en rampas inclinadas opuestas y están unidos al bloque central B mediante cuerdas que pasan por poleas.',
    criticalPoint: 'Bloque B (Concurren dos tensiones de cuerdas opuestas T₁ y T₂)',
    bodies: [
      {
        bodyId: 'body_A',
        name: 'Bloque A (Rampa izquierda)',
        axes: 'Ejes rotados a θA',
        forces: [
          { name: 'Normal NA', symbol: 'NA', label: 'NA', type: 'normal', origin: 'Contacto', angleDeg: 90, direction: 'Perpendicular a rampa A', color: '#3b82f6' },
          { name: 'Tensión 1', symbol: 'T₁', label: 'T₁', type: 'tension', origin: 'Contacto (Cuerda 1)', angleDeg: 0, direction: 'Rampa arriba', color: '#10b981' },
          { name: 'Componente Peso WAy', symbol: 'WAy', label: 'WA·cos(θA)', type: 'weight', origin: 'Descomposición', angleDeg: 270, direction: 'Rampa adentro', color: '#ef4444' },
          { name: 'Componente Peso WAx', symbol: 'WAx', label: 'WA·sin(θA)', type: 'weight', origin: 'Descomposición', angleDeg: 180, direction: 'Rampa abajo', color: '#dc2626' },
        ],
        equations: ['ΣFy = NA - WA·cos(θA) = 0', 'ΣFx = T₁ - WA·sin(θA) - frA = mA·a'],
        analysis: 'El bloque A equilibra su peso en el plano izquierdo contra la tensión T₁.',
      },
      {
        bodyId: 'body_B',
        name: 'Bloque B (Plataforma horizontal central)',
        axes: 'Cartesianos Estándar',
        forces: [
          { name: 'Peso WB', symbol: 'WB', label: 'WB', type: 'weight', origin: 'A distancia', angleDeg: 270, direction: 'Abajo (-Y)', color: '#ef4444' },
          { name: 'Normal NB', symbol: 'NB', label: 'NB', type: 'normal', origin: 'Contacto (Mesa)', angleDeg: 90, direction: 'Arriba (+Y)', color: '#3b82f6' },
          { name: 'Tensión 1 (Izquierda)', symbol: 'T₁', label: 'T₁', type: 'tension', origin: 'Contacto (Cuerda A)', angleDeg: 180, direction: 'Izquierda (-X)', color: '#10b981' },
          { name: 'Tensión 2 (Derecha)', symbol: 'T₂', label: 'T₂', type: 'tension', origin: 'Contacto (Cuerda C)', angleDeg: 0, direction: 'Derecha (+X)', color: '#059669' },
          { name: 'Fricción frB', symbol: 'frB', label: 'frB', type: 'friction', origin: 'Contacto', angleDeg: 180, direction: 'Opuesta a aceleración', color: '#f59e0b' },
        ],
        equations: ['ΣFy = NB - WB = 0', 'ΣFx = T₂ - T₁ - frB = mB·a'],
        analysis: 'El bloque central B actúa como nudo de transmisión entre las dos cuerdas.',
      },
      {
        bodyId: 'body_C',
        name: 'Bloque C (Rampa derecha)',
        axes: 'Ejes rotados a θC',
        forces: [
          { name: 'Normal NC', symbol: 'NC', label: 'NC', type: 'normal', origin: 'Contacto', angleDeg: 90, direction: 'Perpendicular a rampa C', color: '#3b82f6' },
          { name: 'Tensión 2', symbol: 'T₂', label: 'T₂', type: 'tension', origin: 'Contacto (Cuerda 2)', angleDeg: 180, direction: 'Rampa arriba', color: '#059669' },
          { name: 'Componente Peso WCy', symbol: 'WCy', label: 'WC·cos(θC)', type: 'weight', origin: 'Descomposición', angleDeg: 270, direction: 'Rampa adentro', color: '#ef4444' },
          { name: 'Componente Peso WCx', symbol: 'WCx', label: 'WC·sin(θC)', type: 'weight', origin: 'Descomposición', angleDeg: 0, direction: 'Rampa abajo', color: '#dc2626' },
        ],
        equations: ['ΣFy = NC - WC·cos(θC) = 0', 'ΣFx = WC·sin(θC) - T₂ - frC = mC·a'],
        analysis: 'El bloque C jala al sistema con su componente tangencial WC·sin(θC).',
      },
    ],
  },
  {
    id: 'dcl_p9',
    number: 9,
    title: 'Problema 9: Dos Masas en Contacto m₁ y m₂ Empujadas por F',
    subtitle: 'Fuerza normal de contacto entre dos bloques sólidos',
    scenario:
      'Elabore el D.C.L. para cada masa (m₁ y m₂) en contacto mutuo sobre un plano horizontal, sometidas a una fuerza horizontal F aplicada sobre m₁.',
    criticalPoint: 'Interfase de contacto entre m₁ y m₂',
    bodies: [
      {
        bodyId: 'body_m1',
        name: 'Masa m₁ (Recibe fuerza F)',
        axes: 'Cartesianos Estándar',
        forces: [
          { name: 'Peso W₁', symbol: 'W₁', label: 'W₁ = m₁·g', type: 'weight', origin: 'A distancia', angleDeg: 270, direction: 'Abajo (-Y)', color: '#ef4444' },
          { name: 'Normal N₁', symbol: 'N₁', label: 'N₁', type: 'normal', origin: 'Contacto (Piso)', angleDeg: 90, direction: 'Arriba (+Y)', color: '#3b82f6' },
          { name: 'Fuerza Externa F', symbol: 'F', label: 'F', type: 'applied', origin: 'Contacto (Agente)', angleDeg: 0, direction: 'Derecha (+X)', color: '#8b5cf6' },
          { name: 'Fuerza de Contacto N₂₁', symbol: 'N₂₁', label: 'N₂₁', type: 'applied', origin: 'Contacto (Reacción de m₂)', angleDeg: 180, direction: 'Izquierda (-X)', color: '#06b6d4' },
        ],
        equations: ['ΣFy = N₁ - W₁ = 0', 'ΣFx = F - N₂₁ = m₁·a'],
        analysis: 'El bloque m₁ acelera por la diferencia entre la fuerza F y la resistencia N₂₁ que le opone m₂.',
      },
      {
        bodyId: 'body_m2',
        name: 'Masa m₂ (Empujada por contacto)',
        axes: 'Cartesianos Estándar',
        forces: [
          { name: 'Peso W₂', symbol: 'W₂', label: 'W₂ = m₂·g', type: 'weight', origin: 'A distancia', angleDeg: 270, direction: 'Abajo (-Y)', color: '#ef4444' },
          { name: 'Normal N₂', symbol: 'N₂', label: 'N₂', type: 'normal', origin: 'Contacto (Piso)', angleDeg: 90, direction: 'Arriba (+Y)', color: '#3b82f6' },
          { name: 'Fuerza de Contacto N₁₂', symbol: 'N₁₂', label: 'N₁₂', type: 'applied', origin: 'Contacto (Acción de m₁)', angleDeg: 0, direction: 'Derecha (+X)', color: '#06b6d4' },
        ],
        equations: ['ΣFy = N₂ - W₂ = 0', 'ΣFx = N₁₂ = m₂·a'],
        analysis: 'La única fuerza horizontal sobre m₂ es la normal de contacto N₁₂ ejercida por m₁. Por 3ra Ley: N₁₂ = N₂₁.',
      },
    ],
  },
  {
    id: 'dcl_p10',
    number: 10,
    title: 'Problema 10: Sistema con Polea Móvil y Fuerza F Horizontal',
    subtitle: 'Ventaja mecánica y duplicación de tensión en poleas móviles',
    scenario:
      'Realice el D.C.L. para las masas y las poleas en el sistema con polea móvil unida a m₁ y fuerza F horizontal aplicada sobre m₂.',
    criticalPoint: 'Polea móvil (Concurren 2 ramas de cuerda con tensión T hacia la izquierda y tracción hacia m₁)',
    bodies: [
      {
        bodyId: 'body_m1',
        name: 'Masa m₁ (Conectada al eje de la polea móvil)',
        axes: 'Cartesianos Estándar',
        forces: [
          { name: 'Peso W₁', symbol: 'W₁', label: 'W₁ = m₁·g', type: 'weight', origin: 'A distancia', angleDeg: 270, direction: 'Abajo (-Y)', color: '#ef4444' },
          { name: 'Normal N₁', symbol: 'N₁', label: 'N₁', type: 'normal', origin: 'Contacto', angleDeg: 90, direction: 'Arriba (+Y)', color: '#3b82f6' },
          { name: 'Fuerza de la Polea (2T)', symbol: '2T', label: '2·T', type: 'tension', origin: 'Contacto (Enganche de polea móvil)', angleDeg: 0, direction: 'Derecha (+X)', color: '#10b981' },
          { name: 'Fricción fr₁', symbol: 'fr₁', label: 'fr₁', type: 'friction', origin: 'Contacto', angleDeg: 180, direction: 'Izquierda (-X)', color: '#f59e0b' },
        ],
        equations: ['ΣFy = N₁ - W₁ = 0', 'ΣFx = 2·T - fr₁ = m₁·a₁'],
        analysis: 'Debido a la polea móvil, la masa m₁ recibe el doble de tensión (2T) pero con la mitad de aceleración (a₁ = a₂ / 2).',
      },
      {
        bodyId: 'body_pulley',
        name: 'Polea Móvil (Elemento de transmisión)',
        axes: 'Cartesianos Estándar',
        forces: [
          { name: 'Tensión Rama Superior', symbol: 'T', label: 'T', type: 'tension', origin: 'Contacto (Cuerda)', angleDeg: 180, direction: 'Izquierda (-X)', color: '#10b981' },
          { name: 'Tensión Rama Inferior', symbol: 'T', label: 'T', type: 'tension', origin: 'Contacto (Cuerda)', angleDeg: 180, direction: 'Izquierda (-X)', color: '#10b981' },
          { name: 'Fuerza hacia Bloque m₁', symbol: 'F_eje', label: 'F_eje = 2·T', type: 'applied', origin: 'Contacto (Eje central)', angleDeg: 0, direction: 'Derecha (+X)', color: '#059669' },
        ],
        equations: ['ΣFx = F_eje - 2·T = 0  ⇒  F_eje = 2·T'],
        analysis: 'Para una polea ideal sin masa ni fricción, la suma de fuerzas es cero en todo instante.',
      },
      {
        bodyId: 'body_m2',
        name: 'Masa m₂ (Recibe fuerza aplicada F)',
        axes: 'Cartesianos Estándar',
        forces: [
          { name: 'Peso W₂', symbol: 'W₂', label: 'W₂ = m₂·g', type: 'weight', origin: 'A distancia', angleDeg: 270, direction: 'Abajo (-Y)', color: '#ef4444' },
          { name: 'Normal N₂', symbol: 'N₂', label: 'N₂', type: 'normal', origin: 'Contacto', angleDeg: 90, direction: 'Arriba (+Y)', color: '#3b82f6' },
          { name: 'Fuerza Aplicada F', symbol: 'F', label: 'F', type: 'applied', origin: 'Contacto (Tracción)', angleDeg: 0, direction: 'Derecha (+X)', color: '#8b5cf6' },
          { name: 'Tensión Cuerda', symbol: 'T', label: 'T', type: 'tension', origin: 'Contacto (Cuerda de polea)', angleDeg: 180, direction: 'Izquierda (-X)', color: '#10b981' },
        ],
        equations: ['ΣFy = N₂ - W₂ = 0', 'ΣFx = F - T = m₂·a₂'],
        analysis: 'La masa m₂ jala de la cuerda móvil con tensión T mientras es impulsada por F.',
      },
    ],
  },
  {
    id: 'dcl_p11',
    number: 11,
    apparatusType: 'table_three_masses',
    title: 'Problema 11: Mesa con Fricción (μc = 0.20) y Tres Masas (6 kg, 10 kg, 9 kg)',
    subtitle: 'Ejercicio cuantitativo completo con cálculo de aceleración y tensiones',
    scenario:
      'Construya el D.C.L. para cada una de las tres masas: m₁ = 6.0 kg colgando a la izquierda, m₂ = 10 kg sobre mesa con μc = 0.20, y m₃ = 9.0 kg colgando a la derecha.',
    criticalPoint: 'Masa central m₂ (Sometida a 5 fuerzas concurrentes: N, W₂, T₁, T₂ y fuerza de fricción cinética fk)',
    givenData: {
      m1: '6.0 kg',
      m2: '10.0 kg',
      m3: '9.0 kg',
      mu_c: '0.20',
      g: '9.80 m/s²',
    },
    numericalResults: {
      W1: '58.80 N',
      W2: '98.00 N',
      W3: '88.20 N',
      N2: '98.00 N',
      fk: '19.60 N',
      netForce: '9.80 N',
      totalMass: '25.0 kg',
      acceleration: '0.392 m/s²',
      T1: '61.15 N',
      T2: '84.67 N',
      motionDirection: 'Hacia la derecha (m₃ desciende, m₁ asciende)',
    },
    bodies: [
      {
        bodyId: 'body_m1',
        name: 'Masa m₁ = 6.0 kg (Colgante izquierda)',
        axes: 'Eje vertical Y (Asciende con aceleración +a)',
        forces: [
          { name: 'Peso W₁', symbol: 'W₁', label: 'W₁ = 58.80 N', type: 'weight', origin: 'A distancia', magnitude: 58.80, angleDeg: 270, direction: 'Abajo (-Y)', color: '#ef4444' },
          { name: 'Tensión Cuerda 1', symbol: 'T₁', label: 'T₁ = 61.15 N', type: 'tension', origin: 'Contacto (Cuerda izquierda)', magnitude: 61.15, angleDeg: 90, direction: 'Arriba (+Y)', color: '#10b981' },
        ],
        equations: [
          'ΣFy = T₁ - W₁ = m₁·a  ⇒  T₁ = m₁·(g + a) = 6.0·(9.80 + 0.392) = 61.15 N',
        ],
        analysis: 'Como el sistema se acelera hacia la derecha, m₁ sube; por tanto T₁ > W₁.',
      },
      {
        bodyId: 'body_m2',
        name: 'Masa m₂ = 10 kg (Mesa con fricción μc = 0.20)',
        axes: 'Cartesianos Estándar (Se acelera hacia la derecha +X)',
        forces: [
          { name: 'Peso W₂', symbol: 'W₂', label: 'W₂ = 98.00 N', type: 'weight', origin: 'A distancia', magnitude: 98.00, angleDeg: 270, direction: 'Abajo (-Y)', color: '#ef4444' },
          { name: 'Fuerza Normal', symbol: 'N', label: 'N = 98.00 N', type: 'normal', origin: 'Contacto (Mesa)', magnitude: 98.00, angleDeg: 90, direction: 'Arriba (+Y)', color: '#3b82f6' },
          { name: 'Tensión Cuerda 2', symbol: 'T₂', label: 'T₂ = 84.67 N', type: 'tension', origin: 'Contacto (Cuerda derecha)', magnitude: 84.67, angleDeg: 0, direction: 'Derecha (+X)', color: '#059669' },
          { name: 'Tensión Cuerda 1', symbol: 'T₁', label: 'T₁ = 61.15 N', type: 'tension', origin: 'Contacto (Cuerda izquierda)', magnitude: 61.15, angleDeg: 180, direction: 'Izquierda (-X)', color: '#10b981' },
          { name: 'Fricción Cinética', symbol: 'fk', label: 'fk = 19.60 N', type: 'friction', origin: 'Contacto (Mesa rugosa)', magnitude: 19.60, angleDeg: 180, direction: 'Izquierda (-X, opuesta al movimiento)', color: '#f59e0b' },
        ],
        equations: [
          'ΣFy = N - W₂ = 0  ⇒  N = 98.00 N',
          'fk = μc · N = 0.20 · 98.00 N = 19.60 N',
          'ΣFx = T₂ - T₁ - fk = m₂·a  ⇒  84.67 - 61.15 - 19.60 = 3.92 N = 10·(0.392)',
        ],
        analysis: 'El bloque m₂ es el punto de máxima concurrencia de fuerzas del sistema completo. La fricción fk apunta hacia la izquierda porque el movimiento ocurre hacia la derecha.',
      },
      {
        bodyId: 'body_m3',
        name: 'Masa m₃ = 9.0 kg (Colgante derecha)',
        axes: 'Eje vertical Y (Desciende con aceleración +a)',
        forces: [
          { name: 'Peso W₃', symbol: 'W₃', label: 'W₃ = 88.20 N', type: 'weight', origin: 'A distancia', magnitude: 88.20, angleDeg: 270, direction: 'Abajo (-Y)', color: '#ef4444' },
          { name: 'Tensión Cuerda 2', symbol: 'T₂', label: 'T₂ = 84.67 N', type: 'tension', origin: 'Contacto (Cuerda derecha)', magnitude: 84.67, angleDeg: 90, direction: 'Arriba (+Y)', color: '#059669' },
        ],
        equations: [
          'ΣFy = W₃ - T₂ = m₃·a  ⇒  T₂ = m₃·(g - a) = 9.0·(9.80 - 0.392) = 84.67 N',
        ],
        analysis: 'La masa m₃ baja acelerando; por lo tanto, su peso supera a la tensión de la cuerda: W₃ > T₂.',
      },
    ],
  },
  {
    id: 'dcl_p12',
    number: 12,
    title: 'Problema 12: Grúa con Carga de 1200 lb y Punto Crítico "C"',
    subtitle: 'Análisis de equilibrio concurrente en maquinaria pesada',
    scenario:
      'Elabore el D.C.L. para el punto "C". La grúa soporta una carga de 1200 lb suspendida en C. El aguilón/pluma A forma un ángulo de 5° con la vertical, y el cable tensor hacia el operador B forma un ángulo α con la horizontal.',
    criticalPoint: 'Punto C (Punto Crítico del sistema: nodo concurrente donde se cruzan la pluma A, el cable tensor B y la carga de 1200 lb)',
    bodies: [
      {
        bodyId: 'node_C',
        name: 'Punto / Nodo Crítico "C"',
        axes: 'Cartesianos Estándar (X horizontal, Y vertical)',
        forces: [
          { name: 'Carga Suspendida', symbol: 'W', label: 'W = 1200 lb', type: 'weight', origin: 'A distancia (Gravedad sobre carga)', magnitude: 1200, angleDeg: 270, direction: 'Vertical hacia abajo (-Y)', color: '#ef4444' },
          { name: 'Fuerza de la Pluma A', symbol: 'FA', label: 'FA (Pluma, 5° con vertical)', type: 'applied', origin: 'Contacto (Compresión de la pluma metálica)', angleDeg: 95, direction: 'Hacia arriba e inclinada 5° con vertical (+Y, -X)', color: '#3b82f6' },
          { name: 'Tensión del Cable B', symbol: 'TB', label: 'TB (Cable hacia B a ángulo α)', type: 'tension', origin: 'Contacto (Cable de acero hacia operador)', angleDeg: 340, direction: 'Hacia abajo y derecha con ángulo α (-Y, +X)', color: '#10b981' },
        ],
        equations: [
          'ΣFx = -FA·sin(5°) + TB·cos(α) = 0  ⇒  TB·cos(α) = FA·sin(5°)',
          'ΣFy = FA·cos(5°) - TB·sin(α) - 1200 lb = 0',
          'FA·cos(5°) - [FA·sin(5°) / cos(α)]·sin(α) = 1200 lb',
        ],
        analysis: 'El punto C es el punto crítico de falla de la estructura. Al concurrir en él las tres fuerzas mayores del sistema (peso de 1200 lb, empuje axial de la pluma y tracción del cable tensor), su análisis determina la estabilidad o colapso de la grúa.',
      },
    ],
  },
];

/**
 * Generates whiteboard elements for placing a complete DCL system and diagram on the canvas
 */
export function generateDclCanvasElements(exerciseNumber = 1, cx = 400, cy = 300, options = {}) {
  const exercise = DCL_EXERCISES.find((e) => e.number === exerciseNumber) || DCL_EXERCISES[0];
  const elements = [];
  const isClean = !!options.cleanPractice;

  // 1. If exercise has a dedicated physical apparatus (e.g. Table with 3 masses), generate the apparatus first
  if (exercise.apparatusType === 'table_three_masses' || exercise.number === 11) {
    const apparatus = createPhysicsElement('dcl_diagram', cx, cy - 80, {
      apparatusType: 'table_three_masses',
      width: 680,
      height: 390,
      exerciseNumber: exercise.number,
      systemTitle: exercise.title,
      showOfficialSolution: !isClean,
      userVectors: [],
      label: isClean ? 'Mesa con 3 Masas (Práctica de DCL)' : 'Sistema Físico y DCL: Mesa con 3 Masas (HT02 #10)',
    });
    elements.push(apparatus);

    // If clean practice is NOT selected, also place individual isolated body DCL cards underneath
    if (!isClean) {
      const bodyCount = exercise.bodies.length;
      const spacingX = 300;
      const startX = cx - ((bodyCount - 1) * spacingX) / 2;
      const posY = cy + 270;

      exercise.bodies.forEach((body, idx) => {
        const posX = startX + idx * spacingX;
        const dclObj = createPhysicsElement('dcl_diagram', posX, posY, {
          exerciseNumber: exercise.number,
          systemTitle: exercise.title,
          bodyName: body.name,
          axisAngleDeg: 0,
          forces: body.forces.map((f, fIdx) => ({
            id: `f_${fIdx}`,
            name: f.symbol,
            label: f.label,
            type: f.type,
            origin: f.origin,
            magnitude: f.magnitude || 50,
            angleDeg: f.angleDeg,
            direction: f.direction,
            color: f.color,
          })),
          equations: body.equations,
          criticalPoint: exercise.criticalPoint,
          showComponents: true,
          showEquations: true,
          showGrid: true,
          label: `DCL: ${body.name}`,
        });
        elements.push(dclObj);
      });
    }

    return elements;
  }

  if (exercise.apparatusType === 'table_two_masses' || exercise.number === 2) {
    const apparatus = createPhysicsElement('dcl_diagram', cx, cy - 60, {
      apparatusType: 'table_two_masses',
      width: 560,
      height: 350,
      exerciseNumber: exercise.number,
      systemTitle: exercise.title,
      showOfficialSolution: !isClean,
      userVectors: [],
      label: isClean ? 'Mesa con 2 Masas (Práctica de DCL)' : 'Sistema Físico y DCL: Mesa con 2 Masas (HT02 #2)',
    });
    elements.push(apparatus);

    if (!isClean) {
      const bodyCount = exercise.bodies.length;
      const spacingX = 300;
      const startX = cx - ((bodyCount - 1) * spacingX) / 2;
      const posY = cy + 250;

      exercise.bodies.forEach((body, idx) => {
        const posX = startX + idx * spacingX;
        const dclObj = createPhysicsElement('dcl_diagram', posX, posY, {
          exerciseNumber: exercise.number,
          systemTitle: exercise.title,
          bodyName: body.name,
          axisAngleDeg: 0,
          forces: body.forces.map((f, fIdx) => ({
            id: `f_${fIdx}`,
            name: f.symbol,
            label: f.label,
            type: f.type,
            origin: f.origin,
            magnitude: f.magnitude || 50,
            angleDeg: f.angleDeg,
            direction: f.direction,
            color: f.color,
          })),
          equations: body.equations,
          criticalPoint: exercise.criticalPoint,
          showComponents: true,
          showEquations: true,
          showGrid: true,
          label: `DCL: ${body.name}`,
        });
        elements.push(dclObj);
      });
    }

    return elements;
  }

  // Generate a DCL diagram object for each body in the exercise
  const bodyCount = exercise.bodies.length;
  const spacingX = 320;
  const startX = cx - ((bodyCount - 1) * spacingX) / 2;

  exercise.bodies.forEach((body, idx) => {
    const posX = startX + idx * spacingX;
    const posY = cy;

    let axisAngle = 0;
    if (body.axes.includes('37°')) axisAngle = 37;

    const dclObj = createPhysicsElement('dcl_diagram', posX, posY, {
      exerciseNumber: exercise.number,
      systemTitle: exercise.title,
      bodyName: body.name,
      axisAngleDeg: axisAngle,
      forces: body.forces.map((f, fIdx) => ({
        id: `f_${fIdx}`,
        name: f.symbol,
        label: f.label,
        type: f.type,
        origin: f.origin,
        magnitude: f.magnitude || 50,
        angleDeg: f.angleDeg,
        direction: f.direction,
        color: f.color,
      })),
      equations: body.equations,
      criticalPoint: exercise.criticalPoint,
      showComponents: true,
      showEquations: true,
      showGrid: true,
      label: `DCL: ${body.name}`,
    });

    elements.push(dclObj);
  });

  return elements;
}
