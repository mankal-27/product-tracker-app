// backend/routes/documents.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');// For authentication
const upload = require('../utils/fileUpload'); // Multer middleware
const File = require('../models/File'); // File metadata model
const Note = require('../models/Note'); // Note model
const path = require('path');
const fs = require('fs');
const multer = require("multer");
const {parse} = require("dotenv");

// --- FILE ROUTES ---

// @route   POST /api/documents/upload/:productId/:fileType
// @desc    Upload a file (receipt/manual) for a specific product
// @access  Private
router.post('/upload/:productId/:fileType', authMiddleware, upload.single('productFile'), async (req, res) => {
    try{
        const { productId, fileType } = req.params;
        const user_id = req.user.id;
        
        //Ensure FileType is valid
        if(!['receipt', 'manual', 'other'].includes(fileType)){
            return res.status(400).json({message: 'Invalid file type. Must be "receipt", "manual", or "other".' });
        }
        
        //Multer puts file info on req.file
        if(!req.file){
            return res.status(400).json({ message: 'No file uploaded.' });
        }
        
        const { filename, originalname, mimetype, size, path: filepath } = req.file;
        
        const newFile = new File({
            productId: parseInt(productId), // Ensure its a number for MongoDB
            userId: user_id,
            filename,
            originalname,
            mimetype,
            size,
            filePath: path.relative(path.join(__dirname, '../'), filepath), // Store path relative to backend root
            fileType,
            description: req.body.description, // optional description from body
        });
        
        await newFile.save();
        res.status(201).json({
            message: 'File uploaded and saved successfully',
            file: newFile
        });
    }catch(err){
        console.error('File upload error:', err.message);
        // If it's a Multer error, return appropriate status
        if(err instanceof multer.MulterError){
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Server error during file upload.' });
    }
});

// @route   GET /api/documents/product/:productId/files
// @desc    Get all files for a specific product for the authenticated user
// @access  Private
router.get('/product/:productId/files', authMiddleware, async (req, res) => {
    try {
        const { productId } = req.params;
        const user_id = req.user.id;
        
        const files = await File.find({ productId: parseInt(productId), userId: user_id}).sort({ uploadDate: -1});
        
        res.status(200).json({
            message: 'Files fetched successfully',
            files
        });
    }catch(err){
        console.error(`Error fetching files:`, err.message);
        res.status(500).json({ message: 'Server error'});
    }
});

// @route   GET /api/documents/file/:fileId/download
// @desc    Download a specific file by its MongoDB _id
// @access  Private
router.get('/file/:fileId/download', authMiddleware, async (req, res) => {
    try {
        const { fileId } = req.params;
        const user_id = req.user.id;
        
        const file = await File.findOne({ _id: fileId, userId: user_id});
        
        if(!file){
            return res.status(404).json({ message: 'File not found or unauthorized' });
        }
        
        const fullPath = path.join(__dirname, '../', file.filePath); // Construct full path
        
        // Check if file exists on disk
        if(!fs.existsSync(fullPath)){
            return res.status(404).json({ message: 'File not found on server disk.' });
        }
        
        res.download(fullPath, file.originalname, (err) => {
            if(err){
                console.error('Error downloading file:', err.message);
                // Handle case where headers are already sent or other download errors
                if (!res.headersSent) {
                    res.status(500).json({ message: 'Error during file download.' });
                }
            }
        });
    }catch(err){
        console.error('Error in file download endpoint:', err.message);
        res.status(500).json({ message: 'Server error'});
    }
});

// @route   DELETE /api/documents/file/:fileId
// @desc    Delete a specific file (metadata and from disk)
// @access  Private
router.delete('/file/:fileId', authMiddleware, async (req, res) => {
    try{
        const { fileId } = req.params;
        const user_id = req.user.id;
       
        const file = await File.findOne({ _id: fileId, userId: user_id});
        if(!file){
            return res.status(404).json({ message: 'File not found or unauthorized.' });
        }
        const fullPath = path.join(__dirname, '../', file.filePath);
        
        //Delete file from disk
        if(fs.existsSync(fullPath)){
            fs.unlinkSync(fullPath, async (err) => {
                if(err){
                    console.error('Error deleting file from disk:', err.message);
                    // Don't necessarily return 500 here if the file can't be deleted but DB entry should be
                    // You might want to log this and proceed to delete DB entry
                }
                // Delete file metadata from MongoDB
                await File.deleteOne({ _id: fileId });
                res.status(200).json({ message: 'File deleted successfully', id: fileId });
            });
        }else {
            // If file not on disk, just delete metadata
            await File.deleteOne({ _id: fileId })
            res.status(200).json({ message: 'File metadata deleted (file not found on disk)', id: fileId });
        }
    }catch(err){
        console.error('Error deleting file:', err.message);
        res.status(500).json({ message: 'Server error'});
    }
});

// --- NOTE ROUTES ---

// @route   POST /api/documents/notes/:productId
// @desc    Add a new note for a specific product
// @access  Private
router.post('/notes/:productId', authMiddleware, async (req, res) => {
    try{
        const { productId } = req.params;
        const user_id = req.user.id;
        const { content } = req.body;
        
        if(!content){
            return res.status(400).json({ message: 'Note content cannot be empty.' });
        }
        
        const newNote = new Note({
            productId: parseInt(productId),
            userId: user_id,
            content
        })
        
        await newNote.save();
        res.status(201).json({
            message: 'Note added successfully',
            note: newNote
        })
    }catch(err){
        console.error('Error adding note:', err.message);
        res.status(500).json({ message: 'Server error'});
    }
});

// @route   GET /api/documents/product/:productId/notes
// @desc    Get all notes for a specific product for the authenticated user
// @access  Private
router.get('/product/:productId/notes', authMiddleware, async (req, res) => {
    try {
        const { productId } = req.params;
        const user_id = req.user.id;
        
        const notes = await Note.find({ productId: parseInt(productId), userId: user_id }).sort({ createdAt: -1 });
        
        res.status(200).json({
            message: 'Notes fetched successfully',
            notes
        })
    }catch(err){
        console.error('Error fetching notes:', err.message);
        res.status(500).json({ message: 'Server error'});
    }
});

// @route   PUT /api/documents/notes/:noteId
// @desc    Update a specific note by its MongoDB _id
// @access  Private
router.put('/notes/:noteId', authMiddleware, async (req, res) => {
    try {
        const { noteId } = req.params;
        const user_id = req.user.id;
        const { content } = req.body;
        
        if(!content){
            return res.status(400).json({ message: 'Note content cannot be empty.' });
        }
        
        const updatedNotes = await Note.findOneAndUpdate(
            { _id: noteId, userId: user_id },
            { content, updatedAt:Date.now() }, // Explicitly update updatedAt
            {new: true} // Return the updated document
        )
        
        if(!updatedNotes){
            return res.status(404).json({ message: 'Note not found or unauthorized.' });
        }
        
        res.status(200).json({
            message: 'Note updated successfully',
            note: updatedNotes
        });
    }catch(err){
        console.error('Error updating note:', err.message);
        res.status(500).json({ message: 'Server error'});
    }
});

// @route   DELETE /api/documents/notes/:noteId
// @desc    Delete a specific note by its MongoDB _id
// @access  Private
router.delete('/notes/:noteId', authMiddleware, async (req, res) => {
    try {
        const { noteId } = req.params;
        const user_id = req.user.id;
        
        const deletedNote = await Note.findOneAndDelete({ _id:noteId, userId: user_id});
        if(!deletedNote){
            return res.status(404).json({ message: 'Note not found or unauthorized.' });
        }
        
        res.status(200).json({ message: 'Note deleted successfully', id: noteId });
    }catch(err){
        console.error('Error deleting note:', err.message);
        res.status(500).json({ message: 'Server error'});
    }
});

module.exports = router;













































