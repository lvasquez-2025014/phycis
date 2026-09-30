// =========================================================================
// CANVAS RENDERING ENGINES & GRAPHICS DRAWING FUNCTIONS
// Pure Canvas 2D renderers for whiteboard grids, strokes, shapes, lasso, text and physics
// =========================================================================
import { getAnchorAbsolutePosition } from '../physics/physicsRegistry';

/**
 * Miro-style Infinite Vector Square Graph Paper Grid Renderer
 */
export function drawMiroSquareGrid(ctx, w, h, t) {
  let gridSize = 36;
  while (gridSize * t.scale < 24) gridSize *= 2;
  while (gridSize * t.scale > 96) gridSize /= 2;

  const spacing = gridSize * t.scale;
  const offsetX = ((t.x % spacing) + spacing) % spacing;
  const offsetY = ((t.y % spacing) + spacing) % spacing;

  ctx.save();
  ctx.strokeStyle = 'rgba(5, 0, 56, 0.06)';
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let x = offsetX; x < w; x += spacing) {
    ctx.moveTo(Math.floor(x) + 0.5, 0);
    ctx.lineTo(Math.floor(x) + 0.5, h);
  }
  for (let y = offsetY; y < h; y += spacing) {
    ctx.moveTo(0, Math.floor(y) + 0.5);
    ctx.lineTo(w, Math.floor(y) + 0.5);
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * Pencil Eraser Brush Renderer (destination-out)
 */
export function drawEraserBrush(ctx, el) {
  if (!el.points || el.points.length === 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = el.size || 24;

  if (el.points.length === 1) {
    ctx.arc(el.points[0].x, el.points[0].y, (el.size || 24) / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.moveTo(el.points[0].x, el.points[0].y);
    for (let i = 1; i < el.points.length - 1; i++) {
      const xc = (el.points[i].x + el.points[i + 1].x) / 2;
      const yc = (el.points[i].y + el.points[i + 1].y) / 2;
      ctx.quadraticCurveTo(el.points[i].x, el.points[i].y, xc, yc);
    }
    ctx.lineTo(el.points[el.points.length - 1].x, el.points[el.points.length - 1].y);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Freehand Pen / Highlighter / Smart Pen Renderer
 */
export function drawStroke(ctx, el) {
  if (!el.points || el.points.length === 0) return;
  ctx.save();
  ctx.beginPath();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (el.type === 'highlighter') {
    ctx.strokeStyle = el.color || '#ffd02f';
    ctx.globalAlpha = 0.38;
    ctx.lineWidth = (el.size || 5) * 4;
  } else if (el.type === 'smart_pen') {
    ctx.strokeStyle = el.color || '#4262ff';
    ctx.lineWidth = el.size || 3;
    ctx.globalAlpha = 1.0;
  } else {
    ctx.strokeStyle = el.color || '#050038';
    ctx.lineWidth = el.size || 3;
    ctx.globalAlpha = 1.0;
  }

  if (el.points.length === 1) {
    ctx.arc(el.points[0].x, el.points[0].y, (ctx.lineWidth || 3) / 2, 0, Math.PI * 2);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
  } else {
    ctx.moveTo(el.points[0].x, el.points[0].y);
    for (let i = 1; i < el.points.length - 1; i++) {
      const xc = (el.points[i].x + el.points[i + 1].x) / 2;
      const yc = (el.points[i].y + el.points[i + 1].y) / 2;
      ctx.quadraticCurveTo(el.points[i].x, el.points[i].y, xc, yc);
    }
    ctx.lineTo(el.points[el.points.length - 1].x, el.points[el.points.length - 1].y);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Lasso Marquee Selection Polygon Renderer
 */
export function drawLasso(ctx, draft) {
  if (!draft.points || draft.points.length < 2) return;
  ctx.save();
  ctx.strokeStyle = '#4262ff';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 5]);
  ctx.fillStyle = 'rgba(66, 98, 255, 0.08)';
  ctx.beginPath();
  ctx.moveTo(draft.points[0].x, draft.points[0].y);
  for (let i = 1; i < draft.points.length; i++) {
    ctx.lineTo(draft.points[i].x, draft.points[i].y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/**
 * Geometric Vector Shapes, Arrows & Connectors Renderer
 */
export function drawShape(ctx, el, isSelected) {
  ctx.save();
  ctx.strokeStyle = el.color || '#050038';
  ctx.lineWidth = el.size || 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const minX = Math.min(el.startX, el.endX);
  const maxX = Math.max(el.startX, el.endX);
  const minY = Math.min(el.startY, el.endY);
  const maxY = Math.max(el.startY, el.endY);
  const width = maxX - minX;
  const height = maxY - minY;

  if (el.fill === 'solid') {
    ctx.fillStyle = '#ffffff';
  } else if (el.fill && el.fill !== 'none') {
    ctx.fillStyle = el.fill;
  }

  if (el.type === 'rectangle') {
    ctx.beginPath();
    ctx.roundRect(minX, minY, width, height, 4);
    if (el.fill && el.fill !== 'none') ctx.fill();
    ctx.stroke();

    if (el.text) {
      ctx.fillStyle = '#050038';
      ctx.font = '600 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const lines = el.text.split('\n');
      lines.forEach((line, i) => {
        ctx.fillText(line, minX + width / 2, minY + height / 2 + (i - (lines.length - 1) / 2) * 16);
      });
    }
  } else if (el.type === 'circle') {
    ctx.beginPath();
    ctx.ellipse(minX + width / 2, minY + height / 2, Math.max(1, width / 2), Math.max(1, height / 2), 0, 0, Math.PI * 2);
    if (el.fill && el.fill !== 'none') ctx.fill();
    ctx.stroke();
  } else if (el.type === 'triangle') {
    ctx.beginPath();
    ctx.moveTo(minX + width / 2, minY);
    ctx.lineTo(maxX, maxY);
    ctx.lineTo(minX, maxY);
    ctx.closePath();
    if (el.fill && el.fill !== 'none') ctx.fill();
    ctx.stroke();
  } else if (el.type === 'diamond') {
    ctx.beginPath();
    ctx.moveTo(minX + width / 2, minY);
    ctx.lineTo(maxX, minY + height / 2);
    ctx.lineTo(minX + width / 2, maxY);
    ctx.lineTo(minX, minY + height / 2);
    ctx.closePath();
    if (el.fill && el.fill !== 'none') ctx.fill();
    ctx.stroke();
  } else if (el.type === 'arrow' || el.type === 'line') {
    ctx.beginPath();
    ctx.moveTo(el.startX, el.startY);
    ctx.lineTo(el.endX, el.endY);
    ctx.stroke();

    if (el.type === 'arrow') {
      const headlen = 14;
      const angle = Math.atan2(el.endY - el.startY, el.endX - el.startX);
      ctx.beginPath();
      ctx.moveTo(el.endX, el.endY);
      ctx.lineTo(
        el.endX - headlen * Math.cos(angle - Math.PI / 6),
        el.endY - headlen * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(el.endX, el.endY);
      ctx.lineTo(
        el.endX - headlen * Math.cos(angle + Math.PI / 6),
        el.endY - headlen * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
    }
  } else if (el.type === 'elbow_arrow') {
    const midX = (el.startX + el.endX) / 2;
    ctx.beginPath();
    ctx.moveTo(el.startX, el.startY);
    ctx.lineTo(midX, el.startY);
    ctx.lineTo(midX, el.endY);
    ctx.lineTo(el.endX, el.endY);
    ctx.stroke();

    const angle = Math.atan2(0, el.endX - midX);
    const headlen = 12;
    ctx.beginPath();
    ctx.moveTo(el.endX, el.endY);
    ctx.lineTo(el.endX - headlen * Math.cos(angle - Math.PI / 6), el.endY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(el.endX, el.endY);
    ctx.lineTo(el.endX - headlen * Math.cos(angle + Math.PI / 6), el.endY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  } else if (el.type === 'block_arrow') {
    const angle = Math.atan2(el.endY - el.startY, el.endX - el.startX);
    const length = Math.hypot(el.endX - el.startX, el.endY - el.startY);
    const headLen = Math.min(28, length * 0.4);
    const shaftW = Math.max(12, Math.min(22, length * 0.22));
    const headW = shaftW * 2.2;

    ctx.save();
    ctx.translate(el.startX, el.startY);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -shaftW / 2);
    ctx.lineTo(length - headLen, -shaftW / 2);
    ctx.lineTo(length - headLen, -headW / 2);
    ctx.lineTo(length, 0);
    ctx.lineTo(length - headLen, headW / 2);
    ctx.lineTo(length - headLen, shaftW / 2);
    ctx.lineTo(0, shaftW / 2);
    ctx.closePath();
    if (el.fill && el.fill !== 'none') {
      ctx.fillStyle = el.fill === 'solid' ? '#ffffff' : el.fill;
      ctx.fill();
    }
    ctx.stroke();
    ctx.restore();
  } else if (el.type === 'divider') {
    ctx.save();
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = el.color || '#9ca3af';
    ctx.lineWidth = el.size || 2;
    ctx.beginPath();
    ctx.moveTo(el.startX, el.startY);
    ctx.lineTo(el.endX, el.endY);
    ctx.stroke();
    ctx.restore();
  }

  if (isSelected) {
    ctx.strokeStyle = '#4262ff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(minX - 4, minY - 4, width + 8, height + 8);

    const dots = [
      { x: minX - 4, y: minY - 4 },
      { x: maxX + 4, y: minY - 4 },
      { x: minX - 4, y: maxY + 4 },
      { x: maxX + 4, y: maxY + 4 },
    ];
    ctx.fillStyle = '#ffffff';
    dots.forEach((d) => {
      ctx.beginPath();
      ctx.arc(d.x, d.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }

  ctx.restore();
}

/**
 * Text and Math Formula Canvas Renderer
 */
export function drawText(ctx, el, isSelected, isEditing = false) {
  if (isEditing) return;

  ctx.save();
  const fontSize = el.fontSize || 18;
  ctx.font = el.isMath
    ? `600 ${fontSize}px "Cambria Math", "KaTeX_Main", "Times New Roman", serif`
    : `600 ${fontSize}px Inter, sans-serif`;
  ctx.fillStyle = el.color || '#050038';
  ctx.textBaseline = 'top';

  const lines = el.text ? el.text.split('\n') : [''];
  const lineHeight = fontSize * 1.35;
  let maxW = 0;
  lines.forEach((line, idx) => {
    const w = ctx.measureText(line).width;
    if (w > maxW) maxW = w;
    // If line is a math solution like "(x = 1)", render in emerald green
    if (line.startsWith('(') && line.includes('=')) {
      ctx.fillStyle = '#10b981';
    } else {
      ctx.fillStyle = el.color || '#050038';
    }
    ctx.fillText(line, el.x, el.y + idx * lineHeight);
  });

  if (isSelected) {
    const totalH = lines.length * lineHeight;
    ctx.strokeStyle = '#4262ff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(el.x - 4, el.y - 4, maxW + 8, totalH + 8);
  }
  ctx.restore();
}

/**
 * Pure 2D Renderer for Interactive Physics Objects (Mass, Pulley, etc.)
 */
export function drawPhysicsObject(ctx, el, isSelected) {
  ctx.save();

  if (el.physicsType === 'mass') {
    const { x, y, width, height } = el;
    const radius = 8;
    const color = el.color || '#3b82f6';
    const massValue = el.properties?.mass ?? 100;

    // 1. Soft Shadow
    ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
    ctx.shadowBlur = isSelected ? 12 : 6;
    ctx.shadowOffsetY = 3;

    // 2. Mass Body Rectangle with rounded corners
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fillStyle = color;
    ctx.fill();

    // 3. Inner border / technical chamfer
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Outer boundary
    ctx.strokeStyle = isSelected ? '#4262ff' : 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    ctx.stroke();

    // 4. Physical Eyelet / Hook at Top Anchor
    const hookX = x + width / 2;
    const hookY = y;
    ctx.beginPath();
    ctx.arc(hookX, hookY - 4, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#64748b';
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Inner hole of eyelet
    ctx.beginPath();
    ctx.arc(hookX, hookY - 4, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // 5. Weight and Type Label in Whiteboard
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Label: "MASA"
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '700 9px Inter, sans-serif';
    ctx.fillText('MASA', x + width / 2, y + height / 2 - 8);

    // Label: "100 kg"
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 ${Math.max(12, Math.min(16, Math.round(width * 0.22)))}px Inter, sans-serif`;
    ctx.fillText(`${massValue} kg`, x + width / 2, y + height / 2 + 8);

    // 6. Selection Bounding Box & Anchor Highlights
    if (isSelected) {
      ctx.strokeStyle = '#4262ff';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x - 5, y - 9, width + 10, height + 14);
      ctx.setLineDash([]);

      // Highlight Anchor Points
      if (Array.isArray(el.anchors)) {
        el.anchors.forEach((a) => {
          const ax = x + a.relX * width;
          const ay = y + a.relY * height;
          ctx.beginPath();
          ctx.arc(ax, ay, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#38bdf8';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      }
    }
  } else if (el.physicsType === 'pulley') {
    const { x, y, width, height } = el;
    const cx = x + width / 2;
    const cy = y + height / 2;
    const radius = Math.min(width, height) / 2 - 4;
    const mountY = y - 14;

    // 1. Ceiling Bracket & Anchor Hatching (Rigid Ceiling Support)
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;

    // Fixed Ceiling Bar
    ctx.beginPath();
    ctx.moveTo(cx - 26, mountY);
    ctx.lineTo(cx + 26, mountY);
    ctx.stroke();

    // Physics Hatch lines for fixed rigid ceiling
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#94a3b8';
    for (let hx = cx - 22; hx <= cx + 22; hx += 7) {
      ctx.beginPath();
      ctx.moveTo(hx, mountY);
      ctx.lineTo(hx + 5, mountY - 7);
      ctx.stroke();
    }

    // Suspension Bracket Arm from ceiling down to center axle
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, mountY);
    ctx.lineTo(cx, cy);
    ctx.stroke();

    // 2. Pulley Wheel Outer Rim with Soft Shadow
    ctx.shadowColor = 'rgba(15, 23, 42, 0.15)';
    ctx.shadowBlur = isSelected ? 12 : 6;
    ctx.shadowOffsetY = 2;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#e2e8f0';
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = isSelected ? '#4262ff' : '#475569';
    ctx.lineWidth = isSelected ? 2.5 : 2;
    ctx.stroke();

    // 3. Inner Cable Groove
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 4, 0, Math.PI * 2);
    ctx.fillStyle = '#cbd5e1';
    ctx.fill();
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 4. Pulley Wheel Face & Center Hub
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 8, 0, Math.PI * 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Center Axle Hub
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#334155';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Center Axle Pin Dot
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Educational label: "POLEA"
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#64748b';
    ctx.font = '700 8.5px Inter, sans-serif';
    ctx.fillText('POLEA', cx, cy + radius + 11);

    // 5. Selection Bounding Box & Anchor Highlights
    if (isSelected) {
      ctx.strokeStyle = '#4262ff';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x - 6, y - 20, width + 12, height + 36);
      ctx.setLineDash([]);

      // Highlight Anchor Points
      if (Array.isArray(el.anchors)) {
        el.anchors.forEach((a) => {
          const ax = x + a.relX * width;
          const ay = y + a.relY * height;
          ctx.beginPath();
          ctx.arc(ax, ay, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = '#38bdf8';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      }
    }
  } else if (el.physicsType === 'mru_cart') {
    const { x, y, width, height } = el;
    const v = el.properties?.velocity !== undefined ? el.properties.velocity : 2.0;
    const bodyColor = el.color || '#0284c7';

    // 1. Soft Shadow
    ctx.shadowColor = 'rgba(15, 23, 42, 0.15)';
    ctx.shadowBlur = isSelected ? 12 : 6;
    ctx.shadowOffsetY = 3;

    // 2. Aerodynamic Cart Body
    const ch = height - 14;
    ctx.beginPath();
    ctx.roundRect(x + 4, y + 8, width - 8, ch, 8);
    ctx.fillStyle = bodyColor;
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = isSelected ? '#4262ff' : 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    ctx.stroke();

    // Chamfer inner shine
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 12);
    ctx.lineTo(x + width - 10, y + 12);
    ctx.stroke();

    // 3. Digital LCD Screen on Cart Top
    const lcdW = 68;
    const lcdH = 18;
    const lcdX = x + width / 2 - lcdW / 2;
    const lcdY = y + 13;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(lcdX, lcdY, lcdW, lcdH, 4);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Properties for customized MRU display
    const props = el.properties || {};
    const customLabel = props.label || 'Móvil MRU';
    const speedUnit = props.unit || 'm/s';
    const displaySpeed = props.displayVelocity !== undefined ? props.displayVelocity : v;
    const formattedSpeedStr = `${displaySpeed > 0 ? '+' : ''}${typeof displaySpeed === 'number' ? displaySpeed.toFixed(displaySpeed % 1 === 0 ? 0 : 2) : displaySpeed} ${speedUnit}`;

    // Monospace Velocity Text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 9.5px monospace, sans-serif';
    ctx.fillText(`v = ${formattedSpeedStr}`, x + width / 2, lcdY + 9);

    // Subtitle on chassis
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '700 8px Inter, sans-serif';
    ctx.fillText(`${customLabel.toUpperCase()} • a = 0`, x + width / 2, y + ch);

    // 4. Wheels (Low-friction precision lab bearings)
    const wheelR = 9;
    const wheelY = y + height - wheelR + 2;
    const wheelX1 = x + 22;
    const wheelX2 = x + width - 22;

    [wheelX1, wheelX2].forEach((wx) => {
      // Tire
      ctx.beginPath();
      ctx.arc(wx, wheelY, wheelR, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Rim
      ctx.beginPath();
      ctx.arc(wx, wheelY, wheelR - 3, 0, Math.PI * 2);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();

      // Pin
      ctx.beginPath();
      ctx.arc(wx, wheelY, 2, 0, Math.PI * 2);
      ctx.fillStyle = bodyColor;
      ctx.fill();
    });

    // 5. Emerald Velocity Vector Arrow (v⃗)
    if (el.properties?.showVector !== false) {
      const arrowBaseX = x + width / 2;
      const arrowBaseY = y - 4;
      const arrowLen = Math.sign(v === 0 ? 1 : v) * Math.max(34, Math.min(95, Math.abs(v) * 16));
      const arrowEndX = arrowBaseX + arrowLen;

      ctx.save();
      ctx.strokeStyle = '#10b981'; // Emerald
      ctx.fillStyle = '#10b981';
      ctx.lineWidth = 2.5;

      // Shaft
      ctx.beginPath();
      ctx.moveTo(arrowBaseX, arrowBaseY);
      ctx.lineTo(arrowEndX, arrowBaseY);
      ctx.stroke();

      // Arrowhead
      const headDir = Math.sign(arrowLen);
      ctx.beginPath();
      ctx.moveTo(arrowEndX, arrowBaseY);
      ctx.lineTo(arrowEndX - headDir * 9, arrowBaseY - 5);
      ctx.lineTo(arrowEndX - headDir * 9, arrowBaseY + 5);
      ctx.closePath();
      ctx.fill();

      // Label: "v⃗" with configured speed
      ctx.font = '800 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`v⃗ (${formattedSpeedStr})`, (arrowBaseX + arrowEndX) / 2, arrowBaseY - 4);
      ctx.restore();
    }

    // Departure Time Badge (e.g. 5:40 am, 10:55)
    if (props.departureTime) {
      ctx.save();
      const badgeText = `🕒 Salida: ${props.departureTime}`;
      ctx.font = '700 9px Inter, sans-serif';
      const badgeW = ctx.measureText(badgeText).width + 12;
      const badgeX = x + width / 2 - badgeW / 2;
      const badgeY = y + height + 6;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, 16, 4);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, x + width / 2, badgeY + 8);
      ctx.restore();
    }

    // 6. Selection Bounding Box & Anchor Highlights
    if (isSelected) {
      ctx.strokeStyle = '#4262ff';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x - 6, y - 22, width + 12, height + 28);
      ctx.setLineDash([]);

      if (Array.isArray(el.anchors)) {
        el.anchors.forEach((a) => {
          const ax = x + a.relX * width;
          const ay = y + a.relY * height;
          ctx.beginPath();
          ctx.arc(ax, ay, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = '#38bdf8';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      }
    }
  } else if (el.physicsType === 'mru_track') {
    const { x, y, width, height } = el;
    const lengthM = el.properties?.lengthMeters || 6.0;

    // 1. Aluminum Rail Extrusion Body
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 4);
    ctx.fill();
    ctx.strokeStyle = isSelected ? '#4262ff' : '#94a3b8';
    ctx.lineWidth = isSelected ? 2 : 1.5;
    ctx.stroke();

    // Center Rail Guide Channel
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x + 4, y + height - 12, width - 8, 5);

    // End Rubber Bumpers
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x, y, 6, height);
    ctx.fillRect(x + width - 6, y, 6, height);

    // Leveling feet
    const feetPositions = [x + 30, x + width - 30];
    feetPositions.forEach((fx) => {
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(fx - 10, y + height);
      ctx.lineTo(fx + 10, y + height);
      ctx.lineTo(fx + 6, y + height + 8);
      ctx.lineTo(fx - 6, y + height + 8);
      ctx.closePath();
      ctx.fill();
    });

    // 2. Metric Ruler Graduations along the track
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const usableW = width - 24;
    const startX = x + 12;
    const meterStep = usableW / lengthM;

    // Millimeter/cm small ticks
    const numSubticks = lengthM * 10;
    const subStep = usableW / numSubticks;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    for (let i = 0; i <= numSubticks; i++) {
      const tx = startX + i * subStep;
      const isMeter = i % 10 === 0;
      const isHalf = i % 5 === 0 && !isMeter;
      const tickH = isMeter ? 9 : isHalf ? 6 : 3;
      ctx.beginPath();
      ctx.moveTo(tx, y + 2);
      ctx.lineTo(tx, y + 2 + tickH);
      ctx.stroke();
    }

    // Meter numerals and labels (0 m, 1 m, 2 m...)
    for (let m = 0; m <= lengthM; m++) {
      const mx = startX + m * meterStep;
      ctx.font = '700 9px Inter, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(`${m} m`, mx, y + 13);
    }

    // Title label
    ctx.font = '700 8px Inter, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`RIEL DE LABORATORIO • MRU (${lengthM} METROS)`, x + width / 2, y + height - 8);

    // 3. Selection Bounding Box & Anchor Highlights
    if (isSelected) {
      ctx.strokeStyle = '#4262ff';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x - 4, y - 6, width + 8, height + 18);
      ctx.setLineDash([]);

      if (Array.isArray(el.anchors)) {
        el.anchors.forEach((a) => {
          const ax = x + a.relX * width;
          const ay = y + a.relY * height;
          ctx.beginPath();
          ctx.arc(ax, ay, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#38bdf8';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      }
    }
  } else if (el.physicsType === 'mru_photogate') {
    const { x, y, width, height } = el;
    const isTriggered = el.properties?.triggered || false;
    const recTime = el.properties?.recordedTime;
    const gateName = el.properties?.gateName || 'Sensor';

    // 1. Inverted "U" Optical Frame
    ctx.fillStyle = el.color || '#334155';
    ctx.beginPath();
    // Top crossbar
    ctx.roundRect(x, y, width, 24, 6);
    ctx.fill();

    // Left and Right legs
    ctx.fillRect(x + 2, y + 20, 8, height - 20);
    ctx.fillRect(x + width - 10, y + 20, 8, height - 20);

    // Mount bracket at bottom
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, y + height - 6, width, 6);

    ctx.strokeStyle = isSelected ? '#4262ff' : '#0f172a';
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.stroke();

    // 2. Infrared Sensor Beam across the gap
    const beamY = y + height * 0.65;
    ctx.strokeStyle = isTriggered ? '#10b981' : '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(x + 10, beamY);
    ctx.lineTo(x + width - 10, beamY);
    ctx.stroke();
    ctx.setLineDash([]);

    // LED status indicator
    ctx.beginPath();
    ctx.arc(x + width - 7, y + 7, 3, 0, Math.PI * 2);
    ctx.fillStyle = isTriggered ? '#10b981' : '#ef4444';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 3. Digital LCD Screen with gate time
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(x + 4, y + 4, width - 14, 15, 3);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isTriggered ? '#10b981' : '#f59e0b';
    ctx.font = '700 8.5px monospace, sans-serif';
    ctx.fillText(recTime ? `${recTime}` : '0.000s', x + (width - 6) / 2, y + 12);

    // Gate name below
    ctx.font = '700 8px Inter, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(gateName, x + width / 2, y + 34);

    // 4. Selection Bounding Box & Anchor Highlights
    if (isSelected) {
      ctx.strokeStyle = '#4262ff';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x - 4, y - 4, width + 8, height + 8);
      ctx.setLineDash([]);

      if (Array.isArray(el.anchors)) {
        el.anchors.forEach((a) => {
          const ax = x + a.relX * width;
          const ay = y + a.relY * height;
          ctx.beginPath();
          ctx.arc(ax, ay, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#38bdf8';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      }
    }
  }

  ctx.restore();
}

/**
 * Pure 2D Renderer for Physical Connections (Rope, Cable, Rod)
 */
export function drawPhysicsConnection(ctx, conn, elements, isSelected) {
  const fromEl = elements.find((el) => el.id === conn.from?.elementId);
  const toEl = elements.find((el) => el.id === conn.to?.elementId);
  if (!fromEl || !toEl) return;

  const p1 = getAnchorAbsolutePosition(fromEl, conn.from?.anchorId);
  const p2 = getAnchorAbsolutePosition(toEl, conn.to?.anchorId);
  if (!p1 || !p2) return;

  ctx.save();

  // If selected, draw soft outline halo
  if (isSelected) {
    ctx.strokeStyle = 'rgba(66, 98, 255, 0.4)';
    ctx.lineWidth = (conn.lineWidth || 2.5) + 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  // Main Rope Line (Braided physical cord appearance)
  ctx.strokeStyle = conn.color || '#334155';
  ctx.lineWidth = conn.lineWidth || 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();

  // Inner rope fiber highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Terminal Knot / Carabiner Rings at endpoints
  [p1, p2].forEach((pt) => {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#475569';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  });

  // Optional: Tension readout if sim active
  if (conn.properties?.tension !== undefined && conn.properties.tension > 0) {
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    ctx.font = '600 10px Inter, sans-serif';
    ctx.fillStyle = '#050038';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`T = ${conn.properties.tension.toFixed(1)} N`, midX + 16, midY);
  }

  ctx.restore();
}
