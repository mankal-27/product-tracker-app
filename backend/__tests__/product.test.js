// backend/__tests__/product.test.js

const request = require('supertest');
const { app, server } = require('../server'); // Import app and pool
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

let user1Token = '';
let user1Id = '';
let user2Token = '';
let user2Id = '';
let productId1 = '';
let productId2 = ''; // For user2's product

// Helper function to register and log in a user, returning their token and ID
const registerAndLoginUser = async (email, password) => {
    // Clear users table for a fresh start for each user creation in tests
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
    
    const registerRes = await request(app)
        .post('/api/auth/register')
        .send({ email, password });
    
    return { token: registerRes.body.token, id: registerRes.body.user.id };
};

beforeAll(async () => {
    process.env.NODE_ENV = 'test'; // Ensure test environment is active
    await pool.query('DELETE FROM products'); // Clear products table
    await pool.query('DELETE FROM users'); // Clear users table
    
    // Register and login two users for testing authorization
    const user1 = await registerAndLoginUser('user1@example.com', 'password123');
    user1Token = user1.token;
    user1Id = user1.id;
    
    const user2 = await registerAndLoginUser('user2@example.com', 'password456');
    user2Token = user2.token;
    user2Id = user2.id;
});

afterAll(async () => {
    await pool.query('DELETE FROM products');
    await pool.query('DELETE FROM users');
    // Note: pool.end() is called in auth.test.js after all tests.
    // We can choose to call it here too, or ensure it's called once globally.
    // For simplicity, we'll let auth.test.js handle the global pool.end().
});

describe('Product API', () => {
    
    // Test Create Product
    it('should create a new product for authenticated user', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('x-auth-token', user1Token)
            .send({
                name: 'Smart TV',
                category: 'Electronics',
                purchase_date: '2024-01-01',
                purchase_price: 1200.00,
                warranty_expiry_date: '2027-01-01',
                model_number: 'STV-55',
                serial_number: 'SN12345678901',
                location_in_house: 'Living Room'
            });
        
        expect(res.statusCode).toEqual(201);
        expect(res.body.message).toEqual('Product added successfully.');
        expect(res.body.product.name).toEqual('Smart TV');
        expect(res.body.product.user_id).toEqual(user1Id);
        expect(res.body.product).toHaveProperty('id');
        productId1 = res.body.product.id;
    });
    
    it('should not create a product without required fields', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('x-auth-token', user1Token)
            .send({
                category: 'Electronics' // Missing name
            });
        
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('Product name and category are required.');
    });
    
    // Test Get All Products
    it('should get all products for the authenticated user', async () => {
        const res = await request(app)
            .get('/api/products')
            .set('x-auth-token', user1Token);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Product Fetched successfully.');
        expect(res.body.products).toBeInstanceOf(Array);
        expect(res.body.products.length).toBeGreaterThan(0);
        expect(res.body.products[0].user_id).toEqual(user1Id);
    });
    
    // Test Get Single Product
    it('should get a single product by ID for the owner', async () => {
        const res = await request(app)
            .get(`/api/products/${productId1}`)
            .set('x-auth-token', user1Token);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Product Fetched successfully.');
        expect(res.body.product.id).toEqual(productId1);
        expect(res.body.product.user_id).toEqual(user1Id);
    });
    
    it('should not get a single product by ID if not the owner', async () => {
        // User2 tries to get user1's product
        const res = await request(app)
            .get(`/api/products/${productId1}`)
            .set('x-auth-token', user2Token);
        
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual('Product not found or unauthorized');
    });
    
    // Test Update Product
    it('should update a product for the owner', async () => {
        const res = await request(app)
            .put(`/api/products/${productId1}`)
            .set('x-auth-token', user1Token)
            .send({
                purchase_price: 1250.00,
                location_in_house: 'Bedroom'
            });
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Product updated successfully');
        expect(res.body.product.id).toEqual(productId1);
        expect(res.body.product.purchase_price).toEqual('1250.00'); // Note: DECIMAL comes back as string
        expect(res.body.product.location_in_house).toEqual('Bedroom');
    });
    
    it('should not update a product if not the owner', async () => {
        const res = await request(app)
            .put(`/api/products/${productId1}`)
            .set('x-auth-token', user2Token)
            .send({
                purchase_price: 100.00
            });
        
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual('Product not found or unauthorized');
    });
    
    it('should not update a product with no fields provided', async () => {
        const res = await request(app)
            .put(`/api/products/${productId1}`)
            .set('x-auth-token', user1Token)
            .send({}); // Empty body
        
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('No fields provided for update.');
    });
    
    // Create a product for user2 to test deletion for user2
    it('should create a product for user2', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('x-auth-token', user2Token)
            .send({
                name: 'Blender',
                category: 'Kitchen Appliance',
                purchase_date: '2024-02-01',
                model_number: 'BLEND-X',
                location_in_house: 'Kitchen'
            });
        expect(res.statusCode).toEqual(201);
        productId2 = res.body.product.id;
    });
    
    
    // Test Delete Product
    it('should delete a product for the owner', async () => {
        const res = await request(app)
            .delete(`/api/products/${productId1}`)
            .set('x-auth-token', user1Token);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Product deleted successfully');
        expect(res.body.id).toEqual(productId1);
        
        // Verify it's actually deleted
        const getRes = await request(app)
            .get(`/api/products/${productId1}`)
            .set('x-auth-token', user1Token);
        expect(getRes.statusCode).toEqual(404);
    });
    
    it('should not delete a product if not the owner', async () => {
        // User1 tries to delete user2's product
        const res = await request(app)
            .delete(`/api/products/${productId2}`)
            .set('x-auth-token', user1Token);
        
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual('Product not found or unauthorized');
        
        // Ensure user2's product still exists
        const getRes = await request(app)
            .get(`/api/products/${productId2}`)
            .set('x-auth-token', user2Token);
        expect(getRes.statusCode).toEqual(200);
    });
    
    it('should return 404 if trying to delete non-existent product', async () => {
        const nonExistentId = 99999;
        const res = await request(app)
            .delete(`/api/products/${nonExistentId}`)
            .set('x-auth-token', user1Token);
        
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual('Product not found or unauthorized');
    });
    
});