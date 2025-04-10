import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css'; // Reusing the same CSS
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import GeneralContext from './GeneralContext';

const Login = () => {
    const navigate = useNavigate();
    const { setUser } = useContext(GeneralContext);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Clear general error
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            
            // Clear any existing admin data to prevent conflicts
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminInfo');
            
            // Send login data to backend
            const response = await axios.post('http://localhost:5000/login', {
                email: formData.email,
                password: formData.password
            });
            
            // Store token and user data in localStorage
            localStorage.setItem('token', response.data.token);
            
            // Add isAdmin: false explicitly to prevent confusion
            const userData = {
                ...response.data.user,
                isAdmin: false // Explicitly set this user as not an admin
            };
            
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Update user context
            setUser(userData);
            
            // Navigate to dashboard
            navigate('/');
        } catch (error) {
            console.error('Login error:', error);
            setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (response) => {
        try {
            setLoading(true);
            
            // Clear any existing admin data to prevent conflicts
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminInfo');
            
            // Decode the credential to get user info
            const decoded = decodeJwtResponse(response.credential);
            
            // Send Google auth data to backend
            const backendResponse = await axios.post('http://localhost:5000/auth/google', {
                email: decoded.email,
                name: decoded.name,
                googleId: decoded.sub
            });
            
            // Store token and user data in localStorage
            localStorage.setItem('token', backendResponse.data.token);
            
            // Add isAdmin: false explicitly to prevent confusion
            const userData = {
                ...backendResponse.data.user,
                isAdmin: false // Explicitly set this user as not an admin
            };
            
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Update user context
            setUser(userData);
            
            // Navigate to dashboard
            navigate('/');
        } catch (error) {
            console.error('Google login error:', error);
            setError('Google login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    // Function to decode JWT token from Google
    const decodeJwtResponse = (token) => {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    };

    return (
        <div className="signup-container">
            <h2>Log In to Tan</h2>
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging In...' : 'Log In'}
                </button>
            </form>
            <div className="google-login">
                <p>or</p>
                <GoogleOAuthProvider clientId="75683887402-bsknno3j3ji80ras2sp00b9ndh1jhteo.apps.googleusercontent.com">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google Login Failed')}
                        className="google-btn"
                    />
                </GoogleOAuthProvider>
            </div>
            <div className="login-admin-link">
                <Link to="/admin/login">Admin Login</Link>
            </div>
            <div className="signup-link-text">
                <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
            </div>
        </div>
    );
};

export default Login; 