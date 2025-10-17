const mongoose = require('mongoose');
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hostel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel',
        required: true
    },
    roomType: {
        type: String,
        enum: ['single', 'double', 'triple'],
        required: true
    },
    checkInDate: {
        type: Date,
        required: true
    },
    checkOutDate: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // in days
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['mobile_money','cash'],
        required: true
    },
    paymentProof: {
        type: String
    },
    managerNotes: {
        type: String
    },
    cancellationReason: {
        type: String
    },
    cancelledAt: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

bookingSchema.index({ student: 1, createdAt: -1 });
bookingSchema.index({ hostel: 1, status: 1 });
bookingSchema.index({ checkInDate: 1, checkOutDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);


