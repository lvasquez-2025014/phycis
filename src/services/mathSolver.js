// =========================================================================
// MATH EQUATION & ARITHMETIC SOLVER SERVICE
// Solves linear equations (e.g., 2x+3=5, 2x+9=9x, 2θ=6, 3α-1=8) and arithmetic expressions
// =========================================================================

function parseLinearExpression(exprStr, varChar) {
  // Matches terms like '+2x', '-x', '9', '-3.5', '+x'
  const termRegex = /([+-]?[^+-]+)/g;
  const terms = exprStr.match(termRegex) || [];
  let a = 0; // coefficient of varChar
  let b = 0; // constant term

  for (const t of terms) {
    const trimmed = t.trim();
    if (!trimmed) continue;
    if (trimmed.includes(varChar)) {
      const coeffPart = trimmed.replace(varChar, '').trim();
      const coeff =
        coeffPart === '' || coeffPart === '+'
          ? 1
          : coeffPart === '-'
          ? -1
          : parseFloat(coeffPart);
      if (isNaN(coeff)) return null;
      a += coeff;
    } else {
      const num = parseFloat(trimmed);
      if (isNaN(num)) return null;
      b += num;
    }
  }
  return { a, b };
}

export function solveMathEquation(text) {
  if (!text) return null;
  try {
    const clean = text.replace(/\s+/g, '');

    // 1. Check for single '=' in equation
    if (clean.includes('=')) {
      const parts = clean.split('=');
      if (parts.length === 2) {
        const left = parts[0];
        const right = parts[1];

        // Case A: Arithmetic expression ending with '=': e.g. '2+3=' or '10*5='
        if (right === '') {
          const arithMatch = left.match(/^(\d+(?:\.\d+)?)([\+\-\*\/])(\d+(?:\.\d+)?)$/);
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
        }

        // Case B: Linear equation with single variable (e.g. 2x+9=15, 2x+9=9x, 2θ=6)
        const varMatches = clean.match(/[a-zA-Z\u0370-\u03FF]/g);
        if (varMatches && varMatches.length > 0) {
          const uniqueVars = Array.from(new Set(varMatches));
          if (uniqueVars.length === 1) {
            const varName = uniqueVars[0];
            const leftParsed = parseLinearExpression(left, varName);
            const rightParsed = parseLinearExpression(right, varName);

            if (leftParsed && rightParsed) {
              const netA = leftParsed.a - rightParsed.a;
              const netB = rightParsed.b - leftParsed.b;

              if (Math.abs(netA) > 1e-9) {
                const solution = netB / netA;
                return {
                  solved: true,
                  varName,
                  solution: Number.isInteger(solution) ? solution : +solution.toFixed(2),
                  step: `${netA !== 1 ? +netA.toFixed(2) : ''}${varName} = ${+netB.toFixed(2)}`,
                };
              }
            }
          }
        }
      }
    }

    // 2. Arithmetic expressions without trailing '=' or with: 2+3=, 10*5=, 15-4=, 20/4=
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
