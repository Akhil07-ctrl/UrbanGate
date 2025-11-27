import Visitor from '../models/Visitor.js';
import { generateQRCode } from '../utils/helpers.js';

export const createVisitorPass = async (req, res, next) => {
  try {
    const { guestName, guestPhone, purpose, validFrom, validUntil } = req.body;
    const user = await (await import('../models/User.js')).default.findById(req.user.userId);

    const qrData = `${guestName}-${Date.now()}`;
    const qrCode = await generateQRCode(qrData);

    const visitor = new Visitor({
      guestName,
      guestPhone: guestPhone || '',
      purpose,
      residentId: req.user.userId,
      apartment: user.apartment,
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

    let query = {};

    if (req.user.role === 'resident') {
      query.residentId = req.user.userId;
    }

    if (status) query.status = status;

    const visitors = await Visitor.find(query)
      .populate('residentId', 'name apartment email')
      .populate('scannedBy', 'name email')
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

    const visitor = await Visitor.findOne({ qrCode });

    if (!visitor) {
      return res.status(404).json({ message: 'Invalid QR code' });
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
    await visitor.populate('residentId', 'name apartment email');

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
    const visitor = await Visitor.findByIdAndDelete(req.params.id);

    if (!visitor) {
      return res.status(404).json({ message: 'Visitor pass not found' });
    }

    res.status(200).json({ message: 'Visitor pass deleted successfully' });
  } catch (error) {
    next(error);
  }
};
