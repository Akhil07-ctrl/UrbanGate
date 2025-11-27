import mongoose from 'mongoose';

const parkingSchema = new mongoose.Schema(
  {
    slotNumber: {
      type: String,
      required: true,
      unique: true
    },
    type: {
      type: String,
      enum: ['resident', 'guest'],
      required: true
    },
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

export default mongoose.model('Parking', parkingSchema);
