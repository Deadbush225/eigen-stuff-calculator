import { useState } from 'react'
import MatrixInput from './components/MatrixInput'
import GraphAnimate from './components/GraphAnimate'
import TransformationLegend from './components/VisualizationLegend'
import './App.css'
import { type Eigenspace } from './lib/eigen-types';

function App() {
  const [matrix, setMatrix] = useState<number[][]>([]);
  const [basisVectors, setBasisVectors] = useState<Eigenspace[]>([]);

  const handleMatrixChange = (newMatrix: number[][]) => {
    setMatrix(newMatrix);
    console.log('Matrix updated:', newMatrix);
  };

  const handleEigenspacesChange = (newEigenspaces: Eigenspace[]) => {
    setBasisVectors(newEigenspaces);
    console.log('Eigenspaces updated:', newEigenspaces);
  };

  const textLabel: {
    [key: number]: {[key: string]: string};
  } = {
    2: {
    dimension: "2D",
    dimension_formula: "ℝ²",
      basis_vector: "e₁, e₂"
    },
    3: {
      dimension: "3D",
      dimension_formula: "ℝ³",
      basis_vector: "e₁, e₂, e₃"
    }
  }

  return (
    <div className="App">
      <h1>EIGEN STUFF CALCULATOR</h1>
      <MatrixInput onMatrixChange={handleMatrixChange} onEigenspacesChange={handleEigenspacesChange} />
      
      {/* {matrix.length > 0 && (
        <div className="matrix-info">
          <h2>Matrix Information</h2>
          <p>Current matrix size: {matrix.length}×{matrix[0]?.length || 0}</p>
          <details>
            <summary>Raw Matrix Data (JSON)</summary>
            <pre>{JSON.stringify(matrix, null, 2)}</pre>
          </details>
        </div>
      )} */}

      {[2, 3].includes(matrix.length) && (
        <div className="visualization-section">
          <h2>{textLabel[matrix.length].dimension} Matrix Transformation Visualization</h2>
          <p>
            This visualization shows how your {matrix.length}×{matrix[0]?.length || 0} matrix transforms the coordinate space in {textLabel[matrix.length].dimension_formula}.
            The thin lines represent the original basis vectors ({textLabel[matrix.length].basis_vector}), 
            and the thick lines show where they go after transformation (A{textLabel[matrix.length].basis_vector}).
            Eigenspaces are visualized as colored lines (1D) or planes (2D) with their corresponding eigenvalue labels.
          </p>
          <GraphAnimate transformationMatrix={matrix} eigenspaces={basisVectors} />
          <TransformationLegend transformationMatrix={matrix} eigenspaces={basisVectors} />
        </div>
      )}
      
      {matrix.length > 0 && ![2, 3].includes(matrix.length) && (
        <div className="visualization-info">
          <p><em>Visualization is only available for 2×2 and 3×3 matrices</em></p>
        </div>
      )}
    </div>
  )
}

export default App
