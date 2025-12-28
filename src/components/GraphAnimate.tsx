import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { mathBox } from 'mathbox';
import 'mathbox/mathbox.css';

const MathBoxScene = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    // 1. Initialize MathBox
    const mathbox = mathBox({
      element: containerRef.current,
      plugins: ['core', 'controls', 'cursor', 'mathbox'],
      controls: { klass: OrbitControls },
    });

    const three = mathbox.three;
    three.renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);
    mathbox.camera({ proxy: true, position: [3, 2, 5] });

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

    // Z-axis (blue)
    view.array({
      data: [[0, 0, -5], [0, 0, 5]],
      channels: 3,
    }).line({
      color: '#0000ff',
      width: 3,
    });

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

    view.array({
      data: [[0, 0.5, 5.5]],
      channels: 3,
    }).text({
      data: ['Z'],
    }).label({
      color: '#0000ff',
      size: 16,
    });

    // 4. Draw 3D grid planes
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

    // 5. Draw Transformed coordinate system and grids
    // Example: Shear matrix in 3D
    const matrix = [
      1, 0.5, 0, 0,
      0, 1, 0.3, 0, 
      0, 0, 1, 0,
      0, 0, 0, 1
    ];

    // Transformed coordinate axes
    const transformedView = view.transform({ matrix: matrix });

    // Transformed X-axis (red)
    transformedView.array({
      data: [[-5, 0, 0], [5, 0, 0]],
      channels: 3,
    }).line({
      color: '#ff6666',
      width: 8,
    });

    // Transformed Y-axis (green)
    transformedView.array({
      data: [[0, -5, 0], [0, 5, 0]],
      channels: 3,
    }).line({
      color: '#66ff66',
      width: 8,
    });

    // Transformed Z-axis (blue)
    transformedView.array({
      data: [[0, 0, -5], [0, 0, 5]],
      channels: 3,
    }).line({
      color: '#6666ff',
      width: 8,
    });

    // Transformed grids
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

    // Cleanup on unmount
    return () => {
      three.destroy();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '500px', overflow: 'hidden' }} 
    />
  );
};

export default MathBoxScene;