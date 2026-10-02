import React, { useState } from 'react';
import { 
  X, 
  Calculator, 
  BookOpen, 
  ArrowRight, 
  Layers, 
  HelpCircle,
  ArrowUpCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  HT04_VERTICAL_EXERCISES, 
  HT04_CONCEPTUAL_QUESTIONS,
  solveCustomVerticalLaunch,
  buildVerticalLaunchExerciseBoardElements
} from '../../services/tiroVerticalExerciseSolver';

export default function TiroVerticalExerciseSolverModal({
  isOpen,
  onClose,
  onMountExerciseOnBoard,
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('problems'); // 'problems', 'conceptual', 'calculator'
  const [selectedProblemId, setSelectedProblemId] = useState(HT04_VERTICAL_EXERCISES[0].id);

  // Conceptual Questions state (selected answer per question)
  const [conceptualAnswers, setConceptualAnswers] = useState({});

  // Custom Calculator Form State
  const [calcV0, setCalcV0] = useState('20.0');
  const [calcG, setCalcG] = useState('9.80');
  const [calcHTarget, setCalcHTarget] = useState('15.0');
  const [calcLabel, setCalcLabel] = useState('Proyectil Experimental');

  // Currently selected problem
  const currentProblem = HT04_VERTICAL_EXERCISES.find((e) => e.id === selectedProblemId) || HT04_VERTICAL_EXERCISES[0];

  // Live calculation for Custom Calculator
  const calcSolution = solveCustomVerticalLaunch({
    v0: calcV0,
    g: calcG,
    hTarget: calcHTarget,
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
      id: `custom_vt_${Date.now()}`,
      title: `${calcLabel} (v₀ = ${calcSolution.v0} m/s, g = ${calcSolution.g} m/s²)`,
      statement: `Problema de Tiro Vertical personalizado:\nVelocidad inicial v₀ = ${calcSolution.v0} m/s\nAceleración de la gravedad g = ${calcSolution.g} m/s²\nAltura máxima alcanzable h_max = ${calcSolution.hMax} m\nTiempo de subida t_subida = ${calcSolution.tSubida} s\nTiempo total en el aire T = ${calcSolution.tTotal} s${calcSolution.hTarget ? `\nInstantes a h = ${calcSolution.hTarget} m: t₁ = ${calcSolution.t1Target} s (subiendo), t₂ = ${calcSolution.t2Target} s (bajando)` : ''}`,
      category: 'custom_vertical',
      steps: calcSolution.steps,
      finalAnswer: `h_max = ${calcSolution.hMax} m • t_subida = ${calcSolution.tSubida} s • T_vuelo = ${calcSolution.tTotal} s${calcSolution.hTarget && calcSolution.t1Target ? ` • t(${calcSolution.hTarget}m) = ${calcSolution.t1Target}s / ${calcSolution.t2Target}s` : ''}`,
      assemblyConfig: {
        v0: calcSolution.v0,
        g: calcSolution.g,
        color: '#8b5cf6',
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
    <div className="vt-solver-modal-overlay">
      <div className="vt-solver-modal-window">
        {/* Modal Header */}
        <div className="vt-modal-header">
          <div className="vt-modal-header-left">
            <span className="vt-header-badge">UNIDAD 1 • FÍSICA II • QUINTO BACHILLERATO</span>
            <h2 className="vt-modal-title">Solucionador de Tiro Vertical (HT04 Colegio Kinal)</h2>
          </div>
          <button className="vt-modal-close-btn" onClick={onClose} title="Cerrar (Esc)">
            <X size={18} />
          </button>
        </div>

        {/* Segmented Control Navigation */}
        <div className="vt-modal-nav">
          <button
            className={`vt-nav-tab ${activeTab === 'problems' ? 'active' : ''}`}
            onClick={() => setActiveTab('problems')}
          >
            <BookOpen size={16} />
            <span>Problemas HT04 (10 Ejercicios)</span>
          </button>
          <button
            className={`vt-nav-tab ${activeTab === 'conceptual' ? 'active' : ''}`}
            onClick={() => setActiveTab('conceptual')}
          >
            <HelpCircle size={16} />
            <span>Preguntas Conceptuales (Forma 1)</span>
          </button>
          <button
            className={`vt-nav-tab ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculator')}
          >
            <Calculator size={16} />
            <span>Calculadora de Tiro Vertical</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="vt-modal-body">
          {/* TAB 1: HT04 PROBLEMS */}
          {activeTab === 'problems' && (
            <div className="vt-split-layout">
              {/* Left Column: Problem Selector List */}
              <div className="vt-sidebar-list">
                <div className="vt-sidebar-header">
                  <span>Seleccionar Problema</span>
                  <span className="vt-count-badge">10 Problemas</span>
                </div>
                <div className="vt-problems-scroll">
                  {HT04_VERTICAL_EXERCISES.map((prob) => (
                    <button
                      key={prob.id}
                      className={`vt-problem-item ${selectedProblemId === prob.id ? 'active' : ''}`}
                      onClick={() => setSelectedProblemId(prob.id)}
                    >
                      <div className="vt-problem-item-num">P{prob.number}</div>
                      <div className="vt-problem-item-info">
                        <span className="vt-problem-item-title">{prob.title}</span>
                        <span className="vt-problem-item-topic">{prob.topic}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Problem Detail & Steps */}
              <div className="vt-detail-view">
                <div className="vt-detail-header">
                  <div className="vt-detail-badge-row">
                    <span className="vt-badge-primary">Problema #{currentProblem.number}</span>
                    <span className="vt-badge-secondary">{currentProblem.source}</span>
                  </div>
                  <h3 className="vt-detail-title">{currentProblem.title}</h3>
                </div>

                <div className="vt-statement-card">
                  <h4 className="vt-card-subtitle">Enunciado Oficial:</h4>
                  <p className="vt-statement-text">{currentProblem.statement}</p>
                </div>

                <div className="vt-steps-container">
                  <h4 className="vt-card-subtitle">Desarrollo y Solución Paso a Paso:</h4>
                  <div className="vt-steps-list">
                    {currentProblem.steps.map((step, idx) => (
                      <div key={idx} className="vt-step-item">
                        <div className="vt-step-header">
                          <span className="vt-step-pill">{idx + 1}</span>
                          <span className="vt-step-title">{step.title}</span>
                        </div>
                        <pre className="vt-step-body">{step.body}</pre>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="vt-answer-card">
                  <div className="vt-answer-header">
                    <CheckCircle2 size={18} className="vt-answer-icon" />
                    <span>Respuesta Final Verificada:</span>
                  </div>
                  <p className="vt-answer-text">{currentProblem.finalAnswer}</p>
                </div>

                <div className="vt-detail-actions">
                  <button
                    className="vt-mount-btn"
                    onClick={handleMountProblem}
                    title="Insertar tarjetas teóricas y lanzador físico simulable en la pizarra"
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
            <div className="vt-conceptual-container">
              <div className="vt-conceptual-intro">
                <h3 className="vt-conceptual-title">Preguntas Conceptuales de Tiro Vertical (Forma 1)</h3>
                <p className="vt-conceptual-desc">
                  Selecciona tu respuesta para cada pregunta de opción múltiple. El sistema evaluará al instante tu razonamiento físico y mostrará la fundamentación teórica de acuerdo a la simetría cinemática y la conservación de energía.
                </p>
              </div>

              <div className="vt-questions-list">
                {HT04_CONCEPTUAL_QUESTIONS.map((q) => {
                  const selected = conceptualAnswers[q.id];
                  const isAnswered = selected !== undefined;
                  const isCorrect = selected === q.correctOptionId;

                  return (
                    <div key={q.id} className="vt-q-card">
                      <div className="vt-q-header">
                        <span className="vt-q-num">Pregunta #{q.number}</span>
                        <h4 className="vt-q-title">{q.title}</h4>
                      </div>
                      <p className="vt-q-statement">{q.statement}</p>

                      <div className="vt-options-grid">
                        {q.options.map((opt) => {
                          const isOptionSelected = selected === opt.id;
                          const isOptionCorrect = opt.id === q.correctOptionId;
                          let optionClass = 'vt-opt-btn';

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
                              <span className="vt-opt-letter">{opt.id.toUpperCase()}</span>
                              <span className="vt-opt-text">{opt.text}</span>
                              {isAnswered && isOptionCorrect && (
                                <CheckCircle2 size={16} className="vt-opt-icon correct" />
                              )}
                              {isAnswered && isOptionSelected && !isOptionCorrect && (
                                <AlertCircle size={16} className="vt-opt-icon wrong" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation Reveal */}
                      {isAnswered && (
                        <div className={`vt-explanation-box ${isCorrect ? 'correct' : 'wrong'}`}>
                          <div className="vt-exp-header">
                            {isCorrect ? (
                              <>
                                <CheckCircle2 size={16} className="text-emerald-600" />
                                <span className="font-semibold text-emerald-800">¡Respuesta Correcta!</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle size={16} className="text-rose-600" />
                                <span className="font-semibold text-rose-800">Respuesta Incorrecta (Opción Correcta: {q.correctOptionId.toUpperCase()})</span>
                              </>
                            )}
                          </div>
                          <p className="vt-exp-text">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: DYNAMIC CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="vt-calc-container">
              <div className="vt-calc-grid">
                {/* Inputs Column */}
                <div className="vt-calc-card">
                  <h3 className="vt-calc-card-title">Parámetros de Lanzamiento</h3>
                  <p className="vt-calc-card-desc">
                    Introduce la velocidad inicial hacia arriba (v₀) y la gravedad del entorno (Tierra 9.80 m/s² o Luna 1.60 m/s²).
                  </p>

                  <div className="vt-calc-fields">
                    <div className="vt-field-group">
                      <label className="vt-field-label">Nombre del Objeto:</label>
                      <input
                        type="text"
                        className="vt-field-input"
                        value={calcLabel}
                        onChange={(e) => setCalcLabel(e.target.value)}
                        placeholder="Ej: Balón, Proyectil..."
                      />
                    </div>

                    <div className="vt-field-group">
                      <label className="vt-field-label">Velocidad Inicial v₀ (m/s):</label>
                      <div className="vt-input-with-unit">
                        <input
                          type="number"
                          step="any"
                          className="vt-field-input"
                          value={calcV0}
                          onChange={(e) => setCalcV0(e.target.value)}
                          placeholder="20.0"
                        />
                        <span className="vt-unit-badge">m/s</span>
                      </div>
                      <div className="vt-quick-pills">
                        {[
                          { label: '20 m/s (P1/P7)', v: '20' },
                          { label: '24.5 m/s (P2)', v: '24.5' },
                          { label: '17.7 m/s (P3)', v: '17.71' },
                          { label: '2.94 m/s (P4)', v: '2.94' },
                          { label: '30 m/s (P10)', v: '30' },
                          { label: '35 m/s (Luna P9)', v: '35', g: '1.60' },
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="vt-pill-btn"
                            onClick={() => {
                              setCalcV0(preset.v);
                              if (preset.g) setCalcG(preset.g);
                            }}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="vt-field-group">
                      <label className="vt-field-label">Aceleración de la Gravedad g (m/s²):</label>
                      <div className="vt-input-with-unit">
                        <input
                          type="number"
                          step="0.01"
                          className="vt-field-input"
                          value={calcG}
                          onChange={(e) => setCalcG(e.target.value)}
                          placeholder="9.80"
                        />
                        <span className="vt-unit-badge">m/s²</span>
                      </div>
                      <div className="vt-quick-pills">
                        <button
                          type="button"
                          className={`vt-pill-btn ${calcG === '9.80' ? 'active' : ''}`}
                          onClick={() => setCalcG('9.80')}
                        >
                          9.80 m/s² (Tierra)
                        </button>
                        <button
                          type="button"
                          className={`vt-pill-btn ${calcG === '1.60' ? 'active' : ''}`}
                          onClick={() => setCalcG('1.60')}
                        >
                          1.60 m/s² (Luna HT04)
                        </button>
                      </div>
                    </div>

                    <div className="vt-field-group">
                      <label className="vt-field-label">Altura Objetivo para evaluar instantes (Opcional):</label>
                      <div className="vt-input-with-unit">
                        <input
                          type="number"
                          step="any"
                          className="vt-field-input"
                          value={calcHTarget}
                          onChange={(e) => setCalcHTarget(e.target.value)}
                          placeholder="Ej: 15.0"
                        />
                        <span className="vt-unit-badge">metros</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Solution Results Column */}
                <div className="vt-calc-card">
                  <h3 className="vt-calc-card-title">Resultados Cinemáticos Analíticos</h3>

                  {calcSolution && (
                    <div className="vt-results-display">
                      <div className="vt-results-metrics">
                        <div className="vt-metric-badge">
                          <span className="vt-metric-label">Altura Máxima (Cúspide)</span>
                          <span className="vt-metric-val">{calcSolution.hMax} m</span>
                        </div>
                        <div className="vt-metric-badge">
                          <span className="vt-metric-label">Tiempo de Subida</span>
                          <span className="vt-metric-val">{calcSolution.tSubida} s</span>
                        </div>
                        <div className="vt-metric-badge">
                          <span className="vt-metric-label">Tiempo Total en el Aire</span>
                          <span className="vt-metric-val">{calcSolution.tTotal} s</span>
                        </div>
                        {calcSolution.hTarget && calcSolution.t1Target && (
                          <div className="vt-metric-badge" style={{ gridColumn: 'span 3' }}>
                            <span className="vt-metric-label">Instantes a h = {calcSolution.hTarget} m</span>
                            <span className="vt-metric-val">
                              t₁ = {calcSolution.t1Target} s (Subida) • t₂ = {calcSolution.t2Target} s (Bajada)
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="vt-calc-steps">
                        <h4 className="vt-card-subtitle">Demostración Matemática:</h4>
                        {calcSolution.steps.map((st, idx) => (
                          <div key={idx} className="vt-step-item">
                            <span className="vt-step-title">{st.title}</span>
                            <pre className="vt-step-body">{st.body}</pre>
                          </div>
                        ))}
                      </div>

                      <div className="vt-detail-actions">
                        <button
                          className="vt-mount-btn"
                          onClick={handleMountCustomCalc}
                          title="Montar este tiro vertical interactivo en la pizarra"
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
            </div>
          )}
        </div>
      </div>

      <style>{`
        .vt-solver-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: vtFadeIn 0.16s ease-out;
        }

        @keyframes vtFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .vt-solver-modal-window {
          width: 100%;
          max-width: 980px;
          height: 88vh;
          max-height: 840px;
          background: #ffffff;
          border-radius: 14px;
          border: 1px solid #cbd5e1;
          box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.35);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .vt-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          flex-shrink: 0;
        }

        .vt-header-badge {
          display: inline-block;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #7c3aed;
          text-transform: uppercase;
          margin-bottom: 3px;
        }

        .vt-modal-title {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
        }

        .vt-modal-close-btn {
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

        .vt-modal-close-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .vt-modal-nav {
          display: flex;
          background: #f1f5f9;
          padding: 6px 24px;
          border-bottom: 1px solid #e2e8f0;
          gap: 8px;
          flex-shrink: 0;
        }

        .vt-nav-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          background: transparent;
          font-size: 0.82rem;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s;
        }

        .vt-nav-tab:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .vt-nav-tab.active {
          background: #ffffff;
          color: #7c3aed;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        .vt-modal-body {
          flex: 1;
          overflow: hidden;
          background: #f8fafc;
          display: flex;
        }

        .vt-split-layout {
          display: flex;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .vt-sidebar-list {
          width: 290px;
          flex-shrink: 0;
          background: #ffffff;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
        }

        .vt-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          border-bottom: 1px solid #f1f5f9;
        }

        .vt-count-badge {
          background: #f5f3ff;
          color: #7c3aed;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.68rem;
          font-weight: 700;
        }

        .vt-problems-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .vt-problem-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s;
          width: 100%;
        }

        .vt-problem-item:hover {
          background: #f8fafc;
          border-color: #e2e8f0;
        }

        .vt-problem-item.active {
          background: #f5f3ff;
          border-color: #ddd6fe;
        }

        .vt-problem-item-num {
          background: #e2e8f0;
          color: #334155;
          font-weight: 800;
          font-size: 0.75rem;
          padding: 4px 6px;
          border-radius: 6px;
          flex-shrink: 0;
        }

        .vt-problem-item.active .vt-problem-item-num {
          background: #7c3aed;
          color: #ffffff;
        }

        .vt-problem-item-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .vt-problem-item-title {
          font-size: 0.82rem;
          font-weight: 600;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vt-problem-item-topic {
          font-size: 0.7rem;
          color: #64748b;
        }

        .vt-detail-view {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .vt-detail-badge-row {
          display: flex;
          gap: 8px;
          margin-bottom: 6px;
        }

        .vt-badge-primary {
          background: #7c3aed;
          color: #ffffff;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 6px;
        }

        .vt-badge-secondary {
          background: #e2e8f0;
          color: #475569;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 6px;
        }

        .vt-detail-title {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
        }

        .vt-statement-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .vt-card-subtitle {
          margin: 0 0 8px 0;
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }

        .vt-statement-text {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.5;
          color: #1e293b;
          white-space: pre-line;
        }

        .vt-steps-container {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .vt-steps-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .vt-step-item {
          background: #f8fafc;
          border-left: 3px solid #7c3aed;
          border-radius: 0 8px 8px 0;
          padding: 10px 14px;
        }

        .vt-step-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .vt-step-pill {
          background: #7c3aed;
          color: #ffffff;
          font-size: 0.7rem;
          font-weight: 700;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vt-step-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: #0f172a;
        }

        .vt-step-body {
          margin: 0;
          font-family: inherit;
          font-size: 0.82rem;
          line-height: 1.45;
          color: #334155;
          white-space: pre-line;
        }

        .vt-answer-card {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          border-radius: 10px;
          padding: 16px;
        }

        .vt-answer-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          font-weight: 700;
          color: #065f46;
          margin-bottom: 6px;
        }

        .vt-answer-icon {
          color: #059669;
        }

        .vt-answer-text {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 600;
          color: #047857;
          white-space: pre-line;
          line-height: 1.5;
        }

        .vt-detail-actions {
          display: flex;
          justify-content: flex-end;
          padding-top: 8px;
        }

        .vt-mount-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #7c3aed;
          color: #ffffff;
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          font-size: 0.84rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          box-shadow: 0 2px 6px rgba(124, 58, 237, 0.3);
        }

        .vt-mount-btn:hover {
          background: #6d28d9;
          transform: translateY(-1px);
        }

        /* CONCEPTUAL QUESTIONS STYLES */
        .vt-conceptual-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .vt-conceptual-intro {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 16px;
        }

        .vt-conceptual-title {
          margin: 0 0 6px 0;
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
        }

        .vt-conceptual-desc {
          margin: 0;
          font-size: 0.84rem;
          color: #475569;
          line-height: 1.45;
        }

        .vt-questions-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .vt-q-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 18px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .vt-q-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .vt-q-num {
          background: #f5f3ff;
          color: #7c3aed;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .vt-q-title {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
        }

        .vt-q-statement {
          margin: 0 0 14px 0;
          font-size: 0.88rem;
          color: #1e293b;
          line-height: 1.5;
        }

        .vt-options-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
        }

        .vt-opt-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s;
          font-size: 0.84rem;
          color: #1e293b;
        }

        .vt-opt-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .vt-opt-btn.selected {
          border-color: #7c3aed;
          background: #f5f3ff;
        }

        .vt-opt-btn.correct {
          border-color: #10b981;
          background: #ecfdf5;
          color: #065f46;
          font-weight: 600;
        }

        .vt-opt-btn.wrong {
          border-color: #f43f5e;
          background: #fff1f2;
          color: #881337;
        }

        .vt-opt-letter {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #f1f5f9;
          color: #475569;
          font-weight: 700;
          font-size: 0.72rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .vt-opt-text {
          flex: 1;
        }

        .vt-explanation-box {
          margin-top: 14px;
          padding: 12px 14px;
          border-radius: 8px;
          border-left: 3px solid transparent;
        }

        .vt-explanation-box.correct {
          background: #ecfdf5;
          border-left-color: #10b981;
        }

        .vt-explanation-box.wrong {
          background: #fff1f2;
          border-left-color: #f43f5e;
        }

        .vt-exp-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          margin-bottom: 4px;
        }

        .vt-exp-text {
          margin: 0;
          font-size: 0.82rem;
          line-height: 1.45;
          color: #334155;
        }

        /* CALCULATOR STYLES */
        .vt-calc-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .vt-calc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .vt-calc-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .vt-calc-card-title {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
        }

        .vt-calc-card-desc {
          margin: 0;
          font-size: 0.82rem;
          color: #64748b;
          line-height: 1.4;
        }

        .vt-calc-fields {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .vt-field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .vt-field-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: #334155;
        }

        .vt-field-input {
          padding: 8px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 0.88rem;
          color: #0f172a;
          outline: none;
          transition: border-color 0.15s;
        }

        .vt-field-input:focus {
          border-color: #7c3aed;
        }

        .vt-input-with-unit {
          display: flex;
        }

        .vt-input-with-unit .vt-field-input {
          flex: 1;
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }

        .vt-unit-badge {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-left: none;
          padding: 0 12px;
          display: flex;
          align-items: center;
          font-size: 0.78rem;
          font-weight: 600;
          color: #475569;
          border-top-right-radius: 6px;
          border-bottom-right-radius: 6px;
        }

        .vt-quick-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 4px;
        }

        .vt-pill-btn {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 3px 8px;
          font-size: 0.68rem;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s;
        }

        .vt-pill-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          color: #0f172a;
        }

        .vt-pill-btn.active {
          background: #f5f3ff;
          border-color: #7c3aed;
          color: #7c3aed;
        }

        .vt-results-display {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .vt-results-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .vt-metric-badge {
          background: #f5f3ff;
          border: 1px solid #ddd6fe;
          border-radius: 8px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .vt-metric-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: #7c3aed;
          text-transform: uppercase;
          margin-bottom: 2px;
        }

        .vt-metric-val {
          font-size: 1.05rem;
          font-weight: 800;
          color: #4c1d95;
        }

        .vt-calc-steps {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 280px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}
