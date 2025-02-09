import React from 'react';
import './HandmanCards.css';
import { Link } from 'react-router-dom';

// Helper function to convert Buffer to Base64
const bufferToBase64 = (buffer) => {
  if (!buffer || !Array.isArray(buffer)) return ''; // Handle case when buffer is null, undefined, or not an array

  // Convert the array of bytes into a binary string
  const binary = String.fromCharCode(...buffer);
  // Convert the binary string to Base64
  return `data:image/jpeg;base64,${window.btoa(binary)}`;
};

const HandymanCards = ({ handymen }) => {
  return (
    <div className="handyman-cards-container">
      {handymen.map((handyman) => (
        <div className="handyman-card" key={handyman.HandyId}>
          {/* Render the handyman's profile image or fall back to default */}
          <img
            src={
              handyman.ProfileImage?.data
                ? bufferToBase64(handyman.ProfileImage.data)
                : '/profile-image.jpg'
            }
            alt={`${handyman.Name} Profile`}
            className="profile-image"
            onError={(e) => {
              // Fallback to default image if loading fails
              e.target.src = '/profile-image.jpg';
            }}
          />
          <div className="handyman-details">
            <h3>{handyman.Name}</h3>
            <p><strong>Skills:</strong> {handyman.Skills}</p>
            <p><strong>Rating:</strong> {handyman.Rating}</p>
            <p><strong>Contact:</strong> {handyman.Contact}</p>
            <p><strong>Location:</strong> {handyman.Location}</p>
            <p><strong>Base Charge:</strong> ${handyman.BaseCharge}</p>
            <Link to={`/handyProfile/${handyman.HandyId}`}>
              <button>View Profile</button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HandymanCards;