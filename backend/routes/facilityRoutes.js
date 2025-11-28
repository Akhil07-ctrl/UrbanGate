import express from 'express';

import * as facilityController from '../controllers/facilityController.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, authorize('admin'), facilityController.createFacility);
router.get('/', authenticateToken, facilityController.getFacilities);
router.get('/:id', authenticateToken, facilityController.getFacilityById);
router.post('/:id/book', authenticateToken, authorize('resident'), facilityController.bookFacility);
router.post('/confirm-booking', authenticateToken, authorize('admin'), facilityController.confirmBooking);
router.post('/cancel-booking', authenticateToken, authorize('admin'), facilityController.cancelBooking);

export default router;
