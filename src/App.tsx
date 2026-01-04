import { useState, useEffect } from "react";
import MatrixInput from "./components/MatrixInput";
import GraphAnimate from "./components/GraphAnimate";
import TransformationLegend from "./components/VisualizationLegend";
import EigenspaceInfo from "./components/EigenspaceInfo";
import Navbar from "./components/Navbar";
import About from "./components/About";
import Tour from "./components/Tour";
import "./App.css";
import { type Eigenspace } from "./lib/eigen-types";
import EigenvalueSolution from "./components/EigenvalueSolution";

function App() {
	const [matrix, setMatrix] = useState<number[][]>([]);
	const [basisVectors, setBasisVectors] = useState<Eigenspace[]>([]);
	const [activeSection, setActiveSection] = useState<"calculator" | "about">(
		"calculator"
	);
	const [showTour, setShowTour] = useState<boolean>(false);

	const handleMatrixChange = (newMatrix: number[][]) => {
		setMatrix(newMatrix);
		console.log("Matrix updated:", newMatrix);
	};

	const handleEigenspacesChange = (newEigenspaces: Eigenspace[]) => {
		setBasisVectors(newEigenspaces);
		console.log("Eigenspaces updated:", newEigenspaces);
	};

	const handleSectionChange = (section: "calculator" | "about") => {
		setActiveSection(section);
		window.scrollTo(0, 0);
	};

	const startTour = () => {
		if (activeSection !== "calculator") {
			setActiveSection("calculator");
		}
		setShowTour(true);
	};

	const handleTourComplete = () => {
		setShowTour(false);
	};

	const textLabel: {
		[key: number]: { [key: string]: string };
	} = {
		2: {
			dimension: "2D",
			dimension_formula: "ℝ²",
			basis_vector: "e₁, e₂",
		},
		3: {
			dimension: "3D",
			dimension_formula: "ℝ³",
			basis_vector: "e₁, e₂, e₃",
		},
	};

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTour(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

	return (
		<div className="App">
			<Navbar
				activeSection={activeSection}
				onSectionChange={handleSectionChange}
			/>

			{/* Tour Button */}
			{activeSection === "calculator" && (
				<button className="tour-button" onClick={startTour}>
					🎯 Take a Tour
				</button>
			)}

			{/* Tour Component */}
			<Tour startTour={showTour} onTourComplete={handleTourComplete} />

			{activeSection === "calculator" ? (
				<div className="calculator-section">
					<div className="matrix-input-container">
						<MatrixInput
							onMatrixChange={handleMatrixChange}
							onEigenspacesChange={handleEigenspacesChange}
						/>

						<EigenvalueSolution
							matrix={matrix}
							onEigenspacesCalculated={handleEigenspacesChange}
						/>
					</div>

					<div className="visualization-container">
						<EigenspaceInfo eigenspaces={basisVectors} />
						{[2, 3].includes(matrix.length) && (
							<div id="visualization-section" className="visualization-section">
								<h2>
									{textLabel[matrix.length].dimension} Matrix Transformation
									Visualization
								</h2>
								<p>
									This visualization shows how your {matrix.length}×
									{matrix[0]?.length || 0} matrix transforms the coordinate
									space in {textLabel[matrix.length].dimension_formula}. The
									thin lines represent the original basis vectors (
									{textLabel[matrix.length].basis_vector}), and the thick lines
									show where they go after transformation (A
									{textLabel[matrix.length].basis_vector}). Eigenspaces are
									visualized as colored lines (1D) or planes (2D) with their
									corresponding eigenvalue labels.
								</p>
								<GraphAnimate
									transformationMatrix={matrix}
									eigenspaces={basisVectors}
								/>
								<div id="visualization-legend">
									<TransformationLegend
										transformationMatrix={matrix}
										eigenspaces={basisVectors}
									/>
								</div>
							</div>
						)}
					</div>

					{matrix.length > 0 && ![2, 3].includes(matrix.length) && (
						<div className="visualization-info">
							<p>
								<em>
									Visualization is only available for 2×2 and 3×3 matrices
								</em>
							</p>
						</div>
					)}
				</div>
			) : (
				<About />
			)}
		</div>
	);
}

export default App;
