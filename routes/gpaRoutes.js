import express from 'express';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../config/db.js';

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Secure Session Auth Verification
const requireLogin = (req, res, next) => {
    if (!req.session.userId || !res.locals.user) {
        return res.redirect('/');
    }
    next();
};

// GET Route: Render GPA Calculator Page
router.get('/gpa-calculator', requireLogin, (req, res) => {
    res.render('gpa-calculator', { 
        user: res.locals.user, 
        userRole: req.session.userRole || 'students', 
        activePage: 'gpa-calculator' 
    });
});

// Endpoint: Fetch active session profile metadata
router.get('/api/user', (req, res) => {
    if (res.locals.user) {
        return res.json({ success: true, user: res.locals.user });
    }
    res.status(401).json({ success: false, message: "No user session active." });
});

// API Endpoint: Update user GPA inside Database and active Session
router.post('/api/user/update-gpa', async (req, res) => {
    try {
        const userId = req.session?.userId || req.session?.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized. No active session found." });
        }

        const newGpa = parseFloat(req.body.gpa);
        if (isNaN(newGpa) || newGpa < 0 || newGpa > 4.0) {
            return res.status(400).json({ success: false, message: "Invalid GPA value." });
        }

        const db = await connectToDatabase();
        
        await db.collection('students').updateOne(
            { _id: new ObjectId(userId) },
            { $set: { gpa: newGpa } }
        );

        if (req.session.user) {
            req.session.user.gpa = newGpa;
            req.session.user.GPA = newGpa;
        }
        if (res.locals.user) {
            res.locals.user.gpa = newGpa;
            res.locals.user.GPA = newGpa;
        }

        req.session.save((err) => {
            if (err) {
                return res.status(500).json({ success: false, error: "Database updated, but session save failed." });
            }
            return res.json({ success: true, message: "GPA updated permanently in database and session!" });
        });
    } catch (err) {
        console.error("[GPA API ROUTE ERROR]:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// API Endpoint: Soft-delete/Archive courses into tracking vault
router.post('/api/user/archive-deleted-course', async (req, res) => {
    try {
        const userId = req.session?.userId || req.session?.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized." });
        }

        const { courseName, credits, gradeText, points } = req.body;
        const db = await connectToDatabase();

        await db.collection('hidden_files').insertOne({
            type: "deleted_gpa_course",
            userId: new ObjectId(userId),
            courseName,
            credits,
            gradeText,
            points,
            deletedAt: new Date()
        });

        res.json({ success: true, message: "Course backed up to hidden_files archive." });
    } catch (err) {
        console.error("[GPA ARCHIVE ERROR]:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;