const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

router.get("/google", (req, res) => {
    const url = googleClient.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: ["profile", "email"]
    });
    res.redirect(url);
});

router.get("/google/callback", async (req, res) => {
    const { code } = req.query;

    try {
        const { tokens } = await googleClient.getToken(code);
        googleClient.setCredentials(tokens);

        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        const email = payload.email;
        const name = payload.name;
        const picture = payload.picture;

        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                name,
                email,
                profileImage: picture,
                authProvider: "google"
            });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        });

        res.redirect(
            `https://inf3120-fall25-project-ysd9.onrender.com/login.html?token=${token}`
        );

    } catch (err) {
        console.error(err);
        res.status(400).json({ message: "Google authentication failed" });
    }
});
