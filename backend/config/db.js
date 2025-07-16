// backend/config/db.js
require('dotenv').config();
const { Pool } = require('pg');

// Create a new Pool instance
// The connection string is loaded from DATABASE_URL environment variable
// const pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
// });

const pool = new Pool({
    user: 'postgres',
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: 'chinky151719', // <-- HARDCODED FOR DEBUGGING
    port: process.env.DB_PORT,
});

// Test the database connection
pool.connect((err, client, done) => {
    if (err) {
        console.error('Database connection error:', err.message);
        return;
    }
    console.log('Successfully connected to PostgreSQL database!');
    client.release(); // Release the client back to the pool
});

module.exports = pool;