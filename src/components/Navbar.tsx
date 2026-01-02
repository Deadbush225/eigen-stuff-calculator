import React, { useState } from 'react';
import './Navbar.scss';

interface NavbarProps {
  activeSection?: 'calculator' | 'about';
  onSectionChange?: (section: 'calculator' | 'about') => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  activeSection = 'calculator', 
  onSectionChange 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSectionClick = (section: 'calculator' | 'about') => {
    onSectionChange?.(section);
    setIsMenuOpen(false); // Close mobile menu when item is selected
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo Section */}
        <div className="navbar-logo">
          <div className="logo-icon">
            <span className="lambda">λ</span>
          </div>
          <div className="logo-text">
            <h1>Solinjaro</h1>
            <span className="tagline">Matrix Eigenvalue Calculator</span>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Menu */}
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <ul className="navbar-nav">
            <li className="nav-item">
              <button
                className={`nav-link ${activeSection === 'calculator' ? 'active' : ''}`}
                onClick={() => handleSectionClick('calculator')}
              >
                {/* <span className="nav-icon">🧮</span> */}
                Calculator
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}
                onClick={() => handleSectionClick('about')}
              >
                {/* <span className="nav-icon">ℹ️</span> */}
                About
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;