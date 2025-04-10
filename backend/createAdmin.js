require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { AdminModel } = require("./model/AdminModel");

const uri = process.env.MONGO_URL;

// Admin credentials with the requested values
const adminEmail = "piyushjain@gmail.com";
const adminPassword = "1234567890";
const adminUsername = "Admin";

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(uri);
    console.log('Connected to MongoDB successfully');

    // Check if admin already exists
    const existingAdmin = await AdminModel.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create new admin
    const newAdmin = new AdminModel({
      username: adminUsername,
      email: adminEmail,
      password: hashedPassword,
      isAdmin: true
    });

    await newAdmin.save();
    
    console.log('Admin user created successfully');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser(); 