require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to parse JSON bodies from frontend

// MongoDB Connection
const uri = process.env.MONGO_URI; 
mongoose.connect(uri)
    .then(() => console.log("✅ MongoDB Connection Established"))
    .catch(err => console.log("❌ MongoDB Connection Error:", err));

// Basic Route to test server
app.get('/', (req, res) => {
    res.send('Server is up and running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});