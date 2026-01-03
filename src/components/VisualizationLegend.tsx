import React from "react";
import "./VisualizationLegend.scss";
import { type Eigenspace } from "../lib/eigen-types";

interface TransformationLegendProps {
	transformationMatrix: number[][];
	eigenspaces?: Eigenspace[];
}

const TransformationLegend: React.FC<TransformationLegendProps> = ({
	transformationMatrix,
	eigenspaces = [],
}) => {
	// Calculate transformed basis vectors
	let e1_transformed: number[] = [];
	let e2_transformed: number[] = [];
	let e3_transformed: number[] = [];

	console.log("Transformation Matrix:", transformationMatrix);
	if (transformationMatrix.length === 3) {
		e1_transformed = [
			transformationMatrix[0][0],
			transformationMatrix[1][0],
			transformationMatrix[2][0],
		];
		e2_transformed = [
			transformationMatrix[0][1],
			transformationMatrix[1][1],
			transformationMatrix[2][1],
		];
		e3_transformed = [
			transformationMatrix[0][2],
			transformationMatrix[1][2],
			transformationMatrix[2][2],
		];
	} else if (transformationMatrix.length === 2) {
		e1_transformed = [transformationMatrix[0][0], transformationMatrix[1][0]];
		e2_transformed = [transformationMatrix[0][1], transformationMatrix[1][1]];
	}

	const formatVector = (vec: number[]) =>
		`[${vec.map((n) => n.toFixed(2)).join(", ")}]`;

	return (
		<div className="transformation-legend">
			<h3>Basis Vector Transformations</h3>
			<div className="transformation-group">
				<div className="legend-section">
					<h4>Original Elementary Basis Vectors:</h4>
					<div className="basis-vector-row">
						<span className="vector-label e1-original">e₁</span>
						<span className="vector-value">[1, 0, 0]</span>
						<span className="vector-description">
							→ Unit vector along X-axis
						</span>
					</div>
					<div className="basis-vector-row">
						<span className="vector-label e2-original">e₂</span>
						<span className="vector-value">[0, 1, 0]</span>
						<span className="vector-description">
							→ Unit vector along Y-axis
						</span>
					</div>
					{transformationMatrix.length === 3 && (
						<div className="basis-vector-row">
							<span className="vector-label e3-original">e₃</span>
							<span className="vector-value">[0, 0, 1]</span>
							<span className="vector-description">
								→ Unit vector along Z-axis
							</span>
						</div>
					)}
				</div>

				<div className="legend-section">
					<h4>After Matrix Transformation A:</h4>
					<div className="basis-vector-row">
						<span className="vector-label e1-transformed">Ae₁</span>
						<span className="vector-value">{formatVector(e1_transformed)}</span>
						<span className="vector-description">→ First column of A</span>
					</div>
					<div className="basis-vector-row">
						<span className="vector-label e2-transformed">Ae₂</span>
						<span className="vector-value">{formatVector(e2_transformed)}</span>
						<span className="vector-description">→ Second column of A</span>
					</div>
					{transformationMatrix.length === 3 && (
						<div className="basis-vector-row">
							<span className="vector-label e3-transformed">Ae₃</span>
							<span className="vector-value">
								{formatVector(e3_transformed)}
							</span>
							<span className="vector-description">→ Third column of A</span>
						</div>
					)}
				</div>
			</div>

			<div className="legend-section">
				<h4>Visualization Key:</h4>
				<div className="legend-key">
					<div className="key-item">
						<div className="color-box original-axes"></div>
						<span>Original coordinate axes (thin, darker)</span>
					</div>
					<div className="key-item">
						<div className="color-box transformed-axes"></div>
						<span>Transformed coordinate axes (thick, lighter)</span>
					</div>
					<div className="key-item">
						<div className="color-box basis-vectors"></div>
						<span>Elementary basis vectors (arrows with points)</span>
					</div>
					<div className="key-item">
						<div className="color-box grid-original"></div>
						<span>Original coordinate grids (light gray)</span>
					</div>
					<div className="key-item">
						<div className="color-box grid-transformed"></div>
						<span>Transformed grids (colored)</span>
					</div>
					{eigenspaces.length > 0 && (
						<>
							<div className="key-item">
								<div className="color-box eigenspace-lines"></div>
								<span>1D Eigenspaces (lines through origin)</span>
							</div>
							<div className="key-item">
								<div className="color-box eigenspace-planes"></div>
								<span>2D Eigenspaces (planes through origin)</span>
							</div>
							<div className="key-item">
								<div className="color-box eigenspace-full"></div>
								<span>3D Eigenspaces (entire space)</span>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default TransformationLegend;
