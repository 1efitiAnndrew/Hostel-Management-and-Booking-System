const express = require('express');
const { 
    createBooking, 
    getStudentBookings, 
    getAllBookings, 
    getBookingById, 
    updateBooking, 
    cancelBooking, 
    deleteBooking 
} = require('../controllers/bookingController');

const router = express.Router();

// Student routes
router.post('/', createBooking);
router.get('/my-bookings', getStudentBookings);
router.get('/:id', getBookingById);
router.put('/:id/cancel', cancelBooking);

// Manager/Admin routes
router.get('/', getAllBookings);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);

module.exports = router;