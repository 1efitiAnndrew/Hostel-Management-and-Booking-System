const Room = require('../models/Room');
const Hostel = require('../models/Hostel');
const Booking = require('../models/Booking');
const { sendEmail } = require('../utils/emailService');
const mongoose = require('mongoose');

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

// Update booking status when room is assigned
const updateBookingOnRoomAssignment = async (bookingId, roomId) => {
    try {
        const booking = await Booking.findById(bookingId);
        if (booking) {
            booking.room = roomId;
            booking.status = 'confirmed';
            booking.assignedAt = new Date();
            await booking.save();
        }
    } catch (error) {
        console.error('Error updating booking on room assignment:', error);
    }
};

// Update booking status when student checks in/out
const updateBookingOnCheckInOut = async (bookingId, action) => {
    try {
        const booking = await Booking.findById(bookingId);
        if (booking) {
            if (action === 'check-in') {
                booking.status = 'checked-in';
                booking.checkedInAt = new Date();
            } else if (action === 'check-out') {
                booking.status = 'checked-out';
                booking.checkedOutAt = new Date();
            }
            await booking.save();
        }
    } catch (error) {
        console.error('Error updating booking on check-in/out:', error);
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
                
                // Check for duplicate room number in the same hostel
                const existingRoom = await Room.findOne({
                    hostel: hostelId,
                    roomNumber: roomData.roomNumber,
                    isActive: true
                });
                
                if (existingRoom) {
                    errors.push({
                        roomNumber: roomData.roomNumber,
                        error: `Room number ${roomData.roomNumber} already exists in this hostel`
                    });
                    continue; // Skip to next room
                }
                
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

// Get available rooms for booking (enhanced with date conflict checking)
const getAvailableRoomsForBooking = async (req, res) => {
    try {
        const { hostelId, roomType, checkInDate, checkOutDate } = req.query;

        if (!hostelId || !roomType) {
            return res.status(400).json({
                success: false,
                message: 'Hostel ID and room type are required'
            });
        }

        // Find available rooms that match criteria
        const availableRooms = await Room.find({
            hostel: hostelId,
            roomType: roomType,
            status: 'available',
            isActive: true,
            $expr: { $lt: ['$currentOccupancy', '$capacity'] }
        }).sort({ floor: 1, roomNumber: 1 });

        // If dates provided, check for booking conflicts
        let filteredRooms = availableRooms;
        if (checkInDate && checkOutDate) {
            const conflictingBookings = await Booking.find({
                hostel: hostelId,
                roomType: roomType,
                status: { $in: ['confirmed', 'checked-in'] },
                $or: [
                    {
                        checkInDate: { $lt: new Date(checkOutDate) },
                        checkOutDate: { $gt: new Date(checkInDate) }
                    }
                ]
            });

            const conflictingRoomIds = conflictingBookings.map(b => b.room?.toString()).filter(Boolean);
            
            filteredRooms = availableRooms.filter(room => 
                !conflictingRoomIds.includes(room._id.toString())
            );
        }

        res.json({
            success: true,
            count: filteredRooms.length,
            availableRooms: filteredRooms
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all rooms for a hostel with pagination and filtering
const getHostelRooms = async (req, res) => {
    try {
        const { hostelId } = req.params;
        const { 
            status, 
            roomType, 
            floor, 
            page = 1, 
            limit = 10,
            sortBy = 'roomNumber',
            sortOrder = 'asc'
        } = req.query;

        let filter = { hostel: hostelId, isActive: true };
        
        if (status) filter.status = status;
        if (roomType) filter.roomType = roomType;
        if (floor) filter.floor = parseInt(floor);

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const rooms = await Room.find(filter)
            .populate('hostel', 'name location')
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Room.countDocuments(filter);

        res.json({
            success: true,
            rooms,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRooms: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
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
            .populate('hostel', 'name location amenities')
            .populate({
                path: 'hostel',
                select: 'name location contact amenities'
            });

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

// Update room status specifically
const updateRoomStatus = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { status } = req.body;

        const validStatuses = ['available', 'occupied', 'reserved', 'maintenance', 'cleaning'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be: available, occupied, reserved, maintenance, or cleaning'
            });
        }

        const room = await Room.findByIdAndUpdate(
            roomId,
            { status },
            { new: true, runValidators: true }
        ).populate('hostel');

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Update hostel counts
        await updateHostelRoomCounts(room.hostel._id);

        res.json({
            success: true,
            message: `Room status updated to ${status}`,
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

        // Update booking status
        await updateBookingOnRoomAssignment(bookingId, availableRoom._id);

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

        // Update booking status
        await updateBookingOnRoomAssignment(bookingId, roomId);

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

        // Update booking status
        await updateBookingOnCheckInOut(bookingId, 'check-in');

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

        // Update booking status
        await updateBookingOnCheckInOut(bookingId, 'check-out');

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

// Get room utilization statistics
const getRoomUtilization = async (req, res) => {
    try {
        const { hostelId } = req.params;

        const utilization = await Room.aggregate([
            { $match: { hostel: new mongoose.Types.ObjectId(hostelId), isActive: true } },
            {
                $group: {
                    _id: '$roomType',
                    totalRooms: { $sum: 1 },
                    totalCapacity: { $sum: '$capacity' },
                    totalOccupied: { $sum: '$currentOccupancy' },
                    availableRooms: {
                        $sum: {
                            $cond: [
                                { $and: [
                                    { $eq: ['$status', 'available'] },
                                    { $lt: ['$currentOccupancy', '$capacity'] }
                                ]},
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    roomType: '$_id',
                    totalRooms: 1,
                    totalCapacity: 1,
                    totalOccupied: 1,
                    availableRooms: 1,
                    utilizationRate: {
                        $multiply: [
                            { $divide: ['$totalOccupied', '$totalCapacity'] },
                            100
                        ]
                    },
                    occupancyRate: {
                        $multiply: [
                            { $divide: [
                                { $subtract: ['$totalRooms', '$availableRooms'] },
                                '$totalRooms'
                            ]},
                            100
                        ]
                    }
                }
            }
        ]);

        res.json({
            success: true,
            utilization
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get room dashboard statistics
const getRoomDashboard = async (req, res) => {
    try {
        const { hostelId } = req.params;

        const stats = await Room.aggregate([
            { $match: { hostel: new mongoose.Types.ObjectId(hostelId), isActive: true } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalCapacity: { $sum: '$capacity' },
                    totalOccupied: { $sum: '$currentOccupancy' }
                }
            }
        ]);

        const totalRooms = await Room.countDocuments({ 
            hostel: hostelId, 
            isActive: true 
        });

        const availableRooms = await Room.countDocuments({
            hostel: hostelId,
            status: 'available',
            isActive: true,
            $expr: { $lt: ['$currentOccupancy', '$capacity'] }
        });

        const dashboard = {
            totalRooms,
            availableRooms,
            byStatus: stats.reduce((acc, stat) => {
                acc[stat._id] = stat.count;
                return acc;
            }, {}),
            occupancyRate: totalRooms > 0 ? 
                ((totalRooms - availableRooms) / totalRooms * 100).toFixed(2) : 0
        };

        res.json({
            success: true,
            dashboard
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Soft delete room (deactivate)
const deactivateRoom = async (req, res) => {
    try {
        const { roomId } = req.params;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Check if room can be deactivated (not occupied)
        if (room.status === 'occupied' || room.currentOccupancy > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot deactivate an occupied room'
            });
        }

        room.isActive = false;
        room.status = 'maintenance'; // Set to maintenance when deactivated
        await room.save();

        await updateHostelRoomCounts(room.hostel);

        res.json({
            success: true,
            message: 'Room deactivated successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Reactivate room
const reactivateRoom = async (req, res) => {
    try {
        const { roomId } = req.params;

        const room = await Room.findByIdAndUpdate(
            roomId,
            { 
                isActive: true,
                status: 'available'
            },
            { new: true, runValidators: true }
        );

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        await updateHostelRoomCounts(room.hostel);

        res.json({
            success: true,
            message: 'Room reactivated successfully',
            room
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
    getAvailableRoomsForBooking,
    getHostelRooms,
    getRoomById,
    updateRoom,
    updateRoomStatus,
    autoAssignRoom,
    manualAssignRoom,
    checkInStudent,
    checkOutStudent,
    getOccupancyReport,
    getRoomUtilization,
    getRoomDashboard,
    deactivateRoom,
    reactivateRoom,
    updateHostelRoomCounts
};