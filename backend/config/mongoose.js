// backend/config/mongoose.js
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI); // Options like useNewUrlParser are deprecated in Mongoose 6+
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`MongoDB Connection Error: ${err.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;