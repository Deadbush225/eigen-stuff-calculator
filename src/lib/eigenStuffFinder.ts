import React from 'react';
import MathDisplay from '../components/util/MathDisplay';

import { type Complex } from 'mathjs';
import { formatMatrix, multiplyMatrices, dotProduct, calculateDeterminant, calculateTraceManual, findNullSpace, isTriangularMatrix } from './matrixOperations';
import { solveRealRoots, validateEigenvalues } from './realRootsSolver';
import { math, type characteristicPolynomial } from './math';
import { calculateTriangularDeterminant, assembleNbyNDeterminantExpression } from './determinantFinder';
import { formatMatrixLatex, formatExpressionLatex, formatEigenvaluesLatex, cleanExpressionLatex, splitLatexByOperators } from './latexFormatter';
import { expandPolynomialManual } from './expressionDeflater';

// Type alias for clarity: A polynomial is an array of coefficients [an, ..., a0]
import { type LatexString } from './math';


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

/**
 * Step 2: Calculate determinant manually to get characteristic polynomial
 * Manually implements determinant calculation for different matrix sizes
 */
function calculateDeterminantExpression(xIMinusA: (string | number)[][]): LatexString {

  // Check for special cases first
  if (isTriangularMatrix(xIMinusA)) {
    return calculateTriangularDeterminant(xIMinusA);
  }
  
  return assembleNbyNDeterminantExpression(xIMinusA);
  
}

/**
 * Step 3: Parse and solve characteristic polynomial manually
 * Converts the determinant expression into a polynomial and finds roots
 */
function solveCharacteristicPolynomial(
  determinantExpr: characteristicPolynomial, 
  inputMatrix: number[][]
): { polynomial: string, eigenvalues: (number|Complex)[] } {
  const coeff = determinantExpr.coefficients as number[];

    console.log("USING MATHJS POLY ROOT");
    console.log(coeff.reverse());

    // use numerical approach for n = 1 to 3
    let roots: number[] = [];
    if (coeff.length <= 4) {
    roots = solveRealRoots(coeff.reverse() as number[], determinantExpr.expression.toString());
    } else {
        console.log("Newton-Raphson method failed to find roots");
        
        // For 4x4 and 5x5 matrices, try diagonalization method
        if (inputMatrix.length === 4 || inputMatrix.length === 5) {
            console.log(`Matrix size: ${inputMatrix.length}x${inputMatrix.length}, attempting diagonalization method...`);
            
            try {
                const diagonalizationRoots = findEigenvaluesByDiagonalization(inputMatrix);
                if (diagonalizationRoots.length > 0) {
                    console.log("✓ Diagonalization method successful:", diagonalizationRoots);
                    roots = validateEigenvalues(diagonalizationRoots);
                } else {
                    console.log("❌ Diagonalization method also failed");
                }
            } catch (error) {
                console.warn("Diagonalization method failed:", error);
            }
        }
        
        // Final fallback: math.js eigs()
        if (roots.length === 0) {
            console.log("Using math.js eigs() as final fallback...");
            try {
                const mathjsRoots = math.eigs(inputMatrix).values;
                roots = mathjsRoots as number[];
                console.log("✓ math.js eigs() successful:", roots);
            } catch (error) {
                console.error("Even math.js eigs() failed:", error);
                roots = [];
            }
        }
    }

    return {
        polynomial: `${determinantExpr.expression.toString()} = 0`,
        eigenvalues: roots,
    };
  
}

/**
 * Find eigenvalues using diagonalization method
 * Uses QR algorithm or power iteration for numerical eigenvalue computation
 */
function findEigenvaluesByDiagonalization(matrix: number[][]): number[] {
    console.log("=== DIAGONALIZATION METHOD ===");
    console.log("Input matrix:", matrix);
    
    try {
        // Method 1: QR Algorithm (most robust)
        const qrEigenvalues = qrAlgorithm(matrix);
        if (qrEigenvalues.length > 0) {
            console.log("QR Algorithm found eigenvalues:", qrEigenvalues);
            return qrEigenvalues;
        }
    } catch (error) {
        console.warn("QR Algorithm failed:", error);
    }
    return [];
}

/**
 * QR Algorithm for eigenvalue computation
 */
function qrAlgorithm(A: number[][], maxIterations = 100, tolerance = 1e-10): number[] {
    const n = A.length;
    let Ak = A.map(row => [...row]); // Copy matrix
    
    for (let iter = 0; iter < maxIterations; iter++) {
        // QR decomposition
        const { Q, R } = qrDecomposition(Ak);
        
        // Update: A_{k+1} = R * Q
        Ak = multiplyMatrices(R, Q);
        
        // Check convergence (off-diagonal elements should approach 0)
        let converged = true;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i !== j && Math.abs(Ak[i][j]) > tolerance) {
                    converged = false;
                    break;
                }
            }
            if (!converged) break;
        }
        
        if (converged) {
            console.log(`QR Algorithm converged in ${iter + 1} iterations`);
            break;
        }
    }
    
    // Extract eigenvalues from diagonal
    const eigenvalues: number[] = [];
    for (let i = 0; i < n; i++) {
        eigenvalues.push(Ak[i][i]);
    }
    
    return eigenvalues.filter(val => isFinite(val));
}

/**
 * QR Decomposition using Gram-Schmidt process
 */
function qrDecomposition(A: number[][]): { Q: number[][], R: number[][] } {
    const m = A.length;
    const n = A[0].length;
    
    const Q: number[][] = Array(m).fill(null).map(() => Array(n).fill(0));
    const R: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));
    
    // Gram-Schmidt process
    for (let j = 0; j < n; j++) {
        // Get column j of A
        const aj: number[] = [];
        for (let i = 0; i < m; i++) {
            aj[i] = A[i][j];
        }
        
        // Start with aj
        const qj = [...aj];
        
        // Subtract projections onto previous Q columns
        for (let k = 0; k < j; k++) {
            const qk: number[] = [];
            for (let i = 0; i < m; i++) {
                qk[i] = Q[i][k];
            }
            
            const projection = dotProduct(aj, qk);
            R[k][j] = projection;
            
            for (let i = 0; i < m; i++) {
                qj[i] -= projection * qk[i];
            }
        }
        
        // Normalize qj
        const norm = Math.sqrt(qj.reduce((sum, val) => sum + val * val, 0));
        R[j][j] = norm;
        
        if (norm > 1e-15) {
            for (let i = 0; i < m; i++) {
                Q[i][j] = qj[i] / norm;
            }
        }
    }
    
    return { Q, R };
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
  
  return calculateDeterminant(AMinusLambdaI);
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

                // console.log("X:", x);
                // console.log("EIGENVALUE: ", eigenvalue.toString());
                xIMinusACopy[i][j] = x;
            }
        }
    }
    console.log('Matrix for eigenvalue', eigenvalue, ':', formatMatrix(xIMinusACopy));

    // row reduce the matrix to find null space
    let nullSpace = findNullSpace(xIMinusACopy as number[][]);
    
    // Verify we have valid eigenvectors (non-zero)
    const validBasis = nullSpace.filter(vec => 
        vec.some(component => Math.abs(component) > 1e-12)
    );
    
    // If no valid eigenvectors found, this suggests numerical issues
    if (validBasis.length === 0) {
        console.warn(`No valid eigenvectors found for eigenvalue ${eigenvalue}. Using fallback method.`);
    }
    
    console.log("EigenSpace Basis", formatMatrix(nullSpace));

    return {
        eigenvalue,
        basis: nullSpace,
    };
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
  
  const simplified = math.simplify(cleanExpressionLatex(determinantExpression))
  console.log("SIMPLIFIED EXPRESSION:", simplified.toString());
  
  let mathjsexp: characteristicPolynomial;
  
//   try {
//     // Always try math.js rationalize first, regardless of matrix size
//     console.log("Attempting math.js rationalize...");
//     mathjsexp = math.rationalize(simplified, {}, true);
//     console.log('Rationalize successful. Coefficients:', mathjsexp.coefficients);
//   } catch (error) {
    // console.warn('Math.js rationalize failed, using manual extraction:', error);
    // Fallback to manual extraction
    mathjsexp = expandPolynomialManual(simplified.toString());
    // mathjsexp = extractPolynomialCoefficients(simplified);
    console.log('Manual extraction expression:', mathjsexp.expression.toString());
    console.log('Manual extraction coefficients:', mathjsexp.coefficients);
//   }
  
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
    step2_determinant: React.createElement('div', {className: 'dynamix-latex'},
      React.createElement('h4', null, 'Step 2: Calculate det(xI - A)'),
      React.createElement(MathDisplay, { latex: `\\det(xI - A) = ${splitLatexByOperators(formatExpressionLatex(determinantExpression))}`, block: true,  })
    ),
    step3_polynomial: React.createElement('div', {className: 'dynamix-latex'},
      React.createElement('h4', null, 'Step 3: Characteristic Polynomial'),
      React.createElement(MathDisplay, { latex: formatExpressionLatex(polynomialResult.polynomial), block: true })
    ),
    step4_eigenvalues: React.createElement('div', {className: 'dynamix-latex'},
      React.createElement('h4', null, 'Step 4: Eigenvalues σ(A)'),
      React.createElement(MathDisplay, { latex: formatEigenvaluesLatex(polynomialResult.eigenvalues), block: true }),
    //   React.createElement(MathDisplay, { latex: mathjsResult.values.toString(), block: true })
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
        latex: `\\text{All eigenvalues are real: } ${result.isReal}\\newline\\text{Trace: } \\operatorname{tr}(A) = ${result.trace}`,
        block: true 
      }),
    )
  );
}
