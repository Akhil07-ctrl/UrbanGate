import express from 'express';

import * as paymentController from '../controllers/paymentController.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, authorize('admin'), paymentController.createPayment);
router.get('/', authenticateToken, paymentController.getPayments);
router.put('/:id/mark-paid', authenticateToken, authorize('resident'), paymentController.markAsPaid);
router.get('/:id/invoice', authenticateToken, paymentController.downloadInvoice);

export default router;
