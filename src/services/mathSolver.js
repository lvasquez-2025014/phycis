// =========================================================================
// MATH EQUATION & ARITHMETIC SOLVER SERVICE
// Solves linear equations (e.g., 2x+3=5, 2θ=6, 3α-1=8) and arithmetic expressions
// =========================================================================

export function solveMathEquation(text) {
  if (!text) return null;
  try {
    const clean = text.replace(/\s+/g, '');
    
    // 1. Linear equation with variables: 2x+3=5, 2θ=6, 3α-1=8, etc.
    const eqMatch = clean.match(/^([+-]?\d*)([a-zA-Z\u0370-\u03FF])([+-]\d+)?=([+-]?\d+)$/);
    if (eqMatch) {
      const coeffStr = eqMatch[1];
      const a = coeffStr === '' || coeffStr === '+' ? 1 : coeffStr === '-' ? -1 : parseFloat(coeffStr);
      const varName = eqMatch[2];
      const b = eqMatch[3] ? parseFloat(eqMatch[3]) : 0;
      const c = parseFloat(eqMatch[4]);
      if (a === 0) return null;
      const solution = (c - b) / a;
      return {
        solved: true,
        varName,
        solution: Number.isInteger(solution) ? solution : +solution.toFixed(2),
        step: `${a !== 1 ? a : ''}${varName} = ${c - b}`,
      };
    }

    // 2. Arithmetic expressions: 2+3=, 10*5=, 15-4=, 20/4=
    const arithMatch = clean.match(/^(\d+(?:\.\d+)?)([\+\-\*\/])(\d+(?:\.\d+)?)=?$/);
    if (arithMatch) {
      const n1 = parseFloat(arithMatch[1]);
      const op = arithMatch[2];
      const n2 = parseFloat(arithMatch[3]);
      let res = 0;
      if (op === '+') res = n1 + n2;
      else if (op === '-') res = n1 - n2;
      else if (op === '*') res = n1 * n2;
      else if (op === '/') {
        if (n2 === 0) return null;
        res = n1 / n2;
      }
      return {
        solved: true,
        solution: Number.isInteger(res) ? res : +res.toFixed(2),
      };
    }
  } catch (err) {
    console.error('Math solver error:', err);
  }
  return null;
}
