import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { and, type Complex } from "mathjs";

import { type Eigenspace } from "../lib/eigen-types";

interface MathBoxSceneProps {
	transformationMatrix?: number[][];
	eigenspaces?: Eigenspace[];
}

const MathBoxScene: React.FC<MathBoxSceneProps> = ({
	transformationMatrix = [
		[1, 0, 0],
		[0, 1, 0],
		[0, 0, 1],
	],
	eigenspaces = [],
}) => {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		// Store reference to container for cleanup
		const container = containerRef.current;
    // Detect if Android device
    const isAndroid = /Android/i.test(navigator.userAgent);

		// Determine matrix dimensions and create appropriate transformation
		const matrixSize = transformationMatrix.length;
		const is2D = matrixSize === 2;

		// Create Three.js scene with WebGL renderer
		const scene = new THREE.Scene();
		scene.background = new THREE.Color(0xffffff);

		// Setup camera
		const camera = new THREE.PerspectiveCamera(
			75,
			container.clientWidth / container.clientHeight,
			0.1,
			1000
		);

		if (is2D) {
			camera.position.set(0, 0, 8); // Top-down view for 2D
		} else {
			camera.position.set(8, 8, 10); // Angled view for 3D with Z as upright axis
		}
		camera.lookAt(0, 0, 0);

		// Set camera up vector to make Z upright in 3D
		if (!is2D) {
			camera.up.set(0, 0, 1); // Z is the up direction
		}

		// Create WebGL renderer with conservative settings for Android
		const isAndroidNonFirefox =
			/Android/i.test(navigator.userAgent) &&
			!/Firefox/i.test(navigator.userAgent);

		const renderer = new THREE.WebGLRenderer({
			antialias: !isAndroidNonFirefox,
			alpha: true,
			powerPreference: isAndroidNonFirefox ? "default" : "high-performance",
			preserveDrawingBuffer: isAndroidNonFirefox,
		});

		renderer.setSize(container.clientWidth, container.clientHeight);
		renderer.setPixelRatio(
			Math.min(window.devicePixelRatio, isAndroidNonFirefox ? 2 : 3)
		);

		// Disable advanced features on Android for better compatibility
		if (isAndroidNonFirefox) {
			renderer.shadowMap.enabled = false;
		}

		container.appendChild(renderer.domElement);

		// Setup orbit controls
		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = !isAndroidNonFirefox;
		controls.dampingFactor = 0.1;
		controls.enableZoom = true;
		controls.enablePan = true;
		controls.enableRotate = true;

		// Create materials
		const lineMaterial = (color: number, linewidth: number = 1) =>
			new THREE.LineBasicMaterial({
				color: color,
				linewidth: isAndroidNonFirefox ? Math.max(linewidth, 2) : linewidth,
			});

		const pointMaterial = (color: number, size: number = 1) =>
			new THREE.PointsMaterial({
				color: color,
				size: isAndroidNonFirefox ? size * 1.5 : size,
				sizeAttenuation: false,
			});

		// Helper function to create line geometry
		const createLine = (
			points: number[][],
			color: number,
			linewidth: number = 1
		) => {
			const geometry = new THREE.BufferGeometry().setFromPoints(
				points.map((p) => new THREE.Vector3(p[0], p[1], p[2]))
			);
			const line = new THREE.Line(geometry, lineMaterial(color, linewidth));
			line.material.transparent = true;
			line.material.opacity = isAndroid ? 0.2 : 0.4;
			return line;
		};

		// Helper function to create points
		const createPoints = (
			points: number[][],
			color: number,
			size: number = 1
		) => {
			const geometry = new THREE.BufferGeometry().setFromPoints(
				points.map((p) => new THREE.Vector3(p[0], p[1], p[2]))
			);
			const pointsObj = new THREE.Points(geometry, pointMaterial(color, size));
			return pointsObj;
		};

		// Helper function to create text labels with constant screen size
		const createTextLabel = (
			text: string,
			position: THREE.Vector3,
			color: number = 0x000000
		) => {
			const canvas = document.createElement("canvas");
			const context = canvas.getContext("2d")!;
			canvas.width = 512;
			canvas.height = 256;

			// Clear canvas with transparent background
			//   context.clearRect(0, 0, canvas.width, canvas.height);

			// Add semi-transparent background for better visibility
			//   context.fillStyle = 'rgba(255, 255, 255, 0.8)';
			//   context.fillRect(0, 0, canvas.width, canvas.height);

			// Set up text styling
			context.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
			context.font = `bold ${isAndroidNonFirefox ? 48 : 64}px Arial`;
			context.textAlign = "center";
			context.textBaseline = "middle";

			// Add white stroke for better visibility
			context.strokeStyle = "#ffffff";
			context.lineWidth = 7;
			context.strokeText(text, canvas.width / 2, canvas.height / 2);

			// Fill the text
			context.fillText(text, canvas.width / 2, canvas.height / 2);

			const texture = new THREE.CanvasTexture(canvas);
			const material = new THREE.SpriteMaterial({
				map: texture,
				sizeAttenuation: false, // This makes the sprite maintain constant screen size
				transparent: true,
				alphaTest: 0.1, // Prevents z-fighting issues
				depthTest: false, // Disable depth testing to prevent flickering
				depthWrite: false, // Don't write to depth buffer
			});
			const sprite = new THREE.Sprite(material);
			sprite.position.copy(position);
			sprite.renderOrder = 1000; // Render labels on top of everything else

			// Make text labels much bigger
			const screenScale = isAndroidNonFirefox ? 0.4 : 0.5;
			sprite.scale.set(screenScale, screenScale * 0.5, 1);

			return sprite;
		};

		// 1. Draw coordinate axes
		const axisLength = 5;
		const axisLineWidth = isAndroidNonFirefox ? 5 : 3;

		// X-axis (red)
		scene.add(
			createLine(
				[
					[-axisLength, 0, 0],
					[axisLength, 0, 0],
				],
				0xff0000,
				axisLineWidth
			)
		);
		scene.add(createTextLabel("X", new THREE.Vector3(5.5, 0, 0), 0xff0000));

		// Y-axis (green)
		scene.add(
			createLine(
				[
					[0, -axisLength, 0],
					[0, axisLength, 0],
				],
				0x00ff00,
				axisLineWidth
			)
		);
		scene.add(createTextLabel("Y", new THREE.Vector3(0, 5.5, 0), 0x00ff00));

		// Z-axis (blue) - only for 3D
		if (!is2D) {
			scene.add(
				createLine(
					[
						[0, 0, -axisLength],
						[0, 0, axisLength],
					],
					0x0000ff,
					axisLineWidth
				)
			);
			scene.add(createTextLabel("Z", new THREE.Vector3(0, 0, 5.5), 0x0000ff));
		}

		// 2. Draw grid
		const gridSize = 10;
		const gridStep = 1;
		const gridLines = [];

		// XY plane grid (light gray)
		for (let i = -gridSize / 2; i <= gridSize / 2; i++) {
			if (i !== 0) {
				// Don't draw over axes
				gridLines.push([
					[-gridSize / 2, i * gridStep, 0],
					[gridSize / 2, i * gridStep, 0],
				]);
				gridLines.push([
					[i * gridStep, -gridSize / 2, 0],
					[i * gridStep, gridSize / 2, 0],
				]);
			}
		}

		gridLines.forEach((line) => {
			scene.add(createLine(line, 0xcccccc, 1));
		});

		// Additional grids for 3D (lighter and fewer lines for performance)
		if (!is2D && !isAndroidNonFirefox) {
			const additionalGridLines = [];

			// XZ plane
			for (let i = -gridSize / 2; i <= gridSize / 2; i++) {
				if (i !== 0) {
					additionalGridLines.push([
						[-gridSize / 2, 0, i * gridStep],
						[gridSize / 2, 0, i * gridStep],
					]);
					additionalGridLines.push([
						[i * gridStep, 0, -gridSize / 2],
						[i * gridStep, 0, gridSize / 2],
					]);
				}
			}

			// YZ plane
			for (let i = -gridSize / 2; i <= gridSize / 2; i++) {
				if (i !== 0) {
					additionalGridLines.push([
						[0, -gridSize / 2, i * gridStep],
						[0, gridSize / 2, i * gridStep],
					]);
					additionalGridLines.push([
						[0, i * gridStep, -gridSize / 2],
						[0, i * gridStep, gridSize / 2],
					]);
				}
			}

			additionalGridLines.forEach((line) => {
				scene.add(createLine(line, 0xdddddd, 1));
			});
		}

		// 3. Draw elementary basis vectors (original)
		const basisLineWidth = isAndroidNonFirefox ? 8 : 6;
		const pointSize = isAndroidNonFirefox ? 12 : 8;

    const textOffset = 0.3;

		// e1 = [1, 0, 0] - unit vector along X (red)
		scene.add(
			createLine(
				[
					[0, 0, 0],
					[1, 0, 0],
				],
				0xcc0000,
				basisLineWidth
			)
		);
		scene.add(createPoints([[1, 0, 0]], 0xcc0000, pointSize));
		scene.add(createTextLabel("e₁", new THREE.Vector3(1.1, 0.1, 0 - textOffset), 0xcc0000));

		// e2 = [0, 1, 0] - unit vector along Y (green)
		scene.add(
			createLine(
				[
					[0, 0, 0],
					[0, 1, 0],
				],
				0x00cc00,
				basisLineWidth
			)
		);
		scene.add(createPoints([[0, 1, 0]], 0x00cc00, pointSize));
		scene.add(createTextLabel("e₂", new THREE.Vector3(0.1, 1.1, 0 - textOffset), 0x00cc00));

		// e3 = [0, 0, 1] - unit vector along Z (blue) - only for 3D
		if (!is2D) {
			scene.add(
				createLine(
					[
						[0, 0, 0],
						[0, 0, 1],
					],
					0x0000cc,
					basisLineWidth
				)
			);
			scene.add(createPoints([[0, 0, 1]], 0x0000cc, pointSize));
			scene.add(
				createTextLabel("e₃", new THREE.Vector3(0.1, 0, 1.1 - textOffset), 0x0000cc)
			);
		}

		// 4. Calculate transformed basis vectors
		let e1_transformed: number[],
			e2_transformed: number[],
			e3_transformed: number[];

		if (is2D) {
			e1_transformed = [
				transformationMatrix[0][0],
				transformationMatrix[1][0],
				0,
			];
			e2_transformed = [
				transformationMatrix[0][1],
				transformationMatrix[1][1],
				0,
			];
			e3_transformed = [0, 0, 1]; // Z remains unchanged in 2D
		} else {
			e1_transformed = [
				transformationMatrix[0][0],
				transformationMatrix[1][0],
				transformationMatrix[2][0],
			];
			e2_transformed = [
				transformationMatrix[0][1],
				transformationMatrix[1][1],
				transformationMatrix[2][1],
			];
			e3_transformed = [
				transformationMatrix[0][2],
				transformationMatrix[1][2],
				transformationMatrix[2][2],
			];
		}

		// 5. Draw transformed elementary basis vectors (thick arrows)
		const transformedLineWidth = isAndroidNonFirefox ? 12 : 10;
		const transformedPointSize = isAndroidNonFirefox ? 16 : 12;

		// Transformed e1 (red)
		scene.add(
			createLine([[0, 0, 0], e1_transformed], 0xff4444, transformedLineWidth)
		);
		scene.add(createPoints([e1_transformed], 0xff4444, transformedPointSize));
		scene.add(
			createTextLabel(
				"Ae₁",
				new THREE.Vector3(
					e1_transformed[0] + 0.1,
					e1_transformed[1] + 0.1,
					e1_transformed[2] + textOffset
				),
				0xff4444
			)
		);

		// Transformed e2 (green)
		scene.add(
			createLine([[0, 0, 0], e2_transformed], 0x44AB44, transformedLineWidth)
		);
		scene.add(createPoints([e2_transformed], 0x44AB44, transformedPointSize));
		scene.add(
			createTextLabel(
				"Ae₂",
				new THREE.Vector3(
					e2_transformed[0] + 0.1,
					e2_transformed[1] + 0.1,
					e2_transformed[2] + textOffset
				),
				0x44AB44
			)
		);

		// Transformed e3 (blue) - only for 3D
		if (!is2D) {
			scene.add(
				createLine([[0, 0, 0], e3_transformed], 0x4444ff, transformedLineWidth)
			);
			scene.add(createPoints([e3_transformed], 0x4444ff, transformedPointSize));
			scene.add(
				createTextLabel(
					"Ae₃",
					new THREE.Vector3(
						e3_transformed[0] + 0.1,
						e3_transformed[1] + 0.1,
						e3_transformed[2] + textOffset
					),
					0x4444ff
				)
			);
		}

		// 6. Draw transformed coordinate axes (lighter colors)
		const transformedAxisWidth = isAndroidNonFirefox ? 6 : 4;

		// Apply transformation matrix to create transformed axes
		const transformAxis = (axis: number[]) => {
			if (is2D) {
				return [
					axis[0] * transformationMatrix[0][0] +
						axis[1] * transformationMatrix[0][1],
					axis[0] * transformationMatrix[1][0] +
						axis[1] * transformationMatrix[1][1],
					axis[2],
				];
			} else {
				return [
					axis[0] * transformationMatrix[0][0] +
						axis[1] * transformationMatrix[0][1] +
						axis[2] * transformationMatrix[0][2],
					axis[0] * transformationMatrix[1][0] +
						axis[1] * transformationMatrix[1][1] +
						axis[2] * transformationMatrix[1][2],
					axis[0] * transformationMatrix[2][0] +
						axis[1] * transformationMatrix[2][1] +
						axis[2] * transformationMatrix[2][2],
				];
			}
		};

		// Transformed X-axis
		const transformedXStart = transformAxis([-axisLength, 0, 0]);
		const transformedXEnd = transformAxis([axisLength, 0, 0]);
		scene.add(
			createLine(
				[transformedXStart, transformedXEnd],
				0xff6666,
				transformedAxisWidth
			)
		);

		// Transformed Y-axis
		const transformedYStart = transformAxis([0, -axisLength, 0]);
		const transformedYEnd = transformAxis([0, axisLength, 0]);
		scene.add(
			createLine(
				[transformedYStart, transformedYEnd],
				0x66ff66,
				transformedAxisWidth
			)
		);

		// Transformed Z-axis - only for 3D
		if (!is2D) {
			const transformedZStart = transformAxis([0, 0, -axisLength]);
			const transformedZEnd = transformAxis([0, 0, axisLength]);
			scene.add(
				createLine(
					[transformedZStart, transformedZEnd],
					0x6666ff,
					transformedAxisWidth
				)
			);
		}

		// 7. Draw transformed grid (fewer lines for performance)
		if (!isAndroidNonFirefox) {
			// Skip on Android for performance
			const transformedGridLines = [];
			const gridDensity = 2; // Sparser grid for performance

			for (let i = -gridSize / 2; i <= gridSize / 2; i += gridDensity) {
				if (i !== 0) {
					// XY plane grid lines
					const line1Start = transformAxis([-gridSize / 2, i * gridStep, 0]);
					const line1End = transformAxis([gridSize / 2, i * gridStep, 0]);
					transformedGridLines.push([line1Start, line1End]);

					const line2Start = transformAxis([i * gridStep, -gridSize / 2, 0]);
					const line2End = transformAxis([i * gridStep, gridSize / 2, 0]);
					transformedGridLines.push([line2Start, line2End]);
				}
			}

			transformedGridLines.forEach((line) => {
				scene.add(createLine(line, 0xff9999, 1)); // Light red for transformed grid
			});
		}

		// 8. Draw eigenspaces using Three.js
		if (eigenspaces && eigenspaces.length > 0) {
			const eigenspaceColors = [
				"#af00af",
				"#00afaf",
				"#afaf00",
				"#ff8000",
				"#8000ff",
			];

			eigenspaces.forEach((eigenspace, index) => {
				// Type guard to ensure we have a proper Eigenspace object
				if (
					!eigenspace ||
					typeof eigenspace !== "object" ||
					!("eigenvalue" in eigenspace) ||
					!("basis" in eigenspace)
				) {
					return;
				}

				if (!eigenspace.basis || eigenspace.basis.length === 0) {
					return;
				}

				const color = eigenspaceColors[index % eigenspaceColors.length];
				const colorHex = parseInt(color.replace("#", ""), 16);
				const eigenvalue =
					typeof eigenspace.eigenvalue === "number"
						? eigenspace.eigenvalue.toFixed(3)
						: `${(eigenspace.eigenvalue as Complex).re.toFixed(3)}+${(
								eigenspace.eigenvalue as Complex
						  ).im.toFixed(3)}i`;

				// Convert basis vectors to numerical format for visualization
				const numericBasis = eigenspace.basis.map((vec: (string | number)[]) =>
					vec.map((component: string | number) =>
						typeof component === "number"
							? component
							: parseFloat(component.toString()) || 0
					)
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
					const magnitude = Math.sqrt(
						workingVector[0] ** 2 +
							workingVector[1] ** 2 +
							workingVector[2] ** 2
					);
					const scaleFactor = magnitude > 0 ? 3 / magnitude : 1;
					const scaledVector = workingVector.map((x) => x * scaleFactor);

					const eigenLineWidth = isAndroidNonFirefox ? 10 : 8;
					const eigenVectorWidth = isAndroidNonFirefox ? 14 : 12;
					const eigenPointSize = isAndroidNonFirefox ? 18 : 16;

					// Draw eigenspace line (both directions)
					scene.add(
						createLine(
							[
								[
									-scaledVector[0] * 2,
									-scaledVector[1] * 2,
									-scaledVector[2] * 2,
								],
								[scaledVector[0] * 2, scaledVector[1] * 2, scaledVector[2] * 2],
							],
							colorHex,
							eigenLineWidth
						)
					);

					// Draw eigenvector arrow
					scene.add(
						createLine([[0, 0, 0], scaledVector], colorHex, eigenVectorWidth)
					);

					// Draw arrowhead (point)
					scene.add(createPoints([scaledVector], colorHex, eigenPointSize));

					// Add eigenvalue label
					scene.add(
						createTextLabel(
							`λ=${eigenvalue}`,
							new THREE.Vector3(
								scaledVector[0] + 0.3,
								scaledVector[1] + 0.3,
								scaledVector[2] + 0.3
							),
							colorHex
						)
					);
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

					// Create a grid of points to represent the plane (sparser for Android)
					const gridSize = isAndroidNonFirefox ? 3 : 5;
					const gridPoints: number[][] = [];

					for (let i = -gridSize * 2; i <= gridSize * 2; i++) {
						for (let j = -gridSize * 2; j <= gridSize * 2; j++) {
							const s = i * 0.5;
							const t = j * 0.5;
							const point = [
								s * workingV1[0] + t * workingV2[0],
								s * workingV1[1] + t * workingV2[1],
								s * workingV1[2] + t * workingV2[2],
							];
							gridPoints.push(point);
						}
					}

					// Draw the plane as a grid of points
					scene.add(createPoints(gridPoints, colorHex, 4));

					const basisVectorWidth = isAndroidNonFirefox ? 10 : 8;
					const basisPointSize = isAndroidNonFirefox ? 14 : 12;

					// Draw the two basis vectors
					scene.add(
						createLine([[0, 0, 0], workingV1], colorHex, basisVectorWidth)
					);
					scene.add(
						createLine([[0, 0, 0], workingV2], colorHex, basisVectorWidth)
					);

					// Draw basis vector endpoints
					scene.add(
						createPoints([workingV1, workingV2], colorHex, basisPointSize)
					);

					// Add eigenvalue label
					const midpoint = [
						(workingV1[0] + workingV2[0]) / 2 + 0.3,
						(workingV1[1] + workingV2[1]) / 2 + 0.3,
						(workingV1[2] + workingV2[2]) / 2 + 0.3,
					];

					scene.add(
						createTextLabel(
							`λ=${eigenvalue}`,
							new THREE.Vector3(midpoint[0], midpoint[1], midpoint[2]),
							colorHex
						)
					);
				} else if (dimension === 3 || (dimension === 2 && is2D)) {
					// 3D eigenspace or full 2D space: The entire space (rare case, usually for λI)
					// Create a special visualization for full-space eigenspaces
					if (is2D) {
						// For 2D: highlight the entire XY plane with a grid pattern
						const fullSpaceGridLines = [];
						for (let i = -axisLength; i <= axisLength; i += 0.5) {
							if (i !== 0) {
								fullSpaceGridLines.push([
									[-axisLength, i, 0],
									[axisLength, i, 0],
								]);
								fullSpaceGridLines.push([
									[i, -axisLength, 0],
									[i, axisLength, 0],
								]);
							}
						}

						fullSpaceGridLines.forEach((line) => {
							scene.add(createLine(line, colorHex, 2));
						});

						// Add label at a visible location
						scene.add(
							createTextLabel(
								`λ=${eigenvalue} (ℝ²)`,
								new THREE.Vector3(2, 2, 0),
								colorHex
							)
						);
					} else {
						// For 3D: Create wireframe-style visualization
						const fullSpace3DLines = [];
						const range = 5;
						// XY plane lines
						for (let i = -range; i <= range; i += 1) {
							fullSpace3DLines.push([
								[-range, i, 0],
								[range, i, 0],
							]);
							fullSpace3DLines.push([
								[i, -range, 0],
								[i, range, 0],
							]);
						}

						// XZ plane lines
						for (let i = -5; i <= 5; i += 1) {
							fullSpace3DLines.push([
								[-range, 0, i],
								[range, 0, i],
							]);
							fullSpace3DLines.push([
								[i, 0, -range],
								[i, 0, range],
							]);
						}

						// YZ plane lines
						for (let i = -5; i <= 5; i += 1) {
							fullSpace3DLines.push([
								[0, -range, i],
								[0, range, i],
							]);
							fullSpace3DLines.push([
								[0, i, -range],
								[0, i, range],
							]);
						}

						fullSpace3DLines.forEach((line) => {
							scene.add(createLine(line, colorHex, 5));
						});

						// Add label at origin
						scene.add(
							createTextLabel(
								`λ=${eigenvalue} (ℝ³)`,
								new THREE.Vector3(1, 1, 1),
								colorHex
							)
						);
					}
				}
			});
		}

		// Animation and render loop
		let animationFrameId: number;

		const animate = () => {
			animationFrameId = requestAnimationFrame(animate);

			// Update controls
			controls.update();

			// Render the scene
			renderer.render(scene, camera);
		};

		// Start the animation loop
		animate();

		// Handle window resize
		const handleResize = () => {
			if (!container) return;

			const width = container.clientWidth;
			const height = container.clientHeight;

			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.setSize(width, height);
		};

		window.addEventListener("resize", handleResize);

		// 9. Cleanup function
		return () => {
			// Cancel animation frame
			if (animationFrameId) {
				cancelAnimationFrame(animationFrameId);
			}

			// Remove event listeners
			window.removeEventListener("resize", handleResize);

			// Dispose of controls
			controls.dispose();

			// Remove renderer from DOM
			if (container && renderer.domElement.parentNode) {
				container.removeChild(renderer.domElement);
			}

			if (renderer) {
				renderer.dispose();
			}
			if (scene) {
				// Dispose of all geometries and materials
				scene.traverse((object: THREE.Object3D) => {
					if (
						object instanceof THREE.Mesh ||
						object instanceof THREE.Line ||
						object instanceof THREE.Points
					) {
						if (object.geometry) object.geometry.dispose();
						if (object.material) {
							if (Array.isArray(object.material)) {
								object.material.forEach((material) => material.dispose());
							} else {
								object.material.dispose();
							}
						}
					}
				});
				scene.clear();
			}
		};
	}, [transformationMatrix, eigenspaces]);

	return (
		<div
			ref={containerRef}
			style={{ width: "100%", height: "500px", overflow: "hidden" }}
		/>
	);
};

export default MathBoxScene;
