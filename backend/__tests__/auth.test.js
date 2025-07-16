// backend/__tests__/auth.test.js

const request = require('supertest');
const { app,pgPool, server } = require('../server'); // Import app and pgPool
const bcrypt = require('bcryptjs');

// Before all tests, clear the users table in the test database
beforeAll(async () => {
    process.env.NODE_ENV = 'test'; // Ensure test environment is active
    await pgPool.query('DELETE FROM users'); // Clear users table
});

// After all tests, clean up the users table and close the pool
afterAll(async () => {
    await pgPool.query('DELETE FROM users'); // Clear users table again
    await pgPool.end(); // Close the pool connection
    server.close();   // <--- IMPORTANT: Close the Express server here
});

describe('Auth API', () => {
    const user = {
        email: 'test@example.com',
        password: 'password123',
    };
    const user2 = {
        email: 'test2@example.com',
        password: 'password456',
    };
    
    let registeredUserToken = '';
    
    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(user);
        
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user.email).toEqual(user.email);
        
        registeredUserToken = res.body.token; // Store token for subsequent tests
    });
    
    it('should not register a user with an existing email', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(user); // Try to register the same user again
        
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('User with this email already exists');
    });
    
    it('should log in an existing user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: user.email, password: user.password });
        
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user.email).toEqual(user.email);
    });
    
    it('should not log in with invalid credentials (wrong password)', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: user.email, password: 'wrongpassword' });
        
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('Invalid Credentials');
    });
    
    it('should not log in with invalid credentials (non-existent email)', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nonexistent@example.com', password: 'anypassword' });
        
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('Invalid Credentials');
    });
    
    // Test auth middleware protection (example: trying to access a protected route without token)
    it('should deny access to protected route without token', async () => {
        const res = await request(app)
            .get('/api/products'); // Use a product route as an example of a protected route
        
        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toEqual('No Token, authorization denied');
    });
});