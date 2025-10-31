const mongoose = require('mongoose');
const { generateToken, verifyToken } = require('../utils/auth');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const Parser = require('json2csv').Parser;

// Import models directly to ensure they're registered
const Student = require('../models/Student');
const User = require('../models/User');

// IMPORTANT: Import Hostel model directly and register it if needed
let Hostel;
try {
    Hostel = require('../models/Hostel');
} catch (error) {
    console.error('Error importing Hostel model:', error);
    // If import fails, try to get it from mongoose models
    Hostel = mongoose.models.Hostel;
}

// If Hostel is still not available, register it manually
if (!Hostel && mongoose.models.Hostel) {
    Hostel = mongoose.models.Hostel;
}

console.log('Hostel model available:', !!Hostel);
console.log('Available mongoose models:', Object.keys(mongoose.models));

const getAllStudents = async (req, res) => {
    let success = false;
    
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({success, errors: errors.array() });
        }

        const { hostel } = req.body;

        console.log('Received hostel ID:', hostel);

        // Check if Hostel model is available
        if (!Hostel) {
            console.error('Hostel model not available');
            // Try to require it again
            try {
                Hostel = require('../models/Hostel');
            } catch (error) {
                return res.status(500).json({ 
                    success, 
                    errors: [{ msg: 'Hostel model not available: ' + error.message }] 
                });
            }
        }

        // Find the hostel by ID
        const foundHostel = await Hostel.findById(hostel);
        console.log('Found hostel:', foundHostel);

        if (!foundHostel) {
            return res.status(400).json({ 
                success, 
                errors: [{ msg: 'Hostel not found with ID: ' + hostel }] 
            });
        }

        // Find students for this hostel
        const students = await Student.find({ hostel: foundHostel._id })
            .select('-password')
            .populate('hostel', 'name location');

        console.log(`Found ${students.length} students for hostel ${foundHostel.name}`);

        success = true;
        res.json({ success, students });
    }
    catch (err) {
        console.error('Error in getAllStudents:', err.message);
        res.status(500).json({ 
            success, 
            errors: [{ msg: 'Server error: ' + err.message }] 
        });
    }
};

// Keep all other functions the same as before
const registerStudent = async (req, res) => {
    let success = false;
    
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() });
        }

        const { 
            name, cms_id, room_no, batch, dept, course, email, 
            father_name, contact, address, dob, cnic, hostel, password 
        } = req.body;

        // Check if student exists by CMS ID
        let student = await Student.findOne({ cms_id });
        if (student) {
            return res.status(400).json({ 
                success, 
                errors: [{ msg: 'Student already exists' }] 
            });
        }

        // Check if student exists by email
        student = await Student.findOne({ email });
        if (student) {
            return res.status(400).json({ 
                success, 
                errors: [{ msg: 'Email already exists' }] 
            });
        }

        // Find hostel by name
        const foundHostel = await Hostel.findOne({ name: hostel });
        if (!foundHostel) {
            return res.status(400).json({ 
                success, 
                errors: [{ msg: 'Hostel not found' }] 
            });
        }

        // Hash password and create user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            isAdmin: false,
            role: 'student'
        });

        await user.save();
        
        // Create student
        student = new Student({
            name,
            cms_id: parseInt(cms_id),
            room_no: parseInt(room_no),
            batch: parseInt(batch),
            dept,
            course,
            email,
            father_name,
            contact,
            address,
            dob: new Date(dob),
            cnic,
            user: user._id,
            hostel: foundHostel._id
        });

        await student.save();

        success = true;
        res.json({ success, student });
        
    } catch (err) {
        console.error('Registration error:', err.message);
        res.status(500).json({ success, errors: [{msg: 'Server error: ' + err.message}] });
    }
};

const getStudent = async (req, res) => {
    try {
        let success = false;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({success, errors: errors.array() });
        }

        const { isAdmin } = req.body;

        if (isAdmin) {
            return res.status(400).json({success, errors: [{msg: 'Admin cannot access this route'}] });
        }

        const { token } = req.body;
        
        const decoded = verifyToken(token);

        const student = await Student.findOne({user: decoded.userId}).select('-password');
        
        if (!student) {
            return res.status(400).json({success, errors: [{msg: 'Student does not exist'}] });
        }

        success = true;
        res.json({success, student });
    } catch (err) {
        console.error('Error in getStudent:', err);
        res.status(500).json({success, errors: [{msg: 'Server error: ' + err.message}]});
    }
};

const updateStudent = async (req, res) => {
    let success = false;
    try {
        const student = await Student.findById(req.student.id).select('-password');

        const { name, cms_id, room_no, batch, dept, course, email, father_name, contact, address, dob, cnic, user, hostel } = req.body;

        student.name = name;
        student.cms_id = cms_id;
        student.room_no = room_no;
        student.batch = batch;
        student.dept = dept;
        student.course = course;
        student.email = email;
        student.father_name = father_name;
        student.contact = contact;
        student.address = address;
        student.dob = dob;
        student.cnic = cnic;
        student.hostel = hostel;

        await student.save();

        success = true;
        res.json({success, student});
    } catch (err) {
        console.error('Error in updateStudent:', err);
        res.status(500).json({success, errors: [{msg: 'Server error: ' + err.message}]});
    }
};

const deleteStudent = async (req, res) => {
    try {
        let success = false;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({success, errors: errors.array() });
        }

        const { id } = req.body;

        const student = await Student.findById(id).select('-password');

        if (!student) {
            return res.status(400).json({success, errors: [{ msg: 'Student does not exist' }] });
        }

        const user = await User.findByIdAndDelete(student.user);

        await Student.deleteOne(student);

        success = true;
        res.json({success, msg: 'Student deleted successfully' });
    } catch (err) {
        console.error('Error in deleteStudent:', err);
        res.status(500).json({success, errors: [{msg: 'Server error: ' + err.message}]});
    }
};

const csvStudent = async (req, res) => {
    let success = false;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({success, errors: errors.array() });
        }

        const { hostel } = req.body;

        // Find hostel by ID
        const foundHostel = await Hostel.findById(hostel);

        if (!foundHostel) {
            return res.status(400).json({ 
                success, 
                errors: [{ msg: 'Hostel not found' }] 
            });
        }

        const students = await Student.find({ hostel: foundHostel._id }).select('-password');

        students.forEach(student => {
            student.hostel_name = foundHostel.name;
            student.d_o_b = new Date(student.dob).toDateString().slice(4);
            student.cnic_no = student.cnic.slice(0, 5) + '-' + student.cnic.slice(5, 12) + '-' + student.cnic.slice(12);
            student.contact_no = "+92 "+student.contact.slice(1);
        });

        const fields = ['name', 'cms_id', 'room_no', 'batch', 'dept', 'course', 'email', 'father_name', 'contact_no', 'address', 'd_o_b', 'cnic_no', 'hostel_name'];

        const opts = { fields };

        const parser = new Parser(opts);

        const csv = parser.parse(students);

        success = true;
        res.json({success, csv});
    } catch (err) {
        console.error('Error in csvStudent:', err);
        res.status(500).json({success, errors: [{msg: 'Server error: ' + err.message}]});
    }
};

module.exports = {
    registerStudent,
    getStudent,
    updateStudent,
    deleteStudent,
    getAllStudents,
    csvStudent
};