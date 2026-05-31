// server.js / app.js
import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectToDatabase } from './config/db.js';
import { findByEmail, createUser, findById, findByUsername } from './models/userModel.js';

// Initialize dotenv
dotenv.config();

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); 
const PORT = process.env.PORT || 3000;

// ------------------------------------------------------------------
// Settings & Middleware
// ------------------------------------------------------------------

// Set EJS as view engine
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

// Make user available to all templates with normalized properties for the partial sidebars
app.use(async (req, res, next) => {
    try {
        if (req.session.userId) {
            const user = await findById(req.session.userId);
            if (user) {
                // Ensure role normalization matches what's stored in session if user document properties vary
                user.role = req.session.userRole; 
                
                // Unify email properties so templates don't break if schema uses .mail vs .email
                user.email = user.email || user.mail;
                
                res.locals.user = user;
            } else {
                res.locals.user = null;
            }
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
    res.render('index', { error: null }); 
});

// Login POST
app.post('/login', async (req, res) => {
    const email = req.body.email ? req.body.email.trim() : '';
    const password = req.body.password ? req.body.password.trim() : '';

    console.log("=== 🚀 Secure Multi-Collection Login Attempt ===");

    if (!email || !password) {
        return res.render('index', { error: 'Email and password are required.' });
    }

    try {
        // findByEmail searches across students, instructors, and admins collections
        const user = await findByEmail(email);

        if (!user) {
            console.log("❌ Login failed: Email not found in any user collection.");
            return res.render('index', { error: 'Invalid email or password.' });
        }

        // user.role is automatically attached by your model framework ('students', 'instructors', 'admins')
        console.log(`✅ User identified! Collection: [${user.role.toUpperCase()}]`);

        const databaseHash = (user.password_hash || user.hashed_password || '').trim();

        if (!databaseHash) {
            console.log("❌ Login failed: This user document is missing a password hash field.");
            return res.render('index', { error: 'Invalid email or password.' });
        }

        const isPasswordValid = await bcrypt.compare(password, databaseHash);
        console.log("Does the typed password match?", isPasswordValid ? "✅ YES!" : "❌ NO");

        if (!isPasswordValid) {
            return res.render('index', { error: 'Invalid email or password.' });
        }

        // Track their unique session data
        req.session.userId = user._id;
        req.session.userEmail = user.email || user.mail;
        req.session.userRole = user.role.toLowerCase(); // Stores 'students', 'instructors', or 'admins'

        console.log(`🎉 SUCCESS! Routing ${user.role} to their respective dashboard view...`);
        res.redirect('/dashboard');

    } catch (error) {
        console.error('Login error:', error);
        res.render('index', { error: 'Internal server error.' });
    }
});

// Central Dashboard Route (Acts as the router to specific layout files)
app.get('/dashboard', async (req, res) => {
    if (!req.session.userId || !req.session.userRole) return res.redirect('/');
    
    try {
        const user = res.locals.user;
        if (!user) {
            req.session.destroy();
            return res.redirect('/');
        }

        // Explicit structural evaluation across potential session role strings
        if (req.session.userRole === 'students') {
            return res.render('student-dashboard', { user });
        } else if (req.session.userRole === 'instructors') {
            return res.render('instructor-dashboard', { user });
        } else if (req.session.userRole === 'admins') {
            return res.render('admin-dashboard', { user });
        } else {
            console.error(`Unknown role caught in engine navigation: ${req.session.userRole}`);
            return res.redirect('/');
        }
        
    } catch (err) {
        console.error('Dashboard Engine Error:', err);
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

// Signup Form GET Route
app.get('/signup', (req, res) => {
    if (req.session.userId) return res.redirect('/dashboard');
    res.render('signup', { errors: {}, oldData: {} });
});

// Signup Submission POST Route
app.post('/signup', async (req, res) => {
    const errors = {};
    
    // Capture and trim all properties
    const fname = req.body.fname ? req.body.fname.trim() : '';
    const lname = req.body.lname ? req.body.lname.trim() : '';
    const email = req.body.email ? req.body.email.trim() : '';
    const university = req.body.university ? req.body.university.trim() : '';
    const major = req.body.major ? req.body.major.trim() : '';
    const username = req.body.username ? req.body.username.trim() : '';
    const password = req.body.password ? req.body.password : '';
    const confirmPassword = req.body.confirmPassword ? req.body.confirmPassword : '';
    
    // Read clean user input role safely
    const rawRole = req.body.role ? req.body.role.trim() : 'Student';
    const year = req.body.year ? req.body.year.trim() : '';

    const oldData = { fname, lname, email, university, major, username, role: rawRole, year };

    // --- FIELD VALIDATIONS ---
    if (!fname) errors.fname = "First name is required.";
    if (!lname) errors.lname = "Last name is required.";
    if (!email) errors.email = "Email address is required.";
    if (!username) errors.username = "Username creation is required.";
    if (!password) errors.password = "Password field cannot be empty.";
    if (password.length < 8) errors.password = "Password must be at least 8 characters long.";
    if (!confirmPassword) errors.confirmPassword = "Please confirm your password.";
    
    // Validate Academic Year strictly if the registrant is a Student
    if (rawRole === 'Student' && !year) {
        errors.year = "Students must supply an academic year tracking selection.";
    }

    // Verify confirmation password matches
    if (password && confirmPassword && password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match.";
    }

    try {
        // --- UNIQUE AVAILABILITY CHECKS ---
        if (email) {
            const emailExists = await findByEmail(email);
            if (emailExists) errors.email = "This email is already in use.";
        }

        if (username) {
            const usernameExists = await findByUsername(username);
            if (usernameExists) errors.username = "This username is already taken.";
        }

        // Fallback catch if an unauthorized user attempts an admin signup payload trick
        if (rawRole.toLowerCase() === 'admin' || rawRole.toLowerCase() === 'admins') {
            errors.role = "Admin accounts cannot be generated through this submission route.";
        }

        if (Object.keys(errors).length > 0) {
            return res.render('signup', { errors, oldData });
        }

        // --- ENCRYPTION AND SAVE PROCESS ---
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Map frontend role option strings to the exact MongoDB collection names
        const databaseCollectionTarget = (rawRole === 'Instructor') ? 'instructors' : 'students';

        // Prepare schema payload properties
        const newUserDocument = {
            name: `${fname} ${lname}`,
            username: username,
            hashed_password: hashedPassword,
            university: university,
            major: major,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Save structural data elements conditionally
        if (databaseCollectionTarget === 'instructors') {
            newUserDocument.mail = email; 
            newUserDocument.subject = "To Be Assigned"; 
        } else {
            newUserDocument.email = email;
            newUserDocument.academic_year = parseInt(year); 
        }

        // Save directly into your target architecture
        const savedAccount = await createUser(databaseCollectionTarget, newUserDocument);

        // Build active user session profile matching layout dependencies
        req.session.userId = savedAccount.id || savedAccount._id;
        req.session.userEmail = email;
        req.session.userRole = databaseCollectionTarget; // Exact match to 'students' or 'instructors'

        console.log(`🎉 Success! Registered new user inside collection [${databaseCollectionTarget}]`);
        res.redirect('/dashboard');

    } catch (err) {
        console.error('Account Creation Error Block:', err);
        errors.username = "Internal database error processing submission.";
        res.render('signup', { errors, oldData });
    }
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