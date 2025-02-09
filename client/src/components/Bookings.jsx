import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios directly
import { cancelBooking, submitReview } from '../api/index';
// Keep cancelBooking and submitReview as is
import './Bookings.css';
require('dotenv').config();
const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [type, setType] = useState('ongoing'); // Default to 'ongoing'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [review, setReview] = useState({}); // For review inputs

  // Fetch customerId from localStorage
  const customerId = JSON.parse(localStorage.getItem('user'))?.customerId;
  console.log(customerId);
  // Fetch bookings directly using Axios
  const loadBookings = async () => {
    // if (!customerId) return; // Avoid API call if customerId is missing
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${BACKEND_URL}/bookings/${customerId}`, {
        params: { type: type }, // Pass type as a query parameter
      });
      setBookings(response.data); // Set the fetched bookings in state
      console.log(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error fetching bookings');
    } finally {
      setLoading(false);
    }
  };

  // Cancel a booking
  const handleCancelBooking = async (serviceRequestId) => {
    try {
      await cancelBooking(customerId, serviceRequestId);
      alert('Booking canceled successfully');
      loadBookings(); // Refresh bookings
    } catch (err) {
      alert(err.response?.data?.error || 'Error canceling booking');
    }
  };

  // Submit a review for a booking
  const handleSubmitReview = async (serviceRequestId) => {
    const { comment, reviewTitle, rating } = review[serviceRequestId] || {};
    if (!rating || rating < 1 || rating > 5) {
      alert('Rating must be between 1 and 5');
      return;
    }

    try {
      await submitReview(customerId, serviceRequestId, {
        comment,
        reviewTitle,
        rating,
      });
      alert('Review submitted successfully');
      loadBookings(); // Refresh bookings
    } catch (err) {
      alert(err.response?.data?.error || 'Error submitting review');
    }
  };

  // Handle review input change
  const handleChangeReview = (serviceRequestId, field, value) => {
    setReview((prev) => ({
      ...prev,
      [serviceRequestId]: {
        ...prev[serviceRequestId],
        [field]: value,
      },
    }));
  };

  // Trigger bookings loading when customerId or type changes
  useEffect(() => {
    if (true) {
      loadBookings(); // Load bookings when type or customerId changes
    }
  }, [type, customerId]); // Dependency array for type and customerId

  return (
    <div className="bookings">
      <h2>Bookings</h2>
      <div>
        <button onClick={() => setType('ongoing')}>Ongoing</button>
        <button onClick={() => setType('past')}>Past</button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      <ul>
        {bookings.map((booking) => (
          <li key={booking.ServiceRequestId}>
            <h3>{booking.Description}</h3>
            <p>Service Type: {booking.Type}</p>
            <p>Charges: ${booking.Charges}</p>
            <p>Status: {booking.Status}</p>
            {type === 'ongoing' && (
              <button onClick={() => handleCancelBooking(booking.ServiceRequestId)}>
                Cancel Booking
              </button>
            )}
            {type === 'past' && (
              <div>
                <h4>Leave a Review</h4>
                <input
                  type="text"
                  placeholder="Review Title"
                  value={review[booking.ServiceRequestId]?.reviewTitle || ''}
                  onChange={(e) =>
                    handleChangeReview(booking.ServiceRequestId, 'reviewTitle', e.target.value)
                  }
                />
                <textarea
                  placeholder="Comment"
                  value={review[booking.ServiceRequestId]?.comment || ''}
                  onChange={(e) =>
                    handleChangeReview(booking.ServiceRequestId, 'comment', e.target.value)
                  }
                />
                <input
                  type="number"
                  placeholder="Rating (1-5)"
                  value={review[booking.ServiceRequestId]?.rating || ''}
                  onChange={(e) =>
                    handleChangeReview(booking.ServiceRequestId, 'rating', e.target.value)
                  }
                />
                <button onClick={() => handleSubmitReview(booking.ServiceRequestId)}>
                  Submit Review
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Bookings;