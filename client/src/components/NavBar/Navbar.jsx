import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('user') ? true : false;

  const handleLogoClick = () => {
    navigate('/'); // Navigate to the home page
  };

  return (
    <nav className="navbar">
      <h2 className="logo" onClick={handleLogoClick}>HandyIllinois</h2>

      <div className="navbar-buttons">
        {!isLoggedIn && (
          <>
            <button className="nav-button" onClick={() => navigate('/register')}>Register</button>
            <button className="nav-button" onClick={() => navigate('/login')}>Login</button>
          </>
        )}

        {isLoggedIn && (
          <>
            
            <button className="nav-button" onClick={() => navigate('/bookings')}>Bookings</button>
            <button className="nav-button" onClick={() => navigate('/profile')}>Profile</button>
            <button className="nav-button" onClick={() => navigate('/managerdashboard')}>Manager Dashboard</button>
            <button className="nav-button" onClick={() => navigate('/logout')}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;