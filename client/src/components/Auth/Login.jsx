import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios
import './Login.css';
require('dotenv').config();
const Login = () => {
  const [email, setEmail] = useState('brianmoore@yahoo.com');
  const [password, setPassword] = useState('*p1PcvNn+9');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send POST request to the /login endpoint with email and password
      const response = await axios.post(`${BACKEND_URL}/login`, { email, password });

      setMessage(response.data.message);

      // Store the entire user object in localStorage
      const user = {
        customerId: response.data.customerId,
        token: 'your-jwt-token', // Replace with actual token if needed
      };

      localStorage.setItem('user', JSON.stringify(user)); // Save user object in localStorage

      // Redirect to bookings page after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form className='form' onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
      <button onClick={() => navigate('/register')}>New user?</button>
      <button onClick={() => navigate('/')}>Home</button>
    </div>
  );
};

export default Login;