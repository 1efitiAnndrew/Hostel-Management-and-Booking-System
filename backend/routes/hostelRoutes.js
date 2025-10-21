const express = require('express');
const {
    getHostels,
    getHostel,
    checkAvailability,
    createHostel,
    updateHostel,
    deleteHostel,
    searchRooms
} = require('../controllers/hostelController');

const router = express.Router();

// Public routes
router.get('/', getHostels);
router.get('/:id', getHostel);
router.post('/:id/availability', checkAvailability);

// Protected routes (add middleware later)
router.post('/', createHostel);
router.put('/:id', updateHostel);
router.delete('/:id', deleteHostel);
// Add this route
router.get('/search/rooms', searchRooms);

module.exports = router;