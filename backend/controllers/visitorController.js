import Visitor from '../models/Visitor.js';
import User from '../models/User.js';
import Community from '../models/Community.js';
import { generateQRCode } from '../utils/helpers.js';

export const createVisitorPass = async (req, res, next) => {
  try {
    const { guestName, guestPhone, purpose, validFrom, validUntil } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    // Get flat number from community member data
    const community = await Community.findById(user.communityId);
    const member = community.members.find(m => m.userId.toString() === req.user.userId);
    const flatNumber = member?.flatNumber || 'N/A';

    const qrData = `${guestName}-${Date.now()}-${user.communityId}`;
    const qrCode = await generateQRCode(qrData);

    const visitor = new Visitor({
      communityId: user.communityId,
      guestName,
      guestPhone: guestPhone || '',
      purpose,
      residentId: req.user.userId,
      apartment: flatNumber,
      qrCode,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      status: 'pending'
    });

    await visitor.save();

    res.status(201).json({
      message: 'Visitor pass created successfully',
      visitor
    });
  } catch (error) {
    next(error);
  }
};

export const getVisitorPasses = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    let query = { communityId: user.communityId };

    if (req.user.role === 'resident') {
      query.residentId = req.user.userId;
    }
    // Security and admin can see all visitor passes in their community

    if (status) query.status = status;

    const visitors = await Visitor.find(query)
      .populate('residentId', 'name email phone')
      .populate('scannedBy', 'name email')
      .populate('communityId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Visitor.countDocuments(query);

    res.status(200).json({
      visitors,
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

export const scanVisitorQR = async (req, res, next) => {
  try {
    const { qrCode, action } = req.body; // action: 'check-in' or 'check-out'
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    const visitor = await Visitor.findOne({ qrCode });

    if (!visitor) {
      return res.status(404).json({ message: 'Invalid QR code' });
    }

    // Verify visitor pass belongs to security's community
    if (visitor.communityId.toString() !== user.communityId.toString()) {
      return res.status(403).json({ message: 'Visitor pass does not belong to your community' });
    }

    if (action === 'check-in') {
      if (visitor.status !== 'pending') {
        return res.status(400).json({ message: 'Visitor already checked in' });
      }

      visitor.status = 'checked-in';
      visitor.entryTime = new Date();
      visitor.scannedBy = req.user.userId;
    } else if (action === 'check-out') {
      if (visitor.status !== 'checked-in') {
        return res.status(400).json({ message: 'Visitor not checked in' });
      }

      visitor.status = 'checked-out';
      visitor.exitTime = new Date();
    }

    await visitor.save();
    await visitor.populate('residentId', 'name email phone');
    await visitor.populate('communityId', 'name');

    res.status(200).json({
      message: `Visitor ${action}ed successfully`,
      visitor
    });
  } catch (error) {
    next(error);
  }
};

export const deleteVisitorPass = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({ message: 'Visitor pass not found' });
    }

    // Verify visitor pass belongs to user's community and user is the owner
    if (visitor.communityId.toString() !== user.communityId.toString()) {
      return res.status(403).json({ message: 'Visitor pass does not belong to your community' });
    }

    if (visitor.residentId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete your own visitor passes' });
    }

    await Visitor.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Visitor pass deleted successfully' });
  } catch (error) {
    next(error);
  }
};
