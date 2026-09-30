import React, { useState } from 'react';
import { 
  X, 
  Calculator, 
  BookOpen, 
  ArrowRight, 
  Clock, 
  Gauge, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Play,
  RotateCcw,
  Plus
} from 'lucide-react';
import { 
  BUILT_IN_MRU_EXERCISES, 
  solveMruSingleMobile, 
  solveMruPursuit,
  buildExerciseBoardElements 
} from '../../services/mruExerciseSolver';

export default function MruExerciseSolverModal({
  isOpen,
  onClose,
  onMountExerciseOnBoard,
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('builtin'); // 'builtin', 'custom_single', 'custom_pursuit'
  const [selectedBuiltinId, setSelectedBuiltinId] = useState(BUILT_IN_MRU_EXERCISES[0].id);

  // Custom Single Mobile Form State
  const [singleDist, setSingleDist] = useState(662);
  const [singleDistUnit, setSingleDistUnit] = useState('km');
  const [singleVel, setSingleVel] = useState(128);
  const [singleVelUnit, setSingleVelUnit] = useState('km/h');
  const [singleDepTime, setSingleDepTime] = useState('10:55');
  const [singleCeil, setSingleCeil] = useState(true);
  const [singleLabel, setSingleLabel] = useState('Automóvil');

  // Custom Pursuit Form State
  const [mob1Name, setMob1Name] = useState('Móvil 1');
  const [mob1Vel, setMob1Vel] = useState(18);
  const [mob1Unit, setMob1Unit] = useState('km/h');
  const [mob1Dep, setMob1Dep] = useState('06:00');
  
  const [mob2Name, setMob2Name] = useState('Móvil 2 (Perseguidor)');
  const [mob2Vel, setMob2Vel] = useState(68.4);
  const [mob2Unit, setMob2Unit] = useState('km/h');
  const [mob2Dep, setMob2Dep] = useState('08:15');

  // Selected builtin exercise
  const currentBuiltin = BUILT_IN_MRU_EXERCISES.find((e) => e.id === selectedBuiltinId) || BUILT_IN_MRU_EXERCISES[0];

  // Live calculation for Custom Single
  const singleSolution = solveMruSingleMobile({
    distanceValue: singleDist,
    distanceUnit: singleDistUnit,
    velocityValue: singleVel,
    velocityUnit: singleVelUnit,
    departureTime: singleDepTime,
    ceilMinutes: singleCeil,
    label: singleLabel,
  });

  // Live calculation for Custom Pursuit
  const pursuitSolution = solveMruPursuit({
    mobile1Name: mob1Name,
    v1Value: mob1Vel,
    v1Unit: mob1Unit,
    mobile2Name: mob2Name,
    v2Value: mob2Vel,
    v2Unit: mob2Unit,
    departure1Time: mob1Dep,
    departure2Time: mob2Dep,
  });

  // Handler to mount builtin on whiteboard
  const handleMountBuiltin = () => {
    if (onMountExerciseOnBoard) {
      onMountExerciseOnBoard(currentBuiltin);
      onClose();
    }
  };

  // Handler to mount custom single on whiteboard
  const handleMountCustomSingle = () => {
    if (!singleSolution) return;
    const customEx = {
      id: `custom_single_${Date.now()}`,
      title: `${singleLabel} (${singleDist} ${singleDistUnit} a ${singleVel} ${singleVelUnit})`,
      statement: `Un ${singleLabel.toLowerCase()} recorre una distancia de ${singleDist} ${singleDistUnit} con velocidad constante de ${singleVel} ${singleVelUnit}${singleDepTime ? ` partiendo a las ${singleDepTime}` : ''}. ¿Cuánto tiempo emplea${singleDepTime ? ' y a qué hora llega' : ''}?`,
      category: 'single_arrival',
      params: {
        distanceValue: singleDist,
        distanceUnit: singleDistUnit,
        velocityValue: singleVel,
        velocityUnit: singleVelUnit,
        departureTime: singleDepTime,
        ceilMinutes: singleCeil,
        label: singleLabel,
      },
      steps: [
        {
          title: '1. Datos Identificados',
          body: `• Distancia: d = ${singleDist} ${singleDistUnit}\n• Velocidad: v = ${singleVel} ${singleVelUnit}${singleDepTime ? `\n• Salida: t₀ = ${singleDepTime}` : ''}`,
        },
        {
          title: '2. Conversiones Homogéneas',
          body: `• ${singleSolution.conversions.distConvStep}\n• ${singleSolution.conversions.velConvStep}`,
        },
        {
          title: '3. Ecuación Horaria MRU',
          body: `d = v · t  ⟹  t = d / v\nt = ${singleSolution.results.timeSeconds} segundos`,
        },
        {
          title: '4. Tiempo en Horas y Minutos',
          body: `Tiempo total = ${singleSolution.results.timeFormatted}${singleSolution.results.ceilExplanation ? `\n• ${singleSolution.results.ceilExplanation}` : ''}`,
        },
        ...(singleSolution.results.arrivalInfo
          ? [
              {
                title: '5. Hora de Llegada',
                body: `Salida: ${singleSolution.results.arrivalInfo.departure} ⟹ Llegada estimada: ${singleSolution.results.arrivalInfo.arrival24} (${singleSolution.results.arrivalInfo.arrival12})`,
              },
            ]
          : []),
      ],
      finalAnswer: singleSolution.results.arrivalInfo
        ? `Llegará a su destino a las ${singleSolution.results.arrivalInfo.arrival24} tras ${singleSolution.results.timeFormatted} de viaje.`
        : `Empleará un tiempo de ${singleSolution.results.timeFormatted} (${singleSolution.results.timeSeconds} s).`,
    };

    if (onMountExerciseOnBoard) {
      onMountExerciseOnBoard(customEx);
      onClose();
    }
  };

  // Handler to mount custom pursuit on whiteboard
  const handleMountCustomPursuit = () => {
    if (!pursuitSolution || !pursuitSolution.canOvertake) return;
    const customEx = {
      id: `custom_pursuit_${Date.now()}`,
      title: `Problema de Alcance: ${mob2Name} persigue a ${mob1Name}`,
      statement: `Dos móviles se desplazan sobre la misma ruta recta:\n• ${mob1Name} con v₁ = ${mob1Vel} ${mob1Unit} saliendo a las ${mob1Dep}.\n• ${mob2Name} con v₂ = ${mob2Vel} ${mob2Unit} saliendo a las ${mob2Dep}.\n¿En qué punto y tras qué tiempo alcanza el segundo al primero?`,
      category: 'pursuit',
      params: {
        mobile1Name: mob1Name,
        v1Value: mob1Vel,
        v1Unit: mob1Unit,
        mobile2Name: mob2Name,
        v2Value: mob2Vel,
        v2Unit: mob2Unit,
        departure1Time: mob1Dep,
        departure2Time: mob2Dep,
      },
      steps: [
        {
          title: '1. Velocidades Homogéneas',
          body: `• ${mob1Name}: v₁ = ${pursuitSolution.mobile1.vKmh} km/h (${pursuitSolution.mobile1.vMs} m/s)\n• ${mob2Name}: v₂ = ${pursuitSolution.mobile2.vKmh} km/h (${pursuitSolution.mobile2.vMs} m/s)\n• Desfase: Δt = ${pursuitSolution.deltaTHours} h`,
        },
        {
          title: '2. Ventaja del Primer Móvil',
          body: `d₀ = v₁ · Δt = ${pursuitSolution.mobile1.vKmh} km/h · ${pursuitSolution.deltaTHours} h = ${pursuitSolution.initialLeadKm} km`,
        },
        {
          title: '3. Ecuaciones de Alcance (x₁ = x₂)',
          body: `x₁(t) = ${pursuitSolution.initialLeadKm} + ${pursuitSolution.mobile1.vKmh}·t\nx₂(t) = ${pursuitSolution.mobile2.vKmh}·t\n(${pursuitSolution.mobile2.vKmh} - ${pursuitSolution.mobile1.vKmh})·t = ${pursuitSolution.initialLeadKm}\n${pursuitSolution.relSpeedKmh}·t = ${pursuitSolution.initialLeadKm}`,
        },
        {
          title: '4. Tiempo y Distancia de Alcance',
          body: `Tiempo de alcance = ${pursuitSolution.results.timeHours} horas (${pursuitSolution.results.timeMinutes} minutos)\nDistancia de alcance = ${pursuitSolution.results.distanceKm} km (${pursuitSolution.results.distanceMiles} mi)`,
        },
      ],
      finalAnswer: `${mob2Name} alcanzará a ${mob1Name} tras recorrer ${pursuitSolution.results.distanceKm} km en un tiempo de ${pursuitSolution.results.timeMinutes} minutos.`,
    };

    if (onMountExerciseOnBoard) {
      onMountExerciseOnBoard(customEx);
      onClose();
    }
  };

  return (
    <div className="mru-solver-modal-backdrop" onClick={onClose}>
      <div className="mru-solver-modal-card miro-island" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="solver-header">
          <div className="solver-title-group">
            <div className="solver-brand-icon">
              <Calculator size={20} />
            </div>
            <div>
              <div className="solver-badge-row">
                <span className="solver-badge">Cinemática & Laboratorio MRU</span>
                <span className="solver-badge-pill">Paso a Paso</span>
              </div>
              <h2 className="solver-title">Solucionador de Ejercicios MRU</h2>
            </div>
          </div>
          <button className="solver-close-btn" onClick={onClose} title="Cerrar (Esc)">
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="solver-tabs-bar">
          <button
            className={`solver-tab-btn ${activeTab === 'builtin' ? 'active' : ''}`}
            onClick={() => setActiveTab('builtin')}
          >
            <BookOpen size={15} />
            <span>Ejercicios de Tarea y Examen ({BUILT_IN_MRU_EXERCISES.length})</span>
          </button>
          <button
            className={`solver-tab-btn ${activeTab === 'custom_single' ? 'active' : ''}`}
            onClick={() => setActiveTab('custom_single')}
          >
            <Gauge size={15} />
            <span>Calculadora: Tiempo & Hora de Llegada</span>
          </button>
          <button
            className={`solver-tab-btn ${activeTab === 'custom_pursuit' ? 'active' : ''}`}
            onClick={() => setActiveTab('custom_pursuit')}
          >
            <Layers size={15} />
            <span>Calculadora: 2 Móviles (Alcance)</span>
          </button>
        </div>

        {/* Modal Main Area */}
        <div className="solver-content-area">
          {/* ------------------------------------------------------------- */}
          {/* TAB 1: BUILT-IN REAL EXERCISES (The 5 from user screenshots) */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'builtin' && (
            <div className="builtin-layout">
              {/* Exercise Selector List */}
              <div className="builtin-sidebar">
                <span className="sidebar-heading">Selecciona un ejercicio:</span>
                <div className="builtin-exercises-list">
                  {BUILT_IN_MRU_EXERCISES.map((ex, idx) => (
                    <div
                      key={ex.id}
                      className={`builtin-item-card ${selectedBuiltinId === ex.id ? 'active' : ''}`}
                      onClick={() => setSelectedBuiltinId(ex.id)}
                    >
                      <div className="item-card-header">
                        <span className="item-number">#{idx + 1}</span>
                        <span className="item-source">{ex.source}</span>
                      </div>
                      <span className="item-title">{ex.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Solution Preview Pane */}
              <div className="builtin-preview-pane">
                {/* Statement Card */}
                <div className="preview-statement-card">
                  <div className="statement-badge-row">
                    <span className="statement-badge">{currentBuiltin.topic}</span>
                  </div>
                  <h4 className="statement-title">{currentBuiltin.title}</h4>
                  <p className="statement-text">{currentBuiltin.statement}</p>
                </div>

                {/* Step by Step Breakdown */}
                <div className="steps-container">
                  <span className="steps-heading">Desarrollo Matemático Paso a Paso:</span>
                  <div className="steps-grid">
                    {currentBuiltin.steps.map((st, sIdx) => (
                      <div key={sIdx} className="step-card">
                        <span className="step-card-title">{st.title}</span>
                        <pre className="step-card-body">{st.body}</pre>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final Answer Banner */}
                <div className="final-answer-banner">
                  <CheckCircle2 size={18} className="answer-icon" />
                  <div>
                    <span className="answer-label">Respuesta del Ejercicio:</span>
                    <p className="answer-text">{currentBuiltin.finalAnswer}</p>
                  </div>
                </div>

                {/* Big Action Button: Mount on whiteboard */}
                <div className="preview-actions-bar">
                  <button className="mount-board-btn" onClick={handleMountBuiltin}>
                    <Sparkles size={16} />
                    <span>Montar Explicación y Móvil en el Lienzo</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 2: CUSTOM SINGLE MOBILE (d, v, t0, ceil minutes)          */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'custom_single' && (
            <div className="custom-calculator-layout">
              <div className="calculator-form-pane">
                <h4 className="pane-title">Parámetros del Ejercicio:</h4>

                <div className="form-group">
                  <label className="form-label">Nombre del Móvil:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={singleLabel}
                    onChange={(e) => setSingleLabel(e.target.value)}
                    placeholder="Ej: Automóvil, Ciclista..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Distancia (d):</label>
                  <div className="input-with-select">
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      value={singleDist}
                      onChange={(e) => setSingleDist(e.target.value)}
                      placeholder="662"
                    />
                    <select
                      className="form-select"
                      value={singleDistUnit}
                      onChange={(e) => setSingleDistUnit(e.target.value)}
                    >
                      <option value="km">km</option>
                      <option value="m">m</option>
                      <option value="mi">mi (millas)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Velocidad Media / Constante (v):</label>
                  <div className="input-with-select">
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      value={singleVel}
                      onChange={(e) => setSingleVel(e.target.value)}
                      placeholder="128"
                    />
                    <select
                      className="form-select"
                      value={singleVelUnit}
                      onChange={(e) => setSingleVelUnit(e.target.value)}
                    >
                      <option value="km/h">km/h</option>
                      <option value="m/s">m/s</option>
                      <option value="mi/h">mi/h</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Hora de Salida (opcional):</label>
                  <div className="input-icon-row">
                    <Clock size={15} className="inner-icon" />
                    <input
                      type="text"
                      className="form-input with-icon"
                      value={singleDepTime}
                      onChange={(e) => setSingleDepTime(e.target.value)}
                      placeholder="Ej: 10:55, 5:40, 08:00..."
                    />
                  </div>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={singleCeil}
                      onChange={(e) => setSingleCeil(e.target.checked)}
                    />
                    <span>
                      Aproximar minutos al entero superior (ej: 44.01 min ➔ 45 min)
                    </span>
                  </label>
                </div>
              </div>

              {/* Solution Output */}
              <div className="calculator-result-pane">
                {singleSolution ? (
                  <>
                    <h4 className="pane-title">Solución Calculada en Tiempo Real:</h4>
                    <div className="result-kpis-grid">
                      <div className="kpi-card">
                        <span className="kpi-label">Tiempo Total</span>
                        <span className="kpi-value">{singleSolution.results.timeFormatted}</span>
                      </div>
                      <div className="kpi-card">
                        <span className="kpi-label">En Segundos</span>
                        <span className="kpi-value">{singleSolution.results.timeSeconds.toLocaleString()} s</span>
                      </div>
                      {singleSolution.results.arrivalInfo && (
                        <div className="kpi-card highlight">
                          <span className="kpi-label">Hora de Llegada</span>
                          <span className="kpi-value">{singleSolution.results.arrivalInfo.arrival24}</span>
                          <span className="kpi-sub">{singleSolution.results.arrivalInfo.arrival12}</span>
                        </div>
                      )}
                    </div>

                    <div className="step-card" style={{ marginTop: 12 }}>
                      <span className="step-card-title">Factores de Conversión y Desarrollo:</span>
                      <pre className="step-card-body">
                        {`1. Homogeneización:
• ${singleSolution.conversions.distConvStep}
• ${singleSolution.conversions.velConvStep}

2. Fórmula del MRU:
• d = v · t  ⟹  t = d / v
• t = ${singleSolution.conversions.distMeters.toFixed(2)} m / ${singleSolution.conversions.velMs.toFixed(3)} m/s = ${singleSolution.results.timeSeconds} s

3. Tiempo Horas / Minutos:
• ${singleSolution.results.timeFormatted}${singleSolution.results.ceilExplanation ? `\n• ${singleSolution.results.ceilExplanation}` : ''}`}
                      </pre>
                    </div>

                    <button className="mount-board-btn" onClick={handleMountCustomSingle} style={{ marginTop: 14 }}>
                      <Sparkles size={16} />
                      <span>Insertar este Ejercicio en la Pizarra</span>
                      <ArrowRight size={16} />
                    </button>
                  </>
                ) : (
                  <p className="no-result-text">Introduce distancia y velocidad válidas para ver la solución.</p>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 3: CUSTOM PURSUIT (2 MOBILES OVERTAKE)                    */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'custom_pursuit' && (
            <div className="custom-calculator-layout">
              <div className="calculator-form-pane">
                <h4 className="pane-title">Problema de Alcance (2 Móviles):</h4>

                {/* Mobile 1 */}
                <div className="mobile-section-box">
                  <span className="mobile-box-title">Móvil 1 (Líder / Parte Primero)</span>
                  <div className="form-group">
                    <label className="form-label">Nombre:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={mob1Name}
                      onChange={(e) => setMob1Name(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Velocidad (v₁):</label>
                    <div className="input-with-select">
                      <input
                        type="number"
                        step="any"
                        className="form-input"
                        value={mob1Vel}
                        onChange={(e) => setMob1Vel(e.target.value)}
                      />
                      <select
                        className="form-select"
                        value={mob1Unit}
                        onChange={(e) => setMob1Unit(e.target.value)}
                      >
                        <option value="km/h">km/h</option>
                        <option value="m/s">m/s</option>
                        <option value="mi/h">mi/h</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hora de Salida:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={mob1Dep}
                      onChange={(e) => setMob1Dep(e.target.value)}
                      placeholder="06:00"
                    />
                  </div>
                </div>

                {/* Mobile 2 */}
                <div className="mobile-section-box">
                  <span className="mobile-box-title">Móvil 2 (Perseguidor / Mayor Rapidez)</span>
                  <div className="form-group">
                    <label className="form-label">Nombre:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={mob2Name}
                      onChange={(e) => setMob2Name(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Velocidad (v₂):</label>
                    <div className="input-with-select">
                      <input
                        type="number"
                        step="any"
                        className="form-input"
                        value={mob2Vel}
                        onChange={(e) => setMob2Vel(e.target.value)}
                      />
                      <select
                        className="form-select"
                        value={mob2Unit}
                        onChange={(e) => setMob2Unit(e.target.value)}
                      >
                        <option value="km/h">km/h</option>
                        <option value="m/s">m/s</option>
                        <option value="mi/h">mi/h</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hora de Salida:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={mob2Dep}
                      onChange={(e) => setMob2Dep(e.target.value)}
                      placeholder="08:15"
                    />
                  </div>
                </div>
              </div>

              {/* Pursuit Solution Output */}
              <div className="calculator-result-pane">
                {pursuitSolution && pursuitSolution.canOvertake ? (
                  <>
                    <h4 className="pane-title">Punto y Momento de Alcance:</h4>
                    <div className="result-kpis-grid">
                      <div className="kpi-card highlight">
                        <span className="kpi-label">Distancia de Alcance</span>
                        <span className="kpi-value">{pursuitSolution.results.distanceKm} km</span>
                        <span className="kpi-sub">({pursuitSolution.results.distanceMiles} mi)</span>
                      </div>
                      <div className="kpi-card">
                        <span className="kpi-label">Tiempo de Persecución</span>
                        <span className="kpi-value">{pursuitSolution.results.timeMinutes} min</span>
                        <span className="kpi-sub">({pursuitSolution.results.timeHours} h)</span>
                      </div>
                      <div className="kpi-card">
                        <span className="kpi-label">Ventaja Inicial (d₀)</span>
                        <span className="kpi-value">{pursuitSolution.initialLeadKm} km</span>
                        <span className="kpi-sub">Desfase: {pursuitSolution.deltaTHours} h</span>
                      </div>
                    </div>

                    <div className="step-card" style={{ marginTop: 12 }}>
                      <span className="step-card-title">Ecuaciones Horarias de Posición:</span>
                      <pre className="step-card-body">
                        {`x₁(t) = ${pursuitSolution.initialLeadKm} + ${pursuitSolution.mobile1.vKmh}·t
x₂(t) = ${pursuitSolution.mobile2.vKmh}·t

Condición de alcance x₁ = x₂:
${pursuitSolution.mobile2.vKmh}·t = ${pursuitSolution.initialLeadKm} + ${pursuitSolution.mobile1.vKmh}·t
(${pursuitSolution.mobile2.vKmh} - ${pursuitSolution.mobile1.vKmh})·t = ${pursuitSolution.initialLeadKm}
${pursuitSolution.relSpeedKmh}·t = ${pursuitSolution.initialLeadKm}  ⟹  t = ${pursuitSolution.results.timeHours} h

Distancia recorrida por ${mob2Name}:
d = v₂ · t = ${pursuitSolution.mobile2.vKmh} km/h · ${pursuitSolution.results.timeHours} h = ${pursuitSolution.results.distanceKm} km`}
                      </pre>
                    </div>

                    <button className="mount-board-btn" onClick={handleMountCustomPursuit} style={{ marginTop: 14 }}>
                      <Sparkles size={16} />
                      <span>Montar Ambos Móviles en la Pizarra</span>
                      <ArrowRight size={16} />
                    </button>
                  </>
                ) : (
                  <div className="alert-card warning">
                    <p>
                      Para que exista alcance, la rapidez del segundo móvil ({mob2Vel} {mob2Unit}) debe ser estrictamente mayor que la del primero ({mob1Vel} {mob1Unit}).
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .mru-solver-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.16s ease-out;
        }

        .mru-solver-modal-card {
          width: 95%;
          max-width: 960px;
          height: 85vh;
          max-height: 720px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 25px 60px rgba(15, 23, 42, 0.25);
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: scaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .solver-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 22px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .solver-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .solver-brand-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #eff6ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .solver-badge-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 2px;
        }

        .solver-badge {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #2563eb;
          letter-spacing: 0.04em;
        }

        .solver-badge-pill {
          font-size: 0.6rem;
          font-weight: 700;
          background: #10b981;
          color: #ffffff;
          padding: 1px 6px;
          border-radius: 9999px;
        }

        .solver-title {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
        }

        .solver-close-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          transition: all 0.12s;
        }

        .solver-close-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .solver-tabs-bar {
          display: flex;
          gap: 6px;
          padding: 8px 18px;
          background: #f1f5f9;
          border-bottom: 1px solid #e2e8f0;
        }

        .solver-tab-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 14px;
          border-radius: 8px;
          border: 1px solid transparent;
          background: transparent;
          font-family: var(--font-sans);
          font-size: 0.8rem;
          font-weight: 700;
          color: #64748b;
          cursor: pointer;
          transition: all 0.14s ease;
        }

        .solver-tab-btn:hover {
          color: #0f172a;
          background: #e2e8f0;
        }

        .solver-tab-btn.active {
          background: #ffffff;
          color: #2563eb;
          border-color: #cbd5e1;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
        }

        .solver-content-area {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        /* Builtin Tab Layout */
        .builtin-layout {
          display: flex;
          height: 100%;
          min-height: 480px;
        }

        .builtin-sidebar {
          width: 300px;
          background: #f8fafc;
          border-right: 1px solid #e2e8f0;
          padding: 14px 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow-y: auto;
        }

        .sidebar-heading {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
          letter-spacing: 0.04em;
        }

        .builtin-exercises-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .builtin-item-card {
          padding: 10px 12px;
          border-radius: 10px;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.14s ease;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .builtin-item-card:hover {
          border-color: #93c5fd;
          transform: translateY(-1px);
        }

        .builtin-item-card.active {
          border-color: #2563eb;
          background: #eff6ff;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.12);
        }

        .item-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .item-number {
          font-size: 0.68rem;
          font-weight: 800;
          color: #2563eb;
        }

        .item-source {
          font-size: 0.62rem;
          color: #64748b;
          font-weight: 600;
        }

        .item-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.3;
        }

        /* Preview Pane */
        .builtin-preview-pane {
          flex: 1;
          padding: 18px 22px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .preview-statement-card {
          padding: 14px 16px;
          border-radius: 12px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .statement-badge {
          font-size: 0.65rem;
          font-weight: 700;
          color: #b45309;
          text-transform: uppercase;
        }

        .statement-title {
          margin: 0;
          font-size: 1rem;
          font-weight: 800;
          color: #78350f;
        }

        .statement-text {
          margin: 0;
          font-size: 0.84rem;
          color: #92400e;
          line-height: 1.45;
        }

        .steps-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .steps-heading {
          font-size: 0.76rem;
          font-weight: 700;
          color: #334155;
          text-transform: uppercase;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 10px;
        }

        .step-card {
          padding: 10px 12px;
          border-radius: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .step-card-title {
          font-size: 0.74rem;
          font-weight: 700;
          color: #1e293b;
        }

        .step-card-body {
          margin: 0;
          font-family: var(--font-sans);
          font-size: 0.76rem;
          color: #475569;
          line-height: 1.4;
          white-space: pre-wrap;
        }

        .final-answer-banner {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 16px;
          background: #f0fdf4;
          border: 1.5px solid #86efac;
          border-radius: 10px;
        }

        .answer-icon {
          color: #16a34a;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .answer-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: #15803d;
          text-transform: uppercase;
        }

        .answer-text {
          margin: 2px 0 0;
          font-size: 0.88rem;
          font-weight: 800;
          color: #14532d;
        }

        .preview-actions-bar {
          margin-top: auto;
          padding-top: 10px;
        }

        .mount-board-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 10px;
          background: #2563eb;
          color: #ffffff;
          border: none;
          font-family: var(--font-sans);
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
          transition: all 0.14s ease;
        }

        .mount-board-btn:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        /* Custom Calculator Layout */
        .custom-calculator-layout {
          display: flex;
          height: 100%;
          min-height: 480px;
        }

        .calculator-form-pane {
          width: 340px;
          background: #f8fafc;
          border-right: 1px solid #e2e8f0;
          padding: 16px 18px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pane-title {
          margin: 0;
          font-size: 0.88rem;
          font-weight: 800;
          color: #0f172a;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .form-label {
          font-size: 0.74rem;
          font-weight: 600;
          color: #334155;
        }

        .form-input {
          padding: 7px 10px;
          border-radius: 8px;
          border: 1.5px solid #cbd5e1;
          font-family: var(--font-sans);
          font-size: 0.84rem;
          color: #0f172a;
          outline: none;
        }

        .form-input:focus {
          border-color: #2563eb;
        }

        .input-with-select {
          display: flex;
          gap: 6px;
        }

        .input-with-select .form-input {
          flex: 1;
        }

        .form-select {
          padding: 6px 8px;
          border-radius: 8px;
          border: 1.5px solid #cbd5e1;
          background: #ffffff;
          font-family: var(--font-sans);
          font-size: 0.8rem;
          font-weight: 600;
          color: #1e293b;
          outline: none;
        }

        .input-icon-row {
          position: relative;
          display: flex;
          align-items: center;
        }

        .inner-icon {
          position: absolute;
          left: 10px;
          color: #64748b;
        }

        .form-input.with-icon {
          padding-left: 30px;
          width: 100%;
        }

        .checkbox-group {
          margin-top: 4px;
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          font-size: 0.74rem;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          line-height: 1.35;
        }

        .mobile-section-box {
          padding: 10px 12px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mobile-box-title {
          font-size: 0.74rem;
          font-weight: 700;
          color: #2563eb;
        }

        /* Result Pane */
        .calculator-result-pane {
          flex: 1;
          padding: 18px 22px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .result-kpis-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 10px;
        }

        .kpi-card {
          padding: 10px 12px;
          border-radius: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .kpi-card.highlight {
          background: #eff6ff;
          border-color: #93c5fd;
        }

        .kpi-label {
          font-size: 0.65rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }

        .kpi-value {
          font-size: 1.1rem;
          font-weight: 800;
          color: #0f172a;
        }

        .kpi-card.highlight .kpi-value {
          color: #2563eb;
        }

        .kpi-sub {
          font-size: 0.68rem;
          color: #64748b;
        }

        .alert-card {
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 0.8rem;
          line-height: 1.4;
        }

        .alert-card.warning {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
        }

        .no-result-text {
          color: #94a3b8;
          font-size: 0.84rem;
        }
      `}</style>
    </div>
  );
}
