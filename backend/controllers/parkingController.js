import Parking from '../models/Parking.js';

export const getParkingSlots = async (req, res, next) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (type) query.type = type;

    const parkingSlots = await Parking.find(query)
      .populate('residentId', 'name apartment email')
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
    const parking = await Parking.findOne({
      residentId: req.user.userId,
      type: 'resident'
    }).populate('residentId', 'name apartment');

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

    const parking = await Parking.findById(slotId);

    if (!parking) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }

    if (parking.type !== 'guest') {
      return res.status(400).json({ message: 'Only guest parking slots can be requested' });
    }

    parking.guestRequests.push({
      requestedBy: req.user.userId,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
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

    const parking = await Parking.findById(slotId);

    if (!parking) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }

    const request = parking.guestRequests.id(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
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

    const parking = await Parking.findById(slotId);

    if (!parking) {
      return res.status(404).json({ message: 'Parking slot not found' });
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
