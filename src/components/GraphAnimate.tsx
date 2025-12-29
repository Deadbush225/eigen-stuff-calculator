import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { mathBox } from 'mathbox';
import 'mathbox/mathbox.css';

interface MathBoxSceneProps {
  transformationMatrix?: number[][];
}

const MathBoxScene: React.FC<MathBoxSceneProps> = ({ 
  transformationMatrix = [
    [1, 0.5, 0],
    [0, 1, 0.3], 
    [0, 0, 1]
  ]
}) => {
//   const containerRef = useRef(null);

//   useEffect(() => {
//     // Convert 3x3 matrix to 4x4 homogeneous matrix for MathBox
//     const matrix4x4 = [
//       transformationMatrix[0][0], transformationMatrix[0][1], transformationMatrix[0][2], 0,
//       transformationMatrix[1][0], transformationMatrix[1][1], transformationMatrix[1][2], 0,
//       transformationMatrix[2][0], transformationMatrix[2][1], transformationMatrix[2][2], 0,
//       0, 0, 0, 1
//     ];

//     // 1. Initialize MathBox
//     const mathbox = mathBox({
//       element: containerRef.current,
//       plugins: ['core', 'controls', 'cursor', 'mathbox'],
//       controls: { klass: OrbitControls },
//     });

//     const three = mathbox.three;
//     three.renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);
//     mathbox.camera({ proxy: true, position: [3, 2, 5] });

//     // 2. Create the view
//     const view = mathbox.cartesian({
//       range: [[-5, 5], [-5, 5], [-5, 5]],
//       scale: [1, 1, 1],
//     });

//     // 3. Draw coordinate axes
//     // X-axis (red)
//     view.array({
//       data: [[-5, 0, 0], [5, 0, 0]],
//       channels: 3,
//     }).line({
//       color: '#ff0000',
//       width: 3,
//     });

//     // Y-axis (green)
//     view.array({
//       data: [[0, -5, 0], [0, 5, 0]],
//       channels: 3,
//     }).line({
//       color: '#00ff00',
//       width: 3,
//     });

//     // Z-axis (blue)
//     view.array({
//       data: [[0, 0, -5], [0, 0, 5]],
//       channels: 3,
//     }).line({
//       color: '#0000ff',
//       width: 3,
//     });

//     // Add axis labels
//     view.array({
//       data: [[5.5, 0.5, 0]],
//       channels: 3,
//     }).text({
//       data: ['X'],
//     }).label({
//       color: '#ff0000',
//       size: 16,
//     });

//     view.array({
//       data: [[0, 6, 0]],
//       channels: 3,
//     }).text({
//       data: ['Y'],
//     }).label({
//       color: '#00ff00',
//       size: 16,
//     });

//     view.array({
//       data: [[0, 0.5, 5.5]],
//       channels: 3,
//     }).text({
//       data: ['Z'],
//     }).label({
//       color: '#0000ff',
//       size: 16,
//     });

//     // 4. Draw 3D grid planes
//     // XY plane (z=0)
//     view.grid({
//       axes: [1, 2], // x and y axes
//       width: 1,
//       divideX: 10,
//       divideY: 10,
//       color: '#cccccc',
//       opacity: 0.3,
//     });

//     // XZ plane (y=0)
//     view.grid({
//       axes: [1, 3], // x and z axes
//       width: 1,
//       divideX: 10,
//       divideY: 10,
//       color: '#cccccc',
//       opacity: 0.2,
//     });

//     // YZ plane (x=0)
//     view.grid({
//       axes: [2, 3], // y and z axes
//       width: 1,
//       divideX: 10,
//       divideY: 10,
//       color: '#cccccc',
//       opacity: 0.2,
//     });

//     // 5. Draw elementary basis vectors (original)
//     // e1 = [1, 0, 0] - unit vector along X (red arrow)
//     view.array({
//       data: [[0, 0, 0], [1, 0, 0]],
//       channels: 3,
//     }).line({
//       color: '#cc0000',
//       width: 6,
//     });
//     view.array({
//       data: [[1, 0, 0]],
//       channels: 3,
//     }).point({
//       color: '#cc0000',
//       size: 8,
//     });

//     // e2 = [0, 1, 0] - unit vector along Y (green arrow)
//     view.array({
//       data: [[0, 0, 0], [0, 1, 0]],
//       channels: 3,
//     }).line({
//       color: '#00cc00',
//       width: 6,
//     });
//     view.array({
//       data: [[0, 1, 0]],
//       channels: 3,
//     }).point({
//       color: '#00cc00',
//       size: 8,
//     });

//     // e3 = [0, 0, 1] - unit vector along Z (blue arrow)
//     view.array({
//       data: [[0, 0, 0], [0, 0, 1]],
//       channels: 3,
//     }).line({
//       color: '#0000cc',
//       width: 6,
//     });
//     view.array({
//       data: [[0, 0, 1]],
//       channels: 3,
//     }).point({
//       color: '#0000cc',
//       size: 8,
//     });

//     // Add labels for original basis vectors
//     view.array({
//       data: [[1.1, 0.1, 0]],
//       channels: 3,
//     }).text({
//       data: ['e₁'],
//     }).label({
//       color: '#cc0000',
//       size: 12,
//     });

//     view.array({
//       data: [[0.1, 1.1, 0]],
//       channels: 3,
//     }).text({
//       data: ['e₂'],
//     }).label({
//       color: '#00cc00',
//       size: 12,
//     });

//     view.array({
//       data: [[0.1, 0, 1.1]],
//       channels: 3,
//     }).text({
//       data: ['e₃'],
//     }).label({
//       color: '#0000cc',
//       size: 12,
//     });

//     // 6. Draw Transformed coordinate system and grids
//     // Apply transformation matrix
//     const transformedView = view.transform({ matrix: matrix4x4 });

//     // Calculate transformed basis vectors for visualization
//     const e1_transformed = [
//       transformationMatrix[0][0],
//       transformationMatrix[1][0],
//       transformationMatrix[2][0]
//     ];
//     const e2_transformed = [
//       transformationMatrix[0][1],
//       transformationMatrix[1][1],
//       transformationMatrix[2][1]
//     ];
//     const e3_transformed = [
//       transformationMatrix[0][2],
//       transformationMatrix[1][2],
//       transformationMatrix[2][2]
//     ];

//     // Draw transformed elementary basis vectors (thick arrows)
//     // Transformed e1 (red)
//     view.array({
//       data: [[0, 0, 0], e1_transformed],
//       channels: 3,
//     }).line({
//       color: '#ff4444',
//       width: 10,
//     });
//     view.array({
//       data: [e1_transformed],
//       channels: 3,
//     }).point({
//       color: '#ff4444',
//       size: 12,
//     });

//     // Transformed e2 (green)
//     view.array({
//       data: [[0, 0, 0], e2_transformed],
//       channels: 3,
//     }).line({
//       color: '#44ff44',
//       width: 10,
//     });
//     view.array({
//       data: [e2_transformed],
//       channels: 3,
//     }).point({
//       color: '#44ff44',
//       size: 12,
//     });

//     // Transformed e3 (blue)
//     view.array({
//       data: [[0, 0, 0], e3_transformed],
//       channels: 3,
//     }).line({
//       color: '#4444ff',
//       width: 10,
//     });
//     view.array({
//       data: [e3_transformed],
//       channels: 3,
//     }).point({
//       color: '#4444ff',
//       size: 12,
//     });

//     // Add labels for transformed basis vectors
//     view.array({
//       data: [[e1_transformed[0] + 0.1, e1_transformed[1] + 0.1, e1_transformed[2] + 0.1]],
//       channels: 3,
//     }).text({
//       data: ['Ae₁'],
//     }).label({
//       color: '#ff4444',
//       size: 12,
//     });

//     view.array({
//       data: [[e2_transformed[0] + 0.1, e2_transformed[1] + 0.1, e2_transformed[2] + 0.1]],
//       channels: 3,
//     }).text({
//       data: ['Ae₂'],
//     }).label({
//       color: '#44ff44',
//       size: 12,
//     });

//     view.array({
//       data: [[e3_transformed[0] + 0.1, e3_transformed[1] + 0.1, e3_transformed[2] + 0.1]],
//       channels: 3,
//     }).text({
//       data: ['Ae₃'],
//     }).label({
//       color: '#4444ff',
//       size: 12,
//     });

//     // 7. Draw transformed coordinate axes (full range)
//     transformedView.array({
//       data: [[-5, 0, 0], [5, 0, 0]],
//       channels: 3,
//     }).line({
//       color: '#ff6666',
//       width: 4,
//     });

//     transformedView.array({
//       data: [[0, -5, 0], [0, 5, 0]],
//       channels: 3,
//     }).line({
//       color: '#66ff66',
//       width: 4,
//     });

//     transformedView.array({
//       data: [[0, 0, -5], [0, 0, 5]],
//       channels: 3,
//     }).line({
//       color: '#6666ff',
//       width: 4,
//     });

//     // Transformed grids
//     transformedView.grid({
//       axes: [1, 2], // XY plane
//       width: 2,
//       divideX: 10,
//       divideY: 10,
//       color: '#ff6666',
//       opacity: 0.6,
//     });

//     transformedView.grid({
//       axes: [1, 3], // ZX plane
//       width: 2,
//       divideX: 10,
//       divideY: 10,
//       color: '#6666ff',
//       opacity: 0.4,
//     });

//     transformedView.grid({
//       axes: [2, 3], // YZ plane
//       width: 2,
//       divideX: 10,
//       divideY: 10,
//       color: '#66ff66',
//       opacity: 0.4,
//     });

//     // Cleanup on unmount
//     return () => {
//       three.destroy();
//     };
//   }, [transformationMatrix]);

//   return (
//     <div 
//       ref={containerRef} 
//       style={{ width: '100%', height: '500px', overflow: 'hidden' }} 
//     />
//   );
return (
    <div></div>
)
};

export default MathBoxScene;