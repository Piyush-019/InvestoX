import React, { useState } from 'react';
import axios from 'axios';
import './Signup.css';

const PhoneVerification = ({ onVerificationComplete, onBack, userData }) => {
    const [step, setStep] = useState(1); // 1: Enter phone, 2: Enter OTP
    const [countryCode, setCountryCode] = useState('+91'); // Default to India
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [serviceId, setServiceId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [tempToken, setTempToken] = useState('');

    const handlePhoneNumberChange = (e) => {
        setPhoneNumber(e.target.value);
        setError('');
    };

    const handleOtpChange = (e) => {
        setOtp(e.target.value);
        setError('');
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        
        if (!phoneNumber) {
            setError('Please enter a valid phone number');
            return;
        }
        
        try {
            setLoading(true);
            
            // Send OTP to the phone number with country code
            const fullPhoneNumber = `${countryCode}${phoneNumber}`;
            
            const response = await axios.post('http://localhost:5000/send-otp', {
                phoneNumber: fullPhoneNumber
            });
            
            if (response.data.success) {
                setServiceId(response.data.serviceId);
                setStep(2); // Move to OTP verification step
            } else {
                setError(response.data.message || 'Failed to send OTP');
            }
        } catch (error) {
            console.error('Send OTP error:', error);
            setError(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        
        if (!otp) {
            setError('Please enter the OTP');
            return;
        }
        
        try {
            setLoading(true);
            
            // Complete phone number with country code
            const fullPhoneNumber = `${countryCode}${phoneNumber}`;
            
            // Verify the OTP
            const response = await axios.post('http://localhost:5000/verify-otp', {
                phoneNumber: fullPhoneNumber,
                otp,
                serviceId
            });
            
            if (response.data.success) {
                // Store phone number for registration
                const storeResponse = await axios.post('http://localhost:5000/store-phone', {
                    phoneNumber: fullPhoneNumber,
                    username: userData.username,
                    email: userData.email
                });
                
                if (storeResponse.data.success) {
                    setTempToken(storeResponse.data.tempToken);
                    // Call the callback with phone number and temp token
                    onVerificationComplete(fullPhoneNumber, storeResponse.data.tempToken);
                } else {
                    setError('Failed to store phone number');
                }
            } else {
                setError(response.data.message || 'Invalid OTP');
            }
        } catch (error) {
            console.error('Verify OTP error:', error);
            setError(error.response?.data?.message || 'Failed to verify OTP');
        } finally {
            setLoading(false);
        }
    };

    const renderPhoneInput = () => (
        <div>
            <h2>Phone Verification</h2>
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
            <form onSubmit={handleSendOtp}>
                <div className="form-group">
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <div className="phone-input-container">
                        <div className="country-code-flag">
                            <div className="flag-icon">
                                <div className="flag-top">
                                    <div className="orange-band"></div>
                                    <div className="white-band"></div>
                                    <div className="green-band"></div>
                                </div>
                            </div>
                            <span className="country-code-text">+91</span>
                        </div>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={phoneNumber}
                            onChange={handlePhoneNumberChange}
                            placeholder="Enter your mobile number"
                            required
                            className="phone-number-input"
                        />
                    </div>
                </div>
                <div className="button-group">
                    <button type="button" onClick={onBack} className="back-button">
                        Back
                    </button>
                    <button type="submit" disabled={loading} className="primary-button">
                        {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                </div>
            </form>
        </div>
    );

    const renderOtpInput = () => (
        <div>
            <h2>Enter OTP</h2>
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
            <form onSubmit={handleVerifyOtp}>
                <div className="form-group">
                    <label htmlFor="otp">One-Time Password</label>
                    <input
                        type="text"
                        id="otp"
                        name="otp"
                        value={otp}
                        onChange={handleOtpChange}
                        placeholder="Enter OTP sent to your phone"
                        required
                    />
                </div>
                <div className="button-group">
                    <button type="button" onClick={() => setStep(1)} className="back-button">
                        Back
                    </button>
                    <button type="submit" disabled={loading} className="primary-button">
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                </div>
            </form>
        </div>
    );

    return (
        <div className="signup-container">
            {step === 1 ? renderPhoneInput() : renderOtpInput()}
        </div>
    );
};

export default PhoneVerification; 