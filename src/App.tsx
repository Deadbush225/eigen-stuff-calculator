import { useState } from 'react'
import MatrixInput from './components/MatrixInput'
import GraphAnimate from './components/GraphAnimate'
import TransformationLegend from './components/TransformationLegend'
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

  return (
    <div className="App">
      <h1>Eigen Stuff Calculator</h1>
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

      {matrix.length === 3 && matrix[0]?.length === 3 && (
        <div className="visualization-section">
          <h2>3D Matrix Transformation Visualization</h2>
          <p>
            This visualization shows how your 3×3 matrix transforms the coordinate space in ℝ³.
            The thin lines represent the original basis vectors (e₁, e₂, e₃), 
            and the thick lines show where they go after transformation (Ae₁, Ae₂, Ae₃).
            Eigenspaces are visualized as colored lines (1D) or planes (2D) with their corresponding eigenvalue labels.
          </p>
          <GraphAnimate transformationMatrix={matrix} eigenspaces={basisVectors} />
          <TransformationLegend transformationMatrix={matrix} eigenspaces={basisVectors} />
        </div>
      )}
      
      {matrix.length > 0 && matrix.length !== 3 && (
        <div className="visualization-info">
          <p><em>3D visualization is only available for 3×3 matrices</em></p>
        </div>
      )}
    </div>
  )
}

export default App
