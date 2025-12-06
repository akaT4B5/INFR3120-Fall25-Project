const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI = process.env.GITHUB_REDIRECT_URI;
const JWT_SECRET = process.env.JWT_SECRET;

router.get("/login", (req, res) => {
    const redirectUrl =
        `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&scope=user:email`;

    res.redirect(redirectUrl);
});


router.get("/callback", async (req, res) => {
    const code = req.query.code;
    if (!code) return res.status(400).send("Missing authorization code");

    try {
        const tokenResponse = await axios.post(
            "https://github.com/login/oauth/access_token",
            {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code,
                redirect_uri: REDIRECT_URI,
            },
            { headers: { Accept: "application/json" } }
        );

        const accessToken = tokenResponse.data.access_token;

        const githubUser = await axios.get("https://api.github.com/user", {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const emailResponse = await axios.get("https://api.github.com/user/emails", {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const primaryEmail = emailResponse.data.find(e => e.primary)?.email || "";

        let user = await User.findOne({ githubId: githubUser.data.id });

        if (!user) {
            user = new User({
                email: primaryEmail,
                githubId: githubUser.data.id,
                profileImage: "uploads/default.png"
            });
            await user.save();
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

        res.redirect(`/login.html?token=${token}`);

    } catch (err) {
        console.error("GitHub OAuth Error:", err.response?.data || err);
        res.status(500).send("OAuth Error");
    }
});

module.exports = router;
