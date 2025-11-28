import Announcement from '../models/Announcement.js';
import User from '../models/User.js';

export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, category, image, targetAudience, isUrgent, expiresAt } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community to create announcements' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const announcement = new Announcement({
      communityId: user.communityId,
      title: title.trim(),
      content: content.trim(),
      category,
      image: image || null,
      createdBy: req.user.userId,
      targetAudience: targetAudience || 'all',
      isUrgent: isUrgent || false,
      expiresAt: expiresAt ? new Date(expiresAt) : null
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
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    let query = {
      communityId: user.communityId,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    };

    if (category) query.category = category;

    // Filter by target audience
    const audienceQuery = [];
    if (req.user.role === 'resident') {
      audienceQuery.push({ targetAudience: 'all' }, { targetAudience: 'residents' });
    } else if (req.user.role === 'security') {
      audienceQuery.push({ targetAudience: 'all' }, { targetAudience: 'security' });
    } else if (req.user.role === 'admin') {
      audienceQuery.push({ targetAudience: 'all' }, { targetAudience: 'admin' });
    }

    if (audienceQuery.length > 0) {
      query.$and = [{ $or: audienceQuery }];
    }

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name email role')
      .populate('communityId', 'name')
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
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('communityId', 'name');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Verify announcement belongs to user's community
    if (announcement.communityId._id.toString() !== user.communityId.toString()) {
      return res.status(403).json({ message: 'Announcement does not belong to your community' });
    }

    res.status(200).json(announcement);
  } catch (error) {
    next(error);
  }
};

export const updateAnnouncement = async (req, res, next) => {
  try {
    const { title, content, category, image, targetAudience, isUrgent, expiresAt } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    const existingAnnouncement = await Announcement.findById(req.params.id);
    if (!existingAnnouncement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Verify announcement belongs to user's community
    if (existingAnnouncement.communityId.toString() !== user.communityId.toString()) {
      return res.status(403).json({ message: 'Announcement does not belong to your community' });
    }

    // Check if user is the creator or admin
    if (existingAnnouncement.createdBy.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this announcement' });
    }

    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { 
        title: title?.trim(), 
        content: content?.trim(), 
        category, 
        image, 
        targetAudience, 
        isUrgent, 
        expiresAt: expiresAt ? new Date(expiresAt) : null 
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role')
     .populate('communityId', 'name');

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
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Verify announcement belongs to user's community
    if (announcement.communityId.toString() !== user.communityId.toString()) {
      return res.status(403).json({ message: 'Announcement does not belong to your community' });
    }

    // Check if user is the creator or admin
    if (announcement.createdBy.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this announcement' });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    next(error);
  }
};
