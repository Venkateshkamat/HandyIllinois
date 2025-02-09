import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreateWorkOrder.css';
require('dotenv').config();
const CreateWorkOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { handypersonId } = location.state || {}; // Get handypersonId from the state
  const customerId = JSON.parse(localStorage.getItem('user'))?.customerId;

  const [jobDescription, setJobDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!handypersonId || !customerId) {
      setErrorMessage('Missing required information. Please try again.');
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/create-work-order`, {
        description: jobDescription,
        handyId: handypersonId,
        customerId: customerId,
        preferredDate,
      });

      setSuccessMessage('Work order created successfully!');
      setErrorMessage('');
      // Reset form fields
      setJobDescription('');
      setPreferredDate('');
    } catch (error) {
      setSuccessMessage('');
      setErrorMessage('Error creating work order. Please try again.');
    }
  };

  return (
    <div className="create-work-order">
      <h2>Create a Work Order</h2>
      <p>Handyperson ID: {handypersonId}</p>
      <p>Customer ID: {customerId}</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="jobDescription">Job Description:</label>
          <textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="preferredDate">Preferred Date:</label>
          <input
            type="date"
            id="preferredDate"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            required
          />
        </div>

        <button type="submit">Create Work Order</button>
        <button type="button" onClick={() => navigate(-1)}>Go Back</button>
      </form>

      {successMessage && <p className="success">{successMessage}</p>}
      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
};

export default CreateWorkOrder;