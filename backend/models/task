const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Links this task to the User model
        required: true
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

module.exports = mongoose.model('Task', TaskSchema);