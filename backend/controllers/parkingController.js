import Parking from '../models/Parking.js';
import User from '../models/User.js';

export const getParkingSlots = async (req, res, next) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    let query = { communityId: user.communityId };
    if (type) query.type = type;

    const parkingSlots = await Parking.find(query)
      .populate('residentId', 'name email phone')
      .populate('communityId', 'name')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Parking.countDocuments(query);

    res.status(200).json({
      parkingSlots,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getResidentParking = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    const parking = await Parking.findOne({
      communityId: user.communityId,
      residentId: req.user.userId,
      type: 'resident'
    }).populate('residentId', 'name email phone')
      .populate('communityId', 'name');

    if (!parking) {
      return res.status(404).json({ message: 'No parking slot assigned' });
    }

    res.status(200).json(parking);
  } catch (error) {
    next(error);
  }
};

export const requestGuestParking = async (req, res, next) => {
  try {
    const { slotId, fromDate, toDate } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    const parking = await Parking.findById(slotId);

    if (!parking) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }

    // Verify parking belongs to user's community
    if (parking.communityId.toString() !== user.communityId.toString()) {
      return res.status(403).json({ message: 'Parking slot does not belong to your community' });
    }

    if (parking.type !== 'guest') {
      return res.status(400).json({ message: 'Only guest parking slots can be requested' });
    }

    // Validate dates
    const from = new Date(fromDate);
    const to = new Date(toDate);
    
    if (from >= to) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    if (from < new Date()) {
      return res.status(400).json({ message: 'Cannot request parking in the past' });
    }

    // Check for conflicts with approved requests
    const hasConflict = parking.guestRequests.some(request => {
      if (request.status !== 'approved') return false;
      
      const reqFrom = new Date(request.fromDate);
      const reqTo = new Date(request.toDate);
      
      // Check for date overlap
      return (
        (from >= reqFrom && from < reqTo) ||
        (to > reqFrom && to <= reqTo) ||
        (from <= reqFrom && to >= reqTo)
      );
    });

    if (hasConflict) {
      return res.status(409).json({ 
        message: 'Parking slot is already booked for this time period. Please choose different dates.' 
      });
    }

    // Check if user already has a pending request for this slot in the same time period
    const existingPendingRequest = parking.guestRequests.find(request => {
      if (request.status !== 'pending' || request.requestedBy.toString() !== req.user.userId) {
        return false;
      }
      
      const reqFrom = new Date(request.fromDate);
      const reqTo = new Date(request.toDate);
      
      return (
        (from >= reqFrom && from < reqTo) ||
        (to > reqFrom && to <= reqTo) ||
        (from <= reqFrom && to >= reqTo)
      );
    });

    if (existingPendingRequest) {
      return res.status(400).json({ 
        message: 'You already have a pending request for this slot during this time period.' 
      });
    }

    parking.guestRequests.push({
      requestedBy: req.user.userId,
      fromDate: from,
      toDate: to,
      status: 'pending'
    });

    await parking.save();

    res.status(200).json({
      message: 'Guest parking request submitted',
      parking
    });
  } catch (error) {
    next(error);
  }
};

export const approveGuestParking = async (req, res, next) => {
  try {
    const { slotId, requestId } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    const parking = await Parking.findById(slotId);

    if (!parking) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }

    // Verify parking belongs to admin's community
    if (parking.communityId.toString() !== user.communityId.toString()) {
      return res.status(403).json({ message: 'Parking slot does not belong to your community' });
    }

    const request = parking.guestRequests.id(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Request is already ${request.status}` });
    }

    // Check for conflicts with other approved requests
    const requestFrom = new Date(request.fromDate);
    const requestTo = new Date(request.toDate);
    
    const hasConflict = parking.guestRequests.some(existingRequest => {
      if (existingRequest._id.toString() === requestId.toString()) return false;
      if (existingRequest.status !== 'approved') return false;
      
      const existingFrom = new Date(existingRequest.fromDate);
      const existingTo = new Date(existingRequest.toDate);
      
      return (
        (requestFrom >= existingFrom && requestFrom < existingTo) ||
        (requestTo > existingFrom && requestTo <= existingTo) ||
        (requestFrom <= existingFrom && requestTo >= existingTo)
      );
    });

    if (hasConflict) {
      return res.status(409).json({ 
        message: 'Cannot approve: Another approved request conflicts with this time period.' 
      });
    }

    request.status = 'approved';
    request.approvedBy = req.user.userId;

    await parking.save();

    res.status(200).json({
      message: 'Guest parking request approved',
      parking
    });
  } catch (error) {
    next(error);
  }
};

export const rejectGuestParking = async (req, res, next) => {
  try {
    const { slotId, requestId } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    const parking = await Parking.findById(slotId);

    if (!parking) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }

    // Verify parking belongs to admin's community
    if (parking.communityId.toString() !== user.communityId.toString()) {
      return res.status(403).json({ message: 'Parking slot does not belong to your community' });
    }

    const request = parking.guestRequests.id(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = 'rejected';

    await parking.save();

    res.status(200).json({
      message: 'Guest parking request rejected',
      parking
    });
  } catch (error) {
    next(error);
  }
};

// Create parking slot (Admin only)
export const createParkingSlot = async (req, res, next) => {
  try {
    const { slotNumber, type, residentId, block, floor, isAvailable } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    // If residentId is provided, verify resident is in the community
    if (residentId) {
      const Community = (await import('../models/Community.js')).default;
      const community = await Community.findById(user.communityId);
      const isMember = community.members.some(m => 
        m.userId.toString() === residentId && m.isActive
      );
      if (!isMember) {
        return res.status(403).json({ message: 'Resident not found in your community' });
      }
    }

    const parking = new Parking({
      communityId: user.communityId,
      slotNumber,
      type,
      residentId: residentId || null,
      block: block || null,
      floor: floor || null,
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    await parking.save();
    await parking.populate('residentId', 'name email phone');
    await parking.populate('communityId', 'name');

    res.status(201).json({
      message: 'Parking slot created successfully',
      parking
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Parking slot number already exists in this community' });
    }
    next(error);
  }
};

// Assign parking slot to resident (Admin only)
export const assignParkingSlot = async (req, res, next) => {
  try {
    const { slotId, residentId } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    const parking = await Parking.findById(slotId);

    if (!parking) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }

    // Verify parking belongs to admin's community
    if (parking.communityId.toString() !== user.communityId.toString()) {
      return res.status(403).json({ message: 'Parking slot does not belong to your community' });
    }

    if (parking.type !== 'resident') {
      return res.status(400).json({ message: 'Only resident parking slots can be assigned' });
    }

    // Verify resident is in the community
    const Community = (await import('../models/Community.js')).default;
    const community = await Community.findById(user.communityId);
    const isMember = community.members.some(m => 
      m.userId.toString() === residentId && m.isActive && m.role === 'resident'
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Resident not found in your community' });
    }

    parking.residentId = residentId;
    parking.isAvailable = false;
    await parking.save();

    await parking.populate('residentId', 'name email phone');
    await parking.populate('communityId', 'name');

    res.status(200).json({
      message: 'Parking slot assigned successfully',
      parking
    });
  } catch (error) {
    next(error);
  }
};
