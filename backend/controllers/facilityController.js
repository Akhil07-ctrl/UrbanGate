import Facility from '../models/Facility.js';

export const createFacility = async (req, res, next) => {
  try {
    const { name, description, type, capacity, image, workingHours } = req.body;

    const facility = new Facility({
      name,
      description,
      type,
      capacity,
      image,
      workingHours: workingHours || { open: '09:00', close: '22:00' }
    });

    await facility.save();

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

    let query = {};
    if (type) query.type = type;

    const facilities = await Facility.find(query)
      .skip(skip)
      .limit(parseInt(limit));

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

    const facility = await Facility.findById(facilityId);

    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    // Check for conflicts
    const hasConflict = facility.bookings.some(booking => {
      return (
        booking.status !== 'cancelled' &&
        new Date(startTime) < new Date(booking.endTime) &&
        new Date(endTime) > new Date(booking.startTime)
      );
    });

    if (hasConflict) {
      return res.status(400).json({ message: 'Time slot not available' });
    }

    facility.bookings.push({
      residentId: req.user.userId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: 'pending'
    });

    await facility.save();

    res.status(200).json({
      message: 'Facility booked successfully',
      facility
    });
  } catch (error) {
    next(error);
  }
};

export const confirmBooking = async (req, res, next) => {
  try {
    const { facilityId, bookingId } = req.body;

    const facility = await Facility.findById(facilityId);

    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    const booking = facility.bookings.id(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'confirmed';

    await facility.save();

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

    const facility = await Facility.findById(facilityId);

    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    const booking = facility.bookings.id(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'cancelled';

    await facility.save();

    res.status(200).json({
      message: 'Booking cancelled',
      facility
    });
  } catch (error) {
    next(error);
  }
};
