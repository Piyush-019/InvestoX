import React, { useContext, useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Dashboard from "./Dashboard";
import TopBar from "./TopBar";
import GeneralContext, { GeneralContextProvider } from "./GeneralContext";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";

const HomeContent = () => {
  const { user, isAuthenticated, isTokenValidating } = useContext(GeneralContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we have a token or adminToken in localStorage
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');
    const isAdminRoute = location.pathname.startsWith('/admin');
    
    // If we're refreshing the page and there's a token, we should wait for user context to load
    if ((token || adminToken) && isLoading) {
      // Wait for token validation to complete before making redirect decisions
      if (!isTokenValidating) {
        setIsLoading(false);
      }
      
      return;
    }
    
    // We're no longer in the initial loading state
    setIsLoading(false);
    
    // Check if on admin routes
    if (isAdminRoute) {
      // If admin route but no admin token, redirect to admin login
      if (!adminToken && location.pathname !== '/admin/login') {
        navigate('/admin/login');
      }
      // Otherwise allow admin routes with token
      return;
    }
    
    // For non-admin routes, handle normal user authentication
    // Only redirect if we're sure we're not in the initial loading state and not authenticated
    // Also allow routes that don't require authentication
    const publicRoutes = ['/signup', '/login'];
    if (!isLoading && !isTokenValidating && !isAuthenticated && !publicRoutes.includes(location.pathname)) {
      navigate('/login');
    }
  }, [user, isAuthenticated, navigate, location, isLoading, isTokenValidating]);

  // If still in loading state and we have a token, show a simple loading indicator
  if ((isLoading || isTokenValidating) && (localStorage.getItem('token') || localStorage.getItem('adminToken'))) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <>
      {/* Don't show TopBar for admin routes */}
      {!location.pathname.startsWith('/admin') && <TopBar />}
      
      <Routes>
        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        
        {/* Regular dashboard routes */}
        <Route path="/*" element={<Dashboard />} />
      </Routes>
    </>
  );
};

const Home = () => {
  return (
    <GeneralContextProvider>
      <HomeContent />
    </GeneralContextProvider>
  );
};

export default Home;
