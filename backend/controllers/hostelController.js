import Hostel from '../models/Hostel.js';

// Get all hostels with search and filter
export const getHostels = async (req, res) => {
    try {
        const { 
            search, 
            location, 
            roomType, 
            minPrice, 
            maxPrice, 
            minAvailable,
            amenities 
        } = req.query;
        
        // Build filter object
        let filter = {};
        
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }
        
        if (location) {
            filter.location = { $regex: location, $options: 'i' };
        }
        
        if (roomType || minPrice || maxPrice || minAvailable) {
            filter.roomTypes = {
                $elemMatch: {}
            };
            
            if (roomType) {
                filter.roomTypes.$elemMatch.type = roomType;
            }
            
            if (minPrice || maxPrice) {
                filter.roomTypes.$elemMatch.price = {};
                if (minPrice) filter.roomTypes.$elemMatch.price.$gte = parseInt(minPrice);
                if (maxPrice) filter.roomTypes.$elemMatch.price.$lte = parseInt(maxPrice);
            }
            
            if (minAvailable) {
                filter.roomTypes.$elemMatch.available = { $gte: parseInt(minAvailable) };
            }
        }
        
        

        const hostels = await Hostel.find(filter)
            .select('name location rooms capacity vacant roomTypes amenities images contact')
            .sort({ 'roomTypes.price': 1 });

        // Filter room types in the response
        const filteredHostels = hostels.map(hostel => {
            const hostelObj = hostel.toObject();
            
            if (roomType || minPrice || maxPrice || minAvailable) {
                hostelObj.roomTypes = hostel.roomTypes.filter(room => {
                    let match = true;
                    
                    if (roomType && room.type !== roomType) match = false;
                    if (minPrice && room.price < parseInt(minPrice)) match = false;
                    if (maxPrice && room.price > parseInt(maxPrice)) match = false;
                    if (minAvailable && room.available < parseInt(minAvailable)) match = false;
                    
                    return match;
                });
            }
            
            return hostelObj;
        });

        res.json({
            success: true,
            count: filteredHostels.length,
            hostels: filteredHostels
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get single hostel details
export const getHostel = async (req, res) => {
    try {
        const hostel = await Hostel.findById(req.params.id)
            .populate('manager', 'name email phone');

        if (!hostel) {
            return res.status(404).json({
                success: false,
                message: 'Hostel not found'
            });
        }

        res.json({
            success: true,
            hostel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Check hostel availability
export const checkAvailability = async (req, res) => {
    try {
        const { roomType, checkInDate, checkOutDate } = req.body;
        
        const hostel = await Hostel.findById(req.params.id);
        
        if (!hostel) {
            return res.status(404).json({
                success: false,
                message: 'Hostel not found'
            });
        }

        const roomTypeInfo = hostel.roomTypes.find(r => r.type === roomType);
        if (!roomTypeInfo) {
            return res.status(400).json({
                success: false,
                message: 'Room type not available'
            });
        }

        const isAvailable = roomTypeInfo.available > 0;

        res.json({
            success: true,
            available: isAvailable,
            hostel: {
                name: hostel.name,
                roomType,
                price: roomTypeInfo.price,
                availableRooms: roomTypeInfo.available
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create hostel
export const createHostel = async (req, res) => {
    try {
        const hostelData = {
            ...req.body
        };

        const hostel = await Hostel.create(hostelData);

        res.status(201).json({
            success: true,
            message: 'Hostel created successfully',
            hostel
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update hostel
export const updateHostel = async (req, res) => {
    try {
        const hostel = await Hostel.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );

        if (!hostel) {
            return res.status(404).json({
                success: false,
                message: 'Hostel not found'
            });
        }

        res.json({
            success: true,
            message: 'Hostel updated successfully',
            hostel
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Delete hostel
export const deleteHostel = async (req, res) => {
    try {
        const hostel = await Hostel.findByIdAndDelete(req.params.id);

        if (!hostel) {
            return res.status(404).json({
                success: false,
                message: 'Hostel not found'
            });
        }

        res.json({
            success: true,
            message: 'Hostel deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// Search available rooms with detailed filtering
export const searchRooms = async (req, res) => {
    try {
        const { 
            checkInDate, 
            checkOutDate, 
            roomType, 
            minPrice, 
            maxPrice,
            location,
            amenities 
        } = req.query;

        // Build base filter
        let filter = { isActive: true };
        
        if (location) {
            filter.location = { $regex: location, $options: 'i' };
        }
        
        if (amenities) {
            const amenitiesArray = amenities.split(',');
            filter.amenities = { $in: amenitiesArray };
        }

        const hostels = await Hostel.find(filter);

        // Check availability for each hostel
        const availableRooms = [];
        
        for (const hostel of hostels) {
            for (const room of hostel.roomTypes) {
                // Check if room matches filters
                if (roomType && room.type !== roomType) continue;
                if (minPrice && room.price < parseInt(minPrice)) continue;
                if (maxPrice && room.price > parseInt(maxPrice)) continue;
                if (room.available <= 0) continue;

                // Check date availability if dates provided
                if (checkInDate && checkOutDate) {
                    const conflictingBookings = await Booking.find({
                        hostel: hostel._id,
                        roomType: room.type,
                        status: { $in: ['pending', 'confirmed'] },
                        $or: [
                            {
                                checkInDate: { $lt: new Date(checkOutDate) },
                                checkOutDate: { $gt: new Date(checkInDate) }
                            }
                        ]
                    });

                    if (conflictingBookings.length > 0) continue;
                }

                availableRooms.push({
                    hostel: {
                        _id: hostel._id,
                        name: hostel.name,
                        location: hostel.location,
                        amenities: hostel.amenities,
                        contact: hostel.contact
                    },
                    room: room,
                    available: room.available
                });
            }
        }

        // Sort by price
        availableRooms.sort((a, b) => a.room.price - b.room.price);

        res.json({
            success: true,
            count: availableRooms.length,
            availableRooms
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};