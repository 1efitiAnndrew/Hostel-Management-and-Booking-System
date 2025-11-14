const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { 
    registerStudent, 
    getStudent, 
    getAllStudents, 
    updateStudent, 
    deleteStudent, 
    csvStudent,
    submitBookingExtension,
    getStudentBookings,
    getAvailableRooms,
    getRoomUtilization
} = require('../controllers/studentController');

// @route  POST api/student/register-student
// @desc   Register student
// @access Public
router.post('/register-student', [
    check('name', 'Name is required').not().isEmpty(),
    check('cms_id', 'CMS ID of at least 6 digit is required').isLength(6),
    check('room_no', 'Room number is required').isLength(1),
    check('batch', 'Batch is required').not().isEmpty(),
    check('dept', 'Department is required').not().isEmpty(),
    check('course', 'Course is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('father_name', 'Father name is required').not().isEmpty(),
    check('contact', 'Enter a valid contact number').isLength(11),
    check('address', 'Address is required').not().isEmpty(),
    check('dob', 'Date of birth is required').not().isEmpty(),
    check('cnic', 'Enter valid CNIC').isLength(13),
    check('hostel', 'Hostel is required').not().isEmpty(),
    check('password', 'Please enter a password with 8 or more characters').isLength({ min: 8 }),
], registerStudent);

// @route  POST api/student/get-student
// @desc   Get student by CMS ID
// @access Public
router.post('/get-student', [
    check('isAdmin', 'isAdmin is required').notEmpty(),
    check('token', 'You donot have a valid token').notEmpty()
], getStudent);

// @route  POST api/student/get-all-students
// @access Public
router.post('/get-all-students',[
    check('hostel', 'Hostel is required').not().isEmpty()
],
 getAllStudents);

// @route  POST api/student/update-student
// @desc   Update student
// @access Public
router.post('/update-student', [
    check('cms_id', 'CMS ID is required').not().isEmpty(),
    check('room_no', 'Room number is required').not().isEmpty(),
    check('batch', 'Batch is required').not().isEmpty(),
    check('dept', 'Department is required').not().isEmpty(),
    check('course', 'Course is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('father_name', 'Father name is required').not().isEmpty(),
    check('contact', 'Contact is required').not().isEmpty(),
    check('address', 'Address is required').not().isEmpty(),
    check('dob', 'Date of birth is required').not().isEmpty(),
    check('cnic', 'CNIC is required').not().isEmpty(),
    check('user', 'User is required').not().isEmpty(),
    check('hostel', 'Hostel is required').not().isEmpty()
], updateStudent);

// @route  POST api/student/delete-student
// @desc   Delete student
// @access Public
router.delete('/delete-student', [
    check('id', 'Enter a valid ID').not().isEmpty(),
], deleteStudent);

// @route  POST api/student/csv
// @desc   Get CSV of students
// @access Public
router.post('/csv', [
    check('hostel', 'Hostel is required').not().isEmpty()
], csvStudent);

// ✅ UPDATED BOOKING ROUTES WITH ROOM INTEGRATION

// @route  POST api/student/bookings
// @desc   Submit booking extension
// @access Public
router.post('/bookings', [
    check('student', 'Student ID is required').not().isEmpty(),
    check('hostel', 'Hostel is required').not().isEmpty(),
    check('roomType', 'Room type is required').not().isEmpty(),
    check('roomNumber', 'Room number is required').not().isEmpty(),
    check('checkInDate', 'Check-in date is required').not().isEmpty(),
    check('checkOutDate', 'Check-out date is required').not().isEmpty(),
    check('duration', 'Duration is required').isInt({ min: 1 }),
    check('amount', 'Amount is required').isFloat({ min: 0 }),
    check('paymentMethod', 'Payment method is required').not().isEmpty(),
    check('paymentProof', 'Payment proof is required').not().isEmpty()
], submitBookingExtension);

// @route  GET api/student/bookings/:studentId
// @desc   Get student's bookings
// @access Public
router.get('/bookings/:studentId', [
    check('studentId', 'Valid student ID is required').isMongoId()
], getStudentBookings);

// @route  POST api/student/available-rooms
// @desc   Get available rooms for booking
// @access Public
router.post('/available-rooms', [
    check('hostelId', 'Hostel ID is required').not().isEmpty(),
    check('roomType', 'Room type is required').not().isEmpty(),
    check('checkInDate', 'Check-in date is required').not().isEmpty(),
    check('checkOutDate', 'Check-out date is required').not().isEmpty()
], getAvailableRooms);

// @route  GET api/student/room-utilization/:hostelId
// @desc   Get room utilization statistics
// @access Public
router.get('/room-utilization/:hostelId', [
    check('hostelId', 'Hostel ID is required').isMongoId()
], getRoomUtilization);

module.exports = router;