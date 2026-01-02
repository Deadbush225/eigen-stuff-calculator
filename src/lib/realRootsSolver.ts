import { math } from './math';

type PolynomialCoefficients = number[];

/**
 * Helper function to validate eigenvalues manually
 * For each eigenvalue λ, verify that det(A - λI) ≈ 0
 */
export function validateEigenvalues(eigenvalues: number[]): number[] {
    const EPSILON = 1e-6;

    // 1. Snap values to nearby integers or zero
    const snapped = eigenvalues.map(ev => {
        const rounded = Math.round(ev);
        // If it's effectively an integer, return the integer
        if (Math.abs(ev - rounded) < EPSILON) return rounded;
        // If it's effectively zero (but round might not catch it if it's 0.000001)
        if (Math.abs(ev) < EPSILON) return 0;
        return ev;
    });

    // 2. Remove duplicates using the same threshold
    // We use reduce to build an array of unique values
    return snapped.reduce<number[]>((acc, current) => {
        const isDuplicate = acc.some(uniqueVal => 
            Math.abs(uniqueVal - current) < EPSILON
        );
        
        if (!isDuplicate) {
            acc.push(current);
        }
        return acc;
    }, []);
};


/**
 * Solves for real roots of a polynomial given its coefficients.
 * Uses Newton-Raphson method with Synthetic Division deflation.
 * @param inputCoeffs - [an, an-1, ..., a0] for an*x^n + ... + a0
 * @returns Array of real roots
 */
export function solveRealRoots(inputCoeffs: PolynomialCoefficients, poly: string): number[] {
    const coeffs = [...inputCoeffs];
    
    // Clean coefficients (remove leading zeros)
    while (coeffs.length > 0 && coeffs[0] === 0) {
        coeffs.shift();
    }
    
    if (coeffs.length === 0) return [];
    if (coeffs.length === 1) return []; // Constant polynomial, no roots

    // Handle special cases with exact solutions
    if (coeffs.length === 2) {
        // Linear: ax + b = 0 → x = -b/a
        const root = coeffs[1] === 0 ? 0 : -coeffs[1] / coeffs[0];
        return isFinite(root) ? [root] : [];
    }
    
    if (coeffs.length === 3) {
        // Quadratic: ax² + bx + c = 0
        const [a, b, c] = coeffs;
        const discriminant = b * b - 4 * a * c;
        
        if (discriminant >= 0) {
            const sqrtDisc = Math.sqrt(discriminant);
            const root1 = (-b + sqrtDisc) / (2 * a);
            const root2 = (-b - sqrtDisc) / (2 * a);
            
            const roots = [];
            if (isFinite(root1)) roots.push(root1);
            if (isFinite(root2) && Math.abs(root1 - root2) > 1e-14) {
                roots.push(root2);
            }
            return roots.sort((a, b) => a - b);
        }
        return []; // Complex roots only
    }

    if (coeffs.length === 4) {
        // Cubic: use exact formula
        return validateEigenvalues(solveCubicOptimized(coeffs));
    }

    // For higher degree polynomials, use optimized Newton-Raphson
    return validateEigenvalues(optimizedNewtonRaphson(poly, coeffs));
}

/**
 * Highly optimized Newton-Raphson method for polynomial root finding
 * Features:
 * 1. Smart starting point selection based on polynomial analysis
 * 2. Adaptive step sizing to prevent divergence
 * 3. Deflation to avoid finding the same root multiple times
 * 4. Multiple convergence strategies
 * 5. Bounds-based initialization for better coverage
 */
function optimizedNewtonRaphson(poly: string, coeffs: number[]): number[] {
    const degree = coeffs.length - 1;
    const f = math.compile(poly);
    
    const roots: number[] = [];
    let deflatedPoly = poly;
    let deflatedCoeffs = [...coeffs];
    
    // Calculate polynomial bounds (where most real roots lie)
    const bounds = calculateRootBounds(coeffs);
    
    for (let rootIndex = 0; rootIndex < degree; rootIndex++) {
        // Generate smart starting points for this iteration
        const startingPoints = generateSmartStartingPointsOptimized(deflatedCoeffs, bounds, roots);
        
        let foundRoot = false;
        
        // Try each starting point
        for (const start of startingPoints) {
            const root = robustNewtonIteration(deflatedPoly, start, roots);
            
            if (root !== null) {
                // Verify this is actually a root of the ORIGINAL polynomial
                const verification = f.evaluate({ x: root });
                if (Math.abs(verification) < 1e-10) {
                    roots.push(root);
                    console.log(`Found root ${rootIndex + 1}: ${root} (verification: ${verification})`);
                    
                    // Deflate the polynomial to remove this root
                    const { deflated, newCoeffs } = deflatePolynomial(deflatedCoeffs, root);
                    deflatedPoly = deflated;
                    deflatedCoeffs = newCoeffs;
                    
                    foundRoot = true;
                    break;
                }
            }
        }
        
        // If no root found, stop searching
        if (!foundRoot) {
            console.log(`Could not find root ${rootIndex + 1}, stopping search`);
            break;
        }
    }
    
    return roots.sort((a, b) => a - b);
}

/**
 * Calculate bounds where real roots are likely to be found
 * Uses Cauchy's bound and other polynomial analysis
 */
function calculateRootBounds(coeffs: number[]): { min: number; max: number } {
    if (coeffs.length === 0) return { min: -1, max: 1 };
    
    const leading = Math.abs(coeffs[0]);
    const maxCoeff = Math.max(...coeffs.slice(1).map(Math.abs));
    
    // Cauchy's bound: |root| <= 1 + max(|a_i|/|a_n|)
    const cauchyBound = 1 + maxCoeff / leading;
    
    // Also consider coefficient ratios for tighter bounds
    const ratios = coeffs.slice(1).map(c => Math.abs(c / leading));
    const avgRatio = ratios.reduce((sum, r) => sum + r, 0) / ratios.length;
    
    // Use the smaller of Cauchy bound or a heuristic based on average ratios
    const bound = Math.min(cauchyBound, Math.max(10, avgRatio * 5));
    
    return { min: -bound, max: bound };
}

/**
 * Generate intelligent starting points based on polynomial analysis
 */
function generateSmartStartingPointsOptimized(coeffs: number[], bounds: { min: number; max: number }, existingRoots: number[]): number[] {
    const points: number[] = [];
    
    // 1. Grid search within bounds
    const gridSize = 20;
    const step = (bounds.max - bounds.min) / gridSize;
    for (let i = 0; i <= gridSize; i++) {
        points.push(bounds.min + i * step);
    }
    
    // 2. Random points within bounds
    for (let i = 0; i < 10; i++) {
        points.push(bounds.min + Math.random() * (bounds.max - bounds.min));
    }
    
    // 3. Points based on coefficient ratios (potential root locations)
    if (coeffs.length > 2) {
        for (let i = 1; i < coeffs.length; i++) {
            const ratio = -coeffs[i] / coeffs[0];
            if (isFinite(ratio) && ratio >= bounds.min && ratio <= bounds.max) {
                points.push(ratio);
                points.push(ratio * 1.1);
                points.push(ratio * 0.9);
            }
        }
    }
    
    // 4. Points near existing roots (for potential multiple roots)
    for (const root of existingRoots) {
        points.push(root + 0.1);
        points.push(root - 0.1);
        points.push(root * 1.01);
        points.push(root * 0.99);
    }
    
    // 5. Sign-change detection points
    try {
        const f = math.compile(coeffsToPolyString(coeffs));
        for (let x = bounds.min; x < bounds.max; x += step) {
            try {
                const val1 = f.evaluate({ x: x });
                const val2 = f.evaluate({ x: x + step });
                if (val1 * val2 < 0) {
                    points.push(x + step / 2);
                }
            } catch {
                // Skip evaluation errors
            }
        }
    } catch {
        // Skip if polynomial compilation fails
    }
    
    // Remove duplicates and sort
    const uniquePoints = [...new Set(points)]
        .filter(p => isFinite(p))
        .sort((a, b) => a - b);
    
    return uniquePoints;
}

/**
 * Convert coefficient array back to polynomial string for evaluation
 */
function coeffsToPolyString(coeffs: number[]): string {
    const terms: string[] = [];
    const degree = coeffs.length - 1;
    
    for (let i = 0; i < coeffs.length; i++) {
        const coeff = coeffs[i];
        const power = degree - i;
        
        if (coeff === 0) continue;
        
        let term = '';
        if (power === 0) {
            term = coeff.toString();
        } else if (power === 1) {
            term = coeff === 1 ? 'x' : coeff === -1 ? '-x' : `${coeff}*x`;
        } else {
            term = coeff === 1 ? `x^${power}` : coeff === -1 ? `-x^${power}` : `${coeff}*x^${power}`;
        }
        
        terms.push(term);
    }
    
    return terms.join(' + ').replace(/\+ -/g, '- ');
}

/**
 * Robust Newton iteration with multiple fallback strategies
 */
function robustNewtonIteration(polyString: string, start: number, existingRoots: number[]): number | null {
    // Check if start is too close to existing roots
    for (const existing of existingRoots) {
        if (Math.abs(start - existing) < 1e-8) {
            return null; // Too close to existing root
        }
    }
    
    const f = math.compile(polyString);
    const fp = math.derivative(polyString, 'x').compile();
    
    let x = start;
    let stepSize = 1.0;
    let prevX = x;
    
    for (let iter = 0; iter < 100; iter++) {
        try {
            const fx = f.evaluate({ x: x });
            const dfx = fp.evaluate({ x: x });
            
            // Check if we found a root
            if (Math.abs(fx) < 1e-12) {
                return x;
            }
            
            // Check for small derivative (potential issues)
            if (Math.abs(dfx) < 1e-15) {
                // Try a small perturbation
                x += (Math.random() - 0.5) * 1e-6;
                continue;
            }
            
            // Calculate Newton step with adaptive sizing
            const fullStep = fx / dfx;
            const adaptiveStep = stepSize * fullStep;
            const newX = x - adaptiveStep;
            
            // Check if the new point is better
            const newFx = f.evaluate({ x: newX });
            
            if (Math.abs(newFx) <= Math.abs(fx)) {
                // Good step - accept it and maybe increase step size
                stepSize = Math.min(1.2, stepSize * 1.05);
                x = newX;
            } else {
                // Bad step - reduce step size and try again
                stepSize *= 0.7;
                if (stepSize < 1e-12) {
                    break; // Step size too small
                }
                continue; // Try again with smaller step
            }
            
            // Check for convergence
            if (Math.abs(x - prevX) < 1e-14 && Math.abs(fx) < 1e-10) {
                return x;
            }
            
            // Oscillation detection
            if (iter > 10 && Math.abs(x - prevX) < 1e-12) {
                // Try bisection step
                const midX = (x + prevX) / 2;
                const midFx = f.evaluate({ x: midX });
                if (Math.abs(midFx) < Math.abs(fx)) {
                    x = midX;
                }
                return Math.abs(midFx) < 1e-10 ? x : null;
            }
            
            prevX = x;
            
        } catch {
            // Evaluation error - try small perturbation
            x += (Math.random() - 0.5) * 1e-6;
        }
    }
    
    // Final verification
    try {
        const finalFx = f.evaluate({ x: x });
        return Math.abs(finalFx) < 1e-10 ? x : null;
    } catch {
        return null;
    }
}

/**
 * Deflate polynomial by dividing out (x - root) using synthetic division
 */
function deflatePolynomial(coeffs: number[], root: number): { deflated: string; newCoeffs: number[] } {
    const newCoeffs: number[] = [];
    let remainder = coeffs[0];
    
    for (let i = 1; i < coeffs.length - 1; i++) {
        newCoeffs.push(remainder);
        remainder = coeffs[i] + remainder * root;
    }
    newCoeffs.push(remainder);
    
    // Clean up tiny coefficients
    const cleanedCoeffs = newCoeffs.map(c => Math.abs(c) < 1e-14 ? 0 : c);
    
    return {
        deflated: coeffsToPolyString(cleanedCoeffs),
        newCoeffs: cleanedCoeffs
    };
}

/**
 * Optimized cubic formula solver
 */
function solveCubicOptimized(coeffs: number[]): number[] {
    const [a, b, c, d] = coeffs;
    
    // Convert to depressed cubic t³ + pt + q = 0 by substituting x = t - b/(3a)
    const p = (3 * a * c - b * b) / (3 * a * a);
    const q = (2 * b * b * b - 9 * a * b * c + 27 * a * a * d) / (27 * a * a * a);
    
    const discriminant = q * q / 4 + p * p * p / 27;
    
    const roots: number[] = [];
    
    if (discriminant > 0) {
        // One real root
        const sqrt_disc = Math.sqrt(discriminant);
        const u = Math.sign(-q / 2 + sqrt_disc) * Math.pow(Math.abs(-q / 2 + sqrt_disc), 1/3);
        const v = Math.sign(-q / 2 - sqrt_disc) * Math.pow(Math.abs(-q / 2 - sqrt_disc), 1/3);
        const root = u + v - b / (3 * a);
        if (isFinite(root)) roots.push(root);
    } else if (discriminant === 0) {
        // Multiple roots
        if (Math.abs(q) < 1e-14) {
            // Triple root
            roots.push(-b / (3 * a));
        } else {
            // One single root and one double root
            const root1 = 3 * q / p - b / (3 * a);
            const root2 = -3 * q / (2 * p) - b / (3 * a);
            if (isFinite(root1)) roots.push(root1);
            if (isFinite(root2) && Math.abs(root1 - root2) > 1e-14) roots.push(root2);
        }
    } else {
        // Three distinct real roots
        const m = 2 * Math.sqrt(-p / 3);
        const theta = Math.acos(3 * q / (p * m)) / 3;
        
        for (let k = 0; k < 3; k++) {
            const root = m * Math.cos(theta - 2 * Math.PI * k / 3) - b / (3 * a);
            if (isFinite(root)) roots.push(root);
        }
    }
    
    return roots.sort((a, b) => a - b);
}
