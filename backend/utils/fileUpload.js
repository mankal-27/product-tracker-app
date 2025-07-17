// backend/utils/fileUpload.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');


//Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

//Configure Storage
const storage = multer.diskStorage({
    destination:(req, file, cb) => {
        //create subdirectories per user or product later
        cb(null, uploadDir); // Store files in the 'backend/uploads' directory
    },
    filename:(req, file, cb) => {
        // Create a unique filename: fieldname-timestamp.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure file filter (optional, to restrict file types)
const fileFilter = (req, file, cb) => {
    // Accept only specific image and PDF types for receipts/manuals
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if(mimeType && extName){
        return cb(null, true);
    }
    cb(new Error('Only images (JPEG, JPG, PNG, GIF) and PDF files are allowed!'), false);
};

// Intialize multer upload middleware
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5, // 5 MB file size limit
    }
});

module.exports = upload;