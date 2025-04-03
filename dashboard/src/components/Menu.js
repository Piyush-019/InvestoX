import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import GeneralContext from "./GeneralContext";

const Menu = () => {
  const [selectedMenu, setSelectedMenu] = useState(0);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, setUser } = useContext(GeneralContext);
  const location = useLocation();
  const navigate = useNavigate();
  const profileDropdownRef = useRef(null);

  // Set active menu based on current location
  React.useEffect(() => {
    const path = location.pathname;
    if (path === '/') setSelectedMenu(0);
    else if (path === '/orders') setSelectedMenu(1);
    else if (path === '/holdings') setSelectedMenu(2);
    else if (path === '/positions') setSelectedMenu(3);
    else if (path === '/funds') setSelectedMenu(4);
  }, [location]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current && 
        !profileDropdownRef.current.contains(event.target) && 
        isProfileDropdownOpen
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  // Get first initial for avatar
  const getInitial = () => {
    if (user && user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return "U";
  };

  const handleMenuClick = (index) => {
    setSelectedMenu(index);
  };

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Update user context
    setUser(null);
    
    // Redirect to login page
    navigate('/login');
  };

  const menuClass = "menu";
  const activeMenuClass = "menu selected";

  return (
    <div className="menu-container">
      <img src="logo.png" alt="InvestoX Logo" style={{ width: "50px" }} />
      <div className="menus">
        <ul>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/"
              onClick={() => handleMenuClick(0)}
            >
              <p className={selectedMenu === 0 ? activeMenuClass : menuClass}>
                Dashboard
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/orders"
              onClick={() => handleMenuClick(1)}
            >
              <p className={selectedMenu === 1 ? activeMenuClass : menuClass}>
                Orders
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/holdings"
              onClick={() => handleMenuClick(2)}
            >
              <p className={selectedMenu === 2 ? activeMenuClass : menuClass}>
                Holdings
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/positions"
              onClick={() => handleMenuClick(3)}
            >
              <p className={selectedMenu === 3 ? activeMenuClass : menuClass}>
                Positions
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/funds"
              onClick={() => handleMenuClick(4)}
            >
              <p className={selectedMenu === 4 ? activeMenuClass : menuClass}>
                Funds
              </p>
            </Link>
          </li>
        </ul>
        <hr />
        {user ? (
          <div className="profile-section" ref={profileDropdownRef}>
            <div className="profile" onClick={handleProfileClick}>
              <div className="avatar">{getInitial()}</div>
              <p className="username">{user.username}</p>
            </div>
            {isProfileDropdownOpen && (
              <div className="profile-dropdown">
                <button onClick={handleLogout} className="logout-button">
                  Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" style={{ textDecoration: "none", marginRight: "10px" }}>
              <button className="login-button">Log In</button>
            </Link>
            <Link to="/signup" style={{ textDecoration: "none" }}>
              <button className="signup-button">Sign Up</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
