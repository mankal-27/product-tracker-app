// backend/routes/auth.js

const express = require('express');
const router = express.Router(); // Create an Express router
const bcrypt = require('bcryptjs'); // For Password hashing
const jwt = require('jsonwebtoken'); // For creating JWTs
const pool = require('../config/db');
const newUser = require("pg/lib/query"); // Out PostgreSQL connection pool

// -- User Registration --
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    
    //1. Basic Validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Please Enter all Required Fields'});
    }
    
    try {
        //2. Check if user already exists
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if(userExists.rows.length > 0){
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        
        //3. Hash password
        const salt = await bcrypt.genSalt(10); // <--- ENSURE THIS IS `10`
        const passwordHash = await bcrypt.hash(password, salt);
        
        //4. Save user to database
        const newUser = await pool.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
            [email, passwordHash],
        );
        
        //5. Generate JWT
        // Never include password_hash in the token payload!
        const token = jwt.sign(
            { id: newUser.rows[0].id, email: newUser.rows[0].email},
            process.env.JWT_SECRET, // Our Secret Key
            { expiresIn: process.env.JWT_SECRET_EXPIRES },
        );
        
        res.status(201).json({
            message: 'User successfully registered',
            token,
            user:{
                id: newUser.rows[0].id,
                email: newUser.rows[0].email,
            }
        });
    }catch(err){
        console.error('Registration error', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// --- User Login ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    //1. Basic Validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Please Enter all Required Fields'});
    }
    
    try{
        //2. Check if user exists
        const user = await pool.query('SELECT * FROM users where email = $1', [email]);
        if(user.rows.length === 0){
            return res.status(400).json({ message: 'Invalid Credentials' });// Don't specify if email or password is wrong for security
        }
        
        const storedPasswordHash = user.rows[0].password_hash;
        
        //3. Compare provided password with stored hash
        const isMatch = await bcrypt.compare(password, storedPasswordHash);
        
        if(!isMatch){
            return res.status(400).json({ message: 'Invalid Credentials' });
        }
        
        //4. Generate JWT
        const token = jwt.sign(
            { id: user.rows[0].id, email: user.rows[0].email},
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_SECRET_EXPIRES },
        );
        
        res.status(200).json({
            message: 'User successfully logged in',
            token,
            user:{
                id: user.rows[0].id,
                email: user.rows[0].email,
            }
        })
    }catch(err){
        console.error('Login error', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

module.exports = router; // Export the router



















