import React, { useState, useEffect } from 'react';
import { 
  X, 
  Gauge, 
  Calculator, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  Layers, 
  Pin, 
  Sliders,
  HelpCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

export default function MruVariablesModal({
  element,
  isOpen,
  onClose,
  onUpdateElement,
  onInsertFormulaCard,
}) {
  if (!isOpen || !element) return null;

  const props = element.properties || {};

  // Active Tab: 'variables' | 'formulas'
  const [activeTab, setActiveTab] = useState('variables');

  // Basic object info
  const [label, setLabel] = useState(props.label || element.name || 'Móvil MRU');
  const [color, setColor] = useState(element.color || '#0284c7');

  // Standard MRU Variables
  const [initialX, setInitialX] = useState(props.initialX !== undefined ? props.initialX : 0.0);
  const [velocity, setVelocity] = useState(
    props.displayVelocity !== undefined 
      ? props.displayVelocity 
      : (props.velocity !== undefined ? props.velocity : 2.0)
  );
  const [velocityUnit, setVelocityUnit] = useState(props.unit || 'm/s');
  const [timeValue, setTimeValue] = useState(props.time !== undefined ? props.time : 5.0);
  const [distanceValue, setDistanceValue] = useState(props.distance !== undefined ? props.distance : 10.0);

  // Custom Variables List: [ { id, symbol, name, value, unit } ]
  const [customVariables, setCustomVariables] = useState(
    Array.isArray(props.customVariables) ? props.customVariables : []
  );

  // New Custom Variable Form
  const [newSymbol, setNewSymbol] = useState('');
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newUnit, setNewUnit] = useState('m/s');
  const [showAddVarForm, setShowAddVarForm] = useState(false);

  // Formula Builder States
  const [selectedFormula, setSelectedFormula] = useState(props.formulaType || 'd_vt');
  const [customFormulaText, setCustomFormulaText] = useState(props.customFormulaText || 'd = v * t');
  const [solvedResultText, setSolvedResultText] = useState(null);

  // Toggles
  const [showVector, setShowVector] = useState(props.showVector !== false);
  const [showVariableBadge, setShowVariableBadge] = useState(props.showVariableBadge !== false);

  useEffect(() => {
    if (element) {
      const p = element.properties || {};
      setLabel(p.label || element.name || 'Móvil MRU');
      setColor(element.color || '#0284c7');
      setInitialX(p.initialX !== undefined ? p.initialX : 0.0);
      setVelocity(p.displayVelocity !== undefined ? p.displayVelocity : (p.velocity !== undefined ? p.velocity : 2.0));
      setVelocityUnit(p.unit || 'm/s');
      setTimeValue(p.time !== undefined ? p.time : 5.0);
      setDistanceValue(p.distance !== undefined ? p.distance : 10.0);
      setCustomVariables(Array.isArray(p.customVariables) ? p.customVariables : []);
      setSelectedFormula(p.formulaType || 'd_vt');
      setCustomFormulaText(p.customFormulaText || 'd = v * t');
      setShowVector(p.showVector !== false);
      setShowVariableBadge(p.showVariableBadge !== false);
      setSolvedResultText(null);
    }
  }, [element]);

  // Compute velocity in m/s internally
  const numVel = parseFloat(velocity) || 0;
  const numTime = parseFloat(timeValue) || 0;
  const numDist = parseFloat(distanceValue) || 0;
  const numInitX = parseFloat(initialX) || 0;

  let speedMs = numVel;
  if (velocityUnit === 'km/h') {
    speedMs = numVel / 3.6;
  }

  // Add a new custom variable
  const handleAddCustomVariable = () => {
    if (!newSymbol.trim()) return;
    const newVar = {
      id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      symbol: newSymbol.trim(),
      name: newName.trim() || newSymbol.trim(),
      value: parseFloat(newValue) || 0,
      unit: newUnit.trim() || '',
    };
    setCustomVariables((prev) => [...prev, newVar]);
    setNewSymbol('');
    setNewName('');
    setNewValue('');
    setShowAddVarForm(false);
  };

  const handleDeleteCustomVariable = (id) => {
    setCustomVariables((prev) => prev.filter((v) => v.id !== id));
  };

  // Live Formula Solver: calculate unknown from known variables
  const handleSolveFormula = (targetVar) => {
    if (targetVar === 'd') {
      // d = v * t
      const computed = speedMs * numTime;
      setDistanceValue(+computed.toFixed(2));
      setSolvedResultText(`✅ Distancia calculada: d = ${numVel} ${velocityUnit} × ${numTime} s = ${computed.toFixed(2)} m`);
    } else if (targetVar === 'v') {
      // v = d / t
      if (numTime === 0) {
        setSolvedResultText('⚠️ El tiempo t no puede ser 0 para calcular la velocidad.');
        return;
      }
      const computedMs = numDist / numTime;
      const finalVel = velocityUnit === 'km/h' ? computedMs * 3.6 : computedMs;
      setVelocity(+finalVel.toFixed(2));
      setSolvedResultText(`✅ Velocidad calculada: v = ${numDist} m / ${numTime} s = ${finalVel.toFixed(2)} ${velocityUnit}`);
    } else if (targetVar === 't') {
      // t = d / v
      if (speedMs === 0) {
        setSolvedResultText('⚠️ La velocidad v no puede ser 0 para calcular el tiempo.');
        return;
      }
      const computed = numDist / speedMs;
      setTimeValue(+computed.toFixed(2));
      setSolvedResultText(`✅ Tiempo calculado: t = ${numDist} m / ${numVel} ${velocityUnit} = ${computed.toFixed(2)} s`);
    } else if (targetVar === 'xf') {
      // x(t) = x0 + v * t
      const computed = numInitX + speedMs * numTime;
      setSolvedResultText(`✅ Posición final calculada: x(t) = ${numInitX} + (${numVel} × ${numTime}) = ${computed.toFixed(2)} m`);
    }
  };

  // Save changes to element
  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (!onUpdateElement) return;

    let simVel = speedMs;
    // Compress extreme speeds for pleasant canvas animation
    if (Math.abs(speedMs) > 15) {
      simVel = Math.sign(speedMs) * (15 + Math.log10(Math.abs(speedMs) / 15) * 6);
    }

    const updatedProps = {
      ...props,
      label,
      initialX: numInitX,
      velocity: simVel,
      initialVelocity: simVel,
      displayVelocity: numVel,
      effectiveSpeedMs: speedMs,
      unit: velocityUnit,
      time: numTime,
      distance: numDist,
      customVariables,
      formulaType: selectedFormula,
      customFormulaText,
      showVector,
      showVariableBadge,
    };

    onUpdateElement({
      ...element,
      name: label,
      color,
      properties: updatedProps,
    });

    onClose();
  };

  // Pin Formula Card onto Canvas
  const handlePinFormulaToCanvas = () => {
    if (onInsertFormulaCard) {
      onInsertFormulaCard({
        title: `Sistema: ${label}`,
        formula: customFormulaText || 'd = v · t',
        variables: [
          { symbol: 'x₀', value: `${numInitX} m` },
          { symbol: 'v', value: `${numVel} ${velocityUnit}` },
          { symbol: 't', value: `${numTime} s` },
          { symbol: 'd', value: `${numDist} m` },
          ...customVariables.map((v) => ({ symbol: v.symbol, value: `${v.value} ${v.unit}` })),
        ],
      });
    }
  };

  return (
    <div className="mru-modal-backdrop" onPointerDown={onClose}>
      <div className="mru-modal-card" onPointerDown={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="mru-modal-header">
          <div className="header-icon-box" style={{ backgroundColor: `${color}20`, color }}>
            <Gauge size={20} />
          </div>
          <div className="header-text-box">
            <h3 className="modal-title">Variables y Fórmulas del Sistema</h3>
            <span className="modal-subtitle">
              Configura variables físicas, ecuaciones personalizadas y cálculos automáticos
            </span>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} title="Cerrar">
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mru-tab-switcher">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'variables' ? 'active' : ''}`}
            onClick={() => setActiveTab('variables')}
          >
            <Sliders size={14} />
            <span>Variables del Sistema</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'formulas' ? 'active' : ''}`}
            onClick={() => setActiveTab('formulas')}
          >
            <Calculator size={14} />
            <span>Creador de Fórmulas</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="mru-modal-body">
          {activeTab === 'variables' ? (
            <div className="variables-tab-content">
              {/* Basic element identity */}
              <div className="form-group-row">
                <div className="form-field flex-2">
                  <label>Nombre del Móvil / Elemento</label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Ej. Móvil 1, Auto Rojo"
                  />
                </div>
                <div className="form-field flex-1">
                  <label>Color</label>
                  <div className="color-picker-row">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="color-input"
                    />
                    <span className="color-hex">{color}</span>
                  </div>
                </div>
              </div>

              {/* Standard MRU variables grid */}
              <div className="variables-grid-box">
                <div className="box-title-row">
                  <span className="box-title">Variables Principales de MRU</span>
                  <span className="box-badge">Movimiento Rectilíneo</span>
                </div>

                <div className="var-inputs-grid">
                  {/* x0 Initial Position */}
                  <div className="var-card">
                    <div className="var-header">
                      <span className="var-symbol">x₀</span>
                      <span className="var-name">Posición inicial</span>
                    </div>
                    <div className="var-input-group">
                      <input
                        type="number"
                        step="any"
                        value={initialX}
                        onChange={(e) => setInitialX(e.target.value)}
                      />
                      <span className="var-unit">m</span>
                    </div>
                  </div>

                  {/* v Velocity with Unit Selector */}
                  <div className="var-card">
                    <div className="var-header">
                      <span className="var-symbol">v</span>
                      <span className="var-name">Velocidad constante</span>
                    </div>
                    <div className="var-input-group">
                      <input
                        type="number"
                        step="any"
                        value={velocity}
                        onChange={(e) => setVelocity(e.target.value)}
                      />
                      <select
                        value={velocityUnit}
                        onChange={(e) => setVelocityUnit(e.target.value)}
                        className="unit-select"
                      >
                        <option value="m/s">m/s</option>
                        <option value="km/h">km/h</option>
                      </select>
                    </div>
                  </div>

                  {/* t Time */}
                  <div className="var-card">
                    <div className="var-header">
                      <span className="var-symbol">t</span>
                      <span className="var-name">Tiempo de recorrido</span>
                    </div>
                    <div className="var-input-group">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={timeValue}
                        onChange={(e) => setTimeValue(e.target.value)}
                      />
                      <span className="var-unit">s</span>
                    </div>
                  </div>

                  {/* d Distance */}
                  <div className="var-card">
                    <div className="var-header">
                      <span className="var-symbol">d</span>
                      <span className="var-name">Distancia / Desplazamiento</span>
                    </div>
                    <div className="var-input-group">
                      <input
                        type="number"
                        step="any"
                        value={distanceValue}
                        onChange={(e) => setDistanceValue(e.target.value)}
                      />
                      <span className="var-unit">m</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Variables Section */}
              <div className="custom-variables-box">
                <div className="box-title-row">
                  <span className="box-title">Variables Personalizadas</span>
                  <button
                    type="button"
                    className="btn-add-var"
                    onClick={() => setShowAddVarForm(!showAddVarForm)}
                  >
                    <Plus size={13} />
                    <span>Agregar Variable</span>
                  </button>
                </div>

                {showAddVarForm && (
                  <div className="new-var-form">
                    <div className="new-var-fields">
                      <div className="new-field">
                        <label>Símbolo</label>
                        <input
                          type="text"
                          placeholder="ej. v₂, t₁, m"
                          value={newSymbol}
                          onChange={(e) => setNewSymbol(e.target.value)}
                        />
                      </div>
                      <div className="new-field">
                        <label>Nombre</label>
                        <input
                          type="text"
                          placeholder="ej. Velocidad 2"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                        />
                      </div>
                      <div className="new-field">
                        <label>Valor</label>
                        <input
                          type="number"
                          step="any"
                          placeholder="ej. 15.5"
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                        />
                      </div>
                      <div className="new-field">
                        <label>Unidad</label>
                        <input
                          type="text"
                          placeholder="ej. m/s, s, kg"
                          value={newUnit}
                          onChange={(e) => setNewUnit(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="new-var-actions">
                      <button
                        type="button"
                        className="btn-save-var"
                        onClick={handleAddCustomVariable}
                        disabled={!newSymbol.trim()}
                      >
                        <Check size={13} />
                        <span>Guardar Variable</span>
                      </button>
                      <button
                        type="button"
                        className="btn-cancel-var"
                        onClick={() => setShowAddVarForm(false)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {customVariables.length > 0 ? (
                  <div className="custom-var-list">
                    {customVariables.map((v) => (
                      <div key={v.id} className="custom-var-row">
                        <div className="custom-var-badge">{v.symbol}</div>
                        <div className="custom-var-info">
                          <strong>{v.name}</strong>
                          <span>{v.value} {v.unit}</span>
                        </div>
                        <button
                          type="button"
                          className="btn-delete-var"
                          onClick={() => handleDeleteCustomVariable(v.id)}
                          title="Eliminar variable"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-custom-vars-desc">
                    Puedes agregar variables adicionales (ej. masas, tiempos parciales, velocidades relativas) para usarlas en tus fórmulas.
                  </p>
                )}
              </div>

              {/* Visual Toggles */}
              <div className="toggles-box">
                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={showVector}
                    onChange={(e) => setShowVector(e.target.checked)}
                  />
                  <span>Mostrar flecha del vector velocidad (v) en el lienzo</span>
                </label>
                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={showVariableBadge}
                    onChange={(e) => setShowVariableBadge(e.target.checked)}
                  />
                  <span>Mostrar etiqueta con valores (v, x₀, d) directamente en el pizarrón</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="formulas-tab-content">
              {/* Preset Formulas */}
              <div className="box-title-row">
                <span className="box-title">Ecuaciones Fundamentales de MRU</span>
              </div>

              <div className="preset-formulas-grid">
                <button
                  type="button"
                  className={`formula-chip ${selectedFormula === 'd_vt' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedFormula('d_vt');
                    setCustomFormulaText('d = v * t');
                  }}
                >
                  <span className="chip-eq">d = v · t</span>
                  <span className="chip-name">Distancia en MRU</span>
                </button>

                <button
                  type="button"
                  className={`formula-chip ${selectedFormula === 'x_x0_vt' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedFormula('x_x0_vt');
                    setCustomFormulaText('x(t) = x0 + v * t');
                  }}
                >
                  <span className="chip-eq">x(t) = x₀ + v · t</span>
                  <span className="chip-name">Ecuación de posición</span>
                </button>

                <button
                  type="button"
                  className={`formula-chip ${selectedFormula === 'v_dt' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedFormula('v_dt');
                    setCustomFormulaText('v = d / t');
                  }}
                >
                  <span className="chip-eq">v = d / t</span>
                  <span className="chip-name">Velocidad despejada</span>
                </button>

                <button
                  type="button"
                  className={`formula-chip ${selectedFormula === 't_dv' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedFormula('t_dv');
                    setCustomFormulaText('t = d / v');
                  }}
                >
                  <span className="chip-eq">t = d / v</span>
                  <span className="chip-name">Tiempo despejado</span>
                </button>
              </div>

              {/* Custom Formula Input */}
              <div className="custom-formula-input-box">
                <label>Fórmula Activa o Personalizada</label>
                <div className="formula-input-wrapper">
                  <input
                    type="text"
                    value={customFormulaText}
                    onChange={(e) => setCustomFormulaText(e.target.value)}
                    placeholder="Escribe tu fórmula ej: d = v * t, v_rel = v1 + v2"
                  />
                </div>
                <small className="formula-hint">
                  Puedes escribir cualquier relación matemática entre tus variables.
                </small>
              </div>

              {/* Live Calculator / Solver */}
              <div className="formula-solver-card">
                <div className="solver-header">
                  <Sparkles size={16} className="sparkle-icon" />
                  <strong>Calculadora de Incógnitas en Vivo</strong>
                </div>
                <p className="solver-desc">
                  Selecciona qué incógnita deseas resolver utilizando los datos actuales:
                </p>

                <div className="solver-buttons-row">
                  <button
                    type="button"
                    className="btn-solve-var"
                    onClick={() => handleSolveFormula('d')}
                    title="Calcular d usando v y t"
                  >
                    <span>Calcular Distancia (d = v · t)</span>
                  </button>

                  <button
                    type="button"
                    className="btn-solve-var"
                    onClick={() => handleSolveFormula('v')}
                    title="Calcular v usando d y t"
                  >
                    <span>Calcular Velocidad (v = d / t)</span>
                  </button>

                  <button
                    type="button"
                    className="btn-solve-var"
                    onClick={() => handleSolveFormula('t')}
                    title="Calcular t usando d y v"
                  >
                    <span>Calcular Tiempo (t = d / v)</span>
                  </button>

                  <button
                    type="button"
                    className="btn-solve-var"
                    onClick={() => handleSolveFormula('xf')}
                    title="Calcular x final usando x0 + v * t"
                  >
                    <span>Calcular Posición x(t)</span>
                  </button>
                </div>

                {solvedResultText && (
                  <div className="solved-banner">
                    {solvedResultText}
                  </div>
                )}
              </div>

              {/* Pin onto Canvas Button */}
              <div className="pin-formula-row">
                <button
                  type="button"
                  className="btn-pin-formula"
                  onClick={handlePinFormulaToCanvas}
                  title="Colocar una tarjeta con esta fórmula en la pizarra"
                >
                  <Pin size={14} />
                  <span>Fijar Tarjeta de Fórmulas en el Pizarrón</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mru-modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn-save-apply" onClick={handleSave}>
            <Check size={15} />
            <span>Guardar y Aplicar al Sistema</span>
          </button>
        </div>

        <style>{`
          .mru-modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(15, 23, 42, 0.45);
            backdrop-filter: blur(4px);
            z-index: 120;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            animation: fadeIn 0.15s ease-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .mru-modal-card {
            background: #ffffff;
            border-radius: 16px;
            width: 560px;
            max-width: 95vw;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 50px rgba(15, 23, 42, 0.22);
            border: 1px solid #e2e8f0;
            overflow: hidden;
            animation: scaleIn 0.15s ease-out;
          }

          @keyframes scaleIn {
            from { transform: scale(0.96); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }

          .mru-modal-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 20px;
            border-bottom: 1px solid #f1f5f9;
          }

          .header-icon-box {
            width: 38px;
            height: 38px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .header-text-box {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .modal-title {
            margin: 0;
            font-size: 1.05rem;
            font-weight: 800;
            color: #0f172a;
          }

          .modal-subtitle {
            font-size: 0.72rem;
            color: #64748b;
          }

          .modal-close-btn {
            background: transparent;
            border: none;
            color: #64748b;
            cursor: pointer;
            width: 32px;
            height: 32px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.12s;
          }

          .modal-close-btn:hover {
            background: #f1f5f9;
            color: #0f172a;
          }

          .mru-tab-switcher {
            display: flex;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            padding: 4px 16px;
            gap: 8px;
          }

          .tab-btn {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            background: transparent;
            border: none;
            border-bottom: 2px solid transparent;
            padding: 8px 12px;
            color: #64748b;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .tab-btn:hover {
            color: #0f172a;
          }

          .tab-btn.active {
            color: #0284c7;
            border-bottom-color: #0284c7;
            font-weight: 700;
          }

          .mru-modal-body {
            flex: 1;
            overflow-y: auto;
            padding: 18px 20px;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .form-group-row {
            display: flex;
            gap: 12px;
          }

          .flex-1 { flex: 1; }
          .flex-2 { flex: 2; }

          .form-field {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .form-field label {
            font-size: 0.72rem;
            font-weight: 700;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }

          .form-field input[type="text"] {
            height: 36px;
            padding: 0 10px;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            font-size: 0.84rem;
            color: #0f172a;
            outline: none;
            transition: all 0.15s;
          }

          .form-field input[type="text"]:focus {
            border-color: #0284c7;
            box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
          }

          .color-picker-row {
            display: flex;
            align-items: center;
            gap: 8px;
            height: 36px;
          }

          .color-input {
            width: 36px;
            height: 36px;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 2px;
            cursor: pointer;
            background: #ffffff;
          }

          .color-hex {
            font-size: 0.78rem;
            font-weight: 600;
            color: #475569;
            font-family: monospace;
          }

          .variables-grid-box, .custom-variables-box, .formula-solver-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 14px;
          }

          .box-title-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
          }

          .box-title {
            font-size: 0.8rem;
            font-weight: 700;
            color: #0f172a;
          }

          .box-badge {
            font-size: 0.65rem;
            font-weight: 700;
            background: #e0f2fe;
            color: #0284c7;
            padding: 2px 8px;
            border-radius: 10px;
          }

          .var-inputs-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .var-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 8px 12px;
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .var-header {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .var-symbol {
            font-family: 'Cambria Math', 'Times New Roman', serif;
            font-size: 1.05rem;
            font-weight: 700;
            color: #0284c7;
            line-height: 1;
          }

          .var-name {
            font-size: 0.7rem;
            color: #64748b;
          }

          .var-input-group {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .var-input-group input {
            flex: 1;
            height: 30px;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 0 8px;
            font-size: 0.84rem;
            font-weight: 600;
            color: #0f172a;
            outline: none;
          }

          .var-input-group input:focus {
            border-color: #0284c7;
          }

          .var-unit {
            font-size: 0.74rem;
            font-weight: 600;
            color: #64748b;
          }

          .unit-select {
            height: 30px;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            background: #f8fafc;
            color: #0f172a;
            font-size: 0.74rem;
            font-weight: 600;
            padding: 0 4px;
            outline: none;
          }

          .btn-add-var {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background: #e0f2fe;
            color: #0284c7;
            border: 1px solid #bae6fd;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 0.72rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.12s;
          }

          .btn-add-var:hover {
            background: #0284c7;
            color: #ffffff;
          }

          .new-var-form {
            background: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 10px;
            padding: 12px;
            margin-bottom: 12px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .new-var-fields {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
          }

          .new-field {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .new-field label {
            font-size: 0.68rem;
            font-weight: 600;
            color: #64748b;
          }

          .new-field input {
            height: 30px;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 0 6px;
            font-size: 0.78rem;
            color: #0f172a;
            outline: none;
          }

          .new-var-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
          }

          .btn-save-var {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background: #0284c7;
            color: #ffffff;
            border: none;
            padding: 5px 12px;
            border-radius: 6px;
            font-size: 0.74rem;
            font-weight: 600;
            cursor: pointer;
          }

          .btn-cancel-var {
            background: transparent;
            border: 1px solid #cbd5e1;
            color: #64748b;
            padding: 5px 10px;
            border-radius: 6px;
            font-size: 0.74rem;
            cursor: pointer;
          }

          .custom-var-list {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .custom-var-row {
            display: flex;
            align-items: center;
            gap: 10px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 6px 10px;
          }

          .custom-var-badge {
            font-family: 'Cambria Math', serif;
            font-size: 0.95rem;
            font-weight: 700;
            color: #0284c7;
            width: 32px;
          }

          .custom-var-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            line-height: 1.2;
          }

          .custom-var-info strong {
            font-size: 0.76rem;
            color: #0f172a;
          }

          .custom-var-info span {
            font-size: 0.7rem;
            color: #64748b;
          }

          .btn-delete-var {
            background: transparent;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
          }

          .btn-delete-var:hover {
            color: #ef4444;
            background: #fef2f2;
          }

          .no-custom-vars-desc {
            font-size: 0.72rem;
            color: #64748b;
            margin: 0;
            line-height: 1.4;
          }

          .toggles-box {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 4px 0;
          }

          .toggle-row {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.75rem;
            color: #334155;
            cursor: pointer;
          }

          .preset-formulas-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            margin-bottom: 12px;
          }

          .formula-chip {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            background: #ffffff;
            border: 1.5px solid #e2e8f0;
            border-radius: 10px;
            padding: 10px 12px;
            cursor: pointer;
            transition: all 0.15s;
            text-align: left;
            gap: 2px;
          }

          .formula-chip:hover {
            border-color: #0284c7;
            background: #f0f9ff;
          }

          .formula-chip.active {
            border-color: #0284c7;
            background: #f0f9ff;
            box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.2);
          }

          .chip-eq {
            font-family: 'Cambria Math', 'Times New Roman', serif;
            font-size: 0.95rem;
            font-weight: 700;
            color: #0284c7;
          }

          .chip-name {
            font-size: 0.68rem;
            color: #64748b;
          }

          .custom-formula-input-box {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 14px;
          }

          .custom-formula-input-box label {
            font-size: 0.74rem;
            font-weight: 700;
            color: #0f172a;
          }

          .formula-input-wrapper input {
            width: 100%;
            height: 38px;
            border: 1.5px solid #cbd5e1;
            border-radius: 8px;
            padding: 0 12px;
            font-size: 0.88rem;
            font-family: 'Cambria Math', monospace;
            font-weight: 600;
            color: #0f172a;
            box-sizing: border-box;
            outline: none;
          }

          .formula-input-wrapper input:focus {
            border-color: #0284c7;
            box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
          }

          .formula-hint {
            font-size: 0.68rem;
            color: #64748b;
          }

          .solver-header {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.82rem;
            color: #0f172a;
            margin-bottom: 6px;
          }

          .sparkle-icon {
            color: #0284c7;
          }

          .solver-desc {
            font-size: 0.72rem;
            color: #64748b;
            margin: 0 0 10px 0;
          }

          .solver-buttons-row {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            margin-bottom: 10px;
          }

          .btn-solve-var {
            background: #ffffff;
            color: #0369a1;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 8px;
            font-size: 0.74rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.12s;
            text-align: center;
          }

          .btn-solve-var:hover {
            background: #0284c7;
            color: #ffffff;
          }

          .solved-banner {
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
            color: #065f46;
            font-size: 0.76rem;
            font-weight: 600;
            padding: 8px 12px;
            border-radius: 8px;
            animation: fadeIn 0.15s ease-out;
          }

          .pin-formula-row {
            display: flex;
            justify-content: center;
            margin-top: 10px;
          }

          .btn-pin-formula {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #f1f5f9;
            color: #1e293b;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 8px 16px;
            font-size: 0.76rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.12s;
          }

          .btn-pin-formula:hover {
            background: #e2e8f0;
            color: #0284c7;
          }

          .mru-modal-footer {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 10px;
            padding: 14px 20px;
            border-top: 1px solid #f1f5f9;
            background: #fafafa;
          }

          .btn-cancel {
            background: transparent;
            border: 1px solid #cbd5e1;
            color: #64748b;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
          }

          .btn-save-apply {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #0284c7;
            color: #ffffff;
            border: none;
            padding: 8px 18px;
            border-radius: 8px;
            font-size: 0.8rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.15s;
          }

          .btn-save-apply:hover {
            background: #0369a1;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
          }
        `}</style>
      </div>
    </div>
  );
}
