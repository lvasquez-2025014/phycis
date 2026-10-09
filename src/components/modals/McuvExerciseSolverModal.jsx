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
  MCUV_THEORY_QUESTIONS, 
  MCUV_EXERCISES, 
  solveCustomMcuv
} from '../../services/mcuvExerciseSolver';

export default function McuvExerciseSolverModal({
  isOpen,
  onClose,
  onMountExerciseOnBoard,
}) {
  const [activeTab, setActiveTab] = useState('exercises'); // 'exercises' | 'theory' | 'calculator'
  const [selectedExerciseId, setSelectedExerciseId] = useState(MCUV_EXERCISES[0].id);

  // Theory Questions Interactive State
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  // Custom MCUV Calculator State
  const [calcRadius, setCalcRadius] = useState(1.0);
  const [calcOmega0, setCalcOmega0] = useState(0.0);
  const [calcAlpha, setCalcAlpha] = useState(2.0);
  const [calcTime, setCalcTime] = useState(5.0);

  if (!isOpen) return null;

  const selectedExercise =
    MCUV_EXERCISES.find((e) => e.id === selectedExerciseId) ||
    MCUV_EXERCISES[0];

  const handleSelectOption = (questionId, optionIdx) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const calculatedResult = solveCustomMcuv({
    radiusM: parseFloat(calcRadius) || 1.0,
    omega0RadS: parseFloat(calcOmega0) || 0.0,
    alphaRadS2: parseFloat(calcAlpha) || 0.0,
    timeS: parseFloat(calcTime) || 0.0,
  });

  const handleMountCustomExercise = () => {
    if (!onMountExerciseOnBoard) return;
    const customExercise = {
      id: `custom_mcuv_${Date.now()}`,
      title: `Rotor MCUV (r = ${calcRadius} m, α = ${calcAlpha} rad/s²)`,
      topic: 'Movimiento Circular Variado Personalizado',
      statement: `Cuerpo con radio r = ${calcRadius} m, velocidad angular inicial ω₀ = ${calcOmega0} rad/s y aceleración angular α = ${calcAlpha} rad/s² evaluado a los t = ${calcTime} s.`,
      params: { rM: calcRadius, omega0: calcOmega0, alpha: calcAlpha, timeS: calcTime },
      steps: [
        {
          title: 'Velocidad Angular Instantánea',
          body: `ω(t) = ω₀ + α·t = ${calcOmega0} + (${calcAlpha})·(${calcTime}) = ${calculatedResult.omegaFinalRadS.toFixed(2)} rad/s (${calculatedResult.rpmFinal.toFixed(1)} RPM)`,
        },
        {
          title: 'Aceleraciones Tangencial y Centrípeta',
          body: `a_t = |α|·r = |${calcAlpha}|·${calcRadius} = ${calculatedResult.tangentialAccel.toFixed(2)} m/s²\na_c = ω²·r = (${calculatedResult.omegaFinalRadS.toFixed(2)})²·${calcRadius} = ${calculatedResult.centripetalAccel.toFixed(2)} m/s²`,
        },
        {
          title: 'Aceleración Total Resultante',
          body: `a_total = √(a_t² + a_c²) = √(${calculatedResult.tangentialAccel.toFixed(2)}² + ${calculatedResult.centripetalAccel.toFixed(2)}²) = ${calculatedResult.totalAccel.toFixed(2)} m/s²`,
        },
        {
          title: 'Desplazamiento Angular y Vueltas',
          body: `Δθ = ω₀·t + ½·α·t² = ${calculatedResult.deltaThetaRad.toFixed(2)} rad\nN = Δθ / (2π) = ${calculatedResult.revolutions.toFixed(2)} revoluciones`,
        },
      ],
      finalAnswer: `Rapidez: ${calculatedResult.tangentialVelocity.toFixed(2)} m/s | Acel. Tangencial: ${calculatedResult.tangentialAccel.toFixed(2)} m/s² | Acel. Centrípeta: ${calculatedResult.centripetalAccel.toFixed(2)} m/s² | Acel. Total: ${calculatedResult.totalAccel.toFixed(2)} m/s² | Vueltas: ${calculatedResult.revolutions.toFixed(2)} rev`,
      assemblyConfig: {
        radiusMeters: parseFloat(calcRadius) || 1.0,
        omega0: parseFloat(calcOmega0) || 0.0,
        alpha: parseFloat(calcAlpha) || 2.0,
        label: `Rotor MCUV r = ${calcRadius} m`,
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
              <span>Colegio Kinal • Física Diversificado</span>
              <span className="mcu-badge-ht">Unidad 2 MCUV</span>
            </div>
            <h2 className="mcu-modal-title">
              <RotateCw className="inline-icon" size={24} />
              Movimiento Circular Uniformemente Acelerado (MCUV / MCUA)
            </h2>
            <p className="mcu-modal-subtitle">
              Solucionador oficial con 15 situaciones problemas, 10 preguntas conceptuales evaluadas y laboratorio interactivo con vectores v⃗_t, a⃗_c, a⃗_t y a⃗_total.
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
            <span>Situaciones Problemas ({MCUV_EXERCISES.length})</span>
          </button>
          <button
            className={`mcu-tab-btn ${activeTab === 'theory' ? 'active' : ''}`}
            onClick={() => setActiveTab('theory')}
          >
            <HelpCircle size={16} />
            <span>Preguntas Teóricas ({MCUV_THEORY_QUESTIONS.length})</span>
          </button>
          <button
            className={`mcu-tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculator')}
          >
            <Calculator size={16} />
            <span>Calculadora Universal MCUV</span>
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
                  Problemas Oficiales Unidad 2 Kinal
                </div>
                <div className="sidebar-items-list">
                  {MCUV_EXERCISES.map((ex) => (
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
                    Inserta las fichas de resolución y el rotor interactivo con los 4 vectores (v⃗_t, a⃗_c, a⃗_t, a⃗_total) en el lienzo.
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
                  <h4>Cuestionario Teórico Oficial • 10 Preguntas Evaluadas</h4>
                  <p>
                    Comprueba tu comprensión sobre aceleración angular (α), aceleración tangencial (at), aceleración centrípeta (ac) y aceleración total resultante (atotal).
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
                {MCUV_THEORY_QUESTIONS.map((q) => {
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

          {/* TAB 3: CALCULADORA UNIVERSAL MCUV */}
          {activeTab === 'calculator' && (
            <div className="mcu-calculator-layout">
              <div className="calc-inputs-pane">
                <div className="pane-header">
                  <Compass size={20} className="icon-cyan" />
                  <h4>Parámetros del Movimiento Circular Acelerado</h4>
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
                    <span className="field-hint">Distancia desde el eje central a la masa orbitante</span>
                  </div>

                  <div className="calc-field">
                    <label>Velocidad angular inicial ω₀ (rad/s):</label>
                    <input
                      type="number"
                      step="0.5"
                      value={calcOmega0}
                      onChange={(e) => setCalcOmega0(e.target.value)}
                    />
                    <span className="field-hint">Velocidad angular en t = 0 (0 si parte del reposo)</span>
                  </div>

                  <div className="calc-field">
                    <label>Aceleración angular α (rad/s²):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={calcAlpha}
                      onChange={(e) => setCalcAlpha(e.target.value)}
                    />
                    <span className="field-hint">Constante en el tiempo (positiva acelera, negativa frena)</span>
                  </div>

                  <div className="calc-field">
                    <label>Tiempo transcurrido t (segundos):</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={calcTime}
                      onChange={(e) => setCalcTime(e.target.value)}
                    />
                    <span className="field-hint">Instante en que se calculan las variables instantáneas</span>
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
                    <div className="out-label">Velocidad Angular Instantánea ω(t)</div>
                    <div className="out-value">{calculatedResult.omegaFinalRadS.toFixed(2)} rad/s</div>
                    <div className="out-sub">ω = ω₀ + α·t ({calculatedResult.rpmFinal.toFixed(1)} RPM)</div>
                  </div>

                  <div className="output-card emerald">
                    <div className="out-label">Rapidez Tangencial v_t(t)</div>
                    <div className="out-value">{calculatedResult.tangentialVelocity.toFixed(2)} m/s</div>
                    <div className="out-sub">v_t = |ω| · r</div>
                  </div>

                  <div className="output-card amber">
                    <div className="out-label">Aceleración Tangencial a_t</div>
                    <div className="out-value">{calculatedResult.tangentialAccel.toFixed(2)} m/s²</div>
                    <div className="out-sub">a_t = |α| · r (constante)</div>
                  </div>

                  <div className="output-card rose">
                    <div className="out-label">Aceleración Centrípeta a_c(t)</div>
                    <div className="out-value">{calculatedResult.centripetalAccel.toFixed(2)} m/s²</div>
                    <div className="out-sub">a_c = ω² · r = v_t² / r</div>
                  </div>

                  <div className="output-card purple">
                    <div className="out-label">Aceleración Total a_total(t)</div>
                    <div className="out-value">{calculatedResult.totalAccel.toFixed(2)} m/s²</div>
                    <div className="out-sub">a_tot = √(a_t² + a_c²)</div>
                  </div>

                  <div className="output-card sky">
                    <div className="out-label">Desplazamiento Angular Δθ y Vueltas</div>
                    <div className="out-value">{calculatedResult.revolutions.toFixed(2)} rev</div>
                    <div className="out-sub">Δθ = {calculatedResult.deltaThetaRad.toFixed(2)} rad = ω₀·t + ½·α·t²</div>
                  </div>
                </div>

                <div className="calc-formula-summary">
                  <div className="summary-title">Ecuaciones Fundamentales del MCUV (Kinal):</div>
                  <div className="formulas-row">
                    <span>ω(t) = ω₀ + α·t</span>
                    <span>Δθ = ω₀·t + ½·α·t²</span>
                    <span>ω² = ω₀² + 2·α·Δθ</span>
                    <span>a_t = α·r</span>
                    <span>a_c = ω²·r</span>
                    <span>a_total = √(a_t² + a_c²)</span>
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
          z-index: 999;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .mcu-modal-container {
          background: #ffffff;
          width: 100%;
          max-width: 1140px;
          height: 88vh;
          max-height: 820px;
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }

        .mcu-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 18px 24px;
          border-bottom: 1px solid #e2e8f0;
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
          border-radius: 9999px;
          font-weight: 800;
          font-size: 0.7rem;
        }

        .mcu-modal-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mcu-modal-title .inline-icon {
          color: #0284c7;
        }

        .mcu-modal-subtitle {
          margin: 4px 0 0;
          font-size: 0.84rem;
          color: #64748b;
        }

        .mcu-modal-close {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          transition: all 0.15s ease;
        }

        .mcu-modal-close:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .mcu-tabs-bar {
          display: flex;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          padding: 0 20px;
          gap: 12px;
        }

        .mcu-tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.15s ease;
        }

        .mcu-tab-btn:hover {
          color: #0284c7;
        }

        .mcu-tab-btn.active {
          color: #0284c7;
          border-bottom-color: #0284c7;
        }

        .mcu-modal-body {
          flex: 1;
          overflow: hidden;
          background: #f8fafc;
        }

        .mcu-exercises-layout {
          display: grid;
          grid-template-columns: 310px 1fr;
          height: 100%;
        }

        .mcu-exercises-sidebar {
          background: #ffffff;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .sidebar-section-title {
          padding: 12px 16px;
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          border-bottom: 1px solid #f1f5f9;
        }

        .sidebar-items-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .exercise-sidebar-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #f1f5f9;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.14s ease;
        }

        .exercise-sidebar-card:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .exercise-sidebar-card.active {
          background: #e0f2fe;
          border-color: #7dd3fc;
        }

        .ex-card-number {
          font-weight: 800;
          font-size: 0.8rem;
          color: #0284c7;
          background: #bae6fd;
          padding: 4px 6px;
          border-radius: 6px;
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
          font-size: 0.72rem;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .exercise-sidebar-card .chevron {
          color: #94a3b8;
        }

        .exercise-sidebar-card.active .chevron {
          color: #0284c7;
        }

        .mcu-exercise-detail {
          padding: 22px 28px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          height: 100%;
        }

        .detail-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .detail-badges {
          display: flex;
          gap: 8px;
        }

        .detail-badge-pill {
          background: #e2e8f0;
          color: #475569;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
        }

        .detail-topic-pill {
          background: #fef3c7;
          color: #d97706;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
        }

        .detail-title {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
        }

        .detail-statement-card {
          background: #ffffff;
          padding: 14px 18px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
        }

        .card-label {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #64748b;
          margin-bottom: 6px;
        }

        .statement-text {
          margin: 0;
          font-size: 0.88rem;
          line-height: 1.5;
          color: #1e293b;
        }

        .detail-steps-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .section-label {
          font-size: 0.84rem;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .steps-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 12px;
        }

        .step-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02);
        }

        .step-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .step-badge {
          background: #0284c7;
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 800;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
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
          background: #f8fafc;
          padding: 8px;
          border-radius: 6px;
        }

        .detail-answer-banner {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          padding: 14px 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .answer-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 800;
          color: #166534;
        }

        .icon-emerald {
          color: #16a34a;
        }

        .answer-text {
          margin: 0;
          font-family: inherit;
          font-size: 0.85rem;
          font-weight: 600;
          color: #15803d;
          white-space: pre-wrap;
          line-height: 1.45;
        }

        .detail-action-footer {
          margin-top: auto;
          padding-top: 14px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .mount-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #0284c7;
          color: #ffffff;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
          transition: all 0.15s ease;
        }

        .mount-btn:hover {
          background: #0369a1;
          transform: translateY(-1px);
        }

        .action-hint {
          font-size: 0.78rem;
          color: #64748b;
        }

        /* THEORY TAB */
        .mcu-theory-layout {
          padding: 24px 28px;
          overflow-y: auto;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .theory-header-intro {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
          padding: 16px 20px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .theory-meta h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 800;
          color: #0f172a;
        }

        .theory-meta p {
          margin: 4px 0 0;
          font-size: 0.82rem;
          color: #64748b;
        }

        .theory-check-btn {
          background: #0284c7;
          color: #ffffff;
          border: none;
          padding: 9px 18px;
          border-radius: 8px;
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.14s ease;
        }

        .theory-check-btn:hover {
          background: #0369a1;
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
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: all 0.14s ease;
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
          align-items: center;
          justify-content: space-between;
        }

        .q-badge {
          background: #f1f5f9;
          color: #475569;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .q-status-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .q-status-badge.pass {
          background: #bbf7d0;
          color: #166534;
        }

        .q-status-badge.fail {
          background: #fecaca;
          color: #991b1b;
        }

        .q-text {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.45;
        }

        .q-options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .q-option-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          text-align: left;
          font-family: inherit;
          font-size: 0.82rem;
          color: #334155;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .q-option-item:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .q-option-item.selected {
          border-color: #0284c7;
          background: #f0f9ff;
          color: #0369a1;
          font-weight: 600;
        }

        .q-option-item.actual-correct {
          border-color: #22c55e !important;
          background: #dcfce7 !important;
          color: #15803d !important;
          font-weight: 700;
        }

        .q-option-item.wrong-picked {
          border-color: #ef4444 !important;
          background: #fee2e2 !important;
          color: #b91c1c !important;
        }

        .opt-letter {
          font-weight: 800;
          color: #64748b;
        }

        .q-explanation-box {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 0.8rem;
          color: #1e40af;
          line-height: 1.45;
        }

        /* CALCULATOR TAB */
        .mcu-calculator-layout {
          display: grid;
          grid-template-columns: 380px 1fr;
          height: 100%;
        }

        .calc-inputs-pane {
          background: #ffffff;
          border-right: 1px solid #e2e8f0;
          padding: 22px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
        }

        .pane-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pane-header h4 {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 800;
          color: #0f172a;
        }

        .icon-cyan {
          color: #06b6d4;
        }

        .calc-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
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
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 0.88rem;
          font-weight: 600;
          color: #0f172a;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .calc-field input:focus {
          border-color: #0284c7;
        }

        .field-hint {
          font-size: 0.72rem;
          color: #64748b;
        }

        .calc-mount-btn {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #0284c7;
          color: #ffffff;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
          transition: all 0.15s ease;
        }

        .calc-mount-btn:hover {
          background: #0369a1;
          transform: translateY(-1px);
        }

        .calc-outputs-pane {
          padding: 24px 28px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .outputs-cards-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        .output-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          box-shadow: 0 2px 4px rgba(15, 23, 42, 0.02);
        }

        .output-card.highlight {
          border-color: #93c5fd;
          background: #f0f7ff;
        }

        .output-card.emerald {
          border-color: #86efac;
          background: #f0fdf4;
        }

        .output-card.amber {
          border-color: #fde68a;
          background: #fffbeb;
        }

        .output-card.rose {
          border-color: #fecdd3;
          background: #fff1f2;
        }

        .output-card.purple {
          border-color: #ddd6fe;
          background: #faf5ff;
        }

        .output-card.sky {
          border-color: #bae6fd;
          background: #f0f9ff;
        }

        .out-label {
          font-size: 0.74rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .out-value {
          font-size: 1.35rem;
          font-weight: 800;
          color: #0f172a;
        }

        .out-sub {
          font-size: 0.74rem;
          color: #475569;
          font-family: monospace;
        }

        .calc-formula-summary {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .summary-title {
          font-size: 0.82rem;
          font-weight: 800;
          color: #0f172a;
        }

        .formulas-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .formulas-row span {
          background: #f1f5f9;
          padding: 6px 12px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 0.82rem;
          font-weight: 700;
          color: #0284c7;
        }
      `}</style>
    </div>
  );
}
