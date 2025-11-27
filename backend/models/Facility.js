import mongoose from 'mongoose';

const facilitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide facility name'],
      trim: true
    },
    description: String,
    type: {
      type: String,
      enum: ['clubhouse', 'gym', 'guest-room', 'tennis-court', 'pool', 'other'],
      required: true
    },
    capacity: Number,
    image: String,
    bookings: [
      {
        residentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        startTime: Date,
        endTime: Date,
        status: {
          type: String,
          enum: ['pending', 'confirmed', 'cancelled'],
          default: 'pending'
        },
        bookedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    workingHours: {
      open: String,
      close: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model('Facility', facilitySchema);
