import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, CalendarHeart, User, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'glass' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo text-gradient">
          <Sparkles size={24} color="var(--accent-gold)" />
          <span>Aura Companions</span>
        </Link>
        
        <div className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/discover" 
            className={`nav-link ${location.pathname === '/discover' ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Discover
          </Link>
          <div className="nav-actions">
            <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              <User size={18} style={{ marginRight: '6px' }} /> Login
            </button>
            <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              <CalendarHeart size={18} style={{ marginRight: '6px' }} /> Join as Companion
            </button>
          </div>
        </div>

        <button 
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
