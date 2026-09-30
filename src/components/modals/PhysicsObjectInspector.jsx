import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sliders, 
  Gauge, 
  Clock, 
  ArrowRight, 
  Layers, 
  Weight, 
  Check, 
  Timer,
  Sparkles
} from 'lucide-react';
import { CONVERSIONS } from '../../services/mruExerciseSolver';

export default function PhysicsObjectInspector({
  element,
  isOpen,
  onClose,
  onUpdateElement,
}) {
  if (!isOpen || !element || element.type !== 'physics_object') return null;

  const props = element.properties || {};

  // Form states initialized from element
  const [label, setLabel] = useState(props.label || element.name || 'Móvil MRU');
  
  // Speed
  const rawVel = props.displayVelocity !== undefined ? props.displayVelocity : (props.velocity !== undefined ? props.velocity : 2.0);
  const [velocityValue, setVelocityValue] = useState(rawVel);
  const [velocityUnit, setVelocityUnit] = useState(props.unit || 'm/s');
  
  // Departure Time
  const [departureTime, setDepartureTime] = useState(props.departureTime || '');
  
  // Vector
  const [showVector, setShowVector] = useState(props.showVector !== false);
  
  // Color
  const [color, setColor] = useState(element.color || props.color || '#0284c7');

  // Track Length
  const [trackLength, setTrackLength] = useState(props.lengthMeters || 6.0);
  const [trackUnit, setTrackUnit] = useState(props.lengthUnit || 'm');

  // Mass
  const [massKg, setMassKg] = useState(props.mass || 100);

  // Sync when element changes
  useEffect(() => {
    if (!element) return;
    const p = element.properties || {};
    setLabel(p.label || element.name || 'Móvil MRU');
    const v = p.displayVelocity !== undefined ? p.displayVelocity : (p.velocity !== undefined ? p.velocity : 2.0);
    setVelocityValue(v);
    setVelocityUnit(p.unit || 'm/s');
    setDepartureTime(p.departureTime || '');
    setShowVector(p.showVector !== false);
    setColor(element.color || p.color || '#0284c7');
    setTrackLength(p.lengthMeters || 6.0);
    setTrackUnit(p.lengthUnit || 'm');
    setMassKg(p.mass || 100);
  }, [element]);

  // Compute live conversions for MRU cart
  const numVel = parseFloat(velocityValue) || 0;
  let velMs = numVel;
  let velKmh = numVel * 3.6;
  let velMih = numVel * CONVERSIONS.MS_TO_MIH;

  if (velocityUnit === 'km/h') {
    velMs = numVel / 3.6;
    velKmh = numVel;
    velMih = numVel / 1.609344;
  } else if (velocityUnit === 'mi/h') {
    velMs = numVel * CONVERSIONS.MIH_TO_MS;
    velKmh = numVel * 1.609344;
    velMih = numVel;
  }

  const handleSave = (e) => {
    if (e) e.preventDefault();

    let updatedProperties = { ...props };
    let updatedElement = { ...element };

    if (element.physicsType === 'mru_cart') {
      // Normalize simulation velocity so carts move cleanly on 2D canvas
      // e.g. 2 m/s -> 2.0; 128 km/h (35.5 m/s) scaled sensibly
      const scaledSimVel = Math.sign(numVel) * Math.max(0.5, Math.min(6.0, Math.abs(velMs) * 0.12));

      updatedProperties = {
        ...updatedProperties,
        label,
        velocity: scaledSimVel, // Internal physics engine velocity
        effectiveSpeedMs: +velMs.toFixed(3),
        displayVelocity: numVel,
        unit: velocityUnit,
        departureTime: departureTime.trim(),
        showVector,
        color,
      };
      updatedElement.color = color;
    } else if (element.physicsType === 'mru_track') {
      updatedProperties = {
        ...updatedProperties,
        label,
        lengthMeters: parseFloat(trackLength) || 6.0,
        lengthUnit: trackUnit,
      };
    } else if (element.physicsType === 'mass') {
      updatedProperties = {
        ...updatedProperties,
        label,
        mass: parseFloat(massKg) || 100,
        color,
      };
      updatedElement.color = color;
    } else if (element.physicsType === 'mru_photogate') {
      updatedProperties = {
        ...updatedProperties,
        gateName: label,
        label,
      };
    }

    updatedElement.properties = updatedProperties;
    onUpdateElement(updatedElement);
    onClose();
  };

  const presetColors = [
    '#0284c7', // Blue
    '#16a34a', // Emerald
    '#f59e0b', // Amber
    '#dc2626', // Red
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#334155', // Slate
  ];

  return (
    <div className="inspector-modal-backdrop" onClick={onClose}>
      <div className="inspector-modal-card miro-island" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="inspector-header">
          <div className="inspector-title-cluster">
            <div className="inspector-icon-badge">
              {element.physicsType === 'mru_cart' && <Gauge size={16} />}
              {element.physicsType === 'mru_track' && <Layers size={16} />}
              {element.physicsType === 'mru_photogate' && <Timer size={16} />}
              {element.physicsType === 'mass' && <Weight size={16} />}
            </div>
            <div>
              <span className="inspector-badge">Propiedades del Objeto Físico</span>
              <h3 className="inspector-title">
                {element.physicsType === 'mru_cart' && 'Configuración de Móvil MRU'}
                {element.physicsType === 'mru_track' && 'Configuración de Riel / Carretera'}
                {element.physicsType === 'mru_photogate' && 'Configuración de Fotopuerta'}
                {element.physicsType === 'mass' && 'Configuración de Masa Inercial'}
              </h3>
            </div>
          </div>
          <button className="inspector-close-btn" onClick={onClose} title="Cerrar (Esc)">
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <form className="inspector-body" onSubmit={handleSave}>
          {/* 1. Object Name / Label */}
          <div className="inspector-field">
            <label className="inspector-label">Nombre o Etiqueta:</label>
            <input
              type="text"
              className="inspector-input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ej: Automóvil, Ciclista, Autobús 1, Lancha..."
              autoFocus
            />
          </div>

          {/* 2. MRU CART SPECIFIC FIELDS */}
          {element.physicsType === 'mru_cart' && (
            <>
              {/* Velocity & Unit */}
              <div className="inspector-field">
                <label className="inspector-label">Velocidad Constante (v):</label>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="any"
                    className="inspector-input"
                    value={velocityValue}
                    onChange={(e) => setVelocityValue(e.target.value)}
                    placeholder="Ej: 128, 47, 38.036..."
                    required
                  />
                  <select
                    className="inspector-select"
                    value={velocityUnit}
                    onChange={(e) => setVelocityUnit(e.target.value)}
                  >
                    <option value="km/h">km/h</option>
                    <option value="m/s">m/s</option>
                    <option value="mi/h">mi/h (millas/h)</option>
                  </select>
                </div>

                {/* Live Conversions Display */}
                <div className="live-conversions-box">
                  <Sparkles size={13} className="sparkle-icon" />
                  <span>
                    Equivale a: <strong>{velMs.toFixed(2)} m/s</strong> • <strong>{velKmh.toFixed(1)} km/h</strong> • <strong>{velMih.toFixed(2)} mi/h</strong>
                  </span>
                </div>
              </div>

              {/* Departure Time */}
              <div className="inspector-field">
                <label className="inspector-label">
                  Hora de Salida / Desfase (opcional):
                </label>
                <div className="time-input-row">
                  <Clock size={15} className="field-inner-icon" />
                  <input
                    type="text"
                    className="inspector-input with-icon"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    placeholder="Ej: 5:40 am, 10:55, 9:36, 2.25 h..."
                  />
                </div>
                <span className="field-hint">
                  Aparece junto al móvil en el lienzo para contextualizar ejercicios de viaje.
                </span>
              </div>

              {/* Show Velocity Vector Toggle */}
              <div className="inspector-field checkbox-field">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={showVector}
                    onChange={(e) => setShowVector(e.target.checked)}
                  />
                  <span>Mostrar Vector Velocidad (<span style={{ color: '#10b981', fontWeight: 700 }}>v⃗</span>) en el lienzo</span>
                </label>
              </div>

              {/* Color Palette */}
              <div className="inspector-field">
                <label className="inspector-label">Color del Móvil:</label>
                <div className="color-palette-row">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`color-swatch-btn ${color === c ? 'active' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    >
                      {color === c && <Check size={12} color="#ffffff" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 3. TRACK SPECIFIC FIELDS */}
          {element.physicsType === 'mru_track' && (
            <>
              <div className="inspector-field">
                <label className="inspector-label">Longitud de la Pista / Carretera:</label>
                <div className="inspector-unit-group">
                  <input
                    type="number"
                    step="any"
                    className="inspector-input"
                    value={trackLength}
                    onChange={(e) => setTrackLength(e.target.value)}
                    placeholder="Ej: 77, 662, 713..."
                    required
                  />
                  <select
                    className="inspector-select"
                    value={trackUnit}
                    onChange={(e) => setTrackUnit(e.target.value)}
                  >
                    <option value="m">metros (m)</option>
                    <option value="km">kilómetros (km)</option>
                    <option value="mi">millas (mi)</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* 4. MASS SPECIFIC FIELDS */}
          {element.physicsType === 'mass' && (
            <>
              <div className="inspector-field">
                <label className="inspector-label">Masa Inercial (kg):</label>
                <input
                  type="number"
                  step="any"
                  className="inspector-input"
                  value={massKg}
                  onChange={(e) => setMassKg(e.target.value)}
                  placeholder="Ej: 100, 60, 25..."
                  required
                />
              </div>

              <div className="inspector-field">
                <label className="inspector-label">Color:</label>
                <div className="color-palette-row">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`color-swatch-btn ${color === c ? 'active' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    >
                      {color === c && <Check size={12} color="#ffffff" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="inspector-footer">
            <button type="button" className="inspector-btn cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="inspector-btn submit">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .inspector-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 95;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.15s ease-out;
        }

        .inspector-modal-card {
          width: 90%;
          max-width: 440px;
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
          border: 1px solid #e2e8f0;
          overflow: hidden;
          animation: scaleUp 0.16s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .inspector-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          background: #f8fafc;
          border-bottom: 1px solid #f1f3f7;
        }

        .inspector-title-cluster {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .inspector-icon-badge {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #eff6ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .inspector-badge {
          display: inline-block;
          font-size: 0.65rem;
          font-weight: 700;
          color: #2563eb;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .inspector-title {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
        }

        .inspector-close-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
        }

        .inspector-close-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .inspector-body {
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .inspector-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .inspector-label {
          font-size: 0.76rem;
          font-weight: 600;
          color: #334155;
        }

        .inspector-input {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1.5px solid #e2e8f0;
          font-family: var(--font-sans);
          font-size: 0.86rem;
          color: #0f172a;
          outline: none;
          transition: border-color 0.12s;
        }

        .inspector-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }

        .inspector-unit-group {
          display: flex;
          gap: 8px;
        }

        .inspector-unit-group .inspector-input {
          flex: 1;
        }

        .inspector-select {
          padding: 8px 10px;
          border-radius: 8px;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          font-family: var(--font-sans);
          font-size: 0.82rem;
          font-weight: 600;
          color: #1e293b;
          outline: none;
          cursor: pointer;
        }

        .live-conversions-box {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 6px;
          font-size: 0.72rem;
          color: #166534;
        }

        .sparkle-icon {
          color: #16a34a;
          flex-shrink: 0;
        }

        .time-input-row {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-inner-icon {
          position: absolute;
          left: 10px;
          color: #64748b;
        }

        .inspector-input.with-icon {
          padding-left: 32px;
          width: 100%;
        }

        .field-hint {
          font-size: 0.68rem;
          color: #64748b;
        }

        .checkbox-field {
          flex-direction: row;
          align-items: center;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #1e293b;
          cursor: pointer;
        }

        .color-palette-row {
          display: flex;
          gap: 8px;
        }

        .color-swatch-btn {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 2px solid #ffffff;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.12s;
        }

        .color-swatch-btn:hover {
          transform: scale(1.15);
        }

        .color-swatch-btn.active {
          box-shadow: 0 0 0 2px #2563eb;
        }

        .inspector-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          padding-top: 8px;
          border-top: 1px solid #f1f3f7;
        }

        .inspector-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-family: var(--font-sans);
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.12s;
        }

        .inspector-btn.cancel {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #475569;
        }

        .inspector-btn.cancel:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .inspector-btn.submit {
          background: #2563eb;
          border: none;
          color: #ffffff;
          box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
        }

        .inspector-btn.submit:hover {
          background: #1d4ed8;
        }
      `}</style>
    </div>
  );
}
