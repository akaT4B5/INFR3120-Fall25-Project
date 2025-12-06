const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const passport = require("passport");
const upload = require("../middleware/upload");

// --------------------------- REGISTER ---------------------------
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            profileImage: "default.png"
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --------------------------- LOGIN ---------------------------
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                profileImage: user.profileImage || "default.png"
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --------------------------- UPLOAD PROFILE ---------------------------
router.post('/upload-profile', upload.single("profile"), async (req, res) => {
    try {
        const { id } = req.body;

        if (!req.file)
            return res.status(400).json({ message: "No file uploaded" });

        const user = await User.findById(id);
        if (!user)
            return res.status(404).json({ message: "User not found" });

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

// --------------------------- GITHUB OAUTH ---------------------------
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get("/github/callback",
    passport.authenticate("github", { failureRedirect: "/login.html" }),
    (req, res) => {
        const token = req.user.token;
        res.redirect(`/login.html?token=${token}`);
    }
);

// --------------------------- DISCORD OAUTH ---------------------------
router.get("/discord", passport.authenticate("discord"));

router.get("/discord/callback",
    passport.authenticate("discord", { failureRedirect: "/login.html" }),
    (req, res) => {
        const token = req.user.token;
        res.redirect(`/login.html?token=${token}`);
    }
);

// --------------------------- GOOGLE OAUTH ---------------------------
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback",
    passport.authenticate("google", { failureRedirect: "/login.html" }),
    (req, res) => {
        const token = req.user.token;
        res.redirect(`/login.html?token=${token}`);
    }
);

module.exports = router;
