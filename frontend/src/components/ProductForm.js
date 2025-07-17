// frontend/src/components/ProductForm.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom'; // useParams to get ID from URL

const ProductForm = ({ authToken }) => {
    const { id } = useParams(); // Get product ID from URL if editing (e.g., /products/edit/123)
    const navigate = useNavigate(); // Hook for navigation
    
    // State to hold form data, initialized with empty strings
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        purchase_date: '',
        purchase_price: '',
        warranty_expiry_date: '',
        model_number: '',
        serial_number: '',
        location_in_house: ''
    });
    const [message, setMessage] = useState(''); // State for success/error messages
    const [isEditing, setIsEditing] = useState(false); // Flag to determine add/edit mode
    const [loading, setLoading] = useState(true); // Loading state for fetching product data in edit mode
    
    // useEffect to fetch product data if 'id' is present (edit mode)
    useEffect(() => {
        // Ensure user is authenticated
        if (!authToken) {
            navigate('/login');
            return;
        }
        
        if (id) { // If an 'id' parameter exists in the URL, it's an edit operation
            setIsEditing(true); // Set edit mode to true
            const fetchProduct = async () => {
                try {
                    // Fetch product details from the backend using the ID
                    const res = await axios.get(`http://localhost:5000/api/products/${id}`, {
                        headers: { 'x-auth-token': authToken }
                    });
                    const product = res.data.product;
                    
                    // Populate the form data with existing product details
                    setFormData({
                        name: product.name || '',
                        category: product.category || '',
                        // Format dates to YYYY-MM-DD for input type="date"
                        purchase_date: product.purchase_date ? new Date(product.purchase_date).toISOString().split('T')[0] : '',
                        purchase_price: product.purchase_price || '',
                        warranty_expiry_date: product.warranty_expiry_date ? new Date(product.warranty_expiry_date).toISOString().split('T')[0] : '',
                        model_number: product.model_number || '',
                        serial_number: product.serial_number || '',
                        location_in_house: product.location_in_house || ''
                    });
                    setLoading(false); // Stop loading after data is fetched
                } catch (err) {
                    console.error('Error fetching product for edit:', err.response?.data || err);
                    setMessage(err.response?.data?.message || 'Failed to load product for editing.');
                    setLoading(false);
                    // Handle authentication or product not found errors
                    if (err.response?.status === 401) {
                        localStorage.removeItem('token');
                        navigate('/login');
                    } else if (err.response?.status === 404) {
                        setMessage('Product not found.');
                    }
                }
            };
            fetchProduct();
        } else {
            setLoading(false); // If no ID, it's a new product form, no initial loading needed
        }
    }, [id, authToken, navigate]); // Dependencies for useEffect
    
    // Handles changes to form input fields
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value }); // Update corresponding field in formData
    };
    
    // Handles form submission (add or update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                // If in edit mode, send a PUT request
                await axios.put(`http://localhost:5000/api/products/${id}`, formData, {
                    headers: { 'x-auth-token': authToken }
                });
                setMessage('Product updated successfully!');
            } else {
                // If in add mode, send a POST request
                await axios.post('http://localhost:5000/api/products', formData, {
                    headers: { 'x-auth-token': authToken }
                });
                setMessage('Product added successfully!');
            }
            // Redirect to the product list after a short delay for message display
            setTimeout(() => {
                navigate('/products');
            }, 1000);
        } catch (err) {
            console.error(err.response?.data || err);
            setMessage(err.response?.data?.message || 'Operation failed.'); // Display error
        }
    };
    
    if (loading) {
        return <div style={styles.container}><p>Loading product data...</p></div>;
    }
    
    return (
        <div style={styles.container}>
            <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Name:</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Category:</label>
                    <input type="text" name="category" value={formData.category} onChange={handleChange} required style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Purchase Date:</label>
                    <input type="date" name="purchase_date" value={formData.purchase_date} onChange={handleChange} style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Purchase Price:</label>
                    <input type="number" name="purchase_price" value={formData.purchase_price} onChange={handleChange} step="0.01" style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Warranty Expiry Date:</label>
                    <input type="date" name="warranty_expiry_date" value={formData.warranty_expiry_date} onChange={handleChange} style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Model Number:</label>
                    <input type="text" name="model_number" value={formData.model_number} onChange={handleChange} style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Serial Number:</label>
                    <input type="text" name="serial_number" value={formData.serial_number} onChange={handleChange} style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Location in House:</label>
                    <input type="text" name="location_in_house" value={formData.location_in_house} onChange={handleChange} style={styles.input} />
                </div>
                <button type="submit" style={styles.button}>{isEditing ? 'Update Product' : 'Add Product'}</button>
                {/* Button to cancel and go back to product list */}
                <button type="button" onClick={() => navigate('/products')} style={{ ...styles.button, backgroundColor: '#6c757d', marginLeft: '10px' }}>Cancel</button>
            </form>
            {message && <p style={styles.message}>{message}</p>}
        </div>
    );
};

// Basic inline styles for the component
const styles = {
    container: {
        maxWidth: '600px',
        margin: '50px auto',
        padding: '20px',
        border: '1px solid #eee',
        borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        backgroundColor: '#f9f9f9',
        textAlign: 'center',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        marginTop: '20px',
    },
    formGroup: {
        textAlign: 'left',
    },
    label: {
        marginBottom: '5px',
        display: 'block',
        fontWeight: 'bold',
        color: '#333',
    },
    input: {
        width: '100%',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        boxSizing: 'border-box',
        fontSize: '16px',
    },
    button: {
        padding: '12px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background-color 0.3s ease',
    },
    message: {
        marginTop: '15px',
        fontSize: '14px',
        color: '#28a745', // Green for success messages
    },
    errorText: {
        color: 'red',
        fontWeight: 'bold',
    }
};

export default ProductForm;