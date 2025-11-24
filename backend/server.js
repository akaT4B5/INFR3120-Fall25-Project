require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- IMPORT ROUTES ---
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks'); // <--- 1. THIS LINE WAS LIKELY MISSING

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGO_URI; 
mongoose.connect(uri)
    .then(() => console.log("✅ MongoDB Connection Established"))
    .catch(err => console.log("❌ MongoDB Connection Error:", err));

// --- USE ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes); // <--- 2. THIS LINE WAS LIKELY MISSING

// Base Route
app.get('/', (req, res) => {
    res.send('Server is up and running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});