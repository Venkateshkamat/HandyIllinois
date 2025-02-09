import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
require('dotenv').config();
const ProfileManagement = () => {
  const [customerId, setCustomerId] = useState('');
  const [userDetails, setUserDetails] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    Name: '',
    Address: '',
    ZIP: '',
    ContactNumber: '',
    Email: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.customerId) {
      setCustomerId(storedUser.customerId);
    } else {
      setError('User not logged in');
    }
  }, []);

  useEffect(() => {
    if (customerId) {
      fetchUserDetails();
    }
  }, [customerId, message]);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/profile/${customerId}`);
      setUserDetails(response.data);
      setFormData({
        Name: response.data.Name,
        Address: response.data.Address,
        ZIP: response.data.ZIP,
        ContactNumber: response.data.ContactNumber,
        Email: response.data.Email,
      });
    } catch (err) {
      setError('Error fetching user details');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const updateData = new FormData();
    updateData.append('customerId', customerId);
    updateData.append('Name', formData.Name);
    updateData.append('Address', formData.Address);
    updateData.append('ZIP', formData.ZIP);
    updateData.append('ContactNumber', formData.ContactNumber);
    updateData.append('Email', formData.Email);
    if (profileImage) {
      updateData.append('profileImage', profileImage);
    }

    try {
      await axios.put(`${BACKEND_URL}/profile/update`, updateData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Profile updated successfully');
      setIsEditing(false);
      fetchUserDetails();
    } catch (err) {
      setError('Error updating profile');
    }
  };

  const handleFileChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirmDelete) {
      try {
        await axios.delete(`${BACKEND_URL}/delete-account`, { data: { customerId } });
        setMessage('Account deleted successfully');
        navigate('/');
      } catch (err) {
        setError('Error deleting account');
      }
    }
  };

  return (
    <div className="profile-management">
      <h2>User Profile</h2>

      {error && <p className="error">{error}</p>}
      {message && <p className="message">{message}</p>}

      {userDetails.Name && !isEditing ? (
        <div>
          <h3>Profile Details</h3>
          <p><strong>Name:</strong> {userDetails.Name}</p>
          <p><strong>Address:</strong> {userDetails.Address}</p>
          <p><strong>ZIP:</strong> {userDetails.ZIP}</p>
          <p><strong>Contact Number:</strong> {userDetails.ContactNumber}</p>
          <p><strong>Email:</strong> {userDetails.Email}</p>
          {userDetails.ProfileImage && (
            <div>
              <p><strong>Profile Image:</strong></p>
              <img
                src={`data:image/jpeg;base64,${userDetails.ProfileImage}`}
                alt="Profile"
                style={{ width: '150px', height: '150px', borderRadius: '50%' }}
              />
            </div>
          )}
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
          <button onClick={handleDeleteAccount}>Delete Account</button>
        </div>
      ) : (
        <div>
          <h3>Edit Profile</h3>
          <form onSubmit={handleUpdateProfile}>
            <div>
              <label>Name:</label>
              <input
                type="text"
                value={formData.Name}
                onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Address:</label>
              <input
                type="text"
                value={formData.Address}
                onChange={(e) => setFormData({ ...formData, Address: e.target.value })}
                required
              />
            </div>
            <div>
              <label>ZIP:</label>
              <input
                type="text"
                value={formData.ZIP}
                onChange={(e) => setFormData({ ...formData, ZIP: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Contact Number:</label>
              <input
                type="text"
                value={formData.ContactNumber}
                onChange={(e) => setFormData({ ...formData, ContactNumber: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Email:</label>
              <input
                type="email"
                value={formData.Email}
                onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Profile Image:</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
            <button type="submit">Update Profile</button>
            <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfileManagement;