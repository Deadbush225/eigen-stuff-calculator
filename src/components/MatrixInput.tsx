import { useState, useCallback } from "react";
import "./MatrixInput.scss";
import { Bracket } from "./util/MathSymbols";
import { type Eigenspace } from "../lib/math";

interface MatrixInputProps {
	onMatrixChange?: (matrix: number[][]) => void;
	onEigenspacesChange?: (eigenspaces: Eigenspace[]) => void;
}

function MatrixInput({
	onMatrixChange,
	onEigenspacesChange,
}: MatrixInputProps) {
	const [size, setSize] = useState<number>(3);
	const [f_size, setF_Size] = useState<number>(3);
	const [matrix, setMatrix] = useState<number[][]>([
		[3, 0, 0],
		[0, 3, 0],
		[0, 0, 3],
	]);
	const [f_matrix, setF_Matrix] = useState<string[][]>([
		["3", "1", ""],
		["", "3", "1"],
		["", "", "3"],
	]);

	const handleEigenspacesCalculated = useCallback(
		(eigenspaces: Eigenspace[]) => {
			onEigenspacesChange?.(eigenspaces);
		},
		[onEigenspacesChange]
	);

	const updateMatrixSize = useCallback(
		(newSize: number) => {
			if (0 > newSize || newSize > 5) {
				return;
			}
			setSize(newSize);
			const newMatrix = Array(newSize)
				.fill(null)
				.map((_, i) =>
					Array(newSize)
						.fill(null)
						.map((_, j) => matrix[i]?.[j] ?? 0)
				);
			setMatrix(newMatrix);
			setF_Matrix(
				newMatrix.map((row) =>
					row.map((value) => (value === 0 ? "" : value.toString()))
				)
			);
			onMatrixChange?.(newMatrix);
		},
		[matrix, onMatrixChange]
	);

	const updateMatrixValue = useCallback(
		(row: number, col: number, value: string) => {
			const numValue = parseFloat(value) || 0;
			const newMatrix = matrix.map((matrixRow, i) =>
				matrixRow.map((cell, j) => (i === row && j === col ? numValue : cell))
			);
			setMatrix(newMatrix);
			onMatrixChange?.(newMatrix);
		},
		[matrix, onMatrixChange]
	);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		rowIdx: number,
		col: number
	) => {
		const value = e.target.value;

		// Update f_matrix state properly
		const newF_Matrix = f_matrix.map((matrixRow, i) =>
			matrixRow.map((cell, j) => (i === rowIdx && j === col ? value : cell))
		);
		setF_Matrix(newF_Matrix);

		// Only update numeric matrix if value is a valid number
		updateMatrixValue(rowIdx, col, value === "" ? "0" : value);
	};

	onMatrixChange?.(matrix);

	const renderMatrix = () => (
		<div className="container card">
			<Bracket direction="left" height={size * 40} />
			<div className="matrix-grid">
				{Array(size)
					.fill(null)
					.map((_, col) => (
						<div key={col} className="matrix-column">
							{matrix.map((row, rowIdx) => {
								const cellStr = f_matrix[rowIdx]?.[col] ?? "";
								return (
									<input
										key={`${rowIdx}-${col}`}
										value={cellStr}
										onChange={(e) => handleInputChange(e, rowIdx, col)}
										className={`matrix-cell ${
											cellStr !== "" && isNaN(parseFloat(cellStr)) ? "red" : ""
										}`}
										placeholder="0"
										step="0.1"
									/>
								);
							})}
						</div>
					))}
			</div>
			<Bracket direction="right" height={size * 40} />
		</div>
	);

	return (
    <>
			<div className="controls">
				<h2>MATRIX INPUT</h2>
				<div id="matrix-size-control" className="size-control">
					<label htmlFor="matrix-size">Matrix Size (n×n): </label>
					<input
						id="matrix-size"
						type="number"
						min="1"
						max="5"
						value={f_size}
						onChange={(e) => {
							const newSize = parseInt(e.target.value);
							setF_Size(newSize);
							if (newSize > 0 && newSize <= 5) {
								updateMatrixSize(newSize);
							}
						}}
						className={`size-input ${f_size > 5 || f_size < 1 ? "red" : ""}`}
					/>
				</div>
			</div>

			<div className="matrix-section">
				<h3>
					Matrix ({size}×{size})
				</h3>
				<div id="matrix-input-grid">
					{renderMatrix()}
				</div>
			</div>
      </>
	);
}

export default MatrixInput;
