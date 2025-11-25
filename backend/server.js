
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

//middleware setup
app.use(cors());
app.use(express.json());

// Find static files in the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
const uri = process.env.MONGO_URI; 
mongoose.connect(uri)
//Logs for troubleshooting
    .then(() => console.log("✅ MongoDB Connection Established"))
    .catch(err => console.log("❌ MongoDB Connection Error:", err));

//connecting routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes); 

//server hosted logs for troubleshooting
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});