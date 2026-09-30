import React, { useRef, useEffect, useState } from 'react';
import { Compass, ChevronDown, ChevronUp } from 'lucide-react';

export default function Minimap({ elements, transform, viewportSize, onPanTo }) {
  const canvasRef = useRef(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const minimapWidth = 160;
  const minimapHeight = 110;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isCollapsed) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, minimapWidth, minimapHeight);

    // Compute bounding box of all elements
    let minX = -1000;
    let maxX = 1000;
    let minY = -800;
    let maxY = 800;

    elements.forEach((el) => {
      if (el.type === 'pen' || el.type === 'highlighter') {
        el.points?.forEach((p) => {
          if (p.x < minX) minX = p.x;
          if (p.x > maxX) maxX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.y > maxY) maxY = p.y;
        });
      } else if (el.startX !== undefined) {
        minX = Math.min(minX, el.startX, el.endX);
        maxX = Math.max(maxX, el.startX, el.endX);
        minY = Math.min(minY, el.startY, el.endY);
        maxY = Math.max(maxY, el.startY, el.endY);
      } else if (el.x !== undefined) {
        minX = Math.min(minX, el.x);
        maxX = Math.max(maxX, el.x + (el.width || 100));
        minY = Math.min(minY, el.y);
        maxY = Math.max(maxY, el.y + (el.height || 100));
      }
    });

    // Add padding
    const padding = 200;
    minX -= padding;
    maxX += padding;
    minY -= padding;
    maxY += padding;

    const worldWidth = maxX - minX || 1;
    const worldHeight = maxY - minY || 1;

    const scaleX = minimapWidth / worldWidth;
    const scaleY = minimapHeight / worldHeight;
    const mapScale = Math.min(scaleX, scaleY);

    const worldToMap = (wx, wy) => {
      const mx = (wx - minX) * mapScale;
      const my = (wy - minY) * mapScale;
      return { x: mx, y: my };
    };

    // Draw elements thumbnail
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    elements.forEach((el) => {
      if (el.type === 'sticky') {
        const pt = worldToMap(el.x, el.y);
        ctx.fillStyle = el.color || '#fef08a';
        ctx.fillRect(pt.x, pt.y, (el.width || 180) * mapScale, (el.height || 160) * mapScale);
      } else if (el.type === 'rectangle' || el.type === 'circle' || el.type === 'diamond') {
        const p1 = worldToMap(Math.min(el.startX, el.endX), Math.min(el.startY, el.endY));
        const w = Math.abs(el.endX - el.startX) * mapScale;
        const h = Math.abs(el.endY - el.startY) * mapScale;
        ctx.strokeStyle = el.color || '#00f2fe';
        ctx.lineWidth = 1;
        ctx.strokeRect(p1.x, p1.y, Math.max(w, 2), Math.max(h, 2));
      } else if (el.type === 'pen' && el.points?.length) {
        ctx.strokeStyle = el.color || '#fff';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        el.points.forEach((p, idx) => {
          const pt = worldToMap(p.x, p.y);
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
      }
    });

    // Draw Current Viewport Box
    const viewWorldLeft = (-transform.x) / transform.scale;
    const viewWorldTop = (-transform.y) / transform.scale;
    const viewWorldWidth = viewportSize.width / transform.scale;
    const viewWorldHeight = viewportSize.height / transform.scale;

    const vp1 = worldToMap(viewWorldLeft, viewWorldTop);
    const vpW = viewWorldWidth * mapScale;
    const vpH = viewWorldHeight * mapScale;

    ctx.strokeStyle = 'rgba(0, 242, 254, 0.9)';
    ctx.fillStyle = 'rgba(0, 242, 254, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(vp1.x, vp1.y, vpW, vpH);
    ctx.fillRect(vp1.x, vp1.y, vpW, vpH);
  }, [elements, transform, viewportSize, isCollapsed]);

  const handleMinimapClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    let minX = -1000;
    let maxX = 1000;
    let minY = -800;
    let maxY = 800;
    elements.forEach((el) => {
      if (el.startX !== undefined) {
        minX = Math.min(minX, el.startX, el.endX);
        maxX = Math.max(maxX, el.startX, el.endX);
        minY = Math.min(minY, el.startY, el.endY);
        maxY = Math.max(maxY, el.startY, el.endY);
      } else if (el.x !== undefined) {
        minX = Math.min(minX, el.x);
        maxX = Math.max(maxX, el.x + (el.width || 100));
        minY = Math.min(minY, el.y);
        maxY = Math.max(maxY, el.y + (el.height || 100));
      }
    });
    const padding = 200;
    minX -= padding;
    maxX += padding;
    minY -= padding;
    maxY += padding;

    const mapScale = Math.min(minimapWidth / (maxX - minX || 1), minimapHeight / (maxY - minY || 1));
    const targetWorldX = minX + clickX / mapScale;
    const targetWorldY = minY + clickY / mapScale;

    onPanTo(targetWorldX, targetWorldY);
  };

  return (
    <div className={`minimap-wrapper glass-dock ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="minimap-header">
        <div className="minimap-title-left">
          <Compass size={13} className="radar-icon" />
          <span>RADAR</span>
        </div>
        <button
          className="minimap-collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expandir radar' : 'Minimizar'}
        >
          {isCollapsed ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {!isCollapsed && (
        <canvas
          ref={canvasRef}
          width={minimapWidth}
          height={minimapHeight}
          onClick={handleMinimapClick}
          className="minimap-canvas"
        />
      )}

      <style>{`
        .minimap-wrapper {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 40;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: all var(--transition-fast);
        }

        .minimap-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 4px;
        }

        .minimap-title-left {
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: var(--font-mono);
          font-size: 0.6rem;
          font-weight: 700;
          color: var(--text-dim);
          letter-spacing: 0.05em;
        }

        .radar-icon {
          color: var(--accent-primary);
        }

        .minimap-collapse-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 2px;
          border-radius: 3px;
        }

        .minimap-collapse-btn:hover {
          color: var(--text-main);
        }

        .minimap-canvas {
          background: rgba(0, 0, 0, 0.4);
          border-radius: var(--radius-sm);
          border: 1px solid var(--ui-border);
          cursor: pointer;
          display: block;
        }

        @media (max-width: 768px) {
          .minimap-wrapper {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
