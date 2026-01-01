import React from 'react';
import MathDisplay from '../components/util/MathDisplay';

import { create, all, type MathNode, type MathType, type Complex, exp } from 'mathjs';
import { formatMatrix, nullSpaceBasis } from './matrixOperations';
const math = create(all);

// Type alias for clarity: A polynomial is an array of coefficients [an, ..., a0]
type PolynomialCoefficients = number[];

/**
 * Solves for real roots of a polynomial given its coefficients.
 * Uses Newton-Raphson method with Synthetic Division deflation.
 * @param inputCoeffs - [an, an-1, ..., a0] for an*x^n + ... + a0
 * @returns Array of real roots
 */
export function solveRealRoots(inputCoeffs: PolynomialCoefficients): number[] {
    // Clone inputs to avoid mutating the original array
    let coeffs = [...inputCoeffs];
    const roots: number[] = [];
    
    // 1. Clean coefficients (remove leading zeros)
    while (coeffs.length > 0 && coeffs[0] === 0) {
        coeffs.shift();
    }
    
    // Helper: Convert coeffs array to math.js expression string
    // Example: [1, -3, 2] -> "(1 * x^2) + (-3 * x^1) + (2 * x^0)"
    const coeffsToExpression = (c: PolynomialCoefficients): string => {
        const degree = c.length - 1;
        const terms = c.map((val, idx) => {
            if (val === 0) return '';
            const power = degree - idx;
            return `(${val} * x^${power})`;
        }).filter(t => t !== '');
        
        return terms.length > 0 ? terms.join(' + ') : '0';
    };

    // Helper: Synthetic Division
    // Divides polynomial 'poly' by (x - root) and returns the quotient polynomial
    const deflate = (polyCoeffs: PolynomialCoefficients, root: number): PolynomialCoefficients => {
        const newCoeffs: number[] = [];
        let remainder = polyCoeffs[0];
        newCoeffs.push(remainder);
        
        // We stop at length - 1 because the last result of synthetic division
        // is the remainder (which we discard for the deflated polynomial)
        for (let i = 1; i < polyCoeffs.length - 1; i++) {
            remainder = polyCoeffs[i] + (remainder * root);
            newCoeffs.push(remainder);
        }
        
        // Clean up tiny coefficients that are likely numerical errors
        return newCoeffs.map(coeff => Math.abs(coeff) < 1e-12 ? 0 : coeff);
    };

    // Recursive solver loop
    let attempts = 0;
    while (coeffs.length > 1 && attempts < 10) {
        // Optimization: Handle Linear Case directly (ax + b = 0)
        // This prevents numerical instability for the final root
        if (coeffs.length === 2) {
            // Avoid -0 result
            const root = coeffs[1] === 0 ? 0 : -coeffs[1] / coeffs[0];
            roots.push(root);
            break; 
        }

        // Setup Newton-Raphson using math.js
        const exprStr = coeffsToExpression(coeffs);
        
        // Compile functions for efficiency
        const f = math.compile(exprStr);
        const fp = math.derivative(exprStr, 'x').compile();

        let found = false;
        
        // Try multiple starting points for better convergence
        const startingPoints = [
            Math.random() * 10 - 5,  // Random guess
            0,                       // Try zero
            1,                       // Try one
            -1,                      // Try negative one
            ...roots.map(r => r + 0.1), // Try near existing roots for repeated roots
        ];
        
        for (const initialGuess of startingPoints) {
            let guess = initialGuess;
            let converged = false;
            
            // Newton Loop (Max 100 iterations per starting point)
            for (let i = 0; i < 100; i++) {
                const y = f.evaluate({x: guess});
                const dy = fp.evaluate({x: guess});

                // If we're very close to zero, we found a root
                if (Math.abs(y) < 1e-10) {
                    roots.push(guess);
                    coeffs = deflate(coeffs, guess);
                    found = true;
                    converged = true;
                    break;
                }

                // Handle stationary points (derivative is 0)
                if (Math.abs(dy) < 1e-10) {
                    break; // Try next starting point
                }

                const newGuess = guess - (y / dy);

                // Check for convergence
                if (Math.abs(newGuess - guess) < 1e-10) {
                    // Double-check that this is actually a root
                    const rootCheck = f.evaluate({x: newGuess});
                    if (Math.abs(rootCheck) < 1e-8) {
                        roots.push(newGuess);
                        coeffs = deflate(coeffs, newGuess);
                        found = true;
                        converged = true;
                        break;
                    }
                }
                guess = newGuess;
            }
            
            if (converged) break;
        }
        
        attempts++;
        
        // Safety break: if we can't find a root (e.g., only complex roots left), stop.
        if (!found) break;
    }

    // Sort and format results (rounding to 4 decimals)
    return roots.sort((a, b) => a - b)
        .map(r => Math.abs(r - Math.round(r)) < 0.01 ? Math.round(r) : r)
        .filter((value, index, array) => index === 0 || Math.abs(value - array[index - 1]) > 1e-8);
}

// --- Example Usage ---

// Example 1: x^3 - 6x^2 + 11x - 6 (Roots: 1, 2, 3)
const poly1: PolynomialCoefficients = [1, -6, 11, -6];
console.log("Poly 1 Roots:", solveRealRoots(poly1));
// console.warn(math.rationalize("(-1 + x)^(5)").toString());

// Example 2: x^4 - 10x^3 + 35x^2 - 50x + 24 (Roots: 1, 2, 3, 4)
const poly2: PolynomialCoefficients = [1, -10, 35, -50, 24];
console.log("Poly 2 Roots:", solveRealRoots(poly2));

// Example 3: (x-1)^3 = x^3 - 3x^2 + 3x - 1 (Triple root: 1, 1, 1)
const poly3: PolynomialCoefficients = [1, -3, 3, -1];
console.log("Poly 3 Roots (x-1)^3:", solveRealRoots(poly3));

/**
 * Manual Eigenvalue Calculator
 * Implements the complete mathematical approach for finding eigenvalues manually
 * Pure TypeScript implementation without external library dependencies for core calculations
 */

export interface EigenResult {
  eigenvalues: (number | Complex)[];
  eigenspaces: Eigenspace[];
  characteristicPolynomial: string;
  xIMinusA: (string | number)[][];
  determinantExpression: string;
  trace: number;
  isReal: boolean;
  steps: {
    step1_xIMinusA: React.JSX.Element;
    step2_determinant: React.JSX.Element;
    step3_polynomial: React.JSX.Element;
    step4_eigenvalues: React.JSX.Element;
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

type LatexString = string;

// type PolynomialEquation = {
//     expression: string;
//     latex: string;
// }

/**
 * Step 2: Calculate determinant manually to get characteristic polynomial
 * Manually implements determinant calculation for different matrix sizes
 */
function calculateDeterminantExpression(xIMinusA: (string | number)[][]): LatexString {
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
function calculateTriangularDeterminant(matrix: (string | number)[][]): LatexString {
  const diagonal = [];
  for (let i = 0; i < matrix.length; i++) {
    diagonal.push(`(${matrix[i][i]})`);
  }
  return  diagonal.join(' \\cdot ');
}

/**
 * Calculate 2x2 determinant: (a)(d) - (b)(c)
 */
function calculate2x2Determinant(matrix: (string | number)[][]): LatexString {
  const a = matrix[0][0];
  const b = matrix[0][1];
  const c = matrix[1][0];
  const d = matrix[1][1];

  return `(${a})(${d}) - (${b})(${c})`;
}

/**
 * Calculate 3x3 determinant using cofactor expansion along first row
 */
function calculate3x3Determinant(matrix: (string | number)[][], asInner?: boolean): LatexString {
  const terms: string[] = [];
  
  for (let j = 0; j < 3; j++) {
    const element = matrix[0][j];
    let sign = j % 2 === 0 ? '+' : '-';
    if (j === 0) sign = '';
    
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
    let term = `${sign}(${element})\\Bigl[${minorDet}\\Bigr]`;
    if (j != 2 && !asInner) {
        term += `\\newline`;
    }
    terms.push(term);
  }

  return terms.join(' ');
}

/**
 * For larger matrices, use cofactor expansion (simplified)
 */
function calculateLargerDeterminant(matrix: (string | number)[][]): LatexString {
  const n = matrix.length;

    if (n === 4) {
  const terms: string[] = [];

        for (let j = 0; j < 4; j++) {
            const element = matrix[0][j];
            let sign = j % 2 === 0 ? '+' : '-';
            if (j === 0) sign = '';
            
            // Create 2x2 minor by removing row 0 and column j
            const minor: (string | number)[][] = [];
            for (let i = 1; i < 4; i++) {
                minor.push([]);
                for (let k = 0; k < 4; k++) {
                    if (k !== j) {
                        minor[i - 1].push(matrix[i][k]);
                    }
                }
            }

            const minorDet = calculate3x3Determinant(minor, true);
            const term = `${sign}(${element})\\biggl[${minorDet}\\biggr]\\newline`;
            terms.push(term);
        }
        return terms.join(' ');
    }
    return "Determinant calculation for matrices larger than 4x4 is not implemented.";
}

type characteristicPolynomial = {
    expression: MathNode | string;
    variables: string[];
    coefficients: MathType[];
}

/**
 * Step 3: Parse and solve characteristic polynomial manually
 * Converts the determinant expression into a polynomial and finds roots
 */
function solveCharacteristicPolynomial(
  determinantExpr: characteristicPolynomial, 
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
    if ([1,2,3,4,5].includes(n)) {
        console.log("USING MATHJS POLY ROOT");
        console.log(coeff[3], coeff[2], coeff[1], coeff[0]);
        
        // // if n = 3, manually calculate the roots following cubic formula to find the roots
        // if (n === 3) {
        //     const a = coeff[3] as number;
        //     const b = coeff[2] as number;
        //     const c = coeff[1] as number;
        //     const d = coeff[0] as number;

        //     // Cardano's method for solving cubic equations
        //     const discriminant = 18 * a * b * c * d - 4 * b * b * b * d + b * b * c * c - 4 * a * c * c * c - 27 * a * a * d * d;

        //     // Use Cardano's method (handled with real and complex cases)
        //     const roots: (number | Complex)[] = [];

        //     // Normalize coefficients: x^3 + A x^2 + B x + C = 0
        //     const A = b / a;
        //     const B = c / a;
        //     const C = d / a;

        //     // Compute intermediate values
        //     const Q = (3 * B - A * A) / 9;
        //     const R = (9 * A * B - 27 * C - 2 * A * A * A) / 54;
        //     const Cardano_discriminant = Q * Q * Q + R * R; // Discriminant for depressed cubic

        //     if (Cardano_discriminant >= 0) {
        //         // One real root and two complex conjugates (or all real with multiplicities)
        //         const sqrtD = Math.sqrt(Cardano_discriminant);
        //         const S = Math.cbrt(R + sqrtD);
        //         const T = Math.cbrt(R - sqrtD);

        //         const y1 = S + T;
        //         const x1 = y1 - A / 3;
        //         roots.push(Number.isFinite(x1) ? x1 : math.complex(x1, 0));

        //         // Complex conjugate pair
        //         const realPart = -(S + T) / 2 - A / 3;
        //         const imagPart = (S - T) * Math.sqrt(3) / 2;
        //         roots.push(math.complex(realPart, imagPart));
        //         roots.push(math.complex(realPart, -imagPart));
        //     } else {
        //         // Three distinct real roots
        //         // const rho = Math.sqrt(-Q * Q * Q);
        //         // Guard R / sqrt(-Q^3) in [-1,1] numerically
        //         const cosArg = Math.max(-1, Math.min(1, R / Math.sqrt(-Q * Q * Q)));
        //         const theta = Math.acos(cosArg);

        //         const twoSqrtNegQ = 2 * Math.sqrt(-Q);
        //         const y1 = twoSqrtNegQ * Math.cos(theta / 3);
        //         const y2 = twoSqrtNegQ * Math.cos((theta + 2 * Math.PI) / 3);
        //         const y3 = twoSqrtNegQ * Math.cos((theta + 4 * Math.PI) / 3);

        //         roots.push(y1 - A / 3);
        //         roots.push(y2 - A / 3);
        //         roots.push(y3 - A / 3);
        //     }
            
        //     console.log("Roots calculated via Cardano's method:", roots);

        //     return {
        //         polynomial: `${determinantExpr.expression} = 0`,
        //         eigenvalues: roots,
        //     };
        // }

        return {
            polynomial: `${determinantExpr.expression.toString()} = 0`,
            eigenvalues: solveRealRoots(coeff.reverse() as number[]),
        };
    }

  // For larger matrices, use numerical approach or special cases
  return {
    polynomial: `Characteristic polynomial: ${determinantExpr} = 0`,
    eigenvalues: solveNumerically(inputMatrix)
  };
}

// /**
//  * Check if matrix is diagonal
//  */
// function isDiagonalMatrix(matrix: number[][]): boolean {
//   const n = matrix.length;
//   for (let i = 0; i < n; i++) {
//     for (let j = 0; j < n; j++) {
//       if (i !== j && Math.abs(matrix[i][j]) > 1e-10) {
//         return false;
//       }
//     }
//   }
//   return true;
// }

// /**
//  * Check if numerical matrix is triangular
//  */
// function isTriangularNumerical(matrix: number[][]): boolean {
//   const n = matrix.length;
//   let isUpper = true;
//   let isLower = true;
  
//   for (let i = 0; i < n; i++) {
//     for (let j = 0; j < n; j++) {
//       if (i > j && Math.abs(matrix[i][j]) > 1e-10) {
//         isUpper = false;
//       }
//       if (i < j && Math.abs(matrix[i][j]) > 1e-10) {
//         isLower = false;
//       }
//     }
//   }
  
//   return isUpper || isLower;
// }

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
    if (eigenvalue !== null ) {
    // Round eigenvalue if it's very close to a whole number or zero
    const roundedEigenvalue = Math.abs(eigenvalue % 1) < 1e-4 || Math.abs(eigenvalue % 1) > 1 - 1e-4 
      ? Math.round(eigenvalue) 
      : eigenvalue;
    eigenvalues.push(roundedEigenvalue);
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
 * Helper functions to format mathematical content for LaTeX display
 */

/**
 * Format matrix for LaTeX display
 */
function formatMatrixLatex(matrix: (string | number)[][]): string {
  const rows = matrix.map(row => 
    row.map(cell => {
      if (typeof cell === 'string') {
        // Replace 'x' with proper LaTeX variable
        return cell.replace(/x/g, '\\lambda');
      }
      return cell.toString();
    }).join(' & ')
  ).join(' \\\\ ');
  
  return `\\begin{bmatrix} ${rows} \\end{bmatrix}`;
}

/**
 * Format expression for LaTeX display
 */
function formatExpressionLatex(expression: string): string {
  return expression
    .replace(/x/g, '\\lambda')
    .replace(/\*/g, '\\cdot')
    .replace(/\^(\d+)/g, '^{$1}')
    // .replace(/\(/g, '\\left(')
    // .replace(/\)/g, '\\right)');
}

function cleanExpressionLatex(expression: string): string {
  const final = expression
    .replace(/\\left/g, '')
    .replace(/\\right/g, '').replace(/\\Bigl/g, '').replace(/\\Bigr/g, '').replace(/\\biggr/g, '').replace(/\\biggl/g, '').replace(/\\cdot/g, '*').replace(/\\lambda/g, 'x').replace(/\\newline/g, '').replace(/\[/g, '(').replace(/\]/g, ')');
    console.log("CLEANED EXPRESSION:", final);
    return final;
}

/**
 * Format polynomial for LaTeX display
 */
function formatPolynomialLatex(polynomial: string): string {
  return polynomial
    .replace(/x/g, '\\lambda')
    .replace(/\^(\d+)/g, '^{$1}')
    .replace(/\*/g, '\\cdot')
    .replace(/= 0/g, '= 0');
}

/**
 * Format eigenvalues for LaTeX display
 */
function formatEigenvaluesLatex(eigenvalues: (number | Complex)[]): string {
  const formattedValues = eigenvalues.map(val => {
    if (typeof val === 'number') {
      return val.toFixed(4);
    } else {
      // Handle Complex numbers
      const complex = val as Complex;
      if (complex.im === 0) {
        return complex.re.toFixed(4);
      } else if (complex.re === 0) {
        return `${complex.im.toFixed(4)}i`;
      } else {
        const sign = complex.im >= 0 ? '+' : '-';
        return `${complex.re.toFixed(4)} ${sign} ${Math.abs(complex.im).toFixed(4)}i`;
      }
    }
  });
  
  return `\\sigma(A) = \\{${formattedValues.join(', ')}\\}`;
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

import { type Eigenspace } from './eigen-types';

function findEigenvectorBasis(xIMinusA: (string | number)[][], eigenvalue: number | Complex): Eigenspace {
    // console.log("TEST");
    const xIMinusACopy = JSON.parse(JSON.stringify(xIMinusA)) as (string | number)[][];
    console.log("xI - A matrix:", formatMatrix(xIMinusACopy));
    // console.log("dimensions:", xIMinusA.length, xIMinusA[0].length);

    for (let i = 0; i < xIMinusACopy.length; i++) {
        for (let j = 0; j < xIMinusACopy[i].length; j++) {
            // console.log("Element:", xIMinusA[i][j]);
            // console.log("Type:", typeof xIMinusA[i][j]);
            if (typeof xIMinusACopy[i][j] === 'string') {
                // Replace 'x' with eigenvalue
                const x = math.evaluate((xIMinusACopy[i][j] as string).replace(/x/g, `${eigenvalue.toString()}`))

                console.log("X:", x);
                console.log("EIGENVALUE: ", eigenvalue.toString());
                xIMinusACopy[i][j] = x;
            }
        }
    }
    console.log('Matrix for eigenvalue', eigenvalue, ':', formatMatrix(xIMinusACopy));


    // row reduce the matrix to find null space
    const nullSpace = nullSpaceBasis(xIMinusACopy as number[][]);
    console.log("EigenSpace Basis", formatMatrix(nullSpace));

    return {
        eigenvalue,
        basis: nullSpace,
    };
}

/**
 * Alternative coefficient extraction when math.rationalize fails
 * Manually extracts polynomial coefficients from a MathNode expression
 */
function extractPolynomialCoefficients(expression: MathNode): characteristicPolynomial {
  try {
    // First try symbolic differentiation approach for better accuracy
    const symbolicCoeffs = extractCoefficientsSymbolically(expression);
    if (symbolicCoeffs.length > 0) {
      return {
        expression: expression,
        variables: ['x'],
        coefficients: symbolicCoeffs
      };
    }
  } catch (error) {
    console.warn('Symbolic coefficient extraction failed:', error);
  }

  try {
    // Compile the expression for evaluation
    const compiled = expression.compile();
    const variables = ['x'];
    
    // Try to extract coefficients by evaluating at different points
    // For a polynomial of degree n, we need n+1 points to determine all coefficients
    const maxDegree = 8; // Reasonable maximum for eigenvalue problems
    const values: number[] = [];
    
    // Generate evaluation points - use 0, 1, -1, 2, -2, etc for better numerical stability
    const evaluationPoints = [0];
    for (let i = 1; i <= maxDegree; i++) {
      evaluationPoints.push(i);
      if (i <= maxDegree / 2) evaluationPoints.push(-i);
    }
    
    // Evaluate at points and collect values
    for (let i = 0; i <= maxDegree; i++) {
      try {
        const point = i < evaluationPoints.length ? evaluationPoints[i] : i;
        const value = compiled.evaluate({ x: point });
        values.push(typeof value === 'number' ? value : 0);
      } catch {
        values.push(0);
      }
    }
    
    // Use improved coefficient extraction
    const coefficients = extractCoefficientsFromValues(values);
    
    return {
      expression: expression,
      variables: variables,
      coefficients: coefficients
    };
  } catch (error) {
    console.warn('Numerical coefficient extraction failed:', error);
    return createFallbackPolynomial(expression.toString());
  }
}

/**
 * Extract coefficients using symbolic differentiation (Taylor series at x=0)
 * For polynomial f(x) = anx^n + ... + a1x + a0
 * ai = f^(i)(0) / i!
 */
function extractCoefficientsSymbolically(expression: MathNode): number[] {
  const coefficients: number[] = [];
  let currentExpression = expression;
  
  try {
    // Extract coefficients up to degree 8 (reasonable for eigenvalue problems)
    for (let order = 0; order <= 8; order++) {
      // Evaluate the current derivative at x = 0
      const compiled = currentExpression.compile();
      const value = compiled.evaluate({ x: 0 });
      
      if (typeof value === 'number' && isFinite(value)) {
        // Calculate factorial
        let factorial = 1;
        for (let i = 1; i <= order; i++) {
          factorial *= i;
        }
        
        // The coefficient is f^(n)(0) / n!
        const coefficient = value / factorial;
        coefficients.push(coefficient);
        
        // If coefficient is essentially zero and we have some coefficients, check if we're done
        if (Math.abs(coefficient) < 1e-14 && coefficients.length > 1) {
          // Try one more derivative to confirm we're at the end
          try {
            const nextDerivative = math.derivative(currentExpression, 'x');
            const nextValue = nextDerivative.compile().evaluate({ x: 0 });
            if (typeof nextValue === 'number' && Math.abs(nextValue) < 1e-14) {
              break; // We've found all non-zero coefficients
            }
          } catch {
            break; // Can't take more derivatives, we're done
          }
        }
        
        // Take the derivative for the next iteration
        if (order < 8) {
          try {
            currentExpression = math.derivative(currentExpression, 'x');
          } catch {
            // Can't differentiate further
            break;
          }
        }
      } else {
        break; // Non-numeric result, stop here
      }
    }
    
    // Convert from [a0, a1, a2, ...] to [an, an-1, ..., a0] format
    const result = coefficients.reverse();
    
    // Remove leading zeros (highest degree terms that are zero)
    while (result.length > 1 && Math.abs(result[0]) < 1e-14) {
      result.shift();
    }
    
    return result;
  } catch (error) {
    console.warn('Symbolic differentiation failed:', error);
    return [];
  }
}

/**
 * Extract polynomial coefficients from function values using Vandermonde matrix method
 */
function extractCoefficientsFromValues(values: number[]): number[] {
  try {
    // For polynomial extraction, we use strategic evaluation points around 0
    // This works better than consecutive integers for numerical stability
    const n = values.length;
    
    // First try to determine the actual degree by finding differences
    const actualDegree = findPolynomialDegree(values);
    
    if (actualDegree >= 0 && actualDegree < n) {
      // Use Vandermonde matrix method with the right number of points
      const points: number[] = [];
      for (let i = 0; i <= actualDegree; i++) {
        points.push(i);
      }
      
      const relevantValues = values.slice(0, actualDegree + 1);
      const coefficients = solveVandermonde(points, relevantValues);
      
      // Convert from [a0, a1, a2, ...] to [an, an-1, ..., a0] format
      return coefficients.reverse();
    }
    
    // Fallback to all values if degree detection fails
    const points: number[] = [];
    for (let i = 0; i < n; i++) {
      points.push(i);
    }
    
    const coefficients = solveVandermonde(points, values);
    return coefficients.reverse();
    
  } catch (error) {
    console.warn('Vandermonde method failed, using finite differences fallback:', error);
    return extractCoefficientsFiniteDifferences(values);
  }
}

/**
 * Find the degree of a polynomial from its values at consecutive integers
 */
function findPolynomialDegree(values: number[]): number {
  if (values.length <= 1) return 0;
  
  let differences = [...values];
  
  for (let degree = 0; degree < values.length - 1; degree++) {
    // Calculate next level of differences
    const nextDifferences: number[] = [];
    for (let i = 0; i < differences.length - 1; i++) {
      nextDifferences.push(differences[i + 1] - differences[i]);
    }
    
    // If all differences are essentially zero, we found the degree
    const maxDiff = Math.max(...nextDifferences.map(Math.abs));
    if (maxDiff < 1e-10) {
      return degree;
    }
    
    differences = nextDifferences;
    if (differences.length === 0) break;
  }
  
  return values.length - 1; // Couldn't determine, assume max degree
}

/**
 * Solve Vandermonde system to find polynomial coefficients
 * Given points [x0, x1, ..., xn] and values [y0, y1, ..., yn]
 * Find coefficients [a0, a1, ..., an] such that Σ ai*xi^j = yi
 */
function solveVandermonde(points: number[], values: number[]): number[] {
  const n = points.length;
  if (n !== values.length) {
    throw new Error('Points and values arrays must have the same length');
  }
  
  // Build Vandermonde matrix: [1, x, x^2, x^3, ...]
  const matrix: number[][] = [];
  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      matrix[i][j] = Math.pow(points[i], j);
    }
  }
  
  // Solve using Gaussian elimination
  return gaussianElimination(matrix, values);
}

/**
 * Simple Gaussian elimination for small systems
 */
function gaussianElimination(A: number[][], b: number[]): number[] {
  const n = A.length;
  const augmented: number[][] = [];
  
  // Create augmented matrix
  for (let i = 0; i < n; i++) {
    augmented[i] = [...A[i], b[i]];
  }
  
  // Forward elimination
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    
    // Swap rows
    if (maxRow !== i) {
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
    }
    
    // Check for singular matrix
    if (Math.abs(augmented[i][i]) < 1e-12) {
      throw new Error('Matrix is singular or nearly singular');
    }
    
    // Make all rows below this one 0 in current column
    for (let k = i + 1; k < n; k++) {
      const factor = augmented[k][i] / augmented[i][i];
      for (let j = i; j < n + 1; j++) {
        augmented[k][j] -= factor * augmented[i][j];
      }
    }
  }
  
  // Back substitution
  const x: number[] = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = augmented[i][n];
    for (let j = i + 1; j < n; j++) {
      x[i] -= augmented[i][j] * x[j];
    }
    x[i] /= augmented[i][i];
  }
  
  return x;
}

/**
 * Fallback finite differences method (improved version)
 */
function extractCoefficientsFiniteDifferences(values: number[]): number[] {
  const coefficients: number[] = [];
  let differences = [...values];
  
  // Extract coefficients using finite differences
  for (let level = 0; level < values.length && differences.length > 0; level++) {
    if (level === 0) {
      // Constant term is f(0)
      coefficients.push(differences[0]);
    } else {
      // Calculate differences
      const nextDifferences: number[] = [];
      for (let i = 0; i < differences.length - 1; i++) {
        nextDifferences.push(differences[i + 1] - differences[i]);
      }
      
      if (nextDifferences.length > 0) {
        // The coefficient for x^level is the first difference / level!
        let factorial = 1;
        for (let f = 1; f <= level; f++) {
          factorial *= f;
        }
        
        const coefficient = nextDifferences[0] / factorial;
        coefficients.push(coefficient);
      }
      
      differences = nextDifferences;
      
      // Stop if differences become negligible
      if (Math.max(...differences.map(Math.abs)) < 1e-12) {
        break;
      }
    }
  }
  
  // Convert from [a0, a1, a2, ...] to [an, an-1, ..., a0] format and clean up
  return coefficients.reverse().filter((coeff, index, arr) => {
    // Remove leading zeros but keep at least one coefficient
    return index < arr.length - 1 ? Math.abs(coeff) > 1e-12 : true;
  });
}

/**
 * Create a fallback polynomial structure when all other methods fail
 */
function createFallbackPolynomial(expressionStr: string): characteristicPolynomial {
  console.warn('Using fallback polynomial creation for expression:', expressionStr);
  
  try {
    // Try to parse as a simple mathjs expression
    const parsed = math.parse(expressionStr);
    
    // For simple cases, try to extract coefficients manually
    if (expressionStr.includes('x')) {
      // Attempt basic pattern matching for simple polynomials
      const coefficients = extractBasicCoefficients(expressionStr);
      
      return {
        expression: parsed,
        variables: ['x'],
        coefficients: coefficients
      };
    } else {
      // Constant expression
      const value = math.evaluate(expressionStr);
      return {
        expression: parsed,
        variables: [],
        coefficients: [typeof value === 'number' ? value : 0]
      };
    }
  } catch (error) {
    console.error('Fallback polynomial creation failed:', error);
    
    // Ultimate fallback: return a basic linear polynomial
    return {
      expression: 'x',
      variables: ['x'],
      coefficients: [1, 0] // Represents x + 0
    };
  }
}

/**
 * Extract basic coefficients from string patterns (very simple cases)
 */
function extractBasicCoefficients(expressionStr: string): number[] {
  // This is a simplified pattern matcher for basic polynomial forms
  // Handle cases like "x - 1", "x^2 - 2*x + 1", etc.
  
  try {
    // For expressions like "(x - a)^n", try to expand mentally for small n
    const powerMatch = expressionStr.match(/\(x\s*[-+]\s*(\d+(?:\.\d+)?)\)\^(\d+)/);
    if (powerMatch) {
      const a = parseFloat(powerMatch[1]);
      const n = parseInt(powerMatch[2]);
      const sign = expressionStr.includes('x -') ? 1 : -1;
      
      if (n <= 5) {
        return expandBinomialPower(sign * a, n);
      }
    }
    
    // Fallback: assume it's linear x + c
    const constantMatch = expressionStr.match(/[-+]\s*(\d+(?:\.\d+)?)/);
    const constant = constantMatch ? parseFloat(constantMatch[1]) : 0;
    const hasNegativeConstant = expressionStr.includes('- ' + Math.abs(constant));
    
    return [1, hasNegativeConstant ? -Math.abs(constant) : constant]; // x + c
  } catch {
    return [1, 0]; // Default to x
  }
}

/**
 * Expand (x ± a)^n using binomial theorem for small n
 */
function expandBinomialPower(a: number, n: number): number[] {
  const coefficients = new Array(n + 1).fill(0);
  
  // Use binomial theorem: (x + a)^n = Σ C(n,k) * x^(n-k) * a^k
  for (let k = 0; k <= n; k++) {
    const binomialCoeff = binomialCoefficient(n, k);
    const xPower = n - k;
    const aPower = Math.pow(a, k);
    
    coefficients[xPower] = binomialCoeff * aPower;
  }
  
  return coefficients;
}

/**
 * Calculate binomial coefficient C(n, k)
 */
function binomialCoefficient(n: number, k: number): number {
  if (k > n) return 0;
  if (k === 0 || k === n) return 1;
  
  let result = 1;
  for (let i = 0; i < k; i++) {
    result *= (n - i) / (i + 1);
  }
  
  return Math.round(result); // Round to handle floating point precision
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

  let mathjsexp: characteristicPolynomial;
  
  const simplified = math.simplify(cleanExpressionLatex(determinantExpression))
  if (n != 5) {
    console.log("SIMPLIFIED:", simplified.toString());
    mathjsexp = math.rationalize(simplified, {}, true);
  }else {
      // First attempt: use math.rationalize
    //   console.log('Determinant expression: (Rationalized)', mathjsexp.expression.toString());
    //   console.log('Coefficients:', mathjsexp.coefficients);
      
      mathjsexp = extractPolynomialCoefficients(simplified);
      console.log('Determinant expression: (Manual extraction)', mathjsexp.expression.toString());
      console.log('Coefficients:', mathjsexp.coefficients);
    }
  
  // Step 3: Solve characteristic polynomial
//   const polynomialResult = mathjsexp ? 
//     solveCharacteristicPolynomial(mathjsexp, inputMatrix) :
//     { polynomial: `${determinantExpression} = 0`, eigenvalues: [] as (number | Complex)[] };
     const polynomialResult = solveCharacteristicPolynomial(mathjsexp, inputMatrix);
//   const polynomialResult = solveCharacteristicPolynomial("", inputMatrix);
  // compare solution to mathjs
//   try {
      const mathjsResult = math.eigs(inputMatrix);
    console.warn('Eigenvalues (mathjs):', mathjsResult.values);
// } finally {
      console.warn('Eigenvalues (manual):', polynomialResult);
// }
      

  // Additional calculations
  const trace = calculateTraceManual(inputMatrix);
  const isReal = polynomialResult.eigenvalues.every((val: number | Complex) => 
    typeof val === 'number' && isFinite(val) && !isNaN(val)
  ) && polynomialResult.eigenvalues.length != 0;

  // Calculate eigenspaces for each eigenvalue
  const eigenspaces: Eigenspace[] = [];
  for (const val of polynomialResult.eigenvalues) {
    console.log('---Finding eigenvector basis for eigenvalue:---', val);
    const eigenspace = findEigenvectorBasis(xIMinusA, val);
    eigenspaces.push(eigenspace);
  }
  
  
  const steps = {
    step1_xIMinusA: React.createElement('div', null,
      React.createElement('h4', null, 'Step 1: Create xI - A matrix'),
        
      React.createElement(MathDisplay, { latex: formatMatrixLatex(xIMinusA), block: true })
    ),
    step2_determinant: React.createElement('div', null,
      React.createElement('h4', null, 'Step 2: Calculate det(xI - A)'),
      React.createElement(MathDisplay, { latex: `\\det(xI - A) = ${formatExpressionLatex(determinantExpression)}`, block: true })
    ),
    step3_polynomial: React.createElement('div', null,
      React.createElement('h4', null, 'Step 3: Characteristic Polynomial'),
      React.createElement(MathDisplay, { latex: formatPolynomialLatex(polynomialResult.polynomial), block: true })
    ),
    step4_eigenvalues: React.createElement('div', null,
      React.createElement('h4', null, 'Step 4: Eigenvalues σ(A)'),
      React.createElement(MathDisplay, { latex: formatEigenvaluesLatex(polynomialResult.eigenvalues), block: true })
    )
  };
  
  return {
    eigenvalues: polynomialResult.eigenvalues,
    eigenspaces,
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
export function displayStepByStep(inputMatrix: number[][]): React.JSX.Element {
  const result = findEigenvalues(inputMatrix);
  
  return React.createElement('div', { className: 'eigenvalue-solution card' },
    result.steps.step1_xIMinusA,
    result.steps.step2_determinant,
    result.steps.step3_polynomial,
    result.steps.step4_eigenvalues,
    React.createElement('div', { className: 'summary' },
      React.createElement('h4', null, 'Summary'),
      React.createElement(MathDisplay, { 
        latex: `\\text{All eigenvalues are real: } ${result.isReal}`,
        block: true 
      }),
    //   React.createElement(MathDisplay, { 
        // latex: ``,
        // block: true 
    //   })
    )
  );
}
