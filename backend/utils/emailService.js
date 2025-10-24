const Booking = require('../models/Booking');
const Hostel = require('../models/Hostel');
const Student = require('../models/Student');
const Room = require('../models/Room');
const { sendEmail } = require('../utils/emailService');

// Student creates a booking
const createBooking = async (req, res) => {
    try {
        const {
            student, hostel, roomType, checkInDate, checkOutDate, 
            duration, amount, paymentMethod, paymentProof
        } = req.body;

        const hostelDoc = await Hostel.findById(hostel);
        const studentDoc = await Student.findById(student);
        
        if (!hostelDoc || !studentDoc) {
            return res.status(404).json({
                success: false,
                message: 'Hostel or Student not found'
            });
        }

        const booking = new Booking({
            student: student,
            hostel: hostel,
            roomType: roomType,
            checkInDate: new Date(checkInDate),
            checkOutDate: new Date(checkOutDate),
            duration: duration,
            amount: amount,
            paymentMethod: paymentMethod,
            paymentProof: paymentProof || '',
            status: 'pending',
            paymentStatus: 'pending'
        });

        await booking.save();
        await booking.populate('hostel', 'name location');
        await booking.populate('student', 'name email phone');

        // Send email notification to student with hostel name
        await sendEmail(
            studentDoc.email,
            'bookingSubmitted',
            [studentDoc.name, booking._id, hostelDoc.name]
        );

        // Send notification to manager with hostel name
        const pendingCount = await Booking.countDocuments({ 
            status: 'pending',
            hostel: hostel 
        });
        if (process.env.MANAGER_EMAIL) {
            await sendEmail(
                process.env.MANAGER_EMAIL,
                'managerNotification',
                [pendingCount, hostelDoc.name]
            );
        }

        res.status(201).json({
            success: true,
            message: 'Booking created successfully and pending approval',
            booking
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update approveBooking function
const approveBooking = async (req, res) => {
    try {
        const { bookingId } = req.body;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: 'Booking ID is required'
            });
        }

        const booking = await Booking.findById(bookingId)
            .populate('student')
            .populate('hostel');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Booking is already ${booking.status}`
            });
        }

        // Check room availability before approval
        const availableRooms = await Room.countDocuments({
            hostel: booking.hostel._id,
            roomType: booking.roomType,
            status: 'available',
            isActive: true
        });

        if (availableRooms === 0) {
            return res.status(400).json({
                success: false,
                message: 'No available rooms. Cannot approve booking.'
            });
        }

        // Update booking status
        booking.status = 'approved';
        booking.approvedAt = new Date();
        booking.approvedBy = req.user?.id || 'manager';
        await booking.save();

        await booking.populate('student', 'name email');
        await booking.populate('hostel', 'name');

        // Send approval email to student with hostel name
        await sendEmail(
            booking.student.email,
            'bookingApproved',
            [booking.student.name, booking._id, null, booking.hostel.name]
        );

        res.json({
            success: true,
            message: 'Booking approved successfully. Room can now be assigned.',
            booking: {
                _id: booking._id,
                status: booking.status,
                approvedAt: booking.approvedAt,
                student: booking.student.name,
                hostel: booking.hostel.name,
                roomType: booking.roomType
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update rejectBooking function
const rejectBooking = async (req, res) => {
    try {
        const { bookingId, rejectionReason } = req.body;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: 'Booking ID is required'
            });
        }

        const booking = await Booking.findById(bookingId)
            .populate('student', 'name email')
            .populate('hostel', 'name');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot reject booking that is ${booking.status}`
            });
        }

        // Update booking status
        booking.status = 'rejected';
        booking.rejectedAt = new Date();
        booking.rejectionReason = rejectionReason || 'Not specified';
        booking.rejectedBy = req.user?.id || 'manager';
        await booking.save();

        // Send rejection email to student with hostel name
        await sendEmail(
            booking.student.email,
            'bookingRejected',
            [booking.student.name, booking._id, rejectionReason || 'Not specified', booking.hostel.name]
        );

        res.json({
            success: true,
            message: 'Booking rejected successfully',
            booking: {
                _id: booking._id,
                status: booking.status,
                rejectedAt: booking.rejectedAt,
                rejectionReason: booking.rejectionReason,
                student: booking.student.name,
                hostel: booking.hostel.name
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};