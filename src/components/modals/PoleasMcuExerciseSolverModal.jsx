import React, { useState } from 'react';
import { 
  X, 
  Disc, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Calculator, 
  Layers, 
  Sparkles,
  ChevronRight,
  BookOpen,
  RotateCw
} from 'lucide-react';
import { 
  POLEAS_MCU_THEORY_QUESTIONS, 
  POLEAS_MCU_EXERCISES, 
  solveCustomPoleasMcu 
} from '../../services/poleasMcuExerciseSolver';

export default function PoleasMcuExerciseSolverModal({
  isOpen,
  onClose,
  onMountExerciseOnBoard,
}) {
  const [activeTab, setActiveTab] = useState('exercises'); // 'exercises' | 'theory' | 'calculator'
  const [selectedExerciseId, setSelectedExerciseId] = useState(POLEAS_MCU_EXERCISES[0].id);

  // Theory Questions Interactive State
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  // Custom Poleas Calculator State
  const [calcConfig, setCalcConfig] = useState('belt'); // 'belt' | 'concentric' | 'compound_train_2stage' | 'concentric_hanging_block'
  const [calcR1, setCalcR1] = useState(0.20);
  const [calcR2, setCalcR2] = useState(0.10);
  const [calcR3, setCalcR3] = useState(0.25);
  const [calcR4, setCalcR4] = useState(0.50);
  const [calcOmega1, setCalcOmega1] = useState(5.0);
  const [calcRpmInput, setCalcRpmInput] = useState('');

  if (!isOpen) return null;

  const selectedExercise =
    POLEAS_MCU_EXERCISES.find((e) => e.id === selectedExerciseId) ||
    POLEAS_MCU_EXERCISES[0];

  const handleSelectOption = (questionId, optionIdx) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const calculatedResult = solveCustomPoleasMcu({
    configuration: calcConfig,
    r1M: parseFloat(calcR1) || 0.20,
    r2M: parseFloat(calcR2) || 0.10,
    r3M: parseFloat(calcR3) || 0.25,
    r4M: parseFloat(calcR4) || 0.50,
    omega1RadS: parseFloat(calcOmega1) || 5.0,
  });

  const handleRpmChange = (e) => {
    const val = e.target.value;
    setCalcRpmInput(val);
    const rpmNum = parseFloat(val);
    if (!isNaN(rpmNum)) {
      setCalcOmega1((rpmNum * 2 * Math.PI) / 60);
    }
  };

  const handleOmegaChange = (e) => {
    const val = e.target.value;
    setCalcOmega1(val);
    const omegaNum = parseFloat(val);
    if (!isNaN(omegaNum)) {
      setCalcRpmInput(((omegaNum * 60) / (2 * Math.PI)).toFixed(1));
    }
  };

  const handleMountCustomExercise = () => {
    if (!onMountExerciseOnBoard) return;
    const customExercise = {
      id: `custom_poleas_${Date.now()}`,
      title: `Sistema de Poleas Personalizado (${calcConfig === 'concentric' ? 'Mismo Eje' : 'Faja'})`,
      subtitle: `r₁ = ${calcR1}m, r₂ = ${calcR2}m, ω₁ = ${parseFloat(calcOmega1).toFixed(1)} rad/s`,
      scenario: `Sistema de transmisión por poleas con radio de entrada r₁ = ${calcR1} m y radio de salida r₂ = ${calcR2} m accionado a ω₁ = ${parseFloat(calcOmega1).toFixed(1)} rad/s.`,
      configuration: calcConfig,
      givenData: {
        r1: `${calcR1} m`,
        r2: `${calcR2} m`,
        omega1: `${parseFloat(calcOmega1).toFixed(2)} rad/s (${calculatedResult.rpm1.toFixed(1)} RPM)`,
      },
      unknowns: ['Velocidad angular polea 2 (ω₂)', 'Rapidez tangencial (v)', 'Relación de transmisión (i)'],
      formulasApplied: [
        calcConfig === 'concentric' ? 'ω₁ = ω₂ (Mismo eje)' : 'v₁ = v₂ ⟹ ω₁·r₁ = ω₂·r₂ (Unidas por faja)',
        'v = ω · r',
        'N = (ω · 60) / (2π) [RPM]',
      ],
      stepByStepProcedure: [
        {
          step: 1,
          concept: 'Cinemática de la Transmisión',
          formula: calcConfig === 'concentric' ? 'ω₂ = ω₁' : 'ω₂ = ω₁ · (r₁ / r₂)',
          substitution: `ω₂ = ${calculatedResult.omega2.toFixed(2)} rad/s`,
          result: `ω₂ = ${calculatedResult.omega2.toFixed(2)} rad/s (${calculatedResult.rpm2.toFixed(1)} RPM)`,
        },
        {
          step: 2,
          concept: 'Rapidez Tangencial Periférica',
          formula: 'v = ω₁ · r₁',
          substitution: `v = (${parseFloat(calcOmega1).toFixed(2)}) · (${calcR1})`,
          result: `v = ${calculatedResult.linearSpeed.toFixed(2)} m/s`,
        },
      ],
      finalAnswer: `Rapidez tangencial: ${calculatedResult.linearSpeed.toFixed(2)} m/s | Velocidad angular de salida: ${calculatedResult.omega2.toFixed(2)} rad/s (${calculatedResult.rpm2.toFixed(1)} RPM) | Relación i: ${calculatedResult.gearRatio.toFixed(3)}`,
      number: 99,
    };
    onMountExerciseOnBoard(customExercise);
    onClose();
  };

  // Score calculation for theory questions
  const correctCount = POLEAS_MCU_THEORY_QUESTIONS.reduce((acc, q) => {
    return userAnswers[q.id] === q.correctIndex ? acc + 1 : acc;
  }, 0);
  const scorePercent = Math.round((correctCount / POLEAS_MCU_THEORY_QUESTIONS.length) * 100);

  return (
    <div className="poleas-modal-backdrop" onClick={onClose}>
      <div className="poleas-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="poleas-modal-header">
          <div className="header-left">
            <div className="header-icon-badge">
              <Disc size={22} />
            </div>
            <div>
              <div className="header-title-row">
                <h2>Solucionador Oficial: Poleas MCU</h2>
                <span className="curriculum-badge">Kinal HT01 - Unidad 3</span>
              </div>
              <p className="header-subtitle">
                Física II Quinto Diversificado • Transmisiones por Correa, Mismo Eje y Trenes Compuestos
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} title="Cerrar modal (Esc)">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="poleas-tabs-bar">
          <button
            className={`poleas-tab-btn ${activeTab === 'exercises' ? 'active' : ''}`}
            onClick={() => setActiveTab('exercises')}
          >
            <BookOpen size={16} />
            <span>9 Problemas Resueltos (Forma 2)</span>
          </button>
          <button
            className={`poleas-tab-btn ${activeTab === 'theory' ? 'active' : ''}`}
            onClick={() => setActiveTab('theory')}
          >
            <HelpCircle size={16} />
            <span>5 Preguntas de Teoría (Forma 1)</span>
          </button>
          <button
            className={`poleas-tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculator')}
          >
            <Calculator size={16} />
            <span>Calculadora de Transmisión</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="poleas-modal-body">
          {/* TAB 1: 9 EXERCISES */}
          {activeTab === 'exercises' && (
            <div className="exercises-layout">
              {/* Exercise Selector List */}
              <div className="exercises-sidebar">
                <div className="sidebar-title">Problemas de la Hoja HT01</div>
                <div className="exercises-list">
                  {POLEAS_MCU_EXERCISES.map((ex) => (
                    <button
                      key={ex.id}
                      className={`exercise-nav-item ${selectedExerciseId === ex.id ? 'active' : ''}`}
                      onClick={() => setSelectedExerciseId(ex.id)}
                    >
                      <div className="ex-num-badge">{ex.number}</div>
                      <div className="ex-info">
                        <span className="ex-title">{ex.title}</span>
                        <span className="ex-type-badge">
                          {ex.configuration === 'concentric'
                            ? 'Mismo Eje (ω=cte)'
                            : ex.configuration === 'concentric_hanging_block'
                            ? 'Tambor + Bloque'
                            : ex.configuration.includes('train') || ex.configuration === 'double_reduction'
                            ? 'Tren Compuesto'
                            : 'Faja (v=cte)'}
                        </span>
                      </div>
                      <ChevronRight size={14} className="chevron-icon" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Exercise Detailed View */}
              <div className="exercise-detail-panel">
                <div className="exercise-detail-header">
                  <div>
                    <div className="exercise-badge-row">
                      <span className="problem-pill">Problema #{selectedExercise.number}</span>
                      <span className="config-pill">
                        {selectedExercise.configuration === 'concentric'
                          ? '🔗 Discos Concéntricos (Mismo Eje: ω₁ = ω₂)'
                          : selectedExercise.configuration === 'concentric_hanging_block'
                          ? '📦 Tambor Concéntrico con Bloque Colgante'
                          : selectedExercise.configuration.includes('train') || selectedExercise.configuration === 'double_reduction'
                          ? '⚙️ Tren Reductor Compuesto'
                          : '🔄 Poleas Unidas por Faja / Correa (v₁ = v₂)'}
                      </span>
                    </div>
                    <h3 className="exercise-heading">{selectedExercise.title}</h3>
                    <p className="exercise-subheading">{selectedExercise.subtitle}</p>
                  </div>

                  <button
                    className="mount-btn"
                    onClick={() => {
                      if (onMountExerciseOnBoard) {
                        onMountExerciseOnBoard(selectedExercise);
                      }
                      onClose();
                    }}
                    title="Insertar este problema con banco de poleas animado en el lienzo"
                  >
                    <Layers size={16} />
                    <span>Montar en Pizarra</span>
                  </button>
                </div>

                {/* Problem Statement Card */}
                <div className="statement-card">
                  <div className="statement-label">Enunciado Oficial:</div>
                  <p className="statement-text">{selectedExercise.scenario}</p>
                </div>

                {/* Data & Unknowns */}
                <div className="data-grid">
                  <div className="data-box">
                    <div className="data-box-title">Datos Conocidos:</div>
                    <ul className="data-list">
                      {selectedExercise.givenData &&
                        Object.entries(selectedExercise.givenData).map(([k, v]) => (
                          <li key={k}>
                            <strong>{k}:</strong> {v}
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div className="data-box">
                    <div className="data-box-title">Incógnitas a Calcular:</div>
                    <ul className="data-list unknowns">
                      {selectedExercise.unknowns && Array.isArray(selectedExercise.unknowns) ? (
                        selectedExercise.unknowns.map((u, i) => (
                          <li key={i}>{u}</li>
                        ))
                      ) : (
                        <li>{selectedExercise.target || 'Incógnita del problema'}</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Formulas Applied */}
                <div className="formulas-card">
                  <div className="formulas-title">Fórmulas Físicas Curriculares:</div>
                  <div className="formulas-pills">
                    {(selectedExercise.formulasApplied || selectedExercise.formulas || []).map((f, i) => (
                      <span key={i} className="formula-pill">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Step by Step Procedure */}
                <div className="procedure-section">
                  <div className="procedure-heading">Procedimiento Paso a Paso:</div>
                  <div className="steps-container">
                    {(selectedExercise.stepByStepProcedure || selectedExercise.procedure || []).map((s, idx) => {
                      if (typeof s === 'string') {
                        return (
                          <div key={idx} className="step-card" style={{ padding: '10px 14px' }}>
                            <div className="step-header">
                              <span className="step-number">Paso {idx + 1}</span>
                            </div>
                            <div className="step-body" style={{ fontSize: '0.78rem', color: '#1e293b', whiteSpace: 'pre-line', lineHeight: '1.45', marginTop: 4 }}>
                              {s}
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div key={s.step || idx} className="step-card">
                          <div className="step-header">
                            <span className="step-number">Paso {s.step || idx + 1}</span>
                            {s.concept && <span className="step-concept">{s.concept}</span>}
                          </div>
                          {s.formula && (
                            <div className="step-formula">
                              <code>{s.formula}</code>
                            </div>
                          )}
                          {s.substitution && (
                            <div className="step-substitution">
                              <span>Sustitución numérica:</span>
                              <code>{s.substitution}</code>
                            </div>
                          )}
                          {s.result && (
                            <div className="step-result">
                              <span>Resultado:</span>
                              <strong>{s.result}</strong>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Final Answer Banner */}
                <div className="final-answer-banner">
                  <div className="answer-icon">🎯</div>
                  <div style={{ flex: 1 }}>
                    <div className="answer-label">Respuesta Final:</div>
                    {selectedExercise.finalAnswer ? (
                      <div className="answer-text">{selectedExercise.finalAnswer}</div>
                    ) : Array.isArray(selectedExercise.answers) ? (
                      <div className="answer-answers-list" style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                        {selectedExercise.answers.map((a, i) => (
                          <div key={i} style={{ fontSize: '0.82rem', fontWeight: a.highlight ? 700 : 500, color: a.highlight ? '#065f46' : '#1e293b' }}>
                            <span>{a.label}: </span>
                            <strong style={{ color: a.highlight ? '#059669' : '#0284c7' }}>{a.value}</strong>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: THEORY QUESTIONS (FORMA 1) */}
          {activeTab === 'theory' && (
            <div className="theory-layout">
              <div className="theory-header-card">
                <div>
                  <h3>Preguntas Teóricas Conceptuales (Forma 1)</h3>
                  <p>
                    Evaluación conceptual oficial de 5 preguntas sobre la cinemática de poleas en el mismo eje y unidas por faja.
                  </p>
                </div>
                {showResults && (
                  <div className={`score-badge ${scorePercent >= 80 ? 'good' : 'warning'}`}>
                    Puntuación: {scorePercent}% ({correctCount}/5 aciertos)
                  </div>
                )}
              </div>

              <div className="theory-questions-list">
                {POLEAS_MCU_THEORY_QUESTIONS.map((q) => {
                  const isSelected = userAnswers[q.id] !== undefined;
                  const isCorrect = userAnswers[q.id] === q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      className={`theory-question-card ${
                        showResults ? (isCorrect ? 'is-correct' : 'is-wrong') : ''
                      }`}
                    >
                      <div className="question-header">
                        <span className="question-num">Pregunta #{q.number}</span>
                        {showResults && (
                          <span className={`result-tag ${isCorrect ? 'correct' : 'wrong'}`}>
                            {isCorrect ? (
                              <>
                                <CheckCircle2 size={14} /> Correcto
                              </>
                            ) : (
                              <>
                                <XCircle size={14} /> Incorrecto
                              </>
                            )}
                          </span>
                        )}
                      </div>

                      <div className="question-body">{q.question}</div>

                      <div className="options-grid">
                        {q.options.map((opt, idx) => {
                          const isOptionSelected = userAnswers[q.id] === idx;
                          const isOptionCorrect = idx === q.correctIndex;

                          let optionClass = '';
                          if (showResults) {
                            if (isOptionCorrect) optionClass = 'correct-opt';
                            else if (isOptionSelected) optionClass = 'wrong-opt';
                          } else if (isOptionSelected) {
                            optionClass = 'selected-opt';
                          }

                          return (
                            <button
                              key={idx}
                              className={`option-btn ${optionClass}`}
                              onClick={() => !showResults && handleSelectOption(q.id, idx)}
                            >
                              <span className="opt-letter">
                                {String.fromCharCode(65 + idx)}.
                              </span>
                              <span className="opt-text">{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {showResults && (
                        <div className="explanation-box">
                          <strong>Explicación Física Curricular:</strong>
                          <p>{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="theory-footer-bar">
                {!showResults ? (
                  <button
                    className="submit-theory-btn"
                    onClick={() => setShowResults(true)}
                    disabled={Object.keys(userAnswers).length === 0}
                  >
                    <CheckCircle2 size={16} />
                    <span>Calificar Evaluación Teórica</span>
                  </button>
                ) : (
                  <button
                    className="retry-theory-btn"
                    onClick={() => {
                      setShowResults(false);
                      setUserAnswers({});
                    }}
                  >
                    <RotateCw size={16} />
                    <span>Reiniciar Cuestionario</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="calculator-layout">
              <div className="calc-inputs-card">
                <h3>Calculadora de Transmisión por Poleas</h3>
                <p className="calc-intro">
                  Configura cualquier transmisión de laboratorio o tren de poleas y calcula instantáneamente las relaciones de transmisión, rapideces lineales y aceleraciones.
                </p>

                <div className="calc-form-grid">
                  <div className="form-group">
                    <label>Tipo de Acoplamiento:</label>
                    <select
                      value={calcConfig}
                      onChange={(e) => setCalcConfig(e.target.value)}
                      className="calc-select"
                    >
                      <option value="belt">Unidas por Faja / Correa (v₁ = v₂)</option>
                      <option value="concentric">Mismo Eje Concéntrico (ω₁ = ω₂)</option>
                      <option value="concentric_hanging_block">Tambor Concéntrico con Bloque Colgante</option>
                      <option value="compound_train_2stage">Tren Compuesto Reductor (2 Etapas)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Radio Polea 1 r₁ (Entrada / Motriz):</label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={calcR1}
                        onChange={(e) => setCalcR1(e.target.value)}
                      />
                      <span className="unit-label">m</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Radio Polea 2 r₂ (Salida / Conducida):</label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={calcR2}
                        onChange={(e) => setCalcR2(e.target.value)}
                      />
                      <span className="unit-label">m</span>
                    </div>
                  </div>

                  {calcConfig === 'compound_train_2stage' && (
                    <>
                      <div className="form-group">
                        <label>Radio Polea 3 r₃ (Eje Intermedio):</label>
                        <div className="input-with-unit">
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={calcR3}
                            onChange={(e) => setCalcR3(e.target.value)}
                          />
                          <span className="unit-label">m</span>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Radio Polea 4 r₄ (Salida Final):</label>
                        <div className="input-with-unit">
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={calcR4}
                            onChange={(e) => setCalcR4(e.target.value)}
                          />
                          <span className="unit-label">m</span>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="form-group">
                    <label>Velocidad Angular Entrada ω₁:</label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        step="0.1"
                        value={calcOmega1}
                        onChange={handleOmegaChange}
                      />
                      <span className="unit-label">rad/s</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Frecuencia de Giro Entrada N₁ (RPM):</label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        step="1"
                        value={calcRpmInput}
                        onChange={handleRpmChange}
                        placeholder={((parseFloat(calcOmega1) * 60) / (2 * Math.PI)).toFixed(1)}
                      />
                      <span className="unit-label">RPM</span>
                    </div>
                  </div>
                </div>

                <div className="calc-action-row">
                  <button className="mount-custom-btn" onClick={handleMountCustomExercise}>
                    <Sparkles size={16} />
                    <span>Montar Configuración en Pizarra</span>
                  </button>
                </div>
              </div>

              {/* Calculator Output Readouts */}
              <div className="calc-results-card">
                <h4>Resultados Cinemáticos</h4>
                <div className="results-grid">
                  <div className="result-metric-card">
                    <span className="metric-title">Rapidez Tangencial Periférica</span>
                    <span className="metric-value emerald">
                      v = {calculatedResult.linearSpeed.toFixed(2)} m/s
                    </span>
                    <span className="metric-sub">
                      {calcConfig === 'concentric' ? 'En el borde exterior de mayor radio' : 'Común a toda la correa (v₁ = v₂)'}
                    </span>
                  </div>

                  <div className="result-metric-card">
                    <span className="metric-title">Velocidad Angular de Salida</span>
                    <span className="metric-value highlight">
                      ω₂ = {calculatedResult.omega2.toFixed(2)} rad/s
                    </span>
                    <span className="metric-sub">
                      N₂ = {calculatedResult.rpm2.toFixed(1)} RPM • f = {calculatedResult.freq2.toFixed(2)} Hz
                    </span>
                  </div>

                  <div className="result-metric-card">
                    <span className="metric-title">Relación de Transmisión (i)</span>
                    <span className="metric-value purple">
                      i = {calculatedResult.gearRatio.toFixed(3)}
                    </span>
                    <span className="metric-sub">
                      {calculatedResult.gearRatio < 1
                        ? 'Sistema Reductor de Velocidad (Multiplicador de Torque)'
                        : calculatedResult.gearRatio > 1
                        ? 'Sistema Multiplicador de Velocidad'
                        : 'Transmisión 1:1 Directa'}
                    </span>
                  </div>

                  <div className="result-metric-card">
                    <span className="metric-title">Aceleración Centrípeta Polea 2</span>
                    <span className="metric-value rose">
                      ac₂ = {calculatedResult.centripetalAccel2.toFixed(2)} m/s²
                    </span>
                    <span className="metric-sub">
                      ac = ω² · r = v² / r dirigida radialmente al centro
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .poleas-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .poleas-modal-container {
          background: #ffffff;
          width: 95vw;
          max-width: 1180px;
          height: 88vh;
          max-height: 840px;
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          font-family: var(--font-sans, Inter, sans-serif);
        }

        .poleas-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .header-icon-badge {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
        }

        .header-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .header-title-row h2 {
          margin: 0;
          font-size: 1.22rem;
          font-weight: 800;
          color: #0f172a;
        }

        .curriculum-badge {
          background: #ecfdf5;
          color: #059669;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          border: 1px solid #a7f3d0;
        }

        .header-subtitle {
          margin: 3px 0 0;
          font-size: 0.82rem;
          color: #64748b;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }

        .close-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .poleas-tabs-bar {
          display: flex;
          gap: 8px;
          padding: 10px 24px;
          background: #f1f5f9;
          border-bottom: 1px solid #e2e8f0;
        }

        .poleas-tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid transparent;
          background: transparent;
          color: #475569;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.14s;
        }

        .poleas-tab-btn:hover {
          background: rgba(255, 255, 255, 0.6);
          color: #0f172a;
        }

        .poleas-tab-btn.active {
          background: #ffffff;
          color: #059669;
          border-color: #cbd5e1;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
        }

        .poleas-modal-body {
          flex: 1;
          overflow: hidden;
          background: #ffffff;
        }

        /* TAB 1: EXERCISES LAYOUT */
        .exercises-layout {
          display: flex;
          height: 100%;
        }

        .exercises-sidebar {
          width: 320px;
          border-right: 1px solid #e2e8f0;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
        }

        .sidebar-title {
          padding: 14px 18px;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
        }

        .exercises-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .exercise-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid transparent;
          background: #ffffff;
          text-align: left;
          cursor: pointer;
          transition: all 0.14s;
        }

        .exercise-nav-item:hover {
          border-color: #cbd5e1;
          background: #f1f5f9;
        }

        .exercise-nav-item.active {
          background: #ecfdf5;
          border-color: #6ee7b7;
        }

        .ex-num-badge {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          background: #e2e8f0;
          color: #334155;
          font-weight: 800;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .exercise-nav-item.active .ex-num-badge {
          background: #059669;
          color: #ffffff;
        }

        .ex-info {
          flex: 1;
          min-width: 0;
        }

        .ex-title {
          display: block;
          font-size: 0.82rem;
          font-weight: 700;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ex-type-badge {
          display: inline-block;
          margin-top: 2px;
          font-size: 0.68rem;
          color: #059669;
          font-weight: 600;
        }

        .chevron-icon {
          color: #94a3b8;
          flex-shrink: 0;
        }

        .exercise-detail-panel {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .exercise-detail-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 16px;
        }

        .exercise-badge-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .problem-pill {
          background: #059669;
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 5px;
        }

        .config-pill {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 5px;
        }

        .exercise-heading {
          margin: 0;
          font-size: 1.18rem;
          font-weight: 800;
          color: #0f172a;
        }

        .exercise-subheading {
          margin: 4px 0 0;
          font-size: 0.85rem;
          color: #64748b;
        }

        .mount-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          border-radius: 8px;
          border: none;
          background: #059669;
          color: #ffffff;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
          box-shadow: 0 4px 10px rgba(5, 150, 105, 0.25);
          flex-shrink: 0;
        }

        .mount-btn:hover {
          background: #047857;
        }

        .statement-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-left: 4px solid #059669;
          border-radius: 8px;
          padding: 14px 16px;
        }

        .statement-label {
          font-size: 0.74rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #059669;
          margin-bottom: 6px;
        }

        .statement-text {
          margin: 0;
          font-size: 0.92rem;
          line-height: 1.55;
          color: #1e293b;
        }

        .data-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .data-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 16px;
        }

        .data-box-title {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #475569;
          margin-bottom: 8px;
        }

        .data-list {
          margin: 0;
          padding-left: 18px;
          font-size: 0.84rem;
          color: #334155;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .data-list.unknowns li {
          color: #b45309;
          font-weight: 600;
        }

        .formulas-card {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          border-radius: 8px;
          padding: 12px 16px;
        }

        .formulas-title {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #047857;
          margin-bottom: 8px;
        }

        .formulas-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .formula-pill {
          background: #ffffff;
          border: 1px solid #6ee7b7;
          color: #065f46;
          font-family: monospace;
          font-size: 0.82rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
        }

        .procedure-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .procedure-heading {
          font-size: 0.88rem;
          font-weight: 700;
          color: #0f172a;
        }

        .steps-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .step-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .step-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .step-number {
          background: #059669;
          color: #ffffff;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 4px;
        }

        .step-concept {
          font-size: 0.84rem;
          font-weight: 700;
          color: #0f172a;
        }

        .step-formula code {
          background: #e2e8f0;
          color: #1e293b;
          font-size: 0.84rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .step-substitution {
          font-size: 0.82rem;
          color: #475569;
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .step-substitution code {
          color: #0284c7;
          font-weight: 600;
        }

        .step-result {
          font-size: 0.86rem;
          color: #065f46;
          display: flex;
          gap: 8px;
          align-items: center;
          margin-top: 2px;
        }

        .final-answer-banner {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border: 1px solid #6ee7b7;
          border-radius: 10px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .answer-icon {
          font-size: 1.6rem;
        }

        .answer-label {
          font-size: 0.74rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #047857;
        }

        .answer-text {
          font-size: 0.94rem;
          font-weight: 800;
          color: #064e3b;
          margin-top: 2px;
        }

        /* TAB 2: THEORY LAYOUT */
        .theory-layout {
          height: 100%;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .theory-header-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 14px 20px;
        }

        .theory-header-card h3 {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
        }

        .theory-header-card p {
          margin: 4px 0 0;
          font-size: 0.84rem;
          color: #64748b;
        }

        .score-badge {
          padding: 6px 14px;
          border-radius: 8px;
          font-weight: 800;
          font-size: 0.9rem;
        }

        .score-badge.good {
          background: #ecfdf5;
          color: #059669;
          border: 1px solid #6ee7b7;
        }

        .score-badge.warning {
          background: #fffbeb;
          color: #d97706;
          border: 1px solid #fcd34d;
        }

        .theory-questions-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .theory-question-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.15s;
        }

        .theory-question-card.is-correct {
          border-color: #6ee7b7;
          background: #f0fdf4;
        }

        .theory-question-card.is-wrong {
          border-color: #fca5a5;
          background: #fef2f2;
        }

        .question-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .question-num {
          font-size: 0.76rem;
          font-weight: 800;
          text-transform: uppercase;
          color: #059669;
        }

        .result-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.76rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
        }

        .result-tag.correct {
          background: #dcfce7;
          color: #15803d;
        }

        .result-tag.wrong {
          background: #fee2e2;
          color: #b91c1c;
        }

        .question-body {
          font-size: 0.92rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.5;
        }

        .options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .option-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          text-align: left;
          cursor: pointer;
          transition: all 0.12s;
        }

        .option-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .option-btn.selected-opt {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #1d4ed8;
          font-weight: 600;
        }

        .option-btn.correct-opt {
          background: #dcfce7;
          border-color: #22c55e;
          color: #15803d;
          font-weight: 700;
        }

        .option-btn.wrong-opt {
          background: #fee2e2;
          border-color: #ef4444;
          color: #b91c1c;
          text-decoration: line-through;
        }

        .opt-letter {
          font-weight: 800;
          font-size: 0.85rem;
          color: #64748b;
        }

        .opt-text {
          font-size: 0.86rem;
          color: #1e293b;
        }

        .explanation-box {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 0.84rem;
          line-height: 1.5;
          color: #334155;
        }

        .explanation-box strong {
          color: #059669;
          display: block;
          margin-bottom: 4px;
        }

        .explanation-box p {
          margin: 0;
        }

        .theory-footer-bar {
          display: flex;
          justify-content: flex-end;
          padding-top: 10px;
        }

        .submit-theory-btn,
        .retry-theory-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          background: #059669;
          color: #ffffff;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.14s;
        }

        .submit-theory-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .retry-theory-btn {
          background: #475569;
        }

        /* TAB 3: CALCULATOR LAYOUT */
        .calculator-layout {
          height: 100%;
          overflow-y: auto;
          padding: 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .calc-inputs-card,
        .calc-results-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .calc-inputs-card h3,
        .calc-results-card h4 {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
        }

        .calc-intro {
          margin: 0;
          font-size: 0.84rem;
          color: #64748b;
          line-height: 1.5;
        }

        .calc-form-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .form-group label {
          font-size: 0.78rem;
          font-weight: 700;
          color: #334155;
        }

        .calc-select,
        .input-with-unit input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.88rem;
          background: #ffffff;
          color: #0f172a;
          box-sizing: border-box;
        }

        .input-with-unit {
          position: relative;
          display: flex;
          align-items: center;
        }

        .unit-label {
          position: absolute;
          right: 12px;
          font-size: 0.8rem;
          font-weight: 700;
          color: #64748b;
          pointer-events: none;
        }

        .mount-custom-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: none;
          background: #059669;
          color: #ffffff;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
          margin-top: 6px;
        }

        .mount-custom-btn:hover {
          background: #047857;
        }

        .results-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .result-metric-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .metric-title {
          font-size: 0.74rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
        }

        .metric-value {
          font-size: 1.18rem;
          font-weight: 800;
          font-family: monospace;
        }

        .metric-value.emerald {
          color: #059669;
        }

        .metric-value.highlight {
          color: #0284c7;
        }

        .metric-value.purple {
          color: #7c3aed;
        }

        .metric-value.rose {
          color: #e11d48;
        }

        .metric-sub {
          font-size: 0.74rem;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}
