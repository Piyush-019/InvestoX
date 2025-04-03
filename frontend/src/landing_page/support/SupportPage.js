import React, { useState, useEffect } from "react";

import Hero from "./Hero";
import CreateTicket from "./CreateTicket";

function SupportPage() {
  const [showNotification, setShowNotification] = useState(true);

  useEffect(() => {
    // Automatically hide the notification after 10 seconds
    const timer = setTimeout(() => {
      setShowNotification(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showNotification && (
        <div 
          className="alert alert-info alert-dismissible fade show m-0" 
          role="alert"
          style={{ borderRadius: 0 }}
        >
          <i className="fa fa-info-circle me-2"></i>
          Welcome to InvestoX Support! We're currently in beta and actively improving our support system.
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setShowNotification(false)}
            aria-label="Close"
          ></button>
        </div>
      )}
      <Hero />
      <CreateTicket />
    </>
  );
}

export default SupportPage;
