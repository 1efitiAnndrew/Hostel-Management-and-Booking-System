const express = require('express');
const connectDB = require('./utils/conn');
const cors = require('cors');

const app = express();
const port = 3000;

// Connect to database
connectDB();

app.use(cors({
    origin: '*',
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/complaint', require('./routes/complaintRoutes'));
app.use('/api/invoice', require('./routes/invoiceRoutes'));
app.use('/api/messoff', require('./routes/messoffRoutes'));
app.use('/api/request', require('./routes/requestRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/suggestion', require('./routes/suggestionRoutes'));
app.use('/api/booking', require('./routes/bookingRoutes'));
app.use('/api/hostel', require('./routes/hostelRoutes'));
app.use('/api/room', require('./routes/roomRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});