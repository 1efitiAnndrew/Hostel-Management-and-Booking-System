const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { 
    registerSuggestion, 
    getbyhostel, 
    getbystudent, 
    updateSuggestion,
    getSuggestionStats,
    deleteSuggestion,
    healthCheck
} = require('../controllers/suggestionController');

// Health check
router.get('/health', healthCheck);

// Statistics
router.post('/stats', [
    check('hostel', 'Hostel is required').not().isEmpty()
], getSuggestionStats);

// Register suggestion
router.post('/register', [
    check('student', 'Student is required').not().isEmpty(),
    check('hostel', 'Hostel is required').not().isEmpty(),
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty()
], registerSuggestion);

// Get by hostel with optional query parameters
router.post('/hostel', [
    check('hostel', 'Hostel is required').not().isEmpty()
], getbyhostel);

// Get by student
router.post('/student', [
    check('student', 'Student is required').not().isEmpty()
], getbystudent);

// Update suggestion
router.post('/update', [
    check('id', 'Id is required').not().isEmpty(),
    check('status', 'Status is required').not().isEmpty()
], updateSuggestion);

// Delete suggestion
router.delete('/delete', [
    check('id', 'Id is required').not().isEmpty()
], deleteSuggestion);

module.exports = router;