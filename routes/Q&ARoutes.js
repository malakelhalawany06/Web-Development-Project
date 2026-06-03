const express = require('express');
const router = express.Router();
const qaController = require('../controllers/qaController');

router.get('/', qaController.getQApage);
router.post('/add', qaController.addQuestion);
router.post('/upvote/:id', qaController.upvoteQuestion);
router.post('/answer/:id', qaController.addAnswer);
router.post('/delete/:id', qaController.deleteQuestion);

module.exports = router;