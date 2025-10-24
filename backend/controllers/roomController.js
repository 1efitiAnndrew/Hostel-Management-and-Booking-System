const Room = require('../models/Room');
const Hostel = require('../models/Hostel');
const Booking = require('../models/Booking');
const { sendEmail } = require('../utils/emailService');

// Helper function to update hostel room counts
const updateHostelRoomCounts = async (hostelId) => {
    try {
        const totalRooms = await Room.countDocuments({ hostel: hostelId, isActive: true });
        const availableRooms = await Room.countDocuments({ 
            hostel: hostelId, 
            status: 'available',
            isActive: true 
        });
        const occupiedRooms = await Room.countDocuments({ 
            hostel: hostelId, 
            status: 'occupied',
            isActive: true 
        });

        await Hostel.findByIdAndUpdate(hostelId, {
            totalRooms,
            availableRooms,
            occupiedRooms
        });
    } catch (error) {
        console.error('Error updating hostel room counts:', error);
    }
};

// Create multiple rooms for a hostel
const createRooms = async (req, res) => {
    try {
        const { hostelId, rooms } = req.body;

        console.log('Received request to create rooms:', { hostelId, rooms });

        // Validate input
        if (!hostelId || !rooms || !Array.isArray(rooms)) {
            return res.status(400).json({
                success: false,
                message: 'Hostel ID and rooms array are required'
            });
        }

        console.log('Looking for hostel:', hostelId);
        const hostel = await Hostel.findById(hostelId);
        if (!hostel) {
            console.log('Hostel not found with ID:', hostelId);
            return res.status(404).json({
                success: false,
                message: 'Hostel not found'
            });
        }
        console.log('Hostel found:', hostel.name);

        // Create rooms one by one to handle potential errors
        const createdRooms = [];
        const errors = [];
        
        for (const roomData of rooms) {
            try {
                console.log('Creating room:', roomData.roomNumber);
                
                const room = new Room({
                    roomNumber: roomData.roomNumber,
                    floor: roomData.floor,
                    roomType: roomData.roomType,
                    price: roomData.price,
                    capacity: roomData.capacity,
                    amenities: roomData.amenities || [],
                    status: roomData.status || 'available',
                    hostel: hostelId,
                    currentOccupancy: 0,
                    isActive: true
                });
                
                console.log('Room object created, saving...');
                const savedRoom = await room.save();
                console.log('Room saved successfully:', savedRoom.roomNumber);
                createdRooms.push(savedRoom);
                
            } catch (error) {
                console.error(`Error creating room ${roomData.roomNumber}:`, error.message);
                console.error('Full error:', error);
                errors.push({
                    roomNumber: roomData.roomNumber,
                    error: error.message
                });
            }
        }

        console.log('Creation results:', {
            created: createdRooms.length,
            errors: errors.length,
            errorsDetails: errors
        });

        if (createdRooms.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No rooms were created. Please check the room data.',
                errors: errors
            });
        }

        // Update hostel room counts
        console.log('Updating hostel room counts...');
        await updateHostelRoomCounts(hostelId);

        res.status(201).json({
            success: true,
            message: `${createdRooms.length} rooms created successfully`,
            rooms: createdRooms,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Error in createRooms:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get available rooms with filters
const getAvailableRooms = async (req, res) => {
    try {
        const { hostelId, roomType, floor, minPrice, maxPrice } = req.query;

        let filter = { 
            status: 'available',
            isActive: true 
        };

        if (hostelId) filter.hostel = hostelId;
        if (roomType) filter.roomType = roomType;
        if (floor) filter.floor = parseInt(floor);

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseInt(minPrice);
            if (maxPrice) filter.price.$lte = parseInt(maxPrice);
        }

        const rooms = await Room.find(filter)
            .populate('hostel', 'name location')
            .sort({ floor: 1, roomNumber: 1 });

        res.json({
            success: true,
            count: rooms.length,
            rooms
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get room by ID
const getRoomById = async (req, res) => {
    try {
        const { roomId } = req.params;

        const room = await Room.findById(roomId)
            .populate('hostel', 'name location amenities');

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        res.json({
            success: true,
            room
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update room information
const updateRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const updateData = req.body;

        const room = await Room.findByIdAndUpdate(
            roomId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Update hostel counts if room status changed
        if (updateData.status || updateData.isActive !== undefined) {
            await updateHostelRoomCounts(room.hostel);
        }

        res.json({
            success: true,
            message: 'Room updated successfully',
            room
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Auto-assign room to booking
const autoAssignRoom = async (req, res) => {
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

        if (booking.room) {
            return res.status(400).json({
                success: false,
                message: 'Room already assigned to this booking'
            });
        }

        // Find available room
        const availableRoom = await Room.findOne({
            hostel: booking.hostel._id,
            roomType: booking.roomType,
            status: 'available',
            isActive: true
        }).sort({ floor: 1, roomNumber: 1 });

        if (!availableRoom) {
            return res.status(404).json({
                success: false,
                message: 'No available rooms matching the criteria'
            });
        }

        // Assign room to booking
        booking.room = availableRoom._id;
        booking.roomNumber = availableRoom.roomNumber;
        booking.status = 'confirmed';
        booking.assignedAt = new Date();
        await booking.save();

        // Update room status
        availableRoom.status = 'reserved';
        availableRoom.currentOccupancy += 1;
        await availableRoom.save();

        // Update hostel counts
        await updateHostelRoomCounts(booking.hostel._id);

        // Send room assignment email to student with hostel name
        await sendEmail(
            booking.student.email,
            'roomAssigned',
            [booking.student.name, booking._id, availableRoom.roomNumber, availableRoom.floor, booking.hostel.name]
        );

        res.json({
            success: true,
            message: 'Room assigned successfully',
            booking: {
                _id: booking._id,
                roomNumber: availableRoom.roomNumber,
                roomType: availableRoom.roomType,
                floor: availableRoom.floor
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Manual room assignment
const manualAssignRoom = async (req, res) => {
    try {
        const { bookingId, roomId } = req.body;

        if (!bookingId || !roomId) {
            return res.status(400).json({
                success: false,
                message: 'Booking ID and Room ID are required'
            });
        }

        const booking = await Booking.findById(bookingId)
            .populate('student')
            .populate('hostel');
        const room = await Room.findById(roomId);

        if (!booking || !room) {
            return res.status(404).json({
                success: false,
                message: 'Booking or Room not found'
            });
        }

        if (room.hostel.toString() !== booking.hostel.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Room does not belong to the booking hostel'
            });
        }

        if (room.status !== 'available') {
            return res.status(400).json({
                success: false,
                message: 'Room is not available'
            });
        }

        if (room.roomType !== booking.roomType) {
            return res.status(400).json({
                success: false,
                message: 'Room type does not match booking requirement'
            });
        }

        // Assign room
        booking.room = room._id;
        booking.roomNumber = room.roomNumber;
        booking.status = 'confirmed';
        booking.assignedAt = new Date();
        await booking.save();

        // Update room
        room.status = 'reserved';
        room.currentOccupancy += 1;
        await room.save();

        await updateHostelRoomCounts(booking.hostel);

        // Send room assignment email to student with hostel name
        await sendEmail(
            booking.student.email,
            'roomAssigned',
            [booking.student.name, booking._id, room.roomNumber, room.floor, booking.hostel.name]
        );

        res.json({
            success: true,
            message: 'Room manually assigned successfully',
            booking: {
                _id: booking._id,
                roomNumber: room.roomNumber,
                roomType: room.roomType
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Check-in student
const checkInStudent = async (req, res) => {
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
            .populate('hostel')
            .populate('room');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (!booking.room) {
            return res.status(400).json({
                success: false,
                message: 'No room assigned to this booking'
            });
        }

        if (booking.status === 'checked-in') {
            return res.status(400).json({
                success: false,
                message: 'Student already checked in'
            });
        }

        // Update booking
        booking.status = 'checked-in';
        booking.checkedInAt = new Date();
        await booking.save();

        // Update room
        const room = await Room.findById(booking.room._id);
        room.status = 'occupied';
        await room.save();

        await updateHostelRoomCounts(booking.hostel);

        // Send check-in confirmation email to student
        await sendEmail(
            booking.student.email,
            'studentCheckedIn',
            [booking.student.name, booking._id, booking.roomNumber, booking.hostel.name]
        );

        res.json({
            success: true,
            message: 'Student checked in successfully',
            booking: {
                _id: booking._id,
                roomNumber: booking.roomNumber,
                checkedInAt: booking.checkedInAt
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Check-out student
const checkOutStudent = async (req, res) => {
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

        if (booking.status !== 'checked-in') {
            return res.status(400).json({
                success: false,
                message: 'Student is not checked in'
            });
        }

        // Update booking
        booking.status = 'checked-out';
        booking.checkedOutAt = new Date();
        await booking.save();

        // Update room
        const room = await Room.findById(booking.room);
        room.status = 'available';
        room.currentOccupancy = Math.max(0, room.currentOccupancy - 1);
        await room.save();

        await updateHostelRoomCounts(booking.hostel);

        // Send check-out confirmation email to student
        await sendEmail(
            booking.student.email,
            'studentCheckedOut',
            [booking.student.name, booking._id, booking.hostel.name]
        );

        res.json({
            success: true,
            message: 'Student checked out successfully',
            booking: {
                _id: booking._id,
                roomNumber: booking.roomNumber,
                checkedOutAt: booking.checkedOutAt
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get room occupancy report
const getOccupancyReport = async (req, res) => {
    try {
        const { hostelId } = req.params;

        const rooms = await Room.find({ hostel: hostelId })
            .populate('hostel', 'name location');

        const statusCounts = rooms.reduce((acc, room) => {
            acc[room.status] = (acc[room.status] || 0) + 1;
            return acc;
        }, {});

        const report = {
            totalRooms: rooms.length,
            available: statusCounts.available || 0,
            occupied: statusCounts.occupied || 0,
            reserved: statusCounts.reserved || 0,
            maintenance: statusCounts.maintenance || 0,
            occupancyRate: ((statusCounts.occupied || 0) / rooms.length * 100).toFixed(2)
        };

        res.json({
            success: true,
            report
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createRooms,
    getAvailableRooms,
    getRoomById,
    updateRoom,
    autoAssignRoom,
    manualAssignRoom,
    checkInStudent,
    checkOutStudent,
    getOccupancyReport
};