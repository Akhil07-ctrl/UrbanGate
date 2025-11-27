import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema(
  {
    guestName: {
      type: String,
      required: [true, 'Please provide guest name'],
      trim: true
    },
    guestPhone: String,
    purpose: {
      type: String,
      required: [true, 'Please provide purpose'],
      enum: ['visit', 'delivery', 'service', 'other']
    },
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    apartment: {
      type: String,
      required: true
    },
    qrCode: {
      type: String,
      required: true,
      unique: true
    },
    entryTime: Date,
    exitTime: Date,
    status: {
      type: String,
      enum: ['pending', 'checked-in', 'checked-out'],
      default: 'pending'
    },
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    validFrom: {
      type: Date,
      required: true
    },
    validUntil: {
      type: Date,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model('Visitor', visitorSchema);
