import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  Globe, 
  Gauge, 
  Activity,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function PhysicsSimulationBar({
  isSimulating,
  onToggleSimulate,
  onResetSimulation,
  onStepSimulation,
  gravityPreset = 'earth',
  onChangeGravity,
  metrics,
  hasPhysicsObjects = true,
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!hasPhysicsObjects) return null;

  const gravities = [
    { id: 'earth', label: 'Tierra (9.8 m/s²)', value: 9.8, scale: 1.0 },
    { id: 'moon', label: 'Luna (1.6 m/s²)', value: 1.62, scale: 0.165 },
    { id: 'jupiter', label: 'Júpiter (24.8 m/s²)', value: 24.79, scale: 2.53 },
    { id: 'zero', label: 'Cero G (0 m/s²)', value: 0, scale: 0.0 },
  ];

  return (
    <div className="physics-sim-floating-island miro-island">
      {/* Primary Simulation Controls */}
      <div className="sim-primary-row">
        {/* Play / Pause Button */}
        <button
          className={`sim-action-btn ${isSimulating ? 'active-sim' : 'idle-sim'}`}
          onClick={onToggleSimulate}
          title={isSimulating ? 'Pausar simulación (Espacio)' : 'Iniciar simulación física real (Espacio)'}
        >
          {isSimulating ? (
            <>
              <Pause size={16} className="sim-icon" />
              <span className="btn-label">Pausar</span>
            </>
          ) : (
            <>
              <Play size={16} className="sim-icon" />
              <span className="btn-label">Simular</span>
            </>
          )}
          <span className={`sim-pulse-dot ${isSimulating ? 'pulsing' : ''}`} />
        </button>

        {/* Step Button */}
        <button
          className="sim-icon-btn"
          onClick={onStepSimulation}
          title="Avanzar 1 fotograma (Paso a paso)"
          disabled={isSimulating}
        >
          <ChevronRight size={17} />
        </button>

        {/* Reset Button */}
        <button
          className="sim-icon-btn"
          onClick={onResetSimulation}
          title="Reiniciar posiciones iniciales"
        >
          <RotateCcw size={15} />
        </button>

        <div className="sim-divider" />

        {/* Gravity Selector */}
        <div className="sim-gravity-group">
          <Globe size={14} className="gravity-icon" />
          <select
            className="sim-gravity-select"
            value={gravityPreset}
            onChange={(e) => onChangeGravity && onChangeGravity(e.target.value)}
            title="Seleccionar aceleración de gravedad"
          >
            {gravities.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        {/* Toggle Telemetry expansion */}
        <button
          className="sim-toggle-expand-btn"
          onClick={() => setIsExpanded((prev) => !prev)}
          title={isExpanded ? 'Ocultar telemetría' : 'Mostrar telemetría en tiempo real'}
        >
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Real-time Educational Physics Telemetry HUD */}
      {isExpanded && metrics && (
        <div className="sim-telemetry-strip">
          {metrics.type === 'movimiento_proyectiles' ? (
            <>
              <div className="telemetry-badge proyectil-mode">
                <span className="telemetry-label">Fase:</span>
                <span className={`telemetry-value ${metrics.stage?.includes('Impacto') ? 'rose' : (metrics.stage?.includes('APEX') ? 'amber' : 'purple')}`}>
                  {metrics.stage || 'Tiro Parabólico 2D'}
                </span>
              </div>
              <div className="telemetry-badge">
                <span className="telemetry-label">v_x:</span>
                <span className="telemetry-value highlight">{metrics.vx !== undefined ? `${typeof metrics.vx === 'number' ? metrics.vx.toFixed(1) : metrics.vx} m/s` : '0.0 m/s'}</span>
              </div>
              <div className="telemetry-badge">
                <span className="telemetry-label">v_y(t):</span>
                <span className={`telemetry-value ${Number(metrics.vy) > 0 ? 'emerald' : (Number(metrics.vy) < 0 ? 'rose' : 'amber')}`}>
                  {metrics.vy !== undefined ? `${Number(metrics.vy) > 0 ? '+' : ''}${typeof metrics.vy === 'number' ? metrics.vy.toFixed(1) : metrics.vy} m/s` : '0.0 m/s'}
                </span>
              </div>
              <div className="telemetry-badge">
                <span className="telemetry-label">v_res:</span>
                <span className="telemetry-value purple">
                  {metrics.vResultant !== undefined ? `${typeof metrics.vResultant === 'number' ? metrics.vResultant.toFixed(1) : metrics.vResultant} m/s` : '0.0 m/s'} ({metrics.thetaDeg || 0}°)
                </span>
              </div>
              <div className="telemetry-badge">
                <span className="telemetry-label">Alcance x:</span>
                <span className="telemetry-value highlight">x = {metrics.rangeM || '0.00'} m</span>
              </div>
              <div className="telemetry-badge">
                <span className="telemetry-label">Altura y:</span>
                <span className="telemetry-value emerald">y = {metrics.heightM || '0.00'} m</span>
              </div>
              <div className="telemetry-badge">
                <span className="telemetry-label">H_máx:</span>
                <span className="telemetry-value amber">{metrics.maxHeight || '0.00'} m</span>
              </div>
              <div className="telemetry-badge equation">
                <span className="telemetry-label">Ecuación:</span>
                <span className="telemetry-value math-eq">v_x=v₀cosθ | y=v₀y·t - ½gt²</span>
              </div>
              <div className="telemetry-badge time">
                <span className="telemetry-label">Tiempo:</span>
                <span className="telemetry-value">{metrics.time || '0.0'} s</span>
              </div>
            </>
          ) : metrics.type === 'lanzamiento_horizontal' ? (
            <>
              <div className="telemetry-badge horizontal-mode">
                <span className="telemetry-label">Fase:</span>
                <span className={`telemetry-value ${metrics.stage?.includes('Impacto') ? 'rose' : 'emerald'}`}>
                  {metrics.stage || 'Vuelo Parabólico ↷'}
                </span>
              </div>
              <div className="telemetry-badge">
                <span className="telemetry-label">v_x (MRU):</span>
                <span className="telemetry-value highlight">{metrics.vx !== undefined ? `${typeof metrics.vx === 'number' ? metrics.vx.toFixed(1) : metrics.vx} m/s` : '0.0 m/s'}</span>
              </div>
              <div className="telemetry-badge">
                <span className="telemetry-label">v_y (Caída):</span>
                <span className="telemetry-value rose">{metrics.vy !== undefined ? `${typeof metrics.vy === 'number' ? metrics.vy.toFixed(1) : metrics.vy} m/s` : '0.0 m/s'}</span>
              </div>
              <div className="telemetry-badge">
                <span className="telemetry-label">v_resultante:</span>
                <span className="telemetry-value emerald">
                  v = {metrics.vResultant !== undefined ? `${typeof metrics.vResultant === 'number' ? metrics.vResultant.toFixed(1) : metrics.vResultant} m/s` : '0.0 m/s'} ({metrics.angleDeg || 0}°)
                </span>
              </div>
              <div className="telemetry-badge">
                <span className="telemetry-label">Alcance x:</span>
                <span className="telemetry-value highlight">x = {metrics.rangeM || '0.00'} m</span>
              </div>
              <div className="telemetry-badge">
                <span className="telemetry-label">Altura h:</span>
                <span className="telemetry-value amber">h = {metrics.heightM || '0.00'} m</span>
              </div>
              <div className="telemetry-badge equation">
                <span className="telemetry-label">Ecuación:</span>
                <span className="telemetry-value math-eq">x = v₀·t | y = ½g·t²</span>
              </div>
              <div className="telemetry-badge time">
                <span className="telemetry-label">Tiempo:</span>
                <span className="telemetry-value">{metrics.time || '0.0'} s</span>
              </div>
            </>
          ) : metrics.type === 'tiro_vertical' ? (
            <>
              <div className="telemetry-badge tiro-vertical-mode">
                <span className="telemetry-label">Fase:</span>
                <span className={`telemetry-value ${metrics.stage?.includes('CÚSPIDE') ? 'amber' : (metrics.stage?.includes('Bajando') ? 'rose' : 'emerald')}`}>
                  {metrics.stage || 'Lanzamiento ↑'}
                </span>
              </div>
              <div className="telemetry-badge">
                <span className="telemetry-label">Velocidad v(t):</span>
                <span className={`telemetry-value ${metrics.vel > 0 ? 'emerald' : (metrics.vel < 0 ? 'rose' : 'amber')}`}>
                  {metrics.vel !== undefined ? `${metrics.vel > 0 ? '+' : ''}${typeof metrics.vel === 'number' ? metrics.vel.toFixed(2) : metrics.vel} m/s` : '0.00 m/s'}
                </span>
              </div>
              <div className="telemetry-badge">
                <span className="telemetry-label">Altura h(t):</span>
                <span className="telemetry-value highlight">{metrics.height || '0.00'} m</span>
              </div>
              <div className="telemetry-badge">
                <span className="telemetry-label">h_máx:</span>
                <span className="telemetry-value purple">{metrics.maxHeight || '0.00'} m</span>
              </div>
              <div className="telemetry-badge">
                <span className="telemetry-label">g:</span>
                <span className="telemetry-value">{metrics.accel ? `${metrics.accel} m/s²` : '9.80 m/s²'}</span>
              </div>
              <div className="telemetry-badge equation">
                <span className="telemetry-label">Ecuación:</span>
                <span className="telemetry-value math-eq">v = v₀ - g·t | h = v₀·t - ½g·t²</span>
              </div>
              <div className="telemetry-badge time">
                <span className="telemetry-label">Tiempo:</span>
                <span className="telemetry-value">{metrics.time || '0.0'} s</span>
              </div>
            </>
          ) : metrics.type === 'freefall' ? (
            <>
              <div className="telemetry-badge freefall-mode">
                <span className="telemetry-label">Caída Libre:</span>
                <span className="telemetry-value rose">v₀ = 0 | g = {metrics.accel || 9.8} m/s²</span>
              </div>
              <div className="telemetry-badge">
                <span className="telemetry-label">Velocidad:</span>
                <span className="telemetry-value emerald">
                  v = {metrics.vel !== undefined ? `${typeof metrics.vel === 'number' ? metrics.vel.toFixed(2) : metrics.vel} m/s` : '0.00 m/s'}
                </span>
              </div>
              <div className="telemetry-badge">
                <span className="telemetry-label">Distancia caída:</span>
                <span className="telemetry-value highlight">y = {metrics.dist || '0.00'} m</span>
              </div>
              <div className="telemetry-badge equation">
                <span className="telemetry-label">Ecuación:</span>
                <span className="telemetry-value math-eq">v = g·t | y = ½g·t²</span>
              </div>
              <div className="telemetry-badge time">
                <span className="telemetry-label">Tiempo:</span>
                <span className="telemetry-value">{metrics.time || '0.0'} s</span>
              </div>
            </>
          ) : metrics.type === 'mruv' ? (
            <>
              <div className="telemetry-badge mruv-mode">
                <span className="telemetry-label">MRUV:</span>
                <span className="telemetry-value amber">a = {metrics.accel ? `${metrics.accel.toFixed(2)} m/s²` : '0.00 m/s²'}</span>
              </div>
              <div className="telemetry-badge">
                <span className="telemetry-label">Velocidad:</span>
                <span className="telemetry-value emerald">
                  v = {metrics.vel !== undefined ? `${metrics.vel > 0 ? '+' : ''}${typeof metrics.vel === 'number' ? metrics.vel.toFixed(metrics.vel % 1 === 0 ? 0 : 2) : metrics.vel} ${metrics.unit || 'm/s'}` : '0.0 m/s'}
                </span>
              </div>
              <div className="telemetry-badge">
                <span className="telemetry-label">Distancia:</span>
                <span className="telemetry-value">d = {metrics.dist || '0.00'} m</span>
              </div>
              <div className="telemetry-badge equation">
                <span className="telemetry-label">Ecuación:</span>
                <span className="telemetry-value math-eq">v = v₀ + a·t | x = v₀·t + ½a·t²</span>
              </div>
              <div className="telemetry-badge time">
                <span className="telemetry-label">Tiempo:</span>
                <span className="telemetry-value">{metrics.time || '0.0'} s</span>
              </div>
            </>
          ) : metrics.type === 'mru' ? (
            <>
              <div className="telemetry-badge mru-mode">
                <span className="telemetry-label">MRU:</span>
                <span className="telemetry-value highlight">a = 0 (v = cte)</span>
              </div>
              <div className="telemetry-badge">
                <span className="telemetry-label">Velocidad:</span>
                <span className="telemetry-value emerald">
                  v = {metrics.vel !== undefined ? `${metrics.vel > 0 ? '+' : ''}${typeof metrics.vel === 'number' ? metrics.vel.toFixed(metrics.vel % 1 === 0 ? 0 : 2) : metrics.vel} ${metrics.unit || 'm/s'}` : '0.0 m/s'}
                </span>
              </div>
              <div className="telemetry-badge">
                <span className="telemetry-label">Distancia:</span>
                <span className="telemetry-value">d = {metrics.dist || '0.00'} m</span>
              </div>
              <div className="telemetry-badge equation">
                <span className="telemetry-label">Ecuación:</span>
                <span className="telemetry-value math-eq">x(t) = x₀ + v·t</span>
              </div>
              <div className="telemetry-badge time">
                <span className="telemetry-label">Tiempo:</span>
                <span className="telemetry-value">{metrics.time || '0.0'} s</span>
              </div>
            </>
          ) : (
            <>
              <div className="telemetry-badge">
                <span className="telemetry-label">Aceleración:</span>
                <span className="telemetry-value highlight">
                  a = {metrics.accel ? `${metrics.accel.toFixed(2)} m/s²` : '0.00 m/s²'}
                </span>
              </div>

              <div className="telemetry-badge">
                <span className="telemetry-label">Tensión Cuerda:</span>
                <span className="telemetry-value">
                  T = {metrics.tension ? `${metrics.tension.toFixed(1)} N` : '0.0 N'}
                </span>
              </div>

              <div className="telemetry-badge">
                <span className="telemetry-label">Velocidad:</span>
                <span className="telemetry-value">
                  v = {metrics.velA !== undefined ? `${Math.abs(metrics.velA)} m/s` : '0.00 m/s'}
                </span>
              </div>

              <div className="telemetry-badge time">
                <span className="telemetry-label">Tiempo:</span>
                <span className="telemetry-value">{metrics.time || '0.0'} s</span>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        .physics-sim-floating-island {
          position: fixed;
          top: 66px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 55;
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(8px);
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
          overflow: hidden;
          transition: all 0.2s ease;
          animation: simSlideDown 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes simSlideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -10px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }

        .sim-primary-row {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
        }

        .sim-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 8px;
          border: none;
          font-family: var(--font-sans);
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.14s ease;
        }

        .sim-action-btn.idle-sim {
          background: #2563eb;
          color: #ffffff;
          box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
        }

        .sim-action-btn.idle-sim:hover {
          background: #1d4ed8;
        }

        .sim-action-btn.active-sim {
          background: #f59e0b;
          color: #ffffff;
          box-shadow: 0 2px 6px rgba(245, 158, 11, 0.3);
        }

        .sim-action-btn.active-sim:hover {
          background: #d97706;
        }

        .sim-pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #ffffff;
          opacity: 0.7;
        }

        .sim-pulse-dot.pulsing {
          opacity: 1;
          animation: pulseAnim 1s infinite alternate;
        }

        @keyframes pulseAnim {
          from { transform: scale(0.85); opacity: 0.5; }
          to { transform: scale(1.3); opacity: 1; }
        }

        .sim-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 7px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          cursor: pointer;
          transition: all 0.12s;
        }

        .sim-icon-btn:hover:not(:disabled) {
          background: #f1f5f9;
          color: #0f172a;
          border-color: #cbd5e1;
        }

        .sim-icon-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .sim-divider {
          width: 1px;
          height: 20px;
          background: #e2e8f0;
          margin: 0 3px;
        }

        .sim-gravity-group {
          display: flex;
          align-items: center;
          gap: 5px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 7px;
          padding: 2px 8px;
        }

        .gravity-icon {
          color: #64748b;
        }

        .sim-gravity-select {
          background: transparent;
          border: none;
          outline: none;
          font-family: var(--font-sans);
          font-size: 0.76rem;
          font-weight: 600;
          color: #1e293b;
          cursor: pointer;
        }

        .sim-toggle-expand-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: none;
          background: transparent;
          color: #94a3b8;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.12s;
        }

        .sim-toggle-expand-btn:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .sim-telemetry-strip {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 6px 14px 8px;
          background: #f8fafc;
          border-top: 1px solid #f1f3f7;
          font-size: 0.72rem;
        }

        .telemetry-badge {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .telemetry-label {
          color: #64748b;
          font-weight: 500;
        }

        .telemetry-value {
          font-weight: 700;
          color: #0f172a;
          font-variant-numeric: tabular-nums;
        }

        .telemetry-value.highlight {
          color: #2563eb;
        }

        .telemetry-value.emerald {
          color: #059669;
        }

        .telemetry-value.amber {
          color: #d97706;
        }

        .telemetry-value.rose {
          color: #e11d48;
        }

        .telemetry-value.purple {
          color: #7c3aed;
        }

        .telemetry-badge.mru-mode {
          background: #eff6ff;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .telemetry-badge.mruv-mode {
          background: #fef3c7;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .telemetry-badge.freefall-mode {
          background: #ffe4e6;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .telemetry-badge.tiro-vertical-mode {
          background: #f3e8ff;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .telemetry-badge.horizontal-mode {
          background: #e0f2fe;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .telemetry-badge.proyectil-mode {
          background: #f3e8ff;
          border: 1px solid #d8b4fe;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .telemetry-value.math-eq {
          font-family: 'Times New Roman', Times, serif;
          font-style: italic;
          color: #7c3aed;
        }

        .telemetry-badge.time .telemetry-value {
          color: #64748b;
        }
      `}</style>
    </div>
  );
}
