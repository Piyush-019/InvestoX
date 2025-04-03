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
  openStockChart: (uid) => {},
  closeStockChart: () => {},
  openMarketDepth: (uid) => {},
  closeMarketDepth: () => {},
  user: null,
  setUser: () => {},
  activeSymbol: null,
  showChart: false,
  showMarketDepth: false,
  showMarginCalculator: false,
  toggleMarginCalculator: () => {},
});

export const GeneralContextProvider = (props) => {
  const [isBuyWindowOpen, setIsBuyWindowOpen] = useState(false);
  const [isSellWindowOpen, setIsSellWindowOpen] = useState(false);
  const [isAdvancedOrderWindowOpen, setIsAdvancedOrderWindowOpen] = useState(false);
  const [advancedOrderType, setAdvancedOrderType] = useState('buy');
  const [selectedStockUID, setSelectedStockUID] = useState("");
  const [user, setUser] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const [showMarketDepth, setShowMarketDepth] = useState(false);
  const [showMarginCalculator, setShowMarginCalculator] = useState(false);
  const [activeSymbol, setActiveSymbol] = useState(null);

  useEffect(() => {
    // Get user data from localStorage or URL parameters
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Check URL parameters for username
      const params = new URLSearchParams(window.location.search);
      const username = params.get('username');
      
      if (username) {
        // First try to get the actual user from the backend
        fetchUserByUsername(username);
      }
    }
  }, []);
  
  // Fetch user by username from backend
  const fetchUserByUsername = async (username) => {
    try {
      console.log("Fetching user by username:", username);
      const response = await axios.get(`http://localhost:5000/user/username/${username}`);
      console.log("User data:", response.data);
      setUser(response.data);
      
      // No need to create test funds as they should already exist from registration
    } catch (error) {
      console.error("Error fetching user:", error);
      
      // Fallback to mock user for development
      const mockUserId = '64a7654321abcdef12345678';
      setUser({
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
  
  const handleOpenStockChart = (uid) => {
    setActiveSymbol(uid);
    setShowChart(true);
  };
  
  const handleCloseStockChart = () => {
    setShowChart(false);
  };
  
  const handleOpenMarketDepth = (uid) => {
    setActiveSymbol(uid);
    setShowMarketDepth(true);
  };
  
  const handleCloseMarketDepth = () => {
    setShowMarketDepth(false);
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
        openStockChart: handleOpenStockChart,
        closeStockChart: handleCloseStockChart,
        openMarketDepth: handleOpenMarketDepth,
        closeMarketDepth: handleCloseMarketDepth,
        user,
        setUser,
        activeSymbol,
        showChart,
        showMarketDepth,
        showMarginCalculator,
        toggleMarginCalculator: handleToggleMarginCalculator,
      }}
    >
      {props.children}
      {isBuyWindowOpen && <BuyActionWindow uid={selectedStockUID} />}
      {isSellWindowOpen && <SellActionWindow uid={selectedStockUID} />}
      {isAdvancedOrderWindowOpen && <AdvancedOrderWindow uid={selectedStockUID} type={advancedOrderType} />}
    </GeneralContext.Provider>
  );
};

export default GeneralContext;
