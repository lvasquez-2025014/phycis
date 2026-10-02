import React, { useState } from 'react';
import { 
  X, 
  Target, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Calculator, 
  Layers, 
  TrendingUp, 
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { 
  PROJECTILE_MOTION_THEORY_QUESTIONS, 
  PROJECTILE_MOTION_EXERCISES, 
  solveCustomProjectileMotion 
} from '../../services/projectileMotionExerciseSolver';

export default function ProjectileMotionExerciseSolverModal({
  isOpen,
  onClose,
  onMountExerciseOnBoard,
}) {
  const [activeTab, setActiveTab] = useState('exercises'); // 'exercises' | 'theory' | 'calculator'
  const [selectedExerciseId, setSelectedExerciseId] = useState(PROJECTILE_MOTION_EXERCISES[0].id);

  // Theory Questions Interactive State
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  // Custom 2D Calculator State
  const [calcV0, setCalcV0] = useState(20.0);
  const [calcTheta, setCalcTheta] = useState(37.0);
  const [calcHeight, setCalcHeight] = useState(0.0);
  const [calcGravity, setCalcGravity] = useState(9.80);

  if (!isOpen) return null;

  const selectedExercise =
    PROJECTILE_MOTION_EXERCISES.find((e) => e.id === selectedExerciseId) ||
    PROJECTILE_MOTION_EXERCISES[0];

  const handleSelectOption = (questionId, optionIdx) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const calculatedResult = solveCustomProjectileMotion(
    parseFloat(calcV0) || 0,
    parseFloat(calcTheta) || 0,
    parseFloat(calcHeight) || 0,
    parseFloat(calcGravity) || 9.80
  );

  const handleMountCustomExercise = () => {
    if (!onMountExerciseOnBoard) return;
    const customExercise = {
      id: `custom_pm_${Date.now()}`,
      title: `Lanzamiento v₀ = ${calcV0} m/s a ${calcTheta}° (h = ${calcHeight} m)`,
      topic: 'Lanzamiento de Proyectiles personalizado 2D',
      statement: `Se dispara un proyectil con rapidez inicial de ${calcV0} m/s formando un ángulo de ${calcTheta}° con la horizontal desde una altura de ${calcHeight} m (g = ${calcGravity} m/s²).`,
      params: { v0: calcV0, theta: calcTheta, h: calcHeight, g: calcGravity },
      steps: [
        {
          title: 'Componentes de velocidad inicial',
          body: `v₀x = ${calculatedResult.v0x.toFixed(2)} m/s\nv₀y = ${calculatedResult.v0y.toFixed(2)} m/s`,
        },
        {
          title: 'Tiempo hasta el ápice y altura máxima',
          body: `t_ápice = ${calculatedResult.timeToApex.toFixed(2)} s\nh_máx = ${calculatedResult.maxApexHeight.toFixed(2)} m`,
        },
        {
          title: 'Tiempo de vuelo y alcance horizontal',
          body: `t_vuelo = ${calculatedResult.flightTime.toFixed(2)} s\nAlcance X = ${calculatedResult.horizontalRange.toFixed(2)} m`,
        },
      ],
      finalAnswer: `Alcance horizontal: ${calculatedResult.horizontalRange.toFixed(2)} m | Altura máxima: ${calculatedResult.maxApexHeight.toFixed(2)} m | Velocidad de choque: ${calculatedResult.vImpact.toFixed(2)} m/s (${calculatedResult.angleImpactDeg.toFixed(1)}°)`,
      assemblyConfig: {
        v0: parseFloat(calcV0),
        thetaDeg: parseFloat(calcTheta),
        launchHeightMeters: parseFloat(calcHeight),
        targetRangeMeters: calculatedResult.horizontalRange,
      },
    };
    onMountExerciseOnBoard(customExercise);
    onClose();
  };

  return (
    <div className="pm-modal-backdrop" onClick={onClose}>
      <div className="pm-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="pm-modal-header">
          <div className="pm-modal-header-meta">
            <div className="pm-header-kicker">
              <Target size={15} className="pm-kicker-icon" />
              <span>COLEGIO KINAL • UNIDAD 2 • FÍSICA II - QUINTO</span>
            </div>
            <h2 className="pm-modal-title">HT02: Lanzamiento de Proyectil (Movimiento 2D)</h2>
          </div>
          <button className="pm-modal-close-btn" onClick={onClose} title="Cerrar">
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="pm-modal-tabs">
          <button
            className={`pm-tab-btn ${activeTab === 'exercises' ? 'active' : ''}`}
            onClick={() => setActiveTab('exercises')}
          >
            <Layers size={15} />
            <span>Problemas de Aplicación (10)</span>
          </button>
          <button
            className={`pm-tab-btn ${activeTab === 'theory' ? 'active' : ''}`}
            onClick={() => setActiveTab('theory')}
          >
            <BookOpen size={15} />
            <span>Preguntas Conceptuales (7)</span>
          </button>
          <button
            className={`pm-tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculator')}
          >
            <Calculator size={15} />
            <span>Calculadora Parabólica 2D</span>
          </button>
        </div>

        {/* TAB 1: Problemas de Aplicación */}
        {activeTab === 'exercises' && (
          <div className="pm-modal-body exercises-layout">
            {/* Left Sidebar: Problem Selector List */}
            <div className="pm-exercises-sidebar">
              <span className="pm-sidebar-title">GUÍA DE PROBLEMAS HT02</span>
              <div className="pm-exercises-list">
                {PROJECTILE_MOTION_EXERCISES.map((ex) => (
                  <div
                    key={ex.id}
                    className={`pm-exercise-item ${selectedExerciseId === ex.id ? 'active' : ''}`}
                    onClick={() => setSelectedExerciseId(ex.id)}
                  >
                    <span className="pm-item-number">P{ex.number}</span>
                    <div className="pm-item-info">
                      <span className="pm-item-title">{ex.title}</span>
                      <span className="pm-item-topic">{ex.topic}</span>
                    </div>
                    <ChevronRight size={13} className="pm-item-chevron" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel: Selected Exercise Solution */}
            <div className="pm-exercise-detail">
              <div className="pm-detail-header">
                <div className="pm-detail-badges">
                  <span className="pm-badge-number">Problema {selectedExercise.number}</span>
                  <span className="pm-badge-source">{selectedExercise.source}</span>
                </div>
                <h3 className="pm-detail-title">{selectedExercise.title}</h3>
                <p className="pm-detail-statement">{selectedExercise.statement}</p>
              </div>

              {/* Step by Step Breakdown */}
              <div className="pm-steps-container">
                <h4 className="pm-steps-heading">Desarrollo y Procedimiento Matemático:</h4>
                <div className="pm-steps-grid">
                  {selectedExercise.steps.map((st, sIdx) => (
                    <div key={sIdx} className="pm-step-card">
                      <span className="pm-step-title">{st.title}</span>
                      <pre className="pm-step-body">{st.body}</pre>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Answer Banner & Mount on Board */}
              <div className="pm-detail-footer">
                <div className="pm-final-answer-box">
                  <span className="pm-answer-label">RESPUESTA OFICIAL HT02:</span>
                  <pre className="pm-answer-text">{selectedExercise.finalAnswer}</pre>
                </div>
                <button
                  className="pm-mount-board-btn"
                  onClick={() => {
                    if (onMountExerciseOnBoard) {
                      onMountExerciseOnBoard(selectedExercise);
                      onClose();
                    }
                  }}
                  title="Estampar enunciado, notas y simulación completa en la pizarra digital"
                >
                  <Sparkles size={16} />
                  <span>Montar en la Pizarra</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Preguntas Conceptuales (Forma 1) */}
        {activeTab === 'theory' && (
          <div className="pm-modal-body theory-layout">
            <div className="pm-theory-header">
              <div>
                <h3 className="pm-theory-title">Forma 1 – Preguntas Conceptuales (HT02)</h3>
                <p className="pm-theory-sub">
                  Responde las 7 preguntas conceptuales oficiales para afianzar los principios del tiro parabólico.
                </p>
              </div>
              <button
                className="pm-toggle-results-btn"
                onClick={() => setShowResults((prev) => !prev)}
              >
                {showResults ? 'Ocultar Justificaciones' : 'Ver Respuestas y Justificaciones'}
              </button>
            </div>

            <div className="pm-theory-questions-list">
              {PROJECTILE_MOTION_THEORY_QUESTIONS.map((q) => {
                const selectedOpt = userAnswers[q.id];
                const isAnswered = selectedOpt !== undefined;
                const isCorrect = selectedOpt === q.correctIndex;

                return (
                  <div key={q.id} className="pm-question-card">
                    <div className="pm-question-header">
                      <span className="pm-question-number">Pregunta {q.number}</span>
                      {showResults && isAnswered && (
                        <span className={`pm-result-tag ${isCorrect ? 'correct' : 'incorrect'}`}>
                          {isCorrect ? (
                            <>
                              <CheckCircle2 size={13} /> Correcta
                            </>
                          ) : (
                            <>
                              <XCircle size={13} /> Incorrecta
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    <p className="pm-question-text">{q.question}</p>

                    <div className="pm-options-list">
                      {q.options.map((optText, optIdx) => {
                        const isChosen = selectedOpt === optIdx;
                        let optClass = 'pm-option-item';
                        if (isChosen) optClass += ' selected';
                        if (showResults) {
                          if (optIdx === q.correctIndex) optClass += ' is-correct';
                          else if (isChosen) optClass += ' is-wrong';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={optClass}
                            onClick={() => handleSelectOption(q.id, optIdx)}
                          >
                            <span className="pm-option-radio">
                              {String.fromCharCode(97 + optIdx)})
                            </span>
                            <span className="pm-option-label">{optText}</span>
                          </div>
                        );
                      })}
                    </div>

                    {showResults && (
                      <div className="pm-explanation-box">
                        <HelpCircle size={14} className="pm-explanation-icon" />
                        <span className="pm-explanation-text">
                          <strong>Justificación física:</strong> {q.explanation}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: Calculadora Parabólica 2D */}
        {activeTab === 'calculator' && (
          <div className="pm-modal-body calculator-layout">
            <div className="pm-calc-inputs-panel">
              <h4 className="pm-panel-heading">Parámetros del Lanzamiento:</h4>

              <div className="pm-calc-field">
                <label>Rapidez Inicial v₀ (m/s):</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  value={calcV0}
                  onChange={(e) => setCalcV0(e.target.value)}
                />
              </div>

              <div className="pm-calc-field">
                <label>Ángulo de Disparo θ (°):</label>
                <div className="pm-field-slider-group">
                  <input
                    type="range"
                    min="-85"
                    max="89"
                    step="1"
                    value={calcTheta}
                    onChange={(e) => setCalcTheta(e.target.value)}
                  />
                  <input
                    type="number"
                    step="1"
                    min="-85"
                    max="89"
                    value={calcTheta}
                    onChange={(e) => setCalcTheta(e.target.value)}
                    className="pm-slider-num"
                  />
                </div>
                <span className="pm-input-hint">
                  {parseFloat(calcTheta) > 0
                    ? 'Tiro hacia arriba (Elevación)'
                    : parseFloat(calcTheta) < 0
                    ? 'Tiro hacia abajo (Depresión)'
                    : 'Tiro horizontal rasante'}
                </span>
              </div>

              <div className="pm-calc-field">
                <label>Altura Inicial de Lanzamiento y₀ (m):</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={calcHeight}
                  onChange={(e) => setCalcHeight(e.target.value)}
                />
              </div>

              <div className="pm-calc-field">
                <label>Aceleración Gravitacional g (m/s²):</label>
                <input
                  type="number"
                  step="0.01"
                  value={calcGravity}
                  onChange={(e) => setCalcGravity(e.target.value)}
                />
              </div>

              <button className="pm-mount-custom-btn" onClick={handleMountCustomExercise}>
                <Sparkles size={16} />
                <span>Montar Simulación en la Pizarra</span>
              </button>
            </div>

            {/* Live Calculated Cards */}
            <div className="pm-calc-results-panel">
              <h4 className="pm-panel-heading">Resultados Cinemáticos en Tiempo Real:</h4>

              <div className="pm-results-grid">
                <div className="pm-metric-card">
                  <span className="pm-metric-label">Componente Horizontal (v₀x)</span>
                  <span className="pm-metric-val">{calculatedResult.v0x.toFixed(2)} m/s</span>
                  <span className="pm-metric-sub">Velocidad constante (ax = 0)</span>
                </div>

                <div className="pm-metric-card">
                  <span className="pm-metric-label">Componente Vertical (v₀y)</span>
                  <span className="pm-metric-val">{calculatedResult.v0y.toFixed(2)} m/s</span>
                  <span className="pm-metric-sub">Velocidad vertical inicial</span>
                </div>

                <div className="pm-metric-card">
                  <span className="pm-metric-label">Altura Máxima (h_máx)</span>
                  <span className="pm-metric-val highlight">{calculatedResult.maxApexHeight.toFixed(2)} m</span>
                  <span className="pm-metric-sub">
                    En t = {calculatedResult.timeToApex.toFixed(2)} s (vy = 0)
                  </span>
                </div>

                <div className="pm-metric-card">
                  <span className="pm-metric-label">Tiempo Total en el Aire</span>
                  <span className="pm-metric-val">{calculatedResult.flightTime.toFixed(2)} s</span>
                  <span className="pm-metric-sub">Hasta tocar el suelo (y = 0)</span>
                </div>

                <div className="pm-metric-card">
                  <span className="pm-metric-label">Alcance Horizontal Total (X)</span>
                  <span className="pm-metric-val highlight-green">{calculatedResult.horizontalRange.toFixed(2)} m</span>
                  <span className="pm-metric-sub">Distancia al impacto</span>
                </div>

                <div className="pm-metric-card">
                  <span className="pm-metric-label">Velocidad de Choque</span>
                  <span className="pm-metric-val">{calculatedResult.vImpact.toFixed(2)} m/s</span>
                  <span className="pm-metric-sub">Ángulo: {calculatedResult.angleImpactDeg.toFixed(1)}°</span>
                </div>
              </div>

              {/* Parabolic Equations Reference Card */}
              <div className="pm-formulas-card">
                <span className="pm-formulas-title">Ecuaciones de Movimiento Bidimensional:</span>
                <div className="pm-formulas-list">
                  <code>x(t) = v₀·cos(θ) · t</code>
                  <code>y(t) = y₀ + v₀·sin(θ)·t - ½·g·t²</code>
                  <code>vy(t) = v₀·sin(θ) - g·t</code>
                  <code>v(t) = √(vx² + vy²)</code>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .pm-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
          animation: pmFadeIn 0.15s ease-out;
        }

        @keyframes pmFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .pm-modal-container {
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.22);
          width: 95vw;
          max-width: 1040px;
          height: 86vh;
          max-height: 740px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .pm-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid #e2e8f0;
          background: #fafafa;
        }

        .pm-modal-header-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .pm-header-kicker {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #7c3aed;
        }

        .pm-modal-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .pm-modal-close-btn {
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.12s;
        }

        .pm-modal-close-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .pm-modal-tabs {
          display: flex;
          gap: 4px;
          padding: 0 24px;
          background: #fafafa;
          border-bottom: 1px solid #e2e8f0;
        }

        .pm-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 16px;
          border: none;
          background: transparent;
          font-size: 0.82rem;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.12s;
        }

        .pm-tab-btn:hover {
          color: #0f172a;
        }

        .pm-tab-btn.active {
          color: #7c3aed;
          border-bottom-color: #7c3aed;
          font-weight: 700;
        }

        .pm-modal-body {
          flex: 1;
          overflow-y: auto;
          display: flex;
        }

        /* TAB 1: EXERCISES */
        .exercises-layout {
          display: flex;
          overflow: hidden;
        }

        .pm-exercises-sidebar {
          width: 320px;
          border-right: 1px solid #e2e8f0;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .pm-sidebar-title {
          padding: 12px 16px 8px;
          font-size: 0.65rem;
          font-weight: 800;
          color: #94a3b8;
          letter-spacing: 0.08em;
        }

        .pm-exercises-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0 8px 12px;
        }

        .pm-exercise-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.12s;
          border: 1px solid transparent;
        }

        .pm-exercise-item:hover {
          background: #f1f5f9;
        }

        .pm-exercise-item.active {
          background: #ffffff;
          border-color: #cbd5e1;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }

        .pm-item-number {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          background: #ede9fe;
          color: #6d28d9;
          font-size: 0.75rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .pm-exercise-item.active .pm-item-number {
          background: #7c3aed;
          color: #ffffff;
        }

        .pm-item-info {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }

        .pm-item-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pm-item-topic {
          font-size: 0.68rem;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pm-item-chevron {
          color: #cbd5e1;
        }

        .pm-exercise-detail {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          padding: 20px 24px;
          background: #ffffff;
          gap: 16px;
        }

        .pm-detail-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .pm-detail-badges {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pm-badge-number {
          background: #ede9fe;
          color: #7c3aed;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 4px;
        }

        .pm-badge-source {
          background: #f1f5f9;
          color: #475569;
          font-size: 0.68rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 4px;
        }

        .pm-detail-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .pm-detail-statement {
          font-size: 0.86rem;
          line-height: 1.45;
          color: #334155;
          background: #f8fafc;
          border-left: 3px solid #7c3aed;
          padding: 10px 14px;
          border-radius: 0 6px 6px 0;
          margin: 4px 0 0;
        }

        .pm-steps-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .pm-steps-heading {
          font-size: 0.8rem;
          font-weight: 700;
          color: #475569;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .pm-steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 10px;
        }

        .pm-step-card {
          background: #faf5ff;
          border: 1px solid #f3e8ff;
          border-radius: 8px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .pm-step-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: #6b21a8;
        }

        .pm-step-body {
          font-family: inherit;
          font-size: 0.76rem;
          line-height: 1.45;
          color: #1e1b4b;
          margin: 0;
          white-space: pre-wrap;
        }

        .pm-detail-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding-top: 10px;
          border-top: 1px solid #f1f5f9;
        }

        .pm-final-answer-box {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 10px 14px;
          flex: 1;
        }

        .pm-answer-label {
          font-size: 0.68rem;
          font-weight: 800;
          color: #166534;
          display: block;
          margin-bottom: 2px;
        }

        .pm-answer-text {
          font-family: inherit;
          font-size: 0.82rem;
          font-weight: 700;
          color: #14532d;
          margin: 0;
          white-space: pre-wrap;
        }

        .pm-mount-board-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 18px;
          border-radius: 8px;
          background: #7c3aed;
          color: #ffffff;
          border: none;
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.12s;
          white-space: nowrap;
        }

        .pm-mount-board-btn:hover {
          background: #6d28d9;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }

        /* TAB 2: THEORY QUESTIONS */
        .theory-layout {
          flex-direction: column;
          padding: 20px 28px;
          gap: 16px;
          overflow-y: auto;
        }

        .pm-theory-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e2e8f0;
        }

        .pm-theory-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .pm-theory-sub {
          font-size: 0.78rem;
          color: #64748b;
          margin: 2px 0 0;
        }

        .pm-toggle-results-btn {
          padding: 7px 14px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #334155;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.12s;
        }

        .pm-toggle-results-btn:hover {
          background: #f8fafc;
          border-color: #94a3b8;
        }

        .pm-theory-questions-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .pm-question-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .pm-question-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pm-question-number {
          font-size: 0.72rem;
          font-weight: 800;
          color: #7c3aed;
          text-transform: uppercase;
        }

        .pm-result-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
        }

        .pm-result-tag.correct {
          background: #dcfce7;
          color: #166534;
        }

        .pm-result-tag.incorrect {
          background: #fee2e2;
          color: #b91c1c;
        }

        .pm-question-text {
          font-size: 0.86rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
          line-height: 1.4;
        }

        .pm-options-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 8px;
        }

        .pm-option-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          cursor: pointer;
          font-size: 0.78rem;
          color: #334155;
          transition: all 0.12s;
        }

        .pm-option-item:hover {
          background: #f1f5f9;
        }

        .pm-option-item.selected {
          border-color: #7c3aed;
          background: #ede9fe;
          color: #5b21b6;
          font-weight: 600;
        }

        .pm-option-item.is-correct {
          border-color: #86efac;
          background: #f0fdf4;
          color: #166534;
          font-weight: 700;
        }

        .pm-option-item.is-wrong {
          border-color: #fca5a5;
          background: #fef2f2;
          color: #991b1b;
        }

        .pm-option-radio {
          font-weight: 700;
        }

        .pm-explanation-box {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          background: #faf5ff;
          border: 1px solid #f3e8ff;
          border-radius: 6px;
          padding: 10px 12px;
          font-size: 0.76rem;
          color: #581c87;
          line-height: 1.4;
        }

        .pm-explanation-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        /* TAB 3: CALCULATOR */
        .calculator-layout {
          padding: 24px;
          gap: 24px;
        }

        .pm-calc-inputs-panel {
          width: 320px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          border-right: 1px solid #e2e8f0;
          padding-right: 24px;
        }

        .pm-panel-heading {
          font-size: 0.8rem;
          font-weight: 800;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0;
        }

        .pm-calc-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .pm-calc-field label {
          font-size: 0.76rem;
          font-weight: 700;
          color: #334155;
        }

        .pm-calc-field input[type="number"] {
          padding: 8px 10px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          font-size: 0.82rem;
          color: #0f172a;
          outline: none;
          transition: border-color 0.12s;
        }

        .pm-calc-field input[type="number"]:focus {
          border-color: #7c3aed;
        }

        .pm-field-slider-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pm-field-slider-group input[type="range"] {
          flex: 1;
        }

        .pm-slider-num {
          width: 65px;
          text-align: center;
        }

        .pm-input-hint {
          font-size: 0.68rem;
          color: #64748b;
          font-weight: 500;
        }

        .pm-mount-custom-btn {
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border-radius: 8px;
          background: #7c3aed;
          color: #ffffff;
          border: none;
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.12s;
        }

        .pm-mount-custom-btn:hover {
          background: #6d28d9;
        }

        .pm-calc-results-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
        }

        .pm-results-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .pm-metric-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .pm-metric-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: #64748b;
        }

        .pm-metric-val {
          font-size: 1.3rem;
          font-weight: 800;
          color: #0f172a;
        }

        .pm-metric-val.highlight {
          color: #7c3aed;
        }

        .pm-metric-val.highlight-green {
          color: #16a34a;
        }

        .pm-metric-sub {
          font-size: 0.68rem;
          color: #94a3b8;
        }

        .pm-formulas-card {
          background: #faf5ff;
          border: 1px solid #f3e8ff;
          border-radius: 8px;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .pm-formulas-title {
          font-size: 0.72rem;
          font-weight: 700;
          color: #7c3aed;
        }

        .pm-formulas-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .pm-formulas-list code {
          background: #ffffff;
          border: 1px solid #e9d5ff;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.76rem;
          color: #581c87;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
