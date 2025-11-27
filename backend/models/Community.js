import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide community name'],
      trim: true,
      unique: true
    },
    description: {
      type: String,
      required: [true, 'Please provide community description']
    },
    location: {
      type: String,
      required: [true, 'Please provide community location'],
      trim: true
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        role: {
          type: String,
          enum: ['admin', 'resident', 'security'],
          default: 'resident'
        },
        flatNumber: {
          type: String,
          trim: true
        },
        joinedAt: {
          type: Date,
          default: Date.now
        },
        isActive: {
          type: Boolean,
          default: true
        }
      }
    ],
    totalMembers: {
      type: Number,
      default: 1
    },
    image: String,
    facilities: [String],
    rules: [String],
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model('Community', communitySchema);
