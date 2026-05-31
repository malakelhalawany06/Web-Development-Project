import express from 'express';

const router = express.Router();

// Middleware checking loop verifying active secure login states
const requireLogin = (req, res, next) => {
    if (!req.session.userId) return res.redirect('/');
    next();
};

// GET Route: Welcome / Login landing point
router.get('/', (req, res) => {
    if (req.session.userId) return res.redirect('/dashboard');
    res.render('index', { error: null }); 
});

// GET Route: Signup Layout page
router.get('/signup', (req, res) => {
    if (req.session.userId) return res.redirect('/dashboard');
    res.render('signup', { errors: {}, oldData: {} });
});

// GET Route: Dashboard Core Engine Router Dispatcher
router.get('/dashboard', requireLogin, async (req, res) => {
    const user = res.locals.user;
    if (!user) {
        req.session.destroy();
        return res.redirect('/');
    }

    // Set 'dashboard' context state flag active
    if (req.session.userRole === 'students') {
        return res.render('student-dashboard', { user, activePage: 'dashboard' });
    } else if (req.session.userRole === 'instructors') {
        return res.render('instructor-dashboard', { user, activePage: 'dashboard' });
    } else if (req.session.userRole === 'admins') {
        return res.render('admin-dashboard', { user, activePage: 'dashboard' });
    }
    res.redirect('/');
});

// GET Route: Profile Rendering View Connection Endpoint
router.get('/profile', requireLogin, async (req, res) => {
    // Passes user details down alongside profile tab highlight tracking flags
    res.render('profile', { user: res.locals.user, activePage: 'profile' });
});

// GET Route: Study Groups Page
router.get('/studygroups', requireLogin, (req, res) => {
    res.render('studygroups', { user: res.locals.user, activePage: 'studygroups' });
});

// GET Route: Notes & Files Page
router.get('/notes-files', requireLogin, (req, res) => {
    res.render('notes&files', { user: res.locals.user, activePage: 'notes-files' });
});

export default router;