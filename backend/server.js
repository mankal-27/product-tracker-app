// Backend/server.js

require('dotenv').config(); // Load environment variables from .env file
const db = require('./config/db'); // Import the database connection

const express = require('express');
const cors = require('cors');

//Import Auth Router
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

//Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enabling parsing of JSON request bodies

//Basic Test Route
app.get('/', (req, res) => {
    res.send('Product Tracker Backend is running!');
});

//Use Auth Routes
app.use('/api/auth', authRoutes); // All routes in authRoutes will be prefixed with /api/auth

//Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access at : http://localhost:${PORT}`);
});