import express from 'express';
// Import the unified login and registration functions from your controller folder
import { registerUser, loginUser } from '../controllers/userController.js';

const router = express.Router();

// ==========================================
// AUTHENTICATION ROUTE HANDLERS
// ==========================================

// POST Route: Login processing handed off to userController
router.post('/login', loginUser);

// POST Route: Signup processing and welcome email generation handed off to userController
router.post('/signup', registerUser);

// GET Route: Logout Action
router.get('/logout', (req, res) => {
    // Destroys the cookie tracking state and redirects to the login screen landing page
    req.session.destroy((err) => {
        if (err) console.error('Session destruction error:', err);
        res.redirect('/');
    });
});

export default router;