// import axios from 'axios';

// const API_BASE_URL = 'http://localhost:3000/api';

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor to add auth token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('authToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// export const bookingService = {
//   // Create booking
//   createBooking: (bookingData) =>
//     api.post('/booking', bookingData),

//   // Get student bookings
//   getStudentBookings: () => 
//     api.get('/booking/my-bookings'),

//   // Get all bookings (with status filter)
//   getAllBookings: (filters = {}) => 
//     api.get('/booking', { params: filters }),

//   // Get pending bookings
//   getPendingBookings: (params = {}) =>
//     api.get('/booking/pending', { params }),

//   // Approve booking
//   approveBooking: (bookingId) =>
//     api.put(`/booking/${bookingId}/approve`), // Changed to PUT and URL pattern

//   // Reject booking
//   rejectBooking: (bookingId, reason) => // Changed parameter name from rejectionReason to reason
//     api.put(`/booking/${bookingId}/reject`, { reason }), // Changed to PUT and URL pattern

//   // Get booking by ID
//   getBookingById: (bookingId) =>
//     api.get(`/booking/${bookingId}`),

//   // Get booking stats
//   getBookingStats: (hostelId) =>
//     api.get('/booking/stats', { params: { hostelId } }),

//   // Update booking
//   updateBooking: (bookingId, updateData) =>
//     api.put(`/booking/${bookingId}`, updateData),

//   // Cancel booking
//   cancelBooking: (bookingId, cancellationReason) =>
//     api.post(`/booking/cancel/${bookingId}`, { cancellationReason }),

//   // Delete booking
//   deleteBooking: (bookingId) =>
//     api.delete(`/booking/${bookingId}`),
// };