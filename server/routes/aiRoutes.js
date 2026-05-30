import express from 'express';
import { assignTask, chatTeammate, submitAndEvaluate, getChatHistory } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/manager/assign', protect, assignTask);
router.post('/teammate/chat', protect, chatTeammate);
router.get('/teammate/history', protect, getChatHistory);
router.post('/evaluator/evaluate', protect, submitAndEvaluate);

export default router;

