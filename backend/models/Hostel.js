const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HostelSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    rooms: {
        type: Number,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    vacant: {
        type: Number,
        required: true
    },
    roomTypes: [{
        type: {
            type: String,
            enum: ['single', 'double', 'triple']
        },
        price: {
            type: Number
        },
        available: {
            type: Number,
            default: 0
        }
    }],
    // Optional: Add price per semester for booking calculations
    pricePerSemester: {
        type: Number,
        default: 0
    },
description: {
            type: String
        },

        amenities: [String],
    images: [String],
    contact: {
        phone: String,
        email: String
    }
    },
    
    
 { timestamps: true
    
});

// FIXED: Only add this method if roomTypes exists, or remove it
HostelSchema.methods.checkAvailability = function(roomType) {
    if (!this.roomTypes || this.roomTypes.length === 0) {
        return this.vacant > 0; // Fallback to general vacancy check
    }
    const room = this.roomTypes.find(r => r.type === roomType);
    return room ? room.available > 0 : false;
};

// Make sure the model name matches what you reference in other files
module.exports = mongoose.model('Hostel', HostelSchema);