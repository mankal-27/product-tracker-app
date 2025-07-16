// backend/models/File.js

const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    // Link to the PostgreSQL Product ID
    productId:{
        type: Number,
        required: true,
        ref: 'Product'
    },
    userId: {
        type: Number,
        required: true,
        ref: 'User'
    },
    filename:{
        type: String,
        required: true,
    },
    originalname:{
        type: String,
        required: true,
    },
    mimetype:{
        type: String,
        required: true,
    },
    size:{
        type: Number,
        required: true,
    },
    filePath:{ // Path where the file is stored (e.g., 'uploads/filename.ext')
        type: String,
        required: true,
    },
    description:{
        type: String,
    },
    fileType:{
        type: String,
        enum: ['receipt', 'manual', 'other'],
        default: 'other',
    }
}, {
    timestamps: true, // This will add createdAt and updatedAt fields automatically
});

module.exports = mongoose.model('File', fileSchema);