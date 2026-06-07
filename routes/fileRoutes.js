// routes/fileRoutes.js
import express from 'express';
import { 
    getUserFilesController,
    getSharedFilesController,
    getInstructorFilesController,
    getFileByIdController,
    downloadFileController,
    createFileController,
    deleteFileController,
    shareFileController
} from '../controllers/fileController.js';

const router = express.Router();

router.get('/', getUserFilesController);
router.get('/shared', getSharedFilesController);
router.get('/instructor', getInstructorFilesController);
router.get('/:id', getFileByIdController);
router.get('/:id/download', downloadFileController);  // Add this line
router.post('/', createFileController);
router.delete('/:id', deleteFileController);
router.post('/:id/share', shareFileController);

export default router;