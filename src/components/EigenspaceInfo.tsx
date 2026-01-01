import React from 'react';
import './EigenspaceInfo.scss';
import { type Eigenspace } from '../lib/eigen-types';
import { type Complex } from 'mathjs';

interface EigenspaceInfoProps {
  eigenspaces: Eigenspace[];
}

const EigenspaceInfo: React.FC<EigenspaceInfoProps> = ({ eigenspaces }) => {
  const formatVector = (vec: number[]) => `[${vec.map(n => n.toFixed(2)).join(', ')}]`;
  
  const formatEigenvalue = (eigenvalue: number | Complex) => {
    if (typeof eigenvalue === 'number') {
      return eigenvalue.toFixed(3);
    } else {
      // Handle Complex numbers
      const complex = eigenvalue as Complex;
      if (complex.im === 0) {
        return complex.re.toFixed(3);
      } else if (complex.re === 0) {
        return `${complex.im.toFixed(3)}i`;
      } else {
        const sign = complex.im >= 0 ? '+' : '-';
        return `${complex.re.toFixed(3)} ${sign} ${Math.abs(complex.im).toFixed(3)}i`;
      }
    }
  };

  const getEigenspaceDimension = (eigenspace: Eigenspace) => {
    return eigenspace.basis.length;
  };

  const getEigenspaceType = (dimension: number) => {
    switch (dimension) {
      case 0: return 'Zero space (no eigenvectors)';
      case 1: return 'Line (1D eigenspace)';
      case 2: return 'Plane (2D eigenspace)';
    //   case 3: return '(3D eigenspace)';
      default: return `${dimension}D eigenspace`;
    }
  };

  const getEigenspaceColor = (index: number) => {
    const colors = ['#af00af', '#00afaf', '#afaf00', '#ff8000', '#8000ff'];
    return colors[index % colors.length];
  };

  if (eigenspaces.length === 0) {
    return null;
  }

  return (
    <div className="eigenspace-info">
      <h3>Eigenspaces Analysis</h3>
      <div className="eigenspace-list">
        {eigenspaces.map((eigenspace, index) => {
          const dimension = getEigenspaceDimension(eigenspace);
          const eigenspaceType = getEigenspaceType(dimension);
          const color = getEigenspaceColor(index);
          
          return (
            <div key={index} className="eigenspace-row">
              <div className="eigenspace-header">
                <div 
                  className="eigenspace-color-indicator"
                  style={{ backgroundColor: color }}
                ></div>
                <span className="eigenvalue-label">
                  λ = {formatEigenvalue(eigenspace.eigenvalue)}
                </span>
                <span className="eigenspace-type">
                  {eigenspaceType}
                </span>
              </div>
              <div className="eigenspace-basis">
                <span className="basis-label">Basis vectors:</span>
                <div className="basis-vectors">
                  {eigenspace.basis.map((vector, vectorIndex) => (
                    <div key={vectorIndex} className="basis-vector">
                      {formatVector(vector.map(v => typeof v === 'number' ? v : parseFloat(v as string) || 0))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EigenspaceInfo;