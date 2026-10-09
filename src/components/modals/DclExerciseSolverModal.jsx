import React, { useState } from 'react';
import { 
  X, 
  GitFork, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Layers, 
  Sparkles, 
  BookOpen, 
  ChevronRight,
  ShieldCheck,
  Target
} from 'lucide-react';
import { 
  DCL_THEORY_QUESTIONS, 
  DCL_EXERCISES 
} from '../../services/dclExerciseSolver';

export default function DclExerciseSolverModal({
  isOpen,
  onClose,
  onMountExerciseOnBoard,
}) {
  const [activeTab, setActiveTab] = useState('exercises'); // 'exercises' | 'theory'
  const [selectedExerciseId, setSelectedExerciseId] = useState(DCL_EXERCISES[0].id);
  const [selectedBodyIdx, setSelectedBodyIdx] = useState(0);
  const [viewMode, setViewMode] = useState('apparatus'); // 'apparatus' | 'isolated'

  // Theory Questions Interactive State
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  if (!isOpen) return null;

  const selectedExercise =
    DCL_EXERCISES.find((e) => e.id === selectedExerciseId) ||
    DCL_EXERCISES[0];

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
    const ex = DCL_EXERCISES.find((e) => e.id === id);
    if (ex?.apparatusType) {
      setViewMode('apparatus');
    }
  };

  const calculateScore = () => {
    let score = 0;
    DCL_THEORY_QUESTIONS.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) score++;
    });
    return score;
  };

  return (
    <div className="dcl-modal-backdrop" onClick={onClose}>
      <div className="dcl-modal-container miro-island" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="dcl-modal-header">
          <div className="dcl-header-title-group">
            <div className="dcl-header-icon-box">
              <GitFork size={20} className="dcl-header-icon" />
            </div>
            <div>
              <div className="dcl-header-badge">
                Colegio Kinal • Física II Quinto • Unidad 3 HT02
              </div>
              <h2 className="dcl-modal-title">
                Fuerzas y Diagramas de Cuerpo Libre (DCL)
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
            <span>Forma 2: Problemas de Aplicación (11 DCLs)</span>
            <span className="tab-pill-count">{DCL_EXERCISES.length}</span>
          </button>
          <button
            className={`dcl-tab-btn ${activeTab === 'theory' ? 'active' : ''}`}
            onClick={() => setActiveTab('theory')}
          >
            <BookOpen size={15} />
            <span>Forma 1: Preguntas Conceptuales</span>
            <span className="tab-pill-count">{DCL_THEORY_QUESTIONS.length}</span>
          </button>
        </div>

        {/* Tab 1: Problems & DCL Solver */}
        {activeTab === 'exercises' && (
          <div className="dcl-tab-content exercises-tab-layout">
            {/* Sidebar list of 11 exercises */}
            <div className="dcl-exercises-sidebar">
              <div className="sidebar-header">
                <span>EJERCICIOS HT02</span>
                <span className="sidebar-count">{DCL_EXERCISES.length} Problemas</span>
              </div>
              <div className="sidebar-scroll-list">
                {DCL_EXERCISES.map((ex) => (
                  <button
                    key={ex.id}
                    className={`sidebar-item ${ex.id === selectedExerciseId ? 'active' : ''}`}
                    onClick={() => handleSelectExercise(ex.id)}
                  >
                    <div className="sidebar-item-badge">
                      P{ex.number}
                    </div>
                    <div className="sidebar-item-info">
                      <span className="sidebar-item-title">{ex.title.replace(/^Problema \d+:\s*/, '')}</span>
                      <span className="sidebar-item-sub">
                        {ex.bodies.length} {ex.bodies.length === 1 ? 'cuerpo' : 'cuerpos'} • {ex.criticalPoint ? 'Punto Crítico' : 'Equilibrio'}
                      </span>
                    </div>
                    <ChevronRight size={14} className="sidebar-item-chevron" />
                  </button>
                ))}
              </div>
            </div>

            {/* Main Solver & Detailed DCL Panel */}
            <div className="dcl-exercise-main-panel">
              {/* Exercise Header Card */}
              <div className="exercise-header-card">
                <div className="exercise-number-badge">
                  HOJA DE TRABAJO 02 • PROBLEMA #{selectedExercise.number}
                </div>
                <h3 className="exercise-title">{selectedExercise.title}</h3>
                <p className="exercise-subtitle">{selectedExercise.subtitle}</p>
                <div className="exercise-scenario-box">
                  <strong>Enunciado oficial:</strong> {selectedExercise.scenario}
                </div>

                {selectedExercise.criticalPoint && (
                  <div className="critical-point-banner">
                    <Target size={15} className="critical-point-icon" />
                    <span><strong>Punto Crítico del Sistema:</strong> {selectedExercise.criticalPoint}</span>
                  </div>
                )}
              </div>

              {/* Switcher: Physical Apparatus View with Overlaid DCLs vs Isolated Body DCL */}
              {selectedExercise.apparatusType && (
                <div className="apparatus-mode-switch-bar">
                  <button
                    type="button"
                    className={`apparatus-tab-btn ${viewMode === 'apparatus' ? 'active' : ''}`}
                    onClick={() => setViewMode('apparatus')}
                  >
                    <Layers size={14} />
                    <span>🏛️ Dibujo del Sistema Físico con DCLs Superpuestos</span>
                  </button>
                  <button
                    type="button"
                    className={`apparatus-tab-btn ${viewMode === 'isolated' ? 'active' : ''}`}
                    onClick={() => setViewMode('isolated')}
                  >
                    <Target size={14} />
                    <span>📐 D.C.L. Individual Aislado por Cuerpo ({selectedExercise.bodies.length})</span>
                  </button>
                </div>
              )}

              {/* Multi-body Selector Tabs if more than 1 body and in isolated mode */}
              {(!selectedExercise.apparatusType || viewMode === 'isolated') && selectedExercise.bodies.length > 1 && (
                <div className="body-selector-tabs">
                  <span className="body-tabs-label">Seleccionar DCL:</span>
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

              {/* VIEW 1: FULL PHYSICAL APPARATUS WITH OVERLAID DCLs */}
              {viewMode === 'apparatus' && selectedExercise.apparatusType === 'table_three_masses' ? (
                <div className="dcl-body-card apparatus-card">
                  <div className="dcl-body-card-header">
                    <div>
                      <h4 className="body-name-title">🏛️ Sistema Físico Completo: Mesa con 3 Masas y D.C.L. Superpuesto</h4>
                      <span className="body-axes-meta">Problema Oficial HT02 #10 • Masas conectadas por cuerda con fricción en mesa (μc = 0.20)</span>
                    </div>
                  </div>

                  {/* SVG Drawing of the table and weights with DCLs on top */}
                  <div className="dcl-visual-preview-box apparatus-preview-box">
                    <svg className="dcl-svg-apparatus" viewBox="0 0 680 340" style={{ width: '100%', height: 'auto', maxHeight: 350 }}>
                      <defs>
                        <linearGradient id="woodTableGradModal" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="30%" stopColor="#d97706" />
                          <stop offset="100%" stopColor="#b45309" />
                        </linearGradient>
                        <linearGradient id="steelGradModal" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#64748b" />
                          <stop offset="100%" stopColor="#334155" />
                        </linearGradient>
                        <linearGradient id="mainMassGradModal" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#475569" />
                          <stop offset="100%" stopColor="#1e293b" />
                        </linearGradient>
                        <marker id="m-arr-red" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
                        </marker>
                        <marker id="m-arr-blue" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" />
                        </marker>
                        <marker id="m-arr-green" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
                        </marker>
                        <marker id="m-arr-darkgreen" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#059669" />
                        </marker>
                        <marker id="m-arr-amber" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
                        </marker>
                        <marker id="m-arr-cyan" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#06b6d4" />
                        </marker>
                      </defs>

                      {/* Floor Line & Ground Hatching */}
                      <line x1="30" y1="305" x2="650" y2="305" stroke="#94a3b8" strokeWidth="2.5" />
                      {[...Array(38)].map((_, i) => (
                        <line key={i} x1={40 + i * 16} y1="305" x2={30 + i * 16} y2="315" stroke="#cbd5e1" strokeWidth="1.5" />
                      ))}

                      {/* Table Legs, Crossbar & Rubber Pads */}
                      <rect x="200" y="145" width="18" height="155" fill="#475569" rx="2" />
                      <rect x="462" y="145" width="18" height="155" fill="#475569" rx="2" />
                      <rect x="200" y="195" width="280" height="10" fill="#64748b" rx="2" />
                      <rect x="196" y="300" width="26" height="5" fill="#1e293b" rx="1" />
                      <rect x="458" y="300" width="26" height="5" fill="#1e293b" rx="1" />

                      {/* Table Top Surface (Oak) */}
                      <rect x="160" y="130" width="360" height="20" rx="4" fill="url(#woodTableGradModal)" stroke="#92400e" strokeWidth="1.5" />

                      {/* Left Pulley */}
                      <rect x="148" y="126" width="12" height="18" fill="#334155" rx="2" />
                      <circle cx="160" cy="128" r="15" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
                      <circle cx="160" cy="128" r="11" fill="none" stroke="#94a3b8" strokeWidth="1" />
                      <circle cx="160" cy="128" r="3" fill="#0f172a" />

                      {/* Right Pulley */}
                      <rect x="520" y="126" width="12" height="18" fill="#334155" rx="2" />
                      <circle cx="520" cy="128" r="15" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
                      <circle cx="520" cy="128" r="11" fill="none" stroke="#94a3b8" strokeWidth="1" />
                      <circle cx="520" cy="128" r="3" fill="#0f172a" />

                      {/* Cords */}
                      <path d="M 302 105 L 160 113 A 15 15 0 0 0 145 128 L 145 195" fill="none" stroke="#78350f" strokeWidth="2.5" />
                      <path d="M 378 105 L 520 113 A 15 15 0 0 1 535 128 L 535 210" fill="none" stroke="#78350f" strokeWidth="2.5" />

                      {/* Mass 1 (Left Hanging: 6.0 kg) */}
                      <rect x="118" y="195" width="54" height="46" rx="4" fill="url(#steelGradModal)" stroke="#1e293b" strokeWidth="2" />
                      <path d="M 142 195 A 3 3 0 0 1 148 195" fill="none" stroke="#94a3b8" strokeWidth="2" />
                      <text x="145" y="222" fill="#ffffff" fontSize="10.5" fontWeight="bold" textAnchor="middle">m₁=6 kg</text>

                      {/* Mass 2 (Center on table: 10 kg) */}
                      <rect x="302" y="80" width="76" height="50" rx="4" fill="url(#mainMassGradModal)" stroke="#0f172a" strokeWidth="2" />
                      <circle cx="302" cy="105" r="3" fill="#94a3b8" />
                      <circle cx="378" cy="105" r="3" fill="#94a3b8" />
                      <text x="340" y="109" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">m₂ = 10 kg</text>
                      <text x="340" y="142" fill="#9a3412" fontSize="9" fontWeight="bold" textAnchor="middle">μc = 0.20</text>

                      {/* Mass 3 (Right Hanging: 9.0 kg) */}
                      <rect x="506" y="210" width="58" height="50" rx="4" fill="url(#steelGradModal)" stroke="#1e293b" strokeWidth="2" />
                      <path d="M 532 210 A 3 3 0 0 1 538 210" fill="none" stroke="#94a3b8" strokeWidth="2" />
                      <text x="535" y="239" fill="#ffffff" fontSize="10.5" fontWeight="bold" textAnchor="middle">m₃=9 kg</text>

                      {/* DCL SUPERIMPOSED ON m1 */}
                      <line x1="145" y1="150" x2="145" y2="280" stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
                      <circle cx="145" cy="218" r="3.5" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
                      <line x1="145" y1="218" x2="145" y2="162" stroke="#10b981" strokeWidth="2.8" markerEnd="url(#m-arr-green)" />
                      <rect x="100" y="148" width="72" height="16" rx="3" fill="#ffffff" stroke="#10b981" strokeWidth="1.2" />
                      <text x="136" y="160" fill="#10b981" fontSize="9" fontWeight="bold" textAnchor="middle">T₁=61.15 N</text>
                      <line x1="145" y1="218" x2="145" y2="274" stroke="#ef4444" strokeWidth="2.8" markerEnd="url(#m-arr-red)" />
                      <rect x="100" y="278" width="74" height="16" rx="3" fill="#ffffff" stroke="#ef4444" strokeWidth="1.2" />
                      <text x="137" y="290" fill="#ef4444" fontSize="9" fontWeight="bold" textAnchor="middle">W₁=58.80 N</text>
                      <line x1="178" y1="230" x2="178" y2="200" stroke="#06b6d4" strokeWidth="2" markerEnd="url(#m-arr-cyan)" />
                      <text x="182" y="218" fill="#0891b2" fontSize="8.5" fontWeight="bold">a ↑</text>

                      {/* DCL SUPERIMPOSED ON m2 */}
                      <line x1="250" y1="105" x2="435" y2="105" stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="340" y1="40" x2="340" y2="175" stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
                      <circle cx="340" cy="105" r="4" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
                      <line x1="340" y1="105" x2="340" y2="48" stroke="#3b82f6" strokeWidth="2.8" markerEnd="url(#m-arr-blue)" />
                      <rect x="306" y="30" width="68" height="16" rx="3" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.2" />
                      <text x="340" y="42" fill="#3b82f6" fontSize="9.5" fontWeight="bold" textAnchor="middle">N=98.00 N</text>
                      <line x1="340" y1="105" x2="340" y2="165" stroke="#ef4444" strokeWidth="2.8" markerEnd="url(#m-arr-red)" />
                      <rect x="304" y="168" width="72" height="16" rx="3" fill="#ffffff" stroke="#ef4444" strokeWidth="1.2" />
                      <text x="340" y="180" fill="#ef4444" fontSize="9.5" fontWeight="bold" textAnchor="middle">W₂=98.00 N</text>
                      <line x1="340" y1="105" x2="425" y2="105" stroke="#059669" strokeWidth="2.8" markerEnd="url(#m-arr-darkgreen)" />
                      <rect x="390" y="85" width="70" height="16" rx="3" fill="#ffffff" stroke="#059669" strokeWidth="1.2" />
                      <text x="425" y="97" fill="#059669" fontSize="9.5" fontWeight="bold" textAnchor="middle">T₂=84.67 N</text>
                      <line x1="340" y1="105" x2="265" y2="105" stroke="#10b981" strokeWidth="2.8" markerEnd="url(#m-arr-green)" />
                      <rect x="225" y="85" width="70" height="16" rx="3" fill="#ffffff" stroke="#10b981" strokeWidth="1.2" />
                      <text x="260" y="97" fill="#10b981" fontSize="9.5" fontWeight="bold" textAnchor="middle">T₁=61.15 N</text>
                      <line x1="340" y1="130" x2="280" y2="130" stroke="#f59e0b" strokeWidth="2.5" markerEnd="url(#m-arr-amber)" />
                      <rect x="238" y="122" width="68" height="15" rx="3" fill="#ffffff" stroke="#f59e0b" strokeWidth="1.2" />
                      <text x="272" y="133" fill="#b45309" fontSize="8.5" fontWeight="bold" textAnchor="middle">fk=19.60 N</text>
                      <line x1="320" y1="18" x2="360" y2="18" stroke="#06b6d4" strokeWidth="2" markerEnd="url(#m-arr-cyan)" />
                      <text x="382" y="21" fill="#0891b2" fontSize="9" fontWeight="bold">a → 0.392 m/s²</text>

                      {/* DCL SUPERIMPOSED ON m3 */}
                      <line x1="535" y1="165" x2="535" y2="295" stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
                      <circle cx="535" cy="235" r="3.5" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
                      <line x1="535" y1="235" x2="535" y2="180" stroke="#059669" strokeWidth="2.8" markerEnd="url(#m-arr-darkgreen)" />
                      <rect x="495" y="165" width="72" height="16" rx="3" fill="#ffffff" stroke="#059669" strokeWidth="1.2" />
                      <text x="531" y="177" fill="#059669" fontSize="9" fontWeight="bold" textAnchor="middle">T₂=84.67 N</text>
                      <line x1="535" y1="235" x2="535" y2="290" stroke="#ef4444" strokeWidth="2.8" markerEnd="url(#m-arr-red)" />
                      <rect x="495" y="292" width="74" height="16" rx="3" fill="#ffffff" stroke="#ef4444" strokeWidth="1.2" />
                      <text x="532" y="304" fill="#ef4444" fontSize="9" fontWeight="bold" textAnchor="middle">W₃=88.20 N</text>
                      <line x1="575" y1="220" x2="575" y2="250" stroke="#06b6d4" strokeWidth="2" markerEnd="url(#m-arr-cyan)" />
                      <text x="580" y="238" fill="#0891b2" fontSize="8.5" fontWeight="bold">a ↓</text>
                    </svg>

                    <div className="dcl-preview-legend">
                      <span className="legend-item"><span className="legend-dot red" /> Peso (W)</span>
                      <span className="legend-item"><span className="legend-dot blue" /> Normal (N)</span>
                      <span className="legend-item"><span className="legend-dot green" /> Tensiones (T₁, T₂)</span>
                      <span className="legend-item"><span className="legend-dot amber" /> Fricción (fk)</span>
                      <span className="legend-item"><span className="legend-dot" style={{ background: '#06b6d4' }} /> Aceleración (a)</span>
                    </div>
                  </div>

                  {/* Summary of interactions and equations */}
                  <div className="apparatus-analysis-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, margin: '14px 0' }}>
                    <div className="apparatus-body-mini-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#166534', marginBottom: 4 }}>Masa Izquierda m₁ (6 kg)</div>
                      <div style={{ fontSize: '0.72rem', color: '#475569' }}>Asciende acelerada (+a). La tensión de la cuerda supera a su peso gravitacional.</div>
                      <code style={{ display: 'block', marginTop: 6, fontSize: '0.75rem', color: '#0f172a' }}>T₁ - W₁ = m₁·a</code>
                    </div>

                    <div className="apparatus-body-mini-card" style={{ background: '#fffaf5', border: '1px solid #fed7aa', borderRadius: 8, padding: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#9a3412', marginBottom: 4 }}>Masa Central m₂ (10 kg)</div>
                      <div style={{ fontSize: '0.72rem', color: '#475569' }}>Punto Crítico con 5 fuerzas concurrentes. Arrastrada por T₂ venciendo a T₁ y a la fricción fk.</div>
                      <code style={{ display: 'block', marginTop: 6, fontSize: '0.75rem', color: '#0f172a' }}>T₂ - T₁ - fk = m₂·a</code>
                    </div>

                    <div className="apparatus-body-mini-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#047857', marginBottom: 4 }}>Masa Derecha m₃ (9 kg)</div>
                      <div style={{ fontSize: '0.72rem', color: '#475569' }}>Desciende acelerada (-a). Su peso motriz supera a la tensión T₂ de la cuerda.</div>
                      <code style={{ display: 'block', marginTop: 6, fontSize: '0.75rem', color: '#0f172a' }}>W₃ - T₂ = m₃·a</code>
                    </div>
                  </div>

                  {/* Complete Numerical Results */}
                  {selectedExercise.numericalResults && (
                    <div className="numerical-results-card">
                      <h5 className="results-card-title">Cálculos Cuantitativos Completos del Sistema:</h5>
                      <div className="results-grid">
                        <div className="result-pill">
                          <span className="result-k">Fuerza Neta Motriz:</span>
                          <span className="result-v">{selectedExercise.numericalResults.netForce}</span>
                        </div>
                        <div className="result-pill">
                          <span className="result-k">Masa Total Sistema:</span>
                          <span className="result-v">{selectedExercise.numericalResults.totalMass}</span>
                        </div>
                        <div className="result-pill highlight">
                          <span className="result-k">Aceleración Neta (a):</span>
                          <span className="result-v green">{selectedExercise.numericalResults.acceleration}</span>
                        </div>
                        <div className="result-pill">
                          <span className="result-k">Fricción en Mesa (fk):</span>
                          <span className="result-v">{selectedExercise.numericalResults.fk}</span>
                        </div>
                        <div className="result-pill">
                          <span className="result-k">Tensión Cuerda 1 (T₁):</span>
                          <span className="result-v">{selectedExercise.numericalResults.T1}</span>
                        </div>
                        <div className="result-pill">
                          <span className="result-k">Tensión Cuerda 2 (T₂):</span>
                          <span className="result-v">{selectedExercise.numericalResults.T2}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mount on Whiteboard Buttons */}
                  {onMountExerciseOnBoard && (
                    <div className="dcl-action-footer">
                      <button
                        className="dcl-mount-board-btn secondary"
                        onClick={() => {
                          onMountExerciseOnBoard(selectedExercise.number, { cleanPractice: true });
                          if (onClose) onClose();
                        }}
                        title="Cargar la mesa y pesas limpias sin vectores para que tú dibujes las fuerzas"
                      >
                        <Target size={16} />
                        <span>Cargar Mesa Limpia para Practicar (Sin Vectores)</span>
                      </button>
                      <button
                        className="dcl-mount-board-btn"
                        onClick={() => {
                          onMountExerciseOnBoard(selectedExercise.number, { cleanPractice: false });
                          if (onClose) onClose();
                        }}
                        title="Cargar la mesa con todas las fuerzas ya trazadas y resueltas"
                      >
                        <Sparkles size={16} />
                        <span>Cargar con D.C.L. Resuelto Oficial</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : viewMode === 'apparatus' && selectedExercise.apparatusType === 'table_two_masses' ? (
                <div className="dcl-body-card apparatus-card">
                  <div className="dcl-body-card-header">
                    <div>
                      <h4 className="body-name-title">🏛️ Sistema Físico Completo: Mesa con Dos Masas y D.C.L.</h4>
                      <span className="body-axes-meta">Problema Oficial HT02 #2 • Bloque m₁ apoyado en mesa lisa y masa m₂ suspendida</span>
                    </div>
                  </div>

                  <div className="dcl-visual-preview-box apparatus-preview-box">
                    <svg className="dcl-svg-apparatus" viewBox="0 0 620 300" style={{ width: '100%', height: 'auto', maxHeight: 310 }}>
                      <defs>
                        <linearGradient id="woodTableGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="30%" stopColor="#d97706" />
                          <stop offset="100%" stopColor="#b45309" />
                        </linearGradient>
                        <marker id="m2-arr-red" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
                        </marker>
                        <marker id="m2-arr-blue" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" />
                        </marker>
                        <marker id="m2-arr-green" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
                        </marker>
                      </defs>

                      {/* Floor line */}
                      <line x1="30" y1="270" x2="590" y2="270" stroke="#94a3b8" strokeWidth="2" />

                      {/* Table Legs */}
                      <rect x="70" y="145" width="16" height="125" fill="#475569" rx="2" />
                      <rect x="350" y="145" width="16" height="125" fill="#475569" rx="2" />
                      <rect x="68" y="266" width="20" height="4" fill="#1e293b" />
                      <rect x="348" y="266" width="20" height="4" fill="#1e293b" />

                      {/* Table Top Surface */}
                      <rect x="50" y="130" width="340" height="18" rx="4" fill="url(#woodTableGrad2)" stroke="#92400e" strokeWidth="1.5" />

                      {/* Right Edge Pulley */}
                      <rect x="378" y="126" width="12" height="18" fill="#334155" rx="2" />
                      <circle cx="390" cy="128" r="14" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
                      <circle cx="390" cy="128" r="3" fill="#0f172a" />

                      {/* Masses */}
                      <rect x="180" y="80" width="76" height="50" rx="4" fill="#334155" stroke="#0f172a" strokeWidth="2" />
                      <text x="218" y="108" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">m₁ (Mesa)</text>

                      <rect x="376" y="190" width="56" height="48" rx="4" fill="#475569" stroke="#0f172a" strokeWidth="2" />
                      <text x="404" y="218" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">m₂</text>

                      {/* Rope */}
                      <path d="M 256 105 L 390 114 A 14 14 0 0 1 404 128 L 404 190" fill="none" stroke="#78350f" strokeWidth="2.4" />

                      {/* DCL Vectors on m1 */}
                      <circle cx="218" cy="105" r="3.5" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
                      <line x1="218" y1="105" x2="218" y2="50" stroke="#3b82f6" strokeWidth="2.8" markerEnd="url(#m2-arr-blue)" />
                      <rect x="186" y="32" width="64" height="16" rx="3" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.2" />
                      <text x="218" y="44" fill="#3b82f6" fontSize="9" fontWeight="bold" textAnchor="middle">N₁</text>

                      <line x1="218" y1="105" x2="218" y2="160" stroke="#ef4444" strokeWidth="2.8" markerEnd="url(#m2-arr-red)" />
                      <rect x="184" y="162" width="68" height="16" rx="3" fill="#ffffff" stroke="#ef4444" strokeWidth="1.2" />
                      <text x="218" y="174" fill="#ef4444" fontSize="9" fontWeight="bold" textAnchor="middle">W₁ = m₁·g</text>

                      <line x1="218" y1="105" x2="295" y2="105" stroke="#10b981" strokeWidth="2.8" markerEnd="url(#m2-arr-green)" />
                      <rect x="270" y="85" width="40" height="16" rx="3" fill="#ffffff" stroke="#10b981" strokeWidth="1.2" />
                      <text x="290" y="97" fill="#10b981" fontSize="9" fontWeight="bold" textAnchor="middle">T</text>

                      {/* DCL Vectors on m2 */}
                      <circle cx="404" cy="214" r="3.5" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
                      <line x1="404" y1="214" x2="404" y2="162" stroke="#10b981" strokeWidth="2.8" markerEnd="url(#m2-arr-green)" />
                      <rect x="384" y="148" width="40" height="16" rx="3" fill="#ffffff" stroke="#10b981" strokeWidth="1.2" />
                      <text x="404" y="160" fill="#10b981" fontSize="9" fontWeight="bold" textAnchor="middle">T</text>

                      <line x1="404" y1="214" x2="404" y2="264" stroke="#ef4444" strokeWidth="2.8" markerEnd="url(#m2-arr-red)" />
                      <rect x="370" y="266" width="68" height="16" rx="3" fill="#ffffff" stroke="#ef4444" strokeWidth="1.2" />
                      <text x="404" y="278" fill="#ef4444" fontSize="9" fontWeight="bold" textAnchor="middle">W₂ = m₂·g</text>
                    </svg>

                    <div className="dcl-preview-legend">
                      <span className="legend-item"><span className="legend-dot red" /> Peso (W)</span>
                      <span className="legend-item"><span className="legend-dot blue" /> Normal (N)</span>
                      <span className="legend-item"><span className="legend-dot green" /> Tensión (T)</span>
                    </div>
                  </div>

                  <div className="equations-box" style={{ marginTop: 12 }}>
                    <div className="equations-box-header">
                      <Sparkles size={14} className="sparkle-orange" />
                      <span>Ecuaciones del Sistema en la Mesa:</span>
                    </div>
                    <div className="equations-list">
                      <div className="equation-item"><code>Bloque m₁ (Mesa): ΣFx = T = m₁·a  |  ΣFy = N₁ - W₁ = 0</code></div>
                      <div className="equation-item"><code>Masa m₂ (Suspendida): ΣFy = W₂ - T = m₂·a</code></div>
                      <div className="equation-item"><code>Aceleración Conjunta: a = W₂ / (m₁ + m₂) = m₂·g / (m₁ + m₂)</code></div>
                    </div>
                  </div>

                  {onMountExerciseOnBoard && (
                    <div className="dcl-action-footer">
                      <button
                        className="dcl-mount-board-btn secondary"
                        onClick={() => {
                          onMountExerciseOnBoard(selectedExercise.number, { cleanPractice: true });
                          if (onClose) onClose();
                        }}
                        title="Cargar la mesa y pesas limpias sin vectores para que tú dibujes las fuerzas"
                      >
                        <Target size={16} />
                        <span>Cargar Mesa Limpia para Practicar (Sin Vectores)</span>
                      </button>
                      <button
                        className="dcl-mount-board-btn"
                        onClick={() => {
                          onMountExerciseOnBoard(selectedExercise.number, { cleanPractice: false });
                          if (onClose) onClose();
                        }}
                        title="Cargar la mesa con todas las fuerzas ya trazadas y resueltas"
                      >
                        <Sparkles size={16} />
                        <span>Cargar con D.C.L. Resuelto Oficial</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* VIEW 2: ISOLATED DCL BY INDIVIDUAL BODY */
                <div className="dcl-body-card">
                  <div className="dcl-body-card-header">
                    <div>
                      <h4 className="body-name-title">📐 Diagrama de Cuerpo Libre: {currentBody.name}</h4>
                      <span className="body-axes-meta">Orientación de ejes: <strong>{currentBody.axes}</strong></span>
                    </div>
                  </div>

                  {/* SVG Visual Vector Representation of DCL */}
                  <div className="dcl-visual-preview-box">
                    <svg className="dcl-svg-canvas" viewBox="-140 -140 280 280">
                      <defs>
                        <marker id="arrow-red" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
                        </marker>
                        <marker id="arrow-blue" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" />
                        </marker>
                        <marker id="arrow-green" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
                        </marker>
                        <marker id="arrow-amber" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
                        </marker>
                        <marker id="arrow-purple" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#8b5cf6" />
                        </marker>
                        <marker id="arrow-axis" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                          <path d="M 0 2 L 7 5 L 0 8 z" fill="#64748b" />
                        </marker>
                      </defs>

                      {/* Background grid circles */}
                      <circle cx="0" cy="0" r="45" fill="none" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                      <circle cx="0" cy="0" r="90" fill="none" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />

                      {/* Cartesian Coordinate Axes */}
                      <g transform={currentBody.axes.includes('37°') ? 'rotate(-37)' : undefined}>
                        {/* X axis */}
                        <line x1="-110" y1="0" x2="110" y2="0" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow-axis)" />
                        {/* Y axis */}
                        <line x1="0" y1="110" x2="0" y2="-110" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow-axis)" />

                        <text x="120" y="4" fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">+x</text>
                        <text x="-124" y="4" fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">-x</text>
                        <text x="0" y="-118" fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">+y</text>
                        <text x="0" y="125" fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">-y</text>

                        {/* Central Particle / Block */}
                        <rect x="-14" y="-14" width="28" height="28" rx="4" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />
                        <circle cx="0" cy="0" r="3" fill="#0f172a" />

                        {/* Force Vectors */}
                        {currentBody.forces.map((f, fIdx) => {
                          const angleRad = ((f.angleDeg !== undefined ? f.angleDeg : 0) * Math.PI) / 180;
                          const len = 75;
                          const vx = len * Math.cos(angleRad);
                          const vy = -len * Math.sin(angleRad);
                          const markerId = 
                            f.type === 'weight' ? 'arrow-red' :
                            f.type === 'normal' ? 'arrow-blue' :
                            f.type === 'tension' ? 'arrow-green' :
                            f.type === 'friction' ? 'arrow-amber' : 'arrow-purple';

                          const lblX = (len + 16) * Math.cos(angleRad);
                          const lblY = -(len + 16) * Math.sin(angleRad);

                          return (
                            <g key={fIdx}>
                              <line
                                x1="0"
                                y1="0"
                                x2={vx}
                                y2={vy}
                                stroke={f.color || '#ea580c'}
                                strokeWidth="2.8"
                                strokeLinecap="round"
                                markerEnd={`url(#${markerId})`}
                              />
                              <rect
                                x={lblX - 16}
                                y={lblY - 9}
                                width="32"
                                height="17"
                                rx="3"
                                fill="#ffffff"
                                stroke={f.color || '#ea580c'}
                                strokeWidth="1"
                              />
                              <text
                                x={lblX}
                                y={lblY + 3.5}
                                fill={f.color || '#ea580c'}
                                fontSize="10"
                                fontWeight="bold"
                                textAnchor="middle"
                              >
                                {f.symbol}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    </svg>
                    <div className="dcl-preview-legend">
                      <span className="legend-item"><span className="legend-dot red" /> Peso (W)</span>
                      <span className="legend-item"><span className="legend-dot blue" /> Normal (N)</span>
                      <span className="legend-item"><span className="legend-dot green" /> Tensión (T)</span>
                      <span className="legend-item"><span className="legend-dot amber" /> Fricción (fr)</span>
                      <span className="legend-item"><span className="legend-dot purple" /> Aplicada (F)</span>
                    </div>
                  </div>

                  {/* Forces Breakdown Table */}
                  <div className="forces-table-wrapper">
                    <table className="dcl-forces-table">
                      <thead>
                        <tr>
                          <th>Fuerza</th>
                          <th>Símbolo</th>
                          <th>Origen / Clasificación</th>
                          <th>Dirección / Sentido</th>
                          <th>Módulo / Componentes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentBody.forces.map((f, fIdx) => (
                          <tr key={fIdx}>
                            <td className="fw-600">{f.name}</td>
                            <td>
                              <span className="symbol-badge" style={{ color: f.color, borderColor: f.color }}>
                                {f.symbol}
                              </span>
                            </td>
                            <td>
                              <span className={`origin-badge ${f.origin.includes('distancia') ? 'remote' : 'contact'}`}>
                                {f.origin}
                              </span>
                            </td>
                            <td className="text-secondary">{f.direction}</td>
                            <td className="font-mono">{f.label}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Equilibrium Equations Box */}
                  <div className="equations-box">
                    <div className="equations-box-header">
                      <Sparkles size={14} className="sparkle-orange" />
                      <span>Ecuaciones Fundamentales de Equilibrio (2da Ley de Newton):</span>
                    </div>
                    <div className="equations-list">
                      {currentBody.equations.map((eq, eqIdx) => (
                        <div key={eqIdx} className="equation-item">
                          <code>{eq}</code>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Qualitative / Quantitative Analysis */}
                  <div className="analysis-box">
                    <strong>Análisis Físico del DCL:</strong>
                    <p>{currentBody.analysis}</p>
                  </div>

                  {/* Numerical Results Card (if present, like Problem 11) */}
                  {selectedExercise.numericalResults && (
                    <div className="numerical-results-card">
                      <h5 className="results-card-title">Cálculos Numéricos Completos del Sistema:</h5>
                      <div className="results-grid">
                        <div className="result-pill">
                          <span className="result-k">Fuerza Neta:</span>
                          <span className="result-v">{selectedExercise.numericalResults.netForce}</span>
                        </div>
                        <div className="result-pill">
                          <span className="result-k">Masa Total:</span>
                          <span className="result-v">{selectedExercise.numericalResults.totalMass}</span>
                        </div>
                        <div className="result-pill highlight">
                          <span className="result-k">Aceleración (a):</span>
                          <span className="result-v green">{selectedExercise.numericalResults.acceleration}</span>
                        </div>
                        <div className="result-pill">
                          <span className="result-k">Fricción (fk):</span>
                          <span className="result-v">{selectedExercise.numericalResults.fk}</span>
                        </div>
                        <div className="result-pill">
                          <span className="result-k">Tensión Cuerda 1 (T₁):</span>
                          <span className="result-v">{selectedExercise.numericalResults.T1}</span>
                        </div>
                        <div className="result-pill">
                          <span className="result-k">Tensión Cuerda 2 (T₂):</span>
                          <span className="result-v">{selectedExercise.numericalResults.T2}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Button: Mount on whiteboard */}
                  {onMountExerciseOnBoard && (
                    <div className="dcl-action-footer">
                      <button
                        className="dcl-mount-board-btn secondary"
                        onClick={() => {
                          onMountExerciseOnBoard(selectedExercise.number, { cleanPractice: true });
                          if (onClose) onClose();
                        }}
                        title="Cargar el diagrama limpio sin vectores para que tú dibujes las fuerzas"
                      >
                        <Target size={16} />
                        <span>Cargar Limpio para Practicar (Sin Vectores)</span>
                      </button>
                      <button
                        className="dcl-mount-board-btn"
                        onClick={() => {
                          onMountExerciseOnBoard(selectedExercise.number, { cleanPractice: false });
                          if (onClose) onClose();
                        }}
                        title="Cargar con el DCL resuelto oficial trazado en la pizarra"
                      >
                        <Sparkles size={16} />
                        <span>Cargar con D.C.L. Resuelto Oficial</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Theory Questions Quiz */}
        {activeTab === 'theory' && (
          <div className="dcl-tab-content theory-tab-layout">
            <div className="theory-header-banner">
              <div>
                <h3 className="theory-banner-title">
                  Forma 1: Preguntas Conceptuales Oficiales (HT02)
                </h3>
                <p className="theory-banner-sub">
                  Responde las 5 preguntas del examen de lectura y comprueba tus respuestas con las justificaciones oficiales de la física newtoniana.
                </p>
              </div>
              <div className="theory-score-pill">
                Puntuación: <strong>{calculateScore()} / {DCL_THEORY_QUESTIONS.length}</strong>
              </div>
            </div>

            {/* Questions List */}
            <div className="theory-questions-scroll">
              {DCL_THEORY_QUESTIONS.map((q) => {
                const selectedOpt = userAnswers[q.id];
                const isAnswered = selectedOpt !== undefined;
                const isCorrect = selectedOpt === q.correctIndex;

                return (
                  <div key={q.id} className="theory-question-card">
                    <div className="theory-q-header">
                      <span className="theory-q-num">Pregunta {q.number}</span>
                      {showResults && isAnswered && (
                        <span className={`status-chip ${isCorrect ? 'correct' : 'wrong'}`}>
                          {isCorrect ? (
                            <>
                              <CheckCircle2 size={13} /> Correcto
                            </>
                          ) : (
                            <>
                              <XCircle size={13} /> Incorrecto
                            </>
                          )}
                        </span>
                      )}
                    </div>
                    <p className="theory-q-text">{q.question}</p>

                    <div className="theory-options-list">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = selectedOpt === optIdx;
                        let optionClass = '';
                        if (isChosen) optionClass = 'chosen';
                        if (showResults) {
                          if (optIdx === q.correctIndex) optionClass = 'is-correct';
                          else if (isChosen && !isCorrect) optionClass = 'is-wrong';
                        }

                        return (
                          <button
                            key={optIdx}
                            className={`theory-option-btn ${optionClass}`}
                            onClick={() => handleSelectOption(q.id, optIdx)}
                          >
                            <span className="option-letter">{String.fromCharCode(97 + optIdx)})</span>
                            <span className="option-text">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Official Pedagogical Feedback */}
                    {showResults && (
                      <div className="theory-explanation-box">
                        <div className="explanation-title">
                          <ShieldCheck size={14} className="icon-shield" />
                          <span>Justificación Física Oficial:</span>
                        </div>
                        <p className="explanation-text">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Theory Action Footer */}
            <div className="theory-action-footer">
              <button
                className="btn-validate-theory"
                onClick={() => setShowResults((prev) => !prev)}
              >
                <Sparkles size={16} />
                <span>{showResults ? 'Ocultar Justificaciones' : 'Validar y Ver Justificaciones Oficiales'}</span>
              </button>
            </div>
          </div>
        )}

        <style>{`
          .dcl-modal-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.65);
            backdrop-filter: blur(5px);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            animation: fadeIn 0.15s ease-out;
          }

          .dcl-modal-container {
            background: #ffffff;
            width: 100%;
            max-width: 1100px;
            height: 92vh;
            border-radius: 16px;
            box-shadow: 0 25px 60px rgba(15, 23, 42, 0.35);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid #e2e8f0;
          }

          .dcl-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 24px;
            background: #ffffff;
            border-bottom: 1px solid #e2e8f0;
          }

          .dcl-header-title-group {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .dcl-header-icon-box {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background: #fff7ed;
            color: #ea580c;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #ffedd5;
          }

          .dcl-header-badge {
            font-size: 0.68rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #ea580c;
          }

          .dcl-modal-title {
            margin: 0;
            font-size: 1.18rem;
            font-weight: 800;
            color: #0f172a;
          }

          .dcl-close-btn {
            background: transparent;
            border: none;
            color: #64748b;
            cursor: pointer;
            padding: 6px;
            border-radius: 8px;
            transition: all 0.15s;
          }

          .dcl-close-btn:hover {
            background: #f1f5f9;
            color: #0f172a;
          }

          .dcl-modal-tabs {
            display: flex;
            gap: 8px;
            padding: 10px 24px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
          }

          .dcl-tab-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            background: transparent;
            border: 1px solid transparent;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 0.82rem;
            font-weight: 700;
            color: #64748b;
            cursor: pointer;
            transition: all 0.15s;
          }

          .dcl-tab-btn:hover {
            color: #0f172a;
            background: rgba(255, 255, 255, 0.7);
          }

          .dcl-tab-btn.active {
            background: #ffffff;
            color: #ea580c;
            border-color: #fed7aa;
            box-shadow: 0 2px 6px rgba(234, 88, 12, 0.08);
          }

          .tab-pill-count {
            background: #ffedd5;
            color: #9a3412;
            padding: 1px 7px;
            border-radius: 12px;
            font-size: 0.72rem;
            font-weight: 800;
          }

          .dcl-tab-content {
            flex: 1;
            overflow: hidden;
            display: flex;
          }

          /* Exercises Layout */
          .exercises-tab-layout {
            display: flex;
            height: 100%;
          }

          .dcl-exercises-sidebar {
            width: 310px;
            background: #f8fafc;
            border-right: 1px solid #e2e8f0;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
          }

          .sidebar-header {
            padding: 12px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.72rem;
            font-weight: 800;
            letter-spacing: 0.04em;
            color: #64748b;
            border-bottom: 1px solid #e2e8f0;
          }

          .sidebar-scroll-list {
            flex: 1;
            overflow-y: auto;
            padding: 8px;
          }

          .sidebar-item {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            margin-bottom: 4px;
            background: transparent;
            border: 1px solid transparent;
            border-radius: 8px;
            cursor: pointer;
            text-align: left;
            transition: all 0.15s;
          }

          .sidebar-item:hover {
            background: #ffffff;
            border-color: #e2e8f0;
          }

          .sidebar-item.active {
            background: #ffffff;
            border-color: #fed7aa;
            box-shadow: 0 3px 10px rgba(234, 88, 12, 0.08);
          }

          .sidebar-item-badge {
            background: #f1f5f9;
            color: #475569;
            font-size: 0.76rem;
            font-weight: 800;
            padding: 4px 8px;
            border-radius: 6px;
          }

          .sidebar-item.active .sidebar-item-badge {
            background: #ea580c;
            color: #ffffff;
          }

          .sidebar-item-info {
            flex: 1;
            min-width: 0;
          }

          .sidebar-item-title {
            display: block;
            font-size: 0.82rem;
            font-weight: 700;
            color: #0f172a;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .sidebar-item-sub {
            display: block;
            font-size: 0.70rem;
            color: #64748b;
          }

          .sidebar-item-chevron {
            color: #94a3b8;
          }

          /* Main Solver Panel */
          .dcl-exercise-main-panel {
            flex: 1;
            overflow-y: auto;
            padding: 20px 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .exercise-header-card {
            background: #fffaf5;
            border: 1px solid #ffedd5;
            border-radius: 12px;
            padding: 16px 20px;
          }

          .exercise-number-badge {
            font-size: 0.70rem;
            font-weight: 800;
            color: #c2410c;
            letter-spacing: 0.05em;
            margin-bottom: 4px;
          }

          .exercise-title {
            margin: 0 0 4px 0;
            font-size: 1.15rem;
            font-weight: 800;
            color: #0f172a;
          }

          .exercise-subtitle {
            margin: 0 0 10px 0;
            font-size: 0.84rem;
            color: #64748b;
          }

          .exercise-scenario-box {
            background: #ffffff;
            border-left: 3px solid #ea580c;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 0.84rem;
            color: #334155;
            line-height: 1.4;
            margin-bottom: 8px;
          }

          .critical-point-banner {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #fff7ed;
            border: 1px dashed #fdba74;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 0.78rem;
            color: #9a3412;
          }

          .critical-point-icon {
            color: #ea580c;
            flex-shrink: 0;
          }

          .body-selector-tabs {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .body-tabs-label {
            font-size: 0.78rem;
            font-weight: 700;
            color: #475569;
          }

          .body-tab-chip {
            display: flex;
            align-items: center;
            gap: 6px;
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.76rem;
            font-weight: 700;
            color: #475569;
            cursor: pointer;
            transition: all 0.15s;
          }

          .body-tab-chip.active {
            background: #ea580c;
            color: #ffffff;
            border-color: #ea580c;
          }

          .apparatus-mode-switch-bar {
            display: flex;
            gap: 8px;
            margin-bottom: 14px;
            background: #fffaf5;
            border: 1px solid #fed7aa;
            padding: 5px;
            border-radius: 10px;
          }

          .apparatus-tab-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            background: transparent;
            border: none;
            padding: 7px 14px;
            border-radius: 8px;
            font-size: 0.78rem;
            font-weight: 700;
            color: #9a3412;
            cursor: pointer;
            transition: all 0.15s;
          }

          .apparatus-tab-btn:hover {
            background: #ffedd5;
          }

          .apparatus-tab-btn.active {
            background: #ea580c;
            color: #ffffff;
            box-shadow: 0 2px 6px rgba(234, 88, 12, 0.25);
          }

          .apparatus-preview-box {
            background: #ffffff;
            border: 1px solid #e2e8f0;
          }

          .dcl-body-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 18px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
          }

          .dcl-body-card-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
          }

          .body-name-title {
            margin: 0 0 2px 0;
            font-size: 1.05rem;
            font-weight: 800;
            color: #0f172a;
          }

          .body-axes-meta {
            font-size: 0.78rem;
            color: #64748b;
          }

          .dcl-visual-preview-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 16px;
          }

          .dcl-svg-canvas {
            width: 100%;
            max-width: 320px;
            height: 250px;
          }

          .dcl-preview-legend {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 10px;
            font-size: 0.72rem;
            color: #475569;
            font-weight: 600;
          }

          .legend-item {
            display: flex;
            align-items: center;
            gap: 5px;
          }

          .legend-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
          }
          .legend-dot.red { background: #ef4444; }
          .legend-dot.blue { background: #3b82f6; }
          .legend-dot.green { background: #10b981; }
          .legend-dot.amber { background: #f59e0b; }
          .legend-dot.purple { background: #8b5cf6; }

          .forces-table-wrapper {
            overflow-x: auto;
          }

          .dcl-forces-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.78rem;
            text-align: left;
          }

          .dcl-forces-table th {
            background: #f8fafc;
            color: #475569;
            font-weight: 700;
            padding: 8px 10px;
            border-bottom: 2px solid #e2e8f0;
          }

          .dcl-forces-table td {
            padding: 8px 10px;
            border-bottom: 1px solid #f1f5f9;
            color: #1e293b;
          }

          .symbol-badge {
            font-family: monospace;
            font-weight: 800;
            font-size: 0.85rem;
            padding: 2px 6px;
            border-radius: 4px;
            border: 1px solid;
            background: #ffffff;
          }

          .origin-badge {
            font-size: 0.70rem;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 12px;
          }
          .origin-badge.contact { background: #e0f2fe; color: #0369a1; }
          .origin-badge.remote { background: #fef2f2; color: #b91c1c; }

          .equations-box {
            background: #0f172a;
            border-radius: 8px;
            padding: 12px 16px;
            color: #ffffff;
          }

          .equations-box-header {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.75rem;
            font-weight: 700;
            color: #fdba74;
            margin-bottom: 8px;
          }

          .sparkle-orange { color: #ea580c; }

          .equations-list {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .equation-item code {
            font-family: monospace;
            font-size: 0.82rem;
            color: #fed7aa;
          }

          .analysis-box {
            background: #f8fafc;
            border-left: 3px solid #3b82f6;
            padding: 10px 14px;
            border-radius: 4px;
            font-size: 0.80rem;
            color: #334155;
            line-height: 1.45;
          }

          .numerical-results-card {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 12px 14px;
          }

          .results-card-title {
            margin: 0 0 8px 0;
            font-size: 0.82rem;
            font-weight: 800;
            color: #166534;
          }

          .results-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 8px;
          }

          .result-pill {
            background: #ffffff;
            border: 1px solid #dcfce7;
            padding: 6px 8px;
            border-radius: 6px;
            display: flex;
            flex-direction: column;
          }

          .result-pill.highlight {
            border-color: #86efac;
            background: #fafffc;
          }

          .result-k {
            font-size: 0.68rem;
            color: #64748b;
            font-weight: 600;
          }

          .result-v {
            font-size: 0.84rem;
            font-weight: 800;
            color: #0f172a;
          }
          .result-v.green { color: #16a34a; }

          .dcl-action-footer {
            margin-top: 10px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }

          .dcl-mount-board-btn {
            flex: 1;
            min-width: 220px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            background: #ea580c;
            color: #ffffff;
            border: 1px solid #ea580c;
            padding: 11px 18px;
            border-radius: 8px;
            font-size: 0.88rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.15s;
          }

          .dcl-mount-board-btn:hover {
            background: #c2410c;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25);
          }

          .dcl-mount-board-btn.secondary {
            background: #ffffff;
            color: #0f172a;
            border: 1.5px solid #cbd5e1;
          }

          .dcl-mount-board-btn.secondary:hover {
            background: #f8fafc;
            border-color: #94a3b8;
            color: #ea580c;
            box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
          }

          /* Theory Tab Styles */
          .theory-tab-layout {
            flex-direction: column;
            height: 100%;
          }

          .theory-header-banner {
            padding: 16px 24px;
            background: #fffaf5;
            border-bottom: 1px solid #ffedd5;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .theory-banner-title {
            margin: 0 0 2px 0;
            font-size: 1.05rem;
            font-weight: 800;
            color: #9a3412;
          }

          .theory-banner-sub {
            margin: 0;
            font-size: 0.80rem;
            color: #7c2d12;
          }

          .theory-score-pill {
            background: #ea580c;
            color: #ffffff;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.84rem;
            font-weight: 600;
          }

          .theory-questions-scroll {
            flex: 1;
            overflow-y: auto;
            padding: 20px 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .theory-question-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px 18px;
          }

          .theory-q-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }

          .theory-q-num {
            font-size: 0.72rem;
            font-weight: 800;
            text-transform: uppercase;
            color: #ea580c;
          }

          .status-chip {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 0.72rem;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 12px;
          }
          .status-chip.correct { background: #dcfce7; color: #166534; }
          .status-chip.wrong { background: #fee2e2; color: #991b1b; }

          .theory-q-text {
            font-size: 0.88rem;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 12px 0;
            line-height: 1.4;
          }

          .theory-options-list {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .theory-option-btn {
            display: flex;
            align-items: baseline;
            gap: 8px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 9px 12px;
            text-align: left;
            cursor: pointer;
            transition: all 0.15s;
          }

          .theory-option-btn:hover {
            background: #f1f5f9;
            border-color: #cbd5e1;
          }

          .theory-option-btn.chosen {
            background: #fff7ed;
            border-color: #fdba74;
          }

          .theory-option-btn.is-correct {
            background: #f0fdf4;
            border-color: #86efac;
            color: #166534;
          }

          .theory-option-btn.is-wrong {
            background: #fef2f2;
            border-color: #fca5a5;
            color: #991b1b;
          }

          .option-letter {
            font-weight: 800;
            font-size: 0.82rem;
            color: #ea580c;
          }

          .option-text {
            font-size: 0.82rem;
            color: inherit;
            line-height: 1.35;
          }

          .theory-explanation-box {
            margin-top: 12px;
            background: #f8fafc;
            border-left: 3px solid #10b981;
            padding: 10px 14px;
            border-radius: 4px;
          }

          .explanation-title {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.76rem;
            font-weight: 800;
            color: #059669;
            margin-bottom: 4px;
          }

          .explanation-text {
            margin: 0;
            font-size: 0.80rem;
            color: #334155;
            line-height: 1.45;
          }

          .theory-action-footer {
            padding: 12px 24px;
            border-top: 1px solid #e2e8f0;
            background: #ffffff;
            display: flex;
            justify-content: flex-end;
          }

          .btn-validate-theory {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #ea580c;
            color: #ffffff;
            border: none;
            padding: 9px 18px;
            border-radius: 8px;
            font-size: 0.84rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.15s;
          }

          .btn-validate-theory:hover {
            background: #c2410c;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.98); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
}
