import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Please provide content']
    },
    category: {
      type: String,
      enum: ['emergency', 'event', 'maintenance', 'notice', 'general'],
      required: true
    },
    image: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    targetAudience: {
      type: String,
      enum: ['all', 'residents', 'security', 'admin'],
      default: 'all'
    },
    isUrgent: {
      type: Boolean,
      default: false
    },
    expiresAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model('Announcement', announcementSchema);
