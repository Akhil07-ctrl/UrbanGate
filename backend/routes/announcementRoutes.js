import express from 'express';
import * as announcementController from '../controllers/announcementController.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, authorize('admin'), announcementController.createAnnouncement);
router.get('/', authenticateToken, announcementController.getAnnouncements);
router.get('/:id', authenticateToken, announcementController.getAnnouncementById);
router.put('/:id', authenticateToken, authorize('admin'), announcementController.updateAnnouncement);
router.delete('/:id', authenticateToken, authorize('admin'), announcementController.deleteAnnouncement);

export default router;
