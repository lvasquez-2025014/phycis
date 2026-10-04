// =========================================================================
// CANVAS RENDERING ENGINES & GRAPHICS DRAWING FUNCTIONS
// Pure Canvas 2D renderers for whiteboard grids, strokes, shapes, lasso, text and physics
// =========================================================================
import {
  getAnchorAbsolutePosition,
  getNewtonApparatusLayout,
  computeNewtonDynamics,
  normalizeNewtonApparatusType,
} from '../physics/physicsRegistry';

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

// Helper for drawing sharp vector arrows with colored badge for DCL apparatuses
function drawDclVectorWithBadge(ctx, sx, sy, ex, ey, color, labelText) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  // Arrowhead
  const angle = Math.atan2(ey - sy, ex - sx);
  ctx.save();
  ctx.translate(ex, ey);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-8, -4.5);
  ctx.lineTo(-6.5, 0);
  ctx.lineTo(-8, 4.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Badge
  if (labelText) {
    ctx.save();
    ctx.font = '700 8.5px Inter, sans-serif';
    const tm = ctx.measureText(labelText);
    const bw = tm.width + 7;
    const bh = 14;
    const dist = 13;
    const bx = ex + Math.cos(angle) * dist;
    const by = ey + Math.sin(angle) * dist;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(bx - bw / 2, by - bh / 2, bw, bh, 3.5);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labelText, bx, by);
    ctx.restore();
  }
  ctx.restore();
}

// Official theoretical solution vectors for HT02 #10 (Table with 3 masses)
export const OFFICIAL_TABLE_THREE_MASSES_VECTORS = [
  // m1 (left hanging 6 kg)
  { id: 'off_m1_t1', targetBody: 'm1', name: 'Tensión 1', symbol: 'T₁', label: 'T₁ = 61.15 N', angleDeg: 90, color: '#10b981', type: 'tension', magnitude: 61.15, lengthPx: 60 },
  { id: 'off_m1_w1', targetBody: 'm1', name: 'Peso 1', symbol: 'W₁', label: 'W₁ = 58.80 N', angleDeg: 270, color: '#ef4444', type: 'weight', magnitude: 58.80, lengthPx: 60 },
  // m2 (center on table 10 kg)
  { id: 'off_m2_n', targetBody: 'm2', name: 'Normal', symbol: 'N', label: 'N = 98.00 N', angleDeg: 90, color: '#3b82f6', type: 'normal', magnitude: 98.00, lengthPx: 62 },
  { id: 'off_m2_w2', targetBody: 'm2', name: 'Peso 2', symbol: 'W₂', label: 'W₂ = 98.00 N', angleDeg: 270, color: '#ef4444', type: 'weight', magnitude: 98.00, lengthPx: 62 },
  { id: 'off_m2_t2', targetBody: 'm2', name: 'Tensión 2', symbol: 'T₂', label: 'T₂ = 84.67 N', angleDeg: 0, color: '#059669', type: 'tension', magnitude: 84.67, lengthPx: 75 },
  { id: 'off_m2_t1', targetBody: 'm2', name: 'Tensión 1', symbol: 'T₁', label: 'T₁ = 61.15 N', angleDeg: 180, color: '#10b981', type: 'tension', magnitude: 61.15, lengthPx: 65 },
  { id: 'off_m2_fk', targetBody: 'm2', name: 'Fricción', symbol: 'fk', label: 'fk = 19.60 N', angleDeg: 180, color: '#f59e0b', type: 'friction', magnitude: 19.60, lengthPx: 46 },
  // m3 (right hanging 9 kg)
  { id: 'off_m3_t2', targetBody: 'm3', name: 'Tensión 2', symbol: 'T₂', label: 'T₂ = 84.67 N', angleDeg: 90, color: '#059669', type: 'tension', magnitude: 84.67, lengthPx: 60 },
  { id: 'off_m3_w3', targetBody: 'm3', name: 'Peso 3', symbol: 'W₃', label: 'W₃ = 88.20 N', angleDeg: 270, color: '#ef4444', type: 'weight', magnitude: 88.20, lengthPx: 62 },
];

// Official theoretical solution vectors for HT02 #2 (Table with 2 masses)
export const OFFICIAL_TABLE_TWO_MASSES_VECTORS = [
  // m1 (block on frictionless table)
  { id: 'off_m1_n', targetBody: 'm1', name: 'Normal', symbol: 'N₁', label: 'N₁', angleDeg: 90, color: '#3b82f6', type: 'normal', lengthPx: 58 },
  { id: 'off_m1_w1', targetBody: 'm1', name: 'Peso 1', symbol: 'W₁', label: 'W₁ = m₁·g', angleDeg: 270, color: '#ef4444', type: 'weight', lengthPx: 58 },
  { id: 'off_m1_t', targetBody: 'm1', name: 'Tensión', symbol: 'T', label: 'T', angleDeg: 0, color: '#10b981', type: 'tension', lengthPx: 70 },
  // m2 (hanging mass)
  { id: 'off_m2_t', targetBody: 'm2', name: 'Tensión', symbol: 'T', label: 'T', angleDeg: 90, color: '#10b981', type: 'tension', lengthPx: 56 },
  { id: 'off_m2_w2', targetBody: 'm2', name: 'Peso 2', symbol: 'W₂', label: 'W₂ = m₂·g', angleDeg: 270, color: '#ef4444', type: 'weight', lengthPx: 58 },
];

// Official theoretical solution vectors for HT03 (Equilibrio Traslacional - Primera Ley de Newton)
export const OFFICIAL_EQUILIBRIO_VECTORS = {
  cable_knot_wall: [
    { id: 'off_p1_ft1', targetBody: 'knot', name: 'Tensión FT1', symbol: 'FT1', label: 'FT1 = 503.46 N', angleDeg: 180, color: '#3b82f6', type: 'tension', magnitude: 503.46, lengthPx: 68 },
    { id: 'off_p1_ft2', targetBody: 'knot', name: 'Tensión FT2', symbol: 'FT2', label: 'FT2 = 783.24 N', angleDeg: 50, color: '#10b981', type: 'tension', magnitude: 783.24, lengthPx: 75 },
    { id: 'off_p1_w', targetBody: 'knot', name: 'Peso', symbol: 'W', label: 'W = 600 N', angleDeg: 270, color: '#ef4444', type: 'weight', magnitude: 600, lengthPx: 70 },
  ],
  two_pulleys_three_weights: [
    { id: 'off_p2_fw1', targetBody: 'knot', name: 'Peso FW1', symbol: 'FW1', label: 'FW1 = 500 N', angleDeg: 270, color: '#ef4444', type: 'weight', magnitude: 500, lengthPx: 70 },
    { id: 'off_p2_fw2', targetBody: 'knot', name: 'Tensión FW2', symbol: 'FW2', label: 'FW2 = 411.14 N', angleDeg: 130, color: '#3b82f6', type: 'tension', magnitude: 411.14, lengthPx: 68 },
    { id: 'off_p2_fw3', targetBody: 'knot', name: 'Tensión FW3', symbol: 'FW3', label: 'FW3 = 322.62 N', angleDeg: 35, color: '#10b981', type: 'tension', magnitude: 322.62, lengthPx: 64 },
  ],
  engine_suspended_cables: [
    { id: 'off_p3_w', targetBody: 'knot_A', name: 'Peso Motor', symbol: 'W', label: 'W = 1960 N', angleDeg: 270, color: '#ef4444', type: 'weight', magnitude: 1960, lengthPx: 72 },
    { id: 'off_p3_tab', targetBody: 'knot_A', name: 'Tensión TAB', symbol: 'TAB', label: 'TAB = 1434.82 N', angleDeg: 120, color: '#3b82f6', type: 'tension', magnitude: 1434.82, lengthPx: 70 },
    { id: 'off_p3_tac', targetBody: 'knot_A', name: 'Tensión TAC', symbol: 'TAC', label: 'TAC = 1014.57 N', angleDeg: 45, color: '#10b981', type: 'tension', magnitude: 1014.57, lengthPx: 66 },
  ],
  triangular_knot_slope: [
    { id: 'off_p4_w', targetBody: 'knot_A', name: 'Peso', symbol: 'W', label: 'W = 200 N', angleDeg: 270, color: '#ef4444', type: 'weight', magnitude: 200, lengthPx: 70 },
    { id: 'off_p4_tba', targetBody: 'knot_A', name: 'Tensión TBA', symbol: 'TBA', label: 'TBA = 108.74 N', angleDeg: 126.87, color: '#3b82f6', type: 'tension', magnitude: 108.74, lengthPx: 65 },
    { id: 'off_p4_tca', targetBody: 'knot_A', name: 'Tensión TCA', symbol: 'TCA', label: 'TCA = 130.49 N', angleDeg: 60, color: '#10b981', type: 'tension', magnitude: 130.49, lengthPx: 68 },
  ],
  crate_two_cables: [
    { id: 'off_p5_fad', targetBody: 'knot_A', name: 'Tensión FAD', symbol: 'FAD', label: 'FAD = 500 lb', angleDeg: 270, color: '#ef4444', type: 'weight', magnitude: 500, lengthPx: 70 },
    { id: 'off_p5_fab', targetBody: 'knot_A', name: 'Fuerza FAB', symbol: 'FAB', label: 'FAB = 434.96 lb', angleDeg: 150, color: '#3b82f6', type: 'tension', magnitude: 434.96, lengthPx: 68 },
    { id: 'off_p5_fac', targetBody: 'knot_A', name: 'Fuerza FAC', symbol: 'FAC', label: 'FAC = 470.86 lb', angleDeg: 36.87, color: '#10b981', type: 'tension', magnitude: 470.86, lengthPx: 70 },
  ],
  pulley_cylinder_knot: [
    { id: 'off_p6_wa', targetBody: 'knot_E', name: 'Peso A', symbol: 'WA', label: 'WA = 196 N', angleDeg: 270, color: '#ef4444', type: 'weight', magnitude: 196, lengthPx: 68 },
    { id: 'off_p6_ted', targetBody: 'knot_E', name: 'Tensión TED', symbol: 'TED', label: 'TED = 339.48 N', angleDeg: 180, color: '#3b82f6', type: 'tension', magnitude: 339.48, lengthPx: 68 },
    { id: 'off_p6_teb', targetBody: 'knot_E', name: 'Tensión TEB', symbol: 'TEB', label: 'TEB = 392 N', angleDeg: 30, color: '#10b981', type: 'tension', magnitude: 392, lengthPx: 72 },
  ],
  traffic_lights_span: [
    { id: 'off_p7_w1', targetBody: 'knot_B', name: 'Peso 1', symbol: 'W1', label: 'W1 = 98 N (10 kg)', angleDeg: 270, color: '#ef4444', type: 'weight', magnitude: 98, lengthPx: 62 },
    { id: 'off_p7_tab', targetBody: 'knot_B', name: 'Tensión TAB', symbol: 'TAB', label: 'TAB = 378.64 N', angleDeg: 165, color: '#3b82f6', type: 'tension', magnitude: 378.64, lengthPx: 68 },
    { id: 'off_p7_tbc_b', targetBody: 'knot_B', name: 'Tensión TBC', symbol: 'TBC', label: 'TBC = 365.74 N', angleDeg: 0, color: '#10b981', type: 'tension', magnitude: 365.74, lengthPx: 68 },
    { id: 'off_p7_w2', targetBody: 'knot_C', name: 'Peso 2', symbol: 'W2', label: 'W2 = 147 N (15 kg)', angleDeg: 270, color: '#ef4444', type: 'weight', magnitude: 147, lengthPx: 64 },
    { id: 'off_p7_tbc_c', targetBody: 'knot_C', name: 'Tensión TBC', symbol: 'TBC', label: 'TBC = 365.74 N', angleDeg: 180, color: '#10b981', type: 'tension', magnitude: 365.74, lengthPx: 68 },
    { id: 'off_p7_tcd', targetBody: 'knot_C', name: 'Tensión TCD', symbol: 'TCD', label: 'TCD = 392.41 N', angleDeg: 22, color: '#8b5cf6', type: 'tension', magnitude: 392.41, lengthPx: 70 },
  ],
  double_inclined_planes: [
    { id: 'off_p8_wb', targetBody: 'box_B', name: 'Peso B', symbol: 'WB', label: 'WB = 40 lb', angleDeg: 270, color: '#ef4444', type: 'weight', magnitude: 40, lengthPx: 60 },
    { id: 'off_p8_nb', targetBody: 'box_B', name: 'Normal B', symbol: 'NB', label: 'NB = 13.68 lb', angleDeg: 160, color: '#3b82f6', type: 'normal', magnitude: 13.68, lengthPx: 58 },
    { id: 'off_p8_ta', targetBody: 'box_B', name: 'Tensión TA', symbol: 'TA', label: 'TA = 23.91 lb', angleDeg: 70, color: '#10b981', type: 'tension', magnitude: 23.91, lengthPx: 65 },
    { id: 'off_p8_tc_b', targetBody: 'box_B', name: 'Tensión TC', symbol: 'TC', label: 'TC = 13.68 lb', angleDeg: 70, color: '#f59e0b', type: 'tension', magnitude: 13.68, lengthPx: 55 },
    { id: 'off_p8_wd', targetBody: 'box_D', name: 'Peso D', symbol: 'WD', label: 'WD = 40 lb', angleDeg: 270, color: '#ef4444', type: 'weight', magnitude: 40, lengthPx: 60 },
    { id: 'off_p8_nd', targetBody: 'box_D', name: 'Normal D', symbol: 'ND', label: 'ND = 37.59 lb', angleDeg: 110, color: '#3b82f6', type: 'normal', magnitude: 37.59, lengthPx: 62 },
    { id: 'off_p8_tc_d', targetBody: 'box_D', name: 'Tensión TC', symbol: 'TC', label: 'TC = 13.68 lb', angleDeg: 160, color: '#10b981', type: 'tension', magnitude: 13.68, lengthPx: 58 },
  ],
};

// Official theoretical solution vectors for HT01 (Segunda Ley de Newton - Dinámica sin Fricción)
export const OFFICIAL_NEWTON_VECTORS = {
  two_connected_blocks: [
    { id: 'off_nb_t1', targetBody: 'block1', name: 'Tensión T', symbol: 'T', label: 'T = 20.0 N', angleDeg: 0, color: '#10b981', type: 'tension', magnitude: 20.0, lengthPx: 55 },
    { id: 'off_nb_w1', targetBody: 'block1', name: 'Peso W₁', symbol: 'W₁', label: 'W₁ = 19.6 N', angleDeg: 270, color: '#ef4444', type: 'weight', magnitude: 19.6, lengthPx: 52 },
    { id: 'off_nb_n1', targetBody: 'block1', name: 'Normal N₁', symbol: 'N₁', label: 'N₁ = 19.6 N', angleDeg: 90, color: '#3b82f6', type: 'normal', magnitude: 19.6, lengthPx: 52 },
    { id: 'off_nb_f2', targetBody: 'block2', name: 'Fuerza F', symbol: 'F', label: 'F = 80.0 N', angleDeg: 0, color: '#8b5cf6', type: 'applied', magnitude: 80.0, lengthPx: 85 },
    { id: 'off_nb_t2', targetBody: 'block2', name: 'Tensión T', symbol: 'T', label: 'T = 20.0 N', angleDeg: 180, color: '#10b981', type: 'tension', magnitude: 20.0, lengthPx: 55 },
    { id: 'off_nb_w2', targetBody: 'block2', name: 'Peso W₂', symbol: 'W₂', label: 'W₂ = 58.8 N', angleDeg: 270, color: '#ef4444', type: 'weight', magnitude: 58.8, lengthPx: 68 },
    { id: 'off_nb_n2', targetBody: 'block2', name: 'Normal N₂', symbol: 'N₂', label: 'N₂ = 58.8 N', angleDeg: 90, color: '#3b82f6', type: 'normal', magnitude: 58.8, lengthPx: 68 },
  ],
  single_block_force: [
    { id: 'off_sb_f', targetBody: 'block', name: 'Fuerza F', symbol: 'F', label: 'F = 12.0 N', angleDeg: 0, color: '#8b5cf6', type: 'applied', magnitude: 12.0, lengthPx: 75 },
    { id: 'off_sb_w', targetBody: 'block', name: 'Peso W', symbol: 'W', label: 'W = 39.2 N', angleDeg: 270, color: '#ef4444', type: 'weight', magnitude: 39.2, lengthPx: 58 },
    { id: 'off_sb_n', targetBody: 'block', name: 'Normal N', symbol: 'N', label: 'N = 39.2 N', angleDeg: 90, color: '#3b82f6', type: 'normal', magnitude: 39.2, lengthPx: 58 },
  ],
  vertical_cable_mass: [
    { id: 'off_vc_t', targetBody: 'mass', name: 'Tensión T', symbol: 'T', label: 'T = 158.0 N', angleDeg: 90, color: '#10b981', type: 'tension', magnitude: 158.0, lengthPx: 88 },
    { id: 'off_vc_w', targetBody: 'mass', name: 'Peso W', symbol: 'W', label: 'W = 98.0 N', angleDeg: 270, color: '#ef4444', type: 'weight', magnitude: 98.0, lengthPx: 65 },
  ],
  atwood_frictionless: [
    { id: 'off_at_t1', targetBody: 'mass1', name: 'Tensión T', symbol: 'T', label: 'T = 77.18 N', angleDeg: 90, color: '#10b981', type: 'tension', magnitude: 77.18, lengthPx: 70 },
    { id: 'off_at_w1', targetBody: 'mass1', name: 'Peso W₁', symbol: 'W₁', label: 'W₁ = 68.6 N', angleDeg: 270, color: '#ef4444', type: 'weight', magnitude: 68.6, lengthPx: 64 },
    { id: 'off_at_t2', targetBody: 'mass2', name: 'Tensión T', symbol: 'T', label: 'T = 77.18 N', angleDeg: 90, color: '#10b981', type: 'tension', magnitude: 77.18, lengthPx: 70 },
    { id: 'off_at_w2', targetBody: 'mass2', name: 'Peso W₂', symbol: 'W₂', label: 'W₂ = 88.2 N', angleDeg: 270, color: '#ef4444', type: 'weight', magnitude: 88.2, lengthPx: 74 },
  ],
  inclined_plane_frictionless: [
    { id: 'off_ip_w1', targetBody: 'block_plane', name: 'W₁∥', symbol: 'W₁∥', label: 'W₁∥ = 51.93 N', angleDeg: 212, color: '#ef4444', type: 'weight', magnitude: 51.93, lengthPx: 68 },
    { id: 'off_ip_t1', targetBody: 'block_plane', name: 'Tensión T', symbol: 'T', label: 'T = 24.99 N', angleDeg: 32, color: '#10b981', type: 'tension', magnitude: 24.99, lengthPx: 56 },
    { id: 'off_ip_n1', targetBody: 'block_plane', name: 'Normal N', symbol: 'N', label: 'N = 83.11 N', angleDeg: 122, color: '#3b82f6', type: 'normal', magnitude: 83.11, lengthPx: 74 },
    { id: 'off_ip_t2', targetBody: 'hanging_mass', name: 'Tensión T', symbol: 'T', label: 'T = 24.99 N', angleDeg: 90, color: '#10b981', type: 'tension', magnitude: 24.99, lengthPx: 56 },
    { id: 'off_ip_w2', targetBody: 'hanging_mass', name: 'Peso W₂', symbol: 'W₂', label: 'W₂ = 19.60 N', angleDeg: 270, color: '#ef4444', type: 'weight', magnitude: 19.60, lengthPx: 52 },
  ],
};

/**
 * Vectores oficiales de D.C.L. calculados con las masas / fuerzas reales del aparato.
 * Si el profesor cambia m₁, m₂ o F, la solución oficial se actualiza sola.
 */
export function getOfficialNewtonVectors(el) {
  const props = el.properties || {};
  const dyn = computeNewtonDynamics(props);
  const f = (n) => Number(n).toFixed(1);
  let list = [];
  if (dyn.type === 'two_connected_blocks') {
    const fAng = dyn.F >= 0 ? 0 : 180;
    list = [
      { id: 'off_nb_t1', targetBody: 'block1', symbol: 'T', label: `T = ${f(Math.abs(dyn.T))} N`, angleDeg: dyn.T >= 0 ? 0 : 180, color: '#10b981', type: 'tension', magnitude: Math.abs(dyn.T) },
      { id: 'off_nb_w1', targetBody: 'block1', symbol: 'W₁', label: `W₁ = ${f(dyn.W1)} N`, angleDeg: 270, color: '#ef4444', type: 'weight', magnitude: dyn.W1 },
      { id: 'off_nb_n1', targetBody: 'block1', symbol: 'N₁', label: `N₁ = ${f(dyn.N1)} N`, angleDeg: 90, color: '#3b82f6', type: 'normal', magnitude: dyn.N1 },
      { id: 'off_nb_f2', targetBody: 'block2', symbol: 'F', label: `F = ${f(Math.abs(dyn.F))} N`, angleDeg: fAng, color: '#8b5cf6', type: 'applied', magnitude: Math.abs(dyn.F) },
      { id: 'off_nb_t2', targetBody: 'block2', symbol: 'T', label: `T = ${f(Math.abs(dyn.T))} N`, angleDeg: dyn.T >= 0 ? 180 : 0, color: '#10b981', type: 'tension', magnitude: Math.abs(dyn.T) },
      { id: 'off_nb_w2', targetBody: 'block2', symbol: 'W₂', label: `W₂ = ${f(dyn.W2)} N`, angleDeg: 270, color: '#ef4444', type: 'weight', magnitude: dyn.W2 },
      { id: 'off_nb_n2', targetBody: 'block2', symbol: 'N₂', label: `N₂ = ${f(dyn.N2)} N`, angleDeg: 90, color: '#3b82f6', type: 'normal', magnitude: dyn.N2 },
    ];
  } else if (dyn.type === 'single_block_force') {
    list = [
      { id: 'off_sb_f', targetBody: 'block', symbol: 'F', label: `F = ${f(Math.abs(dyn.F))} N`, angleDeg: dyn.F >= 0 ? 0 : 180, color: '#8b5cf6', type: 'applied', magnitude: Math.abs(dyn.F) },
      { id: 'off_sb_w', targetBody: 'block', symbol: 'W', label: `W = ${f(dyn.W1)} N`, angleDeg: 270, color: '#ef4444', type: 'weight', magnitude: dyn.W1 },
      { id: 'off_sb_n', targetBody: 'block', symbol: 'N', label: `N = ${f(dyn.N1)} N`, angleDeg: 90, color: '#3b82f6', type: 'normal', magnitude: dyn.N1 },
    ];
  } else if (dyn.type === 'vertical_cable_mass') {
    list = [
      { id: 'off_vc_t', targetBody: 'mass', symbol: 'T', label: `T = ${f(dyn.T)} N`, angleDeg: 90, color: '#10b981', type: 'tension', magnitude: Math.abs(dyn.T) },
      { id: 'off_vc_w', targetBody: 'mass', symbol: 'W', label: `W = ${f(dyn.W1)} N`, angleDeg: 270, color: '#ef4444', type: 'weight', magnitude: dyn.W1 },
    ];
  } else if (dyn.type === 'atwood_frictionless') {
    list = [
      { id: 'off_at_t1', targetBody: 'mass1', symbol: 'T', label: `T = ${f(dyn.T)} N`, angleDeg: 90, color: '#10b981', type: 'tension', magnitude: dyn.T },
      { id: 'off_at_w1', targetBody: 'mass1', symbol: 'W₁', label: `W₁ = ${f(dyn.W1)} N`, angleDeg: 270, color: '#ef4444', type: 'weight', magnitude: dyn.W1 },
      { id: 'off_at_t2', targetBody: 'mass2', symbol: 'T', label: `T = ${f(dyn.T)} N`, angleDeg: 90, color: '#10b981', type: 'tension', magnitude: dyn.T },
      { id: 'off_at_w2', targetBody: 'mass2', symbol: 'W₂', label: `W₂ = ${f(dyn.W2)} N`, angleDeg: 270, color: '#ef4444', type: 'weight', magnitude: dyn.W2 },
    ];
  } else {
    const th = dyn.thetaDeg;
    list = [
      { id: 'off_ip_t1', targetBody: 'block_plane', symbol: 'T', label: `T = ${f(dyn.T)} N`, angleDeg: th, color: '#10b981', type: 'tension', magnitude: dyn.T },
      { id: 'off_ip_n1', targetBody: 'block_plane', symbol: 'N', label: `N = ${f(dyn.N1)} N`, angleDeg: 90 + th, color: '#3b82f6', type: 'normal', magnitude: dyn.N1 },
      { id: 'off_ip_w1', targetBody: 'block_plane', symbol: 'W₁', label: `W₁ = ${f(dyn.W1)} N`, angleDeg: 270, color: '#ef4444', type: 'weight', magnitude: dyn.W1 },
      { id: 'off_ip_t2', targetBody: 'hanging_mass', symbol: 'T', label: `T = ${f(dyn.T)} N`, angleDeg: 90, color: '#10b981', type: 'tension', magnitude: dyn.T },
      { id: 'off_ip_w2', targetBody: 'hanging_mass', symbol: 'W₂', label: `W₂ = ${f(dyn.W2)} N`, angleDeg: 270, color: '#ef4444', type: 'weight', magnitude: dyn.W2 },
    ];
  }
  // Longitud proporcional a la magnitud (36 – 96 px)
  const maxMag = Math.max(1, ...list.map((v) => v.magnitude || 0));
  return list.map((v) => ({
    ...v,
    name: v.symbol,
    lengthPx: Math.round(36 + 60 * ((v.magnitude || 0) / maxMag)),
  }));
}

export function getDclBodyCenter(el, bodyKey = 'm2') {
  const { x, y, width, height } = el;
  const props = el.properties || {};
  const dispX = props.displacementX || 0;
  const dispY = props.displacementY || 0;

  // Single body generic objects: mass or carts
  if (el.physicsType === 'mass') {
    return {
      x: x + width / 2,
      y: y + height / 2,
      name: `Bloque (${props.mass || 10} kg)`,
      mass: `${props.mass || 10} kg`,
    };
  }
  if (el.physicsType === 'mru_cart' || el.physicsType === 'mruv_cart') {
    return {
      x: x + width / 2,
      y: y + height / 2,
      name: 'Móvil',
      mass: `${props.mass || 1.5} kg`,
    };
  }

  // Translational Equilibrium (HT03) Apparatus Centers (with displacement for dynamic simulation)
  if (props.apparatusType === 'cable_knot_wall') {
    return { x: x + width * 0.55 + dispX, y: y + height * 0.45 + dispY, name: 'Nudo Central' };
  } else if (props.apparatusType === 'two_pulleys_three_weights') {
    return { x: x + width * 0.50 + dispX, y: y + height * 0.48 + dispY, name: 'Nudo Central' };
  } else if (props.apparatusType === 'engine_suspended_cables') {
    return { x: x + width * 0.50 + dispX, y: y + height * 0.44 + dispY, name: 'Nudo A (Motor)' };
  } else if (props.apparatusType === 'triangular_knot_slope') {
    return { x: x + width * 0.50 + dispX, y: y + height * 0.48 + dispY, name: 'Nudo A' };
  } else if (props.apparatusType === 'crate_two_cables') {
    return { x: x + width * 0.50 + dispX, y: y + height * 0.45 + dispY, name: 'Nudo A (Caja)' };
  } else if (props.apparatusType === 'pulley_cylinder_knot') {
    return { x: x + width * 0.48 + dispX, y: y + height * 0.45 + dispY, name: 'Nudo E' };
  } else if (props.apparatusType === 'traffic_lights_span') {
    if (bodyKey === 'knot_C') {
      return { x: x + width * 0.62 + dispX, y: y + height * 0.40 + dispY, name: 'Nudo C (Semáforo 15kg)' };
    }
    return { x: x + width * 0.38 + dispX, y: y + height * 0.40 + dispY, name: 'Nudo B (Semáforo 10kg)' };
  } else if (props.apparatusType === 'double_inclined_planes') {
    const cos70 = Math.cos((70 * Math.PI) / 180);
    const sin70 = Math.sin((70 * Math.PI) / 180);
    const cos20 = Math.cos((20 * Math.PI) / 180);
    const sin20 = Math.sin((20 * Math.PI) / 180);
    if (bodyKey === 'box_D') {
      return { x: x + width * 0.68 + dispX * cos20, y: y + height * 0.58 + dispY * sin20, name: 'Caja D (Plano 20°)' };
    }
    return { x: x + width * 0.42 - dispX * cos70, y: y + height * 0.45 + dispY * sin70, name: 'Caja B (Plano 70°)' };
  }

  // Newton Second Law Frictionless systems (geometría compartida con el renderizador)
  if (el.physicsType === 'newton_frictionless_system') {
    const layout = getNewtonApparatusLayout(el);
    const keys = Object.keys(layout.bodies);
    const key = layout.bodies[bodyKey] ? bodyKey : keys[keys.length > 1 ? 1 : 0];
    const c = layout.bodies[key];
    const isFirst = key === keys[0];
    return {
      x: c.x,
      y: c.y,
      name: isFirst && keys.length > 1 ? 'Cuerpo 1 (m₁)' : keys.length > 1 ? 'Cuerpo 2 (m₂)' : 'Cuerpo (m)',
      mass: `${isFirst ? props.mass1 || '' : props.mass2 || ''} kg`,
    };
  }

  // DCL (HT02) Apparatus Centers
  if (props.apparatusType === 'table_three_masses') {
    const tableW = Math.min(370, width - 240);
    const tableX = x + (width - tableW) / 2;
    const tableY = y + 160;
    const leftPulleyX = tableX;
    const rightPulleyX = tableX + tableW;
    const pulleyRadius = 14;

    const m2W = 76;
    const m2H = 50;
    const m2X = tableX + (tableW - m2W) / 2 + dispX;
    const m2Y = tableY - m2H;

    const m1W = 54;
    const m1H = 46;
    const m1X = leftPulleyX - pulleyRadius - m1W / 2;
    const m1Y = tableY + 55 - dispX;

    const m3W = 58;
    const m3H = 50;
    const m3X = rightPulleyX + pulleyRadius - m3W / 2;
    const m3Y = tableY + 70 + dispX;

    if (bodyKey === 'm1') return { x: m1X + m1W / 2, y: m1Y + m1H / 2, name: 'Masa 1 (6 kg, Izquierda)', mass: '6.0 kg' };
    if (bodyKey === 'm3') return { x: m3X + m3W / 2, y: m3Y + m3H / 2, name: 'Masa 3 (9 kg, Derecha)', mass: '9.0 kg' };
    return { x: m2X + m2W / 2, y: m2Y + m2H / 2, name: 'Masa 2 (10 kg, Centro de la Mesa)', mass: '10.0 kg' };
  } else if (props.apparatusType === 'table_two_masses') {
    const tableW = Math.min(320, width - 180);
    const tableX = x + 40;
    const tableY = y + 155;
    const rightPulleyX = tableX + tableW;
    const pulleyRadius = 14;

    const m1W = 72;
    const m1H = 50;
    const m1X = tableX + tableW * 0.45 - m1W / 2 + dispX;
    const m1Y = tableY - m1H;

    const m2W = 56;
    const m2H = 48;
    const m2X = rightPulleyX + pulleyRadius - m2W / 2;
    const m2Y = tableY + 60 + dispX;

    if (bodyKey === 'm2') return { x: m2X + m2W / 2, y: m2Y + m2H / 2, name: 'Masa 2 (Suspendida)', mass: 'm₂' };
    return { x: m1X + m1W / 2, y: m1Y + m1H / 2, name: 'Bloque 1 (Mesa)', mass: 'm₁' };
  } else {
    return { x: x + width / 2, y: y + height / 2, name: props.bodyName || 'Cuerpo DCL', mass: props.mass ? `${props.mass} kg` : '' };
  }
}

export function getDclBodies(el) {
  const props = el.properties || {};

  // Generic objects: mass or carts
  if (el.physicsType === 'mass') {
    return [
      { id: 'main', label: `Bloque (${props.mass || 10} kg)`, fullLabel: `Bloque de Masa m = ${props.mass || 10} kg` },
    ];
  }
  if (el.physicsType === 'mru_cart' || el.physicsType === 'mruv_cart') {
    return [
      { id: 'main', label: 'Móvil', fullLabel: `Móvil de Laboratorio (${props.mass || 1.5} kg)` },
    ];
  }

  // Newton Second Law Frictionless systems
  if (el.physicsType === 'newton_frictionless_system') {
    const nType = normalizeNewtonApparatusType(props.apparatusType);
    if (nType === 'two_connected_blocks') {
      return [
        { id: 'block1', label: `Bloque 1 (${props.mass1 || 2} kg)`, fullLabel: `Bloque Trasero m₁ = ${props.mass1 || 2} kg` },
        { id: 'block2', label: `Bloque 2 (${props.mass2 || 6} kg)`, fullLabel: `Bloque Delantero m₂ = ${props.mass2 || 6} kg` },
      ];
    } else if (nType === 'atwood_frictionless') {
      return [
        { id: 'mass1', label: `m₁ (${props.mass1 || 7} kg)`, fullLabel: `Masa m₁ = ${props.mass1 || 7} kg (lado izquierdo)` },
        { id: 'mass2', label: `m₂ (${props.mass2 || 9} kg)`, fullLabel: `Masa m₂ = ${props.mass2 || 9} kg (lado derecho)` },
      ];
    } else if (nType === 'inclined_plane_frictionless') {
      return [
        { id: 'block_plane', label: `Bloque Plano (${props.mass1 || 10} kg)`, fullLabel: `Bloque en Plano ${props.angleDeg || 32}° (m₁ = ${props.mass1 || 10} kg)` },
        { id: 'hanging_mass', label: `Masa Colgante (${props.mass2 || 2} kg)`, fullLabel: `Masa Colgante (m₂ = ${props.mass2 || 2} kg)` },
      ];
    } else if (nType === 'vertical_cable_mass') {
      return [
        { id: 'mass', label: `Masa Elevador (${props.mass1 || 10} kg)`, fullLabel: `Masa Suspendida (m = ${props.mass1 || 10} kg)` },
      ];
    } else {
      return [
        { id: 'block', label: `Bloque (${props.mass1 || 4} kg)`, fullLabel: `Bloque con Fuerza F (m = ${props.mass1 || 4} kg)` },
      ];
    }
  }

  // Translational Equilibrium bodies
  if (props.apparatusType === 'traffic_lights_span') {
    return [
      { id: 'knot_B', label: 'Nudo B (Semáforo 10kg)', fullLabel: 'Nudo B (Semáforo 1: 10 kg)' },
      { id: 'knot_C', label: 'Nudo C (Semáforo 15kg)', fullLabel: 'Nudo C (Semáforo 2: 15 kg)' },
    ];
  } else if (props.apparatusType === 'double_inclined_planes') {
    return [
      { id: 'box_B', label: 'Caja B (Plano 70°)', fullLabel: 'Caja B = 40 lb (Plano 70°)' },
      { id: 'box_D', label: 'Caja D (Plano 20°)', fullLabel: 'Caja D = 40 lb (Plano 20°)' },
    ];
  } else if (props.apparatusType === 'pulley_cylinder_knot') {
    return [
      { id: 'knot_E', label: 'Nudo E (Anillo)', fullLabel: 'Nudo E (Intersección de Cables)' },
    ];
  } else if (props.apparatusType === 'engine_suspended_cables' || props.apparatusType === 'triangular_knot_slope' || props.apparatusType === 'crate_two_cables') {
    return [
      { id: 'knot_A', label: 'Nudo A (Concurrencia)', fullLabel: 'Nudo A (Concurrencia de Cables)' },
    ];
  } else if (props.apparatusType === 'cable_knot_wall' || props.apparatusType === 'two_pulleys_three_weights') {
    return [
      { id: 'knot', label: 'Nudo Central', fullLabel: 'Nudo Central de Concurrencia' },
    ];
  }

  // DCL bodies
  if (props.apparatusType === 'table_three_masses') {
    return [
      { id: 'm1', label: 'm₁ (6 kg Izq)', fullLabel: 'Masa m₁ = 6 kg (Suspendida Izquierda)' },
      { id: 'm2', label: 'm₂ (10 kg Mesa)', fullLabel: 'Masa m₂ = 10 kg (Centro de la Mesa)' },
      { id: 'm3', label: 'm₃ (9 kg Der)', fullLabel: 'Masa m₃ = 9 kg (Suspendida Derecha)' },
    ];
  } else if (props.apparatusType === 'table_two_masses') {
    return [
      { id: 'm1', label: 'm₁ (Mesa)', fullLabel: 'Bloque m₁ (Apoyado en la Mesa)' },
      { id: 'm2', label: 'm₂ (Colgante)', fullLabel: 'Masa m₂ (Suspendida)' },
    ];
  } else {
    return [
      { id: 'main', label: props.bodyName || 'Cuerpo', fullLabel: props.bodyName || 'Cuerpo en D.C.L.' },
    ];
  }
}

export function getDclVectorTips(el) {
  const props = el.properties || {};
  const showOfficialSolution = !!props.showOfficialSolution;
  const userVectors = Array.isArray(props.userVectors) ? props.userVectors : [];

  let list = userVectors;
  if (userVectors.length === 0 && showOfficialSolution) {
    if (props.apparatusType && OFFICIAL_NEWTON_VECTORS[props.apparatusType]) {
      list = OFFICIAL_NEWTON_VECTORS[props.apparatusType];
    } else if (props.apparatusType && OFFICIAL_EQUILIBRIO_VECTORS[props.apparatusType]) {
      list = OFFICIAL_EQUILIBRIO_VECTORS[props.apparatusType];
    } else if (props.apparatusType === 'table_three_masses') {
      list = OFFICIAL_TABLE_THREE_MASSES_VECTORS;
    } else if (props.apparatusType === 'table_two_masses') {
      list = OFFICIAL_TABLE_TWO_MASSES_VECTORS;
    } else {
      list = [];
    }
  }

  return list.map((v) => {
    const origin = getDclBodyCenter(el, v.targetBody || 'main');
    const len = v.lengthPx || 60;
    const rad = ((v.angleDeg !== undefined ? v.angleDeg : 90) * Math.PI) / 180;
    return {
      id: v.id,
      targetBody: v.targetBody || 'main',
      originX: origin.x,
      originY: origin.y,
      tipX: origin.x + len * Math.cos(rad),
      tipY: origin.y - len * Math.sin(rad),
      angleDeg: v.angleDeg,
      lengthPx: len,
      color: v.color || '#ea580c',
      symbol: v.symbol || v.label || v.name,
      label: v.label || v.name,
    };
  });
}


function drawTableThreeMassesDcl(ctx, el, isSelected) {
  const { x, y, width, height } = el;
  const props = el.properties || {};
  const showOfficialSolution = !!props.showOfficialSolution;
  const userVectors = Array.isArray(props.userVectors) ? props.userVectors : [];

  ctx.save();

  // 1. Blueprint Card Frame (Translucent so whiteboard grid remains visible)
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
  ctx.shadowBlur = isSelected ? 16 : 8;
  ctx.shadowOffsetY = 3;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 14);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
  ctx.fill();
  ctx.strokeStyle = isSelected ? '#4262ff' : 'rgba(203, 213, 225, 0.85)';
  ctx.lineWidth = isSelected ? 2.5 : 1.5;
  ctx.stroke();
  ctx.restore();

  // Header Title Pill
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x + 12, y + 10, width - 24, 25, 6);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = '700 11px Inter, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('📐 HT02 #10: Mesa con Tres Masas', x + 22, y + 22);

  ctx.font = '600 9.5px monospace, sans-serif';
  ctx.fillStyle = showOfficialSolution ? '#ea580c' : '#0284c7';
  ctx.textAlign = 'right';
  ctx.fillText(
    showOfficialSolution ? 'μc = 0.20 | a = 0.392 m/s² (Solución Oficial)' : 'Práctica Libre: Agrega tus vectores',
    x + width - 22,
    y + 22
  );
  ctx.restore();

  // Dimensions & Coordinates
  const floorY = y + height - 44;
  const tableW = Math.min(370, width - 240);
  const tableX = x + (width - tableW) / 2;
  const tableY = y + 160;
  const tableH = 18;

  // Floor line with 45° ground hatches
  ctx.save();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 30, floorY);
  ctx.lineTo(x + width - 30, floorY);
  ctx.stroke();

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.2;
  for (let hx = x + 35; hx < x + width - 30; hx += 16) {
    ctx.beginPath();
    ctx.moveTo(hx, floorY);
    ctx.lineTo(hx - 10, floorY + 10);
    ctx.stroke();
  }
  ctx.restore();

  // Table Legs & Crossbar
  ctx.save();
  ctx.fillStyle = '#475569';
  ctx.fillRect(tableX + 24, tableY + tableH, 16, floorY - (tableY + tableH));
  ctx.fillRect(tableX + tableW - 40, tableY + tableH, 16, floorY - (tableY + tableH));
  ctx.fillStyle = '#64748b';
  ctx.fillRect(tableX + 24, tableY + tableH + 42, tableW - 64, 10);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(tableX + 22, floorY - 5, 20, 5);
  ctx.fillRect(tableX + tableW - 42, floorY - 5, 20, 5);
  ctx.restore();

  // Table Top Surface (Oak laboratory tabletop)
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(tableX, tableY, tableW, tableH, 4);
  const tableGrad = ctx.createLinearGradient(tableX, tableY, tableX, tableY + tableH);
  tableGrad.addColorStop(0, '#f59e0b');
  tableGrad.addColorStop(0.3, '#d97706');
  tableGrad.addColorStop(1, '#b45309');
  ctx.fillStyle = tableGrad;
  ctx.fill();
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // Corner Pulleys
  const pulleyRadius = 14;
  const drawPulley = (px, py) => {
    ctx.save();
    ctx.fillStyle = '#334155';
    ctx.fillRect(px > tableX + tableW / 2 ? px - 12 : px, py - 4, 12, 18);
    ctx.beginPath();
    ctx.arc(px, py, pulleyRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#e2e8f0';
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(px, py, pulleyRadius - 4, 0, Math.PI * 2);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.restore();
  };

  const leftPulleyX = tableX;
  const leftPulleyY = tableY - 2;
  const rightPulleyX = tableX + tableW;
  const rightPulleyY = tableY - 2;

  drawPulley(leftPulleyX, leftPulleyY);
  drawPulley(rightPulleyX, rightPulleyY);

  // Masses Geometry
  const dispX = props.displacementX || 0;
  const m2W = 76;
  const m2H = 50;
  const m2X = tableX + (tableW - m2W) / 2 + dispX;
  const m2Y = tableY - m2H;

  const m1W = 54;
  const m1H = 46;
  const m1X = leftPulleyX - pulleyRadius - m1W / 2;
  const m1Y = tableY + 55 - dispX;

  const m3W = 58;
  const m3H = 50;
  const m3X = rightPulleyX + pulleyRadius - m3W / 2;
  const m3Y = tableY + 70 + dispX;

  // Cords (Heavy twisted rope)
  ctx.save();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2.4;
  // Cord 1
  ctx.beginPath();
  ctx.moveTo(m2X, m2Y + m2H / 2);
  ctx.lineTo(leftPulleyX, leftPulleyY - pulleyRadius);
  ctx.arc(leftPulleyX, leftPulleyY, pulleyRadius, -Math.PI / 2, Math.PI, true);
  ctx.lineTo(leftPulleyX - pulleyRadius, m1Y);
  ctx.stroke();

  // Cord 2
  ctx.beginPath();
  ctx.moveTo(m2X + m2W, m2Y + m2H / 2);
  ctx.lineTo(rightPulleyX, rightPulleyY - pulleyRadius);
  ctx.arc(rightPulleyX, rightPulleyY, pulleyRadius, -Math.PI / 2, 0, false);
  ctx.lineTo(rightPulleyX + pulleyRadius, m3Y);
  ctx.stroke();
  ctx.restore();

  // Physical Masses (Blocks)
  // Middle Block m2 (10 kg)
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(m2X, m2Y, m2W, m2H, 4);
  const m2Grad = ctx.createLinearGradient(m2X, m2Y, m2X, m2Y + m2H);
  m2Grad.addColorStop(0, '#475569');
  m2Grad.addColorStop(1, '#1e293b');
  ctx.fillStyle = m2Grad;
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.arc(m2X, m2Y + m2H / 2, 3, 0, Math.PI * 2);
  ctx.arc(m2X + m2W, m2Y + m2H / 2, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = '700 11px Inter, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('m₂ = 10 kg', m2X + m2W / 2, m2Y + m2H / 2);

  ctx.font = '600 8.5px Inter, sans-serif';
  ctx.fillStyle = '#b45309';
  ctx.fillText('μc = 0.20', m2X + m2W / 2, tableY + 12);
  ctx.restore();

  // Left Hanging Weight m1 (6.0 kg)
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(m1X, m1Y, m1W, m1H, 4);
  const m1Grad = ctx.createLinearGradient(m1X, m1Y, m1X, m1Y + m1H);
  m1Grad.addColorStop(0, '#475569');
  m1Grad.addColorStop(1, '#334155');
  ctx.fillStyle = m1Grad;
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(m1X + m1W / 2, m1Y, 4, Math.PI, 0);
  ctx.stroke();

  ctx.font = '700 10px Inter, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('m₁ = 6 kg', m1X + m1W / 2, m1Y + m1H / 2);
  ctx.restore();

  // Right Hanging Weight m3 (9.0 kg)
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(m3X, m3Y, m3W, m3H, 4);
  const m3Grad = ctx.createLinearGradient(m3X, m3Y, m3X, m3Y + m3H);
  m3Grad.addColorStop(0, '#475569');
  m3Grad.addColorStop(1, '#334155');
  ctx.fillStyle = m3Grad;
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(m3X + m3W / 2, m3Y, 4, Math.PI, 0);
  ctx.stroke();

  ctx.font = '700 10px Inter, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('m₃ = 9 kg', m3X + m3W / 2, m3Y + m3H / 2);
  ctx.restore();

  // DCL Centers
  const c1X = m1X + m1W / 2;
  const c1Y = m1Y + m1H / 2;
  const c2X = m2X + m2W / 2;
  const c2Y = m2Y + m2H / 2;
  const c3X = m3X + m3W / 2;
  const c3Y = m3Y + m3H / 2;

  // Dotted Cartesian Coordinate Axes on all 3 masses
  [
    { cx: c1X, cy: c1Y, axisLen: 55 },
    { cx: c2X, cy: c2Y, axisLen: 75 },
    { cx: c3X, cy: c3Y, axisLen: 55 },
  ].forEach(({ cx: bcx, cy: bcy, axisLen }) => {
    ctx.save();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(bcx - axisLen, bcy);
    ctx.lineTo(bcx + axisLen, bcy);
    ctx.moveTo(bcx, bcy - axisLen);
    ctx.lineTo(bcx, bcy + axisLen);
    ctx.stroke();

    // Center node dot
    ctx.beginPath();
    ctx.arc(bcx, bcy, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  });

  // VECTORS TO RENDER:
  const vectorsToDraw = showOfficialSolution
    ? OFFICIAL_TABLE_THREE_MASSES_VECTORS
    : userVectors;

  vectorsToDraw.forEach((v) => {
    let ox = c2X;
    let oy = c2Y;
    if (v.targetBody === 'm1') {
      ox = c1X;
      oy = c1Y;
    } else if (v.targetBody === 'm3') {
      ox = c3X;
      oy = c3Y;
    }

    const len = v.lengthPx || 60;
    const rad = ((v.angleDeg !== undefined ? v.angleDeg : 90) * Math.PI) / 180;
    const tipX = ox + len * Math.cos(rad);
    const tipY = oy - len * Math.sin(rad);

    drawDclVectorWithBadge(
      ctx,
      ox,
      oy,
      tipX,
      tipY,
      v.color || '#ea580c',
      v.label || v.symbol || v.name
    );

    // If selected, render draggable handle at the tip of the vector
    if (isSelected) {
      ctx.save();
      // Outer glow ring
      ctx.beginPath();
      ctx.arc(tipX, tipY, 7.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(66, 98, 255, 0.25)';
      ctx.fill();

      // White inner ring with color border
      ctx.beginPath();
      ctx.arc(tipX, tipY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = v.color || '#4262ff';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Angle indicator
      ctx.font = '700 8px monospace, sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText(`${Math.round(v.angleDeg || 0)}°`, tipX + 8, tipY - 6);
      ctx.restore();
    }
  });

  // If official solution is active, show theoretical acceleration indicators
  if (showOfficialSolution) {
    ctx.save();
    ctx.font = '700 8.5px monospace, sans-serif';
    ctx.fillStyle = '#06b6d4';
    ctx.textAlign = 'left';
    ctx.fillText('a ↑ 0.39 m/s²', c1X + 10, c1Y);
    ctx.textAlign = 'center';
    ctx.fillText('a → 0.392 m/s²', c2X, m2Y - 14);
    ctx.textAlign = 'right';
    ctx.fillText('a ↓ 0.39 m/s²', c3X - 10, c3Y);
    ctx.restore();
  }

  // Bottom Summary Bar: ONLY if official solution is active
  if (showOfficialSolution) {
    ctx.save();
    const eqPillW = width - 24;
    const eqPillH = 26;
    const eqPillX = x + 12;
    const eqPillY = y + height - eqPillH - 8;
    ctx.beginPath();
    ctx.roundRect(eqPillX, eqPillY, eqPillW, eqPillH, 6);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '600 9px monospace, sans-serif';
    ctx.fillStyle = '#fed7aa';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      'Solución Oficial: m₁: T₁ - W₁ = m₁·a  |  m₂: T₂ - T₁ - fk = m₂·a  |  m₃: W₃ - T₂ = m₃·a   ⇒   a = 0.392 m/s²',
      x + width / 2,
      eqPillY + eqPillH / 2
    );
    ctx.restore();
  }

  // Selection outline & Anchors
  if (isSelected) {
    ctx.strokeStyle = '#4262ff';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(x - 4, y - 4, width + 8, height + 8);
    ctx.setLineDash([]);
  }

  ctx.restore();
}

function drawTableTwoMassesDcl(ctx, el, isSelected) {
  const { x, y, width, height } = el;
  const props = el.properties || {};
  const showOfficialSolution = !!props.showOfficialSolution;
  const userVectors = Array.isArray(props.userVectors) ? props.userVectors : [];

  ctx.save();

  // 1. Blueprint Card Frame (Translucent so whiteboard grid remains visible)
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
  ctx.shadowBlur = isSelected ? 16 : 8;
  ctx.shadowOffsetY = 3;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 14);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
  ctx.fill();
  ctx.strokeStyle = isSelected ? '#4262ff' : 'rgba(203, 213, 225, 0.85)';
  ctx.lineWidth = isSelected ? 2.5 : 1.5;
  ctx.stroke();
  ctx.restore();

  // Header Title Pill
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x + 12, y + 10, width - 24, 25, 6);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = '700 11px Inter, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('📐 HT02 #2: Mesa con Dos Masas', x + 22, y + 22);

  ctx.font = '600 9.5px monospace, sans-serif';
  ctx.fillStyle = showOfficialSolution ? '#2563eb' : '#0284c7';
  ctx.textAlign = 'right';
  ctx.fillText(
    showOfficialSolution ? 'Mesa Lisa | Tensión T = cte (Solución Oficial)' : 'Práctica Libre: Agrega tus vectores',
    x + width - 22,
    y + 22
  );
  ctx.restore();

  // Dimensions & Coordinates
  const floorY = y + height - 44;
  const tableW = Math.min(320, width - 180);
  const tableX = x + 40;
  const tableY = y + 155;
  const tableH = 18;

  // Floor line
  ctx.save();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 25, floorY);
  ctx.lineTo(x + width - 25, floorY);
  ctx.stroke();
  ctx.restore();

  // Table Legs
  ctx.save();
  ctx.fillStyle = '#475569';
  ctx.fillRect(tableX + 20, tableY + tableH, 16, floorY - (tableY + tableH));
  ctx.fillRect(tableX + tableW - 36, tableY + tableH, 16, floorY - (tableY + tableH));
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(tableX + 18, floorY - 5, 20, 5);
  ctx.fillRect(tableX + tableW - 38, floorY - 5, 20, 5);
  ctx.restore();

  // Table Top Surface
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(tableX, tableY, tableW, tableH, 4);
  ctx.fillStyle = '#d97706';
  ctx.fill();
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // Right Edge Pulley
  const pulleyRadius = 14;
  const rightPulleyX = tableX + tableW;
  const rightPulleyY = tableY - 2;

  ctx.save();
  ctx.fillStyle = '#334155';
  ctx.fillRect(rightPulleyX - 12, rightPulleyY - 4, 12, 18);
  ctx.beginPath();
  ctx.arc(rightPulleyX, rightPulleyY, pulleyRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#e2e8f0';
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(rightPulleyX, rightPulleyY, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();
  ctx.restore();

  // Masses
  const dispX = props.displacementX || 0;
  const m1W = 72;
  const m1H = 50;
  const m1X = tableX + tableW * 0.45 - m1W / 2 + dispX;
  const m1Y = tableY - m1H;

  const m2W = 56;
  const m2H = 48;
  const m2X = rightPulleyX + pulleyRadius - m2W / 2;
  const m2Y = tableY + 60 + dispX;

  // Cord
  ctx.save();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(m1X + m1W, m1Y + m1H / 2);
  ctx.lineTo(rightPulleyX, rightPulleyY - pulleyRadius);
  ctx.arc(rightPulleyX, rightPulleyY, pulleyRadius, -Math.PI / 2, 0, false);
  ctx.lineTo(rightPulleyX + pulleyRadius, m2Y);
  ctx.stroke();
  ctx.restore();

  // Draw Block m1 on table
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(m1X, m1Y, m1W, m1H, 4);
  ctx.fillStyle = '#334155';
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.font = '800 11px Inter, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('m₁', m1X + m1W / 2, m1Y + 7);
  ctx.restore();

  // Draw Hanging Block m2
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(m2X, m2Y, m2W, m2H, 4);
  ctx.fillStyle = '#475569';
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.font = '800 11px Inter, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('m₂', m2X + m2W / 2, m2Y + 7);
  ctx.restore();

  // DCL Centers
  const c1X = m1X + m1W / 2;
  const c1Y = m1Y + m1H / 2;
  const c2X = m2X + m2W / 2;
  const c2Y = m2Y + m2H / 2;

  // Dotted Coordinate Axes on both masses
  [
    { cx: c1X, cy: c1Y, axisLen: 55 },
    { cx: c2X, cy: c2Y, axisLen: 55 },
  ].forEach(({ cx: bcx, cy: bcy, axisLen }) => {
    ctx.save();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(bcx - axisLen, bcy);
    ctx.lineTo(bcx + axisLen, bcy);
    ctx.moveTo(bcx, bcy - axisLen);
    ctx.lineTo(bcx, bcy + axisLen);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(bcx, bcy, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  });

  // VECTORS TO RENDER:
  const vectorsToDraw = showOfficialSolution
    ? OFFICIAL_TABLE_TWO_MASSES_VECTORS
    : userVectors;

  vectorsToDraw.forEach((v) => {
    const ox = v.targetBody === 'm2' ? c2X : c1X;
    const oy = v.targetBody === 'm2' ? c2Y : c1Y;
    const len = v.lengthPx || 60;
    const rad = ((v.angleDeg !== undefined ? v.angleDeg : 90) * Math.PI) / 180;
    const tipX = ox + len * Math.cos(rad);
    const tipY = oy - len * Math.sin(rad);

    drawDclVectorWithBadge(
      ctx,
      ox,
      oy,
      tipX,
      tipY,
      v.color || '#ea580c',
      v.label || v.symbol || v.name
    );

    // If selected, render draggable handle at the tip of the vector
    if (isSelected) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(tipX, tipY, 7.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(66, 98, 255, 0.25)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(tipX, tipY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = v.color || '#4262ff';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      ctx.font = '700 8px monospace, sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText(`${Math.round(v.angleDeg || 0)}°`, tipX + 8, tipY - 6);
      ctx.restore();
    }
  });

  // Bottom equation ribbon: ONLY if official solution is active
  if (showOfficialSolution) {
    ctx.save();
    const eqPillW = width - 24;
    const eqPillH = 26;
    const eqPillX = x + 12;
    const eqPillY = y + height - eqPillH - 8;
    ctx.beginPath();
    ctx.roundRect(eqPillX, eqPillY, eqPillW, eqPillH, 6);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '600 9px monospace, sans-serif';
    ctx.fillStyle = '#93c5fd';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      'Solución Oficial: m₁: ΣFx = T = m₁·a, ΣFy = N₁ - W₁ = 0  |  m₂: ΣFy = W₂ - T = m₂·a   ⇒   a = W₂ / (m₁ + m₂)',
      x + width / 2,
      eqPillY + eqPillH / 2
    );
    ctx.restore();
  }

  // Selection outline
  if (isSelected) {
    ctx.strokeStyle = '#4262ff';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(x - 4, y - 4, width + 8, height + 8);
    ctx.setLineDash([]);
  }

  ctx.restore();
}

/**
 * Arrow renderer helper for Equilibrio Traslacional
 */
function drawEquilibrioVectorArrow(ctx, ox, oy, f, isSelected) {
  const rad = ((f.angleDeg !== undefined ? f.angleDeg : 90) * Math.PI) / 180;
  const len = f.lengthPx || 65;
  const tx = ox + len * Math.cos(rad);
  const ty = oy - len * Math.sin(rad);
  const color = f.color || '#059669';

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(tx, ty);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.8;
  ctx.stroke();

  // Arrow Head
  const headAngle = Math.atan2(ty - oy, tx - ox);
  ctx.save();
  ctx.translate(tx, ty);
  ctx.rotate(headAngle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-9, -5);
  ctx.lineTo(-7, 0);
  ctx.lineTo(-9, 5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Label badge
  const labelDist = len + 15;
  const lblX = ox + labelDist * Math.cos(rad);
  const lblY = oy - labelDist * Math.sin(rad);
  const labelText = f.label || f.symbol || f.name || 'F';
  ctx.font = '700 9.5px Inter, sans-serif';
  const tm = ctx.measureText(labelText);
  const bw = tm.width + 8;
  const bh = 15;

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(lblX - bw / 2, lblY - bh / 2, bw, bh, 4);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(labelText, lblX, lblY);

  // Tip handle if selected
  if (isSelected) {
    ctx.beginPath();
    ctx.arc(tx, ty, 7.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(tx, ty, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.font = '700 8px monospace, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(`${Math.round(f.angleDeg || 0)}°`, tx + 8, ty - 6);
  }
  ctx.restore();
}

/**
 * Pure 2D Canvas Renderer for Translational Equilibrium (HT03) Apparatuses
 */
export function drawTranslationalEquilibriumApparatus(ctx, el, isSelected) {
  const { x, y, width, height } = el;
  const props = el.properties || {};
  const appType = props.apparatusType || 'cable_knot_wall';
  const showOfficialSolution = props.showOfficialSolution !== false;
  const userVectors = Array.isArray(props.userVectors) ? props.userVectors : [];
  const dispX = props.displacementX || 0;
  const dispY = props.displacementY || 0;

  ctx.save();

  // 1. Blueprint Card Frame
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
  ctx.shadowBlur = isSelected ? 16 : 8;
  ctx.shadowOffsetY = 3;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 14);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.76)';
  ctx.fill();
  ctx.strokeStyle = isSelected ? '#059669' : 'rgba(203, 213, 225, 0.85)';
  ctx.lineWidth = isSelected ? 2.5 : 1.5;
  ctx.stroke();
  ctx.restore();

  // Header Title Bar
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x + 12, y + 10, width - 24, 26, 6);
  ctx.fillStyle = '#ecfdf5';
  ctx.fill();
  ctx.strokeStyle = '#a7f3d0';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = '700 11px Inter, sans-serif';
  ctx.fillStyle = '#065f46';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`⚖️ ${props.systemTitle || 'Equilibrio Traslacional (HT03)'}`, x + 20, y + 23);

  ctx.font = '600 9.5px monospace, sans-serif';
  ctx.textAlign = 'right';
  if (showOfficialSolution) {
    ctx.fillStyle = '#059669';
    ctx.fillText('ΣF = 0 • a = 0 (Solución Oficial)', x + width - 24, y + 23);
  } else {
    ctx.fillStyle = '#d97706';
    ctx.fillText('Práctica Activa • Dibuja los Vectores', x + width - 24, y + 23);
  }
  ctx.restore();

  // 2. Draw Specific Physical Apparatus Geometry
  if (appType === 'cable_knot_wall') {
    // Problem 1: 600 N weight, wall on left, ceiling on top, angled cable at 50°
    const wallX = x + 60;
    const ceilY = y + 70;
    const initKx = x + width * 0.55;
    const initKy = y + height * 0.45;
    const kx = initKx + dispX;
    const ky = initKy + dispY;
    const ceilX = initKx + (initKy - ceilY) / Math.tan((50 * Math.PI) / 180);
    const wallAnchorY = initKy;

    // Left Wall
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(wallX - 16, y + 55, 16, height - 120);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wallX, y + 55);
    ctx.lineTo(wallX, y + height - 65);
    ctx.stroke();

    // Top Ceiling
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(wallX, ceilY - 14, width - 100, 14);
    ctx.beginPath();
    ctx.moveTo(wallX, ceilY);
    ctx.lineTo(x + width - 40, ceilY);
    ctx.stroke();

    // Cable FT1
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(wallX, wallAnchorY);
    ctx.lineTo(kx, ky);
    ctx.stroke();

    // Cable FT2
    ctx.strokeStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(kx, ky);
    ctx.lineTo(ceilX, ceilY);
    ctx.stroke();

    // Ceiling Bracket & Wall Bracket
    ctx.fillStyle = '#334155';
    ctx.beginPath(); ctx.arc(wallX, wallAnchorY, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(ceilX, ceilY, 5, 0, Math.PI * 2); ctx.fill();

    // 50° Angle Arc
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ceilX, ceilY, 26, Math.PI - (50 * Math.PI) / 180, Math.PI);
    ctx.stroke();
    ctx.font = '700 9px sans-serif';
    ctx.fillStyle = '#ea580c';
    ctx.fillText('50.0°', ceilX - 38, ceilY + 16);

    // Vertical Hanging Cable & Weight 600 N
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(kx, ky);
    ctx.lineTo(kx, ky + 65);
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.roundRect(kx - 30, ky + 65, 60, 48, 6);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('600 N', kx, ky + 92);
    ctx.font = '600 8.5px Inter, sans-serif';
    ctx.fillText('W (Objeto)', kx, ky + 104);

    // Knot Ring
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(kx, ky, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();

  } else if (appType === 'two_pulleys_three_weights') {
    // Problem 2: 500 N central, two pulleys at 50° and 35°
    const ceilY = y + 60;
    const p1x = x + width * 0.24;
    const p1y = ceilY + 45;
    const p2x = x + width * 0.76;
    const p2y = ceilY + 55;
    const kx = x + width * 0.50 + dispX;
    const ky = y + height * 0.48 + dispY;

    // Ceiling
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(x + 40, ceilY); ctx.lineTo(x + width - 40, ceilY); ctx.stroke();

    // Pulleys Brackets & Wheels
    [ { px: p1x, py: p1y }, { px: p2x, py: p2y } ].forEach((p) => {
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(p.px, ceilY); ctx.lineTo(p.px, p.py); ctx.stroke();
      ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); ctx.arc(p.px, p.py, 16, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(p.px, p.py, 3.5, 0, Math.PI * 2); ctx.fill();
    });

    // Ropes
    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(p1x - 16, p1y); ctx.lineTo(p1x - 16, p1y + 90); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p1x + 8, p1y + 12); ctx.lineTo(kx, ky); ctx.stroke();

    ctx.strokeStyle = '#10b981';
    ctx.beginPath(); ctx.moveTo(p2x + 16, p2y); ctx.lineTo(p2x + 16, p2y + 80); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p2x - 8, p2y + 12); ctx.lineTo(kx, ky); ctx.stroke();

    // Hanging FW2 & FW3
    ctx.fillStyle = '#475569';
    ctx.beginPath(); ctx.roundRect(p1x - 34, p1y + 90, 36, 38, 5); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = '700 9.5px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('FW2', p1x - 16, p1y + 108);
    ctx.fillText('411 N', p1x - 16, p1y + 120);

    ctx.fillStyle = '#475569';
    ctx.beginPath(); ctx.roundRect(p2x - 2, p2y + 80, 36, 38, 5); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText('FW3', p2x + 16, p2y + 98);
    ctx.fillText('323 N', p2x + 16, p2y + 110);

    // Central FW1 500 N
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(kx, ky + 55); ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.roundRect(kx - 26, ky + 55, 52, 45, 6); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = '700 10.5px sans-serif';
    ctx.fillText('FW1 = 500 N', kx, ky + 82);

    // Dashed horizontal at knot & angles
    ctx.strokeStyle = '#94a3b8'; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(kx - 50, ky); ctx.lineTo(kx + 50, ky); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ea580c'; ctx.font = '700 9px sans-serif';
    ctx.fillText('50.0°', kx - 38, ky - 8);
    ctx.fillText('35.0°', kx + 36, ky - 8);

    // Knot
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(kx, ky, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();

  } else if (appType === 'engine_suspended_cables') {
    // Problem 3: Engine 200 kg, cables AB (60°) and AC (45°)
    const beamY = y + 65;
    const bx = x + width * 0.28;
    const cx = x + width * 0.72;
    const kx = x + width * 0.50 + dispX;
    const ky = y + height * 0.44 + dispY;

    // Steel Beam
    ctx.fillStyle = '#64748b'; ctx.fillRect(x + 50, beamY - 14, width - 100, 14);
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x + 50, beamY); ctx.lineTo(x + width - 50, beamY); ctx.stroke();

    // Mounts B and C
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(bx, beamY, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillText('B', bx - 12, beamY - 4);
    ctx.beginPath(); ctx.arc(cx, beamY, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillText('C', cx + 12, beamY - 4);

    // Cables AB and AC
    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2.8;
    ctx.beginPath(); ctx.moveTo(bx, beamY); ctx.lineTo(kx, ky); ctx.stroke();
    ctx.strokeStyle = '#10b981';
    ctx.beginPath(); ctx.moveTo(cx, beamY); ctx.lineTo(kx, ky); ctx.stroke();

    ctx.fillStyle = '#ea580c'; ctx.font = '700 9.5px sans-serif';
    ctx.fillText('60°', bx + 16, beamY + 16);
    ctx.fillText('45°', cx - 26, beamY + 16);

    // Cable to engine
    ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2.8;
    ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(kx, ky + 40); ctx.stroke();

    // Engine Block
    const engX = kx - 45;
    const engY = ky + 40;
    ctx.fillStyle = '#334155';
    ctx.beginPath(); ctx.roundRect(engX, engY, 90, 68, 8); ctx.fill();
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#64748b';
    ctx.beginPath(); ctx.arc(engX + 28, engY + 42, 11, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(engX + 62, engY + 42, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = '700 9.5px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('MOTOR 200 kg', kx, engY + 18);
    ctx.font = '700 9px monospace, sans-serif'; ctx.fillStyle = '#38bdf8';
    ctx.fillText('W = 1960 N', kx, engY + 62);

    // Knot A
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(kx, ky, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#0f172a'; ctx.font = '700 11px sans-serif';
    ctx.fillText('A', kx + 12, ky - 4);

  } else if (appType === 'triangular_knot_slope') {
    // Problem 4: 200 N weight with 3-4-5 slope and 30° vertical
    const bx = x + width * 0.30;
    const by = y + 75;
    const cx = x + width * 0.68;
    const cy = y + 75;
    const kx = x + width * 0.50 + dispX;
    const ky = y + height * 0.48 + dispY;

    // Mounts B and C
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(bx, by, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillText('B', bx - 12, by);
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillText('C', cx + 12, cy);

    // Cables
    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2.8;
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(kx, ky); ctx.stroke();
    ctx.strokeStyle = '#10b981';
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(kx, ky); ctx.stroke();

    // 3-4-5 slope triangle on BA
    const midBAx = (bx + kx) / 2;
    const midBAy = (by + ky) / 2;
    ctx.fillStyle = '#e2e8f0'; ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(midBAx - 12, midBAy + 12);
    ctx.lineTo(midBAx + 12, midBAy + 12);
    ctx.lineTo(midBAx + 12, midBAy - 18);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#0f172a'; ctx.font = '700 8px sans-serif';
    ctx.fillText('3', midBAx, midBAy + 20);
    ctx.fillText('4', midBAx + 18, midBAy);

    // 30° vertical arc on CA
    ctx.strokeStyle = '#94a3b8'; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + 60); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ea580c'; ctx.font = '700 9px sans-serif';
    ctx.fillText('30°', cx - 18, cy + 32);

    // Hanging weight 200 N
    ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(kx, ky + 45); ctx.stroke();
    ctx.fillStyle = '#475569';
    ctx.beginPath(); ctx.roundRect(kx - 26, ky + 45, 52, 42, 6); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = '700 10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('200 N', kx, ky + 70);

    // Knot A
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(kx, ky, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#0f172a'; ctx.font = '700 11px sans-serif';
    ctx.fillText('A', kx - 14, ky + 4);

  } else if (appType === 'crate_two_cables') {
    // Problem 5: Crate 500 lb with cable at 30° and cable with 4-3-5
    const bx = x + width * 0.25;
    const by = y + 70;
    const cx = x + width * 0.75;
    const cy = y + 65;
    const kx = x + width * 0.50 + dispX;
    const ky = y + height * 0.45 + dispY;

    // Mounts
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(bx, by, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillText('B', bx - 12, by);
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillText('C', cx + 12, cy);

    // Cables
    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2.8;
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(kx, ky); ctx.stroke();
    ctx.strokeStyle = '#10b981';
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(kx, ky); ctx.stroke();

    // 30° on AB
    ctx.strokeStyle = '#94a3b8'; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(kx - 45, ky); ctx.lineTo(kx, ky); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ea580c'; ctx.font = '700 9px sans-serif';
    ctx.fillText('30°', kx - 40, ky - 8);

    // 4-3-5 triangle on AC
    const midACx = (cx + kx) / 2;
    const midACy = (cy + ky) / 2;
    ctx.fillStyle = '#e2e8f0'; ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(midACx - 14, midACy + 12);
    ctx.lineTo(midACx + 14, midACy + 12);
    ctx.lineTo(midACx + 14, midACy - 12);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#0f172a'; ctx.font = '700 8px sans-serif';
    ctx.fillText('4', midACx, midACy + 20);
    ctx.fillText('3', midACx + 20, midACy);

    // Cable to crate
    ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2.8;
    ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(kx, ky + 45); ctx.stroke();

    // Wooden Crate (500 lb)
    const crW = 72;
    const crH = 58;
    ctx.fillStyle = '#d97706';
    ctx.beginPath(); ctx.roundRect(kx - crW / 2, ky + 45, crW, crH, 6); ctx.fill();
    ctx.strokeStyle = '#92400e'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(kx - crW / 2, ky + 45); ctx.lineTo(kx + crW / 2, ky + 45 + crH);
    ctx.moveTo(kx + crW / 2, ky + 45); ctx.lineTo(kx - crW / 2, ky + 45 + crH);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(kx - 22, ky + 64, 44, 20);
    ctx.fillStyle = '#78350f'; ctx.font = '700 10.5px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('500 lb', kx, ky + 78);

    // Knot A
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(kx, ky, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#0f172a'; ctx.font = '700 11px sans-serif';
    ctx.fillText('A', kx + 12, ky - 4);

  } else if (appType === 'pulley_cylinder_knot') {
    // Problem 6: Cylinder C 40 kg over pulley supporting Cylinder A at 30°
    const dx = x + 50;
    const initEy = y + height * 0.45;
    const ey = initEy + dispY;
    const ex = x + width * 0.48 + dispX;
    const bx = x + width * 0.75;
    const by = y + 70;

    // Wall D
    ctx.fillStyle = '#cbd5e1'; ctx.fillRect(dx - 14, y + 60, 14, height - 120);
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(dx, y + 60); ctx.lineTo(dx, y + height - 60); ctx.stroke();
    ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(dx, initEy, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillText('D', dx - 12, initEy - 6);

    // Cable ED
    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2.8;
    ctx.beginPath(); ctx.moveTo(dx, initEy); ctx.lineTo(ex, ey); ctx.stroke();

    // Pulley B
    ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); ctx.arc(bx, by, 16, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(bx, by, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillText('B', bx + 22, by);

    // Cable EB at 30°
    ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2.8;
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(bx - 10, by + 10); ctx.stroke();

    // Cable down to Cylinder C
    ctx.beginPath(); ctx.moveTo(bx + 16, by); ctx.lineTo(bx + 16, by + 100); ctx.stroke();
    ctx.fillStyle = '#64748b';
    ctx.beginPath(); ctx.roundRect(bx + 2, by + 100, 28, 48, 5); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = '700 9px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('40 kg', bx + 16, by + 126);
    ctx.fillStyle = '#334155'; ctx.fillText('Cilindro C', bx + 16, by + 158);

    // Cable down to Cylinder A
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2.8;
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex, ey + 55); ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.roundRect(ex - 18, ey + 55, 36, 50, 5); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.fillText('mA = 20 kg', ex, ey + 82);
    ctx.fillStyle = '#b91c1c'; ctx.fillText('Cilindro A', ex, ey + 116);

    // Angle 30°
    ctx.strokeStyle = '#94a3b8'; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + 50, ey); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ea580c'; ctx.font = '700 9px sans-serif';
    ctx.fillText('30°', ex + 32, ey - 8);

    // Knot E
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(ex, ey, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#0f172a'; ctx.font = '700 11px sans-serif';
    ctx.fillText('E', ex - 12, ey + 16);

  } else if (appType === 'traffic_lights_span') {
    // Problem 7: Two traffic lights (10 kg and 15 kg), 15°, horizontal, 22°
    const ax = x + 50;
    const ay = y + 75;
    const bx = x + width * 0.38 + dispX;
    const by = y + height * 0.40 + dispY;
    const cx = x + width * 0.62 + dispX;
    const cy = y + height * 0.40 + dispY;
    const dx = x + width - 50;
    const dy = y + 75;

    // Posts A and D
    ctx.fillStyle = '#475569';
    ctx.fillRect(ax - 6, ay, 12, height - 120);
    ctx.fillRect(dx - 6, dy, 12, height - 120);
    ctx.fillStyle = '#0f172a'; ctx.font = '700 10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Poste A', ax, ay - 8);
    ctx.fillText('Poste D', dx, dy - 8);

    // Cables
    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2.8;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    ctx.strokeStyle = '#10b981';
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(cx, cy); ctx.stroke();
    ctx.strokeStyle = '#8b5cf6';
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(dx, dy); ctx.stroke();

    // Angles
    ctx.fillStyle = '#ea580c'; ctx.font = '700 9px sans-serif';
    ctx.fillText('15°', (ax + bx) / 2, (ay + by) / 2 - 8);
    ctx.fillText('θ = 22°', (cx + dx) / 2, (cy + dy) / 2 - 8);

    // Traffic Lights
    [ { kx: bx, ky: by, kg: '10 kg (98 N)', lbl: 'B' }, { kx: cx, ky: cy, kg: '15 kg (147 N)', lbl: 'C' } ].forEach((tl) => {
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(tl.kx, tl.ky); ctx.lineTo(tl.kx, tl.ky + 25); ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.beginPath(); ctx.roundRect(tl.kx - 12, tl.ky + 25, 24, 46, 4); ctx.fill();
      ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(tl.kx, tl.ky + 34, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(tl.kx, tl.ky + 46, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(tl.kx, tl.ky + 58, 4, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#ef4444'; ctx.font = '700 8.5px sans-serif';
      ctx.fillText(tl.kg, tl.kx, tl.ky + 82);

      // Knot
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(tl.kx, tl.ky, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillText(tl.lbl, tl.kx, tl.ky - 10);
    });

  } else if (appType === 'double_inclined_planes') {
    // Problem 8: Two 40 lb boxes on smooth inclined planes (70° and 20°)
    const apexX = x + width * 0.52;
    const apexY = y + 90;
    const groundY = y + height - 55;

    // Ground
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(x + 40, groundY); ctx.lineTo(x + width - 40, groundY); ctx.stroke();

    // Wedges: Left 70°, Right 20°
    const leftBaseX = apexX - (groundY - apexY) / Math.tan((70 * Math.PI) / 180);
    const rightBaseX = apexX + (groundY - apexY) / Math.tan((20 * Math.PI) / 180);

    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.moveTo(apexX, apexY);
    ctx.lineTo(leftBaseX, groundY);
    ctx.lineTo(apexX, groundY);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 2; ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(apexX, apexY);
    ctx.lineTo(rightBaseX, groundY);
    ctx.lineTo(apexX, groundY);
    ctx.closePath(); ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ea580c'; ctx.font = '700 9.5px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('70°', apexX - 45, groundY - 10);
    ctx.fillText('20°', rightBaseX - 35, groundY - 10);

    // Pulley at apex
    ctx.fillStyle = '#cbd5e1'; ctx.beginPath(); ctx.arc(apexX, apexY, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 1.5; ctx.stroke();

    // Box B on 70° plane (displaces along incline)
    const cos70 = Math.cos((70 * Math.PI) / 180);
    const sin70 = Math.sin((70 * Math.PI) / 180);
    const bx = x + width * 0.42 - dispX * cos70;
    const by = y + height * 0.45 + dispY * sin70;
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate((-20 * Math.PI) / 180);
    ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.roundRect(-20, -18, 40, 36, 4); ctx.fill();
    ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.font = '700 10px sans-serif';
    ctx.fillText('B', 0, -2);
    ctx.font = '700 8px sans-serif'; ctx.fillText('40 lb', 0, 10);
    ctx.restore();

    // Wall at top of 70° plane and Cord A
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(apexX - 10, apexY - 20, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillText('A', apexX - 22, apexY - 22);
    ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(apexX - 10, apexY - 20); ctx.lineTo(bx + 4, by - 16); ctx.stroke();

    // Cord C over apex to Box D
    const cos20 = Math.cos((20 * Math.PI) / 180);
    const sin20 = Math.sin((20 * Math.PI) / 180);
    const dx = x + width * 0.68 + dispX * cos20;
    const dy = y + height * 0.58 + dispY * sin20;
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(bx + 10, by + 10); ctx.lineTo(apexX, apexY); ctx.lineTo(dx - 10, dy - 12); ctx.stroke();

    // Box D on 20° plane (displaces along incline)
    ctx.save();
    ctx.translate(dx, dy);
    ctx.rotate((20 * Math.PI) / 180);
    ctx.fillStyle = '#64748b'; ctx.beginPath(); ctx.roundRect(-20, -18, 40, 36, 4); ctx.fill();
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.font = '700 10px sans-serif';
    ctx.fillText('D', 0, -2);
    ctx.font = '700 8px sans-serif'; ctx.fillText('40 lb', 0, 10);
    ctx.restore();
  }

  // 3. Render Vectors: Official equilibrium vectors OR User vectors
  let activeVectors = userVectors;
  if (userVectors.length === 0 && showOfficialSolution) {
    activeVectors = OFFICIAL_EQUILIBRIO_VECTORS[appType] || [];
  }

  if (Array.isArray(activeVectors) && activeVectors.length > 0) {
    activeVectors.forEach((v) => {
      const center = getDclBodyCenter(el, v.targetBody || 'main');
      drawEquilibrioVectorArrow(ctx, center.x, center.y, v, isSelected);
    });
  }

  // 4. Floating Equation Pill at Bottom
  if (showOfficialSolution) {
    ctx.save();
    const pillW = width - 24;
    const pillH = 26;
    const pillX = x + 12;
    const pillY = y + height - pillH - 8;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 6);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '600 9px monospace, sans-serif';
    ctx.fillStyle = '#a7f3d0';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let summaryText = 'Primera Ley Newton: ΣFx = 0, ΣFy = 0  ⇒  Equilibrio Traslacional Estático (a = 0)';
    if (appType === 'cable_knot_wall') summaryText = 'ΣFx = FT2·cos(50°) - FT1 = 0,  ΣFy = FT2·sen(50°) - 600 = 0  ⇒  FT1 = 503.46 N,  FT2 = 783.24 N';
    else if (appType === 'two_pulleys_three_weights') summaryText = 'ΣFx = FW3·cos(35°) - FW2·cos(50°) = 0,  ΣFy = FW2·sen(50°) + FW3·sen(35°) = 500  ⇒  FW2 = 411.14 N,  FW3 = 322.62 N';
    else if (appType === 'engine_suspended_cables') summaryText = 'W = 200kg·9.8m/s² = 1960 N  |  ΣFx = TAC·cos(45°) - TAB·cos(60°) = 0  ⇒  TAB = 1434.82 N,  TAC = 1014.57 N';
    else if (appType === 'triangular_knot_slope') summaryText = 'Cable BA: pendiente 3-4-5 | Cable CA: 30° vertical  ⇒  TBA = 108.74 N,  TCA = 130.49 N';
    else if (appType === 'crate_two_cables') summaryText = 'FAD = 500 lb | Cable AB a 30° | Cable AC pendiente 4-3-5  ⇒  FAB = 434.96 lb,  FAC = 470.86 lb';
    else if (appType === 'pulley_cylinder_knot') summaryText = 'Cilindro C = 40 kg | TEB = 392 N  |  ΣFy: mA = mC·sen(30°) = 20.00 kg  |  TED = 339.48 N';
    else if (appType === 'traffic_lights_span') summaryText = 'Nudo B (10kg): TAB = 378.64 N, TBC = 365.74 N  |  Nudo C (15kg, 22°): TCD = 392.41 N';
    else if (appType === 'double_inclined_planes') summaryText = 'Caja D (20°): TC = 13.68 lb  |  Caja B (70°): NB = 13.68 lb,  TA = 23.91 lb';

    ctx.fillText(summaryText, x + width / 2, pillY + pillH / 2);
    ctx.restore();
  }

  // 5. Selection Outline
  if (isSelected) {
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(x - 4, y - 4, width + 8, height + 8);
    ctx.setLineDash([]);
  }

  ctx.restore();
}

/**
 * High-Precision 2D Scientific Renderer for Segunda Ley de Newton sin Fricción (HT01 U4)
 */
export function drawNewtonFrictionlessApparatus(ctx, el, isSelected) {
  const { x, y, width, height } = el;
  const props = el.properties || {};
  const appType = props.apparatusType || 'two_connected_blocks';
  const showOfficialSolution = props.showOfficialSolution !== false;
  const userVectors = Array.isArray(props.userVectors) ? props.userVectors : [];
  const dispX = props.displacementX || 0;
  const dispY = props.displacementY || 0;

  ctx.save();

  // 1. Blueprint Card Frame
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
  ctx.shadowBlur = isSelected ? 16 : 8;
  ctx.shadowOffsetY = 3;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 14);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
  ctx.fill();
  ctx.strokeStyle = isSelected ? '#4f46e5' : 'rgba(203, 213, 225, 0.85)';
  ctx.lineWidth = isSelected ? 2.5 : 1.5;
  ctx.stroke();
  ctx.restore();

  // Header Title Bar
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x + 12, y + 10, width - 24, 26, 6);
  ctx.fillStyle = '#eef2ff';
  ctx.fill();
  ctx.strokeStyle = '#c7d2fe';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = '700 11px Inter, sans-serif';
  ctx.fillStyle = '#3730a3';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`⚖️ ${props.systemTitle || 'Segunda Ley de Newton (HT01 U4)'}`, x + 20, y + 23);

  ctx.font = '600 9.5px monospace, sans-serif';
  ctx.textAlign = 'right';
  if (showOfficialSolution) {
    ctx.fillStyle = '#4f46e5';
    ctx.fillText('ΣF = m·a • Sin Fricción (Solución Oficial)', x + width - 24, y + 23);
  } else {
    ctx.fillStyle = '#059669';
    ctx.fillText('Práctica Activa • Fricción Cero (μ = 0)', x + width - 24, y + 23);
  }
  ctx.restore();

  // 2. Physical Apparatus Specific Geometry
  if (appType === 'two_connected_blocks') {
    // Problem 7: Two blocks (2 kg & 6 kg) connected by a cord on smooth table with F = 80 N
    const tableY = y + height * 0.72;
    const tableX = x + 35;
    const tableW = width - 70;

    // Smooth Table Slab (Zero Friction)
    ctx.save();
    const grad = ctx.createLinearGradient(tableX, tableY, tableX, tableY + 22);
    grad.addColorStop(0, '#f1f5f9');
    grad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = grad;
    ctx.fillRect(tableX, tableY, tableW, 22);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tableX, tableY);
    ctx.lineTo(tableX + tableW, tableY);
    ctx.stroke();

    // Table legs / supports
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(tableX + 25, tableY + 22, 14, height - (tableY - y + 36));
    ctx.fillRect(tableX + tableW - 39, tableY + 22, 14, height - (tableY - y + 36));

    // Zero friction label badge
    ctx.fillStyle = '#059669';
    ctx.font = '700 9.5px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ Superficie Lisa Sin Fricción (μ = 0)', tableX + tableW / 2, tableY + 15);
    ctx.restore();

    // Block 1 (m1 = 2 kg)
    const b1W = 72;
    const b1H = 50;
    const b1X = x + width * 0.18 + dispX;
    const b1Y = tableY - b1H;

    // Motion ghost trail if moving
    if (dispX > 4) {
      ctx.save();
      ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
      ctx.beginPath();
      ctx.roundRect(x + width * 0.18, b1Y, b1W, b1H, 6);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(b1X, b1Y, b1W, b1H, 6);
    ctx.fill();
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${props.mass1 || 2} kg`, b1X + b1W / 2, b1Y + 22);
    ctx.font = '600 8.5px Inter, sans-serif';
    ctx.fillStyle = '#dbeafe';
    ctx.fillText('Bloque 1 (m₁)', b1X + b1W / 2, b1Y + 36);

    // Block 1 Hook on right
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(b1X + b1W, b1Y + b1H / 2, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Block 2 (m2 = 6 kg)
    const b2W = 96;
    const b2H = 58;
    const b2X = x + width * 0.54 + dispX;
    const b2Y = tableY - b2H;

    // Motion ghost trail if moving
    if (dispX > 4) {
      ctx.save();
      ctx.fillStyle = 'rgba(71, 85, 105, 0.15)';
      ctx.beginPath();
      ctx.roundRect(x + width * 0.54, b2Y, b2W, b2H, 6);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.roundRect(b2X, b2Y, b2W, b2H, 6);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 11.5px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${props.mass2 || 6} kg`, b2X + b2W / 2, b2Y + 24);
    ctx.font = '600 8.5px Inter, sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('Bloque 2 (m₂)', b2X + b2W / 2, b2Y + 40);

    // Block 2 Hook on left and right
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(b2X, b2Y + b2H / 2, 4.5, 0, Math.PI * 2);
    ctx.arc(b2X + b2W, b2Y + b2H / 2, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Connecting Rope with Tension
    ctx.save();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(b1X + b1W, b1Y + b1H / 2);
    ctx.lineTo(b2X, b2Y + b2H / 2);
    ctx.stroke();

    // Tension badge
    const ropeMidX = (b1X + b1W + b2X) / 2;
    const ropeMidY = (b1Y + b1H / 2 + b2Y + b2H / 2) / 2;
    ctx.fillStyle = '#ecfdf5';
    ctx.beginPath();
    ctx.roundRect(ropeMidX - 28, ropeMidY - 18, 56, 16, 4);
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#047857';
    ctx.font = '700 9px monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('T = 20.0 N', ropeMidX, ropeMidY - 7);
    ctx.restore();

    // Applied Pulling Force Arrow F = 80 N
    const pullX = b2X + b2W;
    const pullY = b2Y + b2H / 2;
    const arrowLen = 85;

    ctx.save();
    ctx.strokeStyle = '#8b5cf6';
    ctx.fillStyle = '#8b5cf6';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(pullX, pullY);
    ctx.lineTo(pullX + arrowLen, pullY);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(pullX + arrowLen, pullY);
    ctx.lineTo(pullX + arrowLen - 12, pullY - 6);
    ctx.lineTo(pullX + arrowLen - 12, pullY + 6);
    ctx.closePath();
    ctx.fill();

    // Force label badge
    ctx.fillStyle = '#f5f3ff';
    ctx.beginPath();
    ctx.roundRect(pullX + 16, pullY - 24, 72, 18, 4);
    ctx.fill();
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#6d28d9';
    ctx.font = '700 9.5px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`F = ${props.appliedForce || 80} N (→)`, pullX + 52, pullY - 12);
    ctx.restore();

  } else if (appType === 'single_block_force') {
    // Problem 1 & 2: Single block on smooth table with applied force
    const tableY = y + height * 0.72;
    const tableX = x + 40;
    const tableW = width - 80;

    // Table
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(tableX, tableY, tableW, 20);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tableX, tableY);
    ctx.lineTo(tableX + tableW, tableY);
    ctx.stroke();

    ctx.fillStyle = '#059669';
    ctx.font = '700 9.5px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Superficie Sin Fricción (μ = 0)', tableX + tableW / 2, tableY + 14);

    // Block
    const bW = 86;
    const bH = 60;
    const bX = x + width * 0.40 + dispX;
    const bY = tableY - bH;

    ctx.fillStyle = el.color || '#0284c7';
    ctx.beginPath();
    ctx.roundRect(bX, bY, bW, bH, 6);
    ctx.fill();
    ctx.strokeStyle = '#0369a1';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 12px Inter, sans-serif';
    ctx.fillText(`m = ${props.mass1 || 4} kg`, bX + bW / 2, bY + 28);
    ctx.font = '600 9px Inter, sans-serif';
    ctx.fillText('Bloque Dinámico', bX + bW / 2, bY + 44);

    // Force arrow
    const fMag = props.appliedForce || 12;
    const arrowLen = 75;
    ctx.strokeStyle = '#8b5cf6';
    ctx.fillStyle = '#8b5cf6';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(bX + bW, bY + bH / 2);
    ctx.lineTo(bX + bW + arrowLen, bY + bH / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bX + bW + arrowLen, bY + bH / 2);
    ctx.lineTo(bX + bW + arrowLen - 10, bY + bH / 2 - 5);
    ctx.lineTo(bX + bW + arrowLen - 10, bY + bH / 2 + 5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#6d28d9';
    ctx.font = '700 10px Inter, sans-serif';
    ctx.fillText(`F = ${fMag} N`, bX + bW + 36, bY + bH / 2 - 12);

  } else if (appType === 'vertical_cable_mass') {
    // Problem 6: Vertical cable raising 10 kg mass
    const beamY = y + 65;
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + width * 0.30, beamY - 12, width * 0.40, 12);

    const cx = x + width * 0.50;
    const mY = y + height * 0.50 - dispX * 0.4;
    const mW = 72;
    const mH = 55;

    // Cable
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, beamY);
    ctx.lineTo(cx, mY);
    ctx.stroke();

    // Mass
    ctx.fillStyle = '#7c3aed';
    ctx.beginPath();
    ctx.roundRect(cx - mW / 2, mY, mW, mH, 6);
    ctx.fill();
    ctx.strokeStyle = '#5b21b6';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${props.mass1 || 10} kg`, cx, mY + 24);
    ctx.font = '700 9px monospace, sans-serif';
    ctx.fillStyle = '#f5f3ff';
    ctx.fillText('W = 98 N (↓)', cx, mY + 40);

    // Cable tension tag
    ctx.fillStyle = '#047857';
    ctx.font = '700 9.5px monospace, sans-serif';
    ctx.fillText('T = 158.0 N (↑)', cx + 55, beamY + 35);
    ctx.fillText('a = 6.0 m/s² (↑)', cx + 55, beamY + 50);

  } else if (appType === 'atwood_frictionless') {
    // Problem 8: Atwood machine without friction (7 kg & 9 kg)
    const pX = x + width * 0.50;
    const pY = y + 80;
    const r = 24;

    // Mount
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(pX, y + 50);
    ctx.lineTo(pX, pY);
    ctx.stroke();

    // Pulley wheel
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(pX, pY, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(pX, pY, 4, 0, Math.PI * 2);
    ctx.fill();

    const m1Y = pY + 110 - dispX;
    const m2Y = pY + 110 + dispX;

    // Cables
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pX - r, pY);
    ctx.lineTo(pX - r, m1Y);
    ctx.moveTo(pX + r, pY);
    ctx.lineTo(pX + r, m2Y);
    ctx.stroke();

    // Mass 1 (7 kg, ascending)
    ctx.fillStyle = '#0891b2';
    ctx.beginPath();
    ctx.roundRect(pX - r - 26, m1Y, 52, 46, 5);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('m₁ = 7 kg', pX - r, m1Y + 20);
    ctx.fillText('W₁ = 68.6 N', pX - r, m1Y + 34);

    // Mass 2 (9 kg, descending)
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(pX + r - 28, m2Y, 56, 52, 5);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText('m₂ = 9 kg', pX + r, m2Y + 22);
    ctx.fillText('W₂ = 88.2 N', pX + r, m2Y + 38);

    // Dynamic tags
    ctx.fillStyle = '#0369a1';
    ctx.font = '700 9.5px sans-serif';
    ctx.fillText('a = 1.225 m/s²', pX, pY + 70);
    ctx.fillText('T = 77.18 N', pX, pY + 86);

  } else if (appType === 'inclined_plane_frictionless') {
    // Problem 12a: Block 10 kg on 32° incline with 2 kg hanging mass without friction
    const apexX = x + width * 0.65;
    const apexY = y + 100;
    const groundY = y + height - 55;
    const baseX = apexX - (groundY - apexY) / Math.tan((32 * Math.PI) / 180);

    // Incline wedge
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(apexX, apexY);
    ctx.lineTo(baseX, groundY);
    ctx.lineTo(apexX, groundY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 32° angle text
    ctx.fillStyle = '#ea580c';
    ctx.font = '700 9.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('32.0°', baseX + 45, groundY - 10);
    ctx.fillStyle = '#059669';
    ctx.fillText('Superficie Lisa (μ = 0)', (apexX + baseX) / 2, groundY - 26);

    // Pulley at apex
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(apexX, apexY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    // Block on incline
    const cos32 = Math.cos((32 * Math.PI) / 180);
    const sin32 = Math.sin((32 * Math.PI) / 180);
    const bX = x + width * 0.44 - dispX * cos32;
    const bY = y + height * 0.54 + dispX * sin32;

    ctx.save();
    ctx.translate(bX, bY);
    ctx.rotate((-32 * Math.PI) / 180);
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.roundRect(-24, -20, 48, 40, 5);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 10px sans-serif';
    ctx.fillText('10 kg', 0, -2);
    ctx.font = '600 8px sans-serif';
    ctx.fillText('W₁∥=51.9N', 0, 10);
    ctx.restore();

    // Cable to hanging mass
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(bX, bY);
    ctx.lineTo(apexX, apexY);
    ctx.lineTo(apexX + 16, apexY + 70 + dispX);
    ctx.stroke();

    // Hanging mass 2 kg
    const hmY = apexY + 70 + dispX;
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(apexX + 4, hmY, 26, 32, 4);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 9px sans-serif';
    ctx.fillText('2 kg', apexX + 17, hmY + 18);
  }

  // 3. Attached Active / Official Force Vectors
  let activeVectors = userVectors;
  if (userVectors.length === 0 && showOfficialSolution) {
    activeVectors = OFFICIAL_NEWTON_VECTORS[appType] || [];
  }

  if (activeVectors.length > 0) {
    activeVectors.forEach((v) => {
      const bodyCenter = getDclBodyCenter(el, v.targetBody || 'main');
      const originX = bodyCenter.x;
      const originY = bodyCenter.y;
      const len = v.lengthPx || 60;
      const rad = ((v.angleDeg !== undefined ? v.angleDeg : 0) * Math.PI) / 180;
      const endX = originX + len * Math.cos(rad);
      const endY = originY - len * Math.sin(rad);

      ctx.save();
      ctx.strokeStyle = v.color || '#8b5cf6';
      ctx.fillStyle = v.color || '#8b5cf6';
      ctx.lineWidth = 2.5;

      // Force Line
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Arrow Head
      const headLen = 10;
      const arrowAngle = Math.atan2(endY - originY, endX - originX);
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - headLen * Math.cos(arrowAngle - Math.PI / 6), endY - headLen * Math.sin(arrowAngle - Math.PI / 6));
      ctx.lineTo(endX - headLen * Math.cos(arrowAngle + Math.PI / 6), endY - headLen * Math.sin(arrowAngle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      // Vector Label Badge
      const badgeX = originX + (len + 16) * Math.cos(rad);
      const badgeY = originY - (len + 16) * Math.sin(rad);
      ctx.font = '700 9.5px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = v.color || '#8b5cf6';
      ctx.fillText(v.symbol || v.label || v.name, badgeX, badgeY);

      ctx.restore();
    });
  }

  // 4. Official Solution Equation Pill at Bottom (if active)
  if (showOfficialSolution) {
    ctx.save();
    const pillY = y + height - 32;
    const pillH = 22;
    ctx.beginPath();
    ctx.roundRect(x + 16, pillY, width - 32, pillH, 6);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fill();

    ctx.font = '600 9px monospace, sans-serif';
    ctx.fillStyle = '#a5b4fc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let summaryText = 'Segunda Ley de Newton: ΣF = m·a (Fricción Cero)';
    if (appType === 'two_connected_blocks') {
      summaryText = 'ΣFx = F = (m₁ + m₂)·a  ⇒  80 N = (2 + 6)·a  ⇒  a = 10.00 m/s²  |  T = m₁·a = 2(10) = 20.00 N';
    } else if (appType === 'single_block_force') {
      const f = props.appliedForce || 12;
      const m = props.mass1 || 4;
      summaryText = `a = F / m  ⇒  a = ${f} N / ${m} kg = ${(f / m).toFixed(2)} m/s²  |  ΣFy = N - W = 0`;
    } else if (appType === 'vertical_cable_mass') {
      summaryText = 'T = m(g + a) = 10(9.8 + 6) = 158.00 N  |  (a = 0 ⇒ T = 98 N, a = -6 ⇒ T = 38 N)';
    } else if (appType === 'atwood_frictionless') {
      summaryText = 'a = g(m₂ - m₁) / (m₁ + m₂) = 1.225 m/s²  |  T = 2 m₁ m₂ g / (m₁ + m₂) = 77.18 N';
    } else if (appType === 'inclined_plane_frictionless') {
      summaryText = 'Sin fricción: a = (m₁·g·sen 32° - m₂·g) / (m₁ + m₂) = 2.694 m/s²  |  T = 24.99 N';
    }

    ctx.fillText(summaryText, x + width / 2, pillY + pillH / 2);
    ctx.restore();
  }

  // 5. Selection Outline
  if (isSelected) {
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(x - 4, y - 4, width + 8, height + 8);
    ctx.setLineDash([]);
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

    // 7. Attached Force Vectors (DCL & Newton Dynamics)
    const userVectors = Array.isArray(el.properties?.userVectors) ? el.properties.userVectors : [];
    if (userVectors.length > 0) {
      const cx = x + width / 2;
      const cy = y + height / 2;
      userVectors.forEach((v) => {
        drawEquilibrioVectorArrow(ctx, cx, cy, v, isSelected);
      });

      // Educational Newton's 1st and 2nd Law live banner badge
      const sumFx = userVectors.reduce(
        (s, v) => s + (v.magnitude !== undefined ? v.magnitude : (v.lengthPx || 50)) * Math.cos(((v.angleDeg || 0) * Math.PI) / 180),
        0
      );
      const sumFy = userVectors.reduce(
        (s, v) => s + (v.magnitude !== undefined ? v.magnitude : (v.lengthPx || 50)) * Math.sin(((v.angleDeg || 0) * Math.PI) / 180),
        0
      );
      const netF = Math.hypot(sumFx, sumFy);
      const aVal = massValue > 0 ? netF / massValue : 0;

      ctx.save();
      ctx.font = '700 8.5px monospace, sans-serif';
      const badgeText =
        netF < 0.2
          ? '✓ 1ª LEY: ΣF = 0 (Equilibrio Traslacional, a = 0)'
          : `⚡ 2ª LEY: ΣF = ${netF.toFixed(1)} N ⇒ a = ${aVal.toFixed(2)} m/s²`;
      const tm = ctx.measureText(badgeText);
      const bw = tm.width + 14;
      const bh = 18;
      const bx = x + width / 2 - bw / 2;
      const by = y + height + 10;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 4);
      ctx.fillStyle = netF < 0.2 ? '#065f46' : '#0f172a';
      ctx.fill();
      ctx.strokeStyle = netF < 0.2 ? '#10b981' : '#38bdf8';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = netF < 0.2 ? '#a7f3d0' : '#e0f2fe';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, x + width / 2, by + bh / 2);
      ctx.restore();
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
  } else if (el.physicsType === 'mcu_pulley_system') {
    const { x, y, width, height } = el;
    const props = el.properties || {};
    const config = props.configuration || 'belt';
    const angle1 = props.angleRad1 !== undefined ? props.angleRad1 : 0.0;
    const angle2 = props.angleRad2 !== undefined ? props.angleRad2 : 0.0;
    const omega1 = props.omega1 !== undefined ? props.omega1 : (props.omega || 5.0);
    const omega2 = props.omega2 !== undefined ? props.omega2 : (omega1 * ((props.radiusMeters1 || 0.2) / (props.radiusMeters2 || 0.1)));
    const linearSpeed = props.linearSpeed !== undefined ? props.linearSpeed : (Math.abs(omega1) * (props.radiusMeters1 || 0.2));
    const r1M = props.radiusMeters1 || 0.20;
    const r2M = props.radiusMeters2 || 0.10;
    const r3M = props.radiusMeters3 || 0.25;
    const r4M = props.radiusMeters4 || 0.50;
    const isBeltCrossed = !!props.beltCrossed;
    const showSpokes = props.showSpokes !== false;
    const showBelt = props.showBelt !== false;
    const showVectors = props.showVectors !== false;

    ctx.save();

    // Helper to draw a single industrial pulley wheel with rim, groove, metallic gradient, spokes and hub
    const drawPulleyWheel = (pcx, pcy, pRad, pAngle, pLabel, pColor, pOmega) => {
      // 1. Soft Shadow
      ctx.save();
      ctx.shadowColor = 'rgba(15, 23, 42, 0.35)';
      ctx.shadowBlur = isSelected ? 16 : 8;
      ctx.shadowOffsetY = 3;

      // 2. Outer Rim / Groove
      ctx.beginPath();
      ctx.arc(pcx, pcy, pRad, 0, Math.PI * 2);
      const rimGrad = ctx.createRadialGradient(pcx - pRad * 0.2, pcy - pRad * 0.2, pRad * 0.2, pcx, pcy, pRad);
      rimGrad.addColorStop(0, '#334155');
      rimGrad.addColorStop(0.8, '#1e293b');
      rimGrad.addColorStop(1, pColor || '#0284c7');
      ctx.fillStyle = rimGrad;
      ctx.fill();

      ctx.strokeStyle = isSelected ? '#4262ff' : (pColor || '#0284c7');
      ctx.lineWidth = isSelected ? 2.5 : 2.0;
      ctx.stroke();
      ctx.restore();

      // 3. Inner Groove recessed ring
      ctx.beginPath();
      ctx.arc(pcx, pcy, pRad * 0.88, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 4. Concentric web / face disc
      ctx.beginPath();
      ctx.arc(pcx, pcy, pRad * 0.76, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();

      // 5. Rotating Spokes & Alignment Dot
      if (showSpokes) {
        const spokeCount = pRad > 40 ? 6 : 4;
        const hubR = Math.max(7, pRad * 0.22);
        ctx.save();
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.65)';
        ctx.lineWidth = 1.8;
        for (let i = 0; i < spokeCount; i++) {
          const spAngle = pAngle + (i * 2 * Math.PI) / spokeCount;
          ctx.beginPath();
          ctx.moveTo(pcx + hubR * Math.cos(spAngle), pcy + hubR * Math.sin(spAngle));
          ctx.lineTo(pcx + pRad * 0.74 * Math.cos(spAngle), pcy + pRad * 0.74 * Math.sin(spAngle));
          ctx.stroke();
        }

        // Optical marker dot on rim
        const markerR = pRad * 0.82;
        ctx.beginPath();
        ctx.arc(pcx + markerR * Math.cos(pAngle), pcy + markerR * Math.sin(pAngle), Math.max(2.5, pRad * 0.06), 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      // 6. Central Metallic Axle Hub & Pivot Pin
      const hubRadius = Math.max(8, pRad * 0.24);
      ctx.beginPath();
      ctx.arc(pcx, pcy, hubRadius, 0, Math.PI * 2);
      const hubGrad = ctx.createRadialGradient(pcx - hubRadius * 0.3, pcy - hubRadius * 0.3, hubRadius * 0.1, pcx, pcy, hubRadius);
      hubGrad.addColorStop(0, '#f8fafc');
      hubGrad.addColorStop(0.5, '#64748b');
      hubGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = hubGrad;
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Central axle bolt
      ctx.beginPath();
      ctx.arc(pcx, pcy, Math.max(2.5, hubRadius * 0.35), 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      // 7. Label & Omega readout above/below pulley
      if (pLabel) {
        ctx.font = '700 9.5px Inter, sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(pLabel, pcx, pcy - pRad - 5);

        ctx.font = '600 8.5px monospace, sans-serif';
        ctx.fillStyle = '#0284c7';
        ctx.textBaseline = 'top';
        ctx.fillText(`ω=${pOmega !== undefined ? pOmega.toFixed(1) : '0'} rad/s`, pcx, pcy + pRad + 5);
      }
    };

    // Helper to draw a continuous transmission belt connecting two pulleys
    const drawBeltTransmission = (c1x, c1y, rad1, c2x, c2y, rad2, beltSpeed, crossed = false) => {
      const dx = c2x - c1x;
      const dy = c2y - c1y;
      const dist = Math.hypot(dx, dy);
      if (dist < 5) return;

      const baseAngle = Math.atan2(dy, dx);
      ctx.save();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4.0;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (!crossed) {
        // Open belt: tangent lines with angle alpha = asin((rad1 - rad2) / dist)
        const sinAlpha = Math.max(-1, Math.min(1, (rad1 - rad2) / dist));
        const alpha = Math.asin(sinAlpha);

        const a1Top = baseAngle + Math.PI / 2 - alpha;
        const a2Top = baseAngle + Math.PI / 2 - alpha;
        const a1Bot = baseAngle - Math.PI / 2 + alpha;
        const a2Bot = baseAngle - Math.PI / 2 + alpha;

        const p1TopX = c1x + rad1 * Math.cos(a1Top);
        const p1TopY = c1y + rad1 * Math.sin(a1Top);
        const p2TopX = c2x + rad2 * Math.cos(a2Top);
        const p2TopY = c2y + rad2 * Math.sin(a2Top);

        const p1BotX = c1x + rad1 * Math.cos(a1Bot);
        const p1BotY = c1y + rad1 * Math.sin(a1Bot);
        const p2BotX = c2x + rad2 * Math.cos(a2Bot);
        const p2BotY = c2y + rad2 * Math.sin(a2Bot);

        // Top strand
        ctx.beginPath();
        ctx.moveTo(p1TopX, p1TopY);
        ctx.lineTo(p2TopX, p2TopY);
        ctx.stroke();

        // Bottom strand
        ctx.beginPath();
        ctx.moveTo(p1BotX, p1BotY);
        ctx.lineTo(p2BotX, p2BotY);
        ctx.stroke();

        // Inner dashed highlight to show moving belt texture
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.6;
        ctx.setLineDash([6, 6]);
        const beltDashOffset = -(angle1 * rad1) % 12;
        ctx.lineDashOffset = beltDashOffset;

        ctx.beginPath();
        ctx.moveTo(p1TopX, p1TopY);
        ctx.lineTo(p2TopX, p2TopY);
        ctx.moveTo(p2BotX, p2BotY);
        ctx.lineTo(p1BotX, p1BotY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Outer arc wrapping on pulley 1 and pulley 2
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 4.0;
        ctx.beginPath();
        ctx.arc(c1x, c1y, rad1, a1Bot, a1Top, false);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(c2x, c2y, rad2, a2Top, a2Bot, false);
        ctx.stroke();

        // Tangential velocity vector arrow on top strand
        if (showVectors) {
          const midX = (p1TopX + p2TopX) / 2;
          const midY = (p1TopY + p2TopY) / 2;
          const arrowLen = Math.max(20, Math.min(48, beltSpeed * 4));
          const strandAngle = Math.atan2(p2TopY - p1TopY, p2TopX - p1TopX);

          ctx.save();
          ctx.strokeStyle = '#10b981';
          ctx.fillStyle = '#10b981';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(midX - (arrowLen / 2) * Math.cos(strandAngle), midY - (arrowLen / 2) * Math.sin(strandAngle));
          const tipX = midX + (arrowLen / 2) * Math.cos(strandAngle);
          const tipY = midY + (arrowLen / 2) * Math.sin(strandAngle);
          ctx.lineTo(tipX, tipY);
          ctx.stroke();

          // Arrowhead
          ctx.beginPath();
          ctx.moveTo(tipX, tipY);
          ctx.lineTo(tipX - 7 * Math.cos(strandAngle - Math.PI / 6), tipY - 7 * Math.sin(strandAngle - Math.PI / 6));
          ctx.lineTo(tipX - 7 * Math.cos(strandAngle + Math.PI / 6), tipY - 7 * Math.sin(strandAngle + Math.PI / 6));
          ctx.closePath();
          ctx.fill();

          ctx.font = '700 8.5px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(`v_faja = ${beltSpeed.toFixed(2)} m/s`, midX, midY - 6);
          ctx.restore();
        }
      } else {
        // Crossed belt: tangents cross between the two pulleys
        const sinBeta = Math.max(-1, Math.min(1, (rad1 + rad2) / dist));
        const beta = Math.asin(sinBeta);

        const a1Top = baseAngle + Math.PI / 2 - beta;
        const a2Bot = baseAngle - Math.PI / 2 - beta;
        const a1Bot = baseAngle - Math.PI / 2 + beta;
        const a2Top = baseAngle + Math.PI / 2 + beta;

        const p1TopX = c1x + rad1 * Math.cos(a1Top);
        const p1TopY = c1y + rad1 * Math.sin(a1Top);
        const p2BotX = c2x + rad2 * Math.cos(a2Bot);
        const p2BotY = c2y + rad2 * Math.sin(a2Bot);

        const p1BotX = c1x + rad1 * Math.cos(a1Bot);
        const p1BotY = c1y + rad1 * Math.sin(a1Bot);
        const p2TopX = c2x + rad2 * Math.cos(a2Top);
        const p2TopY = c2y + rad2 * Math.sin(a2Top);

        ctx.beginPath();
        ctx.moveTo(p1TopX, p1TopY);
        ctx.lineTo(p2BotX, p2BotY);
        ctx.moveTo(p1BotX, p1BotY);
        ctx.lineTo(p2TopX, p2TopY);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(c1x, c1y, rad1, a1Bot, a1Top, false);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(c2x, c2y, rad2, a2Bot, a2Top, false);
        ctx.stroke();
      }
      ctx.restore();
    };

    // Now render based on configuration:
    if (config === 'concentric') {
      // Configuration 1: Two concentric pulleys on the same axle
      const cx = x + width / 2;
      const cy = y + height / 2;
      const radOuter = Math.min(width, height) * 0.44;
      const radInner = radOuter * Math.min(0.65, Math.max(0.3, r1M / Math.max(0.01, r2M)));

      // Outer pulley
      drawPulleyWheel(cx, cy, radOuter, angle1, `Disco B (r₂ = ${r2M}m)`, '#2563eb', omega1);
      // Inner pulley on same axle
      drawPulleyWheel(cx, cy, radInner, angle1, `Disco A (r₁ = ${r1M}m)`, '#059669', omega1);

      // Tangential velocity vectors on both rims demonstrating v2 > v1 with same omega
      if (showVectors) {
        const v1 = Math.abs(omega1) * r1M;
        const v2 = Math.abs(omega1) * r2M;
        // Vector on inner rim (at top)
        ctx.save();
        ctx.strokeStyle = '#10b981';
        ctx.fillStyle = '#10b981';
        ctx.lineWidth = 2.0;
        const v1Len = Math.max(16, Math.min(50, v1 * 40));
        ctx.beginPath();
        ctx.moveTo(cx, cy - radInner);
        ctx.lineTo(cx + v1Len, cy - radInner);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + v1Len, cy - radInner);
        ctx.lineTo(cx + v1Len - 6, cy - radInner - 3);
        ctx.lineTo(cx + v1Len - 6, cy - radInner + 3);
        ctx.closePath();
        ctx.fill();
        ctx.font = '700 8px Inter, sans-serif';
        ctx.fillText(`v₁=${v1.toFixed(2)}m/s`, cx + v1Len / 2, cy - radInner - 4);

        // Vector on outer rim (at top)
        ctx.strokeStyle = '#3b82f6';
        ctx.fillStyle = '#3b82f6';
        ctx.lineWidth = 2.2;
        const v2Len = Math.max(22, Math.min(80, v2 * 40));
        ctx.beginPath();
        ctx.moveTo(cx, cy - radOuter);
        ctx.lineTo(cx + v2Len, cy - radOuter);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + v2Len, cy - radOuter);
        ctx.lineTo(cx + v2Len - 6, cy - radOuter - 3.5);
        ctx.lineTo(cx + v2Len - 6, cy - radOuter + 3.5);
        ctx.closePath();
        ctx.fill();
        ctx.fillText(`v₂=${v2.toFixed(2)}m/s`, cx + v2Len / 2, cy - radOuter - 4);
        ctx.restore();
      }

      // Shaft label badge
      ctx.font = '700 8.5px Inter, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText('Eje Común: ω₁ = ω₂ = cte', cx, cy + radOuter + 22);

    } else if (config === 'concentric_hanging_block') {
      // Configuration 2: Concentric drum with hanging descending block (P2)
      const cx = x + width * 0.42;
      const cy = y + height * 0.42;
      const radOuter = Math.min(width, height) * 0.38;
      const radInner = radOuter * (r1M / Math.max(0.01, r2M));

      // Draw outer drum
      drawPulleyWheel(cx, cy, radOuter, angle1, `Tambor B (RB = ${(r2M * 100).toFixed(0)}cm)`, '#d97706', omega1);
      // Draw inner drum
      drawPulleyWheel(cx, cy, radInner, angle1, `Tambor A (RA = ${(r1M * 100).toFixed(0)}cm)`, '#0284c7', omega1);

      // Cord descending from inner drum
      const tangX = cx + radInner;
      const blockDrop = 55 + (angle1 * 10) % 30;
      const blockY = cy + blockDrop;

      ctx.save();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(tangX, cy);
      ctx.lineTo(tangX, blockY);
      ctx.stroke();

      // Hanging mass block
      const bW = 28;
      const bH = 26;
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(tangX - bW / 2, blockY, bW, bH);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(tangX - bW / 2, blockY, bW, bH);

      // Block descending vector
      ctx.strokeStyle = '#ef4444';
      ctx.fillStyle = '#ef4444';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(tangX, blockY + bH + 2);
      ctx.lineTo(tangX, blockY + bH + 18);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(tangX, blockY + bH + 18);
      ctx.lineTo(tangX - 3.5, blockY + bH + 12);
      ctx.lineTo(tangX + 3.5, blockY + bH + 12);
      ctx.closePath();
      ctx.fill();

      ctx.font = '700 8.5px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`v = ${linearSpeed.toFixed(1)} m/s`, tangX + 6, blockY + bH / 2);
      ctx.restore();

    } else if (config === 'concentric_and_belt') {
      // Configuration 4: A concéntrico con B, y B unido con C por faja (P4)
      const c1x = x + width * 0.28;
      const c1y = y + height * 0.50;
      const c2x = x + width * 0.78;
      const c2y = y + height * 0.50;

      const radA = 52;
      const radB = 34;
      const radC = 44;

      // Draw belt between B and C
      drawBeltTransmission(c1x, c1y, radB, c2x, c2y, radC, linearSpeed);

      // Pulley A and B (concentric at c1)
      drawPulleyWheel(c1x, c1y, radA, angle1, `Polea A (rA=${r1M}m)`, '#0891b2', omega1);
      drawPulleyWheel(c1x, c1y, radB, angle1, `Polea B (rB=${r2M}m)`, '#0284c7', omega1);

      // Pulley C at c2
      drawPulleyWheel(c2x, c2y, radC, angle2, `Polea C (rC=${r3M}m)`, '#10b981', omega2);

    } else if (config === 'belt_and_concentric') {
      // Configuration 5: A y B con faja, B y C concéntricos (P5)
      const c1x = x + width * 0.22;
      const c1y = y + height * 0.50;
      const c2x = x + width * 0.72;
      const c2y = y + height * 0.50;

      const radA = 32;
      const radB = 54;
      const radC = 24;

      // Draw belt between A and B
      drawBeltTransmission(c1x, c1y, radA, c2x, c2y, radB, linearSpeed);

      // Pulley A
      drawPulleyWheel(c1x, c1y, radA, angle1, `Polea A (rA=${r1M}m)`, '#7c3aed', omega1);

      // Pulley B and C (concentric at c2)
      drawPulleyWheel(c2x, c2y, radB, angle2, `Polea B (rB=${r2M}m)`, '#2563eb', omega2);
      drawPulleyWheel(c2x, c2y, radC, angle2, `Polea C (rC=${r3M}m)`, '#10b981', omega2);

    } else if (config === 'compound_train_2stage' || config === 'double_reduction') {
      // Configuration 7 & 8: Compound train 2 stages (d1 -> d2 [shaft] d3 -> d4)
      const c1x = x + width * 0.22;
      const c1y = y + height * 0.50;
      const c2x = x + width * 0.52;
      const c2y = y + height * 0.50;
      const c3x = x + width * 0.82;
      const c3y = y + height * 0.50;

      const rad1 = 28;
      const rad2 = 48;
      const rad3 = 28;
      const rad4 = 48;

      // Belts
      drawBeltTransmission(c1x, c1y, rad1, c2x, c2y, rad2, linearSpeed);
      drawBeltTransmission(c2x, c2y, rad3, c3x, c3y, rad4, linearSpeed * 0.25);

      // Stage 1
      drawPulleyWheel(c1x, c1y, rad1, angle1, `P1 (d1=${(r1M * 2).toFixed(2)}m)`, '#059669', omega1);
      // Stage 2 (Shaft with P2 and P3)
      const omegaIntermediate = omega1 * (rad1 / rad2);
      drawPulleyWheel(c2x, c2y, rad2, angle2, `P2 (d2=${(r2M * 2).toFixed(2)}m)`, '#2563eb', omegaIntermediate);
      drawPulleyWheel(c2x, c2y, rad3, angle2, `P3 (d3=${(r3M * 2).toFixed(2)}m)`, '#0d9488', omegaIntermediate);
      // Stage 3 (P4)
      drawPulleyWheel(c3x, c3y, rad4, angle2 * (rad3 / rad4), `P4 (d4=${(r4M * 2).toFixed(2)}m)`, '#d97706', omega2);

    } else if (config === 'compound_train_3stage') {
      // Configuration 6: 3-stage compound train
      const c1x = x + width * 0.16;
      const c2x = x + width * 0.40;
      const c3x = x + width * 0.64;
      const c4x = x + width * 0.86;
      const cyStage = y + height * 0.50;

      const radD1 = 18;
      const radD2 = 42;
      const radD3 = 24;
      const radD4 = 46;
      const radD5 = 30;
      const radD6 = 50;

      drawBeltTransmission(c1x, cyStage, radD1, c2x, cyStage, radD2, linearSpeed);
      drawBeltTransmission(c2x, cyStage, radD3, c3x, cyStage, radD4, linearSpeed * 0.5);
      drawBeltTransmission(c3x, cyStage, radD5, c4x, cyStage, radD6, linearSpeed * 0.25);

      drawPulleyWheel(c1x, cyStage, radD1, angle1, 'D1 (10mm)', '#db2777', omega1);
      drawPulleyWheel(c2x, cyStage, radD2, angle2, 'D2 (40mm)', '#2563eb', omega1 * 0.25);
      drawPulleyWheel(c2x, cyStage, radD3, angle2, 'D3 (20mm)', '#0d9488', omega1 * 0.25);
      drawPulleyWheel(c3x, cyStage, radD4, angle2 * 0.4, 'D4 (50mm)', '#059669', omega1 * 0.10);
      drawPulleyWheel(c3x, cyStage, radD5, angle2 * 0.4, 'D5 (30mm)', '#d97706', omega1 * 0.10);
      drawPulleyWheel(c4x, cyStage, radD6, angle2 * 0.2, 'D6 (60mm)', '#7c3aed', omega2);

    } else {
      // Standard Belt Transmission (P3, P9, etc.)
      const c1x = x + width * 0.28;
      const c1y = y + height * 0.50;
      const c2x = x + width * 0.72;
      const c2y = y + height * 0.50;

      const rad1 = Math.max(24, Math.min(68, width * 0.18 * (r1M / 0.15)));
      const rad2 = Math.max(20, Math.min(68, width * 0.18 * (r2M / 0.15)));

      if (showBelt) {
        drawBeltTransmission(c1x, c1y, rad1, c2x, c2y, rad2, linearSpeed, isBeltCrossed);
      }

      drawPulleyWheel(c1x, c1y, rad1, angle1, `Polea Motriz (r₁=${r1M}m)`, '#16a34a', omega1);
      drawPulleyWheel(c2x, c2y, rad2, angle2, `Polea Conducida (r₂=${r2M}m)`, '#0284c7', omega2);
    }

    // Digital Telemetry Badge at Bottom of Assembly
    if (props.showTelemetry !== false) {
      const badgeW = 260;
      const badgeH = 22;
      const badgeX = x + width / 2 - badgeW / 2;
      const badgeY = y + height + 6;

      ctx.save();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 5);
      ctx.fill();
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.font = '700 8.5px monospace, sans-serif';
      ctx.fillStyle = '#34d399';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const rpm1Val = (Math.abs(omega1) * 60) / (2 * Math.PI);
      const rpm2Val = (Math.abs(omega2) * 60) / (2 * Math.PI);
      ctx.fillText(`N₁=${rpm1Val.toFixed(0)} RPM | N₂=${rpm2Val.toFixed(0)} RPM | v=${linearSpeed.toFixed(2)} m/s`, x + width / 2, badgeY + badgeH / 2);
      ctx.restore();
    }

    // Selection Box & Anchors
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

    ctx.restore();
  } else if (el.physicsType === 'dcl_diagram') {
    const { x, y, width, height } = el;
    const props = el.properties || {};

    // -------------------------------------------------------------------------
    // Dedicated Physical Apparatus Renderers with Overlaid DCLs (en cima del dibujo)
    // -------------------------------------------------------------------------
    if (props.apparatusType === 'table_three_masses') {
      drawTableThreeMassesDcl(ctx, el, isSelected);
      ctx.restore();
      return;
    }
    if (props.apparatusType === 'table_two_masses') {
      drawTableTwoMassesDcl(ctx, el, isSelected);
      ctx.restore();
      return;
    }

    const cx = x + width / 2;
    const cy = y + height / 2;
    const axisAngleRad = ((props.axisAngleDeg || 0) * Math.PI) / 180;
    const forces = Array.isArray(props.userVectors) && props.userVectors.length > 0
      ? props.userVectors
      : (Array.isArray(props.forces) ? props.forces : []);
    const showComponents = props.showComponents !== false;
    const showEquations = props.showEquations !== false;
    const showGrid = props.showGrid !== false;
    const bodyName = props.bodyName || 'Cuerpo DCL';
    const axisLength = Math.min(width, height) * 0.40;

    ctx.save();

    // 1. Soft Blueprint / Card Background Container (Translucent so whiteboard grid passes through)
    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
    ctx.shadowBlur = isSelected ? 16 : 8;
    ctx.shadowOffsetY = 3;

    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 12);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fill();

    ctx.strokeStyle = isSelected ? '#4262ff' : 'rgba(203, 213, 225, 0.85)';
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    ctx.stroke();
    ctx.restore();

    // Subtle Cartesian Background Grid
    if (showGrid) {
      ctx.save();
      ctx.strokeStyle = 'rgba(241, 245, 249, 0.8)';
      ctx.lineWidth = 1;
      const step = 20;
      for (let gx = x + step; gx < x + width; gx += step) {
        ctx.beginPath();
        ctx.moveTo(gx, y + 8);
        ctx.lineTo(gx, y + height - 8);
        ctx.stroke();
      }
      for (let gy = y + step; gy < y + height; gy += step) {
        ctx.beginPath();
        ctx.moveTo(x + 8, gy);
        ctx.lineTo(x + width - 8, gy);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Header Pill: Body Name & Angle
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x + 10, y + 8, width - 20, 22, 6);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '700 10.5px Inter, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`📐 DCL: ${bodyName}`, x + 16, y + 19);

    if (props.axisAngleDeg) {
      ctx.font = '600 9px monospace, sans-serif';
      ctx.fillStyle = '#ea580c';
      ctx.textAlign = 'right';
      ctx.fillText(`θ = ${props.axisAngleDeg}°`, x + width - 16, y + 19);
    }
    ctx.restore();

    // 2. Cartesian Axes (Standard or Rotated by axisAngleRad)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(axisAngleRad);

    // X Axis line
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(-axisLength, 0);
    ctx.lineTo(axisLength, 0);
    ctx.stroke();

    // Y Axis line
    ctx.beginPath();
    ctx.moveTo(0, axisLength);
    ctx.lineTo(0, -axisLength);
    ctx.stroke();
    ctx.setLineDash([]);

    // Axis Arrows
    const drawAxisArrow = (ax, ay, angle, labelText) => {
      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(angle);
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-7, -4);
      ctx.lineTo(-7, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.font = '700 9.5px monospace, sans-serif';
      ctx.fillStyle = '#475569';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const offset = 12;
      const lx = ax + Math.cos(angle) * offset;
      const ly = ay + Math.sin(angle) * offset;
      ctx.fillText(labelText, lx, ly);
      ctx.restore();
    };

    drawAxisArrow(axisLength, 0, 0, '+X');
    drawAxisArrow(-axisLength, 0, Math.PI, '-X');
    drawAxisArrow(0, -axisLength, -Math.PI / 2, '+Y');
    drawAxisArrow(0, axisLength, Math.PI / 2, '-Y');

    // Central Mass Body Indicator
    ctx.beginPath();
    ctx.roundRect(-14, -14, 28, 28, 4);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Center Origin Dot
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    // 3. Force Vectors with Color-coding, Arrows & Components
    forces.forEach((f) => {
      const fAngleRad = ((f.angleDeg !== undefined ? f.angleDeg : 0) * Math.PI) / 180;
      const fLen = Math.min(axisLength * 0.90, Math.max(34, (f.magnitude || 50) * 0.75));
      const vx = fLen * Math.cos(fAngleRad);
      const vy = -fLen * Math.sin(fAngleRad);

      const fColor = f.color || (
        f.type === 'weight' ? '#ef4444' :
        f.type === 'normal' ? '#3b82f6' :
        f.type === 'tension' ? '#10b981' :
        f.type === 'friction' ? '#f59e0b' : '#8b5cf6'
      );

      // Dashed rectangular component projections if not parallel to an axis
      const isCardinallyAligned = Math.abs(vx) < 3 || Math.abs(vy) < 3;
      if (showComponents && !isCardinallyAligned) {
        ctx.save();
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.40)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);

        ctx.beginPath();
        ctx.moveTo(vx, vy);
        ctx.lineTo(vx, 0);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(vx, vy);
        ctx.lineTo(0, vy);
        ctx.stroke();
        ctx.restore();
      }

      // Draw Main Vector Line
      ctx.save();
      ctx.strokeStyle = fColor;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(vx, vy);
      ctx.stroke();
      ctx.restore();

      // Draw Arrowhead
      const headAngle = Math.atan2(vy, vx);
      ctx.save();
      ctx.translate(vx, vy);
      ctx.rotate(headAngle);
      ctx.fillStyle = fColor;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-9, -5);
      ctx.lineTo(-7, 0);
      ctx.lineTo(-9, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Vector Label Badge
      ctx.save();
      const labelDist = fLen + 14;
      const lblX = labelDist * Math.cos(fAngleRad);
      const lblY = -labelDist * Math.sin(fAngleRad);

      ctx.font = '700 9.5px Inter, sans-serif';
      const labelText = f.label || f.name || 'F';
      const textMetrics = ctx.measureText(labelText);
      const badgeW = textMetrics.width + 8;
      const badgeH = 15;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(lblX - badgeW / 2, lblY - badgeH / 2, badgeW, badgeH, 4);
      ctx.fill();
      ctx.strokeStyle = fColor;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = fColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // If selected, render tip rotation handle
      if (isSelected) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(vx, vy, 7.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(66, 98, 255, 0.25)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(vx, vy, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = fColor;
        ctx.lineWidth = 2.2;
        ctx.stroke();

        ctx.font = '700 8px monospace, sans-serif';
        ctx.fillStyle = '#475569';
        ctx.fillText(`${Math.round(f.angleDeg || 0)}°`, vx + 8, vy - 6);
        ctx.restore();
      }

      ctx.restore();
    });

    ctx.restore();

    // 4. Floating Equilibrium Equations Pill at Bottom
    if (showEquations && props.equations && props.equations.length > 0) {
      ctx.save();
      const pillW = width - 24;
      const pillH = Math.min(34, props.equations.length * 13 + 6);
      const pillX = x + 12;
      const pillY = y + height - pillH - 6;

      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 5);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = '600 8.5px monospace, sans-serif';
      ctx.fillStyle = '#fed7aa';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const eq1 = props.equations[0] || '';
      const eq2 = props.equations[1] || '';
      if (props.equations.length === 1) {
        ctx.fillText(eq1, cx, pillY + pillH / 2);
      } else {
        ctx.fillText(eq1, cx, pillY + 9);
        ctx.fillText(eq2, cx, pillY + pillH - 9);
      }
      ctx.restore();
    }

    // 5. Selection Box & Anchors
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

    ctx.restore();
  } else if (el.physicsType === 'translational_equilibrium') {
    drawTranslationalEquilibriumApparatus(ctx, el, isSelected);
    ctx.restore();
    return;
  } else if (el.physicsType === 'newton_frictionless_system') {
    drawNewtonFrictionlessApparatus(ctx, el, isSelected);
    ctx.restore();
    return;
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
