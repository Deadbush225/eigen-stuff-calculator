import React from "react";
import MathDisplay from "./util/MathDisplay";
import "./About.scss";

const MemberCard : React.FC<{ Fname: string, Lname: string, path: string }> = ({ Fname, Lname, path }) => (
    <div className="member-card">
        <img src={path} alt={`${Fname} ${Lname}`} className="member-photo" />
        <h3 style={{margin: 0}}>{Lname}</h3>
        <p style={{ margin: 0 }}>{Fname}</p>
    </div>
);

const About: React.FC = () => {
	return (
		<div className="about-container">
			<div className="about-content">
				<header className="about-header">
					<h1>About Solinjaro</h1>
					<p className="subtitle">
						Understanding Linear Algebra Through Visualization
					</p>
				</header>

				<div className="about-sections">
                    <section className="about-section">
                        <div className="about-sections">
                    <div>
                    <h2>👥 Team Members</h2>
                    <h3 style={{display: "inline"}}>Section: </h3><p style={{display: "inline"}}>BSCS 2-2</p>
                    </div>
                    <div className="members-grid">
                        <MemberCard Fname="Eliazar" Lname="INSO" path="/profiles/inso.jpg" />
                        <MemberCard Fname="Mark Elijah" Lname="SEVILLA" path="/profiles/sevilla.jpg" />
                        <MemberCard Fname="Jan Earl" Lname="RODRIGUEZ" path="/profiles/rodriguez.jpg" />
                        <MemberCard Fname="Hanzlei" Lname="JAMISON" path="/profiles/jamison.jpg" />
                        <MemberCard Fname="Mariel" Lname="OLIVEROS" path="/profiles/oliveros.jpg" />
                    </div>
                </div>
                    </section>

					<section className="about-section">
						<h2>🎯 What is Solinjaro?</h2>
						<p>
							Solinjaro is an interactive eigenvalue calculator designed to help
							students and educators understand the mathematical concepts behind
							eigenvalues and eigenvectors through step-by-step calculations and
							3D visualizations.
						</p>
					</section>

					<section className="about-section">
						<h2>📐 Mathematical Foundation</h2>
						<p>
							For a square matrix <MathDisplay latex="A" />, eigenvalues{" "}
							<MathDisplay latex="\lambda" />&nbsp;
							and eigenvectors <MathDisplay latex="\vec{v}" /> satisfy the
							fundamental equation:
						</p>
						<div className="math-highlight">
							<MathDisplay latex="A\vec{v} = \lambda\vec{v}" block />
						</div>
						<p>We find eigenvalues by solving the characteristic equation:</p>
						<div className="math-highlight">
							<MathDisplay latex="\det(\lambda I - A) = 0" block />
						</div>
					</section>

					<section className="about-section">
						<h2>🔧 Features</h2>
						<div className="features-grid">
							<div className="feature-card">
								<h3>📊 Manual Calculations</h3>
								<p>
									Step-by-step eigenvalue computation following traditional
									mathematical methods
								</p>
							</div>
							<div className="feature-card">
								<h3>🎮 3D Visualization</h3>
								<p>
									Interactive 3D representation of matrix transformations and
									eigenspaces
								</p>
							</div>
							<div className="feature-card">
								<h3>📝 LaTeX Rendering</h3>
								<p>
									Professional mathematical notation using KaTeX for clear
									presentation
								</p>
							</div>
							<div className="feature-card">
								<h3>🎨 Eigenspace Display</h3>
								<p>
									Visual representation of eigenspaces as lines, planes, or full
									spaces
								</p>
							</div>
							<div className="feature-card">
								<h3>📱 Responsive Design</h3>
								<p>
									Works seamlessly across desktop, tablet, and mobile devices
								</p>
							</div>
							<div className="feature-card">
								<h3>⚡ Real-time Updates</h3>
								<p>
									Instant recalculation and visualization as you modify matrix
									values
								</p>
							</div>
						</div>
					</section>

					<section className="about-section">
						<h2>🎓 Educational Value</h2>
						<p>
							This calculator is designed as an educational tool to bridge the
							gap between theoretical linear algebra concepts and their
							geometric interpretations. It helps students:
						</p>
						<ul className="educational-benefits">
							<li>
								Understand the relationship between matrices and linear
								transformations
							</li>
							<li>Visualize how eigenspaces behave under matrix operations</li>
							<li>
								Follow detailed mathematical steps in eigenvalue computation
							</li>
							<li>Connect algebraic calculations with geometric intuition</li>
							<li>
								Explore different matrix types and their eigenvalue patterns
							</li>
						</ul>
					</section>

					<section className="about-section">
						<h2>🛠️ Technology Stack</h2>
						<div className="tech-stack">
							<div className="tech-category">
								<h3>Frontend</h3>
								<ul>
									<li>React 18 with TypeScript</li>
									<li>SCSS for styling</li>
									<li>Vite for development</li>
								</ul>
							</div>
							<div className="tech-category">
								<h3>Mathematics</h3>
								<ul>
									<li>Math.js for numerical computations</li>
									<li>KaTeX for LaTeX rendering</li>
									<li>Custom eigenvalue algorithms</li>
								</ul>
							</div>
							<div className="tech-category">
								<h3>Visualization</h3>
								<ul>
									<li>Three.js for 3D graphics</li>
									<li>MathBox for mathematical visualization</li>
									<li>Custom matrix transformation display</li>
								</ul>
							</div>
						</div>
					</section>

					<section className="about-section">
						<h2>🎯 How to Use</h2>
						<div className="usage-steps">
							<div className="step">
								<div className="step-number">1</div>
								<div className="step-content">
									<h3>Input Matrix</h3>
									<p>
										Enter your matrix values in the input grid. Supports both
										2×2 and 3×3 matrices.
									</p>
								</div>
							</div>
							<div className="step">
								<div className="step-number">2</div>
								<div className="step-content">
									<h3>View Calculations</h3>
									<p>
										Observe the step-by-step eigenvalue calculation process with
										detailed mathematical notation.
									</p>
								</div>
							</div>
							<div className="step">
								<div className="step-number">3</div>
								<div className="step-content">
									<h3>Explore Visualization</h3>
									<p>
										Interact with the 3D visualization to understand matrix
										transformations and eigenspaces.
									</p>
								</div>
							</div>
							<div className="step">
								<div className="step-number">4</div>
								<div className="step-content">
									<h3>Analyze Results</h3>
									<p>
										Study the eigenvalues, eigenvectors, and their geometric
										interpretations.
									</p>
								</div>
							</div>
						</div>
					</section>

					<footer className="about-footer">
						<p>
							Built with ❤️ for the linear algebra learning community. Perfect
							for students, educators, and anyone curious about matrix
							mathematics.
						</p>
						<div className="version-info">
							<span>Version 1.0.0</span>
							<span>•</span>
							<span>Made with React & TypeScript</span>
						</div>
					</footer>
				</div>
			</div>
		</div>
	);
};

export default About;
