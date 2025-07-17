// frontend/src/components/Register.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    // State variables to hold form input values
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // State variable for displaying messages (success/error)
    const [message, setMessage] = useState('');
    // Hook for programmatic navigation
    const navigate = useNavigate();
    
    // Handles form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        try {
            // Send a POST request to your backend's register endpoint
            const res = await axios.post('http://localhost:5000/api/auth/register', { email, password });
            setMessage(res.data.message + '. Redirecting to login...'); // Display success message
            // After successful registration, redirect to the login page after a short delay
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            // Handle errors from the backend
            console.error(err.response?.data || err);
            setMessage(err.response?.data?.message || 'Registration failed.'); // Display error message
        }
    };
    
    return (
        <div style={styles.container}>
            <h2>Register</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} // Update email state on input change
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} // Update password state on input change
                        required
                        style={styles.input}
                    />
                </div>
                <button type="submit" style={styles.button}>Register</button>
            </form>
            {message && <p style={styles.message}>{message}</p>} {/* Display message if not empty */}
            <p>Already have an account? <a href="/login" style={styles.link}>Login here</a></p>
        </div>
    );
};

// Basic inline styles for the component (we'll refine these later)
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
        width: 'calc(100% - 20px)', // Adjust for padding
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        boxSizing: 'border-box', // Include padding in width
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
        color: 'green', // Default color for success messages
        fontSize: '14px',
    },
    link: {
        color: '#007bff',
        textDecoration: 'none',
    },
};

export default Register;