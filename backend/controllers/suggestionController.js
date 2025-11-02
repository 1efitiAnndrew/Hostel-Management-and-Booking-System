const { validationResult } = require('express-validator');
const Suggestion = require('../models/Suggestion');
const mongoose = require('mongoose');

/**
 * Register a new suggestion
 */
exports.registerSuggestion = async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success, 
            errors: errors.array(),
            message: 'Validation failed'
        });
    }
    
    const { student, hostel, title, description } = req.body;
    
    try {
        console.log('🔵 Registering suggestion:', { 
            student: student.substring(0, 8) + '...', 
            hostel: hostel.substring(0, 8) + '...', 
            title 
        });
        
        // Validate MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(student)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid student ID format'
            });
        }
        
        if (!mongoose.Types.ObjectId.isValid(hostel)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid hostel ID format'
            });
        }
        
        // Create and save new suggestion
        const newSuggestion = new Suggestion({
            student,
            hostel,
            title: title.trim(),
            description: description.trim()
        });
        
        const savedSuggestion = await newSuggestion.save();
        
        // Populate the saved suggestion with student details
        const populatedSuggestion = await Suggestion.findById(savedSuggestion._id)
            .populate('student', ['name', 'roomNo', 'email'])
            .populate('hostel', ['name', 'block']);
        
        success = true;
        res.status(201).json({ 
            success, 
            message: 'Suggestion registered successfully',
            suggestion: populatedSuggestion,
            suggestionId: savedSuggestion._id
        });
        
    } catch (err) {
        console.error('🔴 Error in registerSuggestion:', err);
        res.status(500).json({ 
            success: false,
            message: 'Failed to register suggestion',
            error: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }
}

/**
 * Get all suggestions by hostel ID with advanced filtering
 */
exports.getbyhostel = async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success, 
            errors: errors.array(),
            message: 'Validation failed'
        });
    }
    
    const { hostel } = req.body;
    const { status, page = 1, limit = 50, search } = req.query; // Optional query parameters
    
    try {
        console.log('🔵 Fetching suggestions for hostel:', hostel);
        
        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(hostel)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid hostel ID format'
            });
        }
        
        // Build query object
        let query = { hostel };
        
        // Add status filter if provided
        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            query.status = status;
        }
        
        // Add search filter if provided
        if (search && search.trim()) {
            query.$or = [
                { title: { $regex: search.trim(), $options: 'i' } },
                { description: { $regex: search.trim(), $options: 'i' } }
            ];
        }
        
        // Calculate pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        
        // Execute query with population and sorting
        const [suggestions, totalCount, pendingCount, approvedCount] = await Promise.all([
            // Get paginated suggestions
            Suggestion.find(query)
                .populate('student', ['name', 'roomNo', 'email', 'phone'])
                .populate('hostel', ['name', 'block', 'type'])
                .sort({ date: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            
            // Get total count
            Suggestion.countDocuments(query),
            
            // Get pending count
            Suggestion.countDocuments({ ...query, status: 'pending' }),
            
            // Get approved count
            Suggestion.countDocuments({ ...query, status: 'approved' })
        ]);
        
        console.log(`✅ Found ${suggestions.length} suggestions for hostel ${hostel} (Total: ${totalCount})`);
        
        success = true;
        res.json({ 
            success, 
            suggestions,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalCount / limitNum),
                totalCount,
                hasNext: pageNum < Math.ceil(totalCount / limitNum),
                hasPrev: pageNum > 1
            },
            counts: {
                total: totalCount,
                pending: pendingCount,
                approved: approvedCount,
                rejected: totalCount - pendingCount - approvedCount
            },
            filters: {
                status: status || 'all',
                search: search || ''
            }
        });
        
    } catch (err) {
        console.error('🔴 Error in getbyhostel:', err);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch suggestions',
            error: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }
}

/**
 * Get all suggestions by student ID
 */
exports.getbystudent = async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success, 
            errors: errors.array(),
            message: 'Validation failed'
        });
    }
    
    const { student } = req.body;
    const { status, page = 1, limit = 20 } = req.query;
    
    try {
        console.log('🔵 Fetching suggestions for student:', student);
        
        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(student)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid student ID format'
            });
        }
        
        // Build query
        let query = { student };
        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            query.status = status;
        }
        
        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        
        const [suggestions, totalCount] = await Promise.all([
            Suggestion.find(query)
                .populate('hostel', ['name', 'block', 'type', 'warden'])
                .populate('student', ['name', 'roomNo', 'email'])
                .sort({ date: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Suggestion.countDocuments(query)
        ]);
        
        console.log(`✅ Found ${suggestions.length} suggestions for student ${student}`);
        
        success = true;
        res.json({ 
            success, 
            suggestions,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalCount / limitNum),
                totalCount,
                hasNext: pageNum < Math.ceil(totalCount / limitNum),
                hasPrev: pageNum > 1
            }
        });
        
    } catch (err) {
        console.error('🔴 Error in getbystudent:', err);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch student suggestions',
            error: err.message
        });
    }
}

/**
 * Update suggestion status
 */
exports.updateSuggestion = async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success, 
            errors: errors.array(),
            message: 'Validation failed'
        });
    }
    
    const { id, status, adminNotes } = req.body; // Added adminNotes for rejection reasons
    
    try {
        console.log('🟡 Updating suggestion:', { 
            id: id.substring(0, 8) + '...', 
            status,
            adminNotes: adminNotes || 'No notes provided'
        });
        
        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid suggestion ID format'
            });
        }
        
        // Validate status
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be: pending, approved, or rejected'
            });
        }
        
        // Prepare update data
        const updateData = { status };
        if (adminNotes) {
            updateData.adminNotes = adminNotes;
        }
        if (status === 'approved') {
            updateData.approvedAt = new Date();
        }
        
        // Find and update suggestion
        const suggestion = await Suggestion.findByIdAndUpdate(
            id, 
            updateData, 
            { 
                new: true,
                runValidators: true 
            }
        )
        .populate('student', ['name', 'roomNo', 'email'])
        .populate('hostel', ['name', 'block']);
        
        if (!suggestion) {
            return res.status(404).json({
                success: false,
                message: 'Suggestion not found'
            });
        }
        
        console.log(`✅ Successfully updated suggestion ${id.substring(0, 8)}... to status: ${status}`);
        
        success = true;
        res.json({ 
            success, 
            message: `Suggestion ${status} successfully`,
            suggestion,
            previousStatus: suggestion.status // In case you need it
        });
        
    } catch (err) {
        console.error('🔴 Error in updateSuggestion:', err);
        res.status(500).json({ 
            success: false,
            message: 'Failed to update suggestion',
            error: err.message
        });
    }
}

/**
 * Get suggestion statistics for dashboard
 */
exports.getSuggestionStats = async (req, res) => {
    try {
        const { hostel } = req.body;
        
        if (!hostel || !mongoose.Types.ObjectId.isValid(hostel)) {
            return res.status(400).json({
                success: false,
                message: 'Valid hostel ID is required'
            });
        }
        
        const stats = await Suggestion.aggregate([
            { $match: { hostel: new mongoose.Types.ObjectId(hostel) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    latestDate: { $max: '$date' }
                }
            }
        ]);
        
        // Format stats
        const formattedStats = {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0
        };
        
        stats.forEach(stat => {
            formattedStats[stat._id] = stat.count;
            formattedStats.total += stat.count;
        });
        
        // Get recent suggestions (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentSuggestions = await Suggestion.countDocuments({
            hostel: new mongoose.Types.ObjectId(hostel),
            date: { $gte: sevenDaysAgo }
        });
        
        res.json({
            success: true,
            stats: formattedStats,
            recentActivity: {
                last7Days: recentSuggestions,
                percentageChange: formattedStats.total > 0 ? 
                    ((recentSuggestions / formattedStats.total) * 100).toFixed(1) : 0
            },
            lastUpdated: new Date()
        });
        
    } catch (err) {
        console.error('🔴 Error in getSuggestionStats:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch suggestion statistics',
            error: err.message
        });
    }
}

/**
 * Delete a suggestion (admin only)
 */
exports.deleteSuggestion = async (req, res) => {
    try {
        const { id } = req.body;
        
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Valid suggestion ID is required'
            });
        }
        
        const deletedSuggestion = await Suggestion.findByIdAndDelete(id);
        
        if (!deletedSuggestion) {
            return res.status(404).json({
                success: false,
                message: 'Suggestion not found'
            });
        }
        
        console.log(`🗑️ Deleted suggestion: ${id.substring(0, 8)}...`);
        
        res.json({
            success: true,
            message: 'Suggestion deleted successfully',
            deletedSuggestion: {
                id: deletedSuggestion._id,
                title: deletedSuggestion.title,
                status: deletedSuggestion.status
            }
        });
        
    } catch (err) {
        console.error('🔴 Error in deleteSuggestion:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to delete suggestion',
            error: err.message
        });
    }
}

/**
 * Health check and test endpoint
 */
exports.healthCheck = async (req, res) => {
    try {
        // Test database connection
        const dbState = mongoose.connection.readyState;
        const dbStatus = dbState === 1 ? 'connected' : 
                        dbState === 2 ? 'connecting' : 
                        dbState === 3 ? 'disconnecting' : 'disconnected';
        
        // Get some basic counts
        const totalSuggestions = await Suggestion.countDocuments();
        const recentSuggestions = await Suggestion.countDocuments({
            date: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        });
        
        res.json({
            success: true,
            message: 'Suggestion API is healthy 🟢',
            timestamp: new Date().toISOString(),
            database: {
                status: dbStatus,
                readyState: dbState
            },
            statistics: {
                totalSuggestions,
                recentSuggestions24h: recentSuggestions
            },
            version: '1.0.0',
            endpoints: {
                register: 'POST /api/suggestion/register',
                byHostel: 'POST /api/suggestion/hostel',
                byStudent: 'POST /api/suggestion/student',
                update: 'POST /api/suggestion/update',
                stats: 'POST /api/suggestion/stats',
                delete: 'DELETE /api/suggestion/delete'
            }
        });
        
    } catch (err) {
        console.error('🔴 Health check failed:', err);
        res.status(500).json({
            success: false,
            message: 'Health check failed',
            error: err.message
        });
    }
}