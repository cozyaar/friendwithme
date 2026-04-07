import React from 'react';
import { ArrowRight, Star, Shield, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content fade-in">
          <div className="badge">✨ Verified Companionship</div>
          <h1 className="hero-title">
            Meaningful connections <br />
            <span className="text-gradient">redefined.</span>
          </h1>
          <p className="hero-subtitle">
            Experience premium social companionship. Whether you need a plus-one for an event, 
            a guide for the city, or just someone to share a coffee with.
          </p>
          <div className="hero-actions">
            <Link to="/discover" className="btn btn-primary btn-large">
              Find a Companion <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        </div>
        <div className="hero-image-wrapper fade-in delay-2">
          {/* Aesthetic blurred circles behind image */}
          <div className="blur-blob blob-1"></div>
          <div className="blur-blob blob-2"></div>
          <div className="hero-image">
            <img src="/images/companion_1.png" alt="Elegant Companion" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section fade-in delay-3">
        <div className="section-header">
          <h2>Why Choose Aura?</h2>
          <p>We ensure a safe, private, and premium experience for all members.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card glass-card">
            <div className="icon-wrapper">
              <Shield size={28} color="var(--accent-gold)" />
            </div>
            <h3>100% Verified</h3>
            <p>Every profile undergoes rigorous KYC and background verification to ensure absolute safety.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="icon-wrapper">
              <Star size={28} color="var(--accent-gold)" />
            </div>
            <h3>Premium Elite</h3>
            <p>Curated companions that are educated, sophisticated, and perfect for exclusive social events.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="icon-wrapper">
              <Clock size={28} color="var(--accent-gold)" />
            </div>
            <h3>Flexible Booking</h3>
            <p>Book by the hour, day, or weekend. Transparent pricing with instant confirmations.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
