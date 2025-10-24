const express = require('express');
const router = express.Router();
const {
    createRooms,
    getAvailableRooms,
    getRoomById,
    updateRoom,
    autoAssignRoom,
    manualAssignRoom,
    checkInStudent,
    checkOutStudent,
    getOccupancyReport
} = require('../controllers/roomController');

// Room management routes
router.post('/', createRooms);
router.get('/available', getAvailableRooms);
router.get('/:roomId', getRoomById);
router.put('/:roomId', updateRoom);

// Room assignment routes
router.post('/auto-assign', autoAssignRoom);
router.post('/manual-assign', manualAssignRoom);

// Check-in/check-out routes
router.post('/check-in', checkInStudent);
router.post('/check-out', checkOutStudent);

// Reports
router.get('/occupancy/:hostelId', getOccupancyReport);

module.exports = router;