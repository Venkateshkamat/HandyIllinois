import React from 'react';
import Navbar from './NavBar/Navbar'; // Import the Navbar component
import './Home.css';
import SearchHandyperson from './SearchHandyperson';  

const Home = () => {
  return (
    <div className='Home'>

      <h1>Welcome to HandyIllinois</h1>
      <p>HandyIllinois is a platform that connects you with the best handymen in Illinois.</p>

      {/* Show the SearchHandyperson component */}
      <SearchHandyperson />
    </div>
  );
};

export default Home;