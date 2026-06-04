// routes/groupRoutes.js - AFTER adding controllers
import express from 'express';
import { 
    getUserGroupsController,
    createGroupController,
    joinGroupController,
    leaveGroupController,
    getGroupDetailsController,
    getGroupMembersController,
    getGroupMessagesController,
    sendMessageController,
    getGroupResourcesController,
    addResourceController
} from '../controllers/groupController.js';

const router = express.Router();

router.get('/', getUserGroupsController);
router.post('/', createGroupController);
router.post('/:id/join', joinGroupController);
router.post('/:id/leave', leaveGroupController);
router.get('/:id', getGroupDetailsController);
router.get('/:id/members', getGroupMembersController);
router.get('/:id/messages', getGroupMessagesController);
router.post('/:id/messages', sendMessageController);
router.get('/:id/resources', getGroupResourcesController);
router.post('/:id/resources', addResourceController);

export default router;