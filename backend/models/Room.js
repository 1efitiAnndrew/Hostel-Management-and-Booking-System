const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
        trim: true
    },
    floor: {
        type: Number,
        required: true
    },
    roomType: {
        type: String,
        required: true,
        enum: ['single', 'double', 'triple']
    },
    price: {
        type: Number,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    currentOccupancy: {
        type: Number,
        default: 0
    },
    amenities: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['available', 'occupied', 'reserved', 'maintenance'],
        default: 'available'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    hostel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel',
        required: true
    }
}, {
    timestamps: true
});

// Make sure this line is exactly like this:
const Room = mongoose.model('Room', roomSchema);
module.exports = Room;