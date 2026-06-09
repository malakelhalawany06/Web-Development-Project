import express from 'express';
import { 
    getGpaPage, 
    getUserSession, 
    updateGpa, 
    archiveDeletedCourse 
} from '../controllers/gpaController.js';

const router = express.Router();

// Webpage render interface endpoint
router.get('/gpa-calculator', getGpaPage);

// API active verification endpoint
router.get('/api/user/session', getUserSession);

// Core state update data synchronizer channel 
router.post('/api/user/update-gpa', updateGpa);

// Event archiver recycling log interface
router.post('/api/user/archive-deleted-course', archiveDeletedCourse);

export default router;