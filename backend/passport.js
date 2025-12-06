const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const DiscordStrategy = require("passport-discord").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/User");
const jwt = require("jsonwebtoken");

function generateToken(user) {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// ------------------- GITHUB STRATEGY -------------------
passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CALLBACK_URL
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value || `${profile.id}@github-oauth.fake`;

                let user = await User.findOne({ githubId: profile.id });

                if (!user) {
                    user = await User.create({
                        fullName: profile.username,
                        email: email,
                        githubId: profile.id,
                        authProvider: "github",
                        password: null,
                        profileImage: "default.png"
                    });
                }

                const token = generateToken(user);
                return done(null, { user, token });
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

// ------------------- DISCORD STRATEGY -------------------
passport.use(
    new DiscordStrategy(
        {
            clientID: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            callbackURL: process.env.DISCORD_CALLBACK_URL,
            scope: ["identify", "email"]
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.email || `${profile.id}@discord-oauth.fake`;

                let user = await User.findOne({ discordId: profile.id });

                if (!user) {
                    user = await User.create({
                        fullName: profile.username,
                        email: email,
                        discordId: profile.id,
                        authProvider: "discord",
                        password: null,
                        profileImage: "default.png"
                    });
                }

                const token = generateToken(user);
                return done(null, { user, token });
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

// ------------------- GOOGLE STRATEGY -------------------
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value || `${profile.id}@google-oauth.fake`;

                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    user = await User.create({
                        fullName: profile.displayName,
                        email: email,
                        googleId: profile.id,
                        authProvider: "google",
                        password: null,
                        profileImage: "default.png"
                    });
                }

                const token = generateToken(user);
                return done(null, { user, token });
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

// ------------------- REQUIRED FOR PASSPORT -------------------
passport.serializeUser((data, done) => {
    done(null, data);
});

passport.deserializeUser((data, done) => {
    done(null, data);
});

module.exports = passport;
