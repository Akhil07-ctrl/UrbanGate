import mongoose from 'mongoose';

const parkingSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true
    },
    slotNumber: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['resident', 'guest'],
      required: true
    },
    // Compound index to ensure unique slot numbers per community
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    floor: String,
    block: String,
    guestRequests: [
      {
        requestedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        requestDate: {
          type: Date,
          default: Date.now
        },
        fromDate: Date,
        toDate: Date,
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending'
        },
        approvedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Compound index to ensure unique slot numbers per community
parkingSchema.index({ communityId: 1, slotNumber: 1 }, { unique: true });

export default mongoose.model('Parking', parkingSchema);
