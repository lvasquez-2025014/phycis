import React, { useState } from 'react';
import { 
  X, 
  Calculator, 
  BookOpen, 
  ArrowRight, 
  Layers, 
  HelpCircle,
  ArrowDownCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  HT03_FREEFALL_EXERCISES, 
  HT03_CONCEPTUAL_QUESTIONS,
  solveCustomFreefall,
  buildFreefallExerciseBoardElements
} from '../../services/freefallExerciseSolver';

export default function FreefallExerciseSolverModal({
  isOpen,
  onClose,
  onMountExerciseOnBoard,
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('problems'); // 'problems', 'conceptual', 'calculator'
  const [selectedProblemId, setSelectedProblemId] = useState(HT03_FREEFALL_EXERCISES[0].id);

  // Conceptual Questions state (selected answer per question)
  const [conceptualAnswers, setConceptualAnswers] = useState({});

  // Custom Calculator Form State
  const [calcV0, setCalcV0] = useState('0');
  const [calcH, setCalcH] = useState('50');
  const [calcT, setCalcT] = useState('');
  const [calcVf, setCalcVf] = useState('');
  const [calcG, setCalcG] = useState('9.80');
  const [calcLabel, setCalcLabel] = useState('Esfera Experimental');

  // Currently selected problem
  const currentProblem = HT03_FREEFALL_EXERCISES.find((e) => e.id === selectedProblemId) || HT03_FREEFALL_EXERCISES[0];

  // Live calculation for Custom Calculator
  const calcSolution = solveCustomFreefall({
    v0: calcV0,
    h: calcH,
    t: calcT,
    vf: calcVf,
    g: calcG,
  });

  const handleMountProblem = () => {
    if (onMountExerciseOnBoard) {
      onMountExerciseOnBoard(currentProblem);
      onClose();
    }
  };

  const handleMountCustomCalc = () => {
    if (!calcSolution) return;
    const customEx = {
      id: `custom_ff_${Date.now()}`,
      title: `${calcLabel} (h = ${calcSolution.h} m, g = ${calcSolution.g} m/s²)`,
      statement: `Problema de Caída Libre personalizado:\nVelocidad inicial v₀ = ${calcSolution.v0} m/s\nAltura de caída h = ${calcSolution.h} m\nTiempo de caída t = ${calcSolution.t} s\nVelocidad de impacto vf = ${calcSolution.vf} m/s\nGravedad g = ${calcSolution.g} m/s²`,
      category: 'custom_freefall',
      steps: calcSolution.steps,
      finalAnswer: `vf = ${calcSolution.vf} m/s (${(calcSolution.vf * 3.6).toFixed(1)} km/h) • t = ${calcSolution.t} s • h = ${calcSolution.h} m`,
      assemblyConfig: {
        towerHeightM: Math.max(25, calcSolution.h),
        releaseHeightM: calcSolution.h,
        v0: calcSolution.v0,
        color: '#ef4444',
        label: calcLabel,
      },
    };

    if (onMountExerciseOnBoard) {
      onMountExerciseOnBoard(customEx);
      onClose();
    }
  };

  const handleSelectConceptualOption = (questionId, optionId) => {
    setConceptualAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  return (
    <div className="ff-solver-modal-overlay">
      <div className="ff-solver-modal-window">
        {/* Modal Header */}
        <div className="ff-modal-header">
          <div className="ff-modal-header-left">
            <span className="ff-header-badge">UNIDAD 1 • FÍSICA II • QUINTO BACHILLERATO</span>
            <h2 className="ff-modal-title">Solucionador de Caída Libre (HT03 Colegio Kinal)</h2>
          </div>
          <button className="ff-modal-close-btn" onClick={onClose} title="Cerrar (Esc)">
            <X size={18} />
          </button>
        </div>

        {/* Segmented Control Navigation */}
        <div className="ff-modal-nav">
          <button
            className={`ff-nav-tab ${activeTab === 'problems' ? 'active' : ''}`}
            onClick={() => setActiveTab('problems')}
          >
            <BookOpen size={16} />
            <span>Problemas HT03 (10 Ejercicios)</span>
          </button>
          <button
            className={`ff-nav-tab ${activeTab === 'conceptual' ? 'active' : ''}`}
            onClick={() => setActiveTab('conceptual')}
          >
            <HelpCircle size={16} />
            <span>Preguntas Conceptuales (Forma 1)</span>
          </button>
          <button
            className={`ff-nav-tab ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculator')}
          >
            <Calculator size={16} />
            <span>Calculadora de Caída Libre</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="ff-modal-body">
          {/* TAB 1: HT03 PROBLEMS */}
          {activeTab === 'problems' && (
            <div className="ff-split-layout">
              {/* Left Column: Problem Selector List */}
              <div className="ff-sidebar-list">
                <div className="ff-sidebar-header">
                  <span>Seleccionar Problema</span>
                  <span className="ff-count-badge">10 Problemas</span>
                </div>
                <div className="ff-problems-scroll">
                  {HT03_FREEFALL_EXERCISES.map((prob) => (
                    <button
                      key={prob.id}
                      className={`ff-problem-item ${selectedProblemId === prob.id ? 'active' : ''}`}
                      onClick={() => setSelectedProblemId(prob.id)}
                    >
                      <div className="ff-problem-item-num">P{prob.number}</div>
                      <div className="ff-problem-item-info">
                        <span className="ff-problem-item-title">{prob.title}</span>
                        <span className="ff-problem-item-topic">{prob.topic}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Problem Detail & Steps */}
              <div className="ff-detail-view">
                <div className="ff-detail-header">
                  <div className="ff-detail-badge-row">
                    <span className="ff-badge-primary">Problema #{currentProblem.number}</span>
                    <span className="ff-badge-secondary">{currentProblem.source}</span>
                  </div>
                  <h3 className="ff-detail-title">{currentProblem.title}</h3>
                </div>

                <div className="ff-statement-card">
                  <h4 className="ff-card-subtitle">Enunciado Oficial:</h4>
                  <p className="ff-statement-text">{currentProblem.statement}</p>
                </div>

                <div className="ff-steps-container">
                  <h4 className="ff-card-subtitle">Desarrollo y Solución Paso a Paso:</h4>
                  <div className="ff-steps-list">
                    {currentProblem.steps.map((step, idx) => (
                      <div key={idx} className="ff-step-item">
                        <div className="ff-step-header">
                          <span className="ff-step-pill">{idx + 1}</span>
                          <span className="ff-step-title">{step.title}</span>
                        </div>
                        <pre className="ff-step-body">{step.body}</pre>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="ff-answer-card">
                  <div className="ff-answer-header">
                    <CheckCircle2 size={18} className="ff-answer-icon" />
                    <span>Respuesta Final Verificada:</span>
                  </div>
                  <p className="ff-answer-text">{currentProblem.finalAnswer}</p>
                </div>

                <div className="ff-detail-actions">
                  <button
                    className="ff-mount-btn"
                    onClick={handleMountProblem}
                    title="Insertar tarjetas teóricas y torre física simulable en la pizarra"
                  >
                    <Layers size={16} />
                    <span>Montar Problema en la Pizarra</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONCEPTUAL QUESTIONS (FORMA 1) */}
          {activeTab === 'conceptual' && (
            <div className="ff-conceptual-container">
              <div className="ff-conceptual-intro">
                <h3 className="ff-conceptual-title">Preguntas Conceptuales de Caída Libre (Forma 1)</h3>
                <p className="ff-conceptual-desc">
                  Selecciona tu respuesta para cada pregunta de opción múltiple. El sistema evaluará al instante tu razonamiento físico y mostrará la fundamentación teórica de acuerdo a los principios de Galileo Galilei y Newton.
                </p>
              </div>

              <div className="ff-questions-list">
                {HT03_CONCEPTUAL_QUESTIONS.map((q) => {
                  const selected = conceptualAnswers[q.id];
                  const isAnswered = selected !== undefined;
                  const isCorrect = selected === q.correctOptionId;

                  return (
                    <div key={q.id} className="ff-q-card">
                      <div className="ff-q-header">
                        <span className="ff-q-num">Pregunta #{q.number}</span>
                        <h4 className="ff-q-title">{q.title}</h4>
                      </div>
                      <p className="ff-q-statement">{q.statement}</p>

                      <div className="ff-options-grid">
                        {q.options.map((opt) => {
                          const isOptionSelected = selected === opt.id;
                          const isOptionCorrect = opt.id === q.correctOptionId;
                          let optionClass = 'ff-opt-btn';

                          if (isAnswered) {
                            if (isOptionCorrect) {
                              optionClass += ' correct';
                            } else if (isOptionSelected) {
                              optionClass += ' wrong';
                            }
                          } else if (isOptionSelected) {
                            optionClass += ' selected';
                          }

                          return (
                            <button
                              key={opt.id}
                              className={optionClass}
                              onClick={() => handleSelectConceptualOption(q.id, opt.id)}
                            >
                              <span className="ff-opt-letter">{opt.id})</span>
                              <span className="ff-opt-text">{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>

                      {isAnswered && (
                        <div className={`ff-feedback-box ${isCorrect ? 'correct' : 'wrong'}`}>
                          <div className="ff-feedback-header">
                            {isCorrect ? (
                              <>
                                <CheckCircle2 size={16} color="#16a34a" />
                                <span className="ff-feedback-status correct">¡Correcto!</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle size={16} color="#dc2626" />
                                <span className="ff-feedback-status wrong">Respuesta Incorrecta</span>
                              </>
                            )}
                          </div>
                          <p className="ff-feedback-explanation">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="ff-calc-container">
              <div className="ff-calc-form-panel">
                <h3 className="ff-calc-title">Calculadora Cinemática de Caída Libre</h3>
                <p className="ff-calc-desc">
                  Introduce al menos 2 variables conocidas para calcular automáticamente la velocidad de impacto, el tiempo de caída y la altura total con fundamentación algebraica paso a paso.
                </p>

                <div className="ff-calc-grid">
                  {/* v0 */}
                  <div className="ff-calc-field">
                    <label className="ff-calc-label">Velocidad Inicial hacia abajo (v₀):</label>
                    <div className="ff-calc-input-row">
                      <input
                        type="number"
                        step="any"
                        className="ff-calc-input"
                        value={calcV0}
                        onChange={(e) => setCalcV0(e.target.value)}
                        placeholder="0.0"
                      />
                      <span className="ff-calc-unit">m/s</span>
                    </div>
                    <span className="ff-calc-hint">Usa 0 para cuerpos que parten del reposo</span>
                  </div>

                  {/* Height */}
                  <div className="ff-calc-field">
                    <label className="ff-calc-label">Altura de Caída (h):</label>
                    <div className="ff-calc-input-row">
                      <input
                        type="number"
                        step="any"
                        className="ff-calc-input"
                        value={calcH}
                        onChange={(e) => {
                          setCalcH(e.target.value);
                          if (e.target.value) {
                            setCalcT('');
                            setCalcVf('');
                          }
                        }}
                        placeholder="50.0"
                      />
                      <span className="ff-calc-unit">metros</span>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="ff-calc-field">
                    <label className="ff-calc-label">Tiempo de Caída (t):</label>
                    <div className="ff-calc-input-row">
                      <input
                        type="number"
                        step="any"
                        className="ff-calc-input"
                        value={calcT}
                        onChange={(e) => {
                          setCalcT(e.target.value);
                          if (e.target.value) {
                            setCalcH('');
                            setCalcVf('');
                          }
                        }}
                        placeholder="Automático"
                      />
                      <span className="ff-calc-unit">segundos</span>
                    </div>
                  </div>

                  {/* Gravity */}
                  <div className="ff-calc-field">
                    <label className="ff-calc-label">Aceleración de la Gravedad (g):</label>
                    <div className="ff-calc-input-row">
                      <input
                        type="number"
                        step="any"
                        className="ff-calc-input"
                        value={calcG}
                        onChange={(e) => setCalcG(e.target.value)}
                        placeholder="9.80"
                      />
                      <span className="ff-calc-unit">m/s²</span>
                    </div>
                  </div>

                  {/* Mobile Label */}
                  <div className="ff-calc-field full">
                    <label className="ff-calc-label">Nombre del Objeto en el Tablero:</label>
                    <input
                      type="text"
                      className="ff-calc-input"
                      value={calcLabel}
                      onChange={(e) => setCalcLabel(e.target.value)}
                      placeholder="Ej: Esfera Experimental, Piedra, Maceta..."
                    />
                  </div>
                </div>

                <div className="ff-calc-presets">
                  <span className="ff-calc-presets-label">Valores rápidos HT03:</span>
                  <button
                    className="ff-calc-pill"
                    onClick={() => {
                      setCalcV0('0');
                      setCalcH('18');
                      setCalcT('');
                      setCalcVf('');
                    }}
                  >
                    18 m (P1)
                  </button>
                  <button
                    className="ff-calc-pill"
                    onClick={() => {
                      setCalcV0('6');
                      setCalcH('40');
                      setCalcT('');
                      setCalcVf('');
                    }}
                  >
                    v₀ = 6 m/s, 40 m (P2)
                  </button>
                  <button
                    className="ff-calc-pill"
                    onClick={() => {
                      setCalcV0('0');
                      setCalcH('50');
                      setCalcT('');
                      setCalcVf('');
                    }}
                  >
                    50 m (P5)
                  </button>
                  <button
                    className="ff-calc-pill"
                    onClick={() => {
                      setCalcV0('0');
                      setCalcH('120');
                      setCalcT('');
                      setCalcVf('');
                    }}
                  >
                    120 m (P3)
                  </button>
                  <button
                    className="ff-calc-pill"
                    onClick={() => {
                      setCalcV0('8');
                      setCalcH('25');
                      setCalcT('');
                      setCalcVf('');
                    }}
                  >
                    v₀ = 8 m/s, 25 m (P8)
                  </button>
                </div>
              </div>

              {/* Calculator Results Display */}
              <div className="ff-calc-results-panel">
                <h4 className="ff-results-title">Resultados Calculados:</h4>
                <div className="ff-results-badges">
                  <div className="ff-res-badge">
                    <span className="ff-res-kicker">Velocidad de Choque (vf)</span>
                    <span className="ff-res-val">{calcSolution.vf.toFixed(2)} m/s</span>
                    <span className="ff-res-sub">{(calcSolution.vf * 3.6).toFixed(1)} km/h</span>
                  </div>
                  <div className="ff-res-badge">
                    <span className="ff-res-kicker">Tiempo de Vuelo (t)</span>
                    <span className="ff-res-val">{calcSolution.t.toFixed(2)} s</span>
                    <span className="ff-res-sub">segundos</span>
                  </div>
                  <div className="ff-res-badge">
                    <span className="ff-res-kicker">Altura Total (h)</span>
                    <span className="ff-res-val">{calcSolution.h.toFixed(2)} m</span>
                    <span className="ff-res-sub">metros</span>
                  </div>
                </div>

                <div className="ff-results-steps">
                  <h5 className="ff-res-steps-title">Fórmulas y Sustituciones:</h5>
                  {calcSolution.steps.map((st, i) => (
                    <div key={i} className="ff-calc-step-card">
                      <span className="ff-calc-step-t">{st.title}</span>
                      <pre className="ff-calc-step-b">{st.body}</pre>
                    </div>
                  ))}
                </div>

                <button
                  className="ff-mount-btn primary"
                  onClick={handleMountCustomCalc}
                  title="Insertar ejercicio personalizado y torre física en el lienzo"
                >
                  <Layers size={16} />
                  <span>Montar en la Pizarra</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .ff-solver-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: ffFadeIn 0.15s ease-out;
        }

        @keyframes ffFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .ff-solver-modal-window {
          width: 100%;
          max-width: 1080px;
          height: 88vh;
          max-height: 820px;
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 25px 60px rgba(15, 23, 42, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: ffScaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes ffScaleUp {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Modal Header */
        .ff-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          flex-shrink: 0;
        }

        .ff-header-badge {
          display: inline-block;
          font-size: 0.65rem;
          font-weight: 800;
          color: #dc2626;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 2px;
        }

        .ff-modal-title {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
        }

        .ff-modal-close-btn {
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.12s;
        }

        .ff-modal-close-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        /* Nav Tabs */
        .ff-modal-nav {
          display: flex;
          background: #f1f5f9;
          border-bottom: 1px solid #e2e8f0;
          padding: 6px 20px 0;
          gap: 8px;
          flex-shrink: 0;
        }

        .ff-nav-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          font-size: 0.84rem;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s;
        }

        .ff-nav-tab:hover {
          color: #0f172a;
        }

        .ff-nav-tab.active {
          color: #dc2626;
          border-bottom-color: #dc2626;
          background: #ffffff;
          border-radius: 8px 8px 0 0;
          font-weight: 700;
        }

        /* Modal Body */
        .ff-modal-body {
          flex: 1;
          overflow: hidden;
          display: flex;
        }

        /* Split Layout for Problems */
        .ff-split-layout {
          display: flex;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .ff-sidebar-list {
          width: 320px;
          border-right: 1px solid #e2e8f0;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .ff-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid #e2e8f0;
        }

        .ff-count-badge {
          background: #fee2e2;
          color: #dc2626;
          padding: 2px 7px;
          border-radius: 12px;
          font-size: 0.7rem;
        }

        .ff-problems-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ff-problem-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 8px;
          text-align: left;
          cursor: pointer;
          transition: all 0.12s;
        }

        .ff-problem-item:hover {
          background: #f1f5f9;
        }

        .ff-problem-item.active {
          background: #ffffff;
          border-color: #fca5a5;
          box-shadow: 0 2px 6px rgba(220, 38, 38, 0.08);
        }

        .ff-problem-item-num {
          width: 30px;
          height: 30px;
          border-radius: 7px;
          background: #e2e8f0;
          color: #334155;
          font-weight: 800;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ff-problem-item.active .ff-problem-item-num {
          background: #dc2626;
          color: #ffffff;
        }

        .ff-problem-item-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .ff-problem-item-title {
          font-size: 0.82rem;
          font-weight: 600;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ff-problem-item-topic {
          font-size: 0.7rem;
          color: #64748b;
        }

        /* Detail View */
        .ff-detail-view {
          flex: 1;
          overflow-y: auto;
          padding: 22px 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ff-detail-header {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ff-detail-badge-row {
          display: flex;
          gap: 8px;
        }

        .ff-badge-primary {
          background: #fee2e2;
          color: #dc2626;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
        }

        .ff-badge-secondary {
          background: #f1f5f9;
          color: #475569;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 4px;
        }

        .ff-detail-title {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
        }

        .ff-statement-card {
          background: #fffbeb;
          border: 1px solid #fef3c7;
          border-radius: 10px;
          padding: 14px 16px;
        }

        .ff-card-subtitle {
          margin: 0 0 6px 0;
          font-size: 0.75rem;
          font-weight: 700;
          color: #92400e;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .ff-statement-text {
          margin: 0;
          font-size: 0.88rem;
          color: #1e293b;
          line-height: 1.5;
          white-space: pre-line;
        }

        .ff-steps-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ff-steps-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ff-step-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 14px;
        }

        .ff-step-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .ff-step-pill {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #dc2626;
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ff-step-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: #0f172a;
        }

        .ff-step-body {
          margin: 0;
          font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
          font-size: 0.78rem;
          color: #334155;
          line-height: 1.45;
          white-space: pre-wrap;
        }

        .ff-answer-card {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          padding: 12px 16px;
        }

        .ff-answer-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          font-weight: 700;
          color: #166534;
          margin-bottom: 4px;
        }

        .ff-answer-icon {
          color: #16a34a;
        }

        .ff-answer-text {
          margin: 0;
          font-size: 0.86rem;
          font-weight: 600;
          color: #14532d;
          line-height: 1.45;
          white-space: pre-line;
        }

        .ff-detail-actions {
          display: flex;
          justify-content: flex-end;
          padding-top: 6px;
        }

        .ff-mount-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: #dc2626;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-size: 0.86rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
          transition: all 0.15s;
        }

        .ff-mount-btn:hover {
          background: #b91c1c;
          transform: translateY(-1px);
        }

        .ff-mount-btn.primary {
          width: 100%;
          justify-content: center;
          margin-top: 12px;
        }

        /* Conceptual Tab */
        .ff-conceptual-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px 30px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .ff-conceptual-title {
          margin: 0 0 4px 0;
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
        }

        .ff-conceptual-desc {
          margin: 0;
          font-size: 0.84rem;
          color: #64748b;
          line-height: 1.5;
        }

        .ff-questions-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .ff-q-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
        }

        .ff-q-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ff-q-num {
          background: #fee2e2;
          color: #dc2626;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 4px;
        }

        .ff-q-title {
          margin: 0;
          font-size: 0.96rem;
          font-weight: 700;
          color: #0f172a;
        }

        .ff-q-statement {
          margin: 0;
          font-size: 0.88rem;
          color: #334155;
          line-height: 1.5;
        }

        .ff-options-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
        }

        .ff-opt-btn {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 14px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          text-align: left;
          cursor: pointer;
          transition: all 0.12s;
        }

        .ff-opt-btn:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }

        .ff-opt-btn.selected {
          border-color: #dc2626;
          background: #fef2f2;
        }

        .ff-opt-btn.correct {
          background: #f0fdf4;
          border-color: #86efac;
          color: #14532d;
          font-weight: 600;
        }

        .ff-opt-btn.wrong {
          background: #fef2f2;
          border-color: #fca5a5;
          color: #991b1b;
        }

        .ff-opt-letter {
          font-weight: 800;
          font-size: 0.84rem;
          color: #64748b;
        }

        .ff-opt-text {
          font-size: 0.82rem;
          color: inherit;
          line-height: 1.4;
        }

        .ff-feedback-box {
          padding: 12px 14px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ff-feedback-box.correct {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
        }

        .ff-feedback-box.wrong {
          background: #fef2f2;
          border: 1px solid #fecaca;
        }

        .ff-feedback-header {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ff-feedback-status {
          font-size: 0.8rem;
          font-weight: 700;
        }

        .ff-feedback-status.correct {
          color: #15803d;
        }

        .ff-feedback-status.wrong {
          color: #b91c1c;
        }

        .ff-feedback-explanation {
          margin: 0;
          font-size: 0.8rem;
          color: #334155;
          line-height: 1.45;
        }

        /* Calculator Tab */
        .ff-calc-container {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .ff-calc-form-panel {
          width: 480px;
          border-right: 1px solid #e2e8f0;
          padding: 24px 28px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ff-calc-title {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
        }

        .ff-calc-desc {
          margin: 0;
          font-size: 0.82rem;
          color: #64748b;
          line-height: 1.45;
        }

        .ff-calc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .ff-calc-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ff-calc-field.full {
          grid-column: 1 / -1;
        }

        .ff-calc-label {
          font-size: 0.74rem;
          font-weight: 700;
          color: #334155;
        }

        .ff-calc-input-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ff-calc-input {
          flex: 1;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1.5px solid #cbd5e1;
          font-size: 0.85rem;
          color: #0f172a;
          outline: none;
          font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
        }

        .ff-calc-input:focus {
          border-color: #dc2626;
        }

        .ff-calc-unit {
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          width: 44px;
        }

        .ff-calc-hint {
          font-size: 0.68rem;
          color: #64748b;
        }

        .ff-calc-presets {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
          padding-top: 8px;
        }

        .ff-calc-presets-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }

        .ff-calc-pill {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 2px 8px;
          font-size: 0.72rem;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all 0.12s;
        }

        .ff-calc-pill:hover {
          background: #fee2e2;
          color: #dc2626;
          border-color: #fca5a5;
        }

        .ff-calc-results-panel {
          flex: 1;
          padding: 24px 28px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
          background: #f8fafc;
        }

        .ff-results-title {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
        }

        .ff-results-badges {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .ff-res-badge {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .ff-res-kicker {
          font-size: 0.68rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }

        .ff-res-val {
          font-size: 1.15rem;
          font-weight: 800;
          color: #dc2626;
          font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
        }

        .ff-res-sub {
          font-size: 0.72rem;
          color: #64748b;
        }

        .ff-res-steps-title {
          margin: 0 0 6px 0;
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
        }

        .ff-results-steps {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ff-calc-step-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 12px;
        }

        .ff-calc-step-t {
          display: block;
          font-size: 0.8rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .ff-calc-step-b {
          margin: 0;
          font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
          font-size: 0.76rem;
          color: #334155;
          line-height: 1.4;
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  );
}
