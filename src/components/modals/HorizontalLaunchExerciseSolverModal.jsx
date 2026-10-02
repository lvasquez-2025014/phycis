import React, { useState } from 'react';
import { 
  X, 
  Calculator, 
  BookOpen, 
  ArrowRight, 
  Layers, 
  HelpCircle,
  Navigation,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  HT01_HORIZONTAL_EXERCISES, 
  HT01_CONCEPTUAL_QUESTIONS,
  solveCustomHorizontalLaunch,
  buildHorizontalLaunchExerciseBoardElements
} from '../../services/horizontalLaunchExerciseSolver';

export default function HorizontalLaunchExerciseSolverModal({
  isOpen,
  onClose,
  onMountExerciseOnBoard,
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('problems'); // 'problems', 'conceptual', 'calculator'
  const [selectedProblemId, setSelectedProblemId] = useState(HT01_HORIZONTAL_EXERCISES[0].id);

  // Conceptual Questions state (selected answer per question)
  const [conceptualAnswers, setConceptualAnswers] = useState({});

  // Custom Calculator Form State
  const [calcV0x, setCalcV0x] = useState('20.0');
  const [calcH, setCalcH] = useState('20.0');
  const [calcG, setCalcG] = useState('9.80');
  const [calcLabel, setCalcLabel] = useState('Lanzamiento Experimental');

  // Currently selected problem
  const currentProblem = HT01_HORIZONTAL_EXERCISES.find((e) => e.id === selectedProblemId) || HT01_HORIZONTAL_EXERCISES[0];

  // Live calculation for Custom Calculator
  const calcSolution = solveCustomHorizontalLaunch({
    v0x: calcV0x,
    h: calcH,
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
      id: `custom_hz_${Date.now()}`,
      title: `${calcLabel} (v₀x = ${calcSolution.v0x} m/s, h = ${calcSolution.h} m)`,
      statement: `Problema de Lanzamiento Horizontal personalizado:\nVelocidad horizontal inicial v₀x = ${calcSolution.v0x} m/s\nAltura de lanzamiento h = ${calcSolution.h} m\nAceleración de la gravedad g = ${calcSolution.g} m/s²\nTiempo de caída t_vuelo = ${calcSolution.tFlight} s\nAlcance horizontal máximo X_máx = ${calcSolution.rangeMax} m\nVelocidad de impacto v = ${calcSolution.vImpact} m/s con ángulo θ = ${calcSolution.angleDeg}°`,
      category: 'custom_horizontal',
      steps: calcSolution.steps,
      finalAnswer: `t_vuelo = ${calcSolution.tFlight} s • X_máx = ${calcSolution.rangeMax} m • v_impacto = ${calcSolution.vImpact} m/s (θ = ${calcSolution.angleDeg}°)`,
      assemblyConfig: {
        cliffHeightMeters: calcSolution.h,
        v0x: calcSolution.v0x,
        targetRangeMeters: calcSolution.rangeMax,
        color: '#06b6d4',
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
    <div className="hz-solver-modal-overlay">
      <div className="hz-solver-modal-window">
        {/* Modal Header */}
        <div className="hz-modal-header">
          <div className="hz-modal-header-left">
            <span className="hz-header-badge">UNIDAD 2 • FÍSICA II • QUINTO BACHILLERATO</span>
            <h2 className="hz-modal-title">Solucionador de Lanzamiento Horizontal (HT01 Colegio Kinal)</h2>
          </div>
          <button className="hz-modal-close-btn" onClick={onClose} title="Cerrar (Esc)">
            <X size={18} />
          </button>
        </div>

        {/* Segmented Control Navigation */}
        <div className="hz-modal-nav">
          <button
            className={`hz-nav-tab ${activeTab === 'problems' ? 'active' : ''}`}
            onClick={() => setActiveTab('problems')}
          >
            <BookOpen size={16} />
            <span>Problemas HT01 (10 Ejercicios)</span>
          </button>
          <button
            className={`hz-nav-tab ${activeTab === 'conceptual' ? 'active' : ''}`}
            onClick={() => setActiveTab('conceptual')}
          >
            <HelpCircle size={16} />
            <span>Preguntas Conceptuales (Forma 1)</span>
          </button>
          <button
            className={`hz-nav-tab ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculator')}
          >
            <Calculator size={16} />
            <span>Calculadora 2D Horizontal</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="hz-modal-body">
          {/* TAB 1: HT01 PROBLEMS */}
          {activeTab === 'problems' && (
            <div className="hz-split-layout">
              {/* Left Column: Problem Selector List */}
              <div className="hz-sidebar-list">
                <div className="hz-sidebar-header">
                  <span>Seleccionar Problema</span>
                  <span className="hz-count-badge">10 Problemas</span>
                </div>
                <div className="hz-problems-scroll">
                  {HT01_HORIZONTAL_EXERCISES.map((prob) => (
                    <button
                      key={prob.id}
                      className={`hz-problem-item ${selectedProblemId === prob.id ? 'active' : ''}`}
                      onClick={() => setSelectedProblemId(prob.id)}
                    >
                      <div className="hz-problem-item-num">P{prob.number}</div>
                      <div className="hz-problem-item-info">
                        <span className="hz-problem-item-title">{prob.title}</span>
                        <span className="hz-problem-item-topic">{prob.topic}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Problem Detail & Steps */}
              <div className="hz-detail-view">
                <div className="hz-detail-header">
                  <div className="hz-detail-badge-row">
                    <span className="hz-badge-primary">Problema #{currentProblem.number}</span>
                    <span className="hz-badge-secondary">{currentProblem.source}</span>
                  </div>
                  <h3 className="hz-detail-title">{currentProblem.title}</h3>
                </div>

                {/* Statement Card */}
                <div className="hz-statement-box">
                  <h4 className="hz-box-subtitle">Enunciado Oficial:</h4>
                  <p className="hz-statement-text">{currentProblem.statement}</p>
                </div>

                {/* Mathematical Steps */}
                <div className="hz-steps-container">
                  <h4 className="hz-box-subtitle">Resolución Analítica Paso a Paso:</h4>
                  <div className="hz-steps-grid">
                    {currentProblem.steps.map((st, sIdx) => (
                      <div key={sIdx} className="hz-step-card">
                        <div className="hz-step-title">{st.title}</div>
                        <pre className="hz-step-body">{st.body}</pre>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final Answers Card */}
                <div className="hz-answer-box">
                  <h4 className="hz-box-subtitle">Respuestas Solicitadas:</h4>
                  <pre className="hz-answer-text">{currentProblem.finalAnswer}</pre>
                </div>

                {/* Whiteboard Action Button */}
                <div className="hz-actions-row">
                  <button className="hz-btn-mount" onClick={handleMountProblem}>
                    <Layers size={16} />
                    <span>Montar Problema #{currentProblem.number} en la Pizarra</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONCEPTUAL QUESTIONS (FORMA 1) */}
          {activeTab === 'conceptual' && (
            <div className="hz-conceptual-container">
              <div className="hz-conceptual-banner">
                <div className="hz-conceptual-banner-text">
                  <h3>Forma 1: Preguntas Conceptuales HT01</h3>
                  <p>
                    Selecciona tu respuesta para cada pregunta. El sistema verificará tu elección y te presentará
                    la justificación física basada en las leyes de Newton y el Principio de Independencia de Galileo.
                  </p>
                </div>
              </div>

              <div className="hz-questions-list">
                {HT01_CONCEPTUAL_QUESTIONS.map((q) => {
                  const selectedOpt = conceptualAnswers[q.id];
                  const isAnswered = selectedOpt !== undefined;
                  const isCorrect = selectedOpt === q.correctOptionId;

                  return (
                    <div key={q.id} className="hz-question-card">
                      <div className="hz-question-header">
                        <span className="hz-question-num">Pregunta #{q.number}</span>
                        <span className="hz-question-title">{q.title}</span>
                      </div>

                      <p className="hz-question-statement">{q.statement}</p>

                      <div className="hz-options-grid">
                        {q.options.map((opt) => {
                          const isThisSelected = selectedOpt === opt.id;
                          const isThisCorrect = opt.id === q.correctOptionId;
                          let optionClass = 'hz-option-btn';

                          if (isAnswered) {
                            if (isThisCorrect) optionClass += ' correct';
                            else if (isThisSelected && !isThisCorrect) optionClass += ' incorrect';
                          }

                          return (
                            <button
                              key={opt.id}
                              className={optionClass}
                              onClick={() => handleSelectConceptualOption(q.id, opt.id)}
                            >
                              <span className="hz-option-letter">{opt.id.toUpperCase()})</span>
                              <span className="hz-option-text">{opt.text}</span>
                              {isAnswered && isThisCorrect && (
                                <CheckCircle2 size={16} className="hz-opt-icon-correct" />
                              )}
                              {isAnswered && isThisSelected && !isThisCorrect && (
                                <AlertCircle size={16} className="hz-opt-icon-incorrect" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation box revealed after answering */}
                      {isAnswered && (
                        <div className={`hz-explanation-box ${isCorrect ? 'box-correct' : 'box-incorrect'}`}>
                          <div className="hz-exp-header">
                            {isCorrect ? (
                              <>
                                <CheckCircle2 size={16} className="hz-exp-icon correct" />
                                <strong>¡Correcto!</strong>
                              </>
                            ) : (
                              <>
                                <AlertCircle size={16} className="hz-exp-icon incorrect" />
                                <strong>Respuesta incorrecta. La opción correcta es la ({q.correctOptionId.toUpperCase()}).</strong>
                              </>
                            )}
                          </div>
                          <p className="hz-exp-text">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM HORIZONTAL LAUNCH CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="hz-calc-container">
              <div className="hz-calc-grid">
                {/* Inputs Column */}
                <div className="hz-calc-card">
                  <h3 className="hz-calc-card-title">Parámetros del Lanzamiento 2D</h3>

                  <div className="hz-calc-field">
                    <label>Nombre / Etiqueta del Móvil:</label>
                    <input
                      type="text"
                      className="hz-calc-input"
                      value={calcLabel}
                      onChange={(e) => setCalcLabel(e.target.value)}
                      placeholder="Ej: Proyectil Cañón"
                    />
                  </div>

                  <div className="hz-calc-field">
                    <label>Velocidad Horizontal Inicial (v₀x en m/s):</label>
                    <div className="hz-calc-input-group">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        className="hz-calc-input"
                        value={calcV0x}
                        onChange={(e) => setCalcV0x(e.target.value)}
                        placeholder="20.0"
                      />
                      <span className="hz-calc-unit">m/s</span>
                    </div>
                    <div className="hz-calc-presets">
                      {[5, 10, 20, 40, 120].map((v) => (
                        <button
                          key={v}
                          type="button"
                          className="hz-calc-preset-btn"
                          onClick={() => setCalcV0x(v.toString())}
                        >
                          {v} m/s
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="hz-calc-field">
                    <label>Altura del Acantilado / Mesa (h en metros):</label>
                    <div className="hz-calc-input-group">
                      <input
                        type="number"
                        step="1"
                        min="0.5"
                        className="hz-calc-input"
                        value={calcH}
                        onChange={(e) => setCalcH(e.target.value)}
                        placeholder="20.0"
                      />
                      <span className="hz-calc-unit">m</span>
                    </div>
                    <div className="hz-calc-presets">
                      {[3, 10, 15, 20, 50, 150].map((hVal) => (
                        <button
                          key={hVal}
                          type="button"
                          className="hz-calc-preset-btn"
                          onClick={() => setCalcH(hVal.toString())}
                        >
                          {hVal} m
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="hz-calc-field">
                    <label>Aceleración Gravitatoria (g en m/s²):</label>
                    <div className="hz-calc-input-group">
                      <input
                        type="number"
                        step="0.01"
                        min="0.1"
                        className="hz-calc-input"
                        value={calcG}
                        onChange={(e) => setCalcG(e.target.value)}
                        placeholder="9.80"
                      />
                      <span className="hz-calc-unit">m/s²</span>
                    </div>
                    <div className="hz-calc-presets">
                      <button
                        type="button"
                        className="hz-calc-preset-btn"
                        onClick={() => setCalcG('9.80')}
                      >
                        9.80 (Tierra)
                      </button>
                      <button
                        type="button"
                        className="hz-calc-preset-btn"
                        onClick={() => setCalcG('1.60')}
                      >
                        1.60 (Luna)
                      </button>
                    </div>
                  </div>

                  <button className="hz-btn-mount full-width" onClick={handleMountCustomCalc}>
                    <Layers size={16} />
                    <span>Montar Simulación Personalizada en Pizarra</span>
                  </button>
                </div>

                {/* Live Analytical Outputs Column */}
                <div className="hz-calc-card">
                  <h3 className="hz-calc-card-title">Resultados Cinemáticos Instantáneos</h3>

                  <div className="hz-metric-badges-grid">
                    <div className="hz-metric-badge">
                      <span className="hz-metric-label">Tiempo de Caída:</span>
                      <span className="hz-metric-value">{calcSolution.tFlight} s</span>
                    </div>
                    <div className="hz-metric-badge">
                      <span className="hz-metric-label">Alcance Horizontal:</span>
                      <span className="hz-metric-value highlight">{calcSolution.rangeMax} m</span>
                    </div>
                    <div className="hz-metric-badge">
                      <span className="hz-metric-label">Velocidad en Y (Impacto):</span>
                      <span className="hz-metric-value rose">{calcSolution.vyFinal} m/s</span>
                    </div>
                    <div className="hz-metric-badge">
                      <span className="hz-metric-label">Velocidad Total Impacto:</span>
                      <span className="hz-metric-value emerald">{calcSolution.vImpact} m/s</span>
                    </div>
                    <div className="hz-metric-badge full-span">
                      <span className="hz-metric-label">Ángulo con la Horizontal:</span>
                      <span className="hz-metric-value">{calcSolution.angleDeg}° (hacia abajo)</span>
                    </div>
                  </div>

                  <div className="hz-calc-steps-box">
                    <h4 className="hz-box-subtitle">Ecuaciones Cinemáticas Aplicadas:</h4>
                    {calcSolution.steps.map((st, idx) => (
                      <div key={idx} className="hz-calc-step-row">
                        <strong>{st.title}</strong>
                        <pre>{st.body}</pre>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .hz-solver-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 99;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: hzFadeIn 0.16s ease-out;
        }

        @keyframes hzFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .hz-solver-modal-window {
          width: 1000px;
          max-width: 95vw;
          max-height: 90vh;
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 25px 60px rgba(15, 23, 42, 0.3), 0 4px 16px rgba(0, 0, 0, 0.1);
          border: 1px solid #cbd5e1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: hzSlideUp 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes hzSlideUp {
          from { opacity: 0; transform: scale(0.97) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .hz-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 22px;
          background: #0f172a;
          color: #ffffff;
        }

        .hz-header-badge {
          display: inline-block;
          font-size: 0.66rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #38bdf8;
          text-transform: uppercase;
          margin-bottom: 3px;
        }

        .hz-modal-title {
          margin: 0;
          font-size: 1.12rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .hz-modal-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.12s;
        }

        .hz-modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }

        .hz-modal-nav {
          display: flex;
          gap: 6px;
          padding: 8px 18px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .hz-nav-tab {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 14px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.12s;
        }

        .hz-nav-tab:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .hz-nav-tab.active {
          background: #0284c7;
          color: #ffffff;
          box-shadow: 0 2px 6px rgba(2, 132, 199, 0.25);
        }

        .hz-modal-body {
          flex: 1;
          overflow-y: auto;
          background: #ffffff;
        }

        .hz-split-layout {
          display: grid;
          grid-template-columns: 290px 1fr;
          height: 590px;
        }

        .hz-sidebar-list {
          border-right: 1px solid #e2e8f0;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
        }

        .hz-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          font-size: 0.76rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #475569;
          border-bottom: 1px solid #e2e8f0;
        }

        .hz-count-badge {
          background: #e0f2fe;
          color: #0284c7;
          padding: 2px 7px;
          border-radius: 12px;
          font-size: 0.7rem;
        }

        .hz-problems-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .hz-problem-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 8px;
          border: 1px solid transparent;
          background: transparent;
          text-align: left;
          cursor: pointer;
          transition: all 0.12s;
        }

        .hz-problem-item:hover {
          background: #f1f5f9;
        }

        .hz-problem-item.active {
          background: #ffffff;
          border-color: #0284c7;
          box-shadow: 0 2px 8px rgba(2, 132, 199, 0.12);
        }

        .hz-problem-item-num {
          width: 32px;
          height: 32px;
          border-radius: 7px;
          background: #f1f5f9;
          color: #475569;
          font-weight: 700;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .hz-problem-item.active .hz-problem-item-num {
          background: #0284c7;
          color: #ffffff;
        }

        .hz-problem-item-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .hz-problem-item-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .hz-problem-item-topic {
          font-size: 0.7rem;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .hz-detail-view {
          padding: 22px 26px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .hz-detail-badge-row {
          display: flex;
          gap: 8px;
          margin-bottom: 4px;
        }

        .hz-badge-primary {
          background: #e0f2fe;
          color: #0284c7;
          padding: 3px 8px;
          border-radius: 5px;
          font-size: 0.72rem;
          font-weight: 700;
        }

        .hz-badge-secondary {
          background: #f1f5f9;
          color: #475569;
          padding: 3px 8px;
          border-radius: 5px;
          font-size: 0.72rem;
          font-weight: 600;
        }

        .hz-detail-title {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
        }

        .hz-statement-box {
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 10px;
          padding: 14px 16px;
        }

        .hz-box-subtitle {
          margin: 0 0 8px 0;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #475569;
          letter-spacing: 0.03em;
        }

        .hz-statement-text {
          margin: 0;
          font-size: 0.88rem;
          line-height: 1.5;
          color: #78350f;
          white-space: pre-line;
        }

        .hz-steps-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .hz-step-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 9px;
          padding: 12px 14px;
        }

        .hz-step-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: #0369a1;
          margin-bottom: 6px;
        }

        .hz-step-body {
          margin: 0;
          font-family: 'Fira Code', monospace, sans-serif;
          font-size: 0.78rem;
          line-height: 1.5;
          color: #1e293b;
          white-space: pre-wrap;
          background: transparent;
        }

        .hz-answer-box {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          padding: 14px 16px;
        }

        .hz-answer-text {
          margin: 0;
          font-family: 'Fira Code', monospace, sans-serif;
          font-size: 0.86rem;
          font-weight: 700;
          color: #15803d;
          white-space: pre-wrap;
          line-height: 1.5;
        }

        .hz-actions-row {
          display: flex;
          justify-content: flex-end;
          padding-top: 8px;
        }

        .hz-btn-mount {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #0284c7;
          color: #ffffff;
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          font-size: 0.86rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.14s;
          box-shadow: 0 2px 8px rgba(2, 132, 199, 0.3);
        }

        .hz-btn-mount:hover {
          background: #0369a1;
        }

        .hz-btn-mount.full-width {
          width: 100%;
          justify-content: center;
          margin-top: 10px;
        }

        /* Conceptual Tab */
        .hz-conceptual-container {
          padding: 22px 26px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .hz-conceptual-banner {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          padding: 16px 20px;
        }

        .hz-conceptual-banner h3 {
          margin: 0 0 6px 0;
          font-size: 1rem;
          font-weight: 800;
          color: #15803d;
        }

        .hz-conceptual-banner p {
          margin: 0;
          font-size: 0.82rem;
          color: #166534;
          line-height: 1.4;
        }

        .hz-questions-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .hz-question-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 16px 18px;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
        }

        .hz-question-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .hz-question-num {
          background: #e0f2fe;
          color: #0284c7;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 5px;
        }

        .hz-question-title {
          font-size: 0.86rem;
          font-weight: 700;
          color: #0f172a;
        }

        .hz-question-statement {
          font-size: 0.86rem;
          color: #334155;
          margin: 0 0 14px 0;
          line-height: 1.45;
        }

        .hz-options-grid {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .hz-option-btn {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 9px 13px;
          border-radius: 7px;
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          text-align: left;
          cursor: pointer;
          font-size: 0.82rem;
          color: #1e293b;
          transition: all 0.12s;
        }

        .hz-option-btn:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }

        .hz-option-btn.correct {
          background: #f0fdf4;
          border-color: #22c55e;
          color: #15803d;
          font-weight: 600;
        }

        .hz-option-btn.incorrect {
          background: #fef2f2;
          border-color: #ef4444;
          color: #991b1b;
        }

        .hz-option-letter {
          font-weight: 800;
          min-width: 20px;
        }

        .hz-option-text {
          flex: 1;
        }

        .hz-opt-icon-correct {
          color: #22c55e;
          flex-shrink: 0;
        }

        .hz-opt-icon-incorrect {
          color: #ef4444;
          flex-shrink: 0;
        }

        .hz-explanation-box {
          margin-top: 12px;
          padding: 12px 14px;
          border-radius: 8px;
          font-size: 0.78rem;
          line-height: 1.45;
        }

        .hz-explanation-box.box-correct {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
        }

        .hz-explanation-box.box-incorrect {
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #92400e;
        }

        .hz-exp-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
        }

        .hz-exp-icon.correct {
          color: #16a34a;
        }

        .hz-exp-icon.incorrect {
          color: #d97706;
        }

        .hz-exp-text {
          margin: 0;
        }

        /* Calculator Tab */
        .hz-calc-container {
          padding: 22px 26px;
        }

        .hz-calc-grid {
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          gap: 22px;
        }

        .hz-calc-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .hz-calc-card-title {
          margin: 0 0 4px 0;
          font-size: 0.95rem;
          font-weight: 800;
          color: #0f172a;
        }

        .hz-calc-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .hz-calc-field label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #475569;
        }

        .hz-calc-input {
          padding: 8px 12px;
          border-radius: 7px;
          border: 1px solid #cbd5e1;
          font-size: 0.85rem;
          font-weight: 600;
          color: #0f172a;
          outline: none;
        }

        .hz-calc-input-group {
          display: flex;
          align-items: center;
        }

        .hz-calc-input-group .hz-calc-input {
          flex: 1;
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }

        .hz-calc-unit {
          padding: 8px 12px;
          background: #e2e8f0;
          border: 1px solid #cbd5e1;
          border-left: none;
          border-top-right-radius: 7px;
          border-bottom-right-radius: 7px;
          font-size: 0.76rem;
          font-weight: 700;
          color: #475569;
        }

        .hz-calc-presets {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 2px;
        }

        .hz-calc-preset-btn {
          padding: 3px 8px;
          border-radius: 5px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          font-size: 0.7rem;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
        }

        .hz-calc-preset-btn:hover {
          background: #f1f5f9;
          border-color: #0284c7;
          color: #0284c7;
        }

        .hz-metric-badges-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .hz-metric-badge {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .hz-metric-badge.full-span {
          grid-column: span 2;
        }

        .hz-metric-label {
          font-size: 0.68rem;
          font-weight: 600;
          color: #64748b;
        }

        .hz-metric-value {
          font-size: 1rem;
          font-weight: 800;
          color: #0f172a;
          font-variant-numeric: tabular-nums;
        }

        .hz-metric-value.highlight {
          color: #0284c7;
        }

        .hz-metric-value.emerald {
          color: #059669;
        }

        .hz-metric-value.rose {
          color: #e11d48;
        }

        .hz-calc-steps-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;
          max-height: 240px;
        }

        .hz-calc-step-row strong {
          display: block;
          font-size: 0.74rem;
          color: #0369a1;
          margin-bottom: 3px;
        }

        .hz-calc-step-row pre {
          margin: 0;
          font-family: 'Fira Code', monospace, sans-serif;
          font-size: 0.72rem;
          color: #334155;
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  );
}
