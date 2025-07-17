// Backend/server.js

const pgPool = require('./config/db'); // PostgreSQL connection
const connectMongoDB = require('./config/mongoose'); // MongoDB connection function

const express = require('express');
const cors = require('cors');

//Import Auth Router
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const documentRoutes = require('./routes/documents');

const app = express();
const PORT = process.env.PORT || 5000;

//Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enabling parsing of JSON request bodies

// --- Database Connections ---
// Connect to MongoDB
connectMongoDB();

//Basic Test Route
app.get('/', (req, res) => {
    res.send('Product Tracker Backend is running!');
});

//Use Auth Routes
app.use('/api/auth', authRoutes); // All routes in authRoutes will be prefixed with /api/auth
app.use('/api/products', productRoutes);// Use product routes, protected by authMiddleware internally
app.use('/api/documents', documentRoutes); // Use documents routes

// Start the server and capture the server instance
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access at: http://localhost:${PORT}`);
});

// Export app, pgPool, and server for testing
module.exports = { app, pgPool, server };