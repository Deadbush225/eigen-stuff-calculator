import React, { useEffect } from 'react';
import introJs from 'intro.js';
import 'intro.js/introjs.css';

interface TourProps {
  startTour: boolean;
  onTourComplete: () => void;
}

const Tour: React.FC<TourProps> = ({ startTour, onTourComplete }) => {
  useEffect(() => {
    if (startTour) {
      const intro = introJs();
      
      // Function to check if required elements exist
      const checkAndStartTour = () => {
        const requiredElements = ['#matrix-size-control', '#matrix-input-grid'];
        const existingElements = requiredElements.filter(selector => document.querySelector(selector));
        
        if (existingElements.length >= requiredElements.length) {
          // All required elements exist, start the tour
          const steps = [
            {
              intro: "<strong>Welcome to the Eigenvalue Calculator!</strong></br>This interactive tour will guide you through all the features of this powerful mathematical tool. Let's explore how to use it step by step!"
            },
            {
              element: '#matrix-size-control',
              intro: "<strong>Step 1: Choose Matrix Dimension</strong><br/>Start here by selecting the size of your matrix. You can create matrices from 1×1 up to 5×5. The size determines both the rows and columns (n×n format).",
              position: 'bottom' as const
            },
            {
              element: '#matrix-input-grid',
              intro: "<strong>Step 2: Input Matrix Values</strong><br/>Once you've set the size, click on any cell and enter your numbers. You can use decimals (like 2.5), integers (like 3), or even negative numbers. Try entering a simple matrix to get started!",
              position: 'top' as const
            }
          ];

          // Add conditional steps based on what's currently visible
          if (document.querySelector('#eigenvalue-solution')) {
            steps.push({
              element: '#eigenvalue-solution',
              intro: "<strong>Step 3: Step-by-Step Solution</strong><br/>Here's where the magic happens! Watch as the calculator shows you the complete mathematical process:<br/>• Creating the characteristic matrix (λI - A)<br/>• Computing the determinant<br/>• Finding the characteristic polynomial<br/>• Solving for eigenvalues",
              position: 'top' as const
            });
          }

          if (document.querySelector('#eigenspaces-info')) {
            steps.push({
              element: '#eigenspaces-info',
              intro: "<strong>Step 4: Eigenspaces Analysis</strong><br/>This section reveals the geometric meaning behind the numbers! For each eigenvalue, you'll see:<br/>• Corresponding eigenvectors (basis vectors)<br/>• Eigenspace dimension<br/>• Whether it forms a line, plane, or higher-dimensional space",
              position: 'top' as const
            });
          }

          if (document.querySelector('#visualization-section')) {
            steps.push({
              element: '#visualization-section',
              intro: "🎮 <strong>Step 5: 3D Visualization</strong><br/>For 2×2 and 3×3 matrices, enjoy this stunning 3D visualization! It shows:<br/>• How your matrix transforms coordinate space<br/>• Original basis vectors (thin lines)<br/>• Transformed vectors (thick lines)<br/>• Eigenspaces as colored geometric objects",
              position: 'top' as const
            });
          }

          if (document.querySelector('#visualization-legend')) {
            steps.push({
              element: '#visualization-legend',
              intro: "<strong>Step 6: Visual Legend</strong><br/>The legend is your guide to understanding the 3D plot! Each eigenspace gets a unique color, and you can see eigenvalue labels. This helps you connect the abstract math to concrete geometric intuition.",
              position: 'top' as const
            });
          }

          // If no dynamic content is visible, add a message about trying an example
          if (!document.querySelector('#eigenvalue-solution')) {
            steps.push({
              element: '#matrix-input-grid',
              intro: "<strong>Try an Example!</strong><br/>To see all features in action, try entering this 2×2 matrix:<br/>• Top row: 3, 1<br/>• Bottom row: 0, 2<br/><br/>This will demonstrate eigenvalue calculation, eigenspaces, and 3D visualization!",
              position: 'bottom' as const
            });
          }

          intro.setOptions({
            steps: steps,
            showProgress: true,
            showBullets: false,
            exitOnOverlayClick: false,
            exitOnEsc: true,
            nextLabel: '→',
            prevLabel: '←',
            skipLabel: 'x',
            doneLabel: 'Finish',
            overlayOpacity: 0.75,
            tooltipClass: 'customTooltip',
            highlightClass: 'customHighlight',
            scrollToElement: true,
            scrollPadding: 30
          });

          intro.oncomplete(() => {
            onTourComplete();
          });

          intro.onexit(() => {
            onTourComplete();
          });

          intro.start();
        } else {
          // Some elements don't exist yet, retry after a short delay
          setTimeout(checkAndStartTour, 200);
        }
      };

      // Start checking for elements with a small delay to ensure DOM is ready
      setTimeout(checkAndStartTour, 100);
    }
  }, [startTour, onTourComplete]);

  return null;
};

export default Tour;
