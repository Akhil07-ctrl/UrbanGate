import Announcement from '../models/Announcement.js';

export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, category, image, targetAudience, isUrgent, expiresAt } = req.body;

    const announcement = new Announcement({
      title,
      content,
      category,
      image: image || null,
      createdBy: req.user.userId,
      targetAudience: targetAudience || 'all',
      isUrgent: isUrgent || false,
      expiresAt
    });

    await announcement.save();
    await announcement.populate('createdBy', 'name email role');

    res.status(201).json({
      message: 'Announcement created successfully',
      announcement
    });
  } catch (error) {
    next(error);
  }
};

export const getAnnouncements = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    };

    if (category) query.category = category;

    // Filter by target audience
    if (req.user.role === 'resident') {
      query.$or = [
        { targetAudience: 'all' },
        { targetAudience: 'residents' }
      ];
    } else if (req.user.role === 'security') {
      query.$or = [
        { targetAudience: 'all' },
        { targetAudience: 'security' }
      ];
    }

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name email role')
      .sort({ isUrgent: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Announcement.countDocuments(query);

    res.status(200).json({
      announcements,
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

export const getAnnouncementById = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy', 'name email role');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.status(200).json(announcement);
  } catch (error) {
    next(error);
  }
};

export const updateAnnouncement = async (req, res, next) => {
  try {
    const { title, content, category, image, targetAudience, isUrgent, expiresAt } = req.body;

    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { title, content, category, image, targetAudience, isUrgent, expiresAt },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.status(200).json({
      message: 'Announcement updated successfully',
      announcement
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.status(200).json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    next(error);
  }
};
