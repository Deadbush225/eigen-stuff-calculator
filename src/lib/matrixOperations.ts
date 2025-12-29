
// Type definitions
type Matrix = (string | number)[][];
type BasisVector = number[][];

// Elementary Row Operations
// E1: Row swap
function E1(matrix: Matrix, r1: number, r2: number): Matrix {
    const newMatrix = matrix.map(row => [...row]);

    const t = newMatrix[r2];
    newMatrix[r2] = newMatrix[r1];
    newMatrix[r1] = t;

    return newMatrix;
}

// E2: Row scaling
function E2(matrix: Matrix, r: number, scalar: number): Matrix {
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
function E3(matrix: Matrix, r1: number, r2: number, scalar: number): Matrix {
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
export function rref(matrix: Matrix): Matrix {
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
export function matrixRank(matrix: Matrix): number {
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
export function getPivotColumns(rrefMatrix: Matrix): number[] {
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
 * Find the null space basis of a matrix
 * Returns basis vectors for the solution to Ax = 0
 */
export function nullSpaceBasis(matrix: Matrix): BasisVector {
    const rrefMatrix = rref(matrix);
    const rows = rrefMatrix.length;
    const cols = rrefMatrix[0].length;
    
    // Find pivot columns
    const pivotCols = getPivotColumns(rrefMatrix);
    const freeVars: number[] = [];
    
    // Identify free variables (non-pivot columns)
    for (let col = 0; col < cols; col++) {
        if (!pivotCols.includes(col)) {
            freeVars.push(col);
        }
    }
    
    // If no free variables, null space is just the zero vector
    if (freeVars.length === 0) {
        return [new Array(cols).fill(0)];
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
                if (typeof rrefMatrix[row][col] === 'number' && rrefMatrix[row][col] === 1) {
                    // Check if this is a leading 1
                    let isLeading = true;
                    for (let prevCol = 0; prevCol < col; prevCol++) {
                        if (typeof rrefMatrix[row][prevCol] === 'number' && rrefMatrix[row][prevCol] !== 0) {
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
            
            if (pivotCol !== -1 && typeof rrefMatrix[row][freeVar] === 'number') {
                // Set pivot variable to negative of free variable coefficient
                basisVector[pivotCol] = -(rrefMatrix[row][freeVar] as number);
            }
        }
        
        basisVectors.push(basisVector);
    }
    
    return basisVectors.length > 0 ? basisVectors : [new Array(cols).fill(0)];
}

/**
 * Check if a matrix is in Row Echelon Form (REF)
 */
export function isRowEchelonForm(matrix: Matrix): boolean {
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
export function isReducedRowEchelonForm(matrix: Matrix): boolean {
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
export function formatMatrix(matrix: Matrix): string {
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
    const augmented: Matrix = A.map((row, i) => [...row, b[i]]);
    
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
    const matrix1: Matrix = [
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
    const matrix2: Matrix = [
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
    
    const nullBasis = nullSpaceBasis(matrix2);
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

// Export all elementary row operations for external use
// export { E1, E2, E3 };