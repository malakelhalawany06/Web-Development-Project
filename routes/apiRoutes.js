import express from 'express';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../config/db.js';

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Endpoint: Fetch active session profile
router.get('/user', (req, res) => {
    if (res.locals.user) {
        return res.json({ success: true, user: res.locals.user });
    }
    res.status(401).json({ success: false, message: "No user session active." });
});

// 🎓 FIXED ENDPOINT: PERMANENTLY UPDATE MONGODB AND FORCE REFRESH THE SESSION
router.post('/user/update-gpa', async (req, res) => {
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
        
        // 1. PERMANENTLY UPDATE THE STUDENT DOCUMENT IN MONGODB
        const updateResult = await db.collection('students').updateOne(
            { _id: new ObjectId(userId) },
            { $set: { gpa: newGpa } }
        );

        console.log(`[DB UPDATE] Student ${userId} GPA set to ${newGpa}. Matched: ${updateResult.matchedCount}, Modified: ${updateResult.modifiedCount}`);

        // 2. LIVE REFRESH THE ACTIVE USER SESSION RECORD
        if (req.session.user) {
            req.session.user.gpa = newGpa;
            req.session.user.GPA = newGpa;
        }
        
        if (res.locals.user) {
            res.locals.user.gpa = newGpa;
            res.locals.user.GPA = newGpa;
        }

        // 3. FORCE BACKEND TO SAVE THE SESSION STATE PERMANENTLY
        req.session.save((err) => {
            if (err) {
                console.error("[SESSION SAVE ERROR]:", err);
                return res.status(500).json({ success: false, error: "Database updated, but session save failed." });
            }
            return res.json({ success: true, message: "GPA updated permanently in database and session!" });
        });

    } catch (err) {
        console.error("[API ROUTE ERROR]:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// 🗑️ GPA ARCHIVE ROUTE: ARCHIVES DELETED GPA COURSE INFO INTO HIDDEN_FILES
router.post('/user/archive-deleted-course', async (req, res) => {
    try {
        const userId = req.session?.userId || req.session?.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized." });
        }

        const { courseName, credits, gradeText, points } = req.body;
        const db = await connectToDatabase();

        // Save a backup clone inside your 'hidden_files' trash bin collection
        await db.collection('hidden_files').insertOne({
            type: "deleted_gpa_course",
            userId: new ObjectId(userId),
            courseName,
            credits,
            gradeText,
            points,
            deletedAt: new Date()
        });

        console.log(`[ARCHIVE SUCCESS] Course "${courseName}" for User ${userId} sent to hidden_files.`);
        res.json({ success: true, message: "Course backed up to hidden_files archive." });
    } catch (err) {
        console.error("[GPA ARCHIVE ERROR]:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Gate restricting operations exclusively to student roles
const requireStudentAPI = (req, res, next) => {
    if (req.session && req.session.userId && req.session.userRole === 'students') {
        return next();
    }
    return res.status(403).json({ success: false, message: "Unauthorized action." });
};

// API Endpoint: Add Task
router.post('/projects/add-task', requireStudentAPI, async (req, res) => {
    try {
        const studentId = req.session.userId;
        const { taskName, deadline } = req.body;
        if (!taskName || !deadline) return res.status(400).json({ success: false, message: "Missing fields." });

        const db = await connectToDatabase();
        let project = await db.collection('projects').findOne({});
        if (!project) {
            const result = await db.collection('projects').insertOne({
                projectName: "LoomHub Workspace Group Tasks",
                description: "Collaborative framework.",
                tasks: []
            });
            project = { _id: result.insertedId };
        }

        const newTask = {
            _id: new ObjectId(),
            taskName,
            assignedStudent: new ObjectId(studentId),
            completionPercentage: 0,
            deadline: new Date(deadline),
            createdAt: new Date()
        };

        await db.collection('projects').updateOne({ _id: project._id }, { $push: { tasks: newTask } });
        res.json({ success: true, message: "Task created." });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// API Endpoint: Progress Update Action
router.post('/projects/:projectId/tasks/:taskId/progress', requireStudentAPI, async (req, res) => {
    try {
        const { projectId, taskId } = req.params;
        let completionPercentage = parseInt(req.body.completionPercentage);
        if (isNaN(completionPercentage) || completionPercentage < 0 || completionPercentage > 100) return res.status(400).json({ success: false });

        const db = await connectToDatabase();
        await db.collection('projects').updateOne(
            { _id: new ObjectId(projectId), "tasks._id": new ObjectId(taskId) },
            { $set: { "tasks.$.completionPercentage": completionPercentage } }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// 🗂️ API ENDPOINT: SOFT-DELETE TASK (Copies data to hidden_files before removal)
router.post('/projects/:projectId/tasks/:taskId/delete', requireStudentAPI, async (req, res) => {
    try {
        const { projectId, taskId } = req.params;
        const db = await connectToDatabase();

        const project = await db.collection('projects').findOne({ _id: new ObjectId(projectId) });
        
        if (project && project.tasks) {
            const targetTask = project.tasks.find(t => t._id.toString() === taskId.toString());
            
            if (targetTask) {
                // Clone the task details securely into your 'hidden_files' recovery data tier
                await db.collection('hidden_files').insertOne({
                    type: "deleted_project_task",
                    projectId: new ObjectId(projectId),
                    projectName: project.projectName,
                    taskId: targetTask._id,
                    taskName: targetTask.taskName,
                    assignedStudent: targetTask.assignedStudent,
                    completionPercentage: targetTask.completionPercentage,
                    deadline: targetTask.deadline,
                    deletedAt: new Date()
                });
                console.log(`[ARCHIVE SUCCESS] Project Task ${taskId} safely cloned into hidden_files.`);
            }
        }

        // Safely wipe the live task subdocument out of the projects array map
        await db.collection('projects').updateOne(
            { _id: new ObjectId(projectId) }, 
            { $pull: { tasks: { _id: new ObjectId(taskId) } } }
        );

        res.json({ success: true, message: "Task archived and deleted successfully!" });
    } catch (err) {
        console.error("[TASK ARCHIVE ERROR]:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;