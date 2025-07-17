import {  Link } from 'react-router-dom';


// Simple Home Component
const Home = () => (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Welcome to Product Tracker!</h1>
        <p>Your personal assistant for managing all your products.</p>
        <div style={{ marginTop: '20px' }}>
            <Link to="/register" style={{ marginRight: '10px', padding: '10px 20px', border: '1px solid #007bff', borderRadius: '5px', textDecoration: 'none', color: '#007bff' }}>Register</Link>
            <Link to="/login" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', textDecoration: 'none' }}>Login</Link>
        </div>
    </div>
);

export default Home;