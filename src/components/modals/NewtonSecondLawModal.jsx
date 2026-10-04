import React, { useState } from 'react';
import { 
  X, 
  Weight, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Layers, 
  Sparkles, 
  BookOpen, 
  Target, 
  ArrowRight,
  TrendingUp,
  Activity,
  Zap,
  Check
} from 'lucide-react';
import { 
  NEWTON_THEORY_QUESTIONS, 
  NEWTON_EXERCISES 
} from '../../services/newtonSecondLawSolver';

export default function NewtonSecondLawModal({
  isOpen,
  onClose,
  onMountExerciseOnBoard,
}) {
  const [activeTab, setActiveTab] = useState('exercises'); // 'exercises' | 'theory'
  const [selectedExerciseId, setSelectedExerciseId] = useState(NEWTON_EXERCISES[6].id); // Default to P7 (blocks connected)
  const [selectedBodyIdx, setSelectedBodyIdx] = useState(0);

  // Theory Questions Interactive State
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  if (!isOpen) return null;

  const selectedExercise =
    NEWTON_EXERCISES.find((e) => e.id === selectedExerciseId) ||
    NEWTON_EXERCISES[0];

  const currentBody = selectedExercise.bodies && selectedExercise.bodies[selectedBodyIdx] 
    ? selectedExercise.bodies[selectedBodyIdx] 
    : (selectedExercise.bodies ? selectedExercise.bodies[0] : null);

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
    NEWTON_THEORY_QUESTIONS.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) score++;
    });
    return score;
  };

  return (
    <div className="dcl-modal-backdrop" onClick={onClose}>
      <div className="dcl-modal-container miro-island" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 1120 }}>
        {/* Modal Header */}
        <div className="dcl-modal-header">
          <div className="dcl-header-title-group">
            <div className="dcl-header-icon-box" style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
              <Weight size={20} className="dcl-header-icon" />
            </div>
            <div>
              <div className="dcl-header-badge" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #93c5fd' }}>
                Colegio Kinal • Física II Quinto • Unidad 4 HT01
              </div>
              <h2 className="dcl-modal-title">
                Segunda Ley de Newton – Sin Fricción (ΣF = m · a)
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
            style={activeTab === 'exercises' ? { borderBottomColor: '#2563eb', color: '#1d4ed8' } : {}}
          >
            <Layers size={15} />
            <span>Forma 2: Problemas de Aplicación (12 Problemas Oficiales)</span>
            <span className="tab-pill-count" style={activeTab === 'exercises' ? { background: '#dbeafe', color: '#1e40af' } : {}}>
              {NEWTON_EXERCISES.length}
            </span>
          </button>
          <button
            className={`dcl-tab-btn ${activeTab === 'theory' ? 'active' : ''}`}
            onClick={() => setActiveTab('theory')}
            style={activeTab === 'theory' ? { borderBottomColor: '#2563eb', color: '#1d4ed8' } : {}}
          >
            <BookOpen size={15} />
            <span>Forma 1: Preguntas Conceptuales (Evaluación y Justificación)</span>
            <span className="tab-pill-count" style={activeTab === 'theory' ? { background: '#dbeafe', color: '#1e40af' } : {}}>
              {NEWTON_THEORY_QUESTIONS.length}
            </span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="dcl-modal-content">
          {activeTab === 'exercises' ? (
            <div className="dcl-exercises-layout">
              {/* Left Sidebar: Exercise List */}
              <div className="dcl-exercise-list">
                <div className="dcl-list-title">Ejercicios Oficiales HT01 U4:</div>
                {NEWTON_EXERCISES.map((ex) => {
                  const isSelected = ex.id === selectedExerciseId;
                  const isFrictionless = !ex.hasFriction;
                  return (
                    <button
                      key={ex.id}
                      className={`dcl-exercise-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectExercise(ex.id)}
                      style={isSelected ? { borderColor: '#2563eb', background: '#eff6ff' } : {}}
                    >
                      <div className="exercise-item-header">
                        <span className="exercise-number-badge" style={isSelected ? { background: '#2563eb', color: '#fff' } : {}}>
                          P{ex.number}
                        </span>
                        <span className="exercise-item-title" style={isSelected ? { color: '#1d4ed8', fontWeight: 700 } : {}}>
                          {ex.title}
                        </span>
                      </div>
                      <div className="exercise-item-meta">
                        <span className="meta-tag" style={{ background: isFrictionless ? '#ecfdf5' : '#fef3c7', color: isFrictionless ? '#047857' : '#b45309' }}>
                          {isFrictionless ? '✨ Sin Fricción (μ=0)' : '⚠️ Con Fricción'}
                        </span>
                        {ex.apparatusType === 'two_connected_blocks' && (
                          <span className="meta-tag" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                            2 Bloques
                          </span>
                        )}
                        {ex.apparatusType === 'atwood_frictionless' && (
                          <span className="meta-tag" style={{ background: '#f5f3ff', color: '#6d28d9' }}>
                            Atwood
                          </span>
                        )}
                        {ex.apparatusType === 'inclined_plane_frictionless' && (
                          <span className="meta-tag" style={{ background: '#fff7ed', color: '#c2410c' }}>
                            Plano 32°
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Panel: Exercise Details and Steps */}
              <div className="dcl-exercise-detail">
                {/* Exercise Header */}
                <div className="exercise-detail-header" style={{ borderBottomColor: '#e2e8f0' }}>
                  <div className="exercise-detail-title-row">
                    <div>
                      <div className="exercise-problem-tag" style={{ color: '#2563eb' }}>
                        Hoja de Trabajo HT01 • Problema #{selectedExercise.number}
                      </div>
                      <h3 className="exercise-detail-title">
                        {selectedExercise.title}
                      </h3>
                    </div>
                    <div className="exercise-system-pill" style={{ background: '#f1f5f9', color: '#334155' }}>
                      {selectedExercise.bodies?.length > 1 ? `${selectedExercise.bodies.length} Cuerpos Conectados` : '1 Cuerpo'}
                    </div>
                  </div>

                  <p className="exercise-statement">
                    {selectedExercise.statement}
                  </p>

                  {/* Highlights Grid */}
                  <div className="exercise-highlights-grid">
                    <div className="highlight-pill">
                      <span className="pill-label">Aparato Físico:</span>
                      <span className="pill-value font-medium">{selectedExercise.apparatusTitle || selectedExercise.title}</span>
                    </div>
                    <div className="highlight-pill">
                      <span className="pill-label">Superficie:</span>
                      <span className="pill-value text-emerald-700 font-semibold">
                        {selectedExercise.hasFriction ? `μk = ${selectedExercise.frictionCoeff}` : 'Lisa Ideal (Sin fricción, μ = 0)'}
                      </span>
                    </div>
                    <div className="highlight-pill">
                      <span className="pill-label">Incógnitas del Problema:</span>
                      <span className="pill-value text-blue-700 font-bold">{selectedExercise.unknownsText || 'a = ?, T = ?'}</span>
                    </div>
                  </div>
                </div>

                {/* Sub-Tabs for Bodies if multiple bodies */}
                {selectedExercise.bodies && selectedExercise.bodies.length > 1 && (
                  <div className="dcl-body-tabs" style={{ marginTop: 12, marginBottom: 12 }}>
                    <span className="dcl-body-tabs-label">Seleccionar Cuerpo del Sistema:</span>
                    {selectedExercise.bodies.map((b, idx) => (
                      <button
                        key={b.key}
                        className={`dcl-body-tab-btn ${selectedBodyIdx === idx ? 'active' : ''}`}
                        onClick={() => setSelectedBodyIdx(idx)}
                        style={selectedBodyIdx === idx ? { borderColor: '#2563eb', background: '#eff6ff', color: '#1d4ed8' } : {}}
                      >
                        {b.name}
                        {b.massKg && <span className="tab-mass-tag"> ({b.massKg} kg)</span>}
                      </button>
                    ))}
                  </div>
                )}

                {/* Body Details Card */}
                {currentBody && (
                  <div className="body-detail-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 16px', marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#1e293b' }}>
                        DCL para: {currentBody.name}
                      </span>
                      {currentBody.weightN && (
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          Peso W = {currentBody.weightN} N (m = {currentBody.massKg} kg)
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.5 }}>
                      <strong>Ecuaciones de movimiento:</strong><br />
                      • Eje X: {currentBody.equationX || 'ΣFx = m · a'}<br />
                      • Eje Y: {currentBody.equationY || 'ΣFy = 0 (Normal equilibra al peso vertical)'}
                    </div>
                  </div>
                )}

                {/* Step-by-Step Mathematical Resolution Card */}
                <div className="dcl-steps-section">
                  <div className="dcl-steps-title" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1e293b', fontWeight: 700, marginBottom: 10 }}>
                    <TrendingUp size={16} color="#2563eb" />
                    <span>Resolución Analítica Paso a Paso (HT01 U4):</span>
                  </div>

                  <div className="dcl-steps-list">
                    {selectedExercise.steps?.map((step, idx) => (
                      <div key={idx} className="dcl-step-item">
                        <div className="dcl-step-header">
                          <span className="dcl-step-number" style={{ background: '#2563eb', color: '#fff' }}>
                            {idx + 1}
                          </span>
                          <span className="dcl-step-title">{step.title}</span>
                        </div>
                        <div className="dcl-step-body">
                          <p className="dcl-step-desc">{step.explanation}</p>
                          {step.formula && (
                            <div className="dcl-step-formula-box" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a' }}>
                              <code>{step.formula}</code>
                            </div>
                          )}
                          {step.result && (
                            <div className="dcl-step-result-text" style={{ color: '#15803d', fontWeight: 600 }}>
                              ⇒ {step.result}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Final Official Answer Card */}
                  <div className="dcl-final-answer-card" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 16px', marginTop: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#166534', fontWeight: 700, marginBottom: 4 }}>
                      <CheckCircle2 size={16} color="#16a34a" />
                      <span>Respuesta Final Oficial:</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#14532d', fontFamily: 'monospace' }}>
                      {selectedExercise.finalAnswer}
                    </div>
                  </div>
                </div>

                {/* Whiteboard Mounting Actions */}
                {onMountExerciseOnBoard && (
                  <div className="dcl-action-footer" style={{ marginTop: 20 }}>
                    <button
                      className="dcl-mount-board-btn secondary"
                      onClick={() => {
                        onMountExerciseOnBoard(selectedExercise.number, { cleanPractice: true });
                        if (onClose) onClose();
                      }}
                      title="Cargar el dibujo del sistema físico limpio para que tú o los estudiantes coloquen los vectores y experimenten con la simulación interactiva"
                    >
                      <Target size={16} />
                      <span>Cargar Sistema Limpio para Explicar Clase (Sin Solución Forzada)</span>
                    </button>
                    <button
                      className="dcl-mount-board-btn"
                      onClick={() => {
                        onMountExerciseOnBoard(selectedExercise.number, { cleanPractice: false });
                        if (onClose) onClose();
                      }}
                      title="Cargar el sistema en la pizarra con todas las fuerzas, vectores, tensión y aceleración resueltas"
                      style={{ background: '#2563eb', borderColor: '#1d4ed8' }}
                    >
                      <Sparkles size={16} />
                      <span>Cargar con Solución Teórica Oficial Resuelta</span>
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
                  <div className="dcl-theory-icon-circle" style={{ background: '#eff6ff', color: '#2563eb' }}>
                    <HelpCircle size={22} />
                  </div>
                  <div>
                    <h3 className="dcl-theory-title">Forma 1: Preguntas Conceptuales – Segunda Ley de Newton</h3>
                    <p className="dcl-theory-desc">
                      Selecciona la opción correcta para cada una de las 4 preguntas oficiales de la Hoja de Trabajo HT01 (Página 2). 
                      Cada pregunta incluye su justificación física basada en la relación directa entre fuerza neta, masa inercial y aceleración (a = F / m).
                    </p>
                  </div>
                </div>

                {showResults && (
                  <div className="theory-score-banner" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
                    <div className="score-badge-circle" style={{ background: '#2563eb', color: '#fff' }}>
                      <span className="score-num">{calculateScore()}</span>
                      <span className="score-max">/ {NEWTON_THEORY_QUESTIONS.length}</span>
                    </div>
                    <div className="score-feedback">
                      <div className="score-title" style={{ color: '#1e3a8a' }}>
                        {calculateScore() === 4 ? '¡Excelente! Puntuación Perfecta 🎉' : calculateScore() >= 3 ? '¡Buen trabajo! Aprobado 👍' : 'Repasa los conceptos de la 2ª Ley 💡'}
                      </div>
                      <div className="score-subtitle" style={{ color: '#1e40af' }}>
                        Has respondido correctamente {calculateScore()} de las {NEWTON_THEORY_QUESTIONS.length} preguntas conceptuales oficiales.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Questions List */}
              <div className="dcl-questions-container">
                {NEWTON_THEORY_QUESTIONS.map((q) => {
                  const selectedOpt = userAnswers[q.id];
                  const isAnswered = selectedOpt !== undefined;
                  const isCorrect = isAnswered && selectedOpt === q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      className={`dcl-question-card ${showResults ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
                    >
                      <div className="question-card-header">
                        <span className="question-num-tag" style={{ background: '#2563eb', color: '#fff' }}>
                          Pregunta {q.number}
                        </span>
                        <h4 className="question-text">{q.question}</h4>
                      </div>

                      <div className="question-options-list">
                        {q.options.map((opt, optIdx) => {
                          const isThisSelected = selectedOpt === optIdx;
                          const isThisCorrect = optIdx === q.correctIndex;

                          let optionClass = 'question-option-item';
                          if (isThisSelected) optionClass += ' selected';
                          if (showResults) {
                            if (isThisCorrect) optionClass += ' option-correct';
                            else if (isThisSelected && !isThisCorrect) optionClass += ' option-wrong';
                          }

                          return (
                            <button
                              key={optIdx}
                              className={optionClass}
                              onClick={() => handleSelectOption(q.id, optIdx)}
                              disabled={showResults}
                            >
                              <span className="option-radio-indicator">
                                {isThisSelected && <span className="option-radio-dot" />}
                              </span>
                              <span className="option-label">{opt}</span>
                              {showResults && isThisCorrect && (
                                <CheckCircle2 size={16} className="option-result-icon correct" />
                              )}
                              {showResults && isThisSelected && !isThisCorrect && (
                                <XCircle size={16} className="option-result-icon wrong" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {showResults && (
                        <div className="question-explanation-box" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
                          <span className="explanation-label" style={{ color: '#1e40af' }}>
                            💡 Justificación Física (Colegio Kinal):
                          </span>
                          <p className="explanation-text" style={{ color: '#1e293b' }}>
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Bar for Quiz */}
              <div className="theory-actions-bar">
                {!showResults ? (
                  <button
                    className="theory-check-btn"
                    onClick={() => setShowResults(true)}
                    disabled={Object.keys(userAnswers).length === 0}
                    style={{ background: '#2563eb', color: '#fff' }}
                  >
                    <span>Verificar y Evaluar Respuestas</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    className="theory-retry-btn"
                    onClick={() => {
                      setShowResults(false);
                      setUserAnswers({});
                    }}
                  >
                    <span>Reintentar Cuestionario</span>
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
