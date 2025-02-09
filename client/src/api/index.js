import axios from 'axios';
require('dotenv').config();
const api = axios.create({
  baseURL: `${BACKEND_URL}`,
});

//auth endpoints
export const registerUser = (userData) => api.post('/register', userData);
export const loginUser = (credentials) => api.post('/login', credentials);
export const logoutUser = () => api.post('/logout');

//booking endpoints
export const getBookings = (customerId) => api.get(`/bookings/${customerId}`);
export const cancelBooking = (customerId, serviceRequestId) => api.put(`/bookings/${customerId}/cancel/${serviceRequestId}`);
export const submitReview = (customerId, serviceRequestId, reviewData) => api.post(`/bookings/${customerId}/review/${serviceRequestId}`, reviewData);

export default api;