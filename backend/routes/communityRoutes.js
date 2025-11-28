import express from 'express';

import { authenticateToken, authorize } from '../middleware/auth.js';
import {
  createCommunity,
  getAllCommunities,
  getCommunityDetails,
  requestJoinCommunity,
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  removeMember,
  getUserCommunity,
  getCommunityMembers,
  updateCommunity,
  deleteCommunity
} from '../controllers/communityController.js';

const router = express.Router();

// Public routes
router.get('/all', getAllCommunities);
router.get('/:id', getCommunityDetails);

// Protected routes
router.post('/create', authenticateToken, authorize(['admin']), createCommunity);
router.get('/my-community', authenticateToken, getUserCommunity);
router.get('/members', authenticateToken, getCommunityMembers);
router.post('/join', authenticateToken, authorize(['resident', 'security']), requestJoinCommunity);

// Admin routes
router.get('/admin/join-requests', authenticateToken, authorize(['admin']), getJoinRequests);
router.post('/admin/approve-request/:requestId', authenticateToken, authorize(['admin']), approveJoinRequest);
router.post('/admin/reject-request/:requestId', authenticateToken, authorize(['admin']), rejectJoinRequest);
router.delete('/admin/remove-member/:communityId/:memberId', authenticateToken, authorize(['admin']), removeMember);
router.put('/admin/update/:communityId', authenticateToken, authorize(['admin']), updateCommunity);
router.delete('/admin/delete/:communityId', authenticateToken, authorize(['admin']), deleteCommunity);

export default router;
