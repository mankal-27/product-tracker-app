// frontend/src/components/ProductList.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProductList = ({ authToken }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    
    // useEffect to fetch products when the component mounts or authToken changes
    useEffect(() => {
        // Ensure user is authenticated before attempting to fetch products
        if (!authToken) {
            navigate('/login');
            return;
        }
        
        const fetchProducts = async () => {
            try {
                // Make a GET request to the backend /api/products endpoint
                // Include the JWT token in the 'x-auth-token' header for authentication
                const res = await axios.get('http://localhost:5000/api/products', {
                    headers: {
                        'x-auth-token': authToken
                    }
                });
                setProducts(res.data.products); // Update state with fetched products
                setLoading(false); // Stop loading indicator
            } catch (err) {
                console.error('Error fetching products:', err.response?.data || err);
                setError(err.response?.data?.message || 'Failed to fetch products.'); // Set error message
                setLoading(false); // Stop loading indicator
                
                // If token is invalid or expired (e.g., 401 Unauthorized), force logout
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            }
        };
        
        fetchProducts(); // Call the fetch function
    }, [authToken, navigate]); // Dependencies: re-run effect if authToken or navigate changes
    
    // Handles product deletion
    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            try {
                // Make a DELETE request to the backend /api/products/:id endpoint
                await axios.delete(`http://localhost:5000/api/products/${productId}`, {
                    headers: {
                        'x-auth-token': authToken
                    }
                });
                // Filter out the deleted product from the state to update the UI
                setProducts(products.filter(product => product.id !== productId));
                alert('Product deleted successfully!'); // Provide feedback
            } catch (err) {
                console.error('Error deleting product:', err.response?.data || err);
                setError(err.response?.data?.message || 'Failed to delete product.');
                alert(`Error deleting product: ${err.response?.data?.message || 'Please try again.'}`);
            }
        }
    };
    
    if (loading) {
        return <div style={styles.container}><p>Loading products...</p></div>;
    }
    
    if (error) {
        return <div style={styles.container}><p style={styles.errorText}>Error: {error}</p></div>;
    }
    
    return (
        <div style={styles.container}>
            <h2>My Products</h2>
            {/* Button to navigate to the add new product form */}
            <button onClick={() => navigate('/products/add')} style={styles.addButton}>Add New Product</button>
            {products.length === 0 ? (
                <p>No products found. Add your first product!</p>
            ) : (
                <div style={styles.productList}>
                    {products.map(product => (
                        <div key={product.id} style={styles.productCard}>
                            <h3>{product.name} ({product.category})</h3>
                            <p><strong>Model:</strong> {product.model_number || 'N/A'}</p>
                            <p><strong>Purchase Date:</strong> {product.purchase_date ? new Date(product.purchase_date).toLocaleDateString() : 'N/A'}</p>
                            <p><strong>Price:</strong> ${product.purchase_price ? parseFloat(product.purchase_price).toFixed(2) : 'N/A'}</p>
                            <p><strong>Warranty Ends:</strong> {product.warranty_expiry_date ? new Date(product.warranty_expiry_date).toLocaleDateString() : 'N/A'}</p>
                            <p><strong>Location:</strong> {product.location_in_house || 'N/A'}</p>
                            <div style={styles.cardActions}>
                                <button
                                    onClick={() => navigate(`/products/edit/${product.id}`)}
                                    style={{ ...styles.actionButton, backgroundColor: '#ffc107' }} // Yellow for Edit
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    style={{ ...styles.actionButton, backgroundColor: '#dc3545' }} // Red for Delete
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => navigate(`/product/${product.id}/details`)} // Will go to product details page
                                    style={{ ...styles.actionButton, backgroundColor: '#007bff' }} // Blue for Details
                                >
                                    Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Basic inline styles for the component
const styles = {
    container: {
        maxWidth: '900px',
        margin: '50px auto',
        padding: '20px',
        border: '1px solid #eee',
        borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        backgroundColor: '#f9f9f9',
        textAlign: 'center',
    },
    addButton: {
        padding: '10px 20px',
        backgroundColor: '#28a745', // Green
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        marginBottom: '20px',
        transition: 'background-color 0.3s ease',
    },
    productList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', // Responsive grid
        gap: '20px',
        marginTop: '20px',
    },
    productCard: {
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'left',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    cardActions: {
        marginTop: '15px',
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end', // Align buttons to the right
    },
    actionButton: {
        padding: '8px 12px',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'background-color 0.3s ease',
    },
    errorText: {
        color: 'red',
        fontWeight: 'bold',
    }
};

export default ProductList;