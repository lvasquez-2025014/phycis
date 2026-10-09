// =========================================================================
// SEGUNDA LEY DE NEWTON – DINÁMICA SIN FRICCIÓN (Y SISTEMAS CONECTADOS)
// Hoja de Trabajo Oficial HT01: Unidad 4 - Física II - Quinto Diversificado
// Colegio Kinal - Diversificado
// =========================================================================

import { createPhysicsElement } from '../physics/physicsRegistry';

/**
 * Forma 1 – 4 PREGUNTAS CONCEPTUALES OFICIALES (HT01 Unidad 4)
 */
export const NEWTON_THEORY_QUESTIONS = [
  {
    id: 'ht01_newton_q1',
    number: 1,
    question:
      'Kevin empuja un carrito vacío y nota que acelera fácilmente. Luego coloca varias cajas dentro del carrito y aplica la misma fuerza, observando que ahora acelera menos. ¿Cuál es la mejor explicación para este comportamiento?',
    options: [
      'a) El peso del carrito disminuyó.',
      'b) La masa aumentó y, con la misma fuerza, la aceleración disminuye.',
      'c) La gravedad aumentó.',
      'd) La fuerza aplicada se transformó en energía potencial.',
    ],
    correctIndex: 1,
    formula: 'a = \\frac{F}{m} \\implies m \\uparrow \\implies a \\downarrow \\quad (\\text{Fuerza constante})',
    explanation:
      'La Segunda Ley de Newton establece que la aceleración es inversamente proporcional a la masa del cuerpo (a = F/m). Al agregar cajas al carrito, su masa total inercial aumenta significativamente. Al mantener constante la fuerza de empuje aplicada por Kevin, la aceleración resultante debe disminuir de forma inversamente proporcional.',
  },
  {
    id: 'ht01_newton_q2',
    number: 2,
    question:
      'Dos estudiantes empujan el mismo motor en diferentes momentos. Ambos aplican una fuerza de 200 N, pero uno de ellos observa una aceleración menor que la del otro cuando trabaja con un motor más pesado. ¿Qué conclusión es correcta?',
    options: [
      'a) La aceleración depende únicamente de la fuerza.',
      'b) La masa no afecta el movimiento.',
      'c) A mayor masa, menor aceleración para una misma fuerza.',
      'd) La fuerza neta siempre es igual al peso.',
    ],
    correctIndex: 2,
    formula: 'a_1 = \\frac{200\\text{ N}}{m_1}, \\quad a_2 = \\frac{200\\text{ N}}{m_2} \\quad \\text{si } m_2 > m_1 \\implies a_2 < a_1',
    explanation:
      'La inercia de un objeto es la medida de su oposición a cambiar su estado de reposo o movimiento, cuantificada por su masa. Ante una fuerza idéntica de 200 N, el cuerpo con mayor masa ofrecerá mayor inercia y por ende experimentará una aceleración estrictamente menor.',
  },
  {
    id: 'ht01_newton_q3',
    number: 3,
    question:
      'Un montacargas transporta una carga industrial. El operador desea duplicar la aceleración del sistema sin cambiar la masa de la carga. ¿Qué debe hacer?',
    options: [
      'a) Reducir la fuerza aplicada a la mitad.',
      'b) Duplicar la masa.',
      'c) Reducir la gravedad.',
      'd) Duplicar la fuerza aplicada.',
    ],
    correctIndex: 3,
    formula: 'a\' = \\frac{F\'}{m} = 2a = 2\\left(\\frac{F}{m}\\right) = \\frac{2F}{m} \\implies F\' = 2F',
    explanation:
      'La aceleración es directamente proporcional a la fuerza neta aplicada (F = m·a). Si la masa m permanece constante y se busca obtener el doble de aceleración (2a), la fuerza motriz resultante aplicada por el montacargas debe duplicarse exactamente (2F).',
  },
  {
    id: 'ht01_newton_q4',
    number: 4,
    question:
      'Dos robots idénticos participan en una prueba de arrastre. Ambos tienen la misma masa, pero uno desarrolla el doble de fuerza que el otro. ¿Qué sucederá?',
    options: [
      'a) Ambos tendrán la misma aceleración.',
      'b) El robot más potente tendrá mayor aceleración.',
      'c) Ambos se moverán con velocidad constante.',
      'd) La masa determinará toda la aceleración.',
    ],
    correctIndex: 1,
    formula: 'a_A = \\frac{F}{m}, \\quad a_B = \\frac{2F}{m} = 2a_A',
    explanation:
      'Si dos cuerpos poseen la misma masa inercial, el cuerpo sobre el cual se aplique una fuerza mayor experimentará una aceleración proporcionalmente mayor. El robot que entrega el doble de fuerza (2F) alcanzará el doble de aceleración que el primero.',
  },
];

/**
 * Forma 2 – PROBLEMAS DE APLICACIÓN OFICIALES (HT01 Unidad 4)
 * Con especial énfasis en los sistemas sin fricción (P1, P2, P3, P6, P7, P8, P12a).
 */
export const NEWTON_EXERCISES = [
  {
    id: 'newton_p7',
    number: 7,
    title: 'Problema 7: Dos Bloques Unidos por Cuerda en Mesa Horizontal sin Fricción',
    subtitle: 'Fricción cero: Fuerza F = 80 N aplicada sobre masa m₂ = 6 kg unida a m₁ = 2 kg',
    isFrictionless: true,
    method: 'system_and_individual',
    unitSystem: 'SI (Newtons, kg, m/s²)',
    apparatusType: 'two_connected_blocks',
    color: '#4f46e5',
    mass: 8.0,
    mass1: 2.0,
    mass2: 6.0,
    appliedForce: 80.0,
    frictionCoeff: 0.0,
    statement:
      'Suponga una fricción cero en el sistema que muestra la figura. Un bloque de 2 kg está unido mediante una cuerda horizontal ligera a un bloque de 6 kg. Se aplica una fuerza horizontal externa de 80 N a la derecha sobre el bloque de 6 kg. ¿Cuál es la aceleración del sistema? ¿Cuál es la tensión T en la cuerda de unión?',
    parameters: [
      { label: 'Masa 1 (trasera)', value: 'm₁ = 2.0 kg' },
      { label: 'Masa 2 (delantera)', value: 'm₂ = 6.0 kg' },
      { label: 'Fuerza aplicada', value: 'F = 80.0 N (→ hacia la derecha)' },
      { label: 'Fricción de la mesa', value: 'μ = 0 (Superficie lisa ideal)' },
    ],
    results: [
      { name: 'R1 (Aceleración del sistema)', symbol: 'a', value: '10.00 m/s²', formula: 'a = F / (m₁ + m₂)' },
      { name: 'R2 (Tensión en la cuerda)', symbol: 'T', value: '20.00 N', formula: 'T = m₁ · a' },
    ],
    bodies: [
      {
        id: 'system',
        name: 'Sistema Combinado (m₁ + m₂ = 8 kg)',
        description: 'Tratando los dos bloques como un solo cuerpo rígido conectado',
        equations: [
          'Fuerza externa total en X: ΣFx = F = (m₁ + m₂) · a',
          '80 N = (2 kg + 6 kg) · a = 8 kg · a',
          'a = 80 N / 8 kg = 10.00 m/s²',
        ],
        forces: [
          { name: 'F', label: 'F = 80 N', magnitude: 80, angleDeg: 0, color: '#8b5cf6', type: 'applied' },
          { name: 'Wtotal', label: 'W = 78.4 N', magnitude: 78.4, angleDeg: 270, color: '#ef4444', type: 'weight' },
          { name: 'Ntotal', label: 'N = 78.4 N', magnitude: 78.4, angleDeg: 90, color: '#3b82f6', type: 'normal' },
        ],
      },
      {
        id: 'block1',
        name: 'Bloque Trasero m₁ = 2 kg',
        description: 'La única fuerza horizontal que lo jala es la tensión T de la cuerda',
        equations: [
          'ΣFx = T = m₁ · a',
          'T = (2.0 kg) · (10.00 m/s²) = 20.00 N',
          'ΣFy = N₁ - m₁·g = 0  ⇒  N₁ = 2 · 9.8 = 19.60 N',
        ],
        forces: [
          { name: 'T', label: 'T = 20 N', magnitude: 20, angleDeg: 0, color: '#10b981', type: 'tension' },
          { name: 'W₁', label: 'W₁ = 19.6 N', magnitude: 19.6, angleDeg: 270, color: '#ef4444', type: 'weight' },
          { name: 'N₁', label: 'N₁ = 19.6 N', magnitude: 19.6, angleDeg: 90, color: '#3b82f6', type: 'normal' },
        ],
      },
      {
        id: 'block2',
        name: 'Bloque Delantero m₂ = 6 kg',
        description: 'Jalado por F = 80 N y retenido por la tensión T de la cuerda',
        equations: [
          'ΣFx = F - T = m₂ · a',
          '80 N - 20 N = 60 N = (6.0 kg) · (10.00 m/s²) = 60 N  ✓ (Verificado)',
          'ΣFy = N₂ - m₂·g = 0  ⇒  N₂ = 6 · 9.8 = 58.80 N',
        ],
        forces: [
          { name: 'F', label: 'F = 80 N', magnitude: 80, angleDeg: 0, color: '#8b5cf6', type: 'applied' },
          { name: 'T', label: 'T = 20 N', magnitude: 20, angleDeg: 180, color: '#10b981', type: 'tension' },
          { name: 'W₂', label: 'W₂ = 58.8 N', magnitude: 58.8, angleDeg: 270, color: '#ef4444', type: 'weight' },
          { name: 'N₂', label: 'N₂ = 58.8 N', magnitude: 58.8, angleDeg: 90, color: '#3b82f6', type: 'normal' },
        ],
      },
    ],
    mathSteps: [
      {
        step: 1,
        title: 'Análisis global del sistema sin fricción',
        description:
          'Dado que la superficie es completamente lisa (fricción cero, μ = 0) y la cuerda es inextensible, ambos bloques se aceleran juntos con la misma aceleración a hacia la derecha.',
        latex: '\\sum F_x = (m_1 + m_2) a \\implies F = (2\\text{ kg} + 6\\text{ kg}) a = 8\\text{ kg} \\cdot a',
      },
      {
        step: 2,
        title: 'Cálculo de la aceleración resultante',
        description:
          'Despejamos la aceleración dividiendo la fuerza neta aplicada entre la masa total del sistema:',
        latex: 'a = \\frac{F}{m_1 + m_2} = \\frac{80\\text{ N}}{8.0\\text{ kg}} = 10.00\\text{ m/s}^2',
      },
      {
        step: 3,
        title: 'Diagrama de cuerpo libre del bloque m₁ (2 kg) y tensión T',
        description:
          'Aislamos el bloque 1. La única fuerza en el eje horizontal que actúa sobre él es la tensión T de la cuerda tirando hacia la derecha.',
        latex: '\\sum F_{1x} = T = m_1 \\cdot a = (2.0\\text{ kg})(10.00\\text{ m/s}^2) = 20.00\\text{ N}',
      },
      {
        step: 4,
        title: 'Comprobación con el bloque m₂ (6 kg)',
        description:
          'Verificamos con la segunda ley aplicada sobre el bloque 2: ΣF_{2x} = F - T = 80 - 20 = 60 N = (6 kg)(10 m/s²). El sistema concuerda con absoluta precisión.',
        latex: 'F - T = m_2 a \\implies 80\\text{ N} - 20\\text{ N} = 60\\text{ N} = (6.0\\text{ kg})(10.00\\text{ m/s}^2)',
      },
    ],
  },
  {
    id: 'newton_p1',
    number: 1,
    title: 'Problema 1: Masa de 4 kg bajo Fuerza Resultante Variable',
    subtitle: 'Fuerza resultante directa: (a) 4 N, (b) 8 N y (c) 12 N',
    isFrictionless: true,
    method: 'direct_ratio',
    unitSystem: 'SI (Newtons, kg, m/s²)',
    apparatusType: 'single_block_force',
    color: '#0284c7',
    mass: 4.0,
    appliedForce: 12.0,
    frictionCoeff: 0.0,
    statement:
      'Una masa de 4 kg está bajo la acción de una fuerza resultante de (a) 4 N, (b) 8 N y (c) 12 N. ¿Cuáles son las aceleraciones resultantes?',
    parameters: [
      { label: 'Masa constante', value: 'm = 4.0 kg' },
      { label: 'Caso (a)', value: 'F_a = 4.0 N' },
      { label: 'Caso (b)', value: 'F_b = 8.0 N' },
      { label: 'Caso (c)', value: 'F_c = 12.0 N' },
    ],
    results: [
      { name: 'R(a)', symbol: 'a_a', value: '1.00 m/s²', formula: 'a = F_a / m' },
      { name: 'R(b)', symbol: 'a_b', value: '2.00 m/s²', formula: 'a = F_b / m' },
      { name: 'R(c)', symbol: 'a_c', value: '3.00 m/s²', formula: 'a = F_c / m' },
    ],
    bodies: [
      {
        id: 'block',
        name: 'Bloque m = 4 kg',
        description: 'Bloque sobre superficie lisa con fuerza horizontal F',
        equations: [
          'a(a) = 4 N / 4 kg = 1.00 m/s²',
          'a(b) = 8 N / 4 kg = 2.00 m/s²',
          'a(c) = 12 N / 4 kg = 3.00 m/s²',
        ],
        forces: [
          { name: 'F', label: 'F = 12 N', magnitude: 12, angleDeg: 0, color: '#8b5cf6', type: 'applied' },
          { name: 'W', label: 'W = 39.2 N', magnitude: 39.2, angleDeg: 270, color: '#ef4444', type: 'weight' },
          { name: 'N', label: 'N = 39.2 N', magnitude: 39.2, angleDeg: 90, color: '#3b82f6', type: 'normal' },
        ],
      },
    ],
    mathSteps: [
      {
        step: 1,
        title: 'Aplicación de la Segunda Ley de Newton',
        description: 'La fuerza resultante y la aceleración se relacionan por F = m·a.',
        latex: 'a = \\frac{F}{m}',
      },
      {
        step: 2,
        title: 'Cálculo para cada caso',
        description: 'Evaluamos para cada valor de fuerza resultante:',
        latex: 'a_a = \\frac{4\\text{ N}}{4\\text{ kg}} = 1.00\\text{ m/s}^2, \\quad a_b = \\frac{8\\text{ N}}{4\\text{ kg}} = 2.00\\text{ m/s}^2, \\quad a_c = \\frac{12\\text{ N}}{4\\text{ kg}} = 3.00\\text{ m/s}^2',
      },
    ],
  },
  {
    id: 'newton_p2',
    number: 2,
    title: 'Problema 2: Fuerza Constante de 20 N sobre Masas Variables',
    subtitle: 'Fuerza fija F = 20 N: (a) 2 kg, (b) 4 kg y (c) 6 kg',
    isFrictionless: true,
    method: 'direct_ratio',
    unitSystem: 'SI (Newtons, kg, m/s²)',
    apparatusType: 'single_block_force',
    color: '#059669',
    mass: 2.0,
    appliedForce: 20.0,
    frictionCoeff: 0.0,
    statement:
      'Una fuerza constante de 20 N actúa sobre una masa de (a) 2 kg, (b) 4 kg y (c) 6 kg. ¿Cuáles son las aceleraciones resultantes?',
    parameters: [
      { label: 'Fuerza fija', value: 'F = 20.0 N' },
      { label: 'Caso (a)', value: 'm_a = 2.0 kg' },
      { label: 'Caso (b)', value: 'm_b = 4.0 kg' },
      { label: 'Caso (c)', value: 'm_c = 6.0 kg' },
    ],
    results: [
      { name: 'R(a)', symbol: 'a_a', value: '10.00 m/s²', formula: 'a = F / m_a' },
      { name: 'R(b)', symbol: 'a_b', value: '5.00 m/s²', formula: 'a = F / m_b' },
      { name: 'R(c)', symbol: 'a_c', value: '3.33 m/s²', formula: 'a = F / m_c' },
    ],
    bodies: [
      {
        id: 'block',
        name: 'Bloque con F = 20 N',
        description: 'Demostración de que a mayor masa inercial, menor aceleración',
        equations: [
          'a(a) = 20 N / 2 kg = 10.00 m/s²',
          'a(b) = 20 N / 4 kg = 5.00 m/s²',
          'a(c) = 20 N / 6 kg = 3.333 m/s²',
        ],
        forces: [
          { name: 'F', label: 'F = 20 N', magnitude: 20, angleDeg: 0, color: '#8b5cf6', type: 'applied' },
          { name: 'W', label: 'W = 19.6 N', magnitude: 19.6, angleDeg: 270, color: '#ef4444', type: 'weight' },
          { name: 'N', label: 'N = 19.6 N', magnitude: 19.6, angleDeg: 90, color: '#3b82f6', type: 'normal' },
        ],
      },
    ],
    mathSteps: [
      {
        step: 1,
        title: 'Segunda Ley: a = F / m',
        description: 'La fuerza F = 20 N permanece invariable mientras varía la masa.',
        latex: 'a_a = \\frac{20\\text{ N}}{2\\text{ kg}} = 10.00\\text{ m/s}^2, \\quad a_b = \\frac{20\\text{ N}}{4\\text{ kg}} = 5.00\\text{ m/s}^2, \\quad a_c = \\frac{20\\text{ N}}{6\\text{ kg}} = 3.333\\text{ m/s}^2',
      },
    ],
  },
  {
    id: 'newton_p3',
    number: 3,
    title: 'Problema 3: Fuerza de 60 lb en Sistema Inglés (Cálculo de Masas)',
    subtitle: 'Fuerza F = 60 lb con a = 4, 8 y 12 ft/s²',
    isFrictionless: true,
    method: 'english_system',
    unitSystem: 'Sistema Inglés (libras, slugs, ft/s²)',
    apparatusType: 'single_block_force',
    color: '#d97706',
    mass: 15.0,
    appliedForce: 60.0,
    frictionCoeff: 0.0,
    statement:
      'Una fuerza constante de 60 lb actúa sobre cada uno de tres objetos, produciendo aceleraciones de 4, 8 y 12 ft/s². ¿Cuáles son las masas?',
    parameters: [
      { label: 'Fuerza constante', value: 'F = 60.0 lb' },
      { label: 'Aceleraciones', value: 'a₁ = 4 ft/s², a₂ = 8 ft/s², a₃ = 12 ft/s²' },
      { label: 'Unidad de masa', value: '1 slug = 1 lb / (ft/s²)' },
    ],
    results: [
      { name: 'R1', symbol: 'm₁', value: '15.00 slugs', formula: 'm₁ = F / a₁' },
      { name: 'R2', symbol: 'm₂', value: '7.50 slugs', formula: 'm₂ = F / a₂' },
      { name: 'R3', symbol: 'm₃', value: '5.00 slugs', formula: 'm₃ = F / a₃' },
    ],
    bodies: [
      {
        id: 'block',
        name: 'Objetos en Sistema Inglés',
        description: 'Cálculo de masa en slugs a partir de F y a',
        equations: [
          'm₁ = 60 lb / 4 ft/s² = 15.00 slugs (Peso W₁ = 483 lb)',
          'm₂ = 60 lb / 8 ft/s² = 7.50 slugs (Peso W₂ = 241.5 lb)',
          'm₃ = 60 lb / 12 ft/s² = 5.00 slugs (Peso W₃ = 161 lb)',
        ],
        forces: [
          { name: 'F', label: 'F = 60 lb', magnitude: 60, angleDeg: 0, color: '#8b5cf6', type: 'applied' },
        ],
      },
    ],
    mathSteps: [
      {
        step: 1,
        title: 'Despeje de la masa: m = F / a',
        description: 'En el sistema inglés, 1 slug acelera a 1 ft/s² al aplicar 1 lb de fuerza.',
        latex: 'm_1 = \\frac{60\\text{ lb}}{4\\text{ ft/s}^2} = 15.00\\text{ slugs}, \\quad m_2 = \\frac{60\\text{ lb}}{8\\text{ ft/s}^2} = 7.50\\text{ slugs}, \\quad m_3 = \\frac{60\\text{ lb}}{12\\text{ ft/s}^2} = 5.00\\text{ slugs}',
      },
    ],
  },
  {
    id: 'newton_p6',
    number: 6,
    title: 'Problema 6: Tensión en Cable Vertical de Elevación de 10 kg',
    subtitle: 'Masa m = 10 kg: (a) a = 0, (b) a = 6 m/s² hacia arriba, (c) a = 6 m/s² hacia abajo',
    isFrictionless: true,
    method: 'vertical_newton',
    unitSystem: 'SI (Newtons, kg, m/s²)',
    apparatusType: 'vertical_cable_mass',
    color: '#7c3aed',
    mass: 10.0,
    statement:
      'Una masa de 10 kg se eleva por medio de un cable ligero. ¿Cuál es la tensión en el cable cuando la aceleración es igual a (a) cero, (b) 6 m/s² hacia arriba y (c) 6 m/s² hacia abajo?',
    parameters: [
      { label: 'Masa suspendida', value: 'm = 10.0 kg' },
      { label: 'Peso gravitacional', value: 'W = m·g = 10 · 9.8 = 98.0 N' },
      { label: 'Caso (a)', value: 'a = 0 (Equilibrio / v constante)' },
      { label: 'Caso (b)', value: 'a = +6.0 m/s² (↑ hacia arriba)' },
      { label: 'Caso (c)', value: 'a = -6.0 m/s² (↓ hacia abajo)' },
    ],
    results: [
      { name: 'R(a)', symbol: 'T_a', value: '98.00 N', formula: 'T = m·g' },
      { name: 'R(b)', symbol: 'T_b', value: '158.00 N', formula: 'T = m(g + a)' },
      { name: 'R(c)', symbol: 'T_c', value: '38.00 N', formula: 'T = m(g - a)' },
    ],
    bodies: [
      {
        id: 'mass',
        name: 'Masa m = 10 kg en Cable',
        description: 'Tensión vertical T hacia arriba y peso W = 98 N hacia abajo',
        equations: [
          'ΣFy = T - W = m · ay  ⇒  T = m(g + ay)',
          'Caso (a) ay = 0: T = 98.00 N',
          'Caso (b) ay = +6 m/s²: T = 10(9.8 + 6) = 158.00 N',
          'Caso (c) ay = -6 m/s²: T = 10(9.8 - 6) = 38.00 N',
        ],
        forces: [
          { name: 'T', label: 'T = 158 N', magnitude: 158, angleDeg: 90, color: '#10b981', type: 'tension' },
          { name: 'W', label: 'W = 98 N', magnitude: 98, angleDeg: 270, color: '#ef4444', type: 'weight' },
        ],
      },
    ],
    mathSteps: [
      {
        step: 1,
        title: 'Ecuación de Newton en el eje vertical',
        description: 'Definiendo hacia arriba como positivo: T - W = m·a_y.',
        latex: 'T - m g = m a_y \\implies T = m(g + a_y)',
      },
      {
        step: 2,
        title: 'Evaluación de los tres estados cinemáticos',
        description: 'Sustituyendo los valores de aceleración:',
        latex: 'T_a = 10(9.8 + 0) = 98.00\\text{ N}, \\quad T_b = 10(9.8 + 6) = 158.00\\text{ N}, \\quad T_c = 10(9.8 - 6) = 38.00\\text{ N}',
      },
    ],
  },
  {
    id: 'newton_p8',
    number: 8,
    title: 'Problema 8: Máquina de Atwood sin Fricción con Masas de 7.0 kg y 9.0 kg',
    subtitle: 'Polea ideal sin fricción: m₁ = 7.0 kg y m₂ = 9.0 kg',
    isFrictionless: true,
    method: 'atwood_system',
    unitSystem: 'SI (Newtons, kg, m/s²)',
    apparatusType: 'atwood_frictionless',
    color: '#0891b2',
    mass: 16.0,
    mass1: 7.0,
    mass2: 9.0,
    statement:
      'Una masa de 7.0 kg cuelga del extremo de una cuerda que pasa por una polea sin masa ni fricción, y en el otro extremo cuelga una masa de 9.0 kg, como se muestra en la figura. Encuentre la aceleración de las masas y la tensión en la cuerda.',
    parameters: [
      { label: 'Masa ligera', value: 'm₁ = 7.0 kg (asciende)' },
      { label: 'Masa pesada', value: 'm₂ = 9.0 kg (desciende)' },
      { label: 'Gravedad', value: 'g = 9.80 m/s²' },
      { label: 'Polea y cuerda', value: 'Sin masa ni fricción (ideales)' },
    ],
    results: [
      { name: 'R1 (Aceleración)', symbol: 'a', value: '1.225 m/s²', formula: 'a = g(m₂ - m₁) / (m₁ + m₂)' },
      { name: 'R2 (Tensión)', symbol: 'T', value: '77.18 N', formula: 'T = 2 m₁ m₂ g / (m₁ + m₂)' },
    ],
    bodies: [
      {
        id: 'mass1',
        name: 'Masa m₁ = 7.0 kg (Asciende)',
        description: 'Tensión T tira hacia arriba superando su peso W₁ = 68.6 N',
        equations: [
          'ΣFy = T - m₁·g = m₁ · a',
          'T = m₁(g + a) = 7.0 · (9.80 + 1.225) = 77.175 N',
        ],
        forces: [
          { name: 'T', label: 'T = 77.18 N', magnitude: 77.18, angleDeg: 90, color: '#10b981', type: 'tension' },
          { name: 'W₁', label: 'W₁ = 68.6 N', magnitude: 68.6, angleDeg: 270, color: '#ef4444', type: 'weight' },
        ],
      },
      {
        id: 'mass2',
        name: 'Masa m₂ = 9.0 kg (Desciende)',
        description: 'Su peso W₂ = 88.2 N supera a la tensión T, acelerando hacia abajo',
        equations: [
          'ΣFy = m₂·g - T = m₂ · a',
          'T = m₂(g - a) = 9.0 · (9.80 - 1.225) = 77.175 N',
        ],
        forces: [
          { name: 'T', label: 'T = 77.18 N', magnitude: 77.18, angleDeg: 90, color: '#10b981', type: 'tension' },
          { name: 'W₂', label: 'W₂ = 88.2 N', magnitude: 88.2, angleDeg: 270, color: '#ef4444', type: 'weight' },
        ],
      },
    ],
    mathSteps: [
      {
        step: 1,
        title: 'Ecuaciones acopladas de la máquina de Atwood',
        description: 'Para m₁: T - m₁g = m₁a. Para m₂: m₂g - T = m₂a. Sumando ambas ecuaciones:',
        latex: '(m_2 - m_1) g = (m_1 + m_2) a \\implies a = g \\frac{m_2 - m_1}{m_1 + m_2}',
      },
      {
        step: 2,
        title: 'Cálculo de la aceleración común',
        description: 'Sustituyendo m₁ = 7.0 kg y m₂ = 9.0 kg:',
        latex: 'a = (9.80) \\frac{9.0 - 7.0}{9.0 + 7.0} = 9.80 \\left(\\frac{2.0}{16.0}\\right) = 1.225\\text{ m/s}^2',
      },
      {
        step: 3,
        title: 'Cálculo de la tensión en la cuerda',
        description: 'Sustituyendo en la ecuación de m₁:',
        latex: 'T = m_1(g + a) = 7.0(9.80 + 1.225) = 77.175\\text{ N} \\approx 77.18\\text{ N}',
      },
    ],
  },
  {
    id: 'newton_p12',
    number: 12,
    title: 'Problema 12: Bloque de 10 kg en Plano Inclinado 32° y Masa Colgante de 2 kg',
    subtitle: 'Caso (a) Suposición de Fricción Cero (μ = 0) vs Caso con Fricción (μk = 0.2)',
    isFrictionless: true,
    method: 'inclined_plane',
    unitSystem: 'SI (Newtons, kg, m/s²)',
    apparatusType: 'inclined_plane_masses',
    color: '#ea580c',
    mass: 12.0,
    mass1: 10.0,
    mass2: 2.0,
    angleDeg: 32.0,
    statement:
      'El sistema descrito en la figura parte del reposo. Un bloque de 10 kg está en un plano inclinado de 32° unido por una cuerda que pasa por una polea en el vértice a una masa de 2 kg que cuelga verticalmente. (a) ¿Cuál es la aceleración si se supone una fricción de cero? (b) ¿Cuál es la aceleración cuando el bloque de 10 kg desciende por el plano con μk = 0.2? (c) ¿Cuál es la tensión en presencia de fricción?',
    parameters: [
      { label: 'Masa en plano inclinado', value: 'm₁ = 10.0 kg' },
      { label: 'Masa colgante', value: 'm₂ = 2.0 kg' },
      { label: 'Ángulo del plano', value: 'θ = 32°' },
      { label: 'Caso (a)', value: 'Fricción cero: μ = 0' },
      { label: 'Casos (b) y (c)', value: 'Con fricción: μk = 0.2' },
    ],
    results: [
      { name: 'R1 (a: Aceleración sin fricción)', symbol: 'a_sin_friccion', value: '2.694 m/s²', formula: 'a = (m₁ g sin θ - m₂ g) / (m₁ + m₂)' },
      { name: 'R2 (b: Aceleración con fricción μk=0.2)', symbol: 'a_con_friccion', value: '1.309 m/s²', formula: 'a = (m₁ g sin θ - fk - m₂ g) / (m₁ + m₂)' },
      { name: 'R3 (c: Tensión con fricción)', symbol: 'T_con_friccion', value: '22.22 N', formula: 'T = m₂(g + a)' },
    ],
    bodies: [
      {
        id: 'block_plane',
        name: 'Bloque m₁ = 10 kg (Plano Inclinado 32°)',
        description: 'Componente tangencial del peso W₁·sen(32°) = 51.93 N tira hacia abajo del plano',
        equations: [
          'W₁ = 10 · 9.8 = 98.0 N',
          'W₁∥ = 98 · sen(32°) = 51.932 N (acelera hacia abajo)',
          'N = 98 · cos(32°) = 83.109 N',
          'Sin fricción (a): ΣF∥ = W₁∥ - T = m₁ · a  ⇒  a = 2.694 m/s²',
        ],
        forces: [
          { name: 'W1_par', label: 'W₁ sen(32°) = 51.9 N', magnitude: 51.9, angleDeg: 212, color: '#ef4444', type: 'weight' },
          { name: 'T', label: 'T = 24.99 N', magnitude: 25.0, angleDeg: 32, color: '#10b981', type: 'tension' },
          { name: 'N', label: 'N = 83.1 N', magnitude: 83.1, angleDeg: 122, color: '#3b82f6', type: 'normal' },
        ],
      },
      {
        id: 'hanging_mass',
        name: 'Masa Colgante m₂ = 2 kg',
        description: 'Tensión T tira hacia arriba, W₂ = 19.6 N tira hacia abajo',
        equations: [
          'W₂ = 2 · 9.8 = 19.600 N',
          'ΣFy = T - W₂ = m₂ · a',
          'Sin fricción: T = 2(9.8 + 2.694) = 24.988 N',
        ],
        forces: [
          { name: 'T', label: 'T = 24.99 N', magnitude: 25.0, angleDeg: 90, color: '#10b981', type: 'tension' },
          { name: 'W₂', label: 'W₂ = 19.6 N', magnitude: 19.6, angleDeg: 270, color: '#ef4444', type: 'weight' },
        ],
      },
    ],
    mathSteps: [
      {
        step: 1,
        title: 'Descomposición del peso en el plano inclinado',
        description:
          'El peso del bloque m₁ (10 kg) es W₁ = 98 N. Su componente paralela al plano que tira hacia abajo es W₁·sen(32°) = 98(0.5299) = 51.932 N. La masa colgante m₂ tira con W₂ = 19.60 N.',
        latex: 'W_{1\\parallel} = m_1 g \\sin(32^\\circ) = (10)(9.80)\\sin(32^\\circ) = 51.932\\text{ N}',
      },
      {
        step: 2,
        title: 'Caso (a): Fricción cero (μ = 0)',
        description:
          'La fuerza neta que mueve al sistema es la diferencia entre W₁∥ y W₂:',
        latex: 'F_{\\text{neta}} = 51.932\\text{ N} - 19.600\\text{ N} = 32.332\\text{ N} \\implies a = \\frac{32.332\\text{ N}}{10 + 2\\text{ kg}} = 2.694\\text{ m/s}^2',
      },
      {
        step: 3,
        title: 'Caso (b): Con fricción (μk = 0.2)',
        description:
          'La normal es N = W₁·cos(32°) = 98(0.8480) = 83.109 N. La fuerza de fricción cinética es fk = μk·N = 0.2(83.109) = 16.622 N.',
        latex: 'f_k = \\mu_k N = (0.2)(83.109\\text{ N}) = 16.622\\text{ N} \\implies F_{\\text{neta}} = 51.932 - 16.622 - 19.600 = 15.710\\text{ N}',
      },
      {
        step: 4,
        title: 'Aceleración y tensión con fricción',
        description:
          'Aceleración: a = 15.710 / 12 = 1.309 m/s². Tensión en la cuerda: T = m₂(g + a) = 2(9.8 + 1.309) = 22.218 N.',
        latex: 'a = \\frac{15.710\\text{ N}}{12.0\\text{ kg}} = 1.309\\text{ m/s}^2, \\quad T = m_2(g + a) = 2.0(9.80 + 1.309) = 22.22\\text{ N}',
      },
    ],
  },
];

/**
 * Generates canvas whiteboard elements for a selected Newton's Second Law exercise.
 */
export function generateNewtonCanvasElements(exerciseNumber = 7, cx = 500, cy = 400, options = {}) {
  const isClean = options.cleanPractice !== false;
  const exercise = NEWTON_EXERCISES.find((e) => e.number === exerciseNumber) || NEWTON_EXERCISES[0];

  const appEl = createPhysicsElement('newton_frictionless_system', cx, cy, {
    exerciseNumber: exercise.number,
    systemTitle: exercise.title,
    apparatusType: exercise.apparatusType,
    color: exercise.color,
    mass: exercise.mass,
    mass1: exercise.mass1 || exercise.mass,
    mass2: exercise.mass2 || 0,
    appliedForce: exercise.appliedForce || 0,
    frictionCoeff: exercise.frictionCoeff || 0,
    angleDeg: exercise.angleDeg || 0,
    width: 640,
    height: 380,
    showOfficialSolution: !isClean,
    userVectors: [],
    label: isClean
      ? `2ª Ley de Newton: P${exercise.number} (Limpio para Clase)`
      : `2ª Ley de Newton Resuelta: P${exercise.number} (HT01)`,
  });

  return [appEl];
}
