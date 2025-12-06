const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        //Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        //Encrypt the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //Create and Save the new User
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            profileImage: "default.png" // <-- ADDED, comment stays correct
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        //Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        //Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        //generate token (ID)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                profileImage: user.profileImage || "default.png" // <-- ADDED, comment preserved above
            }
        });

    } catch (err) {
        // If any error occurs, catch and return server error
        res.status(500).json({ error: err.message });
    }
});

// Upload Profile Image
router.post('/upload-profile', upload.single("profile"), async (req, res) => {
    try {
        const userId = req.body.id;

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.profileImage = req.file.filename;
        await user.save();

        res.json({
            message: "Profile image updated",
            profileImage: req.file.filename
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- GITHUB OAUTH LOGIN ---
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login.html" }),
  (req, res) => {
      // send back JWT + user data
  }
);

// --- DISCORD OAUTH LOGIN ---
router.get("/discord", passport.authenticate("discord"));

router.get(
  "/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/login.html" }),
  (req, res) => {
      // send back JWT + user data
  }
);

module.exports = router;



// Export the router
module.exports = router;
