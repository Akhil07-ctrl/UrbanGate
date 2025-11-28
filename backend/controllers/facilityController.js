import Facility from '../models/Facility.js';
import User from '../models/User.js';

export const createFacility = async (req, res, next) => {
  try {
    const { name, description, type, capacity, image, workingHours } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    const facility = new Facility({
      communityId: user.communityId,
      name,
      description,
      type,
      capacity,
      image,
      workingHours: workingHours || { open: '09:00', close: '22:00' }
    });

    await facility.save();
    await facility.populate('communityId', 'name');

    res.status(201).json({
      message: 'Facility created successfully',
      facility
    });
  } catch (error) {
    next(error);
  }
};

export const getFacilities = async (req, res, next) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    let query = { communityId: user.communityId };
    if (type) query.type = type;

    const facilities = await Facility.find(query)
      .populate('communityId', 'name')
      .populate('bookings.residentId', 'name email phone')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Facility.countDocuments(query);

    res.status(200).json({
      facilities,
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

export const bookFacility = async (req, res, next) => {
  try {
    const { startTime, endTime } = req.body;
    const facilityId = req.params.id;
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    const facility = await Facility.findById(facilityId);

    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    // Verify facility belongs to user's community
    if (facility.communityId.toString() !== user.communityId.toString()) {
      return res.status(403).json({ message: 'Facility does not belong to your community' });
    }

    // Validate time
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (start >= end) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    if (start < new Date()) {
      return res.status(400).json({ message: 'Cannot book facilities in the past' });
    }

    // Check for conflicts with existing bookings
    const conflictingBooking = facility.bookings.find(booking => {
      if (booking.status === 'cancelled') return false;
      
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      
      // Check if there's any overlap
      return (
        (start >= bookingStart && start < bookingEnd) ||
        (end > bookingStart && end <= bookingEnd) ||
        (start <= bookingStart && end >= bookingEnd)
      );
    });

    if (conflictingBooking) {
      return res.status(409).json({ 
        message: 'Time slot conflict. Another booking exists for this time.',
        conflictingBooking: {
          startTime: conflictingBooking.startTime,
          endTime: conflictingBooking.endTime,
          status: conflictingBooking.status
        }
      });
    }

    // Check capacity if facility has capacity limit
    if (facility.capacity) {
      const activeBookings = facility.bookings.filter(b => 
        b.status === 'confirmed' &&
        start < new Date(b.endTime) &&
        end > new Date(b.startTime)
      );
      
      if (activeBookings.length >= facility.capacity) {
        return res.status(400).json({ 
          message: `Facility is at capacity (${facility.capacity}). Please choose a different time slot.` 
        });
      }
    }

    facility.bookings.push({
      residentId: req.user.userId,
      startTime: start,
      endTime: end,
      status: 'pending'
    });

    await facility.save();
    await facility.populate('bookings.residentId', 'name email phone');
    await facility.populate('communityId', 'name');

    res.status(200).json({
      message: 'Facility booked successfully. Waiting for admin confirmation.',
      facility
    });
  } catch (error) {
    next(error);
  }
};

export const confirmBooking = async (req, res, next) => {
  try {
    const { facilityId, bookingId } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    const facility = await Facility.findById(facilityId);

    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    // Verify facility belongs to admin's community
    if (facility.communityId.toString() !== user.communityId.toString()) {
      return res.status(403).json({ message: 'Facility does not belong to your community' });
    }

    const booking = facility.bookings.id(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'confirmed';

    await facility.save();
    await facility.populate('bookings.residentId', 'name email phone');
    await facility.populate('communityId', 'name');

    res.status(200).json({
      message: 'Booking confirmed',
      facility
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { facilityId, bookingId } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    const facility = await Facility.findById(facilityId);

    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    // Verify facility belongs to admin's community
    if (facility.communityId.toString() !== user.communityId.toString()) {
      return res.status(403).json({ message: 'Facility does not belong to your community' });
    }

    const booking = facility.bookings.id(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'cancelled';

    await facility.save();
    await facility.populate('bookings.residentId', 'name email phone');
    await facility.populate('communityId', 'name');

    res.status(200).json({
      message: 'Booking cancelled',
      facility
    });
  } catch (error) {
    next(error);
  }
};

// Get facility by ID
export const getFacilityById = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    const facility = await Facility.findById(req.params.id)
      .populate('communityId', 'name')
      .populate('bookings.residentId', 'name email phone');

    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    // Verify facility belongs to user's community
    if (facility.communityId._id.toString() !== user.communityId.toString()) {
      return res.status(403).json({ message: 'Facility does not belong to your community' });
    }

    res.status(200).json({ facility });
  } catch (error) {
    next(error);
  }
};
