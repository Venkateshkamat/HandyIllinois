// App.jsx or Routes.jsx
// import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Home from './components/Home';
import Logout from './components/Auth/Logout';
import Bookings from './components/Bookings';
import HandypersonProfile from './components/HandypersonProfile';
import CreateWorkOrder from './components/CreateWorkOrder';
import ManagerDashboard from './components/Manager/ManagerDashboard';
import Profile from './components/Profile/Profile';
import Navbar from './components/NavBar/Navbar';

const AppRoutes = () => {


  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout/>} />
        <Route path="/bookings" element={<Bookings/>} />
        <Route path="/handyProfile/:id" element={<HandypersonProfile/>} />
        <Route path="/createworkorder" element={<CreateWorkOrder/>} />
        <Route path="/managerdashboard" element={<ManagerDashboard/>} />
        <Route path="/Profile" element={<Profile/>} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;