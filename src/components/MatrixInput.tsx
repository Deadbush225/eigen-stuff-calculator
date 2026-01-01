import { useState, useCallback } from 'react';
import './MatrixInput.scss';
import {Bracket} from './util/MathSymbols';
// import MathBoxScene from './GraphAnimate';
import EigenvalueSolution from './EigenvalueSolution';
import { type Eigenspace } from '../lib/eigen-types';
// import MathDisplay from './util/MathDisplay';

interface MatrixInputProps {
  onMatrixChange?: (matrix: number[][]) => void;
  onEigenspacesChange?: (eigenspaces: Eigenspace[]) => void;
}

function MatrixInput({ onMatrixChange, onEigenspacesChange }: MatrixInputProps) {
  const [size, setSize] = useState<number>(3);
  const [f_size, setF_Size] = useState<number>(3);
  const [matrix, setMatrix] = useState<number[][]>([[1, 0, 0], [0, 1, 0], [0, 0, 1]]
  );
  const [f_matrix, setF_Matrix] = useState<string[][]>([['1', '', ''], ['', '1', ''], ['', '', '1']]
  );

  const handleEigenspacesCalculated = useCallback((eigenspaces: Eigenspace[]) => {
    onEigenspacesChange?.(eigenspaces);
  }, [onEigenspacesChange]);

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
    setF_Matrix(newMatrix.map(row => row.map(value => value === 0 ? '' : value.toString())));
    onMatrixChange?.(newMatrix);
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
  }, [matrix, onMatrixChange]);

  const getColumnAsVertex = (colIndex: number): number[] => {
    return matrix.map(row => row[colIndex]);
  };

  onMatrixChange?.(matrix);

  const renderMatrix = () => (
    

    <div className="container card">
        <Bracket direction="left" height={size * 40} />
        <div className="matrix-grid" style={{ gridTemplateColumns: 
        `repeat(${size}, 1fr)` }}>
        {Array(size).fill(null).map((_, col) => (
            <div key={col} className="matrix-column">
                {matrix.map((row, rowIdx) => {
                    // let v = row[col] || 0;
                    return (
                        <input
                            key={`${rowIdx}-${col}`}
                            value={f_matrix[rowIdx]?.[col] ?? ''}
                            onChange={(e) => {
                                // let item : string = "";
                                // const value : number = parseFloat(e.target.value);

                                // if (!isNaN(value)) {
                                //     item = value.toString();
                                // }

                                f_matrix[rowIdx][col] = f_matrix[rowIdx][col] == "0" ? parseFloat(e.target.value).toString() : e.target.value;
                                if (!isNaN(parseFloat(e.target.value)) || e.target.value === '' || e.target.value === '-') {
                                    updateMatrixValue(rowIdx, col, e.target.value);
                                
                                }
                            }}
                            className="matrix-cell"
                            placeholder='0'
                        step="0.1"
                    />
                )})}
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
      <div className="controls">
        <h2>MATRIX INPUT</h2>
        <div className="size-control">
          <label htmlFor="matrix-size">Matrix Size (n×n): </label>
          <input
            id="matrix-size"
            type="number"
            // min="2"
            // max="10"
            value={f_size}
            // onChange={(e) => setSize(parseInt(e.target.value))}
            onChange={(e) => {
                const newSize = parseInt(e.target.value);
                setF_Size(newSize);
                if (newSize > 0 && newSize <= 5) {
                    updateMatrixSize(newSize);
                }
            }}
            className="size-input"
          />
        </div>
      </div>

      <div className="matrix-section">
        <h3>Matrix ({size}×{size})</h3>
        {renderMatrix()}
        {/* <button className="apply-button" onClick={() => {
            updateMatrixSize(parseInt(document.getElementById('matrix-size')?.value || '3'));
        }}>Apply Matrix</button> */}
      </div>

      {/* {renderVertices()} */}
      
      <EigenvalueSolution matrix={matrix} onEigenspacesCalculated={handleEigenspacesCalculated} />
    </div>
  );
}

export default MatrixInput;