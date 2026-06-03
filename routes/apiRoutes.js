import express from 'express';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../config/db.js';

const router = express.Router();

// Parse body streams cleanly
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

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

        if (!taskName || !deadline) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        const db = await connectToDatabase();
        let project = await db.collection('projects').findOne({});
        if (!project) {
            const result = await db.collection('projects').insertOne({
                projectName: "LoomHub Workspace Group Tasks",
                description: "Collaborative and personal progress tracking framework.",
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

        await db.collection('projects').updateOne(
            { _id: project._id },
            { $push: { tasks: newTask } }
        );

        res.json({ success: true, message: "Task created." });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// API Endpoint: Progress Update Action Dispatcher
router.post('/projects/:projectId/tasks/:taskId/progress', requireStudentAPI, async (req, res) => {
    try {
        const { projectId, taskId } = req.params;
        let completionPercentage = parseInt(req.body.completionPercentage);

        if (isNaN(completionPercentage) || completionPercentage < 0 || completionPercentage > 100) {
            return res.status(400).json({ success: false, message: "Invalid value." });
        }

        const db = await connectToDatabase();
        await db.collection('projects').updateOne(
            { _id: new ObjectId(projectId), "tasks._id": new ObjectId(taskId) },
            { $set: { "tasks.$.completionPercentage": completionPercentage } }
        );

        res.json({ success: true, message: "Progress saved!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// API Endpoint: Delete Task
router.post('/projects/:projectId/tasks/:taskId/delete', requireStudentAPI, async (req, res) => {
    try {
        const { projectId, taskId } = req.params;
        const db = await connectToDatabase();
        await db.collection('projects').updateOne(
            { _id: new ObjectId(projectId) },
            { $pull: { tasks: { _id: new ObjectId(taskId) } } }
        );
        res.json({ success: true, message: "Task removed." });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;