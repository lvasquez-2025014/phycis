// =========================================================================
// MRU EXERCISE SOLVER & WHITEBOARD LAB GENERATOR
// Solves real physics problems: travel time, arrival time, unit conversions,
// and two-body pursuit / encounter problems (alcance y encuentro).
// =========================================================================

import { createPhysicsElement } from '../physics/physicsRegistry';

/**
 * Unit Conversion Constants
 */
export const CONVERSIONS = {
  MILE_TO_METER: 1609.344,
  KM_TO_METER: 1000,
  HOUR_TO_SEC: 3600,
  MIN_TO_SEC: 60,
  KMH_TO_MS: 1 / 3.6,
  MS_TO_KMH: 3.6,
  MIH_TO_MS: 0.44704,
  MS_TO_MIH: 2.236936,
};

/**
 * Parses time string (e.g. "5:40", "10:55", "9:36", "18:55") into minutes from midnight
 */
export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return 0;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  return hours * 60 + minutes;
}

/**
 * Formats minutes from midnight into 24h "HH:MM" and 12h "HH:MM am/pm"
 */
export function formatMinutesToTime(totalMinutes) {
  let normalized = Math.round(totalMinutes) % (24 * 60);
  if (normalized < 0) normalized += 24 * 60;
  const hours24 = Math.floor(normalized / 60);
  const mins = normalized % 60;

  const hh24 = String(hours24).padStart(2, '0');
  const mm = String(mins).padStart(2, '0');

  const period = hours24 >= 12 ? 'pm' : 'am';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  return {
    time24: `${hh24}:${mm}`,
    time12: `${hours12}:${mm} ${period}`,
    rawHours: hours24,
    rawMins: mins,
  };
}

/**
 * -------------------------------------------------------------------------
 * SOLVER TYPE 1: Single Mobile Travel Time & Arrival Time
 * d (distance), v (velocity), departureTime (optional), ceilMinutes (boolean)
 * -------------------------------------------------------------------------
 */
export function solveMruSingleMobile({
  distanceValue,
  distanceUnit = 'km', // 'km', 'm', 'mi'
  velocityValue,
  velocityUnit = 'km/h', // 'km/h', 'm/s', 'mi/h'
  departureTime = '08:00',
  ceilMinutes = false,
  label = 'Automóvil',
}) {
  const dVal = parseFloat(distanceValue) || 0;
  const vVal = parseFloat(velocityValue) || 0;
  if (dVal <= 0 || vVal <= 0) return null;

  // 1. Convert Distance to meters
  let distMeters = dVal;
  let distConvStep = `${dVal} ${distanceUnit}`;
  if (distanceUnit === 'km') {
    distMeters = dVal * 1000;
    distConvStep = `${dVal} km · (1000 m / 1 km) = ${distMeters.toLocaleString('es-ES')} m`;
  } else if (distanceUnit === 'mi') {
    distMeters = dVal * CONVERSIONS.MILE_TO_METER;
    distConvStep = `${dVal} mi · (1609.344 m / 1 mi) = ${distMeters.toFixed(2)} m`;
  }

  // 2. Convert Velocity to m/s
  let velMs = vVal;
  let velConvStep = `${vVal} ${velocityUnit}`;
  if (velocityUnit === 'km/h') {
    velMs = vVal / 3.6;
    velConvStep = `${vVal} km/h · (1 m/s / 3.6 km/h) = ${velMs.toFixed(3)} m/s`;
  } else if (velocityUnit === 'mi/h') {
    velMs = vVal * CONVERSIONS.MIH_TO_MS;
    velConvStep = `${vVal} mi/h · (0.44704 m/s / 1 mi/h) = ${velMs.toFixed(3)} m/s`;
  }

  // 3. Compute Time in seconds
  const timeSeconds = distMeters / velMs;

  // 4. Time in minutes and hours
  const totalMinsRaw = timeSeconds / 60;
  const hoursRaw = Math.floor(totalMinsRaw / 60);
  const remainingMinsRaw = totalMinsRaw - hoursRaw * 60;

  // Ceil logic if requested by textbook problem
  let finalRemainingMins = remainingMinsRaw;
  let ceilExplanation = '';
  if (ceilMinutes) {
    finalRemainingMins = Math.ceil(remainingMinsRaw);
    ceilExplanation = `Aproximación al entero superior: ⌈${remainingMinsRaw.toFixed(2)} min⌉ = ${finalRemainingMins} min`;
  } else {
    finalRemainingMins = +remainingMinsRaw.toFixed(2);
  }

  const travelTimeMinutes = hoursRaw * 60 + finalRemainingMins;

  // 5. Arrival Time calculation
  let arrivalInfo = null;
  if (departureTime) {
    const depMins = parseTimeToMinutes(departureTime);
    const arrMins = depMins + travelTimeMinutes;
    arrivalInfo = {
      departure: departureTime,
      arrival24: formatMinutesToTime(arrMins).time24,
      arrival12: formatMinutesToTime(arrMins).time12,
    };
  }

  return {
    type: 'single_mobile',
    label,
    inputs: {
      distance: dVal,
      distanceUnit,
      velocity: vVal,
      velocityUnit,
      departureTime,
      ceilMinutes,
    },
    conversions: {
      distMeters,
      distConvStep,
      velMs,
      velConvStep,
    },
    results: {
      timeSeconds: +timeSeconds.toFixed(2),
      totalMinutes: +totalMinsRaw.toFixed(2),
      hours: hoursRaw,
      remainingMinutes: finalRemainingMins,
      ceilExplanation,
      timeFormatted: `${hoursRaw} h ${finalRemainingMins} min`,
      arrivalInfo,
    },
  };
}

/**
 * -------------------------------------------------------------------------
 * SOLVER TYPE 2: Two-Mobile Pursuit / Overtake (Problema de Alcance)
 * Mobile 1 starts earlier or at position 0, Mobile 2 pursues at higher speed
 * -------------------------------------------------------------------------
 */
export function solveMruPursuit({
  mobile1Name = 'Móvil 1',
  v1Value,
  v1Unit = 'm/s',
  timeOffsetHours = 0, // hours after mobile 1 started
  mobile2Name = 'Móvil 2',
  v2Value,
  v2Unit = 'km/h',
  departure1Time = '05:47',
  departure2Time = '09:36',
  overtakeTime = '', // if known, to find v2 or verify
}) {
  const v1 = parseFloat(v1Value) || 0;
  const v2 = parseFloat(v2Value) || 0;

  // Convert speeds to km/h for intuitive road context
  let v1Kmh = v1;
  if (v1Unit === 'm/s') v1Kmh = v1 * 3.6;
  else if (v1Unit === 'mi/h') v1Kmh = v1 * 1.609344;

  let v2Kmh = v2;
  if (v2Unit === 'm/s') v2Kmh = v2 * 3.6;
  else if (v2Unit === 'mi/h') v2Kmh = v2 * 1.609344;

  let deltaT = parseFloat(timeOffsetHours) || 0;

  // If departure times provided, compute deltaT automatically
  if (departure1Time && departure2Time) {
    const t1Mins = parseTimeToMinutes(departure1Time);
    const t2Mins = parseTimeToMinutes(departure2Time);
    if (t2Mins > t1Mins) {
      deltaT = (t2Mins - t1Mins) / 60;
    }
  }

  // Lead distance that Mobile 1 gains before Mobile 2 leaves
  const initialLeadKm = v1Kmh * deltaT;

  // Relative speed
  const relSpeedKmh = v2Kmh - v1Kmh;

  let timeToOvertakeHours = null;
  let distanceOvertakeKm = null;
  let canOvertake = false;

  if (relSpeedKmh > 0) {
    canOvertake = true;
    timeToOvertakeHours = initialLeadKm / relSpeedKmh;
    distanceOvertakeKm = v2Kmh * timeToOvertakeHours;
  }

  return {
    type: 'pursuit',
    mobile1: {
      name: mobile1Name,
      vInput: v1,
      vUnit: v1Unit,
      vKmh: +v1Kmh.toFixed(2),
      vMs: +(v1Kmh / 3.6).toFixed(2),
      departure: departure1Time,
    },
    mobile2: {
      name: mobile2Name,
      vInput: v2,
      vUnit: v2Unit,
      vKmh: +v2Kmh.toFixed(2),
      vMs: +(v2Kmh / 3.6).toFixed(2),
      departure: departure2Time,
    },
    deltaTHours: +deltaT.toFixed(3),
    initialLeadKm: +initialLeadKm.toFixed(2),
    relSpeedKmh: +relSpeedKmh.toFixed(2),
    canOvertake,
    results: canOvertake
      ? {
          timeHours: +timeToOvertakeHours.toFixed(4),
          timeMinutes: +(timeToOvertakeHours * 60).toFixed(2),
          distanceKm: +distanceOvertakeKm.toFixed(2),
          distanceMeters: +(distanceOvertakeKm * 1000).toFixed(1),
          distanceMiles: +(distanceOvertakeKm / 1.609344).toFixed(2),
        }
      : null,
  };
}

/**
 * -------------------------------------------------------------------------
 * PRE-LOADED REAL EXERCISES (Directly from user's textbook screenshots)
 * -------------------------------------------------------------------------
 */
export const BUILT_IN_MRU_EXERCISES = [
  {
    id: 'ex1_car_miles_ms',
    title: 'Automóvil de 713 mi a 47 m/s (Salida 5:40 am)',
    topic: 'Tiempo de viaje y hora de llegada',
    source: 'Ejercicio 1 • Tarea MRU',
    statement:
      'Un automóvil inicia un viaje de 713 mi a las 5:40 de la mañana, con una velocidad media de 47 m/s. ¿A qué hora llegará a su destino? Nota: aproximar los minutos al entero superior. Ejemplo: 44.01 min aproximaría a 45 min, 50.52 min aproximaría a 51 min.',
    category: 'single_arrival',
    params: {
      distanceValue: 713,
      distanceUnit: 'mi',
      velocityValue: 47,
      velocityUnit: 'm/s',
      departureTime: '05:40',
      ceilMinutes: true,
      label: 'Automóvil',
    },
    steps: [
      {
        title: '1. Identificación de Datos',
        body: '• Distancia: d = 713 mi\n• Hora de salida: t₀ = 5:40 am\n• Velocidad: v = 47 m/s\n• Regla: Aproximar minutos al entero superior (⌈min⌉)',
      },
      {
        title: '2. Conversión de Unidades al Sistema Internacional',
        body: '1 milla = 1609.344 metros\nd = 713 mi · 1609.344 m/mi = 1,147,462.27 m',
      },
      {
        title: '3. Ecuación Horaria del MRU',
        body: 'd = v · t  ⟹  t = d / v\nt = 1,147,462.27 m / 47 m/s = 24,414.09 segundos',
      },
      {
        title: '4. Conversión a Horas y Minutos (con redondeo superior)',
        body: 't = 24,414.09 s / 60 s/min = 406.90 minutos\nHoras: ⌊406.90 / 60⌋ = 6 horas\nMinutos restantes: 406.90 - 360 = 46.90 min\nAproximando al entero superior: ⌈46.90 min⌉ = 47 min\nTiempo de viaje = 6 h 47 min',
      },
      {
        title: '5. Cálculo de la Hora de Llegada',
        body: 'Hora de salida: 5:40 am\n+ 6 horas = 11:40 am\n+ 47 minutos = 12:27 pm (12:27 de la tarde)',
      },
    ],
    finalAnswer: 'El automóvil llegará a su destino exactamente a las 12:27 de la tarde (mediodía).',
  },

  {
    id: 'ex2_car_km_kmh',
    title: 'Automóvil de 662 km a 128 km/h (Salida 10:55 am)',
    topic: 'Tiempo de viaje y hora de llegada',
    source: 'Ejercicio 2 • Tarea MRU',
    statement:
      'Un automóvil inicia un viaje de 662 km a las 10:55 de la mañana, con una velocidad media de 128 km/h. ¿A qué hora llegará a su destino? Nota: aproximar los minutos al entero superior. Ejemplo: 44.01 min aproximaría a 45 min, 50.52 min aproximaría a 51 min.',
    category: 'single_arrival',
    params: {
      distanceValue: 662,
      distanceUnit: 'km',
      velocityValue: 128,
      velocityUnit: 'km/h',
      departureTime: '10:55',
      ceilMinutes: true,
      label: 'Automóvil',
    },
    steps: [
      {
        title: '1. Identificación de Datos',
        body: '• Distancia: d = 662 km\n• Velocidad: v = 128 km/h\n• Hora de salida: t₀ = 10:55 am\n• Condición: Redondear minutos al entero superior',
      },
      {
        title: '2. Cálculo del Tiempo de Viaje en Horas',
        body: 'd = v · t  ⟹  t = d / v\nt = 662 km / 128 km/h = 5.171875 horas',
      },
      {
        title: '3. Conversión de Fracción Decimal a Minutos',
        body: 'Horas enteras = 5 horas\nMinutos decimales = 0.171875 · 60 min = 10.3125 min\nAproximando al entero superior: ⌈10.3125 min⌉ = 11 min\nTiempo total = 5 horas y 11 minutos',
      },
      {
        title: '4. Suma a la Hora de Partida',
        body: '10:55 am + 5 h 11 min:\n10:55 + 5 h = 15:55 (3:55 pm)\n15:55 + 11 min = 16:06 (4:06 pm)',
      },
    ],
    finalAnswer: 'El automóvil llegará a su destino a las 16:06 (4:06 de la tarde).',
  },

  {
    id: 'ex3_cyclist_77km',
    title: 'Ciclista entre 2 pueblos distantes 77 km a 19 m/s',
    topic: 'Conversión y cálculo de tiempo',
    source: 'Ejercicio 3 • Tarea MRU',
    statement:
      'Dos pueblos que distan 77 km están unidos por una carretera recta. Un ciclista viaja de un pueblo al otro con una velocidad constante de 19 m/s. Calcula el tiempo que emplea, medido en segundos y en minutos.',
    category: 'single_simple',
    params: {
      distanceValue: 77,
      distanceUnit: 'km',
      velocityValue: 19,
      velocityUnit: 'm/s',
      departureTime: '',
      ceilMinutes: false,
      label: 'Ciclista',
    },
    steps: [
      {
        title: '1. Datos del Problema',
        body: '• Distancia entre pueblos: d = 77 km\n• Rapidez constante del ciclista: v = 19 m/s\n• Incógnita: Tiempo t en segundos [s] y en minutos [min]',
      },
      {
        title: '2. Conversión de Kilómetros a Metros',
        body: 'd = 77 km · (1000 m / 1 km) = 77,000 metros',
      },
      {
        title: '3. Cálculo del Tiempo en Segundos',
        body: 't = d / v = 77,000 m / 19 m/s = 4,052.63 segundos',
      },
      {
        title: '4. Conversión a Minutos',
        body: 't_min = 4,052.63 s / 60 s/min = 67.54 minutos (≈ 1 h 7 min 32.6 s)',
      },
    ],
    finalAnswer: 'El ciclista emplea 4,052.63 segundos (equivalente a 67.54 minutos).',
  },

  {
    id: 'ex4_two_boats_pursuit',
    title: 'Dos lanchas en un río (Alcance con desfase 2.25 h)',
    topic: 'Problema de alcance entre dos móviles',
    source: 'Ejercicio 4 • Tarea MRU',
    statement:
      'Dos pescadores salen en lanchas distintas por un río. El primero lo hace a 5 m/s, y 2.25 h después parte el segundo a 68.4 km/h. ¿Qué distancia recorrerá el segundo pescador hasta alcanzar al primero?',
    category: 'pursuit',
    params: {
      mobile1Name: 'Pescador 1 (Lancha A)',
      v1Value: 5,
      v1Unit: 'm/s',
      timeOffsetHours: 2.25,
      mobile2Name: 'Pescador 2 (Lancha B)',
      v2Value: 68.4,
      v2Unit: 'km/h',
    },
    steps: [
      {
        title: '1. Homogeneización de Unidades de Velocidad',
        body: 'Pescador 1: v₁ = 5 m/s · 3.6 = 18 km/h\nPescador 2: v₂ = 68.4 km/h\nDesfase de tiempo: Δt = 2.25 horas',
      },
      {
        title: '2. Ventaja recorrida por el Primer Pescador',
        body: 'd₀ = v₁ · Δt = 18 km/h · 2.25 h = 40.5 km de adelanto',
      },
      {
        title: '3. Ecuaciones Horarias de Posición',
        body: 'Tomando t = 0 cuando parte el segundo pescador:\nx₁(t) = 40.5 + 18·t\nx₂(t) = 68.4·t',
      },
      {
        title: '4. Condición de Alcance (x₁ = x₂)',
        body: '68.4·t = 40.5 + 18·t\n(68.4 - 18)·t = 40.5\n50.4·t = 40.5  ⟹  t = 40.5 / 50.4 = 45/56 ≈ 0.80357 horas (48.21 min)',
      },
      {
        title: '5. Distancia Recorrida por el Segundo Pescador',
        body: 'd₂ = v₂ · t = 68.4 km/h · (45/56 h) = 54.96 km (54,964.3 metros)',
      },
    ],
    finalAnswer: 'El segundo pescador recorrerá 54.96 km (≈ 54,964 m) hasta alcanzar al primero.',
  },

  {
    id: 'ex5_two_buses_overtake',
    title: 'Dos autobuses en la misma carretera (Alcance a las 18:55)',
    topic: 'Problema de alcance con velocidad incógnita',
    source: 'Ejercicio 5 • Tarea MRU',
    statement:
      'Una empresa de transporte organiza el viaje de dos autobuses hacia una ciudad ubicada en línea recta sobre la misma carretera.\n• El primer autobús salió de la terminal a las 5:47, viajando a 38.036 mi/h.\n• El segundo autobús salió de la misma terminal a las 9:36, y alcanzó al primero exactamente a las 18:55.',
    category: 'pursuit_velocity',
    steps: [
      {
        title: '1. Tiempo de Viaje del Primer Autobús hasta el Alcance',
        body: 'Desde las 5:47 am hasta las 18:55 pm:\n18:55 - 5:47 = 13 horas y 8 minutos = 13 + (8/60) = 13.1333 horas',
      },
      {
        title: '2. Distancia Recorrida hasta el Punto de Encuentro',
        body: 'd = v₁ · t₁ = 38.036 mi/h · 13.1333 h = 499.54 millas (≈ 500 millas exactas)',
      },
      {
        title: '3. Tiempo de Viaje del Segundo Autobús',
        body: 'Desde las 9:36 am hasta las 18:55 pm:\n18:55 - 9:36 = 9 horas y 19 minutos = 9 + (19/60) = 9.3167 horas',
      },
      {
        title: '4. Velocidad Necesaria del Segundo Autobús',
        body: 'v₂ = d / t₂ = 499.54 mi / 9.3167 h = 53.62 mi/h\n(En km/h: 53.62 · 1.609344 = 86.29 km/h • En m/s: 23.97 m/s)',
      },
    ],
    finalAnswer: 'El segundo autobús viajó a una velocidad media constante de 53.62 mi/h (86.29 km/h) y recorrió 500 millas.',
  },
];

/**
 * -------------------------------------------------------------------------
 * GENERATOR: Inserts Complete Exercise Solution & Scale Physics Track into Whiteboard
 * -------------------------------------------------------------------------
 */
export function buildExerciseBoardElements(exercise, cx, cy) {
  const elements = [];
  const startX = cx - 440;
  const startY = cy - 220;

  // 1. Header Banner
  elements.push({
    id: `hdr_${Date.now()}`,
    type: 'text',
    x: startX,
    y: startY,
    text: `📐 RESOLUCIÓN DE EJERCICIO: ${exercise.title.toUpperCase()}`,
    color: '#050038',
    fontSize: 20,
  });

  // 2. Statement Sticky Note
  elements.push({
    id: `stmt_${Date.now()}`,
    type: 'sticky',
    x: startX,
    y: startY + 36,
    width: 280,
    height: 180,
    text: `📝 ENUNCIADO:\n${exercise.statement}`,
    color: '#fff9b1',
  });

  // 3. Step by step solution cards
  const cardW = 270;
  const cardH = 180;
  exercise.steps.forEach((step, idx) => {
    const col = (idx + 1) % 3;
    const row = Math.floor((idx + 1) / 3);
    const cardX = startX + col * (cardW + 15);
    const cardY = startY + 36 + row * (cardH + 15);

    const colors = ['#d5f0ff', '#d3f8df', '#fed7aa', '#edd9ff', '#ffd5dc'];
    const cardColor = colors[idx % colors.length];

    elements.push({
      id: `step_${idx}_${Date.now()}`,
      type: 'sticky',
      x: cardX,
      y: cardY,
      width: cardW,
      height: cardH,
      text: `${step.title}\n\n${step.body}`,
      color: cardColor,
    });
  });

  // 4. Final Answer Highlight Box
  const answerY = startY + 36 + Math.ceil((exercise.steps.length + 1) / 3) * (cardH + 15) - 20;
  elements.push({
    id: `ans_${Date.now()}`,
    type: 'sticky',
    x: startX,
    y: answerY,
    width: 580,
    height: 90,
    text: `🎯 RESPUESTA FINAL:\n${exercise.finalAnswer}`,
    color: '#d3f8df',
  });

  // 5. Interactive Scale Physics Assembly on Canvas!
  const trackY = answerY + 140;
  const trackW = 720;

  // Rail / Track
  const track = createPhysicsElement('mru_track', startX + trackW / 2, trackY, {
    label: `Trayectoria (${exercise.title})`,
    width: trackW,
    height: 38,
    lengthMeters: 10.0,
  });
  elements.push(track);

  // If Exercise 4 or 5 (Two mobiles pursuit)
  if (exercise.category === 'pursuit' || exercise.category === 'pursuit_velocity') {
    // Mobile 1 (Lead)
    const cart1 = createPhysicsElement('mru_cart', startX + 260, trackY - 38, {
      label: exercise.params?.mobile1Name || 'Autobús 1',
      velocity: 2.2, // scaled for canvas
      displayVelocity: exercise.params?.v1Value || 38.036,
      unit: exercise.params?.v1Unit || 'mi/h',
      color: '#0284c7',
      showVector: true,
      departureTime: exercise.params?.departure1Time || '5:47 am',
    });

    // Mobile 2 (Pursuer)
    const cart2 = createPhysicsElement('mru_cart', startX + 40, trackY - 38, {
      label: exercise.params?.mobile2Name || 'Autobús 2',
      velocity: 3.6, // higher speed
      displayVelocity: exercise.params?.v2Value || 53.62,
      unit: exercise.params?.v2Unit || 'mi/h',
      color: '#16a34a',
      showVector: true,
      departureTime: exercise.params?.departure2Time || '9:36 am',
    });

    elements.push(cart1, cart2);
  } else {
    // Single mobile exercise
    const cart = createPhysicsElement('mru_cart', startX + 50, trackY - 38, {
      label: exercise.params?.label || 'Automóvil',
      velocity: 2.8,
      displayVelocity: exercise.params?.velocityValue || 47,
      unit: exercise.params?.velocityUnit || 'm/s',
      color: '#0284c7',
      showVector: true,
      departureTime: exercise.params?.departureTime ? `${exercise.params.departureTime} am` : '',
    });
    elements.push(cart);
  }

  return elements;
}
