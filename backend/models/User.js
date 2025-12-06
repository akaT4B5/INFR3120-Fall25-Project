//This file defines the User model for MongoDB using Mongoose
const mongoose = require('mongoose');

// Define the User schema
const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // No two users can have the same email
    },
    password: {
        type: String,
        required: false
    },
    profileImage: {
        type: String,
        default: "default.png" 
    },
    discordId: { type: String },
    githubId: { type: String },
    googleId: { type: String }, 
    authProvider: { type: String, default: "local" } 
}, { timestamps: true });

// Export the User model
module.exports = mongoose.model('User', UserSchema);
