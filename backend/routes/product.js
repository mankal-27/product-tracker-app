// backend/routes/product.js

const express = require("express");
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');// Our authentication middleware

// --- Create a New Product ---
router.post('/', authMiddleware, async (req, res) => {
    const { name, category, purchase_date, purchase_price, warranty_expiry_date, model_number, serial_number, location_in_house } = req.body;
    const user_id = req.user.id; // Get user ID from authenticated request
    
    // Basic Validation
    if(!name || !category){
        return res.status(400).json({ message: 'Product name and category are required.' });
    }
    
    try {
        const newProduct = await pool.query(
            `INSERT INTO products (user_id, name, category,purchase_date, purchase_price, warranty_expiry_date, model_number, serial_number, location_in_house)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`, // RETURNING * to get the newly created row
            [user_id, name, category, purchase_date, purchase_price, warranty_expiry_date, model_number, serial_number, location_in_house]
        );
        
        res.status(201).json({
            message: 'Product added successfully.',
            product: newProduct.rows[0]
        })
    }catch (err) {
        console.error('Error adding product:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- GET all Product for the Authenticated User ---
router.get('/', authMiddleware, async (req, res) => {
    const user_id = req.user.id; // Get user ID from authenticated request
    
    try{
        const products = await pool.query(
            'SELECT * FROM products WHERE user_id = $1 ORDER BY created_at DESC',
            [user_id]
        );
        
        res.status(200).json({
            message: 'Products Fetched successfully.',
            products: products.rows
        });
    }catch (err) {
        console.error('Error Fetching product:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Get a single Product by ID ---
router.get('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params; // Product ID from URL parameter
    const user_id = req.user.id; // USER Id from authencticated request
    
    try{
        const product = await pool.query(
            'SELECT * FROM products WHERE id=$1 AND user_id=$2',
            [id, user_id]
        );
        
        if(product.rows.length === 0){
            return res.status(404).json({ message: 'Product not found or unauthorized' });
        }
        
        res.status(200).json({
            message: 'Product fetched successfully.',
            product: product.rows[0]
        })
    }catch (err) {
        console.error('Error fetching product by ID:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Update a Product by ID ---
router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params; // Product ID from URL parameter
    const user_id = req.user.id; // User ID from authenticated request
    const { name, category, purchase_date, purchase_price, warranty_expiry_date, model_number, serial_number, location_in_house } = req.body;
    
    // Build the SET clause dynamically to allow partial updates
    const updates = [];
    const values = [user_id, id]; // user_id and id are always the last values for WHERE clause
    
    let queryIndex = 3; // Start index for dynamic values
    
    if (name !== undefined) { updates.push(`name = $${queryIndex++}`); values.push(name); }
    if (category !== undefined) { updates.push(`category = $${queryIndex++}`); values.push(category); }
    if (purchase_date !== undefined) { updates.push(`purchase_date = $${queryIndex++}`); values.push(purchase_date); }
    if (purchase_price !== undefined) { updates.push(`purchase_price = $${queryIndex++}`); values.push(purchase_price); }
    if (warranty_expiry_date !== undefined) { updates.push(`warranty_expiry_date = $${queryIndex++}`); values.push(warranty_expiry_date); }
    if (model_number !== undefined) { updates.push(`model_number = $${queryIndex++}`); values.push(model_number); }
    if (serial_number !== undefined) { updates.push(`serial_number = $${queryIndex++}`); values.push(serial_number); }
    if (location_in_house !== undefined) { updates.push(`location_in_house = $${queryIndex++}`); values.push(location_in_house); }
    
    if (updates.length === 0) {
        return res.status(400).json({ message: 'No fields provided for update.' });
    }
    
    try {
        const updatedProduct = await pool.query(
            `UPDATE products SET ${updates.join(', ')} WHERE user_id = $1 AND id = $2 RETURNING *`,
            [...values] // Spread dynamic values first, then user_id and id
        );
        
        if (updatedProduct.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found or unauthorized' });
        }
        
        res.status(200).json({
            message: 'Product updated successfully',
            product: updatedProduct.rows[0]
        });
        
    } catch (err) {
        console.error('Error updating product:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Delete a Product by ID ---
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params; // Product ID from URL parameter
    const user_id = req.user.id; // User ID from authenticated request
    
    try {
        const deletedProduct = await pool.query(
            'DELETE FROM products WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, user_id]
        );
        
        if (deletedProduct.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found or unauthorized' });
        }
        
        res.status(200).json({ message: 'Product deleted successfully', id: deletedProduct.rows[0].id });
        
    } catch (err) {
        console.error('Error deleting product:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;











