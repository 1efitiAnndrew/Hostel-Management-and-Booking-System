const express = require('express');
const connectDB = require('./utils/conn');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: [
        'https://hostel-management-and-booking-system.onrender.com',
        'https://hostel-management-and-booking-systems.onrender.com',
        'http://localhost:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ extended: false }));

// Import all route files
const hostelRoutes = require('./routes/hostelRoutes');
const studentRoutes = require('./routes/studentRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const messoffRoutes = require('./routes/messoffRoutes');
const requestRoutes = require('./routes/requestRoutes');

// ✅ MOUNT ROUTES WITH CORRECT PATHS
app.use('/api/hostels', hostelRoutes);  // NOTE: Changed to plural 'hostels'
app.use('/api/student', studentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/complaint', complaintRoutes);
app.use('/api/messoff', messoffRoutes);
app.use('/api/request', requestRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// 404 Handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Connect to database and start server
(async () => {
    try {
        await connectDB();
        console.log('Database connected successfully');
        
        // Start server only after DB connection is established
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to connect to database:', error.message);
        process.exit(1);
    }
})();