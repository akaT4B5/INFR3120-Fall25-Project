//Backend server setup for Task Management Application
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

//Route files
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks'); 

const app = express();
const PORT = process.env.PORT || 5000;

// ------------------------------------------------------------------
// Fix: Prevent browser from caching protected pages
// ------------------------------------------------------------------
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});
// ------------------------------------------------------------------

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
const uri = process.env.MONGO_URI; 
mongoose.connect(uri)
    .then(() => console.log("MongoDB Connection Established"))
    .catch(err => console.log("MongoDB Connection Error:", err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes); 

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
