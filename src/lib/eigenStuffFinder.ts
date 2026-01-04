import { type Complex } from "mathjs";
import {
	calculateTraceManual,
	findNullSpace,
	isTriangularMatrix,
} from "./matrixOperations";
import { solveRealRoots, validateEigenvalues } from "./solver/usingRealRoots";
import { findEigenvaluesByDiagonalization } from "./solver/usingDiagonalization";
import { math, type characteristicPolynomial } from "./math";
import {
	calculateTriangularDeterminant,
	assembleNbyNDeterminantExpression,
} from "./determinantFinder";
import { cleanExpressionLatex, formatXIMinusAMatrix } from "./latexFormatter";
import { expandPolynomialManual } from "./expressionDeflater";
import { type Eigenspace } from "./eigen-types";
// Type alias for clarity: A polynomial is an array of coefficients [an, ..., a0]
import { type LatexString } from "./math";

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
					result[i][j] = "x";
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
function calculateDeterminantExpression(
	xIMinusA: (string | number)[][]
): LatexString {
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
): { polynomial: string; eigenvalues: (number | Complex)[] } {
	const coeff = determinantExpr.coefficients as number[];
	const n = inputMatrix.length;
	if (n < 1 || n > 5) {
		throw new Error(
			"Matrix size not supported for manual eigenvalue calculation."
		);
	}

	// use numerical approach for n = 1 to 3
	let roots: number[] = [];
	if (n <= 3) {
		console.log("USING MATHJS POLY ROOT");
		console.log(coeff.reverse());
		roots = solveRealRoots(
			inputMatrix,
			coeff.reverse() as number[],
			determinantExpr.expression.toString()
		);
	} else if (roots.length === 0) {
		console.log(
			"🟨 Newton-Raphson method will take too long, using diagonalization method"
		);

		try {
			const diagonalizationRoots =
				findEigenvaluesByDiagonalization(inputMatrix);
			if (diagonalizationRoots.length > 0) {
				console.log(
					"🟩 Diagonalization method successful:",
					diagonalizationRoots
				);
				// roots = validateEigenvalues(inputMatrix, diagonalizationRoots);
				roots = diagonalizationRoots;
			} else {
				console.log("🟥 Diagonalization method also failed");
			}
		} catch (error) {
			console.warn("🟥 Diagonalization method failed:", error);
		}

		// Final fallback: use math.js library for eigs()
		if (roots.length === 0) {
			console.log("🟨 Using math.js eigs() as final fallback...");
			try {
				const mathjsRoots = math.eigs(inputMatrix).values;
				roots = mathjsRoots as number[];
				console.log("🟩 math.js eigs() successful:", roots);
			} catch (error) {
				console.error("🟥 Even math.js eigs() failed:", error);
				roots = [];
			}
		}
	}

	return {
		polynomial: `${determinantExpr.expression.toString()} = 0`,
		eigenvalues: roots,
	};
}

function findEigenvectorBasis(
	xIMinusA: (string | number)[][],
	eigenvalue: number | Complex
): Eigenspace {
	const xIMinusACopy = JSON.parse(JSON.stringify(xIMinusA)) as (
		| string
		| number
	)[][];
	// console.log("xI - A matrix:", formatMatrix(xIMinusACopy));

	for (let i = 0; i < xIMinusACopy.length; i++) {
		for (let j = 0; j < xIMinusACopy[i].length; j++) {
			if (typeof xIMinusACopy[i][j] === "string") {
				// Replace 'x' with eigenvalue
				const x = math.evaluate(
					(xIMinusACopy[i][j] as string).replace(
						/x/g,
						`${eigenvalue.toString()}`
					)
				);

				xIMinusACopy[i][j] = x;
			}
		}
	}
	// console.log(
	// 	"Matrix for eigenvalue",
	// 	eigenvalue,
	// 	":",
	// 	formatMatrix(xIMinusACopy)
	// );

	// row reduce the matrix to find null space
	const nullSpace = findNullSpace(xIMinusACopy as number[][]);

	// Verify we have valid eigenvectors (non-zero)
	const validBasis = nullSpace.filter((vec) =>
		vec.some((component) => Math.abs(component) > 1e-12)
	);

	// If no valid eigenvectors found, this suggests numerical issues
	if (validBasis.length === 0) {
		console.warn(
			`No valid eigenvectors found for eigenvalue ${eigenvalue}. Using fallback method.`
		);
	}

	// console.log("EigenSpace Basis", formatMatrix(nullSpace));

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
		throw new Error("Matrix cannot be empty");
	}

	const n = inputMatrix.length;

	// Check if matrix is square
	for (let i = 0; i < n; i++) {
		if (!inputMatrix[i] || inputMatrix[i].length !== n) {
			throw new Error("Matrix must be square (n×n)");
		}
	}

	// Step 1: Create xI - A matrix
	const xIMinusA = createXIMinusAMatrix(inputMatrix);
	console.log("xI - A matrix:", xIMinusA);
	console.log("xI - A matrix (formatted):", formatXIMinusAMatrix(xIMinusA));

	// Step 2: Calculate determinant expression
	const determinantExpression = calculateDeterminantExpression(xIMinusA);
	console.log("Determinant expression: (Raw)", determinantExpression);

	const simplified = math.simplify(cleanExpressionLatex(determinantExpression));
	console.log("SIMPLIFIED EXPRESSION:", simplified.toString());

	const mathjsexp: characteristicPolynomial = expandPolynomialManual(
		simplified.toString()
	);

	console.log("Manual extraction expression:", mathjsexp.expression.toString());
	console.log("Manual extraction coefficients:", mathjsexp.coefficients);

	// Step 3: Solve characteristic polynomial
	const polynomialResult = solveCharacteristicPolynomial(
		mathjsexp,
		inputMatrix
	);

	const mathjsResult = math.eigs(inputMatrix);
	console.warn("Eigenvalues (mathjs):", mathjsResult.values);
	console.warn("Eigenvalues (manual):", polynomialResult);

	console.log("Validating Eigenvalues...");
	const calculatedEigenvalues = polynomialResult.eigenvalues;
	const validatedEigenvalues = validateEigenvalues(
		inputMatrix,
		calculatedEigenvalues as number[]
	);
	console.log("Validated Eigenvalues:", validatedEigenvalues);

	// Step 4: Calculate eigenspaces for each eigenvalue
	const eigenspaces: Eigenspace[] = [];
	if (validatedEigenvalues.length !== 0) {
		for (const val of validatedEigenvalues) {
			// console.log("Finding eigenvector basis for eigenvalue:", val);
			const eigenspace = findEigenvectorBasis(xIMinusA, val);
			eigenspaces.push(eigenspace);
		}
	}
	console.log("[eigenStuffFinder] Eigenspaces:", eigenspaces);

	// Additional calculations
	const trace = calculateTraceManual(inputMatrix);

	// For now we check if calculated eigenvalues match validated ones
	const isReal =
		validatedEigenvalues.length !== 0 &&
		validatedEigenvalues.length === calculatedEigenvalues.length &&
		validatedEigenvalues.every((val) => calculatedEigenvalues.includes(val));

	return {
		eigenvalues: validatedEigenvalues,
		eigenspaces,
		characteristicPolynomial: polynomialResult.polynomial,
		xIMinusA,
		determinantExpression,
		trace,
		isReal,
	};
}
