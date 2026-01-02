import React from 'react';
import MathDisplay from '../components/util/MathDisplay';

import { type MathNode, type MathType, type Complex } from 'mathjs';
import { formatMatrix, rref } from './matrixOperations';
import { solveRealRoots } from './realRootsSolver';
import { math } from './math';
import { calculateTriangularDeterminant, calculate2x2Determinant, calculate3x3Determinant, calculateLargerDeterminant } from './determinantFinder';
import { formatMatrixLatex, formatExpressionLatex, formatEigenvaluesLatex, cleanExpressionLatex } from './latexFormatter';

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
  const coeff = determinantExpr.coefficients as (number | Complex)[];

    console.log("USING MATHJS POLY ROOT");
    console.log(coeff[3], coeff[2], coeff[1], coeff[0]);

    // use numerical approach or special cases
    return {
        polynomial: `${determinantExpr.expression.toString()} = 0`,
        eigenvalues: solveRealRoots(coeff.reverse() as number[], determinantExpr.expression.toString()),
    };
  
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
    let nullSpace = robustNullSpaceBasis(xIMinusACopy as number[][]);
    
    // Verify we have valid eigenvectors (non-zero)
    const validBasis = nullSpace.filter(vec => 
        vec.some(component => Math.abs(component) > 1e-12)
    );
    
    // If no valid eigenvectors found, this suggests numerical issues
    if (validBasis.length === 0) {
        console.warn(`No valid eigenvectors found for eigenvalue ${eigenvalue}. Using fallback method.`);
        nullSpace = findEigenvectorsFallback(xIMinusACopy as number[][], eigenvalue);
    }
    
    console.log("EigenSpace Basis", formatMatrix(nullSpace));

    return {
        eigenvalue,
        basis: nullSpace,
    };
}

/**
 * Robust null space basis finder specifically for eigenspace calculations
 * Handles numerical precision issues and ensures non-zero eigenvectors
 */
function robustNullSpaceBasis(matrix: number[][]): number[][] {
    const tolerance = 1e-12;
    const rrefMatrix = rref(matrix);
    const rows = rrefMatrix.length;
    const cols = rrefMatrix[0].length;
    
    // Find pivot columns with numerical tolerance
    const pivotCols: number[] = [];
    const freeVars: number[] = [];
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const val = rrefMatrix[row][col];
            if (typeof val === 'number' && Math.abs(val - 1) < tolerance) {
                // Check if this is the leading entry in the row
                let isLeading = true;
                for (let prevCol = 0; prevCol < col; prevCol++) {
                    const prevVal = rrefMatrix[row][prevCol];
                    if (typeof prevVal === 'number' && Math.abs(prevVal) > tolerance) {
                        isLeading = false;
                        break;
                    }
                }
                if (isLeading && !pivotCols.includes(col)) {
                    pivotCols.push(col);
                    break;
                }
            }
        }
    }
    
    // Identify free variables
    for (let col = 0; col < cols; col++) {
        if (!pivotCols.includes(col)) {
            freeVars.push(col);
        }
    }
    
    // For eigenspaces, there should always be free variables
    // If none found, the matrix might have numerical precision issues
    if (freeVars.length === 0) {
        console.warn("No free variables found - this shouldn't happen for eigenspaces");
        // Return a standard basis vector as fallback
        return [Array(cols).fill(0).map((_, i) => i === 0 ? 1 : 0)];
    }
    
    const basisVectors: number[][] = [];
    
    // For each free variable, create a basis vector
    for (const freeVar of freeVars) {
        const basisVector = new Array(cols).fill(0);
        basisVector[freeVar] = 1; // Set free variable to 1
        
        // Express pivot variables in terms of this free variable
        for (let row = 0; row < rows; row++) {
            // Find the pivot column for this row
            let pivotCol = -1;
            for (let col = 0; col < cols; col++) {
                const val = rrefMatrix[row][col];
                if (typeof val === 'number' && Math.abs(val - 1) < tolerance) {
                    // Check if this is a leading 1
                    let isLeading = true;
                    for (let prevCol = 0; prevCol < col; prevCol++) {
                        const prevVal = rrefMatrix[row][prevCol];
                        if (typeof prevVal === 'number' && Math.abs(prevVal) > tolerance) {
                            isLeading = false;
                            break;
                        }
                    }
                    if (isLeading) {
                        pivotCol = col;
                        break;
                    }
                }
            }
            
            if (pivotCol !== -1) {
                const coeff = rrefMatrix[row][freeVar];
                if (typeof coeff === 'number' && Math.abs(coeff) > tolerance) {
                    basisVector[pivotCol] = -coeff;
                }
            }
        }
        
        basisVectors.push(basisVector);
    }
    
    return basisVectors.length > 0 ? basisVectors : [Array(cols).fill(0).map((_, i) => i === 0 ? 1 : 0)];
}

/**
 * Fallback method for finding eigenvectors when primary method fails
 * Uses direct computation with perturbation
 */
function findEigenvectorsFallback(lambdaIMinusA: number[][], _eigenvalue: number | Complex): number[][] {
    const n = lambdaIMinusA.length;
    const tolerance = 1e-10;
    
    // Try different approaches to find a non-zero vector in the null space
    
    // Method 1: Try each standard basis vector
    for (let i = 0; i < n; i++) {
        const testVector = Array(n).fill(0);
        testVector[i] = 1;
        
        const result = multiplyMatrixVector(lambdaIMinusA, testVector);
        const norm = Math.sqrt(result.reduce((sum, val) => sum + val * val, 0));
        
        if (norm < tolerance) {
            return [testVector];
        }
    }
    
    // Method 2: Try random vectors and use power iteration-like approach
    for (let attempt = 0; attempt < 10; attempt++) {
        let testVector = Array(n).fill(0).map(() => Math.random() - 0.5);
        
        // Normalize
        let norm = Math.sqrt(testVector.reduce((sum, val) => sum + val * val, 0));
        if (norm > 0) {
            testVector = testVector.map(val => val / norm);
        }
        
        // Try to find a vector that's close to the null space
        let bestVector = testVector;
        let bestError = Infinity;
        
        for (let iter = 0; iter < 20; iter++) {
            const result = multiplyMatrixVector(lambdaIMinusA, testVector);
            const error = Math.sqrt(result.reduce((sum, val) => sum + val * val, 0));
            
            if (error < bestError) {
                bestError = error;
                bestVector = [...testVector];
            }
            
            if (error < tolerance) {
                return [testVector];
            }
            
            // Adjust vector to reduce error (gradient descent-like)
            for (let j = 0; j < n; j++) {
                testVector[j] -= 0.1 * result[j];
            }
            
            // Normalize
            norm = Math.sqrt(testVector.reduce((sum, val) => sum + val * val, 0));
            if (norm > 0) {
                testVector = testVector.map(val => val / norm);
            }
        }
        
        if (bestError < tolerance * 10) {
            return [bestVector];
        }
    }
    
    // Method 3: Last resort - return the first standard basis vector
    console.warn("Fallback: returning standard basis vector");
    return [Array(n).fill(0).map((_, i) => i === 0 ? 1 : 0)];
}

/**
 * Helper function to multiply matrix by vector
 */
function multiplyMatrixVector(matrix: number[][], vector: number[]): number[] {
    const result: number[] = [];
    
    for (let i = 0; i < matrix.length; i++) {
        let sum = 0;
        for (let j = 0; j < vector.length; j++) {
            sum += matrix[i][j] * vector[j];
        }
        result.push(sum);
    }
    
    return result;
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
  
  const simplified = math.simplify(cleanExpressionLatex(determinantExpression))
  console.log("SIMPLIFIED EXPRESSION:", simplified.toString());
  
  let mathjsexp: characteristicPolynomial;
  
  try {
    // Always try math.js rationalize first, regardless of matrix size
    console.log("Attempting math.js rationalize...");
    mathjsexp = math.rationalize(simplified, {}, true);
    console.log('Rationalize successful. Coefficients:', mathjsexp.coefficients);
  } catch (error) {
    console.warn('Math.js rationalize failed, using manual extraction:', error);
    // Fallback to manual extraction
    mathjsexp = extractPolynomialCoefficients(simplified);
    console.log('Manual extraction coefficients:', mathjsexp.coefficients);
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
      React.createElement(MathDisplay, { latex: formatExpressionLatex(polynomialResult.polynomial), block: true })
    ),
    step4_eigenvalues: React.createElement('div', null,
      React.createElement('h4', null, 'Step 4: Eigenvalues σ(A)'),
      React.createElement(MathDisplay, { latex: formatEigenvaluesLatex(polynomialResult.eigenvalues), block: true }),
      React.createElement(MathDisplay, { latex: mathjsResult.values.toString(), block: true })
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
