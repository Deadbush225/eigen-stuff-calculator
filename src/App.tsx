import { useState } from 'react'
import MatrixInput from './components/MatrixInput'
import './App.css'

function App() {
  const [matrix, setMatrix] = useState<number[][]>([]);

  const handleMatrixChange = (newMatrix: number[][]) => {
    setMatrix(newMatrix);
    console.log('Matrix updated:', newMatrix);
  };

  return (
    <div className="App">
      <h1>Eigen Stuff Calculator</h1>
      <MatrixInput onMatrixChange={handleMatrixChange} />
      
      {matrix.length > 0 && (
        <div className="matrix-info">
          <h2>Matrix Information</h2>
          <p>Current matrix size: {matrix.length}×{matrix[0]?.length || 0}</p>
          <details>
            <summary>Raw Matrix Data (JSON)</summary>
            <pre>{JSON.stringify(matrix, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  )
}

export default App
