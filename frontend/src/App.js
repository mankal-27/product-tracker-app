// frontend/src/App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import ProductList from './components/ProductList'; // Import ProductList component
import ProductForm from './components/ProductForm';   // Import ProductForm component
import Home from './components/Home';
import './App.css';


// Protected Route Wrapper Component:
// This component ensures that its children (the actual page content) are only rendered
// if an authToken is present. Otherwise, it redirects to the login page.
const ProtectedRoute = ({ children, authToken }) => {
    const navigate = useNavigate();
    
    useEffect(() => {
        // If no authToken is found, redirect to the login page
        if (!authToken) {
            navigate('/login');
        }
    }, [authToken, navigate]); // Dependencies: re-run this effect if authToken or navigate changes
    
    // Only render the children components if authToken exists
    return authToken ? children : null; // If not authenticated, render null (will be redirected by useEffect)
};


function App() {
    // State to manage the authentication token, initialized from localStorage for persistence
    const [authToken, setAuthToken] = useState(localStorage.getItem('token'));
    
    // useEffect to listen for changes in localStorage 'token' (e.g., manual deletion)
    // and update the component's state accordingly.
    useEffect(() => {
        const handleStorageChange = () => {
            setAuthToken(localStorage.getItem('token'));
        };
        window.addEventListener('storage', handleStorageChange); // Add event listener
        return () => window.removeEventListener('storage', handleStorageChange); // Clean up on unmount
    }, []);
    
    // Logout handler
    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove the JWT token from localStorage
        setAuthToken(null); // Clear the token from React state
        window.location.reload(); // Force a full page reload to reset the application state
    };
    
    return (
        <Router>
            {/* Navigation Bar */}
            <nav style={styles.navbar}>
                <Link to="/" style={styles.navLink}>Home</Link>
                {!authToken ? ( // Show Register/Login links if user is not authenticated
                    <>
                        <Link to="/register" style={styles.navLink}>Register</Link>
                        <Link to="/login" style={styles.navLink}>Login</Link>
                    </>
                ) : ( // Show Products/Logout links if user is authenticated
                    <>
                        <Link to="/products" style={styles.navLink}>Products</Link> {/* Link to ProductList */}
                        <button
                            onClick={handleLogout}
                            style={styles.logoutButton}
                        >
                            Logout
                        </button>
                    </>
                )}
            </nav>
            
            {/* Route Definitions */}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login setAuthToken={setAuthToken} />} />
                
                {/* Protected Route for Product List */}
                <Route
                    path="/products"
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <ProductList authToken={authToken} /> {/* Render ProductList if authenticated */}
                        </ProtectedRoute>
                    }
                />
                {/* Protected Route for Adding New Product */}
                <Route
                    path="/products/add"
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <ProductForm authToken={authToken} /> {/* Render ProductForm for adding */}
                        </ProtectedRoute>
                    }
                />
                {/* Protected Route for Editing an Existing Product */}
                <Route
                    path="/products/edit/:id" // :id is a URL parameter for the product ID
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <ProductForm authToken={authToken} /> {/* Render ProductForm for editing */}
                        </ProtectedRoute>
                    }
                />
                {/* Placeholder for Product Details - we'll implement this in the next step */}
                {/* <Route path="/product/:id/details" element={<ProtectedRoute authToken={authToken}><ProductDetails authToken={authToken} /></ProtectedRoute>} /> */}
            </Routes>
        </Router>
    );
}

// Basic inline styles for the navbar
const styles = {
    navbar: {
        display: 'flex',
        justifyContent: 'center',
        padding: '15px 20px',
        backgroundColor: '#333',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    navLink: {
        color: 'white',
        textDecoration: 'none',
        padding: '8px 15px',
        margin: '0 10px',
        borderRadius: '4px',
        transition: 'background-color 0.3s ease',
    },
    logoutButton: {
        background: 'none',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        padding: '8px 15px',
        margin: '0 10px',
        borderRadius: '4px',
        transition: 'background-color 0.3s ease',
        fontSize: '16px',
    }
};

export default App;