
// Type definitions
type MatrixWString = (string | number)[][];
type Matrix = number[][];
type BasisVector = number[][];

/* ━━━━━━━━━━━━ Elementary Row Operations ━━━━━━━━━━━ */
// E1: Row swap
function E1(matrix: MatrixWString, r1: number, r2: number): MatrixWString {
    const newMatrix = matrix.map(row => [...row]);

    const t = newMatrix[r2];
    newMatrix[r2] = newMatrix[r1];
    newMatrix[r1] = t;

    return newMatrix;
}

// E2: Row scaling
function E2(matrix: MatrixWString, r: number, scalar: number): MatrixWString {
    const newMatrix = matrix.map(row => [...row]);

    for (let j = 0; j < newMatrix[r].length; j++) {
        if (typeof newMatrix[r][j] === 'number') {
            newMatrix[r][j] = (newMatrix[r][j] as number) * scalar;
        } else {
            newMatrix[r][j] = `(${newMatrix[r][j]}) * ${scalar}`;
        }
    }

    return newMatrix;
} 

// E3: Row replacement (r2 = r2 - scalar * r1)
function E3(matrix: MatrixWString, r1: number, r2: number, scalar: number): MatrixWString {
    const newMatrix = matrix.map(row => [...row]);

    for (let j = 0; j < newMatrix[r2].length; j++) {
        if (typeof newMatrix[r2][j] === 'number' && typeof newMatrix[r1][j] === 'number') {
            // Cast to number first to avoid arithmetic on union-typed indexed access
            const a = newMatrix[r2][j] as number;
            const b = newMatrix[r1][j] as number;
            newMatrix[r2][j] = a - b * scalar;
        } else {
            newMatrix[r2][j] = `(${newMatrix[r2][j]}) - (${newMatrix[r1][j]}) * ${scalar}`;
        }
    }

    return newMatrix;
}

/**
 * Reduced Row Echelon Form (RREF) Algorithm
 * Uses elementary row operations to transform matrix to RREF
 */
export function rref(matrix: MatrixWString): MatrixWString {
    // Create a copy to avoid modifying the original matrix
    let result = matrix.map(row => [...row]);
    const rows = result.length;
    const cols = result[0].length;
    
    let currentRow = 0;
    
    // Process each column
    for (let col = 0; col < cols && currentRow < rows; col++) {
        // Step 1: Find a non-zero pivot in current column
        let pivotRowIndex = -1;
        for (let row = currentRow; row < rows; row++) {
            if (typeof result[row][col] === 'number' && result[row][col] !== 0) {
                pivotRowIndex = row;
                break;
            }
        }
        
        // If no pivot found, move to next column
        if (pivotRowIndex === -1) {
            continue;
        }
        
        // Step 2: Swap rows to bring pivot to current position (if needed)
        if (pivotRowIndex !== currentRow) {
            result = E1(result, pivotRowIndex, currentRow);
        }
        
        // Step 3: Scale pivot row to make pivot equal to 1
        const pivotValue = result[currentRow][col] as number;
        if (pivotValue !== 1) {
            result = E2(result, currentRow, 1 / pivotValue);
        }
        
        // Step 4: Eliminate all other entries in the pivot column
        for (let row = 0; row < rows; row++) {
            if (row !== currentRow && typeof result[row][col] === 'number' && result[row][col] !== 0) {
                const multiplier = result[row][col] as number;
                result = E3(result, currentRow, row, multiplier);
            }
        }
        
        currentRow++;
    }
    
    return result;
}

/**
 * Find the rank of a matrix (number of pivot columns in RREF)
 */
export function matrixRank(matrix: MatrixWString): number {
    const rrefMatrix = rref(matrix);
    let rank = 0;
    
    for (let row = 0; row < rrefMatrix.length; row++) {
        // Check if row has a leading 1 (pivot)
        for (let col = 0; col < rrefMatrix[row].length; col++) {
            if (typeof rrefMatrix[row][col] === 'number' && rrefMatrix[row][col] === 1) {
                rank++;
                break;
            }
        }
    }
    
    return rank;
}

/**
 * Identify pivot columns in RREF matrix
 */
export function getPivotColumns(rrefMatrix: MatrixWString): number[] {
    const pivotCols: number[] = [];
    
    for (let row = 0; row < rrefMatrix.length; row++) {
        for (let col = 0; col < rrefMatrix[row].length; col++) {
            if (typeof rrefMatrix[row][col] === 'number' && rrefMatrix[row][col] === 1) {
                // Check if this is the first non-zero entry in the row (leading 1)
                let isLeading = true;
                for (let prevCol = 0; prevCol < col; prevCol++) {
                    if (typeof rrefMatrix[row][prevCol] === 'number' && rrefMatrix[row][prevCol] !== 0) {
                        isLeading = false;
                        break;
                    }
                }
                if (isLeading) {
                    pivotCols.push(col);
                    break;
                }
            }
        }
    }
    
    return pivotCols;
}

/**
 * Robust null space basis finder specifically for eigenspace calculations
 * Handles numerical precision issues and ensures non-zero eigenvectors
 */
export function findNullSpace(matrix: number[][]): number[][] {
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
 * Check if a matrix is in Row Echelon Form (REF)
 */
export function isRowEchelonForm(matrix: MatrixWString): boolean {
    let lastPivotCol = -1;
    
    for (let row = 0; row < matrix.length; row++) {
        let pivotCol = -1;
        
        // Find first non-zero entry (pivot)
        for (let col = 0; col < matrix[row].length; col++) {
            if (typeof matrix[row][col] === 'number' && matrix[row][col] !== 0) {
                pivotCol = col;
                break;
            }
        }
        
        // If this row is all zeros, all subsequent rows should also be all zeros
        if (pivotCol === -1) {
            for (let nextRow = row + 1; nextRow < matrix.length; nextRow++) {
                for (let col = 0; col < matrix[nextRow].length; col++) {
                    if (typeof matrix[nextRow][col] === 'number' && matrix[nextRow][col] !== 0) {
                        return false; // Non-zero row after zero row
                    }
                }
            }
            break; // All remaining rows are zero
        }
        
        // Pivot should be to the right of previous pivot
        if (pivotCol <= lastPivotCol) {
            return false;
        }
        
        lastPivotCol = pivotCol;
    }
    
    return true;
}

/**
 * Check if a matrix is in Reduced Row Echelon Form (RREF)
 */
export function isReducedRowEchelonForm(matrix: MatrixWString): boolean {
    if (!isRowEchelonForm(matrix)) {
        return false;
    }
    
    // Check additional RREF conditions
    for (let row = 0; row < matrix.length; row++) {
        let pivotCol = -1;
        
        // Find pivot column
        for (let col = 0; col < matrix[row].length; col++) {
            if (typeof matrix[row][col] === 'number' && matrix[row][col] !== 0) {
                pivotCol = col;
                break;
            }
        }
        
        if (pivotCol !== -1) {
            // Pivot should be 1
            if (matrix[row][pivotCol] !== 1) {
                return false;
            }
            
            // All other entries in pivot column should be 0
            for (let otherRow = 0; otherRow < matrix.length; otherRow++) {
                if (otherRow !== row && typeof matrix[otherRow][pivotCol] === 'number' && matrix[otherRow][pivotCol] !== 0) {
                    return false;
                }
            }
        }
    }
    
    return true;
}

/**
 * Format matrix for display
 */
export function formatMatrix(matrix: MatrixWString): string {
    const maxWidths: number[] = [];
    
    // Calculate maximum width for each column
    for (let col = 0; col < matrix[0].length; col++) {
        let maxWidth = 0;
        for (let row = 0; row < matrix.length; row++) {
            const cellStr = String(matrix[row][col]);
            maxWidth = Math.max(maxWidth, cellStr.length);
        }
        maxWidths.push(maxWidth);
    }
    
    // Build formatted string
    let result = '';
    for (let row = 0; row < matrix.length; row++) {
        result += '[ ';
        for (let col = 0; col < matrix[row].length; col++) {
            const cellStr = String(matrix[row][col]);
            result += cellStr.padStart(maxWidths[col]);
            if (col < matrix[row].length - 1) {
                result += '  ';
            }
        }
        result += ' ]\n';
    }
    
    return result;
}

/**
 * Solve a system of linear equations Ax = b using RREF
 * Returns the solution vector or null if no unique solution exists
 */
export function solveLinearSystem(A: number[][], b: number[]): number[] | null {
    const rows = A.length;
    const cols = A[0].length;
    
    // Create augmented matrix [A|b]
    const augmented: MatrixWString = A.map((row, i) => [...row, b[i]]);
    
    // Apply RREF to augmented matrix
    const rrefAugmented = rref(augmented);
    
    // Check for inconsistency (row like [0 0 ... 0 | c] where c ≠ 0)
    for (let row = 0; row < rows; row++) {
        let allZeroCoeffs = true;
        for (let col = 0; col < cols; col++) {
            if (typeof rrefAugmented[row][col] === 'number' && rrefAugmented[row][col] !== 0) {
                allZeroCoeffs = false;
                break;
            }
        }
        if (allZeroCoeffs && typeof rrefAugmented[row][cols] === 'number' && rrefAugmented[row][cols] !== 0) {
            return null; // Inconsistent system
        }
    }
    
    // Extract solution (assuming unique solution exists)
    const solution = new Array(cols).fill(0);
    const pivotCols = getPivotColumns(rrefAugmented.map(row => row.slice(0, cols)));
    
    for (let row = 0; row < rows; row++) {
        for (const col of pivotCols) {
            if (typeof rrefAugmented[row][col] === 'number' && rrefAugmented[row][col] === 1) {
                solution[col] = rrefAugmented[row][cols] as number;
                break;
            }
        }
    }
    
    return solution;
}

/**
 * Example usage and testing functions
 */
export function testRREF() {
    console.log('=== RREF Solver Testing ===\n');
    
    // Test 1: Simple 3x3 matrix
    const matrix1: MatrixWString = [
        [1, 2, 3],
        [4, 5, 6], 
        [7, 8, 9]
    ];
    
    console.log('Original Matrix:');
    console.log(formatMatrix(matrix1));
    
    const rref1 = rref(matrix1);
    console.log('RREF:');
    console.log(formatMatrix(rref1));
    
    console.log('Rank:', matrixRank(matrix1));
    console.log('Pivot Columns:', getPivotColumns(rref1));
    
    // Test 2: Matrix with null space
    const matrix2: MatrixWString = [
        [1, 2, 3, 4],
        [2, 4, 6, 8],
        [1, 2, 4, 5]
    ];
    
    console.log('\n--- Matrix with Null Space ---');
    console.log('Original Matrix:');
    console.log(formatMatrix(matrix2));
    
    const rref2 = rref(matrix2);
    console.log('RREF:');
    console.log(formatMatrix(rref2));

    const nullBasis = findNullSpace(matrix2 as Matrix);
    console.log('Null Space Basis:');
    nullBasis.forEach((vec, i) => {
        console.log(`v${i + 1}: [${vec.join(', ')}]`);
    });
    
    // Test 3: Solve linear system
    const A: number[][] = [
        [2, 1, -1],
        [-3, -1, 2],
        [-2, 1, 2]
    ];
    const b: number[] = [8, -11, -3];
    
    console.log('\n--- Linear System Ax = b ---');
    console.log('Matrix A:');
    console.log(formatMatrix(A));
    console.log('Vector b:', b);
    
    const solution = solveLinearSystem(A, b);
    console.log('Solution:', solution ? `[${solution.join(', ')}]` : 'No unique solution');
}

/* ━━━━━━━━━━━━━ Matrix Multiplication ━━━━━━━━━━━━━━ */
export function multiplyMatrices(A: number[][], B: number[][]): number[][] {
    const rows = A.length;
    const cols = B[0].length;
    const inner = B.length;
    
    const result: number[][] = Array(rows).fill(null).map(() => Array(cols).fill(0));
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            for (let k = 0; k < inner; k++) {
                result[i][j] += A[i][k] * B[k][j];
            }
        }
    }
    
    return result;
}

export function multiplyMatrixVector(matrix: number[][], vector: number[]): number[] {
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
 * Check if matrix is triangular (upper or lower)
 */
export function isTriangularMatrix(matrix: (string | number)[][]): boolean {
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


export function dotProduct(a: number[], b: number[]): number {
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
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
 * Calculate numerical determinant using LU decomposition
 */
export function calculateDeterminant(matrix: number[][]): number {
  const n = matrix.length;
  
  if (n === 1) return matrix[0][0];
  if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  
  // Simple cofactor expansion for larger matrices
  let det = 0;
  for (let j = 0; j < n; j++) {
    const minor = getMinor(matrix, 0, j);
    const cofactor = Math.pow(-1, j) * matrix[0][j] * calculateDeterminant(minor);
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
export function calculateTraceManual(matrix: number[][]): number {
  let trace = 0;
  for (let i = 0; i < matrix.length; i++) {
    trace += matrix[i][i];
  }
  return trace;
}
