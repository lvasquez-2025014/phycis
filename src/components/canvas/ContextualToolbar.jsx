import React from 'react';
import { 
  Palette, 
  Trash2, 
  Copy, 
  Sparkles,
  AlignLeft, 
  AlignCenter, 
  Type, 
  CornerDownRight,
  MoreHorizontal,
  Sliders
} from 'lucide-react';

export default function ContextualToolbar({
  selectedElement,
  position,
  onChangeColor,
  onDuplicate,
  onDelete,
  onFormatMath,
  onEditPhysicsObject,
  hasStrokes,
}) {
  if (!selectedElement || !position) return null;

  const stickyColors = ['#fff9b1', '#d5f0ff', '#d3f8df', '#ffd5dc', '#edd9ff', '#ffe4c2'];
  const shapeColors = ['#4262ff', '#050038', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'];

  const palette = selectedElement.type === 'sticky' ? stickyColors : shapeColors;

  return (
    <div
      className="contextual-toolbar miro-island"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Edit Physics Parameters (MRU velocity, departure time, label, track length, mass) */}
      {selectedElement.type === 'physics_object' && onEditPhysicsObject && (
        <>
          <button
            className="context-btn edit-physics-btn"
            onClick={onEditPhysicsObject}
            title="Editar datos físicos (velocidad, unidades km/h o m/s, hora de salida, nombre)"
          >
            <Sliders size={15} className="physics-sliders-icon" />
            <span className="edit-btn-text">
              {selectedElement.physicsType === 'mru_cart'
                ? `Editar Móvil (${selectedElement.properties?.displayVelocity !== undefined ? selectedElement.properties.displayVelocity : selectedElement.properties?.velocity || 2.0} ${selectedElement.properties?.unit || 'm/s'})`
                : 'Editar Datos Físicos'}
            </span>
          </button>
          <div className="context-divider"></div>
        </>
      )}

      {/* Magic Math / Number beautifier button if selection contains drawn strokes */}
      {hasStrokes && onFormatMath && (
        <>
          <button
            className="context-btn format-math-btn"
            onClick={onFormatMath}
            title="Dar forma a números y fórmulas (Convertir trazos en números digitales)"
          >
            <Sparkles size={15} className="sparkle-gold-icon" />
            <span className="format-btn-text">Dar forma a números</span>
          </button>
          <div className="context-divider"></div>
        </>
      )}

      {/* Quick Color Swatches */}
      <div className="context-color-swatches">
        {palette.map((c) => (
          <button
            key={c}
            className={`context-color-btn ${
              (selectedElement.color === c || selectedElement.fill === c) ? 'active' : ''
            }`}
            style={{ backgroundColor: c }}
            onClick={() => onChangeColor(c)}
          />
        ))}
      </div>

      <div className="context-divider"></div>

      {/* Duplicate */}
      <button
        className="context-btn"
        onClick={onDuplicate}
        title="Duplicate (Ctrl+D)"
      >
        <Copy size={15} />
      </button>

      {/* Delete */}
      <button
        className="context-btn delete"
        onClick={onDelete}
        title="Delete (Backspace / Del)"
      >
        <Trash2 size={15} />
      </button>

      <style>{`
        .context-color-swatches {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .context-color-btn {
          width: 18px;
          height: 18px;
          border-radius: 3px;
          border: 1px solid rgba(0, 0, 0, 0.15);
          cursor: pointer;
          transition: transform var(--transition-fast);
        }

        .context-color-btn:hover {
          transform: scale(1.15);
        }

        .context-color-btn.active {
          box-shadow: 0 0 0 2px var(--miro-blue);
        }

        .context-btn.delete:hover {
          color: #ef4444;
          background: #fee2e2;
        }

        .format-math-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 10px;
          height: 32px;
          background: #edf2fe;
          border-radius: 6px;
          color: #4262ff;
          font-weight: 600;
          font-size: 0.8rem;
          transition: all 0.12s ease;
        }

        .format-math-btn:hover {
          background: #4262ff;
          color: #ffffff;
        }

        .sparkle-gold-icon {
          color: #f59e0b;
        }

        .format-math-btn:hover .sparkle-gold-icon {
          color: #ffd02f;
        }

        .format-btn-text {
          white-space: nowrap;
        }

        .edit-physics-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 10px;
          height: 32px;
          background: #eff6ff;
          border-radius: 6px;
          color: #2563eb;
          font-weight: 700;
          font-size: 0.78rem;
          transition: all 0.12s ease;
          border: 1px solid #bfdbfe;
        }

        .edit-physics-btn:hover {
          background: #2563eb;
          color: #ffffff;
          border-color: #2563eb;
        }

        .physics-sliders-icon {
          color: #2563eb;
        }

        .edit-physics-btn:hover .physics-sliders-icon {
          color: #ffffff;
        }
      `}</style>
    </div>
  );
}
