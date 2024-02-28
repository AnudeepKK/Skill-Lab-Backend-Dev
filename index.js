require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const authRoutes = require("./routes/authRoutes");
const foodRoutes = require("./routes/foodRoutes");
const orderRoutes = require("./routes/orderRoutes");
const User = require("./models/user");
const logoutRoutes = require("./logout/logout")

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;

// Check MongoDB connection
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Passport.js for Google authentication
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!profile || !profile.emails || !profile.emails[0]) {
          // Check if necessary profile information is undefined
          return done(null, false, {
            message: "Incomplete profile information",
          });
        }

        // Check if user already exists in the database
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          console.log("Its saved");
          return done(null, user);
        } else {
          // If the user doesn't exist, create a new user
          user = new User({
            googleId: profile.id,
            displayName: profile.displayName || "Default Name",
            email: profile.emails[0].value || "Default Email",
            // Add other properties as needed
          });
          console.log("Its saved");
          await user.save();
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialization and Deserialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Express session middleware
app.use(
  session({
    secret: "ddndnsjdnjd",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api", authRoutes);
app.use("/api", foodRoutes);
app.use("/api", orderRoutes);
app.use("/api", logoutRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});