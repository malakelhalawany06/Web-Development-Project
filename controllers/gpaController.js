import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../config/db.js';

export const getGpaPage = (req, res) => {
    res.render('gpa-calculator', { 
        user: res.locals.user, 
        userRole: req.session.userRole || 'students', 
        activePage: 'gpa-calculator' 
    });
};

export const getUserSession = (req, res) => {
    if (res.locals.user) {
        return res.json({ success: true, user: res.locals.user });
    }
    res.status(401).json({ success: false, message: "No user session active." });
};

export const updateGpa = async (req, res) => {
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
            return res.json({ success: true, message: "GPA updated permanently!" });
        });
    } catch (err) {
        console.error("[GPA CONTROLLER ERROR]:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

export const archiveDeletedCourse = async (req, res) => {
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
        console.error("[GPA ARCHIVE CONTROLLER ERROR]:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};