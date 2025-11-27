import express from 'express';
import * as parkingController from '../controllers/parkingController.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, parkingController.getParkingSlots);
router.get('/resident/my-slot', authenticateToken, authorize('resident'), parkingController.getResidentParking);
router.post('/request-guest', authenticateToken, authorize('resident'), parkingController.requestGuestParking);
router.post('/approve-guest', authenticateToken, authorize('admin'), parkingController.approveGuestParking);
router.post('/reject-guest', authenticateToken, authorize('admin'), parkingController.rejectGuestParking);

export default router;
