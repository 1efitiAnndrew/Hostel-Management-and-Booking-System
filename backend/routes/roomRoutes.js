const express = require('express');
const router = express.Router();
const {
    createRooms,
    getAvailableRooms,
    getAvailableRoomsForBooking,
    getHostelRooms,
    getRoomById,
    updateRoom,
    updateRoomStatus,
    autoAssignRoom,
    manualAssignRoom,
    checkInStudent,
    checkOutStudent,
    getOccupancyReport,
    getRoomUtilization,
    getRoomDashboard,
    deactivateRoom,
    reactivateRoom
} = require('../controllers/roomController');

// Room management routes
router.post('/', createRooms);
router.get('/available', getAvailableRooms);
router.get('/available-for-booking', getAvailableRoomsForBooking); // Enhanced room search for bookings
router.get('/hostel/:hostelId', getHostelRooms); // Get all rooms for a specific hostel
router.get('/:roomId', getRoomById);
router.put('/:roomId', updateRoom);
router.patch('/:roomId/status', updateRoomStatus); // Update room status specifically
router.delete('/:roomId/deactivate', deactivateRoom); // Soft delete room
router.patch('/:roomId/reactivate', reactivateRoom); // Reactivate room

// Room assignment routes
router.post('/auto-assign', autoAssignRoom);
router.post('/manual-assign', manualAssignRoom);

// Check-in/check-out routes
router.post('/check-in', checkInStudent);
router.post('/check-out', checkOutStudent);

// Reports and analytics
router.get('/occupancy/:hostelId', getOccupancyReport);
router.get('/utilization/:hostelId', getRoomUtilization);
router.get('/dashboard/:hostelId', getRoomDashboard);

module.exports = router;