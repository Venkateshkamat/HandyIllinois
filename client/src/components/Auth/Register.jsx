import React, { useState } from 'react';
import axios from 'axios'; // Import axios
import './Register.css';
import { useNavigate } from 'react-router-dom';
require('dotenv').config();
const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    zip: '',
    contactNumber: '',
    email: '',
    password: '',
  });
  const [profileImage, setProfileImage] = useState(null); // For storing the image file
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setProfileImage(e.target.files[0]); // Set the selected image file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Prepare form data for multipart upload
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      if (profileImage) {
        data.append('profileImage', profileImage); // Append the image file
      }

      // Send the form data using axios
      const response = await axios.post(
        `${BACKEND_URL}/register`,
        data,
        {
          headers: { 'Content-Type': 'multipart/form-data' }, // Set multipart content type
        }
      );

      // Set the success message
      setMessage(response.data.message);

      // Redirect to login page after a delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <form className='form' onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          maxLength={50}
          value={formData.name}
          onChange={handleChange}
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
        />
        <input
          type="text"
          name="zip"
          placeholder="ZIP Code"
          maxLength={5}
          value={formData.zip}
          onChange={handleChange}
        />
        <input
          type="text"
          name="contactNumber"
          placeholder="Contact Number"
          maxLength={10}
          value={formData.contactNumber}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange} // Handle file input change
        />

        <button type="submit">Register</button>
        <button type="button" onClick={() => navigate('/')}>Home</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Register;