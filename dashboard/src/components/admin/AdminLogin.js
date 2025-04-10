import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import GeneralContext from '../GeneralContext';
import axios from 'axios';
import './AdminStyles.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(GeneralContext);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Hardcoded credential check for the specific admin
    if (formData.email === 'piyushjain@gmail.com' && formData.password === '1234567890') {
      // Create admin user object
      const adminUser = {
        id: 'admin-special-id',
        username: 'Admin',
        email: formData.email,
        isAdmin: true
      };
      
      // Store admin info in localStorage
      localStorage.setItem('adminToken', 'admin-special-token');
      localStorage.setItem('adminInfo', JSON.stringify(adminUser));
      localStorage.setItem('user', JSON.stringify(adminUser)); // Store as regular user too for context
      
      // Update context
      setUser(adminUser);
      
      // Redirect to admin dashboard
      navigate('/admin');
      setLoading(false);
      return;
    }

    try {
      // Regular admin authentication flow using backend
      const response = await axios.post('http://localhost:5000/admin/login', formData);
      
      // Store admin token in localStorage
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminInfo', JSON.stringify(response.data.admin));
      localStorage.setItem('user', JSON.stringify({
        ...response.data.admin,
        isAdmin: true
      }));
      
      // Update context
      setUser({
        ...response.data.admin,
        isAdmin: true
      });
      
      // Redirect to admin dashboard
      navigate('/admin');
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <img src="/media/images/logo.png" alt="InvestoX Logo" />
          <h2>Admin Panel</h2>
        </div>
        
        {error && (
          <div className="admin-error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              required
            />
          </div>
          
          <div className="admin-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="admin-login-footer">
          <a href="/" className="admin-back-link">Return to Main Site</a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 