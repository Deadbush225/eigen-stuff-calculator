import { create, all, type MathNode, type MathType, type Complex } from 'mathjs';
const math = create(all);

/**
 * Manual Eigenvalue Calculator
 * Implements the complete mathematical approach for finding eigenvalues manually
 * Pure TypeScript implementation without external library dependencies for core calculations
 */

export interface EigenResult {
  eigenvalues: number[];
  characteristicPolynomial: string;
  xIMinusA: (string | number)[][];
  determinantExpression: string;
  trace: number;
  isReal: boolean;
  steps: {
    step1_xIMinusA: string;
    step2_determinant: string;
    step3_polynomial: string;
    step4_eigenvalues: string;
  };
}

/**
 * Step 1: Create xI - A matrix (characteristic matrix)
 * Manually creates the symbolic representation of xI - A
 */
function createXIMinusAMatrix(inputMatrix: number[][]): (string | number)[][] {
  const n = inputMatrix.length;
  const result: (string | number)[][] = [];
  
  for (let i = 0; i < n; i++) {
    result[i] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        // Diagonal elements: x - a_ij
        const value = inputMatrix[i][j];
        if (value === 0) {
          result[i][j] = 'x';
        } else if (value > 0) {
          result[i][j] = `x - ${value}`;
        } else {
          result[i][j] = `x + ${Math.abs(value)}`;
        }
      } else {
        // Off-diagonal elements: -a_ij
        result[i][j] = -inputMatrix[i][j];
      }
    }
  }
  
  return result;
}

/**
 * Step 2: Calculate determinant manually to get characteristic polynomial
 * Manually implements determinant calculation for different matrix sizes
 */
function calculateDeterminantExpression(xIMinusA: (string | number)[][]): string {
  const n = xIMinusA.length;
  
  // Check for special cases first
  if (isTriangularMatrix(xIMinusA)) {
    return calculateTriangularDeterminant(xIMinusA);
  }
  
  switch (n) {
    case 1:
      return xIMinusA[0][0].toString();
    
    case 2:
      return calculate2x2Determinant(xIMinusA);
    
    case 3:
      return calculate3x3Determinant(xIMinusA);
      
    default:
      return calculateLargerDeterminant(xIMinusA);
  }
}

/**
 * Check if matrix is triangular (upper or lower)
 */
function isTriangularMatrix(matrix: (string | number)[][]): boolean {
  const n = matrix.length;
  let isUpper = true;
  let isLower = true;
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i > j && matrix[i][j] !== 0) {
        isUpper = false;
      }
      if (i < j && matrix[i][j] !== 0) {
        isLower = false;
      }
    }
  }
  
  return isUpper || isLower;
}

/**
 * Calculate determinant for triangular matrices (product of diagonal)
 */
function calculateTriangularDeterminant(matrix: (string | number)[][]): string {
  const diagonal = [];
  for (let i = 0; i < matrix.length; i++) {
    diagonal.push(`(${matrix[i][i]})`);
  }
  return diagonal.join(' * ');
}

/**
 * Calculate 2x2 determinant: (a)(d) - (b)(c)
 */
function calculate2x2Determinant(matrix: (string | number)[][]): string {
  const a = matrix[0][0];
  const b = matrix[0][1];
  const c = matrix[1][0];
  const d = matrix[1][1];
  
  return `(${a})(${d}) - (${b})(${c})`;
}

/**
 * Calculate 3x3 determinant using cofactor expansion along first row
 */
function calculate3x3Determinant(matrix: (string | number)[][]): string {
  const terms: string[] = [];
  
  for (let j = 0; j < 3; j++) {
    const element = matrix[0][j];
    const sign = j % 2 === 0 ? '+' : '-';
    
    // Create 2x2 minor by removing row 0 and column j
    const minor: (string | number)[][] = [];
    for (let i = 1; i < 3; i++) {
      minor.push([]);
      for (let k = 0; k < 3; k++) {
        if (k !== j) {
          minor[i - 1].push(matrix[i][k]);
        }
      }
    }
    
    const minorDet = calculate2x2Determinant(minor);
    const term = `${sign}(${element})(${minorDet})`;
    terms.push(term);
  }
  
  return terms.join(' ');
}

/**
 * For larger matrices, use cofactor expansion (simplified)
 */
function calculateLargerDeterminant(matrix: (string | number)[][]): string {
  const n = matrix.length;
  return `Determinant of ${n}×${n} matrix (expanded using cofactor method)`;
}

/**
 * Step 3: Parse and solve characteristic polynomial manually
 * Converts the determinant expression into a polynomial and finds roots
 */
function solveCharacteristicPolynomial(
  determinantExpr: {
    expression: MathNode | string;
    variables: string[];
    coefficients: MathType[];
}, 
  inputMatrix: number[][]
): { polynomial: string, eigenvalues: (number|Complex)[] } {
  const n = inputMatrix.length;
  const coeff = determinantExpr.coefficients as (number | Complex)[];
//   if (n === 1) {
//     // Linear case: x - a = 0 → x = a
//     const eigenvalue = inputMatrix[0][0];
//     return {
//       polynomial: `x - ${eigenvalue} = 0`,
//       eigenvalues: [eigenvalue]
//     };
//   }
  
//   if (n === 2) {
//     return solve2x2Characteristic(inputMatrix);
//   }
  
//   if (n === 3) {
//     return solve3x3Characteristic(inputMatrix, determinantExpr);
//   }
    if ([1,2,3].includes(n)) {
        console.log("USING MATHJS POLY ROOT");
        console.log(coeff[3], coeff[2], coeff[1], coeff[0]);
        
        // if n = 3, manually calculate the roots following cubic formula to find the roots
        if (n === 3) {
            const a = coeff[3] as number;
            const b = coeff[2] as number;
            const c = coeff[1] as number;
            const d = coeff[0] as number;

            // Cardano's method for solving cubic equations
            const discriminant = 18 * a * b * c * d - 4 * b * b * b * d + b * b * c * c - 4 * a * c * c * c - 27 * a * a * d * d;

            // Use Cardano's method (handled with real and complex cases)
            const roots: (number | Complex)[] = [];

            // Normalize coefficients: x^3 + A x^2 + B x + C = 0
            const A = b / a;
            const B = c / a;
            const C = d / a;

            // Compute intermediate values
            const Q = (3 * B - A * A) / 9;
            const R = (9 * A * B - 27 * C - 2 * A * A * A) / 54;
            const Cardano_discriminant = Q * Q * Q + R * R; // Discriminant for depressed cubic

            if (Cardano_discriminant >= 0) {
                // One real root and two complex conjugates (or all real with multiplicities)
                const sqrtD = Math.sqrt(Cardano_discriminant);
                const S = Math.cbrt(R + sqrtD);
                const T = Math.cbrt(R - sqrtD);

                const y1 = S + T;
                const x1 = y1 - A / 3;
                roots.push(Number.isFinite(x1) ? x1 : math.complex(x1, 0));

                // Complex conjugate pair
                const realPart = -(S + T) / 2 - A / 3;
                const imagPart = (S - T) * Math.sqrt(3) / 2;
                roots.push(math.complex(realPart, imagPart));
                roots.push(math.complex(realPart, -imagPart));
            } else {
                // Three distinct real roots
                // const rho = Math.sqrt(-Q * Q * Q);
                // Guard R / sqrt(-Q^3) in [-1,1] numerically
                const cosArg = Math.max(-1, Math.min(1, R / Math.sqrt(-Q * Q * Q)));
                const theta = Math.acos(cosArg);

                const twoSqrtNegQ = 2 * Math.sqrt(-Q);
                const y1 = twoSqrtNegQ * Math.cos(theta / 3);
                const y2 = twoSqrtNegQ * Math.cos((theta + 2 * Math.PI) / 3);
                const y3 = twoSqrtNegQ * Math.cos((theta + 4 * Math.PI) / 3);

                roots.push(y1 - A / 3);
                roots.push(y2 - A / 3);
                roots.push(y3 - A / 3);
            }
            
            console.log("Roots calculated via Cardano's method:", roots);

            return {
                polynomial: `${determinantExpr.expression} = 0`,
                eigenvalues: roots,
            };
        }

        return {
            polynomial: `${determinantExpr.expression} = 0`,
            eigenvalues: math.polynomialRoot(coeff[3], coeff[2], coeff[1], coeff[0]),
        };
    }

  // For larger matrices, use numerical approach or special cases
  return {
    polynomial: `Characteristic polynomial: ${determinantExpr} = 0`,
    eigenvalues: solveNumerically(inputMatrix)
  };
}

/**
 * Solve 2x2 characteristic polynomial: x² - trace·x + det = 0
 */
function solve2x2Characteristic(matrix: number[][]): { polynomial: string, eigenvalues: number[] } {
  const a = matrix[0][0];
  const b = matrix[0][1];
  const c = matrix[1][0];
  const d = matrix[1][1];
  
  const trace = a + d;
  const determinant = a * d - b * c;
  
  const polynomial = `x² - ${trace}x + ${determinant} = 0`;
  
  // Use quadratic formula: x = (trace ± √(trace² - 4·det)) / 2
  const discriminant = trace * trace - 4 * determinant;
  
  if (discriminant >= 0) {
    const sqrtDiscriminant = Math.sqrt(discriminant);
    const eigenvalues = [
      (trace + sqrtDiscriminant) / 2,
      (trace - sqrtDiscriminant) / 2
    ];
    return { polynomial, eigenvalues };
  } else {
    // Complex eigenvalues
    console.warn('Complex eigenvalues detected for 2x2 matrix');
    return { polynomial: polynomial + ' (complex roots)', eigenvalues: [] };
  }
}

/**
 * Solve 3x3 characteristic polynomial (special cases)
 */
function solve3x3Characteristic(
  matrix: number[][], 
  determinantExpr: string
): { polynomial: string, eigenvalues: number[] } {
  
  // Check if diagonal matrix
  if (isDiagonalMatrix(matrix)) {
    return {
      polynomial: `(x - ${matrix[0][0]})(x - ${matrix[1][1]})(x - ${matrix[2][2]}) = 0`,
      eigenvalues: [matrix[0][0], matrix[1][1], matrix[2][2]]
    };
  }
  
  // Check if triangular matrix
  if (isTriangularNumerical(matrix)) {
    return {
      polynomial: `(x - ${matrix[0][0]})(x - ${matrix[1][1]})(x - ${matrix[2][2]}) = 0`,
      eigenvalues: [matrix[0][0], matrix[1][1], matrix[2][2]]
    };
  }
  
  // For general 3x3, we need to solve cubic equation
  // This is complex, so we'll use a numerical approximation for now
  const eigenvalues = solveNumerically(matrix);
  
  return {
    polynomial: `Cubic characteristic polynomial: ${determinantExpr} = 0`,
    eigenvalues
  };
}

/**
 * Check if matrix is diagonal
 */
function isDiagonalMatrix(matrix: number[][]): boolean {
  const n = matrix.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j && Math.abs(matrix[i][j]) > 1e-10) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Check if numerical matrix is triangular
 */
function isTriangularNumerical(matrix: number[][]): boolean {
  const n = matrix.length;
  let isUpper = true;
  let isLower = true;
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i > j && Math.abs(matrix[i][j]) > 1e-10) {
        isUpper = false;
      }
      if (i < j && Math.abs(matrix[i][j]) > 1e-10) {
        isLower = false;
      }
    }
  }
  
  return isUpper || isLower;
}

/**
 * Numerical eigenvalue solver for complex cases
 * Uses power iteration or QR algorithm concepts (simplified)
 */
function solveNumerically(matrix: number[][]): number[] {
  const n = matrix.length;
  
  // For demonstration, we'll use a simplified approach
  // In practice, you'd implement QR algorithm or other numerical methods
  
  // Try some simple approaches first
  if (n <= 3) {
    // Use characteristic polynomial coefficients and Newton's method
    return approximateEigenvalues(matrix);
  }
  
  console.warn('Numerical eigenvalue calculation for large matrices not fully implemented');
  return [];
}

/**
 * Approximate eigenvalues using iterative methods
 */
function approximateEigenvalues(matrix: number[][]): number[] {
  const n = matrix.length;
  const eigenvalues: number[] = [];
  
  // Simple approach: try values near trace/n and use det(A - λI) = 0
  const trace = calculateTraceManual(matrix);
  const startGuess = trace / n;
  
  // Use Newton-Raphson method to find roots
  for (let i = 0; i < n; i++) {
    const guess = startGuess + i - n/2; // Spread guesses around
    const eigenvalue = newtonRaphsonEigenvalue(matrix, guess);
    if (eigenvalue !== null && !eigenvalues.includes(eigenvalue)) {
      eigenvalues.push(eigenvalue);
    }
  }
  
  return eigenvalues.slice(0, n); // Return at most n eigenvalues
}

/**
 * Newton-Raphson method to find eigenvalue
 */
function newtonRaphsonEigenvalue(matrix: number[][], initialGuess: number): number | null {
  let x = initialGuess;
  const tolerance = 1e-10;
  const maxIterations = 50;
  
  for (let i = 0; i < maxIterations; i++) {
    const fx = calculateCharacteristicValue(matrix, x);
    const fpx = calculateCharacteristicDerivative(matrix, x);
    
    if (Math.abs(fpx) < tolerance) {
      break; // Avoid division by zero
    }
    
    const newX = x - fx / fpx;
    
    if (Math.abs(newX - x) < tolerance) {
      return newX; // Converged
    }
    
    x = newX;
  }
  
  return null; // Did not converge
}

/**
 * Calculate det(A - λI) for a specific λ value
 */
function calculateCharacteristicValue(matrix: number[][], lambda: number): number {
  const n = matrix.length;
  const AMinusLambdaI: number[][] = [];
  
  // Create A - λI matrix
  for (let i = 0; i < n; i++) {
    AMinusLambdaI[i] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        AMinusLambdaI[i][j] = matrix[i][j] - lambda;
      } else {
        AMinusLambdaI[i][j] = matrix[i][j];
      }
    }
  }
  
  return calculateNumericalDeterminant(AMinusLambdaI);
}

/**
 * Calculate derivative of characteristic polynomial at λ
 */
function calculateCharacteristicDerivative(matrix: number[][], lambda: number): number {
  const h = 1e-8;
  const f1 = calculateCharacteristicValue(matrix, lambda + h);
  const f2 = calculateCharacteristicValue(matrix, lambda - h);
  return (f1 - f2) / (2 * h);
}

/**
 * Calculate numerical determinant using LU decomposition
 */
function calculateNumericalDeterminant(matrix: number[][]): number {
  const n = matrix.length;
  
  if (n === 1) return matrix[0][0];
  if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  
  // Simple cofactor expansion for larger matrices
  let det = 0;
  for (let j = 0; j < n; j++) {
    const minor = getMinor(matrix, 0, j);
    const cofactor = Math.pow(-1, j) * matrix[0][j] * calculateNumericalDeterminant(minor);
    det += cofactor;
  }
  
  return det;
}

/**
 * Get minor matrix by removing specified row and column
 */
function getMinor(matrix: number[][], row: number, col: number): number[][] {
  const minor: number[][] = [];
  for (let i = 0; i < matrix.length; i++) {
    if (i !== row) {
      const newRow: number[] = [];
      for (let j = 0; j < matrix[i].length; j++) {
        if (j !== col) {
          newRow.push(matrix[i][j]);
        }
      }
      minor.push(newRow);
    }
  }
  return minor;
}

/**
 * Calculate trace manually (sum of diagonal elements)
 */
function calculateTraceManual(matrix: number[][]): number {
  let trace = 0;
  for (let i = 0; i < matrix.length; i++) {
    trace += matrix[i][i];
  }
  return trace;
}

/**
 * Format the xI - A matrix for display
 */
function formatXIMinusAMatrix(xIMinusA: (string | number)[][]): string {
  let result = 'xI - A =\n';

  // Find first the maximum width of each column for alignment
  const colWidths: number[] = [];
  for (let j = 0; j < xIMinusA[0].length; j++) {
    let maxWidth = 0;
    for (let i = 0; i < xIMinusA.length; i++) {
      const cellLength = String(xIMinusA[i][j]).length;
      if (cellLength > maxWidth) {
        maxWidth = cellLength;
      }
    }
    colWidths[j] = maxWidth;
  }

  // Build formatted string with aligned columns
  
  for (let i = 0; i < xIMinusA.length; i++) {
    let row = '| ';
    for (let j = 0; j < xIMinusA[i].length; j++) {
      row += String(xIMinusA[i][j]).padEnd(colWidths[j] + 1);
      if (j < xIMinusA[i].length - 1) row += '\t';
    }
    row += ' |';
    result += row + '\n';
  }
  
  return result;
}

/**
 * Main function to find eigenvalues following the manual mathematical approach
 */
export function findEigenvalues(inputMatrix: number[][]): EigenResult {
  // Validate input
  if (!inputMatrix || inputMatrix.length === 0) {
    throw new Error('Matrix cannot be empty');
  }
  
  const n = inputMatrix.length;
  
  // Check if matrix is square
  for (let i = 0; i < n; i++) {
    if (!inputMatrix[i] || inputMatrix[i].length !== n) {
      throw new Error('Matrix must be square (n×n)');
    }
  }
  
  // Step 1: Create xI - A matrix
  const xIMinusA = createXIMinusAMatrix(inputMatrix);
  console.log('xI - A matrix:', xIMinusA);
  const xIMinusAString = formatXIMinusAMatrix(xIMinusA);
  console.log('xI - A matrix (formatted):', xIMinusAString);
  
  // Step 2: Calculate determinant expression
  const determinantExpression = calculateDeterminantExpression(xIMinusA);
  console.log('Determinant expression: (Raw)', determinantExpression);

  let mathjsexp;
  
  try {
      mathjsexp = math.rationalize(math.simplify(determinantExpression), {},true);
      
      console.log('Determinant expression: (Simplified)', mathjsexp.expression.toString());
      console.log('Coefficients:', mathjsexp.coefficients);
    } catch (e) {
    console.error('Error occurred while simplifying determinant expression:', e);
    // Cleanup or final steps if needed
}

  // Step 3: Solve characteristic polynomial
  const polynomialResult = solveCharacteristicPolynomial(mathjsexp, inputMatrix);
//   const polynomialResult = solveCharacteristicPolynomial("", inputMatrix);
  // compare solution to mathjs
//   try {
      const mathjsResult = math.eigs(inputMatrix);
    console.log('Eigenvalues (mathjs):', mathjsResult.values);
// } finally {
      console.log('Eigenvalues (manual):', polynomialResult.eigenvalues);
// }
      

  // Additional calculations
  const trace = calculateTraceManual(inputMatrix);
  const isReal = polynomialResult.eigenvalues.every((val: number) => 
    typeof val === 'number' && isFinite(val) && !isNaN(val)
  ) && polynomialResult.eigenvalues.length != 0;
  
  const steps = {
    step1_xIMinusA: `Step 1: Create xI - A matrix\n${xIMinusAString}`,
    step2_determinant: `Step 2: Calculate det(xI - A)\n${determinantExpression}`,
    step3_polynomial: `Step 3: Characteristic Polynomial\n${polynomialResult.polynomial}`,
    step4_eigenvalues: `Step 4: Eigenvalues σ(A)\n[${polynomialResult.eigenvalues.join(', ')}]`
  };
  
  return {
    eigenvalues: polynomialResult.eigenvalues,
    characteristicPolynomial: polynomialResult.polynomial,
    xIMinusA,
    determinantExpression,
    trace,
    isReal,
    steps
  };
}

/**
 * Helper function to validate eigenvalues manually
 * For each eigenvalue λ, verify that det(A - λI) ≈ 0
 */
export function validateEigenvalues(inputMatrix: number[][], eigenvalues: number[]): boolean {
  for (const lambda of eigenvalues) {
    const det_result = calculateCharacteristicValue(inputMatrix, lambda);
    if (Math.abs(det_result) > 1e-8) { // Allow for numerical precision
      console.warn(`Eigenvalue ${lambda} validation failed: det(A - λI) = ${det_result}`);
      return false;
    }
  }
  
  return true;
}

/**
 * Helper function to get characteristic equation as a string
 */
export function getCharacteristicEquation(inputMatrix: number[][]): string {
  const xIMinusA = createXIMinusAMatrix(inputMatrix);
  const determinantExpr = calculateDeterminantExpression(xIMinusA);
  return `${determinantExpr} = 0`;
}

/**
 * Helper function to display step-by-step solution
 */
export function displayStepByStep(inputMatrix: number[][]): string {
  const result = findEigenvalues(inputMatrix);
  
  return [
    result.steps.step1_xIMinusA,
    '',
    result.steps.step2_determinant,
    '',
    result.steps.step3_polynomial,
    '',
    result.steps.step4_eigenvalues,
    '',
    // `Trace: ${result.trace}`,
    `All eigenvalues are real: ${result.isReal}`
  ].join('\n');
}
