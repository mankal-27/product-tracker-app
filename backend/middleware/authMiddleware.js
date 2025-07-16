// backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    //Get Token from header
    const token = req.header('x-auth-token'); // Common header name for JWT
    
    // Check if not token
    if (!token) {
        return res.status(401).json({ message: 'No Token, authorization denied'});
    }
    
    try{
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        //Attach user from token paylod to request body
        req.user = decoded; // req.user will now have { id: user_id, email: user_email }
        next(); // Proceed to the next middleware/route handler
    }catch (err) {
        console.error('Token Verification Failed', err.message);
        res.status(401).json({ message: 'Token is not valid'});
    }
}

module.exports = authMiddleware;