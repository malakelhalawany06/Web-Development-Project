import express from 'express';
// ✅ Import the entire default controller object cleanly
import remindersController from '../controllers/remindersController.js';

const router = express.Router();

// 1. Render the main dashboard page
router.get('/', remindersController.getRemindersPage);

// 2. Route to handle form submissions for adding a reminder
router.post('/add', remindersController.addReminder);

// 3. Route to change a task between 'Pending' and 'Completed'
router.post('/toggle/:id', remindersController.toggleReminderStatus);

// 4. Route to remove a task completely
router.post('/delete/:id', remindersController.deleteReminder);

export default router;