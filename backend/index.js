const express = require('express');
const connectDB = require('./utils/conn');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Connect to database
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
// Server start is handled in the database connection block
app.use('/api/room', require('./routes/roomRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
