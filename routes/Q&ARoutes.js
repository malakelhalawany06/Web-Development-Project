const express = require('express');
const router = express.Router();

// Update this path to match your exact controller filename
const qaController = require('../controllers/Q&AController');

router.get('/', qaController.getQApage);
router.post('/add', qaController.addQuestion);
router.post('/upvote/:id', qaController.upvoteQuestion);
router.post('/answer/:id', qaController.addAnswer);
router.post('/delete/:id', qaController.deleteQuestion);

module.exports = router;