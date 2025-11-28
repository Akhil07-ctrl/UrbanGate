import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import { sendEmail } from '../utils/emailService.js';
import fs from 'fs';

export const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community to create complaints' });
    }
    
    // Handle file uploads if any
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(file => 
          uploadToCloudinary(file.path, 'complaints')
        );
        const results = await Promise.all(uploadPromises);
        imageUrls = results.map(result => result.secure_url);
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
        // Continue without images if upload fails
      }
    }

    const complaint = new Complaint({
      communityId: user.communityId,
      title,
      description,
      category,
      priority: priority || 'medium',
      residentId: req.user.userId,
      images: imageUrls,
      status: 'open',
      createdAt: new Date()
    });

    await complaint.save();
    await complaint.populate('residentId', 'name email phone');
    await complaint.populate('communityId', 'name');

    // Notify community admin about new complaint
    const Community = (await import('../models/Community.js')).default;
    const community = await Community.findById(user.communityId);
    if (community && community.adminId) {
      const admin = await User.findById(community.adminId);
      if (admin) {
        try {
          await sendEmail({
            to: admin.email,
            subject: 'New Complaint Submitted',
            template: 'new-complaint',
            context: {
              adminName: admin.name,
              title,
              category,
              priority: priority || 'medium',
              description: description.length > 100 ? `${description.substring(0, 100)}...` : description,
              residentName: complaint.residentId.name,
              complaintId: complaint._id,
              date: new Date().toLocaleDateString()
            }
          });
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
          // Don't fail the request if email fails
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      complaint
    });
  } catch (error) {
    // Clean up any uploaded files if error occurs
    if (req.files && req.files.length > 0) {
      await Promise.all(req.files.map(file => 
        fs.unlink(file.path).catch(console.error)
      ));
    }
    next(error);
  }
};

export const getComplaints = async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    let query = { communityId: user.communityId };

    // For residents, show only their complaints
    if (req.user.role === 'resident') {
      query.residentId = req.user.userId;
    }
    // Admin and security can see all complaints in their community

    if (status) query.status = status;
    if (category) query.category = category;

    const complaints = await Complaint.find(query)
      .populate('residentId', 'name email phone')
      .populate('assignedTo', 'name email')
      .populate('communityId', 'name')
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
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    const complaint = await Complaint.findById(req.params.id)
      .populate('residentId', 'name email phone')
      .populate('assignedTo', 'name email')
      .populate('communityId', 'name')
      .populate('comments.userId', 'name email role');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Verify complaint belongs to user's community
    if (complaint.communityId._id.toString() !== user.communityId.toString()) {
      return res.status(403).json({ message: 'Complaint does not belong to your community' });
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
    const { status, priority, assignedTo, resolutionNotes } = req.body;
    let updateData = { updatedAt: new Date() };
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    // Get the existing complaint
    const existingComplaint = await Complaint.findById(req.params.id);
    if (!existingComplaint) {
      return res.status(404).json({ 
        success: false, 
        message: 'Complaint not found' 
      });
    }

    // Verify complaint belongs to user's community
    if (existingComplaint.communityId.toString() !== user.communityId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Complaint does not belong to your community' 
      });
    }

    // Check permissions
    if (req.user.role === 'resident' && 
        existingComplaint.residentId.toString() !== req.user.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this complaint' 
      });
    }

    // Handle status updates
    if (status) {
      updateData.status = status;
      if (status === 'resolved' || status === 'closed') {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = req.user.userId;
        updateData.resolutionNotes = resolutionNotes || 'No resolution notes provided.';
        
        // Notify resident when complaint is resolved
        const resident = await User.findById(existingComplaint.residentId);
        if (resident) {
          await sendEmail({
            to: resident.email,
            subject: `Your Complaint #${existingComplaint._id} has been ${status}`,
            template: 'complaint-status-update',
            context: {
              residentName: resident.name,
              complaintId: existingComplaint._id,
              status,
              resolutionNotes: resolutionNotes || 'No resolution notes provided.',
              date: new Date().toLocaleDateString()
            }
          });
        }
      }
    }
    
    if (priority) updateData.priority = priority;
    
    // Handle assignment
    if (assignedTo) {
      updateData.assignedTo = assignedTo;
      
      // Notify the assigned staff
      const staff = await User.findById(assignedTo);
      if (staff) {
        await sendEmail({
          to: staff.email,
          subject: `You've been assigned to a complaint`,
          template: 'complaint-assigned',
          context: {
            staffName: staff.name,
            complaintId: existingComplaint._id,
            title: existingComplaint.title,
            priority: priority || existingComplaint.priority,
            date: new Date().toLocaleDateString()
          }
        });
      }
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
    .populate('residentId', 'name email phone')
    .populate('assignedTo', 'name email')
    .populate('resolvedBy', 'name email')
    .populate('communityId', 'name');

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
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Verify complaint belongs to user's community
    if (complaint.communityId.toString() !== user.communityId.toString()) {
      return res.status(403).json({ message: 'Complaint does not belong to your community' });
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
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ 
        success: false, 
        message: 'Complaint not found' 
      });
    }

    // Verify complaint belongs to user's community
    if (complaint.communityId.toString() !== user.communityId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Complaint does not belong to your community' 
      });
    }
    
    // Check permissions
    if (req.user.role === 'resident' && 
        complaint.residentId.toString() !== req.user.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this complaint' 
      });
    }
    
    // Delete associated images from cloud storage
    if (complaint.images && complaint.images.length > 0) {
      await Promise.all(
        complaint.images.map(imageUrl => 
          deleteFromCloudinary(imageUrl).catch(console.error)
        )
      );
    }
    
    // Soft delete by marking as deleted
    await Complaint.findByIdAndUpdate(req.params.id, { 
      status: 'deleted',
      deletedAt: new Date(),
      deletedBy: req.user.userId
    });

    res.status(200).json({ 
      success: true, 
      message: 'Complaint deleted successfully' 
    });
  } catch (error) {
    next(error);
  }
};

// Additional helper functions
export const getComplaintStats = async (req, res, next) => {
  try {
    const stats = await Complaint.aggregate([
      {
        $match: {
          createdAt: { 
            $gte: new Date(new Date().setDate(new Date().getDate() - 30)) 
          }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1
        }
      }
    ]);

    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgResolutionTime: { 
            $avg: { 
              $cond: [
                { $ne: ["$resolvedAt", null] },
                { $subtract: ["$resolvedAt", "$createdAt"] },
                null
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1,
          avgResolutionTime: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        status: stats,
        categories: categoryStats
      }
    });
  } catch (error) {
    next(error);
  }
};
