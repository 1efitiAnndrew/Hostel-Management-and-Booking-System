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

// ✅ UPDATED: Helper function to find hostel by ID or name
const findHostel = async (hostelIdentifier) => {
    let foundHostel;
    
    // Check if hostelIdentifier is a valid MongoDB ObjectId (24 character hex string)
    if (mongoose.Types.ObjectId.isValid(hostelIdentifier)) {
        foundHostel = await Hostel.findById(hostelIdentifier);
    }
    
    // If not found by ID or hostelIdentifier is not an ObjectId, try finding by name
    if (!foundHostel) {
        foundHostel = await Hostel.findOne({ 
            name: { $regex: new RegExp(`^${hostelIdentifier}$`, 'i') } // Case-insensitive exact match
        });
    }

    return foundHostel;
};

const getAllStudents = async (req, res) => {
    let success = false;
    
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({success, errors: errors.array() });
        }

        const { hostel } = req.body;

        // ✅ UPDATED: Log both ID and name support
        console.log('Received hostel identifier:', hostel);

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

        // ✅ UPDATED: Find hostel by ID OR name
        const foundHostel = await findHostel(hostel);
        console.log('Found hostel:', foundHostel);

        if (!foundHostel) {
            return res.status(400).json({ 
                success, 
                // ✅ UPDATED: Better error message
                errors: [{ msg: 'Hostel not found with ID/name: ' + hostel }] 
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

// ✅ UPDATED: registerStudent function to support both ID and name
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

        // ✅ UPDATED: Better logging
        console.log('Registration attempt for hostel:', hostel);

        // Check if student exists by CMS ID
        let student = await Student.findOne({ cms_id });
        if (student) {
            return res.status(400).json({ 
                success, 
                // ✅ UPDATED: Better error message
                errors: [{ msg: 'Student already exists with this CMS ID' }] 
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

        // ✅ UPDATED: Find hostel by ID OR name (instead of just name)
        const foundHostel = await findHostel(hostel);
        console.log('Found hostel:', foundHostel);
        
        if (!foundHostel) {
            return res.status(400).json({ 
                success, 
                // ✅ UPDATED: Better error message
                errors: [{ msg: 'Hostel not found. Please check the hostel name or ID: ' + hostel }] 
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
        // ✅ UPDATED: Better response with hostel name
        res.json({ 
            success, 
            student: {
                id: student._id,
                name: student.name,
                cms_id: student.cms_id,
                email: student.email,
                room_no: student.room_no,
                hostel: foundHostel.name
            },
            message: `Student registered successfully in ${foundHostel.name}`
        });
        
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

// ✅ UPDATED: updateStudent function to support both ID and name
const updateStudent = async (req, res) => {
    let success = false;
    try {
        const student = await Student.findById(req.student.id).select('-password');

        const { name, cms_id, room_no, batch, dept, course, email, father_name, contact, address, dob, cnic, user, hostel } = req.body;

        // ✅ UPDATED: If hostel is provided, find it by ID or name
        if (hostel) {
            const foundHostel = await findHostel(hostel);
            if (!foundHostel) {
                return res.status(400).json({ 
                    success, 
                    errors: [{ msg: 'Hostel not found with ID/name: ' + hostel }] 
                });
            }
            student.hostel = foundHostel._id;
        }

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

// ✅ UPDATED: csvStudent function to support both ID and name
const csvStudent = async (req, res) => {
    let success = false;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({success, errors: errors.array() });
        }

        const { hostel } = req.body;

        // ✅ UPDATED: Find hostel by ID OR name
        const foundHostel = await findHostel(hostel);

        if (!foundHostel) {
            return res.status(400).json({ 
                success, 
                // ✅ UPDATED: Better error message
                errors: [{ msg: 'Hostel not found with ID/name: ' + hostel }] 
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

// ✅ NEW: Additional helper function to get hostel by ID or name (for other routes)
const getHostelByIdentifier = async (hostelIdentifier) => {
    return await findHostel(hostelIdentifier);
};

module.exports = {
    registerStudent,
    getStudent,
    updateStudent,
    deleteStudent,
    getAllStudents,
    csvStudent,
    getHostelByIdentifier
};