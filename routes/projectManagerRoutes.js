import express from 'express';
import { getProjectManagerPage, addTask, updateTaskProgress, deleteTask } from '../controllers/projectManagerController.js';

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

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

// Application Connected Mappings
router.get('/project-manager', requireLogin, getProjectManagerPage);
router.post('/api/projects/add-task', requireStudentAPI, addTask);
router.post('/api/projects/:projectId/tasks/:taskId/progress', requireStudentAPI, updateTaskProgress);
router.post('/api/projects/:projectId/tasks/:taskId/delete', requireStudentAPI, deleteTask);

export default router;