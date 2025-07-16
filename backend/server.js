// Backend/server.js

require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

//Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enabling parsing of JSON request bodies

//Basic Test Route
app.get('/', (req, res) => {
    res.send('Product Tracker Backend is running!');
});

//Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access at : http://localhost:${PORT}`);
});