<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<br />
<div align="center">
  <h1 align="center">🔢 Eigen Stuff Calculator</h1>

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

The **Eigen Stuff Calculator** is an interactive web application designed to help students and educators visualize matrix transformations and eigenvalue concepts in both 2D and 3D space. Built with modern web technologies, it provides real-time 3D visualizations alongside step-by-step mathematical calculations.

### Key Features

**Interactive Matrix Input**
- Support for 2×2 and 3×3 matrices

**3D Visualization Engine**
- Real-time WebGL-powered 3D graphics
- Coordinate system transformations
- Basis vector animations
- Eigenspace visualization (lines, planes, and full spaces)

**Mathematical Analysis**
- Step-by-step eigenvalue calculation
- Characteristic polynomial generation
- Eigenvector and eigenspace computation

**Advanced Features**
- Android browser compatibility
- Mobile-responsive design
- LaTeX mathematical notation
- Export visualization data

### Visual Elements

- **Coordinate Axes**: Original (thin) and transformed (thick) coordinate systems
- **Basis Vectors**: Elementary basis vectors (e₁, e₂, e₃) and their transformations (Ae₁, Ae₂, Ae₃)
- **Eigenspaces**: Color-coded visualization of 1D (lines), 2D (planes), and 3D (full space) eigenspaces
- **Grid Systems**: Original and transformed coordinate grids
- **Labels**: Constant-size text labels for all mathematical objects

### 🛠️ Built With

- ![React][react-shield] - Frontend framework
- ![TypeScript][typescript-shield] - Type-safe JavaScript
- ![Three.js][three-shield] - 3D graphics library
- ![Vite][vite-shield] - Build tool and development server
- ![SCSS][scss-shield] - Enhanced CSS preprocessing

## Getting Started

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
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
# or
yarn build
```

The built application will be in the `dist/` directory.

## Usage Guide

### 1. Matrix Input
- Enter your 2×2 or 3×3 matrix using the interactive input grid
- Supports both decimal numbers and fractions (e.g., `1/2`, `3/4`)
- Invalid entries are highlighted in red

### 2. Real-time Visualization
- **3D Scene**: Interactive camera controls (rotate, zoom, pan)
- **Coordinate Systems**: Original (thin lines) vs. transformed (thick lines)
- **Basis Vectors**: See how elementary basis vectors transform under your matrix
- **Eigenspaces**: Color-coded visualization of eigenvalue-associated subspaces

### 3. Mathematical Analysis
- **Step-by-Step Solutions**: Complete eigenvalue calculation process
- **Characteristic Polynomial**: Automatically generated and solved
- **Eigenspace Information**: Detailed basis vectors and dimensions
- **LaTeX Formatting**: Professional mathematical notation

### 4. Educational Features
- **Transformation Legend**: Explains all visual elements
- **Color-Coded Elements**: Consistent coloring across visualization and analysis
- **Mobile Support**: Optimized for tablets and smartphones

## Mathematical Background

### Supported Operations

- **Eigenvalue Calculation**: Solves the characteristic equation det(λI - A) = 0
- **Eigenvector Computation**: Finds basis vectors for each eigenspace
- **Matrix Transformations**: Visualizes how matrices transform coordinate spaces
- **Null Space Calculation**: Computes kernel of (λI - A) matrices

### Visualization Methods

- **1D Eigenspaces**: Rendered as lines through the origin
- **2D Eigenspaces**: Displayed as point-cloud planes
- **3D Eigenspaces**: Shown as wireframe coordinate systems
- **Complex Eigenvalues**: Handled with appropriate mathematical notation

## Browser Compatibility

### Fully Supported
- Chrome/Chromium (Desktop & Android)
- Firefox (Desktop & Android)
- Safari (Desktop & iOS)
- Edge (Desktop)

### Mobile Optimizations
- Conservative WebGL settings for Android devices
- Larger touch targets and text sizes
- Reduced geometry complexity for performance
- Fallback rendering modes for older devices

## Contributing

Contributions make the open source community amazing! Any contributions you make are **greatly appreciated**.

### Development Setup

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes and test thoroughly
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Add comments for complex mathematical operations
- Test on multiple browsers and devices

## License

Distributed under the AGPL 3.0 License. See `LICENSE` for more information.

## Acknowledgments

- **Math.js** - Mathematical expression parsing and evaluation
- **Three.js** - 3D graphics rendering engine
- **React** - Component-based UI framework
- **Linear Algebra Community** - Mathematical foundations and algorithms

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/Deadbush225/RePhrase?style=for-the-badge
[contributors-url]: https://github.com/Deadbush225/RePhrase/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Deadbush225/RePhrase?style=for-the-badge
[forks-url]: https://github.com/Deadbush225/RePhrase/forks
[stars-shield]: https://img.shields.io/github/stars/Deadbush225/RePhrase?style=for-the-badge
[stars-url]: https://github.com/Deadbush225/RePhrase/stargazers
[issues-shield]: https://img.shields.io/github/issues/Deadbush225/RePhrase?style=for-the-badge
[issues-url]: https://github.com/Deadbush225/RePhrase/issues
[license-shield]: https://img.shields.io/github/license/Deadbush225/RePhrase?style=for-the-badge
[license-url]: https://github.com/Deadbush225/RePhrase/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/eliazar-inso-0342b7210/
[product-screenshot]: images/screenshot.png
[forks-shield]: https://img.shields.io/React?style=for-the-badge

[react-shield]: https://img.shields.io/badge/React-2596be?style=for-the-badge
[typescript-shield]: https://img.shields.io/badge/Typescript-3072ec?style=for-the-badge
[three-shield]: https://img.shields.io/badge/Three.js-eccd30?style=for-the-badge
[vite-shield]: https://img.shields.io/badge/Vite-d02dff?style=for-the-badge
[scss-shield]: https://img.shields.io/badge/SASS-ff2dc0?style=for-the-badge
