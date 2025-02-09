import React, { useState } from 'react';
import axios from 'axios';
import HandymanCards from './HandymanCards';  // Import the HandymanCards component
require('dotenv').config();
const SearchHandyperson = () => {
  const [skills, setSkills] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [maxCharge, setMaxCharge] = useState(50);  // Default minimum maxCharge as 50
  const [handypersons, setHandypersons] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/search-handyperson`, {
        params: {
          skills,
          minRating,
          minCharge: 0,
          maxCharge,
        },
      });
      setHandypersons(response.data);
      setError('');
    } catch (err) {
      setError('Error fetching handypersons. Please try again later.');
    }
  };

  return (
    <div className="search-handyperson">
      <h2 className="title">Search for Handypersons</h2>

      <div className="filters-container">
        {/* Skills Dropdown */}
        <select
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
        >
          <option value="">Select Skill</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Electrical">Electrical</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Landscaping">Landscaping</option>
          <option value="Roofing">Roofing</option>
          <option value="Painting">Painting</option>
          <option value="HVAC">HVAC</option>
          <option value="Carpentry">Carpentry</option>
        </select>

        {/* Rating Scrollbar */}
        <div>
          <label htmlFor="rating">Min Rating: {minRating}</label>
          <input
            type="range"
            id="rating"
            min="0"
            max="5"
            step="1"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
          />
        </div>

        {/* Max Charge Scrollbar */}
        <div>
          <label htmlFor="maxCharge">Max Charge: ${maxCharge}</label>
          <input
            type="range"
            id="maxCharge"
            min="50"
            max="100"
            value={maxCharge}
            onChange={(e) => setMaxCharge(e.target.value)}
          />
        </div>

        {/* Search Button */}
        <button onClick={handleSearch}>Search</button>
      </div>

      {error && <p className="error">{error}</p>}

      {/* Displaying the HandymanCards Component */}
      <div>
        {handypersons.length > 0 ? (
          <HandymanCards handymen={handypersons} /> // Pass the handypersons array as a prop
        ) : (
          <p>No handypersons found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchHandyperson;