import express from 'express';
import remindersController from '../controllers/remindersController.js';

const router = express.Router();

router.get('/', remindersController.getRemindersPage);
router.post('/add', remindersController.addReminder);
router.post('/toggle/:id', remindersController.toggleReminderStatus);
router.post('/delete/:id', remindersController.deleteReminder);
router.post('/clear-completed', remindersController.clearCompletedReminders);

export default router;