// =========================================================================
// STROKE RECOGNITION & GEOMETRIC CLASSIFICATION ENGINE
// Mathematical -recognizer, canonical templates, Greek alphabet & physics shapes
// =========================================================================

// Distance from point (px, py) to line segment (ax, ay) -> (bx, by)
export function distToSegment(px, py, ax, ay, bx, by) {
  const l2 = (bx - ax) * (bx - ax) + (by - ay) * (by - ay);
  if (l2 === 0) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = ax + t * (bx - ax);
  const projY = ay + t * (by - ay);
  return Math.hypot(px - projX, py - projY);
}

// Point in polygon test for lasso selection (ray-casting algorithm)
export function isPointInPolygon(p, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = yi > p.y !== yj > p.y && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Get bounding box of any element
export function getElementBounds(el) {
  if (el.startX !== undefined && el.endX !== undefined) {
    const minX = Math.min(el.startX, el.endX);
    const maxX = Math.max(el.startX, el.endX);
    const minY = Math.min(el.startY, el.endY);
    const maxY = Math.max(el.startY, el.endY);
    return { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
  }
  if (el.type === 'text') {
    const lines = el.text ? el.text.split('\n') : [''];
    const maxLineLen = Math.max(...lines.map((l) => l.length), 1);
    const fontSize = el.fontSize || 18;
    const w = Math.max(50, maxLineLen * fontSize * 0.65);
    const h = Math.max(25, lines.length * fontSize * 1.35);
    return { minX: el.x, maxX: el.x + w, minY: el.y, maxY: el.y + h, w, h, cx: el.x + w / 2, cy: el.y + h / 2 };
  }
  if (el.x !== undefined) {
    const w = el.width || 170;
    const h = el.height || 160;
    return { minX: el.x, maxX: el.x + w, minY: el.y, maxY: el.y + h, w, h, cx: el.x + w / 2, cy: el.y + h / 2 };
  }
  if (el.points && el.points.length > 0) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of el.points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    const w = Math.max(1, maxX - minX);
    const h = Math.max(1, maxY - minY);
    return { minX, maxX, minY, maxY, w, h, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
  }
  return null;
}

// Get combined bounds of a cluster of strokes
export function getClusterBounds(cluster) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  cluster.forEach((s) => {
    const b = s.bounds || getElementBounds(s);
    if (b) {
      if (b.minX < minX) minX = b.minX;
      if (b.maxX > maxX) maxX = b.maxX;
      if (b.minY < minY) minY = b.minY;
      if (b.maxY > maxY) maxY = b.maxY;
    }
  });
  const w = Math.max(1, maxX - minX);
  const h = Math.max(1, maxY - minY);
  return { minX, maxX, minY, maxY, w, h, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
}

// Test if element intersects or is inside a rectangular box
export function isElementInBox(el, box) {
  const b = getElementBounds(el);
  if (!b) return false;
  return !(b.maxX < box.minX || b.minX > box.maxX || b.maxY < box.minY || b.minY > box.maxY);
}

// Test if element is captured inside or touches lasso polygon
export function isElementInLasso(el, polygon) {
  const b = getElementBounds(el);
  if (!b) return false;

  if (isPointInPolygon({ x: b.cx, y: b.cy }, polygon)) return true;

  if (
    isPointInPolygon({ x: b.minX, y: b.minY }, polygon) ||
    isPointInPolygon({ x: b.maxX, y: b.minY }, polygon) ||
    isPointInPolygon({ x: b.minX, y: b.maxY }, polygon) ||
    isPointInPolygon({ x: b.maxX, y: b.maxY }, polygon)
  ) {
    return true;
  }

  if (el.points && el.points.length > 0) {
    for (let i = 0; i < el.points.length; i += Math.max(1, Math.floor(el.points.length / 8))) {
      if (isPointInPolygon(el.points[i], polygon)) return true;
    }
  }

  if (el.startX !== undefined) {
    if (
      isPointInPolygon({ x: el.startX, y: el.startY }, polygon) ||
      isPointInPolygon({ x: el.endX, y: el.endY }, polygon)
    ) {
      return true;
    }
  }

  return false;
}

// =========================================================================
// $1-RECOGNIZER & CANONICAL TRAJECTORY CLASSIFIER FOR DIGITS & MATH
// =========================================================================

// Resample stroke points to exactly N equidistant points along arc length
export function resampleStroke(pts, n = 32) {
  if (!pts || pts.length === 0) return [];
  if (pts.length === 1) return Array(n).fill({ x: pts[0].x, y: pts[0].y });

  let totalLength = 0;
  for (let i = 1; i < pts.length; i++) {
    totalLength += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  if (totalLength < 0.001) return Array(n).fill({ x: pts[0].x, y: pts[0].y });

  const interval = totalLength / (n - 1);
  const resampled = [{ x: pts[0].x, y: pts[0].y }];
  let currentDist = 0;
  let segIdx = 1;
  let prevPt = pts[0];
  let distToNext = Math.hypot(pts[1].x - prevPt.x, pts[1].y - prevPt.y);

  for (let i = 1; i < n - 1; i++) {
    const targetDist = i * interval;
    while (currentDist + distToNext < targetDist && segIdx < pts.length - 1) {
      currentDist += distToNext;
      prevPt = pts[segIdx];
      segIdx++;
      distToNext = Math.hypot(pts[segIdx].x - prevPt.x, pts[segIdx].y - prevPt.y);
    }
    const remain = targetDist - currentDist;
    const t = distToNext > 0 ? Math.min(1, Math.max(0, remain / distToNext)) : 0;
    resampled.push({
      x: prevPt.x + t * (pts[segIdx].x - prevPt.x),
      y: prevPt.y + t * (pts[segIdx].y - prevPt.y),
    });
  }
  resampled.push({ x: pts[pts.length - 1].x, y: pts[pts.length - 1].y });
  return resampled;
}

// Normalize points to standard [0, 100] x [0, 100] box
export function normalizePoints(pts) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const w = Math.max(1, maxX - minX);
  const h = Math.max(1, maxY - minY);
  return {
    normalized: pts.map((p) => ({
      x: ((p.x - minX) / w) * 100,
      y: ((p.y - minY) / h) * 100,
    })),
    w,
    h,
    aspectRatio: w / h,
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
  };
}

// Average Euclidean distance between two 32-point paths
export function pathDistance(pts1, pts2) {
  let d = 0;
  for (let i = 0; i < pts1.length; i++) {
    d += Math.hypot(pts1[i].x - pts2[i].x, pts1[i].y - pts2[i].y);
  }
  return d / pts1.length;
}

// Helper to make normalized 32-point canonical template
export function makeTemplate(keyframes) {
  const norm = normalizePoints(keyframes).normalized;
  return resampleStroke(norm, 32);
}

// Master Prototypes for Digits 0-9, Math Symbols, Greek Letters and Variables
export const CANONICAL_TEMPLATES = [
  // Digit 3 (Rounded top - matches user's handwriting)
  {
    char: '3',
    points: makeTemplate([
      { x: 20, y: 15 },
      { x: 55, y: 10 },
      { x: 85, y: 25 },
      { x: 75, y: 40 },
      { x: 40, y: 50 },
      { x: 75, y: 60 },
      { x: 88, y: 75 },
      { x: 60, y: 95 },
      { x: 20, y: 90 },
    ]),
  },
  // Digit 3 (Flat top)
  {
    char: '3',
    points: makeTemplate([
      { x: 15, y: 15 },
      { x: 85, y: 15 },
      { x: 45, y: 48 },
      { x: 85, y: 65 },
      { x: 85, y: 80 },
      { x: 50, y: 95 },
      { x: 15, y: 90 },
    ]),
  },
  // Variable 'y' (Single stroke cursive cup + hooked descender tail - matches handwritten y)
  {
    char: 'y',
    points: makeTemplate([
      { x: 20, y: 15 },
      { x: 25, y: 55 },
      { x: 50, y: 65 },
      { x: 75, y: 55 },
      { x: 80, y: 15 },
      { x: 78, y: 65 },
      { x: 65, y: 95 },
      { x: 35, y: 95 },
    ]),
  },
  // Variable 'y' (Single stroke cursive cup + straight descender tail)
  {
    char: 'y',
    points: makeTemplate([
      { x: 20, y: 15 },
      { x: 30, y: 50 },
      { x: 50, y: 60 },
      { x: 75, y: 50 },
      { x: 80, y: 15 },
      { x: 75, y: 60 },
      { x: 50, y: 95 },
    ]),
  },
  // Variable 'y' (Single stroke wide rounded cup)
  {
    char: 'y',
    points: makeTemplate([
      { x: 20, y: 20 },
      { x: 20, y: 55 },
      { x: 50, y: 65 },
      { x: 80, y: 55 },
      { x: 80, y: 20 },
      { x: 75, y: 70 },
      { x: 40, y: 95 },
    ]),
  },
  // Variable 'y' (Single stroke V + tail)
  {
    char: 'y',
    points: makeTemplate([
      { x: 20, y: 15 },
      { x: 50, y: 55 },
      { x: 80, y: 15 },
      { x: 50, y: 55 },
      { x: 40, y: 95 },
    ]),
  },
  // Variable 'y' (Single stroke printed diagonal V-tail)
  {
    char: 'y',
    points: makeTemplate([
      { x: 20, y: 20 },
      { x: 50, y: 55 },
      { x: 80, y: 20 },
      { x: 30, y: 95 },
    ]),
  },
  // Uppercase 'Y' (Top-left to center, top-right to center, straight stem down)
  {
    char: 'y',
    points: makeTemplate([
      { x: 15, y: 15 },
      { x: 50, y: 50 },
      { x: 85, y: 15 },
      { x: 50, y: 50 },
      { x: 50, y: 95 },
    ]),
  },
  // Uppercase 'Y' (Bottom stem up, left arm, right arm)
  {
    char: 'y',
    points: makeTemplate([
      { x: 50, y: 95 },
      { x: 50, y: 50 },
      { x: 15, y: 15 },
      { x: 50, y: 50 },
      { x: 85, y: 15 },
    ]),
  },
  // ---------------------------------------------------------------------------
  // GREEK LETTERS CANONICAL TEMPLATES (Sigma, Theta, Alpha, Beta, etc.)
  // ---------------------------------------------------------------------------
  // Greek Sigma 'Σ' (Capital Sigma - Top-to-bottom standard)
  {
    char: 'Σ',
    points: makeTemplate([
      { x: 85, y: 15 },
      { x: 20, y: 15 },
      { x: 55, y: 50 },
      { x: 20, y: 85 },
      { x: 85, y: 85 },
    ]),
  },
  // Greek Sigma 'Σ' (Capital Sigma - Bottom-to-top)
  {
    char: 'Σ',
    points: makeTemplate([
      { x: 85, y: 85 },
      { x: 20, y: 85 },
      { x: 55, y: 50 },
      { x: 20, y: 15 },
      { x: 85, y: 15 },
    ]),
  },
  // Greek Sigma 'Σ' (Capital Sigma - Rounded / Smooth apex)
  {
    char: 'Σ',
    points: makeTemplate([
      { x: 80, y: 18 },
      { x: 28, y: 18 },
      { x: 52, y: 50 },
      { x: 28, y: 82 },
      { x: 80, y: 82 },
    ]),
  },
  // Greek Sigma 'σ' (Lowercase Sigma - ear then loop)
  {
    char: 'σ',
    points: makeTemplate([
      { x: 85, y: 25 },
      { x: 40, y: 25 },
      { x: 15, y: 60 },
      { x: 50, y: 90 },
      { x: 85, y: 60 },
      { x: 40, y: 25 },
    ]),
  },
  // Greek Sigma 'σ' (Lowercase Sigma - loop then ear)
  {
    char: 'σ',
    points: makeTemplate([
      { x: 45, y: 25 },
      { x: 15, y: 60 },
      { x: 50, y: 90 },
      { x: 85, y: 60 },
      { x: 45, y: 25 },
      { x: 88, y: 25 },
    ]),
  },
  // Greek Theta 'θ' (Clockwise loop + middle crossbar)
  {
    char: 'θ',
    points: makeTemplate([
      { x: 50, y: 10 },
      { x: 80, y: 50 },
      { x: 50, y: 90 },
      { x: 20, y: 50 },
      { x: 50, y: 10 },
      { x: 50, y: 50 },
      { x: 20, y: 50 },
      { x: 80, y: 50 },
    ]),
  },
  // Greek Theta 'θ' (Counter-clockwise loop + middle crossbar)
  {
    char: 'θ',
    points: makeTemplate([
      { x: 50, y: 10 },
      { x: 20, y: 50 },
      { x: 50, y: 90 },
      { x: 80, y: 50 },
      { x: 50, y: 10 },
      { x: 20, y: 50 },
      { x: 80, y: 50 },
    ]),
  },
  // Greek Theta 'θ' (Crossbar first, then outer oval)
  {
    char: 'θ',
    points: makeTemplate([
      { x: 20, y: 50 },
      { x: 80, y: 50 },
      { x: 80, y: 25 },
      { x: 50, y: 10 },
      { x: 20, y: 25 },
      { x: 20, y: 75 },
      { x: 50, y: 90 },
      { x: 80, y: 75 },
    ]),
  },
  // Greek Alpha 'α' (Classic fish ribbon - top-right start, tails on right)
  {
    char: 'α',
    points: makeTemplate([
      { x: 85, y: 25 },
      { x: 50, y: 50 },
      { x: 20, y: 75 },
      { x: 15, y: 50 },
      { x: 35, y: 25 },
      { x: 65, y: 50 },
      { x: 85, y: 75 },
    ]),
  },
  // Greek Alpha 'α' (Classic fish ribbon - bottom-right start, tails on right)
  {
    char: 'α',
    points: makeTemplate([
      { x: 85, y: 75 },
      { x: 50, y: 50 },
      { x: 20, y: 25 },
      { x: 15, y: 50 },
      { x: 35, y: 75 },
      { x: 65, y: 50 },
      { x: 85, y: 25 },
    ]),
  },
  // Greek Alpha 'α' (Classic fish ribbon - top-left start, loop on right, tails on left)
  {
    char: 'α',
    points: makeTemplate([
      { x: 20, y: 20 },
      { x: 45, y: 45 },
      { x: 75, y: 60 },
      { x: 85, y: 50 },
      { x: 75, y: 35 },
      { x: 45, y: 45 },
      { x: 25, y: 80 },
    ]),
  },
  // Greek Alpha 'α' (Classic fish ribbon - bottom-left start, loop on right, tails on left)
  {
    char: 'α',
    points: makeTemplate([
      { x: 25, y: 80 },
      { x: 45, y: 45 },
      { x: 75, y: 35 },
      { x: 85, y: 50 },
      { x: 75, y: 60 },
      { x: 45, y: 45 },
      { x: 20, y: 20 },
    ]),
  },
  // Greek Beta 'β' (Upward ascender then 2 rounded loops)
  {
    char: 'β',
    points: makeTemplate([
      { x: 20, y: 95 },
      { x: 20, y: 15 },
      { x: 65, y: 25 },
      { x: 55, y: 50 },
      { x: 20, y: 50 },
      { x: 70, y: 65 },
      { x: 50, y: 90 },
      { x: 20, y: 90 },
    ]),
  },
  // Greek Gamma 'γ' (Lowercase ribbon crossing)
  {
    char: 'γ',
    points: makeTemplate([
      { x: 20, y: 20 },
      { x: 35, y: 50 },
      { x: 50, y: 75 },
      { x: 35, y: 95 },
      { x: 65, y: 95 },
      { x: 50, y: 75 },
      { x: 80, y: 20 },
    ]),
  },
  // Greek Gamma 'Γ' (Capital Gamma - corner)
  {
    char: 'Γ',
    points: makeTemplate([
      { x: 20, y: 90 },
      { x: 20, y: 15 },
      { x: 80, y: 15 },
    ]),
  },
  // Greek Delta 'Δ' (Capital Delta - triangle from apex)
  {
    char: 'Δ',
    points: makeTemplate([
      { x: 50, y: 15 },
      { x: 15, y: 85 },
      { x: 85, y: 85 },
      { x: 50, y: 15 },
    ]),
  },
  // Greek Delta 'Δ' (Capital Delta - triangle from bottom-left)
  {
    char: 'Δ',
    points: makeTemplate([
      { x: 15, y: 85 },
      { x: 50, y: 15 },
      { x: 85, y: 85 },
      { x: 15, y: 85 },
    ]),
  },
  // Greek Delta 'δ' (Lowercase Delta - top curl to circular base)
  {
    char: 'δ',
    points: makeTemplate([
      { x: 40, y: 15 },
      { x: 65, y: 20 },
      { x: 45, y: 45 },
      { x: 20, y: 65 },
      { x: 50, y: 90 },
      { x: 80, y: 70 },
      { x: 45, y: 45 },
    ]),
  },
  // Greek Epsilon 'ε' (Reverse 3 / rounded curve)
  {
    char: 'ε',
    points: makeTemplate([
      { x: 80, y: 20 },
      { x: 40, y: 20 },
      { x: 25, y: 35 },
      { x: 55, y: 50 },
      { x: 25, y: 65 },
      { x: 40, y: 80 },
      { x: 80, y: 80 },
    ]),
  },
  // Greek Lambda 'λ' (Lowercase Lambda - diagonal with branch)
  {
    char: 'λ',
    points: makeTemplate([
      { x: 75, y: 15 },
      { x: 25, y: 90 },
      { x: 45, y: 50 },
      { x: 80, y: 90 },
    ]),
  },
  // Greek Lambda 'Λ' (Capital Lambda - inverted V)
  {
    char: 'Λ',
    points: makeTemplate([
      { x: 20, y: 85 },
      { x: 50, y: 15 },
      { x: 80, y: 85 },
    ]),
  },
  // Greek Mu 'μ' (Left descender then u-cup)
  {
    char: 'μ',
    points: makeTemplate([
      { x: 20, y: 95 },
      { x: 20, y: 40 },
      { x: 35, y: 75 },
      { x: 65, y: 75 },
      { x: 75, y: 40 },
      { x: 75, y: 85 },
    ]),
  },
  // Greek Pi 'π' (Table arch with top overhang)
  {
    char: 'π',
    points: makeTemplate([
      { x: 15, y: 20 },
      { x: 85, y: 20 },
      { x: 35, y: 20 },
      { x: 35, y: 85 },
      { x: 65, y: 20 },
      { x: 65, y: 85 },
    ]),
  },
  // Greek Pi 'π' (Single stroke continuous arch)
  {
    char: 'π',
    points: makeTemplate([
      { x: 25, y: 85 },
      { x: 25, y: 20 },
      { x: 15, y: 20 },
      { x: 85, y: 20 },
      { x: 75, y: 20 },
      { x: 75, y: 85 },
    ]),
  },
  // Greek Rho 'ρ' (Bottom-left descender to top loop)
  {
    char: 'ρ',
    points: makeTemplate([
      { x: 25, y: 95 },
      { x: 25, y: 20 },
      { x: 70, y: 20 },
      { x: 80, y: 45 },
      { x: 55, y: 60 },
      { x: 25, y: 55 },
    ]),
  },
  // Greek Tau 'τ' (Top horizontal bar to stem)
  {
    char: 'τ',
    points: makeTemplate([
      { x: 15, y: 20 },
      { x: 85, y: 20 },
      { x: 50, y: 20 },
      { x: 50, y: 80 },
      { x: 65, y: 85 },
    ]),
  },
  // Greek Phi 'φ' (Circle then vertical stem)
  {
    char: 'φ',
    points: makeTemplate([
      { x: 50, y: 25 },
      { x: 25, y: 50 },
      { x: 50, y: 75 },
      { x: 75, y: 50 },
      { x: 50, y: 25 },
      { x: 50, y: 10 },
      { x: 50, y: 90 },
    ]),
  },
  // Greek Phi 'φ' (Vertical stem then circle)
  {
    char: 'φ',
    points: makeTemplate([
      { x: 50, y: 10 },
      { x: 50, y: 90 },
      { x: 50, y: 50 },
      { x: 75, y: 30 },
      { x: 50, y: 20 },
      { x: 25, y: 40 },
      { x: 50, y: 70 },
    ]),
  },
  // Greek Psi 'ψ' (Trident: U-cup then center stem)
  {
    char: 'ψ',
    points: makeTemplate([
      { x: 20, y: 25 },
      { x: 25, y: 65 },
      { x: 50, y: 75 },
      { x: 75, y: 65 },
      { x: 80, y: 25 },
      { x: 50, y: 75 },
      { x: 50, y: 15 },
      { x: 50, y: 90 },
    ]),
  },
  // Greek Omega 'ω' (Lowercase Omega - double cup)
  {
    char: 'ω',
    points: makeTemplate([
      { x: 20, y: 30 },
      { x: 35, y: 80 },
      { x: 50, y: 50 },
      { x: 65, y: 80 },
      { x: 80, y: 30 },
    ]),
  },
  // Greek Omega 'ω' (Lowercase Omega - cursive curved tips)
  {
    char: 'ω',
    points: makeTemplate([
      { x: 15, y: 40 },
      { x: 25, y: 85 },
      { x: 50, y: 60 },
      { x: 75, y: 85 },
      { x: 85, y: 40 },
    ]),
  },
  // Greek Omega 'Ω' (Capital Omega - Horseshoe with feet)
  {
    char: 'Ω',
    points: makeTemplate([
      { x: 15, y: 85 },
      { x: 35, y: 85 },
      { x: 25, y: 50 },
      { x: 50, y: 15 },
      { x: 75, y: 50 },
      { x: 65, y: 85 },
      { x: 85, y: 85 },
    ]),
  },
  // Square Root '√'
  {
    char: '√',
    points: makeTemplate([
      { x: 15, y: 55 },
      { x: 30, y: 85 },
      { x: 50, y: 15 },
      { x: 90, y: 15 },
    ]),
  },
  // Infinity '∞'
  {
    char: '∞',
    points: makeTemplate([
      { x: 50, y: 50 },
      { x: 25, y: 25 },
      { x: 15, y: 50 },
      { x: 25, y: 75 },
      { x: 50, y: 50 },
      { x: 75, y: 25 },
      { x: 85, y: 50 },
      { x: 75, y: 75 },
      { x: 50, y: 50 },
    ]),
  },
  // Variable 'c'
  {
    char: 'c',
    points: makeTemplate([
      { x: 80, y: 25 },
      { x: 40, y: 20 },
      { x: 20, y: 50 },
      { x: 40, y: 80 },
      { x: 80, y: 75 },
    ]),
  },
  // Variable 'n'
  {
    char: 'n',
    points: makeTemplate([
      { x: 25, y: 85 },
      { x: 25, y: 35 },
      { x: 45, y: 25 },
      { x: 75, y: 35 },
      { x: 75, y: 85 },
    ]),
  },
  // Variable 't'
  {
    char: 't',
    points: makeTemplate([
      { x: 40, y: 15 },
      { x: 40, y: 85 },
      { x: 65, y: 85 },
      { x: 20, y: 35 },
      { x: 65, y: 35 },
    ]),
  },
  // Parenthesis '('
  {
    char: '(',
    points: makeTemplate([
      { x: 75, y: 10 },
      { x: 30, y: 50 },
      { x: 75, y: 90 },
    ]),
  },
  // Parenthesis ')'
  {
    char: ')',
    points: makeTemplate([
      { x: 25, y: 10 },
      { x: 70, y: 50 },
      { x: 25, y: 90 },
    ]),
  },
  // Variable 'x' (Single stroke cross)
  {
    char: 'x',
    points: makeTemplate([
      { x: 20, y: 20 },
      { x: 80, y: 80 },
      { x: 50, y: 50 },
      { x: 80, y: 20 },
      { x: 20, y: 80 },
    ]),
  },
  // Variable 'z'
  {
    char: 'z',
    points: makeTemplate([
      { x: 20, y: 20 },
      { x: 80, y: 20 },
      { x: 25, y: 80 },
      { x: 85, y: 80 },
    ]),
  },
  // Variable 'a'
  {
    char: 'a',
    points: makeTemplate([
      { x: 80, y: 40 },
      { x: 50, y: 25 },
      { x: 20, y: 50 },
      { x: 50, y: 85 },
      { x: 80, y: 65 },
      { x: 80, y: 25 },
      { x: 80, y: 85 },
    ]),
  },
  // Variable 'b'
  {
    char: 'b',
    points: makeTemplate([
      { x: 25, y: 10 },
      { x: 25, y: 85 },
      { x: 55, y: 50 },
      { x: 80, y: 65 },
      { x: 55, y: 85 },
      { x: 25, y: 85 },
    ]),
  },
  // Digit 2 (Standard arched 2)
  {
    char: '2',
    points: makeTemplate([
      { x: 20, y: 30 },
      { x: 50, y: 10 },
      { x: 80, y: 25 },
      { x: 75, y: 50 },
      { x: 20, y: 88 },
      { x: 90, y: 90 },
    ]),
  },
  // Digit 2 (Loop 2)
  {
    char: '2',
    points: makeTemplate([
      { x: 25, y: 30 },
      { x: 50, y: 12 },
      { x: 78, y: 28 },
      { x: 70, y: 50 },
      { x: 35, y: 80 },
      { x: 20, y: 92 },
      { x: 35, y: 90 },
      { x: 85, y: 90 },
    ]),
  },
  // Digit 1 (Straight down)
  {
    char: '1',
    points: makeTemplate([
      { x: 50, y: 5 },
      { x: 50, y: 95 },
    ]),
  },
  // Digit 1 (With top hook)
  {
    char: '1',
    points: makeTemplate([
      { x: 30, y: 25 },
      { x: 50, y: 10 },
      { x: 50, y: 95 },
    ]),
  },
  // Digit 0 (Oval loop)
  {
    char: '0',
    points: makeTemplate([
      { x: 50, y: 10 },
      { x: 18, y: 35 },
      { x: 15, y: 65 },
      { x: 50, y: 90 },
      { x: 85, y: 65 },
      { x: 82, y: 35 },
      { x: 50, y: 10 },
    ]),
  },
  // Digit 4 (Single stroke)
  {
    char: '4',
    points: makeTemplate([
      { x: 70, y: 10 },
      { x: 15, y: 65 },
      { x: 85, y: 65 },
      { x: 70, y: 30 },
      { x: 70, y: 95 },
    ]),
  },
  // Digit 5 (Single stroke)
  {
    char: '5',
    points: makeTemplate([
      { x: 80, y: 15 },
      { x: 25, y: 15 },
      { x: 20, y: 45 },
      { x: 75, y: 45 },
      { x: 85, y: 70 },
      { x: 65, y: 90 },
      { x: 20, y: 88 },
    ]),
  },
  // Digit 6
  {
    char: '6',
    points: makeTemplate([
      { x: 75, y: 15 },
      { x: 35, y: 40 },
      { x: 18, y: 70 },
      { x: 45, y: 92 },
      { x: 82, y: 75 },
      { x: 65, y: 55 },
      { x: 25, y: 68 },
    ]),
  },
  // Digit 7
  {
    char: '7',
    points: makeTemplate([
      { x: 15, y: 15 },
      { x: 85, y: 15 },
      { x: 40, y: 92 },
    ]),
  },
  // Digit 8
  {
    char: '8',
    points: makeTemplate([
      { x: 50, y: 50 },
      { x: 25, y: 28 },
      { x: 50, y: 10 },
      { x: 75, y: 28 },
      { x: 50, y: 50 },
      { x: 25, y: 72 },
      { x: 50, y: 90 },
      { x: 75, y: 72 },
      { x: 50, y: 50 },
    ]),
  },
  // Digit 9
  {
    char: '9',
    points: makeTemplate([
      { x: 50, y: 50 },
      { x: 20, y: 32 },
      { x: 50, y: 10 },
      { x: 80, y: 32 },
      { x: 50, y: 50 },
      { x: 75, y: 70 },
      { x: 70, y: 92 },
    ]),
  },
  // Math Symbol '+' (Single stroke cross)
  {
    char: '+',
    points: makeTemplate([
      { x: 50, y: 10 },
      { x: 50, y: 90 },
      { x: 50, y: 50 },
      { x: 10, y: 50 },
      { x: 90, y: 50 },
    ]),
  },
  // Math Minus '-'
  {
    char: '-',
    points: makeTemplate([
      { x: 15, y: 50 },
      { x: 85, y: 50 },
    ]),
  },
];

// Check stroke orientation regardless of drawing direction
function getStrokeOrientation(s) {
  const pts = s.points;
  if (!pts || pts.length < 2) return { isDiag: false, dir: 0, dx: 0, dy: 0, topPt: { x: 0, y: 0 }, btmPt: { x: 0, y: 0 } };
  let topPt = pts[0], btmPt = pts[0];
  for (const p of pts) {
    if (p.y < topPt.y) topPt = p;
    if (p.y > btmPt.y) btmPt = p;
  }
  const dx = btmPt.x - topPt.x;
  const dy = btmPt.y - topPt.y;
  const isDiag = Math.abs(dx) > 3 && dy > 4;
  return { isDiag, dir: dx > 0 ? 1 : -1, dx, dy, topPt, btmPt };
}

// Check if stroke has a U-cup that climbs upwards (characteristic of 'y')
function hasCupClimbUpwards(pts, norm) {
  const { h } = norm;
  let lowestCupY = -Infinity;
  let lowestCupIdx = -1;
  const searchLimit = Math.floor(pts.length * 0.75);
  for (let i = 1; i < searchLimit; i++) {
    if (pts[i].y > lowestCupY) {
      lowestCupY = pts[i].y;
      lowestCupIdx = i;
    }
  }
  if (lowestCupIdx < 0) return false;

  // Check if stroke climbs significantly back UP towards top-right
  for (let i = lowestCupIdx + 1; i < pts.length; i++) {
    if (pts[i].y < lowestCupY - h * 0.22) {
      return true;
    }
  }
  return false;
}

// Single-stroke digit '2' detector (arch over top, diagonal down-left, horizontal base to bottom-right)
function isSingleStrokeDigit2(pts, norm) {
  if (!pts || pts.length < 5) return false;
  // A '2' never climbs back upwards like a U-cup in 'y'
  if (hasCupClimbUpwards(pts, norm)) return false;
  // NEVER confuse with Greek Sigma (zig-zag with inward apex)!
  if (isSingleStrokeSigma(pts, norm)) return false;

  const pStart = pts[0];
  const pEnd = pts[pts.length - 1];
  const { w, h, cx, cy, aspectRatio } = norm;
  if (aspectRatio < 0.3 || aspectRatio > 2.0) return false;

  // 1. Must reach the upper region (the top arch)
  const reachesTop = pts.some((p) => p.y < cy - h * 0.15);
  const reachesTopRight = pts.some((p) => p.x > cx && p.y < cy);
  if (!reachesTop || !reachesTopRight) return false;

  // 2. Must reach bottom-left before the base
  const reachesBottomLeft = pts.some((p) => p.x < cx - w * 0.05 && p.y > cy);
  if (!reachesBottomLeft) return false;

  // 3. Bottom horizontal base traversing to the right:
  const endInLowerSection = pEnd.y > cy + h * 0.08;
  const endToRight = pEnd.x > cx - w * 0.15;
  if (!endInLowerSection || !endToRight) return false;

  // The base must traverse rightward from bottom-left to bottom-right
  const lowerPts = pts.filter((p) => p.y > cy);
  const minLowerX = Math.min(...lowerPts.map((p) => p.x));
  const hasBaseTraversingRight = (pEnd.x - minLowerX) > w * 0.35;

  return hasBaseTraversingRight;
}

// Single-stroke digit '3' detector (two lobes to the right + inner waist pointing left)
function isSingleStrokeDigit3(pts, norm) {
  if (!pts || pts.length < 5) return false;
  // If stroke climbs back up like a U-cup, it is 'y', NOT 3
  if (hasCupClimbUpwards(pts, norm)) return false;

  const pStart = pts[0];
  const pEnd = pts[pts.length - 1];
  const { w, h, cx, cy, aspectRatio } = norm;
  if (aspectRatio < 0.3 || aspectRatio > 1.6) return false;

  // Start in upper 65%
  if (pStart.y > cy + h * 0.2) return false;

  // Upper lobe bulging right
  const hasUpperRightLobe = pts.some((p) => p.x > cx + w * 0.12 && p.y < cy);
  // Lower lobe bulging right
  const hasLowerRightLobe = pts.some((p) => p.x > cx + w * 0.12 && p.y > cy);
  if (!hasUpperRightLobe || !hasLowerRightLobe) return false;

  // Center waist/cusp: points near cy that indent back left relative to lobes
  const midPoints = pts.filter((p) => Math.abs(p.y - cy) < h * 0.28);
  if (midPoints.length === 0) return false;
  const minMidX = Math.min(...midPoints.map((p) => p.x));
  const maxUpperX = Math.max(...pts.filter((p) => p.y < cy).map((p) => p.x));
  const maxLowerX = Math.max(...pts.filter((p) => p.y > cy).map((p) => p.x));

  const indentsAtWaist = minMidX < maxUpperX - w * 0.08 && minMidX < maxLowerX - w * 0.08;

  // End curves down and to the left (not continuing to the right like 2)
  const endsBottom = pEnd.y > cy + h * 0.08;
  const endsNotFarRight = pEnd.x < cx + w * 0.35;

  return indentsAtWaist && endsBottom && endsNotFarRight;
}

// Single-stroke 'y' detector (lowercase cursive, printed, or uppercase Y)
function isSingleStrokeY(pts, norm) {
  if (!pts || pts.length < 5) return false;
  if (isSingleStrokeDigit3(pts, norm)) return false;
  if (isSingleStrokeDigit2(pts, norm)) return false;

  const pStart = pts[0];
  const pEnd = pts[pts.length - 1];
  const { w, h, cx, cy, aspectRatio } = norm;
  if (aspectRatio < 0.25 || aspectRatio > 1.6) return false;

  // A 'y' starts in the upper 60% of the box (the top of the cup)
  if (pStart.y > cy + h * 0.1) return false;

  // Must not be a closed shape (like 0, 8, o)
  const startEndDist = Math.hypot(pEnd.x - pStart.x, pEnd.y - pStart.y);
  if (startEndDist < Math.max(16, h * 0.18)) return false;

  // End is in lower half (descender tail)
  if (pEnd.y < cy + h * 0.1) return false;

  // Has points on both left and right
  const hasLeft = pts.some((p) => p.x < cx - w * 0.05);
  const hasRight = pts.some((p) => p.x > cx + w * 0.05);
  if (!hasLeft || !hasRight) return false;

  // Must have the cup that climbs upwards before the descender
  return hasCupClimbUpwards(pts, norm);
}

// Single-stroke digit '9' detector (upper loop + descending stem on right side ending at bottom)
function isSingleStrokeDigit9(pts, norm) {
  if (!pts || pts.length < 5) return false;
  // Cannot be Sigma (zig-zag with inward apex)
  if (isSingleStrokeSigma(pts, norm)) return false;
  const pStart = pts[0];
  const pEnd = pts[pts.length - 1];
  const { w, h, cx, cy, aspectRatio } = norm;
  if (aspectRatio < 0.35 || aspectRatio > 1.45) return false;

  // Starts in upper 65%
  if (pStart.y > cy + h * 0.15) return false;

  // Ends in lower half (descending stem)
  if (pEnd.y < cy + h * 0.18) return false;

  // Upper loop: points in top-left and top-right
  const hasTopLeft = pts.some((p) => p.x < cx && p.y < cy);
  const hasTopRight = pts.some((p) => p.x > cx && p.y < cy);
  if (!hasTopLeft || !hasTopRight) return false;

  // Descending stem is on the middle or right half
  const stemNearCenterOrRight = pEnd.x > cx - w * 0.35;

  // Start and end must not be completely closed circle
  const startEndGap = Math.hypot(pEnd.x - pStart.x, pEnd.y - pStart.y);
  if (startEndGap < 10) return false;

  return stemNearCenterOrRight;
}

// Single-stroke digit '0' detector (clean closed loop with hollow interior core)
function isSingleStrokeDigit0(pts, norm) {
  if (!pts || pts.length < 6) return false;
  const { w, h, cx, cy, aspectRatio } = norm;
  if (aspectRatio < 0.45 || aspectRatio > 1.5) return false;

  const pStart = pts[0];
  const pEnd = pts[pts.length - 1];
  const startEndDist = Math.hypot(pEnd.x - pStart.x, pEnd.y - pStart.y);
  if (startEndDist > Math.max(26, Math.hypot(w, h) * 0.36)) return false;

  const hasTL = pts.some((p) => p.x < cx && p.y < cy);
  const hasTR = pts.some((p) => p.x > cx && p.y < cy);
  const hasBL = pts.some((p) => p.x < cx && p.y > cy);
  const hasBR = pts.some((p) => p.x > cx && p.y > cy);
  if (!hasTL || !hasTR || !hasBL || !hasBR) return false;

  // Hollow center: no points traversing through central core (distinguishes from Theta 'θ')
  const corePts = pts.filter((p) => Math.abs(p.x - cx) < w * 0.18 && Math.abs(p.y - cy) < h * 0.18);
  return corePts.length <= 1;
}

// Single-stroke digit '7' detector (top horizontal bar + diagonal down-left)
function isSingleStrokeDigit7(pts, norm) {
  if (!pts || pts.length < 4) return false;
  const pStart = pts[0];
  const pEnd = pts[pts.length - 1];
  const { w, h, cx, cy, aspectRatio } = norm;
  if (aspectRatio < 0.35 || aspectRatio > 1.3) return false;

  if (pStart.y > cy - h * 0.15 || pStart.x > cx + w * 0.15) return false;

  const reachesTopRight = pts.some((p) => p.x > cx + w * 0.15 && p.y < cy - h * 0.1);
  if (!reachesTopRight) return false;

  const endsBottomLeft = pEnd.y > cy + h * 0.2 && pEnd.x < cx + w * 0.1;
  if (!endsBottomLeft) return false;

  const hasLowerRight = pts.some((p) => p.x > cx + w * 0.15 && p.y > cy + h * 0.15);
  return !hasLowerRight;
}

// Single-stroke digit '6' detector (arch from top down into lower closed loop)
function isSingleStrokeDigit6(pts, norm) {
  if (!pts || pts.length < 6) return false;
  const pStart = pts[0];
  const pEnd = pts[pts.length - 1];
  const { w, h, cx, cy, aspectRatio } = norm;
  if (aspectRatio < 0.35 || aspectRatio > 1.4) return false;

  if (pStart.y > cy - h * 0.1) return false;

  const reachesFarLeft = pts.some((p) => p.x < cx - w * 0.15);
  if (!reachesFarLeft) return false;

  const hasBottomLoop =
    pts.some((p) => p.y > cy && p.x < cx) &&
    pts.some((p) => p.y > cy && p.x > cx);
  if (!hasBottomLoop) return false;

  const endInMiddle = Math.abs(pEnd.y - (cy + h * 0.1)) < h * 0.28 && Math.abs(pEnd.x - cx) < w * 0.35;
  return endInMiddle;
}

// Single-stroke digit '8' detector (crossings with upper and lower loops)
function isSingleStrokeDigit8(pts, norm) {
  if (!pts || pts.length < 8) return false;
  const { w, h, cx, cy, aspectRatio } = norm;
  if (aspectRatio < 0.35 || aspectRatio > 1.3) return false;

  const pStart = pts[0];
  const pEnd = pts[pts.length - 1];
  const startEndDist = Math.hypot(pEnd.x - pStart.x, pEnd.y - pStart.y);
  if (startEndDist > Math.max(30, h * 0.4)) return false;

  const hasTL = pts.some((p) => p.x < cx && p.y < cy);
  const hasTR = pts.some((p) => p.x > cx && p.y < cy);
  const hasBL = pts.some((p) => p.x < cx && p.y > cy);
  const hasBR = pts.some((p) => p.x > cx && p.y > cy);
  if (!hasTL || !hasTR || !hasBL || !hasBR) return false;

  const centerPts = pts.filter((p) => Math.abs(p.x - cx) < w * 0.22 && Math.abs(p.y - cy) < h * 0.22);
  return centerPts.length >= 2;
}

// ===========================================================================
// HIGH-PRECISION GREEK LETTER GEOMETRIC DETECTORS
// ===========================================================================

// 1. Greek Capital Sigma 'Σ' (Single stroke 4-segment zig-zag: top-right -> top-left -> center apex -> bottom-left -> bottom-right)
function isSingleStrokeSigma(pts, norm) {
  if (!pts || pts.length < 5) return false;
  const pStart = pts[0];
  const pEnd = pts[pts.length - 1];
  const { w, h, cx, cy } = norm;

  // Both endpoints must be on the right half (start and end horizontal arms)
  const startOnRight = pStart.x > cx - w * 0.15;
  const endOnRight = pEnd.x > cx - w * 0.15;
  if (!startOnRight || !endOnRight) return false;

  // One endpoint near top, one near bottom
  const hasTopEnd = pStart.y < cy - h * 0.15 || pEnd.y < cy - h * 0.15;
  const hasBottomEnd = pStart.y > cy + h * 0.15 || pEnd.y > cy + h * 0.15;
  if (!hasTopEnd || !hasBottomEnd) return false;

  // Significant vertical distance between open arms
  const tailGap = Math.hypot(pEnd.x - pStart.x, pEnd.y - pStart.y);
  if (tailGap < h * 0.35) return false;

  // Reaches left at the top and bottom corners
  const reachesLeftTop = pts.some((p) => p.x < cx - w * 0.15 && p.y < cy);
  const reachesLeftBottom = pts.some((p) => p.x < cx - w * 0.15 && p.y > cy);
  if (!reachesLeftTop || !reachesLeftBottom) return false;

  // Center apex points towards the right (inward angle '<' in mid section)
  // Crucially, in Sigma, at mid-height the stroke is on the right, NOT on the far left!
  const midHeightPts = pts.filter((p) => Math.abs(p.y - cy) < h * 0.25);
  const hasRightApex = midHeightPts.some((p) => p.x > cx - w * 0.05);
  const reachesFarLeftAtMid = midHeightPts.some((p) => p.x < cx - w * 0.25);
  if (!hasRightApex || reachesFarLeftAtMid) return false;

  return true;
}

// Helper for polyline self-intersection
function segmentsIntersect(p1, p2, p3, p4) {
  function ccw(a, b, c) {
    return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
  }
  return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
}

function findSelfIntersection(pts) {
  const step = Math.max(1, Math.floor(pts.length / 24));
  const sampled = [];
  for (let i = 0; i < pts.length; i += step) sampled.push(pts[i]);
  if (sampled[sampled.length - 1] !== pts[pts.length - 1]) sampled.push(pts[pts.length - 1]);

  for (let i = 0; i < sampled.length - 2; i++) {
    for (let j = i + 2; j < sampled.length - 1; j++) {
      if (i === 0 && j === sampled.length - 2) continue;
      if (segmentsIntersect(sampled[i], sampled[i + 1], sampled[j], sampled[j + 1])) {
        return {
          x: (sampled[i].x + sampled[i + 1].x + sampled[j].x + sampled[j + 1].x) / 4,
          y: (sampled[i].y + sampled[i + 1].y + sampled[j].y + sampled[j + 1].y) / 4,
        };
      }
    }
  }
  return null;
}

// 2. Greek Alpha 'α' (Single stroke fish ribbon: support BOTH tails-on-left and tails-on-right!)
function isSingleStrokeAlpha(pts, norm) {
  if (!pts || pts.length < 5) return false;
  // NEVER confuse with Digit 2, 3, or Sigma!
  if (isSingleStrokeDigit2(pts, norm)) return false;
  if (isSingleStrokeDigit3(pts, norm)) return false;
  if (isSingleStrokeSigma(pts, norm)) return false;

  const pStart = pts[0];
  const pEnd = pts[pts.length - 1];
  const { w, h, cx, cy } = norm;

  // Significant vertical distance between start and end (two open tails)
  const tailGap = Math.hypot(pEnd.x - pStart.x, pEnd.y - pStart.y);
  if (tailGap < h * 0.2) return false;

  const tailsSeparatedY = (pStart.y < cy && pEnd.y > cy) || (pStart.y > cy && pEnd.y < cy);

  // Case A: Tails on Left, Loop on Right (EXACTLY like user's drawing in Image 1!)
  const tailsOnLeft = pStart.x < cx + w * 0.15 && pEnd.x < cx + w * 0.15;
  const loopOnRight = pts.some((p) => p.x > cx + w * 0.22);
  const reachesTopRight = pts.some((p) => p.x > cx && p.y < cy);
  const reachesBtmRight = pts.some((p) => p.x > cx && p.y > cy);
  if (tailsOnLeft && tailsSeparatedY && loopOnRight && reachesTopRight && reachesBtmRight) {
    return true;
  }

  // Case B: Tails on Right, Loop on Left (classic opposite orientation)
  const tailsOnRight = pStart.x > cx - w * 0.15 && pEnd.x > cx - w * 0.15;
  const loopOnLeft = pts.some((p) => p.x < cx - w * 0.22);
  const reachesTopLeft = pts.some((p) => p.x < cx && p.y < cy);
  const reachesBtmLeft = pts.some((p) => p.x < cx && p.y > cy);
  // Loop on left MUST reach the far left at mid-height (unlike Sigma where it's open between corners)
  const midHeightPts = pts.filter((p) => Math.abs(p.y - cy) < h * 0.25);
  const reachesFarLeftAtMid = midHeightPts.some((p) => p.x < cx - w * 0.22);

  if (tailsOnRight && tailsSeparatedY && loopOnLeft && reachesTopLeft && reachesBtmLeft && reachesFarLeftAtMid) {
    return true;
  }

  // Case C: Check via geometric self-intersection
  const intersection = findSelfIntersection(pts);
  if (intersection) {
    const ix = intersection.x;
    // Tails on left of intersection, loop on right
    if (pStart.x < ix && pEnd.x < ix && loopOnRight && tailsSeparatedY) {
      return true;
    }
    // Tails on right of intersection, loop on left
    if (pStart.x > ix && pEnd.x > ix && loopOnLeft && tailsSeparatedY) {
      return true;
    }
  }

  return false;
}

// 3. Greek Theta 'θ' (Single stroke: perimeter loop + central horizontal crossing, NEVER an alpha, pi, or zero)
function isSingleStrokeTheta(pts, norm) {
  if (!pts || pts.length < 6) return false;
  const { w, h, cx, cy, aspectRatio } = norm;
  if (aspectRatio < 0.55 || aspectRatio > 1.65) return false;

  // Cannot be digit 0, 2, 3, or alpha
  if (isSingleStrokeDigit0(pts, norm)) return false;
  if (isSingleStrokeDigit2(pts, norm)) return false;
  if (isSingleStrokeDigit3(pts, norm)) return false;
  if (isSingleStrokeAlpha(pts, norm)) return false;

  const pStart = pts[0];
  const pEnd = pts[pts.length - 1];

  // If endpoints are two open legs at the bottom, it's Pi (π) or capital Omega (Ω), NOT Theta!
  const bothAtBottom = pStart.y > cy + h * 0.08 && pEnd.y > cy + h * 0.08;
  const legsSeparatedX = Math.abs(pStart.x - pEnd.x) > w * 0.25;
  if (bothAtBottom && legsSeparatedX) {
    return false;
  }

  const tailGap = Math.hypot(pEnd.x - pStart.x, pEnd.y - pStart.y);

  // If endpoints are two open tails on one side, it's an alpha/x/k, not theta!
  const bothOnLeft = pStart.x < cx - w * 0.08 && pEnd.x < cx - w * 0.08;
  const bothOnRight = pStart.x > cx + w * 0.08 && pEnd.x > cx + w * 0.08;
  const tailsSeparatedY = Math.abs(pStart.y - pEnd.y) > h * 0.22;
  if ((bothOnLeft || bothOnRight) && tailsSeparatedY && tailGap > h * 0.25) {
    return false;
  }

  // Must have points in all 4 quadrants (loop perimeter)
  const hasTL = pts.some((p) => p.x < cx && p.y < cy);
  const hasTR = pts.some((p) => p.x > cx && p.y < cy);
  const hasBL = pts.some((p) => p.x < cx && p.y > cy);
  const hasBR = pts.some((p) => p.x > cx && p.y > cy);
  if (!hasTL || !hasTR || !hasBL || !hasBR) return false;

  // Theta must have a continuous bottom arc connecting left and right
  const hasBottomArc = pts.some((p) => Math.abs(p.x - cx) < w * 0.25 && p.y > cy + h * 0.25);
  if (!hasBottomArc) return false; // Pi has empty space at bottom center

  // Central horizontal crossing: passes through the middle/upper region
  const hasCrossingNearCenter = pts.some((p) => Math.abs(p.x - cx) < w * 0.25 && Math.abs(p.y - cy) < h * 0.35);
  if (!hasCrossingNearCenter) return false;

  // Has horizontal crossing traversal near the vertical center/upper area (|y - cy| < 0.35h)
  const centerPts = pts.filter((p) => Math.abs(p.y - cy) < h * 0.35);
  if (centerPts.length < 3) return false;
  const minCenterPtX = Math.min(...centerPts.map((p) => p.x));
  const maxCenterPtX = Math.max(...centerPts.map((p) => p.x));
  const centerSpanX = maxCenterPtX - minCenterPtX;

  // The center crossing must span at least 40% of total character width
  return centerSpanX > w * 0.4;
}

// 4. Greek Lowercase Sigma 'σ' (Single stroke: circular body + top-right horizontal ear)
function isSingleStrokeLowercaseSigma(pts, norm) {
  if (!pts || pts.length < 8) return false;
  const pStart = pts[0];
  const pEnd = pts[pts.length - 1];
  const { w, h, cx, cy } = norm;

  // Circular loop in the lower portion
  const hasBottomLoop =
    pts.some((p) => p.y > cy + h * 0.1 && p.x < cx) &&
    pts.some((p) => p.y > cy + h * 0.1 && p.x > cx);
  if (!hasBottomLoop) return false;

  // Top-right horizontal ear
  const hasTopRightEar = pts.some((p) => p.x > cx + w * 0.25 && p.y < cy - h * 0.15);
  const endOrStartAtEar =
    (pStart.x > cx + w * 0.2 && pStart.y < cy - h * 0.1) ||
    (pEnd.x > cx + w * 0.2 && pEnd.y < cy - h * 0.1);

  return hasTopRightEar && endOrStartAtEar;
}

// 5. Greek Psi 'ψ' / 'Ψ' (Single stroke trident / fork: left and right top prongs + vertical center stem)
function isSingleStrokePsi(pts, norm) {
  if (!pts || pts.length < 6) return false;
  // Cannot be digit 2, 3, or variable y, or theta
  if (isSingleStrokeDigit2(pts, norm)) return false;
  if (isSingleStrokeDigit3(pts, norm)) return false;
  if (isSingleStrokeY(pts, norm)) return false;
  if (isSingleStrokeTheta(pts, norm)) return false;

  const { w, h, cx, cy } = norm;
  const pEnd = pts[pts.length - 1];

  // If stroke has a bottom horizontal base traversing to the right, it is NOT Psi!
  const lowerPts = pts.filter((p) => p.y > cy);
  const minLowerX = Math.min(...lowerPts.map((p) => p.x));
  if (pEnd.y > cy + h * 0.1 && (pEnd.x - minLowerX) > w * 0.35) return false;

  // Prongs on left and right in upper half
  const leftProng = pts.some((p) => p.x < cx - w * 0.16 && p.y < cy);
  const rightProng = pts.some((p) => p.x > cx + w * 0.16 && p.y < cy);
  if (!leftProng || !rightProng) return false;

  // Stem reaching down near center
  const centerBottom = pts.some((p) => Math.abs(p.x - cx) < w * 0.35 && p.y > cy + h * 0.2);
  if (!centerBottom) return false;

  // Key Psi distinction: The top section is WIDE (left prong AND right prong)
  const topPts = pts.filter((p) => p.y < cy - h * 0.15);
  if (topPts.length >= 2) {
    const topSpanX = Math.max(...topPts.map((p) => p.x)) - Math.min(...topPts.map((p) => p.x));
    if (topSpanX < w * 0.42) return false; // In Phi, top is narrow stem
  }

  // Vertical stem in center
  const centerVertPts = pts.filter((p) => Math.abs(p.x - cx) < w * 0.35);
  if (centerVertPts.length < 3) return false;
  const minVertY = Math.min(...centerVertPts.map((p) => p.y));
  const maxVertY = Math.max(...centerVertPts.map((p) => p.y));
  return (maxVertY - minVertY) > h * 0.55;
}

// 6. Greek Phi 'φ' / 'Φ' (Single stroke: circular/oval loop with vertical stroke passing through center)
function isSingleStrokePhi(pts, norm) {
  if (!pts || pts.length < 6) return false;
  // Cannot be digit 9
  if (isSingleStrokeDigit9(pts, norm)) return false;
  const { w, h, cx, cy } = norm;

  // Cannot be a psi
  if (isSingleStrokePsi(pts, norm)) return false;

  // Central loop: points left and right of center in mid-section
  const midPts = pts.filter((p) => Math.abs(p.y - cy) < h * 0.35);
  const hasLeftLoop = midPts.some((p) => p.x < cx - w * 0.14);
  const hasRightLoop = midPts.some((p) => p.x > cx + w * 0.14);
  if (!hasLeftLoop || !hasRightLoop) return false;

  // Vertical line: reaches above and below
  const reachesTop = pts.some((p) => p.y < cy - h * 0.25);
  const reachesBottom = pts.some((p) => p.y > cy + h * 0.25);
  if (!reachesTop || !reachesBottom) return false;

  // At the extreme top (y < cy - 0.28h), Phi is narrow (just the stem), NOT two wide prongs
  const extremeTopPts = pts.filter((p) => p.y < cy - h * 0.28);
  if (extremeTopPts.length > 0) {
    const topSpan = Math.max(...extremeTopPts.map((p) => p.x)) - Math.min(...extremeTopPts.map((p) => p.x));
    if (topSpan > w * 0.55) return false;
  }

  // Vertical traversal through center
  const centerVertPts = pts.filter((p) => Math.abs(p.x - cx) < w * 0.35);
  if (centerVertPts.length < 3) return false;
  const minVertY = Math.min(...centerVertPts.map((p) => p.y));
  const maxVertY = Math.max(...centerVertPts.map((p) => p.y));
  return (maxVertY - minVertY) > h * 0.58;
}

// 7. Greek Capital Delta 'Δ' (Single stroke closed/semi-closed triangle)
function isSingleStrokeDelta(pts, norm) {
  if (!pts || pts.length < 5) return false;
  const pStart = pts[0];
  const pEnd = pts[pts.length - 1];
  const { w, h, cx, cy, aspectRatio } = norm;
  if (aspectRatio < 0.55 || aspectRatio > 1.55) return false;

  const startEndDist = Math.hypot(pEnd.x - pStart.x, pEnd.y - pStart.y);
  if (startEndDist > Math.max(38, Math.hypot(w, h) * 0.35)) return false;

  const hasTopApex = pts.some((p) => p.y < cy - h * 0.28 && Math.abs(p.x - cx) < w * 0.35);
  const hasBottomLeft = pts.some((p) => p.y > cy + h * 0.2 && p.x < cx - w * 0.18);
  const hasBottomRight = pts.some((p) => p.y > cy + h * 0.2 && p.x > cx + w * 0.18);

  const bottomPts = pts.filter((p) => p.y > cy + h * 0.2);
  if (bottomPts.length < 2) return false;
  const bottomSpanX = Math.max(...bottomPts.map((p) => p.x)) - Math.min(...bottomPts.map((p) => p.x));

  return hasTopApex && hasBottomLeft && hasBottomRight && bottomSpanX > w * 0.48;
}

// 8. Greek Lowercase Delta 'δ' (Single stroke: top hook/curl down into circular closed base)
function isSingleStrokeLowercaseDelta(pts, norm) {
  if (!pts || pts.length < 6) return false;
  // Must NOT be digit 2
  if (isSingleStrokeDigit2(pts, norm)) return false;

  const pStart = pts[0];
  const pEnd = pts[pts.length - 1];
  const { w, h, cx, cy } = norm;

  const startsAtTopHook = pStart.y < cy - h * 0.2;
  const hasCircularBase =
    pts.some((p) => p.y > cy && p.x < cx - w * 0.12) &&
    pts.some((p) => p.y > cy && p.x > cx + w * 0.12);

  const cross = findSelfIntersection(pts);
  const endsNearLoop = Math.hypot(pEnd.x - cx, pEnd.y - cy) < Math.max(w, h) * 0.35;

  return startsAtTopHook && hasCircularBase && (cross !== null || endsNearLoop);
}

// 9. Greek Omega 'ω' (Single stroke: double rounded cup / 'w')
function isSingleStrokeOmega(pts, norm) {
  if (!pts || pts.length < 6) return false;
  const pStart = pts[0];
  const pEnd = pts[pts.length - 1];
  const { w, h, cx, cy } = norm;

  if (pStart.y > cy + h * 0.15 || pEnd.y > cy + h * 0.15) return false;
  if (pStart.x > cx || pEnd.x < cx) return false;

  const leftDip = pts.filter((p) => p.x < cx && p.y > cy + h * 0.08);
  const rightDip = pts.filter((p) => p.x > cx && p.y > cy + h * 0.08);
  const centerCrest = pts.filter((p) => Math.abs(p.x - cx) < w * 0.25 && p.y < cy + h * 0.2);

  return leftDip.length > 0 && rightDip.length > 0 && centerCrest.length > 0;
}

// 10. Greek Capital Omega 'Ω' (Single stroke horseshoe with feet)
function isSingleStrokeCapitalOmega(pts, norm) {
  if (!pts || pts.length < 6) return false;
  const pStart = pts[0];
  const pEnd = pts[pts.length - 1];
  const { w, h, cx, cy } = norm;

  if (pStart.y < cy + h * 0.08 || pEnd.y < cy + h * 0.08) return false;
  if (pStart.x > cx - w * 0.18 || pEnd.x < cx + w * 0.18) return false;

  const hasHighDome = pts.some((p) => p.y < cy - h * 0.25);
  return hasHighDome;
}

// 11. Greek Beta 'β' (Single stroke tall left ascender/descender + 2 rounded right lobes)
function isSingleStrokeBeta(pts, norm) {
  if (!pts || pts.length < 6) return false;
  if (isSingleStrokeDigit3(pts, norm)) return false;
  if (isSingleStrokeDigit8(pts, norm)) return false;
  const { w, h, cx, cy, aspectRatio } = norm;
  if (aspectRatio > 1.2) return false;

  // Beta must start from bottom-left descender and rise up
  const pStart = pts[0];
  if (pStart.y < cy) return false;

  const leftPts = pts.filter((p) => p.x < cx - w * 0.1);
  if (leftPts.length < 3) return false;
  const leftSpanY = Math.max(...leftPts.map((p) => p.y)) - Math.min(...leftPts.map((p) => p.y));
  if (leftSpanY < h * 0.58) return false;

  const rightUpper = pts.some((p) => p.x > cx && p.y < cy);
  const rightLower = pts.some((p) => p.x > cx && p.y > cy);
  return rightUpper && rightLower;
}

// 12. Greek Mu 'μ' (Single stroke: deep left descender tail + 'u' cup)
function isSingleStrokeMu(pts, norm) {
  if (!pts || pts.length < 6) return false;
  const pStart = pts[0];
  const { w, h, cx, cy } = norm;

  const startsLeftDescender = pStart.x < cx - w * 0.15 && pStart.y > cy;
  if (!startsLeftDescender) return false;

  const hasCup =
    pts.some((p) => p.x > cx - w * 0.1 && p.y > cy + h * 0.1) &&
    pts.some((p) => p.x > cx + w * 0.1 && p.y < cy);
  return hasCup;
}

// 13. Greek Pi 'π' (Single stroke arch/table: bottom-left up, top bar across, down bottom-right)
function isSingleStrokePi(pts, norm) {
  if (!pts || pts.length < 5) return false;
  if (isSingleStrokeDigit2(pts, norm)) return false;
  if (isSingleStrokeDigit3(pts, norm)) return false;

  const pStart = pts[0];
  const pEnd = pts[pts.length - 1];
  const { cx, cy, h, w, aspectRatio } = norm;
  if (aspectRatio < 0.45 || aspectRatio > 2.0) return false;

  // If stroke has horizontal base traversing bottom center moving right, it's not Pi!
  const lowerPts = pts.filter((p) => p.y > cy);
  const minLowerX = Math.min(...lowerPts.map((p) => p.x));
  const traversesBottomCenter = pts.some((p) => Math.abs(p.x - cx) < w * 0.18 && p.y > cy + h * 0.18);
  if (traversesBottomCenter && pEnd.y > cy + h * 0.1 && (pEnd.x - minLowerX) > w * 0.35) return false;

  // Both ends at bottom (two legs), separated horizontally
  const startAtBottom = pStart.y > cy + h * 0.08;
  const endAtBottom = pEnd.y > cy + h * 0.08;
  const legsSeparated = Math.abs(pStart.x - pEnd.x) > w * 0.25;
  const isArchEndpoints = startAtBottom && endAtBottom && legsSeparated;

  // Or start at top-left, go down/up left leg, across top, down right leg
  const startTopLeft = pStart.x < cx && pStart.y < cy;
  const hasLeftLeg = pts.some((p) => p.x < cx - w * 0.12 && p.y > cy + h * 0.1);
  const hasRightLeg = pts.some((p) => p.x > cx + w * 0.12 && p.y > cy + h * 0.1);
  const isTopStartArch = startTopLeft && endAtBottom && hasLeftLeg && hasRightLeg;

  // Has top horizontal bar/roof
  const hasTopBar = pts.some((p) => p.y < cy - h * 0.15);

  // Bottom center between the two legs is hollow/empty
  const bottomCenterEmpty = !pts.some((p) => Math.abs(p.x - cx) < w * 0.15 && p.y > cy + h * 0.22);

  return (isArchEndpoints || isTopStartArch) && hasTopBar && bottomCenterEmpty;
}

// 14. Greek Lambda 'λ' / 'Λ' (Single stroke inverted V or diagonal with branch)
function isSingleStrokeLambda(pts, norm) {
  if (!pts || pts.length < 5) return false;
  const pStart = pts[0];
  const pEnd = pts[pts.length - 1];
  const { w, h, cx, cy, aspectRatio } = norm;
  if (aspectRatio > 1.4) return false;

  const isApexTop = pts.some((p) => p.y < cy - h * 0.28 && Math.abs(p.x - cx) < w * 0.35);
  const startBottom = pStart.y > cy + h * 0.1;
  const endBottom = pEnd.y > cy + h * 0.1;
  const startLeft = pStart.x < cx;
  const endRight = pEnd.x > cx;

  if (isApexTop && startBottom && endBottom && ((startLeft && endRight) || (pStart.x > cx && pEnd.x < cx))) {
    return true;
  }
  return false;
}

// 15. Greek Gamma 'γ' (Single stroke ribbon crossing at bottom)
function isSingleStrokeGamma(pts, norm) {
  if (!pts || pts.length < 6) return false;
  // Must NOT be variable 'y' or digit 2 or digit 3
  if (isSingleStrokeY(pts, norm)) return false;
  if (isSingleStrokeDigit2(pts, norm)) return false;
  if (isSingleStrokeDigit3(pts, norm)) return false;

  const { cx, cy } = norm;
  const cross = findSelfIntersection(pts);
  if (!cross) return false;
  return cross.y > cy;
}

// 16. Greek Eta 'η' (lowercase n with long descending right leg)
function isSingleStrokeEta(pts, norm) {
  if (!pts || pts.length < 4) return false;
  const pStart = pts[0];
  const pEnd = pts[pts.length - 1];
  const { h, cx, cy } = norm;

  const startsLeft = pStart.x < cx;
  const reachesTopArch = pts.some((p) => p.y < cy - h * 0.18);
  const rightLegDescends = pEnd.x > cx && pEnd.y > cy + h * 0.22;
  const leftLegShorter = pStart.y < pEnd.y - h * 0.12;

  return startsLeft && reachesTopArch && rightLegDescends && leftLegShorter;
}

// 17. Greek Nu 'ν' (sharp V shape with bottom apex)
function isSingleStrokeNu(pts, norm) {
  if (!pts || pts.length < 3) return false;
  const pStart = pts[0];
  const pEnd = pts[pts.length - 1];
  const { w, h, cx, cy, aspectRatio } = norm;
  if (aspectRatio < 0.4 || aspectRatio > 1.4) return false;

  const startTopLeft = pStart.x < cx && pStart.y < cy - h * 0.12;
  const endTopRight = pEnd.x > cx && pEnd.y < cy - h * 0.12;
  const bottomPts = pts.filter((p) => p.y > cy + h * 0.25);
  if (bottomPts.length === 0) return false;
  const bottomSpanX = Math.max(...bottomPts.map((p) => p.x)) - Math.min(...bottomPts.map((p) => p.x));
  const hasSharpApex = bottomSpanX <= w * 0.32;

  return startTopLeft && endTopRight && hasSharpApex;
}

// 18. Greek Zeta 'ζ' (top hook/zigzag + long curving descender tail)
function isSingleStrokeZeta(pts, norm) {
  if (!pts || pts.length < 5) return false;
  const pStart = pts[0];
  const pEnd = pts[pts.length - 1];
  const { w, h, cx, cy } = norm;

  const startsTop = pStart.y < cy - h * 0.18;
  const endsBottomLeft = pEnd.x < cx && pEnd.y > cy + h * 0.22;
  const hasUpperZigzag = pts.some((p) => p.y < cy && p.x > cx);

  return startsTop && endsBottomLeft && hasUpperZigzag;
}

// 19. Greek Tau 'τ' (horizontal top bar + vertical center stem)
function isSingleStrokeTau(pts, norm) {
  if (!pts || pts.length < 4) return false;
  const { w, h, cx, cy } = norm;

  const hasTopBar =
    pts.some((p) => p.y < cy - h * 0.22 && p.x < cx - w * 0.18) &&
    pts.some((p) => p.y < cy - h * 0.22 && p.x > cx + w * 0.18);
  const hasCenterStem = pts.some((p) => Math.abs(p.x - cx) < w * 0.28 && p.y > cy + h * 0.22);
  return hasTopBar && hasCenterStem;
}

// 20. Greek Epsilon 'ε' (backward 3 shape with center cusp)
function isSingleStrokeEpsilon(pts, norm) {
  if (!pts || pts.length < 5) return false;
  // If it's a digit 3, it is NEVER Epsilon!
  if (isSingleStrokeDigit3(pts, norm)) return false;
  const pStart = pts[0];
  const pEnd = pts[pts.length - 1];
  const { w, h, cx, cy, aspectRatio } = norm;
  if (aspectRatio < 0.35 || aspectRatio > 1.35) return false;

  const hasLeftBack = pts.some((p) => p.x < cx - w * 0.15);
  const startsRight = pStart.x > cx - w * 0.1 && pStart.y < cy;
  const endsRight = pEnd.x > cx - w * 0.1 && pEnd.y > cy;
  const centerIndent = pts.some((p) => Math.abs(p.y - cy) < h * 0.22 && p.x > cx - w * 0.12);
  return hasLeftBack && startsRight && endsRight && centerIndent;
}

// 21. Greek Rho 'ρ' (descending left stem + top-right loop)
function isSingleStrokeRho(pts, norm) {
  if (!pts || pts.length < 4) return false;
  // Must NOT be digit 9
  if (isSingleStrokeDigit9(pts, norm)) return false;

  const pStart = pts[0];
  const { w, h, cx, cy, aspectRatio } = norm;
  if (aspectRatio > 1.25) return false;

  // Real Greek Rho starts from bottom-left descender, goes up, loops right, and closes back
  const startIsDescender = pStart.x < cx && pStart.y > cy + h * 0.2;
  if (!startIsDescender) return false;

  const hasTopRightLoop = pts.some((p) => p.x > cx + w * 0.12 && p.y < cy);
  const hasLeftVerticalStem = pts.filter((p) => p.x < cx - w * 0.05).length >= 2;

  return hasTopRightLoop && hasLeftVerticalStem;
}

// 22. Greek Upsilon 'υ' (curved U shape basin)
function isSingleStrokeUpsilon(pts, norm) {
  if (!pts || pts.length < 4) return false;
  const pStart = pts[0];
  const pEnd = pts[pts.length - 1];
  const { w, h, cx, cy, aspectRatio } = norm;
  if (aspectRatio < 0.45 || aspectRatio > 1.45) return false;

  const startTopLeft = pStart.x < cx && pStart.y < cy - h * 0.15;
  const endTopRight = pEnd.x > cx && pEnd.y < cy - h * 0.15;
  const bottomPts = pts.filter((p) => p.y > cy + h * 0.2);
  const bottomSpanX = bottomPts.length >= 2 ? (Math.max(...bottomPts.map((p) => p.x)) - Math.min(...bottomPts.map((p) => p.x))) : 0;
  const hasCurvedBasin = bottomSpanX > w * 0.25;

  return startTopLeft && endTopRight && hasCurvedBasin;
}

// 23. Greek Kappa 'κ' (stem + chevron arms)
function isSingleStrokeKappa(pts, norm) {
  if (!pts || pts.length < 4) return false;
  const { w, h, cx, cy, aspectRatio } = norm;
  if (aspectRatio < 0.4 || aspectRatio > 1.25) return false;

  const hasLeftStem = pts.filter((p) => p.x < cx - w * 0.12).length >= 2;
  const hasRightTopArm = pts.some((p) => p.x > cx + w * 0.12 && p.y < cy);
  const hasRightBottomArm = pts.some((p) => p.x > cx + w * 0.12 && p.y > cy);
  return hasLeftStem && hasRightTopArm && hasRightBottomArm;
}

// 24. Greek Xi 'ξ' (multi-wave zigzag with tail)
function isSingleStrokeXi(pts, norm) {
  if (!pts || pts.length < 5) return false;
  const pStart = pts[0];
  const pEnd = pts[pts.length - 1];
  const { h, cy } = norm;

  const startsTop = pStart.y < cy - h * 0.25;
  const endsBottomTail = pEnd.y > cy + h * 0.25;
  const midWaves = pts.filter((p) => Math.abs(p.y - cy) < h * 0.25);
  return startsTop && endsBottomTail && midWaves.length >= 3;
}

// 25. Greek Iota 'ι' (tall narrow stroke with slight hook)
function isSingleStrokeIota(pts, norm) {
  if (!pts || pts.length < 3) return false;
  const pStart = pts[0];
  const pEnd = pts[pts.length - 1];
  const { cx, cy, h, aspectRatio } = norm;
  if (aspectRatio > 0.55) return false;

  const startsTop = pStart.y < cy - h * 0.28;
  const endsBottomHook = pEnd.y > cy + h * 0.25 && pEnd.x > cx;
  return startsTop && endsBottomHook;
}

// 26. Greek Chi 'χ' (single-stroke crossing diagonals)
function isSingleStrokeChi(pts, norm) {
  if (!pts || pts.length < 5) return false;
  const { w, h, cx, cy, aspectRatio } = norm;
  if (aspectRatio < 0.5 || aspectRatio > 1.5) return false;

  const hasTL = pts.some((p) => p.x < cx - w * 0.15 && p.y < cy - h * 0.15);
  const hasTR = pts.some((p) => p.x > cx + w * 0.15 && p.y < cy - h * 0.15);
  const hasBL = pts.some((p) => p.x < cx - w * 0.15 && p.y > cy + h * 0.15);
  const hasBR = pts.some((p) => p.x > cx + w * 0.15 && p.y > cy + h * 0.15);
  return hasTL && hasTR && hasBL && hasBR;
}

// ===========================================================================
// MASTER GREEK CHARACTER CLASSIFIER (Multi-Stroke & Single-Stroke)
// ===========================================================================
function classifyGreekCharacter(clusterStrokes, norm) {
  if (!clusterStrokes || clusterStrokes.length === 0) return null;
  const numStrokes = clusterStrokes.length;
  const { w, h, cx, cy, aspectRatio } = norm;

  // A. MULTI-STROKE GREEK LETTERS (2 or 3 strokes)
  if (numStrokes === 3) {
    // 1. Greek Xi 'Ξ' (3 horizontal bars stacked vertically)
    const bars = clusterStrokes.map((s) => s.bounds || getElementBounds(s));
    const allBars = bars.every((b) => b && b.w > b.h * 1.3);
    if (allBars) {
      bars.sort((a, b) => a.cy - b.cy);
      const isStacked = bars[1].cy > bars[0].cy + h * 0.15 && bars[2].cy > bars[1].cy + h * 0.15;
      if (isStacked) return 'Ξ';
    }

    // 2. Greek Sigma 'Σ' (3 strokes: top bar, bottom bar, diagonal apex)
    const hasTopHoriz = clusterStrokes.some((s) => {
      const b = s.bounds || getElementBounds(s);
      return b && b.w > b.h * 1.15 && b.cy < cy - h * 0.15;
    });
    const hasBottomHoriz = clusterStrokes.some((s) => {
      const b = s.bounds || getElementBounds(s);
      return b && b.w > b.h * 1.15 && b.cy > cy + h * 0.15;
    });
    if (hasTopHoriz && hasBottomHoriz) {
      const hasLeftApex = clusterStrokes.some((s) => {
        const b = s.bounds || getElementBounds(s);
        return b && b.minX < cx - w * 0.2;
      });
      if (hasLeftApex) return 'Σ';
    }

    // 3. Greek Pi 'π' (Top bar + 2 vertical legs)
    const horizTopStrokes = clusterStrokes.filter((s) => {
      const b = s.bounds || getElementBounds(s);
      return b && b.w > b.h * 1.15 && b.cy < cy - h * 0.08;
    });
    if (horizTopStrokes.length === 1) {
      const otherStrokes = clusterStrokes.filter((s) => s !== horizTopStrokes[0]);
      const legs = otherStrokes.map((s) => s.bounds || getElementBounds(s));
      const legsAreVertical = legs.every((b) => b && b.h > b.w * 0.85 && b.cy > cy);
      if (legsAreVertical && legs.length === 2 && Math.abs(legs[0].cx - legs[1].cx) > w * 0.2) {
        return 'π';
      }
    }
  }

  if (numStrokes === 2) {
    const s1 = clusterStrokes[0];
    const s2 = clusterStrokes[1];
    const b1 = s1.bounds || getElementBounds(s1);
    const b2 = s2.bounds || getElementBounds(s2);

    if (b1 && b2) {
      const isS1Stem = b1.h > b1.w * 1.6;
      const isS2Stem = b2.h > b2.w * 1.6;
      const isS1Bar = b1.w > b1.h * 1.6;
      const isS2Bar = b2.w > b2.h * 1.6;

      // 1. Greek Tau 'τ' (One horizontal bar + one vertical stem)
      if ((isS1Bar && isS2Stem) || (isS2Bar && isS1Stem)) {
        const bar = isS1Bar ? b1 : b2;
        const stem = isS1Stem ? b1 : b2;
        // Bar must be at top edge (T-shape), not in the middle like '+'
        if (bar.cy < stem.minY + stem.h * 0.22 && Math.abs(stem.cx - bar.cx) < bar.w * 0.35) {
          return 'τ';
        }
      }

      // 2. Greek Theta 'θ' (One horizontal bar + one 2D loop)
      if ((isS1Bar && !isS2Stem && !isS2Bar) || (isS2Bar && !isS1Stem && !isS1Bar)) {
        const bar = isS1Bar ? b1 : b2;
        const loop = isS1Bar ? b2 : b1;
        const centeredY = Math.abs(bar.cy - loop.cy) < loop.h * 0.38;
        const insideX = bar.cx > loop.minX - 10 && bar.cx < loop.maxX + 10;
        if (centeredY && insideX) {
          return 'θ';
        }
      }

      // 3. Greek Kappa 'κ' (Left vertical stem + right chevron arms)
      const leftStroke = b1.cx < b2.cx ? s1 : s2;
      const rightStroke = b1.cx < b2.cx ? s2 : s1;
      const bLeft = leftStroke.bounds || getElementBounds(leftStroke);
      const bRight = rightStroke.bounds || getElementBounds(rightStroke);
      const isLeftStem = bLeft.h > bLeft.w * 2.0;
      const rightPts = rightStroke.points || [];
      if (isLeftStem && rightPts.length >= 3) {
        const rStart = rightPts[0];
        const rEnd = rightPts[rightPts.length - 1];
        const rMinX = Math.min(...rightPts.map((p) => p.x));
        const isChevron =
          rStart.x > rMinX + bRight.w * 0.3 &&
          rEnd.x > rMinX + bRight.w * 0.3 &&
          rMinX < bLeft.maxX + bLeft.h * 0.3;
        if (isChevron) {
          return 'κ';
        }
      }

      // 4. Greek Phi 'φ' or Psi 'ψ' (One vertical stem + one 2D loop or cup)
      if ((isS1Stem && !isS2Stem && !isS2Bar) || (isS2Stem && !isS1Stem && !isS1Bar)) {
        const stem = isS1Stem ? b1 : b2;
        const otherStroke = isS1Stem ? s2 : s1;
        const otherBounds = isS1Stem ? b2 : b1;
        const otherPts = otherStroke.points || [];

        const centeredX = Math.abs(stem.cx - otherBounds.cx) < otherBounds.w * 0.48;

        if (centeredX && otherPts.length >= 3) {
          const startP = otherPts[0];
          const endP = otherPts[otherPts.length - 1];
          const lowestY = Math.max(...otherPts.map((p) => p.y));

          // Psi: 'U' cup shape - both ends are at the top, and top is open
          const isCup =
            startP.y < lowestY - otherBounds.h * 0.22 &&
            endP.y < lowestY - otherBounds.h * 0.22;

          // Phi: closed loop or stroke surrounds vertical center
          const hasTopArc = otherPts.some((p) => p.y < otherBounds.cy - otherBounds.h * 0.2);
          const hasBottomArc = otherPts.some((p) => p.y > otherBounds.cy + otherBounds.h * 0.2);
          const isLoop =
            hasTopArc &&
            hasBottomArc &&
            Math.hypot(endP.x - startP.x, endP.y - startP.y) < otherBounds.w * 0.65;

          if (isCup && !isLoop) {
            return 'ψ';
          }
          if (isLoop || (!isCup && stem.h >= otherBounds.h * 0.72)) {
            return 'φ';
          }
        }
      }

      // 5. Greek Pi 'π' (Top bar + leg)
      const horizTopStrokes = clusterStrokes.filter((s) => {
        const b = s.bounds || getElementBounds(s);
        return b && b.w > b.h * 1.15 && b.cy < cy - h * 0.08;
      });
      if (horizTopStrokes.length === 1) {
        const legStroke = clusterStrokes.find((s) => s !== horizTopStrokes[0]);
        const legBounds = legStroke.bounds || getElementBounds(legStroke);
        if (legBounds && legBounds.cy > cy - h * 0.05 && legBounds.w > w * 0.3) {
          return 'π';
        }
      }

      // 6. Greek Lambda 'λ' (Meeting diagonals)
      const o1 = getStrokeOrientation(s1);
      const o2 = getStrokeOrientation(s2);
      if (o1.isDiag && o2.isDiag && o1.dir * o2.dir < 0) {
        const main = b1.h > b2.h ? s1 : s2;
        const leg = b1.h > b2.h ? s2 : s1;
        const mainBounds = main.bounds || getElementBounds(main);
        const legBounds = leg.bounds || getElementBounds(leg);
        if (legBounds.minY > mainBounds.minY + mainBounds.h * 0.15 && legBounds.maxY > mainBounds.cy) {
          return 'λ';
        }
      }

      // 7. Greek Alpha 'α' (Loop + tail)
      if (bLeft && bRight && !isLeftStem) {
        const isLeftRound = Math.abs(bLeft.w - bLeft.h) < Math.max(bLeft.w, bLeft.h) * 0.65;
        const isRightRound = Math.abs(bRight.w - bRight.h) < Math.max(bRight.w, bRight.h) * 0.65;
        if ((isLeftRound && bRight.h > bLeft.h * 0.4) || (isRightRound && bLeft.h > bRight.h * 0.4)) {
          return 'α';
        }
      }

      // 8. Greek Lowercase Sigma 'σ' (Circle on left/bottom + top-right ear)
      const isS1Wide = b1.w > b1.h * 1.1;
      const isS2Wide = b2.w > b2.h * 1.1;
      // If both strokes are wide horizontal bars, it is an equals sign '=', NEVER sigma!
      if (!isS1Wide || !isS2Wide) {
        const isS1Ear = b1.w > b1.h && b1.cy < cy - h * 0.15 && b1.cx > cx;
        const isS2Ear = b2.w > b2.h && b2.cy < cy - h * 0.15 && b2.cx > cx;
        if (isS1Ear || isS2Ear) {
          return 'σ';
        }
      }
    }
  }

  // B. SINGLE-STROKE GREEK LETTERS
  if (numStrokes === 1) {
    const pts = clusterStrokes[0].points;
    if (!pts || pts.length < 3) return null;

    // 1. Sigma FIRST (distinct zig-zag with inward apex, never confused with alpha)
    if (isSingleStrokeSigma(pts, norm)) return 'Σ';
    // 2. Theta (perimeter loop + central crossing)
    if (isSingleStrokeTheta(pts, norm)) return 'θ';
    // 3. Alpha (guaranteed not Sigma, Theta, or Epsilon)
    if (isSingleStrokeAlpha(pts, norm)) return 'α';
    // 4. Pi (open arch/table with two separate legs)
    if (isSingleStrokePi(pts, norm)) return 'π';
    // 5. Psi & Phi with mutually distinct criteria
    if (isSingleStrokePsi(pts, norm)) return 'ψ';
    if (isSingleStrokePhi(pts, norm)) return 'φ';
    if (isSingleStrokeLowercaseSigma(pts, norm)) return 'σ';
    // 6. Delta
    if (isSingleStrokeDelta(pts, norm)) return 'Δ';
    if (isSingleStrokeLowercaseDelta(pts, norm)) return 'δ';
    // 7. Omega
    if (isSingleStrokeOmega(pts, norm)) return 'ω';
    if (isSingleStrokeCapitalOmega(pts, norm)) return 'Ω';
    // 8. Beta
    if (isSingleStrokeBeta(pts, norm)) return 'β';
    // 9. Mu
    if (isSingleStrokeMu(pts, norm)) return 'μ';
    // 10. Lambda
    if (isSingleStrokeLambda(pts, norm)) return 'λ';
    // 11. Gamma
    if (isSingleStrokeGamma(pts, norm)) return 'γ';
    // 12. Rho
    if (isSingleStrokeRho(pts, norm)) return 'ρ';
  }

  return null;
}

// Advanced Handwriting Character Classifier (Digits 0-9, variables, math symbols)
export function classifyCharacterCluster(clusterStrokes) {
  if (!clusterStrokes || clusterStrokes.length === 0) return '';
  const numStrokes = clusterStrokes.length;

  const allPoints = clusterStrokes.flatMap((s) => s.points || []);
  if (allPoints.length === 0) return '';

  const norm = normalizePoints(allPoints);
  const w = norm.w;
  const h = norm.h;
  const aspectRatio = norm.aspectRatio;

  // =========================================================================
  // PRIORITY 1: MULTI-STROKE MATHEMATICAL OPERATORS & ESSENTIAL VARIABLES
  // (Prevents Greek letters like Sigma, Tau, Chi from hijacking '=', '+', 'x', 'y')
  // =========================================================================
  if (numStrokes >= 2) {
    const s1 = clusterStrokes[0];
    const s2 = clusterStrokes[1];
    const b1 = s1.bounds || getElementBounds(s1);
    const b2 = s2.bounds || getElementBounds(s2);

    if (b1 && b2) {
      // 0. GREEK THETA 'θ' (2 strokes: one 2D loop + one horizontal bar inside it)
      const isS1ThinBar = b1.w > b1.h * 1.5 && b1.h < Math.max(30, b2.h * 0.65);
      const isS2ThinBar = b2.w > b2.h * 1.5 && b2.h < Math.max(30, b1.h * 0.65);
      if ((isS1ThinBar && !isS2ThinBar) || (isS2ThinBar && !isS1ThinBar)) {
        const bar = isS1ThinBar ? b1 : b2;
        const loop = isS1ThinBar ? b2 : b1;
        // Loop must be a 2D body, NOT a vertical stem (which would be a '+' cross)
        const isLoop2D = loop.w > 18 && loop.h > 18 && loop.w > loop.h * 0.45;
        // Bar is inside the vertical span of the loop
        const barInsideLoopY = bar.cy > loop.minY + loop.h * 0.05 && bar.cy < loop.maxY - loop.h * 0.05;
        const alignedX = Math.abs(bar.cx - loop.cx) < Math.max(bar.w, loop.w) * 0.45;
        if (isLoop2D && barInsideLoopY && alignedX) {
          return 'θ';
        }
      }

      // 1. EQUALS '=': two roughly horizontal parallel strokes stacked vertically
      const isS1Wide = b1.w > b1.h * 1.35;
      const isS2Wide = b2.w > b2.h * 1.35;
      const comparableHeight = Math.max(b1.h, b2.h) < Math.min(b1.h, b2.h) * 2.8;
      const isStackedSeparatedY = (b1.maxY < b2.cy || b2.maxY < b1.cy);
      const alignedX = Math.abs(b1.cx - b2.cx) < Math.max(b1.w, b2.w) * 0.55;
      if (isS1Wide && isS2Wide && comparableHeight && isStackedSeparatedY && alignedX) {
        return '=';
      }

      // 2. PLUS '+': one horizontal, one vertical, intersecting near center
      const isS1Horiz = b1.w > b1.h * 1.15;
      const isS2Horiz = b2.w > b2.h * 1.15;
      const isS1Vert = b1.h > b1.w * 1.15;
      const isS2Vert = b2.h > b2.w * 1.15;
      const centerCloseX = Math.abs(b1.cx - b2.cx) < Math.max(b1.w, b2.w) * 0.5;
      const centerCloseY = Math.abs(b1.cy - b2.cy) < Math.max(b1.h, b2.h) * 0.5;
      if (((isS1Horiz && isS2Vert) || (isS1Vert && isS2Horiz)) && centerCloseX && centerCloseY) {
        return '+';
      }

      // 3. 2-stroke Variable 'x': two crossing diagonal strokes
      const o1 = getStrokeOrientation(s1);
      const o2 = getStrokeOrientation(s2);
      if (o1.isDiag && o2.isDiag && o1.dir * o2.dir < 0) {
        const diffMaxY = Math.abs(b1.maxY - b2.maxY);
        const minH = Math.min(b1.h, b2.h);
        const maxH = Math.max(b1.h, b2.h);

        const isSymmetricX =
          diffMaxY < minH * 0.35 &&
          Math.abs(b1.minY - b2.minY) < maxH * 0.35 &&
          Math.abs(b1.cy - b2.cy) < maxH * 0.35;

        if (isSymmetricX) {
          return 'x';
        }
        return 'y';
      }

      // 4. 2-stroke 'y': stroke 1 is a cup/V and stroke 2 is a descender tail
      const diffMaxY = Math.abs(b1.maxY - b2.maxY);
      const minH = Math.min(b1.h, b2.h);
      if (diffMaxY > minH * 0.25 && (b1.cy < norm.cy || b2.cy < norm.cy)) {
        return 'y';
      }

      // 5. 3-stroke 'y' or 'Y' (left arm, right arm, vertical stem)
      if (numStrokes === 3) {
        const topStrokes = clusterStrokes.filter((s) => {
          const b = s.bounds || getElementBounds(s);
          return b && b.minY < norm.cy + norm.h * 0.1;
        });
        const btmStrokes = clusterStrokes.filter((s) => {
          const b = s.bounds || getElementBounds(s);
          return b && b.maxY > norm.cy;
        });
        if (topStrokes.length >= 2 && btmStrokes.length >= 1) {
          return 'y';
        }
      }

      // 6. Digit '4' (2 strokes: L-shape + vertical stroke)
      if ((isS1Vert && !isS2Vert) || (isS2Vert && !isS1Vert)) {
        const vert = isS1Vert ? b1 : b2;
        const other = isS1Vert ? b2 : b1;
        if (vert.cx > other.cx && vert.h > other.h * 0.7) {
          return '4';
        }
      }

      // 7. Digit '5' (body stroke + top horizontal bar aligned directly above it)
      if (isS1Horiz && b1.cy < norm.cy && Math.abs(b1.cx - b2.cx) < Math.max(b1.w, b2.w) * 0.45) {
        return '5';
      }
    }
  }

  // =========================================================================
  // PRIORITY 2: SINGLE-STROKE FUNDAMENTAL DIGITS & OPERATORS
  // (Prevents Greek letters like Delta, Rho, Gamma from hijacking '2', '9', 'y', '1', '-')
  // =========================================================================
  if (numStrokes === 1) {
    const pts = clusterStrokes[0].points;
    if (!pts || pts.length === 0) return '';

    // Digit '2' (arch over top, diagonal down-left, horizontal base to bottom-right)
    if (isSingleStrokeDigit2(pts, norm)) {
      return '2';
    }

    // Digit '3' (two right lobes + center waist)
    if (isSingleStrokeDigit3(pts, norm)) {
      return '3';
    }

    // Single-stroke 'y' (cup + descender tail)
    if (isSingleStrokeY(pts, norm)) {
      return 'y';
    }

    // Digit '9' (upper loop + right descending stem)
    if (isSingleStrokeDigit9(pts, norm)) {
      return '9';
    }

    // Digit '0' (clean closed hollow loop)
    if (isSingleStrokeDigit0(pts, norm)) {
      return '0';
    }

    // Digit '7' (top horizontal bar + diagonal down-left)
    if (isSingleStrokeDigit7(pts, norm)) {
      return '7';
    }

    // Digit '6' (arch from top down into lower closed loop)
    if (isSingleStrokeDigit6(pts, norm)) {
      return '6';
    }

    // Digit '8' (figure 8 crossings)
    if (isSingleStrokeDigit8(pts, norm)) {
      return '8';
    }

    // 1. One '1': Narrow vertical stroke
    if (aspectRatio < 0.38 && h > 20) {
      return '1';
    }

    // 2. Minus '-': Wide, flat horizontal stroke
    if (aspectRatio > 2.0 && h < 32 && w < 180) {
      return '-';
    }

    // 3. Slash '/': Diagonal slope with high straightness
    if (aspectRatio > 0.35 && aspectRatio < 1.25 && h > 25) {
      const pStart = pts[0];
      const pEnd = pts[pts.length - 1];
      const isDiag1 = pStart.x > norm.cx && pEnd.x < norm.cx && pStart.y < norm.cy && pEnd.y > norm.cy;
      const isDiag2 = pStart.x < norm.cx && pEnd.x > norm.cx && pStart.y > norm.cy && pEnd.y < norm.cy;
      if (isDiag1 || isDiag2) {
        let straight = true;
        for (const p of pts) {
          const d = distToSegment(p.x, p.y, pStart.x, pStart.y, pEnd.x, pEnd.y);
          if (d > Math.max(w, h) * 0.22) {
            straight = false;
            break;
          }
        }
        if (straight) return '/';
      }
    }

    // 4. Dot '.' (very small stroke)
    if (w < 12 && h < 12) {
      return '.';
    }
  }

  // =========================================================================
  // PRIORITY 3: DEDICATED HIGH-PRECISION GREEK CHARACTERS
  // (Sigma, Theta, Alpha, Beta, Delta, Pi, Phi, Lambda, etc.)
  // =========================================================================
  const greekChar = classifyGreekCharacter(clusterStrokes, norm);
  if (greekChar) {
    return greekChar;
  }

  // Case 2 continuation: Single-stroke character fallback analysis
  const pts = clusterStrokes[0].points;
  if (!pts || pts.length === 0) return '';
  const pStart = pts[0];
  const pEnd = pts[pts.length - 1];

  // 1. One '1': Narrow vertical stroke
  if (aspectRatio < 0.38 && h > 20) {
    return '1';
  }

  // 2. Minus '-': Wide, flat horizontal stroke (not excessively huge to avoid underlines)
  if (aspectRatio > 2.2 && h < 32 && w < 180) {
    return '-';
  }

  // 3. Slash '/': Diagonal slope with high straightness
  if (aspectRatio > 0.35 && aspectRatio < 1.25 && h > 25) {
    const isDiag1 = pStart.x > norm.cx && pEnd.x < norm.cx && pStart.y < norm.cy && pEnd.y > norm.cy;
    const isDiag2 = pStart.x < norm.cx && pEnd.x > norm.cx && pStart.y > norm.cy && pEnd.y < norm.cy;
    if (isDiag1 || isDiag2) {
      let straight = true;
      for (const p of pts) {
        const d = distToSegment(p.x, p.y, pStart.x, pStart.y, pEnd.x, pEnd.y);
        if (d > Math.max(w, h) * 0.22) {
          straight = false;
          break;
        }
      }
      if (straight) return '/';
    }
  }

  // 4. Dot '.' (very small stroke)
  if (w < 12 && h < 12) {
    return '.';
  }

  // 5. Robust Inflection & Lobe Analysis to distinguish '3' vs '7' vs 'y':
  // A handwritten '3' has a pronounced rightward lobe in the lower quadrant and ends curving to the bottom-left.
  // A handwritten '7' has a top horizontal bar and a straight diagonal going down-left, with ZERO points in the lower-right quadrant!
  const hasLowerRightLobe = pts.some((p) => p.y > norm.cy + h * 0.12 && p.x > norm.cx + w * 0.12);
  const endsBottomLeft = pEnd.x < norm.cx + w * 0.2 && pEnd.y > norm.cy + h * 0.15;
  const isLikely3 = hasLowerRightLobe && endsBottomLeft;

  // Check if stroke has a cup/V at the top and a descending tail at bottom
  const hasDescenderTail = pEnd.y > norm.cy + h * 0.25;
  const hasUpperCup = pts.some((p) => p.y < norm.cy && p.x < norm.cx) && pts.some((p) => p.y < norm.cy && p.x > norm.cx);
  const isLikelyY = hasUpperCup && hasDescenderTail;

  // 6. Template Matching with $1 Resampling
  const resampled = resampleStroke(norm.normalized, 32);
  let bestChar = '3';
  let bestDist = Infinity;

  CANONICAL_TEMPLATES.forEach((t) => {
    const dForward = pathDistance(resampled, t.points);
    const rev = [...t.points].reverse();
    const dReverse = pathDistance(resampled, rev);
    let d = Math.min(dForward, dReverse);

    // If stroke clearly has a bottom lobe (like 3), prevent it from matching 7
    if (isLikely3 && t.char === '7') {
      d += 90;
    }
    if (isLikely3 && t.char === '3') {
      d -= 25;
    }

    // Conversely, if stroke has NO lower right lobe at all, penalize 3 and favor 7
    if (!hasLowerRightLobe && t.char === '3') {
      d += 50;
    }
    if (!hasLowerRightLobe && t.char === '7') {
      d -= 15;
    }

    // If stroke has upper cup and a bottom descender, strongly favor 'y'
    if (isLikelyY && t.char === 'y') {
      d -= 45;
    }
    if (isLikelyY && (t.char === '3' || t.char === '7' || t.char === '4' || t.char === '9')) {
      d += 60;
    }

    if (d < bestDist) {
      bestDist = d;
      bestChar = t.char;
    }
  });

  return bestChar;
}


// High-Tolerance Smart Shape Recognition for Smart Drawing Pen (Wand tool 3)
export function recognizeSmartShape(points, color, size) {
  const baseId = `smart-${Date.now()}`;
  if (!points || points.length < 5) {
    return {
      id: baseId,
      type: 'pen',
      color,
      size: size || 3,
      points,
    };
  }

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  let totalLength = 0;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
    if (i > 0) {
      totalLength += Math.hypot(p.x - points[i - 1].x, p.y - points[i - 1].y);
    }
  }

  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);
  const startPt = points[0];
  const endPt = points[points.length - 1];
  const startEndDist = Math.hypot(endPt.x - startPt.x, endPt.y - startPt.y);
  const diag = Math.hypot(width, height);

  if (diag < 18) {
    return { id: baseId, type: 'pen', color, size: size || 3, points };
  }

  const isClosed = startEndDist < Math.max(65, diag * 0.55);

  // 1. OPEN STROKE -> STRAIGHT LINE
  if (!isClosed) {
    const straightness = startEndDist / (totalLength || 1);
    if (straightness > 0.65 || (straightness > 0.5 && startEndDist > 40)) {
      return {
        id: baseId,
        type: 'line',
        startX: startPt.x,
        startY: startPt.y,
        endX: endPt.x,
        endY: endPt.y,
        color,
        size: 2,
      };
    }
  }

  // 2. CLOSED STROKE -> RECOGNIZE GEOMETRIC SHAPE (Circle, Rectangle, Triangle)
  if (isClosed && width > 18 && height > 18) {
    let signedArea = 0;
    for (let i = 0; i < points.length - 1; i++) {
      signedArea += points[i].x * points[i + 1].y - points[i + 1].x * points[i].y;
    }
    signedArea += endPt.x * startPt.y - startPt.x * endPt.y;
    const area = Math.abs(signedArea) / 2;
    const boxArea = width * height;
    const fillRatio = area / (boxArea || 1);

    if (fillRatio >= 0.78) {
      return {
        id: baseId,
        type: 'rectangle',
        startX: minX,
        startY: minY,
        endX: maxX,
        endY: maxY,
        color,
        fill: 'none',
        size: 2,
      };
    }

    if (fillRatio < 0.62) {
      return {
        id: baseId,
        type: 'triangle',
        startX: minX,
        startY: minY,
        endX: maxX,
        endY: maxY,
        color,
        fill: 'none',
        size: 2,
      };
    }

    return {
      id: baseId,
      type: 'circle',
      startX: minX,
      startY: minY,
      endX: maxX,
      endY: maxY,
      color,
      fill: 'none',
      size: 2,
    };
  }

  if (diag > 40 && (width / height > 3.0 || height / width > 3.0)) {
    return {
      id: baseId,
      type: 'line',
      startX: startPt.x,
      startY: startPt.y,
      endX: endPt.x,
      endY: endPt.y,
      color,
      size: 2,
    };
  }

  return {
    id: baseId,
    type: 'pen',
    color,
    size: size || 3,
    points,
  };
}
