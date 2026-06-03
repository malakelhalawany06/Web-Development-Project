import bcrypt from 'bcrypt';
import { connectToDatabase } from '../config/db.js';
import { sendWelcomeEmail } from '../utils/emailService.js';
import { findByEmail, findByUsername, createUser } from '../models/userModel.js';

// ==================================================================
// 1. REGISTRATION CONTROLLER HANDLER
// ==================================================================
export async function registerUser(req, res) {
    const errors = {};
    const fname = req.body.fname ? req.body.fname.trim() : '';
    const lname = req.body.lname ? req.body.lname.trim() : '';
    const email = req.body.email ? req.body.email.trim() : '';
    const university = req.body.university ? req.body.university.trim() : '';
    const major = req.body.major ? req.body.major.trim() : '';
    const username = req.body.username ? req.body.username.trim() : '';
    const password = req.body.password ? req.body.password : '';
    const confirmPassword = req.body.confirmPassword ? req.body.confirmPassword : '';
    const rawRole = req.body.role ? req.body.role.trim() : 'Student';
    const year = req.body.year ? req.body.year.trim() : '';
    const emailRegex=/^\w+([.-]?\w+)@\w+([.-]?\w+)(.\w{2,3})+$/;
    const oldData = { fname, lname, email, university, major, username, role: rawRole, year };
    const passRegex=/.{8,}/;
    
    if (!fname) errors.fname = "First name is required.";
    if (!lname) errors.lname = "Last name is required.";
    if (!email) errors.email = "Email address is required.";
    if(!emailRegex.test(email)) errors.email = "Please enter a valid email address.";
    if (!username) errors.username = "Username creation is required.";
    if (!password) errors.password = "Password field cannot be empty.";
    if (!passRegex.test(password)) errors.password = "Password must be at least 8 characters long.";
    if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";
    if (rawRole === 'Student' && !year) errors.year = "Students must supply an academic year.";
    if (rawRole.toLowerCase() === 'admin') errors.role = "Unauthorized operation.";

    try {
        if (email && await findByEmail(email)) errors.email = "This email is already in use.";
        if (username && await findByUsername(username)) errors.username = "This username is already taken.";

        if (Object.keys(errors).length > 0) return res.render('signup', { errors, oldData });

        const hashedPassword = await bcrypt.hash(password, 10);
        const databaseCollectionTarget = (rawRole === 'Instructor') ? 'instructors' : 'students';

        const newUserDocument = {
            name: `${fname} ${lname}`,
            username: username,
            hashed_password: hashedPassword,
            university: university,
            major: major,
            createdAt: new Date(),
            updatedAt: new Date(),
            profile_picture: '/images/default-avatar.png'
        };

        if (databaseCollectionTarget === 'instructors') {
            newUserDocument.mail = email; 
            newUserDocument.subject = "To Be Assigned"; 
        } else {
            newUserDocument.email = email;
            newUserDocument.academic_year = parseInt(year); 
        }

        const savedAccount = await createUser(databaseCollectionTarget, newUserDocument);

        // Establish session persistence tracking properties
        req.session.userId = savedAccount.id || savedAccount._id;
        req.session.userEmail = email;
        req.session.userRole = databaseCollectionTarget; 

        // 🌟 Trigger greeting email asynchronously without slowing down redirection load speed
        sendWelcomeEmail(email, `${fname} ${lname}`);

        res.redirect('/dashboard');
    } catch (err) {
        console.error('Account Creation Error Block:', err);
        res.render('signup', { errors: { username: "Database save transaction failed." }, oldData });
    }
}

// ==================================================================
// 2. LOGIN CONTROLLER HANDLER
// ==================================================================
export async function loginUser(req, res) {
    const email = req.body.email ? req.body.email.trim() : '';
    const password = req.body.password ? req.body.password.trim() : '';
    const emailRegex=/^\w+([.-]?\w+)@\w+([.-]?\w+)(.\w{2,3})+$/;

    console.log("=== 🚀 Secure Multi-Collection Login Attempt ===");

    if (!email || !password) {
        return res.render('index', { error: 'Email and password are required.' });
    }
    if(!emailRegex.test(email)){
        return res.render('index', { error: 'Please enter a valid email address.' });
    }
    try {
        // Step 1: Scan across students, instructors, and admins simultaneously
        const user = await findByEmail(email);

        if (!user) {
            console.log("❌ Login failed: Email not found in any user collection.");
            return res.render('index', { error: 'Invalid email or password.' });
        }

        console.log(`✅ User identified! Collection Target: [${user.role.toUpperCase()}]`);

        // Handle variations in key naming definitions inside older schemas
        const databaseHash = (user.password_hash || user.hashed_password || '').trim();

        if (!databaseHash) {
            console.log("❌ Login failed: This user document is missing a password hash field.");
            return res.render('index', { error: 'Invalid email or password.' });
        }

        // Step 2: Compare plain text submission against the database crypt text
        const isPasswordValid = await bcrypt.compare(password, databaseHash);
        console.log("Does the typed password match?", isPasswordValid ? "✅ YES!" : "❌ NO");

        if (!isPasswordValid) {
            return res.render('index', { error: 'Invalid email or password.' });
        }

        // Step 3: Success! Establish secure state cookie indicators
        req.session.userId = user._id;
        req.session.userEmail = user.email || user.mail;
        req.session.userRole = user.role.toLowerCase(); // Stores 'students', 'instructors', or 'admins'

        console.log(`🎉 SUCCESS! Routing ${user.role} to dashboard view...`);
        res.redirect('/dashboard');

    } catch (error) {
        console.error('Login engine runtime error:', error);
        res.render('index', { error: 'An internal server error occurred.' });
    }
}