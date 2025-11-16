const express = require('express')
const router = express.Router()
const { check } = require('express-validator')
const { 
    generateInvoices, 
    getInvoicesbyid, 
    getInvoices, 
    updateInvoice, 
    getStudentInvoices 
} = require('../controllers/invoiceController')

// @route   POST api/invoice/generate
// @desc    Generate invoice
// @access  Public
router.post('/generate', [
    check('hostel', 'Hostel is required').not().isEmpty(),
], generateInvoices);

// @route   POST api/invoice/getbyid
// @desc    Get all invoices by hostel
// @access  Public
router.post('/getbyid', [
    check('hostel', 'Hostel is required').not().isEmpty()
], getInvoicesbyid);

// @route   POST api/invoice/student
// @desc    Get all invoices for student (POST version)
// @access  Public
router.post('/student', [
    check('student', 'Student is required').not().isEmpty()
], getInvoices);

// @route   GET api/invoice/student/:studentId
// @desc    Get all invoices for student (GET version for frontend)
// @access  Public
router.get('/student/:studentId', getStudentInvoices); // NEW: GET endpoint for frontend

// @route   POST api/invoice/update
// @desc    Update invoice
// @access  Public
router.post('/update', [
    check('student', 'Student is required').not().isEmpty(),
    check('status', 'Status is required').not().isEmpty()
], updateInvoice);

module.exports = router;