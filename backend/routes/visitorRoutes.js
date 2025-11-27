import express from 'express';
import * as visitorController from '../controllers/visitorController.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-pass', authenticateToken, authorize('resident'), visitorController.createVisitorPass);
router.get('/', authenticateToken, visitorController.getVisitorPasses);
router.post('/scan-qr', authenticateToken, authorize('security'), visitorController.scanVisitorQR);
router.delete('/:id', authenticateToken, authorize('resident'), visitorController.deleteVisitorPass);

export default router;
