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
        try {
            const studentId = req.session.userId;
            const db = await connectToDatabase();

            // 🗂 FETCH REAL PROJECTS ASSIGNED TO THIS STUDENT
            const studentProjects = await db.collection('projects').aggregate([
                { $match: { "tasks.assignedStudent": new ObjectId(studentId) } },
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

            // Calculate aggregated progress percentage matrices for the dashboard view template
            const dynamicProjects = studentProjects.map(p => {
                let totalProgress = 0;
                let tasksCount = p.tasks ? p.tasks.length : 0;
                
                if (tasksCount > 0) {
                    p.tasks.forEach(t => {
                        totalProgress += (t.completionPercentage || 0);
                    });
                }
                
                return {
                    _id: p._id,
                    projectName: p.projectName,
                    progress: tasksCount > 0 ? Math.round(totalProgress / tasksCount) : 0,
                    taskCount: tasksCount
                };
            });

            // Render dashboard passing downstream dynamic real project items
            return res.render('student-dashboard', { 
                user, 
                userRole: req.session.userRole, 
                activePage: 'dashboard',
                projects: dynamicProjects // ✅ Injected live projects data block
            });

        } catch (err) {
            console.error("Dashboard Dynamic Project Population Error:", err);
            // Fallback render to prevent dashboard page from crashing if DB drops
            return res.render('student-dashboard', { 
                user, 
                userRole: req.session.userRole, 
                activePage: 'dashboard', 
                projects: [] 
            });
        }
    } 
    else if (req.session.userRole === 'instructors') {
        return res.render('instructor-dashboard', { user, userRole: req.session.userRole, activePage: 'dashboard' });
    } else if (req.session.userRole === 'admins') {
        // Pass them directly to your dedicated admin router!
        return res.render('admin-dashboard', { user, userRole: req.session.userRole, activePage: 'dashboard' });
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