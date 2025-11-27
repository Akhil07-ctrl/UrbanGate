import express from 'express';
import * as complaintController from '../controllers/complaintController.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, authorize('resident'), complaintController.createComplaint);
router.get('/', authenticateToken, complaintController.getComplaints);
router.get('/:id', authenticateToken, complaintController.getComplaintById);
router.put('/:id', authenticateToken, authorize('admin', 'security'), complaintController.updateComplaint);
router.post('/:id/comments', authenticateToken, complaintController.addComment);
router.delete('/:id', authenticateToken, authorize('admin', 'resident'), complaintController.deleteComplaint);

export default router;
