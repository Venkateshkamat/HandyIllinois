import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManagerDashboard.css';
require('dotenv').config();
const ManagerDashboard = () => {
  const [managerId, setManagerId] = useState('');
  const [serviceRequests, setServiceRequests] = useState([]);
  const [handypersonPerformance, setHandypersonPerformance] = useState([]);
  const [customerSatisfaction, setCustomerSatisfaction] = useState([]);
  const [serviceEarnings, setServiceEarnings] = useState([]);
  const [topHandypersons, setTopHandypersons] = useState([]);
  const [error, setError] = useState('');

  const [typeFilter, setTypeFilter] = useState('');
  const [earningsServiceType, setEarningsServiceType] = useState('');
  const [topHandyLimit, setTopHandyLimit] = useState(5);

  // Fetch Service Requests when type filter changes
  const fetchServiceRequests = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/manager/service-requests`, {
        params: { managerId, type: typeFilter },
      });
      setServiceRequests(response.data);
    } catch (err) {
      setError('Error fetching service requests');
    }
  };

  // Fetch Handyperson Performance when type filter changes
  const fetchHandypersonPerformance = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/manager/handyperson-performance`, {
        params: { managerId, type: typeFilter },
      });
      setHandypersonPerformance(response.data);
    } catch (err) {
      setError('Error fetching handyperson performance data');
    }
  };

  // Fetch Customer Satisfaction when type filter changes
  const fetchCustomerSatisfaction = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/manager/customer-satisfaction`, {
        params: { managerId, type: typeFilter },
      });
      setCustomerSatisfaction(response.data);
    } catch (err) {
      setError('Error fetching customer satisfaction data');
    }
  };

  // Fetch Service Earnings when earnings service type changes
  const fetchServiceEarnings = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/manager/service-earnings`, {
        params: { managerId, serviceType: earningsServiceType },
      });
      setServiceEarnings(response.data);
    } catch (err) {
      setError('Error fetching service earnings data');
    }
  };

  // Fetch Top Handypersons when limit changes
  const fetchTopHandypersons = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/manager/top-handypersons`, {
        params: { managerId, limit: topHandyLimit },
      });
      setTopHandypersons(response.data);
    } catch (err) {
      setError('Error fetching top handypersons data');
    }
  };

  // Fetch data when managerId changes
  useEffect(() => {
    if (managerId) {
      fetchServiceRequests();
      fetchHandypersonPerformance();
      fetchCustomerSatisfaction();
      fetchServiceEarnings();
      fetchTopHandypersons();
    }
  }, [managerId]);

  // Fetch specific data based on user input
  useEffect(() => {
    if (managerId) {
      fetchServiceRequests();
    }
  }, [typeFilter]); // Only fetch service requests when the type filter changes

  useEffect(() => {
    if (managerId) {
      fetchHandypersonPerformance();
    }
  }, [typeFilter]); // Only fetch handyperson performance when the type filter changes

  useEffect(() => {
    if (managerId) {
      fetchCustomerSatisfaction();
    }
  }, [typeFilter]); // Only fetch customer satisfaction when the type filter changes

  useEffect(() => {
    if (managerId) {
      fetchServiceEarnings();
    }
  }, [earningsServiceType]); // Only fetch service earnings when the earnings service type changes

  useEffect(() => {
    if (managerId) {
      fetchTopHandypersons();
    }
  }, [topHandyLimit]); // Only fetch top handypersons when the limit changes

  return (
    <div className="manager-dashboard">
      <h2>Manager Dashboard</h2>
      {error && <p className="error">{error}</p>}

      <div className="manager-id">
        <label>Manager ID:</label>
        <input
          type="text"
          value={managerId}
          onChange={(e) => setManagerId(e.target.value)}
          placeholder="Enter Manager ID"
        />
      </div>

      <section>
        <h3>Service Requests</h3>
        <div className="filters">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="Electrical">Electrical</option>
            <option value="HVAC">HVAC</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Roofing">Roofing</option>
            <option value="Landscaping">Landscaping</option>
            <option value="Carpentry">Carpentry</option>
            <option value="Painting">Painting</option>
          </select>
        </div>
        <ul>
          {serviceRequests.map((req) => (
            <li key={req.serviceRequestId}>
              <div><strong>ServiceRequestId:</strong> {req.ServiceRequestId}</div>
              <div><strong>Description:</strong> {req.Description}</div>
              <div><strong>Date:</strong> {req.Date}</div>
              <div><strong>Time:</strong> {req.Time}</div>
              <div><strong>Status:</strong> {req.Status}</div>
              <div><strong>Type:</strong> {req.Type}</div>
              <div><strong>Charges:</strong> ${req.Charges}</div>
              <div><strong>Customer:</strong> {req.CustomerName}</div>
              <div><strong>HandyMan:</strong> {req.HandypersonName}</div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Handyperson Performance</h3>
        <ul>
          {handypersonPerformance.map((perf, index) => (
            <li key={index}>
              <div><strong>HandyId:</strong> {perf.HandyId}</div>
              <div><strong>Handyperson Name:</strong> {perf.HandypersonName}</div>
              <div><strong>Skills:</strong> {perf.Skills}</div>
              <div><strong>Average Rating:</strong> {perf.AverageRating} stars</div>
              <div><strong>Total Reviews:</strong> {perf.TotalReviews}</div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Customer Satisfaction</h3>
        <ul>
          {customerSatisfaction.map((sat, index) => (
            <li key={index}>
              <div><strong>Service Type:</strong> {sat.ServiceType}</div>
              <div><strong>Average Customer Satisfaction:</strong> {sat.AverageCustomerSatisfaction}</div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Service Earnings</h3>
        <ul>
          {serviceEarnings.map((earn, index) => (
            <li key={index}>
              <div><strong>Service Type:</strong> {earn.ServiceType}</div>
              <div><strong>Total Requests:</strong> {earn.TotalRequests}</div>
              <div><strong>Total Earnings:</strong> ${earn.TotalEarnings}</div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Top Handypersons</h3>
        <input
          type="number"
          placeholder="Limit"
          value={topHandyLimit}
          onChange={(e) => setTopHandyLimit(e.target.value)}
        />
        <ul>
          {topHandypersons.map((handy, index) => (
            <li key={index}>
              <div><strong>Handy ID:</strong> {handy.HandyId}</div>
              <div><strong>Handyperson Name:</strong> {handy.HandypersonName}</div>
              <div><strong>Skills:</strong> {handy.Skills}</div>
              <div><strong>Average Rating:</strong> {handy.AverageRating} stars</div>
              <div><strong>Total Reviews:</strong> {handy.TotalReviews}</div>
              <div><strong>Jobs Completed:</strong> {handy.jobsCompleted}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default ManagerDashboard;