import express from 'express';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../config/db.js';

const router = express.Router();

const requireLogin = (req, res, next) => {
    if (!req.session.userId || !res.locals.user) {
        return res.redirect('/');
    }
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

    if (req.session.userRole === 'students') {
        return res.render('student-dashboard', { user, userRole: req.session.userRole, activePage: 'dashboard' });
   } else if (req.session.userRole === 'admins') {
        // Pass them directly to your dedicated admin router!
        return res.redirect('/admin/dashboard');
    }
    res.redirect('/');
});

// GET Route: Profile Rendering View Connection Endpoint
router.get('/profile', requireLogin, async (req, res) => {
    res.render('profile', { user: res.locals.user, userRole: req.session.userRole, activePage: 'profile' });
});

// GET Route: Study Groups Page
router.get('/studygroups', requireLogin, (req, res) => {
    res.render('studygroups', { user: res.locals.user, userRole: req.session.userRole, activePage: 'studygroups' });
});

// GET Route: Notes & Files Page
router.get('/notes-files', requireLogin, (req, res) => {
    res.render('notes&files', { user: res.locals.user, userRole: req.session.userRole, activePage: 'notes-files' });
});

// Instructor Notes & Files
router.get('/instructor-notes-files', (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    res.render('instructor-notes-files', { user: res.locals.user, userRole: req.session.userRole });
});

// Instructor Shared Materials
router.get('/instructor-shared-materials', (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    res.render('instructor-shared-materials', { user: res.locals.user, userRole: req.session.userRole });
});

// GET Route: Group Details Page
router.get('/group-details', requireLogin, (req, res) => {
    res.render('group-details', { user: res.locals.user, userRole: req.session.userRole });
});

router.get('/shared-materials', requireLogin, (req, res) => {
    res.render('sharedMaterials', { user: res.locals.user, userRole: req.session.userRole, activePage: 'shared-materials' });
});

export default router; // <-- This MUST stay at the very, very bottom