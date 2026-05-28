// server.js
import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectToDatabase } from './config/db.js';   // ← changed path
import { findByEmail, createUser, findById } from './models/userModel.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ------------------------------------------------------------------
// Middleware
// ------------------------------------------------------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,        // set true if using HTTPS
        maxAge: 1000 * 60 * 60 * 24   // 1 day
    }
}));

// Make user available to all templates
app.use(async (req, res, next) => {
    if (req.session.userId) {
        const user = await findById(req.session.userId);
        res.locals.user = user;
    } else {
        res.locals.user = null;
    }
    next();
});

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ------------------------------------------------------------------
// Routes
// ------------------------------------------------------------------

// Home page = login
app.get('/', (req, res) => {
    if (req.session.userId) return res.redirect('/dashboard');
    res.render('index', { error: null });
});

// Login POST
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('index', { error: 'Email and password are required.' });
    }

    try {
        const user = await findByEmail(email);
        if (!user) {
            return res.render('index', { error: 'Invalid email or password.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.render('index', { error: 'Invalid email or password.' });
        }

        req.session.userId = user._id;
        req.session.userEmail = user.email;
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        res.render('index', { error: 'Internal server error. Please try again later.' });
    }
});

// Dashboard (protected)
app.get('/dashboard', async (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    const user = await findById(req.session.userId);
    if (!user) {
        req.session.destroy();
        return res.redirect('/');
    }
    res.render('dashboard', { user });
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
    if (req.session.userId) return res.redirect('/dashboard');
    res.render('signup', { error: null });
});

// Signup POST (create user with hashed password)
app.post('/signup', async (req, res) => {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
        return res.render('signup', { error: 'All fields are required.' });
    }

    try {
        const existing = await findByEmail(email);
        if (existing) {
            return res.render('signup', { error: 'Email already registered. Please log in.' });
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

        req.session.userId = newUser.id;
        req.session.userEmail = newUser.email;
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Signup error:', error);
        res.render('signup', { error: 'Failed to create account. Please try again.' });
    }
});

// ------------------------------------------------------------------
// Start server
// ------------------------------------------------------------------
connectToDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
        console.log(`   Login page: http://localhost:${PORT}/`);
    });
}).catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
});