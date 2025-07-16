// backend/config/db.js
// backend/config/db.js
const path = require("path");
const dotenv = require('dotenv'); // Import dotenv explicitly
const { Pool } = require('pg');

const isTestEnv = process.env.NODE_ENV === 'test';

if (isTestEnv) {
    // Load .env.test specifically for the test environment
    // Use override: true to ensure test variables take precedence
    dotenv.config({ path: path.resolve(__dirname, '../.env.test'), override: true });
    console.log('--- Loading .env.test for Test Environment ---');
} else {
    // Default to .env for development or production
    dotenv.config({ path: path.resolve(__dirname, '../.env'), override: false }); // No override needed if this is the first explicit load
    console.log('--- Loading .env for Development/Production Environment ---');
}

// Log the effective environment for debugging and confirmation
console.log(`Current NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`Using Database: ${process.env.DB_NAME}`);
console.log(`Connecting to Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
console.log(`DB User: ${process.env.DB_USERNAME}`);
// console.log(`DB Password: ${process.env.DB_PWD ? '********' : 'Not Set'}`); // Avoid logging sensitive info directly

// The connection string is loaded from DATABASE_URL environment variable
// const pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
// });

const pool = new Pool({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PWD, // <-- HARDCODED FOR DEBUGGING
    port: process.env.DB_PORT,
});

// Test the database connection
pool.connect((err, client, done) => {
    if (err) {
        console.error('Database connection error:', err.message);
        console.error('Ensure DB_USERNAME, DB_HOST, DB_NAME, DB_PWD, DB_PORT are set correctly for NODE_ENV=' + process.env.NODE_ENV);
        return;
    }
    console.log('Successfully connected to PostgreSQL database!');
    client.release(); // Release the client back to the pool
});

module.exports = pool;