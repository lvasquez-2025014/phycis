import React, { useState } from 'react';
import { 
  X, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Calculator, 
  Layers, 
  TrendingUp, 
  Compass,
  Sparkles,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { 
  MCU_THEORY_QUESTIONS, 
  MCU_EXERCISES, 
  solveCustomMcu,
  buildMcuExerciseBoardElements
} from '../../services/mcuExerciseSolver';

export default function McuExerciseSolverModal({
  isOpen,
  onClose,
  onMountExerciseOnBoard,
}) {
  const [activeTab, setActiveTab] = useState('exercises'); // 'exercises' | 'theory' | 'calculator'
  const [selectedExerciseId, setSelectedExerciseId] = useState(MCU_EXERCISES[0].id);

  // Theory Questions Interactive State
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  // Custom MCU Calculator State
  const [calcRadius, setCalcRadius] = useState(1.0);
  const [calcOmega, setCalcOmega] = useState(3.0);
  const [calcRpm, setCalcRpm] = useState('');
  const [calcPeriod, setCalcPeriod] = useState('');
  const [calcFrequency, setCalcFrequency] = useState('');
  const [calcTangentialVel, setCalcTangentialVel] = useState('');

  if (!isOpen) return null;

  const selectedExercise =
    MCU_EXERCISES.find((e) => e.id === selectedExerciseId) ||
    MCU_EXERCISES[0];

  const handleSelectOption = (questionId, optionIdx) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const calculatedResult = solveCustomMcu({
    radiusM: parseFloat(calcRadius) || 1.0,
    omegaRadS: parseFloat(calcOmega) || 3.0,
    rpm: calcRpm !== '' ? parseFloat(calcRpm) : null,
    periodS: calcPeriod !== '' ? parseFloat(calcPeriod) : null,
    frequencyHz: calcFrequency !== '' ? parseFloat(calcFrequency) : null,
    tangentialVelocity: calcTangentialVel !== '' ? parseFloat(calcTangentialVel) : null,
  });

  const handleMountCustomExercise = () => {
    if (!onMountExerciseOnBoard) return;
    const customExercise = {
      id: `custom_mcu_${Date.now()}`,
      title: `Rotor Personalizado (r = ${calcRadius} m, ω = ${calculatedResult.omegaRadS.toFixed(2)} rad/s)`,
      topic: 'Movimiento Circular Uniforme Personalizado',
      statement: `Cuerpo describiendo una trayectoria circular uniforme de radio r = ${calcRadius} m con velocidad angular constante de ω = ${calculatedResult.omegaRadS.toFixed(2)} rad/s (${calculatedResult.rpm.toFixed(1)} RPM).`,
      params: { rM: calcRadius, omega: calculatedResult.omegaRadS },
      steps: [
        {
          title: 'Velocidad Tangencial en el Borde',
          body: `v_t = ω · r = ${calculatedResult.omegaRadS.toFixed(2)} rad/s · ${calcRadius} m = ${calculatedResult.tangentialVelocity.toFixed(2)} m/s`,
        },
        {
          title: 'Aceleración Centrípeta',
          body: `a_c = ω² · r = (${calculatedResult.omegaRadS.toFixed(2)})² · ${calcRadius} m = ${calculatedResult.centripetalAccel.toFixed(2)} m/s²`,
        },
        {
          title: 'Período y Frecuencia de Rotación',
          body: `T = 2π / ω = ${calculatedResult.periodS.toFixed(2)} s/vuelta\nf = 1 / T = ${calculatedResult.frequencyHz.toFixed(2)} Hz (${calculatedResult.rpm.toFixed(1)} RPM)`,
        },
      ],
      finalAnswer: `Rapidez tangencial: ${calculatedResult.tangentialVelocity.toFixed(2)} m/s | Aceleración centrípeta: ${calculatedResult.centripetalAccel.toFixed(2)} m/s² | Período: ${calculatedResult.periodS.toFixed(2)} s`,
      assemblyConfig: {
        radiusMeters: parseFloat(calcRadius) || 1.0,
        omegaRadS: calculatedResult.omegaRadS,
        label: `Rotor r = ${calcRadius} m`,
      },
    };
    onMountExerciseOnBoard(customExercise);
    onClose();
  };

  return (
    <div className="mcu-modal-backdrop" onClick={onClose}>
      <div className="mcu-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mcu-modal-header">
          <div className="mcu-modal-header-meta">
            <div className="mcu-header-kicker">
              <span>Colegio Kinal • Física II</span>
              <span className="mcu-badge-ht">HT03 MCU</span>
            </div>
            <h2 className="mcu-modal-title">
              <RotateCw className="inline-icon" size={24} />
              Movimiento Circular Uniforme (MCU)
            </h2>
            <p className="mcu-modal-subtitle">
              Solucionador de problemas analíticos, 9 preguntas conceptuales de examen y laboratorio con vectores tangenciales y centrípetos.
            </p>
          </div>

          <button className="mcu-modal-close" onClick={onClose} title="Cerrar ventana">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="mcu-tabs-bar">
          <button
            className={`mcu-tab-btn ${activeTab === 'exercises' ? 'active' : ''}`}
            onClick={() => setActiveTab('exercises')}
          >
            <BookOpen size={16} />
            <span>Problemas de Aplicación HT03 ({MCU_EXERCISES.length})</span>
          </button>
          <button
            className={`mcu-tab-btn ${activeTab === 'theory' ? 'active' : ''}`}
            onClick={() => setActiveTab('theory')}
          >
            <HelpCircle size={16} />
            <span>Preguntas Conceptuales Forma 1 ({MCU_THEORY_QUESTIONS.length})</span>
          </button>
          <button
            className={`mcu-tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculator')}
          >
            <Calculator size={16} />
            <span>Calculadora Universal MCU</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="mcu-modal-body">
          {/* TAB 1: PROBLEMAS DE APLICACIÓN */}
          {activeTab === 'exercises' && (
            <div className="mcu-exercises-layout">
              {/* Sidebar with problem selector */}
              <div className="mcu-exercises-sidebar">
                <div className="sidebar-section-title">
                  Problemas Oficiales HT03 Kinal
                </div>
                <div className="sidebar-items-list">
                  {MCU_EXERCISES.map((ex) => (
                    <div
                      key={ex.id}
                      className={`exercise-sidebar-card ${
                        selectedExerciseId === ex.id ? 'active' : ''
                      }`}
                      onClick={() => setSelectedExerciseId(ex.id)}
                    >
                      <div className="ex-card-number">#{ex.number}</div>
                      <div className="ex-card-info">
                        <div className="ex-card-title">{ex.title}</div>
                        <div className="ex-card-topic">{ex.topic}</div>
                      </div>
                      <ChevronRight size={16} className="chevron" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Content: Selected Problem Procedure */}
              <div className="mcu-exercise-detail">
                <div className="detail-header">
                  <div className="detail-badges">
                    <span className="detail-badge-pill">{selectedExercise.source}</span>
                    <span className="detail-topic-pill">{selectedExercise.topic}</span>
                  </div>
                  <h3 className="detail-title">{selectedExercise.title}</h3>
                </div>

                <div className="detail-statement-card">
                  <div className="card-label">Enunciado del Problema:</div>
                  <p className="statement-text">{selectedExercise.statement}</p>
                </div>

                {/* Steps Accordion / Cards */}
                <div className="detail-steps-section">
                  <div className="section-label">
                    <TrendingUp size={16} />
                    Procedimiento Matemático Paso a Paso:
                  </div>

                  <div className="steps-cards-grid">
                    {selectedExercise.steps.map((st, i) => (
                      <div key={i} className="step-card">
                        <div className="step-card-header">
                          <span className="step-badge">{i + 1}</span>
                          <span className="step-title">{st.title}</span>
                        </div>
                        <pre className="step-body">{st.body}</pre>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final Answer Banner */}
                <div className="detail-answer-banner">
                  <div className="answer-header">
                    <CheckCircle2 size={20} className="icon-emerald" />
                    <span>Respuesta y Conclusiones Finales:</span>
                  </div>
                  <pre className="answer-text">{selectedExercise.finalAnswer}</pre>
                </div>

                {/* Mount on Whiteboard Button */}
                <div className="detail-action-footer">
                  <button
                    className="mount-btn"
                    onClick={() => {
                      if (onMountExerciseOnBoard) {
                        onMountExerciseOnBoard(selectedExercise);
                        onClose();
                      }
                    }}
                  >
                    <Layers size={18} />
                    <span>Montar Problema #{selectedExercise.number} en el Pizarrón</span>
                  </button>
                  <span className="action-hint">
                    Inserta las fichas de resolución y el rotor interactivo con vectores v⃗_t y a⃗_c en el lienzo.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PREGUNTAS CONCEPTUALES */}
          {activeTab === 'theory' && (
            <div className="mcu-theory-layout">
              <div className="theory-header-intro">
                <div className="theory-meta">
                  <h4>Forma 1 • Evaluación Conceptual (9 Preguntas)</h4>
                  <p>
                    Comprueba tu comprensión teórica sobre velocidad angular, frecuencia, período, vectores de rapidez tangencial y aceleración centrípeta.
                  </p>
                </div>
                <div className="theory-actions">
                  <button
                    className="theory-check-btn"
                    onClick={() => setShowResults(!showResults)}
                  >
                    {showResults ? 'Ocultar Corrección' : 'Verificar Mis Respuestas'}
                  </button>
                </div>
              </div>

              <div className="theory-questions-list">
                {MCU_THEORY_QUESTIONS.map((q) => {
                  const selectedIdx = userAnswers[q.id];
                  const isCorrect = selectedIdx === q.correctIndex;
                  return (
                    <div
                      key={q.id}
                      className={`theory-question-card ${
                        showResults
                          ? isCorrect
                            ? 'correct'
                            : selectedIdx !== undefined
                            ? 'incorrect'
                            : ''
                          : ''
                      }`}
                    >
                      <div className="q-card-header">
                        <span className="q-badge">Pregunta {q.number}</span>
                        {showResults && selectedIdx !== undefined && (
                          <span
                            className={`q-status-badge ${
                              isCorrect ? 'pass' : 'fail'
                            }`}
                          >
                            {isCorrect ? (
                              <>
                                <CheckCircle2 size={14} /> Correcta
                              </>
                            ) : (
                              <>
                                <XCircle size={14} /> Incorrecta
                              </>
                            )}
                          </span>
                        )}
                      </div>

                      <p className="q-text">{q.question}</p>

                      <div className="q-options-grid">
                        {q.options.map((opt, optIdx) => {
                          const isOptionSelected = selectedIdx === optIdx;
                          const isOptionActualCorrect =
                            showResults && optIdx === q.correctIndex;

                          let optionClass = 'q-option-item';
                          if (isOptionSelected) optionClass += ' selected';
                          if (isOptionActualCorrect) optionClass += ' actual-correct';
                          if (
                            showResults &&
                            isOptionSelected &&
                            !isCorrect
                          )
                            optionClass += ' wrong-picked';

                          return (
                            <button
                              key={optIdx}
                              className={optionClass}
                              onClick={() => handleSelectOption(q.id, optIdx)}
                            >
                              <span className="opt-letter">
                                {String.fromCharCode(97 + optIdx)})
                              </span>
                              <span className="opt-label">{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {showResults && (
                        <div className="q-explanation-box">
                          <strong>Justificación Física:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CALCULADORA UNIVERSAL MCU */}
          {activeTab === 'calculator' && (
            <div className="mcu-calculator-layout">
              <div className="calc-inputs-pane">
                <div className="pane-header">
                  <Compass size={20} className="icon-cyan" />
                  <h4>Parámetros del Movimiento Circular</h4>
                </div>

                <div className="calc-form">
                  <div className="calc-field">
                    <label>Radio de giro r (metros):</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.01"
                      value={calcRadius}
                      onChange={(e) => setCalcRadius(e.target.value)}
                    />
                    <span className="field-hint">Distancia desde el eje central al cuerpo</span>
                  </div>

                  <div className="calc-field">
                    <label>Velocidad angular ω (rad/s):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={calcOmega}
                      onChange={(e) => {
                        setCalcOmega(e.target.value);
                        setCalcRpm('');
                        setCalcPeriod('');
                        setCalcFrequency('');
                        setCalcTangentialVel('');
                      }}
                    />
                    <span className="field-hint">Radianes por segundo (2π rad = 1 vuelta)</span>
                  </div>

                  <div className="calc-field">
                    <label>Revoluciones por minuto (RPM) [Opcional]:</label>
                    <input
                      type="number"
                      step="1"
                      placeholder="ej. 1200"
                      value={calcRpm}
                      onChange={(e) => {
                        setCalcRpm(e.target.value);
                        if (e.target.value) {
                          setCalcOmega(((parseFloat(e.target.value) * 2 * Math.PI) / 60).toFixed(2));
                        }
                      }}
                    />
                    <span className="field-hint">Frecuencia en RPM (calcula ω automáticamente)</span>
                  </div>

                  <div className="calc-field">
                    <label>Período de rotación T (segundos) [Opcional]:</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="ej. 12"
                      value={calcPeriod}
                      onChange={(e) => {
                        setCalcPeriod(e.target.value);
                        if (e.target.value && parseFloat(e.target.value) > 0) {
                          setCalcOmega(((2 * Math.PI) / parseFloat(e.target.value)).toFixed(3));
                        }
                      }}
                    />
                    <span className="field-hint">Tiempo en completar una vuelta (T = 2π / ω)</span>
                  </div>
                </div>

                <button
                  className="calc-mount-btn"
                  onClick={handleMountCustomExercise}
                >
                  <Sparkles size={18} />
                  <span>Montar Simulación Personalizada en el Lienzo</span>
                </button>
              </div>

              {/* Outputs Preview */}
              <div className="calc-outputs-pane">
                <div className="pane-header">
                  <TrendingUp size={20} className="icon-emerald" />
                  <h4>Magnitudes Físicas Derivadas</h4>
                </div>

                <div className="outputs-cards-grid">
                  <div className="output-card highlight">
                    <div className="out-label">Rapidez Tangencial (v_t)</div>
                    <div className="out-value">{calculatedResult.tangentialVelocity.toFixed(2)} m/s</div>
                    <div className="out-sub">v = ω · r</div>
                  </div>

                  <div className="output-card rose">
                    <div className="out-label">Aceleración Centrípeta (a_c)</div>
                    <div className="out-value">{calculatedResult.centripetalAccel.toFixed(2)} m/s²</div>
                    <div className="out-sub">ac = ω² · r = v² / r</div>
                  </div>

                  <div className="output-card">
                    <div className="out-label">Período de Giro (T)</div>
                    <div className="out-value">{calculatedResult.periodS.toFixed(3)} s</div>
                    <div className="out-sub">T = 2π / ω</div>
                  </div>

                  <div className="output-card">
                    <div className="out-label">Frecuencia de Giro (f)</div>
                    <div className="out-value">{calculatedResult.frequencyHz.toFixed(2)} Hz</div>
                    <div className="out-sub">f = 1 / T = {calculatedResult.rpm.toFixed(1)} RPM</div>
                  </div>

                  <div className="output-card full-span">
                    <div className="out-label">Longitud de la Circunferencia (C)</div>
                    <div className="out-value">{calculatedResult.circumferenceM.toFixed(2)} m por vuelta</div>
                    <div className="out-sub">Distancia recorrida en 1 revolución completa (C = 2π·r)</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .mcu-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .mcu-modal-container {
          background: #ffffff;
          width: 100%;
          max-width: 1120px;
          height: 90vh;
          max-height: 860px;
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }

        .mcu-modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          background: #f8fafc;
        }

        .mcu-header-kicker {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          margin-bottom: 4px;
        }

        .mcu-badge-ht {
          background: #e0f2fe;
          color: #0284c7;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
        }

        .mcu-modal-title {
          font-size: 1.45rem;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 4px 0;
        }

        .mcu-modal-title .inline-icon {
          color: #0284c7;
        }

        .mcu-modal-subtitle {
          margin: 0;
          font-size: 0.85rem;
          color: #64748b;
        }

        .mcu-modal-close {
          background: #f1f5f9;
          border: none;
          color: #64748b;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .mcu-modal-close:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .mcu-tabs-bar {
          display: flex;
          gap: 8px;
          padding: 10px 24px;
          border-bottom: 1px solid #e2e8f0;
          background: #ffffff;
        }

        .mcu-tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid transparent;
          background: transparent;
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .mcu-tab-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .mcu-tab-btn.active {
          background: #e0f2fe;
          color: #0284c7;
          border-color: #bae6fd;
        }

        .mcu-modal-body {
          flex: 1;
          overflow-y: auto;
          background: #f8fafc;
          padding: 20px 24px;
        }

        /* TAB 1: EXERCISES */
        .mcu-exercises-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 20px;
          height: 100%;
        }

        .mcu-exercises-sidebar {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .sidebar-section-title {
          padding: 12px 16px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .sidebar-items-list {
          overflow-y: auto;
          flex: 1;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .exercise-sidebar-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
          border: 1px solid transparent;
        }

        .exercise-sidebar-card:hover {
          background: #f1f5f9;
        }

        .exercise-sidebar-card.active {
          background: #e0f2fe;
          border-color: #7dd3fc;
        }

        .ex-card-number {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: #e2e8f0;
          color: #334155;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.8rem;
          flex-shrink: 0;
        }

        .exercise-sidebar-card.active .ex-card-number {
          background: #0284c7;
          color: #ffffff;
        }

        .ex-card-info {
          flex: 1;
          min-width: 0;
        }

        .ex-card-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ex-card-topic {
          font-size: 0.7rem;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .exercise-sidebar-card .chevron {
          color: #94a3b8;
        }

        .mcu-exercise-detail {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .detail-badges {
          display: flex;
          gap: 8px;
          margin-bottom: 6px;
        }

        .detail-badge-pill {
          background: #e0f2fe;
          color: #0284c7;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.72rem;
          font-weight: 700;
        }

        .detail-topic-pill {
          background: #f1f5f9;
          color: #475569;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.72rem;
          font-weight: 600;
        }

        .detail-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .detail-statement-card {
          background: #fffbeb;
          border: 1px solid #fef3c7;
          border-radius: 10px;
          padding: 14px 16px;
        }

        .card-label {
          font-size: 0.72rem;
          font-weight: 800;
          color: #92400e;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .statement-text {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.5;
          color: #1e293b;
          white-space: pre-line;
        }

        .section-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: #334155;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 10px;
        }

        .steps-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 12px;
        }

        .step-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
        }

        .step-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .step-badge {
          width: 20px;
          height: 20px;
          background: #0284c7;
          color: #ffffff;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.72rem;
          font-weight: 800;
        }

        .step-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: #0f172a;
        }

        .step-body {
          margin: 0;
          font-family: inherit;
          font-size: 0.82rem;
          color: #334155;
          white-space: pre-wrap;
          line-height: 1.45;
        }

        .detail-answer-banner {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          border-radius: 10px;
          padding: 14px 16px;
        }

        .answer-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 800;
          color: #065f46;
          margin-bottom: 6px;
        }

        .answer-text {
          margin: 0;
          font-family: inherit;
          font-size: 0.88rem;
          font-weight: 600;
          color: #064e3b;
          white-space: pre-wrap;
        }

        .detail-action-footer {
          margin-top: 10px;
          padding-top: 14px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .mount-btn {
          background: #0284c7;
          color: #ffffff;
          border: none;
          padding: 12px 20px;
          border-radius: 10px;
          font-size: 0.92rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.25);
        }

        .mount-btn:hover {
          background: #0369a1;
          transform: translateY(-1px);
        }

        .action-hint {
          font-size: 0.75rem;
          color: #64748b;
          text-align: center;
        }

        /* TAB 2: THEORY */
        .mcu-theory-layout {
          max-width: 860px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .theory-header-intro {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .theory-meta h4 {
          margin: 0 0 4px 0;
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
        }

        .theory-meta p {
          margin: 0;
          font-size: 0.82rem;
          color: #64748b;
        }

        .theory-check-btn {
          background: #0284c7;
          color: #ffffff;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
        }

        .theory-questions-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .theory-question-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px 20px;
          transition: all 0.15s ease;
        }

        .theory-question-card.correct {
          border-color: #86efac;
          background: #f0fdf4;
        }

        .theory-question-card.incorrect {
          border-color: #fca5a5;
          background: #fef2f2;
        }

        .q-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .q-badge {
          font-size: 0.75rem;
          font-weight: 800;
          color: #0284c7;
          text-transform: uppercase;
        }

        .q-status-badge {
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .q-status-badge.pass {
          color: #16a34a;
        }

        .q-status-badge.fail {
          color: #dc2626;
        }

        .q-text {
          font-size: 0.95rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 12px 0;
        }

        .q-options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .q-option-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .q-option-item:hover {
          background: #f1f5f9;
        }

        .q-option-item.selected {
          border-color: #0284c7;
          background: #e0f2fe;
          font-weight: 600;
        }

        .q-option-item.actual-correct {
          border-color: #22c55e !important;
          background: #dcfce7 !important;
          color: #15803d;
          font-weight: 700;
        }

        .q-option-item.wrong-picked {
          border-color: #ef4444 !important;
          background: #fee2e2 !important;
          color: #b91c1c;
        }

        .opt-letter {
          font-weight: 800;
          color: #64748b;
        }

        .opt-label {
          font-size: 0.85rem;
        }

        .q-explanation-box {
          margin-top: 12px;
          padding: 10px 14px;
          border-radius: 8px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          font-size: 0.82rem;
          color: #1e40af;
          line-height: 1.45;
        }

        /* TAB 3: CALCULATOR */
        .mcu-calculator-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .calc-inputs-pane, .calc-outputs-pane {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .pane-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e2e8f0;
        }

        .pane-header h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
        }

        .calc-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .calc-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .calc-field label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #334155;
        }

        .calc-field input {
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 0.9rem;
          font-weight: 600;
          color: #0f172a;
        }

        .calc-field input:focus {
          outline: none;
          border-color: #0284c7;
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
        }

        .field-hint {
          font-size: 0.72rem;
          color: #64748b;
        }

        .calc-mount-btn {
          margin-top: 10px;
          background: #0284c7;
          color: #ffffff;
          border: none;
          padding: 12px;
          border-radius: 10px;
          font-size: 0.88rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .calc-mount-btn:hover {
          background: #0369a1;
        }

        .outputs-cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .output-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .output-card.highlight {
          background: #ecfdf5;
          border-color: #a7f3d0;
        }

        .output-card.rose {
          background: #fff1f2;
          border-color: #fecdd3;
        }

        .output-card.full-span {
          grid-column: span 2;
        }

        .out-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }

        .out-value {
          font-size: 1.35rem;
          font-weight: 800;
          color: #0f172a;
        }

        .out-sub {
          font-size: 0.72rem;
          color: #64748b;
          font-family: monospace;
        }
      `}</style>
    </div>
  );
}
