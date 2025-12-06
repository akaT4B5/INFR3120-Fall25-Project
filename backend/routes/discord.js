const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const JWT_SECRET = process.env.JWT_SECRET;

router.get("/login", (req, res) => {
    const redirectUrl =
        `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}` +
        `&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&scope=identify%20email`;

    res.redirect(redirectUrl);
});

router.get("/callback", async (req, res) => {
    const code = req.query.code;

    if (!code) return res.status(400).send("Missing authorization code");

    try {
        const tokenResponse = await axios.post(
            "https://discord.com/api/oauth2/token",
            new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: "authorization_code",
                code,
                redirect_uri: REDIRECT_URI,
            }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        const accessToken = tokenResponse.data.access_token;

        const userResponse = await axios.get("https://discord.com/api/users/@me", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const discordUser = userResponse.data;

        let user = await User.findOne({ discordId: discordUser.id });

        if (!user) {
            user = new User({
                email: discordUser.email || "",
                discordId: discordUser.id,
                profileImage: "uploads/default.png"
            });
            await user.save();
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
        res.redirect(`/login.html?token=${token}`);

    } catch (err) {
        console.error(err.response?.data || err);
        res.status(500).send("OAuth Error");
    }
});

module.exports = router;
