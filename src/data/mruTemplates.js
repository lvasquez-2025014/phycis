// =========================================================================
// MRU & MOVIMIENTO UNIDIMENSIONAL - TEMPLATES & SCHOOL SYLLABUS DATASET
// Basado en el Plan Previsto Escolar de la Unidad "Movimiento Unidimensional"
// =========================================================================

export const MRU_SUBTOPICS = [
  {
    id: 'mru_teoria',
    title: 'Movimiento Rectilíneo Uniforme (MRU)',
    week: 'Semana 1 y 2 • 12/01 - 23/01',
    activity: 'HT01 & HV1: Socialización Teórica y Ejercicios',
    desc: 'Velocidad constante (v = cte), aceleración nula (a = 0), fórmulas d = v·t, v = d/t, t = d/v y conversiones.',
    ponderacion: '10 pts',
    modalidad: 'Semipresencial',
    color: '#4262ff',
    badge: 'MRU',
  },
  {
    id: 'mruv_teoria',
    title: 'Movimiento Rectilíneo Uniformemente Variado (MRUV)',
    week: 'Semana 3 y 4 • 26/01 - 06/02',
    activity: 'HT02 & HV2: Socialización Teórica y Ejercicios',
    desc: 'Aceleración constante (a ≠ 0), las 4 fórmulas de MRUV, aceleración y frenado.',
    ponderacion: '10 pts',
    modalidad: 'Semipresencial',
    color: '#f59e0b',
    badge: 'MRUV',
  },
  {
    id: 'caida_libre',
    title: 'Caída Libre',
    week: 'Semana 5 • 09/02 - 13/02',
    activity: 'HT03 & HV3: Caída Libre',
    desc: 'Gravedad g = 9.8 m/s², caída desde el reposo (v₀ = 0), altura h = ½gt², tiempo de caída y velocidad final.',
    ponderacion: '10 pts',
    modalidad: 'Presencial',
    color: '#10b981',
    badge: 'Caída Libre',
  },
  {
    id: 'lab_fisica',
    title: 'Práctica de Laboratorio de Física',
    week: 'Semana 6 • 16/02 - 20/02',
    activity: 'PRACB1: Movimiento Unidimensional',
    desc: 'Tabla experimental de datos, medición de tiempos y distancias, riel, cálculo de velocidad y error relativo.',
    ponderacion: '10 pts',
    modalidad: 'Semipresencial',
    color: '#8b5cf6',
    badge: 'Laboratorio',
  },
  {
    id: 'tiro_vertical',
    title: 'Tiro Vertical',
    week: 'Semana 7 • 23/02 - 27/02',
    activity: 'HT04 & HV4: Tiro Vertical',
    desc: 'Lanzamiento hacia arriba, altura máxima h_max = v₀²/(2g), tiempo de subida t_s = v₀/g y velocidad en cúspide v = 0.',
    ponderacion: '10 pts',
    modalidad: 'Semipresencial',
    color: '#ec4899',
    badge: 'Tiro Vertical',
  },
  {
    id: 'evaluacion_parcial',
    title: 'Evaluación Parcial (Semana 1 a 5)',
    week: 'Semana 8 • 02/03 - 06/03',
    activity: 'PC1: Evaluación Parcial - Semana 1 a 5',
    desc: 'Ejercicios de integración y repaso de MRU, MRUV y Caída Libre.',
    ponderacion: '10 pts',
    modalidad: 'Presencial',
    color: '#ef4444',
    badge: 'Parcial',
  },
  {
    id: 'evaluacion_bimestral',
    title: 'Semana de Evaluaciones Bimestrales',
    week: 'Semana 9 • 09/03 - 13/03',
    activity: 'Examen Bimestral de Física',
    desc: 'Evaluación acumulativa final de la Unidad Movimiento Unidimensional.',
    ponderacion: '40 pts',
    modalidad: 'Presencial',
    color: '#3b82f6',
    badge: 'Bimestral',
  },
  {
    id: 'plan_colegio',
    title: 'Plan Previsto: Tabla Completa de la Unidad',
    week: 'Semanas 1 a 9 • 12/01 - 13/03',
    activity: 'Cronograma Escolar de Movimiento Unidimensional',
    desc: 'Visualización completa del cronograma con semanas, fechas, actividades y ponderaciones del colegio.',
    ponderacion: '100%',
    modalidad: 'Completo',
    color: '#050038',
    badge: 'Plan Unidad',
  },
];

export function getMruTemplate(key) {
  // 1. MRU (Movimiento Rectilíneo Uniforme)
  if (key === 'mru' || key === 'mru_teoria') {
    return {
      boardName: 'Física - Movimiento Rectilíneo Uniforme (MRU)',
      toast: '📐 Plantilla MRU cargada',
      elements: [
        { id: 't_hdr', type: 'text', x: -420, y: -260, text: 'MOVIMIENTO RECTILÍNEO UNIFORME (MRU)', color: '#050038', fontSize: 24 },
        { id: 't_sub', type: 'text', x: -420, y: -225, text: 'Unidad: Movimiento Unidimensional • Semanas 1 y 2 • HT01 & HV1 (10 pts)', color: '#4262ff', fontSize: 14 },
        { id: 'n1', type: 'sticky', x: -420, y: -170, width: 220, height: 180, text: '✨ CARACTERÍSTICAS:\n• Trayectoria rectilínea\n• Velocidad constante (v = cte)\n• Aceleración nula (a = 0)\n• Distancias iguales en tiempos iguales.', color: '#d3f8df' },
        { id: 'n2', type: 'sticky', x: -180, y: -170, width: 220, height: 180, text: '📐 FÓRMULAS DEL MRU:\n• d = v · t  (Distancia)\n• v = d / t  (Velocidad)\n• t = d / v  (Tiempo)\n\nTriángulo mnemotécnico:\n       [ d ]\n      [v | t]', color: '#fff9b1' },
        { id: 'n3', type: 'sticky', x: 60, y: -170, width: 220, height: 180, text: '📏 UNIDADES & CONVERSIÓN:\n• Distancia (d): metros [m]\n• Tiempo (t): segundos [s]\n• Velocidad (v): [m/s]\n\nConversión:\n• 1 km/h ÷ 3.6 = m/s\n• 1 m/s × 3.6 = km/h', color: '#d5f0ff' },
        { id: 'n4', type: 'sticky', x: 300, y: -170, width: 220, height: 180, text: '📝 ACTIVIDADES DEL PLAN:\n• Socialización Teórica\n• HT01: Mov. Rectilíneo Uniforme\n• HV1: Evaluación MRU\n• Ponderación: 10 pts', color: '#ffd5dc' },
        { id: 't_ej_title', type: 'text', x: -420, y: 50, text: 'EJERCICIO TIPO HT01: Un móvil viaja con velocidad constante de v = 25 m/s durante t = 40 s. ¿Qué distancia recorre?', color: '#050038', fontSize: 16 },
        { id: 'box1', type: 'rectangle', startX: -420, startY: 90, endX: -220, endY: 230, color: '#4262ff', size: 2, fill: 'none', text: '1. DATOS:\n• v = 25 m/s\n• t = 40 s\n• d = ?' },
        { id: 'box2', type: 'rectangle', startX: -190, startY: 90, endX: 10, endY: 230, color: '#f59e0b', size: 2, fill: 'none', text: '2. FÓRMULA:\n• d = v · t' },
        { id: 'box3', type: 'rectangle', startX: 40, startY: 90, endX: 240, endY: 230, color: '#10b981', size: 2, fill: 'none', text: '3. SUSTITUCIÓN:\n• d = (25 m/s) · (40 s)\n• d = 1000 m\n• d = 1 km' },
        { id: 'box4', type: 'rectangle', startX: 270, startY: 90, endX: 470, endY: 230, color: '#8b5cf6', size: 2, fill: 'none', text: '4. RESPUESTA:\n• El automóvil recorre\n  1000 m (1 km).' },
      ],
    };
  }

  // 2. MRUV (Movimiento Rectilíneo Uniformemente Variado)
  if (key === 'mruv' || key === 'mruv_teoria') {
    return {
      boardName: 'Física - Movimiento Rectilíneo Uniformemente Variado (MRUV)',
      toast: '⚡ Plantilla MRUV cargada',
      elements: [
        { id: 't_hdr', type: 'text', x: -420, y: -260, text: 'MOVIMIENTO RECTILÍNEO UNIFORMEMENTE VARIADO (MRUV)', color: '#050038', fontSize: 24 },
        { id: 't_sub', type: 'text', x: -420, y: -225, text: 'Unidad: Movimiento Unidimensional • Semanas 3 y 4 • HT02 & HV2 (10 pts)', color: '#f59e0b', fontSize: 14 },
        { id: 'n1', type: 'sticky', x: -420, y: -170, width: 220, height: 180, text: '⚡ ACELERACIÓN (a = cte):\n• La velocidad varía en forma uniforme.\n• a = (vf - v0) / t\n• Unidad: m/s²\n• Acelerado: a > 0 (rapidez ↑)\n• Retardado/Freno: a < 0 (rapidez ↓)', color: '#fff9b1' },
        { id: 'n2', type: 'sticky', x: -180, y: -170, width: 220, height: 180, text: '📐 4 FÓRMULAS DE MRUV:\n1) vf = v0 + a · t\n2) d = v0 · t + ½ · a · t²\n3) vf² = v0² + 2 · a · d\n4) d = [(v0 + vf) / 2] · t', color: '#fed7aa' },
        { id: 'n3', type: 'sticky', x: 60, y: -170, width: 220, height: 180, text: '💡 CLAVES DE LECTURA:\n• "Parte del reposo" → v0 = 0\n• "Se detiene / frena" → vf = 0\n• "Velocidad constante" → a = 0', color: '#d3f8df' },
        { id: 'n4', type: 'sticky', x: 300, y: -170, width: 220, height: 180, text: '📝 ACTIVIDADES HT02 & HV2:\n• Semipresencial • 10 pts\n• Gráficas posición-tiempo y aceleración-tiempo', color: '#ffd5dc' },
        { id: 't_ej_title', type: 'text', x: -420, y: 50, text: 'EJERCICIO TIPO HT02: Un móvil parte del reposo con aceleración a = 4 m/s² durante t = 6 s. Hallar vf y d.', color: '#050038', fontSize: 16 },
        { id: 'box1', type: 'rectangle', startX: -420, startY: 90, endX: -220, endY: 230, color: '#f59e0b', size: 2, fill: 'none', text: '1. DATOS:\n• v0 = 0 m/s (reposo)\n• a = 4 m/s²\n• t = 6 s\n• vf = ?  |  d = ?' },
        { id: 'box2', type: 'rectangle', startX: -190, startY: 90, endX: 10, endY: 230, color: '#4262ff', size: 2, fill: 'none', text: '2. FÓRMULAS:\n• vf = v0 + a · t\n• d = v0 · t + ½ · a · t²' },
        { id: 'box3', type: 'rectangle', startX: 40, startY: 90, endX: 240, endY: 230, color: '#10b981', size: 2, fill: 'none', text: '3. SUSTITUCIÓN:\n• vf = 0 + (4)·(6) = 24 m/s\n• d = 0 + ½·(4)·(6²)\n• d = 2 · 36 = 72 m' },
        { id: 'box4', type: 'rectangle', startX: 270, startY: 90, endX: 470, endY: 230, color: '#8b5cf6', size: 2, fill: 'none', text: '4. RESPUESTA:\n• Velocidad final: 24 m/s\n• Distancia recorrida: 72 m' },
      ],
    };
  }

  // 3. Caída Libre
  if (key === 'caida_libre') {
    return {
      boardName: 'Física - Caída Libre',
      toast: '🌍 Plantilla Caída Libre cargada',
      elements: [
        { id: 't_hdr', type: 'text', x: -420, y: -260, text: 'MOVIMIENTO UNIDIMENSIONAL: CAÍDA LIBRE', color: '#050038', fontSize: 24 },
        { id: 't_sub', type: 'text', x: -420, y: -225, text: 'Semana 5 • HT03 & HV3: Caída Libre (Presencial - 10 pts)', color: '#10b981', fontSize: 14 },
        { id: 'n1', type: 'sticky', x: -420, y: -170, width: 220, height: 180, text: '🌍 CAÍDA LIBRE:\n• Movimiento vertical acelerado por la gravedad terrestre.\n• g = 9.8 m/s² (o 9.81 m/s²)\n• Todos los cuerpos caen con la misma aceleración g sin importar su masa.', color: '#d3f8df' },
        { id: 'n2', type: 'sticky', x: -180, y: -170, width: 220, height: 180, text: '📐 FÓRMULAS (v0 = 0):\n• vf = g · t\n• h = ½ · g · t²\n• vf² = 2 · g · h\n• t = √(2h / g)', color: '#fff9b1' },
        { id: 'n3', type: 'sticky', x: 60, y: -170, width: 220, height: 180, text: '📌 CONDICIONES:\n• "Se deja caer" o "se suelta" → v0 = 0\n• El sentido del movimiento es hacia abajo.\n• Resistencia del aire despreciable.', color: '#d5f0ff' },
        { id: 'n4', type: 'sticky', x: 300, y: -170, width: 220, height: 180, text: '📝 EVALUACIÓN HT03 & HV3:\n• Modalidad: Presencial\n• Ponderación: 10 pts\n• Ejercicios de altura y velocidad de impacto.', color: '#ffd5dc' },
        { id: 't_ej_title', type: 'text', x: -420, y: 50, text: 'EJERCICIO TIPO HT03: Una piedra se deja caer desde un edificio de h = 45 m. Hallar el tiempo de caída y la vf (g = 9.8 m/s²).', color: '#050038', fontSize: 16 },
        { id: 'box1', type: 'rectangle', startX: -420, startY: 90, endX: -220, endY: 230, color: '#10b981', size: 2, fill: 'none', text: '1. DATOS:\n• v0 = 0 m/s\n• h = 45 m\n• g = 9.8 m/s²\n• t = ?  |  vf = ?' },
        { id: 'box2', type: 'rectangle', startX: -190, startY: 90, endX: 10, endY: 230, color: '#4262ff', size: 2, fill: 'none', text: '2. FÓRMULAS:\n• t = √(2h / g)\n• vf = √(2 · g · h)' },
        { id: 'box3', type: 'rectangle', startX: 40, startY: 90, endX: 240, endY: 230, color: '#f59e0b', size: 2, fill: 'none', text: '3. SUSTITUCIÓN:\n• t = √(2 · 45 / 9.8)\n• t = √(9.18) ≈ 3.03 s\n• vf = 9.8 · 3.03 ≈ 29.7 m/s' },
        { id: 'box4', type: 'rectangle', startX: 270, startY: 90, endX: 470, endY: 230, color: '#8b5cf6', size: 2, fill: 'none', text: '4. RESULTADO:\n• Tiempo: 3.03 segundos\n• Velocidad final: 29.7 m/s\n  (≈ 106.9 km/h)' },
      ],
    };
  }

  // 4. Laboratorio de Física
  if (key === 'lab_fisica') {
    return {
      boardName: 'Laboratorio de Física - Movimiento Unidimensional',
      toast: '🔬 Plantilla Laboratorio PRACB1 cargada',
      elements: [
        { id: 't_hdr', type: 'text', x: -420, y: -260, text: 'PRÁCTICA DE LABORATORIO DE FÍSICA: MOVIMIENTO UNIDIMENSIONAL', color: '#050038', fontSize: 24 },
        { id: 't_sub', type: 'text', x: -420, y: -225, text: 'Semana 6 • PRACB1: Movimiento Unidimensional (Semipresencial - 10 pts)', color: '#8b5cf6', fontSize: 14 },
        { id: 'n1', type: 'sticky', x: -420, y: -170, width: 220, height: 160, text: '🔬 OBJETIVO DEL LABORATORIO:\n• Verificar experimentalmente el MRU.\n• Medir tiempos de desplazamiento a distancias fijas.\n• Calcular la velocidad y el porcentaje de error.', color: '#d5f0ff' },
        { id: 'n2', type: 'sticky', x: -180, y: -170, width: 220, height: 160, text: '🧰 EQUIPOS Y MATERIALES:\n• Riel de baja fricción\n• Móvil / Carrito dinámico\n• Sensores / Cronómetro digital\n• Cinta métrica milimetrada', color: '#fff9b1' },
        { id: 'n3', type: 'sticky', x: 60, y: -170, width: 220, height: 160, text: '📊 FÓRMULAS DE LABORATORIO:\n• t_prom = (t1 + t2 + t3) / 3\n• v_exp = d / t_prom\n• Error % = [|v_teorica - v_exp| / v_teorica] × 100%', color: '#d3f8df' },
        { id: 'n4', type: 'sticky', x: 300, y: -170, width: 220, height: 160, text: '📋 ENTREGA DEL INFORME:\n• PRACB1: Movimiento Unidimensional\n• Modalidad: Semipresencial\n• Ponderación: 10 pts\n• Gráfica d vs t adjunta', color: '#ffd5dc' },
        { id: 't_tbl', type: 'text', x: -420, y: 30, text: 'TABLA EXPERIMENTAL DE REGISTRO DE DATOS (PRACB1):', color: '#050038', fontSize: 16 },
        { id: 'tbl_box1', type: 'rectangle', startX: -420, startY: 65, endX: 470, endY: 105, color: '#4262ff', size: 1, fill: 'solid', text: 'Ensayo  |  Distancia (d)  |  t₁ (s)  |  t₂ (s)  |  t_prom (s)  |  v_exp (m/s)  |  Error Relativo %' },
        { id: 'tbl_box2', type: 'rectangle', startX: -420, startY: 105, endX: 470, endY: 145, color: '#d0d3dc', size: 1, fill: 'none', text: 'Ensayo 1 |      0.50 m     |  0.82 s  |  0.80 s  |    0.81 s    |    0.617 m/s  |       1.8 %' },
        { id: 'tbl_box3', type: 'rectangle', startX: -420, startY: 145, endX: 470, endY: 185, color: '#d0d3dc', size: 1, fill: 'none', text: 'Ensayo 2 |      1.00 m     |  1.63 s  |  1.61 s  |    1.62 s    |    0.617 m/s  |       1.2 %' },
        { id: 'tbl_box4', type: 'rectangle', startX: -420, startY: 185, endX: 470, endY: 225, color: '#d0d3dc', size: 1, fill: 'none', text: 'Ensayo 3 |      1.50 m     |  2.45 s  |  2.42 s  |    2.43 s    |    0.617 m/s  |       0.9 %' },
      ],
    };
  }

  // 5. Tiro Vertical
  if (key === 'tiro_vertical') {
    return {
      boardName: 'Física - Tiro Vertical',
      toast: '🔺 Plantilla Tiro Vertical cargada',
      elements: [
        { id: 't_hdr', type: 'text', x: -420, y: -260, text: 'MOVIMIENTO UNIDIMENSIONAL: TIRO VERTICAL', color: '#050038', fontSize: 24 },
        { id: 't_sub', type: 'text', x: -420, y: -225, text: 'Semana 7 • HT04 & HV4: Tiro Vertical (Semipresencial - 10 pts)', color: '#ec4899', fontSize: 14 },
        { id: 'n1', type: 'sticky', x: -420, y: -170, width: 220, height: 180, text: '🔺 FASE DE SUBIDA:\n• El cuerpo se lanza hacia arriba con v0 > 0.\n• Movimiento retardado (frena por la gravedad g = 9.8 m/s²).\n• En la altura máxima (cúspide):\n  v = 0 m/s', color: '#ffd5dc' },
        { id: 'n2', type: 'sticky', x: -180, y: -170, width: 220, height: 180, text: '📐 FÓRMULAS DE TIRO VERTICAL:\n• h_max = v0² / (2 · g)\n• t_subida = v0 / g\n• t_vuelo = 2 · t_subida\n• vf = v0 - g · t', color: '#fed7aa' },
        { id: 'n3', type: 'sticky', x: 60, y: -170, width: 220, height: 180, text: '🔻 FASE DE BAJADA (SIMETRÍA):\n• El cuerpo cae desde h_max como caída libre.\n• t_bajada = t_subida\n• Regresa al punto de partida con la misma rapidez: |vf| = v0.', color: '#d3f8df' },
        { id: 'n4', type: 'sticky', x: 300, y: -170, width: 220, height: 180, text: '📝 EVALUACIÓN HT04 & HV4:\n• Modalidad: Semipresencial\n• Ponderación: 10 pts\n• Cálculo de altura máxima y tiempo de permanencia en el aire.', color: '#d5f0ff' },
        { id: 't_ej_title', type: 'text', x: -420, y: 50, text: 'EJERCICIO TIPO HT04: Se dispara una flecha verticalmente con v0 = 39.2 m/s. Hallar h_max y t_vuelo (g = 9.8 m/s²).', color: '#050038', fontSize: 16 },
        { id: 'box1', type: 'rectangle', startX: -420, startY: 90, endX: -220, endY: 230, color: '#ec4899', size: 2, fill: 'none', text: '1. DATOS:\n• v0 = 39.2 m/s\n• g = 9.8 m/s²\n• v_top = 0 m/s\n• h_max = ? | t_vuelo = ?' },
        { id: 'box2', type: 'rectangle', startX: -190, startY: 90, endX: 10, endY: 230, color: '#4262ff', size: 2, fill: 'none', text: '2. FÓRMULAS:\n• t_subida = v0 / g\n• h_max = v0² / (2g)\n• t_vuelo = 2 · t_subida' },
        { id: 'box3', type: 'rectangle', startX: 40, startY: 90, endX: 240, endY: 230, color: '#f59e0b', size: 2, fill: 'none', text: '3. SUSTITUCIÓN:\n• t_subida = 39.2 / 9.8 = 4.0 s\n• h_max = (39.2)² / (19.6) = 78.4 m\n• t_vuelo = 2 · 4.0 = 8.0 s' },
        { id: 'box4', type: 'rectangle', startX: 270, startY: 90, endX: 470, endY: 230, color: '#10b981', size: 2, fill: 'none', text: '4. RESPUESTA:\n• Altura máxima: 78.4 m\n• Tiempo en el aire: 8.0 s' },
      ],
    };
  }

  // 6. Evaluación Parcial
  if (key === 'evaluacion_parcial') {
    return {
      boardName: 'Física - Evaluación Parcial (Semana 1 a 5)',
      toast: '📝 Plantilla Evaluación Parcial cargada',
      elements: [
        { id: 't_hdr', type: 'text', x: -420, y: -260, text: 'EVALUACIÓN PARCIAL - MOVIMIENTO UNIDIMENSIONAL', color: '#050038', fontSize: 24 },
        { id: 't_sub', type: 'text', x: -420, y: -225, text: 'Semana 8 • 02/03 - 06/03 • PC1: Evaluación Parcial (Semana 1 a 5) • Presencial - 10 pts', color: '#ef4444', fontSize: 14 },
        { id: 'n1', type: 'sticky', x: -420, y: -170, width: 220, height: 210, text: '📌 REPASO 1: MRU (Sem 1-2)\n• Fórmulas: v = d/t, d = v·t, t = d/v\n• Velocidad constante (a = 0)\n• Unidades: m/s y km/h\n• Conversión: factor 3.6', color: '#d5f0ff' },
        { id: 'n2', type: 'sticky', x: -180, y: -170, width: 220, height: 210, text: '📌 REPASO 2: MRUV (Sem 3-4)\n• vf = v0 + a · t\n• d = v0 · t + ½ · a · t²\n• vf² = v0² + 2 · a · d\n• d = [(v0 + vf)/2] · t\n• Acelerado vs Retardado', color: '#fed7aa' },
        { id: 'n3', type: 'sticky', x: 60, y: -170, width: 220, height: 210, text: '📌 REPASO 3: CAÍDA LIBRE (Sem 5)\n• g = 9.8 m/s² constante\n• v0 = 0 (cuando se suelta)\n• vf = g · t\n• h = ½ · g · t²\n• vf² = 2gh', color: '#d3f8df' },
        { id: 'n4', type: 'sticky', x: 300, y: -170, width: 220, height: 210, text: '🎯 ESTRATEGIA EXAMEN PC1:\n1. Identificar si a = 0 (MRU) o a ≠ 0 (MRUV).\n2. Escribir lista de datos conocidos y la incógnita.\n3. Elegir la fórmula que tenga una sola incógnita.\n4. Revisar unidades consistentes.', color: '#fff9b1' },
      ],
    };
  }

  // 7. Evaluaciones Bimestrales
  if (key === 'evaluacion_bimestral') {
    return {
      boardName: 'Física - Evaluaciones Bimestrales (Semana 9)',
      toast: '🏆 Plantilla Examen Bimestral cargada',
      elements: [
        { id: 't_hdr', type: 'text', x: -420, y: -260, text: 'SEMANA DE EVALUACIONES BIMESTRALES - FÍSICA', color: '#050038', fontSize: 24 },
        { id: 't_sub', type: 'text', x: -420, y: -225, text: 'Semana 9 • 09/03 - 13/03 • Examen Bimestral Presencial • Ponderación: 40 pts', color: '#3b82f6', fontSize: 14 },
        { id: 'n1', type: 'sticky', x: -420, y: -170, width: 220, height: 200, text: '🏆 EXAMEN BIMESTRAL (40 PTS):\n• Evaluación integral de la Unidad Movimiento Unidimensional.\n• Comprende todas las semanas 1 a 8.', color: '#fff9b1' },
        { id: 'n2', type: 'sticky', x: -180, y: -170, width: 220, height: 200, text: '📚 CONTENIDO EVALUADO:\n1. MRU (10 pts teóricos)\n2. MRUV (10 pts problemas)\n3. Caída Libre & Tiro Vertical (10 pts)\n4. Análisis gráfico y laboratorio (10 pts)', color: '#d3f8df' },
        { id: 'n3', type: 'sticky', x: 60, y: -170, width: 220, height: 200, text: '📋 FORMULARIO RÁPIDO:\n• MRU: d = v · t\n• MRUV: vf = v0 + at | d = v0t + ½at²\n• Caída: h = ½gt² | vf = gt\n• Tiro: h_max = v0²/(2g) | t_sub = v0/g', color: '#d5f0ff' },
        { id: 'n4', type: 'sticky', x: 300, y: -170, width: 220, height: 200, text: '✅ CHECKLIST PRE-EXAMEN:\n[ ] Calculadora científica lista\n[ ] Lápiz, borrador y regla\n[ ] Repaso de ejercicios HT01 a HT04\n[ ] Dudas aclaradas con el profesor', color: '#ffd5dc' },
      ],
    };
  }

  // 8. Plan Previsto: Tabla Completa del Colegio
  if (key === 'plan_colegio') {
    return {
      boardName: 'Plan Previsto - Movimiento Unidimensional',
      toast: '📋 Cronograma escolar cargado',
      elements: [
        { id: 't_hdr', type: 'text', x: -450, y: -270, text: 'PLAN PREVISTO • UNIDAD: MOVIMIENTO UNIDIMENSIONAL', color: '#050038', fontSize: 24 },
        { id: 't_sub', type: 'text', x: -450, y: -235, text: 'Cronograma Escolar de Física • Semanas 1 a 9 • Modalidades y Ponderaciones', color: '#4262ff', fontSize: 14 },
        { id: 'th1', type: 'rectangle', startX: -450, startY: -190, endX: 470, endY: -150, color: '#050038', size: 1, fill: 'solid', text: 'Sem | Fecha        | Tema                                                        | Actividad                                  | Modalidad      | Pts' },
        { id: 'tr1', type: 'rectangle', startX: -450, startY: -150, endX: 470, endY: -110, color: '#d0d3dc', size: 1, fill: 'none', text: ' 1  | 12/01 - 16/01 | Mov. Rectilíneo Uniforme (MRU)                             | Socialización de Contenidos Teóricos       | Presencial     |  -' },
        { id: 'tr2', type: 'rectangle', startX: -450, startY: -110, endX: 470, endY: -70, color: '#e0e7ff', size: 1, fill: 'solid', text: ' 2  | 19/01 - 23/01 | Mov. Rectilíneo Uniforme (MRU)                             | HT01: MRU  /  HV1: MRU                     | Semipresencial | 10' },
        { id: 'tr3', type: 'rectangle', startX: -450, startY: -70, endX: 470, endY: -30, color: '#d0d3dc', size: 1, fill: 'none', text: ' 3  | 26/01 - 30/01 | Mov. Rectilíneo Uniformemente Variado (MRUV)               | Socialización de Contenidos Teóricos       | Presencial     |  -' },
        { id: 'tr4', type: 'rectangle', startX: -450, startY: -30, endX: 470, endY: 10, color: '#e0e7ff', size: 1, fill: 'solid', text: ' 4  | 02/02 - 06/02 | Mov. Rectilíneo Uniformemente Variado (MRUV)               | HT02: MRUV  /  HV2: MRUV                   | Semipresencial | 10' },
        { id: 'tr5', type: 'rectangle', startX: -450, startY: 10, endX: 470, endY: 50, color: '#d0d3dc', size: 1, fill: 'none', text: ' 5  | 09/02 - 13/02 | Caída Libre                                                | HT03: Caída Libre  /  HV3: Caída Libre     | Presencial     | 10' },
        { id: 'tr6', type: 'rectangle', startX: -450, startY: 50, endX: 470, endY: 90, color: '#e0e7ff', size: 1, fill: 'solid', text: ' 6  | 16/02 - 20/02 | Práctica de Laboratorio de Física: Movimiento Unidim.      | PRACB1: Movimiento Unidimensional          | Semipresencial | 10' },
        { id: 'tr7', type: 'rectangle', startX: -450, startY: 90, endX: 470, endY: 130, color: '#d0d3dc', size: 1, fill: 'none', text: ' 7  | 23/02 - 27/02 | Tiro Vertical                                              | HT04: Tiro Vertical  /  HV4: Tiro Vertical | Semipresencial | 10' },
        { id: 'tr8', type: 'rectangle', startX: -450, startY: 130, endX: 470, endY: 170, color: '#e0e7ff', size: 1, fill: 'solid', text: ' 8  | 02/03 - 06/03 | Evaluación Parcial                                         | PC1: Evaluación Parcial - Semana 1 a 5     | Presencial     | 10' },
        { id: 'tr9', type: 'rectangle', startX: -450, startY: 170, endX: 470, endY: 210, color: '#fef3c7', size: 1, fill: 'solid', text: ' 9  | 09/03 - 13/03 | SEMANA DE EVALUACIONES BIMESTRALES                         | Examen Bimestral Presencial                | Presencial     | 40' },
        { id: 'n_tot', type: 'sticky', x: 260, y: 230, width: 210, height: 100, text: 'TOTAL UNIDAD:\n• Tareas / Lab / Parcial: 60 pts\n• Examen Bimestral: 40 pts\n• Total: 100 pts', color: '#d3f8df' },
      ],
    };
  }

  return null;
}
