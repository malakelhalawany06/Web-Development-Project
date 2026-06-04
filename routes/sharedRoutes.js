// routes/sharedRoutes.js
import express from 'express';
import { 
    getUserSharedMaterialsController,
    createSharedMaterialController
} from '../controllers/sharedController.js';

const router = express.Router();

router.get('/my-shared', getUserSharedMaterialsController);
router.post('/', createSharedMaterialController);

export default router;