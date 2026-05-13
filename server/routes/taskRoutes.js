import express from 'express';
import { getTasks, getTaskById, getSubmissions } from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getTasks);
router.get('/:id', protect, getTaskById);
router.get('/:taskId/submissions', protect, getSubmissions);

export default router;
