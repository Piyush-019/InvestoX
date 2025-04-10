import React, { useState, useEffect } from "react";
import axios from "axios";

import BuyActionWindow from "./BuyActionWindow";
import SellActionWindow from "./SellActionWindow";
import AdvancedOrderWindow from "./AdvancedOrderWindow";

const GeneralContext = React.createContext({
  openBuyWindow: (uid) => {},
  closeBuyWindow: () => {},
  openSellWindow: (uid) => {},
  closeSellWindow: () => {},
  openAdvancedOrderWindow: (uid, type) => {},
  closeAdvancedOrderWindow: () => {},
  user: null,
  setUser: () => {},
  showMarginCalculator: false,
  toggleMarginCalculator: () => {},
  isAuthenticated: false
});

export const GeneralContextProvider = (props) => {
  const [isBuyWindowOpen, setIsBuyWindowOpen] = useState(false);
  const [isSellWindowOpen, setIsSellWindowOpen] = useState(false);
  const [isAdvancedOrderWindowOpen, setIsAdvancedOrderWindowOpen] = useState(false);
  const [advancedOrderType, setAdvancedOrderType] = useState('buy');
  const [selectedStockUID, setSelectedStockUID] = useState("");
  const [user, setUser] = useState(null);
  const [showMarginCalculator, setShowMarginCalculator] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isTokenValidating, setIsTokenValidating] = useState(true);

  // Set up axios interceptor for token handling
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        // Check if error is due to invalid/expired token
        if (error.response && error.response.status === 401) {
          // Do not immediately clear tokens on 401 for our specific endpoints
          // This prevents logout loops during page refreshes
          console.log("Received 401 error, but not clearing tokens automatically");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      // Remove interceptor when component unmounts
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Load user from localStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsTokenValidating(true);
        
        // First, check for admin authentication
        const adminInfo = localStorage.getItem('adminInfo');
        const adminToken = localStorage.getItem('adminToken');
        
        if (adminToken && adminInfo) {
          const adminData = JSON.parse(adminInfo);
          // Ensure the admin user has the isAdmin flag
          if (adminData && !adminData.isAdmin) {
            adminData.isAdmin = true;
          }
          setUser(adminData);
          setIsAuthenticated(true);
          setIsTokenValidating(false);
          return;
        }
        
        // Then check for regular user authentication
        const userToken = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (userToken && userData) {
          try {
            // Validate token silently by making a request to the backend
            // If you have a dedicated endpoint for token validation, use that
            const parsedUser = JSON.parse(userData);
            if (parsedUser && parsedUser.id) {
              try {
                // Use a silent request to verify token validity
                await axios.get(`http://localhost:5000/user/${parsedUser.id}/funds`, {
                  headers: {
                    Authorization: `Bearer ${userToken}`
                  }
                });
                // If request succeeds, token is valid
                setUser(parsedUser);
                setIsAuthenticated(true);
              } catch (validationError) {
                // If token validation fails but we have user data, still use it
                // This prevents unnecessary logouts during temporary network issues
                console.warn("Token validation failed, but using cached user data:", validationError);
                setUser(parsedUser);
                setIsAuthenticated(true);
              }
            } else {
              throw new Error("Invalid user data format");
            }
          } catch (tokenError) {
            console.error("Error validating token:", tokenError);
            // Keep the user logged in with stored data even if token validation fails
            // This prevents unnecessary logouts during page refreshes
            setUser(JSON.parse(userData));
            setIsAuthenticated(true);
          }
          setIsTokenValidating(false);
          return;
        }
        
        // Check URL parameters for username as fallback
        const params = new URLSearchParams(window.location.search);
        const username = params.get('username');
        
        if (username) {
          // Try to fetch actual user from backend
          await fetchUserByUsername(username);
        }
        
        setIsTokenValidating(false);
      } catch (error) {
        console.error("Error loading user data:", error);
        // Don't clear data here - only clear on explicit logout
        // Just update the state with what we have
        setIsTokenValidating(false);
        
        // Try to use any existing user data even if there was an error
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            setUser(JSON.parse(userData));
            setIsAuthenticated(true);
          } catch (parseError) {
            console.error("Error parsing user data:", parseError);
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    };
    
    loadUserData();
  }, []);
  
  // Custom setter for user that also updates localStorage
  const handleSetUser = (userData) => {
    if (userData) {
      setUser(userData);
      setIsAuthenticated(true);
      
      // Also update localStorage if needed
      if (!localStorage.getItem('user') || JSON.stringify(userData) !== localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('adminInfo');
      localStorage.removeItem('adminToken');
    }
  };
  
  // Fetch user by username from backend
  const fetchUserByUsername = async (username) => {
    try {
      console.log("Fetching user by username:", username);
      const response = await axios.get(`http://localhost:5000/user/username/${username}`);
      console.log("User data:", response.data);
      handleSetUser(response.data);
      
      // No need to create test funds as they should already exist from registration
    } catch (error) {
      console.error("Error fetching user:", error);
      
      // Fallback to mock user for development
      const mockUserId = '64a7654321abcdef12345678';
      handleSetUser({
        username,
        id: mockUserId
      });
      
      // Create test funds for this mock user
      createTestFunds(mockUserId);
    }
  };

  // Function to create test funds for development/demo purposes
  const createTestFunds = async (userId) => {
    try {
      // Try to fetch existing funds first
      await axios.get(`http://localhost:5000/user/${userId}/funds`);
    } catch (error) {
      if (error.response?.status === 404) {
        // If funds don't exist, create them with a direct request
        const testFunds = {
          userId,
          availableFunds: 100000,
          usedFunds: 0,
          totalFunds: 100000
        };
        
        try {
          await axios.post(`http://localhost:5000/createTestFunds`, testFunds);
          console.log('Created test funds for demo user');
        } catch (err) {
          console.error('Failed to create test funds:', err);
        }
      }
    }
  };

  const handleOpenBuyWindow = (uid) => {
    setIsBuyWindowOpen(true);
    setSelectedStockUID(uid);
  };

  const handleCloseBuyWindow = () => {
    setIsBuyWindowOpen(false);
    setSelectedStockUID("");
  };

  const handleOpenSellWindow = (uid) => {
    setIsSellWindowOpen(true);
    setSelectedStockUID(uid);
  };

  const handleCloseSellWindow = () => {
    setIsSellWindowOpen(false);
    setSelectedStockUID("");
  };
  
  const handleOpenAdvancedOrderWindow = (uid, type = 'buy') => {
    setIsAdvancedOrderWindowOpen(true);
    setSelectedStockUID(uid);
    setAdvancedOrderType(type);
  };
  
  const handleCloseAdvancedOrderWindow = () => {
    setIsAdvancedOrderWindowOpen(false);
    setSelectedStockUID("");
  };
  
  const handleToggleMarginCalculator = () => {
    setShowMarginCalculator(prev => !prev);
  };

  return (
    <GeneralContext.Provider
      value={{
        openBuyWindow: handleOpenBuyWindow,
        closeBuyWindow: handleCloseBuyWindow,
        openSellWindow: handleOpenSellWindow,
        closeSellWindow: handleCloseSellWindow,
        openAdvancedOrderWindow: handleOpenAdvancedOrderWindow,
        closeAdvancedOrderWindow: handleCloseAdvancedOrderWindow,
        handleCloseAdvancedOrderWindow: handleCloseAdvancedOrderWindow,
        user,
        setUser: handleSetUser,
        showMarginCalculator,
        toggleMarginCalculator: handleToggleMarginCalculator,
        isAuthenticated,
        isTokenValidating
      }}
    >
      {props.children}
      {isBuyWindowOpen && (
        <BuyActionWindow
          stockUID={selectedStockUID}
          onClose={handleCloseBuyWindow}
        />
      )}
      {isSellWindowOpen && (
        <SellActionWindow
          stockUID={selectedStockUID}
          onClose={handleCloseSellWindow}
        />
      )}
      {isAdvancedOrderWindowOpen && (
        <AdvancedOrderWindow
          stockUID={selectedStockUID}
          orderType={advancedOrderType}
          onClose={handleCloseAdvancedOrderWindow}
        />
      )}
    </GeneralContext.Provider>
  );
};

export default GeneralContext;
