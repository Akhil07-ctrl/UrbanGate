import Complaint from '../models/Complaint.js';

export const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, priority, images } = req.body;

    const complaint = new Complaint({
      title,
      description,
      category,
      priority: priority || 'medium',
      residentId: req.user.userId,
      images: images || []
    });

    await complaint.save();
    await complaint.populate('residentId', 'name email apartment');

    res.status(201).json({
      message: 'Complaint created successfully',
      complaint
    });
  } catch (error) {
    next(error);
  }
};

export const getComplaints = async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // For residents, show only their complaints
    if (req.user.role === 'resident') {
      query.residentId = req.user.userId;
    }

    if (status) query.status = status;
    if (category) query.category = category;

    const complaints = await Complaint.find(query)
      .populate('residentId', 'name email apartment')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(query);

    res.status(200).json({
      complaints,
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

export const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('residentId', 'name email apartment phone')
      .populate('assignedTo', 'name email')
      .populate('comments.userId', 'name email role');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check authorization
    if (req.user.role === 'resident' && complaint.residentId._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(complaint);
  } catch (error) {
    next(error);
  }
};

export const updateComplaint = async (req, res, next) => {
  try {
    const { status, priority, assignedTo } = req.body;
    let updateData = {};

    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo) updateData.assignedTo = assignedTo;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('residentId assignedTo');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.status(200).json({
      message: 'Complaint updated successfully',
      complaint
    });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.comments.push({
      userId: req.user.userId,
      text
    });

    await complaint.save();
    await complaint.populate('comments.userId', 'name email role');

    res.status(200).json({
      message: 'Comment added successfully',
      complaint
    });
  } catch (error) {
    next(error);
  }
};

export const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.status(200).json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    next(error);
  }
};
