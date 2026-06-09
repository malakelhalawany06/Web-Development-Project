import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../config/db.js';

// ===== 1. RENDER THE CALCULATOR UI =====
export const getGpaPage = (req, res) => {
    res.render('gpa-calculator', { 
        user: res.locals.user, 
        userRole: req.session.userRole || 'students', 
        activePage: 'gpaCalculator' 
    });
};

// ===== 2. FETCH ACTIVE USER SESSION DETAILS =====
export const getUserSession = (req, res) => {
    if (res.locals.user) {
        return res.json({ success: true, user: res.locals.user });
    }
    res.status(401).json({ success: false, message: "No user session active." });
};

// ===== 3. UPDATE GPA AND SAVE COURSES TO MONGODB =====
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

        // Extract the incoming courses array sent from your frontend script
        const updatedCourses = req.body.courses || [];

        const db = await connectToDatabase();
        
        // Update BOTH the running cumulative GPA score and the courses dataset array
        await db.collection('students').updateOne(
            { _id: new ObjectId(userId) },
            { 
                $set: { 
                    gpa: newGpa,
                    GPA: newGpa, 
                    courses: updatedCourses 
                } 
            }
        );

        // Keep short-term session cache memory perfectly mirrored
        if (req.session.user) {
            req.session.user.gpa = newGpa;
            req.session.user.GPA = newGpa;
            req.session.user.courses = updatedCourses; 
        }
        if (res.locals.user) {
            res.locals.user.gpa = newGpa;
            res.locals.user.GPA = newGpa;
            res.locals.user.courses = updatedCourses;
        }

        // Save session modifications securely to the server store
        req.session.save((err) => {
            if (err) {
                return res.status(500).json({ success: false, error: "Database updated, but session save failed." });
            }
            return res.json({ success: true, message: "GPA and course list synchronized to cloud database permanently!" });
        });
    } catch (err) {
        console.error("[GPA CONTROLLER ERROR]:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ===== 4. SOFT-DELETE ARCHIVE EVENT LOGGER =====
export const archiveDeletedCourse = async (req, res) => {
    try {
        const userId = req.session?.userId || req.session?.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized." });
        }

        const { courseName, credits, gradeText, points } = req.body;
        const parsedCredits = parseInt(credits);

        // BACKEND VALIDATION: Drop incoming request payloads containing bad numbers
        if (isNaN(parsedCredits) || parsedCredits <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Validation Error: Credit hours must be a positive integer greater than zero." 
            });
        }

        const db = await connectToDatabase();

        await db.collection('hidden_files').insertOne({
            type: "deleted_gpa_course",
            userId: new ObjectId(userId),
            courseName,
            credits: parsedCredits,
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