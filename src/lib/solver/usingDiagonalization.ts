import { multiplyMatrices } from "../matrixOperations";
import { dotProduct } from "../matrixOperations";
/**
 * QR Algorithm for eigenvalue computation
 */
export function qrAlgorithm(
	A: number[][],
	maxIterations = 100,
	tolerance = 1e-10
): number[] {
	const n = A.length;
	let Ak = A.map((row) => [...row]); // Copy matrix

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

	return eigenvalues.filter((val) => isFinite(val));
}

/**
 * QR Decomposition using Gram-Schmidt process
 */
function qrDecomposition(A: number[][]): { Q: number[][]; R: number[][] } {
	const m = A.length;
	const n = A[0].length;

	const Q: number[][] = Array(m)
		.fill(null)
		.map(() => Array(n).fill(0));
	const R: number[][] = Array(n)
		.fill(null)
		.map(() => Array(n).fill(0));

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
