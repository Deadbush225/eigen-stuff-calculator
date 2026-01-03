import React, { memo, useMemo, useEffect } from "react";
import { displayStepByStep, findEigenvalues } from "../lib/eigenStuffFinder";
import { type Eigenspace } from "../lib/eigen-types";
import "./EigenvalueSolution.scss";

interface EigenvalueSolutionProps {
	matrix: number[][];
	onEigenspacesCalculated?: (eigenspaces: Eigenspace[]) => void;
}

const EigenvalueSolution: React.FC<EigenvalueSolutionProps> = memo(
	({ matrix, onEigenspacesCalculated }) => {
		// Memoize the solution calculation to avoid recalculating on every render
		const { solution, eigenspaces } = useMemo(() => {
			try {
				const result = findEigenvalues(matrix);
				return {
					solution: displayStepByStep(matrix),
					eigenspaces: result.eigenspaces,
				};
			} catch (error) {
				return {
					solution: (
						<div className="error">
							Error calculating eigenvalues: {(error as Error).message}
						</div>
					),
					eigenspaces: [],
				};
			}
		}, [matrix]);

		// Notify parent component about eigenspaces when they change
		useEffect(() => {
			if (onEigenspacesCalculated && eigenspaces.length > 0) {
				onEigenspacesCalculated(eigenspaces);
			}
		}, [eigenspaces, onEigenspacesCalculated]);

		// Don't render anything for invalid matrices
		if (
			!matrix ||
			matrix.length === 0 ||
			!matrix[0] ||
			matrix[0].length === 0
		) {
			return null;
		}

		return (
			<div className="eigenvalue-solution">
				<h3>Eigenvalue Calculation Steps</h3>
				{solution}
			</div>
		);
	}
);

// Add display name for debugging
EigenvalueSolution.displayName = "EigenvalueSolution";

export default EigenvalueSolution;
