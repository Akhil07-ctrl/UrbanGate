import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true
    },
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    month: {
      type: Date,
      required: true
    },
    amount: {
      type: Number,
      required: [true, 'Please provide amount']
    },
    description: String,
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'offline', 'cheque'],
      default: 'online'
    },
    transactionId: String,
    paidAt: Date,
    dueDate: Date,
    invoiceUrl: String,
    breakdown: {
      maintenance: Number,
      water: Number,
      electricity: Number,
      parking: Number,
      other: Number
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);
