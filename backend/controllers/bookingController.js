import Booking from '../models/Booking.js';
import Hostel from '../models/Hostel.js';

export const createBooking = async (req, res) => {
    try {
        const {
            student, hostel, roomType, checkInDate, checkOutDate, 
            duration, amount, paymentMethod, paymentProof
        } = req.body;

        const hostelDoc = await Hostel.findById(hostel);
        
        if (!hostelDoc) {
            return res.status(404).json({
                success: false,
                message: 'Hostel not found'
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

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getStudentBookings = async (req, res) => {
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

export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('hostel', 'name location')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('hostel', 'name location facilities');

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

export const updateBooking = async (req, res) => {
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

export const cancelBooking = async (req, res) => {
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

export const deleteBooking = async (req, res) => {
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