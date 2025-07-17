// frontend/src/components/Login.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setAuthToken }) => { // setAuthToken will be passed as a prop from App.js
    // State variables for form inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // State variable for messages
    const [message, setMessage] = useState('');
    // Hook for programmatic navigation
    const navigate = useNavigate();
    
    // Handles form submission for login
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send a POST request to your backend's login endpoint
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            setMessage(res.data.message + '. Redirecting to dashboard...'); // Success message
            // Store the received JWT token in localStorage for persistence
            localStorage.setItem('token', res.data.token);
            // Update the authentication token in the parent App.js component's state
            setAuthToken(res.data.token);
            // Redirect to a protected route (e.g., the product dashboard) after a short delay
            setTimeout(() => {
                navigate('/products'); // This route will be created in the next steps
            }, 1000);
        } catch (err) {
            // Handle errors
            console.error(err.response?.data || err);
            setMessage(err.response?.data?.message || 'Login failed.'); // Error message
        }
    };
    
    return (
        <div style={styles.container}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <button type="submit" style={styles.button}>Login</button>
            </form>
            {message && <p style={styles.message}>{message}</p>}
            <p>Don't have an account? <a href="/register" style={styles.link}>Register here</a></p>
        </div>
    );
};

// Basic inline styles for the component
const styles = {
    container: {
        maxWidth: '400px',
        margin: '50px auto',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        backgroundColor: '#fff',
        textAlign: 'center',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        marginBottom: '20px',
    },
    formGroup: {
        textAlign: 'left',
    },
    label: {
        marginBottom: '5px',
        display: 'block',
        fontWeight: 'bold',
    },
    input: {
        width: 'calc(100% - 20px)',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        boxSizing: 'border-box',
    },
    button: {
        padding: '10px 15px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    message: {
        marginTop: '15px',
        color: 'green',
        fontSize: '14px',
    },
    link: {
        color: '#007bff',
        textDecoration: 'none',
    },
};

export default Login;