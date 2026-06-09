// routes/fileRoutes.js
import express from 'express';
import { 
    getSharedFilesController,
    getInstructorFilesController,
    getFileByIdController,
    downloadFileController,
    deleteFileController
} from '../controllers/fileController.js';

const router = express.Router();

// Shared materials routes
router.get('/shared', getSharedFilesController);
router.get('/instructor', getInstructorFilesController);
router.get('/:id', getFileByIdController);
router.get('/:id/download', downloadFileController);
router.delete('/:id', deleteFileController);

export default router;