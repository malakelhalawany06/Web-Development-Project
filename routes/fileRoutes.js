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
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getUserFilesController);
router.get('/shared', getSharedFilesController);
router.get('/instructor', getInstructorFilesController);
router.get('/:id', getFileByIdController);
router.get('/:id/download', downloadFileController);
router.post('/', upload.single('file'), createFileController);
router.delete('/:id', deleteFileController);
router.post('/:id/share', shareFileController);

export default router;