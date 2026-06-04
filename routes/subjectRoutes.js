// routes/subjectRoutes.js
import express from 'express';
import { getSubjectsController } from '../controllers/subjectController.js';

const router = express.Router();

router.get('/', getSubjectsController);

export default router;