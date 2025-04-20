require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const twilio = require("twilio");

const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");
const { UserModel } = require("./model/UserModel");
const { FundsModel } = require("./model/FundsModel");

const PORT = process.env.PORT;
const uri = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET ;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_VERIFY_SERVICE_ID = process.env.TWILIO_VERIFY_SERVICE_ID;

const app = express();
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(uri)
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// User registration
app.post("/register", async (req, res) => {
  try {
    const { username, email, password, phoneNumber, tempToken } = req.body;
    
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    // Verify phone if token is provided
    let phoneVerified = false;
    if (tempToken && phoneNumber) {
      try {
        const decoded = jwt.verify(tempToken, JWT_SECRET);
        if (decoded.verified && decoded.phoneNumber === phoneNumber) {
          phoneVerified = true;
        }
      } catch (error) {
        return res.status(401).json({ message: "Invalid phone verification token" });
      }
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
      phoneNumber: phoneVerified ? phoneNumber : undefined,
      phoneVerified
    });
    
    await newUser.save();
    
    // Create initial funds for the user
    const newFunds = new FundsModel({
      userId: newUser._id,
      availableFunds: 100000,
      usedFunds: 0,
      totalFunds: 100000
    });
    
    await newFunds.save();
    
    // Create token
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        phoneVerified: newUser.phoneVerified
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Google OAuth registration/login
app.post("/auth/google", async (req, res) => {
  try {
    const { email, name, googleId, phoneNumber, tempToken } = req.body;
    
    // Check if user exists
    let user = await UserModel.findOne({ email });
    let isNewUser = false;
    
    // Verify phone if token is provided
    let phoneVerified = false;
    if (tempToken && phoneNumber) {
      try {
        const decoded = jwt.verify(tempToken, JWT_SECRET);
        if (decoded.verified && decoded.phoneNumber === phoneNumber) {
          phoneVerified = true;
        }
      } catch (error) {
        return res.status(401).json({ message: "Invalid phone verification token" });
      }
    }
    
    if (!user) {
      // Create new user if doesn't exist
      user = new UserModel({
        username: name,
        email,
        googleId,
        phoneNumber: phoneVerified ? phoneNumber : undefined,
        phoneVerified
      });
      
      await user.save();
      isNewUser = true;
    } else if (phoneVerified && phoneNumber && !user.phoneVerified) {
      // Update existing user with verified phone
      user.phoneNumber = phoneNumber;
      user.phoneVerified = true;
      await user.save();
    }
    
    // Create initial funds for new users
    if (isNewUser) {
      const newFunds = new FundsModel({
        userId: user._id,
        availableFunds: 100000,
        usedFunds: 0,
        totalFunds: 100000
      });
      
      await newFunds.save();
    }
    
    // Create token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phoneVerified: user.phoneVerified
      }
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// User login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // Create token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phoneVerified: user.phoneVerified
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user funds
app.get("/user/:userId/funds", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const funds = await FundsModel.findOne({ userId });
    
    if (!funds) {
      return res.status(404).json({ message: "Funds not found for this user" });
    }
    
    res.json(funds);
  } catch (error) {
    console.error("Get funds error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create test funds (for development purposes only)
app.post("/createTestFunds", async (req, res) => {
  try {
    const { userId, availableFunds, usedFunds, totalFunds } = req.body;
    
    // Check if funds already exist
    const existingFunds = await FundsModel.findOne({ userId });
    
    if (existingFunds) {
      return res.status(400).json({ message: "Funds already exist for this user" });
    }
    
    // Create new funds
    const newFunds = new FundsModel({
      userId,
      availableFunds: availableFunds || 100000,
      usedFunds: usedFunds || 0,
      totalFunds: totalFunds || 100000
    });
    
    await newFunds.save();
    
    res.status(201).json(newFunds);
  } catch (error) {
    console.error("Create test funds error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user by username (for development/testing)
app.get("/user/username/:username", async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await UserModel.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      id: user._id,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Place order and update funds
app.post("/placeOrder", async (req, res) => {
  try {
    const { userId, name, qty, price, mode, product = "CNC", executeImmediately = true } = req.body;
    
    // Calculate order amount
    const orderAmount = qty * price;
    
    // Create new order
    const newOrder = new OrdersModel({
      userId,
      name,
      qty,
      price,
      mode,
      // If executeImmediately is true, mark the order as executed immediately
      status: executeImmediately ? 'executed' : 'open',
      executedAt: executeImmediately ? Date.now() : null
    });
    
    await newOrder.save();
    
    // Update user funds
    const userFunds = await FundsModel.findOne({ userId });
    
    if (!userFunds) {
      return res.status(404).json({ message: "User funds not found" });
    }
    
    // If buying, subtract funds, if selling, add funds
    if (mode === 'BUY') {
      // Check if user has enough funds
      if (userFunds.availableFunds < orderAmount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      
      userFunds.availableFunds -= orderAmount;
      userFunds.usedFunds += orderAmount;
      
      // If the order is being executed immediately, update holdings
      if (executeImmediately) {
        // Update holdings for buy order
        let holding = await HoldingsModel.findOne({ userId, name });
        
        if (holding) {
          // Update existing holding
          const totalQty = holding.qty + qty;
          const totalValue = (holding.avg * holding.qty) + (price * qty);
          const newAvgPrice = totalValue / totalQty;
          
          holding.qty = totalQty;
          holding.avg = newAvgPrice;
          holding.price = price; // Update current price
          holding.net = ((price - newAvgPrice) / newAvgPrice * 100).toFixed(2) + '%';
          holding.updatedAt = Date.now();
          
          await holding.save();
        } else {
          // Create new holding
          const newHolding = new HoldingsModel({
            userId,
            name,
            qty,
            avg: price,
            price,
            net: "0.00%",
            day: "+0.00%",
            isLoss: false
          });
          
          await newHolding.save();
        }
        
        // Update positions for buy order
        let position = await PositionsModel.findOne({ userId, name, product });
        
        if (position) {
          // Update existing position
          const totalQty = position.qty + qty;
          const totalValue = (position.avg * position.qty) + (price * qty);
          const newAvgPrice = totalValue / totalQty;
          
          position.qty = totalQty;
          position.avg = newAvgPrice;
          position.price = price; // Update current price
          position.net = ((price - newAvgPrice) / newAvgPrice * 100).toFixed(2) + '%';
          position.updatedAt = Date.now();
          
          await position.save();
        } else {
          // Create new position
          const newPosition = new PositionsModel({
            userId,
            product,
            name,
            qty,
            avg: price,
            price,
            net: "0.00%",
            day: "+0.00%",
            isLoss: false
          });
          
          await newPosition.save();
        }
      }
    } else if (mode === 'SELL') {
      // If the order is executed immediately, update holdings and funds
      if (executeImmediately) {
        userFunds.availableFunds += orderAmount;
        userFunds.usedFunds = Math.max(0, userFunds.usedFunds - orderAmount);
        
        // Update holdings for sell order
        let holding = await HoldingsModel.findOne({ userId, name });
        
        if (!holding) {
          return res.status(400).json({ message: "No holdings found for this stock" });
        }
        
        if (holding.qty < qty) {
          return res.status(400).json({ message: "Insufficient stock quantity to sell" });
        }
        
        // Update existing holding
        const remainingQty = holding.qty - qty;
        
        if (remainingQty > 0) {
          // Average price remains the same when selling
          holding.qty = remainingQty;
          holding.price = price; // Update current price
          holding.net = ((price - holding.avg) / holding.avg * 100).toFixed(2) + '%';
          holding.updatedAt = Date.now();
          
          await holding.save();
        } else {
          // Remove holding completely if all shares are sold
          await HoldingsModel.deleteOne({ _id: holding._id });
        }
        
        // Update positions for sell order
        let position = await PositionsModel.findOne({ userId, name, product });
        
        if (!position) {
          return res.status(400).json({ message: "No positions found for this stock" });
        }
        
        if (position.qty < qty) {
          return res.status(400).json({ message: "Insufficient position quantity to sell" });
        }
        
        // Update existing position
        const remainingPositionQty = position.qty - qty;
        
        if (remainingPositionQty > 0) {
          // Average price remains the same when selling
          position.qty = remainingPositionQty;
          position.price = price; // Update current price
          position.net = ((price - position.avg) / position.avg * 100).toFixed(2) + '%';
          position.updatedAt = Date.now();
          
          await position.save();
        } else {
          // Remove position completely if all shares are sold
          await PositionsModel.deleteOne({ _id: position._id });
        }
      }
    }
    
    userFunds.updatedAt = Date.now();
    await userFunds.save();
    
    res.status(201).json({ 
      message: executeImmediately ? "Order executed successfully" : "Order placed successfully",
      order: newOrder,
      updatedFunds: userFunds,
      status: newOrder.status
    });
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// app.get("/addHoldings", async (req, res) => {
//   let tempHoldings = [
//     {
//       name: "BHARTIARTL",
//       qty: 2,
//       avg: 538.05,
//       price: 541.15,
//       net: "+0.58%",
//       day: "+2.99%",
//     },
//     {
//       name: "HDFCBANK",
//       qty: 2,
//       avg: 1383.4,
//       price: 1522.35,
//       net: "+10.04%",
//       day: "+0.11%",
//     },
//     {
//       name: "HINDUNILVR",
//       qty: 1,
//       avg: 2335.85,
//       price: 2417.4,
//       net: "+3.49%",
//       day: "+0.21%",
//     },
//     {
//       name: "INFY",
//       qty: 1,
//       avg: 1350.5,
//       price: 1555.45,
//       net: "+15.18%",
//       day: "-1.60%",
//       isLoss: true,
//     },
//     {
//       name: "ITC",
//       qty: 5,
//       avg: 202.0,
//       price: 207.9,
//       net: "+2.92%",
//       day: "+0.80%",
//     },
//     {
//       name: "KPITTECH",
//       qty: 5,
//       avg: 250.3,
//       price: 266.45,
//       net: "+6.45%",
//       day: "+3.54%",
//     },
//     {
//       name: "M&M",
//       qty: 2,
//       avg: 809.9,
//       price: 779.8,
//       net: "-3.72%",
//       day: "-0.01%",
//       isLoss: true,
//     },
//     {
//       name: "RELIANCE",
//       qty: 1,
//       avg: 2193.7,
//       price: 2112.4,
//       net: "-3.71%",
//       day: "+1.44%",
//     },
//     {
//       name: "SBIN",
//       qty: 4,
//       avg: 324.35,
//       price: 430.2,
//       net: "+32.63%",
//       day: "-0.34%",
//       isLoss: true,
//     },
//     {
//       name: "SGBMAY29",
//       qty: 2,
//       avg: 4727.0,
//       price: 4719.0,
//       net: "-0.17%",
//       day: "+0.15%",
//     },
//     {
//       name: "TATAPOWER",
//       qty: 5,
//       avg: 104.2,
//       price: 124.15,
//       net: "+19.15%",
//       day: "-0.24%",
//       isLoss: true,
//     },
//     {
//       name: "TCS",
//       qty: 1,
//       avg: 3041.7,
//       price: 3194.8,
//       net: "+5.03%",
//       day: "-0.25%",
//       isLoss: true,
//     },
//     {
//       name: "WIPRO",
//       qty: 4,
//       avg: 489.3,
//       price: 577.75,
//       net: "+18.08%",
//       day: "+0.32%",
//     },
//   ];

//   tempHoldings.forEach((item) => {
//     let newHolding = new HoldingsModel({
//       name: item.name,
//       qty: item.qty,
//       avg: item.avg,
//       price: item.price,
//       net: item.day,
//       day: item.day,
//     });

//     newHolding.save();
//   });
//   res.send("Done!");
// });

// app.get("/addPositions", async (req, res) => {
//   let tempPositions = [
//     {
//       product: "CNC",
//       name: "EVEREADY",
//       qty: 2,
//       avg: 316.27,
//       price: 312.35,
//       net: "+0.58%",
//       day: "-1.24%",
//       isLoss: true,
//     },
//     {
//       product: "CNC",
//       name: "JUBLFOOD",
//       qty: 1,
//       avg: 3124.75,
//       price: 3082.65,
//       net: "+10.04%",
//       day: "-1.35%",
//       isLoss: true,
//     },
//   ];

//   tempPositions.forEach((item) => {
//     let newPosition = new PositionsModel({
//       product: item.product,
//       name: item.name,
//       qty: item.qty,
//       avg: item.avg,
//       price: item.price,
//       net: item.net,
//       day: item.day,
//       isLoss: item.isLoss,
//     });

//     newPosition.save();
//   });
//   res.send("Done!");
// });

app.get("/allHoldings", async (req, res) => {
  let allHoldings = await HoldingsModel.find({});
  res.json(allHoldings);
});

app.get("/allPositions", async (req, res) => {
  let allPositions = await PositionsModel.find({});
  res.json(allPositions);
});

app.post("/newOrder", async (req, res) => {
  try {
    const { userId, name, qty, price, mode } = req.body;
    
    if (!userId || !name || !qty || !price || !mode) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let newOrder = new OrdersModel({
      userId,
      name,
      qty,
      price,
      mode
    });

    await newOrder.save();
    res.status(201).json({ message: "Order saved successfully", order: newOrder });
  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).json({ message: "Failed to save order" });
  }
});

app.get("/allOrders", async (req, res) => {
  let allOrders = await OrdersModel.find({});
  res.json(allOrders);
});

// Get orders for a specific user
app.get("/user/:userId/orders", async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    const allOrders = await OrdersModel.find({ userId }).sort({ createdAt: -1 });
    
    // Separate the orders into open and executed
    const openOrders = allOrders.filter(order => order.status === 'open');
    const executedOrders = allOrders.filter(order => order.status === 'executed');
    
    res.json({
      open: openOrders,
      executed: executedOrders
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get holdings for a specific user
app.get("/user/:userId/holdings", async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    const holdings = await HoldingsModel.find({ userId }).sort({ createdAt: -1 });
    res.json(holdings);
  } catch (error) {
    console.error("Get user holdings error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get positions for a specific user
app.get("/user/:userId/positions", async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    const positions = await PositionsModel.find({ userId }).sort({ createdAt: -1 });
    res.json(positions);
  } catch (error) {
    console.error("Get user positions error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add holdings for a user
app.post("/user/:userId/holdings", async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, qty, avg, price, net, day, isLoss } = req.body;
    
    if (!userId || !name || !qty || !avg || !price) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    const newHolding = new HoldingsModel({
      userId,
      name,
      qty,
      avg,
      price,
      net: net || "+0.00%",
      day: day || "+0.00%",
      isLoss: isLoss || false
    });
    
    await newHolding.save();
    
    res.status(201).json({ message: "Holding added successfully", holding: newHolding });
  } catch (error) {
    console.error("Add holding error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add positions for a user
app.post("/user/:userId/positions", async (req, res) => {
  try {
    const { userId } = req.params;
    const { product, name, qty, avg, price, net, day, isLoss } = req.body;
    
    if (!userId || !product || !name || !qty || !avg || !price) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    const newPosition = new PositionsModel({
      userId,
      product,
      name,
      qty,
      avg,
      price,
      net: net || "+0.00%",
      day: day || "+0.00%",
      isLoss: isLoss || false
    });
    
    await newPosition.save();
    
    res.status(201).json({ message: "Position added successfully", position: newPosition });
  } catch (error) {
    console.error("Add position error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Send OTP for phone verification
app.post("/send-otp", async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }
    
    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number format. Use international format with + sign." });
    }
    
    // Send verification code via Twilio
    try {
      await twilioClient.verify.v2.services(TWILIO_VERIFY_SERVICE_ID)
        .verifications
        .create({ to: phoneNumber, channel: 'sms' });
      
      res.json({ message: "OTP sent successfully" });
    } catch (twilioError) {
      console.error("Twilio send error:", twilioError);
      
      // Provide better error messages based on Twilio error codes
      if (twilioError.code === 60200) {
        return res.status(400).json({ message: "Invalid phone number" });
      } else if (twilioError.code === 60203) {
        return res.status(400).json({ message: "Max send attempts reached. Try again later." });
      } else if (twilioError.code === 60212) {
        return res.status(400).json({ message: "Phone number is unverified" });
      }
      
      res.status(400).json({ message: "Failed to send verification code" });
    }
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Verify OTP
app.post("/verify-otp", async (req, res) => {
  try {
    const { phoneNumber, otpCode } = req.body;
    
    if (!phoneNumber || !otpCode) {
      return res.status(400).json({ message: "Phone number and OTP code are required" });
    }
    
    // Verify the code
    try {
      const verification_check = await twilioClient.verify.v2.services(TWILIO_VERIFY_SERVICE_ID)
        .verificationChecks
        .create({ to: phoneNumber, code: otpCode });
      
      if (verification_check.status === 'approved') {
        // Generate a temporary token
        const tempToken = jwt.sign(
          { phoneNumber, verified: true },
          JWT_SECRET,
          { expiresIn: "15m" }
        );
        
        res.json({ 
          message: "Phone verified successfully", 
          verified: true,
          tempToken 
        });
      } else {
        res.status(400).json({ message: "Invalid OTP code" });
      }
    } catch (twilioError) {
      console.error("Twilio verification error:", twilioError);
      
      // Provide better error messages based on Twilio error codes
      if (twilioError.code === 20404) {
        return res.status(400).json({ message: "Invalid verification code" });
      } else if (twilioError.code === 60202) {
        return res.status(400).json({ message: "Maximum verification attempts reached" });
      } else if (twilioError.code === 60203) {
        return res.status(400).json({ message: "Verification code has expired" });
      }
      
      res.status(400).json({ message: "Failed to verify code" });
    }
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Store phone number
app.post("/store-phone", async (req, res) => {
  try {
    const { userId, phoneNumber, tempToken } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }
    
    if (!tempToken) {
      return res.status(400).json({ message: "Verification token is required" });
    }
    
    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }
    
    // Verify the temp token
    try {
      const decoded = jwt.verify(tempToken, JWT_SECRET);
      
      if (!decoded.verified || decoded.phoneNumber !== phoneNumber) {
        return res.status(401).json({ message: "Invalid or mismatched verification token" });
      }
      
      // If userId is provided, update the user record
      if (userId) {
        const user = await UserModel.findById(userId);
        
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        // Check if another user already has this phone
        const existingUserWithPhone = await UserModel.findOne({ 
          phoneNumber, 
          _id: { $ne: userId } 
        });
        
        if (existingUserWithPhone) {
          return res.status(400).json({ 
            message: "This phone number is already registered with another account" 
          });
        }
        
        user.phoneNumber = phoneNumber;
        user.phoneVerified = true;
        await user.save();
      }
      
      // Return a new temp token for registration completion
      const newTempToken = jwt.sign(
        { phoneNumber, verified: true },
        JWT_SECRET,
        { expiresIn: "30m" }
      );
      
      res.json({ 
        message: "Phone number stored successfully", 
        tempToken: newTempToken 
      });
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } catch (error) {
    console.error("Store phone error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user phone
app.post("/user/update-phone", async (req, res) => {
  try {
    const { userId, phoneNumber, tempToken } = req.body;
    
    if (!userId || !phoneNumber || !tempToken) {
      return res.status(400).json({ message: "User ID, phone number, and token are required" });
    }
    
    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }
    
    // Verify the temp token
    try {
      const decoded = jwt.verify(tempToken, JWT_SECRET);
      
      if (!decoded.verified || decoded.phoneNumber !== phoneNumber) {
        return res.status(401).json({ message: "Invalid or mismatched verification token" });
      }
      
      // Update user record
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if another user already has this phone
      const existingUserWithPhone = await UserModel.findOne({ 
        phoneNumber, 
        _id: { $ne: userId } 
      });
      
      if (existingUserWithPhone) {
        return res.status(400).json({ 
          message: "This phone number is already registered with another account" 
        });
      }
      
      user.phoneNumber = phoneNumber;
      user.phoneVerified = true;
      await user.save();
      
      res.json({ 
        message: "Phone updated successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phoneVerified: user.phoneVerified
        }
      });
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } catch (error) {
    console.error("Update phone error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update stock price across the system
app.post("/updateStockPrice", async (req, res) => {
  try {
    const { symbol, name, price, dayChange } = req.body;
    
    if (!symbol || !price) {
      return res.status(400).json({ message: "Stock symbol and price are required" });
    }
    
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ message: "Price must be a positive number" });
    }
    
    console.log(`Updating stock price for ${symbol} to ${price} with day change ${dayChange}`);
    
    // First update holdings - this affects user portfolios
    const holdingsUpdateResult = await HoldingsModel.updateMany(
      { name: symbol },
      { 
        $set: { 
          price: price,
          day: dayChange,
          updatedAt: new Date()
        }
      }
    );
    
    console.log(`Updated ${holdingsUpdateResult.modifiedCount} holdings`);
    
    // Then update positions
    const positionsUpdateResult = await PositionsModel.updateMany(
      { name: symbol },
      { 
        $set: { 
          price: price,
          day: dayChange,
          updatedAt: new Date()
        }
      }
    );
    
    console.log(`Updated ${positionsUpdateResult.modifiedCount} positions`);
    
    // For each holding, recalculate the net percentage
    const holdings = await HoldingsModel.find({ name: symbol });
    
    for (const holding of holdings) {
      const percentChange = ((price - holding.avg) / holding.avg * 100).toFixed(2);
      const isLoss = percentChange < 0;
      
      holding.net = (percentChange >= 0 ? '+' : '') + percentChange + '%';
      holding.isLoss = isLoss;
      
      await holding.save();
    }
    
    // For each position, recalculate the net percentage
    const positions = await PositionsModel.find({ name: symbol });
    
    for (const position of positions) {
      const percentChange = ((price - position.avg) / position.avg * 100).toFixed(2);
      const isLoss = percentChange < 0;
      
      position.net = (percentChange >= 0 ? '+' : '') + percentChange + '%';
      position.isLoss = isLoss;
      
      await position.save();
    }
    
    res.json({ 
      message: "Stock price updated successfully",
      symbol,
      newPrice: price,
      dayChange,
      holdingsUpdated: holdingsUpdateResult.modifiedCount,
      positionsUpdated: positionsUpdateResult.modifiedCount
    });
  } catch (error) {
    console.error("Update stock price error:", error);
    res.status(500).json({ message: "Failed to update stock price" });
  }
});

// Create a stock holding (used by admin)
app.post("/createStockHolding", async (req, res) => {
  try {
    const { name, qty = 0, avg, price, day, net, isDemo = true } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({ message: "Stock name and price are required" });
    }
    
    // Create a mock holding for this stock for display purposes
    const newHolding = new HoldingsModel({
      name,
      qty: qty || 0,
      avg: avg || price,
      price,
      day: day || "+0.00%",
      net: net || "0.00%",
      isDemo: isDemo || false
    });
    
    await newHolding.save();
    
    res.status(201).json({ 
      message: "Stock holding created successfully", 
      holding: newHolding
    });
  } catch (error) {
    console.error("Create stock holding error:", error);
    res.status(500).json({ message: "Failed to create stock holding" });
  }
});

// Get stock price
app.get("/stock/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({ message: "Stock symbol is required" });
    }
    
    // Try to find the stock in holdings
    const holding = await HoldingsModel.findOne({ name: symbol });
    
    if (holding) {
      return res.json({
        symbol: holding.name,
        name: holding.name,
        price: holding.price,
        dayChange: holding.day || "+0.00%",
        updatedAt: holding.updatedAt || new Date()
      });
    }
    
    // If not in holdings, try positions
    const position = await PositionsModel.findOne({ name: symbol });
    
    if (position) {
      return res.json({
        symbol: position.name,
        name: position.name,
        price: position.price,
        dayChange: position.day || "+0.00%",
        updatedAt: position.updatedAt || new Date()
      });
    }
    
    // If not found, return error
    return res.status(404).json({ message: "Stock not found" });
  } catch (error) {
    console.error("Get stock error:", error);
    res.status(500).json({ message: "Failed to fetch stock" });
  }
});

// Get all stocks
app.get("/api/stocks", async (req, res) => {
  try {
    // Get unique stock names from holdings
    const holdings = await HoldingsModel.find({});
    const uniqueStockMap = new Map();
    
    // Process holdings to get unique stock info
    holdings.forEach(holding => {
      if (!uniqueStockMap.has(holding.name)) {
        uniqueStockMap.set(holding.name, {
          symbol: holding.name,
          name: holding.name,
          price: holding.price,
          dayChange: holding.day || "+0.00%",
          updatedAt: holding.updatedAt || new Date()
        });
      }
    });
    
    // Get positions for any stocks not in holdings
    const positions = await PositionsModel.find({});
    
    positions.forEach(position => {
      if (!uniqueStockMap.has(position.name)) {
        uniqueStockMap.set(position.name, {
          symbol: position.name,
          name: position.name,
          price: position.price,
          dayChange: position.day || "+0.00%",
          updatedAt: position.updatedAt || new Date()
        });
      }
    });
    
    // Convert map to array
    const stocks = Array.from(uniqueStockMap.values());
    
    res.json(stocks);
  } catch (error) {
    console.error("Get stocks error:", error);
    res.status(500).json({ message: "Failed to fetch stocks" });
  }
});

app.post("/updateLocalData", async (req, res) => {
  try {
    const { symbol, price, dayChange } = req.body;
    
    if (!symbol || !price) {
      return res.status(400).json({ message: "Stock symbol and price are required" });
    }
    
    // Update the local watchlist data
    const watchlistData = require('./data/watchlistData');
    const stockIndex = watchlistData.findIndex(stock => stock.name === symbol);
    
    if (stockIndex !== -1) {
      watchlistData[stockIndex].price = price;
      watchlistData[stockIndex].percent = dayChange;
      watchlistData[stockIndex].isDown = dayChange.startsWith('-');
    }
    
    res.json({ 
      message: "Local data updated successfully",
      symbol,
      newPrice: price,
      dayChange
    });
  } catch (error) {
    console.error("Update local data error:", error);
    res.status(500).json({ message: "Failed to update local data" });
  }
});

// Get watchlist data for dashboard
app.get("/stock/watchlist", async (req, res) => {
  try {
    // Get the static watchlist data from file
    const watchlistData = require('./data/watchlistData');
    
    // Try to get latest stock prices from database
    try {
      // Get unique stock names from holdings for latest prices
      const holdings = await HoldingsModel.find({});
      const positions = await PositionsModel.find({});
      
      // Create a map of stock symbols to latest prices
      const latestPrices = new Map();
      
      // Process holdings to get latest prices
      holdings.forEach(holding => {
        latestPrices.set(holding.name, {
          price: holding.price,
          day: holding.day,
          isDown: holding.day && holding.day.startsWith('-')
        });
      });
      
      // Process positions for any stocks not in holdings
      positions.forEach(position => {
        if (!latestPrices.has(position.name)) {
          latestPrices.set(position.name, {
            price: position.price,
            day: position.day,
            isDown: position.day && position.day.startsWith('-')
          });
        }
      });
      
      // Update the static watchlist data with latest prices
      const updatedWatchlist = watchlistData.map(stock => {
        if (latestPrices.has(stock.name)) {
          const latestData = latestPrices.get(stock.name);
          return {
            ...stock,
            price: latestData.price,
            percent: latestData.day || stock.percent,
            isDown: latestData.isDown
          };
        }
        return stock;
      });
      
      // Return the updated watchlist data
      return res.json(updatedWatchlist);
    } catch (dbError) {
      console.error("Error fetching latest prices from DB:", dbError);
      // Return the static watchlist if DB fetch fails
      return res.json(watchlistData);
    }
  } catch (error) {
    console.error("Get watchlist error:", error);
    res.status(500).json({ message: "Failed to fetch watchlist data" });
  }
});

// Get real-time watchlist data with timestamp
app.get("/api/watchlist/realtime", async (req, res) => {
  try {
    // Get the watchlist data
    const watchlistData = require('./data/watchlistData');
    
    // Get unique stock names from holdings for latest prices
    const holdings = await HoldingsModel.find({});
    const positions = await PositionsModel.find({});
    
    // Create a map of stock symbols to latest prices
    const latestPrices = new Map();
    
    // Process holdings to get latest prices
    holdings.forEach(holding => {
      latestPrices.set(holding.name, {
        price: holding.price,
        day: holding.day,
        isDown: holding.day && holding.day.startsWith('-'),
        updatedAt: holding.updatedAt || new Date()
      });
    });
    
    // Process positions for any stocks not in holdings
    positions.forEach(position => {
      if (!latestPrices.has(position.name)) {
        latestPrices.set(position.name, {
          price: position.price,
          day: position.day,
          isDown: position.day && position.day.startsWith('-'),
          updatedAt: position.updatedAt || new Date()
        });
      }
    });
    
    // Update the watchlist data with latest prices
    const realtimeWatchlist = watchlistData.map(stock => {
      if (latestPrices.has(stock.name)) {
        const latestData = latestPrices.get(stock.name);
        return {
          ...stock,
          price: latestData.price,
          percent: latestData.day || stock.percent,
          isDown: latestData.isDown,
          updatedAt: latestData.updatedAt
        };
      }
      return {
        ...stock,
        updatedAt: new Date()
      };
    });
    
    // Return the real-time watchlist data with timestamp
    return res.json({
      data: realtimeWatchlist,
      timestamp: new Date()
    });
  } catch (error) {
    console.error("Get real-time watchlist error:", error);
    res.status(500).json({ message: "Failed to fetch real-time watchlist data" });
  }
});

app.listen(PORT, () => {
  console.log("App started!");
  console.log("DB started!");
});