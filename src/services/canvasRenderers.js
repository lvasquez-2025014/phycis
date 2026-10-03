// =========================================================================
// CANVAS RENDERING ENGINES & GRAPHICS DRAWING FUNCTIONS
// Pure Canvas 2D renderers for whiteboard grids, strokes, shapes, lasso, text and physics
// =========================================================================
import { getAnchorAbsolutePosition } from '../physics/physicsRegistry';

/**
 * Scientific Engineering Graph Paper & Cartesian Coordinate Grid Renderer
 */
export function drawMiroSquareGrid(ctx, w, h, t) {
  // Base unit in world coordinates: 20px (minor) and 100px (major)
  let minorUnit = 20;
  while (minorUnit * t.scale < 12) minorUnit *= 5;
  while (minorUnit * t.scale > 60) minorUnit /= 2;

  const minorSpacing = minorUnit * t.scale;
  const majorSpacing = minorSpacing * 5;

  const minorOffsetX = ((t.x % minorSpacing) + minorSpacing) % minorSpacing;
  const minorOffsetY = ((t.y % minorSpacing) + minorSpacing) % minorSpacing;

  ctx.save();

  // 1. Subtle Engineering Millimeter Minor Grid
  ctx.strokeStyle = 'rgba(14, 116, 144, 0.05)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = minorOffsetX; x < w; x += minorSpacing) {
    ctx.moveTo(Math.floor(x) + 0.5, 0);
    ctx.lineTo(Math.floor(x) + 0.5, h);
  }
  for (let y = minorOffsetY; y < h; y += minorSpacing) {
    ctx.moveTo(0, Math.floor(y) + 0.5);
    ctx.lineTo(w, Math.floor(y) + 0.5);
  }
  ctx.stroke();

  // 2. Engineering Major Grid Lines (every 5 units)
  const majorOffsetX = ((t.x % majorSpacing) + majorSpacing) % majorSpacing;
  const majorOffsetY = ((t.y % majorSpacing) + majorSpacing) % majorSpacing;

  ctx.strokeStyle = 'rgba(14, 116, 144, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = majorOffsetX; x < w; x += majorSpacing) {
    ctx.moveTo(Math.floor(x) + 0.5, 0);
    ctx.lineTo(Math.floor(x) + 0.5, h);
  }
  for (let y = majorOffsetY; y < h; y += majorSpacing) {
    ctx.moveTo(0, Math.floor(y) + 0.5);
    ctx.lineTo(w, Math.floor(y) + 0.5);
  }
  ctx.stroke();

  // 3. Cartesian Coordinate Axes (X = 0, Y = 0 in world coords)
  const originScreenX = Math.floor(t.x) + 0.5;
  const originScreenY = Math.floor(t.y) + 0.5;

  ctx.strokeStyle = 'rgba(2, 132, 199, 0.4)';
  ctx.fillStyle = 'rgba(2, 132, 199, 0.7)';
  ctx.lineWidth = 1.5;

  // X-Axis (Horizontal)
  if (originScreenY >= 0 && originScreenY <= h) {
    ctx.beginPath();
    ctx.moveTo(0, originScreenY);
    ctx.lineTo(w, originScreenY);
    ctx.stroke();

    // +X arrow & label on right edge
    ctx.font = '600 11px ui-monospace, SFMono-Regular, monospace';
    ctx.fillText('+X (m)', w - 48, originScreenY - 6);
  }

  // Y-Axis (Vertical)
  if (originScreenX >= 0 && originScreenX <= w) {
    ctx.beginPath();
    ctx.moveTo(originScreenX, 0);
    ctx.lineTo(originScreenX, h);
    ctx.stroke();

    // +Y arrow & label on top edge
    ctx.font = '600 11px ui-monospace, SFMono-Regular, monospace';
    ctx.fillText('+Y (m)', originScreenX + 6, 20);
  }

  // Origin point marker (0, 0)
  if (originScreenX >= -20 && originScreenX <= w + 20 && originScreenY >= -20 && originScreenY <= h + 20) {
    ctx.beginPath();
    ctx.arc(originScreenX, originScreenY, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#0284c7';
    ctx.fill();
    ctx.font = '700 10px ui-monospace, SFMono-Regular, monospace';
    ctx.fillText('(0, 0)', originScreenX + 6, originScreenY + 14);
  }

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
  } else if (el.physicsType === 'mru_cart' || el.physicsType === 'mruv_cart') {
    const isMruv = el.physicsType === 'mruv_cart';
    const { x, y, width, height } = el;
    const v = el.properties?.velocity !== undefined ? el.properties.velocity : (isMruv ? 0.0 : 2.0);
    const a = el.properties?.acceleration !== undefined ? el.properties.acceleration : (isMruv ? 2.0 : 0.0);
    const bodyColor = el.color || (isMruv ? '#0ea5e9' : '#0284c7');

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
    const lcdW = isMruv ? 84 : 68;
    const lcdH = 18;
    const lcdX = x + width / 2 - lcdW / 2;
    const lcdY = y + 13;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(lcdX, lcdY, lcdW, lcdH, 4);
    ctx.fill();
    ctx.strokeStyle = isMruv ? '#38bdf8' : '#38bdf8';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Properties for customized MRU/MRUV display
    const props = el.properties || {};
    const customLabel = props.label || (isMruv ? 'Móvil MRUV' : 'Móvil MRU');
    const speedUnit = props.unit || 'm/s';
    const accelUnit = props.accelUnit || 'm/s²';
    const currentNumSpeed = typeof v === 'number' ? v : (parseFloat(v) || 0);
    const displaySpeed = isMruv ? currentNumSpeed : (props.displayVelocity !== undefined ? props.displayVelocity : v);
    const formattedSpeedNum = typeof displaySpeed === 'number' 
      ? displaySpeed.toFixed(displaySpeed % 1 === 0 ? 0 : 2) 
      : displaySpeed;
    const formattedSpeedStr = `${displaySpeed > 0 ? '+' : ''}${formattedSpeedNum} ${speedUnit}`;

    // Monospace Velocity Text on LCD
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#38bdf8';
    ctx.font = isMruv ? '700 9px monospace, sans-serif' : '700 9.5px monospace, sans-serif';
    ctx.fillText(`v = ${formattedSpeedStr}`, x + width / 2, lcdY + 9);

    // Subtitle on chassis
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '700 8px Inter, sans-serif';
    const accelStr = isMruv 
      ? `a = ${a > 0 ? '+' : ''}${typeof a === 'number' ? a.toFixed(1) : a} ${accelUnit}`
      : 'a = 0';
    ctx.fillText(`${customLabel.toUpperCase()} • ${accelStr}`, x + width / 2, y + ch);

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

    // 6. Amber Acceleration Vector Arrow (a⃗) for MRUV
    if (isMruv && el.properties?.showAccelVector !== false && a !== 0) {
      const accelArrowBaseX = x + width / 2;
      const accelArrowBaseY = y - 24;
      const accelLen = Math.sign(a) * Math.max(34, Math.min(85, Math.abs(a) * 14));
      const accelArrowEndX = accelArrowBaseX + accelLen;

      ctx.save();
      ctx.strokeStyle = '#f59e0b'; // Amber / Orange
      ctx.fillStyle = '#f59e0b';
      ctx.lineWidth = 2.5;

      // Shaft
      ctx.beginPath();
      ctx.moveTo(accelArrowBaseX, accelArrowBaseY);
      ctx.lineTo(accelArrowEndX, accelArrowBaseY);
      ctx.stroke();

      // Arrowhead
      const headDirA = Math.sign(accelLen);
      ctx.beginPath();
      ctx.moveTo(accelArrowEndX, accelArrowBaseY);
      ctx.lineTo(accelArrowEndX - headDirA * 9, accelArrowBaseY - 5);
      ctx.lineTo(accelArrowEndX - headDirA * 9, accelArrowBaseY + 5);
      ctx.closePath();
      ctx.fill();

      // Label: "a⃗" with acceleration value
      ctx.font = '800 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      const formattedAccelStr = `${a > 0 ? '+' : ''}${typeof a === 'number' ? a.toFixed(1) : a} ${accelUnit}`;
      ctx.fillText(`a⃗ (${formattedAccelStr})`, (accelArrowBaseX + accelArrowEndX) / 2, accelArrowBaseY - 4);
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

    // 7. Selection Bounding Box & Anchor Highlights
    if (isSelected) {
      ctx.strokeStyle = '#4262ff';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      const topPadding = isMruv ? 40 : 22;
      ctx.strokeRect(x - 6, y - topPadding, width + 12, height + topPadding + 6);
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
  } else if (el.physicsType === 'freefall_body') {
    const { x, y, width, height } = el;
    const props = el.properties || {};
    const v = props.velocity !== undefined ? props.velocity : 0.0;
    const g = props.gravity !== undefined ? props.gravity : 9.8;
    const bodyColor = el.color || '#ef4444';
    const radius = Math.min(width, height) / 2;
    const cx = x + width / 2;
    const cy = y + height / 2;

    // 1. Soft Ambient Shadow
    ctx.shadowColor = 'rgba(15, 23, 42, 0.2)';
    ctx.shadowBlur = isSelected ? 14 : 7;
    ctx.shadowOffsetY = 4;

    // 2. High-precision Metallic Laboratory Sphere with Specular Radial Highlight
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(
      cx - radius * 0.35,
      cy - radius * 0.35,
      radius * 0.1,
      cx,
      cy,
      radius
    );
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.35, bodyColor);
    grad.addColorStop(1, '#991b1b');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = isSelected ? '#4262ff' : 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    ctx.stroke();

    // Subtle equatorial reflective ring
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius - 2, (radius - 2) * 0.32, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Top release suspension loop
    ctx.beginPath();
    ctx.arc(cx, y - 1, 4, Math.PI, 0);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Bottom impact rubber cap
    ctx.beginPath();
    ctx.arc(cx, y + height - 2, 3.5, 0, Math.PI);
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    // 3. Digital LCD Velocity Badge mounted on top
    const lcdW = 74;
    const lcdH = 18;
    const lcdX = cx - lcdW / 2;
    const lcdY = y - 26;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(lcdX, lcdY, lcdW, lcdH, 4);
    ctx.fill();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fca5a5';
    ctx.font = '700 9px monospace, sans-serif';
    ctx.fillText(`v = ${Math.abs(v).toFixed(2)} m/s`, cx, lcdY + 9);

    // Subtitle on or near body
    ctx.fillStyle = '#334155';
    ctx.font = '700 8px Inter, sans-serif';
    ctx.fillText(props.label || 'CAÍDA LIBRE', cx, y + height + 10);

    // 4. Emerald Velocity Vector Arrow pointing DOWNWARDS (v⃗)
    if (props.showVector !== false) {
      const arrowBaseX = cx;
      const arrowBaseY = cy + radius + 2;
      const arrowLen = Math.max(26, Math.min(85, Math.abs(v) * 4.5));
      const arrowEndY = arrowBaseY + arrowLen;

      ctx.save();
      ctx.strokeStyle = '#10b981'; // Emerald
      ctx.fillStyle = '#10b981';
      ctx.lineWidth = 2.5;

      // Shaft
      ctx.beginPath();
      ctx.moveTo(arrowBaseX, arrowBaseY);
      ctx.lineTo(arrowBaseX, arrowEndY);
      ctx.stroke();

      // Arrowhead pointing down
      ctx.beginPath();
      ctx.moveTo(arrowBaseX, arrowEndY);
      ctx.lineTo(arrowBaseX - 5, arrowEndY - 8);
      ctx.lineTo(arrowBaseX + 5, arrowEndY - 8);
      ctx.closePath();
      ctx.fill();

      // Label on the right
      ctx.font = '800 9.5px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`v⃗ (${Math.abs(v).toFixed(1)} m/s)`, arrowBaseX + 8, (arrowBaseY + arrowEndY) / 2);
      ctx.restore();
    }

    // 5. Amber Gravitational Acceleration Vector Arrow pointing DOWNWARDS (g⃗)
    if (props.showGravityVector !== false) {
      const gArrowBaseX = cx - radius - 10;
      const gArrowBaseY = cy - 14;
      const gArrowLen = 38;
      const gArrowEndY = gArrowBaseY + gArrowLen;

      ctx.save();
      ctx.strokeStyle = '#f59e0b'; // Amber / Orange
      ctx.fillStyle = '#f59e0b';
      ctx.lineWidth = 2.2;

      // Shaft
      ctx.beginPath();
      ctx.moveTo(gArrowBaseX, gArrowBaseY);
      ctx.lineTo(gArrowBaseX, gArrowEndY);
      ctx.stroke();

      // Arrowhead pointing down
      ctx.beginPath();
      ctx.moveTo(gArrowBaseX, gArrowEndY);
      ctx.lineTo(gArrowBaseX - 4.5, gArrowEndY - 7);
      ctx.lineTo(gArrowBaseX + 4.5, gArrowEndY - 7);
      ctx.closePath();
      ctx.fill();

      // Label on the left
      ctx.font = '800 9px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`g⃗ = ${g.toFixed(1)} m/s²`, gArrowBaseX - 6, (gArrowBaseY + gArrowEndY) / 2);
      ctx.restore();
    }

    // 6. Selection Bounding Box & Anchor Highlights
    if (isSelected) {
      ctx.strokeStyle = '#4262ff';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x - 6, y - 32, width + 12, height + 48);
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
  } else if (el.physicsType === 'vertical_projectile') {
    const { x, y, width, height } = el;
    const props = el.properties || {};
    const v = props.velocity !== undefined ? props.velocity : 20.0;
    const g = props.gravity !== undefined ? props.gravity : 9.8;
    const currentH = props.currentHeight !== undefined ? props.currentHeight : 0.0;
    const bodyColor = el.color || '#8b5cf6';
    const radius = Math.min(width, height) / 2;
    const cx = x + width / 2;
    const cy = y + height / 2;

    // 1. Soft Ambient Shadow
    ctx.shadowColor = 'rgba(15, 23, 42, 0.22)';
    ctx.shadowBlur = isSelected ? 15 : 8;
    ctx.shadowOffsetY = 4;

    // 2. High-precision Violet/Metallic Laboratory Sphere with Specular Radial Highlight
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(
      cx - radius * 0.35,
      cy - radius * 0.35,
      radius * 0.1,
      cx,
      cy,
      radius
    );
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.35, bodyColor);
    grad.addColorStop(1, '#4c1d95');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = isSelected ? '#4262ff' : 'rgba(0, 0, 0, 0.35)';
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    ctx.stroke();

    // Subtle equatorial reflective ring
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius - 2, (radius - 2) * 0.32, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Base launch plate ring
    ctx.beginPath();
    ctx.ellipse(cx, y + height - 2, radius * 0.7, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    // 3. Digital LCD Velocity Badge mounted on top
    const isApex = Math.abs(v) < 0.25;
    const isAscending = v > 0.25;
    const lcdW = isApex ? 84 : 88;
    const lcdH = 19;
    const lcdX = cx - lcdW / 2;
    const lcdY = y - 28;

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(lcdX, lcdY, lcdW, lcdH, 4);
    ctx.fill();
    ctx.strokeStyle = isApex ? '#f59e0b' : (isAscending ? '#10b981' : '#38bdf8');
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (isApex) {
      ctx.fillStyle = '#fbbf24';
      ctx.font = '700 8.5px monospace, sans-serif';
      ctx.fillText('CÚSPIDE (v=0)', cx, lcdY + 9.5);
    } else {
      ctx.fillStyle = isAscending ? '#6ee7b7' : '#7dd3fc';
      ctx.font = '700 9px monospace, sans-serif';
      const arrow = isAscending ? '↑' : '↓';
      ctx.fillText(`${arrow} ${Math.abs(v).toFixed(1)} m/s`, cx, lcdY + 9.5);
    }

    // Subtitle on or near body: label + current height
    ctx.fillStyle = '#334155';
    ctx.font = '700 8px Inter, sans-serif';
    const heightStr = currentH > 0.05 ? ` • h = ${currentH.toFixed(1)}m` : '';
    ctx.fillText(`${props.label || 'TIRO VERTICAL'}${heightStr}`, cx, y + height + 11);

    // 4. Emerald Velocity Vector Arrow pointing UPWARDS (if v > 0) or DOWNWARDS (if v < 0)
    if (props.showVector !== false && !isApex) {
      const arrowLen = Math.max(24, Math.min(75, Math.abs(v) * 3.5));
      ctx.save();
      ctx.strokeStyle = '#10b981'; // Emerald
      ctx.fillStyle = '#10b981';
      ctx.lineWidth = 2.4;

      if (isAscending) {
        // Points upwards from above the LCD badge
        const arrowBaseY = lcdY - 2;
        const arrowEndY = arrowBaseY - arrowLen;

        ctx.beginPath();
        ctx.moveTo(cx, arrowBaseY);
        ctx.lineTo(cx, arrowEndY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx, arrowEndY);
        ctx.lineTo(cx - 5, arrowEndY + 7);
        ctx.lineTo(cx + 5, arrowEndY + 7);
        ctx.closePath();
        ctx.fill();

        ctx.font = '800 9px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`v⃗ ↑`, cx + 7, (arrowBaseY + arrowEndY) / 2);
      } else {
        // Points downwards from bottom of body
        const arrowBaseY = cy + radius + 14;
        const arrowEndY = arrowBaseY + arrowLen;

        ctx.beginPath();
        ctx.moveTo(cx, arrowBaseY);
        ctx.lineTo(cx, arrowEndY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx, arrowEndY);
        ctx.lineTo(cx - 5, arrowEndY - 7);
        ctx.lineTo(cx + 5, arrowEndY - 7);
        ctx.closePath();
        ctx.fill();

        ctx.font = '800 9px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`v⃗ ↓`, cx + 7, (arrowBaseY + arrowEndY) / 2);
      }
      ctx.restore();
    }

    // 5. Amber Gravitational Acceleration Vector Arrow pointing CONSTANTLY DOWNWARDS (g⃗)
    if (props.showGravityVector !== false) {
      const gArrowBaseX = cx - radius - 12;
      const gArrowBaseY = cy - 14;
      const gArrowLen = 36;
      const gArrowEndY = gArrowBaseY + gArrowLen;

      ctx.save();
      ctx.strokeStyle = '#f59e0b'; // Amber
      ctx.fillStyle = '#f59e0b';
      ctx.lineWidth = 2.2;

      ctx.beginPath();
      ctx.moveTo(gArrowBaseX, gArrowBaseY);
      ctx.lineTo(gArrowBaseX, gArrowEndY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(gArrowBaseX, gArrowEndY);
      ctx.lineTo(gArrowBaseX - 4.5, gArrowEndY - 7);
      ctx.lineTo(gArrowBaseX + 4.5, gArrowEndY - 7);
      ctx.closePath();
      ctx.fill();

      ctx.font = '800 9px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`g⃗ = ${g.toFixed(1)} m/s²`, gArrowBaseX - 6, (gArrowBaseY + gArrowEndY) / 2);
      ctx.restore();
    }

    // 6. Selection Bounding Box & Anchor Highlights
    if (isSelected) {
      ctx.strokeStyle = '#4262ff';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x - 6, y - 34, width + 12, height + 50);
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
  } else if (el.physicsType === 'freefall_tower') {
    const { x, y, width, height } = el;
    const heightM = el.properties?.heightMeters || 50.0;

    // 1. Structural Aluminum Tower Frame
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(x, y, width, height);

    ctx.strokeStyle = isSelected ? '#4262ff' : '#94a3b8';
    ctx.lineWidth = isSelected ? 2 : 1.5;
    ctx.strokeRect(x, y, width, height);

    // Aluminum Uprights (Left and Right Columns)
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x + 2, y, 7, height);
    ctx.fillRect(x + width - 9, y, 7, height);

    // Internal Diagonal Truss Bracing (X patterns every 40px)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.2;
    const trussStep = 38;
    for (let ty = y + 14; ty < y + height - 20; ty += trussStep) {
      ctx.beginPath();
      ctx.moveTo(x + 9, ty);
      ctx.lineTo(x + width - 9, ty + trussStep);
      ctx.moveTo(x + width - 9, ty);
      ctx.lineTo(x + 9, ty + trussStep);
      ctx.stroke();
    }

    // 2. Vertical Metric Graduation Scale & Ticks
    const usableH = height - 30;
    const startY = y + 16;
    const numSubticks = 25;
    const subStep = usableH / numSubticks;

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    for (let i = 0; i <= numSubticks; i++) {
      const ty = startY + i * subStep;
      const isMajor = i % 5 === 0;
      const tickW = isMajor ? 12 : 6;
      ctx.beginPath();
      ctx.moveTo(x + width - 9 - tickW, ty);
      ctx.lineTo(x + width - 9, ty);
      ctx.stroke();

      if (isMajor) {
        // Metric height calculation from bottom (0m at ground)
        const currentM = Math.round(heightM * (1 - i / numSubticks));
        ctx.font = '700 8px Inter, sans-serif';
        ctx.fillStyle = '#334155';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${currentM}m`, x + width - 12, ty);
      }
    }

    // 3. Top Cantilever Release Ledge
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(x - 2, y, width + 55, 12, [4, 4, 0, 0]);
    ctx.fill();

    // Ledge safety railing
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + width + 5, y - 10);
    ctx.lineTo(x + width + 50, y - 10);
    ctx.moveTo(x + width + 50, y - 10);
    ctx.lineTo(x + width + 50, y);
    ctx.stroke();

    ctx.font = '700 7.5px Inter, sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('LANZAMIENTO', x + width + 28, y - 11);

    // 4. Ground Floor Base & Impact Pad
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 8, y + height - 12, width + 68, 12);

    // Rubber shock absorber impact zone under body
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + width + 4, y + height - 14, 46, 5);

    ctx.font = '700 7px Inter, sans-serif';
    ctx.fillStyle = '#ef4444';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('IMPACTO', x + width + 27, y + height + 2);

    // Vertical Title Label
    ctx.save();
    ctx.translate(x + 15, y + height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = '700 8.5px Inter, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText(`TORRE DE CAÍDA LIBRE • ${heightM} METROS`, 0, 0);
    ctx.restore();

    // 5. Selection Bounding Box & Anchor Highlights
    if (isSelected) {
      ctx.strokeStyle = '#4262ff';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x - 12, y - 16, width + 76, height + 34);
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
  } else if (el.physicsType === 'horizontal_projectile') {
    const { x, y, width, height } = el;
    const props = el.properties || {};
    const vx = props.vx !== undefined ? props.vx : (props.initialVelocity !== undefined ? props.initialVelocity : 20.0);
    const vy = props.vy !== undefined ? props.vy : 0.0;
    const vRes = props.vResultant !== undefined ? props.vResultant : Math.sqrt(vx * vx + vy * vy);
    const angle = props.angleDeg !== undefined ? props.angleDeg : (Math.atan2(vy, vx) * 180) / Math.PI;
    const g = props.gravity !== undefined ? props.gravity : 9.8;
    const currentH = props.currentHeight !== undefined ? props.currentHeight : (props.heightMeters || 20.0);
    const currentR = props.currentRange !== undefined ? props.currentRange : 0.0;
    const isFinished = props.isFinished || false;
    const radius = Math.min(width, height) / 2;
    const cx = x + width / 2;
    const cy = y + height / 2;
    const trail = props.trailPoints || [];

    // 0. Render Parabolic Trajectory Trail
    if (props.showTrajectory !== false && trail.length > 1) {
      ctx.save();
      ctx.lineWidth = 2.0;
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = '#06b6d4'; // Cyan parabolic line
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      for (let i = 1; i < trail.length; i++) {
        ctx.lineTo(trail[i].x, trail[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Glowing trail dots along the parabola
      const step = Math.max(1, Math.floor(trail.length / 15));
      for (let i = 0; i < trail.length; i += step) {
        ctx.beginPath();
        ctx.arc(trail[i].x, trail[i].y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.7)';
        ctx.fill();
      }
      ctx.restore();
    }

    // 1. Soft Shadow
    ctx.shadowColor = 'rgba(15, 23, 42, 0.25)';
    ctx.shadowBlur = isSelected ? 15 : 8;
    ctx.shadowOffsetY = 4;

    // 2. High-precision Cyan/Steel Sphere with Specular Radial Highlight
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(
      cx - radius * 0.35,
      cy - radius * 0.35,
      radius * 0.1,
      cx,
      cy,
      radius
    );
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#38bdf8');
    grad.addColorStop(0.7, '#0284c7');
    grad.addColorStop(1, '#0c4a6e');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = isSelected ? '#4262ff' : '#0369a1';
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    ctx.stroke();

    // Equatorial reflective ring
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius - 2, (radius - 2) * 0.32, (angle * Math.PI) / 180, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // 3. Digital LCD Velocity Badge mounted on top
    const lcdW = 86;
    const lcdH = 19;
    const lcdX = cx - lcdW / 2;
    const lcdY = y - 27;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(lcdX, lcdY, lcdW, lcdH, 4);
    ctx.fill();
    ctx.strokeStyle = isFinished ? '#ef4444' : '#06b6d4';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (isFinished) {
      ctx.fillStyle = '#f87171';
      ctx.font = '700 8.5px monospace, sans-serif';
      ctx.fillText(`IMPACTO v=${vRes.toFixed(1)}m/s`, cx, lcdY + 10);
    } else {
      ctx.fillStyle = '#38bdf8';
      ctx.font = '700 9px monospace, sans-serif';
      ctx.fillText(`v = ${vRes.toFixed(1)} m/s (${angle.toFixed(0)}°)`, cx, lcdY + 10);
    }

    // Subtitle under body: label + coords
    ctx.fillStyle = '#334155';
    ctx.font = '700 8px Inter, sans-serif';
    ctx.fillText(
      `${props.label || 'PROYECTIL'} • x=${currentR.toFixed(1)}m, h=${currentH.toFixed(1)}m`,
      cx,
      y + height + 11
    );

    // 4. Emerald Resultant Velocity Vector Arrow along trajectory angle
    if (props.showResultantVector !== false && !isFinished) {
      const arrowLen = Math.max(26, Math.min(80, vRes * 2.5));
      const rad = (angle * Math.PI) / 180;
      const endX = cx + arrowLen * Math.cos(rad);
      const endY = cy + arrowLen * Math.sin(rad);

      ctx.save();
      ctx.strokeStyle = '#10b981'; // Emerald
      ctx.fillStyle = '#10b981';
      ctx.lineWidth = 2.4;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Arrowhead
      const headAngle = Math.PI / 6;
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - 8 * Math.cos(rad - headAngle), endY - 8 * Math.sin(rad - headAngle));
      ctx.lineTo(endX - 8 * Math.cos(rad + headAngle), endY - 8 * Math.sin(rad + headAngle));
      ctx.closePath();
      ctx.fill();

      ctx.font = '800 9px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`v⃗ (${vRes.toFixed(1)} m/s)`, endX + 4, endY);
      ctx.restore();
    }

    // 5. Horizontal Velocity Vector vx (Sky/Cyan) & Vertical Velocity Vector vy (Red)
    if (props.showVector !== false && !isFinished) {
      // Horizontal vx (MRU: pointing right)
      const vxLen = Math.max(20, Math.min(65, Math.abs(vx) * 2.0));
      const vxEndX = cx + vxLen;
      ctx.save();
      ctx.strokeStyle = '#0284c7';
      ctx.fillStyle = '#0284c7';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([2, 2]);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(vxEndX, cy);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(vxEndX, cy);
      ctx.lineTo(vxEndX - 6, cy - 3.5);
      ctx.lineTo(vxEndX - 6, cy + 3.5);
      ctx.closePath();
      ctx.fill();

      ctx.font = '700 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`v_x=${vx.toFixed(1)}`, (cx + vxEndX) / 2, cy - 3);

      // Vertical vy (Caída libre: pointing down)
      if (Math.abs(vy) > 0.5) {
        const vyLen = Math.max(16, Math.min(65, Math.abs(vy) * 2.0));
        const vyEndY = cy + vyLen;
        ctx.strokeStyle = '#ef4444';
        ctx.fillStyle = '#ef4444';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([2, 2]);

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, vyEndY);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(cx, vyEndY);
        ctx.lineTo(cx - 3.5, vyEndY - 6);
        ctx.lineTo(cx + 3.5, vyEndY - 6);
        ctx.closePath();
        ctx.fill();

        ctx.font = '700 8px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`v_y=${vy.toFixed(1)}`, cx - 4, (cy + vyEndY) / 2);
      }
      ctx.restore();
    }

    // 6. Selection Bounding Box & Anchor Highlights
    if (isSelected) {
      ctx.strokeStyle = '#4262ff';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x - 8, y - 34, width + 16, height + 50);
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
  } else if (el.physicsType === 'cliff_platform') {
    const { x, y, width, height } = el;
    const heightM = el.properties?.heightMeters || 20.0;

    // 1. Solid Cliff Platform Body
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, [4, 0, 0, 4]);
    ctx.fill();

    // Top launch runway ledge
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x, y, width, 14);

    // Geological strata lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    const strataStep = 32;
    for (let sy = y + 28; sy < y + height - 10; sy += strataStep) {
      ctx.beginPath();
      ctx.moveTo(x + 6, sy);
      ctx.lineTo(x + width - 6, sy);
      ctx.stroke();
    }

    // Launch Edge Red/Yellow Hazard Stripe
    const stripeW = 22;
    const stripeH = 14;
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + width - stripeW, y, stripeW, stripeH);
    ctx.fillStyle = '#0f172a';
    ctx.font = '700 8px monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('v₀→', x + width - stripeW / 2, y + stripeH / 2);

    // 2. Vertical Graduated Height Ruler on the right face of the cliff
    const rulerX = x + width;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(rulerX, y);
    ctx.lineTo(rulerX, y + height);
    ctx.stroke();

    const ticks = 10;
    const tickStep = height / ticks;
    for (let i = 0; i <= ticks; i++) {
      const ty = y + i * tickStep;
      const isMajor = i % 2 === 0;
      ctx.beginPath();
      ctx.moveTo(rulerX, ty);
      ctx.lineTo(rulerX + (isMajor ? 8 : 4), ty);
      ctx.stroke();

      if (isMajor) {
        const val = ((ticks - i) / ticks) * heightM;
        ctx.font = '700 8px Inter, sans-serif';
        ctx.fillStyle = '#475569';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${val.toFixed(0)}m`, rulerX + 11, ty);
      }
    }

    // Ground line extending horizontally to the right
    const groundY = y + height;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.lineTo(x + width + 420, groundY);
    ctx.stroke();

    // Ground hash marks
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    for (let gx = x + width; gx < x + width + 420; gx += 30) {
      ctx.beginPath();
      ctx.moveTo(gx, groundY);
      ctx.lineTo(gx - 8, groundY + 8);
      ctx.stroke();
    }

    // Ground Level Label
    ctx.font = '700 8.5px Inter, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('NIVEL DEL SUELO (y = 0)', x + width + 14, groundY + 4);

    // Platform Height Title
    ctx.save();
    ctx.translate(x + 18, y + height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = '700 9px Inter, sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.textAlign = 'center';
    ctx.fillText(`ACANTILADO • h = ${heightM} METROS`, 0, 0);
    ctx.restore();

    // 3. Selection Bounding Box & Anchors
    if (isSelected) {
      ctx.strokeStyle = '#4262ff';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x - 6, y - 6, width + 12, height + 18);
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
  } else if (el.physicsType === 'cannon_launcher') {
    const { x, y, width, height } = el;
    const props = el.properties || {};
    const angleDeg = props.angleDeg !== undefined ? props.angleDeg : 45.0;
    const v0 = props.initialVelocity !== undefined ? props.initialVelocity : 25.0;
    const angleRad = (angleDeg * Math.PI) / 180;

    // Cannon pivot point near base
    const pivotX = x + 30;
    const pivotY = y + height - 22;

    // 1. Semicircular Protractor Degree Arc (laboratory angle scale)
    const arcRadius = 42;
    ctx.save();
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, arcRadius, -Math.PI / 2, 0); // 0 to 90 degrees
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Protractor ticks at 0°, 30°, 45°, 60°, 90°
    [0, 30, 45, 60, 90].forEach((deg) => {
      const rad = -(deg * Math.PI) / 180;
      const tX1 = pivotX + Math.cos(rad) * (arcRadius - 4);
      const tY1 = pivotY + Math.sin(rad) * (arcRadius - 4);
      const tX2 = pivotX + Math.cos(rad) * (arcRadius + 4);
      const tY2 = pivotY + Math.sin(rad) * (arcRadius + 4);
      ctx.beginPath();
      ctx.moveTo(tX1, tY1);
      ctx.lineTo(tX2, tY2);
      ctx.strokeStyle = deg === Math.round(angleDeg) ? '#8b5cf6' : '#94a3b8';
      ctx.lineWidth = deg === Math.round(angleDeg) ? 2 : 1;
      ctx.stroke();

      if (deg === 0 || deg === 45 || deg === 90) {
        const textX = pivotX + Math.cos(rad) * (arcRadius + 11);
        const textY = pivotY + Math.sin(rad) * (arcRadius + 11);
        ctx.font = '700 7.5px monospace, sans-serif';
        ctx.fillStyle = deg === Math.round(angleDeg) ? '#8b5cf6' : '#64748b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${deg}°`, textX, textY);
      }
    });
    ctx.restore();

    // 2. Heavy Gun Turret Stand / Base
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(x + 8, y + height - 16, 56, 14, [3, 3, 2, 2]);
    ctx.fill();

    // Turret swivel mount dome
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(pivotX, pivotY + 4, 16, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 3. Rotatable Cannon Barrel
    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(-angleRad); // Upward angle is counter-clockwise

    const barrelLen = 52;
    const barrelW = 18;

    // Barrel metallic gradient
    const barrelGrad = ctx.createLinearGradient(0, -barrelW / 2, 0, barrelW / 2);
    barrelGrad.addColorStop(0, '#64748b');
    barrelGrad.addColorStop(0.35, '#94a3b8');
    barrelGrad.addColorStop(0.65, '#475569');
    barrelGrad.addColorStop(1, '#1e293b');

    ctx.fillStyle = barrelGrad;
    ctx.beginPath();
    ctx.roundRect(0, -barrelW / 2, barrelLen, barrelW, [3, 4, 4, 3]);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Reinforcing barrel bands
    ctx.fillStyle = '#334155';
    ctx.fillRect(14, -barrelW / 2 - 1, 6, barrelW + 2);
    ctx.fillRect(36, -barrelW / 2 - 1, 6, barrelW + 2);

    // Muzzle ring opening
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(barrelLen, 0, 3, barrelW / 2 - 1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner bore highlight
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(barrelLen, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 4. Pivot Bolt Bearing
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#e2e8f0';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#64748b';
    ctx.fill();

    // 5. Digital LCD Parameter HUD Badge
    const hudW = 74;
    const hudH = 20;
    const hudX = x + width - hudW;
    const hudY = y - 8;

    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.roundRect(hudX, hudY, hudW, hudH, 4);
    ctx.fill();
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.font = '700 8px monospace, sans-serif';
    ctx.fillStyle = '#c084fc';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`θ:${angleDeg.toFixed(1)}°`, hudX + 5, hudY + hudH / 2);

    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'right';
    ctx.fillText(`v₀:${v0.toFixed(0)}m/s`, hudX + hudW - 5, hudY + hudH / 2);

    // 6. Selection Bounding Box & Anchors
    if (isSelected) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x - 6, y - 12, width + 12, height + 20);
      ctx.setLineDash([]);

      if (Array.isArray(el.anchors)) {
        el.anchors.forEach((a) => {
          const ax = x + a.relX * width;
          const ay = y + a.relY * height;
          ctx.beginPath();
          ctx.arc(ax, ay, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = '#a855f7';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      }
    }
  } else if (el.physicsType === 'oblique_projectile') {
    const { x, y, width, height } = el;
    const props = el.properties || {};
    const vx = props.vx !== undefined ? props.vx : 17.68;
    const vy = props.vy !== undefined ? props.vy : 17.68;
    const vRes = props.vResultant !== undefined ? props.vResultant : Math.hypot(vx, vy);
    const angleDeg = props.angleDeg !== undefined ? props.angleDeg : 45.0;
    const currentHeight = props.currentHeight !== undefined ? props.currentHeight : 0.0;
    const currentRange = props.currentRange !== undefined ? props.currentRange : 0.0;
    const isFinished = props.isFinished || false;
    const reachedApex = props.reachedApex || false;
    const trail = props.trailPoints || [];
    const baseColor = props.color || '#8b5cf6';

    const cx = x + width / 2;
    const cy = y + height / 2;
    const r = Math.min(width, height) / 2;

    // 1. Parabolic Trajectory Trail with Glowing Nodes
    if (trail.length > 1) {
      ctx.save();
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
      ctx.lineWidth = 2.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      for (let i = 1; i < trail.length; i++) {
        ctx.lineTo(trail[i].x, trail[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Glowing trail sample points
      const stride = Math.max(1, Math.floor(trail.length / 14));
      for (let i = 0; i < trail.length; i += stride) {
        const pt = trail[i];
        const alpha = 0.3 + 0.7 * (i / trail.length);
        ctx.fillStyle = `rgba(192, 132, 252, ${alpha})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 2. Apex Indicator marker if apex has been reached
    if (reachedApex && trail.length > 0) {
      // Find apex point (lowest screen Y)
      let apexPt = trail[0];
      for (const pt of trail) {
        if (pt.y < apexPt.y) apexPt = pt;
      }
      if (apexPt) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(apexPt.x, apexPt.y, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = '700 8.5px Inter, sans-serif';
        ctx.fillStyle = '#d97706';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('⭐ Apex H_máx', apexPt.x, apexPt.y - 8);
        ctx.restore();
      }
    }

    // 3. Oblique Metallic Violet Projectile Sphere
    ctx.save();
    const sphereGrad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r);
    sphereGrad.addColorStop(0, '#c084fc');
    sphereGrad.addColorStop(0.35, baseColor);
    sphereGrad.addColorStop(0.85, '#581c87');
    sphereGrad.addColorStop(1, '#3b0764');

    ctx.fillStyle = sphereGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Metallic Rim & Specular Glint
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.35, cy - r * 0.35, r * 0.3, r * 0.18, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. Directional Speed and Coordinates HUD Badge
    const badgeW = 90;
    const badgeH = 22;
    const badgeX = cx - badgeW / 2;
    const badgeY = cy - r - badgeH - 8;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 5);
    ctx.fill();
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.font = '700 8px monospace, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`v:${vRes.toFixed(1)}m/s`, badgeX + 4, badgeY + badgeH / 2);

    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'right';
    ctx.fillText(`y:${currentHeight.toFixed(1)}m`, badgeX + badgeW - 4, badgeY + badgeH / 2);
    ctx.restore();

    // 5. Resultant Velocity Vector v⃗ (Purple/White Arrow)
    if (props.showVector !== false && !isFinished && vRes > 0.2) {
      const vLen = Math.max(22, Math.min(70, vRes * 1.8));
      const rad = -(angleDeg * Math.PI) / 180; // Screen Y is inverted
      const endX = cx + vLen * Math.cos(rad);
      const endY = cy + vLen * Math.sin(rad);

      ctx.save();
      ctx.strokeStyle = '#a855f7';
      ctx.fillStyle = '#a855f7';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Arrowhead
      const headAngle = Math.PI / 6;
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - 8 * Math.cos(rad - headAngle), endY - 8 * Math.sin(rad - headAngle));
      ctx.lineTo(endX - 8 * Math.cos(rad + headAngle), endY - 8 * Math.sin(rad + headAngle));
      ctx.closePath();
      ctx.fill();

      ctx.font = '800 8.5px Inter, sans-serif';
      ctx.fillStyle = '#8b5cf6';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`v⃗ (${vRes.toFixed(1)} m/s)`, endX + 4, endY);
      ctx.restore();
    }

    // 6. Vector Components vx (Cyan) and vy (Emerald or Amber)
    if (props.showVector !== false && !isFinished) {
      // Horizontal vx (MRU: constant to the right)
      if (Math.abs(vx) > 0.2) {
        const vxLen = Math.max(18, Math.min(60, Math.abs(vx) * 1.8));
        const vxEndX = cx + vxLen;
        ctx.save();
        ctx.strokeStyle = '#0284c7';
        ctx.fillStyle = '#0284c7';
        ctx.lineWidth = 1.6;
        ctx.setLineDash([2, 2]);

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(vxEndX, cy);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(vxEndX, cy);
        ctx.lineTo(vxEndX - 6, cy - 3.5);
        ctx.lineTo(vxEndX - 6, cy + 3.5);
        ctx.closePath();
        ctx.fill();

        ctx.font = '700 8px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`v_x=${vx.toFixed(1)}`, (cx + vxEndX) / 2, cy - 2);
        ctx.restore();
      }

      // Vertical vy (Upward if positive screen decrease, downward if negative)
      if (Math.abs(vy) > 0.5) {
        const vyLen = Math.max(16, Math.min(60, Math.abs(vy) * 1.8));
        const vyDir = vy >= 0 ? -1 : 1; // vy > 0 is upward (negative screen Y)
        const vyEndY = cy + vyDir * vyLen;
        const vyColor = vy >= 0 ? '#10b981' : '#f59e0b';

        ctx.save();
        ctx.strokeStyle = vyColor;
        ctx.fillStyle = vyColor;
        ctx.lineWidth = 1.6;
        ctx.setLineDash([2, 2]);

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, vyEndY);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(cx, vyEndY);
        ctx.lineTo(cx - 3.5, vyEndY - vyDir * 6);
        ctx.lineTo(cx + 3.5, vyEndY - vyDir * 6);
        ctx.closePath();
        ctx.fill();

        ctx.font = '700 8px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`v_y=${vy.toFixed(1)}`, cx - 4, (cy + vyEndY) / 2);
        ctx.restore();
      }
    }

    // 7. Selection Bounding Box & Anchors
    if (isSelected) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x - 8, y - 36, width + 16, height + 48);
      ctx.setLineDash([]);

      if (Array.isArray(el.anchors)) {
        el.anchors.forEach((a) => {
          const ax = x + a.relX * width;
          const ay = y + a.relY * height;
          ctx.beginPath();
          ctx.arc(ax, ay, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = '#a855f7';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      }
    }
  } else if (el.physicsType === 'target_wall') {
    const { x, y, width, height } = el;
    const props = el.properties || {};
    const dMeters = props.distanceMeters || 50.0;
    const targetHMeters = props.targetHeightMeters || 10.0;

    // 1. High-Precision Structural Target Wall Body
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, [4, 4, 0, 0]);
    ctx.fill();

    // Concrete masonry texture stripes
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.2;
    for (let sy = y + 20; sy < y + height - 10; sy += 24) {
      ctx.beginPath();
      ctx.moveTo(x + 2, sy);
      ctx.lineTo(x + width - 2, sy);
      ctx.stroke();
    }

    // Top fixture cap
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x, y, width, 10);

    // 2. Target Bullseye Disk located at vertical center or target height
    const bullseyeY = y + height * 0.45;
    const bullseyeX = x + width / 2;
    const outerR = Math.min(width * 0.8, 22);

    // White outer ring
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(bullseyeX, bullseyeY, outerR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Cyan second ring
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(bullseyeX, bullseyeY, outerR * 0.72, 0, Math.PI * 2);
    ctx.fill();

    // Red third ring
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(bullseyeX, bullseyeY, outerR * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Gold Center Bullseye
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(bullseyeX, bullseyeY, outerR * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Target crosshairs
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(bullseyeX - outerR, bullseyeY);
    ctx.lineTo(bullseyeX + outerR, bullseyeY);
    ctx.moveTo(bullseyeX, bullseyeY - outerR);
    ctx.lineTo(bullseyeX, bullseyeY + outerR);
    ctx.stroke();

    // 3. Vertical Height Graduations
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    const ticks = 8;
    const tickStep = height / ticks;
    for (let i = 0; i <= ticks; i++) {
      const ty = y + i * tickStep;
      ctx.beginPath();
      ctx.moveTo(x, ty);
      ctx.lineTo(x + 6, ty);
      ctx.stroke();
    }

    // 4. Ground Foundation Pad
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 6, y + height - 8, width + 12, 8);

    // 5. Title & Distance Badge on Wall
    ctx.save();
    ctx.translate(x + width / 2, y + height - 28);
    ctx.rotate(-Math.PI / 2);
    ctx.font = '700 8.5px Inter, sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.fillText(`DIANA • d = ${dMeters}m`, 0, 0);
    ctx.restore();

    // 6. Selection Bounding Box & Anchors
    if (isSelected) {
      ctx.strokeStyle = '#4262ff';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x - 8, y - 8, width + 16, height + 16);
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
  } else if (el.physicsType === 'mcu_turntable') {
    const { x, y, width, height } = el;
    const props = el.properties || {};
    const radius = Math.min(width, height) / 2;
    const cx = x + width / 2;
    const cy = y + height / 2;
    const omega = props.omega !== undefined ? props.omega : 3.0;
    const angleRad = props.angleRad !== undefined ? props.angleRad : 0.0;
    const radiusM = props.radiusMeters !== undefined ? props.radiusMeters : 1.0;
    const rpm = props.rpm !== undefined ? props.rpm : (Math.abs(omega) * 60) / (2 * Math.PI);
    const direction = props.direction || (omega >= 0 ? 'ccw' : 'cw');
    const isCcw = direction === 'ccw';

    ctx.save();

    // 1. Soft Shadow
    ctx.shadowColor = 'rgba(15, 23, 42, 0.35)';
    ctx.shadowBlur = isSelected ? 18 : 10;
    ctx.shadowOffsetY = 4;

    // 2. Outer Base Bezel & Rotor Disc
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    const outerGrad = ctx.createRadialGradient(cx, cy, radius * 0.4, cx, cy, radius);
    outerGrad.addColorStop(0, '#1e293b');
    outerGrad.addColorStop(0.85, '#0f172a');
    outerGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = outerGrad;
    ctx.fill();

    ctx.strokeStyle = isSelected ? '#4262ff' : '#0284c7';
    ctx.lineWidth = isSelected ? 2.5 : 1.8;
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // 3. Concentric Precision Track Rings
    const ringSteps = [0.25, 0.5, 0.75, 0.95];
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.lineWidth = 1;
    ringSteps.forEach((frac) => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * frac, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 4. Angular Degree Graduations (Ticks rotate dynamically with angleRad)
    for (let deg = 0; deg < 360; deg += 30) {
      const rad = (deg * Math.PI) / 180 + angleRad;
      const isMajor = deg % 90 === 0;
      const innerR = radius * (isMajor ? 0.78 : 0.86);
      const outerR = radius * 0.94;

      ctx.beginPath();
      ctx.moveTo(cx + innerR * Math.cos(rad), cy + innerR * Math.sin(rad));
      ctx.lineTo(cx + outerR * Math.cos(rad), cy + outerR * Math.sin(rad));
      ctx.strokeStyle = isMajor ? 'rgba(56, 189, 248, 0.8)' : 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = isMajor ? 1.8 : 1.0;
      ctx.stroke();

      // Cardinal Axis degree labels
      if (isMajor) {
        const labelR = radius * 0.68;
        const lx = cx + labelR * Math.cos(rad);
        const ly = cy + labelR * Math.sin(rad);
        ctx.font = '700 8.5px Inter, sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${deg}°`, lx, ly);
      }
    }

    // 4b. Rotating Internal Spokes and Optical Alignment Dot
    const hubR = radius * 0.18;
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 4; i++) {
      const spokeA = angleRad + (i * Math.PI) / 2;
      ctx.beginPath();
      ctx.moveTo(cx + hubR * Math.cos(spokeA), cy + hubR * Math.sin(spokeA));
      ctx.lineTo(cx + radius * 0.92 * Math.cos(spokeA), cy + radius * 0.92 * Math.sin(spokeA));
      ctx.stroke();
    }
    const markerR = radius * 0.84;
    ctx.beginPath();
    ctx.arc(cx + markerR * Math.cos(angleRad), cy + markerR * Math.sin(angleRad), 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();

    // 5. Angular Rotation Velocity Curved Arrow (ω)
    const arrowR = radius * 0.42;
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.2;
    const startA = isCcw ? -Math.PI * 0.3 : Math.PI * 0.3;
    const endA = isCcw ? -Math.PI * 0.95 : Math.PI * 0.95;
    ctx.arc(cx, cy, arrowR, startA, endA, isCcw);
    ctx.stroke();

    // Curved Arrowhead
    const tipX = cx + arrowR * Math.cos(endA);
    const tipY = cy + arrowR * Math.sin(endA);
    const tanAngle = endA + (isCcw ? -Math.PI / 2 : Math.PI / 2);
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX - 7 * Math.cos(tanAngle - Math.PI / 6), tipY - 7 * Math.sin(tanAngle - Math.PI / 6));
    ctx.lineTo(tipX - 7 * Math.cos(tanAngle + Math.PI / 6), tipY - 7 * Math.sin(tanAngle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    // ω label at curved arrow
    ctx.font = '800 9px Inter, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.fillText(`ω (${omega.toFixed(1)} rad/s)`, cx, cy - arrowR - 7);
    ctx.restore();

    // 6. Central Axle & Metallic Ball Bearing
    ctx.beginPath();
    ctx.arc(cx, cy, hubR, 0, Math.PI * 2);
    const hubGrad = ctx.createRadialGradient(cx - hubR * 0.3, cy - hubR * 0.3, hubR * 0.1, cx, cy, hubR);
    hubGrad.addColorStop(0, '#f8fafc');
    hubGrad.addColorStop(0.5, '#64748b');
    hubGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Center pivot point dot
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();

    // 7. Digital Tachometer Badge at Bottom
    const badgeW = 120;
    const badgeH = 20;
    const badgeX = cx - badgeW / 2;
    const badgeY = y + height + 6;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '700 8.5px monospace, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`ω = ${omega.toFixed(2)} rad/s • ${rpm.toFixed(0)} rpm`, cx, badgeY + badgeH / 2);

    ctx.restore();

    // 8. Selection Bounding Box & Anchors
    if (isSelected) {
      ctx.strokeStyle = '#4262ff';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x - 6, y - 6, width + 12, height + 12);
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
  } else if (el.physicsType === 'mcu_particle') {
    const { x, y, width, height } = el;
    const props = el.properties || {};
    const radiusPx = props.radiusPx || 110;
    const radiusM = props.radiusMeters || 1.0;
    const omega = props.omega !== undefined ? props.omega : 3.0;
    const angleRad = props.angleRad !== undefined ? props.angleRad : 0.0;
    const vt = Math.abs(omega) * radiusM;
    const ac = omega * omega * radiusM;

    // Center of rotation: read from props or calculate relative to particle position
    const cx = props.centerX !== undefined ? props.centerX : (x + width / 2 - radiusPx * Math.cos(angleRad));
    const cy = props.centerY !== undefined ? props.centerY : (y + height / 2 + radiusPx * Math.sin(angleRad));

    const px = x + width / 2;
    const py = y + height / 2;
    const particleRadius = Math.min(width, height) / 2;

    ctx.save();

    // 1. Orbital Circular Path Trajectory
    if (props.showOrbit !== false) {
      ctx.beginPath();
      ctx.arc(cx, cy, radiusPx, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 2. Radial Arm Connecting Line (r⃗)
    if (props.showRadiusLine !== false) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Radius length label at midpoint
      const midX = (cx + px) / 2;
      const midY = (cy + py) / 2;
      ctx.font = '700 8.5px Inter, sans-serif';
      ctx.fillStyle = '#0284c7';
      ctx.textAlign = 'center';
      ctx.fillText(`r = ${radiusM.toFixed(2)}m`, midX, midY - 6);
    }

    // 3. Tangential Velocity Vector v⃗_t (Emerald / Green)
    // In screen coordinates: x = cx + R*cos(θ), y = cy - R*sin(θ)
    // dx/dt = -R*ω*sin(θ), dy/dt = -R*ω*cos(θ)
    if (props.showTangentialVector !== false) {
      const vArrowLen = Math.max(28, Math.min(75, vt * 6.0));
      // Unit tangent vector
      const ux = -Math.sin(angleRad) * Math.sign(omega);
      const uy = -Math.cos(angleRad) * Math.sign(omega);
      const endVx = px + ux * vArrowLen;
      const endVy = py + uy * vArrowLen;

      ctx.save();
      ctx.strokeStyle = '#10b981';
      ctx.fillStyle = '#10b981';
      ctx.lineWidth = 2.4;

      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(endVx, endVy);
      ctx.stroke();

      // Arrowhead
      const heading = Math.atan2(uy, ux);
      ctx.beginPath();
      ctx.moveTo(endVx, endVy);
      ctx.lineTo(endVx - 8 * Math.cos(heading - Math.PI / 6), endVy - 8 * Math.sin(heading - Math.PI / 6));
      ctx.lineTo(endVx - 8 * Math.cos(heading + Math.PI / 6), endVy - 8 * Math.sin(heading + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      ctx.font = '800 9px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`v⃗_t (${vt.toFixed(2)} m/s)`, endVx + 4, endVy);
      ctx.restore();
    }

    // 4. Centripetal Acceleration Vector a⃗_c (Crimson / Rose pointing to center)
    if (props.showCentripetalVector !== false) {
      const aArrowLen = Math.max(26, Math.min(65, ac * 3.5));
      const dist = Math.hypot(cx - px, cy - py) || 1;
      const uacX = (cx - px) / dist;
      const uacY = (cy - py) / dist;
      const endAx = px + uacX * aArrowLen;
      const endAy = py + uacY * aArrowLen;

      ctx.save();
      ctx.strokeStyle = '#f43f5e';
      ctx.fillStyle = '#f43f5e';
      ctx.lineWidth = 2.4;

      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(endAx, endAy);
      ctx.stroke();

      // Arrowhead towards center
      const headA = Math.atan2(uacY, uacX);
      ctx.beginPath();
      ctx.moveTo(endAx, endAy);
      ctx.lineTo(endAx - 8 * Math.cos(headA - Math.PI / 6), endAy - 8 * Math.sin(headA - Math.PI / 6));
      ctx.lineTo(endAx - 8 * Math.cos(headA + Math.PI / 6), endAy - 8 * Math.sin(headA + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      ctx.font = '800 9px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`a⃗_c (${ac.toFixed(1)} m/s²)`, endAx - 4, endAy);
      ctx.restore();
    }

    // 5. High-Precision Metallic Sphere Particle Body
    ctx.shadowColor = 'rgba(15, 23, 42, 0.3)';
    ctx.shadowBlur = isSelected ? 14 : 7;
    ctx.shadowOffsetY = 3;

    ctx.beginPath();
    ctx.arc(px, py, particleRadius, 0, Math.PI * 2);
    const sphereGrad = ctx.createRadialGradient(
      px - particleRadius * 0.35,
      py - particleRadius * 0.35,
      particleRadius * 0.1,
      px,
      py,
      particleRadius
    );
    sphereGrad.addColorStop(0, '#ffffff');
    sphereGrad.addColorStop(0.3, '#60a5fa');
    sphereGrad.addColorStop(0.7, '#2563eb');
    sphereGrad.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = sphereGrad;
    ctx.fill();

    ctx.strokeStyle = isSelected ? '#4262ff' : '#1d4ed8';
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // 6. Digital HUD Kinematic Badge above Particle
    const badgeW = 95;
    const badgeH = 18;
    const badgeX = px - badgeW / 2;
    const badgeY = py - particleRadius - 23;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 3);
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '700 8.5px monospace, sans-serif';
    ctx.fillStyle = '#60a5fa';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`v=${vt.toFixed(1)}m/s | ac=${ac.toFixed(1)}`, px, badgeY + badgeH / 2);

    ctx.restore();

    // 7. Selection Box & Anchors
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
          ctx.arc(ax, ay, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = '#38bdf8';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      }
    }
  } else if (el.physicsType === 'mcuv_turntable') {
    const { x, y, width, height } = el;
    const props = el.properties || {};
    const radius = Math.min(width, height) / 2;
    const cx = x + width / 2;
    const cy = y + height / 2;
    const omega = props.omega !== undefined ? props.omega : 0.0;
    const alpha = props.alpha !== undefined ? props.alpha : 2.0;
    const angleRad = props.angleRad !== undefined ? props.angleRad : 0.0;
    const radiusM = props.radiusMeters !== undefined ? props.radiusMeters : 1.0;
    const rpm = props.rpm !== undefined ? props.rpm : (Math.abs(omega) * 60) / (2 * Math.PI);
    const direction = props.direction || (alpha >= 0 ? 'ccw' : 'cw');
    const isCcw = direction === 'ccw';

    ctx.save();

    // 1. Soft Shadow
    ctx.shadowColor = 'rgba(15, 23, 42, 0.35)';
    ctx.shadowBlur = isSelected ? 18 : 10;
    ctx.shadowOffsetY = 4;

    // 2. Outer Base Bezel & Rotor Disc
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    const outerGrad = ctx.createRadialGradient(cx, cy, radius * 0.4, cx, cy, radius);
    outerGrad.addColorStop(0, '#0f172a');
    outerGrad.addColorStop(0.8, '#164e63');
    outerGrad.addColorStop(1, '#0891b2');
    ctx.fillStyle = outerGrad;
    ctx.fill();

    ctx.strokeStyle = isSelected ? '#4262ff' : '#0891b2';
    ctx.lineWidth = isSelected ? 2.5 : 1.8;
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // 3. Concentric Precision Track Rings
    const ringSteps = [0.25, 0.5, 0.75, 0.95];
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.25)';
    ctx.lineWidth = 1;
    ringSteps.forEach((frac) => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * frac, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 4. Angular Degree Graduations (Ticks rotate dynamically with angleRad)
    for (let deg = 0; deg < 360; deg += 30) {
      const rad = (deg * Math.PI) / 180 + angleRad;
      const isMajor = deg % 90 === 0;
      const innerR = radius * (isMajor ? 0.78 : 0.86);
      const outerR = radius * 0.94;

      ctx.beginPath();
      ctx.moveTo(cx + innerR * Math.cos(rad), cy + innerR * Math.sin(rad));
      ctx.lineTo(cx + outerR * Math.cos(rad), cy + outerR * Math.sin(rad));
      ctx.strokeStyle = isMajor ? 'rgba(34, 211, 238, 0.85)' : 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = isMajor ? 1.8 : 1.0;
      ctx.stroke();

      if (isMajor) {
        const labelR = radius * 0.68;
        const lx = cx + labelR * Math.cos(rad);
        const ly = cy + labelR * Math.sin(rad);
        ctx.font = '700 8.5px Inter, sans-serif';
        ctx.fillStyle = '#22d3ee';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${deg}°`, lx, ly);
      }
    }

    // 4b. Rotating Internal Spokes and Optical Alignment Dot
    const hubR = radius * 0.18;
    ctx.save();
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.55)';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 4; i++) {
      const spokeA = angleRad + (i * Math.PI) / 2;
      ctx.beginPath();
      ctx.moveTo(cx + hubR * Math.cos(spokeA), cy + hubR * Math.sin(spokeA));
      ctx.lineTo(cx + radius * 0.92 * Math.cos(spokeA), cy + radius * 0.92 * Math.sin(spokeA));
      ctx.stroke();
    }
    // High-visibility amber alignment dot on the rotor perimeter
    const markerR = radius * 0.84;
    ctx.beginPath();
    ctx.arc(cx + markerR * Math.cos(angleRad), cy + markerR * Math.sin(angleRad), 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();

    // 5. Angular Velocity & Acceleration Curved Arrow
    const arrowR = radius * 0.42;
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.4;
    const startA = isCcw ? -Math.PI * 0.3 : Math.PI * 0.3;
    const endA = isCcw ? -Math.PI * 0.95 : Math.PI * 0.95;
    ctx.arc(cx, cy, arrowR, startA, endA, isCcw);
    ctx.stroke();

    // Curved Arrowhead
    const tipX = cx + arrowR * Math.cos(endA);
    const tipY = cy + arrowR * Math.sin(endA);
    const tanAngle = endA + (isCcw ? -Math.PI / 2 : Math.PI / 2);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX - 7 * Math.cos(tanAngle - Math.PI / 6), tipY - 7 * Math.sin(tanAngle - Math.PI / 6));
    ctx.lineTo(tipX - 7 * Math.cos(tanAngle + Math.PI / 6), tipY - 7 * Math.sin(tanAngle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    // Label at curved arrow
    ctx.font = '800 8.5px Inter, sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.fillText(`α = ${alpha.toFixed(1)} rad/s²`, cx, cy - arrowR - 7);
    ctx.restore();

    // 6. Central Axle & Metallic Hub
    ctx.beginPath();
    ctx.arc(cx, cy, hubR, 0, Math.PI * 2);
    const hubGrad = ctx.createRadialGradient(cx - hubR * 0.3, cy - hubR * 0.3, hubR * 0.1, cx, cy, hubR);
    hubGrad.addColorStop(0, '#f8fafc');
    hubGrad.addColorStop(0.5, '#475569');
    hubGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Center pivot point dot
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();

    // 7. Digital Tachometer Badge at Bottom
    const badgeW = 140;
    const badgeH = 20;
    const badgeX = cx - badgeW / 2;
    const badgeY = y + height + 6;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
    ctx.fill();
    ctx.strokeStyle = '#0891b2';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '700 8px monospace, sans-serif';
    ctx.fillStyle = '#22d3ee';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`ω=${omega.toFixed(1)} rad/s • α=${alpha.toFixed(1)} • ${rpm.toFixed(0)} rpm`, cx, badgeY + badgeH / 2);

    ctx.restore();

    // 8. Selection Bounding Box & Anchors
    if (isSelected) {
      ctx.strokeStyle = '#4262ff';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x - 6, y - 6, width + 12, height + 12);
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
  } else if (el.physicsType === 'mcuv_particle') {
    const { x, y, width, height } = el;
    const props = el.properties || {};
    const radiusPx = props.radiusPx || 110;
    const radiusM = props.radiusMeters || 1.0;
    const omega = props.omega !== undefined ? props.omega : 0.0;
    const alpha = props.alpha !== undefined ? props.alpha : 2.0;
    const angleRad = props.angleRad !== undefined ? props.angleRad : 0.0;
    const vt = Math.abs(omega) * radiusM;
    const ac = omega * omega * radiusM;
    const at = Math.abs(alpha) * radiusM;
    const aTotal = Math.hypot(ac, at);

    // Center of rotation: read from props or calculate relative to particle position
    const cx = props.centerX !== undefined ? props.centerX : (x + width / 2 - radiusPx * Math.cos(angleRad));
    const cy = props.centerY !== undefined ? props.centerY : (y + height / 2 + radiusPx * Math.sin(angleRad));

    const px = x + width / 2;
    const py = y + height / 2;
    const particleRadius = Math.min(width, height) / 2;

    ctx.save();

    // 1. Orbital Circular Path Trajectory
    if (props.showOrbit !== false) {
      ctx.beginPath();
      ctx.arc(cx, cy, radiusPx, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 2. Radial Arm Connecting Line (r⃗)
    if (props.showRadiusLine !== false) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      const midX = (cx + px) / 2;
      const midY = (cy + py) / 2;
      ctx.font = '700 8.5px Inter, sans-serif';
      ctx.fillStyle = '#0891b2';
      ctx.textAlign = 'center';
      ctx.fillText(`r = ${radiusM.toFixed(2)}m`, midX, midY - 6);
    }

    // Tangent unit direction in screen coords: CCW direction is (-sinθ, -cosθ)
    const signW = Math.sign(omega) || 1;
    const signA = Math.sign(alpha) || 1;

    // 3. Tangential Velocity Vector v⃗_t (Emerald #10b981)
    if (props.showTangentialVector !== false && vt > 0.05) {
      const vArrowLen = Math.max(26, Math.min(75, vt * 5.5));
      const ux = -Math.sin(angleRad) * signW;
      const uy = -Math.cos(angleRad) * signW;
      const endVx = px + ux * vArrowLen;
      const endVy = py + uy * vArrowLen;

      ctx.save();
      ctx.strokeStyle = '#10b981';
      ctx.fillStyle = '#10b981';
      ctx.lineWidth = 2.4;

      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(endVx, endVy);
      ctx.stroke();

      const heading = Math.atan2(uy, ux);
      ctx.beginPath();
      ctx.moveTo(endVx, endVy);
      ctx.lineTo(endVx - 7 * Math.cos(heading - Math.PI / 6), endVy - 7 * Math.sin(heading - Math.PI / 6));
      ctx.lineTo(endVx - 7 * Math.cos(heading + Math.PI / 6), endVy - 7 * Math.sin(heading + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      ctx.font = '800 8.5px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`v⃗_t (${vt.toFixed(1)} m/s)`, endVx + 4, endVy);
      ctx.restore();
    }

    // 4. Centripetal Acceleration Vector a⃗_c (Crimson / Rose #f43f5e pointing to center)
    const dist = Math.hypot(cx - px, cy - py) || 1;
    const uacX = (cx - px) / dist;
    const uacY = (cy - py) / dist;

    if (props.showCentripetalVector !== false && ac > 0.05) {
      const acArrowLen = Math.max(24, Math.min(65, ac * 3.0));
      const endAcX = px + uacX * acArrowLen;
      const endAcY = py + uacY * acArrowLen;

      ctx.save();
      ctx.strokeStyle = '#f43f5e';
      ctx.fillStyle = '#f43f5e';
      ctx.lineWidth = 2.2;

      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(endAcX, endAcY);
      ctx.stroke();

      const headAc = Math.atan2(uacY, uacX);
      ctx.beginPath();
      ctx.moveTo(endAcX, endAcY);
      ctx.lineTo(endAcX - 7 * Math.cos(headAc - Math.PI / 6), endAcY - 7 * Math.sin(headAc - Math.PI / 6));
      ctx.lineTo(endAcX - 7 * Math.cos(headAc + Math.PI / 6), endAcY - 7 * Math.sin(headAc + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      ctx.font = '800 8.5px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`a⃗_c (${ac.toFixed(1)} m/s²)`, endAcX - 4, endAcY);
      ctx.restore();
    }

    // 5. Tangential Acceleration Vector a⃗_t (Amber #f59e0b)
    const uatX = -Math.sin(angleRad) * signA;
    const uatY = -Math.cos(angleRad) * signA;

    if (props.showTangentialAccelVector !== false && at > 0.05) {
      const atArrowLen = Math.max(24, Math.min(65, at * 5.0));
      const endAtX = px + uatX * atArrowLen;
      const endAtY = py + uatY * atArrowLen;

      ctx.save();
      ctx.strokeStyle = '#f59e0b';
      ctx.fillStyle = '#f59e0b';
      ctx.lineWidth = 2.2;

      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(endAtX, endAtY);
      ctx.stroke();

      const headAt = Math.atan2(uatY, uatX);
      ctx.beginPath();
      ctx.moveTo(endAtX, endAtY);
      ctx.lineTo(endAtX - 7 * Math.cos(headAt - Math.PI / 6), endAtY - 7 * Math.sin(headAt - Math.PI / 6));
      ctx.lineTo(endAtX - 7 * Math.cos(headAt + Math.PI / 6), endAtY - 7 * Math.sin(headAt + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      ctx.font = '800 8.5px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`a⃗_t (${at.toFixed(1)} m/s²)`, endAtX + 4, endAtY);
      ctx.restore();
    }

    // 6. Total Acceleration Resultant Vector a⃗_total (Violet #8b5cf6 = a⃗_c + a⃗_t)
    if (props.showTotalAccelVector !== false && aTotal > 0.05) {
      const vecTotalX = ac * uacX + at * uatX;
      const vecTotalY = ac * uacY + at * uatY;
      const totalMag = Math.hypot(vecTotalX, vecTotalY) || 1;
      const uTotX = vecTotalX / totalMag;
      const uTotY = vecTotalY / totalMag;

      const aTotArrowLen = Math.max(28, Math.min(75, aTotal * 3.0));
      const endTotX = px + uTotX * aTotArrowLen;
      const endTotY = py + uTotY * aTotArrowLen;

      ctx.save();
      ctx.strokeStyle = '#8b5cf6';
      ctx.fillStyle = '#8b5cf6';
      ctx.lineWidth = 2.4;

      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(endTotX, endTotY);
      ctx.stroke();

      const headTot = Math.atan2(uTotY, uTotX);
      ctx.beginPath();
      ctx.moveTo(endTotX, endTotY);
      ctx.lineTo(endTotX - 8 * Math.cos(headTot - Math.PI / 6), endTotY - 8 * Math.sin(headTot - Math.PI / 6));
      ctx.lineTo(endTotX - 8 * Math.cos(headTot + Math.PI / 6), endTotY - 8 * Math.sin(headTot + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      ctx.font = '800 8.5px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`a⃗_tot (${aTotal.toFixed(1)})`, endTotX + 4, endTotY - 3);
      ctx.restore();
    }

    // 7. High-Precision Metallic Sphere Particle Body
    ctx.shadowColor = 'rgba(15, 23, 42, 0.3)';
    ctx.shadowBlur = isSelected ? 14 : 7;
    ctx.shadowOffsetY = 3;

    ctx.beginPath();
    ctx.arc(px, py, particleRadius, 0, Math.PI * 2);
    const sphereGrad = ctx.createRadialGradient(
      px - particleRadius * 0.35,
      py - particleRadius * 0.35,
      particleRadius * 0.1,
      px,
      py,
      particleRadius
    );
    sphereGrad.addColorStop(0, '#ffffff');
    sphereGrad.addColorStop(0.3, '#22d3ee');
    sphereGrad.addColorStop(0.7, '#0891b2');
    sphereGrad.addColorStop(1, '#0e7490');
    ctx.fillStyle = sphereGrad;
    ctx.fill();

    ctx.strokeStyle = isSelected ? '#4262ff' : '#0891b2';
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // 8. Digital HUD Kinematic Badge above Particle
    const badgeW = 110;
    const badgeH = 18;
    const badgeX = px - badgeW / 2;
    const badgeY = py - particleRadius - 23;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 3);
    ctx.fill();
    ctx.strokeStyle = '#0891b2';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '700 8px monospace, sans-serif';
    ctx.fillStyle = '#22d3ee';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`vt=${vt.toFixed(1)} | at=${at.toFixed(1)} | ac=${ac.toFixed(1)}`, px, badgeY + badgeH / 2);

    ctx.restore();

    // 9. Selection Box & Anchors
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
          ctx.arc(ax, ay, 4.5, 0, Math.PI * 2);
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
