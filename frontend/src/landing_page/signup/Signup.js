import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Clear password error when user types in either password field
        if (name === 'password' || name === 'confirmPassword') {
            setPasswordError('');
        }
        
        // Clear general error
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Check if passwords match
        if (formData.password !== formData.confirmPassword) {
            setPasswordError('Passwords do not match');
            return; // Prevent form submission
        }
        
        try {
            setLoading(true);
            
            // Send registration data to backend
            const response = await axios.post('http://localhost:5000/register', {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            
            // Store token and user data in localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            // Redirect to dashboard with user data
            window.location.href = `http://localhost:3001?username=${response.data.user.username}`;
        } catch (error) {
            console.error('Registration error:', error);
            setError(error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (response) => {
        try {
            setLoading(true);
            
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
            localStorage.setItem('user', JSON.stringify(backendResponse.data.user));
            
            // Redirect to dashboard with user data
            window.location.href = `http://localhost:3001?username=${backendResponse.data.user.username}`;
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
        <div className="signup-container" style={{ paddingTop: '20px' }}>
            <h2>Sign Up for InvestoX</h2>
            {error && (
                <div className="error-message" style={{ color: 'red', fontSize: '14px', marginBottom: '15px' }}>
                    {error}
                </div>
            )}
            <form onSubmit={(e) => handleSubmit(e)}>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group" style={{ marginBottom: '15px' }}>
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
                <div className="form-group" style={{ marginBottom: '15px' }}>
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
                <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                    {passwordError && (
                        <div className="error-message" style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                            {passwordError}
                        </div>
                    )}
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Signing Up...' : 'Sign Up'}
                </button>
            </form>
            <div className="google-signup">
                <p>or</p>
                <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google Login Failed')}
                        text="signup_with"
                        className="google-btn"
                    />
                </GoogleOAuthProvider>
            </div>
        </div>
    );
};

export default Signup;
