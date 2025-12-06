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
        required: true
    },
    profileImage: {
        type: String,
        default: "uploads/default.png"
    },
    discordId: { type: String }
}, { timestamps: true });
// Export the User model
module.exports = mongoose.model('User', UserSchema);