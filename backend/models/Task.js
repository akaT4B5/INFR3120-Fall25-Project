//This file defines the Task model for MongoDB using Mongoose
const mongoose = require('mongoose');

// Define the Task schema
const TaskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Links this task to the User model
        required: true // Each task must be associated with a user
    },
    subject: {
        type: String,
        required: true
    },
    taskName: {
        type: String,
        required: true
    },
    dueDate: {
        type: Date
    },
    description: {
        type: String
    }
}, { timestamps: true });
// Export the Task model
module.exports = mongoose.model('Task', TaskSchema);