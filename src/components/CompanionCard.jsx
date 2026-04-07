import React from 'react';
import { Star, MapPin } from 'lucide-react';
import './CompanionCard.css';

const CompanionCard = ({ companion }) => {
  return (
    <div className="companion-card glass-card">
      <div className="card-image-wrapper">
        <img src={companion.image} alt={companion.name} className="card-image" />
        <div className="card-price">
          ${companion.price}/hr
        </div>
      </div>
      <div className="card-content">
        <div className="card-header">
          <h3>{companion.name}, {companion.age}</h3>
          <div className="rating">
            <Star size={16} fill="var(--accent-gold)" color="var(--accent-gold)" />
            <span>{companion.rating}</span>
          </div>
        </div>
        <div className="card-location">
          <MapPin size={14} />
          <span>{companion.location}</span>
        </div>
        <div className="card-tags">
          {companion.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
        <button className="btn btn-primary w-100 mt-3" style={{ width: '100%', marginTop: '15px' }}>
          View Profile
        </button>
      </div>
    </div>
  );
};

export default CompanionCard;
