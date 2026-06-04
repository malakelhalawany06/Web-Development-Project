import express from 'express';
import qaController from '../controllers/Q&AController.js';

const router = express.Router();

router.get('/', qaController.getQApage);
router.post('/add', qaController.addQuestion);
router.post('/upvote/:id', qaController.upvoteQuestion);
router.post('/answer/:id', qaController.addAnswer);
router.post('/delete/:id', qaController.deleteQuestion);

export default router;