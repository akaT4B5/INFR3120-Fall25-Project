const express = require("express");
const passport = require("passport");
const router = express.Router();

// ---------- GitHub ----------
router.get("/github",
    passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
    "/github/callback",
    passport.authenticate("github", { failureRedirect: "/login.html" }),
    (req, res) => {
        const token = req.user.token;
        res.redirect(`/login.html?token=${token}`);
    }
);

// ---------- Discord ----------
router.get("/discord",
    passport.authenticate("discord", { scope: ["identify", "email"] })
);

router.get(
    "/discord/callback",
    passport.authenticate("discord", { failureRedirect: "/login.html" }),
    (req, res) => {
        const token = req.user.token;
        res.redirect(`/login.html?token=${token}`);
    }
);

// ---------- Google ----------
router.get("/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login.html" }),
    (req, res) => {
        const token = req.user.token;
        res.redirect(`/login.html?token=${token}`);
    }
);

module.exports = router;
