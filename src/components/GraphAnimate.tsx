import React, { use, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { mathBox } from 'mathbox';
import 'mathbox/mathbox.css';
import { type Complex } from 'mathjs';

import { type Eigenspace } from '../lib/eigen-types';

interface MathBoxSceneProps {
  transformationMatrix?: number[][];
  eigenspaces?: Eigenspace[];
}

const MathBoxScene: React.FC<MathBoxSceneProps> = ({ 
  transformationMatrix = [
    [1, 0, 0],
    [0, 1, 0], 
    [0, 0, 1]
  ], 
  eigenspaces = []
}) => {
  const containerRef = useRef(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Determine matrix dimensions and create appropriate transformation
    const matrixSize = transformationMatrix.length;
    const is2D = matrixSize === 2;
    
    // For 2x2 matrices, embed in 3D space (XY plane, Z=0)
    let matrix4x4: number[];
    if (is2D) {
      matrix4x4 = [
        transformationMatrix[0][0], transformationMatrix[0][1], 0, 0,
        transformationMatrix[1][0], transformationMatrix[1][1], 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];
    } else {
      // 3x3 matrix to 4x4 homogeneous matrix
      matrix4x4 = [
        transformationMatrix[0][0], transformationMatrix[0][1], transformationMatrix[0][2], 0,
        transformationMatrix[1][0], transformationMatrix[1][1], transformationMatrix[1][2], 0,
        transformationMatrix[2][0], transformationMatrix[2][1], transformationMatrix[2][2], 0,
        0, 0, 0, 1
      ];
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2', {
      alpha: true,
      antialias: true,
      depth: true,
      stencil: true
    });

    if (context !== null) {
        console.log('WebGL2 context found');
        // return;
    }

    // if (!canvasRef.current) {
    //     console.log('Canvas not found'); return; }

    // 1. Initialize MathBox
    const mathbox = mathBox({
      element: containerRef.current,
      plugins: ['core', 'controls', 'cursor', 'mathbox'],
      controls: { klass: OrbitControls },
      renderer: {
        canvas: canvas, // Use the canvas from the return statement
        context: context,
      },
    });

    const three = mathbox.three;
    three.renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);
    
    // Adjust camera for 2D vs 3D visualization
    if (is2D) {
      mathbox.camera({ proxy: true, position: [0, 0, 8] }); // Top-down view for 2D
    } else {
      mathbox.camera({ proxy: true, position: [3, 2, 5] }); // Angled view for 3D
    }

    // 2. Create the view
    const view = mathbox.cartesian({
      range: [[-5, 5], [-5, 5], [-5, 5]],
      scale: [1, 1, 1],
    });

    // 3. Draw coordinate axes
    // X-axis (red)
    view.array({
      data: [[-5, 0, 0], [5, 0, 0]],
      channels: 3,
    }).line({
      color: '#ff0000',
      width: 3,
    });

    // Y-axis (green)
    view.array({
      data: [[0, -5, 0], [0, 5, 0]],
      channels: 3,
    }).line({
      color: '#00ff00',
      width: 3,
    });

    // Z-axis (blue) - only for 3D
    if (!is2D) {
      view.array({
        data: [[0, 0, -5], [0, 0, 5]],
        channels: 3,
      }).line({
        color: '#0000ff',
        width: 3,
      });
    }

    // Add axis labels
    view.array({
      data: [[5.5, 0.5, 0]],
      channels: 3,
    }).text({
      data: ['X'],
    }).label({
      color: '#ff0000',
      size: 16,
    });

    view.array({
      data: [[0, 6, 0]],
      channels: 3,
    }).text({
      data: ['Y'],
    }).label({
      color: '#00ff00',
      size: 16,
    });

    // Z-axis label - only for 3D
    if (!is2D) {
      view.array({
        data: [[0, 0.5, 5.5]],
        channels: 3,
      }).text({
        data: ['Z'],
      }).label({
        color: '#0000ff',
        size: 16,
      });
    }

    // 4. Draw grids
    if (is2D) {
      // For 2D: Only draw XY plane grid (more prominent)
      view.grid({
        axes: [1, 2], // x and y axes
        width: 1,
        divideX: 10,
        divideY: 10,
        color: '#cccccc',
        opacity: 0.5,
      });
    } else {
      // For 3D: Draw all three grid planes
      // XY plane (z=0)
      view.grid({
        axes: [1, 2], // x and y axes
        width: 1,
        divideX: 10,
        divideY: 10,
        color: '#cccccc',
        opacity: 0.3,
      });

      // XZ plane (y=0)
      view.grid({
        axes: [1, 3], // x and z axes
        width: 1,
        divideX: 10,
        divideY: 10,
        color: '#cccccc',
        opacity: 0.2,
      });

      // YZ plane (x=0)
      view.grid({
        axes: [2, 3], // y and z axes
        width: 1,
        divideX: 10,
        divideY: 10,
        color: '#cccccc',
        opacity: 0.2,
      });
    }

    // 5. Draw elementary basis vectors (original)
    // e1 = [1, 0, 0] - unit vector along X (red arrow)
    view.array({
      data: [[0, 0, 0], [1, 0, 0]],
      channels: 3,
    }).line({
      color: '#cc0000',
      width: 6,
    });
    view.array({
      data: [[1, 0, 0]],
      channels: 3,
    }).point({
      color: '#cc0000',
      size: 8,
    });

    // e2 = [0, 1, 0] - unit vector along Y (green arrow)
    view.array({
      data: [[0, 0, 0], [0, 1, 0]],
      channels: 3,
    }).line({
      color: '#00cc00',
      width: 6,
    });
    view.array({
      data: [[0, 1, 0]],
      channels: 3,
    }).point({
      color: '#00cc00',
      size: 8,
    });

    // e3 = [0, 0, 1] - unit vector along Z (blue arrow) - only for 3D
    if (!is2D) {
      view.array({
        data: [[0, 0, 0], [0, 0, 1]],
        channels: 3,
      }).line({
        color: '#0000cc',
        width: 6,
      });
      view.array({
        data: [[0, 0, 1]],
        channels: 3,
      }).point({
        color: '#0000cc',
        size: 8,
      });
    }

    // Add labels for original basis vectors
    view.array({
      data: [[1.1, 0.1, 0]],
      channels: 3,
    }).text({
      data: ['e₁'],
    }).label({
      color: '#cc0000',
      size: 12,
    });

    view.array({
      data: [[0.1, 1.1, 0]],
      channels: 3,
    }).text({
      data: ['e₂'],
    }).label({
      color: '#00cc00',
      size: 12,
    });

    // e3 label - only for 3D
    if (!is2D) {
      view.array({
        data: [[0.1, 0, 1.1]],
        channels: 3,
      }).text({
        data: ['e₃'],
      }).label({
        color: '#0000cc',
        size: 12,
      });
    }

    // 6. Draw Transformed coordinate system and grids
    // Apply transformation matrix
    const transformedView = view.transform({ matrix: matrix4x4 });

    // Calculate transformed basis vectors for visualization
    let e1_transformed: number[], e2_transformed: number[], e3_transformed: number[];
    
    if (is2D) {
      e1_transformed = [
        transformationMatrix[0][0],
        transformationMatrix[1][0],
        0
      ];
      e2_transformed = [
        transformationMatrix[0][1],
        transformationMatrix[1][1],
        0
      ];
      e3_transformed = [0, 0, 1]; // Z remains unchanged in 2D
    } else {
      e1_transformed = [
        transformationMatrix[0][0],
        transformationMatrix[1][0],
        transformationMatrix[2][0]
      ];
      e2_transformed = [
        transformationMatrix[0][1],
        transformationMatrix[1][1],
        transformationMatrix[2][1]
      ];
      e3_transformed = [
        transformationMatrix[0][2],
        transformationMatrix[1][2],
        transformationMatrix[2][2]
      ];
    }

    // Draw transformed elementary basis vectors (thick arrows)
    // Transformed e1 (red)
    view.array({
      data: [[0, 0, 0], e1_transformed],
      channels: 3,
    }).line({
      color: '#ff4444',
      width: 10,
    });
    view.array({
      data: [e1_transformed],
      channels: 3,
    }).point({
      color: '#ff4444',
      size: 12,
    });

    // Transformed e2 (green)
    view.array({
      data: [[0, 0, 0], e2_transformed],
      channels: 3,
    }).line({
      color: '#44ff44',
      width: 10,
    });
    view.array({
      data: [e2_transformed],
      channels: 3,
    }).point({
      color: '#44ff44',
      size: 12,
    });

    // Transformed e3 (blue) - only for 3D
    if (!is2D) {
      view.array({
        data: [[0, 0, 0], e3_transformed],
        channels: 3,
      }).line({
        color: '#4444ff',
        width: 10,
      });
      view.array({
        data: [e3_transformed],
        channels: 3,
      }).point({
        color: '#4444ff',
        size: 12,
      });
    }

    // Add labels for transformed basis vectors
    view.array({
      data: [[e1_transformed[0] + 0.1, e1_transformed[1] + 0.1, e1_transformed[2] + 0.1]],
      channels: 3,
    }).text({
      data: ['Ae₁'],
    }).label({
      color: '#ff4444',
      size: 12,
    });

    view.array({
      data: [[e2_transformed[0] + 0.1, e2_transformed[1] + 0.1, e2_transformed[2] + 0.1]],
      channels: 3,
    }).text({
      data: ['Ae₂'],
    }).label({
      color: '#44ff44',
      size: 12,
    });

    // Ae3 label - only for 3D
    if (!is2D) {
      view.array({
        data: [[e3_transformed[0] + 0.1, e3_transformed[1] + 0.1, e3_transformed[2] + 0.1]],
        channels: 3,
      }).text({
        data: ['Ae₃'],
      }).label({
        color: '#4444ff',
        size: 12,
      });
    }

    // 7. Draw transformed coordinate axes (full range)
    transformedView.array({
      data: [[-5, 0, 0], [5, 0, 0]],
      channels: 3,
    }).line({
      color: '#ff6666',
      width: 4,
    });

    transformedView.array({
      data: [[0, -5, 0], [0, 5, 0]],
      channels: 3,
    }).line({
      color: '#66ff66',
      width: 4,
    });

    // Z-axis for transformed view - only for 3D
    if (!is2D) {
      transformedView.array({
        data: [[0, 0, -5], [0, 0, 5]],
        channels: 3,
      }).line({
        color: '#6666ff',
        width: 4,
      });
    }

    // Transformed grids
    if (is2D) {
      // For 2D: Only draw XY plane grid (more prominent)
      transformedView.grid({
        axes: [1, 2], // XY plane
        width: 2,
        divideX: 10,
        divideY: 10,
        color: '#ff6666',
        opacity: 0.7,
      });
    } else {
      // For 3D: Draw all three grid planes
      transformedView.grid({
        axes: [1, 2], // XY plane
        width: 2,
        divideX: 10,
        divideY: 10,
        color: '#ff6666',
        opacity: 0.6,
      });

      transformedView.grid({
        axes: [1, 3], // ZX plane
        width: 2,
        divideX: 10,
        divideY: 10,
        color: '#6666ff',
        opacity: 0.4,
      });

      transformedView.grid({
        axes: [2, 3], // YZ plane
        width: 2,
        divideX: 10,
        divideY: 10,
        color: '#66ff66',
        opacity: 0.4,
      });
    }

    // Draw eigenspaces 
    if (eigenspaces && eigenspaces.length > 0) {
      const eigenspaceColors = ['#af00af', '#00afaf', '#afaf00', '#ff8000', '#8000ff'];
      
      eigenspaces.forEach((eigenspace, index) => {
        // Type guard to ensure we have a proper Eigenspace object
        if (!eigenspace || typeof eigenspace !== 'object' || !('eigenvalue' in eigenspace) || !('basis' in eigenspace)) {
          return;
        }
        
        if (!eigenspace.basis || eigenspace.basis.length === 0) {
          return;
        }
        
        const color = eigenspaceColors[index % eigenspaceColors.length];
        const eigenvalue = typeof eigenspace.eigenvalue === 'number' 
          ? eigenspace.eigenvalue.toFixed(3)
          : `${(eigenspace.eigenvalue as Complex).re.toFixed(3)}+${(eigenspace.eigenvalue as Complex).im.toFixed(3)}i`;
        
        // Convert basis vectors to numerical format for visualization
        const numericBasis = eigenspace.basis.map((vec: (string | number)[]) => 
          vec.map((component: string | number) => typeof component === 'number' ? component : parseFloat(component.toString()) || 0)
        );
        
        const dimension = numericBasis.length;
        
        if (dimension === 1) {
          // 1D eigenspace: Draw as a line (eigenvector direction)
          const basisVector = numericBasis[0] as number[];
          
          // For 2D matrices, ensure we're working in 2D space
          let workingVector: number[];
          if (is2D && basisVector.length >= 2) {
            workingVector = [basisVector[0], basisVector[1], 0];
          } else if (basisVector.length >= 3) {
            workingVector = basisVector;
          } else {
            return; // Invalid vector
          }
          
          // Normalize and scale the vector for better visualization
          const magnitude = Math.sqrt(workingVector[0]**2 + workingVector[1]**2 + workingVector[2]**2);
          const scaleFactor = magnitude > 0 ? 3 / magnitude : 1;
          const scaledVector = workingVector.map(x => x * scaleFactor);
          
          // Draw eigenspace line (both directions)
          view.array({
            data: [
              [-scaledVector[0]*2, -scaledVector[1]*2, -scaledVector[2]*2],
              [scaledVector[0]*2, scaledVector[1]*2, scaledVector[2]*2]
            ],
            channels: 3,
          }).line({
            color: color,
            width: 8,
            opacity: 0.8,
          });
          
          // Draw eigenvector arrow
          view.array({
            data: [[0, 0, 0], scaledVector],
            channels: 3,
          }).line({
            color: color,
            width: 12,
          });
          
          // Draw arrowhead (point)
          view.array({
            data: [scaledVector],
            channels: 3,
          }).point({
            color: color,
            size: 16,
          });
          
          // Add eigenvalue label
          view.array({
            data: [[scaledVector[0] + 0.3, scaledVector[1] + 0.3, scaledVector[2] + 0.3]],
            channels: 3,
          }).text({
            data: [`λ=${eigenvalue}`],
          }).label({
            color: color,
            size: 14,
          });
          
        } else if (dimension === 2) {
          // 2D eigenspace: Draw as a plane using two basis vectors
          const v1 = numericBasis[0] as number[];
          const v2 = numericBasis[1] as number[];
          
          // Ensure vectors are in 3D space
          let workingV1: number[], workingV2: number[];
          
          if (is2D) {
            // For 2D matrices, the entire XY plane is usually the eigenspace
            workingV1 = v1.length >= 2 ? [v1[0], v1[1], 0] : [1, 0, 0];
            workingV2 = v2.length >= 2 ? [v2[0], v2[1], 0] : [0, 1, 0];
          } else {
            workingV1 = v1.length >= 3 ? v1 : [1, 0, 0];
            workingV2 = v2.length >= 3 ? v2 : [0, 1, 0];
          }
          
          // Create a grid of points to represent the plane
          const gridSize = 5;
          const gridPoints: number[][] = [];
          
          for (let i = -gridSize; i <= gridSize; i++) {
            for (let j = -gridSize; j <= gridSize; j++) {
              const s = i * 0.5;
              const t = j * 0.5;
              const point = [
                s * workingV1[0] + t * workingV2[0],
                s * workingV1[1] + t * workingV2[1],
                s * workingV1[2] + t * workingV2[2]
              ];
              gridPoints.push(point);
            }
          }
          
          // Draw the plane as a grid of points
          view.array({
            data: gridPoints,
            channels: 3,
          }).point({
            color: color,
            size: 4,
            opacity: 0.6,
          });
          
          // Draw the two basis vectors
          view.array({
            data: [[0, 0, 0], workingV1],
            channels: 3,
          }).line({
            color: color,
            width: 8,
          });
          
          view.array({
            data: [[0, 0, 0], workingV2],
            channels: 3,
          }).line({
            color: color,
            width: 8,
          });
          
          // Draw basis vector endpoints
          view.array({
            data: [workingV1, workingV2],
            channels: 3,
          }).point({
            color: color,
            size: 12,
          });
          
          // Add eigenvalue label
          const midpoint = [
            (workingV1[0] + workingV2[0]) / 2 + 0.3,
            (workingV1[1] + workingV2[1]) / 2 + 0.3,
            (workingV1[2] + workingV2[2]) / 2 + 0.3
          ];
          
          view.array({
            data: [midpoint],
            channels: 3,
          }).text({
            data: [`λ=${eigenvalue}`],
          }).label({
            color: color,
            size: 14,
          });
          
        } else if (dimension === 3 || (dimension === 2 && is2D)) {
          // 3D eigenspace or full 2D space: The entire space (rare case, usually for λI)
          // Draw coordinate planes with eigenspace color
          if (is2D) {
            // For 2D: highlight the entire XY plane
            view.grid({
              axes: [1, 2],
              color: color,
              opacity: 0.4,
              width: 3,
            });
            
            // Add label at a visible location
            view.array({
              data: [[2, 2, 0]],
              channels: 3,
            }).text({
              data: [`λ=${eigenvalue} (ℝ²)`],
            }).label({
              color: color,
              size: 16,
            });
          } else {
            // For 3D: highlight all coordinate planes
            view.grid({
              axes: [1, 2],
              color: color,
              opacity: 0.3,
              width: 3,
            });
            
            view.grid({
              axes: [1, 3],
              color: color,
              opacity: 0.2,
              width: 3,
            });
            
            view.grid({
              axes: [2, 3],
              color: color,
              opacity: 0.2,
              width: 3,
            });
            
            // Add label at origin
            view.array({
              data: [[1, 1, 1]],
              channels: 3,
            }).text({
              data: [`λ=${eigenvalue} (ℝ³)`],
            }).label({
              color: color,
              size: 16,
            });
          }
        }
      });
    }
    

    // Cleanup on unmount
    return () => {
      three.destroy();
    };
  }, [transformationMatrix, eigenspaces]);

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '500px', overflow: 'hidden' }} 
    >
        {/* <canvas 
        ref={canvasRef} 
        style={{ display: 'block', width: '100%', height: '100%' }} 
      /> */}
    </div>
  );
};

export default MathBoxScene;