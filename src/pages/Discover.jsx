import React, { useState } from 'react';
import { Filter, Search } from 'lucide-react';
import CompanionCard from '../components/CompanionCard';
import './Discover.css';

const MOCK_COMPANIONS = [
  {
    id: 1,
    name: 'Isabella',
    age: 24,
    location: 'New York, NY',
    rating: 4.9,
    price: 150,
    image: '/images/companion_1.png',
    tags: ['Art Events', 'Fine Dining', 'City Guide']
  },
  {
    id: 2,
    name: 'Julian',
    age: 28,
    location: 'Los Angeles, CA',
    rating: 4.8,
    price: 120,
    image: '/images/companion_2.png',
    tags: ['Fitness', 'Coffee Dates', 'Concerts']
  },
  // Duplicating for showcasing functionality
  {
    id: 3,
    name: 'Elena',
    age: 26,
    location: 'Miami, FL',
    rating: 5.0,
    price: 180,
    image: '/images/companion_1.png',
    tags: ['Bilingual', 'Nightlife', 'Galas']
  },
  {
    id: 4,
    name: 'Marcus',
    age: 30,
    location: 'Chicago, IL',
    rating: 4.7,
    price: 100,
    image: '/images/companion_2.png',
    tags: ['Sports Events', 'Networking', 'Casual']
  }
];

const Discover = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="discover-container fade-in">
      <div className="discover-header">
        <h1>Discover Companions</h1>
        <p>Find the perfect match for your upcoming event or social outing.</p>
      </div>

      <div className="search-filter-bar glass">
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Search by name, location, or interest..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="btn btn-outline filter-btn">
          <Filter size={18} /> Filters
        </button>
      </div>

      <div className="companions-grid">
        {MOCK_COMPANIONS.map(companion => (
          <CompanionCard key={companion.id} companion={companion} />
        ))}
      </div>
    </div>
  );
};

export default Discover;
