import React, { memo, useMemo } from 'react';
import { displayStepByStep } from '../lib/eigenStuffFinder';
import './EigenvalueSolution.scss';

interface EigenvalueSolutionProps {
  matrix: number[][];
}

const EigenvalueSolution: React.FC<EigenvalueSolutionProps> = memo(({ matrix }) => {
  // Memoize the solution calculation to avoid recalculating on every render
  const solution = useMemo(() => {
    try {
      return displayStepByStep(matrix);
    } catch (error) {
      return (
        <div className="error">
          Error calculating eigenvalues: {(error as Error).message}
        </div>
      );
    }
  }, [matrix]);

  // Don't render anything for invalid matrices
  if (!matrix || matrix.length === 0 || !matrix[0] || matrix[0].length === 0) {
    return null;
  }

  return (
    <div className="eigenvalue-solution">
      <h3>Eigenvalue Calculation Steps</h3>
      {solution}
    </div>
  );
});

// Add display name for debugging
EigenvalueSolution.displayName = 'EigenvalueSolution';

export default EigenvalueSolution;