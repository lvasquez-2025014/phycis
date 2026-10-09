import React from 'react';
import { 
  X, 
  Gauge, 
  MoveRight, 
  Ruler, 
  Flag, 
  Timer, 
  Calculator, 
  Sparkles,
  Zap
} from 'lucide-react';

export default function MruSystemsFlyout({
  isOpen,
  onClose,
  onAddPhysicsObject,
  onAddAssembly,
  onInsertFormulaCard,
}) {
  if (!isOpen) return null;

  const handleDragStart = (e, physicsType, preset = null) => {
    e.dataTransfer.setData(
      'application/physics-object',
      JSON.stringify({
        physicsType,
        preset,
      })
    );
    e.dataTransfer.effectAllowed = 'copy';
  };

  const MRU_ELEMENTS = [
    {
      id: 'mru_cart_standard',
      type: 'mru_cart',
      title: 'Móvil MRU Estándar',
      desc: 'Velocidad constante v = 2.0 m/s con vector velocidad visible',
      badge: 'v = 2.0 m/s',
      color: '#0284c7',
      icon: Gauge,
      preset: { velocity: 2.0, color: '#0284c7', label: 'Móvil A (v = 2 m/s)' },
    },
    {
      id: 'mru_cart_fast',
      type: 'mru_cart',
      title: 'Móvil MRU Rápido',
      desc: 'Alta velocidad constante v = 5.0 m/s',
      badge: 'v = 5.0 m/s',
      color: '#16a34a',
      icon: Gauge,
      preset: { velocity: 5.0, color: '#16a34a', label: 'Móvil B (v = 5 m/s)' },
    },
    {
      id: 'mru_cart_reverse',
      type: 'mru_cart',
      title: 'Móvil en Reversa',
      desc: 'Movimiento en sentido contrario v = -2.5 m/s',
      badge: 'v = -2.5 m/s',
      color: '#dc2626',
      icon: Gauge,
      preset: { velocity: -2.5, color: '#dc2626', label: 'Móvil Retorno (v = -2.5 m/s)' },
    },
    {
      id: 'mru_track',
      type: 'mru_track',
      title: 'Riel / Eje Graduado (6m)',
      desc: 'Pista con regla milimétrica para medir d = v · t',
      badge: '6.0 metros',
      color: '#475569',
      icon: Ruler,
      preset: { lengthMeters: 6.0, color: '#e2e8f0' },
    },
    {
      id: 'mru_photogate',
      type: 'mru_photogate',
      title: 'Sensor con Cronómetro',
      desc: 'Registra el tiempo de paso exacto de los móviles',
      badge: 'Sensor digital',
      color: '#334155',
      icon: Timer,
      preset: { gateName: 'Sensor A' },
    },
    {
      id: 'marker',
      type: 'shape',
      shapeType: 'circle',
      title: 'Punto de Referencia (A / B)',
      desc: 'Marca de origen x = 0 o punto de control',
      badge: 'Punto x',
      color: '#f59e0b',
      icon: Flag,
      isSpecial: 'marker',
    },
  ];

  return (
    <div className="mru-flyout-card miro-island" onPointerDown={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="mru-flyout-header">
        <div className="mru-flyout-title-box">
          <div className="mru-badge-row">
            <span className="mru-topic-badge">Física Interactiva</span>
            <span className="mru-beta-badge">MRU</span>
          </div>
          <h3 className="mru-flyout-title">Sistemas Físicos y Cinemática</h3>
          <p className="mru-flyout-subtitle">
            Arrastra elementos al pizarrón o haz clic para insertarlos
          </p>
        </div>
        <button
          type="button"
          className="mru-close-btn"
          onClick={onClose}
          title="Cerrar (Esc)"
        >
          <X size={16} />
        </button>
      </div>

      {/* Quick Preset Action: Complete Assembly */}
      <div className="mru-assembly-banner">
        <button
          type="button"
          className="mru-assembly-btn"
          onClick={() => {
            if (onAddAssembly) {
              onAddAssembly('mru');
              onClose();
            }
          }}
          title="Inserta una pista con un móvil y 2 sensores con un clic"
        >
          <Zap size={15} className="zap-gold-icon" />
          <div className="assembly-text-box">
            <strong>Montar Laboratorio MRU Completo</strong>
            <span>Pista de 6m + Móvil (2 m/s) + 2 Sensores</span>
          </div>
        </button>
      </div>

      {/* Draggable Object Catalog */}
      <div className="mru-items-scrollable">
        <div className="mru-catalog-list">
          {MRU_ELEMENTS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="mru-item-card"
                draggable={item.type !== 'shape'}
                onDragStart={(e) => {
                  if (item.type !== 'shape') {
                    handleDragStart(e, item.type, item.preset);
                  }
                }}
                onClick={() => {
                  if (item.isSpecial === 'marker') {
                    if (onAddPhysicsObject) {
                      onAddPhysicsObject('mass', {
                        label: 'Punto de Control',
                        width: 40,
                        height: 40,
                        mass: 0,
                        isStatic: true,
                        color: '#f59e0b',
                      });
                    }
                  } else if (onAddPhysicsObject) {
                    onAddPhysicsObject(item.type, item.preset);
                  }
                  onClose();
                }}
                title={`Haz clic para insertar o arrastra al lienzo: ${item.title}`}
              >
                <div
                  className="mru-item-icon-box"
                  style={{ backgroundColor: `${item.color}15`, color: item.color }}
                >
                  <Icon size={18} />
                </div>

                <div className="mru-item-info">
                  <div className="mru-item-top-row">
                    <span className="mru-item-name">{item.title}</span>
                    <span
                      className="mru-item-badge"
                      style={{ color: item.color, borderColor: `${item.color}40` }}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <span className="mru-item-desc">{item.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Formulas & Equations Card Quick Insert */}
      <div className="mru-flyout-footer">
        <button
          type="button"
          className="mru-formula-quick-btn"
          onClick={() => {
            if (onInsertFormulaCard) {
              onInsertFormulaCard();
              onClose();
            }
          }}
          title="Colocar una tarjeta con d = v · t en la pizarra"
        >
          <Calculator size={15} />
          <span>Insertar Tarjeta de Fórmulas (d = v · t)</span>
        </button>
      </div>

      <style>{`
        .mru-flyout-card {
          position: absolute;
          left: calc(100% + 10px);
          top: 0;
          width: 380px;
          max-height: calc(100vh - 80px);
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 14px 40px rgba(15, 23, 42, 0.16), 0 3px 10px rgba(15, 23, 42, 0.06);
          border: 1px solid #e2e8f0;
          padding: 16px;
          box-sizing: border-box;
          animation: flyoutSlideIn 0.15s ease-out;
          user-select: none;
          z-index: 100;
        }

        .mru-flyout-header {
          flex-shrink: 0;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .mru-flyout-title-box {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .mru-badge-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 2px;
        }

        .mru-topic-badge {
          display: inline-block;
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #0284c7;
          background: #f0f9ff;
          padding: 2px 8px;
          border-radius: 10px;
        }

        .mru-beta-badge {
          font-size: 0.68rem;
          font-weight: 700;
          color: #059669;
          background: #ecfdf5;
          padding: 2px 6px;
          border-radius: 10px;
        }

        .mru-flyout-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .mru-flyout-subtitle {
          font-size: 0.74rem;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .mru-close-btn {
          flex-shrink: 0;
          background: transparent;
          border: none;
          color: #64748b;
          border-radius: 6px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .mru-close-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .mru-assembly-banner {
          flex-shrink: 0;
          margin-bottom: 12px;
        }

        .mru-assembly-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 1px solid #bae6fd;
          border-radius: 10px;
          padding: 10px 12px;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }

        .mru-assembly-btn:hover {
          background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.15);
        }

        .zap-gold-icon {
          color: #0284c7;
          flex-shrink: 0;
        }

        .assembly-text-box {
          display: flex;
          flex-direction: column;
          line-height: 1.25;
        }

        .assembly-text-box strong {
          font-size: 0.8rem;
          color: #0369a1;
          font-weight: 700;
        }

        .assembly-text-box span {
          font-size: 0.7rem;
          color: #64748b;
        }

        .mru-items-scrollable {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding-right: 2px;
          min-height: 180px;
          max-height: 380px;
        }

        .mru-items-scrollable::-webkit-scrollbar {
          width: 5px;
        }

        .mru-items-scrollable::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .mru-catalog-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mru-item-card {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 8px 10px;
          cursor: grab;
          transition: all 0.15s ease;
        }

        .mru-item-card:hover {
          background: #ffffff;
          border-color: #0284c7;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
        }

        .mru-item-card:active {
          cursor: grabbing;
        }

        .mru-item-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .mru-item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .mru-item-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }

        .mru-item-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mru-item-badge {
          font-size: 0.66rem;
          font-weight: 700;
          background: #ffffff;
          border: 1px solid;
          padding: 1px 6px;
          border-radius: 10px;
          white-space: nowrap;
        }

        .mru-item-desc {
          font-size: 0.69rem;
          color: #64748b;
          line-height: 1.25;
        }

        .mru-flyout-footer {
          flex-shrink: 0;
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid #f1f5f9;
        }

        .mru-formula-quick-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #f1f5f9;
          color: #1e293b;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 8px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .mru-formula-quick-btn:hover {
          background: #e2e8f0;
          color: #0284c7;
        }
      `}</style>
    </div>
  );
}
