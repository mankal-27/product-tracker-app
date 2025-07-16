// backend/models/Note.js

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    // Link to the PostgreSQL product ID
    productId:{
        type:Number,  // Storing PostgreSQL's SERIAL ID as a Number
        required:true,
        ref:'Product', // Logical refrence
    },
    userId:{
        type:Number, // Storing PostgreSQL's Serial ID as a Number
        required:true,
        ref:'User', // Logical refrence
    },
    content:{
        type:String,
        required:true,
    }
},{ timestamps: true });

module.exports = mongoose.model('Note',noteSchema);