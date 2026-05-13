import express from 'express';
import { changeRole, getRoleContext, listRoles } from '../controllers/roleController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, listRoles);
router.get('/:roleId/context', protect, getRoleContext);
router.patch('/active', protect, changeRole);

export default router;
