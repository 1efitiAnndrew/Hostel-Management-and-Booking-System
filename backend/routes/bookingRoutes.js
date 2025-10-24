const express = require('express');
const {
    createBooking,
    getStudentBookings,
    getAllBookings,
    getPendingBookings,
    approveBooking,
    rejectBooking,
    bulkUpdateBookings,
    getBookingStats,
    getBookingById,
    updateBooking,
    cancelBooking,
    deleteBooking
} = require('../controllers/bookingController');

const router = express.Router();

// Student routes
router.post('/', createBooking);
router.get('/my-bookings', getStudentBookings);

// Manager routes
router.get('/', getAllBookings);
router.get('/pending', getPendingBookings);
router.get('/stats', getBookingStats);
router.get('/:id', getBookingById);
router.put('/:id', updateBooking);
router.post('/cancel/:id', cancelBooking);
router.delete('/:id', deleteBooking);

// Manager approval workflow
router.post('/approve', approveBooking);
router.post('/reject', rejectBooking);
router.post('/bulk-action', bulkUpdateBookings);

module.exports = router;