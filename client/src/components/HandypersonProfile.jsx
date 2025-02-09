import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HandypersonProfile.css';
require('dotenv').config();

const HandypersonProfile = () => {
  const { id } = useParams();  // Get the handyperson id from the URL
  console.log(id);
  const navigate = useNavigate();   // Hook for navigation
  const [handyperson, setHandyperson] = useState(null);
  const [error, setError] = useState('');


  const handleCreateWorkOrder = () => {
    // Navigate to the create-work-order route, passing handyperson.id via state
    navigate('/createworkorder', {
      state: {
        handypersonId: handyperson.HandyId,
      },
    });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/handyperson-profile/${id}`);
        setHandyperson(response.data);
        console.log(response.data);
      } catch (err) {
        setError('Error fetching handyperson profile. Please try again later.');
      }
    };

    fetchProfile();
  }, [id]);  // Re-run effect when the ID changes

  if (error) {
    return <p>{error}</p>;
  }

  if (!handyperson) {
    return <p>Loading...</p>;
  }

  return (
    <div className="handyperson-profile">
      <h2>{handyperson.Name}</h2>
      <img
        src="/profile-image.jpg"  // Reference image from public folder
        alt={`${handyperson.Name} Profile`}
        className="profile-image"
      />
      <p>Location: {handyperson.Location}</p>
      <p>Skills: {handyperson.Skills}</p>
      <p>Rating: {handyperson.Rating}</p>
      <p>Contact: {handyperson.Contact}</p>
      <p>AgencyName: {handyperson.AgencyName}</p>
      <p>AgencyContact: {handyperson.AgencyContact}</p>

      <button onClick={handleCreateWorkOrder}>Create Work Order</button>
      <button onClick={() => navigate('/')}>Return to Search</button>
    </div>
  );
};

export default HandypersonProfile;
