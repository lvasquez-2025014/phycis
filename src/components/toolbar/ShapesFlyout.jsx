import React from 'react';
import { 
  Minus, 
  ArrowUpRight, 
  CornerDownRight, 
  Square, 
  Circle, 
  Diamond, 
  Triangle, 
  Workflow 
} from 'lucide-react';

export default function ShapesFlyout({
  isOpen,
  activeTool,
  setActiveTool,
  activeShape,
  setActiveShape,
  onClose,
  onOpenTemplates,
}) {
  if (!isOpen) return null;

  return (
    <div className="shapes-flyout-menu miro-island">
      {/* Línea */}
      <button
        className={`shape-item-row ${
          activeTool === 'shape' && activeShape === 'line' ? 'active' : ''
        }`}
        onClick={() => {
          setActiveTool('shape');
          setActiveShape('line');
          onClose();
        }}
      >
        <Minus size={16} className="shape-row-icon" />
        <span className="shape-row-text">Línea</span>
        <span className="shape-shortcut-key">L</span>
      </button>

      {/* Flecha */}
      <button
        className={`shape-item-row ${activeTool === 'arrow' ? 'active' : ''}`}
        onClick={() => {
          setActiveTool('arrow');
          setActiveShape('arrow');
          onClose();
        }}
      >
        <ArrowUpRight size={16} className="shape-row-icon" />
        <span className="shape-row-text">Flecha</span>
      </button>

      {/* Flecha en ángulo */}
      <button
        className={`shape-item-row ${
          activeTool === 'shape' && activeShape === 'elbow_arrow' ? 'active' : ''
        }`}
        onClick={() => {
          setActiveTool('shape');
          setActiveShape('elbow_arrow');
          onClose();
        }}
      >
        <CornerDownRight size={16} className="shape-row-icon" />
        <span className="shape-row-text">Flecha acodada</span>
      </button>

      <div className="menu-divider-line"></div>

      {/* Rectángulo */}
      <button
        className={`shape-item-row ${
          activeTool === 'shape' && activeShape === 'rectangle' ? 'active' : ''
        }`}
        onClick={() => {
          setActiveTool('shape');
          setActiveShape('rectangle');
          onClose();
        }}
      >
        <Square size={16} className="shape-row-icon" />
        <span className="shape-row-text">Rectángulo</span>
        <span className="shape-shortcut-key">R</span>
      </button>

      {/* Círculo */}
      <button
        className={`shape-item-row ${
          activeTool === 'shape' && activeShape === 'circle' ? 'active' : ''
        }`}
        onClick={() => {
          setActiveTool('shape');
          setActiveShape('circle');
          onClose();
        }}
      >
        <Circle size={16} className="shape-row-icon" />
        <span className="shape-row-text">Círculo</span>
        <span className="shape-shortcut-key">O</span>
      </button>

      {/* Rombo */}
      <button
        className={`shape-item-row ${
          activeTool === 'shape' && activeShape === 'diamond' ? 'active' : ''
        }`}
        onClick={() => {
          setActiveTool('shape');
          setActiveShape('diamond');
          onClose();
        }}
      >
        <Diamond size={16} className="shape-row-icon" />
        <span className="shape-row-text">Rombo</span>
        <span className="shape-shortcut-key">D</span>
      </button>

      {/* Triángulo */}
      <button
        className={`shape-item-row ${
          activeTool === 'shape' && activeShape === 'triangle' ? 'active' : ''
        }`}
        onClick={() => {
          setActiveTool('shape');
          setActiveShape('triangle');
          onClose();
        }}
      >
        <Triangle size={16} className="shape-row-icon" />
        <span className="shape-row-text">Triángulo</span>
      </button>

      <div className="menu-divider-line"></div>

      {/* Divisor */}
      <button
        className={`shape-item-row ${
          activeTool === 'shape' && activeShape === 'divider' ? 'active' : ''
        }`}
        onClick={() => {
          setActiveTool('shape');
          setActiveShape('divider');
          onClose();
        }}
      >
        <Minus size={16} className="shape-row-icon" />
        <span className="shape-row-text">Divisor</span>
      </button>

      <div className="shape-item-row dim">
        <span>Más formas</span>
      </div>

      <div className="menu-divider-line"></div>

      {/* Diagrama */}
      <button
        className="shape-item-row diagram-row"
        onClick={() => {
          onOpenTemplates();
        }}
      >
        <Workflow size={16} className="diagram-orange-icon" />
        <span className="shape-row-text">Diagrama</span>
      </button>
    </div>
  );
}
