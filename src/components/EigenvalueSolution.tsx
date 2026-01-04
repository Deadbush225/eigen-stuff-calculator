import React, { memo, useMemo, useEffect } from "react";
import { findEigenvalues } from "../lib/eigenStuffFinder";
import { type Eigenspace } from "../lib/eigen-types";
import "./EigenvalueSolution.scss";
import MathDisplay from "./util/MathDisplay";
import {
	formatMatrixLatex,
	formatExpressionLatex,
	formatEigenvaluesLatex,
	splitLatexByOperators,
} from "../lib/latexFormatter";

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
              {(error as Error).stack}
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
			<div id="eigenvalue-solution" className="eigenvalue-solution">
				<h3>Eigenvalue Calculation Steps</h3>
				{solution}
			</div>
		);
	}
);

// Add display name for debugging
EigenvalueSolution.displayName = "EigenvalueSolution";

export default EigenvalueSolution;

/* ━━━━━━━━━━━━━━━━ Helper for Display Layout ━━━━━━━━━━━━━━━ */
/**
 * Helper function to display step-by-step solution
 */
function displayStepByStep(inputMatrix: number[][]): React.JSX.Element {
	const result = findEigenvalues(inputMatrix);

	return (
		<div className="eigenvalue-solution card">
			<div>
				<h4>Step 1: Create <MathDisplay latex="xI - A"></MathDisplay> matrix</h4>
				<MathDisplay latex={formatMatrixLatex(result.xIMinusA)} block />
			</div>
			<div className="dynamix-latex">
				<h4>
					Step 2: Calculate <MathDisplay latex="\det(xI - A)"></MathDisplay>
				</h4>
				<MathDisplay
					latex={`\\det(xI - A) = ${splitLatexByOperators(
						formatExpressionLatex(result.determinantExpression)
					)}`}
					block
				/>
			</div>
			<div className="dynamix-latex">
				<h4>Step 3: Characteristic Polynomial</h4>
				<MathDisplay
					latex={formatExpressionLatex(result.characteristicPolynomial)}
					block
				/>
			</div>
			<div className="dynamix-latex">
				<h4>Step 4: Eigenvalues <MathDisplay latex="σ(A)"></MathDisplay></h4>
				<MathDisplay latex={formatEigenvaluesLatex(result.eigenvalues)} block />
			</div>
			<div className="summary">
				<h4>Summary</h4>
				<MathDisplay
					latex={`\\text{All eigenvalues are real: } ${result.isReal}\\newline\\text{Trace: } \\operatorname{tr}(A) = ${result.trace}`}
					block
				/>
			</div>
		</div>
	);
}
