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

        // FIX: Pass all 3 required parameters to the email template
        await sendEmail(
            studentDoc.email,
            'bookingSubmitted',
            [studentDoc.name, booking._id, hostelDoc.name] // Added hostelDoc.name as 3rd parameter
        );

        // Send notification to manager if email is configured
        const pendingCount = await Booking.countDocuments({ status: 'pending' });
        if (process.env.MANAGER_EMAIL) {
            await sendEmail(
                process.env.MANAGER_EMAIL,
                'managerNotification',
                [pendingCount, hostelDoc.name] // Added hostelDoc.name as 2nd parameter
            );
        }

        res.status(201).json({
            success: true,
            message: 'Booking created successfully and pending approval',
            booking
        });

    } catch (error) {
        console.error('Booking creation error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get student's own bookings
const getStudentBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ student: req.user.id })
            .populate('hostel', 'name location')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all bookings (for managers) with filters
const getAllBookings = async (req, res) => {
    try {
        const { status, hostelId, roomType, page = 1, limit = 10 } = req.query;

        let filter = {};
        if (status) filter.status = status;
        if (hostelId) filter.hostel = hostelId;
        if (roomType) filter.roomType = roomType;

        const bookings = await Booking.find(filter)
            .populate('student', 'name email phone course year')
            .populate('hostel', 'name location')
            .populate('room', 'roomNumber floor')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Booking.countDocuments(filter);

        res.json({
            success: true,
            bookings,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get pending bookings for manager approval
const getPendingBookings = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const bookings = await Booking.find({ status: 'pending' })
            .populate('student', 'name email phone course year gender')
            .populate('hostel', 'name location')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Booking.countDocuments({ status: 'pending' });

        res.json({
            success: true,
            bookings,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Manager approves booking
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

        // FIX: Pass all 4 required parameters to the email template
        await sendEmail(
            booking.student.email,
            'bookingApproved',
            [booking.student.name, booking._id, null, booking.hostel.name] // Added hostel.name as 4th parameter
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

// Manager rejects booking
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

        // FIX: Pass all 4 required parameters to the email template
        await sendEmail(
            booking.student.email,
            'bookingRejected',
            [booking.student.name, booking._id, rejectionReason || 'Not specified', booking.hostel.name] // Added hostel.name as 4th parameter
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

// Bulk approve/reject bookings
const bulkUpdateBookings = async (req, res) => {
    try {
        const { bookingIds, action, rejectionReason } = req.body;

        if (!bookingIds || !Array.isArray(bookingIds)) {
            return res.status(400).json({
                success: false,
                message: 'Booking IDs array is required'
            });
        }

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Action must be either "approve" or "reject"'
            });
        }

        const updateData = {
            status: action === 'approve' ? 'approved' : 'rejected',
            [action === 'approve' ? 'approvedAt' : 'rejectedAt']: new Date(),
            [action === 'approve' ? 'approvedBy' : 'rejectedBy']: req.user?.id || 'manager'
        };

        if (action === 'reject') {
            updateData.rejectionReason = rejectionReason || 'Not specified';
        }

        const result = await Booking.updateMany(
            { 
                _id: { $in: bookingIds },
                status: 'pending' // Only update pending bookings
            },
            updateData
        );

        // Send emails for bulk actions
        if (result.modifiedCount > 0) {
            const bookings = await Booking.find({ _id: { $in: bookingIds } })
                .populate('student', 'name email')
                .populate('hostel', 'name');
            
            for (const booking of bookings) {
                if (action === 'approve') {
                    await sendEmail(
                        booking.student.email,
                        'bookingApproved',
                        [booking.student.name, booking._id, null, booking.hostel.name] // Added hostel.name
                    );
                } else {
                    await sendEmail(
                        booking.student.email,
                        'bookingRejected',
                        [booking.student.name, booking._id, rejectionReason || 'Not specified', booking.hostel.name] // Added hostel.name
                    );
                }
            }
        }

        res.json({
            success: true,
            message: `${result.modifiedCount} bookings ${action}ed successfully`,
            modifiedCount: result.modifiedCount
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get booking statistics for manager dashboard
const getBookingStats = async (req, res) => {
    try {
        const { hostelId } = req.query;

        let matchStage = {};
        if (hostelId) {
            matchStage.hostel = hostelId;
        }

        const stats = await Booking.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalBookings = await Booking.countDocuments(matchStage);
        const pendingBookings = await Booking.countDocuments({ ...matchStage, status: 'pending' });
        const approvedBookings = await Booking.countDocuments({ ...matchStage, status: 'approved' });
        const confirmedBookings = await Booking.countDocuments({ ...matchStage, status: 'confirmed' });
        const checkedInBookings = await Booking.countDocuments({ ...matchStage, status: 'checked-in' });

        // Recent pending bookings (last 7 days)
        const recentPending = await Booking.find({
            ...matchStage,
            status: 'pending',
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        })
        .populate('student', 'name')
        .populate('hostel', 'name')
        .sort({ createdAt: -1 })
        .limit(5);

        const statusCounts = stats.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});

        res.json({
            success: true,
            stats: {
                total: totalBookings,
                pending: pendingBookings,
                approved: approvedBookings,
                confirmed: confirmedBookings,
                checkedIn: checkedInBookings,
                rejected: statusCounts.rejected || 0,
                checkedOut: statusCounts['checked-out'] || 0,
                cancelled: statusCounts.cancelled || 0
            },
            recentPending,
            approvalRate: totalBookings > 0 ? 
                ((approvedBookings + confirmedBookings + checkedInBookings) / totalBookings * 100).toFixed(2) : 0
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get booking by ID
const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('student', 'name email phone course year gender emergencyContact')
            .populate('hostel', 'name location amenities')
            .populate('room', 'roomNumber floor price amenities');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update booking
const updateBooking = async (req, res) => {
    try {
        const { status, paymentStatus, managerNotes } = req.body;

        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (status) booking.status = status;
        if (paymentStatus) booking.paymentStatus = paymentStatus;
        if (managerNotes) booking.managerNotes = managerNotes;

        await booking.save();
        await booking.populate('hostel', 'name location');
        await booking.populate('student', 'name email');

        res.json({
            success: true,
            message: 'Booking updated successfully',
            booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Cancel booking
const cancelBooking = async (req, res) => {
    try {
        const { cancellationReason } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        booking.status = 'cancelled';
        booking.cancellationReason = cancellationReason;
        booking.cancelledAt = new Date();
        await booking.save();

        res.json({
            success: true,
            message: 'Booking cancelled successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete booking
const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        await Booking.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Booking deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createBooking,
    getStudentBookings,
    getAllBookings,
    getPendingBookings,
    approveBooking,
    rejectBooking,
    bulkUpdateBookings,
    getBookingStats,
    getBookingById,
    updateBooking,
    cancelBooking,
    deleteBooking
};