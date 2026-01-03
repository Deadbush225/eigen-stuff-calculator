import { type LatexString } from './math';

/**
 * Calculate determinant for triangular matrices (product of diagonal)
 */
export function calculateTriangularDeterminant(matrix: (string | number)[][]): LatexString {
  return matrix.map((row, i) => `(${row[i]})`).join(' \\cdot ');
}

/**
 * Calculate 2x2 determinant: (a)(d) - (b)(c)
 */
export function calculate2x2Determinant(matrix: (string | number)[][]): LatexString {
  const [[a, b], [c, d]] = matrix; // Destructuring for cleaner code
  return `(${a})(${d}) - (${b})(${c})`;
}

/**
 * Helper to extract a sub-matrix (minor) by removing a specific row and column
 */
function getMinor(matrix: (string | number)[][], rowToRemove: number, colToRemove: number): (string | number)[][] {
  return matrix
    .filter((_, index) => index !== rowToRemove) // Remove Row
    .map(row => row.filter((_, index) => index !== colToRemove)); // Remove Column
}

/**
 * Main recursive function for N >= 3
 * Handles 3x3, 4x4, 5x5, etc. using proper bracket sizing and recursion.
 */
export function assembleNbyNDeterminantExpression(matrix: (string | number)[][], depth: number = 0): LatexString {
  const n = matrix.length;

  if (n == 1) {
    return matrix[0][0].toString();
  }

  // Base Case: 2x2
  if (n === 2) {
    return calculate2x2Determinant(matrix);
  }

  const terms: string[] = [];

  // Determine bracket size based on depth (recursion level)
  // Depth 0 (5x5) -> Biggl, Depth 1 (4x4) -> biggl, Depth 2 (3x3) -> Bigl
  const openBracket  = depth === 0 ? '\\Biggl[' : (depth === 1 ? '\\biggl[' : '\\Bigl[');
  const closeBracket = depth === 0 ? '\\Biggr]' : (depth === 1 ? '\\biggr]' : '\\Bigr]');

  for (let j = 0; j < n; j++) {
    const element = matrix[0][j];

    // Optimization: Skip zero terms
    if (element === 0) continue;

    const minor = getMinor(matrix, 0, j);
    
    // Recursive Step
    const minorDet = assembleNbyNDeterminantExpression(minor, depth + 1);

    if (minorDet === "") continue;

    // Formatting: (+)(-1)^(i+j)(element)[minorDet]
    const term = `+(-1)^{(${1}+${j + 1})}(${element})${openBracket}${minorDet}${closeBracket}`;
    terms.push(term);
  }

  // Formatting: 
  // If we are at the top level (5x5 or 4x4), we usually want newlines between the main terms.
  // For deeper levels (3x3 inside a 4x4), we usually want spaces to keep it compact.
  const separator = depth === 0 ? ' \\newline ' : ' ';
  
  return terms.join(separator);
}