import { type characteristicPolynomial } from "./math";

/**
 * Manually expands a polynomial equation like "(x-1)^2 + 2(x-3)^4"
 * Returns coefficients in DESCENDING order (x^N ... x^0)
 */
export function expandPolynomialManual(equation: string): characteristicPolynomial {
    // 1. Pre-processing: Standardize spacing and signs
    // Replace "-" with "+-" (but carefully, not inside exponents) to allow splitting by "+"
    let cleanEq = equation.replace(/\s+/g, '').replace(/-/g, '+-');
    // Fix edge case where string starts with "+-"
    if (cleanEq.startsWith('+-')) cleanEq = cleanEq.substring(1); // remove the '+' so it starts with '-'
    // Fix edge case where exponents got messed up (e.g. ^-2 is unlikely for polynomials but ^+ is invalid)
    // We assume positive integer exponents for characteristic polynomials.

    // 2. Split by "+" to get individual terms
    // We need to be careful not to split inside parentheses, but our specific replace logic
    // makes splitting by '+' safer. 
    // Ideally, we iterate to respect parentheses depth.
    const terms = splitTerms(equation.replace(/\s+/g, ''));

    // 3. Initialize Accumulator Polynomial (starts as [0])
    // We store coeffs in ASCENDING order [x^0, x^1, x^2...] for easier math
    let finalPoly: number[] = [0];

    terms.forEach(term => {
        if (!term) return;
        const polyTerm = parseAndExpandTerm(term);
        finalPoly = polyAdd(finalPoly, polyTerm);
    });

    // 4. Format Output
    // Reverse to Descending [x^N, ... x^0]
    const descCoeffs = [...finalPoly].reverse();
    
    // Remove leading zeros if any (but keep at least one zero if all are zero)
    while (descCoeffs.length > 1 && Math.abs(descCoeffs[0]) < 1e-9) {
        descCoeffs.shift();
    }

    return {
        expression: buildPolyString(descCoeffs),
        variables: ['x'],
        coefficients: descCoeffs
    };
}

// === Helper 1: Robust Splitter ===
// Splits "2(x-1)^2 - 3x" into ["2(x-1)^2", "-3x"]
function splitTerms(eq: string): string[] {
    const terms: string[] = [];
    let currentTerm = "";
    let parenDepth = 0;

    for (let i = 0; i < eq.length; i++) {
        const char = eq[i];
        
        if (char === '(') parenDepth++;
        if (char === ')') parenDepth--;

        // If we hit a + or - and we are NOT inside parens, it's a split point
        if (parenDepth === 0 && (char === '+' || char === '-')) {
            if (currentTerm.length > 0) terms.push(currentTerm);
            currentTerm = char; // Start new term with the sign
        } else {
            currentTerm += char;
        }
    }
    if (currentTerm.length > 0) terms.push(currentTerm);
    return terms;
}

// === Helper 2: Parse Single Term ===
// parses "2(x-3)^4" or "-x^2" or "5"
function parseAndExpandTerm(term: string): number[] {
    // Regex breakdown:
    // Group 1 (Coeff): Optional number at start, or just sign
    // Group 2 (Base): "(x ...)" or "x"
    // Group 3 (Exp): Optional exponent number
    const regex = /^([+-]?[\d\.]*)?\(?x?([+-][\d\.]+)?\)?\^?(\d+)?$/;
    
    // Check if it's just a constant number (no 'x')
    if (!term.includes('x')) {
        return [parseFloat(term) || 0];
    }

    // Identify Exponent
    let parts = term.split('^');
    let exponent = parts.length > 1 ? parseInt(parts[1]) : 1;
    let basePart = parts[0];

    // Identify Coefficient
    // Look for the part before 'x' or '('
    let coeffStr = "1";
    let root = 0; // The 'k' in (x+k)

    if (basePart.includes('(')) {
        // Format: c(x+k)
        const subParts = basePart.split('(');
        coeffStr = subParts[0];
        const inner = subParts[1].replace(')', ''); // "x-3" or "x"
        root = parseFloat(inner.replace('x', '')) || 0;
    } else {
        // Format: cx or x
        const subParts = basePart.split('x');
        coeffStr = subParts[0];
        // Check for "x+k" case without parens? Rare in this format but valid.
        // Assuming characteristic polys usually look like (x-L)^n or x^n
        root = 0; 
    }

    // Parse Coefficient Value
    if (coeffStr === "" || coeffStr === "+") coeffStr = "1";
    if (coeffStr === "-") coeffStr = "-1";
    const coefficient = parseFloat(coeffStr);

    // Create Base Polynomial (x + root) -> [root, 1]
    // e.g. (x - 3) -> [-3, 1]
    let basePoly = [root, 1]; 

    // Compute Power
    let resultPoly = polyPower(basePoly, exponent);

    // Multiply by Coefficient
    return resultPoly.map(c => c * coefficient);
}

// === Math Helper: Add Polynomials ===
function polyAdd(p1: number[], p2: number[]): number[] {
    const len = Math.max(p1.length, p2.length);
    const result = new Array(len).fill(0);
    for (let i = 0; i < len; i++) {
        const v1 = p1[i] || 0;
        const v2 = p2[i] || 0;
        result[i] = v1 + v2;
    }
    return result;
}

// === Math Helper: Multiply Polynomials (Convolution) ===
function polyMultiply(p1: number[], p2: number[]): number[] {
    const result = new Array(p1.length + p2.length - 1).fill(0);
    for (let i = 0; i < p1.length; i++) {
        for (let j = 0; j < p2.length; j++) {
            result[i + j] += p1[i] * p2[j];
        }
    }
    return result;
}

// === Math Helper: Power of Polynomial ===
function polyPower(base: number[], exp: number): number[] {
    if (exp === 0) return [1];
    if (exp === 1) return base;
    
    let res = [1];
    let b = base;
    
    // Simple exponentiation by squaring could be used, but loop is fine for small n
    for (let i = 0; i < exp; i++) {
        res = polyMultiply(res, b);
    }
    return res;
}

// === String Builder (Reused from previous answer) ===
function buildPolyString(coeffs: number[]): string {
  if (coeffs.every(c => Math.abs(c) < 1e-9)) return "0";
  const degree = coeffs.length - 1;
  
  const terms = coeffs
    .map((coeff, index) => {
      if (Math.abs(coeff) < 1e-9) return ''; 
      const currentDegree = degree - index;
      const absCoeff = Math.abs(coeff);
      const sign = (coeff > 0) ? ' + ' : ' - ';
      
      let valueStr = parseFloat(absCoeff.toFixed(4)).toString(); // Clean up decimals
      if (valueStr === '1' && currentDegree > 0) valueStr = ''; 

      let varStr = '';
      if (currentDegree === 1) varStr = 'x';
      else if (currentDegree > 0) varStr = `x^${currentDegree}`;

      return { sign, str: `${valueStr}${varStr}`, rawCoeff: coeff };
    })
    .filter(t => t !== '');

  let finalString = terms.map((t, i) => {
    if (i === 0) return t.rawCoeff < 0 ? `-${t.str}` : t.str;
    return `${t.sign}${t.str}`;
  }).join('');

  return finalString;
}

// === TEST ===
const eq = "(x-1)^5";
const res = expandPolynomialManual(eq);
console.log(res);