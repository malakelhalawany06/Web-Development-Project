import express from 'express';
import { getGpaPage, getUserSession, updateGpa, archiveDeletedCourse } from '../controllers/gpaController.js';

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const requireLogin = (req, res, next) => {
    if (!req.session.userId || !res.locals.user) {
        return res.redirect('/');
    }
    next();
};

// Application Connected Mappings
router.get('/gpa-calculator', requireLogin, getGpaPage);
router.get('/api/user', getUserSession);
router.post('/api/user/update-gpa', updateGpa);
router.post('/api/user/archive-deleted-course', archiveDeletedCourse);

export default router;