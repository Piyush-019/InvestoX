// Script to create stock holdings for the admin panel
const axios = require('axios');

// List of stocks from the image
const stocks = [
  {
    symbol: "BHARTIARTL",
    name: "Bharti Airtel Ltd.",
    price: 1324.50,
    dayChange: "+2.99%"
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd.",
    price: 1522.35,
    dayChange: "+0.11%"
  },
  {
    symbol: "HINDUNILVR",
    name: "Hindustan Unilever Ltd.",
    price: 2417.40,
    dayChange: "+0.21%"
  },
  {
    symbol: "ITC",
    name: "ITC Ltd.",
    price: 207.90,
    dayChange: "+0.80%"
  },
  {
    symbol: "SBIN",
    name: "State Bank of India",
    price: 430.20,
    dayChange: "-0.34%"
  },
  {
    symbol: "TATAPOWER",
    name: "Tata Power Co. Ltd.",
    price: 124.15,
    dayChange: "-0.24%"
  },
  {
    symbol: "EVEREADY",
    name: "Eveready Industries India Ltd.",
    price: 312.35,
    dayChange: "-1.24%"
  },
  {
    symbol: "JUBLFOOD",
    name: "Jubilant FoodWorks Ltd.",
    price: 3082.65,
    dayChange: "-1.35%"
  }
];

async function createStocks() {
  try {
    console.log('Creating stock holdings...');
    
    for (const stock of stocks) {
      try {
        // Create a holding for each stock
        const response = await axios.post('http://localhost:5000/createStockHolding', {
          name: stock.symbol,
          qty: 0,
          avg: stock.price,
          price: stock.price,
          day: stock.dayChange,
          net: "0.00%",
          isDemo: true
        });
        
        console.log(`Created ${stock.symbol} successfully`);
      } catch (error) {
        if (error.response && error.response.status === 400) {
          console.log(`Stock ${stock.symbol} may already exist`);
        } else {
          console.error(`Error creating ${stock.symbol}:`, error.message);
        }
      }
    }
    
    console.log('Stock creation completed');
  } catch (error) {
    console.error('Error in creating stocks:', error);
  }
}

// Execute the function
createStocks(); 