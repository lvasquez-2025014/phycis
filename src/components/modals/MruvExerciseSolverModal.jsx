import React, { useState } from 'react';
import { 
  X, 
  Calculator, 
  BookOpen, 
  ArrowRight, 
  Layers, 
  HelpCircle,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { 
  HT02_MRUV_EXERCISES, 
  HT02_CONCEPTUAL_QUESTIONS,
  solveMruvEquations,
  buildMruvExerciseBoardElements
} from '../../services/mruvExerciseSolver';

export default function MruvExerciseSolverModal({
  isOpen,
  onClose,
  onMountExerciseOnBoard,
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('problems'); // 'problems', 'conceptual', 'calculator'
  const [selectedProblemId, setSelectedProblemId] = useState(HT02_MRUV_EXERCISES[0].id);

  // Custom Calculator Form State
  const [calcV0, setCalcV0] = useState('0');
  const [calcVf, setCalcVf] = useState('20');
  const [calcA, setCalcA] = useState('');
  const [calcT, setCalcT] = useState('4');
  const [calcD, setCalcD] = useState('');
  const [calcLabel, setCalcLabel] = useState('Móvil Experimental');

  // Currently selected exercise
  const currentProblem = HT02_MRUV_EXERCISES.find((e) => e.id === selectedProblemId) || HT02_MRUV_EXERCISES[0];

  // Live calculation for Custom Calculator
  const calcSolution = solveMruvEquations({
    v0: calcV0 !== '' ? parseFloat(calcV0) : null,
    vf: calcVf !== '' ? parseFloat(calcVf) : null,
    a: calcA !== '' ? parseFloat(calcA) : null,
    t: calcT !== '' ? parseFloat(calcT) : null,
    d: calcD !== '' ? parseFloat(calcD) : null,
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
      id: `custom_mruv_${Date.now()}`,
      title: `${calcLabel} (v₀ = ${calcSolution.v0} m/s, a = ${calcSolution.a.toFixed(2)} m/s²)`,
      statement: `Problema de MRUV personalizado:\nVelocidad inicial v₀ = ${calcSolution.v0} m/s\nVelocidad final v_f = ${calcSolution.vf.toFixed(2)} m/s\nAceleración a = ${calcSolution.a.toFixed(2)} m/s²\nTiempo t = ${calcSolution.t.toFixed(2)} s\nDistancia recorrida d = ${calcSolution.d.toFixed(2)} m`,
      category: 'custom_mruv',
      steps: calcSolution.steps.map((s) => ({
        title: s.title,
        body: `${s.formula}\n${s.calc}`,
      })),
      finalAnswer: `v_f = ${calcSolution.vf.toFixed(2)} m/s • a = ${calcSolution.a.toFixed(2)} m/s² • t = ${calcSolution.t.toFixed(2)} s • d = ${calcSolution.d.toFixed(2)} m`,
      cartPreset: {
        type: 'mruv_cart',
        label: calcLabel,
        velocity: calcSolution.v0,
        initialVelocity: calcSolution.v0,
        acceleration: calcSolution.a,
        color: '#0284c7',
        showVector: true,
        showAccelVector: true,
      },
    };

    if (onMountExerciseOnBoard) {
      onMountExerciseOnBoard(customEx);
      onClose();
    }
  };

  return (
    <div className="mruv-solver-modal-overlay">
      <div className="mruv-solver-modal-window">
        {/* Modal Header */}
        <div className="mruv-modal-header">
          <div className="mruv-modal-header-left">
            <span className="mruv-header-badge">UNIDAD 1 • FÍSICA II • QUINTO</span>
            <h2 className="mruv-modal-title">Solucionador Cinemático MRUV (HT02 Kinal)</h2>
          </div>
          <button className="mruv-modal-close-btn" onClick={onClose} title="Cerrar (Esc)">
            <X size={18} />
          </button>
        </div>

        {/* Segmented Control Navigation */}
        <div className="mruv-modal-nav">
          <button
            className={`mruv-nav-tab ${activeTab === 'problems' ? 'active' : ''}`}
            onClick={() => setActiveTab('problems')}
          >
            <BookOpen size={16} />
            <span>Problemas HT02 (10 Ejercicios)</span>
          </button>
          <button
            className={`mruv-nav-tab ${activeTab === 'conceptual' ? 'active' : ''}`}
            onClick={() => setActiveTab('conceptual')}
          >
            <HelpCircle size={16} />
            <span>Preguntas Conceptuales (Forma 1)</span>
          </button>
          <button
            className={`mruv-nav-tab ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculator')}
          >
            <Calculator size={16} />
            <span>Calculadora MRUV (Ecuaciones)</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="mruv-modal-body">
          {/* TAB 1: HT02 PROBLEMS */}
          {activeTab === 'problems' && (
            <div className="mruv-split-layout">
              {/* Left Column: Problem Selector List */}
              <div className="mruv-sidebar-list">
                <div className="mruv-sidebar-header">
                  <span>Seleccionar Ejercicio</span>
                  <span className="mruv-count-badge">10 Problemas</span>
                </div>
                <div className="mruv-problems-scroll">
                  {HT02_MRUV_EXERCISES.map((prob, idx) => (
                    <button
                      key={prob.id}
                      className={`mruv-problem-item ${selectedProblemId === prob.id ? 'active' : ''}`}
                      onClick={() => setSelectedProblemId(prob.id)}
                    >
                      <div className="problem-item-number">
                        <span>P{idx + 1}</span>
                      </div>
                      <div className="problem-item-info">
                        <span className="problem-item-title">{prob.title}</span>
                        <span className="problem-item-topic">{prob.topic}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Problem Detail & Resolution */}
              <div className="mruv-detail-panel">
                <div className="mruv-detail-header">
                  <div className="detail-header-meta">
                    <span className="detail-source-badge">{currentProblem.source}</span>
                    <h3 className="detail-title">{currentProblem.title}</h3>
                  </div>
                  <button
                    className="mruv-mount-action-btn"
                    onClick={handleMountProblem}
                    title="Insertar tarjeta de resolución y móvil en la pizarra"
                  >
                    <Layers size={16} />
                    <span>Montar en la Pizarra</span>
                  </button>
                </div>

                <div className="detail-scrollable-content">
                  {/* Statement Card */}
                  <div className="mruv-statement-card">
                    <span className="card-kicker">Enunciado del Problema</span>
                    <p className="statement-text">{currentProblem.statement}</p>
                  </div>

                  {/* Step-by-Step Procedure */}
                  <div className="mruv-steps-section">
                    <span className="steps-section-title">Procedimiento Matemático Paso a Paso:</span>
                    <div className="mruv-steps-grid">
                      {currentProblem.steps.map((step, sIdx) => (
                        <div key={sIdx} className="mruv-step-card">
                          <div className="step-card-header">
                            <span className="step-number">{sIdx + 1}</span>
                            <h4 className="step-title">{step.title}</h4>
                          </div>
                          <pre className="step-body-code">{step.body}</pre>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Final Answer Banner */}
                  <div className="mruv-answer-banner">
                    <div className="answer-icon">
                      <CheckCircle2 size={20} />
                    </div>
                    <div className="answer-content">
                      <span className="answer-kicker">Respuesta Final Comprobada:</span>
                      <p className="answer-text">{currentProblem.finalAnswer}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONCEPTUAL QUESTIONS */}
          {activeTab === 'conceptual' && (
            <div className="mruv-conceptual-container">
              <div className="conceptual-header-banner">
                <div className="conceptual-header-title">
                  <HelpCircle size={20} className="conceptual-icon" />
                  <div>
                    <h3>Preguntas Conceptuales — Forma 1 (Colegio Kinal)</h3>
                    <p>Fundamentos teóricos de cinemática lineal, análisis gráfico y signos de aceleración.</p>
                  </div>
                </div>
              </div>

              <div className="conceptual-cards-grid">
                {HT02_CONCEPTUAL_QUESTIONS.map((cq) => (
                  <div key={cq.id} className="conceptual-card">
                    <div className="conceptual-card-top">
                      <span className="conceptual-q-number">Pregunta {cq.number}</span>
                      <span className="conceptual-tag">{cq.tag}</span>
                    </div>
                    <h4 className="conceptual-question-text">{cq.question}</h4>
                    
                    <div className="conceptual-answer-box">
                      <span className="answer-badge">Respuesta:</span>
                      <p className="answer-text">{cq.answer}</p>
                    </div>

                    <div className="conceptual-justification">
                      <span className="just-badge">Justificación Física:</span>
                      <p className="just-text">{cq.explanation}</p>
                    </div>

                    {cq.keyFormula && (
                      <div className="conceptual-formula-pill">
                        <code>{cq.keyFormula}</code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="mruv-calculator-container">
              <div className="calculator-form-side">
                <div className="calc-instructions">
                  <h4>Calculadora de Ecuaciones MRUV</h4>
                  <p>Ingresa al menos 3 variables conocidas para calcular automáticamente las 2 restantes.</p>
                </div>

                <div className="calc-form-fields">
                  <div className="form-row">
                    <label>Nombre del Móvil:</label>
                    <input
                      type="text"
                      value={calcLabel}
                      onChange={(e) => setCalcLabel(e.target.value)}
                      placeholder="Móvil experimental"
                    />
                  </div>

                  <div className="form-grid-inputs">
                    <div className="calc-input-group">
                      <label>v₀ — Rapidez Inicial (m/s):</label>
                      <input
                        type="number"
                        step="any"
                        value={calcV0}
                        onChange={(e) => setCalcV0(e.target.value)}
                        placeholder="Ej. 0"
                      />
                    </div>

                    <div className="calc-input-group">
                      <label>v_f — Rapidez Final (m/s):</label>
                      <input
                        type="number"
                        step="any"
                        value={calcVf}
                        onChange={(e) => setCalcVf(e.target.value)}
                        placeholder="Ej. 20"
                      />
                    </div>

                    <div className="calc-input-group">
                      <label>a — Aceleración (m/s²):</label>
                      <input
                        type="number"
                        step="any"
                        value={calcA}
                        onChange={(e) => setCalcA(e.target.value)}
                        placeholder="Dejar vacío si es incógnita"
                      />
                    </div>

                    <div className="calc-input-group">
                      <label>t — Tiempo transcurrido (s):</label>
                      <input
                        type="number"
                        step="any"
                        value={calcT}
                        onChange={(e) => setCalcT(e.target.value)}
                        placeholder="Ej. 4"
                      />
                    </div>

                    <div className="calc-input-group full-span">
                      <label>d — Distancia recorrida (m):</label>
                      <input
                        type="number"
                        step="any"
                        value={calcD}
                        onChange={(e) => setCalcD(e.target.value)}
                        placeholder="Dejar vacío si es incógnita"
                      />
                    </div>
                  </div>
                </div>

                <div className="calc-equations-cheat">
                  <span className="cheat-title">Ecuaciones Fundamentales del MRUV:</span>
                  <ul>
                    <li><code>v_f = v_0 + a · t</code></li>
                    <li><code>d = v_0 · t + ½ · a · t²</code></li>
                    <li><code>v_f² = v_0² + 2 · a · d</code></li>
                    <li><code>d = ((v_0 + v_f) / 2) · t</code></li>
                  </ul>
                </div>
              </div>

              <div className="calculator-results-side">
                <div className="calc-results-header">
                  <h4>Resultados y Deducción Analítica</h4>
                  {calcSolution && (
                    <button
                      className="mruv-mount-action-btn"
                      onClick={handleMountCustomCalc}
                      title="Montar resolución personalizada en la pizarra"
                    >
                      <Layers size={16} />
                      <span>Montar en la Pizarra</span>
                    </button>
                  )}
                </div>

                {calcSolution ? (
                  <div className="calc-results-body">
                    <div className="calc-summary-pills">
                      <div className="summary-pill">
                        <span className="pill-var">v₀</span>
                        <span className="pill-val">{calcSolution.v0.toFixed(2)} m/s</span>
                      </div>
                      <div className="summary-pill">
                        <span className="pill-var">v_f</span>
                        <span className="pill-val">{calcSolution.vf.toFixed(2)} m/s</span>
                      </div>
                      <div className="summary-pill highlight">
                        <span className="pill-var">a</span>
                        <span className="pill-val">{calcSolution.a.toFixed(3)} m/s²</span>
                      </div>
                      <div className="summary-pill">
                        <span className="pill-var">t</span>
                        <span className="pill-val">{calcSolution.t.toFixed(2)} s</span>
                      </div>
                      <div className="summary-pill highlight">
                        <span className="pill-var">d</span>
                        <span className="pill-val">{calcSolution.d.toFixed(2)} m</span>
                      </div>
                    </div>

                    <div className="calc-deduction-steps">
                      <h5>Deducción de Fórmulas:</h5>
                      {calcSolution.steps.map((st, idx) => (
                        <div key={idx} className="calc-deduction-card">
                          <span className="deduction-title">{st.title}</span>
                          <code className="deduction-formula">{st.formula}</code>
                          <span className="deduction-calc">{st.calc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="calc-empty-state">
                    <TrendingUp size={36} className="empty-icon" />
                    <p>Completa al menos 3 variables en el formulario para calcular el movimiento.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .mruv-solver-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(4px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .mruv-solver-modal-window {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.12);
          width: 100%;
          max-width: 1100px;
          height: 88vh;
          max-height: 860px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid #cbd5e1;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Header */
        .mruv-modal-header {
          padding: 16px 24px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .mruv-modal-header-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .mruv-header-badge {
          font-size: 10px;
          font-weight: 700;
          color: #0284c7;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .mruv-modal-title {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .mruv-modal-close-btn {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }

        .mruv-modal-close-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        /* Nav Segmented Control */
        .mruv-modal-nav {
          display: flex;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          padding: 0 24px;
          gap: 8px;
        }

        .mruv-nav-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: none;
          border: none;
          border-bottom: 2.5px solid transparent;
          font-size: 13.5px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s;
        }

        .mruv-nav-tab:hover {
          color: #0f172a;
        }

        .mruv-nav-tab.active {
          color: #0284c7;
          border-bottom-color: #0284c7;
        }

        /* Modal Body */
        .mruv-modal-body {
          flex: 1;
          overflow: hidden;
          display: flex;
        }

        /* TAB 1: Problems Split Layout */
        .mruv-split-layout {
          display: flex;
          width: 100%;
          height: 100%;
        }

        .mruv-sidebar-list {
          width: 320px;
          border-right: 1px solid #e2e8f0;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .mruv-sidebar-header {
          padding: 12px 16px;
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #e2e8f0;
        }

        .mruv-count-badge {
          background: #e2e8f0;
          color: #334155;
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 10px;
        }

        .mruv-problems-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .mruv-problem-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 12px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s;
        }

        .mruv-problem-item:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .mruv-problem-item.active {
          background: #f0f9ff;
          border-color: #0284c7;
          box-shadow: 0 1px 3px rgba(2, 132, 199, 0.12);
        }

        .problem-item-number {
          background: #e0f2fe;
          color: #0369a1;
          font-weight: 700;
          font-size: 11px;
          padding: 4px 6px;
          border-radius: 6px;
          min-width: 28px;
          text-align: center;
        }

        .mruv-problem-item.active .problem-item-number {
          background: #0284c7;
          color: #ffffff;
        }

        .problem-item-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow: hidden;
        }

        .problem-item-title {
          font-size: 12.5px;
          font-weight: 600;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .problem-item-topic {
          font-size: 11px;
          color: #64748b;
        }

        /* Detail Panel */
        .mruv-detail-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #ffffff;
        }

        .mruv-detail-header {
          padding: 14px 24px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #ffffff;
        }

        .detail-source-badge {
          font-size: 10.5px;
          font-weight: 700;
          color: #0284c7;
          text-transform: uppercase;
        }

        .detail-title {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin: 2px 0 0 0;
        }

        .mruv-mount-action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #0284c7;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          box-shadow: 0 1px 3px rgba(2, 132, 199, 0.25);
        }

        .mruv-mount-action-btn:hover {
          background: #0369a1;
          transform: translateY(-1px);
        }

        .detail-scrollable-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .mruv-statement-card {
          background: #fffbeb;
          border: 1px solid #fef3c7;
          border-left: 4px solid #f59e0b;
          border-radius: 8px;
          padding: 14px 18px;
        }

        .card-kicker {
          font-size: 10.5px;
          font-weight: 700;
          color: #b45309;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 6px;
        }

        .statement-text {
          font-size: 13.5px;
          color: #78350f;
          line-height: 1.55;
          margin: 0;
          white-space: pre-line;
        }

        .steps-section-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #0f172a;
          display: block;
          margin-bottom: 12px;
        }

        .mruv-steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 12px;
        }

        .mruv-step-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .step-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .step-number {
          background: #0284c7;
          color: #ffffff;
          font-size: 10.5px;
          font-weight: 700;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .step-title {
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .step-body-code {
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
          font-size: 12px;
          color: #334155;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 10px;
          white-space: pre-wrap;
          word-break: break-word;
          margin: 0;
          line-height: 1.45;
        }

        .mruv-answer-banner {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 14px 18px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .answer-icon {
          color: #16a34a;
          margin-top: 2px;
        }

        .answer-kicker {
          font-size: 10.5px;
          font-weight: 700;
          color: #15803d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 4px;
        }

        .answer-text {
          font-size: 13.5px;
          font-weight: 600;
          color: #166534;
          margin: 0;
          line-height: 1.45;
        }

        /* TAB 2: Conceptual Questions */
        .mruv-conceptual-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .conceptual-header-banner {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px 20px;
        }

        .conceptual-header-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .conceptual-icon {
          color: #0284c7;
        }

        .conceptual-header-title h3 {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .conceptual-header-title p {
          font-size: 12.5px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .conceptual-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(460px, 1fr));
          gap: 16px;
        }

        .conceptual-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .conceptual-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .conceptual-q-number {
          font-size: 11px;
          font-weight: 700;
          color: #0284c7;
          background: #e0f2fe;
          padding: 2px 8px;
          border-radius: 6px;
        }

        .conceptual-tag {
          font-size: 10.5px;
          color: #64748b;
          font-weight: 600;
        }

        .conceptual-question-text {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          line-height: 1.4;
        }

        .conceptual-answer-box {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 6px;
          padding: 10px 12px;
        }

        .answer-badge {
          font-size: 10px;
          font-weight: 700;
          color: #16a34a;
          text-transform: uppercase;
          display: block;
          margin-bottom: 2px;
        }

        .conceptual-justification {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 10px 12px;
        }

        .just-badge {
          font-size: 10px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          display: block;
          margin-bottom: 2px;
        }

        .just-text {
          font-size: 12.5px;
          color: #334155;
          margin: 0;
          line-height: 1.5;
        }

        .conceptual-formula-pill {
          background: #f1f5f9;
          padding: 6px 10px;
          border-radius: 6px;
          align-self: flex-start;
        }

        .conceptual-formula-pill code {
          font-family: monospace;
          font-size: 12px;
          font-weight: 700;
          color: #0284c7;
        }

        /* TAB 3: Calculator */
        .mruv-calculator-container {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .calculator-form-side {
          width: 440px;
          border-right: 1px solid #e2e8f0;
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: #f8fafc;
        }

        .calc-instructions h4 {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px 0;
        }

        .calc-instructions p {
          font-size: 12.5px;
          color: #64748b;
          margin: 0;
          line-height: 1.45;
        }

        .calc-form-fields {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-row label {
          font-size: 12px;
          font-weight: 600;
          color: #334155;
        }

        .form-row input {
          padding: 8px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 13px;
        }

        .form-grid-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .calc-input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .calc-input-group.full-span {
          grid-column: span 2;
        }

        .calc-input-group label {
          font-size: 11.5px;
          font-weight: 600;
          color: #334155;
        }

        .calc-input-group input {
          padding: 8px 10px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 13px;
          font-family: monospace;
        }

        .calc-input-group input:focus {
          outline: none;
          border-color: #0284c7;
          box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.15);
        }

        .calc-equations-cheat {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 16px;
        }

        .cheat-title {
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          display: block;
          margin-bottom: 6px;
        }

        .calc-equations-cheat ul {
          margin: 0;
          padding-left: 18px;
          font-size: 11.5px;
          color: #64748b;
          line-height: 1.6;
        }

        .calculator-results-side {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: #ffffff;
        }

        .calc-results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid #e2e8f0;
        }

        .calc-results-header h4 {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .calc-results-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .calc-summary-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .summary-pill {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px 14px;
          display: flex;
          flex-direction: column;
          min-width: 90px;
        }

        .summary-pill.highlight {
          background: #f0f9ff;
          border-color: #7dd3fc;
        }

        .pill-var {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
        }

        .summary-pill.highlight .pill-var {
          color: #0284c7;
        }

        .pill-val {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          font-family: monospace;
        }

        .calc-deduction-steps {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .calc-deduction-steps h5 {
          font-size: 13.5px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .calc-deduction-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .deduction-title {
          font-size: 12.5px;
          font-weight: 700;
          color: #0f172a;
        }

        .deduction-formula {
          font-family: monospace;
          font-size: 12px;
          color: #0284c7;
        }

        .deduction-calc {
          font-family: monospace;
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
        }

        .calc-empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          text-align: center;
          gap: 12px;
        }

        .empty-icon {
          color: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
