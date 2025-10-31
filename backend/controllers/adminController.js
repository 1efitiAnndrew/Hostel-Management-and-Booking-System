const {generateToken, verifyToken} = require('../utils/auth');
const {validationResult} = require('express-validator');
const {Admin, User, Hostel} = require('../models');
const bcrypt = require('bcryptjs');

// ✅ ADDED: Login Admin function
const loginAdmin = async (req, res) => {
    try {
        let success = false;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({success, errors: errors.array()});
        }

        const {email, password} = req.body;

        console.log("🔐 [BACKEND] Admin login attempt for:", email);

        try {
            // Find admin by email and populate user data
            let admin = await Admin.findOne({email}).populate('user');
            
            if (!admin) {
                console.log("❌ [BACKEND] Admin not found:", email);
                return res.status(400).json({success, errors: [{msg: 'Invalid credentials'}]});
            }

            console.log("✅ [BACKEND] Admin found:", admin.name);

            // Find the associated user
            let user = await User.findById(admin.user);
            if (!user) {
                console.log("❌ [BACKEND] User not found for admin:", admin._id);
                return res.status(400).json({success, errors: [{msg: 'Invalid credentials'}]});
            }

            // Compare passwords
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                console.log("❌ [BACKEND] Invalid password for admin:", email);
                return res.status(400).json({success, errors: [{msg: 'Invalid credentials'}]});
            }

            // Generate token
            const token = generateToken(user.id, user.isAdmin);
            console.log("✅ [BACKEND] Admin login successful:", admin.name);

            // Prepare admin data for response (without sensitive info)
            const adminData = {
                id: admin._id,
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                father_name: admin.father_name,
                contact: admin.contact,
                address: admin.address,
                dob: admin.dob,
                cnic: admin.cnic,
                hostel: admin.hostel,
                user: admin.user
            };

            success = true;
            res.json({
                success, 
                message: 'Admin login successful',
                admin: adminData,
                token: token
            });

        } catch (error) {
            console.error('💥 [BACKEND] Login process error:', error);
            res.status(500).json({success, errors: [{msg: 'Server error during login'}]});
        }
    } catch (err) {
        console.error('💥 [BACKEND] Login controller error:', err);
        res.status(500).json({success: false, errors: [{msg: 'Server error'}]});
    }
}

const registerAdmin = async (req, res) => {
    try {
        let success = false;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({success, errors: errors.array()});
        }

        const {name, email, father_name, contact, address, dob, cnic, hostel, password} = req.body;

        try {
            let admin = await Admin.findOne({email});

            if (admin) {
                return res.status(400).json({success, errors: [{msg: 'Admin already exists'}]});
            }

            let shostel = await Hostel.findOne({name: hostel});

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            let user = new User({
                email,
                password: hashedPassword,
                isAdmin: true
            });

            await user.save();

            admin = new Admin({
                name,
                email,
                father_name,
                contact,
                address,
                dob,
                cnic,
                user: user.id,
                hostel: shostel.id
            });

            await admin.save();

            const token = generateToken(user.id, user.isAdmin);

            success = true;
            res.json({success, token, admin});

        } catch (error) {
            res.status(500).send('Server error');
        }
    } catch (err) {
        res.status(500).json({success, errors: [{msg: 'Server error'}]});
    }
}

const updateAdmin = async (req, res) => {
    try {
        let success = false;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({success, errors: errors.array()});
        }

        const {name, email, father_name, contact, address, dob, cnic} = req.body;

        try {
            let admin = await Admin.findOne({email});

            if (!admin) {
                return res.status(400).json({success, errors: [{msg: 'Admin does not exists'}]});
            }

            admin.name = name;
            admin.email = email;
            admin.father_name = father_name;
            admin.contact = contact;
            admin.address = address;
            admin.dob = dob;
            admin.cnic = cnic;

            await admin.save();

            success = true;
            res.json({success, admin});

        } catch (error) {
            res.status(500).send('Server error');
        }
    } catch (err) {
        res.status(500).json({success, errors: [{msg: 'Server error'}]});
    }
}

const getHostel = async (req, res) => {
    try {
        let success = false;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({success, errors: errors.array()});
        }

        const {id} = req.body

        let admin = await Admin.findById(id);
        
        if (!admin) {
            return res.status(400).json({success, errors: [{msg: 'Admin does not exists'}]});
        }

        let hostel = await Hostel.findById(admin.hostel);
        success = true;
        res.json({success, hostel});
    } catch (error) {
        res.status(500).send('Server error');
    }
}

const getAdmin = async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({success, errors: errors.array()});
    }
    try {
        const {isAdmin} = req.body;
        if (!isAdmin) {
            return res.status(401).json({success, errors: [{msg: 'Not an Admin, authorization denied'}]});
        }
        const {token} = req.body;
        if (!token) {
            return res.status(401).json({success, errors: [{msg: 'No token, authorization denied'}]});
        }

        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({success, errors: [{msg: 'Token is not valid'}]});
        }
        
        let admin = await Admin.findOne({user:decoded.userId}).select('-password');
        
        if (!admin) {
            return res.status(401).json({success, errors: [{msg: 'Token is not valid'}]});
        }

        success = true;
        res.json({success, admin});
    } catch (error) {
        res.status(500).send('Server error');
    }
}

const deleteAdmin = async (req, res) => {
    try {
        let success = false;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({success, errors: errors.array()});
        }

        const {email} = req.body

        let admin = await Admin.findOne({email});

        if (!admin) {
            return res.status(400).json({success, errors: [{msg: 'Admin does not exists'}]});
        }

        const user = await User.findById(admin.user);

        await User.deleteOne(user);

        await Admin.deleteOne(admin);

        success = true;
        res.json({success, msg: 'Admin deleted'});
    } catch (error) {
        res.status(500).send('Server error');
    }
}

// ✅ ADDED: loginAdmin to exports
module.exports = {
    loginAdmin,
    registerAdmin,
    updateAdmin,
    getAdmin,
    getHostel,
    deleteAdmin
}