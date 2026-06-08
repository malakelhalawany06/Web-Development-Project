import express from 'express';
import {
    getAdminDashboard,
    getAnalytics,
    getUserManagement,
    updateUserStatus,
    deleteUser,
    resetPassword,
    forceReset,
    logoutAllDevices,
    sendWarning,
    restrictUser,
    getGrowthDataAPI
} from '../controllers/adminController.js';

const router = express.Router();

const requireAdmin = (req, res, next) => {
    if (req.session.userRole !== 'admins') {
        return res.status(403).send('Access denied. Admins only.');
    }
    next();
};

// ==================== PAGE ROUTES ====================
router.get('/dashboard', requireAdmin, getAdminDashboard);
router.get('/analytics', requireAdmin, getAnalytics);
router.get('/users', requireAdmin, getUserManagement);

// ==================== API ROUTES ====================
router.post('/users/status', requireAdmin, updateUserStatus);
router.post('/users/delete', requireAdmin, deleteUser);
router.post('/users/reset-password', requireAdmin, resetPassword);
router.post('/users/force-reset', requireAdmin, forceReset);
router.post('/users/logout-all', requireAdmin, logoutAllDevices);
router.post('/users/send-warning', requireAdmin, sendWarning);
router.post('/users/restrict', requireAdmin, restrictUser);
router.get('/analytics/growth', requireAdmin, getGrowthDataAPI);

export default router;