import express from 'express';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../config/db.js';

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Authorization Gates
const requireLogin = (req, res, next) => {
    if (!req.session.userId || !res.locals.user) {
        return res.redirect('/');
    }
    next();
};

const requireStudentAPI = (req, res, next) => {
    if (req.session && req.session.userId && req.session.userRole === 'students') {
        return next();
    }
    return res.status(403).json({ success: false, message: "Unauthorized action." });
};

// GET Route: Project Manager View Pipeline Aggregation Loader
router.get('/project-manager', requireLogin, async (req, res) => {
    try {
        if (req.session.userRole !== 'students') {
            return res.redirect('/dashboard');
        }

        const studentId = req.session.userId;
        const db = await connectToDatabase();

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
        res.status(500).send("Server Error loading Project Manager dashboard panels.");
    }
});

// API Endpoint: Create Task Node
router.post('/api/projects/add-task', requireStudentAPI, async (req, res) => {
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

// API Endpoint: Save Completion Progression Matrix
router.post('/api/projects/:projectId/tasks/:taskId/progress', requireStudentAPI, async (req, res) => {
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

// API Endpoint: Archiving Soft-Deletion Task Engine
router.post('/api/projects/:projectId/tasks/:taskId/delete', requireStudentAPI, async (req, res) => {
    try {
        const { projectId, taskId } = req.params;
        const db = await connectToDatabase();

        const project = await db.collection('projects').findOne({ _id: new ObjectId(projectId) });
        
        if (project && project.tasks) {
            const targetTask = project.tasks.find(t => t._id.toString() === taskId.toString());
            if (targetTask) {
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
            }
        }

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