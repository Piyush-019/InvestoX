import React, { useEffect } from 'react';

const SignupRedirect = () => {
    useEffect(() => {
        // Redirect to dashboard signup page
        window.location.href = 'http://localhost:3001/signup';
    }, []);

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            flexDirection: 'column' 
        }}>
            <h2>Redirecting to InvestoX Dashboard...</h2>
            <p>Please wait while we redirect you to our signup page.</p>
        </div>
    );
};

export default SignupRedirect; 