<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]

<br />
<div align="center">
  <h1 align="center">Eigen Stuff Calculator</h1>

  <p align="center">
    Interactive 3D Matrix Transformation & Eigenvalue Visualizer
    <br />
    A comprehensive educational tool for understanding linear algebra concepts
    <br />
    <br />
    <a href="https://github.com/Deadbush225/eigen-stuff-calculator"><strong>Explore the docs »</strong></a>
    <br />
    <a href="https://tutubi-eigen-stuff-calculator.vercel.app">View Demo</a>
    ·
    <a href="https://github.com/Deadbush225/eigen-stuff-calculator/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/Deadbush225/eigen-stuff-calculator/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

## About The Project

Our app **Eigen Stuff Calculator** is an interactive web application designed to help students and educators for showing step by step solutions for solving eigenvalues and finding eigenspaces. It can also visualize matrix transformations and eigenvalue concepts for both 2D and 3D space.

> 💡**Pro Tip: the website have an interactive onboarding for new users so you can go ahead and try it out** <a href="https://tutubi-eigen-stuff-calculator.vercel.app">here</a>

### Key Features

**Interactive Matrix Input**
- Support for 1×1 up to 5×5 matrices

**3D Visualization Engine**
- Visualization for 2×2 and 3×3 matrices
- Real-time WebGL-powered 3D graphics
  - Coordinate system transformations
  - Basis vector plots
  - Eigenspace visualization (lines, planes, and full spaces)

**Mathematical Analysis**
- Step-by-step eigenvalue calculation
- Characteristic polynomial generation
- Eigenvector and eigenspace computation

**Advanced Features**
- Android browser compatibility
- Mobile-responsive design

## Usage Guide
> 💡**Pro Tip: the website has interactive onboarding for new users**

### 1. Matrix Input
- Enter your 1×1 up to 5×5 matrix using the interactive input grid
- Invalid entries are highlighted in red

<img width="1203" height="520" alt="image" src="https://github.com/user-attachments/assets/024ff1c9-3ec3-4108-9ec2-7d686f712c7e" />

### 2. Mathematical Analysis
- **Step-by-Step Solutions**: Complete eigenvalue calculation process
- **Characteristic Polynomial**: Automatically generated and solved
- **Eigenspace Information**: Detailed basis vectors and dimensions
- **LaTeX Formatting**: Professional mathematical notation

<img width="1282" height="703" alt="image" src="https://github.com/user-attachments/assets/49a56dbf-15f9-470c-9aa2-7a0cb473086f" />

### 3. Real-time Visualization
- **3D Scene**: Interactive camera controls (rotate, zoom, pan)
- **Coordinate Systems**: Original (thin lines) vs. transformed (thick lines)
- **Basis Vectors**: See how elementary basis vectors transform under your matrix
- **Eigenspaces**: Color-coded visualization of eigenvalue-associated subspaces

<img width="1525" height="856" alt="image" src="https://github.com/user-attachments/assets/9a6f68ae-816e-41b9-bfde-2d2d45eaa8eb" />

### 4. Educational Features
- **Transformation Legend**: Explains all visual elements
- **Color-Coded Elements**: Consistent coloring across visualization and analysis

<img width="1465" height="628" alt="image" src="https://github.com/user-attachments/assets/21f5eb61-d5aa-49c8-bd45-42ff5e86f1b5" />


## Mathematical Concepts

### Supported Operations

- **Eigenvalue Calculation**: Solves using the characteristic equation $det(λI - A) = 0$
- **Eigenspace Visualization**: Finds basis vectors for each eigenspace

### Visualization Methods

- **2D Eigenspaces**: Displayed as point-cloud planes
- **3D Eigenspaces**: Shown as wireframe coordinate systems

## Browser Compatibility

### Fully Supported
- Chrome/Chromium (Desktop & Android)
- Safari (Desktop & iOS)

### Issues
- Problematic svg rendering for Firefox

### Mobile Optimizations
- Conservative WebGL settings for Android devices
- Larger touch targets and text sizes
- Reduced geometry complexity for performance

### Built With

![React][react-shield] - Frontend framework </br>
![TypeScript][typescript-shield] - Type-safe JavaScript</br>
![Three.js][three-shield] - 3D graphics library</br>
![Vite][vite-shield] - Build tool and development server</br>
![SCSS][scss-shield] - Enhanced CSS preprocessing</br>

## Getting Started Developing

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- Modern web browser with WebGL support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Deadbush225/eigen-stuff-calculator.git
   cd eigen-stuff-calculator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built application will be in the `dist/` directory.

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/Deadbush225/eigen-stuff-calculator?style=for-the-badge
[contributors-url]: https://github.com/Deadbush225/eigen-stuff-calculator/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Deadbush225/eigen-stuff-calculator?style=for-the-badge
[forks-url]: https://github.com/Deadbush225/eigen-stuff-calculator/forks
[stars-shield]: https://img.shields.io/github/stars/Deadbush225/eigen-stuff-calculator?style=for-the-badge
[stars-url]: https://github.com/Deadbush225/eigen-stuff-calculator/stargazers
[issues-shield]: https://img.shields.io/github/issues/Deadbush225/eigen-stuff-calculator?style=for-the-badge
[issues-url]: https://github.com/Deadbush225/eigen-stuff-calculator/issues

[react-shield]: https://img.shields.io/badge/React-2596be?style=for-the-badge
[typescript-shield]: https://img.shields.io/badge/Typescript-3072ec?style=for-the-badge
[three-shield]: https://img.shields.io/badge/Three.js-eccd30?style=for-the-badge
[vite-shield]: https://img.shields.io/badge/Vite-d02dff?style=for-the-badge
[scss-shield]: https://img.shields.io/badge/SASS-ff2dc0?style=for-the-badge
