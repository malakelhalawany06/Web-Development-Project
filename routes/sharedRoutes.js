// routes/sharedRoutes.js
import express from 'express';
import { 
    getUserSharedMaterialsController,
    createSharedMaterialController,
    uploadMiddleware
} from '../controllers/sharedController.js';

const router = express.Router();

router.get('/my-shared', getUserSharedMaterialsController);
router.post('/', uploadMiddleware, createSharedMaterialController);  

export default router;