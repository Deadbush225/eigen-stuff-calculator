import { type LatexString } from './math';

/**
 * Calculate determinant for triangular matrices (product of diagonal)
 */
export function calculateTriangularDeterminant(matrix: (string | number)[][]): LatexString {
  const diagonal = [];
  for (let i = 0; i < matrix.length; i++) {
    diagonal.push(`(${matrix[i][i]})`);
  }
  return  diagonal.join(' \\cdot ');
}

/**
 * Calculate 2x2 determinant: (a)(d) - (b)(c)
 */
export function calculate2x2Determinant(matrix: (string | number)[][]): LatexString {
  const a = matrix[0][0];
  const b = matrix[0][1];
  const c = matrix[1][0];
  const d = matrix[1][1];

  return `(${a})(${d}) - (${b})(${c})`;
}

/**
 * Calculate 3x3 determinant using cofactor expansion along first row
 */
export function calculate3x3Determinant(matrix: (string | number)[][], asInner?: boolean): LatexString {
  const terms: string[] = [];
  
  for (let j = 0; j < 3; j++) {
    const element = matrix[0][j];
    
    // Skip if element is zero (optimization)
    if (element === 0) {
      continue;
    }
    
    let sign = j % 2 === 0 ? '+' : '-';
    if (j === 0 || terms.length === 0) sign = ''; // First non-zero term gets no sign
    
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
    if (minorDet === "") {
        continue;
    }

    let term = `${sign}(${element})\\Bigl[${minorDet}\\Bigr]`;
    if (j != 2 && !asInner && terms.length < 2) {
        term += `\\newline`;
    }
    terms.push(term);
  }

  return terms.join(' ');
}

/**
 * For larger matrices, use cofactor expansion (simplified)
 */
export function calculateLargerDeterminant(matrix: (string | number)[][], asInner?:boolean): LatexString {
  const n = matrix.length;

    if (n === 4) {
  const terms: string[] = [];

        for (let j = 0; j < 4; j++) {
            const element = matrix[0][j];
            
            // Skip if element is zero (optimization)
            if (element === 0) {
                continue;
            }
            
            let sign = j % 2 === 0 ? '+' : '-';
            if (j === 0 || terms.length === 0) sign = ''; // First non-zero term gets no sign
            
            // Create 3x3 minor by removing row 0 and column j
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
            if (minorDet === "") {
                continue;
            }

            const term = `${sign}(${element})\\biggl[${minorDet}\\biggr]`;
            // if (!asInner && terms.length < 3) {
                // term += `\\newline`;
            // }
            terms.push(term);
        }
        
        const expansion: string = terms.join("\\newline");

        return expansion;
    }
    if (n === 5) {
        const terms: string[] = [];

        for (let j = 0; j < 5; j++) {
            const element = matrix[0][j];
            
            // Skip if element is zero (optimization)
            if (element === 0) {
                continue;
            }
            
            let sign = j % 2 === 0 ? '+' : '-';
            if (j === 0 || terms.length === 0) sign = ''; // First non-zero term gets no sign
            
            // Create 4x4 minor by removing row 0 and column j
            const minor: (string | number)[][] = [];
            for (let i = 1; i < 5; i++) {
                minor.push([]);
                for (let k = 0; k < 5; k++) {
                    if (k !== j) {
                        minor[i - 1].push(matrix[i][k]);
                    }
                }
            }

            const minorDet = calculateLargerDeterminant(minor, false);
            if (minorDet === "") {
                continue;
            }
            const term = `${sign}(${element})\\Biggl[${minorDet}\\Biggr]\\newline`;
            terms.push(term);
        }
        return terms.join(' ');
    }
    return "Determinant calculation for matrices larger than 5x5 is not implemented.";
}
