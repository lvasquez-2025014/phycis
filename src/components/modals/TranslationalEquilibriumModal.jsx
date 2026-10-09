import React, { useState } from 'react';
import { 
  X, 
  Scale, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Layers, 
  Sparkles, 
  BookOpen, 
  ChevronRight,
  ShieldCheck,
  Target,
  ArrowRight,
  Compass
} from 'lucide-react';
import { 
  EQUILIBRIO_THEORY_QUESTIONS, 
  EQUILIBRIO_EXERCISES 
} from '../../services/translationalEquilibriumSolver';

export default function TranslationalEquilibriumModal({
  isOpen,
  onClose,
  onMountExerciseOnBoard,
}) {
  const [activeTab, setActiveTab] = useState('exercises'); // 'exercises' | 'theory'
  const [selectedExerciseId, setSelectedExerciseId] = useState(EQUILIBRIO_EXERCISES[0].id);
  const [selectedBodyIdx, setSelectedBodyIdx] = useState(0);
  const [viewMode, setViewMode] = useState('apparatus'); // 'apparatus' | 'dcl'

  // Theory Questions Interactive State
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  if (!isOpen) return null;

  const selectedExercise =
    EQUILIBRIO_EXERCISES.find((e) => e.id === selectedExerciseId) ||
    EQUILIBRIO_EXERCISES[0];

  const currentBody = selectedExercise.bodies[selectedBodyIdx] || selectedExercise.bodies[0];

  const handleSelectOption = (questionId, optionIdx) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleSelectExercise = (id) => {
    setSelectedExerciseId(id);
    setSelectedBodyIdx(0);
  };

  const calculateScore = () => {
    let score = 0;
    EQUILIBRIO_THEORY_QUESTIONS.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) score++;
    });
    return score;
  };

  return (
    <div className="dcl-modal-backdrop" onClick={onClose}>
      <div className="dcl-modal-container miro-island" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 1100 }}>
        {/* Modal Header */}
        <div className="dcl-modal-header">
          <div className="dcl-header-title-group">
            <div className="dcl-header-icon-box" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
              <Scale size={20} className="dcl-header-icon" />
            </div>
            <div>
              <div className="dcl-header-badge" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #6ee7b7' }}>
                Colegio Kinal • Física II Quinto • Unidad 3 HT03
              </div>
              <h2 className="dcl-modal-title">
                Equilibrio Traslacional – Primera Ley de Newton (ΣF = 0)
              </h2>
            </div>
          </div>
          <button className="dcl-close-btn" onClick={onClose} title="Cerrar modal (Esc)">
            <X size={18} />
          </button>
        </div>

        {/* Modal Tabs Navigation */}
        <div className="dcl-modal-tabs">
          <button
            className={`dcl-tab-btn ${activeTab === 'exercises' ? 'active' : ''}`}
            onClick={() => setActiveTab('exercises')}
          >
            <Layers size={15} />
            <span>Forma 2: Problemas de Aplicación (8 Ejercicios Oficiales)</span>
            <span className="tab-pill-count">{EQUILIBRIO_EXERCISES.length}</span>
          </button>
          <button
            className={`dcl-tab-btn ${activeTab === 'theory' ? 'active' : ''}`}
            onClick={() => setActiveTab('theory')}
          >
            <BookOpen size={15} />
            <span>Forma 1: Preguntas Conceptuales (Evaluación y Justificación)</span>
            <span className="tab-pill-count">{EQUILIBRIO_THEORY_QUESTIONS.length}</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="dcl-modal-content">
          {activeTab === 'exercises' ? (
            <div className="dcl-exercises-layout">
              {/* Left Sidebar: Exercise List */}
              <div className="dcl-exercise-list">
                <div className="dcl-list-title">Ejercicios Oficiales HT03:</div>
                {EQUILIBRIO_EXERCISES.map((ex) => {
                  const isSelected = ex.id === selectedExerciseId;
                  return (
                    <button
                      key={ex.id}
                      className={`dcl-exercise-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectExercise(ex.id)}
                    >
                      <div className="dcl-item-num-badge">#{ex.number}</div>
                      <div className="dcl-item-info">
                        <div className="dcl-item-title">{ex.title.split(':')[0]}</div>
                        <div className="dcl-item-subtitle">{ex.subtitle.split('•')[0]}</div>
                      </div>
                      <ChevronRight size={14} className="dcl-item-arrow" />
                    </button>
                  );
                })}
              </div>

              {/* Right Panel: Exercise Details, SVGs, Calculations and Mount Buttons */}
              <div className="dcl-exercise-detail">
                {/* Exercise Header */}
                <div className="dcl-detail-header">
                  <div className="dcl-detail-badges">
                    <span className="dcl-meta-tag primary">Problema #{selectedExercise.number}</span>
                    <span className="dcl-meta-tag warning">{selectedExercise.method === 'algebraic' ? 'Método Algebraico (1-4)' : 'Calculadora Científica (5-8)'}</span>
                    <span className="dcl-meta-tag success">{selectedExercise.unitSystem}</span>
                  </div>
                  <h3 className="dcl-detail-title">{selectedExercise.title}</h3>
                  <div className="dcl-detail-subtitle">{selectedExercise.subtitle}</div>

                  <div className="dcl-official-scenario" style={{ marginTop: 10 }}>
                    <strong>Enunciado oficial:</strong> {selectedExercise.statement}
                  </div>

                  {selectedExercise.criticalPoint && (
                    <div className="critical-point-banner" style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#065f46' }}>
                      <Target size={15} className="critical-point-icon" style={{ color: '#059669' }} />
                      <span><strong>Punto de Concurrencia de Fuerzas:</strong> {selectedExercise.criticalPoint}</span>
                    </div>
                  )}
                </div>

                {/* View Switcher: Apparatus with Vectors vs DCL */}
                <div className="apparatus-mode-switch-bar">
                  <button
                    type="button"
                    className={`apparatus-tab-btn ${viewMode === 'apparatus' ? 'active' : ''}`}
                    onClick={() => setViewMode('apparatus')}
                  >
                    <Layers size={14} />
                    <span>🏛️ Dibujo del Sistema Físico Completo</span>
                  </button>
                  <button
                    type="button"
                    className={`apparatus-tab-btn ${viewMode === 'dcl' ? 'active' : ''}`}
                    onClick={() => setViewMode('dcl')}
                  >
                    <Compass size={14} />
                    <span>📐 Diagrama de Cuerpo Libre (D.C.L.) de Fuerzas Concurrentes</span>
                  </button>
                </div>

                {/* Multi-body Selector if multiple bodies exist */}
                {selectedExercise.bodies.length > 1 && (
                  <div className="body-selector-tabs" style={{ marginBottom: 12 }}>
                    <span className="body-tabs-label">Seleccionar Nudo / Cuerpo:</span>
                    {selectedExercise.bodies.map((body, bIdx) => (
                      <button
                        key={body.bodyId}
                        className={`body-tab-chip ${bIdx === selectedBodyIdx ? 'active' : ''}`}
                        onClick={() => setSelectedBodyIdx(bIdx)}
                      >
                        <Layers size={13} />
                        <span>{body.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* APPARATUS / VISUAL PREVIEW BOX */}
                <div className="dcl-visual-preview-box apparatus-preview-box" style={{ background: '#f8fafc', padding: '16px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  {renderEquilibrioSvgPreview(selectedExercise, currentBody, viewMode)}

                  <div className="dcl-preview-legend" style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                    <span className="legend-item"><span className="legend-dot red" /> Peso (W = m·g)</span>
                    <span className="legend-item"><span className="legend-dot green" /> Tensiones de Cable (T, FT)</span>
                    <span className="legend-item"><span className="legend-dot blue" /> Reacciones / Fuerzas Horizontales</span>
                    <span className="legend-item"><span className="legend-dot" style={{ background: '#8b5cf6' }} /> Fuerzas Angulares / Normal (N)</span>
                  </div>
                </div>

                {/* Numerical Results Card */}
                {selectedExercise.results && (
                  <div className="numerical-results-card" style={{ marginTop: 16 }}>
                    <h5 className="results-card-title">Valores Numéricos y Solución Exacta de Equilibrio:</h5>
                    <div className="results-grid" style={{ gridTemplateColumns: `repeat(${selectedExercise.results.length}, 1fr)` }}>
                      {selectedExercise.results.map((r, rIdx) => (
                        <div key={rIdx} className="result-pill highlight" style={{ background: '#ecfdf5', borderColor: '#6ee7b7' }}>
                          <span className="result-k" style={{ color: '#065f46' }}>{r.label}:</span>
                          <span className="result-v green" style={{ color: '#047857', fontWeight: 800, fontSize: '1.05rem' }}>{r.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step-by-Step Equations & Resolution */}
                <div className="dcl-body-card" style={{ marginTop: 16 }}>
                  <div className="dcl-body-card-header">
                    <div>
                      <h4 className="body-name-title" style={{ fontSize: '0.95rem' }}>Ecuaciones de Equilibrio (ΣFx = 0, ΣFy = 0) y Despejes</h4>
                      <span className="body-axes-meta">{currentBody.name}</span>
                    </div>
                  </div>

                  <div className="equations-block" style={{ margin: '10px 0' }}>
                    <div className="equations-title">Ecuaciones del Sistema en Equilibrio Estático:</div>
                    {currentBody.equations.map((eq, eqIdx) => (
                      <div key={eqIdx} className="eq-line" style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: 6, margin: '4px 0', fontFamily: 'monospace' }}>
                        <code>{eq}</code>
                      </div>
                    ))}
                  </div>

                  <div className="dcl-steps-list" style={{ marginTop: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#334155', marginBottom: 6 }}>Procedimiento Matemático Detallado:</div>
                    {currentBody.steps.map((st, sIdx) => (
                      <div key={sIdx} style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.5, margin: '4px 0' }}>
                        {st}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Whiteboard Mount Action Buttons */}
                {onMountExerciseOnBoard && (
                  <div className="dcl-action-footer" style={{ marginTop: 20 }}>
                    <button
                      className="dcl-mount-board-btn secondary"
                      onClick={() => {
                        onMountExerciseOnBoard(selectedExercise.number, { cleanPractice: true });
                        if (onClose) onClose();
                      }}
                      title="Cargar el dibujo del sistema físico limpio para que tú mismo coloques los vectores con las herramientas interactivas"
                    >
                      <Target size={16} />
                      <span>Cargar Sistema Limpio para Practicar (Sin Vectores)</span>
                    </button>
                    <button
                      className="dcl-mount-board-btn"
                      onClick={() => {
                        onMountExerciseOnBoard(selectedExercise.number, { cleanPractice: false });
                        if (onClose) onClose();
                      }}
                      title="Cargar el sistema en la pizarra con todas las fuerzas, ángulos y ecuaciones ya resueltas"
                      style={{ background: '#059669', borderColor: '#047857' }}
                    >
                      <Sparkles size={16} />
                      <span>Cargar con Solución de Equilibrio Resuelta</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Forma 1: Interactive Theory Questions */
            <div className="dcl-theory-layout">
              <div className="dcl-theory-intro">
                <div className="dcl-theory-intro-header">
                  <div className="dcl-theory-icon-circle">
                    <HelpCircle size={22} />
                  </div>
                  <div>
                    <h3 className="dcl-theory-title">Forma 1: Preguntas Conceptuales – Primera Ley de Newton</h3>
                    <p className="dcl-theory-desc">
                      Selecciona la opción correcta para cada una de las 5 preguntas oficiales de la Hoja de Trabajo HT03. 
                      Cada pregunta incluye su justificación teórica basada en la Primera Condición de Equilibrio traslacional (ΣF = 0, a = 0).
                    </p>
                  </div>
                </div>

                {showResults && (
                  <div className="theory-score-banner">
                    <div className="score-badge-circle">
                      <span className="score-num">{calculateScore()}</span>
                      <span className="score-max">/ {EQUILIBRIO_THEORY_QUESTIONS.length}</span>
                    </div>
                    <div className="score-feedback">
                      <div className="score-title">
                        {calculateScore() === 5 ? '¡Excelente! Puntuación Perfecta 🎉' : calculateScore() >= 3 ? '¡Buen trabajo! Aprobado 👍' : 'Repasa los conceptos fundamentales 💡'}
                      </div>
                      <div className="score-subtitle">
                        Has respondido correctamente {calculateScore()} de las {EQUILIBRIO_THEORY_QUESTIONS.length} preguntas conceptuales oficiales.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Questions List */}
              <div className="dcl-questions-container">
                {EQUILIBRIO_THEORY_QUESTIONS.map((q) => {
                  const selectedOpt = userAnswers[q.id];
                  const isAnswered = selectedOpt !== undefined;
                  const isCorrect = isAnswered && selectedOpt === q.correctIndex;

                  return (
                    <div key={q.id} className={`theory-question-card ${showResults ? (isCorrect ? 'correct' : 'incorrect') : ''}`}>
                      <div className="question-header">
                        <span className="question-badge">Pregunta {q.number}</span>
                        {showResults && isAnswered && (
                          isCorrect ? (
                            <span className="result-pill-chip success"><CheckCircle2 size={13} /> Correcto</span>
                          ) : (
                            <span className="result-pill-chip error"><XCircle size={13} /> Incorrecto</span>
                          )
                        )}
                      </div>

                      <h4 className="question-text">{q.question}</h4>

                      <div className="question-options">
                        {q.options.map((opt, optIdx) => {
                          const isOptionSelected = selectedOpt === optIdx;
                          let optionClass = 'option-choice';
                          if (isOptionSelected) optionClass += ' selected';
                          if (showResults) {
                            if (optIdx === q.correctIndex) optionClass += ' correct-answer';
                            else if (isOptionSelected) optionClass += ' wrong-answer';
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              className={optionClass}
                              onClick={() => handleSelectOption(q.id, optIdx)}
                            >
                              <div className="option-radio-dot">
                                {isOptionSelected && <div className="radio-inner-dot" />}
                              </div>
                              <span className="option-letter">{String.fromCharCode(97 + optIdx)})</span>
                              <span className="option-label">{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {showResults && (
                        <div className="theory-explanation-box" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                          <div className="explanation-title" style={{ color: '#166534' }}>
                            <ShieldCheck size={14} />
                            <span>Justificación Teórica Oficial (Kinal HT03):</span>
                          </div>
                          <p className="explanation-text" style={{ color: '#14532d' }}>{q.explanation}</p>
                          {q.formula && (
                            <div className="explanation-formula" style={{ background: '#dcfce7', color: '#166534' }}>
                              <code>{q.formula}</code>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quiz Submit / Reset Actions */}
              <div className="theory-actions-footer">
                {!showResults ? (
                  <button
                    className="theory-submit-btn"
                    onClick={() => setShowResults(true)}
                    disabled={Object.keys(userAnswers).length === 0}
                    style={{ background: '#059669' }}
                  >
                    <span>Verificar y Evaluar Respuestas</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    className="theory-reset-btn"
                    onClick={() => {
                      setShowResults(false);
                      setUserAnswers({});
                    }}
                  >
                    <span>Intentar de Nuevo</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * High-fidelity SVG Preview Generator for the 8 Exercises
 */
function renderEquilibrioSvgPreview(exercise, currentBody, viewMode) {
  const isDcl = viewMode === 'dcl';

  // Common SVG Markers
  const defs = (
    <defs>
      <marker id="eq-arr-red" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
      </marker>
      <marker id="eq-arr-blue" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" />
      </marker>
      <marker id="eq-arr-green" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
      </marker>
      <marker id="eq-arr-purple" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#8b5cf6" />
      </marker>
      <marker id="eq-arr-amber" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
      </marker>
      <linearGradient id="eqWallGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
      <linearGradient id="eqMetalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>
    </defs>
  );

  // If DCL mode is requested, render Cartesian concurrent force diagram for the selected body
  if (isDcl) {
    const cx = 340;
    const cy = 160;
    const axisLen = 120;
    return (
      <svg viewBox="0 0 680 320" style={{ width: '100%', height: 'auto', maxHeight: 320 }}>
        {defs}
        {/* Background Grid */}
        <line x1={cx - axisLen - 20} y1={cy} x2={cx + axisLen + 20} y2={cy} stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1={cx} y1={cy - axisLen - 20} x2={cx} y2={cy + axisLen + 20} stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />
        <text x={cx + axisLen + 25} y={cy + 4} fill="#64748b" fontSize="11" fontWeight="bold">+X</text>
        <text x={cx + 6} y={cy - axisLen - 15} fill="#64748b" fontSize="11" fontWeight="bold">+Y</text>

        {/* Central Ring / Knot */}
        <circle cx={cx} cy={cy} r="6" fill="#0f172a" stroke="#fff" strokeWidth="2" />
        <text x={cx - 16} y={cy - 12} fill="#0f172a" fontSize="11" fontWeight="bold">{currentBody.knots ? currentBody.knots[0] : 'O'}</text>

        {/* Render each force vector from the current body */}
        {currentBody.forces.map((f, i) => {
          const rad = (f.angleDeg * Math.PI) / 180;
          const len = 95;
          const tx = cx + len * Math.cos(rad);
          const ty = cy - len * Math.sin(rad);
          const markerId = f.color === '#ef4444' ? 'eq-arr-red' : f.color === '#3b82f6' ? 'eq-arr-blue' : f.color === '#10b981' ? 'eq-arr-green' : f.color === '#8b5cf6' ? 'eq-arr-purple' : 'eq-arr-amber';

          return (
            <g key={i}>
              <line x1={cx} y1={cy} x2={tx} y2={ty} stroke={f.color} strokeWidth="3" markerEnd={`url(#${markerId})`} />
              <text
                x={tx + 12 * Math.cos(rad)}
                y={ty - 12 * Math.sin(rad) + 4}
                fill={f.color}
                fontSize="11"
                fontWeight="bold"
                textAnchor={Math.cos(rad) < -0.2 ? 'end' : Math.cos(rad) > 0.2 ? 'start' : 'middle'}
              >
                {f.symbol} ({f.magnitude} {exercise.unitSystem.includes('Libras') ? 'lb' : 'N'})
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  // APPARATUS DRAWINGS FOR EACH EXERCISE
  switch (exercise.number) {
    case 1: {
      // Objeto de 600 N, pared a la izquierda con cable horizontal FT1, cable a 50° al techo FT2
      const kx = 360;
      const ky = 160;
      const wallX = 140;
      const ceilY = 60;
      const ceilX = kx + (ky - ceilY) / Math.tan((50 * Math.PI) / 180); // ~ 443

      return (
        <svg viewBox="0 0 680 320" style={{ width: '100%', height: 'auto', maxHeight: 320 }}>
          {defs}
          {/* Wall Left */}
          <rect x={wallX - 18} y="40" width="18" height="240" fill="url(#eqWallGrad)" />
          <line x1={wallX} y1="40" x2={wallX} y2="280" stroke="#0f172a" strokeWidth="2" />
          {[...Array(12)].map((_, i) => (
            <line key={i} x1={wallX - 18} y1={55 + i * 18} x2={wallX} y2={45 + i * 18} stroke="#94a3b8" strokeWidth="1.5" />
          ))}

          {/* Ceiling Top */}
          <rect x="260" y="42" width="280" height="18" fill="url(#eqWallGrad)" />
          <line x1="260" y1={ceilY} x2="540" y2={ceilY} stroke="#0f172a" strokeWidth="2" />
          {[...Array(14)].map((_, i) => (
            <line key={i} x1={275 + i * 18} y1="42" x2={265 + i * 18} y2={ceilY} stroke="#94a3b8" strokeWidth="1.5" />
          ))}

          {/* Ceiling bracket */}
          <circle cx={ceilX} cy={ceilY} r="6" fill="#475569" stroke="#0f172a" strokeWidth="1.5" />
          {/* Wall bracket */}
          <circle cx={wallX} cy={ky} r="6" fill="#475569" stroke="#0f172a" strokeWidth="1.5" />

          {/* Cable FT1 (Horizontal) */}
          <line x1={wallX} y1={ky} x2={kx} y2={ky} stroke="#3b82f6" strokeWidth="2.5" />
          <text x={(wallX + kx) / 2} y={ky - 10} fill="#2563eb" fontSize="12" fontWeight="bold" textAnchor="middle">FT1 = 503.46 N</text>

          {/* Cable FT2 (Angled 50°) */}
          <line x1={kx} y1={ky} x2={ceilX} y2={ceilY} stroke="#10b981" strokeWidth="2.5" />
          <text x={(kx + ceilX) / 2 + 18} y={(ky + ceilY) / 2 - 8} fill="#059669" fontSize="12" fontWeight="bold">FT2 = 783.24 N</text>

          {/* Angle 50° arc at ceiling */}
          <path d={`M ${ceilX - 35} ${ceilY} A 35 35 0 0 0 ${ceilX - 22} ${ceilY + 26}`} fill="none" stroke="#ea580c" strokeWidth="1.5" />
          <text x={ceilX - 45} y={ceilY + 22} fill="#ea580c" fontSize="11" fontWeight="bold">50.0°</text>

          {/* Central Knot */}
          <circle cx={kx} cy={ky} r="7" fill="#0f172a" stroke="#fff" strokeWidth="2" />

          {/* Vertical hanging cable */}
          <line x1={kx} y1={ky} x2={kx} y2={ky + 65} stroke="#64748b" strokeWidth="2.5" />

          {/* Suspended Weight (600 N) */}
          <rect x={kx - 32} y={ky + 65} width="64" height="55" rx="6" fill="url(#eqMetalGrad)" stroke="#334155" strokeWidth="2" />
          <text x={kx} y={ky + 96} fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">600 N</text>
          <text x={kx} y={ky + 110} fill="#f1f5f9" fontSize="9" textAnchor="middle">W (Objeto)</text>

          {/* Dynamic Force Overlay Arrows on knot */}
          <line x1={kx} y1={ky} x2={kx - 70} y2={ky} stroke="#3b82f6" strokeWidth="3" markerEnd="url(#eq-arr-blue)" />
          <line x1={kx} y1={ky} x2={kx + 45} y2={ky - 55} stroke="#10b981" strokeWidth="3" markerEnd="url(#eq-arr-green)" />
          <line x1={kx} y1={ky} x2={kx} y2={ky + 60} stroke="#ef4444" strokeWidth="3" markerEnd="url(#eq-arr-red)" />
        </svg>
      );
    }

    case 2: {
      // 500 N central, two pulleys at 50° and 35° supporting FW2 and FW3
      const kx = 340;
      const ky = 180;
      const p1x = 180;
      const p1y = 90;
      const p2x = 500;
      const p2y = 110;

      return (
        <svg viewBox="0 0 680 330" style={{ width: '100%', height: 'auto', maxHeight: 330 }}>
          {defs}
          {/* Ceiling */}
          <line x1="80" y1="40" x2="600" y2="40" stroke="#0f172a" strokeWidth="3" />
          {[...Array(30)].map((_, i) => (
            <line key={i} x1={95 + i * 17} y1="30" x2={85 + i * 17} y2="40" stroke="#94a3b8" strokeWidth="1.5" />
          ))}

          {/* Pulley 1 Bracket and Wheel */}
          <line x1={p1x} y1="40" x2={p1x} y2={p1y} stroke="#64748b" strokeWidth="3" />
          <circle cx={p1x} cy={p1y} r="18" fill="#e2e8f0" stroke="#334155" strokeWidth="2.5" />
          <circle cx={p1x} cy={p1y} r="4" fill="#0f172a" />

          {/* Pulley 2 Bracket and Wheel */}
          <line x1={p2x} y1="40" x2={p2x} y2={p2y} stroke="#64748b" strokeWidth="3" />
          <circle cx={p2x} cy={p2y} r="18" fill="#e2e8f0" stroke="#334155" strokeWidth="2.5" />
          <circle cx={p2x} cy={p2y} r="4" fill="#0f172a" />

          {/* Rope 1: Hanging FW2 -> Pulley 1 -> Knot */}
          <line x1={p1x - 18} y1={p1y} x2={p1x - 18} y2="220" stroke="#3b82f6" strokeWidth="2.5" />
          <line x1={p1x + 10} y1={p1y + 12} x2={kx} y2={ky} stroke="#3b82f6" strokeWidth="2.5" />
          {/* Hanging FW2 */}
          <rect x={p1x - 38} y="220" width="40" height="42" rx="5" fill="url(#eqMetalGrad)" stroke="#334155" strokeWidth="2" />
          <text x={p1x - 18} y="246" fill="#fff" fontSize="10.5" fontWeight="bold" textAnchor="middle">FW2</text>
          <text x={p1x - 18} y="280" fill="#2563eb" fontSize="10" fontWeight="bold" textAnchor="middle">411.14 N</text>

          {/* Rope 2: Hanging FW3 -> Pulley 2 -> Knot */}
          <line x1={p2x + 18} y1={p2y} x2={p2x + 18} y2="220" stroke="#10b981" strokeWidth="2.5" />
          <line x1={p2x - 10} y1={p2y + 12} x2={kx} y2={ky} stroke="#10b981" strokeWidth="2.5" />
          {/* Hanging FW3 */}
          <rect x={p2x - 2} y="220" width="40" height="42" rx="5" fill="url(#eqMetalGrad)" stroke="#334155" strokeWidth="2" />
          <text x={p2x + 18} y="246" fill="#fff" fontSize="10.5" fontWeight="bold" textAnchor="middle">FW3</text>
          <text x={p2x + 18} y="280" fill="#059669" fontSize="10" fontWeight="bold" textAnchor="middle">322.62 N</text>

          {/* Central Knot */}
          <circle cx={kx} cy={ky} r="7" fill="#0f172a" stroke="#fff" strokeWidth="2" />

          {/* Angle indicators */}
          <line x1={kx - 50} y1={ky} x2={kx + 50} y2={ky} stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1.5" />
          <text x={kx - 55} y={ky - 12} fill="#ea580c" fontSize="11" fontWeight="bold">50.0°</text>
          <text x={kx + 38} y={ky - 12} fill="#ea580c" fontSize="11" fontWeight="bold">35.0°</text>

          {/* Hanging Central FW1 */}
          <line x1={kx} y1={ky} x2={kx} y2={ky + 45} stroke="#ef4444" strokeWidth="2.5" />
          <rect x={kx - 26} y={ky + 45} width="52" height="50" rx="6" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
          <text x={kx} y={ky + 72} fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">FW1</text>
          <text x={kx} y={ky + 86} fill="#fef2f2" fontSize="9.5" textAnchor="middle">500 N</text>
        </svg>
      );
    }

    case 3: {
      // Motor de 200 kg (1960 N) con cables AB (60°) y AC (45°)
      const kx = 340;
      const ky = 160;
      const beamY = 55;
      const bx = 200; // Point B on beam
      const cx = 450; // Point C on beam

      return (
        <svg viewBox="0 0 680 330" style={{ width: '100%', height: 'auto', maxHeight: 330 }}>
          {defs}
          {/* Support Beam */}
          <rect x="140" y="40" width="400" height="18" fill="url(#eqWallGrad)" rx="3" />
          <line x1="140" y1={beamY} x2="540" y2={beamY} stroke="#0f172a" strokeWidth="2" />

          {/* Mount B and C */}
          <circle cx={bx} cy={beamY} r="6" fill="#0f172a" />
          <text x={bx - 14} y={beamY - 6} fill="#0f172a" fontSize="12" fontWeight="bold">B</text>
          <circle cx={cx} cy={beamY} r="6" fill="#0f172a" />
          <text x={cx + 8} y={beamY - 6} fill="#0f172a" fontSize="12" fontWeight="bold">C</text>

          {/* Cable AB */}
          <line x1={bx} y1={beamY} x2={kx} y2={ky} stroke="#3b82f6" strokeWidth="2.8" />
          <text x={(bx + kx) / 2 - 25} y={(beamY + ky) / 2} fill="#2563eb" fontSize="11" fontWeight="bold">TAB = 1434.8 N</text>

          {/* Cable AC */}
          <line x1={cx} y1={beamY} x2={kx} y2={ky} stroke="#10b981" strokeWidth="2.8" />
          <text x={(cx + kx) / 2 + 10} y={(beamY + ky) / 2} fill="#059669" fontSize="11" fontWeight="bold">TAC = 1014.6 N</text>

          {/* Angles at beam */}
          <text x={bx + 18} y={beamY + 18} fill="#ea580c" fontSize="11" fontWeight="bold">60°</text>
          <text x={cx - 32} y={beamY + 18} fill="#ea580c" fontSize="11" fontWeight="bold">45°</text>

          {/* Knot A */}
          <circle cx={kx} cy={ky} r="7" fill="#0f172a" stroke="#fff" strokeWidth="2" />
          <text x={kx + 12} y={ky - 4} fill="#0f172a" fontSize="12" fontWeight="bold">A</text>

          {/* Engine Cable & Engine Body Drawing */}
          <line x1={kx} y1={ky} x2={kx} y2={ky + 35} stroke="#64748b" strokeWidth="3" />
          <g transform={`translate(${kx - 45}, ${ky + 35})`}>
            {/* Engine block representation */}
            <rect x="0" y="0" width="90" height="75" rx="10" fill="#334155" stroke="#1e293b" strokeWidth="2.5" />
            <rect x="12" y="10" width="66" height="20" rx="4" fill="#475569" />
            {/* Cylinders/belts icon */}
            <circle cx="28" cy="46" r="12" fill="#64748b" stroke="#94a3b8" strokeWidth="2" />
            <circle cx="62" cy="46" r="12" fill="#64748b" stroke="#94a3b8" strokeWidth="2" />
            <text x="45" y="24" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">MOTOR 200 kg</text>
            <text x="45" y="70" fill="#38bdf8" fontSize="8.5" fontWeight="bold" textAnchor="middle">W = 1960 N</text>
          </g>
        </svg>
      );
    }

    case 4: {
      // Objeto 200 N con triángulo 3-4-5 y cable a 30° vertical
      const kx = 340;
      const ky = 180;
      const bx = 220;
      const by = 80;
      const cx = 430;
      const cy = 80;

      return (
        <svg viewBox="0 0 680 320" style={{ width: '100%', height: 'auto', maxHeight: 320 }}>
          {defs}
          {/* Wall/Bracket mounts */}
          <circle cx={bx} cy={by} r="6" fill="#0f172a" />
          <text x={bx - 16} y={by} fill="#0f172a" fontSize="12" fontWeight="bold">B</text>
          <circle cx={cx} cy={cy} r="6" fill="#0f172a" />
          <text x={cx + 10} y={by} fill="#0f172a" fontSize="12" fontWeight="bold">C</text>

          {/* Cable BA with 3-4-5 slope triangle */}
          <line x1={bx} y1={by} x2={kx} y2={ky} stroke="#3b82f6" strokeWidth="2.8" />
          {/* Triangle 3-4-5 representation on cable BA */}
          <polygon points={`${bx + 40},${by + 50} ${bx + 65},${by + 50} ${bx + 65},${by + 20}`} fill="#e2e8f0" stroke="#334155" strokeWidth="1.5" />
          <text x={bx + 52} y={by + 60} fill="#334155" fontSize="9" fontWeight="bold">3</text>
          <text x={bx + 72} y={by + 36} fill="#334155" fontSize="9" fontWeight="bold">4</text>
          <text x={bx + 42} y={by + 30} fill="#2563eb" fontSize="9" fontWeight="bold">5</text>
          <text x={bx - 10} y={by + 70} fill="#2563eb" fontSize="11" fontWeight="bold">TBA = 108.74 N</text>

          {/* Cable CA with 30° vertical */}
          <line x1={cx} y1={cy} x2={kx} y2={ky} stroke="#10b981" strokeWidth="2.8" />
          <line x1={cx} y1={cy} x2={cx} y2={cy + 70} stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1.5" />
          <path d={`M ${cx} ${cy + 30} A 30 30 0 0 1 ${cx - 15} ${cy + 25}`} fill="none" stroke="#ea580c" strokeWidth="1.5" />
          <text x={cx - 30} y={cy + 42} fill="#ea580c" fontSize="11" fontWeight="bold">30°</text>
          <text x={cx + 15} y={cy + 60} fill="#059669" fontSize="11" fontWeight="bold">TCA = 130.49 N</text>

          {/* Knot A */}
          <circle cx={kx} cy={ky} r="7" fill="#0f172a" stroke="#fff" strokeWidth="2" />
          <text x={kx - 18} y={ky + 4} fill="#0f172a" fontSize="12" fontWeight="bold">A</text>

          {/* Hanging weight 200 N */}
          <line x1={kx} y1={ky} x2={kx} y2={ky + 45} stroke="#64748b" strokeWidth="2.5" />
          <rect x={kx - 26} y={ky + 45} width="52" height="46" rx="6" fill="url(#eqMetalGrad)" stroke="#334155" strokeWidth="2" />
          <text x={kx} y={ky + 72} fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">200 N</text>
        </svg>
      );
    }

    case 5: {
      // Caja 500 lb, cable AB a 30°, cable AC con pendiente 4-3-5
      const kx = 340;
      const ky = 160;
      const bx = 190;
      const by = 80;
      const cx = 480;
      const cy = 70;

      return (
        <svg viewBox="0 0 680 320" style={{ width: '100%', height: 'auto', maxHeight: 320 }}>
          {defs}
          {/* Wall/Beam */}
          <circle cx={bx} cy={by} r="6" fill="#0f172a" />
          <text x={bx - 16} y={by} fill="#0f172a" fontSize="12" fontWeight="bold">B</text>
          <circle cx={cx} cy={cy} r="6" fill="#0f172a" />
          <text x={cx + 10} y={cy} fill="#0f172a" fontSize="12" fontWeight="bold">C</text>

          {/* Cable AB at 30° */}
          <line x1={bx} y1={by} x2={kx} y2={ky} stroke="#3b82f6" strokeWidth="2.8" />
          <line x1={kx - 60} y1={ky} x2={kx} y2={ky} stroke="#94a3b8" strokeDasharray="3 3" />
          <text x={kx - 55} y={ky - 10} fill="#ea580c" fontSize="11" fontWeight="bold">30°</text>
          <text x={(bx + kx) / 2 - 40} y={(by + ky) / 2 - 10} fill="#2563eb" fontSize="11" fontWeight="bold">FAB = 434.96 lb</text>

          {/* Cable AC with 4-3-5 */}
          <line x1={cx} y1={cy} x2={kx} y2={ky} stroke="#10b981" strokeWidth="2.8" />
          <polygon points={`${kx + 50},${ky - 30} ${kx + 85},${ky - 30} ${kx + 85},${ky - 55}`} fill="#e2e8f0" stroke="#334155" strokeWidth="1.5" />
          <text x={kx + 65} y={ky - 20} fill="#334155" fontSize="9" fontWeight="bold">4</text>
          <text x={kx + 92} y={ky - 40} fill="#334155" fontSize="9" fontWeight="bold">3</text>
          <text x={kx + 60} y={ky - 48} fill="#059669" fontSize="9" fontWeight="bold">5</text>
          <text x={(cx + kx) / 2 + 15} y={(cy + ky) / 2 - 10} fill="#059669" fontSize="11" fontWeight="bold">FAC = 470.86 lb</text>

          {/* Knot A */}
          <circle cx={kx} cy={ky} r="7" fill="#0f172a" stroke="#fff" strokeWidth="2" />
          <text x={kx + 12} y={ky - 4} fill="#0f172a" fontSize="12" fontWeight="bold">A</text>

          {/* Cable AD and Wooden Crate (500 lb) */}
          <line x1={kx} y1={ky} x2={kx} y2={ky + 45} stroke="#64748b" strokeWidth="2.5" />
          <rect x={kx - 38} y={ky + 45} width="76" height="65" rx="6" fill="#d97706" stroke="#b45309" strokeWidth="2.5" />
          <line x1={kx - 38} y1={ky + 45} x2={kx + 38} y2={ky + 110} stroke="#b45309" strokeWidth="1.5" />
          <line x1={kx + 38} y1={ky + 45} x2={kx - 38} y2={ky + 110} stroke="#b45309" strokeWidth="1.5" />
          <rect x={kx - 26} y={ky + 68} width="52" height="24" rx="4" fill="rgba(255,255,255,0.9)" />
          <text x={kx} y={ky + 84} fill="#78350f" fontSize="11" fontWeight="bold" textAnchor="middle">500 lb</text>
        </svg>
      );
    }

    case 6: {
      // Cilindro C (40 kg) en polea sosteniendo cilindro A a 30°
      const ex = 320;
      const ey = 150;
      const dx = 160;
      const bx = 470;
      const by = 80;

      return (
        <svg viewBox="0 0 680 320" style={{ width: '100%', height: 'auto', maxHeight: 320 }}>
          {defs}
          {/* Wall Left D */}
          <rect x={dx - 18} y="50" width="18" height="180" fill="url(#eqWallGrad)" />
          <line x1={dx} y1="50" x2={dx} y2="230" stroke="#0f172a" strokeWidth="2" />
          <circle cx={dx} cy={ey} r="6" fill="#0f172a" />
          <text x={dx - 14} y={ey - 10} fill="#0f172a" fontSize="12" fontWeight="bold">D</text>

          {/* Horizontal Cable ED */}
          <line x1={dx} y1={ey} x2={ex} y2={ey} stroke="#3b82f6" strokeWidth="2.8" />
          <text x={(dx + ex) / 2} y={ey - 10} fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="middle">TED = 339.48 N</text>

          {/* Pulley B */}
          <circle cx={bx} cy={by} r="18" fill="#e2e8f0" stroke="#334155" strokeWidth="2.5" />
          <circle cx={bx} cy={by} r="4" fill="#0f172a" />
          <text x={bx + 24} y={by} fill="#0f172a" fontSize="12" fontWeight="bold">B</text>

          {/* Cable from Knot E to Pulley B at 30° */}
          <line x1={ex} y1={ey} x2={bx - 10} y2={by + 10} stroke="#10b981" strokeWidth="2.8" />
          <line x1={ex} y1={ey} x2={ex + 60} y2={ey} stroke="#94a3b8" strokeDasharray="3 3" />
          <text x={ex + 35} y={ey - 8} fill="#ea580c" fontSize="11" fontWeight="bold">30°</text>
          <text x={(ex + bx) / 2} y={(ey + by) / 2 - 12} fill="#059669" fontSize="11" fontWeight="bold">TEB = 392 N</text>

          {/* Cable down from Pulley B to Cylinder C */}
          <line x1={bx + 18} y1={by} x2={bx + 18} y2="180" stroke="#10b981" strokeWidth="2.8" />
          {/* Cylinder C (40 kg) */}
          <rect x={bx + 4} y="180" width="28" height="50" rx="6" fill="#64748b" stroke="#334155" strokeWidth="2" />
          <text x={bx + 18} y="210" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">40 kg</text>
          <text x={bx + 18} y="245" fill="#334155" fontSize="10.5" fontWeight="bold" textAnchor="middle">Cilindro C</text>

          {/* Knot E */}
          <circle cx={ex} cy={ey} r="7" fill="#0f172a" stroke="#fff" strokeWidth="2" />
          <text x={ex - 14} y={ey + 18} fill="#0f172a" fontSize="12" fontWeight="bold">E</text>

          {/* Cable down from E to Cylinder A */}
          <line x1={ex} y1={ey} x2={ex} y2={ey + 50} stroke="#ef4444" strokeWidth="2.8" />
          {/* Cylinder A (mA = 20 kg) */}
          <rect x={ex - 18} y={ey + 50} width="36" height="55" rx="6" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
          <text x={ex} y={ey + 80} fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">mA = 20 kg</text>
          <text x={ex} y={ey + 120} fill="#b91c1c" fontSize="10.5" fontWeight="bold" textAnchor="middle">Cilindro A</text>
        </svg>
      );
    }

    case 7: {
      // Dos semáforos (10 kg y 15 kg) entre postes, 15°, horizontal, 22°
      const ax = 120;
      const ay = 80;
      const bx = 260;
      const by = 130;
      const cx = 420;
      const cy = 130;
      const dx = 560;
      const dy = 80;

      return (
        <svg viewBox="0 0 680 320" style={{ width: '100%', height: 'auto', maxHeight: 320 }}>
          {defs}
          {/* Post A (Left) */}
          <rect x={ax - 8} y="60" width="16" height="220" fill="url(#eqWallGrad)" rx="2" />
          <text x={ax} y="50" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle">Poste A</text>

          {/* Post D (Right) */}
          <rect x={dx - 8} y="60" width="16" height="220" fill="url(#eqWallGrad)" rx="2" />
          <text x={dx} y="50" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle">Poste D</text>

          {/* Cable AB at 15° */}
          <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#3b82f6" strokeWidth="2.8" />
          <text x={(ax + bx) / 2 - 10} y={(ay + by) / 2 - 10} fill="#2563eb" fontSize="10" fontWeight="bold">TAB = 378.6 N (15°)</text>

          {/* Cable BC (Horizontal) */}
          <line x1={bx} y1={by} x2={cx} y2={cy} stroke="#10b981" strokeWidth="2.8" />
          <text x={(bx + cx) / 2} y={by - 10} fill="#059669" fontSize="10.5" fontWeight="bold" textAnchor="middle">TBC = 365.74 N</text>

          {/* Cable CD at 22° */}
          <line x1={cx} y1={cy} x2={dx} y2={dy} stroke="#8b5cf6" strokeWidth="2.8" />
          <text x={(cx + dx) / 2 + 10} y={(cy + dy) / 2 - 10} fill="#7c3aed" fontSize="10" fontWeight="bold">TCD = 392.4 N (22°)</text>

          {/* Knot B */}
          <circle cx={bx} cy={by} r="6" fill="#0f172a" />
          <text x={bx} y={by - 12} fill="#0f172a" fontSize="11" fontWeight="bold" textAnchor="middle">B</text>
          {/* Traffic Light 1 (10 kg) */}
          <line x1={bx} y1={by} x2={bx} y2={by + 30} stroke="#64748b" strokeWidth="2" />
          <rect x={bx - 14} y={by + 30} width="28" height="55" rx="4" fill="#1e293b" />
          <circle cx={bx} cy={by + 42} r="5" fill="#ef4444" />
          <circle cx={bx} cy={by + 56} r="5" fill="#f59e0b" />
          <circle cx={bx} cy={by + 70} r="5" fill="#10b981" />
          <text x={bx} y={by + 98} fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle">10 kg (98 N)</text>

          {/* Knot C */}
          <circle cx={cx} cy={cy} r="6" fill="#0f172a" />
          <text x={cx} y={cy - 12} fill="#0f172a" fontSize="11" fontWeight="bold" textAnchor="middle">C</text>
          {/* Traffic Light 2 (15 kg) */}
          <line x1={cx} y1={cy} x2={cx} y2={cy + 30} stroke="#64748b" strokeWidth="2" />
          <rect x={cx - 14} y={cy + 30} width="28" height="55" rx="4" fill="#1e293b" />
          <circle cx={cx} cy={cy + 42} r="5" fill="#ef4444" />
          <circle cx={cx} cy={cy + 56} r="5" fill="#f59e0b" />
          <circle cx={cx} cy={cy + 70} r="5" fill="#10b981" />
          <text x={cx} y={cy + 98} fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle">15 kg (147 N)</text>
        </svg>
      );
    }

    case 8: {
      // Dos cajas de 40 lb en planos inclinados de 70° y 20°
      const apexX = 350;
      const apexY = 100;
      const bPlaneAngle = (70 * Math.PI) / 180;
      const dPlaneAngle = (20 * Math.PI) / 180;

      return (
        <svg viewBox="0 0 680 330" style={{ width: '100%', height: 'auto', maxHeight: 330 }}>
          {defs}
          {/* Ground */}
          <line x1="100" y1="280" x2="600" y2="280" stroke="#0f172a" strokeWidth="2.5" />

          {/* Plane 1: Left 70° */}
          <polygon points={`${apexX},${apexY} ${apexX - 180 / Math.tan(bPlaneAngle)},280 ${apexX},280`} fill="#f1f5f9" stroke="#334155" strokeWidth="2" />
          <text x={apexX - 55} y="270" fill="#ea580c" fontSize="11" fontWeight="bold">70°</text>

          {/* Plane 2: Right 20° */}
          <polygon points={`${apexX},${apexY} ${apexX + 180 / Math.tan(dPlaneAngle)},280 ${apexX},280`} fill="#f8fafc" stroke="#334155" strokeWidth="2" />
          <text x={apexX + 220} y="270" fill="#ea580c" fontSize="11" fontWeight="bold">20°</text>

          {/* Wall mount at top of 70° plane */}
          <circle cx={apexX - 10} cy={apexY - 20} r="5" fill="#0f172a" />
          <text x={apexX - 25} y={apexY - 25} fill="#0f172a" fontSize="11" fontWeight="bold">A</text>

          {/* Cord A from top wall to Box B */}
          <line x1={apexX - 10} y1={apexY - 20} x2={apexX - 28} y2={apexY + 28} stroke="#10b981" strokeWidth="2.5" />
          <text x={apexX - 85} y={apexY + 15} fill="#059669" fontSize="10.5" fontWeight="bold">TA = 23.91 lb</text>

          {/* Box B on 70° plane */}
          <g transform={`translate(${apexX - 50}, ${apexY + 45}) rotate(-20)`}>
            <rect x="0" y="0" width="45" height="38" rx="4" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
            <text x="22" y="22" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">B</text>
            <text x="22" y="33" fill="#dbeafe" fontSize="8" textAnchor="middle">40 lb</text>
          </g>
          <text x={apexX - 95} y={apexY + 95} fill="#2563eb" fontSize="10.5" fontWeight="bold">NB = 13.68 lb</text>

          {/* Pulley / Crest Apex */}
          <circle cx={apexX} cy={apexY} r="6" fill="#e2e8f0" stroke="#334155" strokeWidth="2" />

          {/* Cord C connecting Box B and Box D */}
          <line x1={apexX - 25} y1={apexY + 75} x2={apexX} y2={apexY} stroke="#f59e0b" strokeWidth="2" />
          <line x1={apexX} y1={apexY} x2={apexX + 115} y2={apexY + 42} stroke="#f59e0b" strokeWidth="2" />
          <text x={apexX + 25} y={apexY - 8} fill="#d97706" fontSize="10.5" fontWeight="bold">TC = 13.68 lb</text>

          {/* Box D on 20° plane */}
          <g transform={`translate(${apexX + 115}, ${apexY + 42}) rotate(20)`}>
            <rect x="0" y="0" width="45" height="38" rx="4" fill="#64748b" stroke="#334155" strokeWidth="2" />
            <text x="22" y="22" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">D</text>
            <text x="22" y="33" fill="#f1f5f9" fontSize="8" textAnchor="middle">40 lb</text>
          </g>
        </svg>
      );
    }

    default:
      return null;
  }
}
