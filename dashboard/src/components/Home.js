import React, { useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Dashboard from "./Dashboard";
import TopBar from "./TopBar";
import GeneralContext, { GeneralContextProvider } from "./GeneralContext";

const HomeContent = () => {
  const { user } = useContext(GeneralContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user is not logged in and not on signup or login page, redirect to login
    if (!user && location.pathname !== '/signup' && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [user, navigate, location]);

  return (
    <>
      <TopBar />
      <Dashboard />
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
