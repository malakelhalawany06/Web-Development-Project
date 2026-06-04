// routes/groupRoutes.js
import express from 'express';
import { 
    getUserGroupsController,
    createGroupController,
    joinGroupController,
    leaveGroupController,
    getGroupDetailsController
} from '../controllers/groupController.js';

const router = express.Router();

router.get('/', getUserGroupsController);
router.post('/', createGroupController);
router.post('/:id/join', joinGroupController);
router.post('/:id/leave', leaveGroupController);
router.get('/:id', getGroupDetailsController);

export default router;