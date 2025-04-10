const { Schema } = require("mongoose");

const UserSchema = new Schema({
    username: String,
    email: String,
    password: String,
    googleId: String,
    phoneNumber: String,
    phoneVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = { UserSchema }; 