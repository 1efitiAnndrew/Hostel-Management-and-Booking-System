const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    hostel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel',
        required: true
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    },
    roomNumber: String,
    roomType: {
        type: String,
        required: true,
        enum: ['single', 'double', 'triple', 'dormitory']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'confirmed', 'checked-in', 'checked-out', 'cancelled'],
        default: 'pending'
    },
    checkInDate: {
        type: Date,
        required: true
    },
    checkOutDate: {
        type: Date,
        required: true
    },
    duration: Number,
    amount: Number,
    paymentMethod: String,
    paymentProof: String,
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'partial', 'refunded'],
        default: 'pending'
    },
    
    // Manager approval fields
    approvedAt: Date,
    approvedBy: String,
    rejectedAt: Date,
    rejectedBy: String,
    rejectionReason: String,
    
    // Room assignment
    assignedAt: Date,
    
    // Check-in/check-out
    checkedInAt: Date,
    checkedOutAt: Date,
    
    // Cancellation
    cancelledAt: Date,
    cancellationReason: String,
    
    // Manager notes
    managerNotes: String
    
}, {
    timestamps: true
});

// Make sure this line is exactly like this:
module.exports = mongoose.model('Booking', bookingSchema);