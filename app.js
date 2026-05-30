// server.js
import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectToDatabase } from './config/db.js';
import { findByEmail, createUser, findById } from './models/userModel.js';




// Initialize dotenv
dotenv.config();

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); // Declared only ONCE
const PORT = process.env.PORT || 3000;

// ------------------------------------------------------------------
// Settings & Middleware
// ------------------------------------------------------------------

// Set EJS as view engine (Moved up for clarity)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // set true if using HTTPS
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// Make user available to all templates
app.use(async (req, res, next) => {
    try {
        if (req.session.userId) {
            const user = await findById(req.session.userId);
            res.locals.user = user;
        } else {
            res.locals.user = null;
        }
    } catch (error) {
        res.locals.user = null;
    }
    next();
});

// ------------------------------------------------------------------
// Routes
// ------------------------------------------------------------------

// Home page = login
app.get('/', (req, res) => {
    if (req.session.userId) return res.redirect('/dashboard');
    // Ensure your file in /views is named index.ejs
    res.render('index', { error: null }); 
});

// Login POST
// Login POST
// Login POST
app.post('/login', async (req, res) => {
    // FIX: Apply .trim() immediately to wipe out any accidental hidden spaces from the form fields
    const email = req.body.email ? req.body.email.trim() : '';
    const password = req.body.password ? req.body.password.trim() : '';

    console.log("=== 🚀 NEW LOGIN ATTEMPT ===");
    console.log("Form email received:", email);
    console.log("Form password received:", password);

    if (!email || !password) {
        return res.render('index', { error: 'Email and password are required.' });
    }

    try {
        const user = await findByEmail(email);
        console.log("User found in MongoDB:", user ? "YES" : "NO");

        if (!user) {
            console.log("❌ Login failed: No user matches that email in the database.");
            return res.render('index', { error: 'Invalid email or password.' });
        }

        // FIX: Extract the hash and apply .trim() to eliminate any hidden white spaces inside MongoDB Compass
        const databaseHash = (user.password_hash || user.hashed_password || '').trim();
        console.log("Database password hash found:", databaseHash ? "YES" : "NO");

        if (!databaseHash) {
            console.log("❌ Login failed: This user document has no password hash field at all!");
            return res.render('index', { error: 'Invalid email or password.' });
        }

        // Compare the clean, trimmed password with the clean, trimmed hash
        const isPasswordValid = await bcrypt.compare(password, databaseHash);
        console.log("Does the typed password match the hash?", isPasswordValid ? "✅ YES!" : "❌ NO");

        if (!isPasswordValid) {
            return res.render('index', { error: 'Invalid email or password.' });
        }

        req.session.userId = user._id;
        req.session.userEmail = user.email || user.mail; 
        
        console.log("🎉 SUCCESS! Redirecting user to dashboard...");
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        res.render('index', { error: 'Internal server error.' });
    }
});
// Dashboard (protected)
app.get('/dashboard', async (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    try {
        const user = await findById(req.session.userId);
        if (!user) {
            req.session.destroy();
            return res.redirect('/');
        }
        res.render('dashboard', { user });
    } catch (err) {
        res.redirect('/');
    }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error(err);
        res.redirect('/');
    });
});

// Signup form
app.get('/signup', (req, res) => {
    if (req.session.userId) return res.redirect('/signup');
    res.render('signup', { error: null });
});

// Signup POST
app.post('/signup', async (req, res) => {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
        return res.render('signup', { error: 'All fields are required.' });
    }

    try {
        const existing = await findByEmail(email);
        if (existing) {
            return res.render('signup', { error: 'Email already registered.' });
        }

        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const newUser = await createUser({
            email,
            password_hash,
            fullName,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        req.session.userId = newUser.id || newUser._id;
        req.session.userEmail = newUser.email;
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Signup error:', error);
        res.render('signup', { error: 'Failed to create account.' });
    }
});

// ------------------------------------------------------------------
// Start server
// ------------------------------------------------------------------
connectToDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
});
// Study Groups page
app.get('/studygroups', (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    res.render('studygroups', { user: res.locals.user });
});
// Notes & Files page
app.get('/notes-files', (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    res.render('notes&files', { user: res.locals.user });
});
