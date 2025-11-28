import express from 'express';
import multer from 'multer';
import * as complaintController from '../controllers/complaintController.js';
import { authenticateToken, authorize } from '../middleware/auth.js';
import { fileFilter, storage } from '../utils/fileUpload.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Create a new complaint with file uploads
router.post(
  '/',
  authenticateToken,
  authorize('resident'),
  upload.array('images', 5), // Max 5 files
  complaintController.createComplaint
);

// Get all complaints with filtering and pagination
router.get(
  '/',
  authenticateToken,
  complaintController.getComplaints
);

// Get complaint statistics
router.get(
  '/stats/overview',
  authenticateToken,
  authorize('admin', 'manager'),
  complaintController.getComplaintStats
);

// Get a single complaint by ID
router.get(
  '/:id',
  authenticateToken,
  complaintController.getComplaintById
);

// Update complaint status/priority/assignment
router.put(
  '/:id',
  authenticateToken,
  authorize('admin', 'security', 'staff'),
  complaintController.updateComplaint
);

// Add a comment to a complaint
router.post(
  '/:id/comments',
  authenticateToken,
  complaintController.addComment
);

// Add an internal note (staff only)
router.post(
  '/:id/notes',
  authenticateToken,
  authorize('admin', 'staff'),
  complaintController.addComment
);

// Upload additional images to a complaint
router.post(
  '/:id/upload',
  authenticateToken,
  upload.array('images', 5),
  complaintController.uploadImages
);

// Delete a complaint (soft delete)
router.delete(
  '/:id',
  authenticateToken,
  authorize('admin', 'resident'),
  complaintController.deleteComplaint
);

// Get complaints by status
router.get(
  '/status/:status',
  authenticateToken,
  complaintController.getComplaintsByStatus
);

export default router;
