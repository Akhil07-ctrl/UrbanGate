import Community from '../models/Community.js';
import JoinRequest from '../models/JoinRequest.js';
import User from '../models/User.js';
import { io } from '../server.js';

// Create a new community (Admin only)
export const createCommunity = async (req, res) => {
  try {
    const { name, description, location, facilities, rules } = req.body;
    const adminId = req.user.userId;

    // Check if community already exists
    const existingCommunity = await Community.findOne({ name });
    if (existingCommunity) {
      return res.status(400).json({ message: 'Community already exists' });
    }

    const community = new Community({
      name,
      description,
      location,
      adminId,
      facilities: facilities || [],
      rules: rules || [],
      members: [
        {
          userId: adminId,
          role: 'admin',
          joinedAt: new Date(),
          isActive: true
        }
      ],
      totalMembers: 1
    });

    await community.save();

    // Update user's communityId
    await User.findByIdAndUpdate(adminId, { communityId: community._id });

    res.status(201).json({
      message: 'Community created successfully',
      community: await community.populate('members.userId', 'name email role')
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating community', error: error.message });
  }
};

// Get all communities (searchable)
export const getAllCommunities = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const communities = await Community.find(query)
      .populate('adminId', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Community.countDocuments(query);

    res.json({
      communities,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching communities', error: error.message });
  }
};

// Get community details with members
export const getCommunityDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const community = await Community.findById(id)
      .populate('adminId', 'name email phone profileImage')
      .populate('members.userId', 'name email phone role');

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    res.json({ community });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching community', error: error.message });
  }
};

// Request to join community
export const requestJoinCommunity = async (req, res) => {
  try {
    const { communityId, flatNumber } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Validate flatNumber
    if (!flatNumber || !flatNumber.trim()) {
      return res.status(400).json({ message: 'Flat number is required' });
    }

    if (userRole === 'admin') {
      return res.status(403).json({ message: 'Admins cannot join communities' });
    }

    // Check if community exists
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user already in community
    const isMember = community.members.some(m => m.userId.toString() === userId);
    if (isMember) {
      return res.status(400).json({ message: 'You are already a member of this community' });
    }

    // Check if request already exists
    const existingRequest = await JoinRequest.findOne({
      userId,
      communityId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending request for this community' });
    }

    const joinRequest = new JoinRequest({
      userId,
      communityId,
      userRole,
      flatNumber: flatNumber.trim(),
      status: 'pending'
    });

    await joinRequest.save();

    // Emit socket event to admin
    io.emit('join_request_created', {
      communityId,
      adminId: community.adminId,
      userId,
      userName: (await User.findById(userId)).name,
      communityName: community.name
    });

    res.status(201).json({
      message: 'Join request sent successfully',
      joinRequest: await joinRequest.populate('userId communityId')
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending join request', error: error.message });
  }
};

// Get join requests for admin
export const getJoinRequests = async (req, res) => {
  try {
    const { communityId, status = 'pending' } = req.query;
    const adminId = req.user.userId;

    // Verify admin owns the community
    const community = await Community.findOne({
      _id: communityId,
      adminId
    });

    if (!community) {
      return res.status(403).json({ message: 'Unauthorized - not the community admin' });
    }

    const joinRequests = await JoinRequest.find({
      communityId,
      status
    })
      .populate('userId', 'name email role')
      .populate('communityId', 'name')
      .sort({ createdAt: -1 });

    res.json({ joinRequests });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching join requests', error: error.message });
  }
};

// Approve join request
export const approveJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const adminId = req.user.userId;

    const joinRequest = await JoinRequest.findById(requestId)
      .populate('userId')
      .populate('communityId');

    if (!joinRequest) {
      return res.status(404).json({ message: 'Join request not found' });
    }

    // Verify admin
    if (joinRequest.communityId.adminId.toString() !== adminId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update join request
    joinRequest.status = 'approved';
    joinRequest.reviewedBy = adminId;
    joinRequest.reviewedAt = new Date();
    await joinRequest.save();

    // Add user to community
    const community = joinRequest.communityId;
    community.members.push({
      userId: joinRequest.userId._id,
      role: joinRequest.userRole,
      flatNumber: joinRequest.flatNumber,
      joinedAt: new Date(),
      isActive: true
    });
    community.totalMembers = community.members.filter(m => m.isActive).length;
    await community.save();

    // Update user's communityId
    await User.findByIdAndUpdate(joinRequest.userId._id, {
      communityId: community._id
    });

    // Emit socket event to user
    io.emit('join_request_approved', {
      userId: joinRequest.userId._id,
      communityName: community.name
    });

    res.json({
      message: 'Join request approved',
      joinRequest
    });
  } catch (error) {
    res.status(500).json({ message: 'Error approving request', error: error.message });
  }
};

// Reject join request
export const rejectJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user.userId;

    const joinRequest = await JoinRequest.findById(requestId).populate('communityId');

    if (!joinRequest) {
      return res.status(404).json({ message: 'Join request not found' });
    }

    // Verify admin
    if (joinRequest.communityId.adminId.toString() !== adminId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    joinRequest.status = 'rejected';
    joinRequest.reviewedBy = adminId;
    joinRequest.reviewedAt = new Date();
    joinRequest.rejectionReason = rejectionReason;
    await joinRequest.save();

    // Emit socket event to user
    io.emit('join_request_rejected', {
      userId: joinRequest.userId,
      communityName: joinRequest.communityId.name,
      reason: rejectionReason
    });

    res.json({
      message: 'Join request rejected',
      joinRequest
    });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting request', error: error.message });
  }
};

// Remove member from community
export const removeMember = async (req, res) => {
  try {
    const { communityId, memberId } = req.params;
    const adminId = req.user.userId;

    const community = await Community.findOne({
      _id: communityId,
      adminId
    });

    if (!community) {
      return res.status(403).json({ message: 'Unauthorized - not the community admin' });
    }

    // Remove member
    community.members = community.members.map(m => {
      if (m.userId.toString() === memberId) {
        m.isActive = false;
      }
      return m;
    });

    community.totalMembers = community.members.filter(m => m.isActive).length;
    await community.save();

    // Update user
    await User.findByIdAndUpdate(memberId, { communityId: null });

    // Emit socket event to member
    io.emit('member_removed', {
      userId: memberId,
      communityName: community.name
    });

    res.json({
      message: 'Member removed successfully',
      community
    });
  } catch (error) {
    res.status(500).json({ message: 'Error removing member', error: error.message });
  }
};

// Get user's community
export const getUserCommunity = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).populate('communityId');

    if (!user || !user.communityId) {
      return res.status(404).json({ message: 'User not in any community yet' });
    }

    const community = await Community.findById(user.communityId)
      .populate('adminId', 'name email phone profileImage')
      .populate('members.userId', 'name email role phone profileImage');

    res.json({ community });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching community', error: error.message });
  }
};

// Get community members (for group view)
export const getCommunityMembers = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user || !user.communityId) {
      return res.status(404).json({ message: 'User not in any community yet' });
    }

    const community = await Community.findById(user.communityId)
      .populate('members.userId', 'name email role phone profileImage')
      .populate('adminId', 'name email phone profileImage');

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Return all active members
    const members = community.members
      .filter(m => m.isActive)
      .map(m => ({
        _id: m.userId._id,
        name: m.userId.name,
        email: m.userId.email,
        role: m.role,
        phone: m.userId.phone,
        profileImage: m.userId.profileImage,
        flatNumber: m.flatNumber,
        joinedAt: m.joinedAt
      }));

    // Add admin to members list if not already included
    const adminInMembers = members.some(m => m._id.toString() === community.adminId._id.toString());
    if (!adminInMembers) {
      members.unshift({
        _id: community.adminId._id,
        name: community.adminId.name,
        email: community.adminId.email,
        role: 'admin',
        phone: community.adminId.phone,
        profileImage: community.adminId.profileImage,
        flatNumber: null,
        joinedAt: community.createdAt
      });
    }

    res.json({
      members,
      totalMembers: members.length,
      communityName: community.name
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching community members', error: error.message });
  }
};

// Update community (Admin only)
export const updateCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const adminId = req.user.userId;
    const { name, description, location, facilities, rules } = req.body;

    const community = await Community.findOne({
      _id: communityId,
      adminId
    });

    if (!community) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (name) community.name = name;
    if (description) community.description = description;
    if (location) community.location = location;
    if (facilities) community.facilities = facilities;
    if (rules) community.rules = rules;

    await community.save();

    res.json({
      message: 'Community updated successfully',
      community
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating community', error: error.message });
  }
};

// Delete community (Admin only)
export const deleteCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const adminId = req.user.userId;

    const community = await Community.findOne({
      _id: communityId,
      adminId
    });

    if (!community) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Remove community reference from all users
    await User.updateMany({ communityId }, { communityId: null });

    // Delete join requests
    await JoinRequest.deleteMany({ communityId });

    // Delete community
    await Community.findByIdAndDelete(communityId);

    res.json({ message: 'Community deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting community', error: error.message });
  }
};
