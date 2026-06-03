import express from 'express';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../config/db.js';

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
        return res.render('student-dashboard', { user, userRole: req.session.userRole, activePage: 'dashboard' });
    } else if (req.session.userRole === 'instructors') {
        return res.render('instructor-dashboard', { user, userRole: req.session.userRole, activePage: 'dashboard' });
    } else if (req.session.userRole === 'admins') {
        return res.render('admin-dashboard', { user, userRole: req.session.userRole, activePage: 'dashboard' });
    }
    res.redirect('/');
});

// GET Route: Profile Rendering View Connection Endpoint
router.get('/profile', requireLogin, async (req, res) => {
    // Passes user details down alongside profile tab highlight tracking flags
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

// GET Route: GPA Calculator Page
router.get('/gpa-calculator', requireLogin, (req, res) => {
    res.render('gpa-calculator', { user: res.locals.user, userRole: req.session.userRole, activePage: 'gpa-calculator' });
});

// GET Route: Project Manager Core Data Pipeline View Loader
router.get('/project-manager', requireLogin, async (req, res) => {
    try {
        // Strict safe authorization gate: non-students get redirected to dashboard instantly
        if (req.session.userRole !== 'students') {
            return res.redirect('/dashboard');
        }

        const studentId = req.session.userId;
        const db = await connectToDatabase();

        // Pipeline aggregation: isolate user project contexts cleanly from MongoDB
        const studentProjects = await db.collection('projects').aggregate([
            {
                $match: { "tasks.assignedStudent": new ObjectId(studentId) }
            },
            {
                $project: {
                    projectName: 1,
                    description: 1,
                    tasks: {
                        $filter: {
                            input: "$tasks",
                            as: "task",
                            cond: { $eq: ["$$task.assignedStudent", new ObjectId(studentId)] }
                        }
                    }
                }
            }
        ]).toArray();

        // Cumulative analytics tracking initialization 
        let totalProgress = 0;
        let totalTasksCount = 0;

        studentProjects.forEach(p => {
            if (p.tasks) {
                p.tasks.forEach(t => {
                    totalProgress += (t.completionPercentage || 0);
                    totalTasksCount++;
                });
            }
        });

        const overallProgress = totalTasksCount > 0 ? Math.round(totalProgress / totalTasksCount) : 0;

        res.render('project-manager', { 
            user: res.locals.user, 
            userRole: req.session.userRole,
            projects: studentProjects,
            overallProgress: overallProgress,
            activePage: 'project-manager'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error loading Project Manager layout views.");
    }
});

export default router;