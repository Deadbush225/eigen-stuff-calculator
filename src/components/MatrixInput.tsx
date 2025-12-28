import { useState, useCallback } from 'react';
import './MatrixInput.scss';
import {Bracket} from './util/MathSymbols';
import MathBoxScene from './GraphAnimate';
import { displayStepByStep } from '../lib/eigenStuffFinder';

interface MatrixInputProps {
  onMatrixChange?: (matrix: number[][]) => void;
}

function MatrixInput({ onMatrixChange }: MatrixInputProps) {
  const [size, setSize] = useState<number>(3);
  const [matrix, setMatrix] = useState<number[][]>(() => 
    Array(3).fill(null).map(() => Array(3).fill(0))
  );
  const [stepByStepSolution, setStepByStepSolution] = useState<string>(() => {
    // Calculate initial solution
    try {
      const initialMatrix = Array(3).fill(null).map(() => Array(3).fill(0));
      return displayStepByStep(initialMatrix);
    } catch (error) {
      return 'Error calculating eigenvalues: ' + (error as Error).message;
    }
  });

  const updateMatrixSize = useCallback((newSize: number) => {
    if (0 > newSize || newSize > 5) {
        return
    }
    setSize(newSize);
    const newMatrix = Array(newSize).fill(null).map((_, i) => 
      Array(newSize).fill(null).map((_, j) => 
        matrix[i]?.[j] ?? 0
      )
    );
    setMatrix(newMatrix);
    onMatrixChange?.(newMatrix);
    
    // Calculate and display step-by-step solution
    try {
      const solution = displayStepByStep(newMatrix);
      setStepByStepSolution(solution);
    } catch (error) {
      setStepByStepSolution('Error calculating eigenvalues: ' + (error as Error).message);
    }
  }, [matrix, onMatrixChange]);

  const updateMatrixValue = useCallback((row: number, col: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newMatrix = matrix.map((matrixRow, i) => 
      matrixRow.map((cell, j) => 
        i === row && j === col ? numValue : cell
      )
    );
    setMatrix(newMatrix);
    onMatrixChange?.(newMatrix);
    
    // Calculate and display step-by-step solution
    try {
      const solution = displayStepByStep(newMatrix);
      setStepByStepSolution(solution);
    } catch (error) {
      setStepByStepSolution('Error calculating eigenvalues: ' + (error as Error).message);
    }
  }, [matrix, onMatrixChange]);

  const getColumnAsVertex = (colIndex: number): number[] => {
    return matrix.map(row => row[colIndex]);
  };

  const renderMatrix = () => (

    <div className="container">
        <Bracket direction="left" height={size * 40} />
        <div className="matrix-grid" style={{ gridTemplateColumns: 
        `repeat(${size}, 1fr)` }}>
        {Array(size).fill(null).map((_, col) => (
            <div key={col} className="matrix-column">
                {matrix.map((row, rowIdx) => (
                    <input
                        key={`${rowIdx}-${col}`}
                        value={row[col]}
                        onChange={(e) => updateMatrixValue(rowIdx, col, e.target.value)}
                        className="matrix-cell"
                        step="0.1"
                    />
                ))}
            </div>
        ))}
        </div>
        <Bracket direction="right" height={size * 40} />
    </div>
  );

  const renderVertices = () => (
    <div className="vertices-container">
      <h3>Column Vertices</h3>
      <div className="vertices-grid">
        {Array(size).fill(null).map((_, colIndex) => {
          const vertex = getColumnAsVertex(colIndex);
          return (
            <div key={colIndex} className="vertex">
              <h4>v<sub>{colIndex + 1}</sub></h4>
              <div className="vertex-values">
                [
                {vertex.map((value, i) => (
                  <span key={i} className="vertex-component">
                    {value}
                    {i < vertex.length - 1 && ', '}
                  </span>
                ))}
                ]
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="matrix-input-container">
        <MathBoxScene />
      <div className="controls">
        <h2>Matrix Input</h2>
        <div className="size-control">
          <label htmlFor="matrix-size">Matrix Size (n×n): </label>
          <input
            id="matrix-size"
            type="number"
            // min="2"
            // max="10"
            value={size}
            onChange={(e) => updateMatrixSize(parseInt(e.target.value) || 1)}
            className="size-input"
          />
        </div>
      </div>

      <div className="matrix-section">
        <h3>Matrix ({size}×{size})</h3>
        {renderMatrix()}
      </div>

      {renderVertices()}
      
      {stepByStepSolution && (
        <div className="eigenvalue-solution">
          <h3>Eigenvalue Calculation Steps</h3>
          <pre className="step-by-step">{stepByStepSolution}</pre>
        </div>
      )}
    </div>
  );
}

export default MatrixInput;