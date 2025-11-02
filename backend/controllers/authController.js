const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { generateToken, verifyToken } = require('../utils/auth');
const User = require('../models/User');

exports.register = async (req, res, next) => {
    let success = false;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() });
        }

        const { email, password, name, role, cms_id, hostel } = req.body;

        try {
            // Check if user already exists
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ 
                    success, 
                    errors: [{ msg: 'User already exists with this email' }] 
                });
            }

            // Check if CMS ID already exists
            user = await User.findOne({ cms_id });
            if (user) {
                return res.status(400).json({ 
                    success, 
                    errors: [{ msg: 'User already exists with this CMS ID' }] 
                });
            }

            // Create new user
            user = new User({
                name,
                email,
                password,
                role: role || 'student',
                cms_id,
                hostel
            });

            // Hash password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            // Save user
            await user.save();

            // Generate token
            const token = generateToken(user.id, user.isAdmin);

            success = true;
            res.status(201).json({
                success,
                data: {
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        cms_id: user.cms_id,
                        hostel: user.hostel,
                        isAdmin: user.isAdmin,
                    },
                },
            });

        } catch (err) {
            console.error(err.message);
            res.status(500).json({ success, errors: [{ msg: 'Server error' }] });
        }
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    let success = false;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({success, errors: errors.array() });
        }
        
        const { email, password } = req.body;

        try {
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({success, errors: [{ msg: 'Invalid credentials' }] });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({success, errors: [{ msg: 'Invalid credentials' }] });
            }
            const token = generateToken(user.id, user.isAdmin);
            res.status(200).json({
                success: true,
                data: {
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        isAdmin: user.isAdmin,
                    },
                },
            });

        }
        catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    } catch (error) {
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    let success = false;
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({success, errors: errors.array() });
        }

        const { email, password, newPassword } = req.body;

        try {
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({success, errors: [{ msg: 'Invalid credentials' }] });
            }

            const oldPassword = await bcrypt.compare(password, user.password);

            if (!oldPassword) {
                return res.status(400).json({success, errors: [{ msg: 'Invalid credentials' }] });
            }

            const salt = await bcrypt.genSalt(10);
            const newp = await bcrypt.hash(newPassword, salt);

            user.password = newp;
            await user.save();

            success = true;
            res.status(200).json({ success, msg: 'Password changed successfully' });

        }
        catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    } catch (error) {
        next(error);
    }
}

exports.verifySession = async (req, res, next) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array(), success});
    }
    try {
        const { token } = req.body;
        const decoded = verifyToken(token);
        if (decoded) {
            success = true;
            return res.status(200).json({success, data: decoded});
        }
        return res.status(400).json({success, "message": "Invalid token"});
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({success, "message": "Server Error"});
    }
}

exports.login = async (req, res, next) => {
    let success = false;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({success, errors: errors.array() });
        }
        
        const { email, password } = req.body;

        try {
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({success, errors: [{ msg: 'Invalid credentials' }] });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({success, errors: [{ msg: 'Invalid credentials' }] });
            }
            const token = generateToken(user.id, user.isAdmin);
            res.status(200).json({
                success: true,
                data: {
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        isAdmin: user.isAdmin,
                    },
                },
            });

        }
        catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    } catch (error) {
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    let success = false;
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({success, errors: errors.array() });
        }

        const { email, password, newPassword } = req.body;

        try {
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({success, errors: [{ msg: 'Invalid credentials' }] });
            }

            const oldPassword = await bcrypt.compare(password, user.password);

            if (!oldPassword) {
                return res.status(400).json({success, errors: [{ msg: 'Invalid credentials' }] });
            }

            const salt = await bcrypt.genSalt(10);
            const newp = await bcrypt.hash(newPassword, salt);

            user.password = newp;
            await user.save();

            success = true;
            res.status(200).json({ success, msg: 'Password changed successfully' });

        }
        catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    } catch (error) {
        next(error);
    }
}

exports.verifySession = async (req, res, next) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array(), success});
    }
    try {
        const { token } = req.body;
        const decoded = verifyToken(token);
        if (decoded) {
            success = true;
            return res.status(200).json({success, data: decoded});
        }
        return res.status(400).json({success, "message": "Invalid token"});
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({success, "message": "Server Error"});
    }
}
