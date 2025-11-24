require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// 1. IMPORT ROUTES
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks'); 

const app = express();
const PORT = process.env.PORT || 5000;

// 2. MIDDLEWARE
app.use(cors());
app.use(express.json()); // Allows parsing JSON data from frontend

// 3. SERVE FRONTEND FILES (HTML, CSS, JS)
// This tells the server: "Look inside the 'public' folder for index.html"
app.use(express.static(path.join(__dirname, 'public')));

// 4. MONGODB CONNECTION
const uri = process.env.MONGO_URI; 
mongoose.connect(uri)
    .then(() => console.log("✅ MongoDB Connection Established"))
    .catch(err => console.log("❌ MongoDB Connection Error:", err));

// 5. CONNECT API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes); 

// 6. START SERVER
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});