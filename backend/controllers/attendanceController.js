const { validationResult } = require('express-validator');
const { Student, Attendance } = require('../models');

const markAttendance = async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({success, errors: errors.array() });
    }
    const { student, status } = req.body;
    const date = new Date();
    const alreadyattendance = await Attendance.findOne({ student, date: { $gte: date.setHours(0, 0, 0, 0), $lt: date.setHours(23, 59, 59, 999) } });
    if (alreadyattendance) {
        return res.status(409).json({ success, error: 'Attendance already marked' });
    }
    
    try {
        const attendance = new Attendance(
            {
                student,
                status
            }
        );
        const result = await attendance.save();
        success = true;
        res.status(201).json({success, result}); // FIXED: Added object wrapper
    } catch (err) {
        res.status(500).json({ success, error: err.message });
    }
}

const getAttendance = async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ success, errors: errors.array() });
    }
    const { student } = req.body;
    try {
        const attendance = await Attendance.find({ student });
        success = true;
        res.status(200).json({ success, attendance });
    }
    catch (err) {
        res.status(500).json({ success, error: err.message });
    }
}

const updateAttendance = async (req, res) => {
    let success = false; // ADDED success variable
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ success, errors: errors.array() }); // ADDED success
    }
    const { student, status } = req.body;
    try {
        const attendance = await Attendance.findOneAndUpdate({ 
            student, 
            date: { 
                $gte: new Date().setHours(0, 0, 0, 0), 
                $lt: new Date().setHours(23, 59, 59, 999) 
            } 
        }, { status });
        success = true;
        res.status(200).json({ success, attendance }); // ADDED object wrapper
    }
    catch (err) {
        res.status(500).json({ success, error: err.message });
    }
}

const getHostelAttendance = async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ success, errors: errors.array() });
    }
    const { hostel } = req.body;
    try {
        const date = new Date();
        const students = await Student.find({ hostel });
        const attendance = await Attendance.find({ student: { $in: students }, date: { $gte: date.setHours(0, 0, 0, 0), $lt: date.setHours(23, 59, 59, 999) } }).populate('student', ['_id','name', 'room_no', 'cms_id']);
        success = true;
        res.status(200).json({ success, attendance });
    }
    catch (err) {
        res.status(500).json({ success, error: err.message });
    }
}

// @route   GET api/attendance/get/:studentId
// @desc    Get attendance for student (GET version)
// @access  Public
const getStudentAttendance = async (req, res) => {
    try {
        const { studentId } = req.params;
        const attendance = await Attendance.find({ student: studentId });
        res.json({ success: true, attendance });
    } catch (error) {
        console.error('Error in getStudentAttendance:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching student attendance',
            error: error.message 
        });
    }
};

module.exports = {
    markAttendance,
    getAttendance,
    updateAttendance,
    getHostelAttendance,
    getStudentAttendance
};