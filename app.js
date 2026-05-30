// server.js
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
// app.post('/login') inside app.js
app.post('/login', async (req, res) => {
    const email = req.body.email ? req.body.email.trim() : '';
    const password = req.body.password ? req.body.password.trim() : '';

    console.log("=== 🚀 Secure Multi-Collection Login Attempt ===");

    if (!email || !password) {
        return res.render('index', { error: 'Email and password are required.' });
    }

    try {
        // Call your newly updated findByEmail function!
        const user = await findByEmail(email);

        if (!user) {
            console.log("❌ Login failed: Email not found in any user collection.");
            return res.render('index', { error: 'Invalid email or password.' });
        }

        // user.role is automatically attached by your new model logic!
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
        req.session.userRole = user.role; // Stores 'students', 'instructors', or 'admins'

        console.log(`🎉 SUCCESS! Routing ${user.role} to their dashboard...`);
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

// 1. Updated Signup Form GET Route
app.get('/signup', (req, res) => {
    if (req.session.userId) return res.redirect('/dashboard');
    // Pass empty validation blocks initially so the page loads cleanly
    res.render('signup', { errors: {}, oldData: {} });
});

// 2. Updated Signup Submission POST Route
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
    const role = req.body.role ? req.body.role.trim() : 'Student';
    const year = req.body.year ? req.body.year.trim() : '';

    // Cache inputted items to re-populate forms if validation fails
    const oldData = { fname, lname, email, university, major, username, role, year };

    // --- FIELD VALIDATIONS ---
    if (!fname) errors.fname = "First name is required.";
    if (!lname) errors.lname = "Last name is required.";
    if (!email) errors.email = "Email address is required.";
    if (!username) errors.username = "Username creation is required.";
    if (!password) errors.password = "Password field cannot be empty.";
    if(password.length<8 )errors.password="Password must be at least 8 characters long.";
    if (!confirmPassword) errors.confirmPassword = "Please confirm your password.";
    
    // Validate Academic Year strictly if the registrant is a Student
    if (role === 'Student' && !year) {
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

        // If any error exists, bounce back immediately with specific messages
        if (Object.keys(errors).length > 0) {
            return res.render('signup', { errors, oldData });
        }

        // --- ENCRYPTION AND SAVE PROCESS ---
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Assign the correct MongoDB target collection destination 
        const databaseCollectionTarget = (role === 'Instructor') ? 'instructors' : 'students';

        // Prepare schema payload properties
        const newUserDocument = {
            name: `${fname} ${lname}`,
            username: username,
            // Match structural variations seamlessly across collection designs
            
            hashed_password: hashedPassword,
            university: university,
            major: major,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Save email field conditionally to balance collection requirements
        if (role === 'Instructor') {
            newUserDocument.mail = email; 
            newUserDocument.subject = "To Be Assigned"; // Field requested for instructors
        } else {
            newUserDocument.email = email;
            newUserDocument.year = parseInt(year); // Only save academic tracking to student
        }

        // Write directly to your separate collection architectures
        const savedAccount = await createUser(databaseCollectionTarget, newUserDocument);

        // Build active session profile
        req.session.userId = savedAccount.id || savedAccount._id;
        req.session.userEmail = email;
        req.session.userRole = databaseCollectionTarget; // Saves 'students' or 'instructors'

        console.log(`🎉 Success! Registered new ${role} successfully inside collection [${databaseCollectionTarget}]`);
        res.redirect('/dashboard');

    } catch (err) {
        console.error('Account Creation Error Block:', err);
        errors.username = "Internal database error processing submission.";
        res.render('signup', { errors, oldData });
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
