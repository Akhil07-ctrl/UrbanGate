import express from 'express';

import * as pollController from '../controllers/pollController.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, authorize('admin'), pollController.createPoll);
router.get('/', authenticateToken, pollController.getPolls);
router.get('/:id', authenticateToken, pollController.getPollById);
router.post('/:id/vote', authenticateToken, pollController.votePoll);
router.post('/:id/close', authenticateToken, authorize('admin'), pollController.closePoll);

export default router;
