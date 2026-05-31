import express from 'express';
import bcrypt from 'bcrypt';
import { findByEmail, findByUsername, createUser } from '../models/userModel.js';

const router = express.Router();

// POST Route: Login
router.post('/login', async (req, res) => {
    const email = req.body.email ? req.body.email.trim() : '';
    const password = req.body.password ? req.body.password.trim() : '';

    if (!email || !password) {
        return res.render('index', { error: 'Email and password are required.' });
    }
    try {
        const user = await findByEmail(email);
        if (!user) return res.render('index', { error: 'Invalid email or password.' });

        const databaseHash = (user.password_hash || user.hashed_password || '').trim();
        if (!databaseHash) return res.render('index', { error: 'Invalid email or password.' });

        const isPasswordValid = await bcrypt.compare(password, databaseHash);
        if (!isPasswordValid) return res.render('index', { error: 'Invalid email or password.' });

        req.session.userId = user._id;
        req.session.userEmail = user.email || user.mail;
        req.session.userRole = user.role.toLowerCase(); 

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        res.render('index', { error: 'Internal server error.' });
    }
});

// POST Route: Signup Submission
router.post('/signup', async (req, res) => {
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

    const oldData = { fname, lname, email, university, major, username, role: rawRole, year };

    if (!fname) errors.fname = "First name is required.";
    if (!lname) errors.lname = "Last name is required.";
    if (!email) errors.email = "Email address is required.";
    if (!username) errors.username = "Username creation is required.";
    if (!password) errors.password = "Password field cannot be empty.";
    if (password.length < 8) errors.password = "Password must be at least 8 characters long.";
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

        req.session.userId = savedAccount.id || savedAccount._id;
        req.session.userEmail = email;
        req.session.userRole = databaseCollectionTarget; 

        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.render('signup', { errors: { username: "Database save transaction failed." }, oldData });
    }
});

// GET Route: Logout Action
router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

export default router;